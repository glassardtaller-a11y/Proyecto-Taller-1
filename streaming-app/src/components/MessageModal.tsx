'use client'

import { useState } from 'react'

export default function MessageModal({ sale, onClose }: any) {
    const [phone, setPhone] = useState(sale.customers?.phone || '')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [profile, setProfile] = useState('')
    const [pin, setPin] = useState('')

    const buildMessage = () => {
        const message = `
Hola ${sale.customers?.full_name} 👋🏻

🍿 Tu subscripción a ${sale.platforms?.name} (${sale.plan}) 🍿

✉ Usuario: ${email}
🔐 Contraseña: ${password}
👥 Perfil: ${profile}
${pin ? `🔑 PIN: ${pin}` : ''}

⏳ Plan: ${sale.plan}
🗓 Compra: ${sale.sale_date?.slice(0, 10)}
🗓 Vencimiento: ${sale.next_charge_date?.slice(0, 10)}

⚠️ Condiciones de uso:
El servicio es exclusivo para un solo dispositivo.
No se permite uso simultáneo.
Ante uso indebido la cuenta podrá ser suspendida sin previo aviso.
En caso de inconveniente se atenderá entre 1 a 24 horas.
    `.trim()

        return encodeURIComponent(message)
    }

    const sendWhatsApp = () => {
        const url = `https://api.whatsapp.com/send?phone=${phone}&text=${buildMessage()}`
        window.open(url, '_blank')
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
                <h2 className="text-lg font-semibold">Enviar mensaje WhatsApp</h2>

                <input
                    placeholder="Número (519...)"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full border p-2 rounded"
                />

                <input
                    placeholder="Correo cuenta"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full border p-2 rounded"
                />

                <input
                    placeholder="Contraseña"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full border p-2 rounded"
                />

                <input
                    placeholder="Perfil"
                    value={profile}
                    onChange={e => setProfile(e.target.value)}
                    className="w-full border p-2 rounded"
                />

                <input
                    placeholder="PIN (opcional)"
                    value={pin}
                    onChange={e => setPin(e.target.value)}
                    className="w-full border p-2 rounded"
                />

                <div className="flex justify-between pt-4">
                    <button onClick={onClose} className="text-gray-500">Cancelar</button>
                    <button
                        onClick={sendWhatsApp}
                        className="bg-green-600 text-white px-4 py-2 rounded"
                    >
                        Enviar
                    </button>
                </div>
            </div>
        </div>
    )
}
