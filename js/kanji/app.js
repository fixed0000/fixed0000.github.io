import {WritingPad} from './canvas.js';
import {Reference,pathsFor,samplePathData} from './reference.js';
import {StrokeOrderService,orderView,orderLabels,unableOrder} from './stroke-order-ui.js';
import {KEY,OLD_KEY,fresh,validate,migrate,addAttempt} from './store.js';
const en=document.documentElement.lang==='en',t=(j,e)=>en?e:j,$=id=>document.getElementById(id);
const statuses={correct:t('正解！','Correct!'),incorrect:t('不正解','Incorrect'),unrecognized:t('認識できませんでした','Unable to Recognize'),reveals:t('お手本','Reference'),skips:t('スキップ','Skipped')};
const strokeOrderService=new StrokeOrderService();
let currentOrderRow=null,summarySession=null;
let view=0,storageProtected=false,catalogPromise=null,recognizerRequested=false,recognitionFailed=false;
let tasks=[],catalog={},data=fresh(),storage=true,queue=[],index=0,current=null,pad=null,reference=null,ready=false,worker=null,token=0,pending=null,settled=false,session=[],exam=false,daily=false,streak=0,active=false,starting=false,confirmAction=null,returnFocus=null;
function notice(text,practice=active){$(practice?'practice-notice':'notice').textContent=text;}
function save(){try{if(!storageProtected)localStorage.setItem(KEY,JSON.stringify(data));}catch{storage=false;}stats();}
function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
async function ensureCatalog(){if(!catalogPromise)catalogPromise=fetch('/assets/kanji/catalog.json').then(r=>{if(!r.ok)throw Error('catalog');return r.json();}).then(d=>{catalog=d;return d;}).catch(e=>{catalogPromise=null;throw e;});return catalogPromise;}
function ensureRecognizer(){if(!worker||recognizerRequested||recognitionFailed)return;recognizerRequested=true;$('load-status').className='loading-state';$('load-status').textContent=t('認識データを準備しています…','Preparing recognition…');$('practice-loading').textContent=t('認識データ読込中…','Loading recognition…');worker.postMessage({type:'load'});}
function getLevel(){return $('scheme').value==='jlpt'?current?.jlpt:current?.kanken;}
function selected(){const scheme=$('scheme').value;return tasks.filter(x=>x[scheme]===$('level').value);}
function levels(){const options=$('scheme').value==='jlpt'?['N5','N4','N3','N2','N1']:['10級','9級','8級','7級','6級','5級','4級','3級','準2級','2級','準1級','1級'];$('level').replaceChildren(...options.map(value=>{const o=document.createElement('option');o.value=value;o.textContent=value+(tasks.some(x=>x[$('scheme').value]===value)?'':t(' · 準備中',' · Preparing'));return o;}));setStatus();}
function setStatus(){const count=selected().length;$('set-status').textContent=count?t(`${count}字の練習セット。順序はランダムです。`,`${count} kanji in this practice subset. Order is randomized.`):t('準備中：この級の検証済みセットはまだありません。','Preparing: no verified set is available for this level.');$('start').disabled=$('exam').disabled=!count;}
function stats(){const records=Object.values(data.records),correct=records.reduce((a,r)=>a+r.correct,0),attempts=records.reduce((a,r)=>a+r.attempts,0);$('progress').textContent=t(`${records.filter(r=>r.completed).length}字を学習 · ${attempts}回の試行 · 正解 ${correct}回 · 最高連続 ${data.bestStreak}回`,`Completed ${records.filter(r=>r.completed).length} kanji · ${attempts} attempts · ${correct} correct · best streak ${data.bestStreak}`)+(storage?'':t(' · 保存不可（このページ内のみ）',' · Storage unavailable (page session only)'));
 if(correct>=3&&!$('mixed')){const button=document.createElement('button');button.id='mixed';button.textContent=t('全レベル混合（解放済み）','Mixed Levels (Unlocked)');button.onclick=()=>start(shuffle(tasks));$('custom-practice').after(button);}else if(correct<3)$('mixed')?.remove();
 $('session-stats-text').textContent=exam&&active?t(`${session.length}件を記録 / ${queue.length}問`,`${session.length} recorded / ${queue.length} questions`):t(`${session.filter(x=>x.kind==='correct').length}回正解 / ${session.length}回の記録 · 連続 ${streak}回`,`${session.filter(x=>x.kind==='correct').length} correct / ${session.length} recorded · streak ${streak}`);
 const table=document.createElement('table'),caption=document.createElement('caption');caption.textContent=t('分類別の記録（同じ漢字が両分類に含まれる場合があります）','Progress by classification (the same kanji can appear in both)');table.append(caption);const head=document.createElement('tr');for(const text of [t('分類','Level'),t('試行','Attempts'),t('正解','Correct'),t('認識不可','Unrecognized')]){const th=document.createElement('th');th.scope='col';th.textContent=text;head.append(th);}table.append(head);
 for(const scheme of ['jlpt','kanken'])for(const level of [...new Set(tasks.map(x=>x[scheme]).filter(Boolean))].sort()){const rows=tasks.filter(x=>x[scheme]===level).map(x=>data.records[x.char]).filter(Boolean),tr=document.createElement('tr');for(const v of [scheme==='jlpt'?'JLPT '+level:'漢検 '+level,...['attempts','correct','unrecognized'].map(k=>rows.reduce((a,r)=>a+r[k],0))]){const td=document.createElement('td');td.textContent=v;tr.append(td);}table.append(tr);}$('level-stats').replaceChildren(table);
 $('history').replaceChildren(...data.history.slice(-15).reverse().map(h=>{const li=document.createElement('li');li.textContent=`${h.char} · ${statuses[h.kind]} · ${new Date(h.date).toLocaleString(en?'en-GB':'ja-JP')}`;return li;}));if(!data.history.length){const li=document.createElement('li');li.textContent=t('まだ記録はありません。','No attempts yet.');$('history').append(li);}
 $('legacy-status').textContent=data.legacy?t('以前の単語練習の記録は保管済みです。一字の記録だけを新しい練習に引き継ぎ、複数字の成績を各漢字に割り振っていません。JSONにも旧記録が含まれます。','Your previous word-practice records are archived and included in exports. Only single-character records were transferred; word scores were not assigned to individual kanji.'):'';
 $('achievements').textContent=[correct?t('最初の正解','First correct answer'):'',data.bestStreak>=3?t('3回連続正解','Three in a row'):'',data.daily.length?t('今日の課題を達成','Daily task completed'):''].filter(Boolean).join(' / ');
 $('custom-list').replaceChildren(...data.custom.map(c=>{const li=document.createElement('li'),b=document.createElement('button');li.append(document.createTextNode(c+' '));b.textContent=t('セットから外す','Remove from set');b.onclick=()=>{data.custom=data.custom.filter(x=>x!==c);save();};li.append(b);return li;}));
 if(!data.custom.length){const li=document.createElement('li');li.textContent=t('漢字を追加すると、ここに表示されます。','Add a kanji to build your own set.');$('custom-list').append(li);}
}
function backgroundInert(value){for(const x of document.querySelectorAll('#main > *,body > .site-header,body > .footer'))if(x!==$('practice'))x.inert=value;}
function cancel(){token++;pending=null;$('check').disabled=false;}
function resetReference(){reference?.pause();reference?.show(false);$('reference-controls').hidden=true;$('animation-controls').hidden=true;$('show-reference').checked=true;$('show-ink').checked=true;if(pad){pad.visible=true;pad.redraw();}}
function idleResult(){const h=document.createElement('h3'),p=document.createElement('p');h.textContent=t('まず、書いてみましょう。','Start with a stroke.');p.textContent=exam?t('ミニテスト：結果は終了後に表示します。','Exam mode: feedback appears after the session.'):t('確認するまで答えは表示されません。','The answer stays hidden until you check.');$('result').className='result-card';$('result').replaceChildren(h,p);}
async function start(items,{isExam=false,isDaily=false}={}){if(starting)return;if(!items.length){notice(t('このセットにはまだ漢字がありません。','There are no kanji in this set yet.'),false);return;}starting=true;summarySession=null;returnFocus=document.activeElement;queue=items;index=0;session=[];streak=0;exam=isExam;daily=isDaily;active=true;if($('mode').value==='draw')ensureRecognizer();$('practice-loading').textContent=$('mode').value==='type'?t('キーボード入力','Keyboard input'):ready?t('認識準備完了','Recognition ready'):recognitionFailed?t('認識を利用できません','Recognition unavailable'):t('認識データ読込中…','Loading recognition…');backgroundInert(true);document.body.classList.add('practicing');$('practice').hidden=false;$('summary').replaceChildren();$('session-stats').hidden=true;$('practice-stats').setAttribute('aria-expanded','false');try{await show();}finally{starting=false;}}
async function show(){cancel();const revision=++view;currentOrderRow=null;current=queue[index];settled=false;resetReference();reference?.destroy();pad?.destroy();$('pads').replaceChildren();$('typed').value='';$('reading').textContent=current.reading;$('meaning').textContent=current.meaning;$('stroke-hint').textContent=t(`${current.strokes}画 · ${current.jlpt||''} ${current.kanken?' / 漢検 '+current.kanken:''}`,`${current.strokes} strokes · ${current.jlpt||''}${current.kanken?' / Kanken '+current.kanken:''}`);$('position').textContent=`${index+1} / ${queue.length}${exam?' · '+t('ミニテスト','Exam'):''}`;$('session-progress').max=queue.length;$('session-progress').value=index;$('next').hidden=$('retry').hidden=true;$('check').hidden=false;$('reveal').hidden=exam;notice('');idleResult();
 pad=new WritingPad($('pads'),0,{character:t('筆記欄','Writing area'),hint:t('代替方法：キーボード入力','Alternative: keyboard input'),undo:t('一画戻す','Undo'),clear:t('消去','Clear')},()=>{cancel();notice('');if(settled&&currentOrderRow){currentOrderRow=null;replaceOrderView(unableOrder('changed-input'));resetStrokeHighlights();notice(t('筆跡を変更しました。もう一度入力して確認してください。','Drawing changed. Use Try Again to check a new attempt.'));}});
 // The SVG and canvas use the same unmodified 109×109 view box; no fit-to-ink normalization.
 reference=new Reference(pad.surface,(n,total)=>{$('stroke-position').textContent=`${n} / ${total} `+t('画','strokes');});reference.speed=Number($('speed').value);reference.show(false);appearance();mode();favoriteState();stats();$('prompt').classList.remove('task-enter');void $('prompt').offsetWidth;$('prompt').classList.add('task-enter');
 $('check').focus({preventScroll:true});try{const paths=await pathsFor(current.char);if(revision!==view||!active)return;reference.setPaths(paths);reference.show(false);if(settled&&!exam)revealReference();}catch{if(revision===view)notice(t('お手本データを読み込めません。練習は続けられます。','Reference data could not load. Practice is still available.'));}}
