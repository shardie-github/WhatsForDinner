/**
 * AI Agent Orchestration System
 * Manages domain-specific AI agents for What's for Dinner ecosystem
 */

import { openai } from '../openaiClient';
import { createClient } from '../supabaseClient';

export interface AIAgent {
  id: string;
  name: string;
  description: string;
  type: AgentType;
  capabilities: string[];
  systemPrompt: string;
  tools: AgentTool[];
  memory: AgentMemory;
  status: 'active' | 'inactive' | 'training' | 'error';
  version: string;
  createdAt: string;
  updatedAt: string;
}

export type AgentType = 
  | 'dietary-coach' 
  | 'chef' 
  | 'ebook-generator' 
  | 'trend-analyzer'
  | 'meal-planner'
  | 'nutritionist'
  | 'shopping-assistant'
  | 'recipe-optimizer'
  | 'food-critic'
  | 'dietary-restriction-specialist';

export interface AgentTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
  function: (params: any) => Promise<any>;
}

export interface AgentMemory {
  userId: string;
  context: Record<string, any>;
  preferences: Record<string, any>;
  history: AgentInteraction[];
  lastUpdated: string;
}

export interface AgentInteraction {
  id: string;
  agentId: string;
  userId: string;
  input: string;
  output: string;
  timestamp: string;
  metadata: Record<string, any>;
}

export interface AgentPackage {
  id: string;
  name: string;
  description: string;
  agents: string[];
  price: number;
  currency: string;
  features: string[];
  isActive: boolean;
}

class AgentOrchestrator {
  private agents: Map<string, AIAgent> = new Map();
  private agentPackages: Map<string, AgentPackage> = new Map();
  private supabase = createClient();

  constructor() {
    this.initializeDefaultAgents();
    this.initializeAgentPackages();
  }

