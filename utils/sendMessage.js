import dotenv from "dotenv";
import cli from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

dotenv.config();
const client = cli(accountSid, authToken);

export async function sendMessage(content, from, to) {
  const message = await client.messages.create({
    body: content,
    from,
    to,
  });

  console.log(`Message ${message.sid} sent`);
  return message.sid;
}
