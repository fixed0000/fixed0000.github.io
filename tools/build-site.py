"""Build plain bilingual HTML. No runtime templating or production build required."""
from pathlib import Path
import re,html,json
ROOT=Path(__file__).resolve().parents[1]
nav=[('', 'プロフィール','Profile'),('experience/','職務経歴','Experience'),('skills/','スキル・資格','Skills & Certifications'),('education/','学歴','Education'),('research/','研究・制作','Research & Projects'),('contact/','お問い合わせ','Contact')]
def page(path,title,lead,body,en=False,section=None,scripts=''):
    prefix='/en/' if en else '/'; url=prefix+path; alt=('/'+path) if en else '/en/'+path
    name='Lidiia Borodina' if en else 'ボロディナ・リディア'
    links=''.join(f'<a href="{prefix+p}"'+(' aria-current="page"' if (section or path)==p else '')+f'>{e if en else j}</a>' for p,j,e in nav)
    heading=f'<h1 class="hero-title">{title}</h1>' if path=='' else f'<h1>{title}</h1>'
    location=('<p class="label">'+('Kyoto, Japan · Portfolio' if en else '京都、日本 · ポートフォリオ')+'</p>') if path=='' or path.startswith('projects/') else ''
    out=f'''<!doctype html>
<html lang="{'en' if en else 'ja'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title} | {name}</title><meta name="description" content="{html.escape(re.sub('<[^>]+>','',lead),quote=True)}"><meta name="theme-color" content="#315b83">
<link rel="canonical" href="https://fixed0000.github.io{url}"><link rel="alternate" hreflang="ja" href="https://fixed0000.github.io/{path}"><link rel="alternate" hreflang="en" href="https://fixed0000.github.io/en/{path}"><link rel="alternate" hreflang="x-default" href="https://fixed0000.github.io/{path}">
<link rel="stylesheet" href="/portfolio.css"><link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest"></head><body>
<a class="skip" href="#main">{'Skip to content' if en else '本文へ'}</a><header class="site-header"><div class="wrap identity"><a class="brand" href="{prefix}"><span class="mark" aria-hidden="true">LB</span>{name}</a><a class="language" href="{alt}" lang="{'ja' if en else 'en'}" hreflang="{'ja' if en else 'en'}">{'日本語' if en else 'English'}</a></div><nav class="wrap navigation" aria-label="{'Main navigation' if en else 'メインナビゲーション'}">{links}</nav></header>
<main class="wrap" id="main"><div class="page-heading">{location}{heading}<p class="lead">{lead}</p></div>{body}</main>
<footer class="wrap footer"><span>© 2026 Lidiia Borodina</span><a href="mailto:borodina.l2097@gmail.com">borodina.l2097@gmail.com</a><a href="https://github.com/fixed0000">GitHub ↗</a></footer>{scripts}</body></html>'''
    if path=='projects/kanji-recall/':out=out.replace('</head>','<link rel="stylesheet" href="/css/kanji-app.css"></head>')
    target=ROOT/url.strip('/')/'index.html';target.parent.mkdir(parents=True,exist_ok=True);target.write_text(out)
def entry(title,text,label='',link='',button='',id=''):
    return f'<article class="entry"'+(f' id="{id}"' if id else '')+'>'+ (f'<p class="label">{label}</p>' if label else '')+f'<h3>{title}</h3><p>{text}</p>'+ (f'<a class="button" href="{link}">{button}</a>' if link else '')+'</article>'
