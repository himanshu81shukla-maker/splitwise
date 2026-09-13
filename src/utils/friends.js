// The 6 friends in this group. Edit names here if the group changes.
export const FRIENDS = [
  { id: 'himanshu', name: 'Himanshu', color: '#FF6B35', emoji: '🦊' },
  { id: 'sakha', name: 'Sakha', color: '#0E7C7B', emoji: '🐢' },
  { id: 'priyansh', name: 'Priyansh', color: '#FF4D6D', emoji: '🐙' },
  { id: 'ayush', name: 'Ayush', color: '#C4F135', emoji: '🐝' },
  { id: 'adarsh', name: 'Adarsh', color: '#7B5CFA', emoji: '🐯' },
  { id: 'utkarsh', name: 'Utkarsh', color: '#00B8D9', emoji: '🐬' },
]

export function getFriend(id) {
  return FRIENDS.find((f) => f.id === id)
}

export const CATEGORIES = [
  { id: 'food', label: 'Food & Drinks', emoji: '🍔' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'rent', label: 'Rent & Bills', emoji: '🏠' },
  { id: 'groceries', label: 'Groceries', emoji: '🛒' },
  { id: 'fun', label: 'Entertainment', emoji: '🎬' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
  { id: 'other', label: 'Other', emoji: '📦' },
]
