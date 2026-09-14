import { useRef, useState } from 'react'
import { scanReceipt } from '../utils/geminiApi'
import { useApp } from '../contexts/AppContext'

export default function ReceiptUpload({ onScanned, receiptFile, setReceiptFile }) {
  const { geminiApiKey } = useApp()
  const inputRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (!file) return

    setReceiptFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setError(null)
    setScanning(true)

    try {
      const result = await scanReceipt(file, geminiApiKey)
      onScanned(result)
    } catch (err) {
      setError(err.message || 'Could not read the receipt. You can still enter details manually.')
    } finally {
      setScanning(false)
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {!previewUrl ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full border-2 border-dashed border-ink/15 rounded-ticket py-6 flex flex-col items-center gap-2 text-ink-light/60 hover:border-zest hover:text-zest transition-colors"
        >
          <span className="text-2xl">📷</span>
          <span className="text-sm font-medium">Scan a receipt to autofill</span>
        </button>
      ) : (
        <div className="relative">
          <img src={previewUrl} alt="Receipt preview" className="w-full max-h-48 object-cover rounded-ticket" />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 bg-ink/80 text-white text-xs px-3 py-1.5 rounded-full"
          >
            Replace
          </button>
        </div>
      )}

      {scanning && (
        <p className="text-xs text-ink-light/50 mt-2 flex items-center gap-1.5">
          <span className="w-3 h-3 border-2 border-zest border-t-transparent rounded-full animate-spin" />
          Reading receipt…
        </p>
      )}
      {error && <p className="text-xs text-coral mt-2">{error}</p>}
    </div>
  )
}
