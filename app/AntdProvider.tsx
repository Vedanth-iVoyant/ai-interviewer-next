'use client';
import { ConfigProvider, theme as antdTheme } from 'antd';

export default function AntdProvider({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: antdTheme.darkAlgorithm,
        token: {
          colorPrimary: '#3b82f6',
          colorBgBase: '#0a111f',
          colorBgContainer: '#121b2b',
          colorBgElevated: '#0e1625',
          colorBgLayout: '#0a111f',
          colorBorder: '#2b3750',
          colorBorderSecondary: '#2b3750',
          colorText: 'rgba(255,255,255,0.92)',
          colorTextSecondary: '#94a3b8',
          colorTextTertiary: '#64748b',
          colorTextPlaceholder: '#64748b',
          colorSuccess: '#22c55e',
          colorError: '#ef4444',
          colorWarning: '#f97316',
          colorInfo: '#3b82f6',
          borderRadius: 8,
          borderRadiusLG: 10,
          borderRadiusSM: 6,
          fontFamily: 'var(--font-inter), "Inter", sans-serif',
          fontFamilyCode: 'var(--font-mono), "JetBrains Mono", monospace',
          controlHeight: 34,
          fontSize: 13,
        },
        components: {
          Table: {
            headerBg: '#0e1625',
            headerSortActiveBg: '#0e1625',
            headerSortHoverBg: '#0e1625',
            rowHoverBg: 'rgba(59,130,246,0.05)',
            borderColor: '#2b3750',
            footerBg: '#0e1625',
            headerFilterHoverBg: '#0e1625',
          },
          Input: {
            colorBgContainer: '#0e1625',
            activeBorderColor: '#3b82f6',
            hoverBorderColor: '#4b93f7',
          },
          Select: {
            colorBgContainer: '#0e1625',
            optionSelectedBg: 'rgba(59,130,246,0.15)',
            optionActiveBg: 'rgba(59,130,246,0.08)',
          },
          Segmented: {
            itemSelectedBg: '#3b82f6',
            itemSelectedColor: '#ffffff',
            trackBg: '#0e1625',
            itemColor: '#94a3b8',
            itemHoverColor: '#ffffff',
            itemHoverBg: 'rgba(59,130,246,0.08)',
          },
          Card: {
            colorBgContainer: '#121b2b',
            colorBorderSecondary: '#2b3750',
          },
          Pagination: {
            colorBgContainer: 'transparent',
          },
          Dropdown: {
            colorBgElevated: '#0e1625',
          },
          Tooltip: {
            colorBgSpotlight: '#0e1625',
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
