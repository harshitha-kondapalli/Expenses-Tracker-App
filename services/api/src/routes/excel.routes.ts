import { excelController } from "../controllers/excel.controller";

export const handleExcelRoute = (pathname: string) => {
  if (pathname === "/api/excel/status") {
    return excelController.status();
  }

  return null;
};
