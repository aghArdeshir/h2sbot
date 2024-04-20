import puppeteer from "puppeteer";
import "./setup-env.mjs";
import { processHomes } from "./processHomes.mjs";

const HEADLESS = true;
const URL = process.env.URL;

const unimportantUrlsChunks = [
  "favicon",
  "pages/locations",
  "pages/comingsoon",
  "pages/about",
  "pages/blog",
  "pages/faq",
  "trustpilot",
  "image-manager",
  "availablestartdate",
  "image/svg+xml",
  "pictures",
  "floorplans",
  "hotjar",
  "static/media",
  "images",
  "chatbase",
  "googletagmanager",
  "webfonts",
];

async function main() {
  console.log();
  console.log();
  console.log();
  console.log(new Date());
  console.log("booting up");

  const browser = await puppeteer.launch({ headless: HEADLESS });
  const page = await browser.newPage();

  page.setRequestInterception(true);
  page.on("request", async (request) => {
    if (request.isInterceptResolutionHandled()) return;

    const requestUrl = request.url();
    for (const urlChunk of unimportantUrlsChunks) {
      if (requestUrl.includes(urlChunk)) {
        request.abort();
        return;
      }
    }
    request.continue();
  });

  await page.goto(URL);

  // so sometimes we can debug
  await page.setViewport({ width: 1920, height: 1080 });

  // close the browser after 20 seconds in case it is not closed
  const closePageTimeout = setTimeout(() => {
    console.log("browser was not closed in 20 seconds, closing it now...");
    browser.close();
  }, 20000);

  console.log("navigated to the page");

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
      console.log("homes found, processing...");
      processHomes(homes);

      console.log("closing browser");
      await browser.close();
      clearTimeout(closePageTimeout);
    }
  });
}

main();