  /**
   * Initialize default AI agents
   */
  private initializeDefaultAgents() {
    const defaultAgents: AIAgent[] = [
      {
        id: 'dietary-coach',
        name: 'Dietary Coach',
        description: 'Personalized dietary guidance and meal recommendations',
        type: 'dietary-coach',
        capabilities: ['nutrition-analysis', 'meal-planning', 'dietary-restrictions', 'health-goals'],
        systemPrompt: `You are a professional dietary coach specializing in personalized nutrition guidance. 
        Help users achieve their health goals through tailored meal recommendations, dietary advice, and lifestyle suggestions.
        Always consider their dietary restrictions, preferences, and health conditions.`,
        tools: [
          {
            name: 'analyze_nutrition',
            description: 'Analyze nutritional content of meals',
            parameters: { meal: 'string', dietary_restrictions: 'array' },
            function: this.analyzeNutrition.bind(this)
          },
          {
            name: 'suggest_alternatives',
            description: 'Suggest healthy alternatives for ingredients',
            parameters: { ingredient: 'string', dietary_restrictions: 'array' },
            function: this.suggestAlternatives.bind(this)
          }
        ],
        memory: {
          userId: '',
          context: {},
          preferences: {},
          history: [],
          lastUpdated: new Date().toISOString()
        },
        status: 'active',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'chef',
        name: 'Master Chef',
        description: 'Culinary expertise and recipe creation',
        type: 'chef',
        capabilities: ['recipe-creation', 'cooking-techniques', 'ingredient-substitution', 'flavor-pairing'],
        systemPrompt: `You are a world-class chef with expertise in various cuisines and cooking techniques.
        Create innovative recipes, provide cooking tips, and help users improve their culinary skills.
        Focus on practical, achievable recipes that taste amazing.`,
        tools: [
          {
            name: 'create_recipe',
            description: 'Create a new recipe based on ingredients and preferences',
            parameters: { ingredients: 'array', cuisine: 'string', difficulty: 'string' },
            function: this.createRecipe.bind(this)
          },
          {
            name: 'suggest_cooking_technique',
            description: 'Suggest cooking techniques for specific ingredients',
            parameters: { ingredient: 'string', desired_outcome: 'string' },
            function: this.suggestCookingTechnique.bind(this)
          }
        ],
        memory: {
          userId: '',
          context: {},
          preferences: {},
          history: [],
          lastUpdated: new Date().toISOString()
        },
        status: 'active',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'ebook-generator',
        name: 'eBook Generator',
        description: 'Create personalized cookbooks and meal planning guides',
        type: 'ebook-generator',
        capabilities: ['content-generation', 'book-formatting', 'personalization', 'export-formats'],
        systemPrompt: `You are a professional content creator specializing in cookbooks and meal planning guides.
        Create comprehensive, well-structured content that users can export as PDFs or ebooks.
        Focus on personalization and practical value.`,
        tools: [
          {
            name: 'generate_cookbook',
            description: 'Generate a personalized cookbook',
            parameters: { theme: 'string', recipes: 'array', personalization: 'object' },
            function: this.generateCookbook.bind(this)
          },
          {
            name: 'create_meal_plan_guide',
            description: 'Create a meal planning guide',
            parameters: { duration: 'string', dietary_goals: 'array', preferences: 'object' },
            function: this.createMealPlanGuide.bind(this)
          }
        ],
        memory: {
          userId: '',
          context: {},
          preferences: {},
          history: [],
          lastUpdated: new Date().toISOString()
        },
        status: 'active',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'trend-analyzer',
        name: 'Food Trend Analyzer',
        description: 'Analyze food trends and suggest trending recipes',
        type: 'trend-analyzer',
        capabilities: ['trend-analysis', 'social-media-monitoring', 'seasonal-recommendations', 'market-insights'],
        systemPrompt: `You are a food trend analyst with expertise in identifying emerging culinary trends.
        Analyze social media, restaurant menus, and food publications to provide insights on trending ingredients,
        cooking methods, and flavor combinations.`,
        tools: [
          {
            name: 'analyze_trends',
            description: 'Analyze current food trends',
            parameters: { timeframe: 'string', category: 'string', region: 'string' },
            function: this.analyzeTrends.bind(this)
          },
          {
            name: 'suggest_trending_recipes',
            description: 'Suggest recipes based on current trends',
            parameters: { trends: 'array', preferences: 'object' },
            function: this.suggestTrendingRecipes.bind(this)
          }
        ],
        memory: {
          userId: '',
          context: {},
          preferences: {},
          history: [],
          lastUpdated: new Date().toISOString()
        },
        status: 'active',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    defaultAgents.forEach(agent => {
      this.agents.set(agent.id, agent);
    });
  }

  /**
   * Initialize agent packages
   */
  private initializeAgentPackages() {
    const packages: AgentPackage[] = [
      {
        id: 'basic',
        name: 'Basic Package',
        description: 'Essential AI agents for meal planning',
        agents: ['dietary-coach', 'chef'],
        price: 0,
        currency: 'USD',
        features: ['Basic meal planning', 'Recipe suggestions', 'Dietary guidance'],
        isActive: true
      },
      {
        id: 'pro',
        name: 'Pro Package',
        description: 'Advanced AI agents for serious food enthusiasts',
        agents: ['dietary-coach', 'chef', 'ebook-generator', 'trend-analyzer'],
        price: 9.99,
        currency: 'USD',
        features: ['All basic features', 'eBook generation', 'Trend analysis', 'Advanced personalization'],
        isActive: true
      },
      {
        id: 'enterprise',
        name: 'Enterprise Package',
        description: 'Complete AI agent suite for businesses',
        agents: ['dietary-coach', 'chef', 'ebook-generator', 'trend-analyzer', 'meal-planner', 'nutritionist'],
        price: 29.99,
        currency: 'USD',
        features: ['All pro features', 'Custom agents', 'API access', 'Priority support'],
        isActive: true
      }
    ];

    packages.forEach(pkg => {
      this.agentPackages.set(pkg.id, pkg);
    });
  }

  /**
   * Get agent by ID
   */
  getAgent(agentId: string): AIAgent | null {
    return this.agents.get(agentId) || null;
  }

  /**
   * Get all agents
   */
  getAllAgents(): AIAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get agents by type
   */
  getAgentsByType(type: AgentType): AIAgent[] {
    return Array.from(this.agents.values()).filter(agent => agent.type === type);
  }

  /**
   * Get user's available agents based on their subscription
   */
  async getUserAgents(userId: string): Promise<AIAgent[]> {
    try {
      const { data: user } = await this.supabase
        .from('users')
        .select('subscription_plan, agent_packages')
        .eq('id', userId)
        .single();

      if (!user) {
        return this.getAgentsByPackage('basic');
      }

      const userPackages = user.agent_packages || ['basic'];
      const availableAgents = new Set<string>();

      for (const packageId of userPackages) {
        const pkg = this.agentPackages.get(packageId);
        if (pkg) {
          pkg.agents.forEach(agentId => availableAgents.add(agentId));
        }
      }

      return Array.from(availableAgents)
        .map(agentId => this.agents.get(agentId))
        .filter(Boolean) as AIAgent[];

    } catch (error) {
      console.error('Error getting user agents:', error);
      return this.getAgentsByPackage('basic');
    }
  }

  /**
   * Get agents by package
   */
  getAgentsByPackage(packageId: string): AIAgent[] {
    const pkg = this.agentPackages.get(packageId);
    if (!pkg) return [];

    return pkg.agents
      .map(agentId => this.agents.get(agentId))
      .filter(Boolean) as AIAgent[];
  }

  /**
   * Execute agent with user input
   */
  async executeAgent(
    agentId: string, 
    userId: string, 
    input: string, 
    context?: Record<string, any>
  ): Promise<string> {
    const agent = this.getAgent(agentId);
    if (!agent) {
      throw new Error(`Agent ${agentId} not found`);
    }

    if (agent.status !== 'active') {
      throw new Error(`Agent ${agentId} is not active`);
    }

    // Load user memory
    const memory = await this.loadUserMemory(agentId, userId);

    // Prepare context
    const fullContext = {
      ...memory.context,
      ...context,
      user_input: input,
      timestamp: new Date().toISOString()
    };

    // Execute agent
    const response = await this.executeAgentWithTools(agent, fullContext);

    // Save interaction
    await this.saveInteraction(agentId, userId, input, response, fullContext);

    // Update memory
    await this.updateUserMemory(agentId, userId, fullContext, response);

    return response;
  }

  /**
   * Execute agent with tools
   */
  private async executeAgentWithTools(agent: AIAgent, context: Record<string, any>): Promise<string> {
    const messages = [
      { role: 'system', content: agent.systemPrompt },
      { role: 'user', content: context.user_input }
    ];

    // Add memory context
    if (context.preferences) {
      messages.push({
        role: 'system',
        content: `User preferences: ${JSON.stringify(context.preferences)}`
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      tools: agent.tools.map(tool => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.parameters
        }
      })),
      tool_choice: 'auto'
    });

    let response = completion.choices[0]?.message?.content || '';

    // Handle tool calls
    const toolCalls = completion.choices[0]?.message?.tool_calls;
    if (toolCalls) {
      for (const toolCall of toolCalls) {
        const tool = agent.tools.find(t => t.name === toolCall.function.name);
        if (tool) {
          const toolResult = await tool.function(JSON.parse(toolCall.function.arguments));
          response += `\n\n${toolResult}`;
        }
      }
    }

    return response;
  }

