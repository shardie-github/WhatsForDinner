/**
 * Agent Integration Webhook Router
 * Handles webhooks from AI agents (MindStudio, Zapier, n8n, etc.)
 */
import { FastifyRequest, FastifyReply } from 'fastify';
interface WebhookPayload {
    source: string;
    event: string;
    data: any;
    timestamp: string;
    signature?: string;
}
export declare class AgentWebhookRouter {
    private agents;
    constructor();
    /**
     * Initialize agent configurations
     */
    private initializeAgents;
    /**
     * Verify webhook signature
     */
    private verifySignature;
    /**
   * Handle incoming webhook
   */
    handleWebhook(request: FastifyRequest<{
        Body: WebhookPayload;
        Querystring: {
            agent?: string;
        };
    }>, reply: FastifyReply): Promise<void>;
    /**
     * Route event to appropriate handler
     */
    private routeEvent;
    /**
     * Handle meal suggestion from agent
     */
    private handleMealSuggestion;
    /**
     * Handle recipe generation from agent
     */
    private handleRecipeGeneration;
    /**
     * Handle meal plan created event
     */
    private handleMealPlanCreated;
    /**
     * Handle grocery list updated event
     */
    private handleGroceryListUpdated;
    /**
     * Register webhook endpoint
     */
    registerRoutes(app: any): void;
}
export declare const agentWebhookRouter: AgentWebhookRouter;
export {};
//# sourceMappingURL=agent-webhook.d.ts.map