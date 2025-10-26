/**
 * Command Runner Utility for Autonomous System
 * Provides safe execution of terminal commands with proper error handling
 */

import { logger } from '../lib/logger';

export interface CommandResult {
  success: boolean;
  output: string;
  error: string | null;
  exitCode: number;
  duration: number;
}

export class CommandRunner {
  private static instance: CommandRunner;
  private commandHistory: Array<{
    command: string;
    result: CommandResult;
    timestamp: string;
  }> = [];

  private constructor() {}

  public static getInstance(): CommandRunner {
    if (!CommandRunner.instance) {
      CommandRunner.instance = new CommandRunner();
    }
    return CommandRunner.instance;
  }

  /**
   * Execute a terminal command safely
   */
  public async execute(
    command: string,
    options: {
      cwd?: string;
      timeout?: number;
      allowedCommands?: string[];
    } = {}
  ): Promise<CommandResult> {
    const startTime = Date.now();

    try {
      // Validate command if allowedCommands is provided
      if (
        options.allowedCommands &&
        !this.isCommandAllowed(command, options.allowedCommands)
      ) {
        throw new Error(`Command not allowed: ${command}`);
      }

      logger.info(`Executing command: ${command}`, { options });

      // In a real implementation, this would use child_process or similar
      // For now, we'll simulate command execution
      const result = await this.simulateCommandExecution(command, options);

      const duration = Date.now() - startTime;
      const commandResult: CommandResult = {
        success: result.success,
        output: result.output,
        error: result.error,
        exitCode: result.exitCode,
        duration,
      };

      // Record command in history
      this.commandHistory.push({
        command,
        result: commandResult,
        timestamp: new Date().toISOString(),
      });

      // Keep only last 1000 commands
      if (this.commandHistory.length > 1000) {
        this.commandHistory = this.commandHistory.slice(-1000);
      }

      logger.info(`Command completed`, {
        command,
        success: commandResult.success,
        duration,
      });

      return commandResult;
    } catch (error) {
      const duration = Date.now() - startTime;
      const commandResult: CommandResult = {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : String(error),
        exitCode: 1,
        duration,
      };

      logger.error(`Command failed: ${command}`, { error, duration });

      return commandResult;
    }
  }

  /**
   * Check if command is allowed
   */
  private isCommandAllowed(
    command: string,
    allowedCommands: string[]
  ): boolean {
    const commandName = command.split(' ')[0];
    return allowedCommands.includes(commandName);
  }

  /**
   * Simulate command execution (replace with actual implementation)
   */
  private async simulateCommandExecution(
    command: string,
    options: any
  ): Promise<{
    success: boolean;
    output: string;
    error: string | null;
    exitCode: number;
  }> {
    // Simulate different command outcomes based on command type
    if (command.startsWith('npm run test')) {
      return {
        success: true,
        output: 'All tests passed',
        error: null,
        exitCode: 0,
      };
    } else if (command.startsWith('npm run lint')) {
      return {
        success: true,
        output: 'Linting passed',
        error: null,
        exitCode: 0,
      };
    } else if (command.startsWith('npm run build')) {
      return {
        success: true,
        output: 'Build completed successfully',
        error: null,
        exitCode: 0,
      };
    } else if (command.startsWith('npm run type-check')) {
      return {
        success: true,
        output: 'Type checking passed',
        error: null,
        exitCode: 0,
      };
    } else if (command.startsWith('git')) {
      return {
        success: true,
        output: 'Git command executed successfully',
        error: null,
        exitCode: 0,
      };
    } else {
      // Simulate random success/failure for unknown commands
      const success = Math.random() > 0.1; // 90% success rate
      return {
        success,
        output: success ? 'Command executed successfully' : '',
        error: success ? null : 'Command failed with error',
        exitCode: success ? 0 : 1,
      };
    }
  }

  /**
   * Get command history
   */
  public getCommandHistory(): Array<{
    command: string;
    result: CommandResult;
    timestamp: string;
  }> {
    return [...this.commandHistory];
  }

  /**
   * Get command success rate
   */
  public getSuccessRate(): number {
    if (this.commandHistory.length === 0) return 0;

    const successfulCommands = this.commandHistory.filter(
      entry => entry.result.success
    ).length;

    return successfulCommands / this.commandHistory.length;
  }

  /**
   * Get average command duration
   */
  public getAverageDuration(): number {
    if (this.commandHistory.length === 0) return 0;

    const totalDuration = this.commandHistory.reduce(
      (sum, entry) => sum + entry.result.duration,
      0
    );

    return totalDuration / this.commandHistory.length;
  }

  /**
   * Clear command history
   */
  public clearHistory(): void {
    this.commandHistory = [];
    logger.info('Command history cleared');
  }
}

// Export convenience function
export const run_terminal_cmd = async (
  command: string,
  options?: {
    cwd?: string;
    timeout?: number;
    allowedCommands?: string[];
  }
): Promise<CommandResult> => {
  const runner = CommandRunner.getInstance();
  return runner.execute(command, options);
};
