import React, { useId } from 'react';
import { useTranslation } from 'react-i18next';

import type { CSSProperties } from '@actual-app/components/styles';
import { theme } from '@actual-app/components/theme';
import * as d from 'date-fns';
import {
  Bar,
  ComposedChart,
  Line,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Container } from '#components/reports/Container';
import { useFormat } from '#hooks/useFormat';
import { usePrivacyMode } from '#hooks/usePrivacyMode';

// Colors chosen to match the YNAB net worth report.
const DEBT_COLOR = '#E05A38';
const ASSETS_COLOR = '#4DA6E8';

type NetWorthBreakdownPoint = {
  x: string;
  y: number;
  assetsValue: number;
  debtValue: number;
  date: string;
  dateKey: string;
};

type NetWorthBreakdownGraphProps = {
  graphData: {
    data: NetWorthBreakdownPoint[];
  };
  interval: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  compact?: boolean;
  showTooltip?: boolean;
  style?: CSSProperties;
};

export function NetWorthBreakdownGraph({
  graphData,
  interval,
  compact = false,
  showTooltip = true,
  style,
}: NetWorthBreakdownGraphProps) {
  const { t } = useTranslation();
  const format = useFormat();
  const privacyMode = usePrivacyMode();
  const id = useId();

  const formatValue = (value: number) =>
    privacyMode ? '...' : format(value, 'financial');

  const tickFormat =
    interval === 'Yearly'
      ? 'yyyy'
      : interval === 'Daily' || interval === 'Weekly'
        ? 'MM/dd'
        : 'MM/yy';

  return (
    <Container style={{ ...style, ...(compact && { height: 'auto' }) }}>
      {(width, height) => (
        <ComposedChart
          responsive
          width={width}
          height={height}
          data={graphData.data}
          barCategoryGap="20%"
          barGap={0}
          margin={
            compact
              ? { top: 5, right: 0, bottom: 0, left: 0 }
              : { top: 20, right: 20, bottom: 10, left: 10 }
          }
        >
          <XAxis
            hide={compact}
            dataKey="dateKey"
            tickFormatter={(value: string) =>
              d.format(d.parseISO(value), tickFormat)
            }
            tick={{ fill: theme.pageText, fontSize: 13 }}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />

          <YAxis
            hide={compact}
            tickFormatter={formatValue}
            tick={{ fill: theme.pageText, fontSize: 13 }}
            tickLine={{ stroke: theme.pageTextSubdued }}
            axisLine={false}
            width={100}
          />

          <ReferenceLine
            y={0}
            stroke={theme.pageTextSubdued}
            strokeDasharray="2 3"
          />

          {!privacyMode && showTooltip && (
            <Tooltip
              formatter={(value, name) => [
                format(Number(value), 'financial'),
                name,
              ]}
              labelFormatter={(_label, payload) =>
                String(payload?.[0]?.payload?.date ?? '')
              }
            />
          )}

          <Bar
            dataKey="debtValue"
            name={t('Debt')}
            fill={DEBT_COLOR}
            isAnimationActive={false}
          />

          <Bar
            dataKey="assetsValue"
            name={t('Assets')}
            fill={ASSETS_COLOR}
            isAnimationActive={false}
          />

          <Line
            dataKey="y"
            name={t('Net worth')}
            stroke="#3D3D3D"
            strokeWidth={1.5}
            dot={{
              r: compact ? 3 : 5,
              fill: '#FFFFFF',
              stroke: '#3D3D3D',
              strokeWidth: 1.5,
            }}
            activeDot={{ r: 6 }}
            isAnimationActive={false}
            id={id}
          />
        </ComposedChart>
      )}
    </Container>
  );
}
