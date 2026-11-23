import { RecordAlertList } from '@/object-record/record-board/record-board-signals/components/RecordAlertList';
import { RecordBoardSignalsConfigLoader } from '@/object-record/record-board/record-board-signals/components/RecordBoardSignalsConfigLoader';
import {
  getDaysInStage,
  getNextContactSignal,
  getStaleLevel,
} from '@/object-record/record-board/record-board-signals/utils/getRecordBoardCardTimeSignals';
import { RecordShowMagnusPurchases } from '@/object-record/record-show/record-show-magnus/components/RecordShowMagnusPurchases';
import { RecordShowMagnusTopFields } from '@/object-record/record-show/record-show-magnus/components/RecordShowMagnusTopFields';
import { useRecordAlerts } from '@/object-record/record-board/record-board-signals/hooks/useRecordAlerts';
import { useRecordShowSummaryConfig } from '@/object-record/record-show/record-show-magnus/hooks/useRecordShowSummaryConfig';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { useMemo, useState } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import {
  computeRelationGqlFieldJoinColumnName,
  isDefined,
} from 'twenty-shared/utils';
import { IconBrandWhatsapp } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { formatCurrencyShort } from '~/utils/format/formatCurrencyShort';

const StyledPanel = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[4]}
    ${themeCssVariables.spacing[4]};
`;

// Botao principal da ficha: bordo da marca, alvo de 44px para o dedo.
const StyledWhatsappButton = styled.a`
  align-items: center;
  background: ${themeCssVariables.accent.accent9};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.inverted};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[2]};
  justify-content: center;
  min-height: 44px;
  text-decoration: none;

  &:hover {
    background: ${themeCssVariables.accent.accent10};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.accent.accent8};
    outline-offset: 2px;
  }
`;

const StyledSummary = styled.dl`
  display: grid;
  gap: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 0;
`;

const StyledSummaryItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`;

const StyledSummaryLabel = styled.dt`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

const StyledSummaryValue = styled.dd`
  color: ${themeCssVariables.font.color.primary};
  font-feature-settings: 'tnum';
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &[data-state='today'],
  &[data-level='attention'] {
    color: ${themeCssVariables.color.amber11};
  }

  &[data-state='overdue'],
  &[data-level='stale'] {
    color: ${themeCssVariables.color.tomato11};
  }

  &[data-state='empty'] {
    color: ${themeCssVariables.font.color.tertiary};
  }
