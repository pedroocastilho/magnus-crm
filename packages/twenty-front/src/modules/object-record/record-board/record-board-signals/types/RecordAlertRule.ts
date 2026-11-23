// Magnus (R8): linha do objeto "Regra de alerta", como vem da API. A gestao cria as regras na tabela do objeto.
// objeto vazio = vale para todas as abas; etapas vazio = qualquer etapa que nao seja de fechamento.
export type RecordAlertRuleRow = {
  id: string;
  name?: string | null;
  objeto?: string | null;
  etapas?: string | null;
  condicao?: string | null;
  dias?: number | null;
  nivel?: string | null;
  mensagem?: string | null;
  ativo?: boolean | null;
  position?: number | null;
};

export type RecordAlertLevel = 'attention' | 'urgent';

export type RecordAlert = {
  ruleId: string;
  label: string;
  level: RecordAlertLevel;
};

// O que se sabe do cartao para avaliar as regras. null = campo nao configurado (a regra nao se aplica).
export type RecordAlertFacts = {
  objectNameSingular: string;
  stageValue: string | null;
  stageLabel: string | null;
  isFinalStage: boolean;
  daysInStage: number | null;
  nextContactAt: string | null | undefined;
  hasNextContactField: boolean;
  hasAmount: boolean | null;
  hasOwner: boolean | null;
};
