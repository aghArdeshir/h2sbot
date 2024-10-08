import { readFileSync, writeFileSync } from "fs";
import { notifyHomes } from "./notifyHomes.mjs";

const HOMES_THAT_WE_DONT_WANT_FILE = "homesThatWeDontWant.txt";
const MINIMUM_LIVING_AREA = Number(process.env.MINIMUM_LIVING_AREA);
const MAXIMUM_PRICE = Number(process.env.MAXIMUM_PRICE);

export function processHomes(homes) {
  // just in case, for debugging
  writeFileSync("homes.json", JSON.stringify(homes, null, 2));

  console.log(
    "filtering out homes that was already processed in previous runs"
  );

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

  let namesOfHomesThatAreTooSmall = [];
  if (MINIMUM_LIVING_AREA) {
    namesOfHomesThatAreTooSmall = homes
      .filter((home) => {
        return home.living_area <= MINIMUM_LIVING_AREA;
      })
      .map((home) => {
        return home.name;
      });
  }

  let namesOfHomesThatAreTooExpensive = [];
  if (MAXIMUM_PRICE) {
    namesOfHomesThatAreTooExpensive = homes
      .filter((home) => {
        return home.basic_rent >= MAXIMUM_PRICE;
      })
      .map((home) => {
        return home.name;
      });
  }

  const aggregatedNamesOfHomesThatWeDontWant = [
    ...namesOfExistingHomesThatWeDontWant,
    ...namesOfHomesThatAreTooSmall,
    ...namesOfHomesThatAreTooExpensive,
  ].filter((name, index, self) => {
    // remove duplicates
    return self.indexOf(name) === index;
  });

  writeFileSync(
    HOMES_THAT_WE_DONT_WANT_FILE,
    aggregatedNamesOfHomesThatWeDontWant.join("\n")
  );

  console.log("preparing list of homes to notify by email");
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
