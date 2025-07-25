import express, { Router, Request, Response, NextFunction } from 'express';

import db from "../db";
import safePromise from "../utils/safe-promise";
import moment from 'moment';
import { groupArrayIntoChunks } from '../utils';
import { fetchSymbolsPrice } from '../services';

const router: Router = express.Router();

router.get('/get-dates', async function (req: Request, res: Response, next: NextFunction) {
    const dbQuery = `SELECT created_at FROM stock_reversal_data_scan ORDER BY created_at DESC;`;

    const [error, result] = await safePromise(db.connection.query(dbQuery, { type: db.QueryTypes.SELECT }));

    if (error) {
        console.log("db error", error);
        return res.json({ success: false, res: "stock reversal api" });
    }

    return res.json({ success: true, res: result });
});

router.get('/get-data', async function (req: Request, res: Response, next: NextFunction) {
    const { created_at } = req.query;

    if (!created_at) {
        return res.json({ success: false, res: "created_at not present in query params." });
    }

    const onlyDate = moment(`${created_at}`).format('YYYY-MM-DD');

    const dbQuery = `SELECT * FROM stock_reversal_data_scan where created_at::text like '${onlyDate}%';`;

    const [error, result] = await safePromise(db.connection.query(dbQuery, { type: db.QueryTypes.SELECT }));

    if (error) {
        console.log("db error", error);
        return res.json({ success: false, res: "stock reversal data error" });
    }

    let tickerLists = result.map((row: { ticker_list: any; }) => row.ticker_list).flat();

    let chunkSize = 40;

    const groupedArray = groupArrayIntoChunks(
        tickerLists.map((s: any) => `${s.name}.NS`),
        chunkSize
    );

    let leatestPrices: any = {};

    const today = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');

    for (const symbolChunk of groupedArray) {
        const [fdError, fd] = await safePromise(
            fetchSymbolsPrice(symbolChunk, today)
        );

        if (fdError) {
            console.log("fdError", fdError);

            return res.json({ success: false, res: "failed to fetch leasted price" });
        }

        leatestPrices = { ...leatestPrices, ...fd }
    }

    tickerLists = tickerLists.map((ticker: any) => ({ symbol: ticker.name, verdict: ticker.verdict, day_price: ticker.price, latest_price: leatestPrices[ticker.name]?.close || '', change_percentage: ((leatestPrices[ticker.name]?.close - ticker.price)/ticker.price * 100).toFixed(2) || null }));

    return res.json({ success: true, res: tickerLists });
});

export default router;

