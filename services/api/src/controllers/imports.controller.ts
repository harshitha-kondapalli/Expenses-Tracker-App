import { json } from "../utils/json";

export const importsController = {
  create: () =>
    json({
      status: "ok",
      data: {
        message: "Import pipeline placeholder created. Next step is wiring statement upload, SMS, or email ingestion."
      }
    })
};
