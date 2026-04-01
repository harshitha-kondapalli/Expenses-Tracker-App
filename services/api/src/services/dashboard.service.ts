import { buildDashboardSummary } from "@expenses/shared";
import { transactionService } from "./transaction.service";

export const dashboardService = {
  getSummary: () => buildDashboardSummary(transactionService.listTransactions())
};
