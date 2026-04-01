import { importsController } from "../controllers/imports.controller";

export const handleImportsRoute = (pathname: string) => {
  if (pathname === "/api/transactions/import") {
    return importsController.create();
  }

  return null;
};
