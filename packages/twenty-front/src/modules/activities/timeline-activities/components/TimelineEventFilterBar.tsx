import { type TimelineEventFilter } from '@/activities/timeline-activities/utils/getTimelineEventCategory';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const FILTER_LABELS: Record<TimelineEventFilter, string> = {
  all: 'Todos',
  notes: 'Notas',
  tasks: 'Tarefas',
  stages: 'Etapas',
};

const StyledBar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const StyledFilterButton = styled.button`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  min-height: 32px;
  padding: 0 ${themeCssVariables.spacing[3]};

  &[aria-pressed='true'] {
    background: ${themeCssVariables.accent.accent9};
    border-color: ${themeCssVariables.accent.accent9};
    color: ${themeCssVariables.font.color.inverted};
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.accent.accent8};
    outline-offset: 2px;
  }
`;

const StyledCount = styled.span`
  font-feature-settings: 'tnum';
  opacity: 0.75;
`;

type TimelineEventFilterBarProps = {
  activeFilter: TimelineEventFilter;
  counts: Record<TimelineEventFilter, number>;
  onFilterChange: (filter: TimelineEventFilter) => void;
};

// Magnus (Fase D): filtros da linha do tempo; o numero e do que ja foi carregado.
export const TimelineEventFilterBar = ({
  activeFilter,
  counts,
  onFilterChange,
}: TimelineEventFilterBarProps) => (
  <StyledBar role="group" aria-label="Filtrar linha do tempo">
    {(Object.keys(FILTER_LABELS) as TimelineEventFilter[]).map((filter) => (
      <StyledFilterButton
        key={filter}
        type="button"
        aria-pressed={activeFilter === filter}
        onClick={() => onFilterChange(filter)}
      >
        {FILTER_LABELS[filter]}
        <StyledCount>{counts[filter]}</StyledCount>
      </StyledFilterButton>
    ))}
  </StyledBar>
);
