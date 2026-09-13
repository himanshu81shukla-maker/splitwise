// Uses the Gemini API to read a receipt photo and pull out structured data.
// Gemini reads the image directly and returns JSON, which is more reliable
// than regex-parsing raw OCR text.

const MODEL = 'gemini-3.6-flash'

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export async function scanReceipt(file, apiKey) {
  if (!apiKey) {
    throw new Error('No Gemini API key configured. Add it in Settings.')
  }

  const base64Image = await fileToBase64(file)

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'Read this receipt image. Respond with ONLY a JSON object (no markdown, no extra text) in this exact shape: {"amount": number or null, "merchant": string or null, "date": "YYYY-MM-DD" or null}. "amount" is the final total paid. If a field cannot be determined, use null.',
              },
              {
                inline_data: {
                  mime_type: file.type || 'image/jpeg',
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          response_mime_type: 'application/json',
        },
      }),
    }
  )

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err?.error?.message || 'Gemini API request failed')
  }

  const data = await response.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new Error('Gemini did not return a readable response for this receipt.')
  }

  let parsed
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Could not parse the receipt data returned by Gemini.')
  }

  return {
    amount: typeof parsed.amount === 'number' ? parsed.amount : null,
    merchant: parsed.merchant || null,
    date: parsed.date || null,
  }
}
