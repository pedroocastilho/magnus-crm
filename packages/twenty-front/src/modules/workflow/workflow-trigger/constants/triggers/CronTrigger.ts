import { type WorkflowTriggerType } from '@/workflow/types/Workflow';

export const CRON_TRIGGER: {
  defaultLabel: string;
  type: WorkflowTriggerType;
  icon: string;
} = {
  defaultLabel: 'Agendado',
  type: 'CRON',
  icon: 'IconClock',
};
