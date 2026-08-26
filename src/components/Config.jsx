import { useState } from 'react'
import { Card, BigButton, FieldInput, Spinner } from './ui'
import { fmt, monthLabel, currentMonthKey } from '../utils'

export default function ConfigTab({ income, fixed, varExpenses, onSaveIncome, onSaveFixed, onSaveVar, onDeleteIncome, onDeleteFixed, onDeleteVar }) {
  const [editIncome, setEditIncome] = useState(null)
  const [editFixed, setEditFixed] = useState(null)
  const [editVar, setEditVar] = useState(null)
  const [section, setSection] = useState("income")
  const [saving, setSaving] = useState(false)

  const now = new Date()
  const varMonthOpts = []
  for (let i = -3; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    varMonthOpts.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
  }

  async function saveInc() {
    if (!editIncome?.name || !editIncome?.amount) return
    setSaving(true)
    await onSaveIncome({ ...editIncome, id: editIncome.id || Date.now().toString(), active: true, is_fixed: editIncome.is_fixed !== false })
    setEditIncome(null); setSaving(false)
  }
  async function saveExp() {
    if (!editFixed?.name || !editFixed?.amount) return
    setSaving(true)
    await onSaveFixed({ ...editFixed, id: editFixed.id || Date.now().toString(), active: true })
    setEditFixed(null); setSaving(false)
  }
  async function saveVar() {
    if (!editVar?.name || !editVar?.amount || !editVar?.month) return
    setSaving(true)
    await onSaveVar({ ...editVar, id: editVar.id || Date.now().toString(), parcelas: editVar.parcelas || 1 })
    setEditVar(null); setSaving(false)
  }

  const sectionColors = { income: "#059669", fixed: "#2563eb", variable: "#9333ea" }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1">
        {[["income","💰","Receitas"],["fixed","🏠","Fixos"],["variable","💸","Variáveis"]].map(([id,icon,label]) => (
          <button key={id} onClick={() => setSection(id)}
            className="flex-1 py-3 rounded-xl text-base font-semibold transition-colors text-white"
            style={{ backgroundColor: section === id ? sectionColors[id] : "#f3f4f6", color: section === id ? "white" : "#4b5563" }}>
            {icon} {label}
          </button>
        ))}
      </div>

      {section === "income" && (
        <>
          {income.map(item => (
            <Card key={item.id}>
              <div className="flex justify-between items-center">
                <div><p className="text-lg font-bold">{item.name}</p><p className="text-sm text-gray-400">{item.is_fixed === false ? "Variável" : "Fixa"}</p></div>
                <p className="text-xl font-bold text-emerald-600">{fmt(item.amount)}</p>
              </div>
              <div className="flex gap-3 mt-3">
                <button onClick={() => setEditIncome({...item})} className="text-blue-600 text-base font-medium">Editar</button>
                <button onClick={() => onDeleteIncome(item.id)} className="text-red-400 text-base font-medium">Remover</button>
              </div>
            </Card>
          ))}
          {editIncome ? (
            <Card className="border-emerald-200">
              <p className="text-lg font-bold mb-3">{editIncome.id ? "Editar receita" : "Nova receita"}</p>
              <div className="flex flex-col gap-3">
                <FieldInput label="Nome" value={editIncome.name||""} onChange={v=>setEditIncome({...editIncome,name:v})} placeholder="Ex: Aposentadoria" />
                <FieldInput label="Valor (R$)" value={editIncome.amount||""} onChange={v=>setEditIncome({...editIncome,amount:v})} type="number" placeholder="0.00" />
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium text-gray-600">Tipo</label>
                  <select value={editIncome.is_fixed===false?"var":"fix"} onChange={e=>setEditIncome({...editIncome,is_fixed:e.target.value==="fix"})}
                    className="border-2 border-gray-200 rounded-xl px-4 py-3 text-lg bg-white">
                    <option value="fix">Fixa (todo mês)</option>
                    <option value="var">Variável (quando acontecer)</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <BigButton onClick={saveInc} color="green" disabled={saving}>{saving?<><Spinner/>Salvando...</>:"✓ Salvar"}</BigButton>
                  <button onClick={()=>setEditIncome(null)} className="text-gray-500 text-base px-4">Cancelar</button>
                </div>
              </div>
            </Card>
          ) : (
            <BigButton onClick={()=>setEditIncome({name:"",amount:"",is_fixed:true})} color="green" icon="＋">Adicionar Receita</BigButton>
          )}
          <Card className="bg-gray-50">
            <div className="flex justify-between">
              <span className="text-lg font-semibold">Total fixo</span>
              <span className="text-xl font-bold text-emerald-600">{fmt(income.filter(i=>i.active&&i.is_fixed!==false).reduce((s,i)=>s+Number(i.amount),0))}</span>
            </div>
          </Card>
        </>
      )}

      {section === "fixed" && (
        <>
          {fixed.map(item => (
            <Card key={item.id}>
              <div className="flex justify-between items-center">
                <div><p className="text-lg font-bold">{item.name}</p>{item.due_day&&<p className="text-sm text-gray-400">Dia {item.due_day}</p>}</div>
                <p className="text-xl font-bold text-gray-700">{fmt(item.amount)}</p>
              </div>
              <div className="flex gap-3 mt-3">
                <button onClick={()=>setEditFixed({...item})} className="text-blue-600 text-base font-medium">Editar</button>
                <button onClick={()=>onDeleteFixed(item.id)} className="text-red-400 text-base font-medium">Remover</button>
              </div>
            </Card>
          ))}
          {editFixed ? (
            <Card className="border-blue-200">
              <p className="text-lg font-bold mb-3">{editFixed.id?"Editar gasto fixo":"Novo gasto fixo"}</p>
              <div className="flex flex-col gap-3">
                <FieldInput label="Nome" value={editFixed.name||""} onChange={v=>setEditFixed({...editFixed,name:v})} placeholder="Ex: Energia" />
                <FieldInput label="Valor (R$)" value={editFixed.amount||""} onChange={v=>setEditFixed({...editFixed,amount:v})} type="number" placeholder="0.00" />
                <FieldInput label="Dia do vencimento" value={editFixed.due_day||""} onChange={v=>setEditFixed({...editFixed,due_day:v})} type="number" placeholder="Ex: 10" />
                <div className="flex gap-2">
                  <BigButton onClick={saveExp} color="blue" disabled={saving}>{saving?<><Spinner/>Salvando...</>:"✓ Salvar"}</BigButton>
                  <button onClick={()=>setEditFixed(null)} className="text-gray-500 text-base px-4">Cancelar</button>
                </div>
              </div>
            </Card>
          ) : (
            <BigButton onClick={()=>setEditFixed({name:"",amount:"",due_day:""})} color="blue" icon="＋">Adicionar Gasto Fixo</BigButton>
          )}
          <Card className="bg-gray-50">
            <div className="flex justify-between">
              <span className="text-lg font-semibold">Total fixos</span>
              <span className="text-xl font-bold text-gray-700">{fmt(fixed.filter(f=>f.active).reduce((s,f)=>s+Number(f.amount),0))}</span>
            </div>
          </Card>
        </>
      )}

      {section === "variable" && (
        <>
          <Card className="bg-purple-50 border-purple-200">
            <p className="text-base text-purple-700">Gastos avulsos como <strong>advogado, médico, PIX</strong> que não aparecem na fatura do cartão.</p>
          </Card>
          {varExpenses.map(item => (
            <Card key={item.id}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-bold">{item.name}</p>
                  <p className="text-sm text-gray-400">{monthLabel(item.month)}{(item.parcelas||1)>1?` · ${item.parcelas}× de ${fmt(item.amount)}`:""}</p>
                </div>
                <p className="text-xl font-bold text-purple-700">{fmt(item.amount)}</p>
              </div>
              <div className="flex gap-3 mt-3">
                <button onClick={()=>setEditVar({...item})} className="text-blue-600 text-base font-medium">Editar</button>
                <button onClick={()=>onDeleteVar(item.id)} className="text-red-400 text-base font-medium">Remover</button>
              </div>
            </Card>
          ))}
          {editVar ? (
            <Card className="border-purple-200">
              <p className="text-lg font-bold mb-3">{editVar.id?"Editar gasto variável":"Novo gasto variável"}</p>
              <div className="flex flex-col gap-3">
                <FieldInput label="Descrição" value={editVar.name||""} onChange={v=>setEditVar({...editVar,name:v})} placeholder="Ex: Advogado Dr. Silva" />
                <FieldInput label="Valor por parcela (R$)" value={editVar.amount||""} onChange={v=>setEditVar({...editVar,amount:v})} type="number" placeholder="0.00" />
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium text-gray-600">Mês do pagamento</label>
                  <select value={editVar.month||""} onChange={e=>setEditVar({...editVar,month:e.target.value})}
                    className="border-2 border-gray-200 rounded-xl px-4 py-3 text-lg bg-white">
                    <option value="">Selecione o mês...</option>
                    {varMonthOpts.map(k=><option key={k} value={k}>{monthLabel(k)}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-base font-medium text-gray-600">Quantas parcelas?</label>
                  <div className="flex flex-wrap gap-2">
                    {[1,2,3,4,5,6,8,10,12].map(n=>(
                      <button key={n} onClick={()=>setEditVar({...editVar,parcelas:n})}
                        className="px-4 py-3 rounded-xl text-base font-semibold"
                        style={{backgroundColor:(editVar.parcelas||1)===n?"#9333ea":"#f3f4f6",color:(editVar.parcelas||1)===n?"white":"#4b5563"}}>
                        {n}×
                      </button>
                    ))}
                  </div>
                </div>
                {(editVar.parcelas||1)>1&&<p className="text-base text-gray-500 bg-gray-50 rounded-xl p-3">Total: <strong>{fmt((parseFloat(editVar.amount)||0)*(editVar.parcelas||1))}</strong> em {editVar.parcelas}× de <strong>{fmt(parseFloat(editVar.amount)||0)}</strong></p>}
                <div className="flex gap-2">
                  <BigButton onClick={saveVar} color="purple" disabled={saving}>{saving?<><Spinner/>Salvando...</>:"✓ Salvar"}</BigButton>
                  <button onClick={()=>setEditVar(null)} className="text-gray-500 text-base px-4">Cancelar</button>
                </div>
              </div>
            </Card>
          ) : (
            <BigButton onClick={()=>setEditVar({name:"",amount:"",month:currentMonthKey(),parcelas:1})} color="purple" icon="＋">Adicionar Gasto Variável</BigButton>
          )}
        </>
      )}
    </div>
  )
}
