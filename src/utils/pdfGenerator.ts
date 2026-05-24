import { jsPDF } from 'jspdf';
import { HistoryRecord, getCkdStage } from '../types';

/**
 * eGFR & CKDの測定結果と経時推移グラフを含んだ、美しくプロフェッショナルなA4判のPDFレポートを生成しダウンロードします。
 */
export function generatePdfReport(activeRecord: HistoryRecord, allHistory: HistoryRecord[], userName: string = ''): void {
  // A4サイズ用のCanvasを作成 (150dpi想定：1190 x 1684 px、アスペクト比 1:1.414)
  const width = 1190;
  const height = 1684;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    alert('PDF生成用の描画コンテキストを取得できませんでした。');
    return;
  }

  // 1. 背景の初期化（白色）
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // 2. 上品な外枠ボーダー
  ctx.strokeStyle = '#e2e8f0'; // slate-200
  ctx.lineWidth = 12;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  ctx.strokeStyle = '#0f172a'; // slate-900 (アクセントの内枠)
  ctx.lineWidth = 2;
  ctx.strokeRect(32, 32, width - 64, height - 64);

  // 3. ヘッダーセクション（グラデーションヘッダーとタイトル）
  // 医療用・健康管理用の清廉なエメラルド〜スレートのグラデーション
  const headerGrad = ctx.createLinearGradient(40, 40, width - 40, 40);
  headerGrad.addColorStop(0, '#0f172a'); // slate-900
  headerGrad.addColorStop(1, '#1e293b'); // slate-800
  ctx.fillStyle = headerGrad;
  ctx.fillRect(40, 40, width - 80, 140);

  // ヘッダーロゴ（十字と円を組み合わせたミニマルモダンデザイン）
  ctx.beginPath();
  ctx.arc(100, 110, 32, 0, Math.PI * 2);
  ctx.fillStyle = '#10b981'; // emerald-500
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  // 十字の描画
  ctx.fillRect(96, 92, 8, 36);
  ctx.fillRect(82, 106, 36, 8);

  // ヘッダータイトルテキスト
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 32px "Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Meiryo", sans-serif';
  ctx.fillText('eGFR 腎機能 経過観察レポート', 160, 105);

  ctx.fillStyle = '#94a3b8'; // slate-400
  ctx.font = 'normal 16px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('腎機能の簡易指標（推算糸球体濾過量）の推移および生活管理アドバイス', 160, 138);

  // 4. 患者情報・基本情報エリア
  const infoY = 220;
  // 背景カード
  ctx.fillStyle = '#f8fafc'; // slate-50
  ctx.fillRect(50, infoY, width - 100, 90);
  ctx.strokeStyle = '#cbd5e1'; // slate-300
  ctx.lineWidth = 1;
  ctx.strokeRect(50, infoY, width - 100, 90);

  ctx.fillStyle = '#334155'; // slate-700
  ctx.font = 'bold 18px "Helvetica Neue", Arial, sans-serif';
  const displayUser = userName.trim() ? `${userName} 様` : '（お名前の記載なし）';
  ctx.fillText(`測定者： ${displayUser}`, 80, infoY + 52);

  ctx.font = 'normal 16px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#64748b'; // slate-500
  const dateStr = activeRecord.date || new Date().toISOString().split('T')[0];
  ctx.fillText(`レポート生成日： ${dateStr}`, 600, infoY + 35);
  ctx.fillText(`日本腎臓学会 CKD（慢性腎臓病）診療ガイドに適合`, 600, infoY + 65);

  // 5. 今回の測定結果ハイライト (左側) & CKDについて (右側)
  const resultY = 340;
  const colWidth = (width - 130) / 2;

  // 5a. 今回の測定結果 (左カード: 2層：eGFR数値とステージ)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  // 影を入れる（Canvas shadow）
  ctx.shadowColor = 'rgba(15, 23, 42, 0.05)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 4;
  ctx.fillRect(50, resultY, colWidth, 380);
  ctx.strokeRect(50, resultY, colWidth, 380);
  ctx.shadowColor = 'transparent'; // 影を戻す

  // カードヘッダー
  ctx.fillStyle = '#0f172a'; // slate-900
  ctx.fillRect(50, resultY, colWidth, 50);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('今回の測定結果', 75, resultY + 32);

  // 基本入力データ
  ctx.fillStyle = '#475569'; // slate-600
  ctx.font = 'normal 15px "Helvetica Neue", Arial, sans-serif';
  const genText = activeRecord.gender === 'male' ? '男性' : '女性';
  ctx.fillText(`入力データ：  性別: ${genText}   /   年齢: ${activeRecord.age} 歳   /   血清Cr: ${activeRecord.creatinine} mg/dL`, 75, resultY + 90);

  // eGFR巨大数値
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 74px Arial, sans-serif';
  const egfrValStr = activeRecord.egfr.toFixed(1);
  ctx.fillText(egfrValStr, 75, resultY + 195);

  const egfrWidth = ctx.measureText(egfrValStr).width;
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 20px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('mL/min/1.73m²', 75 + egfrWidth + 15, resultY + 175);
  ctx.font = 'normal 14px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('(推算糸球体濾過量)', 75 + egfrWidth + 15, resultY + 195);

  // 分類ステージ
  const activeStage = getCkdStage(activeRecord.egfr);
  ctx.fillStyle = activeStage.color;
  // 角丸四角形
  const radius = 6;
  ctx.beginPath();
  ctx.roundRect(75, resultY + 235, colWidth - 50, 65, radius);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 22px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText(activeStage.name, 95, resultY + 275);

  ctx.fillStyle = '#475569';
  ctx.font = 'normal 14px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText(`基準範囲： ${activeStage.range}`, 75, resultY + 332);
  ctx.fillText(`※ 尿たんぱく等の異常が3ヶ月以上続く場合「CKD（慢性腎臓病）」が疑われます。`, 75, resultY + 355);

  // 5b. CKDステージガイド・解説 (右カード)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.fillRect(50 + colWidth + 30, resultY, colWidth, 380);
  ctx.strokeRect(50 + colWidth + 30, resultY, colWidth, 380);

  // カードヘッダー
  ctx.fillStyle = '#1e293b'; // slate-800
  ctx.fillRect(50 + colWidth + 30, resultY, colWidth, 50);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 18px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('状態の解説とアドバイス', 50 + colWidth + 55, resultY + 32);

  // ステージ説明
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('【現在の腎機能の状態】', 50 + colWidth + 55, resultY + 95);

  ctx.font = 'normal 15px "Helvetica Neue", Arial, sans-serif';
  ctx.fillStyle = '#334155';
  // 文章が長いときのための簡易折り返し描画
  const descRaw = activeStage.description;
  const maxLineW = colWidth - 50;
  let line = '';
  let lineY = resultY + 125;
  for (let i = 0; i < descRaw.length; i++) {
    line += descRaw[i];
    if (ctx.measureText(line).width > maxLineW || i === descRaw.length - 1) {
      ctx.fillText(line, 50 + colWidth + 55, lineY);
      line = '';
      lineY += 23;
    }
  }

  // 健康・生活アドバイス
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 16px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('【日常の生活アドバイス＆推奨事項】', 50 + colWidth + 55, resultY + 205);

  let advY = resultY + 235;
  activeStage.advice.forEach((adv, idx) => {
    // チェックボックス
    ctx.strokeStyle = activeStage.color;
    ctx.lineWidth = 2;
    ctx.strokeRect(50 + colWidth + 55, advY - 14, 16, 16);

    ctx.beginPath();
    ctx.moveTo(50 + colWidth + 57, advY - 7);
    ctx.lineTo(50 + colWidth + 61, advY - 3);
    ctx.lineTo(50 + colWidth + 68, advY - 11);
    ctx.strokeStyle = activeStage.color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // テキスト
    ctx.fillStyle = '#334155';
    ctx.font = 'normal 14px "Helvetica Neue", Arial, sans-serif';

    // 長いアドバイスの折り返し
    let lineText = '';
    const textStartPageX = 50 + colWidth + 82;
    const maxAdvW = colWidth - 85;

    for (let c = 0; c < adv.length; c++) {
      lineText += adv[c];
      if (ctx.measureText(lineText).width > maxAdvW || c === adv.length - 1) {
        ctx.fillText(lineText, textStartPageX, advY);
        lineText = '';
        if (c !== adv.length - 1) {
          advY += 20;
        }
      }
    }
    advY += 28;
  });

  // 6. eGFR推移グラフエリア
  const graphY = 750;
  const graphH = 360;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.fillRect(50, graphY, width - 100, graphH);
  ctx.strokeRect(50, graphY, width - 100, graphH);

  // グラフヘッダー
  ctx.fillStyle = '#334155';
  ctx.fillRect(50, graphY, width - 100, 45);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('eGFR 経過推移グラフ（長期変動の可視化）', 75, graphY + 28);

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(50, graphY + 45, width - 100, graphH - 45);

  // グラフ描画ゾーン (内枠)
  const gLeft = 110;
  const gRight = width - 80;
  const gTop = graphY + 70;
  const gBottom = graphY + graphH - 50;

  // 3ヶ月や1年の期間グリッド・ステージ帯の描画
  // Y軸スケール: eGFR (0 〜 120 とする)
  const yMin = 0;
  const yMax = 120;
  const getCanvasY = (val: number) => {
    const capped = Math.max(yMin, Math.min(yMax, val));
    return gBottom - ((capped - yMin) / (yMax - yMin)) * (gBottom - gTop);
  };

  // ステージの背景カラー帯を描画 (右側にステージ名ラベルを小さく印字)
  const stageBands = [
    { start: 90, end: 120, label: 'G1 (≧90)', color: 'rgba(5, 150, 105, 0.05)' },
    { start: 60, end: 90, label: 'G2 (60-90)', color: 'rgba(16, 185, 129, 0.03)' },
    { start: 45, end: 60, label: 'G3a (45-60)', color: 'rgba(245, 158, 11, 0.04)' },
    { start: 30, end: 45, label: 'G3b (30-45)', color: 'rgba(234, 88, 12, 0.04)' },
    { start: 15, end: 30, label: 'G4 (15-30)', color: 'rgba(220, 38, 38, 0.03)' },
    { start: 0, end: 15, label: 'G5 (<15)', color: 'rgba(127, 29, 29, 0.04)' }
  ];

  stageBands.forEach(band => {
    const yS = getCanvasY(band.end);
    const yE = getCanvasY(band.start);
    ctx.fillStyle = band.color;
    ctx.fillRect(gLeft, yS, gRight - gLeft, yE - yS);

    // 右端に小さくステージ名
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'normal 10px Arial, sans-serif';
    ctx.fillText(band.label, gRight - 65, yS + 18);
  });

  // グリッド線（eGFRの目盛り: 15, 30, 45, 60, 90, 120）
  const yGridVals = [15, 30, 45, 60, 90, 120];
  yGridVals.forEach(v => {
    const yVal = getCanvasY(v);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = v === 60 || v === 90 ? 1.5 : 0.8;
    ctx.beginPath();
    ctx.moveTo(gLeft, yVal);
    ctx.lineTo(gRight, yVal);
    ctx.stroke();

    // 目盛り文字
    ctx.fillStyle = '#64748b';
    ctx.font = 'normal 13px Arial, sans-serif';
    ctx.fillText(v.toString(), gLeft - 28, yVal + 5);
  });

  // データを時系列にソート（古い順）
  const sortedRecords = [...allHistory].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (sortedRecords.length > 0) {
    // X軸の座標計算 (等間隔)
    const getCanvasX = (index: number) => {
      if (sortedRecords.length <= 1) return (gLeft + gRight) / 2;
      return gLeft + (index / (sortedRecords.length - 1)) * (gRight - gLeft - 100);
    };

    // 軸線の描画
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(gLeft, gBottom);
    ctx.lineTo(gRight, gBottom);
    ctx.moveTo(gLeft, gTop);
    ctx.lineTo(gLeft, gBottom);
    ctx.stroke();

    // グラフ折れ線の描画
    ctx.strokeStyle = '#0f172a'; // メインの折れ線
    ctx.lineWidth = 3.5;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    sortedRecords.forEach((record, index) => {
      const x = getCanvasX(index);
      const y = getCanvasY(record.egfr);
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();

    // 各ポイントプロットと日付ラベル
    sortedRecords.forEach((record, index) => {
      const x = getCanvasX(index);
      const y = getCanvasY(record.egfr);

      // 点の背景円（影・目立たせる）
      ctx.beginPath();
      ctx.arc(x, y, 7, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // 現在のアクティブレコードであれば、さらに強調色のリングをつける
      if (record.id === activeRecord.id) {
        ctx.beginPath();
        ctx.arc(x, y, 11, 0, Math.PI * 2);
        ctx.strokeStyle = '#10b981'; // emerald
        ctx.lineWidth = 2.5;
        ctx.stroke();
      }

      // 値をプロットの上に乗せる
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.fillText(record.egfr.toFixed(1), x - 12, y - 13);

      // 日付ラベル
      ctx.save();
      ctx.translate(x, gBottom + 15);
      ctx.rotate(-Math.PI / 12); // 少し傾ける
      ctx.fillStyle = '#475569';
      ctx.font = 'normal 11px Arial, sans-serif';
      // M/D形式にしてすっきりさせる
      const dObj = new Date(record.date);
      const labelDate = !isNaN(dObj.getTime()) ? `${dObj.getMonth() + 1}/${dObj.getDate()}` : record.date.substring(5);
      ctx.fillText(labelDate, -15, 5);
      ctx.restore();
    });
  } else {
    // 履歴がない場合のプレースホルダー
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 16px "Helvetica Neue", sans-serif';
    ctx.fillText('履歴データが登録されていません。グラフを生成するにはデータを保存してください。', (gLeft + gRight) / 2 - 250, (gTop + gBottom) / 2);
  }

  // 7. 履歴一覧テーブル（直近の記録：最大7件）
  const tableY = 1140;
  const tableH = 460;
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  ctx.fillRect(50, tableY, width - 100, tableH);
  ctx.strokeRect(50, tableY, width - 100, tableH);

  // テーブルタイトル
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(50, tableY, width - 100, 45);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('直近の測定履歴（最近5件の推移一覧）', 75, tableY + 28);

  // テーブルヘッダー
  const colX = {
    date: 75,
    gender: 220,
    age: 340,
    cr: 460,
    egfr: 600,
    stage: 750,
    memo: 920
  };

  const drawHeaderY = tableY + 80;
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 14px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('測定日', colX.date, drawHeaderY);
  ctx.fillText('性別', colX.gender, drawHeaderY);
  ctx.fillText('年齢', colX.age, drawHeaderY);
  ctx.fillText('血清クレアチニン', colX.cr, drawHeaderY);
  ctx.fillText('eGFR値', colX.egfr, drawHeaderY);
  ctx.fillText('腎機能ステージ', colX.stage, drawHeaderY);
  ctx.fillText('メモ / 備忘録', colX.memo, drawHeaderY);

  // テーブル境界線
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(60, drawHeaderY + 12);
  ctx.lineTo(width - 60, drawHeaderY + 12);
  ctx.stroke();

  // 履歴リストの最新5件を順次描画 (新しいもの順)
  const displayRecords = [...allHistory]
    .sort((a, b) => new Date(b.date).getTime() - new Date( a.date).getTime())
    .slice(0, 5);

  let rowY = drawHeaderY + 45;
  displayRecords.forEach((record, index) => {
    // 偶数行はうっすら灰色
    if (index % 2 === 1) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(60, rowY - 26, width - 120, 38);
    }

    // ハイライト現行データ
    if (record.id === activeRecord.id) {
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(60, rowY - 26, width - 120, 38);
    }

    ctx.fillStyle = '#0f172a';
    ctx.font = 'normal 14px Arial, sans-serif';

    // 日付
    ctx.fillText(record.date, colX.date, rowY);

    // 性別
    ctx.fillText(record.gender === 'male' ? '男性' : '女性', colX.gender, rowY);

    // 年齢
    ctx.fillText(`${record.age} 歳`, colX.age, rowY);

    // クレアチニン
    ctx.fillText(`${record.creatinine.toFixed(2)} mg/dL`, colX.cr, rowY);

    // eGFR (太字)
    ctx.font = 'bold 14px Arial, sans-serif';
    ctx.fillText(record.egfr.toFixed(1), colX.egfr, rowY);

    // ステージ
    const rStage = getCkdStage(record.egfr);
    ctx.fillStyle = rStage.color;
    ctx.font = 'bold 13px Arial, sans-serif';
    ctx.fillText(rStage.name.split(' (')[0] || rStage.code, colX.stage, rowY);

    // メモ (折り返し考慮なしで右端はみ出し対策: 25文字でカット)
    ctx.fillStyle = '#475569';
    ctx.font = 'normal 13px "Helvetica Neue", sans-serif';
    let memoText = record.memo || '—';
    if (memoText.length > 20) {
      memoText = memoText.substring(0, 18) + '...';
    }
    ctx.fillText(memoText, colX.memo, rowY);

    rowY += 38;
  });

  // 免責事項・署名
  ctx.fillStyle = '#94a3b8';
  ctx.font = 'normal 11px "Helvetica Neue", Arial, sans-serif';
  ctx.fillText('免責事項: 本測定結果およびアドバイスは、日本腎臓学会の一般的な診断用算定式に基づく情報提供であり、医師の専門的診断に代わるものではありません。', 60, tableY + 400);
  ctx.fillText('腎不全や慢性腎臓病の疑いがある場合は、自己判断をせず、必ず腎臓内科などの医療機関を受診し臨床診断を仰いでください。', 60, tableY + 418);
  ctx.fillText('© eGFR計算＆履歴管理ツール レポート生成システム', 60, tableY + 440);

  // 8. Canvasを画像に変換して、jsPDFにのせて保存
  try {
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // A4のサイズは 210 x 297 mm
    pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
    const filename = `eGFR_Report_${dateStr}.pdf`;
    pdf.save(filename);
  } catch (error) {
    console.error('PDF生成でエラーが発生しました:', error);
    alert('PDFの出力中にエラーが発生しました。お使いのブラウザがCanvas出力に対応しているか確認してください。');
  }
}
