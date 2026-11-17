"""Shared static components; bilingual content lives in content/site.json."""
from html import escape

def text(data,lang,key):return data['ui'][key][lang]
def e(value):return escape(str(value),quote=True)
def link(url,text,primary=False):return f'<a class="button{" primary" if primary else ""}" href="{e(url)}">{e(text)} <span aria-hidden="true">↗</span></a>'
def section(number,title,body,id=''):
    return f'<section class="section editorial-section"'+(f' id="{id}"' if id else '')+f'><div class="section-label"><span>{number}</span><h2>{e(title)}</h2></div><div class="section-content">{body}</div></section>'

def projects(data,lang):
    p='/en/' if lang=='en' else '/';result='<div class="project-list">'
    for item in data['projects']:
        r=item[lang];url=p+'projects/'+item['id']+'/'
        result+=f'<article class="project-row"><a class="project-visual" href="{url}" aria-label="{e(r["title"])}"><img src="{item["image"]}" srcset="{item["srcset"]}" sizes="(max-width:700px) calc(100vw - 40px), (max-width:1000px) 40vw, 440px" width="1280" height="800" loading="lazy" alt="{e(r["title"])}"></a><div class="project-description"><p class="eyebrow">{item["number"]} / {data["labels"][lang]["personal"]}</p><h3><a href="{url}">{e(r["title"])}</a></h3><p>{e(r["description"])}</p><p class="tech">{e(item["tech"])}</p>'+link(url,r['action'])+'</div></article>'
    return result+'</div>'

def papers(data,lang):
    p='/en/' if lang=='en' else '/';result='<div class="paper-list">'
    for item in data['research']:
        r=item[lang];url=p+'research/'+item['id']+'/'
        result+=f'<article class="paper" id="{"thesis" if item["id"]=="monogatari" else "family"}"><p class="paper-date">{item["year"]}<br><span>{text(data,lang,'study')}</span></p><div><h3><a href="{url}">{e(r["title"])}</a></h3><p>{e(r["description"])}</p><a class="text-link" href="{url}">'+text(data,lang,'read_study')+' ↗</a></div></article>'
    return result+'</div>'

def text_blocks(records,lang):
    result='<div class="site-note">'
    for item in records:
        r=item[lang]
        result+='<h3>'+e(r['title'])+'</h3>'
        for paragraph in r.get('paragraphs',[r.get('body','')]):
            if paragraph:result+='<p>'+e(paragraph)+'</p>'
    return result+'</div>'

def timeline(data,lang,education=False):
    result='<div class="timeline">'
    for item in data['education' if education else 'timeline']:
        r=item[lang]
        result+=f'<article class="timeline-row"><p class="timeline-date">{e(r["period"])}</p><div><h3>{e(r["title"] if education else r["role"])}</h3><p class="organization">{e(r["subtitle"] if education else r["company"])}</p><p>{e(r["body"])}</p>'
        for duty in r.get('duties',[]):
            result+='<h4'+(' id="'+e(duty['id'])+'"' if duty.get('id') else '')+'>'+e(duty['title'])+'</h4><p>'+e(duty['body'])+'</p>'
        result+='</div></article>'
    return result+'</div>'

def qualifications(data,lang):
    return '<dl class="qualifications">'+''.join(f'<div><dt>{e(q[lang]["title"])}</dt><dd><strong>{e(q[lang]["value"])}</strong><span>{e(q[lang]["date"])}</span></dd></div>' for q in data['languages'])+'</dl>'