  /**
   * Load user memory for agent
   */
  private async loadUserMemory(agentId: string, userId: string): Promise<AgentMemory> {
    try {
      const { data } = await this.supabase
        .from('agent_memories')
        .select('*')
        .eq('agent_id', agentId)
        .eq('user_id', userId)
        .single();

      return data || {
        userId,
        context: {},
        preferences: {},
        history: [],
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      return {
        userId,
        context: {},
        preferences: {},
        history: [],
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Update user memory
   */
  private async updateUserMemory(
    agentId: string, 
    userId: string, 
    context: Record<string, any>, 
    response: string
  ): Promise<void> {
    try {
      const memory = await this.loadUserMemory(agentId, userId);
      
      // Update context with new information
      memory.context = { ...memory.context, ...context };
      memory.lastUpdated = new Date().toISOString();

      await this.supabase
        .from('agent_memories')
        .upsert({
          agent_id: agentId,
          user_id: userId,
          context: memory.context,
          preferences: memory.preferences,
          history: memory.history,
          last_updated: memory.lastUpdated
        });
    } catch (error) {
      console.error('Error updating user memory:', error);
    }
  }

  /**
   * Save interaction
   */
  private async saveInteraction(
    agentId: string,
    userId: string,
    input: string,
    output: string,
    metadata: Record<string, any>
  ): Promise<void> {
    try {
      await this.supabase
        .from('agent_interactions')
        .insert({
          agent_id: agentId,
          user_id: userId,
          input,
          output,
          metadata,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error saving interaction:', error);
    }
  }

  // Tool implementations
  private async analyzeNutrition(params: any): Promise<string> {
    // Implement nutrition analysis
    return `Nutritional analysis for ${params.meal}: High in protein, moderate carbs, low fat.`;
  }

  private async suggestAlternatives(params: any): Promise<string> {
    // Implement ingredient alternatives
    return `Healthy alternatives for ${params.ingredient}: quinoa, brown rice, cauliflower rice.`;
  }

  private async createRecipe(params: any): Promise<string> {
    // Implement recipe creation
    return `Created a delicious ${params.cuisine} recipe using ${params.ingredients.join(', ')}.`;
  }

  private async suggestCookingTechnique(params: any): Promise<string> {
    // Implement cooking technique suggestions
    return `For ${params.ingredient}, try ${params.desired_outcome} technique.`;
  }

  private async generateCookbook(params: any): Promise<string> {
    // Implement cookbook generation
    return `Generated personalized cookbook with ${params.recipes.length} recipes.`;
  }

  private async createMealPlanGuide(params: any): Promise<string> {
    // Implement meal plan guide creation
    return `Created ${params.duration} meal plan guide for your dietary goals.`;
  }

  private async analyzeTrends(params: any): Promise<string> {
    // Implement trend analysis
    return `Current food trends: plant-based proteins, fermented foods, zero-waste cooking.`;
  }

  private async suggestTrendingRecipes(params: any): Promise<string> {
    // Implement trending recipe suggestions
    return `Trending recipes: kimchi fried rice, jackfruit tacos, aquafaba meringues.`;
  }

  /**
   * Get agent packages
   */
  getAgentPackages(): AgentPackage[] {
    return Array.from(this.agentPackages.values());
  }

  /**
   * Purchase agent package
   */
  async purchaseAgentPackage(userId: string, packageId: string): Promise<boolean> {
    try {
      const pkg = this.agentPackages.get(packageId);
      if (!pkg) {
        throw new Error('Package not found');
      }

      // Add package to user's subscriptions
      const { data: user } = await this.supabase
        .from('users')
        .select('agent_packages')
        .eq('id', userId)
        .single();

      const currentPackages = user?.agent_packages || [];
      const updatedPackages = [...currentPackages, packageId];

      await this.supabase
        .from('users')
        .update({ agent_packages: updatedPackages })
        .eq('id', userId);

      return true;
    } catch (error) {
      console.error('Error purchasing agent package:', error);
      return false;
    }
  }
}

// Export singleton instance
export const agentOrchestrator = new AgentOrchestrator();