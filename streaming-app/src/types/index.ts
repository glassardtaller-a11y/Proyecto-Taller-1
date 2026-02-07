
export type Platform = {
    id: string
    name: string
    is_active: boolean
    monthly_price: number
    yearly_price: number
    logo_url?: string | null
    created_at: string
}

export type Customer = {
    id: string
    full_name: string
    phone?: string | null
    email?: string | null
    created_at: string
}

export type Sale = {
    id: string
    platform_id: string
    customer_id: string
    sale_date: string
    payment_method?: string | null
    plan: 'MONTHLY' | 'YEARLY' | 'CUSTOM_RANGE'
    start_date: string
    end_date?: string | null
    next_charge_date?: string | null
    price: number
    status: string
    created_at: string
    platforms?: Platform | null
    customers?: Customer | null
}
