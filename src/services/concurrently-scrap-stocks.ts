import pLimit from 'p-limit';
import { Browser } from 'puppeteer';
import scrapStockslist from './puppeteer/scrap-stockslist';
import { groupArrayIntoChunks, logger, safePromise } from '../utils';
import config from '../config';

const log = logger("scrapstocks", null);
const { SCRAP_STOCKS_CONCURRENCY } = config;

export default async (array: any[], browser: Browser) => {
  const scannerStocksMap: { [key: string]: any } = {};
  const limit = pLimit(SCRAP_STOCKS_CONCURRENCY);

  const arrayOfArrays = groupArrayIntoChunks(array, SCRAP_STOCKS_CONCURRENCY);

  for (const array of arrayOfArrays) {
    await Promise.all(
      array.map((url: string) =>
        limit(async () => {
          const [pageError, page] = await safePromise(browser.newPage());

          if (pageError) {
            log.error(pageError);
            return;
          }

          const [scrapedStockListError, scrapedStockList] = await safePromise(
            scrapStockslist(url, page)
          );

          if (scrapedStockListError) {
            log.error(scrapedStockListError);
            const [pageCloseError] = await safePromise(page.close());

            if (pageCloseError) {
              log.error(pageCloseError);
              return;
            }
            return;
          }

          if (scannerStocksMap[url] && scannerStocksMap[url].length) {
            scannerStocksMap[url] = [
              ...scannerStocksMap[url],
              ...scrapedStockList,
            ];
          } else {
            scannerStocksMap[url] = scrapedStockList;
          }

          const [pageCloseError] = await safePromise(page.close());

          if (pageCloseError) {
            log.error(pageCloseError);
            return;
          }
        })
      )
    );
  }

  return scannerStocksMap;
};
