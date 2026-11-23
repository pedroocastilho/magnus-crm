import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { type RecordShowSummaryPurchasesConfig } from '@/object-record/record-show/record-show-magnus/types/RecordShowSummaryConfig';
import { buildRecordShowPurchases } from '@/object-record/record-show/record-show-magnus/utils/buildRecordShowPurchases';
import { styled } from '@linaria/react';
import { useMemo, useState } from 'react';
import {
  computeRelationGqlFieldJoinColumnName,
  isDefined,
} from 'twenty-shared/utils';
import { IconCreditCard } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { formatCurrencyShort } from '~/utils/format/formatCurrencyShort';

const VISIBLE_PURCHASES = 5;

const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledHeader = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledTotal = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-feature-settings: 'tnum';
  margin-left: auto;
`;

const StyledList = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledItem = styled.li`
  align-items: baseline;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: grid;
  font-size: ${themeCssVariables.font.size.sm};
  gap: 0 ${themeCssVariables.spacing[2]};
  grid-template-columns: minmax(0, 1fr) auto;
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledProduct = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledAmount = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-feature-settings: 'tnum';
  font-weight: ${themeCssVariables.font.weight.semiBold};

  &[data-refund='true'] {
    color: ${themeCssVariables.color.tomato11};
  }
`;

const StyledMeta = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  grid-column: 1 / -1;
`;

const StyledEmpty = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledMoreButton = styled.button`
  align-self: flex-start;
  background: none;
  border: none;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  min-height: 32px;
  padding: 0;
  text-decoration: underline;
`;

const pad = (value: number) => String(value).padStart(2, '0');

const formatPurchaseDate = (value: string | null) => {
  if (value === null) {
    return 'sem data';
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? 'sem data'
    : `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${String(date.getFullYear()).slice(2)}`;
};

type RecordShowMagnusPurchasesProps = {
  config: RecordShowSummaryPurchasesConfig;
  personId: string;
};

// Magnus (Fase D): o que a pessoa ja comprou (Kiwify, Hotmart, manual), com data e valor.
export const RecordShowMagnusPurchases = ({
  config,
  personId,
}: RecordShowMagnusPurchasesProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { canReadObjectRecords } = useObjectPermissionsForObject(
    config.objectMetadataItem.id,
  );

  const personJoinColumnName =
    config.personFieldMetadataItem.settings?.joinColumnName ??
    computeRelationGqlFieldJoinColumnName({
      name: config.personFieldMetadataItem.name,
    });

  const recordGqlFields = Object.fromEntries(
    [
      'id',
      config.amountFieldMetadataItem?.name,
      config.dateFieldMetadataItem?.name,
      config.sourceFieldMetadataItem?.name,
      config.productFieldMetadataItem?.name,
    ]
      .filter(isDefined)
      .map((fieldName) => [fieldName, true]),
  );

  const { records, loading } = useFindManyRecords({
    objectNameSingular: config.objectMetadataItem.nameSingular,
    filter: { [personJoinColumnName]: { eq: personId } },
    recordGqlFields,
    limit: 50,
    skip: !canReadObjectRecords,
  });

  const { purchases, purchaseCount, total, currencyCode } = useMemo(
    () => buildRecordShowPurchases(records, config),
    [records, config],
  );

  // Papel sem leitura dos pagamentos: a parte some, sem aviso de erro.
  if (!canReadObjectRecords || loading) {
    return null;
  }

  const visiblePurchases = isExpanded
    ? purchases
    : purchases.slice(0, VISIBLE_PURCHASES);

  return (
    <StyledSection aria-label="Compras">
      <StyledHeader>
        <IconCreditCard size={14} stroke={1.8} />
        {purchaseCount === 0 ? 'Compras' : `Compras (${purchaseCount})`}
        {total > 0 && (
          <StyledTotal>
            {formatCurrencyShort(total, { currencyCode })}
          </StyledTotal>
        )}
      </StyledHeader>
      {purchases.length === 0 ? (
        <StyledEmpty>Nenhuma compra registrada para esta pessoa.</StyledEmpty>
      ) : (
        <StyledList>
          {visiblePurchases.map((purchase) => (
            <StyledItem key={purchase.id}>
              <StyledProduct>
                {purchase.isRefund
                  ? `Estorno${isDefined(purchase.product) ? ` · ${purchase.product}` : ''}`
                  : (purchase.product ?? 'Compra')}
              </StyledProduct>
              <StyledAmount data-refund={purchase.isRefund}>
                {purchase.amount === null
                  ? '—'
                  : formatCurrencyShort(purchase.amount, {
                      currencyCode: purchase.currencyCode,
                    })}
              </StyledAmount>
              <StyledMeta>
                {[formatPurchaseDate(purchase.date), purchase.source]
                  .filter(isDefined)
                  .join(' · ')}
              </StyledMeta>
            </StyledItem>
          ))}
        </StyledList>
      )}
      {purchases.length > VISIBLE_PURCHASES && (
        <StyledMoreButton
          type="button"
          onClick={() => setIsExpanded((previous) => !previous)}
        >
          {isExpanded ? 'Mostrar menos' : `Ver todas (${purchases.length})`}
        </StyledMoreButton>
      )}
    </StyledSection>
  );
};
