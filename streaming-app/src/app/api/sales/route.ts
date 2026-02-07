
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendTelegram } from '@/lib/telegram'
import { formatDate, formatCurrency, calculateNextChargeDate } from '@/lib/date-utils'

export async function GET(request: Request) {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const platformId = searchParams.get('platform_id')

    let query = supabase
        .from('sales')
        .select(`
      *,
      platforms (name),
      customers (full_name, email, phone)
    `)
        .order('created_at', { ascending: false })

    if (platformId) {
        query = query.eq('platform_id', platformId)
    }

    const { data, error } = await query

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}

export async function POST(request: Request) {
    const supabase = await createClient()
    const body = await request.json()

    // 1. Create or get customer
    let customerId = body.customer_id

    if (!customerId && body.customer) {
        // Check if customer exists by email or phone
        const { data: existingCustomer } = await supabase
            .from('customers')
            .select('id')
            .or(`email.eq.${body.customer.email},phone.eq.${body.customer.phone}`)
            .maybeSingle()

        if (existingCustomer) {
            customerId = existingCustomer.id
        } else {
            const { data: newCustomer, error: customerError } = await supabase
                .from('customers')
                .insert(body.customer)
                .select()
                .single()

            if (customerError) {
                return NextResponse.json({ error: customerError.message }, { status: 500 })
            }
            customerId = newCustomer.id
        }
    }

    // 2. Create Sale
    const nextChargeDate = calculateNextChargeDate(body.start_date, body.plan, body.end_date)

    const saleData = {
        platform_id: body.platform_id,
        customer_id: customerId,
        sale_date: body.sale_date || new Date(),
        payment_method: body.payment_method,
        plan: body.plan,
        start_date: body.start_date,
        end_date: body.end_date,
        next_charge_date: nextChargeDate,
        price: body.price,
        status: 'ACTIVE'
    }

    const { data: sale, error: saleError } = await supabase
        .from('sales')
        .insert(saleData)
        .select(`
      *,
      platforms (name),
      customers (full_name)
    `)
        .single()

    if (saleError) {
        return NextResponse.json({ error: saleError.message }, { status: 500 })
    }

    // 3. Create initial reminder
    if (nextChargeDate) {
        await supabase.from('reminders').insert({
            sale_id: sale.id,
            due_at: nextChargeDate,
            kind: 'PAYMENT_DUE'
        })
    }

    // 4. Send Telegram Notification
    const message = `
*New Sale*
Platform: ${sale.platforms?.name}
Customer: ${sale.customers?.full_name}
Plan: ${sale.plan}
Price: ${formatCurrency(sale.price)}
Next charge: ${nextChargeDate ? formatDate(nextChargeDate) : 'N/A'}
  `.trim()

    await sendTelegram(message)

    return NextResponse.json(sale)
}
