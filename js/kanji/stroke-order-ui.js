const en = document.documentElement.lang === 'en';
const t = (ja, english) => en ? english : ja;
export const orderLabels = {likely: t('正しい可能性が高い', 'Likely Correct'), review: t('要確認', 'Review Needed'), unable: t('判定できません', 'Unable to Determine')};
export const unableOrder = reason => ({status: 'unable', reason, issues: []});
export class StrokeOrderService {
  constructor() { this.worker = null; this.jobs = new Map(); this.serial = 0; }
  evaluate(userStrokes, referenceStrokes, context) {
    if (!referenceStrokes?.length) return Promise.resolve(unableOrder('reference-unavailable'));
    try {
      if (!this.worker) {
        const worker = new Worker('/js/kanji/stroke-order-worker.js', {type: 'module'});
        this.worker = worker;
        worker.onmessage = ({data}) => { const job = this.jobs.get(data.id); if (!job) return; clearTimeout(job.timer); this.jobs.delete(data.id); job.resolve(data.assessment); };
        worker.onerror = event => { event.preventDefault(); this.fail(); };
      }
      return new Promise(resolve => {
        const id = ++this.serial;
        const timer = setTimeout(() => this.fail(), 15000);
        this.jobs.set(id, {resolve, timer});
        this.worker.postMessage({id, userStrokes, referenceStrokes, context});
      });
    } catch { this.fail(); return Promise.resolve(unableOrder('worker-unavailable')); }
  }
  fail() {
    this.worker?.terminate(); this.worker = null;
    for (const job of this.jobs.values()) { clearTimeout(job.timer); job.resolve(unableOrder('worker-unavailable')); }
    this.jobs.clear();
  }
}
function reasonText(assessment) {
  const reasons = {
    matched: t('形を安定して照合できた範囲では、順序と方向が一致しています。', 'For the strokes that could be matched reliably, sequence and direction align.'),
    'possible-violation': t('順序や方向が異なる可能性のある画があります。下の項目から照合できます。', 'Some strokes may differ in sequence or direction. Inspect the matches below.'),
    'unrecognized-character': t('文字を安定して認識できなかったため、書き順の判断は保留します。', 'The character was not recognized reliably, so its stroke order is undetermined.'),
    'different-character': t('課題と異なる文字として認識されたため、このお手本の書き順は判定できません。', 'A different character was recognized; this reference cannot reliably grade its stroke order.'),
    'stroke-count': t('画数が一致せず、一画ずつ対応づけることができません。', 'Stroke counts differ, preventing a reliable one-to-one match.'),
    geometry: t('字形を安定して対応づけられません。書き順の誤りとは限りません。', 'The geometry could not be matched reliably. This does not establish an order error.'),
    'ambiguous-matching': t('複数の画の対応が同程度に考えられるため、順序を断定しません。', 'Several stroke assignments are similarly plausible; the sequence cannot be determined.'),
    'ambiguous-direction': t('短い画や形の違いにより、方向を十分に判断できません。', 'A short stroke or shape variation makes its direction uncertain.'),
    'insufficient-input': t('筆跡が不足しているか、対応できない入力です。', 'There is insufficient or unsupported stroke input.'),
    'reference-unavailable': t('お手本の画データを取得できませんでした。文字の判定とは別の結果です。', 'Reference strokes were unavailable. This is separate from character correctness.'),
    'no-handwriting': t('キーボード入力には筆跡がないため、書き順を判定できません。', 'Keyboard answers do not contain handwriting trajectories.'),
    'not-checked': t('この操作では筆跡の採点を行っていません。', 'Handwriting was not assessed for this action.'),
    'changed-input': t('判定後に筆跡を変更しました。もう一度入力して確認してください。', 'The drawing changed after checking. Use Try Again and check the new input.'),
    'worker-unavailable': t('書き順の処理を完了できませんでした。文字の判定や学習記録は利用できます。', 'Stroke-order processing could not finish. Character results and progress remain available.'),
    'computation-error': t('書き順の計算を完了できませんでした。', 'Stroke-order calculation could not finish.')
  };
  return reasons[assessment.reason] || reasons['insufficient-input'];
}
export function orderView(assessment, onHighlight, onReset) {
  const details = document.createElement('details'); details.id = 'stroke-order-assessment'; details.className = 'stroke-order-assessment ' + (assessment?.status || 'pending');
  const summary = document.createElement('summary'), caption = document.createElement('span'), label = document.createElement('strong');
  caption.className = 'order-caption'; caption.textContent = t('書き順 · 実験的', 'Stroke Order · Experimental');
  label.id = 'stroke-order-verdict'; label.textContent = assessment ? orderLabels[assessment.status] : t('判定中…', 'Checking…');
  summary.append(caption, label); details.append(summary);
  const body = document.createElement('div'); body.className = 'stroke-order-explanation'; const text = document.createElement('p');
  text.textContent = assessment ? reasonText(assessment) : t('筆跡の順序と方向を、お手本と照合しています。', 'Comparing recorded trajectories with the reference.'); body.append(text);
  if (assessment?.issues?.length) {
    const list = document.createElement('ol');
    for (const issue of assessment.issues) {
      const li = document.createElement('li'), button = document.createElement('button');
      button.type = 'button'; button.dataset.userStroke = issue.userStroke; button.dataset.referenceStroke = issue.referenceStroke;
      const warnings = [issue.order ? t('順序', 'sequence') : '', issue.direction ? t('方向', 'direction') : ''].filter(Boolean).join(' / ');
      button.textContent = t(`自分の${issue.userStroke}画目 → お手本の${issue.referenceStroke}画目：${warnings}を確認`, `Your stroke ${issue.userStroke} → reference ${issue.referenceStroke}: inspect ${warnings}`);
      button.onclick = () => onHighlight?.(issue); li.append(button); list.append(li);
    }
    const legend = document.createElement('p'); legend.className = 'stroke-match-legend'; legend.textContent = t('オレンジ：自分の画 ／ 青緑：お手本の画', 'Orange: your stroke / teal: reference stroke');
    const reset = document.createElement('button'); reset.type = 'button'; reset.textContent = t('強調表示を戻す', 'Reset Highlights'); reset.onclick = () => onReset?.();
    body.append(list, legend, reset);
  }
  const note = document.createElement('p'); note.className = 'note'; note.textContent = t('KanjiVGに基づく参考判定です。漢検の公式判定ではなく、精度が保証された評価でもありません。', 'An experimental KanjiVG comparison, not official Kanken grading or a validated accuracy guarantee.'); body.append(note); details.append(body);
  return details;
}
