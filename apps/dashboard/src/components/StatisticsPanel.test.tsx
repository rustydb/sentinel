import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StatisticsPanel } from './StatisticsPanel';

describe('StatisticsPanel', () => {
  it('renders pilot statistics values', () => {
    render(
      <StatisticsPanel
        stats={{
          totalTurrets: 7,
          engagedTurrets: 2,
          onlineTurrets: 3,
          offlineTurrets: 2,
          aggressorsPast24Hours: 9,
        }}
      />,
    );

    expect(screen.getByTestId('statistics-panel')).toBeTruthy();
    expect(screen.getByLabelText('Metrics')).toBeTruthy();
    expect(screen.getByText('Total Turrets')).toBeTruthy();
    expect(screen.getByText('7')).toBeTruthy();
    expect(screen.getByText('Aggressors 24H')).toBeTruthy();
    expect(screen.getByText('9')).toBeTruthy();
  });
});
