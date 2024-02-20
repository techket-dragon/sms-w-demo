export function calcPresent(times: number) {
  return times
}

export function calcAbsent(times: number) {
  return Math.max(0, 15 - times * 5)
}

export function calcLate(times: number) {
  return Math.max(0, 10 - times * 5)
}

export function calcLightStatus(totalScore: number) {
  let lightStatus = 'Black';

  if (totalScore >= 70) {
    lightStatus = 'Green';
  } else if (totalScore >= 50) {
    lightStatus = 'Yellow';
  } else if (totalScore >= 30) {
    lightStatus = 'Red';
  }

  return lightStatus
}