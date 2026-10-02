(async () => {
const parks=window.PARKS;
const $=s=>document.querySelector(s);
const status=$('#status');
$('#progress').textContent=`${parks.filter(p=>p.visited).length} of ${parks.length} visited`;
const fmt=date=>date ? new Intl.DateTimeFormat('en',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(`${date}-01T12:00:00Z`)) : 'Not yet visited';
let map,popup,selected=null,listFilter='all',forcedFlat=false,items=[],cityItems=[];
const cities=[
 ['New York',-74.006,40.713,2.8],['Boston',-71.059,42.36,4],['Philadelphia',-75.165,39.953,4.2],['Washington, DC',-77.037,38.907,3.4],
 ['Atlanta',-84.388,33.749,3.0],['Miami',-80.192,25.762,3.0],['Orlando',-81.379,28.538,4.5],['Charlotte',-80.843,35.227,4.5],['Nashville',-86.782,36.162,4.2],
 ['Chicago',-87.63,41.878,2.8],['Detroit',-83.046,42.331,4],['Minneapolis',-93.265,44.978,3.6],['St. Louis',-90.199,38.627,3.8],['Kansas City',-94.579,39.1,4],
 ['Dallas',-96.797,32.777,3.0],['Houston',-95.37,29.76,3.0],['Austin',-97.743,30.267,4.6],['Denver',-104.99,39.739,3.0],['Albuquerque',-106.65,35.084,4.2],
 ['Phoenix',-112.074,33.448,3.6],['Las Vegas',-115.14,36.17,4.2],['Salt Lake City',-111.891,40.761,4],['Boise',-116.202,43.615,4.6],['Billings',-108.501,45.784,4.6],['Rapid City',-103.231,44.081,5],['Jackson',-110.762,43.48,5.8],
 ['Los Angeles',-118.244,34.052,2.8],['San Francisco',-122.419,37.775,3.6],['San Diego',-117.161,32.716,4.7],['Seattle',-122.332,47.606,3.0],['Portland',-122.676,45.523,4],['Spokane',-117.426,47.659,5],
 ['Anchorage',-149.9,61.218,3.3],['Fairbanks',-147.716,64.838,4.4],['Juneau',-134.42,58.301,4.5],['Honolulu',-157.858,21.307,4.5],['Hilo',-155.084,19.707,6],['Kahului',-156.47,20.89,6],
 ['Charlotte Amalie',-64.931,18.341,6],['Pago Pago',-170.703,-14.275,6]
];
const regions={home:{center:[-99,38],zoom:3.1,pitch:55},alaska:{center:[-151,63],zoom:3.8,pitch:38},hawaii:{center:[-156,20.4],zoom:6,pitch:30},caribbean:{center:[-64.73,18.34],zoom:7,pitch:25},samoa:{center:[-170.69,-14.26],zoom:7,pitch:25}};
function showPark(p){
 selected=p.id;items.forEach(i=>i.el.classList.toggle('selected',i.p.id===p.id));
 popup?.remove();
 const details=window.PARK_DETAILS[p.id];
 $('#detail-name').textContent=p.name;$('#detail-zh').textContent=p.nameZh;
 $('#detail-state').textContent=p.state.replaceAll(';', ' ·');
 $('#detail-description').textContent=details.description;
 $('#detail-visit-row').hidden=!p.firstVisit;$('#detail-visit').textContent=p.firstVisit?fmt(p.firstVisit):'';
 $('#detail-icon').classList.toggle('unvisited',!p.visited);
 const art=$('#detail-art');art.alt=`${p.name} landscape illustration`;art.onerror=()=>{art.onerror=null;art.src=p.image;};art.src=`assets/detail-${String(p.id).padStart(2,'0')}.webp`;
 $('#detail-highlights').replaceChildren(...details.highlights.map(text=>{const li=document.createElement('li');li.textContent=text;return li;}));
 $('#detail-source').href=details.source;
 const dialog=$('#park-detail');if(dialog.open)dialog.close();dialog.showModal();
}
const detailDialog=$('#park-detail');
$('#detail-close').addEventListener('click',()=>detailDialog.close());
detailDialog.addEventListener('click',e=>{if(e.target!==detailDialog)return;const b=detailDialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)detailDialog.close();});
detailDialog.addEventListener('close',()=>{selected=null;items.forEach(i=>i.el.classList.remove('selected'));});
function renderList(){
 const query=$('#search').value.trim().toLowerCase();const list=$('#park-list');list.replaceChildren();
 parks.filter(p=>(listFilter==='all'||(listFilter==='visited'?p.visited:!p.visited))&&`${p.name} ${p.nameZh} ${p.state}`.toLowerCase().includes(query)).forEach(p=>{
  const b=document.createElement('button');b.className=`card ${p.visited?'visited':'unvisited'}`;
  const img=document.createElement('img');img.src=p.image;img.alt='';img.loading='lazy';
  const disc=document.createElement('span');disc.className='icon-disc';disc.append(img);
  const txt=document.createElement('span'),strong=document.createElement('strong'),small=document.createElement('small');strong.textContent=p.name;small.textContent=fmt(p.firstVisit);txt.append(strong,small);b.append(disc,txt);
  b.addEventListener('click',()=>{if(innerWidth<700)toggleList(false);showPark(p);});list.append(b);
 });
 if(!list.children.length){const p=document.createElement('p');p.textContent='No matching parks';p.style.padding='20px';list.append(p);}
}
function toggleList(open){const b=$('#open-list');const value=open??b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(value));$('#drawer').hidden=!value;if(value)$('#search').focus();}
$('#open-list').addEventListener('click',()=>toggleList());$('#search').addEventListener('input',renderList);
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{listFilter=b.dataset.filter;document.querySelectorAll('[data-filter]').forEach(x=>x.classList.toggle('active',x===b));renderList();}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){toggleList(false);popup?.remove();}});renderList();
function setProjection(){map.setProjection({type:forcedFlat?'mercator':['interpolate',['linear'],['zoom'],1.8,'mercator',2.9,'vertical-perspective']});}
$('#mode').addEventListener('click',()=>{forcedFlat=!forcedFlat;$('#mode').textContent=forcedFlat?'Curved view':'Flat view';$('#mode').setAttribute('aria-pressed',String(forcedFlat));if(map){setProjection();map.easeTo({pitch:forcedFlat?0:45,duration:750});}});
document.querySelectorAll('[data-region]').forEach(b=>b.addEventListener('click',()=>{if(!map)return;popup?.remove();const r=regions[b.dataset.region];map.flyTo({...r,pitch:forcedFlat?0:r.pitch,duration:1200});}));
function layout(){
 if(!map)return;const container=map.getContainer(),w=container.clientWidth,h=container.clientHeight,zoom=map.getZoom(),size=Math.min(innerWidth<700?66:90,(innerWidth<700?44:54)+Math.max(0,zoom-3)*7);
 const canvas=$('#leaders'),dpr=devicePixelRatio||1;if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=`${w}px`;canvas.style.height=`${h}px`;}
 const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);ctx.strokeStyle='rgba(103,122,108,.38)';ctx.lineWidth=.8;
 const placed=[];const ordered=[...items].sort((a,b)=>Number(b.p.id===selected)-Number(a.p.id===selected)||Number(b.p.visited)-Number(a.p.visited)||a.p.id-b.p.id);
 ordered.forEach(item=>{
  item.el.style.width=`${size}px`;item.el.style.height=`${size}px`;const a=map.project(item.p.coordinates);
  if(!Number.isFinite(a.x)||!Number.isFinite(a.y)||a.x<0||a.x>w||a.y<140||a.y>h-55){item.marker.setOffset([0,0]);return;}
  const offsets=[[0,0]];for(let radius=1;radius<=5;radius++)for(let k=0;k<12;k++){const angle=k*Math.PI/6;offsets.push([Math.cos(angle)*size*.63*radius,Math.sin(angle)*size*.63*radius]);}
  let offset=offsets.find(([dx,dy])=>a.x+dx>size/2+4&&a.x+dx<w-size/2-4&&a.y+dy>145&&a.y+dy<h-60&&!placed.some(p=>Math.hypot(p[0]-(a.x+dx),p[1]-(a.y+dy))<size+8))||[0,0];
  placed.push([a.x+offset[0],a.y+offset[1]]);item.marker.setOffset(offset);
  if(Math.hypot(...offset)>2){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(a.x+offset[0],a.y+offset[1]);ctx.stroke();ctx.beginPath();ctx.arc(a.x,a.y,1.7,0,Math.PI*2);ctx.fillStyle='#83938a';ctx.fill();}
 });
 const cityBoxes=[];
 cityItems.forEach(item=>{
  const a=map.project(item.coordinates),width=item.el.offsetWidth||item.name.length*6+8;
  const box=[a.x,a.y-7,a.x+width,a.y+7];
  const overlapsPark=placed.some(([x,y])=>x>box[0]-size/2-6&&x<box[2]+size/2+6&&y>box[1]-size/2-4&&y<box[3]+size/2+4);
  const overlapsCity=cityBoxes.some(b=>box[0]<b[2]+8&&box[2]>b[0]-8&&box[1]<b[3]+4&&box[3]>b[1]-4);
  const hide=zoom<item.minZoom||!Number.isFinite(a.x)||!Number.isFinite(a.y)||a.x<15||a.x+width>w-15||a.y<145||a.y>h-70||overlapsPark||overlapsCity;
  item.el.style.visibility=hide?'hidden':'visible';if(!hide)cityBoxes.push(box);
 });
}
async function addStateBoundaries(){
 const endpoint='https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/State_County/MapServer/0/query';
 const query=new URLSearchParams({where:'1=1',outFields:'NAME,STUSAB',outSR:'4326',geometryPrecision:'4',maxAllowableOffset:'0.04',returnGeometry:'true',f:'geojson'});
 try{
  const response=await fetch(`${endpoint}?${query}`,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('State boundary request failed');
  const data=await response.json();if(data.type!=='FeatureCollection'||!Array.isArray(data.features)||data.features.length<50)throw Error('Incomplete state boundaries');
  map.addSource('states',{type:'geojson',data,attribution:'State boundaries: U.S. Census Bureau'});
  map.addLayer({id:'state-boundaries',type:'line',source:'states',paint:{'line-color':'#adb9ad','line-opacity':.62,'line-width':['interpolate',['linear'],['zoom'],2,.45,5,.85,9,1.15]}});
 }catch(error){console.warn('State boundaries are temporarily unavailable.',error);}
}
try{
 let lib;try{lib=await import('https://unpkg.com/maplibre-gl@6.11.2/dist/maplibre-gl.mjs');}catch(e){lib=await import('https://cdn.jsdelivr.net/npm/maplibre-gl@6.11.2/dist/maplibre-gl.mjs');}
 window.maplibregl=lib;
 map=new lib.Map({container:'map',style:{version:8,sources:{land:{type:'vector',url:'https://demotiles.maplibre.org/tiles/tiles.json',attribution:'© Natural Earth · MapLibre'}},layers:[{id:'ocean',type:'background',paint:{'background-color':'#dbe5e3'}},{id:'land',type:'fill',source:'land','source-layer':'countries',paint:{'fill-color':['case',['==',['get','ADM0_A3'],'USA'],'#eceadf','#e4e5db'],'fill-opacity':1}},{id:'borders',type:'line',source:'land','source-layer':'countries',paint:{'line-color':'#c5cdc2','line-width':.7}}],projection:{type:['interpolate',['linear'],['zoom'],1.8,'mercator',2.9,'vertical-perspective']}},...regions.home,minZoom:1.5,maxZoom:10,maxPitch:70,renderWorldCopies:false,attributionControl:{compact:true}});
 map.addControl(new lib.NavigationControl({visualizePitch:true}),'bottom-right');
 map.on('load',()=>{
  status.hidden=true;
  addStateBoundaries();
  try{map.setSky({'sky-color':'#f6f7ef','horizon-color':'#e4ece7','fog-color':'#e4ece7','sky-horizon-blend':.6,'horizon-fog-blend':.5,'fog-ground-blend':.3});}catch(e){}
  items=parks.map(p=>{const el=document.createElement('button');el.className=`park-marker ${p.visited?'visited':'unvisited'}`;el.setAttribute('aria-label',`${p.name}, ${fmt(p.firstVisit)}`);el.title=p.name;const img=document.createElement('img');img.src=p.image;img.alt='';img.draggable=false;el.append(img);el.addEventListener('click',e=>{e.stopPropagation();showPark(p);});return {p,el,marker:new lib.Marker({element:el,anchor:'center',pitchAlignment:'viewport',rotationAlignment:'viewport'}).setLngLat(p.coordinates).addTo(map)};});
  cityItems=cities.map(([name,lon,lat,minZoom])=>{const el=document.createElement('span');el.className='city-label';el.textContent=name;el.setAttribute('aria-hidden','true');el.style.visibility='hidden';const coordinates=[lon,lat];return {name,coordinates,minZoom,el,marker:new lib.Marker({element:el,anchor:'left',pitchAlignment:'viewport',rotationAlignment:'viewport'}).setLngLat(coordinates).addTo(map)};});
  map.on('render',layout);map.on('resize',layout);layout();
 });
 map.on('zoomend',()=>{if(!forcedFlat&&map.getZoom()<2.4&&map.getPitch()>8)map.easeTo({pitch:0,duration:600});});
 let errors=0;map.on('error',()=>{if(++errors>2){status.hidden=false;status.textContent='The basemap could not load. Check your internet connection; the park list is still available.';}});
}catch(e){status.textContent='The map could not load. Check your internet connection or browser WebGL support. You can still browse the park list.';toggleList(true);}

})();
