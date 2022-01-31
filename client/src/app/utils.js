// Random number function
export function randomNumber(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}
