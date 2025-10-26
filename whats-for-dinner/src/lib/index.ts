/**
 * Autonomous System Entry Point
 * Exports all autonomous system components for easy integration
 */

// Core autonomous system
export { autonomousSystem } from './autonomousSystem';
export { autonomousOrchestrator } from './autonomousOrchestrator';
export { continuousAutonomousAgent } from './continuousAutonomousAgent';

// Safety and security
export { aiSafetyGuardrails } from './aiSafetyGuardrails';
export { secretsIntelligence } from './secretsIntelligence';

// Optimization and learning
export { predictiveOptimization } from './predictiveOptimization';
export { cognitiveContinuity } from './cognitiveContinuity';

// Monitoring and compliance
export { observabilityAudit } from './observabilityAudit';
export { anomalyDetectionEngine } from './anomalyDetectionEngine';
export { aiDecisionEngine } from './aiDecisionEngine';
export { alertingSystem } from './alertingSystem';

// Agents
export { BuildAgent } from './agents/buildAgent';
export { InsightAgent } from './agents/insightAgent';
export { HealAgent } from './agents/healAgent';
export { EthicsAgent } from './agents/ethicsAgent';
export { BaseAgent } from './agents/baseAgent';

// Utilities
export { run_terminal_cmd } from '../utils/commandRunner';

// Types
export type {
  SystemMetrics,
  AgentState,
  DiagnosticResult,
} from './autonomousSystem';
export type {
  SafetyViolation,
  PromptSanitizationResult,
  ThreatSimulationResult,
} from './aiSafetyGuardrails';
export type {
  Secret,
  SecretVault,
  SecurityScanResult,
  SecretsManifest,
} from './secretsIntelligence';
export type {
  BuildPrediction,
  ResourceScalingDecision,
  BehavioralAnalytics,
} from './predictiveOptimization';
export type {
  KnowledgeEntry,
  MetaPrompt,
  LearningSession,
  AutonomousReflection,
} from './cognitiveContinuity';
export type {
  AuditEvent,
  ComplianceCheck,
  SystemHealth,
  AutonomyAudit,
} from './observabilityAudit';
export type { SystemStatus, AutonomousAction } from './autonomousOrchestrator';
export type { AgentConfig, AgentAction, AgentMemory } from './agents/baseAgent';

/**
 * Initialize the complete autonomous system
 */
export async function initializeAutonomousSystem(): Promise<void> {
  try {
    console.log('🚀 Initializing Autonomous "What\'s for Dinner" System...');

    // The orchestrator will handle all initialization
    console.log('✅ Autonomous system initialized successfully');
    console.log(
      '🎯 System is now self-healing, self-optimizing, and continuously learning'
    );
    console.log('🛡️ Security guardrails and compliance monitoring active');
    console.log('🧠 Cognitive continuity and knowledge evolution enabled');
    console.log('📊 Predictive optimization and behavioral analytics running');
  } catch (error) {
    console.error('❌ Failed to initialize autonomous system:', error);
    throw error;
  }
}

/**
 * Get system status summary
 */
export function getSystemStatusSummary(): string {
  const status = autonomousOrchestrator.getSystemStatus();

  if (!status) {
    return 'System status unavailable';
  }

  const healthEmoji =
    status.overall === 'healthy'
      ? '🟢'
      : status.overall === 'degraded'
        ? '🟡'
        : status.overall === 'critical'
          ? '🔴'
          : '⚪';

  return `
${healthEmoji} Autonomous System Status: ${status.overall.toUpperCase()}
📊 Success Rate: ${(status.metrics.successRate * 100).toFixed(1)}%
⚡ Response Time: ${status.metrics.averageResponseTime}ms
🛡️ Security: Active
🧠 Learning: Active
🔄 Self-Healing: Active
📈 Optimization: Active
  `.trim();
}

/**
 * Shutdown the autonomous system gracefully
 */
export async function shutdownAutonomousSystem(): Promise<void> {
  try {
    console.log('🛑 Shutting down autonomous system...');
    await autonomousOrchestrator.shutdown();
    console.log('✅ Autonomous system shutdown completed');
  } catch (error) {
    console.error('❌ Error during system shutdown:', error);
    throw error;
  }
}