function mode(){const typed=$('mode').value==='type';$('pads').hidden=typed;$('typed-area').hidden=!typed;document.querySelector('.brush-controls').hidden=typed;if(!typed)pad?.resize();}
function appearance(){const dark=$('dark').checked;$('practice').classList.toggle('trainer-dark',dark);if(pad){pad.color=dark?'#eaf1fc':'#182c45';pad.brush=Number($('brush').value);pad.redraw();}}
function favoriteState(){const value=data.favorites.includes(current.char);$('favorite').setAttribute('aria-pressed',String(value));$('favorite').textContent=value?t('★ 保存済み','★ Saved'):t('☆ お気に入り','☆ Favorite');}
function revealReference(){if(!reference?.paths?.length)return;reference.full();reference.show(true);$('show-reference').checked=true;$('reference-controls').hidden=false;}
function resetStrokeHighlights(){pad?.highlightStroke(null);reference?.full();}
function inspectStroke(issue){
 if(!pad||!reference)return;
 $('show-ink').checked=true;pad.visible=true;pad.highlightStroke(issue.userStroke-1);
 $('show-reference').checked=true;reference.show(true);reference.highlightStroke(issue.referenceStroke-1);
}
function replaceOrderView(assessment){
 const old=$('stroke-order-assessment');if(!old)return;
 const wasOpen=old.open,hadFocus=old.contains(document.activeElement);
 const replacement=orderView(assessment,inspectStroke,resetStrokeHighlights);replacement.open=wasOpen;old.replaceWith(replacement);
 if(hadFocus)replacement.querySelector('summary').focus({preventScroll:true});
}
function assessRow(row){
 if(row.orderPromise)return row.orderPromise;
 row.orderPromise=(async()=>{
  if(!row.orderInput)return row.order=unableOrder(row.keyboard?'no-handwriting':'not-checked');
  const input=row.orderInput;
  try{
   const referenceStrokes=input.referenceStrokes.length?input.referenceStrokes:samplePathData(await pathsFor(input.expected));
   return row.order=await strokeOrderService.evaluate(input.userStrokes,referenceStrokes,{expected:input.expected,recognized:input.recognized});
  }catch{return row.order=unableOrder('reference-unavailable');}
 })();return row.orderPromise;
}
function result(kind,recognized=''){
 if(settled||!active)return;
 settled=true;$('session-progress').value=index+1;
 addAttempt(data,current.char,kind,recognized,getLevel()||'Custom');
 if(kind==='correct'){streak++;data.bestStreak=Math.max(streak,data.bestStreak);}else if(kind!=='unrecognized')streak=0;
 const row={char:current.char,kind,recognized,keyboard:$('mode').value==='type',order:null};
 if(!row.keyboard&&['correct','incorrect','unrecognized'].includes(kind))row.orderInput={
  expected:current.char,recognized:recognized||null,
  userStrokes:pad.strokes.map(stroke=>stroke.map(point=>[...point])),
  referenceStrokes:reference?.sampledStrokes()||[]
 };
 if(!row.orderInput)row.order=unableOrder(row.keyboard?'no-handwriting':'not-checked');
 session.push(row);save();$('check').hidden=true;$('next').hidden=false;$('retry').hidden=exam;$('reveal').hidden=true;
 const h=document.createElement('h3'),p=document.createElement('p');$('result').className='result-card '+(exam?'recorded':kind);
 if(exam){h.textContent=t('記録しました','Answer recorded');p.textContent=t('文字と書き順の結果は終了後に表示します。','Character and stroke-order feedback appears at the end.');$('result').replaceChildren(h,p);}
 else{
  const header=document.createElement('div');header.className='assessment-header';
  const caption=document.createElement('span');caption.className='character-caption';caption.textContent=t('文字の正誤 ','Character ');
  h.append(caption,document.createTextNode((kind==='correct'?'✓ ':kind==='incorrect'?'× ':'')+statuses[kind]));
  p.textContent=kind==='unrecognized'?t('もう一度、画を分けて書いてみてください。','Try again with distinct strokes.'):t('入力・認識：','Input / recognized: ')+(recognized||'—')+' · '+t('正解：','Answer: ')+current.char;
  header.append(h,orderView(row.order,inspectStroke,resetStrokeHighlights));$('result').replaceChildren(header,p);
  revealReference();currentOrderRow=row;const resultView=view;
  assessRow(row).then(assessment=>{if(active&&!exam&&settled&&view===resultView&&currentOrderRow===row)replaceOrderView(assessment);});
 }
 $('result').focus({preventScroll:true});
}
function check(){if(settled||pending!==null||!active)return;if($('mode').value==='type'){const answer=$('typed').value.normalize('NFC').trim();if([...answer].length!==1||!/^\p{Script=Han}$/u.test(answer)){notice(t('漢字を一字だけ入力してください。','Enter exactly one kanji.'));return;}result(answer===current.char?'correct':'incorrect',answer);return;}
 if(pad.active!==null)return;if(!pad.strokes.length){notice(t('まず一字書いてください。','Write one character first.'));return;}if(!ready){notice(recognitionFailed?t('認識を利用できません。終了してキーボード入力を選べます。','Recognition is unavailable. Exit and choose Keyboard input.'):t('認識データを準備中です。ホームに戻りキーボード入力も選べます。','Recognition is not ready. You can return and choose Keyboard input.'));return;}
 pending=++token;$('check').disabled=true;notice(t('認識しています…','Recognizing…'));worker.postMessage({type:'recognize',id:pending,strokes:[pad.strokes]});}
