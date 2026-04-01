import { dashboardService } from "../services/dashboard.service";
import { json } from "../utils/json";

export const dashboardController = {
  summary: () =>
    json({
      status: "ok",
      data: dashboardService.getSummary()
    })
};
