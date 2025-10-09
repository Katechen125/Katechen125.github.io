import fastf1
import pandas as pd
from datetime import datetime
import json
import os

fastf1.Cache.enable_cache('tools/.f1cache')

def finished_rows_for_year(year: int):
    sch = fastf1.get_event_schedule(year, include_testing=False)
    if "Session5DateUtc" in sch.columns:
        sch["race_end"] = pd.to_datetime(sch["Session5DateUtc"], utc=True).dt.tz_localize(None)
    else:
        sch["race_end"] = pd.NaT
    sch["race_end"] = sch["race_end"].fillna(method="ffill")
    sch = sch[pd.notna(sch["race_end"])]
    sch = sch[sch["race_end"] < datetime.now()]
    return sch

def latest_winner():
    now_year = datetime.now().year
    for y in [now_year, now_year - 1]:
        try:
            rows = finished_rows_for_year(y)
            if rows.empty:
                continue
            latest_event = rows.iloc[-1]
            gp_name = latest_event["EventName"]
            round_num = int(latest_event["RoundNumber"])
            session = fastf1.get_session(y, round_num, 'R')
            session.load()
            if session.results is None or session.results.empty:
                continue
            winner = session.results.iloc[0]["FullName"]
            return f"{gp_name}: {winner}"
        except Exception as e:
            print(f"⚠️ Skipped {y}: {e}")
            continue
    return "No finished race yet."

if __name__ == "__main__":
    try:
        winner = latest_winner()
        print("🏆 Latest Race Winner →", winner)

        os.makedirs("data", exist_ok=True)
        with open("data/latest.json", "w", encoding="utf-8") as f:
            json.dump({"winner": winner}, f, ensure_ascii=False, indent=2)
        print("✅ Saved to data/latest.json")

    except Exception as e:
        print("❌ Could not fetch latest race winner:", e)
