import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location("collector", Path(__file__).parents[1] / "scripts/collect-iwtf.py")
collector = importlib.util.module_from_spec(spec)
spec.loader.exec_module(collector)

HTML = '''<a id="header_currency_nav_anchor" data-currency="AUD"></a>
<p>Prices are from searches made in the last 24 hours and current prices may differ.</p>
<div class="AirlineCodesGroupHeader">OD,TR Return flights from $505</div>
<div class="FlightRow" data-price="621" data-depart="15/May/27" data-return="22/May/27"
data-origincode="SYD" data-destinationcode="DPS" data-seatclassid="1"
data-url="https://fly.iwantthatflight.com.au/flight.ashx?oc=SYD&amp;dc=DPS&amp;dd=15/May/2027&amp;rd=22/May/2027&amp;po=all"></div>'''
NOW = "2026-11-03T23:00:00+00:00"


class ParseTests(unittest.TestCase):
    def test_published_return_not_group_floor(self):
        quotes = collector.parse_listings(HTML, NOW)
        self.assertEqual(len(quotes), 1)
        self.assertEqual(quotes[0]["price"], 621)
        self.assertEqual(quotes[0]["date"], "2026-11-04")
        self.assertIsNone(quotes[0]["stops"])
        self.assertIn("last 24 hours", quotes[0]["details"])

    def test_rejects_wrong_currency_or_missing_freshness(self):
        for html in (HTML.replace('data-currency="AUD"', 'data-currency="USD"'), HTML.replace("last 24 hours", "last month")):
            with self.assertRaises(ValueError):
                collector.parse_listings(html, NOW)

    def test_rejects_mismatched_links_and_invalid_quotes(self):
        for old, new in [('data-price="621"', 'data-price="nan"'), ('data-seatclassid="1"', 'data-seatclassid="2"'),
                         ('data-destinationcode="DPS"', 'data-destinationcode="LHR"'),
                         ('rd=22/May/2027', 'rd=23/May/2027'), ('15/May', '14/May'),
                         ('Return flights', 'One way flights'), ('https://fly.iwantthatflight.com.au', 'https://example.com')]:
            with self.subTest(new=new):
                self.assertEqual(collector.parse_listings(HTML.replace(old, new), NOW), [])


if __name__ == "__main__":
    unittest.main()
