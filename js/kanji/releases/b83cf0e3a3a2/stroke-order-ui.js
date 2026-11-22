import {miniStroke} from './stroke-visual.js';
const en = document.documentElement.lang === 'en';
const t = (ja, english) => en ? english : ja;
export const orderLabels = {likely: t('正しい可能性が高い', 'Likely Correct'), review: t('要確認', 'Review Needed'), partial:t('一部判定不可','Partially Undetermined'), unable: t('判定できません', 'Unable to Determine')};
export const unableOrder = reason => ({status: 'unable', sequence:{status:'unable'},direction:{status:'unable'},reason, issues: [],strokes:[]});
export class StrokeOrderService {
  constructor() { this.worker = null; this.jobs = new Map(); this.serial = 0; }
  evaluate(userStrokes, referenceStrokes, context) {
    if (!referenceStrokes?.length) return Promise.resolve(unableOrder('reference-unavailable'));
    try {
      if (!this.worker) {
        const worker = new Worker(new URL('./stroke-order-worker.js',import.meta.url), {type: 'module'});
        this.worker = worker;
        worker.onmessage = ({data}) => { if(this.worker!==worker)return; const job = this.jobs.get(data.id); if (!job) return; clearTimeout(job.timer); this.jobs.delete(data.id); job.resolve(data.assessment); };
        worker.onerror = event => { event.preventDefault(); if(this.worker===worker)this.fail(); };
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
    'partial-assessment':t('確かな対応だけを評価しています。未確定の画は誤りとして扱いません。','Only reliable matches are assessed. Undetermined strokes are not errors.'),
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
const statusText=status=>orderLabels[status]||t('判定中…','Checking…');
export function orderView(assessment,onHighlight,onReset){
 const container=document.createElement('div');container.id='stroke-order-assessment';container.className='stroke-order-assessment '+(assessment?.status||'pending');
 for(const [key,title,id]of [['sequence',t('書き順','Stroke Sequence'),'stroke-order-verdict'],['direction',t('運筆方向','Stroke Direction'),'stroke-direction-verdict']]){
  const row=document.createElement('div');row.className='stroke-verdict-row';const caption=document.createElement('span'),value=document.createElement('strong');caption.textContent=title;value.id=id;
  const status=assessment?.[key]?.status||assessment?.status;value.className=status||'pending';value.textContent=(status==='likely'?'✓ ':status==='review'?'! ':'')+statusText(status);row.append(caption,value);container.append(row);
 }
 const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent=t('画ごとの確認','Stroke Details');details.append(summary);
 const body=document.createElement('div');body.className='stroke-order-explanation';const explanation=document.createElement('p');explanation.textContent=assessment?reasonText(assessment):t('順序と方向を別々に照合しています。','Comparing sequence and direction separately.');body.append(explanation);
 const strokes=assessment?.strokes||assessment?.mapping||[];
 if(strokes.length){
  const comparison=document.createElement('div');comparison.className='stroke-comparison';comparison.setAttribute('aria-live','polite');
  const list=document.createElement('ol');list.className='stroke-inspection-list';
  for(const stroke of strokes){const li=document.createElement('li'),button=document.createElement('button');button.type='button';button.dataset.userStroke=stroke.userStroke;button.dataset.referenceStroke=stroke.referenceStroke??'';
   const sequence=statusText(stroke.sequenceStatus),direction=statusText(stroke.directionStatus);
   button.textContent=t('自分の'+stroke.userStroke+'画目 → '+(stroke.referenceStroke?'お手本の'+stroke.referenceStroke+'画目':'対応未確定')+'：順序 '+sequence+' ／ 方向 '+direction,'Your stroke '+stroke.userStroke+' → '+(stroke.referenceStroke?'reference '+stroke.referenceStroke:'unmatched')+': sequence '+sequence+' / direction '+direction);
   button.setAttribute('aria-label',button.textContent);const symbol=status=>status==='likely'?'✓':status==='review'?'!':'?';button.textContent=stroke.userStroke+' → '+(stroke.referenceStroke??'?')+' · '+t('順','Seq')+' '+symbol(stroke.sequenceStatus)+' / '+t('向','Dir')+' '+symbol(stroke.directionStatus);
   button.onclick=()=>{list.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));onHighlight?.(stroke);comparison.replaceChildren(miniStroke(stroke.userPoints,stroke.userStrokeIndex,'#a84a13',t('自分の筆跡','Your Stroke')),miniStroke(stroke.referencePoints,stroke.referenceStrokeIndex,'#006778',t('お手本','Reference')));const reason=document.createElement('p');reason.className='stroke-reason';reason.textContent=stroke.directionReason==='short-stroke'?t('短い画のため、方向は判定できません。','This stroke is too short to determine its direction.'):stroke.directionStatus==='review'?t('始点・終点と軌跡は逆方向を示しています。','The endpoints and trajectory indicate a reversed direction.'):stroke.referenceStrokeIndex===null?t('安定した対応がないため、この画の順序・方向を断定しません。','Without a reliable match, sequence and direction are undetermined.'):t('丸は始点、小さい点は終点、矢印は記録された方向です。','The circle marks the start, the small dot the end, and the arrow the recorded direction.');comparison.append(reason);comparison.scrollIntoView({block:'nearest'});};button.setAttribute('aria-pressed','false');li.append(button);list.append(li);
  }
  const legend=document.createElement('p');legend.className='stroke-match-legend';legend.textContent=t('オレンジ：自分の画 ／ 青緑：お手本の画','Orange: your stroke / teal: reference stroke');const reset=document.createElement('button');reset.type='button';reset.textContent=t('強調表示を戻す','Reset Highlights');reset.onclick=()=>{onReset?.();comparison.replaceChildren();list.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed','false'));};body.append(comparison,list,legend,reset);
 }
 const note=document.createElement('p');note.className='note';note.textContent=t('KanjiVGに基づく実験的な参考判定です。漢検の公式判定ではありません。','Experimental KanjiVG feedback, not official Kanken grading or a validated accuracy guarantee.');body.append(note);details.append(body);container.append(details);return container;
}
