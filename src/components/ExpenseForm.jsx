import { useMemo, useState } from 'react'
import { uploadToCloudinary } from '../utils/cloudinary'
import { FRIENDS, CATEGORIES } from '../utils/friends'
import { computeSplits, validateSplitSum } from '../utils/splitCalculations'
import { useApp } from '../contexts/AppContext'
import ReceiptUpload from './ReceiptUpload'

const SPLIT_TYPES = [
  { id: 'equal', label: 'Equally' },
  { id: 'exact', label: 'Exact amounts' },
  { id: 'percentage', label: 'Percentages' },
  { id: 'shares', label: 'Shares' },
]

export default function ExpenseForm({ onClose, onSave }) {
  const { currentUser } = useApp()

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('food')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [paidBy, setPaidBy] = useState(currentUser)
  const [participants, setParticipants] = useState(FRIENDS.map((f) => f.id))
  const [splitType, setSplitType] = useState('equal')
  const [splitValues, setSplitValues] = useState({})
  const [receiptFile, setReceiptFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState(null)

  const numericAmount = parseFloat(amount) || 0

  const previewSplits = useMemo(
    () => computeSplits(numericAmount, splitType, participants, splitValues),
    [numericAmount, splitType, participants, splitValues]
  )

  function toggleParticipant(id) {
    setParticipants((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  function handleScanned(result) {
    if (result.amount) setAmount(String(result.amount))
    if (result.merchant) setDescription(result.merchant)
    if (result.date) setDate(result.date)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)

    if (!description.trim()) return setFormError('Add a short description.')
    if (numericAmount <= 0) return setFormError('Enter an amount greater than 0.')
    if (participants.length === 0) return setFormError('Select at least one person to split with.')
    if (!validateSplitSum(numericAmount, splitType, participants, splitValues)) {
      return setFormError(
        splitType === 'percentage'
          ? 'Percentages must add up to 100%.'
          : 'Exact amounts must add up to the total.'
      )
    }

    setSaving(true)
    try {
      let receiptUrl = null
      if (receiptFile) {
        receiptUrl = await uploadToCloudinary(receiptFile)
      }

      await onSave({
        description: description.trim(),
        amount: numericAmount,
        category,
        date,
        paidBy,
        splitType,
        splits: previewSplits,
        receiptUrl,
        createdBy: currentUser,
      })
      onClose()
    } catch (err) {
      setFormError(err.message || 'Could not save the expense.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/40 z-30 flex items-end sm:items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-cloud rounded-t-ticket sm:rounded-ticket w-full sm:max-w-lg max-h-[92vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-xl text-ink">Add an expense</h3>
          <button type="button" onClick={onClose} className="text-ink-light/40 hover:text-ink text-2xl leading-none">
            ×
          </button>
        </div>

        <ReceiptUpload onScanned={handleScanned} receiptFile={receiptFile} setReceiptFile={setReceiptFile} />

        <div className="mt-5">
          <label className="text-xs font-medium text-ink-light/60 uppercase tracking-wide">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Dinner at Cafe Roma"
            className="w-full mt-1 bg-white border border-ink/10 rounded-xl px-4 py-3 outline-none focus:border-zest"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div>
            <label className="text-xs font-medium text-ink-light/60 uppercase tracking-wide">Amount</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full mt-1 bg-white border border-ink/10 rounded-xl px-4 py-3 outline-none focus:border-zest"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-light/60 uppercase tracking-wide">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full mt-1 bg-white border border-ink/10 rounded-xl px-4 py-3 outline-none focus:border-zest"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-ink-light/60 uppercase tracking-wide">Category</label>
          <div className="flex gap-2 mt-1 overflow-x-auto no-scrollbar pb-1">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm border transition-colors ${
                  category === c.id
                    ? 'bg-ink text-white border-ink'
                    : 'bg-white text-ink-light/70 border-ink/10'
                }`}
              >
                <span>{c.emoji}</span> {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-ink-light/60 uppercase tracking-wide">Paid by</label>
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="w-full mt-1 bg-white border border-ink/10 rounded-xl px-4 py-3 outline-none focus:border-zest"
          >
            {FRIENDS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.emoji} {f.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-ink-light/60 uppercase tracking-wide">Split with</label>
          <div className="flex flex-wrap gap-2 mt-1">
            {FRIENDS.map((f) => (
              <button
                type="button"
                key={f.id}
                onClick={() => toggleParticipant(f.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm border transition-colors ${
                  participants.includes(f.id)
                    ? 'bg-lime/30 border-lime text-ink'
                    : 'bg-white text-ink-light/40 border-ink/10'
                }`}
              >
                {f.emoji} {f.name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="text-xs font-medium text-ink-light/60 uppercase tracking-wide">Split type</label>
          <div className="flex gap-2 mt-1">
            {SPLIT_TYPES.map((s) => (
              <button
                type="button"
                key={s.id}
                onClick={() => setSplitType(s.id)}
                className={`flex-1 px-2 py-2 rounded-full text-xs font-medium border transition-colors ${
                  splitType === s.id
                    ? 'bg-zest text-white border-zest'
                    : 'bg-white text-ink-light/60 border-ink/10'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {splitType !== 'equal' && (
          <div className="mt-4 space-y-2">
            {participants.map((id) => {
              const f = FRIENDS.find((fr) => fr.id === id)
              return (
                <div key={id} className="flex items-center gap-3">
                  <span className="w-24 text-sm text-ink-light/70">{f.emoji} {f.name}</span>
                  <input
                    type="number"
                    step="0.01"
                    value={splitValues[id] || ''}
                    onChange={(e) =>
                      setSplitValues((prev) => ({ ...prev, [id]: e.target.value }))
                    }
                    placeholder={
                      splitType === 'percentage' ? '%' : splitType === 'shares' ? 'shares' : '₹'
                    }
                    className="flex-1 bg-white border border-ink/10 rounded-lg px-3 py-2 text-sm outline-none focus:border-zest"
                  />
                </div>
              )
            })}
          </div>
        )}

        {numericAmount > 0 && participants.length > 0 && (
          <div className="mt-4 ticket p-3 text-xs text-ink-light/60 space-y-1">
            {participants.map((id) => {
              const f = FRIENDS.find((fr) => fr.id === id)
              return (
                <div key={id} className="flex justify-between">
                  <span>{f.name}</span>
                  <span className="font-medium text-ink">₹{(previewSplits[id] || 0).toFixed(2)}</span>
                </div>
              )
            })}
          </div>
        )}

        {formError && <p className="text-sm text-coral mt-4">{formError}</p>}

        <button
          type="submit"
          disabled={saving}
          className="w-full mt-6 bg-zest hover:bg-zest/90 disabled:opacity-50 text-white font-display font-semibold py-4 rounded-ticket transition-colors"
        >
          {saving ? 'Saving…' : 'Save expense'}
        </button>
      </form>
    </div>
  )
}
