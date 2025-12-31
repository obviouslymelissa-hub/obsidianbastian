// Simple SPA: loads systems.json, renders systems/planets, favorites, deep links, and an animated ship travel
const DATA_URL = 'systems.json';
let catalog = null;
let currentSystem = null;
let currentPlanet = null;
const STORAGE = { FAVS: 'nav:favs:v1', LOC: 'nav:loc:v1' };

function $(id){ return document.getElementById(id); }

async function loadCatalog(){
  const res = await fetch(DATA_URL);
  if(!res.ok) throw new Error('Failed to fetch catalog');
  catalog = await res.json();
  return catalog;
}

function saveFavs(list){ localStorage.setItem(STORAGE.FAVS, JSON.stringify(list)); }
function loadFavs(){ try{ return JSON.parse(localStorage.getItem(STORAGE.FAVS)) || []; }catch(e){return []} }
function saveLocation(loc){ localStorage.setItem(STORAGE.LOC, JSON.stringify(loc)); }
function loadLocation(){ try{ return JSON.parse(localStorage.getItem(STORAGE.LOC)); }catch(e){return null} }

function renderSystems(filter=''){
  const container = $('systemsList');
  container.innerHTML = '';
  const q = filter.trim().toLowerCase();
  catalog.systems.forEach(sys=>{
    if(q && !sys.name.toLowerCase().includes(q) && !sys.planets.some(p=>p.name.toLowerCase().includes(q))) return;
    const el = document.createElement('div');
    el.className = 'item';
    el.innerHTML = `<div><strong>${sys.name}</strong><div class="small-muted">${sys.star.name}</div></div>
                    <div style="display:flex;gap:8px;align-items:center">
                      <button data-system="${sys.id}" class="btn">Open</button>
                    </div>`;
    container.appendChild(el);
    el.querySelector('button')?.addEventListener('click', ()=> selectSystem(sys.id));
  });
}

function renderPlanets(systemId){
  const sys = catalog.systems.find(s=>s.id===systemId);
  const list = $('planetsList'); list.innerHTML = '';
  if(!sys) return;
  $('systemTitle').textContent = sys.name;
  sys.planets.forEach(p=>{
    const el = document.createElement('div');
    el.className = 'item';
    el.innerHTML = `<div><strong>${p.name}</strong><div class="small-muted">${p.type} • ${p.orbitalAU} AU</div></div>
                    <div style="display:flex;gap:8px">
                      <button data-planet="${p.id}" class="btn">View</button>
                    </div>`;
    list.appendChild(el);
    el.querySelector('button')?.addEventListener('click', ()=> selectPlanet(sys.id, p.id));
  });
  // render map for the system (if currently selected system)
  if(currentSystem && currentSystem.id === systemId){
    renderMap(sys, currentPlanet);
  } else {
    renderMap(sys, null);
  }
}

function renderDetails(sysId, planetId){
  const sys = catalog.systems.find(s=>s.id===sysId);
  const p = sys?.planets.find(pl=>pl.id===planetId);
  if(!p){ $('planetName').textContent = '—'; $('planetSummary').textContent = ''; return; }
  currentSystem = sys; currentPlanet = p;
  $('planetName').textContent = p.name;
  $('planetSummary').textContent = p.summary || '';
  $('planetType').textContent = p.type;
  $('planetOrbit').textContent = p.orbitalAU + ' AU';
  $('planetRadius').textContent = p.radiusEarth + ' R⊕';
  updateLocationBadge();
  updateFavButton();
  renderMap(sys, p);
}

function updateLocationBadge(){
  const loc = loadLocation();
  const badge = $('locationBadge');
  badge.innerHTML = 'Location: ' + (loc ? `<span class="location-chip">${loc.system}/${loc.planet}</span>` : '—');
}

function updateFavButton(){
  const favs = loadFavs();
  const id = currentPlanet?.id;
  $('favBtn').textContent = favs.includes(id) ? '★ Favorited' : '☆ Favorite';
}

function selectSystem(systemId){
  renderPlanets(systemId);
  history.replaceState({}, '', `?system=${encodeURIComponent(systemId)}`);
}

function selectPlanet(systemId, planetId){
  renderDetails(systemId, planetId);
  history.replaceState({}, '', `?system=${encodeURIComponent(systemId)}&planet=${encodeURIComponent(planetId)}`);
}

