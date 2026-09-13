import { useMemo, useState } from 'react'
import { FRIENDS, getFriend } from '../utils/friends'
import { computeNetBalances, simplifyDebts } from '../utils/splitCalculations'
import { useApp } from '../contexts/AppContext'
import SettleUpModal from './SettleUpModal'

export default function Dashboard({ expenses, settlements, addSettlement, onAddExpense }) {
  const { currentUser } = useApp()
  const [settleTarget, setSettleTarget] = useState(null)

  const netBalances = useMemo(() => computeNetBalances(expenses, settlements), [expenses, settlements])
  const transactions = useMemo(() => simplifyDebts(netBalances), [netBalances])

  const myBalance = netBalances[currentUser] || 0
  const isPositive = myBalance >= 0

  const myTransactions = transactions.filter(
    (t) => t.from === currentUser || t.to === currentUser
  )

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      {/* Hero balance */}
      <div className="mb-8">
        <p className="text-ink-light/60 font-medium mb-1">Your overall balance</p>
        <div className="flex items-baseline gap-3">
          <h2
            className={`font-display text-5xl font-bold ${
              isPositive ? 'text-teal' : 'text-coral'
            }`}
          >
            {isPositive ? '+' : '−'}₹{Math.abs(myBalance).toFixed(2)}
          </h2>
        </div>
        <p className="text-sm text-ink-light/50 mt-1">
          {isPositive ? "You're owed money overall" : 'You owe money overall'}
        </p>
      </div>

      {/* Add expense button */}
      <button
        onClick={onAddExpense}
        className="w-full mb-8 bg-zest hover:bg-zest/90 text-white font-display font-semibold py-4 rounded-ticket text-lg shadow-md shadow-zest/20 transition-colors"
      >
        + Add an expense
      </button>

      {/* Friend chips */}
      <div className="mb-8">
        <h3 className="font-display font-semibold text-ink mb-3">Everyone's balance</h3>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {FRIENDS.filter((f) => f.id !== currentUser).map((friend) => {
            const bal = netBalances[friend.id] || 0
            return (
              <div
                key={friend.id}
                className="flex-shrink-0 flex flex-col items-center gap-1.5 bg-white rounded-ticket px-4 py-3 border border-ink/5 min-w-[92px]"
              >
                <span
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${friend.color}22` }}
                >
                  {friend.emoji}
                </span>
                <span className="text-xs font-medium text-ink-light/70">{friend.name}</span>
                <span
                  className={`text-sm font-display font-semibold ${
                    bal >= 0 ? 'text-teal' : 'text-coral'
                  }`}
                >
                  {bal >= 0 ? '+' : '−'}₹{Math.abs(bal).toFixed(0)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Suggested settle-ups */}
      <div>
        <h3 className="font-display font-semibold text-ink mb-3">Suggested settle-ups</h3>
        {myTransactions.length === 0 ? (
          <div className="ticket p-6 text-center text-ink-light/50">
            All settled up. Nothing to pay or collect. 🎉
          </div>
        ) : (
          <div className="space-y-3">
            {myTransactions.map((t, i) => {
              const from = getFriend(t.from)
              const to = getFriend(t.to)
              const iOwe = t.from === currentUser
              return (
                <div key={i} className="ticket p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span>{from.emoji}</span>
                    <span className="font-medium">{from.name}</span>
                    <span className="text-ink-light/40">owes</span>
                    <span>{to.emoji}</span>
                    <span className="font-medium">{to.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-display font-semibold">₹{t.amount.toFixed(2)}</span>
                    {iOwe && (
                      <button
                        onClick={() => setSettleTarget(t)}
                        className="text-xs bg-ink text-white px-3 py-1.5 rounded-full hover:bg-ink-light transition-colors"
                      >
                        Settle
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {settleTarget && (
        <SettleUpModal
          transaction={settleTarget}
          onClose={() => setSettleTarget(null)}
          onConfirm={async (amount) => {
            await addSettlement({ from: settleTarget.from, to: settleTarget.to, amount })
            setSettleTarget(null)
          }}
        />
      )}
    </div>
  )
}
