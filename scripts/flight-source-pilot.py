"""Read-only access probe. Readable route pages are NOT accepted fare quotes.

Uses no account, proxy, CAPTCHA solver, database credentials or AI model.
Only explicitly listed public URLs are probed; each has a hard time limit.
"""
import datetime
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import time

SOURCES = [
    ("iwtf-route", "route", "https://iwantthatflight.com.au/cheap-flights/SYD/DPS/sydney-to-bali"),
    ("iwtf-exact", "exact-date", "https://iwantthatflight.com.au/flight.ashx?oc=SYD&dc=DPS&dd=18/May/2027&rd=23/May/2027"),
    ("skyscanner-exact", "exact-date", "https://www.skyscanner.com.au/transport/flights/syd/dps/270518/270523/?adultsv2=1&cabinclass=economy"),
    ("virgin-route", "route", "https://www.virginaustralia.com/en-au/flights-from-sydney-to-bali-dps"),
    ("garuda-route", "route", "https://www.garuda-indonesia.com/flights/en-au/flights-from-sydney-to-bali-denpasar"),
]


def classify(code, output, error):
    combined = output + "\n" + error
    if re.search(r"RobotsBlocked|robots\.txt.*(?:disallow|denied)|disallowed by robots", combined, re.I):
        return "robots-disallowed"
    if re.search(r"captcha|verify (?:that )?you are (?:a )?human|verify you are not a bot|performing security verification|access denied|just a moment|403 forbidden", combined, re.I):
        return "blocked"
    if code != 0:
        return "browser-error"
    if len(output.strip()) < 200:
        return "empty"
    return "readable-unvalidated"


def main():
    binary = sys.argv[1]
    dest = Path("pilot-results")
    dest.mkdir(exist_ok=True)
    results = []
    for name, kind, url in SOURCES:
        started = time.monotonic()
        try:
            process = subprocess.run(
                [binary, "fetch", "--obey-robots", "--dump", "markdown",
                 "--wait-ms", "8000", "--log-level", "warn", url],
                capture_output=True, text=True, timeout=65,
            )
            body, error = process.stdout, process.stderr
            status = classify(process.returncode, body, error)
        except subprocess.TimeoutExpired:
            body, error, status = "", "Stopped after 65 seconds", "timeout"
        (dest / (name + ".md")).write_text(body[:200000])
        (dest / (name + ".log")).write_text(error[:10000])
        result = {"source": name, "kind": kind, "url": url,
                  "checkedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                  "status": status, "seconds": round(time.monotonic() - started, 1),
                  "characters": len(body), "acceptedQuotes": 0}
        results.append(result)
        print(json.dumps(result), flush=True)
    (dest / "results.json").write_text(json.dumps(results, indent=2))
    summary = "# Read-only flight source pilot\n\nNo fare has been ingested. Readable pages require exact-date quote validation.\n\n"
    summary += "| Source | Scope | Result | Seconds |\n|---|---|---|---|\n"
    summary += "\n".join(f"| {r['source']} | {r['kind']} | {r['status']} | {r['seconds']} |" for r in results)
    (dest / "summary.md").write_text(summary + "\n")
    if os.environ.get("GITHUB_STEP_SUMMARY"):
        with open(os.environ["GITHUB_STEP_SUMMARY"], "a") as f:
            f.write(summary + "\n")


if __name__ == "__main__":
    main()
