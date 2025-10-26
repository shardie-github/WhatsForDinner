/**
 * Legal and Compliance Automation System
 * Generates and manages legal documents, compliance checks, and data handling
 */

import { openai } from '../openaiClient';
import { createClient } from '../supabaseClient';

export interface LegalDocument {
  id: string;
  type: 'terms_of_service' | 'privacy_policy' | 'data_processing_agreement' | 'cookie_policy' | 'refund_policy';
  version: string;
  content: string;
  jurisdiction: string;
  language: string;
  isActive: boolean;
  effectiveDate: string;
  lastUpdated: string;
  generatedBy: 'ai' | 'manual';
  templateId?: string;
}

export interface ComplianceCheck {
  id: string;
  type: 'gdpr' | 'ccpa' | 'coppa' | 'hipaa' | 'sox' | 'pci_dss';
  status: 'compliant' | 'non_compliant' | 'needs_review' | 'not_applicable';
  score: number; // 0-100
  issues: ComplianceIssue[];
  lastChecked: string;
  nextCheck: string;
}

export interface ComplianceIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: string;
  description: string;
  recommendation: string;
  status: 'open' | 'in_progress' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
}

export interface DataSubjectRequest {
  id: string;
  userId: string;
  type: 'access' | 'rectification' | 'erasure' | 'portability' | 'restriction' | 'objection';
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
  description: string;
  requestedAt: string;
  completedAt?: string;
  data?: any;
}

export interface AgeGateConfig {
  enabled: boolean;
  minimumAge: number;
  jurisdictions: string[];
  verificationMethods: ('self_declaration' | 'id_verification' | 'parental_consent')[];
  redirectUrl?: string;
}

class LegalAutomationSystem {
  private supabase = createClient();
  private documentTemplates: Map<string, string> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize legal document templates
   */
  private initializeTemplates() {
    this.documentTemplates.set('terms_of_service', `
# Terms of Service

## 1. Acceptance of Terms
By accessing and using What's for Dinner ("Service"), you accept and agree to be bound by the terms and provision of this agreement.

## 2. Use License
Permission is granted to temporarily download one copy of the materials on What's for Dinner for personal, non-commercial transitory viewing only.

## 3. Disclaimer
The materials on What's for Dinner are provided on an 'as is' basis. What's for Dinner makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties.

## 4. Limitations
In no event shall What's for Dinner or its suppliers be liable for any damages arising out of the use or inability to use the materials on What's for Dinner.

## 5. Privacy Policy
Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service.

## 6. Governing Law
These terms and conditions are governed by and construed in accordance with the laws of [JURISDICTION].

## 7. Changes to Terms
What's for Dinner reserves the right to revise these terms at any time without notice.

Last updated: [DATE]
    `);

    this.documentTemplates.set('privacy_policy', `
# Privacy Policy

## 1. Information We Collect
We collect information you provide directly to us, such as when you create an account, use our services, or contact us for support.

## 2. How We Use Your Information
We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.

## 3. Information Sharing
We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in this policy.

## 4. Data Security
We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

## 5. Your Rights
Depending on your location, you may have certain rights regarding your personal information, including the right to access, correct, or delete your data.

## 6. Cookies
We use cookies and similar technologies to enhance your experience and analyze how you use our services.

## 7. Children's Privacy
Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.

## 8. Changes to This Policy
We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.

Last updated: [DATE]
    `);

    this.documentTemplates.set('data_processing_agreement', `
# Data Processing Agreement

## 1. Definitions
- "Controller" means What's for Dinner
- "Processor" means any third-party service provider processing personal data on behalf of the Controller
- "Personal Data" means any information relating to an identified or identifiable natural person

## 2. Processing of Personal Data
The Processor shall process Personal Data only on documented instructions from the Controller and in compliance with applicable data protection laws.

## 3. Security Measures
The Processor shall implement appropriate technical and organizational measures to ensure a level of security appropriate to the risk.

## 4. Data Subject Rights
The Processor shall assist the Controller in fulfilling data subject rights requests, including access, rectification, erasure, and portability.

## 5. Data Breach Notification
The Processor shall notify the Controller without undue delay after becoming aware of a personal data breach.

## 6. Sub-processors
The Processor may engage sub-processors with the prior written consent of the Controller.

## 7. Data Retention
Personal Data shall be retained only for as long as necessary to fulfill the purposes for which it was collected.

## 8. Audit Rights
The Controller has the right to audit the Processor's compliance with this agreement.

Last updated: [DATE]
    `);
  }

