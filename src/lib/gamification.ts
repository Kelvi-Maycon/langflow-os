export const LEVEL_TIERS = [
  { name: 'Iniciante', threshold: 0 },
  { name: 'Básico', threshold: 150 },
  { name: 'Intermediário', threshold: 500 },
  { name: 'Avançado', threshold: 1200 },
  { name: 'Fluente', threshold: 3000 },
  { name: 'Mestre', threshold: 6000 },
]

export function getLevelTier(xp: number) {
  let current = LEVEL_TIERS[0]
  let next = LEVEL_TIERS[1]

  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_TIERS[i].threshold) {
      current = LEVEL_TIERS[i]
      next = LEVEL_TIERS[i + 1]
      break
    }
  }

  return { current, next }
}
