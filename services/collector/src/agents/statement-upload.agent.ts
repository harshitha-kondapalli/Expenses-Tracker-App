import { parseStatementRow } from "../parsers/bank-statement.parser";
import { normalizeTransaction } from "../normalizers/transaction.normalizer";

export const statementUploadAgent = {
  name: "statement-upload-agent",
  collect(row: Record<string, string>) {
    return normalizeTransaction(
      {
        ...parseStatementRow(row),
        paymentMethod: "Other"
      },
      "statement_upload"
    );
  }
};
