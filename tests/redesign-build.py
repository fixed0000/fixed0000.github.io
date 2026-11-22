"""Verify preservation and deterministic output across the architecture migration."""
from pathlib import Path
from html.parser import HTMLParser
import hashlib,json,subprocess,re

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
protected=['js/kanji/recognizer.js','js/kanji/worker.js','js/kanji/store.js','js/kanji/task-state.js','assets/kanji']
assert not subprocess.check_output(['git','diff','bdb1deb','--',*protected],cwd=root)

trainer_base=subprocess.check_output(['git','show','549b719:css/kanji-app.css'],cwd=root).decode('utf-8').replace('\r\n','\n')
assert (root/'css/kanji-app.css').read_text(encoding='utf-8').startswith(trainer_base.rstrip())
# This editorial task must preserve presentation, application code and personal facts.
assert not subprocess.check_output(['git','diff','c6d883e','--','css/kanji-compat.css',*protected],cwd=root)
original_css=subprocess.check_output(['git','show','c6d883e:css/site.css'],cwd=root).decode('utf-8').replace('\r\n','\n')
assert (root/'css/site.css').read_text(encoding='utf-8').startswith(original_css.rstrip())
previous=json.loads(subprocess.check_output(['git','show','af7aded:content/site.json'],cwd=root).decode('utf-8'))
for key in ['person','languages','homeEvidence','timeline','applicationDocuments']:
    assert data[key]==previous[key],key
assert [x[0] for x in data['navigation']]==[x[0] for x in previous['navigation']]
assert data['navigation'][3][2]=='Projects & Research'
assert data['contactAction']['route']=='contact/'
assert data['applicationDocuments']['approved'] is True
assert data['applicationDocuments']['url']=='/documents/shokumukeirekisho-ja.pdf'
assert (root/'documents/shokumukeirekisho-ja.pdf').read_bytes().startswith(b'%PDF-')
assert 'tools' not in data and 'learning' not in data
assert len(data['educationStudies']['groups'])==4
assert [len(x['ja']['items']) for x in data['educationStudies']['groups']]==[4,5,3,4]
assert [(r['id'],r['year']) for r in data['research']]==[(r['id'],r['year']) for r in previous['research']]
for a,b in zip(data['education'],previous['education']):
    for lang in ['ja','en']:assert (a[lang]['period'],a[lang]['title'])==(b[lang]['period'],b[lang]['title'])
assert data['pages']['home']==previous['pages']['home']
for a,b in zip(data['projects'],previous['projects']):
    assert {k:v for k,v in a.items() if k not in ['image','srcset']}=={k:v for k,v in b.items() if k not in ['image','srcset']}
for key in ['kanji-recall']:
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
    release=re.search(r'/js/kanji/releases/([a-f0-9]{12})/app.js',app).group(1)
    for module in (root/'js/kanji').glob('*.js'):
        assert module.read_bytes().replace(b'\r\n',b'\n')==(root/'js/kanji/releases'/release/module.name).read_bytes().replace(b'\r\n',b'\n')
    assert "new URL('./worker.js',import.meta.url)" in (root/'js/kanji/app.js').read_text(encoding='utf-8')
    assert "new URL('./stroke-order-worker.js',import.meta.url)" in (root/'js/kanji/stroke-order-ui.js').read_text(encoding='utf-8')
    mori=(root/prefix/'projects/morigarden/index.html').read_text(encoding='utf-8')
    for required in ['Alice.Sacco','CC BY','Sketchfab','SEGA','NoAI','game-gallery']:
        assert required in mori,required
    contact=(root/prefix/'contact/index.html').read_text(encoding='utf-8')
    assert '/documents/shokumukeirekisho-ja.pdf' in contact
result={'deterministic':True,'preservedApp':protected,'bilingualPages':len(routes)*2,'licensesPreserved':True,'publicCvLinks':True}
(root/'artifacts/editorial-final/build-audit.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print('PASS deterministic static build; preserved Kanji Recall mechanics, data and markup; licensed content')
