import json, pathlib, sys
from datetime import datetime, timezone

OUT = pathlib.Path("data/latest.json")

def write(payload: dict):
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

def load_prev():
    try:
        if OUT.exists():
            with open(OUT, "r", encoding="utf-8") as f:
                return json.load(f)
    except Exception:
        pass
    return {}

def fetch_fastf1():
    from fastf1.ergast import Ergast
    r = Ergast().get_race_results(season="current", round="last")
    data = r.content
    race = data[0]["Races"][0]
    win = race["Results"][0]
    drv = win["Driver"]
    team = win["Constructor"]
    loc  = race.get("Circuit", {}).get("Location", {})
    return {
        "name": f"{drv.get('givenName','').strip()} {drv.get('familyName','').strip()}".strip(),
        "number": drv.get("permanentNumber") or win.get("number") or "",
        "team": team.get("name",""),
        "gp": race.get("raceName",""),
        "round": race.get("round",""),
        "date": race.get("date",""),
        "country": loc.get("country",""),
        "driver_code": drv.get("code","") or drv.get("driverId","")[:3].upper(),
        "nationality": drv.get("nationality",""),
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

def fetch_ergast_direct():
    import requests
    API = "https://ergast.com/api/f1/current/last/results.json"
    j = requests.get(API, timeout=25).json()
    race = j["MRData"]["RaceTable"]["Races"][0]
    win  = race["Results"][0]
    drv  = win["Driver"]
    team = win["Constructor"]
    loc  = race.get("Circuit", {}).get("Location", {})
    return {
        "name": f"{drv.get('givenName','').strip()} {drv.get('familyName','').strip()}".strip(),
        "number": drv.get("permanentNumber") or win.get("number") or "",
        "team": team.get("name",""),
        "gp": race.get("raceName",""),
        "round": race.get("round",""),
        "date": race.get("date",""),
        "country": loc.get("country",""),
        "driver_code": drv.get("code","") or drv.get("driverId","")[:3].upper(),
        "nationality": drv.get("nationality",""),
        "generated_at": datetime.now(timezone.utc).isoformat()
    }

def main():
    try:
        payload = fetch_fastf1()
    except Exception as e1:
        try:
            payload = fetch_ergast_direct()
        except Exception as e2:
            prev = load_prev()
            if prev:
                write(prev)
                print("WARN: kept previous payload; FastF1+Ergast failed", file=sys.stderr)
                return 0
            print("ERROR: could not fetch winner; not writing {}", file=sys.stderr)
            return 2
        
    write(payload)
    print(json.dumps(payload, ensure_ascii=False))
    return 0

if __name__ == "__main__":
    sys.exit(main())
