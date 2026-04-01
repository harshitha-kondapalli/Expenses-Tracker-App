import { parseEmailAlert } from "../parsers/email.parser";
import { normalizeTransaction } from "../normalizers/transaction.normalizer";

export const emailAgent = {
  name: "email-agent",
  collect(subject: string, body: string) {
    return normalizeTransaction(
      {
        ...parseEmailAlert(subject, body),
        paymentMethod: "Card"
      },
      "email"
    );
  }
};
