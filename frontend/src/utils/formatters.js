export const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

export const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('pt-BR');
};

export const formatDateInput = (value) => {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 16);
};

export const getStatusLabel = (status) => {
  const labels = {
    scheduled: 'Agendado',
    in_progress: 'Em andamento',
    completed: 'Concluido',
    canceled: 'Cancelado',
  };

  return labels[status] || status;
};
