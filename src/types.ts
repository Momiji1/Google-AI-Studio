/**
 * eGFR & CKD Types and Utilities
 */

export type Gender = 'male' | 'female';

export interface HistoryRecord {
  id: string;
  date: string;
  age: number;
  gender: Gender;
  creatinine: number;
  egfr: number;
  memo: string;
}

export interface CkdStage {
  code: 'G1' | 'G2' | 'G3a' | 'G3b' | 'G4' | 'G5';
  name: string;
  range: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
  advice: string[];
}

/**
 * 日本人のeGFR（血清クレアチニン値）算出式
 * 男性：194 × Cr^(-1.094) × Age^(-0.287)
 * 女性：194 × Cr^(-1.094) × Age^(-0.287) × 0.739
 */
export function calculateEgfr(age: number, gender: Gender, creatinine: number): number {
  if (age <= 0 || creatinine <= 0) return 0;
  const genderFactor = gender === 'female' ? 0.739 : 1.0;
  const egfr = 194 * Math.pow(creatinine, -1.094) * Math.pow(age, -0.287) * genderFactor;
  return Math.round(egfr * 10) / 10; // 小数点第1位に四捨五入
}

export const ckdStages: Record<string, CkdStage> = {
  G1: {
    code: 'G1',
    name: 'G1 (正常または高値)',
    range: 'eGFR ≧ 90',
    color: '#059669', // emerald-600
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800',
    description: '腎機能は正常に保たれています。',
    advice: [
      '現在の健康的な生活習慣を維持しましょう。',
      '十分な水分補給を心がけ、塩分の摂りすぎに気をつけましょう。',
      '年1回の健康診断で定期的に腎機能（尿たんぱく、血液検査）を確認してください。'
    ]
  },
  G2: {
    code: 'G2',
    name: 'G2 (軽度低下)',
    range: 'eGFR 60.0 〜 89.9',
    color: '#10b981', // emerald-500
    bgColor: 'bg-emerald-50/50',
    borderColor: 'border-emerald-100',
    textColor: 'text-emerald-700',
    description: '腎機能の軽度の低下が見られますが、多くは正常の範囲内です。',
    advice: [
      '高血圧、脂質異常症、糖尿病などの生活習慣病があれば、しっかりコントロールしましょう。',
      '適度な運動と、バランスの良い食事（過度な塩分を避けるなど）を続けましょう。',
      '尿たんぱくなどの異常がないか、定期健診をしっかり受けましょう。'
    ]
  },
  G3a: {
    code: 'G3a',
    name: 'G3a (軽度〜中等度低下)',
    range: 'eGFR 45.0 〜 59.9',
    color: '#f59e0b', // amber-500
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    description: '腎機能の中等度な低下の始まりです。慢性腎臓病（CKD）の疑いがあります。',
    advice: [
      'かかりつけ医等を受診し、一度詳しい腎臓の検査を受けることをお勧めします。',
      '減塩（1日6g未満が目安）を意識し、腎臓への負担を減らしましょう。',
      '脱水は一時的に腎機能を悪化させます。発熱時や下痢の際、激しい運動時は適切な水分補給をしてください。'
    ]
  },
  G3b: {
    code: 'G3b',
    name: 'G3b (中等度〜高度低下)',
    range: 'eGFR 30.0 〜 44.9',
    color: '#ea580c', // orange-600
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-850',
    description: '腎機能が低下しており、腎臓専門医による専門的な治療・管理の要件が高まります。',
    advice: [
      '腎臓専門医の定期的な受診を強くお勧めします。',
      '医師の指導のもとで厳格な血圧コントロール、食事療法（減塩、適切な蛋白質制限など）が必要です。',
      '他の病気の治療などで処方される薬剤（特に非ステロイド性抗炎症薬: NSAIDsや造影剤など）に注意が必要になります。必ず医師や薬剤師に腎機能低下を伝えてください。'
    ]
  },
  G4: {
    code: 'G4',
    name: 'G4 (高度低下)',
    range: 'eGFR 15.0 〜 29.9',
    color: '#dc2626', // red-600
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    textColor: 'text-red-800',
    description: '腎機能が著しく低下しています。腎不全の合併症に対する治療や、将来的な準備が必要です。',
    advice: [
      '腎臓専門医による緊密な管理が必要です。推奨される食事療法と内服薬治療を厳格に行いましょう。',
      '塩分、蛋白質、カリウム、リンの適切な管理・制限について専門の栄養指導を仰ぐことが重要です。',
      '貧血、骨軟化症、むくみなどの腎不全に伴う合併症の兆候に注意し、適切にケアを行います。'
    ]
  },
  G5: {
    code: 'G5',
    name: 'G5 (末期腎不全)',
    range: 'eGFR ＜ 15.0',
    color: '#7f1d1d', // red-900 / blackish red
    bgColor: 'bg-stone-100',
    borderColor: 'border-stone-300',
    textColor: 'text-stone-900',
    description: '腎臓のはたらきが極めて低下しています。尿毒症症状や水分過剰の兆候が現れやすくなります。',
    advice: [
      '腎臓専門医による厳格な経過観察のもと、最善の治療方針を選択・実践します。',
      '透析療法や腎移植などの腎代替療法の準備・実施について主治医と緊密に相談します。',
      '身体がだるい、息切れ、強いむくみなどの症状が出た場合は、すぐに主治医へ連絡してください。'
    ]
  }
};

export function getCkdStage(egfr: number): CkdStage {
  if (egfr >= 90) return ckdStages.G1;
  if (egfr >= 60) return ckdStages.G2;
  if (egfr >= 45) return ckdStages.G3a;
  if (egfr >= 30) return ckdStages.G3b;
  if (egfr >= 15) return ckdStages.G4;
  return ckdStages.G5;
}
