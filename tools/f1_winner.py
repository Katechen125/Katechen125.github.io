import json, datetime as dt
import fastf1
fastf1.Cache.enable_cache(".fastf1cache")
year = dt.datetime.utcnow().year
schedule = fastf1.get_event_schedule(year, include_testing=False)
last_finished = None
now = dt.datetime.utcnow()
for _, row in schedule.iterrows():
    if row.get('Session5DateUtc') and row['Session5DateUtc'] < now:
        last_finished = row
if last_finished is None:
    raise SystemExit("no finished race")
ses = fastf1.get_session(int(last_finished['Year']), last_finished['EventName'], 'R')
ses.load(laps=False, telemetry=False, weather=False, messages=False)
res = ses.results
p1 = res.iloc[0]
name = f"{p1['FirstName']} {p1['LastName']}".strip()
num = int(p1['DriverNumber'])
team = p1['TeamName']
gp = f"{last_finished['EventName']} Grand Prix"
cc = last_finished.get('CountryCode') or ''
out = {"name": name, "number": num, "team": team, "gp": gp, "flag_cc": cc}
with open("data/latest.json", "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False)
print(out)
