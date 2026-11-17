"""Rebuild explicit prompts; audit every catalog record against pinned metadata.
Usage: python tools/data/audit-prompts.py upstream-kanji.json official-kanken.pdf
Requires PyMuPDF only for reading the official level table.
"""
import csv,json,re,sys
from pathlib import Path
import pymupdf
root=Path(__file__).resolve().parents[2]
source=json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
pdf=pymupdf.open(sys.argv[2]);levels={}
for i,count in enumerate([80,160,200,202,193,191],1):
    chars=set(re.findall(r'(?<!\S)[一-鿿](?!\S)',pdf[i].get_text()))
    assert len(chars)==count,(i,len(chars))
    for c in chars: levels[c]=f'{11-i}級'
catalog=json.loads((root/'assets/kanji/catalog.json').read_text(encoding='utf-8'))
selections={r['char']:r for r in csv.DictReader((root/'assets/kanji/prompt-selections.tsv').open(encoding='utf-8'),delimiter='\t')}
report={'date':'2026-11-13','catalogCount':len(catalog),'tasks':len(selections),'levelCorrections':[],'invalid':[], 'excluded':[]}
for c,d in catalog.items():
    original=source[c]
    shape=json.loads((root/f'assets/kanji/shapes/{ord(c)>>8:x}.json').read_text(encoding='utf-8'))[c]
    if len(shape)!=d['strokes'] or not original['meanings']: report['invalid'].append(c)
    expected=f'N{original["jlpt_new"]}' if original.get('jlpt_new') else None
    assert expected==d['jlpt'],c
    if d['kanken']!=levels.get(c):report['levelCorrections'].append({'char':c,'before':d['kanken'],'after':levels.get(c)})
    d['kanken']=levels.get(c)
    if c in levels:d['schoolGrade']=11-int(levels[c][:-1])
    d['promptVerified']=c in selections
    if c in selections:
        r=selections[c]
        assert all(c not in r[k] for k in ['reading','meaning','meaningJa','hint','hintJa']),c
        # The chosen reading must be among upstream dictionary readings; full kun
        # forms remove the dictionary's okurigana separator, never pick by order.
        norm=lambda x: ''.join(chr(ord(a)-96) if 'ァ'<=a<='ヶ' else a for a in x.replace('.','').replace('-',''))
        readings=original['readings_on']+original['readings_kun']
        assert norm(r['reading']) in [norm(x) for x in readings],(c,r['reading'],readings)
        d.update(r)
    else:
        d.pop('reading',None)
        report['excluded'].append({'char':c,'reason':'No explicitly reviewed, unambiguous prompt; dictionary entry retained.'})
assert not report['invalid']
(root/'assets/kanji/catalog.json').write_text(json.dumps(catalog,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
(root/'assets/kanji/tasks.json').write_text(json.dumps([catalog[c] for c in sorted(selections)],ensure_ascii=False,indent=2),encoding='utf-8')
(root/'artifacts/repair/catalog-audit.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
(root/'assets/kanji/kanken-elementary-2020.json').write_text(json.dumps(levels,ensure_ascii=False,sort_keys=True),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='excluded'},ensure_ascii=False))
