export function Card({ children, className = "" }) {
  return <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-5 ${className}`}>{children}</div>
}

export function BigButton({ onClick, children, color = "blue", icon, disabled }) {
  const colors = {
    blue: "bg-blue-600 hover:bg-blue-700 text-white",
    green: "bg-emerald-600 hover:bg-emerald-700 text-white",
    purple: "bg-purple-600 hover:bg-purple-700 text-white",
    amber: "bg-amber-500 hover:bg-amber-600 text-white",
    red: "bg-red-500 hover:bg-red-600 text-white",
    gray: "bg-gray-100 hover:bg-gray-200 text-gray-700",
  }
  return (
    <button onClick={onClick} disabled={disabled}
      className={`${colors[color]} rounded-xl px-5 py-4 text-lg font-semibold w-full flex items-center justify-center gap-3 transition-colors disabled:opacity-40`}>
      {icon && <span className="text-2xl">{icon}</span>}{children}
    </button>
  )
}

export function FieldInput({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-base font-medium text-gray-600">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="border-2 border-gray-200 rounded-xl px-4 py-3 text-lg focus:border-blue-500 focus:outline-none" />
    </div>
  )
}

export function Spinner() {
  return <div className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
}
