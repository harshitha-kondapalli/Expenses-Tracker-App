import { transactionsController } from "../controllers/transactions.controller";

export const handleTransactionsRoute = (pathname: string) => {
  if (pathname === "/api/transactions") {
    return transactionsController.list();
  }

  return null;
};
