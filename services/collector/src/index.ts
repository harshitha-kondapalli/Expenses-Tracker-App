import { emailAgent } from "./agents/email.agent";
import { smsAgent } from "./agents/sms.agent";
import { statementUploadAgent } from "./agents/statement-upload.agent";

const examples = [
  smsAgent.collect("Paid Rs 320 to Swiggy on 2026-03-29 via UPI"),
  emailAgent.collect("Card payment successful at Amazon", "Your card ending 4242 was charged INR 1499."),
  statementUploadAgent.collect({
    reference: "stmt-1",
    date: "2026-03-26T06:00:00.000Z",
    description: "Metro recharge",
    merchant: "Metro",
    amount: "200"
  })
];

console.log("Collector scaffold ready.");
console.log(JSON.stringify(examples, null, 2));
