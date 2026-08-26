import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import Dashboard from './components/Dashboard'
import FaturaTab from './components/Fatura'
import ConfigTab from './components/Config'
import ProjectionTab from './components/Projecao'
import Login from './components/Login'

export default function App() {
  const [session, setSession] = useState(null)
  const [authReady, setAuthReady] = useState(false)
  const [tab, setTab] = useState("home")
  const [income, setIncome] = useState([])
  const [fixed, setFixed] = useState([])
  const [varExpenses, setVarExpenses] = useState([])
  const [cardMonths, setCardMonths] = useState({})
  const [months, setMonths] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setAuthReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => sub.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return
    setLoading(true)
    ;(async () => {
      try {
        const [{ data: inc }, { data: fix }, { data: varData }, { data: txns }] = await Promise.all([
          supabase.from("income").select("*"),
          supabase.from("fixed_expenses").select("*"),
          supabase.from("variable_expenses").select("*"),
          supabase.from("card_transactions").select("*"),
        ])
        setIncome(inc || [])
        setFixed(fix || [])
        setVarExpenses(varData || [])
        const byMonth = {}
        ;(txns || []).forEach(t => { if (!byMonth[t.month]) byMonth[t.month] = []; byMonth[t.month].push(t) })
        setCardMonths(byMonth)
        setMonths(Object.keys(byMonth).sort())
      } catch (e) {
        setError("Não foi possível conectar. Verifique sua internet.")
        console.error(e)
      }
      setLoading(false)
    })()
  }, [session])

  const saveIncome = useCallback(async (item) => {
    const { data } = await supabase.from("income").upsert({ id: item.id, name: item.name, amount: Number(item.amount), is_fixed: item.is_fixed !== false, active: true }).select()
    setIncome(prev => { const exists = prev.find(i => i.id === item.id); return exists ? prev.map(i => i.id === item.id ? data[0] : i) : [...prev, data[0]] })
  }, [])

  const deleteIncome = useCallback(async (id) => {
    await supabase.from("income").delete().eq("id", id)
    setIncome(prev => prev.filter(i => i.id !== id))
  }, [])

  const saveFixed = useCallback(async (item) => {
    const { data } = await supabase.from("fixed_expenses").upsert({ id: item.id, name: item.name, amount: Number(item.amount), due_day: item.due_day ? Number(item.due_day) : null, active: true }).select()
    setFixed(prev => { const exists = prev.find(f => f.id === item.id); return exists ? prev.map(f => f.id === item.id ? data[0] : f) : [...prev, data[0]] })
  }, [])

  const deleteFixed = useCallback(async (id) => {
    await supabase.from("fixed_expenses").delete().eq("id", id)
    setFixed(prev => prev.filter(f => f.id !== id))
  }, [])

  const saveVar = useCallback(async (item) => {
    const { data } = await supabase.from("variable_expenses").upsert({ id: item.id, name: item.name, amount: Number(item.amount), month: item.month, parcelas: item.parcelas || 1 }).select()
    setVarExpenses(prev => { const exists = prev.find(v => v.id === item.id); return exists ? prev.map(v => v.id === item.id ? data[0] : v) : [...prev, data[0]] })
  }, [])

  const deleteVar = useCallback(async (id) => {
    await supabase.from("variable_expenses").delete().eq("id", id)
    setVarExpenses(prev => prev.filter(v => v.id !== id))
  }, [])

  const uploadCard = useCallback(async (month, txns) => {
    await supabase.from("card_transactions").delete().eq("month", month)
    const rows = txns.map(t => ({ month, date: t.date, store: t.store, amount: t.amount, parc_current: t.parc_current, parc_total: t.parc_total, category: t.category }))
    await supabase.from("card_transactions").insert(rows)
    const newMonths = [...new Set([...months, month])].sort()
    setCardMonths(prev => ({ ...prev, [month]: txns }))
    setMonths(newMonths)
  }, [months])

  const deleteMonth = useCallback(async (month) => {
    await supabase.from("card_transactions").delete().eq("month", month)
    const newCardMonths = { ...cardMonths }; delete newCardMonths[month]
    setCardMonths(newCardMonths)
    setMonths(prev => prev.filter(m => m !== month))
  }, [cardMonths])

  const tabs = [
    { id: "home", icon: "🏠", label: "Início" },
    { id: "card", icon: "💳", label: "Fatura" },
    { id: "config", icon: "⚙️", label: "Configurar" },
    { id: "projection", icon: "📈", label: "Projeção" },
  ]

  if (!authReady) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center"><p className="text-4xl mb-3">💰</p><p className="text-xl text-gray-500">Carregando...</p></div>
    </div>
  )

  if (!session) return <Login />

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <div className="text-center"><p className="text-4xl mb-3">💰</p><p className="text-xl text-gray-500">Carregando...</p></div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center h-screen bg-gray-50 px-6">
      <div className="text-center"><p className="text-4xl mb-3">⚠️</p><p className="text-xl font-bold text-red-600 mb-2">Erro de conexão</p><p className="text-base text-gray-500">{error}</p></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div className="bg-white border-b border-gray-100 px-5 pt-4 pb-3 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Minhas Finanças</h1>
          <p className="text-base text-gray-400">Controle financeiro da Martha</p>
        </div>
        <button onClick={() => supabase.auth.signOut()}
          className="text-sm font-semibold text-gray-400 hover:text-gray-600 py-2 px-3 rounded-xl">
          Sair
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28">
        {tab === "home" && <Dashboard income={income} fixed={fixed} cardMonths={cardMonths} months={months} varExpenses={varExpenses} />}
        {tab === "card" && <FaturaTab cardMonths={cardMonths} months={months} onUpload={uploadCard} onDeleteMonth={deleteMonth} />}
        {tab === "config" && <ConfigTab income={income} fixed={fixed} varExpenses={varExpenses} onSaveIncome={saveIncome} onSaveFixed={saveFixed} onSaveVar={saveVar} onDeleteIncome={deleteIncome} onDeleteFixed={deleteFixed} onDeleteVar={deleteVar} />}
        {tab === "projection" && <ProjectionTab income={income} fixed={fixed} cardMonths={cardMonths} months={months} varExpenses={varExpenses} />}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around px-2 py-2"
        style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex flex-col items-center py-2 px-3 rounded-xl min-w-[70px] ${tab === t.id ? "bg-blue-50 text-blue-600" : "text-gray-400"}`}>
            <span className="text-2xl">{t.icon}</span>
            <span className="text-xs font-semibold mt-1">{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
