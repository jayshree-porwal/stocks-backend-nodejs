import { CronJob } from "cron";
import { findStocksNearSupport } from "../services";
import { logger, safePromise } from "../utils";
import config from "../config";

const { STOCKS_NEAR_SUPPORT_CRON_EXPRESSION } = config;

const log = logger("cron:stocks-analysis", null);

export default function stocksNearSupportCron() {
  // Create a cron job
  const Cron = new CronJob(
    STOCKS_NEAR_SUPPORT_CRON_EXPRESSION,
    async () => {
      log.info("started");

      const [dailyVerdictError] = await safePromise(findStocksNearSupport());

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
