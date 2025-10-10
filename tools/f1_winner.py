import json, os, pathlib, sys, time
from datetime import datetime, timezone

OUT = pathlib.Path("data/latest.json")

def _write(payload: dict) -> None:
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

def _load_prev() -> dict:
    if OUT.exists():
        try:
            with open(OUT, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {}
    return {}

def _ok(d: dict) -> bool:
    return bool(d.get("name") and d.get("team") and d.get("gp"))

def _payload_from_race(race: dict) -> dict:
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

def fetch_fastf1() -> dict:
    from fastf1.ergast import Ergast
    r = Ergast().get_race_results(season="current", round="last")
    data = r.content  
    race = data[0]["Races"][0]
    return _payload_from_race(race)

def fetch_ergast_direct(base_url: str) -> dict:
    import requests
    url = base_url.rstrip("/") + "/f1/current/last/results.json"
    hdr = {
        "User-Agent": "Katechen125-updater (+https://github.com/Katechen125/Katechen125.github.io)",
        "Accept": "application/json",
        "Connection": "close",
    }
    for i in range(5):  
        try:
            r = requests.get(url, headers=hdr, timeout=20)
            r.raise_for_status()
            j = r.json()
            race = j["MRData"]["RaceTable"]["Races"][0]
            return _payload_from_race(race)
        except Exception:
            time.sleep(1.5 * (i + 1))
    raise RuntimeError(f"ergast fetch failed after retries: {url}")

def main() -> int:
    prev = _load_prev()
    bases = [os.getenv("ERGAST_URL", "https://ergast.com/api"),
             "http://ergast.com/api"]
    mirror = os.getenv("ERGAST_MIRROR")
    if mirror:
        bases.append(mirror.rstrip("/"))

    try:
        payload = fetch_fastf1()
        if _ok(payload):
            _write(payload)
            print(json.dumps(payload, ensure_ascii=False))
            return 0
    except Exception:
        pass

    for base in bases:
        try:
            payload = fetch_ergast_direct(base)
            if _ok(payload):
                _write(payload)
                print(json.dumps(payload, ensure_ascii=False))
                return 0
        except Exception:
            continue

    if _ok(prev):
        _write(prev)
        print("WARN: kept previous payload; all fetches failed", file=sys.stderr)
        return 0

    print("ERROR: could not fetch winner; not writing {}", file=sys.stderr)
    return 2

if __name__ == "__main__":
    sys.exit(main())
