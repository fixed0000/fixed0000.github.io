"""Stable entry point: src/ renders content/site.json into GitHub Pages HTML."""
from pathlib import Path
import runpy
runpy.run_path(str(Path(__file__).resolve().parents[1]/'src/build.py'),run_name='__main__')
