export const SortEnum = {
    "relevent": 1,
    "newest": 2,
    "highest_rating": 3,
    "lowest_rating": 4
};


export interface ScraperOptions {
    sort_type: keyof typeof SortEnum;
    search_query?: string;
    pages: number;
    clean: boolean;
  }