  /**
   * Generate legal document using AI
   */
  async generateLegalDocument(
    type: LegalDocument['type'],
    jurisdiction: string,
    language: string = 'en',
    customizations?: Record<string, any>
  ): Promise<LegalDocument> {
    try {
      const template = this.documentTemplates.get(type);
      if (!template) {
        throw new Error(`Template not found for document type: ${type}`);
      }

      // Use AI to customize the template
      const prompt = `
        Customize this legal document template for a meal planning app called "What's for Dinner":
        
        Template: ${template}
        
        Jurisdiction: ${jurisdiction}
        Language: ${language}
        Customizations: ${JSON.stringify(customizations || {})}
        
        Please generate a complete, legally compliant document that:
        1. Is specific to a meal planning and recipe app
        2. Complies with the laws of ${jurisdiction}
        3. Is written in ${language}
        4. Includes all necessary legal protections
        5. Is clear and understandable for users
        6. Includes placeholders for company information that can be filled in later
        
        Return only the document content, no additional commentary.
      `;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 4000,
        temperature: 0.3,
      });

      const content = completion.choices[0]?.message?.content || template;
      const version = this.generateVersionNumber();

      const document: LegalDocument = {
        id: crypto.randomUUID(),
        type,
        version,
        content,
        jurisdiction,
        language,
        isActive: true,
        effectiveDate: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        generatedBy: 'ai',
      };

      // Save to database
      await this.saveLegalDocument(document);

