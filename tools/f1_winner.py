import json, sys, time, pathlib, requests
from datetime import datetime, timezone

OUT = pathlib.Path("data/latest.json")
API = "https://ergast.com/api/f1/current/last/results.json"

def write_safe(payload):
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

def load_existing():
    if OUT.exists():
        with open(OUT, "r", encoding="utf-8") as f:
            return json.load(f)
    return {}

def main():
    try:
        r = requests.get(API, timeout=20)
        r.raise_for_status()
        j = r.json()
        races = j.get("MRData", {}).get("RaceTable", {}).get("Races", [])
        if not races:
            prev = load_existing()
            if prev:
                print("no finished race with results; kept previous")
                write_safe(prev)
                return 0
            print("no finished race with results; nothing to update")
            write_safe({})
            return 0
        race = races[0]
        results = race.get("Results", [])
        if not results:
            prev = load_existing()
            write_safe(prev if prev else {})
            print("no results array; kept previous")
            return 0
        p1 = results[0]
        driver = p1.get("Driver", {})
        constructor = p1.get("Constructor", {})
        payload = {
            "name": f"{driver.get('givenName','').strip()} {driver.get('familyName','').strip()}".strip(),
            "number": driver.get("permanentNumber") or p1.get("number") or "",
            "team": constructor.get("name",""),
            "gp": race.get("raceName",""),
            "flag_cc": driver.get("nationality","")[:2],
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        write_safe(payload)
        print("updated", payload.get("name",""))
        return 0
    except Exception as e:
        prev = load_existing()
        if prev:
            write_safe(prev)
            print("error; kept previous:", e)
            return 0
        print("error and no previous:", e)
        write_safe({})
        return 0

if __name__ == "__main__":
    sys.exit(main())
