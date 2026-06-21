import sqlite3
from pathlib import Path

DB_PATH = Path("backend/gridlock.db")
conn = sqlite3.connect(DB_PATH)
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

hour = 9
weekday = 1

cursor.execute("""
    SELECT id, center_lat as lat, center_lng as lng, location_name as name, lane_count 
    FROM hotspots 
    WHERE timeframe = 'Recent Dataset Window'
""")
hotspots = cursor.fetchall()
predictions = []

for h in hotspots:
    cursor.execute("""
        SELECT COUNT(*) as violations
        FROM violations
        WHERE location = ?
        AND CAST(strftime('%H', created_datetime) AS INTEGER) = ?
        AND CAST(strftime('%w', created_datetime) AS INTEGER) = ?
    """, (h['name'], hour, weekday))
    hist_violations = cursor.fetchone()['violations']

    capacity = h['lane_count'] * 1800
    arrival_rate = (capacity * 0.85) + (hist_violations * 40)
    
    if arrival_rate <= capacity:
        continue

    excess_demand = arrival_rate - capacity

    cursor.execute("""
        SELECT vehicle_type, COUNT(*) as c 
        FROM violations 
        WHERE location = ? 
        GROUP BY vehicle_type 
        ORDER BY c DESC LIMIT 1
    """, (h['name'],))
    vehicle_row = cursor.fetchone()
    dominant_vehicle = vehicle_row['vehicle_type'] if vehicle_row else None
    
    buffer_vehicles = 200 / 7
    spillover_mins = (buffer_vehicles / (excess_demand / 60))
    if dominant_vehicle in ['Maxi-Cab', 'Heavy Truck']:
        spillover_mins *= 0.7
    spillover_mins = round(spillover_mins)

    if spillover_mins > 90:
        continue

    cursor.execute("""
        SELECT COUNT(DISTINCT date(created_datetime)) 
        FROM violations 
        WHERE location = ?
        AND CAST(strftime('%H', created_datetime) AS INTEGER) = ?
        AND CAST(strftime('%w', created_datetime) AS INTEGER) = ?
        AND created_datetime >= datetime('2024-04-08', '-28 days')
    """, (h['name'], hour, weekday))
    occurrences = cursor.fetchone()[0]
    confidence = (occurrences / 4) * 100
    
    if confidence < 50:
        continue

    vehicles_affected = (arrival_rate * spillover_mins) / 60
    damage = round(vehicles_affected * 1.4 * 180 / 60)
    print(f"Success for {h['name']}: {spillover_mins} mins, {confidence}% conf, Rs {damage}")

print("Done")
