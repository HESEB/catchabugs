const GPS_SETTINGS_KEY='catchabugs.menuSettings.v2';
const GPS_STATE_KEY='catchabugs.gps.v1';
function $(s){return document.querySelector(s)}
function safeParse(raw){try{return raw?JSON.parse(raw):null}catch{return null}}
function loadSettings(){return safeParse(localStorage.getItem(GPS_SETTINGS_KEY))||{}}
function saveSettings(settings){localStorage.setItem(GPS_SETTINGS_KEY,JSON.stringify(settings))}
function isMobile(){const ua=navigator.userAgent||'';return /Android|iPhone|iPad|iPod|Mobile/i.test(ua)||(matchMedia('(pointer: coarse)').matches&&innerWidth<=900)}
function toast(message){const node=$('#toast');if(!node)return;node.textContent=message;node.style.display='block';clearTimeout(toast.timer);toast.timer=setTimeout(()=>node.style.display='none',1500)}
function saveGps(data){localStorage.setItem(GPS_STATE_KEY,JSON.stringify({...data,updatedAt:new Date().toISOString()}))}
function loadGps(){return safeParse(localStorage.getItem(GPS_STATE_KEY))||{enabled:false,status:'off'}}
function setEnabled(value){const settings=loadSettings();settings.gpsEnabled=!!value;saveSettings(settings)}
function gameApi(){return window.CATCHABUGS_GAME||null}
function mapGpsToWorld(lat,lng){const baseLat=37.5665,baseLng=126.9780;const scale=90000;return {x:Math.max(-1600,Math.min(1600,(lng-baseLng)*scale)),y:Math.max(-1600,Math.min(1600,(baseLat-lat)*scale))}}
let watchId=null;
function stop(){if(watchId!==null&&navigator.geolocation){navigator.geolocation.clearWatch(watchId);watchId=null}setEnabled(false);saveGps({...loadGps(),enabled:false,status:'off'});document.body.dataset.gps='off';toast('GPS OFF')}
function handlePosition(pos){const lat=pos.coords.latitude,lng=pos.coords.longitude;const acc=pos.coords.accuracy;const world=mapGpsToWorld(lat,lng);saveGps({enabled:true,status:'on',lat,lng,accuracy:acc,world});document.body.dataset.gps='on';const api=gameApi();if(api?.setPlayer)api.setPlayer(world.x,world.y,'GPS 위치 동기화','📍');else{const raw=localStorage.getItem('catchabugs.core.v2');const core=safeParse(raw)||{};core.player={...(core.player||{}),x:world.x,y:world.y,gps:true};localStorage.setItem('catchabugs.core.v2',JSON.stringify(core))}}
function start(){if(!isMobile()){setEnabled(false);toast('GPS는 모바일에서만 사용할 수 있습니다.');return false}if(!navigator.geolocation){setEnabled(false);toast('이 브라우저는 GPS를 지원하지 않습니다.');return false}setEnabled(true);saveGps({...loadGps(),enabled:true,status:'requesting'});navigator.geolocation.getCurrentPosition(handlePosition,(err)=>{saveGps({...loadGps(),enabled:false,status:'denied',error:err.message});setEnabled(false);toast('GPS 권한이 거부되었거나 사용할 수 없습니다.')},{enableHighAccuracy:true,timeout:8000,maximumAge:10000});if(watchId===null){watchId=navigator.geolocation.watchPosition(handlePosition,(err)=>{saveGps({...loadGps(),status:'error',error:err.message})},{enableHighAccuracy:true,timeout:12000,maximumAge:15000})}toast('GPS 권한 요청 중');return true}
function toggle(){const settings=loadSettings();if(settings.gpsEnabled)stop();else start()}
function sync(){const settings=loadSettings();if(settings.gpsEnabled&&watchId===null)start();if(!settings.gpsEnabled&&watchId!==null)stop()}
function label(){const gps=loadGps();if(!isMobile())return '모바일 전용';if(loadSettings().gpsEnabled)return gps.status==='on'?'현재 ON':'권한 확인 중';return '현재 OFF'}
window.CATCHABUGS_GPS={start,stop,toggle,isMobile,label,loadGps};
document.addEventListener('DOMContentLoaded',()=>setTimeout(sync,1200));setTimeout(sync,2200);
