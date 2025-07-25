import moment from "moment-timezone";
import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

import db from "../db";
import { safePromise, logger, networkRequest } from "../utils";

const { StockReversalData } = db.models;
const log = logger("cron:fetchStockReversal", null);

// Function to process each ticker
async function processTicker(ticker: string) {
  const url = "https://stock-daily-price.vercel.app/get-reversal-data";

  let [error, response] = await safePromise(
    networkRequest({
      url,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        ticker: `${ticker}.NS`,
        start_date: "2023-10-01",
        volume_start_date: "2023-08-01",
      },
    })
  );

  if (error) {
    log.error(`Error processing ticker ${ticker}:`, error);
    return;
  } else {
    log.info(`Response for ticker ${ticker}:`, response);

    const stockData = {
      stock_id: 1,
      stock_name: ticker,
      reversal_points: response.reversal_points,
      sma20: response["20SMA"],
      sma50: response["50SMA"],
      sma200: response["200SMA"],
      avg_volume_uptrend: response["avg_volume_uptrend"],
      avg_volume_downtrend: response["avg_volume_downtrend"],
      volume_ratio_higher: response["percentage_higher"],
      change_time: moment.tz("Asia/Kolkata").toDate(),
    };

    const [findOneError, existingData] = await safePromise(
      StockReversalData.findOne({
        where: {
          stock_name: ticker,
        },
      })
    );

    if (findOneError) {
      log.error(`${findOneError.message || findOneError}`);
      return;
    }

    if (existingData) {
      const [updateError, updateResponse] = await safePromise(StockReversalData.update(stockData, { where: { stock_name: ticker } }));
      if (updateError) {
        log.error(`Error updating ticker ${ticker}:`, updateError);
      }
      return updateResponse;
    }

    const [createError, createResponse] = await safePromise(StockReversalData.create(stockData));
    if (createError) {
      log.error(`Error creating ticker ${ticker}:`, createError);
    }
    return createResponse;
  }
}

export default async function fetchStockReversalData() {
  fs.readFile(path.resolve(__dirname, "stocksList.json"), "utf8", async (err, data) => {
    if (err) {
      console.error("Error reading the file:", err);
      return;
    }
    try {
      const jsonData = JSON.parse(data);

      for (let stock of jsonData.companies) {
        await processTicker(stock);
      }
    } catch (err) {
      console.error(`Error parsing JSON:`, err);
    }
  });
}
