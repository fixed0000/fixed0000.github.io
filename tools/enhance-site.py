"""Apply Portfolio 2 editorial components to the existing generator output."""
from pathlib import Path
import re,html
root=Path(__file__).resolve().parents[1]
JA_DISCLAIMER='本プロジェクトは、個人の学習・趣味を目的とした非営利のファン制作プロジェクトです。『Sonic Adventure』シリーズのチャオガーデンから着想を得ており、SEGAおよび関連する権利者とは提携・協賛・承認関係にありません。第三者の素材に関する権利は、それぞれの権利者に帰属します。'
EN_DISCLAIMER='MoriGarden is a personal, non-commercial fan project developed for learning and recreation. It is inspired by the Chao Garden features of the Sonic Adventure series and is not affiliated with, sponsored by, or endorsed by SEGA or any related rights holders. Rights to third-party assets remain with their respective owners.'
for en in [False,True]:
 prefix='/en/' if en else '/'
 def t(j,e):return e if en else j
 for f in [x for x in root.rglob('index.html') if 'node_modules' not in x.parts and '.git' not in x.parts and ('en' in x.relative_to(root).parts)==en]:
  route='/'+'/'.join(f.parent.relative_to(root).parts)+'/' if f.parent!=root else '/'
  # Normalize the root special case.
  s=f.read_text();s=s.replace('</head>','<link rel="stylesheet" href="/css/interactive.css"></head>');s=s.replace('</body>','<script src="/js/site.js" defer></script></body>')
  s=s.replace('<a href="https://github.com/fixed0000">GitHub ↗</a></footer>',f'<a href="https://github.com/fixed0000">GitHub ↗</a><a href="{prefix}about/">'+t('このサイトについて','About This Website')+'</a></footer>')
  title=re.search(r'<h1[^>]*>(.*?)</h1>',s,re.S);title=re.sub('<[^>]+>','',title[1]) if title else 'Portfolio'
  desc=re.search(r'<meta name="description" content="([^"]*)"',s);desc=desc[1] if desc else 'Portfolio'
  url=re.search(r'<link rel="canonical" href="([^"]*)"',s)[1]
  og=f'<meta property="og:type" content="website"><meta property="og:title" content="{html.escape(title,quote=True)}"><meta property="og:description" content="{desc}"><meta property="og:url" content="{url}"><meta property="og:image" content="https://fixed0000.github.io/assets/screenshots/social-preview.png"><meta property="og:image:alt" content="Lidiia Borodina — Portfolio"><meta property="og:locale" content="'+('en_US' if en else 'ja_JP')+'"><meta name="twitter:card" content="summary_large_image">'
  s=s.replace('</head>',og+'</head>')
  ishome=f.parent==(root/'en' if en else root)
  if ishome:
   s=s.replace('<body>','<body class="hero-page">')
   marker='<section class="section">'
   pos=s.index(marker);s=s[:pos]+f'<div class="hero-actions"><a class="button primary" href="{prefix}experience/">'+t('職務経歴を見る','View Experience')+f'</a><a class="button" href="{prefix}research/">'+t('制作を見る','Explore Projects')+'</a></div>'+s[pos:]
   principles=[('正確性','複数の情報を照合し、相違点や確認が必要な箇所を明確にする。','Accuracy','Cross-check information and identify discrepancies and points to verify.'),('体系化','情報を整理し、必要な内容を把握しやすくする。','Organization','Organize information so the relevant details are easy to understand.'),('分かりやすい情報共有','対応状況や変更点を記録し、次の担当者に正確に伝える。','Clear Communication','Record progress and changes accurately for the next person.'),('継続的な改善','日々の業務で分かりにくい点を見直し、より確実な進め方を考える。','Continuous Improvement','Review unclear steps in everyday work and find more reliable ways to proceed.')]
   block='<h3 class="principles-title">'+t('仕事で大切にしたいこと','Working Principles')+'</h3><dl class="principles">'+''.join('<div><dt>'+t(j,e)+'</dt><dd>'+t(jd,ed)+'</dd></div>' for j,jd,e,ed in principles)+'</dl>'
   # Insert before the end of the interests section, not into research cards.
   key=t('興味・関心と大切にしていること','Interests & Working Principles');start=s.index(key+'</h2>');end=s.index('</section>',start);s=s[:end]+block+s[end:]
   interests_link=t('研究・制作へ','Research & projects')+'</a>'
   s=s.replace(interests_link,interests_link+f' <a class="button" href="{prefix}projects/kanji-recall/">Kanji Recall</a>')
  else:
   crumb=f'<nav class="breadcrumbs" aria-label="'+t('現在位置','Breadcrumb')+f'"><ol><li><a href="{prefix}">'+t('プロフィール','Profile')+'</a></li>'
   if '/projects/' in route or '/research/' in route and route not in ['/research/','/en/research/']:crumb+=f'<li><a href="{prefix}research/">'+t('研究・制作','Research & Projects')+'</a></li>'
   crumb+='<li aria-current="page">'+html.escape('Kanji Recall' if 'kanji-recall' in route else 'MoriGarden' if 'morigarden' in route else t('研究の詳細','Research Details') if '/research/' in route and route not in ['/research/','/en/research/'] else title)+'</li></ol></nav>'
   s=s.replace('<main class="wrap" id="main">','<main class="wrap" id="main">'+crumb)
  # Upgrade both project cards, leaving their meaningful descriptions and links intact.
  def upgrade(m):
   text=m[0];kanji='<h3>Kanji Recall</h3>' in text
   if not kanji and '<h3>MoriGarden</h3>' not in text:return text
   if kanji:
    image='<picture><source srcset="/assets/screenshots/kanji-recall.webp" type="image/webp"><img class="project-image" src="/assets/screenshots/kanji-recall.png" width="1280" height="800" loading="lazy" alt="'+t('Kanji Recallで一字を練習し、SVGのお手本と比較している画面','Kanji Recall practicing one kanji with an SVG reference overlay')+'"></picture>';tech='HTML / CSS / JavaScript · Canvas · Web Worker'
   else:
    image='<img class="project-image" src="/assets/screenshots/morigarden/01-garden.png" width="1280" height="800" loading="lazy" alt="'+t('MoriGardenの庭。キャラクターモデルを非表示にした実行画面。','MoriGarden landscape, captured in game with character models hidden.')+'">';tech='Godot 4.5.1 .NET · C# · .NET 8'
   content=text[text.index('>')+1:-len('</article>')];content=content.replace('<p class="label">In Development</p>','<p><span class="status-badge">In Development</span></p>')
   return '<article class="entry project-card">'+image+'<div class="project-copy">'+content+'<p class="tech">'+tech+'</p></div></article>'
  s=re.sub(r'<article class="entry"[^>]*>.*?</article>',upgrade,s,flags=re.S)
  s=s.replace('<div class="cards"><article class="entry project-card">','<div class="cards project-cards"><article class="entry project-card">')
  s=s.replace('<p class="label">2024 · Completed</p>','<p><span class="status-badge completed">2024 · Completed</span></p>').replace('<p class="label">2025 · Completed</p>','<p><span class="status-badge completed">2025 · Completed</span></p>')
  s=s.replace('読みと意味から、漢字を手書きで思い出す。ブラウザ内で動く学習アプリ。','一字ずつ手書きで思い出し、SVGのお手本や書き順で振り返る学習アプリ。').replace('Recall kanji from readings and meanings in a browser-based handwriting practice app.','Recall one kanji at a time, then review its SVG reference and stroke order.')
  if '/projects/' in route:
   end=s.index('</div>',s.index('<div class="page-heading">'))+6
   s=s[:end]+'<p><span class="status-badge">In Development</span></p>'+s[end:]
  if 'morigarden/' in route:
   s=s.replace('仮想の生き物を育てるシングルプレイヤーの3Dゲームです。','Chao（チャオ）を育てるシングルプレイヤーの3Dゲームです。').replace('A single-player 3D virtual-creature care game inspired by','A single-player 3D game about caring for Chao, inspired by')
   addition='<section class="section"><h2>'+t('開発の記録','Development History')+'</h2><p>'+t('2026年11月のコミットでは、Coastal Coveの分離、生き物の移動・休息・接触、アイテム保持や浅瀬での動作などの改善が記録されています。これは公開コミットに基づく紹介で、開発期間全体を示すものではありません。','Public commits from November 2026 record work on separating Coastal Cove, creature routes and rest, contact handling, item grips, and wading behavior. These are examples from the commit history, not a claim about the project’s entire development period.')+'</p><a href="https://github.com/fixed0000/MoriGarden/commits/main/">GitHub commit history</a></section><section class="section"><h2>'+t('ゲーム画面・第三者素材','Gameplay Images & Third-Party Assets')+'</h2><p>'+t('使用3Dモデル：<a href="https://sketchfab.com/3d-models/baby-chao-4bbffce818cc45aa88c9862ebe296e7c">Baby Chao</a> — <a href="https://sketchfab.com/3d-models/baby-chao-4bbffce818cc45aa88c9862ebe296e7c">Alice.Sacco</a>（Sketchfab、<a href="https://creativecommons.org/licenses/by/4.0/">CC BY</a>）。原作キャラクターのデザインに関する権利は、関連する権利者に帰属します。本プロジェクトはSEGAの公式作品ではありません。</p><p>組み込み時の調整：GodotへのGLB取り込み、およびコードによるサイズ・姿勢・目の表示の調整。メッシュ編集の詳細な履歴は未確認です。</p><p class="note">掲載ページには「From Sonic Adventure 2」とNoAIの表示があります。CC BYの表示を原作キャラクターに関する権利の許諾とは扱いません。当該モデルを生成AIへの入力に使用しません。以下は実行中のゲームから撮影した画面です。公開用の撮影ではBaby Chaoとプレイヤーモデルを非表示にしています。','3D model used: <a href="https://sketchfab.com/3d-models/baby-chao-4bbffce818cc45aa88c9862ebe296e7c">Baby Chao</a> by <a href="https://sketchfab.com/3d-models/baby-chao-4bbffce818cc45aa88c9862ebe296e7c">Alice.Sacco</a> (Sketchfab, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY</a>). Rights to the original character design remain with the relevant rights holders. This is not an official SEGA project.</p><p>In-project adaptations: GLB import into Godot and code-based scale, pose, and eye-display adjustments. The detailed history of mesh edits has not been verified.</p><p class="note">The source page states “From Sonic Adventure 2” and is tagged NoAI. Its CC BY label is not treated as permission covering the original character design. The model is not used as input to generative AI. The gallery below shows captures from the running game. Baby Chao and the player model were hidden for these public-facing captures.')+'</p></section><section class="section"><h2>'+t('ファン制作について','Fan Project Disclaimer')+'</h2><p class="disclaimer">'+t(JA_DISCLAIMER,EN_DISCLAIMER)+'</p></section>'
   gallery_items=[('01-garden','庭の全景','Garden overview'),('02-character','庭の小道と遊び場','Garden paths and play area'),('04-interface','ゲーム内ステータス表示','In-game status interface'),('05-inventory','持ち物の管理','Inventory management'),('06-coastal-cove','Coastal Coveの探索','Exploring Coastal Cove')]
   gallery='<section class="section" aria-labelledby="gallery-title"><h2 id="gallery-title">'+t('ギャラリー','Gallery')+'</h2><p>'+t('2026年11月13日、Godot 4.5.1で実行して撮影。権利確認が未完了のキャラクターモデルは非表示です。画像を選ぶと原寸で表示します。','Captured from the running game in Godot 4.5.1 on 13 November 2026. Character models are hidden pending rights clarification. Select an image to view it at full size.')+'</p><div class="game-gallery">'+''.join('<figure><a href="/assets/screenshots/morigarden/'+name+'.png"><img src="/assets/screenshots/morigarden/'+name+'.png" width="1280" height="800" loading="lazy" alt="'+t(j,e)+'"></a><figcaption>'+t(j,e)+'</figcaption></figure>' for name,j,e in gallery_items)+'</div></section>'
   addition=gallery+addition
   s=s.replace('</main>',addition+'</main>')
  f.write_text(s)
