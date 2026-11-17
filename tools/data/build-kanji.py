"""Build local metadata and lazy SVG path shards from pinned third-party inputs.
Usage: python tools/data/build-kanji.py /path/to/kanji.json /path/to/kanjivg
"""
from pathlib import Path
import csv,json,sys,xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[2];source=json.load(open(sys.argv[1]));vg=Path(sys.argv[2]);metadata={};shards={}
prompts={r['char']:r for r in csv.DictReader((root/'assets/kanji/prompt-selections.tsv').open(encoding='utf-8'),delimiter='\t')}
levels=json.loads((root/'assets/kanji/kanken-elementary-2020.json').read_text(encoding='utf-8'))
for c,d in source.items():
 f=vg/'kanji'/f'{ord(c):05x}.svg'
 if not f.exists() or not (0x3400<=ord(c)<=0x9fff):continue
 paths=[x.attrib['d'] for x in ET.parse(f).getroot().iter() if x.tag.endswith('}path') and 'd' in x.attrib]
 if not paths:continue
 if not d['meanings']:continue
 metadata[c]={'id':f'u{ord(c):x}','char':c,'meaning':'; '.join(d['meanings'][:3]).lower(),'strokes':len(paths),'jlpt':f'N{d["jlpt_new"]}' if d.get('jlpt_new') else None,'schoolGrade':11-int(levels[c][:-1]) if c in levels else d.get('grade'),'kanken':levels.get(c),'promptVerified':c in prompts}
 if c in prompts:metadata[c].update(prompts[c])
 shards.setdefault(f'{ord(c)>>8:x}',{})[c]=paths
selected=set(prompts)
(root/'assets/kanji/catalog.json').write_text(json.dumps(metadata,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
(root/'assets/kanji/tasks.json').write_text(json.dumps([metadata[c] for c in sorted(selected) if c in metadata],ensure_ascii=False,indent=2),encoding='utf-8')
for name,data in shards.items():(root/'assets/kanji/shapes'/f'{name}.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
print(len(metadata),'supported kanji;',len(selected),'curated tasks;',len(shards),'lazy SVG shards')
