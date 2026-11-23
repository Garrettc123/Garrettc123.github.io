import unittest
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
class PreviewPageContract(unittest.TestCase):
    def test_private_browser_only_and_paid_path(self):
        page=(ROOT/"callback-preview.html").read_text()
        self.assertIn('type="file"',page)
        self.assertIn('id="preview-form"',page)
        self.assertIn('callback-preview-core.mjs',page)
        self.assertIn('/dfw-trades.html#request',page)
        self.assertIn('Customer rows are not uploaded',page)
        self.assertNotIn('fetch(',page)
        self.assertNotIn('localStorage',page)
        self.assertNotIn('XMLHttpRequest',page)
    def test_existing_offer_links_to_preview(self):
        page=(ROOT/"dfw-trades.html").read_text()
        self.assertIn('/callback-preview.html',page)
if __name__=="__main__":
    unittest.main()
