import { useState } from 'react'
import { useApp } from './contexts/AppContext'
import { useGroupData } from './utils/useGroupData'
import ProfilePicker from './components/ProfilePicker'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import ExpenseList from './components/ExpenseList'
import ExpenseForm from './components/ExpenseForm'
import Charts from './components/Charts'
import Settings from './components/Settings'

export default function App() {
  const { currentUser } = useApp()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showExpenseForm, setShowExpenseForm] = useState(false)

  const {
    expenses,
    settlements,
    loading,
    error,
    addExpense,
    deleteExpense,
    addSettlement,
  } = useGroupData()

  if (!currentUser) return <ProfilePicker />

  return (
    <div className="min-h-screen bg-cloud">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {error && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="bg-coral/10 text-coral text-sm p-3 rounded-xl">
            Couldn't connect to Firebase: {error}. Check your .env config.
          </div>
        </div>
      )}

      {loading ? (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center text-ink-light/50">Loading…</div>
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <Dashboard
              expenses={expenses}
              settlements={settlements}
              addSettlement={addSettlement}
              onAddExpense={() => setShowExpenseForm(true)}
            />
          )}
          {activeTab === 'expenses' && (
            <ExpenseList expenses={expenses} deleteExpense={deleteExpense} />
          )}
          {activeTab === 'charts' && <Charts expenses={expenses} />}
          {activeTab === 'settings' && <Settings />}
        </>
      )}

      {showExpenseForm && (
        <ExpenseForm onClose={() => setShowExpenseForm(false)} onSave={addExpense} />
      )}
    </div>
  )
}
