import os, json, datetime as dt
import pandas as pd
import fastf1

os.makedirs(".fastf1cache", exist_ok=True)
fastf1.Cache.enable_cache(".fastf1cache")

COUNTRY_TO_CC = {
  "United Kingdom":"GB","Great Britain":"GB","UK":"GB","United States":"US","USA":"US","U.S.A.":"US",
  "United Arab Emirates":"AE","Saudi Arabia":"SA","Bahrain":"BH","Qatar":"QA","Azerbaijan":"AZ",
  "Brazil":"BR","Mexico":"MX","Canada":"CA","Spain":"ES","Italy":"IT","San Marino":"SM","Monaco":"MC",
  "France":"FR","Belgium":"BE","Netherlands":"NL","Austria":"AT","Germany":"DE","Hungary":"HU","Czech Republic":"CZ",
  "Singapore":"SG","Japan":"JP","China":"CN","Australia":"AU","Argentina":"AR"
}

def cc_from_country(name:str) -> str:
    return COUNTRY_TO_CC.get(name.strip(), "")

now = dt.datetime.utcnow()
year = now.year

schedule = fastf1.get_event_schedule(year, include_testing=False)
schedule = schedule[pd.notna(schedule["Session5DateUtc"])]
schedule = schedule[schedule["Session5DateUtc"] < now]
schedule = schedule.sort_values("Session5DateUtc")

winner = None
event_row = None
for _, row in reversed(list(schedule.iterrows())):
    try:
        ses = fastf1.get_session(int(row["Year"]), row["EventName"], "R")
        ses.load(laps=False, telemetry=False, weather=False, messages=False)
        res = ses.results
        if res is None or len(res) == 0:
            continue
        p1 = res.iloc[0]
        name = f"{p1['FirstName']} {p1['LastName']}".strip()
        num = int(p1["DriverNumber"])
        team = p1["TeamName"]
        gp = f"{row['EventName']} Grand Prix"
        cc = cc_from_country(row.get("Country", "") or "")
        winner = {"name": name, "number": num, "team": team, "gp": gp, "flag_cc": cc}
        event_row = row
        break
    except Exception:
        continue

if not winner:
    raise SystemExit("no finished race with results")

os.makedirs("data", exist_ok=True)
with open("data/latest.json", "w", encoding="utf-8") as f:
    json.dump(winner, f, ensure_ascii=False)
print(winner)
