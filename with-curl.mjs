import { execSync } from "child_process";

export async function fetchDataByCurl() {
  let page = 1;

  let curl = `curl -s -S 'https://api.holland2stay.com/graphql/' \\
    -H 'accept: */*' \\
    -H 'accept-language: en-US,en;q=0.9,fa;q=0.8' \\
    -H 'content-type: application/json' \\
    -H 'origin: https://holland2stay.com' \\
    -H 'priority: u=1, i' \\
    -H 'referer: https://holland2stay.com/' \\
    -H 'sec-ch-ua: "Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"' \\
    -H 'sec-ch-ua-mobile: ?0' \\
    -H 'sec-ch-ua-platform: "Linux"' \\
    -H 'sec-fetch-dest: empty' \\
    -H 'sec-fetch-mode: cors' \\
    -H 'sec-fetch-site: same-site' \\
    -H 'user-agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36' \\
    --data-raw $'{"operationName":"GetCategories","variables":{"currentPage":${page},"filters":{"available_to_book":{"eq":"179"},"category_uid":{"eq":"Nw=="}},"pageSize":10,"sort":{"available_startdate":"ASC"}},"query":"query GetCategories($pageSize: Int\u0021, $currentPage: Int\u0021, $filters: ProductAttributeFilterInput\u0021, $sort: ProductAttributeSortInput) {  products(    pageSize: $pageSize    currentPage: $currentPage    filter: $filters    sort: $sort  ) {    ...ProductsFragment    __typename  }}fragment ProductsFragment on Products {  sort_fields {    options {      label      value      __typename    }    __typename  }  aggregations {    label    count    attribute_code    options {      label      count      value      __typename    }    position    __typename  }  items {    name    sku    city    url_key    available_to_book    available_startdate    next_contract_startdate    current_lottery_subscribers    building_name    finishing    living_area    no_of_rooms    resident_type    offer_text_two    offer_text    maximum_number_of_persons    type_of_contract    price_analysis_text    allowance_price    floor    basic_rent    lumpsum_service_charge    inventory    caretaker_costs    cleaning_common_areas    energy_common_areas    energy_label    minimum_stay    allowance_price    small_image {      url      label      position      disabled      __typename    }    thumbnail {      url      label      position      disabled      __typename    }    image {      url      label      position      disabled      __typename    }    media_gallery {      url      label      position      disabled      __typename    }    price_range {      minimum_price {        regular_price {          value          currency          __typename        }        final_price {          value          currency          __typename        }        discount {          amount_off          percent_off          __typename        }        __typename      }      maximum_price {        regular_price {          value          currency          __typename        }        final_price {          value          currency          __typename        }        discount {          amount_off          percent_off          __typename        }        __typename      }      __typename    }    __typename  }  page_info {    total_pages    __typename  }  total_count  __typename}"}'`;

  function fetchData() {
    const responseAsString = execSync(curl).toString();
    const responseAsJson = JSON.parse(responseAsString);
    const reponse = responseAsJson.data.products;
    const items = reponse.items;
    const pageInfo = reponse.page_info;
    return { items, pageInfo };
  }

  let { items, pageInfo } = fetchData();

  console.log({ pageInfo , page});

  while (pageInfo.total_pages > page) {
    page++;
    curl = curl.replace(`currentPage":${page - 1}`, `currentPage":${page}`);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const { items: newItems, pageInfo: newPageInfo } = fetchData();
    items = [...items, ...newItems];
  }

  return { items, pageInfo };
}
