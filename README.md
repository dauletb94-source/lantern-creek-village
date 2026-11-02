# Lantern Creek Village — site (v1)
Static site, no backend. Open `index.html` via any static host (GitHub Pages).

## Files
- `data/config.json` — title, TikTok, map images, **`cashtag`** (Cash App donate button; empty = hidden. Set e.g. `"cashtag": "YourTag"` → links to https://cash.app/$YourTag).
- `data/villagers.json` — villagers (`handle,name,flag,country,joined,x,y,image,likes,pano`), `panos`, `news`.
- `img/` house stills; `img/map.jpg` (night) + `img/map_day.jpg` (day) top-down map.
- `pano/<id>_night.jpg`, `pano/<id>_day.jpg` — panoramas.

## Dropping in Unreal renders
- **Map:** orthographic top-down render, any size (e.g. 4096x2304). Save as `img/map.jpg` / `img/map_day.jpg`, set `map.width/height` in config. House `x,y` = pixel coordinates in that image (origin top-left).
- **Panoramas:** equirectangular 2:1 (e.g. 4096x2048, Unreal Panoramic Capture), `pano/<id>_night.jpg` + `_day.jpg`. In `panos[]` set `links` = `{to, yaw}` (yaw degrees, 0 = image center) for walk arrows. Real Unreal panoramas (4096x2048 equirect, vaov 180) from VillageReel/site_export, 17 points; links yaw computed from world coords (integrate.py).
- **House stills:** `img/house_<handle>.jpg`, ~1080 wide, set `image`.

## Add a villager
`python3 add_villager.py oblvan2 "Name" 🇺🇸 USA --image img/house_oblvan2.jpg --deploy`
Edit `likes` in villagers.json to update the leaderboard; add items to `news` manually.
