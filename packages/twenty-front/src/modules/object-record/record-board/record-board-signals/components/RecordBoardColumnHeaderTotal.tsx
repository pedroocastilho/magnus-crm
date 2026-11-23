import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { RecordBoardSignalsContext } from '@/object-record/record-board/record-board-signals/contexts/RecordBoardSignalsContext';
import { recordIndexGroupAggregateFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateFieldMetadataItemComponentState';
import { recordIndexGroupAggregateOperationComponentState } from '@/object-record/record-index/states/recordIndexGroupAggregateOperationComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { AggregateOperations } from '~/generated-metadata/graphql';
import { formatCurrencyShort } from '~/utils/format/formatCurrencyShort';

const StyledTotal = styled.div`
  align-items: baseline;
  display: flex;
  flex-shrink: 0;
  font-feature-settings: 'tnum';
  gap: ${themeCssVariables.spacing[1]};
  margin-left: auto;
  padding-left: ${themeCssVariables.spacing[2]};
  white-space: nowrap;
`;

const StyledCount = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledAmount = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-family: ${themeCssVariables.font.familyNumeric};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

// Moeda padrao do campo (o metadado guarda "'BRL'"; o formatCurrencyShort limpa as aspas).
const getDefaultCurrencyCode = (defaultValue: unknown): string | null => {
  if (typeof defaultValue !== 'object' || defaultValue === null) {
    return null;
  }

  const currencyCode = (defaultValue as { currencyCode?: unknown })
    .currencyCode;

  return typeof currencyCode === 'string' ? currencyCode : null;
};

// Magnus (Fase B): total em R$ da coluna, a direita do chip da etapa.
// A quantidade so entra aqui quando o total escolhido na visao nao e a contagem, e o valor
// so quando a visao nao soma o mesmo campo (para nao repetir nenhum dos dois).
export const RecordBoardColumnHeaderTotal = () => {
  const { columnDefinition } = useContext(RecordBoardColumnContext);
  const { config, columnSummaries } = useContext(RecordBoardSignalsContext);

  const recordIndexGroupAggregateOperation = useAtomComponentStateValue(
    recordIndexGroupAggregateOperationComponentState,
  );

  const recordIndexGroupAggregateFieldMetadataItem = useAtomComponentStateValue(
    recordIndexGroupAggregateFieldMetadataItemComponentState,
  );

  const summary = columnSummaries.get(columnDefinition.value ?? '');

  if (!isDefined(config) || !isDefined(summary)) {
    return null;
  }

  const shouldShowCount =
    recordIndexGroupAggregateOperation !== AggregateOperations.COUNT;

  // A visao ja soma o mesmo campo ao lado do chip: nao repete o valor.
  const isAmountShownByView =
    recordIndexGroupAggregateOperation === AggregateOperations.SUM &&
    isDefined(config.amountFieldMetadataItem) &&
    recordIndexGroupAggregateFieldMetadataItem?.id ===
      config.amountFieldMetadataItem.id;

  // "R$ 0" nao diz nada: coluna sem valor nenhum fica so com o chip.
  const hasAmount =
    !isAmountShownByView && isDefined(summary.amount) && summary.amount !== 0;

  if (!shouldShowCount && !hasAmount) {
    return null;
  }

  return (
    <StyledTotal>
      {shouldShowCount && <StyledCount>{summary.count}</StyledCount>}
      {hasAmount && isDefined(summary.amount) && (
        <StyledAmount>
          {formatCurrencyShort(summary.amount, {
            currencyCode: getDefaultCurrencyCode(
              config.amountFieldMetadataItem?.defaultValue,
            ),
          })}
        </StyledAmount>
      )}
    </StyledTotal>
  );
};
