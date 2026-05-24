import React, { useState } from 'react';
import { Gender } from '../types';
import { Calculator, Calendar, UserRound, PenTool, Flame, RefreshCw } from 'lucide-react';

interface EgfrFormProps {
  onCalculate: (age: number, gender: Gender, creatinine: number, date: string, memo: string) => void;
  initialValues?: {
    age: number | '';
    gender: Gender;
    creatinine: number | '';
    date: string;
    memo: string;
  };
}

export default function EgfrForm({ onCalculate, initialValues }: EgfrFormProps) {
  const [age, setAge] = useState<number | ''>(initialValues?.age ?? '');
  const [gender, setGender] = useState<Gender>(initialValues?.gender ?? 'male');
  const [creatinine, setCreatinine] = useState<number | ''>(initialValues?.creatinine ?? '');
  const [date, setDate] = useState<string>(
    initialValues?.date ?? new Date().toISOString().split('T')[0]
  );
  const [memo, setMemo] = useState<string>(initialValues?.memo ?? '');
  const [validationError, setValidationError] = useState<string | null>(null);

  // 計算の送信
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // バリデーション
    if (age === '' || isNaN(age) || age <= 0 || age > 130) {
      setValidationError('正しい年齢（1〜130歳）を入力してください。');
      return;
    }
    if (creatinine === '' || isNaN(creatinine) || creatinine <= 0 || creatinine > 20) {
      setValidationError('血清クレアチニン値（0.1〜20.0 mg/dL）を正しく入力してください。');
      return;
    }
    if (!date) {
      setValidationError('測定日付を選択してください。');
      return;
    }

    onCalculate(Number(age), gender, Number(creatinine), date, memo);

    // 保存後にメモ欄はクリアする
    setMemo('');
  };

  // 入力リセット
  const handleReset = () => {
    setAge('');
    setCreatinine('');
    setMemo('');
    setDate(new Date().toISOString().split('T')[0]);
    setValidationError(null);
  };

  // クレアチニン値の目安テキスト
  const getCrStandardText = () => {
    if (gender === 'male') {
      return "男性の健康目安: 0.65 〜 1.07 mg/dL 程度";
    } else {
      return "女性の健康目安: 0.46 〜 0.79 mg/dL 程度";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm" id="egfr-calculator-form-card">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 bg-teal-50 text-teal-600 rounded-lg">
            <Calculator className="w-5 h-5" />
          </span>
          <h3 className="font-semibold text-slate-800 text-lg">測定指標入力</h3>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          入力をクリア
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 性別選択 */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-2">
            性別 <span className="text-red-500 font-bold">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3" id="gender-selection-group">
            <button
              type="button"
              onClick={() => setGender('male')}
              className={`py-3 px-4 rounded-xl font-medium border text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                gender === 'male'
                  ? 'border-teal-500 bg-teal-50/50 text-teal-700 font-bold'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
            >
              <UserRound className="w-4 h-4 text-teal-600" />
              男性 (Male)
            </button>
            <button
              type="button"
              onClick={() => setGender('female')}
              className={`py-3 px-4 rounded-xl font-medium border text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                gender === 'female'
                  ? 'border-teal-500 bg-teal-50/50 text-teal-700 font-bold'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
              }`}
            >
              <UserRound className="w-4 h-4 text-pink-500" />
              女性 (Female)
            </button>
          </div>
        </div>

        {/* 年齢とクレアチニンのグリッド */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* 年齢 */}
          <div>
            <label htmlFor="input-age" className="block text-xs font-semibold text-slate-500 mb-1.5">
              年齢 (歳) <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              id="input-age"
              type="number"
              min="1"
              max="130"
              placeholder="例：55"
              value={age}
              onChange={(e) => setAge(e.target.value !== '' ? Number(e.target.value) : '')}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
              required
            />
          </div>

          {/* クレアチニン値 */}
          <div>
            <label htmlFor="input-creatinine" className="block text-xs font-semibold text-slate-500 mb-1.5">
              血清クレアチニン値 (mg/dL) <span className="text-red-500 font-bold">*</span>
            </label>
            <input
              id="input-creatinine"
              type="number"
              step="0.01"
              min="0.1"
              max="20"
              placeholder="例：0.85"
              value={creatinine}
              onChange={(e) => setCreatinine(e.target.value !== '' ? Number(e.target.value) : '')}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition font-mono font-medium"
              required
            />
            {/* 動的な目安マイクロコピー */}
            <span className="block text-[10px] text-slate-400 mt-1 font-mono">
              {getCrStandardText()}
            </span>
          </div>
        </div>

        {/* 日付とメモ */}
        <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
          {/* 測定日付 */}
          <div>
            <label htmlFor="input-date" className="block text-xs font-semibold text-slate-500 mb-1.5">
              測定日（履歴の並び順に反映されます） <span className="text-red-500 font-bold">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 pointer-events-none">
                <Calendar className="w-4 h-4" />
              </span>
              <input
                id="input-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition"
                required
              />
            </div>
          </div>

          {/* メモ */}
          <div>
            <label htmlFor="input-memo" className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
              <PenTool className="w-3 h-3 text-slate-400" />
              メモ・備忘録（任意）
            </label>
            <textarea
              id="input-memo"
              rows={2}
              maxLength={200}
              placeholder="例：夕食が塩分多めだった、水分不足気味、健康診断の結果、など"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition text-sm leading-relaxed"
            />
          </div>
        </div>

        {validationError && (
          <div className="bg-red-50 text-red-700 text-xs font-medium p-3 rounded-xl border border-red-100 flex items-center gap-2">
            <Flame className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-teal-600 border border-transparent text-white font-bold py-3.5 px-4 rounded-xl hover:bg-teal-750 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-600 active:bg-teal-800 transition shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
          id="calculate-egfr-btn"
        >
          <Calculator className="w-4 h-4" />
          eGFRを算出して履歴に記録
        </button>

        <p className="text-[10px] text-slate-400 text-center leading-relaxed">
          ※本アプリは<strong>日本人用推算式</strong>(18歳以上)を用いてeGFRを計算します。<br />
          日本腎臓学会の推奨ガイドラインに準拠しています。
        </p>
      </form>
    </div>
  );
}
