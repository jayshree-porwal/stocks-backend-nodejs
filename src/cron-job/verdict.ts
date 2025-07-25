import { CronJob } from "cron";
import { dailyVerdict } from "../services";
import { logger, safePromise } from "../utils";
import config from "../config";

const { VERDICT_CRON_EXPRESSION } = config;

const log = logger("cron:verdict", null);

export default function verdictCron() {
  // Create a cron job
  const Cron = new CronJob(
    VERDICT_CRON_EXPRESSION,
    async () => {
      log.info("started");

      const [dailyVerdictError] = await safePromise(dailyVerdict());

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