      return document;

    } catch (error) {
      console.error('Error generating legal document:', error);
      throw error;
    }
  }

  /**
   * Save legal document to database
   */
  private async saveLegalDocument(document: LegalDocument): Promise<void> {
    try {
      await this.supabase
        .from('legal_documents')
        .insert({
          id: document.id,
          type: document.type,
          version: document.version,
          content: document.content,
          jurisdiction: document.jurisdiction,
          language: document.language,
          is_active: document.isActive,
          effective_date: document.effectiveDate,
          last_updated: document.lastUpdated,
          generated_by: document.generatedBy,
          template_id: document.templateId,
          created_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error saving legal document:', error);
      throw error;
    }
  }

  /**
   * Generate version number
   */
  private generateVersionNumber(): string {
    const now = new Date();
    return `v${now.getFullYear()}.${now.getMonth() + 1}.${now.getDate()}.${now.getHours()}${now.getMinutes()}`;
  }

  /**
   * Run compliance check
   */
  async runComplianceCheck(type: ComplianceCheck['type']): Promise<ComplianceCheck> {
    try {
      const issues: ComplianceIssue[] = [];
      let score = 100;

      switch (type) {
        case 'gdpr':
          const gdprResult = await this.checkGDPRCompliance();
          issues.push(...gdprResult.issues);
          score = gdprResult.score;
          break;
        case 'ccpa':
          const ccpaResult = await this.checkCCPACompliance();
          issues.push(...ccpaResult.issues);
          score = ccpaResult.score;
          break;
        case 'coppa':
          const coppaResult = await this.checkCOPPACompliance();
          issues.push(...coppaResult.issues);
          score = coppaResult.score;
          break;
        default:
          throw new Error(`Unsupported compliance type: ${type}`);
      }

      const complianceCheck: ComplianceCheck = {
        id: crypto.randomUUID(),
        type,
        status: score >= 80 ? 'compliant' : score >= 60 ? 'needs_review' : 'non_compliant',
        score,
        issues,
        lastChecked: new Date().toISOString(),
        nextCheck: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      };

      // Save compliance check
      await this.saveComplianceCheck(complianceCheck);

      return complianceCheck;

    } catch (error) {
      console.error('Error running compliance check:', error);
      throw error;
    }
  }

  /**
   * Check GDPR compliance
   */
  private async checkGDPRCompliance(): Promise<{ score: number; issues: ComplianceIssue[] }> {
    const issues: ComplianceIssue[] = [];
    let score = 100;

    // Check for privacy policy
    const { data: privacyPolicy } = await this.supabase
      .from('legal_documents')
      .select('*')
      .eq('type', 'privacy_policy')
      .eq('is_active', true)
      .single();

    if (!privacyPolicy) {
      issues.push({
        id: crypto.randomUUID(),
        severity: 'high',
        category: 'Legal Documents',
        description: 'Privacy Policy is missing',
        recommendation: 'Generate and publish a GDPR-compliant privacy policy',
        status: 'open',
        createdAt: new Date().toISOString(),
      });
      score -= 20;
    }

    // Check for data processing agreement
    const { data: dpa } = await this.supabase
      .from('legal_documents')
      .select('*')
      .eq('type', 'data_processing_agreement')
      .eq('is_active', true)
      .single();

    if (!dpa) {
      issues.push({
        id: crypto.randomUUID(),
        severity: 'medium',
        category: 'Data Processing',
        description: 'Data Processing Agreement is missing',
        recommendation: 'Create DPA for third-party data processors',
        status: 'open',
        createdAt: new Date().toISOString(),
      });
      score -= 15;
    }

    // Check for cookie consent
    const { data: cookiePolicy } = await this.supabase
      .from('legal_documents')
      .select('*')
      .eq('type', 'cookie_policy')
      .eq('is_active', true)
      .single();

    if (!cookiePolicy) {
      issues.push({
        id: crypto.randomUUID(),
        severity: 'medium',
        category: 'Cookies',
        description: 'Cookie Policy is missing',
        recommendation: 'Implement cookie consent and policy',
        status: 'open',
        createdAt: new Date().toISOString(),
      });
      score -= 10;
    }

    // Check for data retention policy
    const { data: retentionPolicy } = await this.supabase
      .from('settings')
      .select('*')
      .eq('key', 'data_retention_policy')
      .single();

    if (!retentionPolicy) {
      issues.push({
        id: crypto.randomUUID(),
        severity: 'high',
        category: 'Data Retention',
        description: 'Data retention policy is not configured',
        recommendation: 'Define and implement data retention periods',
        status: 'open',
        createdAt: new Date().toISOString(),
      });
      score -= 15;
    }

    return { score: Math.max(0, score), issues };
  }

  /**
   * Check CCPA compliance
   */
  private async checkCCPACompliance(): Promise<{ score: number; issues: ComplianceIssue[] }> {
    const issues: ComplianceIssue[] = [];
    let score = 100;

    // Check for "Do Not Sell" option
    const { data: doNotSell } = await this.supabase
      .from('settings')
      .select('*')
      .eq('key', 'do_not_sell_option')
      .single();

    if (!doNotSell || !doNotSell.value) {
      issues.push({
        id: crypto.randomUUID(),
        severity: 'high',
        category: 'Consumer Rights',
        description: 'Do Not Sell option is not implemented',
        recommendation: 'Add Do Not Sell My Personal Information option',
        status: 'open',
        createdAt: new Date().toISOString(),
      });
      score -= 25;
    }

    // Check for privacy policy with CCPA disclosures
    const { data: privacyPolicy } = await this.supabase
      .from('legal_documents')
      .select('*')
      .eq('type', 'privacy_policy')
      .eq('is_active', true)
      .single();

    if (privacyPolicy && !privacyPolicy.content.includes('California Consumer Privacy Act')) {
      issues.push({
        id: crypto.randomUUID(),
        severity: 'medium',
        category: 'Legal Documents',
        description: 'Privacy Policy lacks CCPA disclosures',
        recommendation: 'Update privacy policy to include CCPA-specific disclosures',
        status: 'open',
        createdAt: new Date().toISOString(),
      });
      score -= 15;
    }

    return { score: Math.max(0, score), issues };
  }

  /**
   * Check COPPA compliance
   */
  private async checkCOPPACompliance(): Promise<{ score: number; issues: ComplianceIssue[] }> {
    const issues: ComplianceIssue[] = [];
    let score = 100;

    // Check for age verification
    const { data: ageGate } = await this.supabase
      .from('settings')
      .select('*')
      .eq('key', 'age_gate_config')
      .single();

    if (!ageGate || !ageGate.value?.enabled) {
      issues.push({
        id: crypto.randomUUID(),
        severity: 'critical',
        category: 'Age Verification',
        description: 'Age verification system is not implemented',
        recommendation: 'Implement age gate to prevent collection of data from children under 13',
        status: 'open',
        createdAt: new Date().toISOString(),
      });
      score -= 30;
    }

    // Check for parental consent mechanism
    if (ageGate && !ageGate.value?.verificationMethods?.includes('parental_consent')) {
      issues.push({
        id: crypto.randomUUID(),
        severity: 'high',
        category: 'Parental Consent',
        description: 'Parental consent mechanism is not implemented',
        recommendation: 'Add parental consent verification for users under 13',
        status: 'open',
        createdAt: new Date().toISOString(),
      });
      score -= 20;
    }

    return { score: Math.max(0, score), issues };
  }

  /**
   * Save compliance check
   */
  private async saveComplianceCheck(check: ComplianceCheck): Promise<void> {
    try {
      await this.supabase
        .from('compliance_checks')
        .insert({
          id: check.id,
          type: check.type,
          status: check.status,
          score: check.score,
          issues: check.issues,
          last_checked: check.lastChecked,
          next_check: check.nextCheck,
          created_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error saving compliance check:', error);
      throw error;
    }
  }

  /**
   * Process data subject request
   */
  async processDataSubjectRequest(
    userId: string,
    type: DataSubjectRequest['type'],
    description: string
  ): Promise<DataSubjectRequest> {
    try {
      const request: DataSubjectRequest = {
        id: crypto.randomUUID(),
        userId,
        type,
        status: 'pending',
        description,
        requestedAt: new Date().toISOString(),
      };

      // Save request
      await this.supabase
        .from('data_subject_requests')
        .insert({
          id: request.id,
          user_id: userId,
          type: request.type,
          status: request.status,
          description: request.description,
          requested_at: request.requestedAt,
          created_at: new Date().toISOString(),
        });

      // Process based on type
      switch (type) {
        case 'access':
          await this.processAccessRequest(request);
          break;
        case 'erasure':
          await this.processErasureRequest(request);
          break;
        case 'portability':
          await this.processPortabilityRequest(request);
          break;
        default:
          // Other types can be processed manually
          break;
      }

      return request;

    } catch (error) {
      console.error('Error processing data subject request:', error);
      throw error;
    }
  }

  /**
   * Process access request
   */
  private async processAccessRequest(request: DataSubjectRequest): Promise<void> {
    try {
      // Collect all user data
      const { data: userData } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', request.userId)
        .single();

      const { data: recipes } = await this.supabase
        .from('recipes')
        .select('*')
        .eq('user_id', request.userId);

      const { data: mealPlans } = await this.supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', request.userId);

      const data = {
        user: userData,
        recipes: recipes || [],
        meal_plans: mealPlans || [],
        exported_at: new Date().toISOString(),
      };

      // Update request with data
      await this.supabase
        .from('data_subject_requests')
        .update({
          status: 'completed',
          data: data,
          completed_at: new Date().toISOString(),
        })
        .eq('id', request.id);

    } catch (error) {
      console.error('Error processing access request:', error);
    }
  }

  /**
   * Process erasure request
   */
  private async processErasureRequest(request: DataSubjectRequest): Promise<void> {
    try {
      // Delete user data from all tables
      await this.supabase
        .from('recipes')
        .delete()
        .eq('user_id', request.userId);

      await this.supabase
        .from('meal_plans')
        .delete()
        .eq('user_id', request.userId);

      await this.supabase
        .from('user_preferences')
        .delete()
        .eq('user_id', request.userId);

      // Anonymize user account instead of deleting
      await this.supabase
        .from('users')
        .update({
          email: `deleted_${request.userId}@example.com`,
          name: 'Deleted User',
          deleted_at: new Date().toISOString(),
        })
        .eq('id', request.userId);

      // Update request status
      await this.supabase
        .from('data_subject_requests')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('id', request.id);

    } catch (error) {
      console.error('Error processing erasure request:', error);
    }
  }

  /**
   * Process portability request
   */
  private async processPortabilityRequest(request: DataSubjectRequest): Promise<void> {
    try {
      // Similar to access request but format for portability
      const { data: userData } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', request.userId)
        .single();

      const { data: recipes } = await this.supabase
        .from('recipes')
        .select('*')
        .eq('user_id', request.userId);

      const { data: mealPlans } = await this.supabase
        .from('meal_plans')
        .select('*')
        .eq('user_id', request.userId);

      // Format data for portability (JSON format)
      const portableData = {
        format: 'json',
        version: '1.0',
        exported_at: new Date().toISOString(),
        data: {
          profile: {
            name: userData?.name,
            email: userData?.email,
            preferences: userData?.preferences,
          },
          recipes: recipes?.map(recipe => ({
            name: recipe.name,
            description: recipe.description,
            ingredients: recipe.ingredients,
            instructions: recipe.instructions,
            created_at: recipe.created_at,
          })) || [],
          meal_plans: mealPlans?.map(plan => ({
            name: plan.name,
            start_date: plan.start_date,
            end_date: plan.end_date,
            meals: plan.meals,
            created_at: plan.created_at,
          })) || [],
        },
      };

      // Update request with portable data
      await this.supabase
        .from('data_subject_requests')
        .update({
          status: 'completed',
          data: portableData,
          completed_at: new Date().toISOString(),
        })
        .eq('id', request.id);

    } catch (error) {
      console.error('Error processing portability request:', error);
    }
  }

  /**
   * Get all legal documents
   */
  async getLegalDocuments(): Promise<LegalDocument[]> {
    try {
      const { data, error } = await this.supabase
        .from('legal_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return data?.map(doc => ({
        id: doc.id,
        type: doc.type,
        version: doc.version,
        content: doc.content,
        jurisdiction: doc.jurisdiction,
        language: doc.language,
        isActive: doc.is_active,
        effectiveDate: doc.effective_date,
        lastUpdated: doc.last_updated,
        generatedBy: doc.generated_by,
        templateId: doc.template_id,
      })) || [];

    } catch (error) {
      console.error('Error getting legal documents:', error);
      return [];
    }
  }

  /**
   * Get compliance status
   */
  async getComplianceStatus(): Promise<ComplianceCheck[]> {
    try {
      const { data, error } = await this.supabase
        .from('compliance_checks')
        .select('*')
        .order('last_checked', { ascending: false });

      if (error) {
        throw error;
      }

      return data?.map(check => ({
        id: check.id,
        type: check.type,
        status: check.status,
        score: check.score,
        issues: check.issues || [],
        lastChecked: check.last_checked,
        nextCheck: check.next_check,
      })) || [];

    } catch (error) {
      console.error('Error getting compliance status:', error);
      return [];
    }
  }
}

// Export singleton instance
export const legalAutomation = new LegalAutomationSystem();