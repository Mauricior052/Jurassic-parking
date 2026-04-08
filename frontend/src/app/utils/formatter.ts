
export const formatCurrency = (value: number | string | null | undefined, decimals: number = 2): string => {
  if (value === null || value === undefined || value === '') return '$0';
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) return '$0';
  
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};
