import { FRIENDS } from '../utils/friends'
import { useApp } from '../contexts/AppContext'

export default function ProfilePicker() {
  const { setCurrentUser } = useApp()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-cloud">
      <div className="max-w-md w-full text-center mb-10">
        <h1 className="font-display text-4xl font-bold text-ink mb-2">Who's this?</h1>
        <p className="text-ink-light/70">Pick your name to see the group's tab.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-md w-full">
        {FRIENDS.map((friend) => (
          <button
            key={friend.id}
            onClick={() => setCurrentUser(friend.id)}
            className="flex flex-col items-center gap-3 p-6 rounded-ticket bg-white border-2 border-ink/5 hover:border-zest hover:-translate-y-1 transition-all shadow-sm"
          >
            <span
              className="w-16 h-16 rounded-full flex items-center justify-center text-3xl"
              style={{ backgroundColor: `${friend.color}22` }}
            >
              {friend.emoji}
            </span>
            <span className="font-display font-semibold text-ink">{friend.name}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
