"""Instrument ONLY a detached capture worktree, retaining original production code."""
from pathlib import Path
import sys,shutil
target=Path(sys.argv[1])
p=target/'project.godot';s=p.read_text(encoding='utf-8');s=s.replace('config/name="Mori · маленький сад"','config/name="MoriGalleryCapture"');p.write_text(s,encoding='utf-8')
p=target/'Scripts/GardenGame.cs';s=p.read_text(encoding='utf-8');s=s.replace('float dt = Math.Min((float)delta, .1f);','GalleryTick();\n        float dt = Math.Min((float)delta, .1f);',1);s=s.replace('if (what==NotificationApplicationFocusOut && !testMode && !paused)','if (false && what==NotificationApplicationFocusOut && !testMode && !paused)');p.write_text(s,encoding='utf-8')
shutil.copyfile(Path(__file__).with_name('gallery-capture.cs'),target/'Scripts/GalleryCapture.cs')
