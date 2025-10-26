/**
 * Base Agent Class for Multi-Agent Collaboration System
 * Provides common functionality for all autonomous agents
 */

import { logger } from '../logger';
import { autonomousSystem } from '../autonomousSystem';

export interface AgentConfig {
  name: string;
  capabilities: string[];
  safetyConstraints: string[];
  learningRate: number;
  maxRetries: number;
}

export interface AgentAction {
  type: string;
  payload: any;
  timestamp: string;
  confidence: number;
}

export interface AgentMemory {
  experiences: Array<{
    action: AgentAction;
    outcome: 'success' | 'failure' | 'warning';
    timestamp: string;
    learning: any;
  }>;
  knowledge: Record<string, any>;
  patterns: Record<string, number>;
}

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected memory: AgentMemory;
  protected isActive: boolean = false;
  protected currentTask: string | null = null;

  constructor(config: AgentConfig) {
    this.config = config;
    this.memory = {
      experiences: [],
      knowledge: {},
      patterns: {},
    };
  }

  /**
   * Initialize the agent
   */
  async initialize(): Promise<void> {
    logger.info(`Initializing agent: ${this.config.name}`);
    this.isActive = true;
    await this.loadMemory();
    autonomousSystem.updateAgentState(this.config.name, {
      status: 'active',
      lastAction: 'Initialized',
      successRate: this.calculateSuccessRate(),
    });
  }

  /**
   * Execute an action with safety checks and learning
   */
  async executeAction(action: AgentAction): Promise<boolean> {
    if (!this.isActive) {
      logger.warn(`Agent ${this.config.name} is not active`);
      return false;
    }

    try {
      // Safety constraint check
      if (!this.validateAction(action)) {
        logger.warn(`Action failed safety check`, {
          agent: this.config.name,
          action,
        });
        return false;
      }

      this.currentTask = action.type;
      logger.info(`Executing action`, { agent: this.config.name, action });

      // Execute the specific action
      const result = await this.performAction(action);

      // Record experience for learning
      this.recordExperience(action, result ? 'success' : 'failure');

      // Update system state
      autonomousSystem.updateAgentState(this.config.name, {
        lastAction: action.type,
        successRate: this.calculateSuccessRate(),
      });

      return result;
    } catch (error) {
      logger.error(`Action execution failed`, {
        agent: this.config.name,
        action,
        error,
      });

      this.recordExperience(action, 'failure');
      return false;
    } finally {
      this.currentTask = null;
    }
  }

  /**
   * Validate action against safety constraints
   */
  protected validateAction(action: AgentAction): boolean {
    // Check if action type is in capabilities
    if (!this.config.capabilities.includes(action.type)) {
      logger.warn(`Action type not in capabilities`, {
        agent: this.config.name,
        actionType: action.type,
        capabilities: this.config.capabilities,
      });
      return false;
    }

    // Check safety constraints
    for (const constraint of this.config.safetyConstraints) {
      if (!this.checkSafetyConstraint(constraint, action)) {
        logger.warn(`Action violates safety constraint`, {
          agent: this.config.name,
          constraint,
          action,
        });
        return false;
      }
    }

    return true;
  }

  /**
   * Check individual safety constraint
   */
  protected checkSafetyConstraint(
    constraint: string,
    action: AgentAction
  ): boolean {
    // Override in subclasses for specific constraint logic
    return true;
  }

  /**
   * Perform the actual action - to be implemented by subclasses
   */
  protected abstract performAction(action: AgentAction): Promise<boolean>;

  /**
   * Record experience for learning
   */
  protected recordExperience(
    action: AgentAction,
    outcome: 'success' | 'failure' | 'warning'
  ): void {
    const experience = {
      action,
      outcome,
      timestamp: new Date().toISOString(),
      learning: this.extractLearning(action, outcome),
    };

    this.memory.experiences.push(experience);

    // Keep only last 1000 experiences
    if (this.memory.experiences.length > 1000) {
      this.memory.experiences = this.memory.experiences.slice(-1000);
    }

    // Update patterns
    this.updatePatterns(action, outcome);

    // Save memory
    this.saveMemory();
  }

  /**
   * Extract learning from experience
   */
  protected extractLearning(action: AgentAction, outcome: string): any {
    return {
      actionType: action.type,
      confidence: action.confidence,
      outcome,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Update pattern recognition
   */
  protected updatePatterns(action: AgentAction, outcome: string): void {
    const patternKey = `${action.type}_${outcome}`;
    this.memory.patterns[patternKey] =
      (this.memory.patterns[patternKey] || 0) + 1;
  }

  /**
   * Calculate success rate
   */
  protected calculateSuccessRate(): number {
    if (this.memory.experiences.length === 0) return 0;

    const successes = this.memory.experiences.filter(
      exp => exp.outcome === 'success'
    ).length;
    return successes / this.memory.experiences.length;
  }

  /**
   * Learn from experiences
   */
  async learn(): Promise<void> {
    logger.info(`Agent ${this.config.name} learning from experiences`);

    // Analyze patterns
    const patterns = this.analyzePatterns();

    // Update knowledge base
    this.updateKnowledge(patterns);

    // Update system with learning data
    autonomousSystem.recordLearningData(this.config.name, {
      patterns,
      successRate: this.calculateSuccessRate(),
      experienceCount: this.memory.experiences.length,
    });
  }

  /**
   * Analyze patterns in experiences
   */
  protected analyzePatterns(): Record<string, any> {
    const patterns: Record<string, any> = {};

    // Analyze success patterns
    const successActions = this.memory.experiences.filter(
      exp => exp.outcome === 'success'
    );
    patterns.successPatterns = this.groupByActionType(successActions);

    // Analyze failure patterns
    const failureActions = this.memory.experiences.filter(
      exp => exp.outcome === 'failure'
    );
    patterns.failurePatterns = this.groupByActionType(failureActions);

    return patterns;
  }

  /**
   * Group experiences by action type
   */
  protected groupByActionType(experiences: any[]): Record<string, any[]> {
    return experiences.reduce((groups, exp) => {
      const actionType = exp.action.type;
      if (!groups[actionType]) groups[actionType] = [];
      groups[actionType].push(exp);
      return groups;
    }, {});
  }

  /**
   * Update knowledge base
   */
  protected updateKnowledge(patterns: Record<string, any>): void {
    this.memory.knowledge = {
      ...this.memory.knowledge,
      ...patterns,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Load memory from persistent storage
   */
  protected async loadMemory(): Promise<void> {
    // In a real implementation, this would load from a database or file
    logger.info(`Loading memory for agent: ${this.config.name}`);
  }

  /**
   * Save memory to persistent storage
   */
  protected async saveMemory(): Promise<void> {
    // In a real implementation, this would save to a database or file
    logger.info(`Saving memory for agent: ${this.config.name}`);
  }

  /**
   * Get agent status
   */
  getStatus() {
    return {
      name: this.config.name,
      isActive: this.isActive,
      currentTask: this.currentTask,
      successRate: this.calculateSuccessRate(),
      experienceCount: this.memory.experiences.length,
      capabilities: this.config.capabilities,
    };
  }

  /**
   * Shutdown the agent
   */
  async shutdown(): Promise<void> {
    logger.info(`Shutting down agent: ${this.config.name}`);
    this.isActive = false;
    await this.saveMemory();
    autonomousSystem.updateAgentState(this.config.name, {
      status: 'idle',
      lastAction: 'Shutdown',
    });
  }
}
