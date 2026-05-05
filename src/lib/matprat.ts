import { pb } from './pb'

const UNITS = 'kg|g|liter|l|dl|ml|ss|ts|stk\\.|stk|båt|neve|klype|pakke|pk\\.|boks|glass|skive|ark|kvast'
const INGREDIENT_RE = new RegExp(
  `^(?:ca\\.?\\s*)?(\\d+(?:[,.]\\d+)?(?:\\s*[-–]\\s*\\d+(?:[,.]\\d+)?)?)\\s*(${UNITS})?\\s*(.+?)(?:\\s*,\\s*(?:evt|gjerne|eller)\\..+)?$`,
  'i'
)

export function parseIngredient(raw: string): { name: string; quantity: string } {
  const s = raw.trim().replace(/^ca\.?\s*/i, '')
  const m = s.match(INGREDIENT_RE)
  if (m) {
    const [, amount, unit, rest] = m
    const quantity = unit ? `${amount} ${unit}`.trim() : amount.trim()
    return { quantity, name: rest.trim() }
  }
  return { quantity: '', name: s }
}

export function mapMatpratCategory(categories: string[], cuisine: string[]): string {
  const all = [...categories, ...cuisine].map((c) => c.toLowerCase())
  const has = (kw: string) => all.some((c) => c.includes(kw))
  if (has('asiatisk') || has('kinesisk') || has('japansk') || has('thai') || has('vietnamesisk') || has('koreansk')) return 'Asiatisk'
  if (has('fisk') || has('sjømat') || has('skalldyr')) return 'Fisk'
  if (has('italiensk') || has('pasta') || has('pizza') || has('risotto')) return 'Italiensk'
  if (has('meksikansk') || has('taco') || has('tex-mex')) return 'Meksikansk'
  if (has('indisk') || has('curry')) return 'Indisk'
  if (has('vegetar') || has('vegan')) return 'Vegetar'
  if (has('suppe') || has('gryte') || has('lapskaus')) return 'Suppe'
  if (has('salat')) return 'Salat'
  if (has('grill') || has('bbq')) return 'Grill'
  if (has('kylling')) return 'Kylling'
  return ''
}

interface MatpratRecipe {
  name: string
  ingredients: Array<{ name: string; quantity: string }>
  category: string
  sourceUrl: string
}

export async function fetchMatpratRecipe(url: string): Promise<MatpratRecipe> {
  const endpoint = `${pb.baseUrl}/api/fetch-recipe?url=${encodeURIComponent(url)}`
  const res = await fetch(endpoint)
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error ?? body.message ?? `HTTP ${res.status}`)

  return {
    name: body.name,
    ingredients: (body.ingredients as string[]).map(parseIngredient),
    category: mapMatpratCategory(body.categories ?? [], body.cuisine ?? []),
    sourceUrl: url,
  }
}
