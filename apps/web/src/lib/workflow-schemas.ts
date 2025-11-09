/**
 * Workflow Validation Schemas
 * 
 * Zod schemas for validating workflow definitions and operations.
 */

import { z } from 'zod';
import { CommonSchemas } from './validation-guards';

export const WorkflowStepSchema = z.object({
  name: CommonSchemas.nonEmptyString.max(200, 'Step name too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const CreateWorkflowSchema = z.object({
  name: CommonSchemas.nonEmptyString.max(200, 'Workflow name too long'),
  steps: z
    .array(WorkflowStepSchema)
    .min(1, 'At least one step is required')
    .max(100, 'Too many steps'),
  metadata: z.record(z.unknown()).optional().default({}),
});

export const WorkflowIdSchema = z.object({
  workflowId: CommonSchemas.uuid,
});

export const UpdateWorkflowStepSchema = z.object({
  workflowId: CommonSchemas.uuid,
  stepName: CommonSchemas.nonEmptyString.max(200, 'Step name too long'),
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  errorMessage: z.string().max(1000, 'Error message too long').optional(),
});

export const UpdateWorkflowStatusSchema = z.object({
  workflowId: CommonSchemas.uuid,
  status: z.enum(['pending', 'running', 'completed', 'failed']),
  errorMessage: z.string().max(1000, 'Error message too long').optional(),
});

export type ValidatedWorkflowStep = z.infer<typeof WorkflowStepSchema>;
export type ValidatedCreateWorkflow = z.infer<typeof CreateWorkflowSchema>;
export type ValidatedWorkflowId = z.infer<typeof WorkflowIdSchema>;
export type ValidatedUpdateWorkflowStep = z.infer<typeof UpdateWorkflowStepSchema>;
export type ValidatedUpdateWorkflowStatus = z.infer<typeof UpdateWorkflowStatusSchema>;
