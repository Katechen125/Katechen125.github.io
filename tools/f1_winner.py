import os, json
import pandas as pd
import fastf1

os.makedirs(".fastf1cache", exist_ok=True)
fastf1.Cache.enable_cache(".fastf1cache")

COUNTRY_TO_CC={"United Kingdom":"GB","Great Britain":"GB","UK":"GB","United States":"US","USA":"US","United Arab Emirates":"AE","Saudi Arabia":"SA","Bahrain":"BH","Qatar":"QA","Azerbaijan":"AZ","Brazil":"BR","Mexico":"MX","Canada":"CA","Spain":"ES","Italy":"IT","San Marino":"SM","Monaco":"MC","France":"FR","Belgium":"BE","Netherlands":"NL","Austria":"AT","Germany":"DE","Hungary":"HU","Czech Republic":"CZ","Singapore":"SG","Japan":"JP","China":"CN","Australia":"AU","Argentina":"AR"}

def cc_from_country(name:str)->str:
    return COUNTRY_TO_CC.get((name or "").strip(), "")

def finished_rows_for_year(y:int)->pd.DataFrame:
    sch=fastf1.get_event_schedule(y, include_testing=False)
    cols=[c for c in ["Session5DateUtc","Session4DateUtc","Session3DateUtc","Session2DateUtc","Session1DateUtc"] if c in sch.columns]
    if not cols: return pd.DataFrame([])
    for c in cols:
        sch[c]=pd.to_datetime(sch[c], utc=True, errors="coerce")
    sch["race_end"]=pd.NaT
    for c in cols:
        sch["race_end"]=sch["race_end"].fillna(sch[c])
    now=pd.Timestamp.now(tz="UTC")
    sch=sch[pd.notna(sch["race_end"])]
    sch=sch[sch["race_end"]<now]
    sch=sch.sort_values("race_end")
    return sch

def latest_winner():
    for y in [pd.Timestamp.now(tz="UTC").year, pd.Timestamp.now(tz="UTC").year-1]:
        rows=finished_rows_for_year(y)
        for _,row in reversed(list(rows.iterrows())):
            try:
                ses=fastf1.get_session(int(row["Year"]), row["EventName"], "R")
                ses.load(laps=False, telemetry=False, weather=False, messages=False)
                res=ses.results
                if res is None or len(res)==0: continue
                p1=res.iloc[0]
                name=f"{p1['FirstName']} {p1['LastName']}".strip()
                num=int(p1["DriverNumber"])
                team=p1["TeamName"]
                gp=f"{row['EventName']} Grand Prix"
                cc=cc_from_country(row.get("Country",""))
                return {"name":name,"number":num,"team":team,"gp":gp,"flag_cc":cc}
            except Exception:
                continue
    return None

def write_out(data:dict):
    os.makedirs("data", exist_ok=True)
    with open("data/latest.json","w",encoding="utf-8") as f:
        json.dump(data or {}, f, ensure_ascii=False)

winner=latest_winner()
if winner:
    write_out(winner)
else:
    try:
        with open("data/latest.json","r",encoding="utf-8") as f:
            existing=json.load(f)
    except Exception:
        existing={}
    write_out(existing)
print("ok")
