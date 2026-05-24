import React, { useState } from 'react';
import { HistoryRecord, getCkdStage } from '../types';
import { generatePdfReport } from '../utils/pdfGenerator';
import { 
  Trash2, 
  FileDown, 
  Search, 
  Filter, 
  Eye, 
  AlertOctagon, 
  ArrowUpDown,
  BookOpen
} from 'lucide-react';

interface HistoryListProps {
  history: HistoryRecord[];
  activeRecordId: string | null;
  onSelectRecord: (record: HistoryRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearHistory: () => void;
}

type SortKey = 'date_desc' | 'date_asc' | 'egfr_desc' | 'egfr_asc';
type FilterPeriod = 'all' | '3m' | '6m' | '1y';

export default function HistoryList({ 
  history, 
  activeRecordId, 
  onSelectRecord, 
  onDeleteRecord, 
  onClearHistory 
}: HistoryListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date_desc');
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // 1. 期間フィルタリング
  const filterByPeriod = (records: HistoryRecord[]) => {
    if (filterPeriod === 'all') return records;
    
    const now = new Date();
    let thresholdDate = new Date();
    
    if (filterPeriod === '3m') {
      thresholdDate.setMonth(now.getMonth() - 3);
    } else if (filterPeriod === '6m') {
      thresholdDate.setMonth(now.getMonth() - 6);
    } else if (filterPeriod === '1y') {
      thresholdDate.setFullYear(now.getFullYear() - 1);
    }
    
    return records.filter(r => new Date(r.date) >= thresholdDate);
  };

  // 2. 検索フィルタリング
  const filterBySearch = (records: HistoryRecord[]) => {
    if (!searchTerm.trim()) return records;
    const term = searchTerm.toLowerCase();
    return records.filter(r => {
      const stageName = getCkdStage(r.egfr).name.toLowerCase();
      const textGender = r.gender === 'male' ? '男性' : '女性';
      return (
        r.date.includes(term) ||
        r.age.toString().includes(term) ||
        r.creatinine.toString().includes(term) ||
        r.egfr.toString().includes(term) ||
        r.memo.toLowerCase().includes(term) ||
        textGender.includes(term) ||
        stageName.includes(term)
      );
    });
  };

  // 3. データソート
  const sortRecords = (records: HistoryRecord[]) => {
    const list = [...records];
    switch (sortKey) {
      case 'date_desc':
        return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case 'date_asc':
        return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      case 'egfr_desc':
        return list.sort((a, b) => b.egfr - a.egfr);
      case 'egfr_asc':
        return list.sort((a, b) => a.egfr - b.egfr);
      default:
        return list;
    }
  };

  const processedHistory = sortRecords(filterBySearch(filterByPeriod(history)));

  const handlePdfSingle = (record: HistoryRecord) => {
    const savedName = localStorage.getItem('egfr_user_name') || '';
    generatePdfReport(record, history, savedName);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm" id="history-list-card">
      {/* キャプション */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-150 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-teal-600" />
          <h3 className="font-semibold text-slate-800 text-base sm:text-lg">測定・記録履歴リスト</h3>
        </div>
        {history.length > 0 && (
          <div className="flex items-center gap-2">
            {!showConfirmClear ? (
              <button
                onClick={() => setShowConfirmClear(true)}
                className="text-xs font-bold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-200 transition-colors cursor-pointer ml-auto"
                id="show-clear-history-btn"
              >
                全履歴をクリア
              </button>
            ) : (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs font-bold text-red-600 whitespace-nowrap">本当に消去しますか？</span>
                <button
                  onClick={() => {
                    onClearHistory();
                    setShowConfirmClear(false);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold px-2.5 py-1.5 rounded transition cursor-pointer"
                  id="confirm-clear-history-btn"
                >
                  はい、消去
                </button>
                <button
                  onClick={() => setShowConfirmClear(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold px-2.5 py-1.5 rounded transition cursor-pointer"
                  id="cancel-clear-history-btn"
                >
                  閉じる
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {history.length === 0 ? (
        <div className="h-[150px] flex flex-col items-center justify-center text-center p-6 text-slate-400">
          <p className="text-sm font-medium">現在、記録されたデータはありません。</p>
          <p className="text-xs mt-1">数値を計算して保存し、推移の追跡をはじめましょう。</p>
        </div>
      ) : (
        <div>
          {/* コントロール（検索・絞り込み・ソート） */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-4">
            {/* 検索 */}
            <div className="relative md:col-span-4">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="履歴を検索 (日付/メモ/数値...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                id="history-search-input"
              />
            </div>

            {/* 期間期間フィルター */}
            <div className="flex items-center gap-1.5 md:col-span-4">
              <span className="text-slate-400 shrink-0">
                <Filter className="w-3.5 h-3.5" />
              </span>
              <div className="grid grid-cols-4 gap-1 w-full" id="period-filter-group">
                {(['all', '3m', '6m', '1y'] as const).map((period) => {
                  const labelMap = { all: '全期間', '3m': '直近3M', '6m': '直近6M', '1y': '直近1年' };
                  return (
                    <button
                      key={period}
                      onClick={() => setFilterPeriod(period)}
                      className={`text-[10px] sm:text-xs py-1.5 rounded-lg border text-center font-medium transition cursor-pointer ${
                        filterPeriod === period
                          ? 'bg-teal-50 border-teal-200 text-teal-700 font-bold'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {labelMap[period]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ソート */}
            <div className="flex items-center gap-1.5 md:col-span-4">
              <span className="text-slate-400 shrink-0">
                <ArrowUpDown className="w-3.5 h-3.5" />
              </span>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className="w-full text-xs px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition cursor-pointer font-medium"
                id="history-sort-select"
              >
                <option value="date_desc">日付の新しい順</option>
                <option value="date_asc">日付の古い順</option>
                <option value="egfr_desc">eGFRの高い順</option>
                <option value="egfr_asc">eGFRの低い順</option>
              </select>
            </div>
          </div>

          {processedHistory.length === 0 ? (
            <div className="p-8 text-center text-slate-450 text-xs bg-slate-50 border border-dashed border-slate-100 rounded-xl">
              該当する条件の履歴が見つかりません。条件を変えて再度お試しください。
            </div>
          ) : (
            <>
              {/* デスクトップ用テーブルレイアウト */}
              <div className="hidden md:block overflow-x-auto border border-slate-100 rounded-xl">
                <table className="min-w-full divide-y divide-slate-100 text-xs text-left" id="desktop-history-table">
                  <thead className="bg-slate-50 text-slate-500 font-semibold">
                    <tr>
                      <th className="py-3 px-4">測定日</th>
                      <th className="py-3 px-4">性別/年齢</th>
                      <th className="py-3 px-4">血清Cr (mg/dL)</th>
                      <th className="py-3 px-4">eGFR値</th>
                      <th className="py-3 px-4">ステージ</th>
                      <th className="py-3 px-4 max-w-[150px]">備忘録・メモ</th>
                      <th className="py-3 px-4 text-right">アクション</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-600">
                    {processedHistory.map((record) => {
                      const isActive = record.id === activeRecordId;
                      const stg = getCkdStage(record.egfr);

                      return (
                        <tr 
                          key={record.id}
                          className={`hover:bg-slate-50/70 transition-colors ${
                            isActive ? 'bg-teal-50/30' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 font-mono font-medium whitespace-nowrap">
                            {record.date}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {record.gender === 'male' ? '男性' : '女性'} / {record.age}歳
                          </td>
                          <td className="py-3.5 px-4 font-mono">
                            {record.creatinine.toFixed(2)}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-slate-800 font-mono">
                            {record.egfr.toFixed(1)}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${stg.textColor} ${stg.bgColor}`}>
                              G{stg.code}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 truncate max-w-[150px]" title={record.memo}>
                            {record.memo || <span className="text-slate-300">—</span>}
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => onSelectRecord(record)}
                                className="p-1 px-2 text-[10px] font-semibold text-teal-700 hover:bg-teal-100 rounded-md transition flex items-center gap-0.5 cursor-pointer border border-transparent"
                                title="結果詳細を上部に表示"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                開く
                              </button>
                              <button
                                onClick={() => handlePdfSingle(record)}
                                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition cursor-pointer"
                                title="この記録でPDFレポートを作成"
                              >
                                <FileDown className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => onDeleteRecord(record.id)}
                                className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
                                title="この記録を削除"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* モバイル用カードレイアウト（アコーディオン/リスト） */}
              <div className="block md:hidden space-y-3" id="mobile-history-cards">
                {processedHistory.map((record) => {
                  const isActive = record.id === activeRecordId;
                  const stg = getCkdStage(record.egfr);

                  return (
                    <div 
                      key={record.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isActive 
                          ? 'border-teal-400 bg-teal-50/10 ring-1 ring-teal-400' 
                          : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-mono text-slate-400 font-bold">{record.date}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${stg.textColor} ${stg.bgColor}`}>
                          G{stg.code} : {stg.name.split(' (')[0]}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-3 bg-white border border-slate-100 py-2 px-3 rounded-lg text-center">
                        <div>
                          <span className="text-[9px] block text-slate-400">基本</span>
                          <span className="text-xs font-semibold text-slate-700">
                            {record.gender === 'male' ? '男' : '女'} / {record.age}歳
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] block text-slate-400">血清Cr</span>
                          <span className="text-xs font-mono font-bold text-slate-700">
                            {record.creatinine.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-[9px] block text-slate-400">eGFR</span>
                          <span className="text-xs font-mono font-bold text-teal-700">
                            {record.egfr.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {record.memo && (
                        <p className="text-xs text-slate-500 bg-dashed bg-slate-100/50 p-2 rounded mb-3 text-left">
                          <span className="font-semibold text-[9px] text-slate-400 block mb-0.5">備忘メモ:</span>
                          {record.memo}
                        </p>
                      )}

                      <div className="flex items-center justify-between border-t border-slate-100/60 pt-2.5">
                        <button
                          onClick={() => onSelectRecord(record)}
                          className="text-[11px] font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          結果詳細を表示
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handlePdfSingle(record)}
                            className="p-1.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="PDFダウンロード"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteRecord(record.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 bg-white border border-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="削除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
