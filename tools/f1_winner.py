import json, pathlib, requests
from datetime import datetime, timezone

OUT = pathlib.Path("data/latest.json")
API = "https://ergast.com/api/f1/current/last/results.json"

def _ensure_dir():
    OUT.parent.mkdir(parents=True, exist_ok=True)

def _load_prev():
    if OUT.exists():
        try:
            return json.loads(OUT.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}

def _write(payload):
    _ensure_dir()
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")

def main():
    prev = _load_prev()
    try:
        r = requests.get(API, timeout=20)
        r.raise_for_status()
        j = r.json()
        races = j.get("MRData", {}).get("RaceTable", {}).get("Races", [])
        if not races:
            _write(prev or {})
            print("no races; kept previous")
            return 0

        race = races[0]
        results = race.get("Results", [])
        if not results:
            _write(prev or {})
            print("no results; kept previous")
            return 0

        p1 = results[0]
        driver = p1.get("Driver", {}) or {}
        constructor = p1.get("Constructor", {}) or {}

        payload = {
            "name": f"{driver.get('givenName','').strip()} {driver.get('familyName','').strip()}".strip(),
            "number": driver.get("permanentNumber") or p1.get("number") or "",
            "team": constructor.get("name",""),
            "gp": race.get("raceName",""),
            "round": race.get("round",""),
            "country": (race.get("Circuit",{}) or {}).get("Location",{}).get("country",""),
            "flag_code": driver.get("nationality",""),
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        _write(payload)
        print("updated", payload.get("name",""))
        return 0
    except Exception as e:
        _write(prev or {})
        print("error; kept previous:", e)
        return 0

if __name__ == "__main__":
    raise SystemExit(main())
