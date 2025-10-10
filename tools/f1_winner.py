# tools/f1_winner.py
import json, sys, pathlib
from datetime import datetime, timezone
from fastf1.ergast import Ergast

OUT = pathlib.Path("data/latest.json")

def write_safe(payload):
    OUT.parent.mkdir(parents=True, exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)

def load_existing():
    if OUT.exists():
        try:
            return json.loads(OUT.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}

def _first(row, *keys):
    for k in keys:
        if k in row and str(row[k]).strip():
            return str(row[k]).strip()
    return ""

def main():
    try:
        erg = Ergast()
        res = erg.get_race_results(season="current", round="last")
        if not res or res.content is None or res.content.empty:
            prev = load_existing()
            write_safe(prev if prev else {})
            print("no results; kept previous")
            return 0

        df = res.content
        row = df.iloc[0].to_dict()

        # Try to get GP name from race info; fall back to row fields
        gp_name = ""
        try:
            info = erg.get_race_info(season="current", round="last")
            if info and info.content is not None and not info.content.empty:
                gp_name = str(info.content.iloc[0].get("raceName") or "").strip()
        except Exception:
            pass

        given = _first(row, "givenName", "Driver.givenName", "driverGivenName")
        family = _first(row, "familyName", "Driver.familyName", "driverFamilyName")
        name = (given + " " + family).strip()

        number = _first(row, "permanentNumber", "Driver.permanentNumber", "number")
        team = _first(row, "constructorName", "Constructor.name", "constructorRef", "team")
        nationality = _first(row, "nationality", "Driver.nationality")

        payload = {
            "name": name,
            "number": number,
            "team": team,
            "gp": gp_name or _first(row, "raceName", "GrandPrix"),
            "nationality": nationality,
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
        write_safe({})
        print("error and no previous:", e)
        return 0

if __name__ == "__main__":
    sys.exit(main())
