# flighttracker — Commercial Free Flight Tracking Stack

Live demo: https://flighttracker.pages.dev

Buildable entirely for free for commercial use. No public live-traffic API is truly unlimited — this project achieves effectively unlimited requests by self-hosting your own ADS-B receiver and caching everything on Cloudflare edge.

## Why this build is commercial-safe

- **Does NOT use OpenSky for production** — OpenSky Network REST API is great for dev/research but is non-commercial and credit-limited (400 anon / 4000 registered / 8000 feeder credits/day).
- Uses **ADSB.lol API** (openly licensed, unfiltered) as primary global fallback
- Uses **your own RTL-SDR + readsb + tar1090** for true no-rate-limit local feed
- All traffic is cached via **Cloudflare Pages Functions** — your users hit Cloudflare CDN, not upstream APIs.

## Architecture

```
Antenna 1090MHz
  → RTL-SDR Dongle (Raspberry Pi / VPS)
  → readsb / dump1090-fa (decodes ADS-B)
  → tar1090 (Leaflet radar)
  → POST to Cloudflare Worker /api/ingest (optional)
  → Cloudflare KV / R2 + Pages Functions /api/live
  → Browser MapLibre GL JS (10s auto-refresh)

Fallback: ADSB.lol /api/v2/lat/lon/dist → same /api/live cache
NAT Tracks: Cron fetches NAT-Tracks API → KV (cached 5min)
```

## Free Stack

| Need | Best free option | Notes |
|------|------------------|-------|
| Live global traffic (commercial) | **ADSB.lol API** | Openly licensed, cache on CF edge with s-maxage=10 |
| Live no quota | **Own RTL-SDR + readsb + tar1090** | Only aircraft in radio range, 0 quota |
| Community data | ADSB.lol / ADS-B Exchange | Community APIs |
| NAT Tracks | `aogden41/NAT-Tracks` or parse NTM | Published 2x daily: Eastbound ~1400Z, Westbound ~2200Z |
| Aero reference | OurAirports, NOTAC API, FAA SWIM | Airports, NOTAMs, METAR/TAF |
| Maps | Leaflet / MapLibre GL + OSM | MapLibre is BSD, no token needed |
| Hosting | Cloudflare Pages + Functions | Unlimited bandwidth, commercial allowed |

## Project Structure

```
flighttracker/
├── index.html              # Main site (no build needed)
├── functions/
│   └── api/
│       ├── live.js         # Proxies ADSB.lol → CF cache 10s
│       └── tracks.js       # Proxies NAT Tracks → CF cache 300s
├── wrangler.toml           # Cloudflare config
└── README.md
```

## Included Cloudflare Functions

### `functions/api/live.js`
Proxies `https://api.adsb.lol/v2/lat/{lat}/lon/{lon}/dist/{dist}` with edge cache.
```
GET /api/live?lat=50&lon=-25&dist=500
```

### `functions/api/tracks.js`
Proxies NAT tracks:
```
GET /api/tracks
```

## Deploy to Cloudflare Pages (2 min)

### Option A: Direct Upload (fastest)
1. Go to dash.cloudflare.com → Pages → Create Project → Upload assets
2. Drag the whole `flighttracker` folder
3. Project name: `flighttracker` (this gives you flighttracker.pages.dev)
4. Framework: None, Build command: empty, Output: `/`
5. Deploy

### Option B: GitHub (recommended for auto-deploy)
1. Create GitHub repo `flighttracker`
2. Push this folder
3. Cloudflare Pages → Create → Connect to Git → Select repo
4. Project name: `flighttracker`
5. Framework: None, Build output: `/`
6. Deploy — every git push auto-deploys

After deploy test:
- `https://flighttracker.pages.dev/api/live?lat=50&lon=-25&dist=500`
- `https://flighttracker.pages.dev/api/tracks`

## Adding Your Own Receiver (for true unlimited)

On Raspberry Pi:

```bash
# Install readsb
sudo apt install readsb

# Run with JSON output
readsb --net --json

# Simple Python pusher to Cloudflare (add as /api/ingest)
import requests, time, json
while True:
    data = open('/run/readsb/aircraft.json').read()
    requests.post('https://flighttracker.pages.dev/api/ingest', 
        data=data, headers={'Authorization': 'Bearer YOUR_SECRET'})
    time.sleep(5)
```

## NAT Tracks

NAT Track Message published twice daily, valid over 30°W.
Use JSON model:

```json
{
  "id": "A",
  "tmi": "260",
  "direction": "west",
  "valid": "0100Z-0800Z",
  "levels": ["FL310", "FL330", "FL350"],
  "path": [
    {"name": "MALOT", "lat": 51.0, "lon": -12.5},
    {"name": "RATSU", "lat": 50.5, "lon": -20.0}
  ]
}
```

Render as Polyline + CircleMarkers + tooltips in MapLibre/Leaflet.

## License

MIT-friendly stack:
- ADSB.lol — open license
- readsb / tar1090 — GPL
- Leaflet / MapLibre — BSD
- OurAirports — public domain
- Cloudflare Pages — commercial allowed, unlimited bandwidth

> Note: If you use OpenSky for dev, keep it dev-only. For commercial prod, use ADSB.lol + own receiver.

## Roadmap

- [ ] Add MapLibre live map with /api/live overlay
- [ ] Cron Worker for NAT Tracks (2x daily)
- [ ] KV cache for historical tracks
- [ ] Own receiver ingest endpoint

## Author

Built for developers who want self-hosted flight tracking without rate limits.
