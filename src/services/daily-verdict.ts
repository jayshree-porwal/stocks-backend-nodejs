import moment from "moment-timezone";

import db from "../db";
import { safePromise, logger } from "../utils";
import { dailyPrice, fetchStockVerdict } from ".";

const { StockVerdict, Symbol, DailyPrice } = db.models;
const log = logger("cron:fetchVerdict", null);

const delay = (delayInms: number) => {
  return new Promise((resolve) => setTimeout(resolve, delayInms));
};

export default async function dailyVerdict() {
  const [verdictError, verdictData] = await safePromise(
    StockVerdict.findAll({
      include: [
        {
          model: Symbol,
          required: true,
          as: "symbol",
        },
      ],
      raw: true,
      attributes: [
        "id",
        "symbol.symbol",
        "symbol.fin_code",
        "long_term",
        "short_term",
        "verdict_price",
        "previous_verdict",
        "verdict_change_date",
      ],
    })
  );

  if (verdictError) {
    log.error(verdictError);
  }

  const transformedObject = verdictData.reduce((result: { [key: string]: any }, item: { [key: string]: any }) => {
    result[item.fin_code] = {
      id: item.id,
      symbol: item.symbol,
      long_term: item.long_term,
      short_term: item.short_term,
      verdict_price: item.verdict_price,
      previous_verdict: item.previous_verdict,
      verdict_change_date: item.verdict_change_date,
    };
    return result;
  }, {});

  const [dailyPriceErr, dailyPriceData] = await safePromise(DailyPrice.findAll({ raw: true, attributes: ["stock_id"] }));
  const transformDailPriceData = dailyPriceData.map((el: { stock_id: number; }) => el.stock_id);
  const [symbolsError, symbols] = await safePromise(Symbol.findAll({ raw: true, attributes: ["id", "fin_code"] }));
  if (symbols && symbols.length) {
    for (const symbolObj of symbols) {
      if (symbolObj.fin_code === "null") {
        continue;
      }
      const [errorVerdict, verdictResult] = await safePromise(fetchStockVerdict(symbolObj.fin_code));

      if (errorVerdict) {
        continue;
      }
      if (transformedObject[symbolObj.fin_code]) {
        if (transformDailPriceData.includes(+symbolObj.id)) {
          const data = {
            price: verdictResult.nseLtpPrice || 1,
          };
          const [updateError, updatedData] = await safePromise(
            DailyPrice.update(data, {
              where: {
                stock_id: +symbolObj.id,
              },
            })
          );
          if (updateError) {
            log.error(`${updateError.message || updateError}`);
          }
        } else {
          const data: any = {
            stock_id: +symbolObj.id,
            price: verdictResult.nseLtpPrice || 1,
          };
          const [insertError, searchTerms] = await safePromise(DailyPrice.create(data));
          if (insertError) {
            log.error(`${insertError.message || insertError}`);
          }
        }

        if (
          verdictResult.shortTermVerdict !== transformedObject[symbolObj.fin_code]["short_term"] ||
          verdictResult.longTermVerdict !== transformedObject[symbolObj.fin_code]["long_term"]
        ) {
          const updateData: any = {
            short_term: verdictResult.shortTermVerdict || "",
            previous_verdict: transformedObject[symbolObj.fin_code]["short_term"] || "",
            verdict_price: verdictResult.ltpPriceShortDate || "",
            verdict_change_date: verdictResult.shortTermVerdictChangeTime
              ? moment.unix(verdictResult.shortTermVerdictChangeTime).format("YYYY-MM-DD")
              : "",
            long_term: verdictResult.longTermVerdict || "",
            long_verdict_price: verdictResult.ltpPriceLongDate || "",
            long_verdict_change_date: verdictResult.longTermVerdictChangeTime
              ? moment.unix(verdictResult.longTermVerdictChangeTime).format("YYYY-MM-DD")
              : "",
          };

          const [updateError, updatedData] = await safePromise(
            StockVerdict.update(updateData, {
              where: {
                id: transformedObject[symbolObj.fin_code]["id"],
              },
            })
          );
          if (updateError) {
            log.error(`${updateError.message || updateError}`);
            continue;
          }
          log.info(`Updated ${symbolObj.fin_code}`);
        }
      } else {
        if (verdictResult && verdictResult.shortTermVerdict) {
          const data: any = {
            stock_id: symbolObj.id,
            short_term: verdictResult.shortTermVerdict || "",
            previous_verdict: verdictResult.shortTermVerdict || "",
            verdict_price: verdictResult.ltpPriceShortDate || "",
            verdict_change_date: verdictResult.shortTermVerdictChangeTime
              ? moment.unix(verdictResult.shortTermVerdictChangeTime).format("YYYY-MM-DD")
              : "",
            long_term: verdictResult.longTermVerdict || "",
            long_verdict_price: verdictResult.ltpPriceLongDate || "",
            long_verdict_change_date: verdictResult.longTermVerdictChangeTime
              ? moment.unix(verdictResult.longTermVerdictChangeTime).format("YYYY-MM-DD")
              : "",
          };
          const [insertError, searchTerms] = await safePromise(StockVerdict.create(data));
          if (insertError) {
            log.error(`${insertError.message || insertError}`);
            continue;
          }
          log.info(`Added ${symbolObj.fin_code}`);
        }
      }
    }

    log.info("completed");
  }
}
