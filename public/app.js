'use strict';

const STORAGE_KEY = 'riderecord:v1';
const GEO_CACHE_KEY = 'riderecord:geocode-cache:v1';
const STATION_CACHE_KEY = 'riderecord:station-cache:v1';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const fmt0 = new Intl.NumberFormat('th-TH', { maximumFractionDigits: 0 });
const fmt1 = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const fmt2 = new Intl.NumberFormat('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const money0 = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', maximumFractionDigits: 0 });
const money2 = new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB', minimumFractionDigits: 2, maximumFractionDigits: 2 });

function localISODate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function currentMonthKey(date = new Date()) { return localISODate(date).slice(0, 7); }
function uid(prefix = 'id') { return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`; }
function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
function safeNum(value, fallback = 0) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }
function esc(value = '') { return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch])); }
function parseDateLocal(s) { const [y,m,d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function formatDate(s) { if (!s) return '-'; return new Intl.DateTimeFormat('th-TH', { day:'numeric', month:'short', year:'2-digit' }).format(parseDateLocal(s)); }
function monthLabel(key) { const [y,m] = key.split('-').map(Number); return new Intl.DateTimeFormat('th-TH', { month:'short' }).format(new Date(y, m-1, 1)); }

function seedState() {
  return {
    version: 1,
    activeVehicleId: 'car_corolla',
    settings: { alertKm: 50 },
    vehicles: [
      { id:'car_corolla', name:'Toyota Corolla', plate:'กท 1234', tankLiters:43 },
      { id:'car_city', name:'Honda City', plate:'ขข 7788', tankLiters:40 }
    ],
    fillups: [
      {id:'f_mar',vehicleId:'car_corolla',date:'2026-03-12',pricePerLiter:34.80,liters:34.0,odometer:22900,distanceSinceLast:470,kmPerL:13.82,costPerKm:2.52,rangeKm:470.0,totalCost:1183.20},
      {id:'f_apr',vehicleId:'car_corolla',date:'2026-04-13',pricePerLiter:35.10,liters:32.4,odometer:23382,distanceSinceLast:482,kmPerL:14.88,costPerKm:2.36,rangeKm:482.0,totalCost:1137.24},
      {id:'f_may',vehicleId:'car_corolla',date:'2026-05-12',pricePerLiter:35.40,liters:33.0,odometer:23890,distanceSinceLast:508,kmPerL:15.39,costPerKm:2.30,rangeKm:508.0,totalCost:1168.20},
      {id:'f_jun',vehicleId:'car_corolla',date:'2026-06-14',pricePerLiter:35.20,liters:34.2,odometer:24415,distanceSinceLast:525,kmPerL:15.35,costPerKm:2.29,rangeKm:525.0,totalCost:1203.84},
      {id:'f_jul',vehicleId:'car_corolla',date:'2026-07-15',pricePerLiter:35.70,liters:31.8,odometer:24905,distanceSinceLast:490,kmPerL:15.41,costPerKm:2.32,rangeKm:490.0,totalCost:1135.26},
      {id:'f_aug',vehicleId:'car_corolla',date:'2026-08-18',pricePerLiter:35.90,liters:33.4,odometer:25420,distanceSinceLast:515,kmPerL:15.42,costPerKm:2.33,rangeKm:515.0,totalCost:1199.06},
      {id:'f_sep1',vehicleId:'car_corolla',date:'2026-09-03',pricePerLiter:35.80,liters:31.6,odometer:25908,distanceSinceLast:488,kmPerL:15.44,costPerKm:2.32,rangeKm:488.0,totalCost:1131.28},
      {id:'f_sep2',vehicleId:'car_corolla',date:'2026-09-25',pricePerLiter:36.50,liters:30.6,odometer:26381,distanceSinceLast:473,kmPerL:15.46,costPerKm:2.36,rangeKm:473.0,totalCost:1116.90}
    ],
    trips: [
      {id:'t1',vehicleId:'car_corolla',date:'2026-09-24',from:'กรุงเทพฯ',to:'พัทยา',distanceKm:118,estimatedLiters:7.63,estimatedCost:278.40},
      {id:'t2',vehicleId:'car_corolla',date:'2026-09-18',from:'กรุงเทพฯ',to:'อยุธยา',distanceKm:76,estimatedLiters:4.92,estimatedCost:179.60},
      {id:'t3',vehicleId:'car_corolla',date:'2026-09-08',from:'บ้าน',to:'ที่ทำงาน',distanceKm:28,estimatedLiters:1.81,estimatedCost:66.20}
    ]
  };
}

function normalizeState(input) {
  const base = seedState();
  return {
    version: 1,
    activeVehicleId: input?.activeVehicleId || input?.vehicles?.[0]?.id || base.activeVehicleId,
    settings: { ...base.settings, ...(input?.settings || {}) },
    vehicles: Array.isArray(input?.vehicles) && input.vehicles.length ? input.vehicles : base.vehicles,
    fillups: Array.isArray(input?.fillups) ? input.fillups : [],
    trips: Array.isArray(input?.trips) ? input.trips : []
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = migrateLegacyState() || seedState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return normalizeState(JSON.parse(raw));
  } catch (err) {
    console.warn('State load failed', err);
    return seedState();
  }
}
// Keep the original storage entries intact so the previous app can be restored.
function migrateLegacyState() {
  const oldVehicles = JSON.parse(localStorage.getItem('vehicles') || '[]');
  const oldRecords = JSON.parse(localStorage.getItem('fuelRecords') || '[]');
  if (!Array.isArray(oldVehicles) || !Array.isArray(oldRecords)) return null;
  const names = [...new Set([...oldVehicles, ...oldRecords.map(r => r.vehicle)].filter(n => typeof n === 'string' && n.trim()))];
  if (!names.length) return null;
  const migrated = {
    version: 1, activeVehicleId: 'legacy_car_0', settings: { alertKm: 50 },
    vehicles: names.map((name, i) => ({ id: `legacy_car_${i}`, name, plate: '', tankLiters: 45 })),
    fillups: [], trips: []
  };
  names.forEach((name, i) => {
    let prev = null;
    oldRecords.filter(r => r.vehicle === name)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)) || Number(a.odometer) - Number(b.odometer))
      .forEach((r, j) => {
        const liters = Number(r.liters), pricePerLiter = Number(r.price), odometer = Number(r.odometer);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(r.date) || ![liters, pricePerLiter, odometer].every(Number.isFinite) || liters <= 0 || pricePerLiter <= 0 || odometer < 0) throw new Error('Cannot safely migrate legacy fuel data');
        const distanceSinceLast = prev ? Math.max(0, odometer - prev.odometer) : 0;
        const totalCost = pricePerLiter * liters;
        migrated.fillups.push({ id: `legacy_fuel_${i}_${j}`, vehicleId: `legacy_car_${i}`, date: r.date,
          liters, pricePerLiter, odometer, totalCost, distanceSinceLast,
          kmPerL: distanceSinceLast / liters, costPerKm: distanceSinceLast ? totalCost / distanceSinceLast : 0,
          rangeKm: distanceSinceLast });
        prev = { odometer };
      });
  });
  return migrated;
}
let state = loadState();
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

function getVehicle(id = state.activeVehicleId) { return state.vehicles.find(v => v.id === id) || state.vehicles[0]; }
function vehicleFillups(vehicleId) { return state.fillups.filter(f => f.vehicleId === vehicleId).sort((a,b) => a.date.localeCompare(b.date) || a.odometer - b.odometer); }
function latestFillup(vehicleId = state.activeVehicleId) { return vehicleFillups(vehicleId).at(-1) || null; }
function previousFillup(vehicleId, beforeDate, beforeOdo) {
  return vehicleFillups(vehicleId).filter(f => f.date <= beforeDate && f.odometer < beforeOdo).at(-1) || null;
}
function fillupsForMonth(month, vehicleId = state.activeVehicleId) { return state.fillups.filter(f => f.vehicleId === vehicleId && f.date.startsWith(month)); }
function tripsForMonth(month, vehicleId = state.activeVehicleId) { return state.trips.filter(t => t.vehicleId === vehicleId && t.date.startsWith(month)); }
function average(list, field) { const valid = list.map(x => safeNum(x[field], NaN)).filter(Number.isFinite); return valid.length ? valid.reduce((a,b)=>a+b,0)/valid.length : 0; }

function metric(icon, value, label, delta='') {
  return `<article class="metric"><span class="metric-icon">${icon}</span>${delta ? `<span class="delta">${esc(delta)}</span>`:''}<strong>${value}</strong><small>${label}</small></article>`;
}
function mini(value, label) { return `<div class="mini"><strong>${value}</strong><small>${label}</small></div>`; }
function toast(message) {
  const el = $('#toast'); el.textContent = message; el.classList.add('show');
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('show'), 2600);
}

function populateVehicleSelects() {
  const options = state.vehicles.map(v => `<option value="${esc(v.id)}">${esc(v.name)}${v.plate ? ` · ${esc(v.plate)}` : ''}</option>`).join('');
  ['#homeCarSelect','#fuelCar'].forEach(sel => { const el=$(sel); if(el){ el.innerHTML=options; el.value=state.activeVehicleId; } });
}

function setActiveVehicle(id) {
  if (!state.vehicles.some(v => v.id === id)) return;
  state.activeVehicleId = id; saveState(); populateVehicleSelects(); renderAll();
}

function renderHome() {
  const vehicle = getVehicle();
  const latest = latestFillup();
  const month = currentMonthKey();
  const monthFillups = fillupsForMonth(month);
  const monthTrips = tripsForMonth(month);
  const spend = monthFillups.reduce((sum,f)=>sum+safeNum(f.totalCost),0);
  const distance = monthFillups.reduce((sum,f)=>sum+safeNum(f.distanceSinceLast),0);
  const kmpl = average(monthFillups,'kmPerL') || safeNum(latest?.kmPerL);
  const range = latest ? safeNum(latest.kmPerL) * Math.min(safeNum(latest.liters), safeNum(vehicle?.tankLiters, latest.liters)) : 0;
  $('#homeMetrics').innerHTML = [
    metric('💧', latest?.kmPerL ? `${fmt1.format(latest.kmPerL)} km/l` : '—', 'อัตราสิ้นเปลือง'),
    metric('◫', latest?.costPerKm ? `${money2.format(latest.costPerKm)}/km` : '—', 'ค่าใช้จ่ายต่อ km'),
    metric('➤', range ? `${fmt0.format(range)} km` : '—', 'ระยะทางที่วิ่งได้'),
    metric('▣', latest ? formatDate(latest.date) : '—', 'เติมน้ำมันล่าสุด')
  ].join('');
  $('#homeMonthly').innerHTML = [
    mini(money0.format(spend),'ค่าน้ำมัน'),
    mini(`${fmt0.format(distance)} km`,'ระยะทาง'),
    mini(kmpl ? `${fmt1.format(kmpl)} km/l`:'—','เฉลี่ย km/l'),
    mini(fmt0.format(monthTrips.length),'ทริป')
  ].join('');
  $('#todayText').textContent = new Intl.DateTimeFormat('th-TH',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date());
}

function computeFillup({vehicleId, pricePerLiter, liters, odometer, date}) {
  const prev = previousFillup(vehicleId, date, odometer);
  const distance = prev ? odometer - safeNum(prev.odometer) : 0;
  const kmPerL = distance > 0 && liters > 0 ? distance / liters : 0;
  const totalCost = pricePerLiter * liters;
  const costPerKm = distance > 0 ? totalCost / distance : 0;
  const rangeKm = kmPerL > 0 ? kmPerL * liters : 0;
  return { prev, distance, kmPerL, totalCost, costPerKm, rangeKm };
}

function renderFuel() {
  const latest = latestFillup();
  if (latest) {
    $('#fuelResults').innerHTML = [
      metric('💧', latest.kmPerL ? `${fmt1.format(latest.kmPerL)} km/l` : 'รอข้อมูล', 'อัตราสิ้นเปลือง'),
      metric('◫', latest.costPerKm ? `${money2.format(latest.costPerKm)}/km` : 'รอข้อมูล', 'ค่าใช้จ่ายต่อ km'),
      metric('⛽', `${fmt2.format(latest.liters)} L`, 'ปริมาณน้ำมันที่เติม'),
      metric('➤', latest.rangeKm ? `${fmt0.format(latest.rangeKm)} km` : 'รอข้อมูล', 'ระยะทางที่วิ่งได้')
    ].join('');
    $('#fuelInsight').textContent = latest.kmPerL ? `ครั้งล่าสุดวิ่ง ${fmt0.format(latest.distanceSinceLast)} km ก่อนเติม ${fmt2.format(latest.liters)} L เฉลี่ย ${fmt1.format(latest.kmPerL)} km/l` : 'รายการแรกใช้เป็นฐานเลขไมล์ รายการถัดไปจึงคำนวณ km/l ได้';
  } else {
    $('#fuelResults').innerHTML = [metric('💧','—','อัตราสิ้นเปลือง'),metric('◫','—','ค่าใช้จ่ายต่อ km'),metric('⛽','—','ปริมาณน้ำมันที่เติม'),metric('➤','—','ระยะทางที่วิ่งได้')].join('');
  }
  const list = vehicleFillups(state.activeVehicleId).slice().reverse().slice(0,8);
  $('#fuelHistory').innerHTML = list.length ? list.map(f => `<div class="list-item"><div class="list-icon">⛽</div><div class="list-copy"><strong>${formatDate(f.date)} · ${fmt2.format(f.liters)} L</strong><small>เลขไมล์ ${fmt0.format(f.odometer)} km${f.kmPerL ? ` · ${fmt1.format(f.kmPerL)} km/l` : ''}</small></div><div class="list-side"><strong>${money0.format(f.totalCost)}</strong><small>${f.costPerKm ? `${money2.format(f.costPerKm)}/km` : 'ฐานข้อมูล'}</small></div></div>`).join('') : '<div class="empty">ยังไม่มีรายการเติมน้ำมัน</div>';
}

function handleFuelSubmit(event) {
  event.preventDefault();
  const vehicleId = $('#fuelCar').value;
  const pricePerLiter = safeNum($('#fuelPrice').value);
  const liters = safeNum($('#fuelLiters').value);
  const odometer = safeNum($('#fuelOdometer').value);
  const date = $('#fuelDate').value;
  if (!vehicleId || pricePerLiter <= 0 || liters <= 0 || odometer <= 0 || !date) return toast('กรอกข้อมูลให้ครบก่อนบันทึก');
  const last = vehicleFillups(vehicleId).at(-1);
  if (last && odometer <= safeNum(last.odometer) && date >= last.date) return toast('เลขไมล์ต้องมากกว่ารายการล่าสุด');
  const calc = computeFillup({vehicleId,pricePerLiter,liters,odometer,date});
  const entry = { id:uid('fuel'), vehicleId, date, pricePerLiter, liters, odometer, distanceSinceLast:calc.distance, kmPerL:calc.kmPerL, costPerKm:calc.costPerKm, rangeKm:calc.rangeKm, totalCost:calc.totalCost };
  state.fillups.push(entry); state.activeVehicleId = vehicleId; saveState();
  $('#saveStatus').textContent = 'บันทึกแล้ว';
  $('#fuelForm').reset(); $('#fuelDate').value = localISODate(); populateVehicleSelects(); renderAll();
  toast(calc.prev ? 'คำนวณและบันทึกเรียบร้อย' : 'บันทึกรายการฐานแล้ว ครั้งถัดไปจะคำนวณ km/l ได้');
}

function renderSummary() {
  const month = $('#summaryMonth').value || currentMonthKey();
  const fills = fillupsForMonth(month); const trips = tripsForMonth(month);
  const spend = fills.reduce((s,f)=>s+safeNum(f.totalCost),0);
  const distance = fills.reduce((s,f)=>s+safeNum(f.distanceSinceLast),0);
  const avgKmpl = average(fills,'kmPerL');
  const avgCostKm = average(fills.filter(f=>f.costPerKm),'costPerKm');
  $('#summaryMetrics').innerHTML = [
    metric('◫',money0.format(spend),'ค่าใช้จ่ายน้ำมัน'),
    metric('➤',`${fmt0.format(distance)} km`,'ระยะทางจากรอบเติม'),
    metric('💧',avgKmpl ? `${fmt1.format(avgKmpl)} km/l`:'—','อัตราสิ้นเปลืองเฉลี่ย'),
    metric('฿',avgCostKm ? `${money2.format(avgCostKm)}/km`:'—','ค่าใช้จ่ายเฉลี่ยต่อ km')
  ].join('');

  const [y,m] = month.split('-').map(Number); const months=[];
  for(let i=5;i>=0;i--){ const d=new Date(y,m-1-i,1); months.push(currentMonthKey(d)); }
  const values=months.map(k=>fillupsForMonth(k).reduce((s,f)=>s+safeNum(f.totalCost),0));
  const max=Math.max(...values,1);
  $('#spendingChart').innerHTML = months.map((k,i)=>`<div class="bar-col"><div class="bar" style="height:${Math.max(4,(values[i]/max)*88)}%">${values[i] ? `<span class="bar-value">${fmt0.format(values[i])}</span>`:''}</div><small>${monthLabel(k)}</small></div>`).join('');

  const tripList = state.trips.filter(t=>t.vehicleId===state.activeVehicleId).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8);
  $('#tripHistory').innerHTML = tripList.length ? tripList.map(t=>`<div class="list-item"><div class="list-icon">➤</div><div class="list-copy"><strong>${esc(t.from)} → ${esc(t.to)}</strong><small>${formatDate(t.date)} · ${fmt0.format(t.distanceKm)} km</small></div><div class="list-side"><strong>${fmt1.format(t.estimatedLiters)} L</strong><small>${money0.format(t.estimatedCost)}</small></div></div>`).join('') : '<div class="empty">ยังไม่มีทริปที่บันทึก</div>';
}

function renderVehicles() {
  $('#vehicleList').innerHTML = state.vehicles.map(v => {
    const active = v.id === state.activeVehicleId;
    return `<div class="list-item"><div class="list-icon">🚙</div><div class="list-copy"><strong>${esc(v.name)}${active?' · กำลังใช้':''}</strong><small>${esc(v.plate || 'ไม่มีทะเบียน')} · ถัง ${fmt0.format(v.tankLiters)} L</small></div><div class="list-side"><button class="text-btn" data-setcar="${esc(v.id)}">เลือก</button>${state.vehicles.length>1?`<button class="text-btn" data-delcar="${esc(v.id)}" style="color:#d52e62">ลบ</button>`:''}</div></div>`;
  }).join('');
}

function renderAll() {
  populateVehicleSelects(); renderHome(); renderFuel(); renderSummary(); renderVehicles(); renderTripEstimate();
}

function switchPage(name) {
  $$('.page').forEach(p=>p.classList.toggle('active',p.dataset.page===name));
  $$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.target===name));
  window.scrollTo({top:0,behavior:'smooth'});
  if(name==='trip') setTimeout(()=>{ initMap(); map?.invalidateSize(); },60);
  if(name==='summary') renderSummary();
}

// ----- Trip planner / free map stack -----
let map = null;
let originMarker = null;
let destinationMarker = null;
let routeLayer = null;
let stationLayer = null;
let origin = {lat:13.7563,lng:100.5018,label:'กรุงเทพฯ'};
let destination = {lat:12.9236,lng:100.8825,label:'พัทยา'};
let routeInfo = {distanceKm:118,durationMin:105,coords:[]};
let lastStationFetch = 0;
let lastGeocodeFetch = 0;

function initMap() {
  if (map || typeof L === 'undefined') return;
  map = L.map('map',{zoomControl:true}).setView([13.35,100.68],8);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom:19,
    attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap contributors</a>'
  }).addTo(map);
  originMarker = L.marker([origin.lat,origin.lng]).addTo(map).bindPopup('จุดเริ่มต้น');
  destinationMarker = L.marker([destination.lat,destination.lng]).addTo(map).bindPopup('ปลายทาง');
  stationLayer = L.layerGroup().addTo(map);
  map.on('click', e => {
    destination = {lat:e.latlng.lat,lng:e.latlng.lng,label:`${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`};
    $('#destinationLabel').textContent = destination.label;
    destinationMarker.setLatLng([destination.lat,destination.lng]);
    calculateRoute(true);
  });
  calculateRoute(true);
}

async function calculateRoute(findStations = false) {
  if (!map) return;
  const url = `https://router.project-osrm.org/route/v1/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}?overview=full&geometries=geojson&steps=false`;
  try {
    $('#routeBadge').textContent = 'กำลังคำนวณเส้นทาง…';
    const res = await fetch(url, {headers:{'Accept':'application/json'}});
    if (!res.ok) throw new Error(`OSRM ${res.status}`);
    const data = await res.json();
    const route = data.routes?.[0]; if(!route) throw new Error('No route');
    routeInfo.distanceKm = route.distance/1000; routeInfo.durationMin=route.duration/60;
    routeInfo.coords = route.geometry.coordinates.map(([lng,lat])=>[lat,lng]);
    if(routeLayer) map.removeLayer(routeLayer);
    routeLayer = L.polyline(routeInfo.coords,{color:'#1678ff',weight:6,opacity:.86,lineCap:'round'}).addTo(map);
    originMarker.setLatLng([origin.lat,origin.lng]); destinationMarker.setLatLng([destination.lat,destination.lng]);
    map.fitBounds(routeLayer.getBounds().pad(.12),{padding:[20,20]});
    $('#routeBadge').textContent = `${fmt0.format(routeInfo.distanceKm)} km · ${formatDuration(routeInfo.durationMin)}`;
    renderTripEstimate();
    if(findStations) setTimeout(()=>findFuelStations(false),250);
  } catch(err) {
    console.warn(err);
    const km = haversine(origin.lat,origin.lng,destination.lat,destination.lng);
    routeInfo = {distanceKm:km,durationMin:km/60*60,coords:[[origin.lat,origin.lng],[destination.lat,destination.lng]]};
    if(routeLayer) map.removeLayer(routeLayer);
    routeLayer=L.polyline(routeInfo.coords,{color:'#1678ff',weight:5,dashArray:'8 8'}).addTo(map);
    map.fitBounds(routeLayer.getBounds().pad(.18));
    $('#routeBadge').textContent = `${fmt0.format(km)} km · เส้นตรง (สำรอง)`;
    renderTripEstimate(); toast('เซิร์ฟเวอร์เส้นทางไม่ตอบสนอง ใช้ระยะเส้นตรงชั่วคราว');
  }
}
function formatDuration(min){ const m=Math.round(min); const h=Math.floor(m/60); const r=m%60; return h?`${h} ชม. ${r} นาที`:`${r} นาที`; }
function haversine(lat1,lon1,lat2,lon2){const R=6371,dLat=(lat2-lat1)*Math.PI/180,dLon=(lon2-lon1)*Math.PI/180,a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.sqrt(a));}

