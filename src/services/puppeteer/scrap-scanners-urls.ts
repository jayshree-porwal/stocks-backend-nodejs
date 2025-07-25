import { Page } from 'puppeteer';
import { safePromise } from '../../utils';

export default async (page: Page, url: string) => {
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

    const urls = await page.evaluate(() => {
        const trs = Array.from(
            document.querySelectorAll(
                'body > div:nth-child(3) > div > div > table tr'
            )
        );
        return trs.map((tr) => {
            const tds: any = tr.querySelector('td a');
            return 'https://chartink.com' + tds.getAttribute('href');
        });
    });

    return urls;
};


