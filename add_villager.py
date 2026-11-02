#!/usr/bin/env python3
"""Add a villager:  python3 add_villager.py HANDLE "Name" FLAG COUNTRY [--image img/x.jpg] [--likes N] [--deploy]
Places the house on the next free slot of the spiral pattern around the campfire, adds a news item."""
import json,sys,math,datetime,argparse,subprocess,os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
a=argparse.ArgumentParser();a.add_argument('handle');a.add_argument('name');a.add_argument('flag');a.add_argument('country')
a.add_argument('--image',default='img/f8.jpg');a.add_argument('--likes',type=int,default=0);a.add_argument('--x',type=float);a.add_argument('--y',type=float);a.add_argument('--deploy',action='store_true')
o=a.parse_args();f='data/villagers.json';d=json.load(open(f));h=o.handle.lstrip('@')
if any(v['handle']==h for v in d['villagers']): sys.exit('already exists')
c=next(v for v in d['villagers'] if v.get('owner'));n=len(d['villagers'])
r=90+18*n; t=n*2.4  # golden-angle-ish spiral outward from founder
x=o.x if o.x is not None else round(c['x']+r*math.cos(t)); y=o.y if o.y is not None else round(c['y']+0.55*r*math.sin(t))
today=datetime.date.today().isoformat()
d['villagers'].append(dict(handle=h,name=o.name,flag=o.flag,country=o.country,joined=today,x=x,y=y,image=o.image,likes=o.likes,pano='p1'))
d['news'].insert(0,dict(date=today,text=f"🏡 Welcome @{h} {o.flag}! A new house was built in Lantern Creek."))
json.dump(d,open(f,'w'),ensure_ascii=False,indent=1);print('added',h,x,y)
if o.deploy: subprocess.run(['bash','deploy.sh'],check=True)