function renderTripEstimate(){
  const latest=latestFillup(); const kmpl=safeNum(latest?.kmPerL,15); const price=safeNum(latest?.pricePerLiter,36);
  const liters=routeInfo.distanceKm/kmpl; const cost=liters*price;
  const el=$('#tripEstimate'); if(!el)return;
  el.innerHTML=[mini(`${fmt1.format(liters)} L`,'น้ำมันโดยประมาณ'),mini(money0.format(cost),'ค่าใช้จ่ายโดยประมาณ'),mini(`${fmt0.format(routeInfo.distanceKm)} km`,'ระยะทาง'),mini(`${state.settings.alertKm} km`,'ระยะเตือนเติมน้ำมัน')].join('');
}

function stationCacheKey(){ return `${origin.lat.toFixed(2)},${origin.lng.toFixed(2)}:${destination.lat.toFixed(2)},${destination.lng.toFixed(2)}`; }
function loadStationCache(){ try{return JSON.parse(localStorage.getItem(STATION_CACHE_KEY)||'{}')}catch{return {}} }
function saveStationCache(c){localStorage.setItem(STATION_CACHE_KEY,JSON.stringify(c));}
async function findFuelStations(force=false){
  if(!routeInfo.coords.length) return;
  const cache=loadStationCache(),key=stationCacheKey(),cached=cache[key];
  if(!force && cached && Date.now()-cached.at<10*60*1000){ renderStations(cached.items); return; }
  if(force && Date.now()-lastStationFetch<30000){ toast('เว้นอย่างน้อย 30 วินาทีก่อนค้นหาปั๊มใหม่'); return; }
  lastStationFetch=Date.now(); $('#stationList').innerHTML='<div class="empty">กำลังค้นหาปั๊มน้ำมัน…</div>';
  const coords=routeInfo.coords; const sampleIndexes=[0,Math.floor(coords.length*.33),Math.floor(coords.length*.66),coords.length-1];
  const samples=[...new Set(sampleIndexes)].map(i=>coords[clamp(i,0,coords.length-1)]);
  const pieces=samples.map(([lat,lng])=>`nwr["amenity"="fuel"](around:6000,${lat.toFixed(5)},${lng.toFixed(5)});`).join('');
  const query=`[out:json][timeout:12];(${pieces});out center tags 80;`;
  try{
    const res=await fetch('https://overpass-api.de/api/interpreter',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8'},body:'data='+encodeURIComponent(query)});
    if(!res.ok) throw new Error(`Overpass ${res.status}`);
    const data=await res.json();
    const sampledRoute=coords.filter((_,i)=>i%Math.max(1,Math.floor(coords.length/120))===0);
    const seen=new Set();
    const items=(data.elements||[]).map(el=>{
      const lat=el.lat??el.center?.lat,lng=el.lon??el.center?.lon;if(!Number.isFinite(lat)||!Number.isFinite(lng))return null;
      const unique=`${lat.toFixed(5)},${lng.toFixed(5)}`; if(seen.has(unique))return null; seen.add(unique);
      let nearest=Infinity,idx=0; sampledRoute.forEach((p,i)=>{const d=haversine(lat,lng,p[0],p[1]);if(d<nearest){nearest=d;idx=i;}});
      const progress=sampledRoute.length>1?idx/(sampledRoute.length-1):0;
      return {lat,lng,name:el.tags?.name||el.tags?.brand||'ปั๊มน้ำมัน',brand:el.tags?.brand||'',distanceToRoute:nearest,routeKm:routeInfo.distanceKm*progress};
    }).filter(Boolean).filter(x=>x.distanceToRoute<=6).sort((a,b)=>a.routeKm-b.routeKm).slice(0,8);
    cache[key]={at:Date.now(),items}; saveStationCache(cache); renderStations(items);
  }catch(err){console.warn(err);$('#stationList').innerHTML='<div class="empty">ค้นหาปั๊มไม่สำเร็จ ลองใหม่ภายหลัง</div>';}
}
function renderStations(items){
  stationLayer?.clearLayers();
  if(!items.length){$('#stationList').innerHTML='<div class="empty">ไม่พบปั๊มในระยะประมาณ 6 km จากเส้นทาง</div>';return;}
  $('#stationList').innerHTML=items.map((s,i)=>`<button class="list-item" data-station="${i}" style="width:100%;text-align:left;border:none"><div class="list-icon">⛽</div><div class="list-copy"><strong>${esc(s.name)}</strong><small>ใกล้เส้นทาง ${fmt1.format(s.distanceToRoute)} km</small></div><div class="list-side"><strong>≈ ${fmt0.format(s.routeKm)} km</strong><small>จากจุดเริ่มต้น</small></div></button>`).join('');
  items.forEach(s=>L.marker([s.lat,s.lng]).addTo(stationLayer).bindPopup(`${esc(s.name)}<br>ใกล้เส้นทาง ${fmt1.format(s.distanceToRoute)} km`));
  $$('#stationList [data-station]').forEach((b,i)=>b.addEventListener('click',()=>{map.setView([items[i].lat,items[i].lng],15);stationLayer.getLayers()[i]?.openPopup();}));
}

async function searchDestination(){
  const q=$('#placeSearch').value.trim(); if(!q)return;
  if(Date.now()-lastGeocodeFetch<1100){toast('รอสักครู่ก่อนค้นหาอีกครั้ง');return;}
  lastGeocodeFetch=Date.now();
  const cache=(()=>{try{return JSON.parse(localStorage.getItem(GEO_CACHE_KEY)||'{}')}catch{return {}}})();
  const ck=q.toLowerCase(); if(cache[ck]&&Date.now()-cache[ck].at<7*24*3600*1000){return renderSearchResults(cache[ck].items);}
  $('#searchResults').innerHTML='<div class="empty">กำลังค้นหา…</div>';
  try{
    const url=`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=th&accept-language=th&q=${encodeURIComponent(q)}`;
    const res=await fetch(url,{headers:{'Accept':'application/json'}}); if(!res.ok)throw new Error(`Nominatim ${res.status}`);
    const items=(await res.json()).map(x=>({lat:Number(x.lat),lng:Number(x.lon),label:x.display_name}));
    cache[ck]={at:Date.now(),items}; localStorage.setItem(GEO_CACHE_KEY,JSON.stringify(cache)); renderSearchResults(items);
  }catch(err){console.warn(err);$('#searchResults').innerHTML='<div class="empty">ค้นหาสถานที่ไม่สำเร็จ</div>';}
}
function renderSearchResults(items){
  $('#searchResults').innerHTML=items.length?items.map((x,i)=>`<button class="search-choice" data-place="${i}"><strong>${esc(x.label.split(',')[0])}</strong><small>${esc(x.label)}</small></button>`).join(''):'<div class="empty">ไม่พบสถานที่</div>';
  $$('#searchResults [data-place]').forEach((b,i)=>b.addEventListener('click',()=>{const x=items[i];destination={lat:x.lat,lng:x.lng,label:x.label.split(',')[0]};$('#destinationLabel').textContent=destination.label;destinationMarker?.setLatLng([x.lat,x.lng]);$('#searchResults').innerHTML='';calculateRoute(true);}));
}

function useCurrentGps(){
  if(!navigator.geolocation)return toast('อุปกรณ์นี้ไม่รองรับ GPS');
  $('#originLabel').textContent='กำลังหาตำแหน่ง…';
  navigator.geolocation.getCurrentPosition(pos=>{origin={lat:pos.coords.latitude,lng:pos.coords.longitude,label:'ตำแหน่งปัจจุบัน'};$('#originLabel').textContent='ตำแหน่งปัจจุบัน';originMarker?.setLatLng([origin.lat,origin.lng]);calculateRoute(true);},err=>{console.warn(err);$('#originLabel').textContent=origin.label;toast('ไม่สามารถใช้ GPS ได้ กรุณาอนุญาต Location ให้ Safari');},{enableHighAccuracy:true,timeout:10000,maximumAge:60000});
}

function saveCurrentTrip(){
  const latest=latestFillup(); const kmpl=safeNum(latest?.kmPerL,15);const price=safeNum(latest?.pricePerLiter,36);const liters=routeInfo.distanceKm/kmpl;
  state.trips.push({id:uid('trip'),vehicleId:state.activeVehicleId,date:localISODate(),from:origin.label,to:destination.label,distanceKm:routeInfo.distanceKm,estimatedLiters:liters,estimatedCost:liters*price});saveState();renderAll();toast('บันทึกทริปแล้ว');
}

// ----- Vehicles, backup, PWA -----
function addVehicle(event){
  event.preventDefault(); const name=$('#vehicleName').value.trim(),plate=$('#vehiclePlate').value.trim(),tank=safeNum($('#vehicleTank').value);
  if(!name||tank<=0)return toast('กรอกชื่อรถและความจุถัง');
  const id=uid('car');state.vehicles.push({id,name,plate,tankLiters:tank});state.activeVehicleId=id;saveState();event.currentTarget.reset();renderAll();toast('เพิ่มรถแล้ว');
}
function deleteVehicle(id){
  if(state.vehicles.length<=1)return toast('ต้องมีรถอย่างน้อย 1 คัน');
  const v=getVehicle(id); if(!confirm(`ลบ ${v?.name || 'รถคันนี้'} และข้อมูลที่เกี่ยวข้องทั้งหมด?`))return;
  state.vehicles=state.vehicles.filter(x=>x.id!==id);state.fillups=state.fillups.filter(x=>x.vehicleId!==id);state.trips=state.trips.filter(x=>x.vehicleId!==id);if(state.activeVehicleId===id)state.activeVehicleId=state.vehicles[0].id;saveState();renderAll();toast('ลบรถแล้ว');
}
function exportData(){
  const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`RideRecord-backup-${localISODate()}.json`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('สร้างไฟล์สำรองแล้ว');
}
async function importData(file){
  if(!file)return;try{const parsed=JSON.parse(await file.text());if(!Array.isArray(parsed.vehicles)||!Array.isArray(parsed.fillups)||!Array.isArray(parsed.trips))throw new Error('Invalid backup');state=normalizeState(parsed);saveState();renderAll();toast('นำเข้าข้อมูลเรียบร้อย');}catch(err){console.warn(err);toast('ไฟล์สำรองไม่ถูกต้อง');}
}
function resetData(){if(!confirm('ล้างข้อมูล RideRecord ทั้งหมดในเครื่องนี้?'))return;state={version:1,activeVehicleId:'car_main',settings:{alertKm:50},vehicles:[{id:'car_main',name:'รถของฉัน',plate:'',tankLiters:45}],fillups:[],trips:[]};saveState();renderAll();toast('ล้างข้อมูลแล้ว');}

let deferredInstallPrompt=null;
function installApp(){
  if(deferredInstallPrompt){deferredInstallPrompt.prompt();deferredInstallPrompt.userChoice.finally(()=>{deferredInstallPrompt=null;});}
  else toast('iPhone: Safari → Share → Add to Home Screen');
}

function bindEvents(){
  $$('.nav-item').forEach(b=>b.addEventListener('click',()=>switchPage(b.dataset.target)));
  $$('[data-go]').forEach(b=>b.addEventListener('click',()=>switchPage(b.dataset.go)));
  $('#homeCarSelect').addEventListener('change',e=>setActiveVehicle(e.target.value));
  $('#fuelCar').addEventListener('change',e=>setActiveVehicle(e.target.value));
  $('#fuelForm').addEventListener('submit',handleFuelSubmit);
  $('#summaryMonth').addEventListener('change',renderSummary);
  $('#alertRange').addEventListener('input',e=>{$('#alertValue').textContent=`${e.target.value} km`;state.settings.alertKm=safeNum(e.target.value,50);saveState();renderTripEstimate();});
  $('#useGps').addEventListener('click',useCurrentGps);
  $('#searchPlace').addEventListener('click',searchDestination);
  $('#placeSearch').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();searchDestination();}});
  $('#refreshStations').addEventListener('click',()=>findFuelStations(true));
  $('#saveTrip').addEventListener('click',saveCurrentTrip);
  $('#vehicleForm').addEventListener('submit',addVehicle);
  $('#vehicleList').addEventListener('click',e=>{const set=e.target.closest('[data-setcar]'),del=e.target.closest('[data-delcar]');if(set)setActiveVehicle(set.dataset.setcar);if(del)deleteVehicle(del.dataset.delcar);});
  $('#exportData').addEventListener('click',exportData);
  $('#importData').addEventListener('change',e=>importData(e.target.files?.[0]));
  $('#resetData').addEventListener('click',resetData);
  $('#installButton').addEventListener('click',installApp);$('#installFromSettings').addEventListener('click',installApp);
  window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;$('#installHelp').textContent='อุปกรณ์นี้พร้อมติดตั้ง RideRecord เป็นแอป';});
}

function boot(){
  $('#fuelDate').value=localISODate();$('#summaryMonth').value=currentMonthKey();$('#alertRange').value=state.settings.alertKm;$('#alertValue').textContent=`${state.settings.alertKm} km`;
  bindEvents();renderAll();
  if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.warn));}
}

document.addEventListener('DOMContentLoaded',boot);
