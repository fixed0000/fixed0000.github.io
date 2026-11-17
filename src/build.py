"""Deterministic, dependency-free static renderer for GitHub Pages."""
from pathlib import Path
from html import unescape
import json,re,sys
sys.path.insert(0,str(Path(__file__).parent))
from components import e,link,section,projects,papers,text_blocks,timeline,qualifications
ROOT=Path(__file__).resolve().parents[1]
DATA=json.loads((ROOT/'content/site.json').read_text(encoding='utf-8'))
ORIGIN='https://fixed0000.github.io'

def paragraphs(record):
    return ''.join('<p>'+e(paragraph)+'</p>' for paragraph in record['paragraphs'])

def content(key,lang):
    t=lambda key:DATA['ui'][key][lang]
    p='/en/' if lang=='en' else '/';d=DATA
    if key=='home':
        intro='<div class="hero-facts"><p>'+t('hotel_operations_game_localization')+'</p><p>'+t('based_in_kyoto_tokyo_preferred')+'</p></div>'
        actions='<div class="hero-actions">'+link(p+'experience/',t('view_experience'),True)+link(p+'research/',t('explore_the_work'))+link(p+'contact/',t('get_in_touch'))+'</div>'
        evidence='<div class="evidence-strip">'+''.join('<div><span>'+e(item[lang]['label'])+'</span><strong>'+e(item[lang]['value'])+'</strong><small>'+e(item[lang]['date'])+'</small></div>' for item in d['homeEvidence'])+'</div>'
        return intro+actions+evidence+section('01',t('professional_background'),text_blocks(d['background'],lang)+link(p+'experience/',t('view_experience')),'professional-background')+section('02',t('personal_projects'),projects(d,lang))+section('03',t('research_into_language_meaning'),papers(d,lang))
    if key=='experience':
        return section('01',t('work_history'),timeline(d,lang))
    if key=='skills':
        groups='<div class="skill-groups">'+''.join('<article><h3>'+e(s[lang]['title'])+'</h3><ul>'+''.join('<li>'+e(x)+'</li>' for x in s[lang]['items'])+'</ul></article>' for s in d['skills'])+'</div>'
        tools='<ul class="tool-list">'+''.join('<li>'+x+'</li>' for x in d['tools'])+'</ul><p>'+t('used_in_this_site_kanji_recall_and_morigarden_i_use_ai_assisted_t')+'</p>'
        return section('01',t('professional_experience'),groups)+section('02',t('personal_project_tools'),tools)+section('03',t('currently_learning'),'<p class="learning"><strong>'+e(' / '.join(d['learning']))+'</strong>'+t('learning_the_fundamentals')+'</p>')+section('04',t('languages_qualifications'),qualifications(d,lang))
    if key=='work':return section('01',t('personal_software_projects'),projects(d,lang))+section('02',t('completed_academic_research'),papers(d,lang))
    if key in ['education','about']:
        education=section('01',t('education'),timeline(d,lang,True),'education')
        if key=='education':return education+link(p+'about/',t('more_about_me'))
        site='<div class="site-note"><p>'+t('about_technical_intro')+'</p><ul><li><a href="https://github.com/fixed0000/fixed0000.github.io">GitHub — '+t('portfolio_source')+'</a></li><li><a href="/assets/kanji/DATA-SOURCES.txt">'+t('kanji_data_sources_attribution')+'</a> · <a href="/assets/kanji/LICENSE.txt">KanjiVG — CC BY-SA 3.0</a></li><li><a href="'+p+'projects/morigarden/">'+t('morigarden_third_party_assets_fan_project_disclaimer')+'</a></li></ul></div>'
        about=d['aboutSections']
        return section('01',t('professional_biography'),paragraphs(about[0][lang]),'background')+education.replace('>01</span>','>02</span>',1)+''.join(section(f'{i:02}',record[lang]['title'],paragraphs(record[lang]),record['id']) for i,record in enumerate(about[1:],3))+section('06',t('about_this_website'),site,'website')
    if key=='contact':
        return '<div class="contact-layout"><a class="email-address" href="mailto:'+d['person']['email']+'">'+d['person']['email']+' <span aria-hidden="true">↗</span></a><div class="contact-notes"><div><h2>'+t('location_preferences')+'</h2><p>'+t('tokyo_is_my_preferred_location_i_am_also_open_to_opportunities_in')+'</p></div><div><h2>'+t('contact_2')+'</h2><p>'+t('please_contact_me_by_email')+'</p><a class="text-link" href="'+d['person']['github']+'">GitHub / fixed0000 ↗</a></div></div></div>'
    if key=='notfound':return '<div class="notfound-links">'+''.join(link(p+url,j if lang=='ja' else en) for url,j,en in d['navigation'])+'</div>'
    if key=='kanji-recall':return (ROOT/'tools'/('app-ja.html' if lang=='ja' else 'app-en.html')).read_text(encoding='utf-8')
    return d['pages'][key][lang]['body']

