export const buildFinancialLogData = (financial_log, donation) => ({
  ...financial_log,
  id_doacao: donation.id_doacao,
  mecena_nif_nipc: donation.mecena_nif_nipc,
});