function renderMap(sys, highlightedPlanet){
  const svg = $('mapSvg');
  svg.innerHTML = '';
  if(!sys) return;
  const w = 600, h = 160;
  const starX = 60, starY = h/2;
  // draw star
  svg.innerHTML += `<circle class="star" cx="${starX}" cy="${starY}" r="12"></circle>
                    <text x="${starX+18}" y="${starY+4}" fill="#bfe6ff" font-size="10">${escapeHtml(sys.name)}</text>`;
  // planets: map orbitalAU -> x coordinate
  const maxAU = Math.max(...sys.planets.map(pp=>pp.orbitalAU));
  sys.planets.forEach(pl=>{
    const x = starX + 40 + (pl.orbitalAU / (maxAU || 1)) * (w - 160);
    const y = starY;
    const r = Math.max(4, Math.min(12, pl.radiusEarth * 4));
    const fill = (highlightedPlanet && pl.id === highlightedPlanet.id) ? '#6ee7b7' : '#88c2ff';
    const strokeClass = (highlightedPlanet && pl.id === highlightedPlanet.id) ? 'selected-planet' : '';
    svg.innerHTML += `<g class="planet-group" data-id="${pl.id}" data-system="${sys.id}">
      <circle class="planet ${strokeClass}" data-id="${pl.id}" cx="${x}" cy="${y}" r="${r}" fill="${fill}"></circle>
      <text x="${x-12}" y="${y+20}" fill="#9aa6c0" font-size="10">${escapeHtml(pl.name)}</text>
    </g>`;
  });

  // add ship element (single per svg)
  // If there's a saved location, position ship there; otherwise place at star
  const loc = loadLocation();
  const initialPos = getShipInitialPos(svg, sys, loc);
  svg.innerHTML += `<g id="ship" class="ship" transform="translate(${initialPos.x},${initialPos.y})">
      <circle class="ship-core" cx="0" cy="0" r="6"></circle>
      <path class="ship-tail" d="M-8 -3 L-14 0 L-8 3 Z" transform="translate(-2,0)"></path>
    </g>`;

  // attach click handlers to planet elements for quick selection
  svg.querySelectorAll('.planet-group').forEach(g=>{
    g.addEventListener('click', (e)=>{
      const pid = g.getAttribute('data-id');
      const sid = g.getAttribute('data-system');
      selectPlanet(sid, pid);
    });
  });
}

// Determine initial ship position given saved location (if saved location belongs to this system), else star
function getShipInitialPos(svg, sys, loc){
  const w = 600, h = 160;
  const starX = 60, starY = h/2;
  if(loc && loc.system === sys.id){
    const pl = sys.planets.find(p=>p.id === loc.planet);
    if(pl){
      const maxAU = Math.max(...sys.planets.map(pp=>pp.orbitalAU));
      const x = starX + 40 + (pl.orbitalAU / (maxAU || 1)) * (w - 160);
      const y = starY;
      return {x, y};
    }
  }
  return {x: starX, y: starY};
}

// Get planet coordinates in SVG space for a given system and planet id
function getPlanetCoords(sys, planetId){
  const w = 600, h = 160;
  const starX = 60, starY = h/2;
  const pl = sys.planets.find(p=>p.id === planetId);
  if(!pl) return null;
  const maxAU = Math.max(...sys.planets.map(pp=>pp.orbitalAU));
  const x = starX + 40 + (pl.orbitalAU / (maxAU || 1)) * (w - 160);
  const y = starY;
  return {x, y};
}

function animateShipTo(targetX, targetY, onProgress){
  const svg = $('mapSvg');
  const ship = $('ship');
  if(!ship) return Promise.resolve();
  // read current transform
  const transform = ship.getAttribute('transform') || 'translate(0,0)';
  const m = transform.match(/translate\(([-\d.]+),\s*([-\d.]+)\)/);
  const fromX = m ? parseFloat(m[1]) : 0;
  const fromY = m ? parseFloat(m[2]) : 0;
  const duration = 1000;
  const start = performance.now();
  return new Promise(resolve=>{
    function step(now){
      const t = Math.min(1, (now - start) / duration);
      const eased = easeInOutCubic(t);
      const curX = fromX + (targetX - fromX) * eased;
      const curY = fromY + (targetY - fromY) * eased;
      ship.setAttribute('transform', `translate(${curX},${curY})`);
      if(onProgress) onProgress(eased);
      if(t < 1){
        requestAnimationFrame(step);
      } else {
        resolve();
      }
    }
    // add warp visual
    ship.classList.add('warp');
    requestAnimationFrame(step);
    // remove warp after animation
    setTimeout(()=> ship.classList.remove('warp'), duration + 120);
  });
}

