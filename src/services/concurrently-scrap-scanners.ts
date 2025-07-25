import pLimit from "p-limit";
import { Browser } from "puppeteer";
import scrapStockslist from "./puppeteer/scrap-stockslist";
import { groupArrayIntoChunks, safePromise } from "../utils";
import config from "../config";

const { SCRAP_SCANNERS_CONCURRENCY } = config;

export default async (searchTerm: string, browser: Browser) => {
    let scannerArr: any[] = [];

    const arrOf1to100 = Array.from({ length: 100 }, (_, index) => index + 1);
    const limit = pLimit(SCRAP_SCANNERS_CONCURRENCY);

    const arrayOfArrays = groupArrayIntoChunks(arrOf1to100, SCRAP_SCANNERS_CONCURRENCY);

    for (const array of arrayOfArrays) {
        await Promise.all(
            array.map((pageNos: number) =>
                limit(async () => {
                    const [pageError, page] = await safePromise(browser.newPage());

                    if (pageError) {
                        console.log("pageError", pageError);
                        return;
                    }

                    const url = `https://chartink.com/screeners/search?search_term=${searchTerm}&page=${pageNos}`;
                    const [urlsError, urls] = await safePromise(scrapStockslist(url, page));

                    if (urlsError) {
                        console.log("urlsError", urlsError);
                        return;
                    }

                    scannerArr = [...scannerArr, ...urls];

                    const [pageCloseError] = await safePromise(page.close());

                    if (pageCloseError) {
                        console.log("pageCloseError", pageCloseError);
                        return;
                    }
                })
            )
        );
    }

    return scannerArr;
};