import {
  getDaysInStage,
  getNextContactSignal,
  getStaleLevel,
} from '@/object-record/record-board/record-board-signals/utils/getRecordBoardCardTimeSignals';

// Datas montadas no fuso local, para o teste valer em qualquer maquina.
const NOW = new Date(2026, 10, 20, 15, 0); // sexta, 20/11/2026 15:00
const local = (day: number, hour = 0, minute = 0) =>
  new Date(2026, 10, day, hour, minute).toISOString();

describe('getDaysInStage', () => {
  it('should count full days since the stage change', () => {
    expect(getDaysInStage(local(18, 15), NOW)).toBe(2);
    expect(getDaysInStage(local(18, 16), NOW)).toBe(1);
    expect(getDaysInStage(local(20, 9), NOW)).toBe(0);
  });

  it('should return null when the field is empty or invalid', () => {
    expect(getDaysInStage(null, NOW)).toBeNull();
    expect(getDaysInStage('', NOW)).toBeNull();
    expect(getDaysInStage('nao e data', NOW)).toBeNull();
  });

  it('should never be negative for a future date', () => {
    expect(getDaysInStage(local(25), NOW)).toBe(0);
  });
});

describe('getStaleLevel', () => {
  it('should follow the 2 and 5 day limits', () => {
    expect(getStaleLevel(1, 2, 5)).toBe('none');
    expect(getStaleLevel(2, 2, 5)).toBe('attention');
    expect(getStaleLevel(4, 2, 5)).toBe('attention');
    expect(getStaleLevel(5, 2, 5)).toBe('stale');
    expect(getStaleLevel(null, 2, 5)).toBe('none');
  });
});

describe('getNextContactSignal', () => {
  it('should show empty state', () => {
    expect(getNextContactSignal(null, NOW)).toEqual({
      state: 'empty',
      label: 'Sem próximo contato',
    });
  });

  it('should show today with time, even if the hour already passed', () => {
    expect(getNextContactSignal(local(20, 15, 30), NOW)).toEqual({
      state: 'today',
      label: 'Hoje, 15:30',
    });
    expect(getNextContactSignal(local(20, 9, 5), NOW).label).toBe(
      'Hoje, 09:05',
    );
  });

  it('should count overdue days by calendar day', () => {
    expect(getNextContactSignal(local(19, 23, 0), NOW)).toEqual({
      state: 'overdue',
      label: 'Atrasado há 1 dia',
    });
    expect(getNextContactSignal(local(18, 10), NOW).label).toBe(
      'Atrasado há 2 dias',
    );
  });

  it('should show tomorrow and weekday for future dates', () => {
    expect(getNextContactSignal(local(21, 10), NOW)).toEqual({
      state: 'future',
      label: 'Amanhã, 10:00',
    });
    expect(getNextContactSignal(local(24, 14), NOW).label).toBe(
      'Ter, 24/11 14:00',
    );
  });

  it('should not show time for a date-only field', () => {
    expect(getNextContactSignal('2026-11-20', NOW).label).toBe('Hoje');
    expect(getNextContactSignal('2026-11-24', NOW).label).toBe('Ter, 24/11');
  });
});