def section(title,content):return f'<section class="section"><h2>{title}</h2>{content}</section>'
# Research facts: current site, archived translations, and the owner’s task statement.
research=[
('family','日本語母語話者における「家族」という概念との連想分析','Associations with the concept of “family” among native Japanese speakers','2024',
'日本語・ロシア語母語話者を対象としたアンケート調査を通じて、「家族」に対する連想の共通点と相違点を比較しました。',
'A questionnaire-based study comparing associations with the concept of “family” among native Japanese and Russian speakers.',
'連想の共通点と相違点を検討すること。','To examine similarities and differences in associations.',
'アンケートと比較分析。質問文・参加者数・分析手順の詳細は原資料での確認が必要です。','Questionnaires and comparative analysis. The questionnaire, participant count, and detailed analysis procedure require verification against the original materials.',
'アンケート設計・比較分析・言語文化研究','Questionnaire design · comparative analysis · language and culture'),
('monogatari','日本語コミュニカティブ表現の露訳における等価性検索の問題（メディアフランチャイズ『〈物語〉シリーズ』の作品を例に）','The Problem of Finding Equivalents in Translating Japanese Communicatives into Russian (based on the Monogatari Series media franchise)','2025',
'〈物語〉シリーズに見られる会話表現とそのロシア語訳を比較し、文脈によって意味やニュアンスがどのように伝えられるかを検討しました。',
'An undergraduate study comparing Japanese conversational expressions in the Monogatari series with their Russian translations, focusing on how meaning and nuance are conveyed in context.',
'日本語の会話表現に対する翻訳上の等価性を検討すること。','To examine translation equivalence for Japanese conversational expressions.',
'原文と翻訳の照合・比較。使用作品・表現の選定基準と最終的な結論は原論文での確認が必要です。','Comparison of original expressions with translations. The selected works, expression selection criteria, and final conclusions require verification against the thesis.',
'翻訳比較・文脈分析・日本語とロシア語','Translation comparison · contextual analysis · Japanese and Russian')]
# Keep archived titles separate from recruiter-facing summaries; final diploma wording is unverified.
original_titles={r[0]:(r[1],r[2]) for r in research}
short_titles={
 'family':('「家族」に対する日本語・ロシア語母語話者の連想比較','Comparing Associations with “Family” in Japanese and Russian'),
 'monogatari':('日本語の会話表現はロシア語にどう訳されるか','Translating Japanese Conversational Expressions into Russian')}
