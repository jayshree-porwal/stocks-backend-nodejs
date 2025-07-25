import express, { Router, Request, Response, NextFunction } from 'express';

import db from "../db";
import safePromise from "../utils/safe-promise";

const router: Router = express.Router();

router.get('/', async function (req: Request, res: Response, next: NextFunction) {
    const dbQuery = `
  SELECT
    ranked.verdict_change_date,
    ranked.symbol,
    ranked.stock_name,
    ranked.short_term,
    ranked.previous_verdict,
    ranked.verdict_price,
    ranked.long_term,
    ranked.long_verdict_price,
    ranked.long_verdict_change_date,
    ranked.price,
    ROUND(((ranked.price - ranked.verdict_price) / ranked.price) * 100, 2) AS change_percentage
FROM (
    SELECT
        v.verdict_change_date,
        v.short_term,
        v.long_term,
        v.long_verdict_price,
        v.long_verdict_change_date,
        v.previous_verdict,
        s.symbol,
        s.stock_name,
        dp.price,
        dp.date,
        v.verdict_price,
        RANK() OVER (PARTITION BY s.id ORDER BY dp.date DESC) AS r
    FROM
        stock_verdict AS v
    INNER JOIN symbol AS s ON v.stock_id = s.id
    INNER JOIN daily_price AS dp ON dp.stock_id = s.id
    WHERE
        v.short_term IN ('Sell', 'Hold', 'Buy')
) ranked
WHERE
    ranked.r = 1
ORDER BY
    ranked.verdict_change_date DESC, ranked.short_term = 'Buy' DESC, ranked.symbol;
    `;

    const [error, result] = await safePromise(db.connection.query(dbQuery, { type: db.QueryTypes.SELECT }));

    if (error) {
        console.log("db error", error);
        return res.json({ success: false, res: "verdict api" });
    }

    return res.json({ success: true, res: result });
});

export default router;

