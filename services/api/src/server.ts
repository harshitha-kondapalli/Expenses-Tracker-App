import { handleDashboardRoute } from "./routes/dashboard.routes";
import { handleExcelRoute } from "./routes/excel.routes";
import { handleImportsRoute } from "./routes/imports.routes";
import { handleTransactionsRoute } from "./routes/transactions.routes";
import { json } from "./utils/json";

const port = Number(process.env.PORT ?? 4000);

const routeHandlers = [
  handleTransactionsRoute,
  handleDashboardRoute,
  handleImportsRoute,
  handleExcelRoute
];

const bunRuntime =
  typeof Bun !== "undefined" && typeof Bun.serve === "function" ? Bun : null;

const server = bunRuntime
  ? bunRuntime.serve({
      port,
      fetch(request) {
        const { pathname } = new URL(request.url);

        for (const handler of routeHandlers) {
          const response = handler(pathname);
          if (response) {
            return response;
          }
        }

        return json(
          {
            status: "error",
            data: {
              message: "Route not found"
            }
          },
          { status: 404 }
        );
      }
    })
  : null;

if (server) {
  console.log(`Expense API listening on http://localhost:${port}`);
} else {
  console.log("API scaffold created. Add an HTTP runtime next, or replace this entry with Express/Fastify.");
}
