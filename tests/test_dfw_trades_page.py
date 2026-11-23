import re
import unittest
from pathlib import Path

PAGE = Path(__file__).resolve().parents[1] / "dfw-trades.html"

class SalesPageContract(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.content = PAGE.read_text(encoding="utf-8")

    def test_canonical_offer_and_contact(self):
        self.assertIn("$497 one-time review", self.content)
        self.assertIn("mailto:gwc2780@gmail.com", self.content)
        self.assertIn('id="scope-request"', self.content)
        self.assertIn('id="request"', self.content)

    def test_scope_fields_present_and_customer_data_excluded(self):
        for identifier in ["company", "crm", "source", "volume", "fields"]:
            self.assertIn(f'id="{identifier}"', self.content)
        self.assertIn("Do not include customer lead records", self.content)
        self.assertNotIn('type="file"', self.content)

    def test_customer_approval_to_send_and_fallback(self):
        self.assertIn("does not send automatically", self.content)
        self.assertIn("window.location.href", self.content)
        self.assertIn("encodeURIComponent(lines.join", self.content)
        self.assertNotIn("fetch(", self.content)
        self.assertNotIn("XMLHttpRequest", self.content)

    def test_inline_script_is_present_once(self):
        self.assertEqual(len(re.findall(r"<script>", self.content)), 1)
        self.assertEqual(len(re.findall(r"</script>", self.content)), 1)

if __name__ == "__main__":
    unittest.main()
