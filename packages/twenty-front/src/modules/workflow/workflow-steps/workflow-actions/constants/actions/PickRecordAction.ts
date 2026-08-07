import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const PICK_RECORD_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'PICK_RECORD'>;
  icon: string;
} = {
  defaultLabel: 'Escolher Registro',
  type: 'PICK_RECORD',
  icon: 'IconArrowsShuffle',
};