async function next(){if(!active)return;if(!settled)result('skips');cancel();if(++index>=queue.length){if(daily&&session.every(x=>x.kind==='correct')){const date=new Date().toLocaleDateString('en-CA');if(!data.daily.includes(date))data.daily.push(date);}finish();}else await show();}
function renderSessionSummary(rows){
 const title=document.createElement('h2'),p=document.createElement('p'),list=document.createElement('ul');
 title.textContent=t('今回の記録','Session Summary');p.textContent=Object.entries(statuses).map(([kind,label])=>label+' '+rows.filter(x=>x.kind===kind).length).join(' · ');
 for(const row of rows){const li=document.createElement('li');li.textContent=`${row.char} · ${statuses[row.kind]}${row.recognized?' · '+row.recognized:''} · `+t('書き順（実験）：','Stroke order (experimental): ')+(row.order?orderLabels[row.order.status]:t('判定中…','Checking…'));list.append(li);}
 $('summary').replaceChildren(title,p,list);
}
function finish(){
 if(!active)return;
 cancel();active=false;currentOrderRow=null;backgroundInert(false);reference?.pause();document.body.classList.remove('practicing');$('practice').hidden=true;pad?.destroy();
 const completed=session;summarySession=completed;renderSessionSummary(completed);
 for(const row of completed)assessRow(row).then(()=>{if(!active&&session===completed&&summarySession===completed)renderSessionSummary(completed);});
 save();$('summary').focus({preventScroll:true});returnFocus?.scrollIntoView({block:'center'});
}
$('scheme').onchange=levels;$('level').onchange=setStatus;$('start').onclick=()=>start(shuffle(selected()));$('exam').onclick=()=>start(shuffle(selected()).slice(0,10),{isExam:true});$('daily').onclick=()=>{const date=new Date().toLocaleDateString('en-CA'),n=[...date].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,0);start([tasks[n%tasks.length]],{isDaily:true});};
$('review').onclick=()=>start(shuffle(Object.keys(data.records).filter(c=>data.records[c].difficult&&catalog[c]).map(c=>catalog[c])));$('favorites').onclick=()=>start(shuffle(data.favorites.filter(c=>catalog[c]).map(c=>catalog[c])));$('custom-practice').onclick=()=>start(shuffle(data.custom.filter(c=>catalog[c]).map(c=>catalog[c])));
$('check').onclick=check;$('next').onclick=next;$('skip').onclick=()=>{if(!settled)result('skips');next();};$('reveal').onclick=()=>result('reveals');$('retry').onclick=()=>show();$('finish').onclick=finish;
$('favorite').onclick=()=>{data.favorites=data.favorites.includes(current.char)?data.favorites.filter(c=>c!==current.char):[...data.favorites,current.char];favoriteState();save();};$('practice-stats').onclick=()=>{$('session-stats').hidden=!$('session-stats').hidden;$('practice-stats').setAttribute('aria-expanded',String(!$('session-stats').hidden));};
$('show-reference').onchange=()=>{reference.pause();reference.show($('show-reference').checked);};$('show-ink').onchange=()=>{pad.visible=$('show-ink').checked;pad.redraw();};$('stroke-order').onclick=()=>{pad.highlightStroke(null);$('animation-controls').hidden=false;$('show-reference').checked=true;reference.show(true);reference.restart();reference.play();};$('play').onclick=()=>reference.play();$('pause').onclick=()=>reference.pause();$('restart').onclick=()=>reference.restart();$('speed').onchange=()=>{reference.speed=Number($('speed').value);};
$('brush').oninput=()=>{data.settings.brush=Number($('brush').value);appearance();save();};$('dark').onchange=()=>{data.settings.dark=$('dark').checked;appearance();save();};
$('custom-form').onsubmit=async e=>{e.preventDefault();const c=$('custom-char').value.normalize('NFC').trim();if([...c].length===1&&/^\p{Script=Han}$/u.test(c)&&!catalog[c]){try{await ensureCatalog();}catch{$('custom-status').textContent=t('漢字データを読み込めません。','Kanji data could not load.');return;}}if([...c].length!==1||!/^\p{Script=Han}$/u.test(c)||!catalog[c]){$('custom-status').textContent=t('対応する漢字を一字だけ入力してください。','Enter exactly one supported kanji.');return;}try{await pathsFor(c);if(!data.custom.includes(c))data.custom.push(c);save();$('custom-char').value='';$('custom-status').textContent=t('セットに追加しました。','Added to your set.');}catch{$('custom-status').textContent=t('字形データを読み込めません。','Shape data could not load.');}};
function confirm(message,action){$('confirm-message').textContent=message;$('confirm').hidden=false;confirmAction=action;$('confirm-yes').focus();}$('confirm-no').onclick=()=>{$('confirm').hidden=true;confirmAction=null;};$('confirm-yes').onclick=()=>{confirmAction?.();$('confirm').hidden=true;confirmAction=null;};
$('export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='kanji-recall-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('import').onchange=async()=>{const file=$('import').files[0];if(!file)return;try{if(file.size>5*1024*1024)throw Error('large');let imported=JSON.parse(await file.text());if(imported?.version===1){const r=await fetch('/assets/kanji/words.json');imported=migrate(imported,await r.json());}validate(imported);await ensureCatalog();if([...Object.keys(imported.records),...imported.custom,...imported.favorites].some(c=>!catalog[c]))throw Error('unsupported');confirm(t('現在の記録を読み込んだJSONに置き換えますか？先に書き出すとバックアップできます。','Replace current progress with this JSON? Export first to keep a backup.'),()=>{data=imported;storageProtected=false;applySettings();save();$('data-status').textContent=t('読み込みました。','Progress imported.');});}catch{$('data-status').textContent=t('読み込めません。対応するJSON形式（5MB以下）を確認してください。','Could not import. Check the progress JSON format (maximum 5 MB).');}$('import').value='';};
$('reset').onclick=()=>confirm(t('新旧すべての学習記録をこのブラウザから削除しますか？','Delete all current and legacy progress in this browser?'),()=>{data=fresh();storageProtected=false;try{localStorage.removeItem(OLD_KEY);localStorage.removeItem(KEY);}catch{storage=false;}applySettings();save();$('data-status').textContent=t('データを削除しました。','Progress deleted.');});
function applySettings(){$('brush').value=data.settings.brush;$('dark').checked=data.settings.dark;}
function fail(){recognitionFailed=true;ready=false;pending=null;$('practice-loading').textContent=t('認識を読み込めません','Recognition unavailable');$('check').disabled=false;$('load-status').className='loading-state failed';$('load-status').textContent=t('認識を読み込めません。キーボード入力は利用できます。','Recognition could not load. Keyboard practice is available.');}
try{worker=new Worker('/js/kanji/worker.js',{type:'module'});worker.onmessage=({data:r})=>{if(r.type==='ready'){ready=true;$('practice-loading').textContent=t('認識準備完了','Recognition ready');$('load-status').className='loading-state ready';$('load-status').textContent=t('認識データ準備完了 · ローカル処理','Recognition ready · local processing');}else if(r.type==='result'&&r.id===pending&&active){pending=null;$('check').disabled=false;notice('');const recognized=r.results[0].char;result(recognized?(recognized===current.char?'correct':'incorrect'):'unrecognized',recognized||'');}else if(r.type==='error')fail();};worker.onerror=fail;}catch{fail();}
// Keep keyboard focus inside the fullscreen practice surface. Escape always exits.
document.addEventListener('keydown',e=>{if(!active)return;if(e.key==='Escape'){e.preventDefault();finish();return;}if(e.key==='Tab'){const controls=[...$('practice').querySelectorAll('button,input,select,[tabindex="0"]')].filter(x=>!x.disabled&&x.getClientRects().length),first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}if(e.key==='Enter'&&e.ctrlKey){e.preventDefault();settled?next():check();}});
async function init(){for(const id of ['start','exam','daily','review','favorites','custom-practice'])$(id).disabled=true;$('load-status').textContent=t('認識データを準備しています…','Preparing recognition…');try{const a=await fetch('/assets/kanji/tasks.json');if(!a.ok)throw Error('data');tasks=await a.json();catalog=Object.fromEntries(tasks.map(x=>[x.char,x]));try{const existing=localStorage.getItem(KEY);if(existing)data=validate(JSON.parse(existing));else{const old=JSON.parse(localStorage.getItem(OLD_KEY)||'null');if(old){const r=await fetch('/assets/kanji/words.json');data=migrate(old,await r.json());}}}catch{storage=false;storageProtected=true;notice(t('保存データを読み込めません。元のデータは消去していません。','Stored progress could not be read. Original data was not deleted.'),false);}if([...data.custom,...data.favorites,...Object.keys(data.records)].some(c=>!catalog[c]))await ensureCatalog();applySettings();levels();stats();for(const id of ['daily','review','favorites','custom-practice'])$(id).disabled=false;if(!worker)fail();else{$('load-status').className='loading-state idle';$('load-status').textContent=t('練習開始時に認識データを読み込みます。','Recognition data loads when handwriting practice starts.');}if(storage)save();}catch{notice(t('練習データを読み込めません。再読み込みしてください。','Practice data could not load. Please reload.'),false);}}
init();
