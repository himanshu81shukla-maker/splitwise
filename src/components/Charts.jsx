import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { CATEGORIES, FRIENDS } from '../utils/friends'

const PALETTE = ['#FF6B35', '#0E7C7B', '#FF4D6D', '#C4F135', '#7B5CFA', '#00B8D9', '#241442']

export default function Charts({ expenses }) {
  const byCategory = useMemo(() => {
    const totals = {}
    expenses.forEach((e) => {
      totals[e.category] = (totals[e.category] || 0) + e.amount
    })
    return Object.entries(totals).map(([id, value]) => {
      const cat = CATEGORIES.find((c) => c.id === id)
      return { name: cat ? `${cat.emoji} ${cat.label}` : id, value: Math.round(value * 100) / 100 }
    })
  }, [expenses])

  const byPerson = useMemo(() => {
    const totals = {}
    FRIENDS.forEach((f) => (totals[f.id] = 0))
    expenses.forEach((e) => {
      totals[e.paidBy] = (totals[e.paidBy] || 0) + e.amount
    })
    return FRIENDS.map((f) => ({ name: f.name, amount: Math.round((totals[f.id] || 0) * 100) / 100 }))
  }, [expenses])

  if (expenses.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-ink-light/50">
        Add some expenses to see charts here.
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-8">
      <div className="ticket p-4">
        <h3 className="font-display font-semibold text-ink mb-3">Spend by category</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={byCategory} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
              {byCategory.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} />
          </PieChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2">
          {byCategory.map((c, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-ink-light/60">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PALETTE[i % PALETTE.length] }} />
              {c.name}
            </div>
          ))}
        </div>
      </div>

      <div className="ticket p-4">
        <h3 className="font-display font-semibold text-ink mb-3">Who's paid the most</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={byPerson}>
            <CartesianGrid strokeDasharray="3 3" stroke="#24144211" />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#241442aa' }} />
            <YAxis tick={{ fontSize: 12, fill: '#241442aa' }} />
            <Tooltip formatter={(v) => `₹${v.toFixed(2)}`} />
            <Bar dataKey="amount" fill="#FF6B35" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
