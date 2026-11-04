"""Collect public recent-search listings, never claim a fresh booking quote."""
from datetime import datetime, timezone
from html.parser import HTMLParser
import json
import math
from pathlib import Path
import subprocess
import sys
from urllib.parse import urlparse, parse_qs
from zoneinfo import ZoneInfo

URL = "https://iwantthatflight.com.au/cheap-flights/SYD/DPS/sydney-to-bali"
AIRLINES = {"JQ": "Jetstar", "OD": "Batik Air Malaysia", "TR": "Scoot",
            "ID": "Batik Air", "VA": "Virgin Australia", "QF": "Qantas",
            "GA": "Garuda Indonesia", "SQ": "Singapore Airlines", "MH": "Malaysia Airlines",
            "CX": "Cathay Pacific", "D7": "AirAsia X", "AK": "AirAsia", "QZ": "Indonesia AirAsia"}


class Listings(HTMLParser):
    def __init__(self):
        super().__init__()
        self.currency = None
        self.header = False
        self.group = ""
        self.rows = []

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id") == "header_currency_nav_anchor":
            self.currency = a.get("data-currency")
        classes = a.get("class", "").split()
        if "AirlineCodesGroupHeader" in classes:
            self.header = True
            self.group = ""
        if "FlightRow" in classes:
            self.rows.append((self.group, a))

    def handle_data(self, text):
        if self.header:
            self.group += text

    def handle_endtag(self, tag):
        if tag == "div":
            self.header = False


def parse_listings(html, checked_at):
    parser = Listings()
    parser.feed(html)
    if parser.currency != "AUD" or "Prices are from searches made in the last 24 hours" not in html:
        raise ValueError("Missing AUD or recent-search provenance")
    day = datetime.fromisoformat(checked_at).astimezone(ZoneInfo("Australia/Sydney")).date().isoformat()
    quotes, seen = [], set()
    for group, row in parser.rows:
        if " Return flights from " not in group or row.get("data-seatclassid") != "1":
            continue
        if (row.get("data-origincode"), row.get("data-destinationcode")) != ("SYD", "DPS"):
            continue
        try:
            depart = datetime.strptime(row["data-depart"], "%d/%b/%y").date()
            back = datetime.strptime(row["data-return"], "%d/%b/%y").date()
            price = float(row["data-price"])
            link = urlparse(row["data-url"])
            query = parse_qs(link.query)
            if link.scheme != "https" or link.hostname != "fly.iwantthatflight.com.au" or link.path != "/flight.ashx":
                continue
            if query.get("oc") != ["SYD"] or query.get("dc") != ["DPS"]:
                continue
            if datetime.strptime(query["dd"][0], "%d/%b/%Y").date() != depart or datetime.strptime(query["rd"][0], "%d/%b/%Y").date() != back:
                continue
        except (ValueError, KeyError, IndexError):
            continue
        if not ("2027-05-15" <= depart.isoformat() <= "2027-05-19" and back.isoformat() in ("2027-05-22", "2027-05-23")):
            continue
        if not math.isfinite(price) or price <= 0:
            continue
        codes = group.split(" Return flights from ")[0].strip().split(",")
        airline = " + ".join(AIRLINES.get(code, code) for code in codes)
        key = (airline, depart, back, price)
        if key in seen:
            continue
        seen.add(key)
        quotes.append({"date": day, "airline": airline, "from": "SYD",
                       "depart": depart.isoformat(), "return": back.isoformat(),
                       "price": price, "stops": None,
                       "details": "I Want That Flight · Published searches from the last 24 hours; current price may differ. Stops and baggage unconfirmed.",
                       "link": row["data-url"]})
    return sorted(quotes, key=lambda q: q["price"])


def main():
    now = datetime.now(timezone.utc).isoformat()
    quotes, status = [], "error"
    try:
        result = subprocess.run([sys.argv[1], "fetch", "--obey-robots", "--dump", "html",
                                 "--wait-ms", "8000", "--log-level", "error", URL],
                                capture_output=True, text=True, timeout=65)
        if result.returncode != 0:
            status = "robots-disallowed" if "RobotsBlocked" in result.stdout + result.stderr else "browser-error"
        else:
            quotes = parse_listings(result.stdout, now)
            status = "success" if quotes else "no-results"
    except subprocess.TimeoutExpired:
        status = "timeout"
    except ValueError:
        status = "invalid-response"
    path = Path(sys.argv[2])
    data = json.loads(path.read_text()) if path.exists() else {"version": 1, "runs": []}
    date = datetime.fromisoformat(now).astimezone(ZoneInfo("Australia/Sydney")).date().isoformat()
    run = {"date": date, "checkedAt": now, "source": "I Want That Flight", "status": status, "quotes": quotes}
    # One observation per day. A failed retry cannot erase an earlier successful run.
    previous = next((r for r in data["runs"] if r["date"] == date), None)
    if previous is None or previous["status"] != "success" or status == "success":
        data["runs"] = sorted([r for r in data["runs"] if r["date"] != date] + [run], key=lambda r: r["date"])[-220:]
    data["lastAttempt"] = {k: v for k, v in run.items() if k != "quotes"}
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, indent=2) + "\n")
    print(json.dumps({"date": date, "status": status, "quotes": len(quotes)}))


if __name__ == "__main__":
    main()
