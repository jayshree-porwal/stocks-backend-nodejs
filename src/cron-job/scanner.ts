import { CronJob } from "cron";
import {  dailyScanners } from "../services";
import { logger, safePromise } from "../utils";
import config from "../config";

const { SCANNER_CRON_EXPRESSION
} = config;

const log = logger("cron:scanners", null);

export default function scannersCron() {
  // Create a cron job
  const Cron = new CronJob(
    SCANNER_CRON_EXPRESSION,
    async () => {
      log.info("started");

      const [dailyScannersError] = await safePromise(dailyScanners());

      if (dailyScannersError) {
        log.error(dailyScannersError);
      }
      log.info("complete");
    },
    null,
    true,
    `Asia/Kolkata`
  );
  Cron.start();
}