`;

type RecordShowMagnusPanelProps = {
  objectNameSingular: string;
  objectRecordId: string;
};

type RecordShowMagnusPanelContentProps = RecordShowMagnusPanelProps;

const RecordShowMagnusPanelContent = ({
  objectNameSingular,
  objectRecordId,
}: RecordShowMagnusPanelContentProps) => {
  const config = useRecordShowSummaryConfig(objectNameSingular);
  const recordStore = useAtomFamilyStateValue(
    recordStoreFamilyState,
    objectRecordId,
  );
  // R8: hora fixa ao abrir a ficha, para os alertas nao recalcularem a cada render
  const [openedAt] = useState(() => new Date());
  const alertFields = useMemo(
    () =>
      isDefined(config)
        ? {
            stageFieldMetadataItem: config.stageFieldMetadataItem,
            finalStageValues: config.finalStageValues,
            stageSinceFieldMetadataItem: config.stageSinceFieldMetadataItem,
            nextContactFieldMetadataItem: config.nextContactFieldMetadataItem,
            amountFieldMetadataItem: config.amountFieldMetadataItem,
            ownerFieldMetadataItem: config.ownerFieldMetadataItem,
          }
        : null,
    [config],
  );
  const alerts = useRecordAlerts({
    recordId: objectRecordId,
    objectNameSingular,
    fields: alertFields,
    now: openedAt,
  });

  if (!isDefined(config) || !isDefined(recordStore)) {
    return null;
  }

  const now = new Date();
  const read = (fieldName: string | undefined) =>
    isDefined(fieldName) ? recordStore[fieldName] : undefined;

  const topFields = [
    config.stageFieldMetadataItem,
    config.productFieldMetadataItem,
    config.temperatureFieldMetadataItem,
    config.ownerFieldMetadataItem,
  ].filter(isDefined);

  const whatsappUrl: unknown = read(
    config.whatsappFieldMetadataItem?.name,
  )?.primaryLinkUrl;

  const nextContact = isDefined(config.nextContactFieldMetadataItem)
    ? getNextContactSignal(read(config.nextContactFieldMetadataItem.name), now)
    : null;

  const daysInStage = isDefined(config.stageSinceFieldMetadataItem)
    ? getDaysInStage(read(config.stageSinceFieldMetadataItem.name), now)
    : null;

  const amountValue = read(config.amountFieldMetadataItem?.name);
  const amount =
    isDefined(amountValue?.amountMicros) && Number(amountValue.amountMicros) > 0
      ? formatCurrencyShort(Number(amountValue.amountMicros) / 1_000_000, {
          currencyCode: amountValue.currencyCode,
        })
      : null;

  const campaign: unknown = read(config.campaignFieldMetadataItem?.name);

  const personField = config.personFieldMetadataItem;
  const personId: unknown = isDefined(personField)
    ? (recordStore[personField.name]?.id ??
      recordStore[
        personField.settings?.joinColumnName ??
          computeRelationGqlFieldJoinColumnName({ name: personField.name })
      ])
    : null;

  return (
    <StyledPanel>
      {topFields.length > 0 && (
        <RecordShowMagnusTopFields fieldMetadataItems={topFields} />
      )}

      {alerts.length > 0 && <RecordAlertList alerts={alerts} />}

      {isNonEmptyString(whatsappUrl) && (
        <StyledWhatsappButton
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconBrandWhatsapp size={18} stroke={1.8} />
          Chamar no WhatsApp
        </StyledWhatsappButton>
      )}

      <StyledSummary>
        {isDefined(nextContact) && (
          <StyledSummaryItem>
            <StyledSummaryLabel>Próximo contato</StyledSummaryLabel>
            <StyledSummaryValue data-state={nextContact.state}>
              {nextContact.state === 'empty'
                ? 'Não marcado'
                : nextContact.label}
            </StyledSummaryValue>
          </StyledSummaryItem>
        )}
        {isDefined(config.stageSinceFieldMetadataItem) && (
          <StyledSummaryItem>
            <StyledSummaryLabel>Nesta etapa há</StyledSummaryLabel>
            <StyledSummaryValue
              data-level={getStaleLevel(
                daysInStage,
                config.attentionDays,
                config.staleDays,
              )}
            >
              {daysInStage === null
                ? '—'
                : daysInStage === 0
                  ? 'menos de 1 dia'
                  : `${daysInStage} ${daysInStage === 1 ? 'dia' : 'dias'}`}
            </StyledSummaryValue>
          </StyledSummaryItem>
        )}
        {isDefined(config.amountFieldMetadataItem) && (
          <StyledSummaryItem>
            <StyledSummaryLabel>Valor</StyledSummaryLabel>
            <StyledSummaryValue
              data-state={amount === null ? 'empty' : undefined}
            >
              {amount ?? 'Sem valor'}
            </StyledSummaryValue>
          </StyledSummaryItem>
        )}
        {isDefined(config.campaignFieldMetadataItem) && (
          <StyledSummaryItem>
            <StyledSummaryLabel>Campanha</StyledSummaryLabel>
            <StyledSummaryValue
              data-state={isNonEmptyString(campaign) ? undefined : 'empty'}
              title={isNonEmptyString(campaign) ? campaign : undefined}
            >
              {isNonEmptyString(campaign) ? campaign : 'Sem campanha'}
            </StyledSummaryValue>
          </StyledSummaryItem>
        )}
      </StyledSummary>

      {isDefined(config.purchases) && isNonEmptyString(personId) && (
        <RecordShowMagnusPurchases
          config={config.purchases}
          personId={personId}
        />
      )}
    </StyledPanel>
  );
};

// Magnus (Fase D): topo e resumo da ficha, logo abaixo do nome.
// Sem a "Configuracao do quadro" do objeto, nao aparece nada e a ficha fica como a do Twenty.
export const RecordShowMagnusPanel = ({
  objectNameSingular,
  objectRecordId,
}: RecordShowMagnusPanelProps) => (
  <>
    <RecordBoardSignalsConfigLoader />
    <RecordShowMagnusPanelContent
      objectNameSingular={objectNameSingular}
      objectRecordId={objectRecordId}
    />
  </>
);
