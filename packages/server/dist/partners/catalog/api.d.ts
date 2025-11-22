/**
 * REST API Catalog Feed Parser
 * Handles paginated JSON API responses
 */
export interface ParsedCatalogItem {
    sku: string;
    title: string;
    brand?: string;
    url: string;
    image_url?: string;
    price_cents?: number;
    currency: string;
    availability: 'in_stock' | 'out_of_stock' | 'preorder' | 'discontinued';
    tags?: string[];
}
export interface APIFeedConfig {
    url: string;
    method?: 'GET' | 'POST';
    headers?: Record<string, string>;
    params?: Record<string, string>;
    pagination?: {
        type: 'offset' | 'cursor' | 'page';
        limit?: number;
        offsetParam?: string;
        cursorParam?: string;
        pageParam?: string;
        hasMoreField?: string;
        nextCursorField?: string;
    };
    transform?: (item: unknown) => ParsedCatalogItem | null;
}
/**
 * Fetch and parse API feed with pagination
 */
export declare function fetchAPIFeed(config: APIFeedConfig, fetchFn?: typeof fetch): Promise<ParsedCatalogItem[]>;
//# sourceMappingURL=api.d.ts.map