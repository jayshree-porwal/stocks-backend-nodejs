import moment from "moment-timezone";
import * as fs from "fs";
import * as path from "path";

import db from "../db";
import { safePromise, logger, networkRequest } from "../utils";
import sendMessage from "./send-message";

const { StockReversalData, StockReversalDataScan, Symbol } = db.models;
const log = logger("service:stocks-analysis", null);

const cacheFilePath = path.join(__dirname, "stockReportCache.json");

// Load cache from file
const loadCache = () => {
  if (fs.existsSync(cacheFilePath)) {
    const data = fs.readFileSync(cacheFilePath, "utf8");
    return JSON.parse(data);
  }
  return {};
};

// Save cache to file
const saveCache = (cache: any) => {
  fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2), "utf8");
};

function isNearReversalOrSMA(ticker: string, stockData: any, cmp: any, tolerancePercentage = 3) {
  if (!stockData) {
    log.error(`No stockData found: ${ticker}`);
    return;
  }

  const { reversal_points, sma20, sma50, sma200 } = stockData;

  // Convert SMA values to numbers
  const sma20Value = parseFloat(sma20);
  const sma50Value = parseFloat(sma50);
  const sma200Value = parseFloat(sma200);

  const isNearCrossover =
    (Math.abs(sma20 - sma50) / sma20 <= tolerancePercentage && sma20 > sma50) ||
    (Math.abs(sma20 - sma200) / sma20 <= tolerancePercentage && sma20 > sma200) ||
    (Math.abs(sma50 - sma200) / sma50 <= tolerancePercentage && sma50 > sma200);

  // Check each reversal point
  for (const [point, count] of reversal_points) {
    const reversalPoint = point;
    const tolerance = reversalPoint * (tolerancePercentage / 100);

    if (cmp >= reversalPoint - tolerance && cmp <= reversalPoint + tolerance) {
      return {
        verdict: `REVERSAL_POINT::::CMP::${cmp} is near ${reversalPoint} with tolerance ${tolerance.toFixed(
          2
        )} - Crossover: ${isNearCrossover}`,
        cmp,
      };
    }
  }

  // Check SMA20, SMA50, and SMA200
  const smaValues = [sma50Value, sma200Value];
  const smaNames = ["SMA50", "SMA200"];

  for (let i = 0; i < smaValues.length; i++) {
    const smaValue = smaValues[i];
    const smaName = smaNames[i];
    const tolerance = smaValue * (tolerancePercentage / 100);

    if (cmp >= smaValue - tolerance && cmp <= smaValue + tolerance) {
      return {
        verdict: `SMA::::CMP::${cmp} is near ${smaName} ${smaValue} with tolerance ${tolerance.toFixed(2)} - Crossover: ${isNearCrossover}`,
        cmp,
      };
    }
  }

  return;
}

interface ProcessStockResult {
  verdict: string;
  cmp: any;
}

async function processStock(ticker: string, stocksData: any) {
  const url = `https://stock-daily-price.vercel.app/get_stock_data`;

  let [error, response] = await safePromise(
    networkRequest({
      url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        symbols: [`${ticker}.NS`],
        date: moment().tz("Asia/Kolkata").format("YYYY-MM-DD"),
      },
    })
  );

  if (error) {
    log.error(`Error processing ticker ${ticker}:`, error);
    return;
  }

  if (response[ticker]) {
    return isNearReversalOrSMA(ticker, stocksData, response[ticker]["latest_price"], 2);
  }
  return;
}

async function fetchStockTrend(url: string) {
  let [error, response] = await safePromise(
    networkRequest({
      url,
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
  );

  if (error) {
    log.error(`Error processing ticker ${url}:`, error);
    return;
  }
  return response;
}

export default async function findStocksNearSupport() {
  // Initialize the cache from the file
  let stockReportCache = loadCache();

  const ttlDays = 14;
  const currentTime = moment();

  const verdictUrl: string = "http://ec2-3-7-146-199.ap-south-1.compute.amazonaws.com/api/verdict";
  fs.readFile(path.resolve(__dirname, "stocksList.json"), "utf8", async (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return;
    }
    try {
      let [finaAllError, stocksData] = await safePromise(StockReversalData.findAll({ raw: true }));

      if (finaAllError) {
        log.error(`${finaAllError.message || finaAllError}`);
        return;
      }

      const stockObject = stocksData.reduce((acc: any, item: any) => {
        const { stock_name, ...rest } = item;
        acc[stock_name] = rest;
        return acc;
      }, {});

      let [symbolError, symbolData] = await safePromise(Symbol.findAll({ raw: true }));
      if (symbolError) {
        log.error(`${symbolError.message || symbolError}`);
        return;
      }

      const symbolObject = symbolData.reduce((acc: any, item: any) => {
        const { symbol, ...rest } = item;
        acc[symbol] = rest;
        return acc;
      }, {});

      let [verdictError, verdictData] = await safePromise(
        networkRequest({
          url: verdictUrl,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        })
      );

      if (verdictError) {
        log.error(`Error while fetching verdictData:`, verdictError);
        return;
      }

      const jsonData = JSON.parse(data);

      const stockScanData = [];

      for (let stock of jsonData.companies) {
        const result: ProcessStockResult | undefined = await processStock(stock, stockObject[stock]);
        if (result && result.verdict && result.cmp) {
          const lastReportDate = stockReportCache[stock];

          if (!lastReportDate || currentTime.diff(moment(lastReportDate), "days") > ttlDays) {
            // Update the cache with the current time
            stockReportCache[stock] = currentTime.toISOString();

            const stockVerdict = verdictData["res"].find((element: any) => {
              return element.symbol === stock;
            });

            stockScanData.push({ name: stock, price: result.cmp, verdict: stockVerdict ? stockVerdict["short_term"] : null });

            let stockTrend: any;
            if (symbolObject[stock]) {
              stockTrend = await fetchStockTrend(
                `https://api.univest.in/resources/stock-details/stock-verdict/${symbolObject[stock]["fin_code"]}`
              );

              stockTrend = stockTrend?.data?.list?.trendList?.map(
                (el: any) => `${el.header}: ${el.pattern === "UP" ? " ✅" : " ❌"}\n`
              );
            }
            console.log(stockTrend);
            const message = `<b>${stock}</b>\n\n<i>${result.verdict}</i>\n\nVolumes:\nUptrend: ${
              stockObject[stock]["avg_volume_uptrend"]
            }\nDowntrend: ${stockObject[stock]["avg_volume_downtrend"]}\nRatio: ${
              stockObject[stock]["volume_ratio_higher"]
            }%\n\nFundamental_Verdict:\n${stockTrend?.join("")}\nVerdict:\nshortTerm: ${
              stockVerdict ? stockVerdict["short_term"] : null
            }\npreviousVerdict: ${stockVerdict ? stockVerdict["previous_verdict"] : null}\n\n<b>Time:</b> <i>${moment()
              .utcOffset("+05:30")
              .format("YYYY-MM-DD HH:mm A")}</i>\n`;

            await sendMessage(message);
          }
        }
      }
      const [createError, createResponse] = await safePromise(StockReversalDataScan.create({ ticker_list: stockScanData }));
      if (createError) {
        log.error(`Error creating scan data`, createError);
      }
      // Save the updated cache to the file
      saveCache(stockReportCache);
    } catch (err) {
      log.error(`Error parsing JSON:`, err);
    }
  });
}
