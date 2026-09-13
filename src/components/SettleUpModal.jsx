import { useState } from 'react'
import { getFriend } from '../utils/friends'

export default function SettleUpModal({ transaction, onClose, onConfirm }) {
  const [amount, setAmount] = useState(transaction.amount.toFixed(2))
  const [submitting, setSubmitting] = useState(false)
  const from = getFriend(transaction.from)
  const to = getFriend(transaction.to)

  async function handleConfirm() {
    const val = parseFloat(amount)
    if (isNaN(val) || val <= 0) return
    setSubmitting(true)
    await onConfirm(val)
    setSubmitting(false)
  }

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-end sm:items-center justify-center z-30 p-4">
      <div className="bg-white rounded-ticket w-full max-w-sm p-6">
        <h3 className="font-display font-bold text-xl text-ink mb-1">Record a payment</h3>
        <p className="text-sm text-ink-light/60 mb-5">
          {from.name} pays {to.name}
        </p>

        <label className="text-xs font-medium text-ink-light/60 uppercase tracking-wide">
          Amount
        </label>
        <div className="flex items-center gap-2 mt-1 mb-6">
          <span className="text-2xl font-display text-ink-light/40">₹</span>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-2xl font-display font-semibold w-full border-b-2 border-ink/10 focus:border-zest outline-none pb-1"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full border border-ink/10 font-medium text-ink-light/70 hover:bg-ink/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 py-3 rounded-full bg-teal text-white font-medium hover:bg-teal/90 disabled:opacity-50 transition-colors"
          >
            {submitting ? 'Saving…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  )
}
