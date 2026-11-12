"""Build local metadata and lazy SVG path shards from pinned third-party inputs.
Usage: python tools/data/build-kanji.py /path/to/kanji.json /path/to/kanjivg
"""
from pathlib import Path
import json,sys,xml.etree.ElementTree as ET
root=Path(__file__).resolve().parents[2];source=json.load(open(sys.argv[1]));vg=Path(sys.argv[2]);metadata={};shards={}
for c,d in source.items():
 f=vg/'kanji'/f'{ord(c):05x}.svg'
 if not f.exists() or not (0x3400<=ord(c)<=0x9fff):continue
 paths=[x.attrib['d'] for x in ET.parse(f).getroot().iter() if x.tag.endswith('}path') and 'd' in x.attrib]
 if not paths:continue
 readings=d['readings_on'] or d['readings_kun']
 if not readings or not d['meanings']:continue
 on=d['readings_on'];reading=readings[0]
 if on:reading=''.join(chr(ord(x)+96) if 'ぁ'<=x<='ゖ' else x for x in reading)
 metadata[c]={'id':f'u{ord(c):x}','char':c,'reading':reading,'meaning':'; '.join(d['meanings'][:3]).lower(),'strokes':len(paths),'jlpt':f'N{d["jlpt_new"]}' if d.get('jlpt_new') else None,'schoolGrade':d.get('grade'),'kanken':f'{11-d["grade"]}級' if d.get('grade') in range(1,7) else None}
 shards.setdefault(f'{ord(c)>>8:x}',{})[c]=paths
# Small checked study selections. No JLPT-to-Kanken conversion.
selected=set('山川人日月木持待思使始終愛関変決約試責任境判測構造断効概根拠妥協融資把握')
for grade in range(1,7):
 candidates=sorted((c for c in metadata if source[c].get('grade')==grade),key=lambda c:source[c].get('freq') or 99999)
 selected.update(candidates[:4])
# Include at least five entries in each JLPT band, ranked by source frequency.
for level in range(1,6):
 candidates=sorted((c for c in metadata if metadata[c]['jlpt']==f'N{level}'),key=lambda c:source[c].get('freq') or 99999)
 selected.update(candidates[:5])
(root/'assets/kanji/catalog.json').write_text(json.dumps(metadata,ensure_ascii=False,separators=(',',':')))
(root/'assets/kanji/tasks.json').write_text(json.dumps([metadata[c] for c in sorted(selected) if c in metadata],ensure_ascii=False,indent=2))
for name,data in shards.items():(root/'assets/kanji/shapes'/f'{name}.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')))
print(len(metadata),'supported kanji;',len(selected),'curated tasks;',len(shards),'lazy SVG shards')
