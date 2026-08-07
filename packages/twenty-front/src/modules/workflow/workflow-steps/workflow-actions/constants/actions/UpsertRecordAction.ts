import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const UPSERT_RECORD_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'UPSERT_RECORD'>;
  icon: string;
} = {
  defaultLabel: 'Criar ou Atualizar Registro',
  type: 'UPSERT_RECORD',
  icon: 'IconPencilPlus',
};
