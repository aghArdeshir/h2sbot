import { readFileSync, writeFileSync } from "fs";
import { notifyHomes } from "./notifyHomes.mjs";

const MINIMUM_LIVING_AREA = process.env.MINIMUM_LIVING_AREA; // TODO: Move to .env
const HOMES_THAT_WE_DONT_WANT_FILE = "homesThatWeDontWant.txt";

export function processHomes(homes) {
  // just in case, for debugging
  writeFileSync("homes.json", JSON.stringify(homes, null, 2));

  console.log("filtering out homes that was already processed in previous runs");
  let namesOfExistingHomesThatWeDontWant;
  try {
    namesOfExistingHomesThatWeDontWant = readFileSync(
      HOMES_THAT_WE_DONT_WANT_FILE,
      {
        encoding: "utf-8",
      }
    ).split("\n");
  } catch {
    namesOfExistingHomesThatWeDontWant = [];
  }

  const namesOfNewHomesThatWeDontWant = homes
    .filter((home) => {
      return Number(home.living_area) < MINIMUM_LIVING_AREA;
    })
    .map((home) => {
      return home.name;
    });

  const aggregatedNamesOfHomesThatWeDontWant = [
    ...namesOfExistingHomesThatWeDontWant,
    ...namesOfNewHomesThatWeDontWant,
  ].filter((name, index, self) => {
    return self.indexOf(name) === index;
  });

  writeFileSync(
    HOMES_THAT_WE_DONT_WANT_FILE,
    aggregatedNamesOfHomesThatWeDontWant.join("\n")
  );

  console.log('preparing list of homes to notify by email')
  const homesToNotify = homes
    .filter((home) => {
      return !aggregatedNamesOfHomesThatWeDontWant.includes(home.name);
    })
    .map((home) => {
      return {
        name: home.name,
        living_area: home.living_area,
        basic_rent: home.basic_rent,
        link: "https://holland2stay.com/residences/" + home.url_key + ".html",
      };
    });

  // also add these new homes to homes we dont want, so next time we dont send
  // these homes again enxt time
  writeFileSync(
    HOMES_THAT_WE_DONT_WANT_FILE,
    aggregatedNamesOfHomesThatWeDontWant
      .concat(
        homesToNotify.map((home) => {
          return home.name;
        })
      )
      .join("\n")
  );

  console.log("notifying homes");
  notifyHomes(homesToNotify);
}
