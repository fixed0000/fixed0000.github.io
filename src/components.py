"""Shared static components; bilingual content lives in content/site.json."""
from html import escape

def text(data,lang,key):return data['ui'][key][lang]
def e(value):return escape(str(value),quote=True)
def link(url,text,primary=False):return f'<a class="button{" primary" if primary else ""}" href="{e(url)}">{e(text)} <span aria-hidden="true">↗</span></a>'
def section(number,title,body,id='',aside=''):
    return f'<section class="section editorial-section"'+(f' id="{id}"' if id else '')+f'><div class="section-label"><span>{number}</span><h2>{e(title)}</h2>{aside}</div><div class="section-content">{body}</div></section>'

def projects(data,lang):
    p='/en/' if lang=='en' else '/';result='<div class="project-list">'
    for item in data['projects']:
        r=item[lang];url=p+'projects/'+item['id']+'/'
        result+=f'<article class="project-row"><a class="project-visual" href="{url}" aria-label="{e(r["title"])}"><img src="{item["image"]}" srcset="{item["srcset"]}" sizes="(max-width:700px) calc(100vw - 40px), (max-width:1000px) 40vw, 440px" width="1280" height="800" loading="lazy" alt="{e(r["title"])}"></a><div class="project-description"><p class="eyebrow">{item["number"]} / {data["labels"][lang]["personal"]}</p><h3><a href="{url}">{e(r["title"])}</a></h3><p>{e(r["description"])}</p><p class="tech">{e(item["tech"])}</p>'+link(url,r['action'])+'</div></article>'
    return result+'</div>'

def original_link(data,item,lang):
    return link(item['originalUrl'],text(data,lang,'original_russian')) if item.get('originalUrl') else ''

def papers(data,lang):
    p='/en/' if lang=='en' else '/'
    result='<div class="paper-list">'
    for item in data['research']:
        r=item[lang];url=p+'research/'+item['id']+'/'
        result+=f'<article class="paper" id="{"thesis" if item["id"]=="monogatari" else "family"}"><p class="paper-date">{item["year"]}</p><div><h3><a href="{url}">{e(r["title"])}</a></h3><p>{e(r["description"])}</p><p class="paper-methods">{e(r["methods"])}</p><div class="paper-links"><a class="text-link" href="{url}">'+text(data,lang,'read_study')+' <span aria-hidden="true">↗</span></a><span class="original-language">'+text(data,lang,'original_language')+'</span></div>'+original_link(data,item,lang)+'</div></article>'
    return result+'</div>'

def study_detail(data,key,lang):
    item=next(x for x in data['research'] if x['id']==key);r=item[lang]
    subtitle='<p class="research-subtitle">'+e(r['subtitle'])+'</p>' if r.get('subtitle') else ''
    methods='研究方法' if lang=='ja' else 'Methods'
    approach='研究のアプローチ' if lang=='ja' else 'Research Approach'
    return subtitle+'<article class="study-detail"><dl><div><dt>'+methods+'</dt><dd>'+e(r['methods'])+'</dd></div><div><dt>'+approach+'</dt><dd>'+e(r['approach'])+'</dd></div></dl><div class="study-source"><p>'+text(data,lang,'original_language')+'</p>'+original_link(data,item,lang)+'</div></article>'

def study_program(data,lang):
    program=data['educationStudies'];r=program[lang]
    result='<div class="study-program"><p class="study-intro">'+e(r['intro'])+'</p><div class="discipline-grid">'
    for group in program['groups']:
        g=group[lang]
        result+='<article class="discipline'+(' discipline-technology' if group['index']=='D' else '')+'"><span class="discipline-index" aria-hidden="true">'+group['index']+'</span><h3>'+e(g['title'])+'</h3><ul>'+''.join('<li>'+e(x)+'</li>' for x in g['items'])+'</ul></article>'
    return result+'</div></div>'

def personal_interests(record,lang):
    return '<div class="interest-grid">'+''.join('<article><h3>'+e(g[lang]['title'])+'</h3><p>'+e(g[lang]['body'])+'</p></article>' for g in record['groups'])+'</div>'

def text_blocks(records,lang):
    result='<div class="site-note">'
    for item in records:
        r=item[lang]
        result+='<h3>'+e(r['title'])+'</h3>'
        for paragraph in r.get('paragraphs',[r.get('body','')]):
            if paragraph:result+='<p>'+e(paragraph)+'</p>'
    return result+'</div>'

def timeline(data,lang,education=False):
    result='<div class="timeline '+('education-timeline' if education else 'work-timeline')+'">'
    for item in data['education' if education else 'timeline']:
        r=item[lang]
        if education:
            result+=f'<article class="timeline-row"><p class="timeline-date">{e(r["period"])}</p><div class="timeline-detail"><h3>{e(r["title"])}</h3><p class="organization">{e(r["subtitle"])}</p><p>{e(r["body"])}</p>'
        else:
            result+=f'<article class="timeline-row"><div class="timeline-meta"><p class="timeline-date">{e(r["period"])}</p><h3>{e(r["company"])}</h3><p class="organization">{e(r["role"])}</p></div><div class="timeline-detail"><p>{e(r["body"])}</p>'
        for duty in r.get('duties',[]):
            result+='<h4'+(' id="'+e(duty['id'])+'"' if duty.get('id') else '')+'>'+e(duty['title'])+'</h4><p>'+e(duty['body'])+'</p>'
        result+='</div></article>'
    return result+'</div>'

def qualifications(data,lang):
    return '<dl class="qualifications">'+''.join(f'<div><dt>{e(q[lang]["title"])}</dt><dd><strong>{e(q[lang]["value"])}</strong><span>{e(q[lang]["date"])}</span></dd></div>' for q in data['languages'])+'</dl>'
