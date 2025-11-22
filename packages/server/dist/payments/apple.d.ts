/**
 * Apple App Store Receipt Verification
 * Uses App Store Server API (JWT/JWS) for validation
 */
export interface AppleReceiptVerificationRequest {
    receipt: string;
    transactionId?: string;
    productId?: string;
    userId: string;
}
export interface AppleSubscriptionStatus {
    plan: string;
    productId: string;
    transactionId: string;
    isActive: boolean;
    expiresAt?: number;
    originalTransactionId?: string;
}
/**
 * Verify Apple receipt using App Store Server API
 *
 * In production:
 * 1. Exchange receipt for validation token (App Store Server API v2)
 * 2. Verify JWT signature
 * 3. Parse transaction data
 * 4. Check subscription status
 */
export declare function verifyAppleReceipt(request: AppleReceiptVerificationRequest): Promise<AppleSubscriptionStatus | null>;
//# sourceMappingURL=apple.d.ts.map