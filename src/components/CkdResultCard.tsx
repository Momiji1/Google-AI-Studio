import React, { useState } from 'react';
import { HistoryRecord, getCkdStage } from '../types';
import { generatePdfReport } from '../utils/pdfGenerator';
import { 
  FileDown, 
  Info, 
  CheckCircle, 
  User, 
  ShieldAlert, 
  ClipboardList, 
  Stethoscope,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface CkdResultCardProps {
  record: HistoryRecord | null;
  allHistory: HistoryRecord[];
}

export default function CkdResultCard({ record, allHistory }: CkdResultCardProps) {
  const [userName, setUserName] = useState<string>(() => {
    return localStorage.getItem('egfr_user_name') || '';
  });
  const [showDetailedExplanation, setShowDetailedExplanation] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUserName(val);
    localStorage.setItem('egfr_user_name', val);
  };

  if (!record) {
    return (
      <div className="bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-8 text-center h-full flex flex-col items-center justify-center min-h-[300px]" id="no-result-card">
        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-3 animate-pulse">
          <ClipboardList className="w-6 h-6" />
        </div>
        <h3 className="font-semibold text-slate-700 text-lg">測定結果が未算出です</h3>
        <p className="text-slate-400 text-sm mt-1 max-w-sm">
          左の入力フォームに年齢、性別、血清クレアチニン値を入れて「eGFRを算出する」を押してください。
        </p>
      </div>
    );
  }

  const stage = getCkdStage(record.egfr);

  const handleDownloadPdf = () => {
    generatePdfReport(record, allHistory, userName);
  };

  // eGFRの解説を充実
  const generalExplanation: Record<string, { summary: string; detail: string }> = {
    G1: {
      summary: "腎機能は正常です。現在の良好な生活環境を維持しましょう。",
      detail: "健康な人の腎機能レベルです。ただし、強固な蛋白尿や血尿といった腎臓の障害を示す兆候が長期間（3ヶ月以上）持続する場合、G1であっても慢性腎臓病（CKD）と定義されます。自覚症状がなくても油断せず、毎年の健診受診を心がけましょう。"
    },
    G2: {
      summary: "腎機能はほぼ正常、あるいはごく軽度の低下です。",
      detail: "加齢による緩やかな腎機能低下や、軽度の腎臓への負荷が考えられます。一般の日常生活に支障はありません。しかし、蛋白尿がある場合はCKDとみなされ、早期の生活習慣病コントロール（高血圧・糖尿病など）が将来の機能保持のためにたいへん重要となります。"
    },
    G3a: {
      summary: "腎機能の軽度〜中等度の低下があります。CKD発症の可能性があります。",
      detail: "この段階から、本格的に腎機能低下への対応が必要となる『慢性腎臓病（CKD）』として意識する必要があります。高血圧、脂質異常、喫煙、過度の飲酒などのリスク因子を排除し、脱水状態にならないようこまめな水分補給（医師からの制限がない限り）を心がけてください。"
    },
    G3b: {
      summary: "腎機能が中等度〜高度に低下しています。腎臓専門医への相談を推奨します。",
      detail: "腎臓のろ過能力が正常の半分以下になっています。体内の老廃物の排出能力に低下が生じ始め、専門的な医学指導が必要です。特定の薬剤（痛み止めなど）の使用による腎障害のリスクも増大するため、お薬手帳の携行と医師への腎機能の伝達を徹底してください。"
    },
    G4: {
      summary: "腎機能が高度に低下しています。合併症に配慮し、厳正な食事・投薬指導が必要です。",
      detail: "腎不全へ進行する手前の危険な段階です。貧血、浮腫（むくみ）、電解質異常、骨の弱化などの合併症が起きやすいため、定期的な医療機関の通院と、厳密な食生活コントロール（タンパク質、塩分、カリウムなどの摂取管理）を怠らないようにしてください。"
    },
    G5: {
      summary: "末期腎不全（または極めて重度の腎機能低下）の状態です。代償療法の考慮が必要です。",
      detail: "腎機能が著しく衰えています。尿毒症の症状（だるさ、吐き気、浮腫、かゆみなど）を防ぐために、主治医と密に連携を取り、血液透析、腹膜透析、または腎移植といった最適な治療アプローチについて適切な準備を整えます。"
    }
  };

  const exp = generalExplanation[stage.code] || { summary: stage.description, detail: "" };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col justify-between h-full" id="ckd-result-card">
      <div>
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-50 text-teal-600 rounded-lg">
              <Stethoscope className="w-5 h-5" />
            </span>
            <h3 className="font-semibold text-slate-800 text-lg">今回のeGFR判定結果</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {record.date} の記録
          </span>
        </div>

        {/* 数値とステージ */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-6">
          <div className="md:col-span-5 bg-slate-50 rounded-2xl p-5 flex flex-col justify-center items-center text-center">
            <span className="text-slate-400 text-xs font-semibold mb-1">あなたのeGFR値</span>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-5xl font-black text-slate-900 tracking-tight font-mono">
                {record.egfr.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500 font-bold ml-1">
                mL/min/1.73m²
              </span>
            </div>
          </div>

          <div className="md:col-span-7 flex flex-col justify-center">
            <span className="text-slate-400 text-xs font-semibold mb-2">腎機能ステージ分類</span>
            <div className={`p-3 rounded-xl border ${stage.borderColor} ${stage.bgColor} flex items-center gap-3`}>
              <div 
                className="w-4 h-4 rounded-full shrink-0" 
                style={{ backgroundColor: stage.color }} 
              />
              <span className={`font-bold text-base sm:text-lg ${stage.textColor}`}>
                {stage.name}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 font-mono">
              基準範囲内の目安： {stage.range}
            </p>
          </div>
        </div>

        {/* 状態まとめメッセージ */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: stage.color }} />
          <div className="flex gap-2.5">
            <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-1">状態の解説</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{exp.summary}</p>
              
              {exp.detail && (
                <>
                  <button 
                    onClick={() => setShowDetailedExplanation(!showDetailedExplanation)}
                    className="mt-2 text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {showDetailedExplanation ? (
                      <>
                        詳細な解説を閉じる <ChevronUp className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <>
                        詳細な医学解説を見る <ChevronDown className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                  
                  {showDetailedExplanation && (
                    <p className="mt-2 text-xs text-slate-500 leading-relaxed bg-white border border-slate-100 p-3 rounded-lg animate-fadeIn">
                      {exp.detail}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* 生活・健康アドバイス */}
        <div className="mb-6">
          <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            生活管理おすすめアドバイス
          </h4>
          <div className="space-y-2.5">
            {stage.advice.map((adv, idx) => (
              <div key={idx} className="flex gap-3 text-sm text-slate-600 items-start">
                <span className="mt-1 w-1.5 h-1.5 bg-slate-400 rounded-full shrink-0" />
                <span className="leading-relaxed">{adv}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* PDF出力＆お名前設定 */}
      <div className="border-t border-slate-100 pt-5 mt-4">
        <label className="block text-xs font-semibold text-slate-500 mb-2">
          レポートに印刷するお名前（任意）
        </label>
        <div className="flex gap-2 mb-3">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
              <User className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={userName}
              onChange={handleNameChange}
              placeholder="例：山田 太郎"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              id="pdf-user-name-input"
            />
          </div>
        </div>

        <button
          onClick={handleDownloadPdf}
          className="w-full flex items-center justify-center gap-2 bg-slate-900 border border-transparent text-white font-bold py-3 px-4 rounded-xl hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 active:bg-slate-950 transition-all shadow-sm cursor-pointer"
          id="download-pdf-btn"
        >
          <FileDown className="w-4 h-4" />
          判定結果レポート (PDF) を出力
        </button>

        <p className="text-[10px] text-slate-400 mt-2.5 text-center leading-relaxed">
          ※医師に見せられる、経過グラフと履歴表つきA4レポートを自動生成します。<br />
          ※本指標は診断を行うものではありません。必ず医師の指導を受けてください。
        </p>
      </div>
    </div>
  );
}
