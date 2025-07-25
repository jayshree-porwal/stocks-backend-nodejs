import { groupArrayIntoChunks, logger, safePromise } from '../utils';
import db from '../db';
import fetchSymbolsPrice from './fetch-symbols-price';
import moment from 'moment-timezone';

const log = logger('cron:fetchVerdict', null);
const { Symbol, DailyPrice } = db.models;

export default async function dailyPrice() {
  const [symbolsError, symbols] = await safePromise(
    Symbol.findAll({ raw: true, attributes: ['id', 'symbol'] })
  );

  if (symbolsError) {
    log.error(symbolsError);
    throw new Error('symbolsError');
  }
  let chunkSize = 40;

  const groupedArray = groupArrayIntoChunks(
    symbols.map((s: any) => `${s.symbol}.NS`),
    chunkSize
  );

  for (const symbolChunk of groupedArray) {
    const today = moment().tz('Asia/Kolkata').format('YYYY-MM-DD');

    const [fdError, fd] = await safePromise(
      fetchSymbolsPrice(symbolChunk, today)
    );

    if (fdError) {
      log.error(fdError);
      throw new Error('fdError');
    }

    let timestamps: any, stockDO: any;
    for ([timestamps, stockDO] of Object.entries(fd)) {
      const date = new Date(+timestamps);
      const timestampsDate = date.toISOString().split('T')[0];

      let stockN: any, stockD: any;
      for ([stockN, stockD] of Object.entries(stockDO)) {
        const syObje: any = symbols.find(
          (item: any) => item.symbol === stockN.replace('.NS', '')
        );

        if (stockD['Adj Close'] === null) {
          continue;
        }

        const body: any = {
          stock_id: syObje.id,
          price: stockD['Adj Close'],
          price_change: stockD['Change'],
          date: timestampsDate,
        };
        const query = `SELECT id FROM daily_price AS daily_price WHERE daily_price.stock_id = ${body.stock_id} AND Date(daily_price.date) = '${body.date}' LIMIT 1;`;

        const [findError, find] = await safePromise(
          db.connection.query(query, { raw: true })
        );

        if (findError) {
          log.error(findError);
          throw new Error('findError');
        }

        if (!find[0].length) {
          const [createScanError] = await safePromise(DailyPrice.create(body));
          if (createScanError) {
            log.error(createScanError);
            throw new Error('createScanError');
          }
        } else {
          const [updateScanError] = await safePromise(DailyPrice.update(body, { where: { id: find[0][0].id } }));
          if (updateScanError) {
            log.error(updateScanError);
            throw new Error('updateScanError');
          }
        }
      }
    }
  }
}
