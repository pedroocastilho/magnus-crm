import {
  formatStageDuration,
  type StageTrajectoryStep,
} from '@/activities/timeline-activities/utils/buildStageTrajectory';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { Tag } from 'twenty-ui/data-display';
import { type ThemeColor } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const VISIBLE_STEPS = 5;

const StyledSection = styled.section`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]};
  width: 100%;
`;

const StyledTitle = styled.h3`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledList = styled.ol`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledStep = styled.li`
  align-items: center;
  display: grid;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: minmax(0, 1fr) auto;
  min-height: 28px;
`;

const StyledStage = styled.span`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledSince = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  white-space: nowrap;
`;

const StyledDuration = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-feature-settings: 'tnum';
  white-space: nowrap;

  &[data-current='true'] {
    color: ${themeCssVariables.font.color.primary};
    font-weight: ${themeCssVariables.font.weight.semiBold};
  }
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

const formatSince = (since: Date | null) =>
  since === null
    ? 'antes'
    : `${pad(since.getDate())}/${pad(since.getMonth() + 1)}`;

type TimelineStageTrajectoryProps = {
  steps: StageTrajectoryStep[];
  stageFieldMetadataItem: FieldMetadataItem;
};

// Magnus (Fase D): trajetoria do cartao no topo da linha do tempo.
// Mostra as ultimas etapas (a atual por ultimo) e abre o resto num toque.
export const TimelineStageTrajectory = ({
  steps,
  stageFieldMetadataItem,
}: TimelineStageTrajectoryProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (steps.length === 0) {
    return null;
  }

  const visibleSteps = isExpanded ? steps : steps.slice(-VISIBLE_STEPS);
  const hiddenStepsCount = steps.length - visibleSteps.length;

  return (
    <StyledSection aria-label="Trajetória">
      <StyledTitle>Trajetória</StyledTitle>
      <StyledList>
        {visibleSteps.map((step, index) => {
          const option = stageFieldMetadataItem.options?.find(
            (candidate) => candidate.value === step.stage,
          );

          return (
            <StyledStep key={`${step.stage}-${index}`}>
              <StyledStage>
                <Tag
                  color={(option?.color as ThemeColor | undefined) ?? 'gray'}
                  text={option?.label ?? step.stage}
                />
                <StyledSince>desde {formatSince(step.since)}</StyledSince>
              </StyledStage>
              <StyledDuration data-current={step.isCurrent}>
                {step.isCurrent
                  ? `há ${formatStageDuration(step.durationMs)}`
                  : formatStageDuration(step.durationMs)}
              </StyledDuration>
            </StyledStep>
          );
        })}
      </StyledList>
      {(hiddenStepsCount > 0 || isExpanded) && (
        <StyledMoreButton
          type="button"
          onClick={() => setIsExpanded((previous) => !previous)}
        >
          {isExpanded
            ? 'Mostrar só as últimas'
            : `Ver as ${steps.length} etapas`}
        </StyledMoreButton>
      )}
    </StyledSection>
  );
};
