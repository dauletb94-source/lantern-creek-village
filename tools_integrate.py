import json, math, os
from PIL import Image
S='/workspace/uploads/site_export'; D='/workspace/village_site'
meta=json.load(open(f'{S}/map_meta.json')); P=json.load(open(f'{S}/panos.json'))['points']
# maps: 4096 -> 3072 web jpg
for src,dst in [('map_night.jpg','img/map.jpg'),('map_day.jpg','img/map_day.jpg')]:
    im=Image.open(f'{S}/{src}').convert('RGB').resize((3072,3072),Image.LANCZOS); im.save(f'{D}/{dst}',quality=82,optimize=True,progressive=True)
sc=3072/4096
for f in os.listdir(f'{D}/pano'): os.remove(f'{D}/pano/{f}')
for p in P:
    for m in ('day','night'):
        Image.open(f"{S}/{p['files'][m]}").convert('RGB').save(f"{D}/pano/{p['id']}_{m}.jpg",quality=80,optimize=True,progressive=True)
cfg=json.load(open(f'{D}/data/config.json')); cfg['map']={'night':'img/map.jpg','day':'img/map_day.jpg','width':3072,'height':3072}
json.dump(cfg,open(f'{D}/data/config.json','w'),ensure_ascii=False,indent=2)
data=json.load(open(f'{D}/data/villagers.json'))
byid={p['id']:p for p in P}
H={h['handle'].lstrip('@'):h for h in meta['houses']}
trail=0; titles={}
for p in P:
    if p['kind']=='house': titles[p['id']]=('🔥 ' if p['house'].lstrip('@')=='lantern.creek.vil' else '🏡 ')+p['house']
    elif p['kind']=='campfire': titles[p['id']]='🔥 Campfire'
    else: trail+=1; titles[p['id']]=f'🌲 Forest trail {trail}'
for v in data['villagers']:
    h=H.get(v['handle'])
    if not h: print('NO HOUSE', v['handle']); continue
    v['x'],v['y']=round(h['pixel'][0]*sc,1),round(h['pixel'][1]*sc,1)
    v['pano']=next(p['id'] for p in P if p['house'] and p['house'].lstrip('@')==v['handle'])
def norm(a): return (a+180)%360-180
panos=[]
for p in P:
    links=[]
    for n in p['neighbors']:
        q=byid[n]; dx,dy=q['x']-p['x'],q['y']-p['y']; head=math.degrees(math.atan2(dy,dx)); dist=math.hypot(dx,dy)
        links.append({'to':n,'yaw':round(norm(head-p['yaw']),1),'pitch':round(max(-30,-math.degrees(math.atan2(170,dist))),1)})
    panos.append({'id':p['id'],'title':titles[p['id']],'kind':p['kind'],'x':round(p['pixel'][0]*sc,1),'y':round(p['pixel'][1]*sc,1),'night':f"pano/{p['id']}_night.jpg",'day':f"pano/{p['id']}_day.jpg",'links':links})
data['panos']=panos
json.dump(data,open(f'{D}/data/villagers.json','w'),ensure_ascii=False,indent=2)
print('ok',len(panos))
