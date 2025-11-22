/**
 * XML Catalog Feed Parser
 * Parses XML feeds (Google Merchant, RSS, custom formats)
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
/**
 * Parse XML feed content
 */
export declare function parseXMLFeed(xmlContent: string): ParsedCatalogItem[];
//# sourceMappingURL=xml.d.ts.map