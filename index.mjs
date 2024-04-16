import { writeFileSync } from "fs";
import puppeteer from "puppeteer";

const HEADLESS = false;
const MINIMUM_LIVING_AREA = 35;
const URL =
  "https://holland2stay.com/residences?available_to_book%5Bfilter%5D=Available+to+book%2C179&price%5Bfilter%5D=0-1300%2C0_1300&page=1";

(async () => {
  const browser = await puppeteer.launch({ headless: HEADLESS });
  const page = await browser.newPage();
  await page.goto(URL);

  // so sometimes we can debug
  await page.setViewport({ width: 1920, height: 1080 });

  // close the browser after 20 seconds in case it is not closed
  const closePageTimeout = setTimeout(() => {
    browser.close();
  }, 20000);

  page.on("requestfinished", async (request) => {
    let responseAsJson;
    try {
      responseAsJson = await (await request.response()).json();
    } catch {
      // it really does not matter, because we are loking for responses that are
      // json
      // so empty catch justifies here
    }

    let homes = [];

    try {
      homes = responseAsJson.data.products.items ?? [];
    } catch {
      // it really does not matter, because we are loking for a particular
      // response that has homes in it
      // so empty catch justifies here
    }

    if (homes.length > 0) {
      writeFileSync("homes.json", JSON.stringify(homes, null, 2));
      await browser.close();
      clearTimeout(closePageTimeout);
    }
  });
})();
