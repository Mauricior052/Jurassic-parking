export const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});


export const formatCurrency = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '$0.00';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '$0.00';
  
  return currencyFormatter.format(num);
};

