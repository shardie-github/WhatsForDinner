/**
 * Consent Model - Finite State Machine
 * Manages user consent states for analytics, ads, and tracking
 * Includes age gating (COPPA compliance) and ATT/TCF integration
 */

export type ConsentPurpose = 
  | 'necessary'
  | 'analytics'
  | 'advertising'
  | 'personalization'
  | 'marketing';

export type ConsentStatus = 
  | 'unknown'
  | 'pending'
  | 'accepted'
  | 'declined';

export type AgeGateStatus = 
  | 'unknown'
  | 'minor'  // < 13 (COPPA)
  | 'adult';

export interface ConsentState {
  // Overall consent status
  status: ConsentStatus;
  
  // Age gating
  ageGate: AgeGateStatus;
  birthYear?: number;
  
  // Purpose-specific consents
  purposes: Record<ConsentPurpose, boolean>;
  
  // Platform-specific tracking permission
  trackingPermission?: 'authorized' | 'denied' | 'restricted' | 'not_determined'; // iOS ATT
  tcfString?: string; // IAB TCF 2.2 consent string (web/Android)
  
  // Metadata
  version: string;
  updatedAt: number;
  expiresAt?: number; // Optional expiration for consent re-prompting
}

export interface ConsentTransition {
  from: ConsentStatus;
  to: ConsentStatus;
  guard?: (state: ConsentState) => boolean;
}

/**
 * Consent State Machine
 * 
 * Transitions:
 * unknown -> pending (when consent UI is shown)
 * pending -> accepted (user accepts)
 * pending -> declined (user declines)
 * accepted -> pending (user wants to change preferences)
 * declined -> pending (user wants to change preferences)
 * 
 * Guards:
 * - Cannot accept advertising if ageGate === 'minor'
 * - Cannot accept tracking if ageGate === 'minor'
 * - Cannot accept tracking if trackingPermission !== 'authorized' (iOS)
 */
export class ConsentModel {
  private state: ConsentState;
  
  constructor(initialState?: Partial<ConsentState>) {
    this.state = {
      status: 'unknown',
      ageGate: 'unknown',
      purposes: {
        necessary: true, // Always required
        analytics: false,
        advertising: false,
        personalization: false,
        marketing: false,
      },
      version: '1.0',
      updatedAt: Date.now(),
      ...initialState,
    };
  }
  
  getState(): Readonly<ConsentState> {
    return { ...this.state };
  }
  
  /**
   * Set age gate status
   * This must be done before requesting consent for advertising/tracking
   */
  setAgeGate(birthYear: number): void {
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    
    this.state.ageGate = age < 13 ? 'minor' : 'adult';
    this.state.birthYear = birthYear;
    this.state.updatedAt = Date.now();
    
    // Auto-disable advertising and tracking for minors (COPPA)
    if (this.state.ageGate === 'minor') {
      this.state.purposes.advertising = false;
      this.state.purposes.personalization = false;
      
      // Clear tracking permission if set
      if (this.state.trackingPermission === 'authorized') {
        this.state.trackingPermission = 'restricted';
      }
    }
  }
  
  /**
   * Set iOS ATT tracking permission
   */
  setTrackingPermission(permission: 'authorized' | 'denied' | 'restricted' | 'not_determined'): void {
    this.state.trackingPermission = permission;
    this.state.updatedAt = Date.now();
    
    // If tracking is denied/restricted, disable advertising
    if (permission !== 'authorized') {
      this.state.purposes.advertising = false;
    }
  }
  
  /**
   * Set IAB TCF consent string (web/Android)
   */
  setTCFString(tcfString: string): void {
    this.state.tcfString = tcfString;
    this.state.updatedAt = Date.now();
    
    // Parse TCF string and update purposes (simplified)
    // In production, use a proper TCF library
    try {
      const purposes = this.parseTCFString(tcfString);
      this.state.purposes = { ...this.state.purposes, ...purposes };
    } catch (error) {
      console.warn('Failed to parse TCF string:', error);
    }
  }
  
  /**
   * Request consent (show UI)
   */
  requestConsent(): void {
    if (this.state.status === 'unknown') {
      this.state.status = 'pending';
      this.state.updatedAt = Date.now();
    }
  }
  
  /**
   * Accept all consents (with guards)
   */
  acceptAll(): boolean {
    if (!this.canAcceptAdvertising()) {
      return false;
    }
    
    this.state.status = 'accepted';
    this.state.purposes.analytics = true;
    this.state.purposes.advertising = this.canAcceptAdvertising();
    this.state.purposes.personalization = this.canAcceptPersonalization();
    this.state.purposes.marketing = true;
    this.state.updatedAt = Date.now();
    
    return true;
  }
  
