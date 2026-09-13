import { useState } from 'react'
import { useApp } from '../contexts/AppContext'

export default function Settings() {
  const { geminiApiKey, setGeminiApiKey, setCurrentUser } = useApp()
  const [keyInput, setKeyInput] = useState(geminiApiKey)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setGeminiApiKey(keyInput.trim())
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6">
      <div className="ticket p-5">
        <h3 className="font-display font-semibold text-ink mb-1">Gemini API key</h3>
        <p className="text-xs text-ink-light/50 mb-3">
          Used to scan receipt photos and autofill expenses. Stored only in this browser, never
          committed to the repo.
        </p>
        <input
          type="password"
          value={keyInput}
          onChange={(e) => setKeyInput(e.target.value)}
          placeholder="AI Studio API key"
          className="w-full bg-white border border-ink/10 rounded-xl px-4 py-3 outline-none focus:border-zest text-sm"
        />
        <button
          onClick={handleSave}
          className="mt-3 bg-ink text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-ink-light transition-colors"
        >
          {saved ? 'Saved ✓' : 'Save key'}
        </button>
      </div>

      <div className="ticket p-5">
        <h3 className="font-display font-semibold text-ink mb-1">Switch profile</h3>
        <p className="text-xs text-ink-light/50 mb-3">Go back to the profile picker screen.</p>
        <button
          onClick={() => setCurrentUser(null)}
          className="text-sm font-medium px-5 py-2.5 rounded-full border border-ink/10 hover:bg-ink/5 transition-colors"
        >
          Switch profile
        </button>
      </div>
    </div>
  )
}
