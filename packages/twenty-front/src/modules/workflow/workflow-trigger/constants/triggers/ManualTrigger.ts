import { type WorkflowTriggerType } from '@/workflow/types/Workflow';

export const MANUAL_TRIGGER: {
  defaultLabel: string;
  type: WorkflowTriggerType;
  icon: string;
} = {
  defaultLabel: 'Execução manual',
  type: 'MANUAL',
  icon: 'IconHandMove',
};
