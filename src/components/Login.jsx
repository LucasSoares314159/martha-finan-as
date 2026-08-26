import { useState } from 'react'
import { supabase } from '../supabase'
import { BigButton, FieldInput, Spinner } from './ui'

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const entrar = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError("E-mail ou senha incorretos.")
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <form onSubmit={entrar} className="w-full max-w-sm flex flex-col gap-5">
        <div className="text-center">
          <p className="text-5xl mb-3">💰</p>
          <h1 className="text-2xl font-bold text-gray-800">Minhas Finanças</h1>
          <p className="text-base text-gray-400">Entre para continuar</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex flex-col gap-4">
          <FieldInput label="E-mail" type="email" value={email} onChange={setEmail} placeholder="seu@email.com" />
          <FieldInput label="Senha" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

          {error && <p className="text-base font-semibold text-red-600 text-center">{error}</p>}

          <BigButton onClick={entrar} disabled={loading || !email || !password} icon={loading ? null : "🔓"}>
            {loading ? <Spinner /> : "Entrar"}
          </BigButton>
        </div>
      </form>
    </div>
  )
}
