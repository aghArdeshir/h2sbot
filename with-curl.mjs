import { execSync } from "child_process";

export async function fetchHomesFromH2s() {
  let page = 1;

  function _fetch(page) {
    let body =
      '{"operationName":"GetCategories","variables":{"currentPage":1,"filters":{"available_to_book":{"eq":"179"},"category_uid":{"eq":"Nw=="}},"pageSize":10,"sort":{"available_startdate":"ASC"}},"query":"query GetCategories($pageSize: Int!, $currentPage: Int!, $filters: ProductAttributeFilterInput!, $sort: ProductAttributeSortInput) {\\n  products(\\n    pageSize: $pageSize\\n    currentPage: $currentPage\\n    filter: $filters\\n    sort: $sort\\n  ) {\\n    ...ProductsFragment\\n    __typename\\n  }\\n}\\n\\nfragment ProductsFragment on Products {\\n  sort_fields {\\n    options {\\n      label\\n      value\\n      __typename\\n    }\\n    __typename\\n  }\\n  aggregations {\\n    label\\n    count\\n    attribute_code\\n    options {\\n      label\\n      count\\n      value\\n      __typename\\n    }\\n    position\\n    __typename\\n  }\\n  items {\\n    name\\n    sku\\n    city\\n    url_key\\n    available_to_book\\n    available_startdate\\n    next_contract_startdate\\n    current_lottery_subscribers\\n    building_name\\n    finishing\\n    living_area\\n    no_of_rooms\\n    resident_type\\n    offer_text_two\\n    offer_text\\n    maximum_number_of_persons\\n    type_of_contract\\n    price_analysis_text\\n    allowance_price\\n    floor\\n    basic_rent\\n    lumpsum_service_charge\\n    inventory\\n    caretaker_costs\\n    cleaning_common_areas\\n    energy_common_areas\\n    energy_label\\n    minimum_stay\\n    allowance_price\\n    small_image {\\n      url\\n      label\\n      position\\n      disabled\\n      __typename\\n    }\\n    thumbnail {\\n      url\\n      label\\n      position\\n      disabled\\n      __typename\\n    }\\n    image {\\n      url\\n      label\\n      position\\n      disabled\\n      __typename\\n    }\\n    media_gallery {\\n      url\\n      label\\n      position\\n      disabled\\n      __typename\\n    }\\n    price_range {\\n      minimum_price {\\n        regular_price {\\n          value\\n          currency\\n          __typename\\n        }\\n        final_price {\\n          value\\n          currency\\n          __typename\\n        }\\n        discount {\\n          amount_off\\n          percent_off\\n          __typename\\n        }\\n        __typename\\n      }\\n      maximum_price {\\n        regular_price {\\n          value\\n          currency\\n          __typename\\n        }\\n        final_price {\\n          value\\n          currency\\n          __typename\\n        }\\n        discount {\\n          amount_off\\n          percent_off\\n          __typename\\n        }\\n        __typename\\n      }\\n      __typename\\n    }\\n    __typename\\n  }\\n  page_info {\\n    total_pages\\n    __typename\\n  }\\n  total_count\\n  __typename\\n}"}';

    if (page) {
      body = body.replace(`"currentPage":1,`, `"currentPage":${page},`);
    }

    return fetch("https://api.holland2stay.com/graphql/", {
      headers: {
        accept: "*/*",
        "accept-language": "en-US,en;q=0.9,fa;q=0.8",
        "cache-control": "no-cache",
        "content-type": "application/json",
        pragma: "no-cache",
        priority: "u=1, i",
        "sec-ch-ua":
          '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        Referer: "https://holland2stay.com/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body,
      method: "POST",
    });
  }

  async function fetchData(page) {
    const responseAsJson = await (await _fetch(page)).json();
    const reponse = responseAsJson.data.products;
    const items = reponse.items;
    const pageInfo = reponse.page_info;
    return { items, pageInfo };
  }

  let { items, pageInfo } = await fetchData();

  while (pageInfo.total_pages > page) {
    page++;
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const { items: newItems, pageInfo: newPageInfo } = await fetchData(page);
    items = [...items, ...newItems];
  }

  return { items, pageInfo };
}