function easeInOutCubic(t){ return t<0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2; }

async function travelToCurrent(){
  if(!currentSystem || !currentPlanet) return alert('Pick a planet first');
  const fromLoc = loadLocation();
  const dest = { system: currentSystem.id, planet: currentPlanet.id };
  const state = $('travelState');
  state.textContent = 'Preparing warp drive…';
  state.style.background = 'linear-gradient(90deg, rgba(110,231,183,0.12), rgba(138,43,226,0.08))';
  await delay(600);
  state.textContent = 'Charging…';
  await delay(500);

  // compute target coords relative to map's system (if map currently showing the same system)
  const svg = $('mapSvg');
  const target = getPlanetCoords(currentSystem, currentPlanet.id);
  if(!target){ state.textContent = 'Unable to navigate to target.'; state.style.background=''; return; }

  state.textContent = 'Entering hyperspace…';
  await animateShipTo(target.x, target.y, (p)=>{ state.textContent = `In transit… ${Math.round(p*100)}%`; });
  // arrived
  saveLocation(dest);
  state.textContent = `Arrived at ${dest.system} / ${dest.planet}`;
  setTimeout(()=> state.style.background = '', 700);
  updateLocationBadge();
  renderMap(currentSystem, currentPlanet); // highlight arrival
}

function delay(ms){ return new Promise(res=>setTimeout(res,ms)); }

function toggleFavorite(){
  if(!currentPlanet) return alert('Select a planet first');
  const favs = loadFavs();
  const id = currentPlanet.id;
  if(favs.includes(id)){
    const nxt = favs.filter(x=>x!==id); saveFavs(nxt);
  } else {
    favs.unshift(id); saveFavs(favs.slice(0,50));
  }
  updateFavButton();
  renderFavoritesPanel();
}

function renderFavoritesPanel(){
  const favs = loadFavs();
  $('showFavorites').textContent = `Favorites (${favs.length})`;
}

function shareCurrent(){
  if(!currentPlanet) return alert('Select a planet first');
  const url = `${location.origin}${location.pathname}?system=${encodeURIComponent(currentSystem.id)}&planet=${encodeURIComponent(currentPlanet.id)}`;
  navigator.clipboard?.writeText(url).then(()=> alert('Link copied to clipboard'), ()=> alert('Unable to copy link'));
}

function initFromUrl(){
  const params = new URLSearchParams(location.search);
  const system = params.get('system');
  const planet = params.get('planet');
  if(system){
    renderPlanets(system);
    if(planet) {
      renderDetails(system, planet);
      // Place ship at planet if saved location is this planet
      const loc = loadLocation();
      if(loc && loc.system === system && loc.planet === planet){
        // ensure ship is at correct pos (renderMap handles positioning)
        renderMap(currentSystem, currentPlanet);
      }
    }
  }
}

async function start(){
  await loadCatalog();
  renderSystems();
  renderFavoritesPanel();
  // wire events
  $('search').addEventListener('input', e => renderSystems(e.target.value));
  $('travelBtn').addEventListener('click', travelToCurrent);
  $('favBtn').addEventListener('click', toggleFavorite);
  $('shareBtn').addEventListener('click', shareCurrent);

  // restore last location or URL
  const urlParams = new URLSearchParams(location.search);
  const systemParam = urlParams.get('system');
  const planetParam = urlParams.get('planet');
  const last = loadLocation();
  if(systemParam){
    renderPlanets(systemParam);
    if(planetParam){
      renderDetails(systemParam, planetParam);
    } else {
      renderMap(catalog.systems.find(s=>s.id===systemParam), null);
    }
  } else if(last){
    renderPlanets(last.system);
    renderDetails(last.system, last.planet);
  } else {
    // default open first system
    const first = catalog.systems[0];
    if(first) selectSystem(first.id);
  }
  updateLocationBadge();
}

function escapeHtml(str){ return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

start().catch(err=>{
  console.error(err);
  alert('Failed to load catalog: '+err.message);
});
