const etbFormatter = new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' })

export function formatEtb(amount) {
  return etbFormatter.format(Number(amount))
}
