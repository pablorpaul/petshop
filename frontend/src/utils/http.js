export const getErrorMessage = (error, fallback = 'Nao foi possivel concluir a operacao.') => {
  const responseMessage = error?.response?.data?.message;
  const firstValidation = error?.response?.data?.errors?.[0]?.msg;
  return responseMessage || firstValidation || error?.message || fallback;
};
