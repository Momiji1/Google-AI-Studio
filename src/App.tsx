import React, { useState, useEffect } from 'react';
import { HistoryRecord, Gender, calculateEgfr, getCkdStage } from './types';
import EgfrForm from './components/EgfrForm';
import CkdResultCard from './components/CkdResultCard';
import HistoryGraph from './components/HistoryGraph';
import HistoryList from './components/HistoryList';
import { 
  Heart, 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  AlertTriangle,
  BookOpen,
  Apple,
  Droplets,
  Award
} from 'lucide-react';

const STORAGE_KEY = 'egfr_calculation_history';

// ユーザーが体験しやすいように、デモデータを定義
const DEFAULT_DEMO_RECORDS: HistoryRecord[] = [
  {
    id: 'demo-1',
    date: '2026-02-10',
    age: 58,
    gender: 'male',
    creatinine: 1.18,
    egfr: 50.1,
    memo: '健康診断で指摘を受ける。高血圧の薬を開始。'
  },
  {
    id: 'demo-2',
    date: '2026-03-15',
    age: 58,
    gender: 'male',
    creatinine: 1.24,
    egfr: 47.4,
    memo: '夜更かしが多く、少し脱水気味だった日。数値が低下。'
  },
  {
    id: 'demo-3',
    date: '2026-04-20',
    age: 58,
    gender: 'male',
    creatinine: 1.11,
    egfr: 53.6,
    memo: '減塩（目安6g/日）を徹底。起床時のだるさが減少。'
  },
  {
    id: 'demo-4',
    date: '2026-05-23',
    age: 58,
    gender: 'male',
    creatinine: 1.06,
    egfr: 56.4,
    memo: '今日（当日測定）。水分補給がしっかりできた。改善傾向！'
  }
];

