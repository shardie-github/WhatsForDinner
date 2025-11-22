/**
 * Partner Link Signing Service
 *
 * Creates and validates signed affiliate/partner links with HMAC signatures.
 * Links can be affiliate links, deeplinks, or cart links.
 * Includes tokenization for short URLs (/r/:token).
 */
export interface LinkParams {
    partner_id: string;
    sku?: string;
    kind: 'affiliate' | 'deeplink' | 'cart';
    destination_url: string;
    expires_in_hours?: number;
    meta?: Record<string, unknown>;
}
export interface SignedLink {
    signed_url: string;
    short_url: string;
    token: string;
    expires_at: Date;
}
/**
 * Create a signed partner link
 */
export declare function generateSignedLink(params: LinkParams): Promise<SignedLink>;
/**
 * Verify and resolve a signed link token
 * Returns the destination URL and metadata if valid
 */
export declare function resolveLinkToken(token: string): Promise<{
    destination: string;
    partner_id: string;
    sku?: string;
    kind: string;
    meta: Record<string, unknown>;
} | null>;
/**
 * Verify a signed URL directly (for redirect handler)
 */
export declare function verifySignedUrl(signedUrl: string): Promise<{
    destination: string;
    partner_id: string;
    sku?: string;
    meta: Record<string, unknown>;
} | null>;
//# sourceMappingURL=links.d.ts.map