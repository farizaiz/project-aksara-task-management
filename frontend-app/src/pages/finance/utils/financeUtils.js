export const formatRupiah = (number) => {
  if (number === undefined || number === null) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(number);
};

export const calculateProgress = (spent, budget) => {
  if (!budget || budget === 0) return 0;
  const progress = (spent / budget) * 100;
  return progress > 100 ? 100 : progress;
};
