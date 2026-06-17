import pandas as pd
import json

# File path
csv_path = '../data/jan to may police violation_anonymized791b166.csv'
output_json_path = 'hotspots.json'

print("Loading dataset...")
# Only load necessary columns to save memory
df = pd.read_csv(csv_path, usecols=['latitude', 'longitude', 'violation_type', 'location', 'created_datetime'])

print(f"Total records: {len(df)}")

# Filter for parking violations
print("Filtering for parking violations...")
parking_mask = df['violation_type'].astype(str).str.contains('PARKING', case=False, na=False)
parking_df = df[parking_mask].copy()

print(f"Total parking violations: {len(parking_df)}")

# Drop rows with invalid coordinates
parking_df = parking_df.dropna(subset=['latitude', 'longitude'])

# Round coordinates to 3 decimal places to group into hotspots (approx 110m x 110m area)
parking_df['lat_rounded'] = parking_df['latitude'].round(3)
parking_df['lon_rounded'] = parking_df['longitude'].round(3)

# Group by rounded coordinates to get counts
print("Calculating hotspots...")
hotspots = parking_df.groupby(['lat_rounded', 'lon_rounded']).size().reset_index(name='count')

# Sort by count and take top 100 hotspots
hotspots = hotspots.sort_values('count', ascending=False).head(100)

# Merge back some location text for the hotspots (take the first location string found in that group)
location_mapping = parking_df.groupby(['lat_rounded', 'lon_rounded'])['location'].first().reset_index()
hotspots = hotspots.merge(location_mapping, on=['lat_rounded', 'lon_rounded'], how='left')

# Prepare output for frontend
output_data = []
for _, row in hotspots.iterrows():
    output_data.append({
        'latitude': row['lat_rounded'],
        'longitude': row['lon_rounded'],
        'weight': row['count'],
        'location': row['location']
    })

print(f"Saving top 100 hotspots to {output_json_path}...")
with open(output_json_path, 'w') as f:
    json.dump(output_data, f, indent=2)

print("Done!")
