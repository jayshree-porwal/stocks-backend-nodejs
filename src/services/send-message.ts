import TelegramBot from "node-telegram-bot-api";
import config from "../config";
const { TELEGRAM_TOKEN, CHAT_ID } = config.TELEGRAM;

const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

export default async function sendMessage(message: string) {
  const messageText = message;
  const chatIdsArray = CHAT_ID.split(",");
  for (let userId of chatIdsArray) {
    bot
      .sendMessage(userId, messageText, { parse_mode: "HTML" })
      .then(() => {})
      .catch((error: any) => {
        console.error("Error sending message to the bot itself:", error);
      });
  }
}
