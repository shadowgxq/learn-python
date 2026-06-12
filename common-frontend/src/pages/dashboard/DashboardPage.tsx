import { useRef } from 'react';
import {
  useResponsiveLayout,
  useChartSize,
  useChartResponsiveOptions,
  LAYOUT_CONFIG,
} from './hooks/useResponsiveLayout';
import styles from './DashboardPage.module.css';

/**
 * 大屏 Dashboard 页面 - 纯响应式布局方案
 *
 * 适配规范：
 * 1. 固定部分（Header/Footer）保持固定尺寸
 * 2. 图表区域用 calc(100vw - 固定宽度) 自适应
 * 3. 图表组件 x/y 轴支持响应式缩放
 * 4. 不拉伸、不裁切、没有边距问题
 */
export default function DashboardPage() {
  const { contentWidth, contentHeight, windowWidth, windowHeight, aspectRatio } = useResponsiveLayout();

  // 图表容器 ref
  const chartRef1 = useRef<HTMLDivElement>(null);
  const chartRef2 = useRef<HTMLDivElement>(null);
  const chartSize1 = useChartSize(chartRef1);
  const chartSize2 = useChartSize(chartRef2);
  const chartResponsive1 = useChartResponsiveOptions(chartRef1);
  const chartResponsive2 = useChartResponsiveOptions(chartRef2);

  return (
    <div className={styles.screenWrapper}>
      {/* 顶部标题栏 - 固定高度 */}
      <header className={styles.header}>
        <h1 className={styles.title}>经营管控大屏</h1>
        <div className={styles.headerRight}>
          <span className={styles.debugInfo}>
            {windowWidth}×{windowHeight} | 比例: {aspectRatio.toFixed(2)} | 内容区: {contentWidth}×{contentHeight}
          </span>
          <span className={styles.time}>2024-01-15 14:30:00</span>
        </div>
      </header>

      {/* 内容区 - 响应式 Grid 布局 */}
      <main className={styles.content}>
        {/* 左侧面板 */}
        <section className={styles.leftPanel}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>销售趋势</h3>
            <div ref={chartRef1} className={styles.chartContainer}>
              <div className={styles.chartPlaceholder}>
                <div>折线图区域</div>
                <div className={styles.chartInfo}>
                  尺寸: {chartSize1.width}×{chartSize1.height}
                  {chartResponsive1.isSmall && ' [小屏模式]'}
                  {chartResponsive1.isMedium && ' [中屏模式]'}
                  {chartResponsive1.isLarge && ' [大屏模式]'}
                </div>
              </div>
            </div>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>区域分布</h3>
            <div className={styles.chartContainer}>
              <div className={styles.chartPlaceholder}>饼图区域</div>
            </div>
          </div>
        </section>

        {/* 中间主区域 */}
        <section className={styles.centerPanel}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>核心指标</h3>
            <div className={styles.kpiGrid}>
              <div className={styles.kpiItem}>
                <span className={styles.kpiValue}>1,234</span>
                <span className={styles.kpiLabel}>今日订单</span>
              </div>
              <div className={styles.kpiItem}>
                <span className={styles.kpiValue}>¥56.7万</span>
                <span className={styles.kpiLabel}>今日营收</span>
              </div>
              <div className={styles.kpiItem}>
                <span className={styles.kpiValue}>89.2%</span>
                <span className={styles.kpiLabel}>完成率</span>
              </div>
              <div className={styles.kpiItem}>
                <span className={styles.kpiValue}>98.5%</span>
                <span className={styles.kpiLabel}>满意度</span>
              </div>
            </div>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>实时监控</h3>
            <div ref={chartRef2} className={styles.chartContainer}>
              <div className={styles.chartPlaceholder}>
                <div>柱状图区域</div>
                <div className={styles.chartInfo}>
                  尺寸: {chartSize2.width}×{chartSize2.height}
                  {chartResponsive2.isSmall && ' [小屏模式]'}
                  {chartResponsive2.isMedium && ' [中屏模式]'}
                  {chartResponsive2.isLarge && ' [大屏模式]'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 右侧面板 */}
        <section className={styles.rightPanel}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>预警信息</h3>
            <div className={styles.alertList}>
              <div className={styles.alertItem}>⚠️ 库存不足预警</div>
              <div className={styles.alertItem}>⚠️ 设备异常预警</div>
              <div className={styles.alertItem}>⚠️ 订单超时预警</div>
            </div>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>排行榜</h3>
            <div className={styles.rankList}>
              <div className={styles.rankItem}>🥇 华东区 - ¥12.3万</div>
              <div className={styles.rankItem}>🥈 华南区 - ¥10.8万</div>
              <div className={styles.rankItem}>🥉 华北区 - ¥9.5万</div>
            </div>
          </div>
        </section>
      </main>

      {/* 底部状态栏 - 固定高度 */}
      <footer className={styles.footer}>
        <span>系统状态: 正常</span>
        <span>数据更新: 实时</span>
        <span>版本: v1.0.0</span>
      </footer>
    </div>
  );
}
