"""Verify preservation and deterministic output across the architecture migration."""
from pathlib import Path
from html.parser import HTMLParser
import hashlib,json,subprocess

root=Path(__file__).resolve().parents[1]
data=json.loads((root/'content/site.json').read_text(encoding='utf-8'))
routes=[r['route'] for r in data['pages'].values()]
assert len(routes)==len(set(routes))
for key,page in data['pages'].items():
    for lang in ['ja','en']:
        assert all(page[lang].get(field) for field in ['title','lead']), (key,lang)
        assert not any(x in json.dumps(page[lang]) for x in ['履歴書1106.pdf','職務経歴書1106.pdf'])
for copy in data['ui'].values():assert set(copy)=={'ja','en'}

# App mechanics, reviewed data, source markup and trainer geometry remain unchanged.
protected=['js/kanji','assets/kanji','css/kanji-app.css','tools/build-app-markup.py','tools/app-ja.html','tools/app-en.html']
assert not subprocess.check_output(['git','diff','bdb1deb','--',*protected],cwd=root)

# This editorial task must preserve presentation, application code and personal facts.
assert not subprocess.check_output(['git','diff','c6d883e','--','css/kanji-compat.css','css/kanji-app.css','js','assets','tools/build-app-markup.py','tools/app-ja.html','tools/app-en.html'],cwd=root)
original_css=subprocess.check_output(['git','show','c6d883e:css/site.css'],cwd=root).decode('utf-8').replace('\r\n','\n')
assert (root/'css/site.css').read_text(encoding='utf-8').startswith(original_css.rstrip())
previous=json.loads(subprocess.check_output(['git','show','c6d883e:content/site.json'],cwd=root).decode('utf-8'))
for key in ['person','education','languages','homeEvidence','projects','research']:
    assert data[key]==previous[key],key
assert data['navigation']==previous['navigation'][:5]
assert data['contactAction']['route']=='contact/'
assert data['applicationDocuments']['approved'] is False
assert data['applicationDocuments']['url'] is None
for key in ['kanji-recall','family','monogatari']:
    assert data['pages'][key]==previous['pages'][key],key

def files():
    paths=[root/(('en/' if lang=='en' else '')+route+('' if route.endswith('.html') else 'index.html')) for lang in ['ja','en'] for route in routes]
    paths+=[root/name for name,_ in data['redirects']]+[root/'sitemap.xml']
    return {str(p.relative_to(root)):hashlib.sha256(p.read_bytes()).hexdigest() for p in paths}

before=files()
subprocess.run(['python','-X','utf8','tools/build-site.py'],cwd=root,check=True)
assert before==files(), 'Build is not deterministic'
for lang in ['ja','en']:
    prefix='en/' if lang=='en' else ''
    app=(root/prefix/'projects/kanji-recall/index.html').read_text(encoding='utf-8')
    source=(root/'tools'/f'app-{lang}.html').read_text(encoding='utf-8')
    assert source in app
    mori=(root/prefix/'projects/morigarden/index.html').read_text(encoding='utf-8')
    for required in ['Alice.Sacco','CC BY','Sketchfab','SEGA','NoAI','game-gallery']:
        assert required in mori,required
    contact=(root/prefix/'contact/index.html').read_text(encoding='utf-8')
    assert '.pdf' not in contact
result={'deterministic':True,'preservedApp':protected,'bilingualPages':len(routes)*2,'licensesPreserved':True,'publicCvLinks':False}
(root/'artifacts/job-search-final/build-audit.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print('PASS deterministic static build; preserved Kanji Recall mechanics, data and markup; licensed content')
