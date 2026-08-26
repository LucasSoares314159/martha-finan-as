import { Card } from './ui'
import { fmt, monthLabel, getVarForMonth } from '../utils'

export default function ProjectionTab({ income, fixed, cardMonths, months, varExpenses }) {
  const totalIncomeFixed = income.filter(i=>i.active&&i.is_fixed!==false).reduce((s,i)=>s+Number(i.amount),0)
  const totalFixed = fixed.filter(f=>f.active).reduce((s,f)=>s+Number(f.amount),0)

  const cardInstByMonth = {}
  months.forEach(m => {
    const txns = cardMonths[m] || []
    const [y, mo] = m.split("-").map(Number)
    txns.filter(t=>t.parc_total&&t.parc_current<t.parc_total&&t.amount>0).forEach(t=>{
      for(let i=1;i<=t.parc_total-t.parc_current;i++){
        const fd=new Date(y,mo-1+i,1)
        const fk=`${fd.getFullYear()}-${String(fd.getMonth()+1).padStart(2,"0")}`
        if(!cardInstByMonth[fk])cardInstByMonth[fk]=[]
        if(!cardInstByMonth[fk].some(e=>e.store===t.store&&e.amount===Number(t.amount)))
          cardInstByMonth[fk].push({store:t.store,amount:Number(t.amount),parcInfo:`${t.parc_current+i}/${t.parc_total}`})
      }
    })
  })

  let avgNonInstCard = 0
  if(months.length){
    const totals=months.map(m=>(cardMonths[m]||[]).filter(t=>t.amount>0&&!t.parc_total).reduce((s,t)=>s+Number(t.amount),0))
    avgNonInstCard=totals.reduce((s,v)=>s+v,0)/totals.length
  }

  const now=new Date()
  const projections=[]
  for(let i=1;i<=6;i++){
    const d=new Date(now.getFullYear(),now.getMonth()+i,1)
    const key=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`
    const cardInst=cardInstByMonth[key]||[]
    const cardInstTotal=cardInst.reduce((s,inst)=>s+inst.amount,0)
    const projectedCard=avgNonInstCard+cardInstTotal
    const varForMonth=getVarForMonth(varExpenses,key)
    const varTotal=varForMonth.reduce((s,v)=>s+Number(v.amount),0)
    const projectedBalance=totalIncomeFixed-totalFixed-projectedCard-varTotal
    projections.push({key,cardInst,projectedCard,varForMonth,varTotal,projectedBalance})
  }

  if(!months.length) return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <span className="text-6xl">📈</span>
      <p className="text-xl text-gray-500 max-w-xs">Anexe pelo menos uma fatura para ver a projeção.</p>
    </div>
  )

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-blue-50 border-blue-200">
        <p className="text-base text-blue-700"><strong>Como funciona:</strong> média dos gastos no cartão + parcelas conhecidas + gastos variáveis cadastrados.</p>
      </Card>
      {projections.map(p=>(
        <Card key={p.key} className={p.projectedBalance<0?"border-red-200":""}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xl font-bold">{monthLabel(p.key)}</span>
            <span className={`text-xl font-bold ${p.projectedBalance>=0?"text-emerald-600":"text-red-600"}`}>
              {p.projectedBalance>=0?"+":""}{fmt(p.projectedBalance)}
            </span>
          </div>
          <div className="flex flex-col gap-1 text-base text-gray-500">
            <div className="flex justify-between"><span>Receita fixa</span><span>{fmt(totalIncomeFixed)}</span></div>
            <div className="flex justify-between"><span>Gastos fixos</span><span>- {fmt(totalFixed)}</span></div>
            <div className="flex justify-between"><span>Cartão estimado</span><span>- {fmt(p.projectedCard)}</span></div>
            {p.varTotal>0&&<div className="flex justify-between"><span>Variáveis</span><span>- {fmt(p.varTotal)}</span></div>}
            {p.cardInst.length>0&&(
              <div className="mt-2 pt-2 border-t border-gray-100">
                <p className="text-amber-600 font-medium text-sm mb-1">Parcelas do cartão:</p>
                {p.cardInst.map((inst,i)=><div key={i} className="flex justify-between text-sm"><span className="truncate pr-2">{inst.store} <span className="text-gray-400">({inst.parcInfo})</span></span><span>{fmt(inst.amount)}</span></div>)}
              </div>
            )}
            {p.varForMonth.length>0&&(
              <div className="mt-1 pt-1 border-t border-gray-100">
                <p className="text-purple-600 font-medium text-sm mb-1">Variáveis:</p>
                {p.varForMonth.map((v,i)=><div key={i} className="flex justify-between text-sm"><span>{v.name} {v.parcTotal>1&&<span className="text-gray-400">({v.parcAtual}/{v.parcTotal})</span>}</span><span>{fmt(v.amount)}</span></div>)}
              </div>
            )}
          </div>
          {p.projectedBalance<0&&<div className="mt-3 bg-red-50 rounded-lg p-2"><p className="text-red-600 text-base font-semibold">🚨 Mês no vermelho! Cuidado com novos gastos.</p></div>}
        </Card>
      ))}
    </div>
  )
}
