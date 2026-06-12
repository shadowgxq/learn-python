/**
 * 大屏响应式布局 Hook
 *
 * 方案：纯 CSS 响应式布局（非 transform 缩放）
 *
 * 优点：
 * 1. 没有缩放模糊
 * 2. 图表充分利用空间
 * 3. 没有边距问题
 *
 * 思路：
 * - 固定部分（Header/Footer/Sidebar）保持固定尺寸
 * - 图表区域用 calc(100vw - 固定宽度) 自适应
 * - 图表组件（ECharts）x/y 轴支持响应式
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// 固定部分尺寸
export const LAYOUT_CONFIG = {
  headerHeight: 60,    // 顶部标题栏
  footerHeight: 40,    // 底部状态栏
  sidebarWidth: 0,     // 侧边栏（如有）
  cardPadding: 16,     // 卡片内边距
  gridGap: 16,         // 网格间距
} as const;

interface ResponsiveLayout {
  /** 可用内容区宽度 */
  contentWidth: number;
  /** 可用内容区高度 */
  contentHeight: number;
  /** 窗口宽度 */
  windowWidth: number;
  /** 窗口高度 */
  windowHeight: number;
  /** 是否为宽屏（比例 > 16:9） */
  isWideScreen: boolean;
  /** 是否为高屏（比例 < 16:9） */
  isTallScreen: boolean;
  /** 当前屏幕比例 */
  aspectRatio: number;
}

export function useResponsiveLayout(): ResponsiveLayout {
  const [layout, setLayout] = useState<ResponsiveLayout>(() => calculateLayout());

  const handleResize = useCallback(() => {
    setLayout(calculateLayout());
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    // 初始化时触发一次
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  return layout;
}

function calculateLayout(): ResponsiveLayout {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // 可用内容区（减去固定部分）
  const contentWidth = windowWidth - LAYOUT_CONFIG.sidebarWidth;
  const contentHeight = windowHeight - LAYOUT_CONFIG.headerHeight - LAYOUT_CONFIG.footerHeight;

  // 判断屏幕类型
  const designRatio = 16 / 9;
  const aspectRatio = contentWidth / contentHeight;

  return {
    contentWidth,
    contentHeight,
    windowWidth,
    windowHeight,
    isWideScreen: aspectRatio > designRatio,
    isTallScreen: aspectRatio < designRatio,
    aspectRatio,
  };
}

/**
 * 图表响应式尺寸 Hook
 * 用于 ECharts 等图表组件，监听容器大小变化
 */
export function useChartSize(containerRef: React.RefObject<HTMLElement>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width: Math.floor(width), height: Math.floor(height) });
      }
    });

    observer.observe(containerRef.current);
    // 初始化
    const { width, height } = containerRef.current.getBoundingClientRect();
    setSize({ width: Math.floor(width), height: Math.floor(height) });

    return () => observer.disconnect();
  }, [containerRef]);

  return size;
}

/**
 * ECharts 响应式配置 Hook
 * 根据容器大小自动调整图表配置
 */
export function useChartResponsiveOptions(containerRef: React.RefObject<HTMLElement>) {
  const { width, height } = useChartSize(containerRef);

  // 根据容器大小计算响应式配置
  const fontSize = width > 600 ? 12 : width > 400 ? 11 : 10;
  const axisLabelRotate = width < 500 ? 45 : 0;

  return {
    width,
    height,
    fontSize,
    axisLabelRotate,
    isSmall: width < 400,
    isMedium: width >= 400 && width < 600,
    isLarge: width >= 600,
  };
}
