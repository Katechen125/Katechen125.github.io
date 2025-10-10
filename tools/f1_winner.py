import json, sys, pathlib
from datetime import datetime, timezone
from fastf1.ergast import Ergast

OUT = pathlib.Path("data/latest.json")

NAME_TO_FLAG = {
    "Max Verstappen":"🇳🇱","Yuki Tsunoda":"🇯🇵","Charles Leclerc":"🇲🇨","Lewis Hamilton":"🇬🇧","George Russell":"🇬🇧",
    "Kimi Antonelli":"🇮🇹","Lando Norris":"🇬🇧","Oscar Piastri":"🇦🇺","Liam Lawson":"🇳🇿","Isack Hadjar":"🇫🇷",
    "Fernando Alonso":"🇪🇸","Lance Stroll":"🇨🇦","Alexander Albon":"🇹🇭","Carlos Sainz":"🇪🇸","Pierre Gasly":"🇫🇷",
    "Franco Colapinto":"🇦🇷","Esteban Ocon":"🇫🇷","Oliver Bearman":"🇬🇧","Nico Hülkenberg":"🇩🇪","Gabriel Bortoleto":"🇧🇷"
}

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
        erg = Ergast()
        res = erg.get_race_results(season="current", round="last")
        df = None if res is None else res.content
        if df is None or df.empty:
            prev = load_existing()
            write_safe(prev if prev else {})
            print("no finished race with results")
            return 0

        p1 = df.loc[df["position"] == 1].iloc[0]
        name = f'{p1["Driver.givenName"]} {p1["Driver.familyName"]}'.strip()
        team = str(p1["Constructor.name"])
        number = str(p1.get("Driver.permanentNumber") or p1.get("number") or "")

        rnd = int(p1["round"])
        gp = ""
        sch = erg.get_schedule(season="current")
        sdf = None if sch is None else sch.content
        if sdf is not None and not sdf.empty:
            row = sdf.loc[sdf["round"] == rnd]
            if not row.empty:
                gp = str(row["raceName"].iloc[0])

        flag = NAME_TO_FLAG.get(name, "")

        payload = {
            "name": name,
            "number": number,
            "team": team,
            "gp": gp,
            "flag": flag,
            "generated_at": datetime.now(timezone.utc).isoformat()
        }
        write_safe(payload)
        print("updated", name)
        return 0
    except Exception:
        prev = load_existing()
        write_safe(prev if prev else {})
        print("error; kept previous")
        return 0

if __name__ == "__main__":
    sys.exit(main())