export default function App() {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [activeRecord, setActiveRecord] = useState<HistoryRecord | null>(null);
  const [showFaqId, setShowFaqId] = useState<number | null>(null);

  // 初回読み込み
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as HistoryRecord[];
        setHistory(parsed);
        // 最新の日付のものをアクティブレコードにセット
        if (parsed.length > 0) {
          const sorted = [...parsed].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setActiveRecord(sorted[0]);
        }
      } catch (e) {
        console.error('履歴データの読み込みに失敗しました:', e);
      }
    } else {
      // 履歴が空の場合は自動的にデモデータをデポロードするかは自由ですが、
      // ユーザーに選択させると親切です。最初は空。
    }
  }, []);

  // 履歴保存
  const saveHistory = (newHistory: HistoryRecord[]) => {
    setHistory(newHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory));
  };

  // eGFR計算 & 経過記録処理
  const handleCalculate = (
    age: number,
    gender: Gender,
    creatinine: number,
    date: string,
    memo: string
  ) => {
    const egfrValue = calculateEgfr(age, gender, creatinine);

    // 同一日のデータがあれば上書きするか、新規追加するか
    // 本来は1日に複数回測りませんが、重複をチェックします。
    const sameDateIndex = history.findIndex((r) => r.date === date);

    let updatedHistory = [...history];
    const newRecord: HistoryRecord = {
      id: sameDateIndex >= 0 ? history[sameDateIndex].id : `rec-${Date.now()}`,
      date,
      age,
      gender,
      creatinine,
      egfr: egfrValue,
      memo: memo.trim()
    };

    if (sameDateIndex >= 0) {
      // 同一日の上書き（ユーザーの確認メッセージなしでマージ：使い勝手重視）
      updatedHistory[sameDateIndex] = newRecord;
    } else {
      updatedHistory.push(newRecord);
    }

    saveHistory(updatedHistory);
    setActiveRecord(newRecord);

    // 必要に応じて、結果詳細エリアへ自動でスクロールさせる（モバイルで快適な操作体験）
    const resultCardEl = document.getElementById('ckd-result-card');
    if (resultCardEl) {
      resultCardEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 記録削除
  const handleDeleteRecord = (id: string) => {
    const updated = history.filter((r) => r.id !== id);
    saveHistory(updated);

    if (activeRecord?.id === id) {
      if (updated.length > 0) {
        // 残った中の最新日付のレコードをアクティブにする
        const sorted = [...updated].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setActiveRecord(sorted[0]);
      } else {
        setActiveRecord(null);
      }
    }
  };

  // 一括クリア
  const handleClearHistory = () => {
    saveHistory([]);
    setActiveRecord(null);
  };

  // デモデータの強制ロード
  const handleLoadDemo = () => {
    saveHistory(DEFAULT_DEMO_RECORDS);
    // 直近データをアクティブに
    setActiveRecord(DEFAULT_DEMO_RECORDS[DEFAULT_DEMO_RECORDS.length - 1]);
  };

  // 履歴詳細のアクティブ切り替え
  const handleSelectRecord = (record: HistoryRecord) => {
    setActiveRecord(record);
    const resultCardEl = document.getElementById('ckd-result-card');
    if (resultCardEl) {
      resultCardEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // よくある質問
  const faqs = [
    {
      id: 1,
      q: "eGFR（推定糸球体濾過量）とは何ですか？",
      a: "腎臓のなかにあり、血液をろ過して尿をつくる『糸球体（しきゅうたい）』が、1分間にどれだけの血液をろ過してきれいにできるかを示した指標です。健康な成人の標準値は100前後（mL/min/1.73m²）です。この値が低下するほど、腎臓のごみ処理能力が衰えていることを意味します。"
    },
    {
      id: 2,
      q: "血清クレアチニン（Cr）とは何ですか？",
      a: "主に筋肉を動かすエネルギーの老廃物です。通常なら健全な腎臓でろ過され尿としてすべて排出されますが、腎機能が衰えるとろ過しきれなくなり、血液中にたまっていきます。そのため、血液中クレアチニン値が高くなると、結果としてeGFRの数値が下がります。"
    },
    {
      id: 3,
      q: "eGFRの数値は急に変動しますか？",
      a: "eGFRは、前日の極端な水分不足（脱水）、運動直後、あるいは直前の肉類の多量摂取などによって、一時的に大きく悪化（低下）して見える場合があります。慢性腎臓病（CKD）の確定診断は、このような一時的な低下を排除し、尿検査での蛋白尿などの異常を含めて『3ヶ月以上持続しているか』という経時的な推移で判断されます。そのため本ツールで日々の履歴を記録し、長期推移を追跡することが非常に有用です。"
    },
    {
      id: 4,
      q: "腎機能をこれ以上低下させないための生活習慣は？",
      a: "次の4つが最も重要とされています。\n①減塩（高血圧は腎血管を破壊します。1日6g未満が推奨されます）\n②脱水の予防（十分な水分補給が基本。※腎不全などで心負荷があって医師から制限がある場合を除く）\n③禁煙（タバコは腎臓の微小血管への血流を阻害します）\n④市販の痛み止め（解熱鎮痛剤：NSAIDsなど）の連用を避ける（一部の薬品は腎臓へ強烈な負担をかけます。必ず医師や薬剤師に相談してください）。"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 font-sans text-slate-900" id="main-app-container">
      {/* 1. 美しいアクセントヘッダー */}
      <header className="bg-white border-b border-slate-100 shadow-xs mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                eGFR 腎機能計算 ＆ 経過管理
              </h1>
              <p className="text-slate-400 text-xs font-semibold mt-0.5 sm:mt-0 font-mono">
                日本腎臓学会 ガイドライン算定・経過記録レポートシステム
              </p>
            </div>
          </div>
          {history.length === 0 && (
            <button
              onClick={handleLoadDemo}
              className="px-4 py-2 bg-slate-100 ring-1 ring-slate-200 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              id="load-demo-data-btn"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              お試しデモデータを読み込む
            </button>
          )}
        </div>
      </header>

      {/* 2. メインコンテンツエリア */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* トップの計算フォーム ＆ 結果ハイライト（2カラム構成） */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-10">
          {/* 左カラム: 入力フォーム */}
          <section className="lg:col-span-5 h-full">
            <EgfrForm onCalculate={handleCalculate} />
          </section>

          {/* 右カラム: 当回の結果＆アドバイスとPDF */}
          <section className="lg:col-span-7 h-full">
            <CkdResultCard record={activeRecord} allHistory={history} />
          </section>
        </div>

        {/* 下部: 長期グラフ推移 & 履歴リスト（フル幅） */}
        <section className="space-y-8 mb-10">
          {history.length > 0 && (
            <div className="transition-all animate-fadeIn">
              <HistoryGraph 
                history={history} 
                activeRecordId={activeRecord?.id ?? null} 
                onSelectRecord={handleSelectRecord} 
              />
            </div>
          )}

          <div className="transition-all animate-fadeIn">
            <HistoryList
              history={history}
              activeRecordId={activeRecord?.id ?? null}
              onSelectRecord={handleSelectRecord}
              onDeleteRecord={handleDeleteRecord}
              onClearHistory={handleClearHistory}
            />
          </div>
        </section>

        {/* 3. 付加価値：腎機能のお勉強・生活ガイド (FAQ) */}
        <section className="bg-white rounded-2xl border border-slate-100 p-6 sm:p-8 shadow-sm max-w-4xl mx-auto" id="faq-guide-section">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <span className="p-1.5 bg-sky-50 text-sky-600 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </span>
            <h3 className="font-semibold text-slate-800 text-base sm:text-lg">
              しっかりと理解する、腎機能とeGFRのまめ知識
            </h3>
          </div>

          {/* ミニお役立ち3つ */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/60">
              <div className="flex items-center gap-2 mb-2 text-emerald-800 font-bold text-xs sm:text-sm">
                <Apple className="w-4 h-4 text-emerald-600" />
                腎腎ケアの基本：減塩
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                高血圧、塩分過多は腎臓の細小動脈に多大な負荷を与えます。薄味に慣れるため、減塩スープ、スパイス等の活用で1日6g未満を意識しましょう。
              </p>
            </div>
            <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-100/60">
              <div className="flex items-center gap-2 mb-2 text-teal-800 font-bold text-xs sm:text-sm font-sans">
                <Droplets className="w-4 h-4 text-teal-600" />
                適切な水分補給
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                体内の水分低下（脱水）は、腎血流量を低下させeGFRの一時的な悪化を引き起こします。喉が渇く前に、こまめな水分補給を怠らないでください。
              </p>
            </div>
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/60">
              <div className="flex items-center gap-2 mb-2 text-amber-800 font-bold text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 animate-pulse" />
                お薬の飲み合わせに注意
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                市販の解熱鎮痛剤（痛み止め：NSAIDsなど。イブプロフェン、ロキソプロフェン等）を頻繁に飲むと腎機能が急速に低下することがあります。必ず医師等にご相談ください。
              </p>
            </div>
          </div>

          {/* アコーディオンFAQリスト */}
          <div className="space-y-3" id="accordion-group">
            {faqs.map((f) => {
              const isOpen = showFaqId === f.id;
              return (
                <div 
                  key={f.id} 
                  className="border border-slate-100 rounded-xl overflow-hidden transition"
                >
                  <button
                    onClick={() => setShowFaqId(isOpen ? null : f.id)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50/50 hover:bg-slate-50 text-left font-bold text-sm text-slate-800 transition cursor-pointer"
                  >
                    <span>{f.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 bg-white border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line animate-fadeIn">
                      {f.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* 4. 免責事項・フッター */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center border-t border-slate-200/60 pt-8" id="footer-section">
        <p className="text-[11px] text-slate-400 max-w-3xl mx-auto leading-relaxed">
          免責事項: 当システムによる推算糸球体濾過量（eGFR）は、日本腎臓学会作成の日本人成人向けの査定数式を用いた簡易算定値です。臨床的な腎機能障害を特定あるいは全般を排除するものではありません。診断やお食事制限等、個別の健康に関する指導は、必ず主治医や腎臓科などの専門医師・医療従事者に直接ご相談ください。また、18歳未満の小児等には別の小児算定式を用いる必要があります。
        </p>
        <p className="text-[10px] text-slate-400 mt-4">
          © eGFR計算 ＆ 経時経過記録システム すべての機能は無料、ローカル(LocalStorage)保護で提供されます。
        </p>
      </footer>
    </div>
  );
}
