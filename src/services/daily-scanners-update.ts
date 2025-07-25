import db from "../db";
import { logger, safePromise } from "../utils";
import concurrentlyScrapStocks from "./concurrently-scrap-stocks";
import initilizeBrowser from "./puppeteer/initilize-browser";
import fetchFinCode from "./fetch-fin-code";
import { writeFile } from "fs/promises";
import path from "path";

const log = logger("dailyScanners", null);
const { SearchTerm, Scanners, Symbol, DailyScanData } = db.models;

export default async function dailyScanners() {
    let [searchTermsError, searchTerms] = await safePromise(SearchTerm.findAll({
        where: {
        }, attributes: ["id", "term"], raw: true
    }));

    if (searchTermsError) {
        log.error(searchTermsError);
        return;
    }

    if (!searchTerms.length) {
        log.error("searchTerm is empty!");
        return;
    }

    const [browserError, browser] = await safePromise(initilizeBrowser());

    if (browserError) {
        log.error(browserError);
        return;
    }

    const [symbolsError, symbols] = await safePromise(Symbol.findAll({ attributes: ["id", "symbol", "stock_name"], raw: true }));

    if (symbolsError) {
        log.error(symbolsError);
        return;
    }


    for (const searchTerm of searchTerms) {
        const [scannersError, scanners] = await safePromise(Scanners.findAll({ where: { search_term_id: searchTerm.id }, attributes: ["id", "link"], raw: true }));

        if (scannersError) {
            log.error(scannersError);
            return;
        }

        if (scanners && !scanners.length) {
            // fetch urlfor scanners        
            // scanners = await scapeScanners();
            // insert it in database  
            continue;
        }

        if (scanners.length) {
            const normalizeScannersLink = scanners.map((s: { [key: string]: any }) => s.link);
            let [stocksError, stocks] = await safePromise(concurrentlyScrapStocks(normalizeScannersLink, browser));

            if (stocksError) {
                log.error(stocksError);
                return;
            }

            await writeFile(path.resolve(__dirname, `../public/${searchTerm.term}.json`), JSON.stringify(stocks), "utf-8");

            stocks = JSON.parse(JSON.stringify(stocks));

            if (Object.keys(stocks).length) {
                let sKey: string, sArr: any;
                for ([sKey, sArr] of Object.entries(stocks)) {
                    const scannerObj: any = scanners.find((s: any) => s.link === sKey);
                    const scannerId = scannerObj.id;

                    const ticker_list = [];

                    for (const sObj of sArr) {
                        const name = sObj["name"];
                        const symbol = sObj["symbol"];

                        const symObj = symbols.find((a: any) => a.stock_name === name && a.symbol === symbol);

                        let symbolId;

                        if (!symObj) {
                            const finCode = await fetchFinCode(symbol);

                            const payload: any = {
                                symbol: symbol,
                                stock_name: name,
                                fin_code: finCode || null,
                            };

                            const [symbolCreatebError, symbolcreate] = await safePromise(Symbol.create(payload));

                            if (symbolCreatebError) {
                                log.error('symbolCreatebError', symbolCreatebError);
                            }

                            payload.id = symbolcreate.dataValues.id;
                            symbols.push(payload);
                            symbolId = symbolcreate.dataValues.id;
                        } else {
                            symbolId = symObj.id;
                        }


                        ticker_list.push(+symbolId);
                    }

                    const dailyScanPayload: any = {
                        scanner_id: scannerId,
                        ticker_list: ticker_list
                    }

                    const [createScanError] = await safePromise(
                        DailyScanData.create(dailyScanPayload)
                    );

                    if (createScanError) {
                        log.error(createScanError);
                    }
                }
            }
        }
    }

    const [closeBrowserError] = await safePromise(browser.close());

    if (closeBrowserError) {
        log.error(closeBrowserError);
        return;
    }
}