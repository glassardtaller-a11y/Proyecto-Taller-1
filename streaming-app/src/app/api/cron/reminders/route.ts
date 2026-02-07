
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendTelegram } from '@/lib/telegram'
import { formatCurrency, formatDate, calculateNextChargeDate } from '@/lib/date-utils'

export async function GET() {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    // Find due reminders
    const { data: reminders, error } = await supabase
        .from('reminders')
        .select(`
      *,
      sales (
        *,
        platforms (name),
        customers (full_name, phone)
      )
    `)
        .lte('due_at', today)
        .eq('is_sent', false)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!reminders || reminders.length === 0) {
        return NextResponse.json({ message: 'No reminders due' })
    }

    for (const reminder of reminders) {
        const sale = reminder.sales
        if (!sale) continue

        // Send Telegram
        const message = `
*Payment Reminder*
Customer: ${sale.customers?.full_name}
Platform: ${sale.platforms?.name}
Amount: ${formatCurrency(sale.price)}
Due Date: ${formatDate(reminder.due_at)}
    `.trim()

        await sendTelegram(message)

        // Mark as sent
        await supabase
            .from('reminders')
            .update({ is_sent: true, sent_at: new Date() })
            .eq('id', reminder.id)

        // Schedule next reminder if applicable (auto-renewal logic)
        // Only for ACTIVE sales and recurring plans
        if (sale.status === 'ACTIVE' && (sale.plan === 'MONTHLY' || sale.plan === 'YEARLY')) {
            const nextDate = calculateNextChargeDate(reminder.due_at, sale.plan)

            if (nextDate) {
                // Update sale next_charge_date
                await supabase
                    .from('sales')
                    .update({ next_charge_date: nextDate })
                    .eq('id', sale.id)

                // Create new reminder
                await supabase
                    .from('reminders')
                    .insert({
                        sale_id: sale.id,
                        due_at: nextDate,
                        kind: 'PAYMENT_DUE'
                    })
            }
        }
    }

    return NextResponse.json({ processed: reminders.length })
}
