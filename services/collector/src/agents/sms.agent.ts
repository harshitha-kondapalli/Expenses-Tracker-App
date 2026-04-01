import { parseSmsMessage } from "../parsers/sms.parser";
import { normalizeTransaction } from "../normalizers/transaction.normalizer";

export const smsAgent = {
  name: "sms-agent",
  collect(message: string) {
    return normalizeTransaction(
      {
        ...parseSmsMessage(message),
        paymentMethod: "UPI"
      },
      "sms"
    );
  }
};
