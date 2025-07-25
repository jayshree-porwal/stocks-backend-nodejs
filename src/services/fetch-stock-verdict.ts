import { networkRequest, safePromise } from "../utils";

export default async function fetchStockVerdict (finCode: number | string)  {
    const url = `https://api.univest.in/resources/stock-details/${+finCode}/`;

    let [error, response] = await safePromise(
      networkRequest({
        url,
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
    );
  
    if (error) {
      throw error;
    }
    
    return response;
};
