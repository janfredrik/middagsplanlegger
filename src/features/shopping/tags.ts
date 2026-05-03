export const SHOPPING_TAGS = [
  { key: 'trumf', label: 'Trippel Trumf', emoji: '💚' },
  { key: 'naa', label: 'Nå', emoji: '⭐' },
  { key: 'tilbud', label: 'Tilbud', emoji: '💰' },
] as const

export type ShoppingTagKey = typeof SHOPPING_TAGS[number]['key']