def render(key,lang):
    record=DATA['pages'][key];r=record[lang];route=record['route'];p='/en/' if lang=='en' else '/';alt=('/' if lang=='en' else '/en/')+route
    t=lambda key:DATA['ui'][key][lang]
    active='research/' if key in ['work','family','monogatari','kanji-recall','morigarden'] else 'about/' if key=='education' else route
    labels=DATA['labels'][lang];name=DATA['person'][lang];isapp=key=='kanji-recall'
    nav=''.join(f'<a href="{p+url}"'+(' aria-current="page"' if active==url else '')+'>'+e(j if lang=='ja' else en)+'</a>' for url,j,en in DATA['navigation'])
    heading=r['title'];lead=r['lead'];description=r.get('description',re.sub('<[^>]*>','',lead));eyebrow=r.get('eyebrow',labels['research'] if key in ['family','monogatari'] else labels['personal'])
    if key=='home' and 'titleLines' in r:heading=''.join('<span>'+e(line)+'</span>' for line in r['titleLines'])
    hero=f'<div class="hero-name"><span>{e(name)}</span><span>LIDIIA BORODINA / PORTFOLIO</span></div>' if key=='home' else ''
    if key in ['family','monogatari','morigarden','kanji-recall']:hero+=f'<a class="back-link" href="{p}research/">← {labels["back"]}</a>'
    short={'experience':t('experience'),'skills':t('skills'),'work':t('work_research'),'about':t('about'),'contact':t('contact')}.get(key,heading)
    title=unescape(re.sub('<[^>]*>','',short)+' | '+name);description=unescape(description)
    css='<link rel="stylesheet" href="/css/site.css">'
    if isapp:css='<link rel="stylesheet" href="/css/kanji-compat.css">'+css+'<link rel="stylesheet" href="/css/kanji-app.css">'
    noindex='<meta name="robots" content="noindex">' if key=='notfound' else ''
    page=f'''<!doctype html>
<html lang="{lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{e(title)}</title><meta name="description" content="{e(description)}">{noindex}<meta name="theme-color" content="#f4f2ec">
<link rel="canonical" href="{ORIGIN+p+route}"><link rel="alternate" hreflang="ja" href="{ORIGIN+'/'+route}"><link rel="alternate" hreflang="en" href="{ORIGIN+'/en/'+route}"><link rel="alternate" hreflang="x-default" href="{ORIGIN+'/'+route}">
<meta property="og:type" content="website"><meta property="og:title" content="{e(title)}"><meta property="og:description" content="{e(description)}"><meta property="og:url" content="{ORIGIN+p+route}"><meta property="og:image" content="{ORIGIN}/assets/screenshots/social-preview.png"><meta property="og:image:alt" content="Lidiia Borodina — Portfolio"><meta name="twitter:card" content="summary_large_image">
{css}<link rel="icon" href="/favicon.ico"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest"><script src="/js/site.js" defer></script></head>
<body class="editorial-site page-{key}{' app-page' if isapp else ''}"><a class="skip" href="#main">{labels['skip']}</a>
<header class="site-header"><div class="header-inner"><a class="brand" href="{p}" aria-label="{e(name)} — {t('home')}"><span class="mark" aria-hidden="true">LB<span>·</span></span><span class="brand-name">{e(name)}</span></a><div class="header-tools"><a class="language" href="{alt}" lang="{t('ja')}" hreflang="{t('ja')}">{t('label')}</a><button class="menu-toggle" type="button" aria-controls="site-navigation" aria-expanded="false" data-open="{labels['menu']}" data-close="{labels['close']}">{labels['menu']} <span aria-hidden="true">＋</span></button></div><nav id="site-navigation" class="navigation" aria-label="{t('main_navigation')}">{nav}</nav></div></header>
<main class="wrap" id="main" tabindex="-1"><div class="page-heading">{hero}<p class="eyebrow">{e(eyebrow)}</p><h1>{heading}</h1><p class="lead">{lead}</p></div>{content(key,lang)}</main>
<footer class="footer wrap"><div class="footer-top"><a href="{p}contact/">{labels['contact']} <span aria-hidden="true">↗</span></a></div><div class="footer-bottom"><span>© 2026 Lidiia Borodina</span><a href="{DATA['person']['github']}">GitHub ↗</a><a href="{p}about/#website">{t('about_this_website')}</a><span>JA / EN</span></div></footer>
{'<script type="module" src="/js/kanji/app.js"></script>' if isapp else ''}</body></html>'''
    target=ROOT/p.strip('/')/route
    target=target if route.endswith('.html') else target/'index.html'
    target.parent.mkdir(parents=True,exist_ok=True);target.write_text(page,encoding='utf-8')

def build():
    for lang in ['ja','en']:
        for key in DATA['pages']:render(key,lang)
    urls=[ORIGIN+('/en/' if lang=='en' else '/')+r['route'] for lang in ['ja','en'] for key,r in DATA['pages'].items() if key!='notfound']
    (ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+u+'</loc></url>' for u in sorted(urls))+'</urlset>',encoding='utf-8')
    for filename,route in DATA['redirects']:
        special="if(location.hash==='#achievements-academic')target='research/#thesis';" if filename=='education.html' else ''
        html='<!doctype html><html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>'+DATA['ui']['redirect_title']['ja']+' | Lidiia Borodina</title><link rel="stylesheet" href="/css/site.css"></head><body><main class="wrap page-heading"><h1>'+DATA['ui']['redirect_title']['ja']+'</h1><p><a href="/'+route+'">日本語</a> · <a href="/en/'+route+'" lang="en">English</a></p></main><script>let target='+json.dumps(route)+';'+special+"location.replace((new URLSearchParams(location.search).get('lang')==='en'?'/en/':'/')+target);</script></body></html>"
        (ROOT/filename).write_text(html,encoding='utf-8')
    print(f'Built {len(DATA["pages"])*2} static pages from content/site.json')

if __name__=='__main__':build()
