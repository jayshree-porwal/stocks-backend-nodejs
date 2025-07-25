import "dotenv/config";

const SCRAP_SCANNERS_CONCURRENCY: number = 10;
const SCRAP_STOCKS_CONCURRENCY: number = 20;

const PRICE_CRON_EXPRESSION: string = "36 16 * * 1-5";
const VERDICT_CRON_EXPRESSION: string = "00 17 * * 1-5";
const SCANNER_CRON_EXPRESSION: string = "00 17 * * 1-5";
const STOCK_REVERSAL_CRON_EXPRESSION: string = "00 18 * * 1-5";
const STOCKS_NEAR_SUPPORT_CRON_EXPRESSION: string = "05 15 * * 1-5";

const { PORT, PROTOCOL, DOMAIN, FLASK_SERVER_ENDPOINT, CHROME_PATH, PRODUCTION } = process.env;

const DB = {
  DB_NAME: process.env.DB_NAME,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_TYPE: process.env.DB_TYPE,
};

const TELEGRAM = {
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
  CHAT_ID: process.env.CHAT_ID,
};

const expo: { [key: string]: any } = {
  PORT,
  PROTOCOL,
  DOMAIN,
  DB,
  TELEGRAM,
  FLASK_SERVER_ENDPOINT,
  SCRAP_SCANNERS_CONCURRENCY,
  SCRAP_STOCKS_CONCURRENCY,
  CHROME_PATH,
  PRODUCTION,
  PRICE_CRON_EXPRESSION,
  VERDICT_CRON_EXPRESSION,
  SCANNER_CRON_EXPRESSION,
  STOCK_REVERSAL_CRON_EXPRESSION,
  STOCKS_NEAR_SUPPORT_CRON_EXPRESSION,
};

Object.keys(expo).forEach((key) => {
  if (!expo[key]) throw new Error(`⚠️ [Blog] Missing ${key} in .env file`);
});

export default expo;