research=[(r[0],*short_titles[r[0]],*r[3:]) for r in research]
for en in (False,True):
 p='/en/' if en else '/'
 def t(j,e):return e if en else j
 def cards():
  return '<div class="cards">'+entry('Kanji Recall',t('読みと意味から、漢字を手書きで思い出す。ブラウザ内で動く学習アプリ。','Recall kanji from readings and meanings in a browser-based handwriting practice app.'),'In Development',p+'projects/kanji-recall/',t('アプリを試す','Try the App'))+entry('MoriGarden',t('仮想の生き物を育て、ふれあう個人制作の3Dゲーム。Windows向けに開発中。','A personal 3D game about caring for and interacting with virtual creatures. In development for Windows.'),'In Development',p+'projects/morigarden/',t('プロジェクトを見る','View Project'))+'</div>'
 def researchcards():
  return '<div class="cards">'+''.join(entry(r[2] if en else r[1],r[5] if en else r[4],r[3]+' · Completed',p+'research/'+r[0]+'/',t('研究の詳細','Research details'), 'thesis' if r[0]=='monogatari' else 'family') for r in research)+'</div>'
 intro=t('ホテルでの予約情報管理、売上・入金情報の確認、日次報告、シフト間の引き継ぎに加え、ゲームローカライズでの翻訳テキスト確認・言語品質チェック（LQA）を経験してきました。情報の整合性を確認し、必要な修正や共有を行ってきた経験を生かし、データ品質管理・レポーティング・ITオペレーションなどの分野で専門性を高めたいと考えています。','My background includes reservation data management, sales and payment checks, daily reporting, and shift handovers in hotel operations, as well as translation review and linguistic quality assurance (LQA) in game localization. I am looking to apply my experience in information accuracy, issue resolution, and operational coordination to roles in data quality, reporting, and IT operations.')
 background='<div class="cards">'+entry(t('ホテル運営','Hotel Operations'),t('予約情報の照合・変更、売上・入金情報の確認、日次報告、シフト間の情報共有を担当。','Reservation data verification and updates, sales and payment checks, daily reporting, and shift handovers.'))+entry(t('ゲームローカライズ・LQA','Game Localization / LQA'),t('ゲーム内テキストの確認と言語品質チェックを担当。GitHub・TortoiseSVNを用いた変更管理を経験。','Game text review and linguistic quality assurance, with change tracking using GitHub and TortoiseSVN.'))+'</div>'
 interests='<div class="cards">'+entry(t('ゲーム・ゲーム制作','Games & Game Development'),t('ゲームの仕組みや、プレイヤーとシステムの関係に関心があります。MoriGardenで個人制作に取り組んでいます。','I am interested in game mechanics and the relationship between players and systems. I explore game development through MoriGarden.'),link=p+'projects/morigarden/',button='MoriGarden')+entry(t('言語・文化・研究','Language, Culture & Research'),t('日本語、意味、連想、翻訳、文化による違いに関心があります。研究とKanji Recallにつながるテーマです。','My interests include Japanese, meaning, associations, translation, and cultural differences—topics connected to my research and Kanji Recall.'),link=p+'research/',button=t('研究・制作へ','Research & projects'))+'</div>'
 body=section(t('実務の背景','Professional Background'),background)+section(t('個人制作','Featured Projects'),cards())+section(t('学術研究','Research'),researchcards())+section(t('興味・関心と大切にしていること','Interests & Working Principles'),interests)+section(t('お問い合わせ','Contact'),f'<a class="button" href="{p}contact/">'+t('連絡先を見る','Get in Touch')+'</a>')
 page('',t('業務の正確性を支える経験を、データ管理・業務運用の仕事へ。','Bringing operational accuracy and information management experience into my next role.'),intro,body,en)
 body=section(t('個人のソフトウェア制作','Independent Software Projects'),cards())+section(t('完了した学術研究','Completed Academic Work'),researchcards())+section(t('研究への関心','Research Interests'),'<p>'+t('日本語の意味論・語用論や、発話表現がどう受け取られるかに関心があります。','I am interested in Japanese semantics, pragmatics, and the perception of spoken expressions.')+'</p>')+section(t('実務での制作・品質確認','Professional Work'),entry(t('ゲームローカライズの言語品質確認','Linguistic Quality Checks for Games'),t('Fruitbat Factoryで『100% Orange Juice』などのテキスト確認・LQAを経験しました。詳しい業務内容は職務経歴にまとめています。','My localization work for Fruitbat Factory included text review and LQA for titles such as 100% Orange Juice. See Experience for details.'),link=p+'experience/',button=t('職務経歴へ','View experience')))
 page('research/',t('研究・制作','Research & Projects'),t('学術研究、個人制作、実務での経験を、それぞれの背景とともに紹介します。','Academic research, personal software projects, and professional work, each presented in its own context.'),body,en)
 for r in research:
  body=section(t('目的','Purpose'),'<p>'+r[7 if en else 6]+'</p>')+section(t('資料・方法','Materials & Methodology'),'<p>'+r[9 if en else 8]+'</p>')+section(t('関連スキル','Related Skills'),'<p>'+r[11 if en else 10]+'</p>')+section(t('資料と確認事項','Sources & Verification'),'<p>'+t('本サイトの既存研究紹介と旧翻訳ファイルに記載された情報を整理した概要です。原論文は未掲載のため、参加者数、数値的結果、統計的有意性は記載していません。正式な提出題目の表記は原資料との最終照合が必要です。','This summary consolidates information from the existing research page and archived translation files. The original papers are not published here; participant counts, numerical findings, and statistical significance are therefore not reported. The wording of the submitted title needs a final check against the original document.')+f'</p><a href="https://github.com/fixed0000/fixed0000.github.io/tree/bca2cf19c28cd41f1511ea425d0d7aa772676d60/js/translations">'+t('既存の記載を見る','View archived descriptions')+'</a>')
  original=section(t('原題','Original title'),'<p>'+html.escape(original_titles[r[0]][1 if en else 0])+'</p><p class="note">'+t('既存資料に記載された題目です。提出原稿との最終照合は未了です。','Title recorded in the archived materials; final verification against the submitted paper is pending.')+'</p>')
  subtitle=('<p class="research-subtitle">'+t('〈物語〉シリーズを対象とした翻訳の等価性とニュアンスの分析','An analysis of equivalence and nuance in the Monogatari series')+'</p>') if r[0]=='monogatari' else ''
  body=subtitle+body+original
  page('research/'+r[0]+'/',r[2 if en else 1],r[3]+' · Completed · '+r[5 if en else 4],body,en,'research/')
 mori=section(t('概要','Overview'),'<p>'+t('Chao Garden（Sonic Adventureシリーズ）に着想を得た、仮想の生き物を育てるシングルプレイヤーの3Dゲームです。','A single-player 3D virtual-creature care game inspired by the Chao Garden systems in Sonic Adventure.')+'</p>')+section(t('制作目的','Motivation'),'<p>'+t('生き物の成長や行動、プレイヤーとのふれあいを扱う個人制作です。','A personal exploration of creature growth, autonomous behavior, and interaction with the player.')+'</p>')
 mori+=section(t('実装済み機能','Implemented Features'),'<ul>'+''.join('<li>'+x+'</li>' for x in ([ '三人称の移動・カメラ、物を持つ・置く・投げる操作','卵の孵化、なでる・呼ぶ・餌を与える操作','自律的な散歩・水泳・休息・遊びと生き物同士の交流','果物・種・卵のショップ、木と果物の仕組み','自動保存と20個のセーブスロット、バックアップからの復旧'] if not en else ['Third-person movement and camera; pick up, place, and throw objects','Egg hatching; petting, calling, and feeding creatures','Autonomous wandering, swimming, resting, playing, and social interactions','Shop for fruit, seeds, and eggs; tree and fruit systems','Autosave, 20 save slots, and backup recovery']))+'</ul>')
 mori+=section(t('開発環境','Technologies'),'<p>Godot 4.5.1 .NET · C# · .NET 8 · '+t('GLBモデル・Python/Tkinter製の別体エディター','GLB models · separate Python/Tkinter editor')+'</p>')+section(t('現状・制約','Status & Limitations'),'<p>'+t('In Development。現在の起動手順はWindows向けです。公開Webビルドは確認できていないため、このサイトへのゲームの埋め込みは行っていません。','In Development. Current launch instructions target Windows. No public web build has been confirmed, so the game is not embedded in this site.')+'</p>')+section(t('今後の予定','Roadmap'),'<p>'+t('今後の具体的な公開予定・追加機能は未確定です。開発状況はGitHubで確認できます。','Specific release plans and future features are not confirmed. Development can be followed on GitHub.')+'</p>')+section('GitHub','<a class="button" href="https://github.com/fixed0000/MoriGarden">'+t('ソースコード・起動方法','Source Code & Launch Instructions')+'</a><p class="note">'+t('確認根拠：README.md、project.godot、Mori.csproj、Scripts/GardenGame.cs、Scripts/SaveStore.cs。','Evidence: README.md, project.godot, Mori.csproj, Scripts/GardenGame.cs, Scripts/SaveStore.cs.')+'</p>')
 page('projects/morigarden/','MoriGarden',t('仮想の生き物の成長とふれあいを楽しむ、開発中の個人制作3Dゲーム。','A personal 3D game in development about caring for and interacting with virtual creatures.'),mori,en,'research/')
 # Professional facts: current pages, source documents, and owner confirmation, 2026-11-17.
 hotel_groups=[
 ('予約情報の管理','Reservation Data Management','予約管理システムを使用し、予約内容、宿泊日程、客室タイプ、料金などの確認・変更に対応。','I use reservation systems to check and update booking details, dates, room types, and rates.'),
 ('数値・報告業務','Daily Reporting & Payment Checks','Excelを用いた日次報告、売上・入金情報の確認、差異がある場合の照合・確認を担当。','I prepare daily reports in Excel, check sales and payment information, and reconcile discrepancies.'),
 ('運営上の調整','Operational Coordination','担当業務の範囲内で、清掃状況や必要な作業を確認し、スタッフへの作業割り振りや関連情報の共有に対応。','Within my area of responsibility, I check cleaning status and required tasks, assign work to staff, and share relevant information.'),
 ('引き継ぎ・問い合わせ対応','Handovers & Follow-up','予約上の注意事項、変更内容、未完了事項などを記録し、次のシフトに引き継ぎ。','I record booking notes, changes, and outstanding items for the next shift.')]
 duties='<dl class="duties">'+''.join('<div><dt>'+t(j,e)+'</dt><dd>'+t(jd,ed)+'</dd></div>' for j,e,jd,ed in hotel_groups)+'</dl>'
 experience='<div class="entries"><article class="entry"><p class="label">'+t('2025年12月–現在','Dec 2025–present')+'</p><h2>'+t('ホテル運営','Hotel Operations')+'</h2><p>'+t('京都のホテルで、予約管理システムとExcelを使用した日々の運営業務を担当しています。','I work in hotel operations in Kyoto, using reservation systems and Excel in my day-to-day responsibilities.')+'</p>'+duties+'</article><article class="entry"><p class="label">'+t('2023年6月–2025年7月','Jun 2023–Jul 2025')+'</p><h2>'+t('ゲームローカライズ — Fruitbat Factory','Game Localization — Fruitbat Factory')+'</h2><p>'+t('ゲームローカライズ業務において、翻訳済みテキストの確認、言語品質チェック（LQA）、修正内容の確認に従事。GitHubおよびTortoiseSVNを使用して、ローカライズ関連ファイルの変更を確認・管理しました。','Worked on game localization tasks, including reviewing translated text, conducting linguistic quality checks (LQA), and checking revisions. Used GitHub and TortoiseSVN to review and track changes to localization files.')+'</p></article></div>'
 page('experience/',t('職務経歴','Experience'),t('ホテル運営とゲームローカライズの実務を通じて、情報の照合・修正、品質確認、変更管理、業務の引き継ぎを経験してきました。','My experience spans hotel operations and game localization, including information verification, corrections, quality checks, change tracking, and operational handovers.'),experience,en)
 education='<div class="entries">'+entry(t('モスクワ市立教育大学（Moscow City University）','Moscow City University (MCU)'),t('日本語の翻訳・通訳を専攻し、2025年に学士課程を修了しました。','Bachelor’s degree in translation and interpreting, specializing in Japanese.'),t('2020年–2025年','2020–2025'))+entry(t('筑波大学','University of Tsukuba'),t('筑波大学に交換留学し、日本の大学で学びました。','Studied at the University of Tsukuba as an exchange student.'),t('2024年4月–8月','Apr–Aug 2024'))+'</div>'
 # These are standalone timeline entries, so their headings follow the page heading.
 education=education.replace('<h3>','<h2>').replace('</h3>','</h2>')
 page('education/',t('学歴','Education'),t('モスクワ市立教育大学で日本語の翻訳・通訳を専攻し、2025年に学士課程を修了しました。大学では翻訳実践に加え、言語表現の意味や文脈に関する研究にも取り組みました。',"I completed my bachelor's degree at Moscow City University in 2025, specializing in Japanese translation and interpreting. My studies included translation practice and research into meaning and context in language use."),education,en)
 skill_groups=[
 ('データ照合・修正','Data Verification & Corrections','予約内容や料金などの情報を確認し、不一致がある場合の照合・修正を行う実務経験。','Practical experience checking reservation details and rates, reconciling discrepancies, and correcting records.'),
 ('Excel・Google Sheets','Excel & Google Sheets','業務データの入力・整理、日次報告、基本的な関数を用いた確認・集計。','Data entry and organization, daily reporting, and checks and summaries using basic spreadsheet functions.'),
 ('変更管理・品質確認','Change Tracking & Quality Checks','ゲームローカライズでのテキスト確認、言語品質チェック（LQA）、GitHub・TortoiseSVNを用いた変更確認。','Game localization text review and linguistic quality assurance (LQA), with change tracking using GitHub and TortoiseSVN.'),
 ('業務連携・引き継ぎ','Coordination & Operational Handovers','作業状況や注意事項を整理し、他の担当者に必要な情報を共有。','Organizing task status and important notes, and sharing relevant information with colleagues.')]
 skills=section(t('実務で培ったスキル','Professional Skills'),''.join(entry(t(j,e),t(jd,ed)) for j,e,jd,ed in skill_groups))
 skills+=section(t('個人制作','Personal Projects'),entry('Web / Godot',t('本サイトとKanji RecallではHTML・CSS・JavaScript、MoriGardenではGodot・C#を使用しています。AIを開発支援ツールとして活用し、機能の検討、コードの確認、動作テストを行っています。','I use HTML, CSS, and JavaScript for this site and Kanji Recall, and Godot and C# for MoriGarden. I use AI-assisted development tools to explore features, review code, and test functionality.')))
 skills+=section(t('学習中','Currently Learning'),'<p>'+t('R・Python：基礎を学習中。','R and Python: learning the fundamentals.')+'</p>')+section(t('語学・資格','Languages & Certifications'),'<ul>'+''.join('<li>'+x+'</li>' for x in ([ '日本語：JLPT N1（2024年）','英語：TOEIC 910（2026年）','ロシア語：母語'] if not en else ['Japanese: JLPT N1 (2024)','English: TOEIC 910 (2026)','Russian: native']))+'</ul>')
 page('skills/',t('スキル・資格','Skills & Certifications'),t('情報の照合・修正、言語品質の確認、日次報告と引き継ぎを通じて培ったスキル。','Skills developed through information checks and corrections, linguistic quality assurance, daily reporting, and operational handovers.'),skills,en)
 contact=section(t('連絡先','Get in Touch'),'<a class="contact-link" href="mailto:borodina.l2097@gmail.com">borodina.l2097@gmail.com</a><p><a href="https://github.com/fixed0000">GitHub</a></p>')
 page('contact/',t('お問い合わせ','Contact'),t('データ品質管理、レポーティング、ITオペレーション、業務運用に関連する職種への転職を希望しています。勤務地は東京都内を第一希望とし、大阪府内および首都圏も検討しています。お問い合わせはメールにてお願いいたします。','I am seeking opportunities in data quality, reporting, IT operations, and operational support. Tokyo is my preferred location, and I am also open to opportunities in Osaka and the greater Tokyo area. Please contact me by email.'),contact,en)
 # App markup shared through a separate source file, all labels localized by builder.
 app=(ROOT/'tools/app-ja.html').read_text() if not en else (ROOT/'tools/app-en.html').read_text()
 page('projects/kanji-recall/','Kanji Recall',t('読みと意味から漢字を思い出す、手書き練習アプリ。In Development。','Recall kanji from readings and meanings. A handwriting practice app, In Development.'),app,en,'research/','<script type="module" src="/js/kanji/app.js"></script>')
 # About describes the portfolio; project-specific limitations remain on project pages.
 about=section(t('このサイトの目的','Purpose'),'<p>'+t('職務経験、学術研究、個人制作を紹介する、採用向けの個人ポートフォリオです。','A personal career portfolio presenting my professional experience, academic research, and personal projects.')+'</p>')
 about+=section(t('構造とデザイン','Structure & Design'),'<p>'+t('HTML・CSS・JavaScriptを使用した、日本語・英語の静的サイトです。余白と明確な階層、濃紺の配色、控えめなアニメーションを組み合わせています。言語を切り替えても、対応するページに移動します。','A bilingual static site built with HTML, CSS, and JavaScript. Clear hierarchy, generous spacing, a navy palette, and restrained animation shape the design. Language links lead to the corresponding page.')+'</p>')
 about+=section(t('アクセシビリティ','Accessibility'),'<p>'+t('画面幅に応じたレイアウト、キーボード操作、フォーカス表示、セマンティックHTMLに対応し、動きを減らす設定を尊重しています。','The site supports responsive layouts, keyboard navigation, visible focus, semantic HTML, and reduced-motion preferences.')+'</p>')
 about+=section(t('AIを活用した制作','AI-assisted Development'),'<p>'+t('個人制作では、AIを開発支援ツールとして活用しています。要件の整理、機能の検討、コードの確認、動作テスト、改善を繰り返しながら制作しています。','I use AI-assisted development tools in my personal projects to help plan features, review code, test functionality, and make iterative improvements.')+'</p>')
 about+=section(t('ソースとライセンス','Source & Licenses'),'<p><a href="https://github.com/fixed0000/fixed0000.github.io">'+t('GitHub — ポートフォリオのソース','GitHub — portfolio source')+'</a></p><p><a href="/assets/kanji/DATA-SOURCES.txt">'+t('漢字データの出典・クレジット','Kanji data sources and attribution')+'</a> · <a href="/assets/kanji/LICENSE.txt">KanjiVG — CC BY-SA 3.0</a></p><p><a href="'+p+'projects/morigarden/">'+t('MoriGardenの第三者素材・ライセンスとファン制作について','MoriGarden third-party assets, licenses, and fan-project disclaimer')+'</a></p>')
 page('about/',t('このサイトについて','About This Website'),t('このポートフォリオの目的、デザイン、制作方法と出典。','The purpose, design, development approach, and sources behind this portfolio.'),about,en)

urls=[]
for f in ROOT.rglob('index.html'):
 if any(x in f.parts for x in ('node_modules','.git')):continue
 urls.append('https://fixed0000.github.io/'+f.parent.relative_to(ROOT).as_posix().replace('.','').strip('/')+('/' if f.parent!=ROOT else ''))
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+u+'</loc></url>' for u in sorted(urls))+'</urlset>')

# Shared editorial enhancement is part of the reproducible build.
import runpy
runpy.run_path(str(ROOT/"tools/enhance-site.py"))
