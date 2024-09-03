import "./setup-env.mjs";
import { processHomes } from "./processHomes.mjs";
import { fetchDataByCurl } from "./with-curl.mjs";

async function main() {
  console.log();
  console.log();
  console.log();
  console.log(new Date());
  console.log("booting up");

  let homes = [];
  const { items, pageInfo } = await fetchDataByCurl();

  homes = items;

  if (homes.length > 0) {
    console.log(homes.length, "homes found, processing...");
    processHomes(homes);

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }
}

main();