  /**
   * Decline all optional consents
   */
  declineAll(): void {
    this.state.status = 'declined';
    this.state.purposes.analytics = false;
    this.state.purposes.advertising = false;
    this.state.purposes.personalization = false;
    this.state.purposes.marketing = false;
    this.state.updatedAt = Date.now();
  }
  
  /**
   * Accept specific purpose
   */
  acceptPurpose(purpose: ConsentPurpose): boolean {
    // Necessary is always true
    if (purpose === 'necessary') {
      return true;
    }
    
    // Check guards
    if (purpose === 'advertising' && !this.canAcceptAdvertising()) {
      return false;
    }
    
    if (purpose === 'personalization' && !this.canAcceptPersonalization()) {
      return false;
    }
    
    this.state.purposes[purpose] = true;
    this.state.status = 'accepted';
    this.state.updatedAt = Date.now();
    
    return true;
  }
  
  /**
   * Decline specific purpose
   */
  declinePurpose(purpose: ConsentPurpose): void {
    if (purpose === 'necessary') {
      return; // Cannot decline necessary
    }
    
    this.state.purposes[purpose] = false;
    this.state.updatedAt = Date.now();
    
    // If all optional purposes are declined, set status to declined
    const optionalPurposes: ConsentPurpose[] = ['analytics', 'advertising', 'personalization', 'marketing'];
    const allDeclined = optionalPurposes.every(p => !this.state.purposes[p]);
    
    if (allDeclined) {
      this.state.status = 'declined';
    }
  }
  
  /**
   * Check if advertising consent can be accepted
   */
  canAcceptAdvertising(): boolean {
    // Minors cannot consent to advertising
    if (this.state.ageGate === 'minor') {
      return false;
    }
    
    // iOS: tracking permission required
    if (this.state.trackingPermission !== undefined && this.state.trackingPermission !== 'authorized') {
      return false;
    }
    
    return true;
  }
  
  /**
   * Check if personalization consent can be accepted
   */
  canAcceptPersonalization(): boolean {
    // Minors cannot consent to personalization
    if (this.state.ageGate === 'minor') {
      return false;
    }
    
    return true;
  }
  
  /**
   * Check if analytics is allowed
   */
  isAnalyticsAllowed(): boolean {
    return this.state.purposes.analytics === true;
  }
  
  /**
   * Check if advertising is allowed
   */
  isAdvertisingAllowed(): boolean {
    return this.state.purposes.advertising === true && 
           this.canAcceptAdvertising();
  }
  
  /**
   * Check if tracking is allowed
   */
  isTrackingAllowed(): boolean {
    // Must have advertising consent and tracking permission (iOS) or TCF consent (web)
    if (!this.isAdvertisingAllowed()) {
      return false;
    }
    
    // iOS: require authorized tracking permission
    if (this.state.trackingPermission !== undefined) {
      return this.state.trackingPermission === 'authorized';
    }
    
    // Web/Android: require TCF consent
    if (this.state.tcfString) {
      return true; // TCF string presence indicates consent (should validate properly)
    }
    
    return false;
  }
  
  /**
   * Reset to unknown (for testing or re-prompting)
   */
  reset(): void {
    this.state = {
      status: 'unknown',
      ageGate: this.state.ageGate, // Preserve age gate
      birthYear: this.state.birthYear,
      purposes: {
        necessary: true,
        analytics: false,
        advertising: false,
        personalization: false,
        marketing: false,
      },
      version: this.state.version,
      updatedAt: Date.now(),
    };
  }
  
  /**
   * Parse IAB TCF 2.2 consent string (simplified)
   * In production, use a proper TCF library
   */
  private parseTCFString(tcfString: string): Partial<Record<ConsentPurpose, boolean>> {
    // Simplified parsing - in production use proper TCF library
    // TCF string is base64 encoded, contains purposes, vendors, etc.
    // For now, assume if TCF string exists and is valid, all purposes are accepted
    // (subject to actual TCF parsing logic)
    
    try {
      // Basic validation
      if (tcfString.length < 10) {
        throw new Error('Invalid TCF string length');
      }
      
      // In production, decode and parse according to TCF 2.2 spec
      // For now, return defaults based on string presence
      return {
        analytics: true,
        advertising: true,
        personalization: true,
        marketing: true,
      };
    } catch {
      return {};
    }
  }
}
