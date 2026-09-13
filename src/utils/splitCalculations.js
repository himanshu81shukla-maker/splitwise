import { FRIENDS } from './friends'

/**
 * Given an expense's split config, return { friendId: amountOwed } for
 * every participant. `amount` is the total expense amount.
 *
 * splitType: 'equal' | 'exact' | 'percentage' | 'shares'
 * participants: array of friend ids included in the split
 * splitValues: map of friendId -> raw input value (exact amount, %, or share count)
 *   ignored entirely when splitType === 'equal'
 */
export function computeSplits(amount, splitType, participants, splitValues = {}) {
  const result = {}
  if (!participants.length) return result

  if (splitType === 'equal') {
    const share = amount / participants.length
    participants.forEach((id) => {
      result[id] = round2(share)
    })
    // Fix rounding drift by adjusting the last participant
    fixRoundingDrift(result, amount, participants)
    return result
  }

  if (splitType === 'exact') {
    participants.forEach((id) => {
      result[id] = round2(Number(splitValues[id]) || 0)
    })
    return result
  }

  if (splitType === 'percentage') {
    participants.forEach((id) => {
      const pct = Number(splitValues[id]) || 0
      result[id] = round2((pct / 100) * amount)
    })
    fixRoundingDrift(result, amount, participants)
    return result
  }

  if (splitType === 'shares') {
    const totalShares = participants.reduce(
      (sum, id) => sum + (Number(splitValues[id]) || 0),
      0
    )
    if (totalShares === 0) return result
    participants.forEach((id) => {
      const shares = Number(splitValues[id]) || 0
      result[id] = round2((shares / totalShares) * amount)
    })
    fixRoundingDrift(result, amount, participants)
    return result
  }

  return result
}

function round2(n) {
  return Math.round(n * 100) / 100
}

// Ensures the sum of splits exactly equals the total (fixes floating point drift)
function fixRoundingDrift(result, amount, participants) {
  const sum = participants.reduce((s, id) => s + (result[id] || 0), 0)
  const drift = round2(amount - sum)
  if (drift !== 0 && participants.length) {
    const lastId = participants[participants.length - 1]
    result[lastId] = round2((result[lastId] || 0) + drift)
  }
}

export function validateSplitSum(amount, splitType, participants, splitValues) {
  if (splitType === 'exact') {
    const sum = participants.reduce((s, id) => s + (Number(splitValues[id]) || 0), 0)
    return Math.abs(sum - amount) < 0.01
  }
  if (splitType === 'percentage') {
    const sum = participants.reduce((s, id) => s + (Number(splitValues[id]) || 0), 0)
    return Math.abs(sum - 100) < 0.01
  }
  return true
}

/**
 * Compute net balance for every friend across all expenses + settlements.
 * Positive balance = the group owes them. Negative = they owe the group.
 */
export function computeNetBalances(expenses, settlements) {
  const net = {}
  FRIENDS.forEach((f) => (net[f.id] = 0))

  expenses.forEach((exp) => {
    // Payer is owed the full amount
    net[exp.paidBy] = (net[exp.paidBy] || 0) + exp.amount
    // Each participant owes their split
    Object.entries(exp.splits || {}).forEach(([friendId, owed]) => {
      net[friendId] = (net[friendId] || 0) - owed
    })
  })

  settlements.forEach((s) => {
    // "from" paid "to" — reduces from's debt, reduces to's credit
    net[s.from] = (net[s.from] || 0) + s.amount
    net[s.to] = (net[s.to] || 0) - s.amount
  })

  Object.keys(net).forEach((id) => (net[id] = round2(net[id])))
  return net
}

/**
 * Debt simplification: given net balances, produce the minimum set of
 * transactions that settles everyone up. Greedy match largest creditor
 * with largest debtor repeatedly.
 */
export function simplifyDebts(netBalances) {
  const creditors = []
  const debtors = []

  Object.entries(netBalances).forEach(([id, balance]) => {
    if (balance > 0.01) creditors.push({ id, amount: balance })
    else if (balance < -0.01) debtors.push({ id, amount: -balance })
  })

  creditors.sort((a, b) => b.amount - a.amount)
  debtors.sort((a, b) => b.amount - a.amount)

  const transactions = []
  let ci = 0
  let di = 0

  while (ci < creditors.length && di < debtors.length) {
    const credit = creditors[ci]
    const debt = debtors[di]
    const settleAmount = round2(Math.min(credit.amount, debt.amount))

    if (settleAmount > 0.01) {
      transactions.push({ from: debt.id, to: credit.id, amount: settleAmount })
    }

    credit.amount = round2(credit.amount - settleAmount)
    debt.amount = round2(debt.amount - settleAmount)

    if (credit.amount <= 0.01) ci++
    if (debt.amount <= 0.01) di++
  }

  return transactions
}
