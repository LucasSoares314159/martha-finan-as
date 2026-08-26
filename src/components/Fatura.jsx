import { useState, useRef } from 'react'
import { Card, BigButton, Spinner } from './ui'
import { parseCSV, monthLabel } from '../utils'

export default function FaturaTab({ cardMonths, months, onUpload, onDeleteMonth }) {
  const fileRef = useRef(null)
  const [selectedMonth, setSelectedMonth] = useState(months.length ? months[months.length - 1] : "")
  const [uploadMonth, setUploadMonth] = useState("")
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [uploadError, setUploadError] = useState("")
  const [saving, setSaving] = useState(false)

  const now = new Date()
  const monthOptions = []
  for (let i = -3; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
    monthOptions.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`)
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file || !uploadMonth) { setUploadError("Escolha o mês antes."); return }
    setUploadError(""); setSaving(true)
    const reader = new FileReader()
    reader.onload = async (ev) => {
      try {
        const txns = parseCSV(ev.target.result)
        if (txns.length === 0) { setUploadError("Não consegui ler dados nessa planilha."); setSaving(false); return }
        await onUpload(uploadMonth, txns)
        setSelectedMonth(uploadMonth)
        setShowUploadForm(false)
        setUploadMonth("")
      } catch (err) { setUploadError("Erro ao salvar. Tente novamente."); console.error(err) }
      setSaving(false)
    }
    reader.readAsText(file, "utf-8")
    e.target.value = ""
  }

  const txns = selectedMonth && cardMonths[selectedMonth] ? cardMonths[selectedMonth] : []
  const expenses = txns.filter(t => t.amount > 0)
  const payments = txns.filter(t => t.amount < 0)
  const totalExp = expenses.reduce((s, t) => s + Number(t.amount), 0)

  const byCat = {}
  expenses.forEach(t => { if (!byCat[t.category]) byCat[t.category] = []; byCat[t.category].push(t) })
  const sortedCatGroups = Object.entries(byCat).sort((a, b) =>
    b[1].reduce((s, t) => s + Number(t.amount), 0) - a[1].reduce((s, t) => s + Number(t.amount), 0)
  )

  return (
    <div className="flex flex-col gap-4">
      {!showUploadForm ? (
        <BigButton onClick={() => setShowUploadForm(true)} color="blue" icon="📎">Anexar Nova Fatura</BigButton>
      ) : (
        <Card>
          <p className="text-lg font-bold mb-3">Anexar fatura do cartão</p>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-base font-medium text-gray-600">Mês da fatura:</label>
              <select value={uploadMonth} onChange={e => setUploadMonth(e.target.value)}
                className="border-2 border-gray-200 rounded-xl px-4 py-3 text-lg bg-white">
                <option value="">Selecione o mês...</option>
                {monthOptions.map(k => <option key={k} value={k}>{monthLabel(k)} {cardMonths[k] ? "✓" : ""}</option>)}
              </select>
            </div>
            <input ref={fileRef} type="file" accept=".csv" onChange={handleFile} className="hidden" />
            <BigButton onClick={() => fileRef.current?.click()} color="green" icon={saving ? undefined : "📄"} disabled={!uploadMonth || saving}>
              {saving ? <><Spinner /> Salvando...</> : "Escolher Arquivo CSV"}
            </BigButton>
            {uploadError && <p className="text-red-600 text-base">{uploadError}</p>}
            <button onClick={() => { setShowUploadForm(false); setUploadError("") }} className="text-gray-500 text-base py-2">Cancelar</button>
          </div>
        </Card>
      )}

      {months.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {months.map(m => (
            <button key={m} onClick={() => setSelectedMonth(m)}
              className={`px-4 py-2 rounded-xl text-base font-semibold whitespace-nowrap ${selectedMonth === m ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600"}`}>
              {monthLabel(m)}
            </button>
          ))}
        </div>
      )}

      {selectedMonth && txns.length > 0 && (
        <>
          <Card><div className="flex justify-between"><span className="text-lg font-bold">Total do cartão</span><span className="text-2xl font-bold">{totalExp.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span></div></Card>
          {sortedCatGroups.map(([cat, items]) => {
            const catTotal = items.reduce((s, t) => s + Number(t.amount), 0)
            return (
              <Card key={cat}>
                <div className="flex justify-between mb-2">
                  <span className="text-base font-bold text-blue-700">{cat}</span>
                  <span className="text-base font-bold">{catTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
                {items.map((t, i) => (
                  <div key={i} className="flex justify-between text-base text-gray-600">
                    <span className="truncate pr-2">{t.store} {t.parc_total && <span className="text-xs text-amber-600">({t.parc_current}/{t.parc_total})</span>}</span>
                    <span className="font-medium whitespace-nowrap">{Number(t.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </div>
                ))}
              </Card>
            )
          })}
          {payments.length > 0 && (
            <Card className="bg-gray-50">
              <p className="text-base font-bold text-gray-500 mb-2">Pagamentos / Estornos</p>
              {payments.map((t, i) => (
                <div key={i} className="flex justify-between text-base text-gray-500">
                  <span className="truncate pr-2">{t.store}</span>
                  <span className="font-medium text-emerald-600">{Math.abs(t.amount).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                </div>
              ))}
            </Card>
          )}
          <button onClick={async () => { if (window.confirm(`Apagar a fatura de ${monthLabel(selectedMonth)}?`)) { await onDeleteMonth(selectedMonth); setSelectedMonth(months.filter(m => m !== selectedMonth).pop() || "") } }}
            className="text-red-400 text-sm py-2 self-center">Apagar esta fatura</button>
        </>
      )}
    </div>
  )
}
