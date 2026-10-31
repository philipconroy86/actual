import React from 'react';
import { Trans } from 'react-i18next';

import { useResponsive } from '@actual-app/components/hooks/useResponsive';
import {
  SvgArrowOutlineDown,
  SvgArrowOutlineUp,
  SvgArrowThickDown,
  SvgArrowThickUp,
} from '@actual-app/components/icons/v1';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import * as d from 'date-fns';

import { FinancialText } from '#components/FinancialText';
import { PrivacyFilter } from '#components/PrivacyFilter';
import { useFormat } from '#hooks/useFormat';
import { useLocale } from '#hooks/useLocale';

type SidebarPoint = {
  y: number;
  dateKey: string;
};

type NetWorthBreakdownSidebarProps = {
  points: SidebarPoint[];
  interval: 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
  hasFilters: boolean;
};

const labelStyle = {
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: 0.8,
  textTransform: 'uppercase',
  color: theme.tableHeaderText,
} as const;

function formatPercent(value: number) {
  return `${new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(Math.abs(value) * 100)}%`;
}

export function NetWorthBreakdownSidebar({
  points,
  interval,
  hasFilters,
}: NetWorthBreakdownSidebarProps) {
  const format = useFormat();
  const locale = useLocale();
  const { isNarrowWidth } = useResponsive();

  if (points.length === 0) {
    return null;
  }

  const first = points[0];
  const last = points[points.length - 1];
  const totalChange = last.y - first.y;
  const percentChange = first.y === 0 ? null : totalChange / Math.abs(first.y);

  const rowFormat =
    interval === 'Yearly'
      ? 'yyyy'
      : interval === 'Daily' || interval === 'Weekly'
        ? 'MMM d, yyyy'
        : 'MMM yyyy';
  const rangeFormat = interval === 'Yearly' ? 'yyyy' : rowFormat;
  const formatDate = (dateKey: string, dateFormat: string) =>
    d.format(d.parseISO(dateKey), dateFormat, { locale });

  const firstLabel = formatDate(first.dateKey, rangeFormat);
  const lastLabel = formatDate(last.dateKey, rangeFormat);
  const rangeLabel =
    firstLabel === lastLabel ? firstLabel : `${firstLabel}–${lastLabel}`;

  const rows = points
    .map((point, idx) => ({
      key: point.dateKey,
      label: formatDate(point.dateKey, rowFormat),
      networth: point.y,
      change: idx === 0 ? null : point.y - points[idx - 1].y,
    }))
    .reverse();

  const ChangeIcon = totalChange < 0 ? SvgArrowOutlineDown : SvgArrowOutlineUp;

  return (
    <View
      style={{
        width: isNarrowWidth ? '100%' : 300,
        flexShrink: 0,
        backgroundColor: theme.tableBackground,
        ...(isNarrowWidth
          ? { borderTop: `1px solid ${theme.tableBorderSeparator}` }
          : { borderLeft: `1px solid ${theme.tableBorderSeparator}` }),
        padding: '30px 20px 20px',
      }}
    >
      <View style={{ alignItems: 'center', textAlign: 'center' }}>
        <Text
          style={{
            fontSize: 20,
            fontWeight: 700,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            color: theme.tableText,
          }}
        >
          {rangeLabel}
        </Text>
        <Text style={{ fontSize: 13, color: theme.tableHeaderText }}>
          {hasFilters ? (
            <Trans>Filtered transactions</Trans>
          ) : (
            <Trans>All accounts included</Trans>
          )}
        </Text>
      </View>

      <View
        style={{
          alignItems: 'center',
          marginTop: 24,
          paddingTop: 24,
          paddingBottom: 24,
          borderTop: `1px solid ${theme.tableBorderSeparator}`,
          borderBottom: `1px solid ${theme.tableBorderSeparator}`,
        }}
      >
        <Text style={labelStyle}>
          <Trans>Change in net worth</Trans>
        </Text>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            marginTop: 6,
          }}
        >
          <ChangeIcon
            width={22}
            height={22}
            style={{ color: theme.tableText, flexShrink: 0 }}
          />
          <PrivacyFilter>
            <FinancialText
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: theme.tableText,
              }}
            >
              {format(Math.abs(totalChange), 'financial')}
            </FinancialText>
          </PrivacyFilter>
        </View>
        {percentChange !== null && (
          <PrivacyFilter>
            <FinancialText
              style={{
                fontSize: 13,
                color: theme.tableHeaderText,
                marginTop: 2,
              }}
            >
              {formatPercent(percentChange)}
            </FinancialText>
          </PrivacyFilter>
        )}
      </View>

      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginTop: 24,
          marginBottom: 8,
        }}
      >
        <Text style={labelStyle}>
          <Trans>Month</Trans>
        </Text>
        <Text style={labelStyle}>
          <Trans>Net worth</Trans>
        </Text>
      </View>

      <View
        style={{
          overflowY: 'auto',
          maxHeight: isNarrowWidth ? undefined : 360,
        }}
      >
        {rows.map(row => (
          <View
            key={row.key}
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 0',
              fontSize: 13,
              color: theme.tableText,
            }}
          >
            <Text>{row.label}</Text>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <PrivacyFilter>
                <FinancialText>
                  {format(row.networth, 'financial')}
                </FinancialText>
              </PrivacyFilter>
              <View style={{ width: 12, alignItems: 'center' }}>
                {row.change === null || row.change === 0 ? (
                  <Text>–</Text>
                ) : row.change > 0 ? (
                  <SvgArrowThickUp
                    width={12}
                    height={12}
                    style={{ color: theme.reportsNumberPositive }}
                  />
                ) : (
                  <SvgArrowThickDown
                    width={12}
                    height={12}
                    style={{ color: theme.reportsNumberNegative }}
                  />
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
