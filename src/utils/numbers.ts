export function fix(number: string, decimal?: number) {
  return decimal ? parseFloat(number).toFixed(decimal) : number;
}
