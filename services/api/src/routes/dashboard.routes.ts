import { dashboardController } from "../controllers/dashboard.controller";

export const handleDashboardRoute = (pathname: string) => {
  if (pathname === "/api/dashboard/summary") {
    return dashboardController.summary();
  }

  return null;
};
