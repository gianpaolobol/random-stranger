from pathlib import Path
import unittest
from fontTools.ttLib import TTFont
ROOT=Path(__file__).resolve().parents[1]
class CustomFontTest(unittest.TestCase):
 def setUp(self): self.font=TTFont(ROOT/'assets/fonts/RandomStranger-Regular.ttf');self.cmap=self.font.getBestCmap()
 def test_identity(self):
  self.assertEqual(self.font['name'].getDebugName(1),'Random Stranger')
  self.assertEqual(self.font['name'].getDebugName(6),'RandomStranger-Regular')
 def test_italian_and_ui_coverage(self):
  for c in 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 àèéìòùÀÈÉÌÒÙäöüñç €–—’“” …!?@#%&+−=()[]/\\:;., →←✓':
   with self.subTest(character=c):self.assertIn(ord(c),self.cmap)
 def test_distinct_readable_shapes(self):
  gs=self.font['glyf']
  for a,b in [('I','l'),('l','1'),('O','0'),('a','o'),('b','d')]:
   self.assertNotEqual(gs[self.cmap[ord(a)]].compile(gs),gs[self.cmap[ord(b)]].compile(gs))
 def test_metrics_and_no_clipping(self):
  self.assertGreaterEqual(len(self.cmap),250)
  for n in self.font.getGlyphOrder():
   g=self.font['glyf'][n]
   g.recalcBounds(self.font['glyf'])
   if hasattr(g,'yMax'):
    self.assertLessEqual(g.yMax,self.font['hhea'].ascent)
    self.assertGreaterEqual(g.yMin,self.font['hhea'].descent)
  for cp,n in self.cmap.items():self.assertGreater(self.font['hmtx'][n][0],0)
 def test_kerning_and_web_format(self):
  self.assertIn('GPOS',self.font)
  w=TTFont(ROOT/'assets/fonts/RandomStranger-Regular.woff2')
  self.assertEqual(w.getBestCmap(),self.cmap)
if __name__=='__main__':unittest.main()
