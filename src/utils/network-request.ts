import axios from "axios";

export default async function networkRequest({ url, method, body, headers, maxBodyLength }: { url: string; method?: string; body?: { [key: string]: any }; headers?: { [key: string]: any }; maxBodyLength?: any; }) {
    const options: any = {
        url: url,
        method: method || "GET",
    };

    if (body) {
        options.data = body;
    }

    if (headers) {
        options.headers = headers;
    }

    if(maxBodyLength) {
        options.maxBodyLength = maxBodyLength;
    }

    try {
        const result = await axios(options);
        return result.data;
    } catch (error: any) {
        throw error;
    }
}

