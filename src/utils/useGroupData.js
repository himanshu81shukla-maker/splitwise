import { useEffect, useState } from 'react'
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../firebase'

// Single shared group — all 6 friends read/write the same collections.
const EXPENSES_COL = 'expenses'
const SETTLEMENTS_COL = 'settlements'

export function useGroupData() {
  const [expenses, setExpenses] = useState([])
  const [settlements, setSettlements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const expensesQuery = query(collection(db, EXPENSES_COL), orderBy('createdAt', 'desc'))
    const unsubExpenses = onSnapshot(
      expensesQuery,
      (snap) => {
        setExpenses(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      }
    )

    const settlementsQuery = query(collection(db, SETTLEMENTS_COL), orderBy('createdAt', 'desc'))
    const unsubSettlements = onSnapshot(settlementsQuery, (snap) => {
      setSettlements(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    })

    return () => {
      unsubExpenses()
      unsubSettlements()
    }
  }, [])

  async function addExpense(expense) {
    await addDoc(collection(db, EXPENSES_COL), {
      ...expense,
      createdAt: serverTimestamp(),
    })
  }

  async function updateExpense(id, updates) {
    await updateDoc(doc(db, EXPENSES_COL, id), updates)
  }

  async function deleteExpense(id) {
    await deleteDoc(doc(db, EXPENSES_COL, id))
  }

  async function addSettlement(settlement) {
    await addDoc(collection(db, SETTLEMENTS_COL), {
      ...settlement,
      createdAt: serverTimestamp(),
    })
  }

  async function deleteSettlement(id) {
    await deleteDoc(doc(db, SETTLEMENTS_COL, id))
  }

  return {
    expenses,
    settlements,
    loading,
    error,
    addExpense,
    updateExpense,
    deleteExpense,
    addSettlement,
    deleteSettlement,
  }
}
