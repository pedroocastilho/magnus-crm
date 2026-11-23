import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

// Magnus (Fase B): linha do objeto "Configuracao do quadro", como vem da API.
// Os campos sao nomes de campo do objeto do quadro; vazio = sinal desligado.
export type RecordBoardSignalsConfigRow = {
  id: string;
  objeto?: string | null;
  visao?: string | null;
  campoCor?: string | null;
  campoProximoContato?: string | null;
  campoEtapaDesde?: string | null;
  diasAtencao?: number | null;
  diasParado?: number | null;
  campoDono?: string | null;
  campoValor?: string | null;
  campoWhatsapp?: string | null;
  etapasFinais?: string | null;
  // Fase D (ficha do cliente)
  campoEtapa?: string | null;
  campoTemperatura?: string | null;
  campoProduto?: string | null;
  campoCampanha?: string | null;
  campoPessoa?: string | null;
  objetoCompras?: string | null;
  campoComprasPessoa?: string | null;
  campoComprasValor?: string | null;
  campoComprasData?: string | null;
  campoComprasOrigem?: string | null;
  campoComprasProduto?: string | null;
};

// Configuracao ja resolvida para um quadro: so os campos que existem e tem o tipo certo.
export type RecordBoardSignalsConfig = {
  colorFieldMetadataItem: FieldMetadataItem | null;
  nextContactFieldMetadataItem: FieldMetadataItem | null;
  stageSinceFieldMetadataItem: FieldMetadataItem | null;
  ownerFieldMetadataItem: FieldMetadataItem | null;
  amountFieldMetadataItem: FieldMetadataItem | null;
  whatsappFieldMetadataItem: FieldMetadataItem | null;
  attentionDays: number;
  staleDays: number;
  // Etapas de fechamento (ex.: Venda, Perdido): nao contam como paradas.
  finalStageValues: string[];
};
