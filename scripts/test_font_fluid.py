from pathlib import Path
import unittest
from fontTools.ttLib import TTFont
from test_font import CustomFontTest
R=Path(__file__).resolve().parents[1]
class FluidFontTest(CustomFontTest):
 def setUp(self):
  self.font=TTFont(R/'assets/fonts/fluid-v3/RandomStranger-Regular.ttf');self.cmap=self.font.getBestCmap()
 def test_identity(self):
  self.assertEqual(self.font['name'].getDebugName(1),'Random Stranger Fluid')
  self.assertEqual(self.font['name'].getDebugName(6),'RandomStrangerFluid-Regular')
 def test_kerning_and_web_format(self):
  self.assertIn('GPOS',self.font)
  w=TTFont(R/'assets/fonts/fluid-v3/RandomStranger-Regular.woff2')
  self.assertEqual(w.getBestCmap(),self.cmap)
if __name__=='__main__':
 suite=unittest.TestLoader().loadTestsFromTestCase(FluidFontTest)
 result=unittest.TextTestRunner().run(suite)
 raise SystemExit(not result.wasSuccessful())
