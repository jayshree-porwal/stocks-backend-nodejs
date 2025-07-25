import { CronJob } from "cron";
import { dailyPrice } from "../services";
import { logger, safePromise } from "../utils";
import config from "../config";

const { PRICE_CRON_EXPRESSION } = config;

const log = logger("cron:price", null);

export default function priceCron() {
  // Create a cron job
  const Cron = new CronJob(
    PRICE_CRON_EXPRESSION,
    async () => {

      log.info("started");

      const [dailyPriceError] = await safePromise(dailyPrice());

      if (dailyPriceError) {
        log.error(dailyPriceError);
      }

      log.info("complete");
    },
    null,
    true,
    `Asia/Kolkata`
  );
  Cron.start();
}
