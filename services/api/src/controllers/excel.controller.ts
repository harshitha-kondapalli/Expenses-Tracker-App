import { excelService } from "../services/excel.service";
import { json } from "../utils/json";

export const excelController = {
  status: () =>
    json({
      status: "ok",
      data: excelService.exportStatus()
    })
};
