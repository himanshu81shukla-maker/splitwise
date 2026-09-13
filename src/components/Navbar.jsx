import { getFriend } from '../utils/friends'
import { useApp } from '../contexts/AppContext'

const TABS = [
  { id: 'dashboard', label: 'Home' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'charts', label: 'Charts' },
  { id: 'settings', label: 'Settings' },
]

export default function Navbar({ activeTab, setActiveTab }) {
  const { currentUser, setCurrentUser } = useApp()
  const me = getFriend(currentUser)

  return (
    <div className="sticky top-0 z-20 bg-ink text-white">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
        <h1 className="font-display font-bold text-lg tracking-tight">Splitwise 🧾</h1>
        <button
          onClick={() => setCurrentUser(null)}
          className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 rounded-full pl-1 pr-3 py-1 transition-colors"
        >
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-sm"
            style={{ backgroundColor: `${me?.color}55` }}
          >
            {me?.emoji}
          </span>
          {me?.name}
        </button>
      </div>
      <div className="max-w-2xl mx-auto px-4 flex gap-1 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-zest text-white'
                : 'border-transparent text-white/50 hover:text-white/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
