import { useState } from 'react'
import { getFriend, CATEGORIES } from '../utils/friends'
import { useApp } from '../contexts/AppContext'

export default function ExpenseList({ expenses, deleteExpense }) {
  const { currentUser } = useApp()
  const [expandedId, setExpandedId] = useState(null)

  if (expenses.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-ink-light/50">
        No expenses yet. Add your first one from the Home tab.
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-3">
      {expenses.map((exp) => {
        const payer = getFriend(exp.paidBy)
        const cat = CATEGORIES.find((c) => c.id === exp.category) || CATEGORIES[CATEGORIES.length - 1]
        const myShare = exp.splits?.[currentUser] || 0
        const isExpanded = expandedId === exp.id

        return (
          <div key={exp.id} className="ticket p-4">
            <button
              className="w-full flex items-center justify-between text-left"
              onClick={() => setExpandedId(isExpanded ? null : exp.id)}
            >
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-ink/5 flex items-center justify-center text-lg">
                  {cat.emoji}
                </span>
                <div>
                  <p className="font-medium text-ink">{exp.description}</p>
                  <p className="text-xs text-ink-light/50">
                    {payer?.name} paid · {exp.date}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-display font-semibold text-ink">₹{exp.amount.toFixed(2)}</p>
                {exp.paidBy !== currentUser && myShare > 0 && (
                  <p className="text-xs text-coral">you owe ₹{myShare.toFixed(2)}</p>
                )}
              </div>
            </button>

            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-ink/5">
                {exp.receiptUrl && (
                  <img
                    src={exp.receiptUrl}
                    alt="Receipt"
                    className="w-full max-h-56 object-cover rounded-lg mb-3"
                  />
                )}
                <div className="space-y-1 mb-3">
                  {Object.entries(exp.splits || {}).map(([id, val]) => {
                    const f = getFriend(id)
                    return (
                      <div key={id} className="flex justify-between text-sm text-ink-light/70">
                        <span>{f?.emoji} {f?.name}</span>
                        <span>₹{val.toFixed(2)}</span>
                      </div>
                    )
                  })}
                </div>
                <button
                  onClick={() => deleteExpense(exp.id)}
                  className="text-xs text-coral hover:underline"
                >
                  Delete this expense
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
