import { Page } from 'puppeteer';
import moment from 'moment-timezone';

import { safePromise } from '../../utils';

export default async (url: string, page: Page) => {
    const [visitError] = await safePromise(
        page.goto(url, {
            waitUntil: 'networkidle2',
        })
    );

    if (visitError) {
        await page.reload();
    }

    const [processingWaitError] = await safePromise(
        page.waitForSelector(`#DataTables_Table_0_processing`, {
            hidden: true,
        })
    );

    if (processingWaitError) {
        await page.reload();
        await page.waitForSelector(`#DataTables_Table_0_processing`, {
            hidden: true,
        });
    }

    const textContent = await page.evaluate(() => {
        return document.querySelector('#DataTables_Table_0 > tbody > tr')!.textContent;
    });

    if (
        [
            `No stocks filtered in the Scan`,
            '1/2/3 minute Realtime Scans are available for Premium members',
        ].includes(textContent!)
    ) {
        return;
    }

    const scrapedArr: any = await page.evaluate(() => {
        const headers = Array.from(
            document.querySelectorAll('#DataTables_Table_0 thead th')
        ).map((th: any) => th.textContent.trim());

        const rows = Array.from(
            document.querySelectorAll('#DataTables_Table_0 tbody tr')
        );

        return rows.map((row) => {
            const rowData: { [key: string]: any } = {};
            const tds: any = row.querySelectorAll('td');

            for (let i = 0; i < headers.length; i++) {
                rowData[headers[i]] = tds[i].textContent.trim();
            }

            return rowData;
        });
    });

    if (typeof scrapedArr == 'undefined') return;
    if (!Array.isArray(scrapedArr) && !scrapedArr.length) return;

    const dateNow = moment().tz('Asia/Kolkata').format('DD/MM/YYYY HH:mm ddd');

    const normalizedArr = []

    for (const stock of scrapedArr) {
        normalizedArr.push({
            name: stock['Stock Name'],
            symbol: stock['Symbol'],
            [dateNow]: {
                price: stock['Price'],
                change: stock['% Chg'],
            },
        })
    }

    return normalizedArr;
};