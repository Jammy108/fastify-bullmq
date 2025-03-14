import { SortEnum, ScraperOptions } from "./src/types";
import { validateParams, fetchReviews, paginateReviews } from "./src/utils.js";
import parseReviews from "./src/parser.js";




export async function scraper(
    url: string, 
    options: ScraperOptions
): Promise<Array<any> | number> {

    
    try {
        validateParams(url, options.sort_type, options.pages, options.clean);

        const initialData = await fetchReviews(url, options.sort_type, "", options.search_query);

        if (!initialData || !initialData[2] || !initialData[2].length) return 0;

        if (!initialData[1] || options.pages === 1) return options.clean ? parseReviews(initialData[2]) : initialData[2];

        return await paginateReviews(url, initialData, {sort_type: options.sort_type, pages: options.pages, search_query: options.search_query, clean: options.clean});

    } catch (e) {
        console.error(e);
        return [];
    }
}