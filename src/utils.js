export const fmt = (v) => Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
export const MONTH_NAMES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]
export function monthLabel(key) { const [y, m] = key.split("-"); return `${MONTH_NAMES[parseInt(m) - 1]} ${y}` }
export function currentMonthKey() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` }

export const CAT_RULES = [
  ["Supermercado", ["ATACADAO","G BARBOSA","HIPERIDEAL","AGROMIX","PERINI","CASTANHO BARRA","MENINO JESUS"]],
  ["Combustível", ["POSTO"]],
  ["Streaming", ["NETFLIX","APPLE.COM/BILL"]],
  ["Telefone", ["CONTA VIVO"]],
  ["Pedágio", ["SEM PARAR"]],
  ["Restaurante", ["MC DONALDS","VIM VIM","PURO SAUDAVEL","D ANTONIO","BARRACAO","HOTFRUTE","KOPENHAGEN"]],
  ["Vestuário", ["RIACHUELO","HOPE ","ANIMALE","INDITEX"]],
  ["Saúde e Beleza", ["LUIZ SANTHANA","SORRIA BRASIL","NJK LTDA"]],
  ["Compras Online", ["MERCADOLIVRE","MERCADOLI","VICENZA"]],
  ["Seguro", ["YELUMSEG"]],
  ["Viagem", ["AIRBNB"]],
  ["Casa", ["TS ARTES","MADEIREIRA","BENDITAS","ANANIASHENRIQUE"]],
  ["Pet", ["BICHO DO MATO"]],
  ["Lazer", ["ARENA","GRG"]],
  ["Estacionamento", ["ESTACIONAMENT"]],
]

export function categorize(name) {
  const up = name.toUpperCase()
  for (const [cat, keys] of CAT_RULES) {
    if (keys.some(k => up.includes(k))) return cat
  }
  return "Outros"
}

export function parseCSV(text) {
  const clean = text.replace(/^\uFEFF/, "").replace(/\r/g, "")
  const lines = clean.split("\n").filter(l => l.trim())
  const rows = []
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(";")
    if (parts.length < 5) continue
    const [dateStr, store, , valStr, parcStr] = parts
    const val = parseFloat(valStr.replace("R$", "").replace(/\./g, "").replace(",", ".").trim())
    if (isNaN(val)) continue
    let parc_current = null, parc_total = null
    const pm = parcStr.trim().match(/(\d+)\s*de\s*(\d+)/)
    if (pm) { parc_current = parseInt(pm[1]); parc_total = parseInt(pm[2]) }
    rows.push({ date: dateStr.trim(), store: store.trim(), amount: val, parc_current, parc_total, category: categorize(store.trim()) })
  }
  return rows
}

export function getVarForMonth(varExpenses, monthKey) {
  const result = []
  varExpenses.forEach(v => {
    const parc = v.parcelas || 1
    const [sy, sm] = v.month.split("-").map(Number)
    for (let i = 0; i < parc; i++) {
      const d = new Date(sy, sm - 1 + i, 1)
      const k = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
      if (k === monthKey) { result.push({ ...v, parcAtual: i + 1, parcTotal: parc }); break }
    }
  })
  return result
}
