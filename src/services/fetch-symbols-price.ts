import { networkRequest, safePromise } from "../utils";

export default async function fetchSymbolsPrice(tickerList: any[], fromDate: string) {
  if (!tickerList || !fromDate) {
    throw new Error('tickerList and fromDate is required!');
  }

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `https://stock-daily-price.vercel.app/get_stock_data`,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      symbols: tickerList,
      start_date: fromDate,
    },
  };

  let [error, response] = await safePromise(networkRequest(config));

  if (error) {
    throw error
  }

  return response;
};