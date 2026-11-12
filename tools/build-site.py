"""Build plain bilingual HTML. No runtime templating or production build required."""
from pathlib import Path
import re,html,json
ROOT=Path(__file__).resolve().parents[1]
nav=[('', 'プロフィール','Profile'),('experience/','職務経歴','Experience'),('skills/','スキル・資格','Skills & Certifications'),('education/','学歴','Education'),('research/','研究・制作','Research & Projects'),('contact/','お問い合わせ','Contact')]
def page(path,title,lead,body,en=False,section=None,scripts=''):
    prefix='/en/' if en else '/'; url=prefix+path; alt=('/'+path) if en else '/en/'+path
    name='Lidiia Borodina' if en else 'ボロディナ・リディア'
    links=''.join(f'<a href="{prefix+p}"'+(' aria-current="page"' if (section or path)==p else '')+f'>{e if en else j}</a>' for p,j,e in nav)
    heading='<h1 class="hero-title"><span>正確さと仕組みを大切に、</span><span>次の分野へ。</span></h1>' if not en and path=='' else f'<h1>{title}</h1>'
    out=f'''<!doctype html>
<html lang="{'en' if en else 'ja'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} | {name}</title><meta name="description" content="{html.escape(re.sub('<[^>]+>','',lead),quote=True)}"><meta name="theme-color" content="#315b83">
<link rel="canonical" href="https://fixed0000.github.io{url}"><link rel="alternate" hreflang="ja" href="https://fixed0000.github.io/{path}"><link rel="alternate" hreflang="en" href="https://fixed0000.github.io/en/{path}"><link rel="alternate" hreflang="x-default" href="https://fixed0000.github.io/{path}">
<link rel="stylesheet" href="/portfolio.css"><link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest"></head><body>
<a class="skip" href="#main">{'Skip to content' if en else '本文へ'}</a><header class="site-header"><div class="wrap identity"><a class="brand" href="{prefix}"><span class="mark" aria-hidden="true">LB</span>{name}</a><a class="language" href="{alt}" lang="{'ja' if en else 'en'}" hreflang="{'ja' if en else 'en'}">{'日本語' if en else 'English'}</a></div><nav class="wrap navigation" aria-label="{'Main navigation' if en else 'メインナビゲーション'}">{links}</nav></header>
<main class="wrap" id="main"><div class="page-heading"><p class="label">{'Kyoto, Japan · Portfolio' if en else '京都、日本 · ポートフォリオ'}</p>{heading}<p class="lead">{lead}</p></div>{body}</main>
<footer class="wrap footer"><span>© 2026 Lidiia Borodina</span><a href="mailto:borodina.l2097@gmail.com">borodina.l2097@gmail.com</a><a href="https://github.com/fixed0000">GitHub ↗</a></footer>{scripts}</body></html>'''
    target=ROOT/url.strip('/')/'index.html';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(out)
def entry(title,text,label='',link='',button='',id=''):
    return f'<article class="entry"'+(f' id="{id}"' if id else '')+f'><p class="label">{label}</p><h3>{title}</h3><p>{text}</p>'+ (f'<a class="button" href="{link}">{button}</a>' if link else '')+'</article>'
