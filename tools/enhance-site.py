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
   marker='<p class="career-focus"'
   pos=s.index(marker);s=s[:pos]+f'<div class="hero-actions"><a class="button primary" href="{prefix}experience/">'+t('職務経歴を見る','View Experience')+f'</a><a class="button" href="{prefix}research/">'+t('制作を見る','Explore Projects')+'</a></div>'+s[pos:]
   s=s.replace('日本語母語話者における「家族」という概念との連想分析</h3>','「家族」の連想を比較する</h3>').replace('Associations with the concept of “family” among native Japanese speakers</h3>','Associations with “Family”</h3>')
   s=s.replace('日本語コミュニカティブ表現の露訳における等価性検索の問題（メディアフランチャイズ『〈物語〉シリーズ』の作品を例に）</h3>','〈物語〉シリーズの翻訳表現</h3>').replace('The Problem of Finding Equivalents in Translating Japanese Communicatives into Russian (based on the Monogatari Series media franchise)</h3>','Translating Monogatari</h3>')
   principles=[('正確性','情報を照合し、不明点を明らかにする。','Accuracy','Check information against its sources and clarify uncertainty.'),('体系化','情報を目的ごとに整理し、必要な情報を見つけやすくする。','Organization','Organize information by purpose so it is easier to find.'),('伝達の分かりやすさ','次の担当者が理解できる形で、背景と変更点を残す。','Clear Handovers','Document context and changes so the next person can understand them.'),('改善','作業の目的を考え、分かりやすい手順を探す。','Improvement','Consider why a task is needed and seek clearer procedures.')]
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
    image='<div class="asset-pending"><strong>MoriGarden</strong><span>'+t('非営利のファン制作。第三者モデルの出典を明記し、ゲーム画面の掲載条件を確認しています。','A non-commercial fan project. The third-party model is credited; gameplay image publication remains under review.')+'</span></div>';tech='Godot 4.5.1 .NET · C# · .NET 8'
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
   addition='<section class="section"><h2>'+t('開発の記録','Development History')+'</h2><p>'+t('2026年11月のコミットでは、Coastal Coveの分離、生き物の移動・休息・接触、アイテム保持や浅瀬での動作などの改善が記録されています。これは公開コミットに基づく紹介で、開発期間全体を示すものではありません。','Public commits from November 2026 record work on separating Coastal Cove, creature routes and rest, contact handling, item grips, and wading behavior. These are examples from the commit history, not a claim about the project’s entire development period.')+'</p><a href="https://github.com/fixed0000/MoriGarden/commits/main/">GitHub commit history</a></section><section class="section"><h2>'+t('ゲーム画面・第三者素材','Gameplay Images & Third-Party Assets')+'</h2><p>'+t('使用3Dモデル：<a href="https://sketchfab.com/3d-models/baby-chao-4bbffce818cc45aa88c9862ebe296e7c">Baby Chao</a> — <a href="https://sketchfab.com/3d-models/baby-chao-4bbffce818cc45aa88c9862ebe296e7c">Alice.Sacco</a>（Sketchfab、<a href="https://creativecommons.org/licenses/by/4.0/">CC BY</a>）。原作キャラクターのデザインに関する権利は、関連する権利者に帰属します。本プロジェクトはSEGAの公式作品ではありません。</p><p>組み込み時の調整：GodotへのGLB取り込み、およびコードによるサイズ・姿勢・目の表示の調整。メッシュ編集の詳細な履歴は未確認です。</p><p class="note">掲載ページには「From Sonic Adventure 2」とNoAIの表示があります。CC BYの表示を原作キャラクターに関する権利の許諾とは扱いません。当該モデルを生成AIへの入力に使用しません。ゲーム画面は現在未掲載です。','3D model used: <a href="https://sketchfab.com/3d-models/baby-chao-4bbffce818cc45aa88c9862ebe296e7c">Baby Chao</a> by <a href="https://sketchfab.com/3d-models/baby-chao-4bbffce818cc45aa88c9862ebe296e7c">Alice.Sacco</a> (Sketchfab, <a href="https://creativecommons.org/licenses/by/4.0/">CC BY</a>). Rights to the original character design remain with the relevant rights holders. This is not an official SEGA project.</p><p>In-project adaptations: GLB import into Godot and code-based scale, pose, and eye-display adjustments. The detailed history of mesh edits has not been verified.</p><p class="note">The source page states “From Sonic Adventure 2” and is tagged NoAI. Its CC BY label is not treated as permission covering the original character design. The model is not used as input to generative AI. Gameplay images are not currently published.')+'</p></section><section class="section"><h2>'+t('ファン制作について','Fan Project Disclaimer')+'</h2><p class="disclaimer">'+t(JA_DISCLAIMER,EN_DISCLAIMER)+'</p></section>'
   s=s.replace('</main>',addition+'</main>')
  f.write_text(s)
