import { Card } from './ui'
import { fmt, monthLabel, currentMonthKey, getVarForMonth } from '../utils'

export default function Dashboard({ income, fixed, cardMonths, months, varExpenses }) {
  const latestMonth = months.length ? months[months.length - 1] : null
  const targetMonth = latestMonth || currentMonthKey()

  const totalIncome = income.filter(i => i.active).reduce((s, i) => s + Number(i.amount), 0)
  const totalFixed = fixed.filter(f => f.active).reduce((s, f) => s + Number(f.amount), 0)

  let totalCard = 0, catTotals = {}
  if (latestMonth && cardMonths[latestMonth]) {
    const txns = cardMonths[latestMonth].filter(t => t.amount > 0)
    totalCard = txns.reduce((s, t) => s + Number(t.amount), 0)
    txns.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + Number(t.amount) })
  }

  const varThisMonth = getVarForMonth(varExpenses, targetMonth)
  const totalVar = varThisMonth.reduce((s, v) => s + Number(v.amount), 0)
  const totalExpenses = totalFixed + totalCard + totalVar
  const balance = totalIncome - totalExpenses
  const pct = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0

  let alertColor, alertBg, alertText, alertIcon
  if (pct <= 70) { alertColor = "text-emerald-700"; alertBg = "bg-emerald-50 border-emerald-200"; alertText = "Tudo certo! Os gastos estão controlados."; alertIcon = "✅" }
  else if (pct <= 90) { alertColor = "text-amber-700"; alertBg = "bg-amber-50 border-amber-200"; alertText = "Atenção! Os gastos estão altos este mês."; alertIcon = "⚠️" }
  else { alertColor = "text-red-700"; alertBg = "bg-red-50 border-red-200"; alertText = balance < 0 ? "Os gastos passaram da receita! Cuidado!" : "Muito perto do limite!"; alertIcon = "🚨" }

  const futureInstallments = []
  if (latestMonth && cardMonths[latestMonth]) {
    cardMonths[latestMonth].filter(t => t.parc_total && t.parc_current < t.parc_total).forEach(t => {
      futureInstallments.push({ store: t.store, amount: Number(t.amount), remaining: t.parc_total - t.parc_current, parcCurrent: t.parc_current, parcTotal: t.parc_total })
    })
  }
  varExpenses.filter(v => (v.parcelas || 1) > 1).forEach(v => {
    const parc = v.parcelas
    const [sy, sm] = v.month.split("-").map(Number)
    const nowDate = new Date()
    const startDate = new Date(sy, sm - 1, 1)
    const curMonthDate = new Date(nowDate.getFullYear(), nowDate.getMonth(), 1)
    const elapsed = Math.max(0, (curMonthDate.getFullYear() - startDate.getFullYear()) * 12 + (curMonthDate.getMonth() - startDate.getMonth()))
    const remaining = parc - elapsed
    if (remaining > 0) futureInstallments.push({ store: `${v.name} (PIX)`, amount: Number(v.amount), remaining, parcCurrent: elapsed + 1, parcTotal: parc })
  })
  const futureTotal = futureInstallments.reduce((s, i) => s + i.amount, 0)
  const sortedCats = Object.entries(catTotals).sort((a, b) => b[1] - a[1])

  if (!latestMonth && totalIncome === 0 && totalFixed === 0 && varExpenses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
        <span className="text-6xl">📊</span>
        <p className="text-xl text-gray-500 max-w-xs">Para começar, cadastre suas <strong>receitas</strong> e <strong>gastos fixos</strong>, depois anexe a <strong>fatura do cartão</strong>.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <Card className={balance >= 0 ? "!bg-emerald-50 !border-emerald-200" : "!bg-red-50 !border-red-200"}>
        <p className="text-base text-gray-500 mb-1">{monthLabel(targetMonth)}</p>
        <p className={`text-4xl font-bold ${balance >= 0 ? "text-emerald-700" : "text-red-600"}`}>{fmt(Math.abs(balance))}</p>
        <p className="text-lg mt-1">{balance >= 0 ? "sobrando no mês" : "faltando no mês"}</p>
      </Card>

      <div className={`${alertBg} border rounded-xl p-4 flex items-start gap-3`}>
        <span className="text-2xl">{alertIcon}</span>
        <p className={`${alertColor} text-lg font-medium`}>{alertText}</p>
      </div>

      <Card>
        <div className="flex flex-col gap-3">
          <div className="flex justify-between"><span className="text-lg">💰 Receita total</span><span className="text-lg font-bold text-emerald-600">{fmt(totalIncome)}</span></div>
          <div className="h-px bg-gray-100" />
          <div className="flex justify-between"><span className="text-lg">🏠 Gastos fixos</span><span className="text-lg font-bold text-gray-700">- {fmt(totalFixed)}</span></div>
          <div className="flex justify-between"><span className="text-lg">💳 Cartão</span><span className="text-lg font-bold text-gray-700">- {fmt(totalCard)}</span></div>
          {totalVar > 0 && <div className="flex justify-between"><span className="text-lg">💸 Variáveis</span><span className="text-lg font-bold text-gray-700">- {fmt(totalVar)}</span></div>}
          <div className="h-px bg-gray-200" />
          <div className="flex justify-between"><span className="text-xl font-bold">Resultado</span><span className={`text-xl font-bold ${balance >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fmt(balance)}</span></div>
        </div>
      </Card>

      {futureInstallments.length > 0 && (
        <Card className="!border-amber-200">
          <p className="text-lg font-bold text-amber-700 mb-3">📅 Parcelas futuras comprometidas</p>
          <div className="flex flex-col gap-2">
            {futureInstallments.map((inst, i) => (
              <div key={i} className="flex justify-between text-base">
                <span className="text-gray-700 truncate pr-2">{inst.store} <span className="text-gray-400 text-xs">({inst.parcCurrent}/{inst.parcTotal})</span></span>
                <span className="font-semibold text-amber-700 whitespace-nowrap">{fmt(inst.amount)} × {inst.remaining}</span>
              </div>
            ))}
            <div className="h-px bg-amber-100 mt-1" />
            <p className="text-base text-amber-700 font-semibold">Por mês: {fmt(futureTotal)}</p>
          </div>
        </Card>
      )}

      {sortedCats.length > 0 && (
        <Card>
          <p className="text-lg font-bold text-gray-700 mb-3">📋 Gastos no cartão por categoria</p>
          <div className="flex flex-col gap-2">
            {sortedCats.slice(0, 6).map(([cat, total]) => (
              <div key={cat}>
                <div className="flex justify-between text-base mb-1"><span>{cat}</span><span className="font-semibold">{fmt(total)}</span></div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.min((total / totalCard) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {varThisMonth.length > 0 && (
        <Card>
          <p className="text-lg font-bold text-gray-700 mb-3">💸 Gastos variáveis deste mês</p>
          {varThisMonth.map((v, i) => (
            <div key={i} className="flex justify-between text-base text-gray-600">
              <span>{v.name} {v.parcTotal > 1 && <span className="text-xs text-purple-600">({v.parcAtual}/{v.parcTotal})</span>}</span>
              <span className="font-medium">{fmt(v.amount)}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