def section(title,content):return f'<section class="section"><h2>{title}</h2>{content}</section>'
# Research facts: current site, archived translations, and the owner’s task statement.
research=[
('family','日本語母語話者における「家族」という概念との連想分析','Associations with the concept of “family” among native Japanese speakers','2024',
'日本語とロシア語の母語話者による「家族」の連想を比較する研究。アンケートを用い、回答を比較・分析しました。',
'A questionnaire-based study comparing associations with “family” among native Japanese and Russian speakers.',
'連想の共通点と相違点を検討すること。','To examine similarities and differences in associations.',
'アンケートと比較分析。質問文・参加者数・分析手順の詳細は原資料での確認が必要です。','Questionnaires and comparative analysis. The questionnaire, participant count, and detailed analysis procedure require verification against the original materials.',
'アンケート設計・比較分析・言語文化研究','Questionnaire design · comparative analysis · language and culture'),
('monogatari','日本語コミュニカティブ表現の露訳における等価性検索の問題（メディアフランチャイズ『〈物語〉シリーズ』の作品を例に）','The Problem of Finding Equivalents in Translating Japanese Communicatives into Russian (based on the Monogatari Series media franchise)','2025',
'〈物語〉シリーズの会話表現とロシア語訳を照合し、文脈の中で意味やニュアンスがどう伝えられるかを検討した卒業研究です。',
'An undergraduate thesis comparing conversational expressions in the Monogatari series with their Russian translations to examine how meaning and nuance are conveyed in context.',
'日本語の会話表現に対する翻訳上の等価性を検討すること。','To examine translation equivalence for Japanese conversational expressions.',
'原文と翻訳の照合・比較。使用作品・表現の選定基準と最終的な結論は原論文での確認が必要です。','Comparison of original expressions with translations. The selected works, expression selection criteria, and final conclusions require verification against the thesis.',
'翻訳比較・文脈分析・日本語とロシア語','Translation comparison · contextual analysis · Japanese and Russian')]
for en in (False,True):
 p='/en/' if en else '/'
 def t(j,e):return e if en else j
 def cards():
  return '<div class="cards">'+entry('Kanji Recall',t('読みと意味から、漢字を手書きで思い出す。ブラウザ内で動く学習アプリ。','Recall kanji from readings and meanings in a browser-based handwriting practice app.'),'In Development',p+'projects/kanji-recall/',t('アプリを試す','Try the App'))+entry('MoriGarden',t('仮想の生き物を育て、ふれあう個人制作の3Dゲーム。Windows向けに開発中。','A personal 3D game about caring for and interacting with virtual creatures. In development for Windows.'),'In Development',p+'projects/morigarden/',t('プロジェクトを見る','View Project'))+'</div>'
 def researchcards():
  return '<div class="cards">'+''.join(entry(r[2] if en else r[1],r[5] if en else r[4],r[3]+' · Completed',p+'research/'+r[0]+'/',t('研究の詳細','Research details'), 'thesis' if r[0]=='monogatari' else 'family') for r in research)+'</div>'
 intro=t('予約情報の照合、売上・入金の確認、日次報告、業務の引き継ぎを経験してきました。ゲームローカライズでは翻訳テキストの確認とLQA、変更管理を担当しました。これらの実務経験を土台に、データ品質管理、レポーティング、IT運用、業務管理の分野への転職を目指しています。','My experience includes checking reservation information, verifying sales and payments, daily reporting, and operational handovers. In game localization, I reviewed translated text, performed LQA, and tracked changes. I am seeking to build on this practical experience in data quality, reporting, IT operations, and business operations.')
 background='<div class="cards">'+entry(t('ホテル運営','Hotel Operations'),t('予約管理システムとExcelを用いた情報確認、日次報告、シフト間の引き継ぎ。','Information checks using reservation systems and Excel, daily reporting, and shift handovers.'))+entry('Game Localization / LQA',t('Fruitbat Factoryでの翻訳テキスト確認と言語品質チェック。GitHub・TortoiseSVNによる変更管理。','Translation text review and linguistic quality checks for Fruitbat Factory; change tracking with GitHub and TortoiseSVN.'))+'</div>'
 interests='<div class="cards">'+entry(t('ゲーム・ゲーム制作','Games & Game Development'),t('ゲームの仕組みや、プレイヤーとシステムの関係に関心があります。MoriGardenで個人制作に取り組んでいます。','I am interested in game mechanics and the relationship between players and systems. I explore game development through MoriGarden.'),link=p+'projects/morigarden/',button='MoriGarden')+entry(t('言語・文化・研究','Language, Culture & Research'),t('日本語、意味、連想、翻訳、文化による違いに関心があります。研究とKanji Recallにつながるテーマです。','My interests include Japanese, meaning, associations, translation, and cultural differences—topics connected to my research and Kanji Recall.'),link=p+'research/',button=t('研究・制作へ','Research & projects'))+'</div>'
 body='<p class="career-focus">Data Quality / Reporting / IT Operations / Business Operations</p>'+section(t('実務の背景','Professional Background'),background)+section(t('個人制作','Featured Projects'),cards())+section(t('学術研究','Research'),researchcards())+section(t('興味・関心と大切にしていること','Interests & Working Principles'),interests)+section(t('お問い合わせ','Contact'),f'<a class="button" href="{p}contact/">'+t('連絡先・履歴書','Contact & résumés')+'</a>')
 page('',t('正確さと仕組みを大切に、次の分野へ。','Building on accuracy, structure, and practical experience.'),intro,body,en)
 body=section(t('個人のソフトウェア制作','Independent Software Projects'),cards())+section(t('完了した学術研究','Completed Academic Work'),researchcards())+section(t('研究への関心','Research Interests'),'<p>'+t('日本語の意味論・語用論や、発話表現がどう受け取られるかに関心があります。','I am interested in Japanese semantics, pragmatics, and the perception of spoken expressions.')+'</p>')+section(t('実務での制作・品質確認','Professional Work'),entry(t('ゲームローカライズの言語品質確認','Linguistic Quality Checks for Games'),t('Fruitbat Factoryで『100% Orange Juice』などの翻訳テキスト確認・LQAを経験しました。業務データや非公開資料は掲載していません。','My work for Fruitbat Factory included translated text review and LQA for titles including 100% Orange Juice. No confidential work materials are published here.'),link=p+'experience/',button=t('職務経歴へ','View experience')))
 page('research/',t('研究・制作','Research & Projects'),t('学術研究、個人制作、実務での経験を、それぞれの背景とともに紹介します。','Academic research, personal software projects, and professional work, each presented in its own context.'),body,en)
 for r in research:
  body=section(t('目的','Purpose'),'<p>'+r[7 if en else 6]+'</p>')+section(t('資料・方法','Materials & Methodology'),'<p>'+r[9 if en else 8]+'</p>')+section(t('関連スキル','Related Skills'),'<p>'+r[11 if en else 10]+'</p>')+section(t('資料と確認事項','Sources & Verification'),'<p>'+t('本サイトの既存研究紹介と旧翻訳ファイルに記載された情報を整理した概要です。原論文は未掲載のため、参加者数、数値的結果、統計的有意性は記載していません。正式な提出題目の表記は原資料との最終照合が必要です。','This summary consolidates information from the existing research page and archived translation files. The original papers are not published here; participant counts, numerical findings, and statistical significance are therefore not reported. The wording of the submitted title needs a final check against the original document.')+f'</p><a href="https://github.com/fixed0000/fixed0000.github.io/tree/bca2cf19c28cd41f1511ea425d0d7aa772676d60/js/translations">'+t('既存の記載を見る','View archived descriptions')+'</a>')
  page('research/'+r[0]+'/',r[2 if en else 1],r[3]+' · Completed · '+r[5 if en else 4],body,en,'research/')
 mori=section(t('概要','Overview'),'<p>'+t('Chao Garden（Sonic Adventureシリーズ）に着想を得た、仮想の生き物を育てるシングルプレイヤーの3Dゲームです。','A single-player 3D virtual-creature care game inspired by the Chao Garden systems in Sonic Adventure.')+'</p>')+section(t('制作目的','Motivation'),'<p>'+t('生き物の成長や行動、プレイヤーとのふれあいを扱う個人制作です。','A personal exploration of creature growth, autonomous behavior, and interaction with the player.')+'</p>')
 mori+=section(t('実装済み機能','Implemented Features'),'<ul>'+''.join('<li>'+x+'</li>' for x in ([ '三人称の移動・カメラ、物を持つ・置く・投げる操作','卵の孵化、なでる・呼ぶ・餌を与える操作','自律的な散歩・水泳・休息・遊びと生き物同士の交流','果物・種・卵のショップ、木と果物の仕組み','自動保存と20個のセーブスロット、バックアップからの復旧'] if not en else ['Third-person movement and camera; pick up, place, and throw objects','Egg hatching; petting, calling, and feeding creatures','Autonomous wandering, swimming, resting, playing, and social interactions','Shop for fruit, seeds, and eggs; tree and fruit systems','Autosave, 20 save slots, and backup recovery']))+'</ul>')
 mori+=section(t('開発環境','Technologies'),'<p>Godot 4.5.1 .NET · C# · .NET 8 · '+t('GLBモデル・Python/Tkinter製の別体エディター','GLB models · separate Python/Tkinter editor')+'</p>')+section(t('現状・制約','Status & Limitations'),'<p>'+t('In Development。READMEとコードを確認しましたが、この環境でゲーム自体は実行していません。公開リリースとWebビルドは確認できませんでした。現状はWindows向けの起動手順であり、サイトへの埋め込みは行っていません。','In Development. The README and code were inspected; the game itself was not run in this environment. No public release or web build was found. Current launch instructions target Windows; the game is not embedded in this site.')+'</p>')+section(t('今後の予定','Roadmap'),'<p>'+t('今後の具体的な公開予定・追加機能は未確定です。開発状況はGitHubで確認できます。','Specific release plans and future features are not confirmed. Development can be followed on GitHub.')+'</p>')+section('GitHub','<a class="button" href="https://github.com/fixed0000/MoriGarden">'+t('ソースコード・起動方法','Source Code & Launch Instructions')+'</a><p class="note">'+t('確認根拠：README.md、project.godot、Mori.csproj、Scripts/GardenGame.cs、Scripts/SaveStore.cs。','Evidence: README.md, project.godot, Mori.csproj, Scripts/GardenGame.cs, Scripts/SaveStore.cs.')+'</p>')
 page('projects/morigarden/','MoriGarden',t('仮想の生き物の成長とふれあいを楽しむ、開発中の個人制作3Dゲーム。','A personal 3D game in development about caring for and interacting with virtual creatures.'),mori,en,'research/')
 # Preserve the confirmed content of existing experience and education pages; only standardize shell.
 for route,title in [('experience/',t('職務経歴','Experience')),('education/',t('学歴','Education'))]:
  old=(ROOT/p.strip('/')/route/'index.html').read_text()
  lead=re.search(r'<p class="lead">(.*?)</p>',old,re.S).group(1)
  entries=re.search(r'(<div class="entries">.*)\s*</main>',old,re.S).group(1)
  page(route,title,lead,entries,en)
 skills=section(t('実務経験','Professional Experience'),entry(t('データ確認・集計','Data Checks & Reporting'),t('Excel・Google Sheetsでの集計や報告。予約管理システムでの予約情報の照合・修正。','Compiling data and reporting with Excel and Google Sheets; checking and correcting reservation information.'))+entry(t('言語品質・変更管理','Language Quality & Change Tracking'),t('翻訳テキスト確認・LQA。GitHubとTortoiseSVNを用いたテキスト変更管理。','Translation review and LQA; tracking text changes with GitHub and TortoiseSVN.')))
 skills+=section(t('個人制作','Personal Projects'),entry('Web / Godot',t('HTML・CSS・JavaScriptによる本サイトとKanji Recall。MoriGardenではGodot・C#を使用。実務経験とは区別しています。','This site and Kanji Recall use HTML, CSS, and JavaScript. MoriGarden uses Godot and C#. These are personal projects, separate from professional experience.')))
 skills+=section(t('学習中','Currently Learning'),'<p>'+t('R・Pythonの基礎。','Fundamentals of R and Python.')+'</p>')+section(t('語学・資格','Languages & Certifications'),'<p>'+t('日本語：JLPT N1（2024年）。英語：TOEIC 910（2026年）。ロシア語：母語。','Japanese: JLPT N1 (2024). English: TOEIC 910 (2026). Russian: native.')+'</p>')
 page('skills/',t('スキル・資格','Skills & Certifications'),t('実務、個人制作、学習中の技術を区別して紹介します。','Professional experience, personal projects, and current learning are presented separately.'),skills,en)
 contact=section(t('連絡先','Get in Touch'),'<a class="contact-link" href="mailto:borodina.l2097@gmail.com">borodina.l2097@gmail.com</a><p><a href="https://github.com/fixed0000">GitHub</a></p>')+section(t('履歴書・職務経歴書','Résumés'),'<p class="note">'+t('既存のPDFです。現在の職歴・資格をすべて反映しているとは限りません。','These are existing PDFs and may not reflect all current experience or qualifications.')+'</p><a class="button" href="/Lidia_Borodina_CV_JP.pdf">日本語 PDF</a> <a class="button" href="/Lidia_Borodina_CV_EN.pdf">English PDF</a>')+section(t('プロジェクト','Projects'),cards())
 page('contact/',t('お問い合わせ','Contact'),t('データ品質管理、レポーティング、IT運用、業務管理の分野での機会を探しています。ご連絡はメールでお願いします。','I am seeking opportunities in data quality, reporting, IT operations, and business operations. Please contact me by email.'),contact,en)
 # App markup shared through a separate source file, all labels localized by builder.
 app=(ROOT/'tools/app-ja.html').read_text() if not en else (ROOT/'tools/app-en.html').read_text()
 page('projects/kanji-recall/','Kanji Recall',t('読みと意味から漢字を思い出す、手書き練習アプリ。In Development。','Recall kanji from readings and meanings. A handwriting practice app, In Development.'),app,en,'research/','<script type="module" src="/js/kanji/app.js"></script>')
urls=[]
for f in ROOT.rglob('index.html'):
 if any(x in f.parts for x in ('node_modules','.git')):continue
 urls.append('https://fixed0000.github.io/'+str(f.parent.relative_to(ROOT)).replace('.','').strip('/')+('/' if f.parent!=ROOT else ''))
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+u+'</loc></url>' for u in sorted(urls))+'</urlset>')
