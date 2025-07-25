import { networkRequest, safePromise } from "../utils";

export default async function fetchFinCode (symbol: string)  {
  const url = `https://www.moneyworks4me.com/ajax/search?q=${symbol}`;

  let [error, response] = await safePromise(
    networkRequest({
      url, headers: {
        'Content-Type': 'application/json',
      },
    })
  );

  if (error) {
    console.log('fetchFinCode error', error);
    throw new Error('Unable to fetch Fin Code');
  }

  if (typeof response === 'undefined') {
    return;
  }

  if (response && response.length) {
    return response[1].assetcode || '';
  }

  return;
};