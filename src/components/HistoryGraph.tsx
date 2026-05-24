import React, { useState } from 'react';
import { HistoryRecord, getCkdStage } from '../types';
import { Calendar, TrendingUp, AlertCircle } from 'lucide-react';

interface HistoryGraphProps {
  history: HistoryRecord[];
  activeRecordId: string | null;
  onSelectRecord: (record: HistoryRecord) => void;
}

export default function HistoryGraph({ history, activeRecordId, onSelectRecord }: HistoryGraphProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 古い順にソートして並べる
  const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // グラフ描画領域の寸法
  const width = 600;
  const height = 300;
  const paddingLeft = 50;
  const paddingRight = 40;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // y座標の変換 (eGFRは0〜120でマッピング)
  const yMin = 0;
  const yMax = 120;
  const getSvgY = (val: number) => {
    const clamped = Math.max(yMin, Math.min(yMax, val));
    return gBottom - ((clamped - yMin) / (yMax - yMin)) * chartHeight;
  };

  const gBottom = height - paddingBottom;
  const gTop = paddingTop;

  // x座標の変換
  const getSvgX = (index: number) => {
    if (sortedHistory.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (index / (sortedHistory.length - 1)) * (chartWidth - 40); // 右端に余裕を持たせる
  };

  // eGFRステージごとの帯
  const stageBands = [
    { start: 90, end: 120, color: 'rgba(16, 185, 129, 0.06)', label: 'G1 正常' }, // emerald
    { start: 60, end: 90, color: 'rgba(16, 185, 129, 0.02)', label: 'G2 軽度低下' },
    { start: 45, end: 60, color: 'rgba(245, 158, 11, 0.05)', label: 'G3a 軽中低下' }, // amber
    { start: 30, end: 45, color: 'rgba(234, 88, 12, 0.06)', label: 'G3b 中重低下' }, // orange
    { start: 15, end: 30, color: 'rgba(239, 68, 68, 0.05)', label: 'G4 高度低下' }, // red
    { start: 0, end: 15, color: 'rgba(127, 29, 29, 0.07)', label: 'G5 末期不全' } // black/red
  ];

  // グリッド線
  const yGridLines = [15, 30, 45, 60, 90, 120];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm" id="history-graph-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold text-slate-800 text-base sm:text-lg">eGFRの長期的な経過推移</h3>
        </div>
        <div className="text-xs text-slate-400 font-mono hidden sm:block">
          プロットをタップして詳細表示
        </div>
      </div>

      {sortedHistory.length === 0 ? (
        <div className="h-[250px] flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 text-center px-4">
          <AlertCircle className="w-10 h-10 text-slate-300 mb-2" />
          <p className="text-slate-500 text-sm font-medium">履歴データがまだありません</p>
          <p className="text-slate-400 text-xs mt-1 max-w-sm">数値から計算して「履歴に保存する」を押すと、自動的に経過がグラフで視覚化されます。</p>
        </div>
      ) : (
        <div className="relative">
          {/* レスポンシブSVGコンテナ */}
          <div className="w-full overflow-x-auto scrollbar-hide">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full min-w-[500px] h-auto block"
              style={{ contentVisibility: 'auto' }}
            >
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* 1. ステージ帯 */}
              {stageBands.map((band, idx) => {
                const yTop = getSvgY(band.end);
                const yBtm = getSvgY(band.start);
                return (
                  <g key={idx}>
                    <rect
                      x={paddingLeft}
                      y={yTop}
                      width={chartWidth}
                      height={yBtm - yTop}
                      fill={band.color}
                    />
                    <text
                      x={width - paddingRight + 5}
                      y={yTop + (yBtm - yTop) / 2 + 4}
                      fill="#94a3b8"
                      fontSize="9"
                      fontWeight="500"
                      textAnchor="start"
                    >
                      {band.label}
                    </text>
                  </g>
                );
              })}

              {/* 2. グリッド線 と Y軸のラベル */}
              {yGridLines.map((val, idx) => {
                const y = getSvgY(val);
                return (
                  <g key={idx}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={width - paddingRight}
                      y2={y}
                      stroke={val === 60 || val === 90 ? '#e2e8f0' : '#f1f5f9'}
                      strokeWidth={val === 60 || val === 95 ? 1.5 : 1}
                      strokeDasharray={val !== 60 && val !== 90 ? '3,3' : undefined}
                    />
                    <text
                      x={paddingLeft - 10}
                      y={y + 4}
                      fill="#64748b"
                      fontSize="11"
                      fontFamily="monospace"
                      textAnchor="end"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Y軸のタイトル */}
              <text
                x={15}
                y={20}
                fill="#94a3b8"
                fontSize="10"
                fontWeight="500"
                textAnchor="start"
              >
                eGFR
              </text>

              {/* 3. グラフ上の折れ線エリア（グラデーション塗り） */}
              {sortedHistory.length > 1 && (
                <path
                  d={`
                    M ${getSvgX(0)} ${getSvgY(sortedHistory[0].egfr)}
                    ${sortedHistory.map((rec, i) => `L ${getSvgX(i)} ${getSvgY(rec.egfr)}`).join(' ')}
                    L ${getSvgX(sortedHistory.length - 1)} ${gBottom}
                    L ${getSvgX(0)} ${gBottom}
                    Z
                  `}
                  fill="url(#lineGrad)"
                />
              )}

              {/* 4. メイン折れ線 */}
              <path
                d={sortedHistory.map((rec, i) => `${i === 0 ? 'M' : 'L'} ${getSvgX(i)} ${getSvgY(rec.egfr)}`).join(' ')}
                fill="none"
                stroke="#0d9488"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* 5. プロットポイント */}
              {sortedHistory.map((record, idx) => {
                const cx = getSvgX(idx);
                const cy = getSvgY(record.egfr);
                const isActive = record.id === activeRecordId;
                const isHovered = hoveredIndex === idx;

                const stg = getCkdStage(record.egfr);

                return (
                  <g
                    key={record.id}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    onClick={() => onSelectRecord(record)}
                  >
                    {/* ホバー、またはアクティブ時の拡張エフェクト */}
                    {(isActive || isHovered) && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={isActive ? 12 : 9}
                        fill={stg.color}
                        opacity="0.25"
                      />
                    )}

                    {/* 基本ドット */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isActive ? 6 : 4.5}
                      fill="#ffffff"
                      stroke={isActive ? '#0f172a' : '#0d9488'}
                      strokeWidth={isActive ? 3 : 2}
                    />

                    {/* eGFR値の数値ラベル（点の上） */}
                    <text
                      x={cx}
                      y={cy - 10}
                      fill="#0f172a"
                      fontSize="11"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {record.egfr.toFixed(1)}
                    </text>

                    {/* 日付ラベル（X軸の下） */}
                    <text
                      x={cx}
                      y={gBottom + 18}
                      fill={isActive ? '#0d9488' : '#64748b'}
                      fontSize="10"
                      fontWeight={isActive ? 'bold' : 'normal'}
                      textAnchor="middle"
                    >
                      {record.date.substring(5)} {/* MM-DD 形式で出す */}
                    </text>
                  </g>
                );
              })}

              {/* 下部軸線 */}
              <line
                x1={paddingLeft}
                y1={gBottom}
                x2={width - paddingRight}
                y2={gBottom}
                stroke="#cbd5e1"
                strokeWidth="1.5"
              />
            </svg>
          </div>

          {/* ツールチップのような簡易ステータス表示（現在選択中・ホバー中のデータ詳細） */}
          <div className="mt-3 flex flex-wrap gap-4 items-center justify-between text-xs text-slate-500 bg-slate-50 rounded-xl p-3 border border-slate-100">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>全記録数: <strong className="text-slate-700">{history.length} 件</strong></span>
            </div>
            {activeRecordId && (
              (() => {
                const actRec = history.find(r => r.id === activeRecordId);
                if (!actRec) return null;
                const activeStg = getCkdStage(actRec.egfr);
                return (
                  <div className="flex flex-wrap items-center gap-2">
                    <span>選択中のデータ:</span>
                    <span className="font-semibold text-slate-700">{actRec.date}</span>
                    <span className="bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                      Cr: {actRec.creatinine.toFixed(2)}
                    </span>
                    <span className="font-bold font-mono text-teal-700">eGFR {actRec.egfr}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${activeStg.textColor} ${activeStg.bgColor}`}>
                      {activeStg.name.split(' (')[0]}
                    </span>
                  </div>
                );
              })()
            )}
          </div>
        </div>
      )}
    </div>
  );
}
