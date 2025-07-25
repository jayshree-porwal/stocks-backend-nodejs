import priceCron from "./price";
import scannersCron from "./scanner";
import verdictCron from "./verdict";
import stockReversalCron from "./stock-reversal";
import stocksNearSupportCron from "./stocks";

export default function cronJobs() {
  // priceCron();
  verdictCron();
  stockReversalCron();
  stocksNearSupportCron();
  // scannersCron();
}
