import { transactionService } from "../services/transaction.service";
import { json } from "../utils/json";

export const transactionsController = {
  list: () =>
    json({
      status: "ok",
      data: transactionService.listTransactions()
    })
};
