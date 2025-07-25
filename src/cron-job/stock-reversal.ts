import { CronJob } from "cron";
import { fetchStockReversalData } from "../services";
import { logger, safePromise } from "../utils";
import config from "../config";

const { STOCK_REVERSAL_CRON_EXPRESSION } = config;

const log = logger("cron:reversal", null);

export default function stockReversalCron() {
  // Create a cron job
  const Cron = new CronJob(
    STOCK_REVERSAL_CRON_EXPRESSION,
    async () => {
      log.info("started");

      const [dailyVerdictError] = await safePromise(fetchStockReversalData());

      if (dailyVerdictError) {
        log.error(dailyVerdictError);
      }
      log.info("completed");
    },
    null,
    true,
    `Asia/Kolkata`
  );
  Cron.start();
}
