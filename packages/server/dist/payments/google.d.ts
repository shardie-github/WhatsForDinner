/**
 * Google Play Purchase Verification
 * Uses Google Play Developer API
 */
export interface GooglePurchaseVerificationRequest {
    purchaseToken: string;
    productId?: string;
    userId: string;
}
export interface GoogleSubscriptionStatus {
    plan: string;
    productId: string;
    transactionId: string;
    isActive: boolean;
    expiresAt?: number;
    autoRenewing?: boolean;
}
/**
 * Verify Google Play purchase using Play Developer API
 *
 * In production:
 * 1. Use Google Play Developer API (googleapis)
 * 2. Verify purchase token
 * 3. Check acknowledgment status
 * 4. Handle acknowledgments if needed
 */
export declare function verifyGooglePurchase(request: GooglePurchaseVerificationRequest): Promise<GoogleSubscriptionStatus | null>;
//# sourceMappingURL=google.d.ts.map