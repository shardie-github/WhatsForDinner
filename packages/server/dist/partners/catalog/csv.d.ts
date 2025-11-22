/**
 * CSV Catalog Feed Parser
 * Parses CSV feeds (Google Merchant format compatible)
 */
export interface CSVRow {
    [key: string]: string;
}
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
/**
 * Parse CSV content into catalog items
 */
export declare function parseCSVFeed(csvContent: string, options?: {
    delimiter?: string;
    skipEmptyLines?: boolean;
}): ParsedCatalogItem[];
//# sourceMappingURL=csv.d.ts.map