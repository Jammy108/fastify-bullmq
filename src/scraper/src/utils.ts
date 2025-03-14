import { fetch } from 'undici';
import listugcposts from "./listugcposts";
import { ScraperOptions, SortEnum } from "./types";
import { URL } from "url";
import parser from "./parser";
import { ProxyAgent } from "undici";


export function validateParams(url: string, sort_type: ScraperOptions['sort_type'], pages: ScraperOptions['pages'], clean: ScraperOptions['clean']): void {
    const parsedUrl = new URL(url);
    if (parsedUrl.host !== "www.google.com" || !parsedUrl.pathname.startsWith("/maps/place/")) {
        throw new Error(`Invalid URL: ${url}`);
    }
    if (sort_type && !SortEnum[sort_type]) {
        throw new Error(`Invalid sort type: ${sort_type}`);
    }
    if (isNaN(Number(pages))) {
        throw new Error(`Invalid pages value: ${pages}`);
    }
    if (typeof clean !== "boolean") {
        throw new Error(`Invalid value for 'clean': ${clean}`);
    }
}


export async function fetchReviews(url: string, sort: ScraperOptions['sort_type'], nextPage: string = "", search_query: string = ""): Promise<any> {
    const so = SortEnum[sort]
    const apiUrl = listugcposts(url, so, nextPage, search_query);
    const client = new ProxyAgent(
        'http://jammy0308:WXQ3vEr107nUMksy_country-us@geo.iproyal.com:12321'
    );
    const response = await fetch(apiUrl, {
        dispatcher: client
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch reviews: ${response.statusText}`);
    }
    const textData = await response.text();
    const rawData = textData.split(")]}'")[1];
    return JSON.parse(rawData);
}


export async function paginateReviews(url: string, initialData: any, options: ScraperOptions): Promise<Array<any>> {
    let reviews = initialData[2];
    let nextPage = initialData[1]?.replace(/"/g, "");
    let currentPage = 2;
    while (nextPage && currentPage <= +options.pages) {
        console.log(`Scraping page ${currentPage}...`);
        const data = await fetchReviews(url, options.sort_type, nextPage, options.search_query);
        reviews = [...reviews, ...data[2]];
        nextPage = data[1]?.replace(/"/g, "");
        if (!nextPage) break;
        // await new Promise(resolve => setTimeout(resolve, 250)); // Avoid rate-limiting
        currentPage++;
    }
    return options.clean ? await parser(reviews) : reviews;
}