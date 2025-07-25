import { Browser, launch } from "puppeteer";
import config from "../../config";

const { CHROME_PATH, PRODUCTION } = config;

export default (): Promise<Browser> => {

    const con: any = {
        headless: 'new',
        ignoreDefaultArgs: ['--enable-automation',],
        defaultViewport: null,
        args: ["--no-sandbox", '--window-size=1920,1080', '--disable-infobars', '--mute-audio'],
    }

    if (PRODUCTION == "true") {
        con.executablePath = CHROME_PATH
    }


    return launch(con);
}