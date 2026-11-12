from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json
root=Path(__file__).resolve().parents[1]
class Parser(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.ids=set()
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.add(a['id'])
  for k in ['href','src']:
   if k in a:self.links.append(a[k])
files=[f for f in root.rglob('*.html') if not any(x in f.parts for x in ('node_modules','tools'))];cache={}
for f in files:
 p=Parser();p.feed(f.read_text());cache[f]=p
errors=[];count=0
for f,p in cache.items():
 for href in p.links:
  u=urlsplit(href)
  if u.scheme or u.netloc:continue
  target=root/unquote(u.path.lstrip('/')) if u.path.startswith('/') else f.parent/unquote(u.path)
  if not u.path:target=f
  if target.is_dir():target=target/'index.html'
  count+=1
  if not target.exists():errors.append(f'{f.relative_to(root)} -> {href}')
  elif u.fragment and target in cache and u.fragment not in cache[target].ids:errors.append(f'missing fragment {f.relative_to(root)} -> {href}')
result={'html_files':len(files),'local_references':count,'errors':errors}
(root/'artifacts/link-results.json').write_text(json.dumps(result,indent=2));print(result);assert not errors
