// Basic implementation of the SuperMemo-2 (SM-2) algorithm
export interface SM2Data {
  interval: number
  easeFactor: number
  repetitions: number
}

export function calculateSM2(
  quality: number, // 0-5 (0: complete blackout, 5: perfect response)
  repetitions: number,
  previousInterval: number,
  previousEaseFactor: number,
  multiplier: number = 1.0,
): SM2Data {
  let interval = 0
  let easeFactor = previousEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

  if (easeFactor < 1.3) easeFactor = 1.3

  if (quality < 3) {
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0) {
      interval = 1
    } else if (repetitions === 1) {
      interval = 6
    } else {
      interval = Math.round(previousInterval * easeFactor * multiplier)
    }
    repetitions++
  }

  return { interval, easeFactor, repetitions }
}

export function getNextReviewDate(intervalDays: number): number {
  const date = new Date()
  date.setDate(date.getDate() + intervalDays)
  return date.getTime()
}
