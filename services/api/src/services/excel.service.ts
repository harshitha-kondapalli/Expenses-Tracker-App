import path from "node:path";

const excelPath = path.resolve(process.cwd(), "data/expenses.xlsx");

export const excelService = {
  getWorkbookPath: () => excelPath,
  exportStatus: () => ({
    workbookPath: excelPath,
    sheets: ["transactions", "category_rules", "monthly_summary"],
    note: "Excel generation will be implemented once XLSX integration is added."
  })
};
