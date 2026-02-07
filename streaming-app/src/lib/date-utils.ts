
import { addMonths, addYears, format } from 'date-fns'

export const calculateNextChargeDate = (
    startDate: Date | string,
    plan: 'MONTHLY' | 'YEARLY' | 'CUSTOM_RANGE',
    endDate?: Date | string
): Date | null => {
    const date = new Date(startDate)

    if (plan === 'MONTHLY') {
        return addMonths(date, 1)
    }

    if (plan === 'YEARLY') {
        return addYears(date, 1)
    }

    if (plan === 'CUSTOM_RANGE' && endDate) {
        return new Date(endDate)
    }

    return null
}

export const formatDate = (date: Date | string) => {
    return format(new Date(date), 'dd/MM/yyyy')
}

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
    }).format(amount)
}
