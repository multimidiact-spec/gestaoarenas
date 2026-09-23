export default function(component){
 const host=component.parentElement;
 if(host.__arenaReceive){host.__arenaReceive(component.data.reply);return;}

const SHARED_BOOTSTRAP = component.data.bootstrap;
const callbacks = new Map();
function request(action, payload, success, failure){
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
  callbacks.set(id, {success, failure});
  component.setTriggerValue('request', {id, action, ...payload});
}
function makeLocalRun(success=()=>{},failure=()=>{}){
 return {
  withSuccessHandler(fn){return makeLocalRun(fn,failure)},
  withFailureHandler(fn){return makeLocalRun(success,fn)},
  saveSharedState(json,expectedRevision){
    try{request('save',{state:JSON.parse(json),expectedRevision},success,failure)}
    catch(error){failure(error)}
  },
  getSharedRevision(){request('revision',{},success,failure)}
 }
}
const google={script:{run:makeLocalRun()}};
host.__arenaReceive=(reply)=>{
 if(!reply || !callbacks.has(reply.id))return;
 const callback=callbacks.get(reply.id);
 callbacks.delete(reply.id);
 if(reply.ok)callback.success(reply.result);
 else callback.failure(new Error(reply.error||'Não foi possível salvar na base de teste.'));
};
const KEY='ctpb_gestao_arenas_v36';
const dayNames=['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado'];
const dayShort=['DOM','SEG','TER','QUA','QUI','SEX','SÁB'];
const DEFAULT={arenas:[
{id:'volei_sentado',name:'Voleibol Sentado',resources:['Quadra 1','Quadra 2'],resourceCaps:{'Quadra 1':1,'Quadra 2':1},openTime:'07:00',closeTime:'21:00'},
{id:'rugby_cr',name:'Rugby em CR',resources:['Quadra'],resourceCaps:{'Quadra':1},openTime:'07:00',closeTime:'21:00'},
{id:'basquete_cr',name:'Basquete em CR',resources:['Quadra'],resourceCaps:{'Quadra':1},openTime:'07:00',closeTime:'21:00'},
{id:'multiuso',name:'Arena Multiuso',resources:['Quadra'],resourceCaps:{'Quadra':1},openTime:'07:00',closeTime:'21:00'},
{id:'futebol_cegos',name:'Futebol de Cegos',resources:['Quadra'],resourceCaps:{'Quadra':1},openTime:'07:00',closeTime:'21:00'},
{id:'dojo',name:'Dojo',resources:['Área de Luta 1','Área de Luta 2'],resourceCaps:{'Área de Luta 1':1,'Área de Luta 2':1},openTime:'07:00',closeTime:'21:00'},
{id:'esgrima',name:'Esgrima',resources:['Sala'],resourceCaps:{'Sala':1},openTime:'07:00',closeTime:'21:00'},
{id:'goalball',name:'Goalball',resources:['Quadra'],resourceCaps:{'Quadra':1},openTime:'07:00',closeTime:'21:00'},
{id:'guggenheim',name:'Guggenheim',resources:['Andar'],resourceCaps:{'Andar':1},openTime:'07:00',closeTime:'21:00'},
{id:'tenis_cr',name:'Tênis em CR',resources:['Quadra 1','Quadra 2'],resourceCaps:{'Quadra 1':1,'Quadra 2':1},openTime:'07:00',closeTime:'21:00'},
{id:'piscina_50',name:'Piscina 50 m',resources:['Raia 0','Raia 1','Raia 2','Raia 3','Raia 4','Raia 5','Raia 6','Raia 7','Raia 8','Raia 9'],resourceCaps:{'Raia 0':1,'Raia 1':1,'Raia 2':1,'Raia 3':1,'Raia 4':1,'Raia 5':1,'Raia 6':1,'Raia 7':1,'Raia 8':1,'Raia 9':1},openTime:'07:00',closeTime:'21:00'},
{id:'piscina_25',name:'Piscina 25 m',resources:['Raia 1','Raia 2','Raia 3','Raia 4','Raia 5'],resourceCaps:{'Raia 1':1,'Raia 2':1,'Raia 3':1,'Raia 4':1,'Raia 5':1},openTime:'07:00',closeTime:'21:00'},
{id:'bocha',name:'Bocha',resources:['Cancha 1','Cancha 2','Cancha 3','Cancha 4'],resourceCaps:{'Cancha 1':2,'Cancha 2':2,'Cancha 3':2,'Cancha 4':2},openTime:'07:00',closeTime:'21:00'},
{id:'tenis_mesa',name:'Tênis de Mesa',resources:['Arena Principal','Arena Auxiliar'],resourceCaps:{'Arena Principal':2,'Arena Auxiliar':2},openTime:'07:00',closeTime:'21:00'},
{id:'futebol_pc',name:'Futebol PC',resources:['Quadra'],resourceCaps:{'Quadra':4},openTime:'07:00',closeTime:'21:00'},
{id:'atletismo',name:'Atletismo',resources:['Pista','Pista Indoor'],resourceCaps:{'Pista':6,'Pista Indoor':6},openTime:'07:00',closeTime:'21:00'}
],masters:[],manual:[],events:[],suspensions:[],history:[],updatedAt:null};
let data=load();
(data.events||[]).forEach(ev=>{if(ev?.ops&&!Object.prototype.hasOwnProperty.call(ev.ops,'centerCost')&&ev.ops.paymentResponsible)ev.ops.centerCost=ev.ops.paymentResponsible});
// v36 inicia uma base operacional limpa; dados antigos podem ser recuperados apenas por importação de backup.
// Normaliza bases antigas para garantir compatibilidade entre versões.
data.arenas=(data.arenas||[]).map(a=>{const resources=Array.isArray(a.resources)&&a.resources.length?a.resources:['Recurso 1'];const existing=(a.resourceCaps&&typeof a.resourceCaps==='object')?a.resourceCaps:{};const resourceCaps={};resources.forEach(r=>{let v=Number(existing[r]);if(!Number.isFinite(v)||v<1)v=(a.id==='atletismo'&&r==='Pista'?9:1);resourceCaps[r]=Math.floor(v)});const openTime=/^\d{2}:\d{2}$/.test(a.openTime||'')?a.openTime:'07:00';const closeTime=/^\d{2}:\d{2}$/.test(a.closeTime||'')?a.closeTime:'21:00';return {...a,resources,resourceCaps,openTime,closeTime};});
data.masters=Array.isArray(data.masters)?data.masters.map(m=>({...m,day:Number(m.day),a:m.a,r:m.r})):[];
data.manual=Array.isArray(data.manual)?data.manual:[];data.events=Array.isArray(data.events)?data.events:[];data.suspensions=Array.isArray(data.suspensions)?data.suspensions:[];data.history=Array.isArray(data.history)?data.history:[];

function uid(p){return p+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,7)}
let serverRevision=SHARED_BOOTSTRAP.revision;
let saveInFlight=false,pendingSnapshot=null,sharedBlocked=false;let reloadAfterImport=false;
function showSharedStatus(message,blocked=false){
 const el=document.getElementById('sharedStatus');
 el.textContent=message;el.style.display='block';
 el.style.background=blocked?'#fee4e2':'#eff6ff';
 el.style.color=blocked?'#9f2017':'#175cd3';
}
function blockOnConflict(message){
 sharedBlocked=true;
 try{localStorage.setItem('ctpb_unsaved_shared_backup',JSON.stringify(data))}catch(e){}
 showSharedStatus(message+' Seus dados locais foram guardados neste navegador. Exporte um backup antes de atualizar a página.',true);
 document.querySelectorAll('button,input,select,textarea').forEach(el=>{
  if(!['exportBtn','reloadSharedBtn'].includes(el.id))el.disabled=true;
 });
 document.getElementById('reloadSharedBtn').style.display='inline-flex';
}
function persistNext(){
 if(saveInFlight||!pendingSnapshot||sharedBlocked)return;
 const snapshot=pendingSnapshot;pendingSnapshot=null;saveInFlight=true;
 google.script.run.withSuccessHandler(result=>{
  saveInFlight=false;serverRevision=result.revision;
  showSharedStatus('Salvo na planilha do piloto.');
  if(reloadAfterImport){location.reload();return;}
  if(pendingSnapshot)persistNext();
 }).withFailureHandler(error=>{
  saveInFlight=false;pendingSnapshot=null;
  blockOnConflict(error?.message||'Não foi possível salvar na planilha do piloto.');
 }).saveSharedState(snapshot,serverRevision);
}
function save(){
 if(sharedBlocked)return false;
 data.updatedAt=new Date().toISOString();
 pendingSnapshot=JSON.stringify(data);
 showSharedStatus('Salvando na planilha do piloto...');
 persistNext();
 return true;
}
function load(){
 if(SHARED_BOOTSTRAP.state&&Array.isArray(SHARED_BOOTSTRAP.state.arenas))return SHARED_BOOTSTRAP.state;
 return structuredClone(DEFAULT);
}
function watchSharedRevision(){
 if(saveInFlight||pendingSnapshot||sharedBlocked)return;
 google.script.run.withSuccessHandler(result=>{
  if(result.revision!==serverRevision){
   showSharedStatus('Há alterações feitas por outra pessoa. Atualize para vê-las.');
   document.getElementById('reloadSharedBtn').style.display='inline-flex';
  }
 }).withFailureHandler(()=>{}).getSharedRevision();
}
setInterval(watchSharedRevision,30000);
function clone(x){return JSON.parse(JSON.stringify(x))}
function fmtDate(iso){if(!iso)return'';const d=new Date(iso+'T12:00:00');return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+'/'+d.getFullYear()}
function isoToday(){const d=new Date();const z=new Date(d.getTime()-d.getTimezoneOffset()*60000);return z.toISOString().slice(0,10)}
function mondayOf(iso){const d=new Date(iso+'T12:00:00');const dow=d.getDay();const diff=dow===0?-6:1-dow;d.setDate(d.getDate()+diff);return d.toISOString().slice(0,10)}
function addDays(iso,n){const d=new Date(iso+'T12:00:00');d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
function timeMin(t){const p=t.split(':').map(Number);return p[0]*60+p[1]}
function overlap(a,b){return timeMin(a.s)<timeMin(b.e)&&timeMin(b.s)<timeMin(a.e)}
function exceedsCapacity(candidate,existing,cap){const start=timeMin(candidate.s),end=timeMin(candidate.e);const pts=[start,...existing.map(x=>timeMin(x.s)).filter(t=>t>=start&&t<end)];return pts.some(t=>1+existing.filter(x=>timeMin(x.s)<=t&&t<timeMin(x.e)).length>cap)}
function arena(id){return data.arenas.find(a=>a.id===id)}
function resourceCap(aid,r){const a=arena(aid);if(!a)return 1;const v=Number(a.resourceCaps?.[r]);return Number.isFinite(v)&&v>=1?Math.floor(v):1}
function arenaTotalCap(a){return (a?.resources||[]).reduce((n,r)=>n+resourceCap(a.id,r),0)}
function arenaHours(aid){const a=arena(aid);return {open:a?.openTime||'07:00',close:a?.closeTime||'21:00'}}
function withinArenaHours(aid,s,e){const h=arenaHours(aid);return !!s&&!!e&&timeMin(s)>=timeMin(h.open)&&timeMin(e)<=timeMin(h.close)&&timeMin(s)<timeMin(e)}
function hoursLabel(aid){const h=arenaHours(aid);return `${h.open}–${h.close}`}
function eventOperatingViolations(ev){if(ev?.ops?.ctClosed)return [];return (ev.blocks||[]).filter(b=>!withinArenaHours(b.a,b.s,b.e)).map(b=>({block:b,arena:arena(b.a),hours:arenaHours(b.a)}))}

function originClass(x){return x&&x.origin==='cpb'?'cpb':'external'}
function masterMatches(m,date,r){const day=Number(m.day);if(day!==new Date(date+'T12:00:00').getDay())return false;if(m.r!==r)return false;if(m.active===false)return false;if(m.startDate&&date<m.startDate)return false;if(m.endDate&&date>m.endDate)return false;if(isSuspended(m.id,date))return false;return true}
function isSuspended(mid,date){return data.suspensions.some(s=>s.masterId===mid&&s.date===date&&s.active)}
function eventBlocksForDate(date){let out=[];data.events.forEach(ev=>{if(ev.active===false)return;if(date<ev.startDate||date>ev.endDate)return;ev.blocks.forEach(b=>{if(date<b.startDate||date>b.endDate)return;out.push({...b,eventId:ev.id,eventName:ev.name,date,type:'event',ctClosed:!!ev.ops?.ctClosed})})});return out}
function allOccupancy(date,aid,r){const eventList=eventBlocksForDate(date).filter(b=>b.a===aid&&(b.r==='__ALL__'||b.r===r));const closures=eventList.filter(b=>b.ctClosed);if(closures.length)return closures;let list=[];data.masters.forEach(m=>{if(m.a===aid&&masterMatches(m,date,r))list.push({...m,type:'master',date})});data.manual.filter(x=>x.active!==false&&x.date===date&&x.a===aid&&x.r===r).forEach(x=>list.push({...x,type:'manual',date}));eventList.forEach(b=>list.push(b));return list}
function conflictsForBlock(b){let hits=[];const a=arena(b.a);if(!a)return hits;const resources=b.r==='__ALL__'?a.resources:[b.r];let cur=b.startDate;while(cur<=b.endDate){resources.forEach(r=>{allOccupancy(cur,b.a,r).forEach(x=>{if((x.type==='master'||x.type==='manual'||x.type==='event')&&overlap({s:b.s,e:b.e},{s:x.s,e:x.e}))hits.push({...x,resource:r,date:cur})})});cur=addDays(cur,1)}return hits}
function currentUser(){return SHARED_BOOTSTRAP.user||'Conta do computador'}
function ensureCurrentUser(){document.getElementById('currentUserLabel').textContent=currentUser()}
function guessArea(action=''){const a=action.toLowerCase();if(a.includes('programação fixa'))return 'Programação Fixa';if(a.includes('ajuste manual'))return 'Ajuste Manual';if(a.includes('evento'))return 'Eventos';if(a.includes('arena')||a.includes('recurso'))return 'Arenas e Recursos';if(a.includes('demonstração')||a.includes('base'))return 'Sistema';return 'Geral'}
function prettyDiff(before,after,fields){const out=[];for(const [key,label] of fields){const b=before?.[key]??'';const a=after?.[key]??'';if(JSON.stringify(b)!==JSON.stringify(a))out.push(`${label}: ${b===''?'—':b} → ${a===''?'—':a}`)}return out.join(' | ')||'Registro salvo sem alteração nos campos principais.'}
function log(action,detail,meta={}){data.history.unshift({id:uid('h'),at:new Date().toISOString(),user:currentUser(),area:meta.area||guessArea(action),action,record:meta.record||'',detail,change:meta.change||detail});data.history=data.history.slice(0,1000);save();}
function fillArenaSelect(id,includeAll=false){const el=document.getElementById(id);if(!el)return;const old=el.value;el.innerHTML=(includeAll?'<option value="ALL">Todas</option>':'')+data.arenas.map(a=>`<option value="${a.id}">${a.name}</option>`).join('');if([...el.options].some(o=>o.value===old))el.value=old}
function fillResourceSelect(arenaId,selId,all=false){const el=document.getElementById(selId),a=arena(arenaId);if(!el||!a)return;const old=el.value;el.innerHTML=(all?'<option value="__ALL__">Toda a arena</option>':'')+a.resources.map(r=>`<option>${r}</option>`).join('');if([...el.options].some(o=>o.value===old))el.value=old}
function switchView(v){document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.view===v));document.querySelectorAll('.view').forEach(s=>s.classList.toggle('active',s.id==='view-'+v));if(v==='home')renderHome();if(v==='planner')renderPlanner();if(v==='booking')renderMasters();if(v==='event')renderEvents();if(v==='history')renderHistory();if(v==='lodging')renderLodging();if(v==='availability')renderAvailability();if(v==='indicators')renderIndicators();if(v==='reports')renderReports();if(v==='public')renderPublic();if(v==='setup')renderSetup();}

document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>switchView(b.dataset.view));

ensureCurrentUser();
['historyUser','historyArea'].forEach(id=>document.getElementById(id)?.addEventListener('change',renderHistory));document.getElementById('historySearch')?.addEventListener('input',renderHistory);
document.getElementById('exportBtn').onclick=()=>{const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='backup_gestao_arenas_'+isoToday()+'.json';a.click();URL.revokeObjectURL(a.href)};
document.getElementById('importBtn').onclick=()=>document.getElementById('importFile').click();
document.getElementById('importFile').onchange=e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{const x=JSON.parse(rd.result);if(!x.arenas||!x.masters||!x.events)throw Error();data=x;reloadAfterImport=true;save()}catch(err){alert('Arquivo de backup inválido.')}};rd.readAsText(f)};

function renderHome(){
 fillArenaSelect('homeArena',true);
 const d=document.getElementById('homeDate').value||isoToday();document.getElementById('homeDate').value=d;
 const aid=document.getElementById('homeArena').value||'ALL';
 const selectedArenas=aid==='ALL'?data.arenas:[arena(aid)].filter(Boolean);
 const resources=selectedArenas.flatMap(a=>a.resources.map(r=>({a:a.id,r})));
 let all=[];resources.forEach(q=>all.push(...allOccupancy(d,q.a,q.r).map(x=>({...x,aid:q.a,res:q.r}))));
 const eventBlocks=eventBlocksForDate(d).filter(b=>aid==='ALL'||b.a===aid);
 const eventIds=[...new Set(eventBlocks.map(b=>b.eventId))];
 const eventsToday=data.events.filter(e=>e.active!==false&&eventIds.includes(e.id));
 const susp=data.suspensions.filter(s=>s.date===d&&s.active&&(aid==='ALL'||s.a===aid));
 const training=all.filter(x=>x.type==='master'||x.type==='manual'); const trainingGrouped=groupUsageItems(training);
 const lodging=lodgingByDate(d); const lodgingPct=Math.round(lodging.total/280*100);
 const isToday=d===isoToday(); const n=new Date(); const nowM=isToday?n.getHours()*60+n.getMinutes():7*60;
 const scopeLabel=aid==='ALL'?'Todo o CT':(arena(aid)?.name||'Arena');
 document.getElementById('homeDayTitle').textContent=isToday?'Hoje no CT':`${dayNames[new Date(d+'T12:00:00').getDay()]} · ${fmtDate(d)}`;
 document.getElementById('homeDaySubtitle').textContent=`${scopeLabel} · ${eventsToday.length} evento(s) · ${trainingGrouped.length} treinamento(s) programado(s)`;
 const athletes=eventsToday.reduce((s,e)=>s+(Number(e.ops?.athletes)||0),0), committee=eventsToday.reduce((s,e)=>s+(Number(e.ops?.committee)||0),0), audience=eventsToday.reduce((s,e)=>s+(Number(e.ops?.publicAudience)||0),0);
 document.getElementById('homeStats').innerHTML=`<div class="stat"><div class="l">EVENTOS</div><div class="v">${eventsToday.length}</div><div class="home-stat-note">eventos ativos na data</div></div><div class="stat"><div class="l">TREINAMENTOS</div><div class="v">${trainingGrouped.length}</div><div class="home-stat-note">sessões programadas</div></div><div class="stat"><div class="l">ATLETAS</div><div class="v">${athletes}</div><div class="home-stat-note">informados nos eventos</div></div><div class="stat"><div class="l">COMISSÃO</div><div class="v">${committee}</div><div class="home-stat-note">informada nos eventos</div></div><div class="stat"><div class="l">PÚBLICO PREVISTO</div><div class="v">${audience}</div><div class="home-stat-note">previsão dos eventos</div></div><div class="stat"><div class="l">HOSPEDAGEM</div><div class="v">${lodging.total}</div><div class="home-stat-note">de 280 pessoas</div></div>`;
 // Agenda atual/próxima
 let focus=[];
 if(isToday){focus=all.filter(x=>timeMin(x.s)<=nowM&&nowM<timeMin(x.e)).sort((a,b)=>timeMin(a.s)-timeMin(b.s));document.getElementById('nowSubtitle').textContent='O que está acontecendo agora';}
 else{focus=all.filter(x=>timeMin(x.e)>nowM).sort((a,b)=>timeMin(a.s)-timeMin(b.s)).slice(0,12);document.getElementById('nowSubtitle').textContent='Primeiros usos programados na data';}
 if(isToday&&!focus.length){focus=all.filter(x=>timeMin(x.s)>nowM&&timeMin(x.s)<=nowM+120).sort((a,b)=>timeMin(a.s)-timeMin(b.s));document.getElementById('nowSubtitle').textContent='Próximos usos nas próximas 2 horas';}
 focus=groupUsageItems(focus);
 document.getElementById('nowCount').textContent=focus.length;
 document.getElementById('nowList').innerHTML=focus.length?focus.slice(0,16).map(x=>`<div class="today-item ${x.type}"><div class="tiny">${arena(x.aid)?.name||''} · ${x.resourceLabel}</div><b>${x.s}–${x.e}</b> · ${x.club||x.eventName}<div class="muted" style="font-size:11px;margin-top:2px">${x.type==='master'?'Programação Fixa':x.type==='manual'?'Ajuste manual':'Evento'}</div></div>`).join(''):'<div class="home-empty">Nenhuma utilização nesta faixa de horário.</div>';
 // Alertas operacionais
 const alerts=[];
 susp.forEach(s=>alerts.push({level:'bad',title:'TREINAMENTO SUSPENSO',text:`${arena(s.a)?.name||''} · ${s.r} · ${s.club||'Treinamento'} · ${s.s}–${s.e}`}));
 eventsToday.forEach(e=>alerts.push({level:'event',title:`${(e.ops?.category||'EVENTO').toUpperCase()}`,text:`${e.name} · ${groupBlocksByArenaResource(e.blocks.filter(b=>b.startDate<=d&&d<=b.endDate&&(aid==='ALL'||b.a===aid))).join(' | ')}`}));
 if(lodging.total>280)alerts.unshift({level:'bad',title:'SUPERLOTAÇÃO',text:`Hotelaria em ${lodging.total}/280 pessoas (${lodgingPct}%).`});else if(lodgingPct>90)alerts.unshift({level:'bad',title:'HOTELARIA · ALTA OCUPAÇÃO',text:`${lodging.total}/280 pessoas (${lodgingPct}%).`});else if(lodgingPct>70)alerts.unshift({level:'warn',title:'HOTELARIA · ATENÇÃO',text:`${lodging.total}/280 pessoas (${lodgingPct}%).`});
 document.getElementById('attentionCount').textContent=alerts.length;
 document.getElementById('attentionList').innerHTML=alerts.length?alerts.slice(0,14).map(x=>`<div class="today-item ${x.level==='bad'?'suspended':x.level==='event'?'event':''}"><div><span class="${x.level==='bad'?'badDot':x.level==='warn'||x.level==='event'?'warnDot':'okdot'}"></span><b style="font-size:11px">${x.title}</b></div><div style="font-size:12px;margin-top:4px">${x.text}</div></div>`).join(''):'<div class="home-empty"><span class="okdot"></span>Nenhuma atenção operacional identificada nesta data.</div>';
 // Eventos do dia
 document.getElementById('eventTodayCount').textContent=eventsToday.length;
 document.getElementById('homeEvents').innerHTML=eventsToday.length?eventsToday.map(e=>{const bs=e.blocks.filter(b=>b.startDate<=d&&d<=b.endDate&&(aid==='ALL'||b.a===aid));const spaces=groupBlocksByArenaResource(bs);return `<div class="home-event-card"><div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start"><div><b>${e.name}</b><div class="meta">${spaces.join(' | ')||'Sem espaço nesta seleção'}</div></div><span class="home-category-chip">${e.ops?.category||'Evento'}</span></div><div class="home-kpis"><span class="home-kpi">Atletas ${Number(e.ops?.athletes)||0}</span><span class="home-kpi">Comissão ${Number(e.ops?.committee)||0}</span><span class="home-kpi">Público ${Number(e.ops?.publicAudience)||0}</span><span class="home-kpi">Hosp. ${Number(e.ops?.lodging)||0}</span></div></div>`}).join(''):'<div class="home-empty">Nenhum evento programado para esta data.</div>';
 // Hotelaria
 const lodgClass=lodging.total>280?'bad':lodgingPct>90?'bad':lodgingPct>70?'warn':'good'; const lodgStatus=lodging.total>280?'SUPERLOTAÇÃO':lodgingPct>90?'ALTA OCUPAÇÃO':lodgingPct>70?'ATENÇÃO':'DENTRO DA CAPACIDADE';
 document.getElementById('homeLodgingPct').textContent=`${lodgingPct}%`;
 document.getElementById('homeLodging').innerHTML=`<div class="home-lodging-number">${lodging.total}<span class="muted" style="font-size:15px;font-weight:700"> / 280</span></div><div class="occbar" style="margin-top:12px"><div class="occ-${lodgClass==='good'?'ok':lodgClass}" style="width:${Math.min(100,lodgingPct)}%"></div></div><div class="home-lodging-status" style="color:${lodgClass==='bad'?'var(--bad)':lodgClass==='warn'?'var(--warn)':'var(--good)'}">${lodgStatus}</div><div class="muted" style="font-size:11px;margin-top:8px">${lodging.items.length?lodging.items.map(i=>`${i.event}: ${i.count}`).join(' · '):'Sem hospedagem programada.'}</div>`;
 // Utilização das arenas por slots de 30min (07-21), ponderada pela capacidade dos recursos
 const usage=selectedArenas.map(a=>{let used=0,total=0;for(const r of a.resources){const cap=resourceCap(a.id,r);for(let m=420;m<1260;m+=30){total+=cap;const occ=allOccupancy(d,a.id,r).filter(x=>timeMin(x.s)<m+30&&m<timeMin(x.e));const hasEvent=occ.some(x=>x.type==='event');const cnt=hasEvent?cap:Math.min(cap,occ.filter(x=>x.type!=='event').length);used+=cnt;}}return {a,pct:total?Math.round(used/total*100):0}}).sort((x,y)=>y.pct-x.pct);
 document.getElementById('homeArenaUsage').innerHTML=usage.length?usage.slice(0,10).map(x=>`<div class="usage-row"><div><b style="font-size:12px">${x.a.name}</b></div><div class="usage-bar"><div style="width:${x.pct}%"></div></div><div style="text-align:right;font-size:11px;font-weight:850">${x.pct}%</div></div>`).join(''):'<div class="home-empty">Sem arenas para calcular.</div>';
 // Disponibilidade imediata (ou 07:00 para datas futuras/passadas)
 const checkM=isToday?nowM:420; const available=[];
 resources.forEach(q=>{const cap=resourceCap(q.a,q.r);const occ=allOccupancy(d,q.a,q.r).filter(x=>timeMin(x.s)<=checkM&&checkM<timeMin(x.e));const hasEvent=occ.some(x=>x.type==='event');const used=hasEvent?cap:Math.min(cap,occ.filter(x=>x.type!=='event').length);const free=Math.max(0,cap-used);if(free>0)available.push({...q,free,cap})});
 document.getElementById('homeAvailabilitySubtitle').textContent=isToday?'Recursos com vaga agora':'Recursos com vaga às 07:00'; document.getElementById('homeAvailableCount').textContent=available.length;
 document.getElementById('homeAvailability').innerHTML=available.length?available.slice(0,12).map(x=>`<div class="available-row"><div><b>${arena(x.a)?.name||''}</b><div class="muted" style="font-size:10px">${x.r}</div></div><div style="text-align:right"><b style="color:var(--good)">${x.free} vaga${x.free===1?'':'s'}</b><div class="muted" style="font-size:10px">limite ${x.cap}</div></div></div>`).join('')+(available.length>12?`<div class="home-list-more">+ ${available.length-12} recurso(s) disponível(is). Consulte a tela Disponibilidade para detalhes.</div>`:''):'<div class="home-empty">Nenhum recurso com vaga nesta referência.</div>';
 // Estado geral
 const pill=document.getElementById('homeStatusPill');pill.className='home-status';if(lodging.total>280||susp.length){pill.classList.add('bad');pill.textContent=lodging.total>280?'Atenção crítica · hotelaria':'Há suspensões no dia';}else if(lodgingPct>70||eventsToday.length){pill.classList.add('warn');pill.textContent=eventsToday.length?`${eventsToday.length} evento(s) em operação`:'Atenção à hotelaria';}else{pill.textContent='Operação sem alertas';}
}

document.getElementById('homeDate').addEventListener('change',renderHome);document.getElementById('homeArena').addEventListener('change',renderHome);document.getElementById('goPlanner').onclick=()=>{document.getElementById('plannerArena').value=document.getElementById('homeArena').value==='ALL'?data.arenas[0].id:document.getElementById('homeArena').value;document.getElementById('plannerWeek').value=mondayOf(document.getElementById('homeDate').value);switchView('planner')}

function plannerItems(aid,week){let items=[];for(let di=0;di<7;di++){const date=addDays(week,di);const a=arena(aid);a.resources.forEach(r=>{const masters=data.masters.filter(m=>m.a===aid&&masterMatches(m,date,r));masters.forEach(m=>items.push({...m,date,res:r,status:'master'}));data.manual.filter(x=>x.active!==false&&x.a===aid&&x.r===r&&x.date===date).forEach(x=>items.push({...x,date,res:r,status:'manual'}));data.events.forEach(ev=>{if(date<ev.startDate||date>ev.endDate)return;ev.blocks.filter(b=>b.a===aid&&b.startDate<=date&&b.endDate>=date&&(b.r==='__ALL__'||b.r===r)).forEach(b=>items.push({...b,date,res:r,eventId:ev.id,eventName:ev.name,status:'event',ctClosed:!!ev.ops?.ctClosed}))});data.suspensions.filter(s=>s.a===aid&&s.date===date&&s.active&&a.resources.includes(s.r)).forEach(s=>{const m=data.masters.find(m=>m.id===s.masterId);items.push({...s,club:s.club||m?.club||'Treinamento',sport:s.sport||m?.sport||'',origin:s.origin||m?.origin||'external',date,res:s.r,status:'suspended'})});});}return items}
function fillPlannerClubs(){const el=document.getElementById('plannerClub');if(!el)return;const old=el.value;const clubs=[...new Set([...data.masters,...data.manual.filter(x=>x.active!==false)].map(m=>m.club).filter(Boolean))].sort((a,b)=>a.localeCompare(b));el.innerHTML='<option value="ALL">Todos</option>'+clubs.map(c=>`<option>${c}</option>`).join('');if([...el.options].some(o=>o.value===old))el.value=old;}

function joinPt(items){
 const arr=[...items];if(!arr.length)return '';if(arr.length===1)return arr[0];if(arr.length===2)return arr[0]+' e '+arr[1];return arr.slice(0,-1).join(', ')+' e '+arr[arr.length-1];
}
function compactResourceLabel(resources,wholeArena=false){
 if(wholeArena)return 'Toda a arena';
 const arr=[...new Set(resources.filter(Boolean))];
 if(arr.length<=1)return arr[0]||'';
 const parsed=arr.map(r=>{const m=r.match(/^(.*?)(\d+)$/);return m?{prefix:m[1].trim(),num:m[2]}:null});
 if(parsed.every(Boolean)&&new Set(parsed.map(x=>x.prefix)).size===1){
   const prefix=parsed[0].prefix;
   return `${prefix} ${joinPt(parsed.map(x=>x.num))}`;
 }
 return joinPt(arr);
}
function groupPlannerItems(items){
 const map=new Map();
 items.forEach(x=>{
   const who=x.status==='event'?(x.eventName||'Evento'):(x.club||'Treinamento');
   const key=[x.status,who,x.sport||'',x.s,x.e,x.date,x.origin||'',x.eventId||'',x.ctClosed?'1':'0'].join('|');
   if(!map.has(key))map.set(key,{...x,resources:[],wholeArena:false});
   const g=map.get(key);
   g.resources.push(x.res);
   if(x.r==='__ALL__')g.wholeArena=true;
 });
 return [...map.values()].map(g=>({...g,resourceLabel:compactResourceLabel(g.resources,g.wholeArena)}));
}

function groupUsageItems(items){
 const map=new Map();
 items.forEach(x=>{
   const status=x.status||x.type||'';
   const who=status==='event'||x.type==='event'?(x.eventName||'Evento'):(x.club||'Treinamento');
   const aid=x.aid||x.arenaId||x.a||'';
   const key=[aid,status,who,x.sport||'',x.s,x.e,x.date||'',x.origin||'',x.eventId||'',x.ctClosed?'1':'0'].join('|');
   if(!map.has(key))map.set(key,{...x,resources:[],wholeArena:false});
   const g=map.get(key);
   g.resources.push(x.res||x.resource||x.r);
   if(x.r==='__ALL__')g.wholeArena=true;
 });
 return [...map.values()].map(g=>({...g,resourceLabel:compactResourceLabel(g.resources,g.wholeArena)}));
}
function groupBlocksByArenaResource(blocks){
 const map=new Map();
 blocks.forEach(b=>{
   const key=b.a;
   if(!map.has(key))map.set(key,{a:b.a,resources:[],whole:false});
   const g=map.get(key);
   if(b.r==='__ALL__')g.whole=true; else g.resources.push(b.r);
 });
 return [...map.values()].map(g=>`${arena(g.a)?.name||''}${g.whole?' (toda)':(g.resources.length?' · '+compactResourceLabel(g.resources,false):'')}`);
}
function renderPlanner(){
 fillPlannerClubs();fillArenaSelect('plannerArena');
 const aid=document.getElementById('plannerArena').value||data.arenas[0].id;
 const week=mondayOf(document.getElementById('plannerWeek').value||isoToday());
 const clubFilter=document.getElementById('plannerClub')?.value||'ALL';
 document.getElementById('plannerWeek').value=week;
 const a=arena(aid),h=arenaHours(aid);
 document.getElementById('plannerTitle').textContent=`${a.name} · ${fmtDate(week)} a ${fmtDate(addDays(week,6))} · funcionamento ${h.open}–${h.close}`;
 const dates=Array.from({length:7},(_,i)=>addDays(week,i));
 const hours=[];const first=Math.floor(timeMin(h.open)/60),last=Math.ceil(timeMin(h.close)/60);
 for(let hh=first;hh<last;hh++)hours.push(`${String(hh).padStart(2,'0')}:00`);
 const weekItems=plannerItems(aid,week);
 let html='<div class="ph">HORA</div>'+dates.map((d,i)=>`<div class="ph">${dayShort[new Date(d+'T12:00:00').getDay()]} ${fmtDate(d).slice(0,5)}</div>`).join('');
 for(const hour of hours){
  html+=`<div class="time">${hour}</div>`;
  dates.forEach(date=>{
   html+='<div class="pcell">';
   const idx=timeMin(hour),arr=[];
   a.resources.forEach(r=>{
    const items=weekItems.filter(x=>x.date===date&&x.res===r&&timeMin(x.s)<=idx&&idx<timeMin(x.e)&&(clubFilter==='ALL'||x.status==='event'||x.club===clubFilter));
    items.forEach(x=>arr.push(x));
   });
   const grouped=groupPlannerItems(arr);
   html+=grouped.map(x=>{
    const start=timeMin(x.s)===idx,closed=x.status==='event'&&x.ctClosed;
    const title=closed?`CT FECHADO — ${x.eventName}`:(x.status==='event'?x.eventName:x.club);
    const sub=closed?'CT FECHADO · TODAS AS ATIVIDADES SUSPENSAS':x.status==='master'?'PROGRAMADO · FIXA':x.status==='manual'?'AJUSTE MANUAL':x.status==='event'?'EVENTO':'TREINAMENTO SUSPENSO';
    return `<div class="booking ${x.status} ${closed?'ctclosed':''} ${x.status==='master'||x.status==='manual'?originClass(x):''} ${start?'':'continuation'}" data-detail='${encodeURIComponent(JSON.stringify(x))}'><div class="tiny">${start?x.s+'–'+x.e:'continua'} · ${x.resourceLabel}</div><div class="btitle">${title}</div><div class="bsub">${sub}</div></div>`;
   }).join('');
   html+='</div>';
  });
 }
 document.getElementById('plannerGrid').style.gridTemplateColumns=`78px repeat(7,minmax(140px,1fr))`;
 document.getElementById('plannerGrid').innerHTML=html;
 document.querySelectorAll('[data-detail]').forEach(el=>el.onclick=()=>showDetail(JSON.parse(decodeURIComponent(el.dataset.detail))));
}
function safeTableText(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function masterTableHtml(){
 const arr=data.masters.filter(m=>m.active!==false).sort((a,b)=>
  (arena(a.a)?.name||a.a).localeCompare(arena(b.a)?.name||b.a)||
  Number(a.day)-Number(b.day)||a.s.localeCompare(b.s));
 if(!arr.length)return '<div class="empty">Nenhuma programação fixa ativa.</div>';
 return `<div style="overflow:auto"><table class="table"><thead><tr><th>Arena</th><th>Recurso</th><th>Clube</th><th>Modalidade</th><th>Dia</th><th>Horário</th><th>Ações</th></tr></thead><tbody>${arr.map(m=>`<tr><td>${safeTableText(arena(m.a)?.name||m.a)}</td><td>${safeTableText(m.r)}</td><td>${safeTableText(m.club)}</td><td>${safeTableText(m.sport||'—')}</td><td>${safeTableText(dayNames[Number(m.day)]||'—')}</td><td>${safeTableText(m.s)}–${safeTableText(m.e)}</td><td><button class="btn small" onclick="startMasterEdit('${m.id}')">Editar</button> <button class="btn small danger" onclick="removeMaster('${m.id}')">Excluir</button></td></tr>`).join('')}</tbody></table></div>`;
}
function removeMaster(id){
 const rec=data.masters.find(m=>m.id===id&&m.active!==false);if(!rec)return;
 if(data.suspensions.some(s=>s.masterId===id&&s.active)){
  alert('Esta programação possui suspensões ativas vinculadas a eventos. Cancele/restaure os eventos antes de excluir o registro.');return;
 }
 if(!confirm(`Excluir a programação fixa de ${rec.club} (${dayNames[Number(rec.day)]}, ${rec.s}–${rec.e})?`))return;
 rec.active=false;
 log('Programação Fixa excluída',`${arena(rec.a)?.name||rec.a} · ${rec.r} · ${rec.club} · ${rec.s}–${rec.e}`);
 if(editingMasterId===id)exitMasterEdit();
 renderMasters();renderPlanner();renderHome();renderPublic();
}
function renderMasters(){
 fillArenaSelect('newArena');
 const aid=document.getElementById('newArena').value||data.arenas[0]?.id;
 fillResourceSelect(aid,'newResource');
 const b=document.getElementById('masterTableBooking'); if(b)b.innerHTML=masterTableHtml();
 const c=document.getElementById('masterCount'); if(c)c.textContent=`${data.masters.filter(m=>m.active!==false).length} registro${data.masters.filter(m=>m.active!==false).length===1?'':'s'}`;
 fillArenaSelect('manualArena');
 const maid=document.getElementById('manualArena').value||data.arenas[0]?.id;
 fillResourceSelect(maid,'manualResource');
 renderManuals();
}
function readMasterForm(){return {a:document.getElementById('newArena').value,r:document.getElementById('newResource').value,club:document.getElementById('newClub').value.trim(),sport:document.getElementById('newSport').value.trim(),origin:document.getElementById('newOrigin').value,day:Number(document.getElementById('newDay').value),s:document.getElementById('newStart').value,e:document.getElementById('newEnd').value,active:true}}
function masterOverlapInfo(m,excludeId=null){const overlaps=data.masters.filter(x=>x.active!==false&&x.id!==excludeId&&x.a===m.a&&x.r===m.r&&Number(x.day)===Number(m.day)&&overlap(m,x));const cap=resourceCap(m.a,m.r);const duplicate=overlaps.filter(x=>(x.club||'').trim().toLowerCase()===(m.club||'').trim().toLowerCase()&&(x.s===m.s&&x.e===m.e));return {overlaps,cap,duplicate,overCapacity:exceedsCapacity(m,overlaps,cap)}}
function renderMasterAvailability(ok,msg,kind='good'){const b=document.getElementById('newAvailability');if(!b)return;b.className='banner '+kind;b.innerHTML=msg}
function checkMasterForm(){const m=readMasterForm();if(!m.club||!m.sport){renderMasterAvailability(false,'Preencha clube/instituição e modalidade.','warn');return false}if(!m.s||!m.e||timeMin(m.s)>=timeMin(m.e)){renderMasterAvailability(false,'⚠ Horário inválido. O fim deve ser posterior ao início.','bad');return false}if(!withinArenaHours(m.a,m.s,m.e)){renderMasterAvailability(false,`⛔ Fora do horário de funcionamento de ${arena(m.a)?.name||'arena'} (${hoursLabel(m.a)}).`,'bad');return false}const info=masterOverlapInfo(m,editingMasterId);if(info.duplicate.length){renderMasterAvailability(false,`⚠ POSSÍVEL DUPLICIDADE: ${m.club} já possui este mesmo recurso em ${m.s}–${m.e}. Verifique antes de cadastrar novamente.`,'bad');return false}if(info.overCapacity){renderMasterAvailability(false,`⛔ Limite excedido. Já existe(m) ${info.overlaps.length} utilização(ões) simultânea(s): ${info.overlaps.map(x=>`${x.club} · ${x.s}–${x.e}`).join(' | ')}. Limite do recurso: ${info.cap} clube(s).`,'bad');return false}if(info.overlaps.length){renderMasterAvailability(true,`⚠ ATENÇÃO: este recurso já está sendo utilizado por ${info.overlaps.map(x=>`${x.club} · ${x.s}–${x.e}`).join(' | ')}. Ocupação após este cadastro: ${info.overlaps.length+1}/${info.cap}. O cadastro ainda é permitido, mas confira se o uso simultâneo é intencional.`,'warn');return true}renderMasterAvailability(true,`✓ Faixa disponível. Limite deste recurso: ${info.cap} clube(s) simultâneo(s).`,'good');return true}
document.getElementById('newArena').addEventListener('change',()=>{fillResourceSelect(document.getElementById('newArena').value,'newResource');checkMasterForm();});
document.getElementById('newResource').addEventListener('change',checkMasterForm);
document.getElementById('manualArena').addEventListener('change',()=>{fillResourceSelect(document.getElementById('manualArena').value,'manualResource');checkManualForm();});
document.getElementById('manualResource').addEventListener('change',checkManualForm);
['manualDate','manualStart','manualEnd','manualClub','manualSport','manualNote'].forEach(id=>document.getElementById(id).addEventListener('change',checkManualForm));
document.getElementById('checkManual').onclick=checkManualForm;

['newDay','newStart','newEnd','newClub','newSport'].forEach(id=>document.getElementById(id).addEventListener('change',checkMasterForm));
let editingMasterId=null;
document.getElementById('checkBooking').onclick=checkMasterForm;
document.getElementById('saveBooking').onclick=()=>{
 const m=readMasterForm();
 if(!checkMasterForm())return;
 if(editingMasterId){
   const rec=data.masters.find(x=>x.id===editingMasterId);
   if(!rec)return;
   const activeSusp=data.suspensions.filter(s=>s.masterId===rec.id&&s.active);
   if(activeSusp.length){
     alert('Este registro possui suspensão(ões) ativa(s) gerada(s) por evento. Para não alterar o comportamento dessas exceções, use o Ajuste Manual para um caso pontual ou cancele/restaure o evento antes de editar a recorrência.');
     return;
   }
   const before={...rec};Object.assign(rec,m);
   log('Programação Fixa editada',`${arena(rec.a)?.name||rec.a} · ${rec.r} · ${rec.club} · ${dayNames[rec.day]} · ${rec.s}–${rec.e}`,{area:'Programação Fixa',record:rec.club||rec.id,change:prettyDiff(before,rec,[['a','Arena'],['r','Recurso'],['club','Clube'],['sport','Modalidade'],['origin','Vínculo'],['day','Dia'],['s','Início'],['e','Fim']])});
   exitMasterEdit();
   renderMasters(); renderPlanner(); renderHome(); renderPublic();
   renderMasterAvailability(true,'✓ Registro da programação fixa atualizado.','good');
 }else{
   const rec={id:uid('m'),...m};
   data.masters.push(rec);
   log('Programação Fixa criada',`${arena(rec.a)?.name||rec.a} · ${rec.r} · ${rec.club} · ${dayNames[rec.day]} · ${rec.s}–${rec.e}`);
   renderMasters(); renderPlanner(); renderHome(); renderPublic();
   renderMasterAvailability(true,'✓ Programação fixa adicionada com sucesso.','good');
   document.getElementById('newClub').value=''; document.getElementById('newSport').value='';
 }
};
function startMasterEdit(id){
 const rec=data.masters.find(x=>x.id===id&&x.active!==false); if(!rec)return;
 editingMasterId=id;
 document.getElementById('newArena').value=rec.a;
 fillResourceSelect(rec.a,'newResource');
 document.getElementById('newResource').value=rec.r;
 document.getElementById('newClub').value=rec.club||'';
 document.getElementById('newSport').value=rec.sport||'';
 document.getElementById('newOrigin').value=rec.origin||'external';
 document.getElementById('newDay').value=String(rec.day);
 document.getElementById('newStart').value=rec.s||'08:00';
 document.getElementById('newEnd').value=rec.e||'10:00';
 document.getElementById('saveBooking').textContent='Salvar alteração';
 document.getElementById('checkBooking').textContent='Verificar alteração';
 document.getElementById('cancelMasterEdit').style.display='inline-flex';
 document.getElementById('bookingFormTitle').textContent='Editar utilização fixa';
 document.getElementById('bookingFormHelp').textContent='A alteração afeta todas as ocorrências futuras dessa programação fixa. Para uma mudança apenas em um dia, use o Ajuste Manual.';
 checkMasterForm();
 document.getElementById('newClub').focus();
}
function exitMasterEdit(){
 editingMasterId=null;
 document.getElementById('saveBooking').textContent='Adicionar à programação fixa';
 document.getElementById('checkBooking').textContent='Verificar';
 document.getElementById('cancelMasterEdit').style.display='none';
 document.getElementById('bookingFormTitle').textContent='Nova utilização fixa';
 document.getElementById('bookingFormHelp').textContent='A rotina recorrente. Ela permanece mesmo quando ocorrerem eventos.';
 document.getElementById('newClub').value=''; document.getElementById('newSport').value=''; document.getElementById('newOrigin').value='external';
 checkMasterForm();
}
document.getElementById('cancelMasterEdit').onclick=exitMasterEdit;

function manualOverlapInfo(m){
 const hits=allOccupancy(m.date,m.a,m.r).filter(x=>!(x.type==='manual'&&x.id===m.id)&&overlap(m,x));
 const eventHits=hits.filter(x=>x.type==='event');
 const clubHits=hits.filter(x=>x.type==='master'||x.type==='manual');
 const cap=resourceCap(m.a,m.r);
 const duplicate=clubHits.filter(x=>(x.club||'').trim().toLowerCase()===(m.club||'').trim().toLowerCase()&&x.s===m.s&&x.e===m.e);
 return {eventHits,clubHits,cap,duplicate,overCapacity:exceedsCapacity(m,clubHits,cap)};
}
function renderManualAvailability(ok,msg,kind='good'){const b=document.getElementById('manualAvailability');if(!b)return;b.className='banner '+kind;b.innerHTML=msg}
function readManualForm(){return {a:document.getElementById('manualArena').value,r:document.getElementById('manualResource').value,date:document.getElementById('manualDate').value,club:document.getElementById('manualClub').value.trim(),sport:document.getElementById('manualSport').value.trim(),origin:document.getElementById('manualOrigin').value,s:document.getElementById('manualStart').value,e:document.getElementById('manualEnd').value,note:document.getElementById('manualNote').value.trim(),active:true}}
function checkManualForm(){
 const m=readManualForm();
 if(!m.club||!m.sport||!m.date){renderManualAvailability(false,'Preencha data, clube/instituição e modalidade.','warn');return false}
 if(!m.s||!m.e||timeMin(m.s)>=timeMin(m.e)){renderManualAvailability(false,'⚠ Horário inválido. O fim deve ser posterior ao início.','bad');return false}
 if(!withinArenaHours(m.a,m.s,m.e)){renderManualAvailability(false,`⛔ Fora do horário de funcionamento de ${arena(m.a)?.name||'arena'} (${hoursLabel(m.a)}).`,'bad');return false}
 const info=manualOverlapInfo(m);
 if(info.eventHits.length){renderManualAvailability(false,`⛔ Conflito com evento: ${info.eventHits.map(x=>`${x.eventName||'Evento'} · ${x.s}–${x.e}`).join(' | ')}.`,'bad');return false}
 if(info.duplicate.length){renderManualAvailability(false,`⚠ POSSÍVEL DUPLICIDADE: ${m.club} já possui este mesmo recurso em ${m.s}–${m.e} nesta data. Verifique antes de cadastrar novamente.`,'bad');return false}
 if(info.overCapacity){renderManualAvailability(false,`⛔ Limite excedido. Já existe(m) ${info.clubHits.length} utilização(ões) simultânea(s): ${info.clubHits.map(x=>`${x.club||'Ajuste manual'} · ${x.s}–${x.e}`).join(' | ')}. Limite do recurso: ${info.cap} clube(s).`,'bad');return false}
 if(info.clubHits.length){renderManualAvailability(true,`⚠ ATENÇÃO: este recurso já está sendo utilizado por ${info.clubHits.map(x=>`${x.club||'Ajuste manual'} · ${x.s}–${x.e}`).join(' | ')}. Ocupação após este ajuste: ${info.clubHits.length+1}/${info.cap}. O ajuste ainda é permitido, mas confira se o uso simultâneo é intencional.`,'warn');return true}
 renderManualAvailability(true,`✓ Ajuste manual disponível. Limite deste recurso: ${info.cap} clube(s) simultâneo(s).`,'good');return true;
}
function clearManualForm(){document.getElementById('manualClub').value='';document.getElementById('manualSport').value='';document.getElementById('manualOrigin').value='external';document.getElementById('manualNote').value='';renderManualAvailability(false,'Preencha os campos e clique em verificar.','warn');}
function saveManual(){const m=readManualForm();if(!checkManualForm())return;data.manual.push({id:uid('man'),...m});log('Ajuste manual criado',`${arena(m.a)?.name||m.a} · ${m.r} · ${m.date} · ${m.club} · ${m.s}–${m.e}`);renderMasters();renderPlanner();renderHome();renderPublic();clearManualForm();alert('Ajuste manual incluído somente nesta data. Ele não altera a programação fixa e não será suspenso automaticamente por eventos.');}
function editManual(id){const rec=data.manual.find(x=>x.id===id&&x.active!==false);if(!rec)return;document.getElementById('manualArena').value=rec.a;fillResourceSelect(rec.a,'manualResource');document.getElementById('manualResource').value=rec.r;document.getElementById('manualDate').value=rec.date;document.getElementById('manualClub').value=rec.club||'';document.getElementById('manualSport').value=rec.sport||'';document.getElementById('manualOrigin').value=rec.origin||'external';document.getElementById('manualStart').value=rec.s;document.getElementById('manualEnd').value=rec.e;document.getElementById('manualNote').value=rec.note||'';document.getElementById('manualEditId').value=rec.id;document.getElementById('saveManualBtn').textContent='Salvar ajuste';document.getElementById('cancelManualEdit').style.display='inline-flex';document.getElementById('manualFormTitle').textContent='Editar ajuste manual';checkManualForm();document.getElementById('manualClub').focus();}
function exitManualEdit(){document.getElementById('manualEditId').value='';document.getElementById('saveManualBtn').textContent='Adicionar ajuste manual';document.getElementById('cancelManualEdit').style.display='none';document.getElementById('manualFormTitle').textContent='Ajuste manual pontual';clearManualForm();}
document.getElementById('cancelManualEdit').onclick=exitManualEdit;
document.getElementById('saveManualBtn').onclick=()=>{const id=document.getElementById('manualEditId').value;if(!id){saveManual();return}const m=readManualForm();if(!checkManualForm())return;const rec=data.manual.find(x=>x.id===id&&x.active!==false);if(!rec)return;const before={...rec};Object.assign(rec,m);log('Ajuste manual editado',`${arena(rec.a)?.name||rec.a} · ${rec.r} · ${rec.date} · ${rec.club} · ${rec.s}–${rec.e}`,{area:'Ajuste Manual',record:rec.club||rec.id,change:prettyDiff(before,rec,[['a','Arena'],['r','Recurso'],['date','Data'],['club','Clube'],['sport','Modalidade'],['origin','Vínculo'],['s','Início'],['e','Fim'],['note','Observação']])});exitManualEdit();renderMasters();renderPlanner();renderHome();renderPublic();};
function removeManual(id){const rec=data.manual.find(x=>x.id===id&&x.active!==false);if(!rec)return;if(!confirm(`Excluir o ajuste manual de ${rec.club} em ${fmtDate(rec.date)} (${rec.s}–${rec.e})?`))return;rec.active=false;log('Ajuste manual excluído',`${rec.club} · ${fmtDate(rec.date)} · ${rec.s}–${rec.e}`);renderMasters();renderPlanner();renderHome();renderPublic();}
function renderManuals(){
 const el=document.getElementById('manualTable');if(!el)return;
 const arr=data.manual.filter(x=>x.active!==false).sort((a,b)=>a.date.localeCompare(b.date)||a.s.localeCompare(b.s));
 el.innerHTML=arr.length?`<table class="table"><thead><tr><th>Data</th><th>Arena</th><th>Recurso</th><th>Clube</th><th>Modalidade</th><th>Horário</th><th>Observação</th><th></th></tr></thead><tbody>${arr.map(m=>`<tr><td>${fmtDate(m.date)}</td><td>${arena(m.a)?.name||m.a}</td><td>${m.r}</td><td>${m.club}</td><td>${m.sport||'—'}</td><td>${m.s}–${m.e}</td><td>${m.note||'—'}</td><td><button class="btn small" onclick="editManual('${m.id}')">Editar</button> <button class="btn small danger" onclick="removeManual('${m.id}')">Excluir</button></td></tr>`).join('')}</tbody></table>`:'<div class="empty">Nenhum ajuste manual ativo.</div>';
 const c=document.getElementById('manualCount');if(c)c.textContent=`${arr.length} ajuste${arr.length===1?'':'s'}`;
}

let eventBlockCount=0;
function blockHtml(b={}){
 const defaultStart=b.startDate||document.getElementById('eventStart')?.value||isoToday();
 const defaultEnd=b.endDate||document.getElementById('eventEnd')?.value||defaultStart;
 const selectedArena=b.a||data.arenas[0]?.id||'';
 const action=b.action||'suspend';
 const arenaOptions=data.arenas.map(a=>`<option value="${a.id}" ${a.id===selectedArena?'selected':''}>${a.name}</option>`).join('');
 return `<div class="event-block"><div class="grid4"><div class="field"><label>ARENA / ESPAÇO</label><select class="eb-arena">${arenaOptions}</select></div><div class="field"><label>RECURSO</label><select class="eb-resource"></select></div><div class="field"><label>DATA INICIAL DO BLOCO</label><input class="eb-startDate" type="date" value="${defaultStart}"></div><div class="field"><label>DATA FINAL DO BLOCO</label><input class="eb-endDate" type="date" value="${defaultEnd}"></div></div><div class="grid4" style="margin-top:10px"><div class="field"><label>INÍCIO</label><input class="eb-s" type="time" value="${b.s||'08:00'}"></div><div class="field"><label>FIM</label><input class="eb-e" type="time" value="${b.e||'18:00'}"></div><div class="field"><label>CONFLITO</label><select class="eb-action"><option value="suspend" ${action==='suspend'?'selected':''}>Suspender reserva conflitante</option><option value="block" ${action==='block'?'selected':''}>Bloquear criação</option></select></div><div class="field" style="justify-content:end"><span>&nbsp;</span><button type="button" class="btn small danger eb-remove">Remover bloco</button></div></div></div>`;
}

function addEventBlock(b={}){
 const wrap=document.getElementById('eventBlocks');
 const tmp=document.createElement('div');tmp.innerHTML=blockHtml(b);
 const block=tmp.firstElementChild;wrap.appendChild(block);
 const arenaSel=block.querySelector('.eb-arena');
 const resSel=block.querySelector('.eb-resource');
 const requested=b.r||'__ALL__';
 function loadResources(){
   const a=arena(arenaSel.value);
   resSel.innerHTML='';
   if(!a){resSel.innerHTML='<option value="__ALL__">Nenhum recurso</option>';return;}
   const all=document.createElement('option');all.value='__ALL__';all.textContent='Toda a arena';resSel.appendChild(all);
   a.resources.forEach(r=>{const o=document.createElement('option');o.value=r;o.textContent=r;resSel.appendChild(o)});
   resSel.value=(a.resources.includes(requested)||requested==='__ALL__')?requested:'__ALL__';
 }
 loadResources();
 arenaSel.addEventListener('change',()=>{loadResources();updateEventSummaries();});
 block.querySelector('.eb-remove').addEventListener('click',()=>{block.remove();updateEventSummaries();});
 block.addEventListener('change',updateEventSummaries);
 eventBlockCount++;updateEventSummaries();
}
function updateEventSummaries(){const blocks=[...document.querySelectorAll('#eventBlocks .event-block')];const arenas=[...new Set(blocks.map(b=>{const s=b.querySelector('.eb-arena');return s&&s.selectedOptions[0]?s.selectedOptions[0].textContent:''}).filter(Boolean))];const times=blocks.map(b=>{const sd=b.querySelector('.eb-startDate')?.value,ed=b.querySelector('.eb-endDate')?.value,ss=b.querySelector('.eb-s')?.value,ee=b.querySelector('.eb-e')?.value;return sd&&ed&&ss&&ee?`${fmtDate(sd)}–${fmtDate(ed)} · ${ss}–${ee}`:''}).filter(Boolean);const a=document.getElementById('eventArenaSummary'),t=document.getElementById('eventTimeSummary');if(a)a.value=arenas.join(', ');if(t)t.value=times.length===1?times[0]:times.length?`${times.length} blocos / horários` : ''}
function syncEventBlockDates(){const sd=document.getElementById('eventStart').value,ed=document.getElementById('eventEnd').value;document.querySelectorAll('#eventBlocks .event-block').forEach(b=>{const s=b.querySelector('.eb-startDate'),e=b.querySelector('.eb-endDate');if(s&&sd)s.value=sd;if(e&&ed)e.value=ed});updateEventSummaries();}
function toggleCtClosed(){const checked=!!document.getElementById('eventCtClosed')?.checked;const card=document.getElementById('eventBlocksCard');if(card)card.style.display=checked?'none':'';const a=document.getElementById('eventArenaSummary'),t=document.getElementById('eventTimeSummary');if(checked){if(a)a.value='TODAS AS ARENAS';if(t)t.value='CT FECHADO · dia inteiro';const box=document.getElementById('eventCheck');if(box){box.className='banner warn';box.textContent='CT Fechado ativado. Todas as arenas serão bloqueadas no período informado.';}}else updateEventSummaries();}
function readEventForm(){const name=document.getElementById('eventName').value.trim();const category=document.getElementById('eventCategory').value;const s=document.getElementById('eventStart').value,e=document.getElementById('eventEnd').value;const ctClosed=!!document.getElementById('eventCtClosed')?.checked;const ops={category,ctClosed,responsible:document.getElementById('eventResponsible').value.trim(),requester:document.getElementById('eventRequester').value.trim(),modalities:document.getElementById('eventModalities').value.trim(),publicAudience:Number(document.getElementById('eventPublicAudience').value)||0,generalTime:document.getElementById('eventGeneralTime').value.trim(),meals:Number(document.getElementById('eventMeals').value)||0,lodging:Number(document.getElementById('eventLodging').value)||0,centerCost:document.getElementById('eventCostCenter').value.trim(),athletes:Number(document.getElementById('eventAthletes').value)||0,committee:Number(document.getElementById('eventCommittee').value)||0,publicNote:document.getElementById('eventPublicNote').value.trim(),internalNote:document.getElementById('eventInternalNote').value.trim()};let blocks;if(ctClosed){blocks=data.arenas.map(a=>({a:a.id,r:'__ALL__',startDate:s,endDate:e,s:'00:00',e:'23:59',action:'suspend'}));}else{blocks=[...document.querySelectorAll('#eventBlocks .event-block')].map(b=>({a:b.querySelector('.eb-arena').value,r:b.querySelector('.eb-resource').value,startDate:b.querySelector('.eb-startDate').value,endDate:b.querySelector('.eb-endDate').value,s:b.querySelector('.eb-s').value,e:b.querySelector('.eb-e').value,action:b.querySelector('.eb-action').value}));}return {name,startDate:s,endDate:e,ops,blocks}}
function eventConflicts(ev){let hits=[];ev.blocks.forEach((b,i)=>{if(!b.startDate||!b.endDate||b.startDate>b.endDate||timeMin(b.s)>=timeMin(b.e))return;hits.push(...conflictsForBlock({...b,id:'temp',eventName:ev.name,blockIndex:i}).map(x=>({...x,blockIndex:i})))});return hits}
function renderConflictBox(hits,ev){const box=document.getElementById('eventCheck');const lodging=Number(ev.ops?.lodging)||0;let hostWarn='';if(lodging>0){let peak=0,peakDate='';let cur=ev.startDate;while(cur<=ev.endDate){const q=lodgingByDate(cur,ev,editingEventId);if(q.total>peak){peak=q.total;peakDate=cur}cur=addDays(cur,1)}if(peak>280)hostWarn=`<div style="margin-top:8px;padding:10px;border-radius:9px;background:#fff0ef;color:var(--bad);border:1px solid #efbbb5"><b>⚠ Conflito de hospedagem:</b> ${peak} pessoas em ${fmtDate(peakDate)} para capacidade de 280.</div>`;else hostWarn=`<div style="margin-top:8px;padding:10px;border-radius:9px;background:#eaf7ee;color:var(--good);border:1px solid #b9dfc4"><b>✓ Hospedagem:</b> pico previsto de ${peak}/280 pessoas.</div>`}if(!hits.length){box.className='banner good';box.innerHTML='<b>✓ Nenhum conflito de arena.</b> O evento pode ser criado.'+hostWarn;return}const closureHits=hits.filter(x=>x.type==='event'&&x.ctClosed);const grouped=hits.reduce((m,x)=>{const key=x.date+'|'+x.resource+'|'+(x.eventId||x.id||'');return (m[key]??=[]).push(x),m},{});box.className=closureHits.length?'banner bad':'banner warn';const closureNames=[...new Set(closureHits.map(x=>x.eventName).filter(Boolean))];const closureWarn=closureHits.length?`<div style="margin-bottom:8px;padding:10px;border-radius:9px;background:#fff0ef;color:var(--bad);border:1px solid #efbbb5"><b>⛔ CT FECHADO.</b> O período conflita com ${closureNames.map(n=>`<b>${n}</b>`).join(', ')}. Não é possível cadastrar outro evento enquanto o fechamento estiver ativo.</div>`:'';box.innerHTML=closureWarn+'<b>⚠ Conflitos encontrados: '+Object.keys(grouped).length+'</b><div style="margin-top:6px">'+Object.values(grouped).slice(0,12).map(arr=>{const x=arr[0];const who=x.type==='event'&&x.ctClosed?`CT FECHADO · ${x.eventName}`:(x.club||x.eventName);return `${fmtDate(x.date)} · ${arena(x.a).name} · ${x.resource} · ${who} · ${x.s}–${x.e}`}).join('<br>')+'</div><div style="margin-top:8px">'+(closureHits.length?'O fechamento do CT tem prioridade sobre qualquer nova reserva ou evento.':'A ação escolhida no bloco define se a reserva será suspensa ou se o conflito impede a criação.')+'</div>'+hostWarn}
let editingEventId=null;
document.getElementById('addEventBlock').onclick=()=>addEventBlock();document.getElementById('eventExample').onclick=()=>{document.getElementById('eventName').value='Campeonato Brasileiro – Exemplo';document.getElementById('eventCategory').value='Competição';document.getElementById('eventModalities').value='Bocha, Judô e Natação';document.getElementById('eventPublicAudience').value='500';document.getElementById('eventRequester').value='CBDV';document.getElementById('eventResponsible').value='Operações Esportivas';document.getElementById('eventGeneralTime').value='08:00 às 18:00';document.getElementById('eventMeals').value='180';document.getElementById('eventLodging').value='0';document.getElementById('eventCostCenter').value='Confederação / Projeto DEMO';document.getElementById('eventAthletes').value='180';document.getElementById('eventCommittee').value='35';document.getElementById('eventPublicNote').value='Alterações na programação podem ocorrer durante o evento';document.getElementById('eventInternalNote').value='Validar montagem com áreas responsáveis';document.getElementById('eventStart').value=addDays(isoToday(),1);document.getElementById('eventEnd').value=addDays(isoToday(),3);document.getElementById('eventBlocks').innerHTML='';addEventBlock({a:'bocha',r:'__ALL__',s:'09:00',e:'18:00'});addEventBlock({a:'judo',r:'Dojo',s:'08:00',e:'20:00'});addEventBlock({a:'p50',r:'__ALL__',s:'07:00',e:'18:00'});};document.getElementById('eventStart').addEventListener('change',syncEventBlockDates);document.getElementById('eventEnd').addEventListener('change',syncEventBlockDates);document.getElementById('eventCtClosed').addEventListener('change',toggleCtClosed);
document.getElementById('checkEvent').onclick=()=>{const ev=readEventForm();if(!ev.name||!ev.ops?.category||!ev.startDate||!ev.endDate||ev.startDate>ev.endDate||!ev.blocks.length){document.getElementById('eventCheck').className='banner bad';document.getElementById('eventCheck').textContent='Preencha nome, categoria, período e pelo menos um bloco.';return}const ov=eventOperatingViolations(ev);if(ov.length){const box=document.getElementById('eventCheck');box.className='banner bad';box.innerHTML='<b>⛔ Evento fora do horário de funcionamento.</b><div style="margin-top:6px">'+ov.map(v=>`${v.arena?.name||v.block.a}: ${v.block.s}–${v.block.e} · funcionamento ${v.hours.open}–${v.hours.close}`).join('<br>')+'</div>';return}renderConflictBox(eventConflicts(ev),ev)};
document.getElementById('createEvent').onclick=()=>{const ev=readEventForm();if(!ev.name||!ev.ops?.category||!ev.startDate||!ev.endDate||ev.startDate>ev.endDate||!ev.blocks.length){alert('Preencha os dados do evento, incluindo a categoria.');return}const ov=eventOperatingViolations(ev);if(ov.length){alert('O evento possui bloco(s) fora do horário de funcionamento da arena:\n\n'+ov.map(v=>`${v.arena?.name||v.block.a}: ${v.block.s}–${v.block.e} (funcionamento ${v.hours.open}–${v.hours.close})`).join('\n'));return}const oldEvent=editingEventId?data.events.find(x=>x.id===editingEventId):null;const oldActiveSusp=editingEventId?data.suspensions.filter(x=>x.eventId===editingEventId&&x.active):[];if(oldEvent)oldEvent.active=false;oldActiveSusp.forEach(x=>x.active=false);const hits=eventConflicts(ev);if(oldEvent)oldEvent.active=true;oldActiveSusp.forEach(x=>x.active=true);const manualHits=hits.filter(h=>h.type==='manual');const closureHits=ev.ops?.ctClosed?[]:hits.filter(h=>h.type==='event'&&h.ctClosed);const blocking=ev.ops?.ctClosed?[]:hits.filter(h=>ev.blocks[h.blockIndex]?.action==='block').concat(manualHits,closureHits);if(blocking.length){renderConflictBox(hits,ev);alert(closureHits.length?'O evento não foi salvo porque o CT está FECHADO no período selecionado. Confira o evento de fechamento antes de continuar.':manualHits.length?'O evento não foi salvo porque há conflito com um ajuste manual já autorizado. Revise o ajuste ou o horário do evento.':'O evento não foi salvo porque há conflito em um bloco configurado para bloquear.');return}let event;const eventBefore=oldEvent?structuredClone(oldEvent):null;if(oldEvent){oldActiveSusp.forEach(x=>x.active=false);event=oldEvent;Object.assign(event,{name:ev.name,startDate:ev.startDate,endDate:ev.endDate,active:true,ops:ev.ops,blocks:ev.blocks.map(b=>{const x={...b};delete x.action;return x})});}else{event={id:uid('ev'),name:ev.name,startDate:ev.startDate,endDate:ev.endDate,active:true,ops:ev.ops,blocks:ev.blocks.map(b=>{const x={...b};delete x.action;return x})};data.events.push(event)}let suspended=0;hits.filter(h=>h.type==='master').forEach(h=>{const b=ev.blocks[h.blockIndex];if(b&&b.action==='suspend'){if(!isSuspended(h.id,h.date)){data.suspensions.push({id:uid('s'),masterId:h.id,a:h.a,r:h.resource,date:h.date,s:h.s,e:h.e,club:h.club||'',sport:h.sport||'',eventId:event.id,eventName:event.name,active:true});suspended++}}});log(oldEvent?'Evento editado':'Evento criado',`${event.name} · ${fmtDate(event.startDate)}–${fmtDate(event.endDate)} · ${event.blocks.length} blocos · ${suspended} suspensões`,{area:'Eventos',record:event.name,change:oldEvent?prettyDiff({name:eventBefore.name,startDate:eventBefore.startDate,endDate:eventBefore.endDate,category:eventBefore.ops?.category||'',ctClosed:!!eventBefore.ops?.ctClosed,lodging:eventBefore.ops?.lodging||0,meals:eventBefore.ops?.meals||0,centerCost:eventBefore.ops?.centerCost||eventBefore.ops?.paymentResponsible||'',publicAudience:eventBefore.ops?.publicAudience||0},{name:event.name,startDate:event.startDate,endDate:event.endDate,category:event.ops?.category||'',ctClosed:!!event.ops?.ctClosed,lodging:event.ops?.lodging||0,meals:event.ops?.meals||0,centerCost:event.ops?.centerCost||event.ops?.paymentResponsible||'',publicAudience:event.ops?.publicAudience||0},[['name','Nome'],['category','Categoria'],['ctClosed','CT fechado'],['startDate','Data inicial'],['endDate','Data final'],['publicAudience','Público'],['meals','Alimentação'],['lodging','Hospedagem'],['centerCost','Centro de custo']]):'Novo evento cadastrado.'});resetEventForm();renderEvents();renderLodging();renderPlanner();renderHome();renderPublic();alert(`${oldEvent?'Evento atualizado':'Evento criado'}.${event.ops?.ctClosed?' CT FECHADO: todas as arenas bloqueadas no período.':''} ${suspended} ocorrência(s) da programação fixa foram suspensa(s).`)};
function resetEventForm(){editingEventId=null;document.getElementById('eventFormTitle').textContent='Novo evento';document.getElementById('createEvent').textContent='Criar evento';document.getElementById('cancelEventEdit').style.display='none';document.getElementById('eventCategory').value='';const ct=document.getElementById('eventCtClosed');if(ct)ct.checked=false;['eventName','eventModalities','eventRequester','eventResponsible','eventGeneralTime','eventCostCenter','eventTimeSummary','eventPublicNote','eventInternalNote'].forEach(id=>{const el=document.getElementById(id);if(el)el.value=''});['eventPublicAudience','eventMeals','eventLodging','eventAthletes','eventCommittee'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='0'});document.getElementById('eventStart').value=isoToday();document.getElementById('eventEnd').value=isoToday();document.getElementById('eventBlocks').innerHTML='';addEventBlock();document.getElementById('eventCheck').className='banner warn';document.getElementById('eventCheck').textContent='Adicione espaços e verifique.';toggleCtClosed();}
function editEvent(id){const ev=data.events.find(x=>x.id===id);if(!ev||ev.active===false)return;editingEventId=id;document.getElementById('eventFormTitle').textContent='Editar evento';document.getElementById('createEvent').textContent='Salvar alterações';document.getElementById('cancelEventEdit').style.display='inline-flex';document.getElementById('eventName').value=ev.name||'';document.getElementById('eventCategory').value=ev.ops?.category||'';document.getElementById('eventCtClosed').checked=!!ev.ops?.ctClosed;document.getElementById('eventStart').value=ev.startDate||'';document.getElementById('eventEnd').value=ev.endDate||'';document.getElementById('eventModalities').value=ev.ops?.modalities||'';document.getElementById('eventPublicAudience').value=ev.ops?.publicAudience||0;document.getElementById('eventRequester').value=ev.ops?.requester||'';document.getElementById('eventResponsible').value=ev.ops?.responsible||'';document.getElementById('eventGeneralTime').value=ev.ops?.generalTime||'';document.getElementById('eventMeals').value=ev.ops?.meals||0;document.getElementById('eventLodging').value=ev.ops?.lodging||0;document.getElementById('eventCostCenter').value=ev.ops?.centerCost||ev.ops?.paymentResponsible||'';document.getElementById('eventAthletes').value=ev.ops?.athletes||0;document.getElementById('eventCommittee').value=ev.ops?.committee||0;document.getElementById('eventPublicNote').value=ev.ops?.publicNote||'';document.getElementById('eventInternalNote').value=ev.ops?.internalNote||ev.ops?.observation||'';document.getElementById('eventBlocks').innerHTML='';if(!ev.ops?.ctClosed)ev.blocks.forEach(b=>addEventBlock({...b,action:'suspend'}));toggleCtClosed();updateEventSummaries();document.getElementById('eventCheck').className='banner warn';document.getElementById('eventCheck').textContent='Evento carregado para edição. Verifique os conflitos antes de salvar.';document.getElementById('view-event').scrollIntoView({behavior:'smooth',block:'start'});}
document.getElementById('cancelEventEdit').onclick=resetEventForm;
function renderEvents(){const arr=[...data.events].sort((a,b)=>a.startDate.localeCompare(b.startDate));document.getElementById('eventTable').innerHTML=arr.length?`<table class="table"><thead><tr><th>Evento</th><th>Categoria</th><th>Período</th><th>Arenas</th><th>Modalidade(s)</th><th>Público</th><th>Solicitante</th><th>Alimentação</th><th>Hospedagem</th><th>Atletas</th><th>Centro de custo</th><th>Suspensões</th><th>Status</th><th></th></tr></thead><tbody>${arr.map(ev=>`<tr><td>${ev.name}${ev.ops?.ctClosed?' <span class="chip" style="margin-left:6px;color:var(--bad)">CT FECHADO</span>':''}</td><td>${ev.ops?.category||'—'}</td><td>${fmtDate(ev.startDate)}–${fmtDate(ev.endDate)}</td><td>${[...new Set(ev.blocks.map(b=>arena(b.a).name))].join(', ')}</td><td>${ev.ops?.modalities||'—'}</td><td>${ev.ops?.publicAudience||0}</td><td>${ev.ops?.requester||'—'}</td><td>${ev.ops?.meals||0}</td><td>${ev.ops?.lodging||0}</td><td>${ev.ops?.athletes||0}</td><td>${ev.ops?.centerCost||ev.ops?.paymentResponsible||'—'}</td><td>${data.suspensions.filter(s=>s.eventId===ev.id&&s.active).length}</td><td>${ev.active===false?'Cancelado':'Ativo'}</td><td><button class="btn small" onclick="openEvent('${ev.id}')">Detalhes</button> ${ev.active!==false?`<button class="btn small" onclick="editEvent('${ev.id}')">Editar</button> <button class="btn small danger" onclick="cancelEvent('${ev.id}')">Cancelar + restaurar</button>`:''}</td></tr>`).join('')}</tbody></table>`:'<div class="empty">Nenhum evento cadastrado.</div>'}
function openEvent(id){const ev=data.events.find(x=>x.id===id);if(!ev)return;showDetail({status:'event',eventName:ev.name,startDate:ev.startDate,endDate:ev.endDate,blocks:ev.blocks,active:ev.active,ops:ev.ops,susp:data.suspensions.filter(s=>s.eventId===id&&s.active)})}
function cancelEvent(id){const ev=data.events.find(x=>x.id===id);if(!ev||ev.active===false)return;if(!confirm(`Cancelar o evento "${ev.name}" e restaurar as reservas suspensas?`))return;ev.active=false;const active=data.suspensions.filter(s=>s.eventId===id&&s.active);active.forEach(s=>s.active=false);log('Evento cancelado',`${ev.name} · ${active.length} suspensão(ões) restaurada(s)`);save();renderEvents();renderPlanner();renderHome();renderPublic();renderLodging();}
document.getElementById('clearEvents').onclick=()=>{if(!data.events.length){alert('Não há eventos cadastrados.');return}if(!confirm('Remover todos os eventos e restaurar todas as suspensões geradas por eles? A programação fixa será preservada.'))return;const n=data.events.length;const s=data.suspensions.filter(x=>x.active).length;data.events=[];data.suspensions.forEach(x=>x.active=false);log('Eventos limpos',`${n} evento(s) removido(s); ${s} suspensão(ões) restaurada(s)`);renderEvents();renderPlanner();renderHome();renderPublic();renderLodging();alert('Eventos removidos. A programação fixa foi preservada.');};

function monthBounds(month){const m=month||new Date().toISOString().slice(0,7);const start=m+'-01';const next=new Date(start+'T12:00:00');next.setMonth(next.getMonth()+1);const nextIso=next.toISOString().slice(0,10);const end=addDays(nextIso,-1);return {start,end,month:m}}
function lodgingByDate(date,extraEvent,excludeEventId=null){let total=0,items=[];data.events.forEach(ev=>{if(ev.active===false) return;if(excludeEventId&&ev.id===excludeEventId)return;if(ev.startDate<=date&&date<=ev.endDate){const q=Number(ev.ops?.lodging)||0;if(q>0){total+=q;items.push({event:ev.name,count:q,eventId:ev.id})}}});if(extraEvent&&extraEvent.startDate<=date&&date<=extraEvent.endDate){const q=Number(extraEvent.ops?.lodging)||0;if(q>0){total+=q;items.push({event:extraEvent.name,count:q,eventId:extraEvent.id||'preview'})}}return {total,items}}
function renderLodging(){const CAPACITY=280;const month=document.getElementById('lodgingMonth').value||new Date().toISOString().slice(0,7);document.getElementById('lodgingMonth').value=month;const b=monthBounds(month);const dates=[];let cur=b.start;while(cur<=b.end){dates.push(cur);cur=addDays(cur,1)}const activeEvents=data.events.filter(e=>e.active!==false&&e.endDate>=b.start&&e.startDate<=b.end);document.getElementById('lodgingEventCount').textContent=activeEvents.length;let rows='';dates.forEach(d=>{const x=lodgingByDate(d);const pct=Math.round(x.total/CAPACITY*100);const cls=pct>90?'bad':pct>70?'warn':'ok';const superlotacao=x.total>CAPACITY;const status=superlotacao?'SUPERLOTAÇÃO':pct>90?'ALTA OCUPAÇÃO':pct>70?'ATENÇÃO':'OK';const statusColor=cls==='bad'?'var(--bad)':cls==='warn'?'var(--warn)':'var(--good)';rows+=`<div style="display:grid;grid-template-columns:90px 1fr 170px 120px;gap:12px;align-items:center;border-bottom:1px solid var(--border);padding:11px 0"><div><b>${fmtDate(d)}</b><div class="muted" style="font-size:11px">${dayNames[new Date(d+'T12:00:00').getDay()]}</div></div><div><div class="occbar"><div class="occ-${cls}" style="width:${Math.min(100,pct)}%"></div></div><div class="muted" style="font-size:11px;margin-top:4px">${x.items.length?x.items.map(i=>`${i.event}: ${i.count}`).join(' · '):'Sem hospedagem programada'}</div></div><div style="font-size:13px"><b>${x.total}</b> / ${CAPACITY} <span class="chip">${pct}%</span></div><div style="text-align:right;font-weight:850;color:${statusColor}">${status}</div></div>`});document.getElementById('lodgingGrid').innerHTML=rows||'<div class="empty">Nenhuma data no mês.</div>';document.getElementById('lodgingEvents').innerHTML=activeEvents.length?`<table class="table"><thead><tr><th>Evento</th><th>Período</th><th>Hospedagem/dia</th><th>Diárias totais</th></tr></thead><tbody>${activeEvents.map(e=>{const hosp=Number(e.ops?.lodging)||0;const from=e.startDate>b.start?e.startDate:b.start;const to=e.endDate<b.end?e.endDate:b.end;const days=from<=to?datesBetween(from,to).length:0;return `<tr><td>${e.name}</td><td>${fmtDate(e.startDate)}–${fmtDate(e.endDate)}</td><td>${hosp}</td><td>${hosp>0?(hosp*days).toLocaleString('pt-BR'):'—'}</td></tr>`}).join('')}</tbody></table>`:'<div class="empty">Nenhum evento ativo com hospedagem no mês.</div>'}

function minToClock(n){n=Math.max(0,Math.min(24*60,n));return `${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`}
function availabilityItems(date,aid,r){const h=arenaHours(aid),start=timeMin(h.open),end=timeMin(h.close);return allOccupancy(date,aid,r).filter(x=>timeMin(x.s)<end&&timeMin(x.e)>start)}
function availabilityAtMinute(items,aid,r,min){const active=items.filter(x=>timeMin(x.s)<=min&&min<timeMin(x.e));const events=active.filter(x=>x.type==='event');const uses=active.filter(x=>x.type==='master'||x.type==='manual');const cap=resourceCap(aid,r);if(events.length)return{kind:'event',available:0,used:uses.length,cap,active,detail:events.map(x=>x.eventName||'Evento').join(', ')};const available=Math.max(0,cap-uses.length);if(available===0)return{kind:'full',available,used:uses.length,cap,active,detail:uses.map(x=>x.club||'Uso').join(', ')};if(uses.length)return{kind:'partial',available,used:uses.length,cap,active,detail:uses.map(x=>x.club||'Uso').join(', ')};return{kind:'free',available:cap,used:0,cap,active:[],detail:'Livre'}}
function resourceAvailability(date,aid,r,minDuration){const items=availabilityItems(date,aid,r),h=arenaHours(aid),start=timeMin(h.open),end=timeMin(h.close);const states=[];for(let m=start;m<end;m++)states.push(availabilityAtMinute(items,aid,r,m));const windows=[];let ws=null,minSlots=Infinity;for(let i=0;i<=states.length;i++){const st=i<states.length?states[i]:null;if(st&&st.available>0){if(ws===null){ws=start+i;minSlots=st.available}else minSlots=Math.min(minSlots,st.available)}else if(ws!==null){const we=start+i;if(we-ws>=minDuration)windows.push({s:ws,e:we,duration:we-ws,minSlots});ws=null;minSlots=Infinity}}
 const segs=[];let ss=start,prev=states[0];for(let i=1;i<=states.length;i++){const st=i<states.length?states[i]:null;const same=st&&prev&&st.kind===prev.kind&&st.available===prev.available&&st.used===prev.used&&st.detail===prev.detail;if(!same){segs.push({s:ss,e:start+i,...prev});ss=start+i;prev=st}}
 const blocked=[];let bs=null,btype='';for(let i=0;i<=states.length;i++){const st=i<states.length?states[i]:null;const isBlocked=st&&st.available===0;if(isBlocked&&bs===null){bs=start+i;btype=st.kind}else if((!isBlocked)&&bs!==null){blocked.push({s:bs,e:start+i,type:btype});bs=null}}
 return{items,windows,segs,blocked}}
function renderAvailability(){fillArenaSelect('availabilityArena',true);fillArenaSelect('indicatorArena',true);const dateEl=document.getElementById('availabilityDate');if(!dateEl.value)dateEl.value=isoToday();const date=dateEl.value,sel=document.getElementById('availabilityArena').value||'ALL',minDuration=Math.max(15,Math.floor(Number(document.getElementById('availabilityMin').value)||60));document.getElementById('availabilityMin').value=minDuration;const arenasToCheck=sel==='ALL'?data.arenas:data.arenas.filter(a=>a.id===sel);if(!arenasToCheck.length)return;const dayNames=['Domingo','Segunda-feira','Terça-feira','Quarta-feira','Quinta-feira','Sexta-feira','Sábado'];let totalWindows=0,totalBlocks=0,totalResources=0;const grouped=arenasToCheck.map(a=>{const results=a.resources.map(r=>{const q=resourceAvailability(date,a.id,r,minDuration);totalWindows+=q.windows.length;totalBlocks+=q.blocked.length;totalResources++;return{aid:a.id,arenaName:a.name,r,...q}});return{a,results}});document.getElementById('availabilityWindows').textContent=totalWindows;document.getElementById('availabilityWindowsSub').textContent=`≥ ${minDuration} min em ${fmtDate(date)}`;document.getElementById('availabilityResources').textContent=totalResources;document.getElementById('availabilityBlocks').textContent=totalBlocks;document.getElementById('availabilityDay').textContent=dayNames[new Date(date+'T12:00:00').getDay()];document.getElementById('availabilityTitle').textContent=`${sel==='ALL'?'Todas as arenas':arenasToCheck[0].name} · ${fmtDate(date)}${sel==='ALL'?'':` · ${hoursLabel(arenasToCheck[0].id)}`}`;
 const scale='<div class="availability-scale"><span>07h</span><span>09h</span><span>11h</span><span>13h</span><span>15h</span><span>17h</span><span>19h</span><span style="text-align:right">21h</span></div>';
 const renderResource=q=>{const cap=resourceCap(q.aid,q.r);const segs=q.segs.map(seg=>{const left=((seg.s-420)/840)*100,width=((seg.e-seg.s)/840)*100;let label='';if(seg.kind==='event'){label=width>=10?(seg.detail||'Evento'):(width>=5?'Evento':'');}else if(seg.kind==='partial'||seg.kind==='full'){label=width>=12?(seg.detail||'Treinamento'):(width>=7?(seg.kind==='partial'?`${seg.available} vaga${seg.available===1?'':'s'}`:'Sem vaga'):'');}else if(seg.kind==='free'&&width>=7){label=`${seg.available} vaga${seg.available===1?'':'s'}`;}const title=`${minToClock(seg.s)}–${minToClock(seg.e)} · ${seg.kind==='free'?'Livre':seg.kind==='partial'?`Uso parcial (${seg.used}/${seg.cap}) · ${seg.detail||'Treinamento'}`:seg.kind==='event'?`Evento: ${seg.detail}`:`Capacidade atingida (${seg.used}/${seg.cap}) · ${seg.detail||'Treinamento'}`}`;return `<div class="availability-seg ${seg.kind}" style="left:${left}%;width:${width}%" title="${title.replace(/"/g,'&quot;')}">${label}</div>`}).join('');const chips=q.windows.length?q.windows.map(w=>`<span class="window-chip">✓ ${minToClock(w.s)}–${minToClock(w.e)} (${w.duration} min) · ${w.minSlots} vaga${w.minSlots===1?'':'s'}+</span>`).join(''):`<div class="availability-empty">Nenhuma janela com pelo menos ${minDuration} minutos livres neste recurso.</div>`;const trainingItems=q.items.filter(x=>x.type==='master'||x.type==='manual'),eventItems=q.items.filter(x=>x.type==='event');const trainingList=trainingItems.length?`<div class="avail-note" style="margin-top:8px"><b>Treinamentos:</b> ${trainingItems.map(x=>`${x.s}–${x.e} · ${x.club||'Instituição não informada'}${x.sport?` — ${x.sport}`:''}${x.type==='manual'?' (ajuste manual)':''}`).join(' &nbsp;|&nbsp; ')}</div>`:'';const eventList=eventItems.length?`<div class="avail-note" style="margin-top:6px"><b>Eventos:</b> ${eventItems.map(x=>`${x.s}–${x.e} · ${x.eventName||'Evento'}`).join(' &nbsp;|&nbsp; ')}</div>`:'';return `<div class="availability-resource"><div class="availability-resource-head"><div><b>${q.r}</b><div class="muted" style="font-size:11px;margin-top:3px">Limite simultâneo: ${cap} clube${cap===1?'':'s'} · ${trainingItems.length} treinamento(s) no dia · ${eventItems.length} bloco(s) de evento</div></div><span class="chip">${q.windows.length} janela${q.windows.length===1?'':'s'}</span></div><div class="availability-resource-body">${scale}<div class="availability-track">${segs}</div>${trainingList}${eventList}<div>${chips}</div></div></div>`};
 document.getElementById('availabilityResults').innerHTML=grouped.map(g=>`<div style="margin-top:18px"><div class="section-title" style="margin-bottom:8px">${g.a.name}</div>${g.results.map(renderResource).join('')||'<div class="empty">Nenhum recurso cadastrado nesta arena.</div>'}</div>`).join('')||'<div class="empty">Nenhuma arena cadastrada.</div>'}
document.getElementById('availabilitySearch').onclick=renderAvailability;document.getElementById('availabilityArena').addEventListener('change',renderAvailability);document.getElementById('availabilityDate').addEventListener('change',renderAvailability);document.getElementById('availabilityMin').addEventListener('change',renderAvailability);document.getElementById('availabilityToday').onclick=()=>{document.getElementById('availabilityDate').value=isoToday();renderAvailability()};document.getElementById('availabilityTomorrow').onclick=()=>{document.getElementById('availabilityDate').value=addDays(isoToday(),1);renderAvailability()};


let lastReport={title:'',headers:[],rows:[]};

function reportEventInstitution(ev){return eventInstitution(ev)}
function reportEventModalities(ev){return eventModalitiesList(ev)}

function reportDateRange(){
 const start=document.getElementById('reportStart').value||`${new Date().getFullYear()}-01-01`;
 const end=document.getElementById('reportEnd').value||isoToday();
 return start<=end?{start,end}:{start:end,end:start};
}
function eventOverlapsRange(ev,start,end){return ev.active!==false&&ev.startDate<=end&&ev.endDate>=start}
function eventMatchesReportFilters(ev){
 const aid=document.getElementById('reportArena').value||'ALL';
 const inst=document.getElementById('reportInstitution').value||'ALL';
 const mod=document.getElementById('reportModality').value||'ALL';
 const cat=document.getElementById('reportCategory').value||'ALL';
 if(cat!=='ALL'&&(ev.ops?.category||'')!==cat)return false;
 if(inst!=='ALL'&&reportEventInstitution(ev)!==inst)return false;
 if(mod!=='ALL'&&!reportEventModalities(ev).includes(mod))return false;
 if(aid!=='ALL'&&!ev.ops?.ctClosed&&!(ev.blocks||[]).some(b=>b.a===aid))return false;
 return true;
}
function csvEscape(v){
 const str=(v??'').toString().replace(/\r?\n/g,' ');
 return /[;"\n]/.test(str)?`"${str.replace(/"/g,'""')}"`:str;
}
function downloadCsv(filename,headers,rows){
 const content='\ufeff'+[headers,...rows].map(r=>r.map(csvEscape).join(';')).join('\r\n');
 const blob=new Blob([content],{type:'text/csv;charset=utf-8;'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
function reportTable(headers,rows){
 if(!rows.length)return '<div class="empty">Nenhum registro encontrado para os filtros selecionados.</div>';
 return `<table class="table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${c??'—'}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}
function reportKpis(items){
 document.getElementById('reportSummary').innerHTML=items.map(x=>`<div class="report-kpi"><div class="label">${x.label}</div><div class="value">${x.value}</div></div>`).join('');
}
function reportTrainingOccurrences(start,end,aid='ALL'){
 const rows=[];
 for(let d=start;d<=end;d=addDays(d,1)){
  data.arenas.forEach(a=>{
   if(aid!=='ALL'&&a.id!==aid)return;
   a.resources.forEach(r=>{
    const seen=new Set();
    allOccupancy(d,a.id,r).filter(x=>x.type==='master'||x.type==='manual').forEach(x=>{
     const key=[x.id,x.type,d,a.id,r,x.s,x.e].join('|');if(seen.has(key))return;seen.add(key);
     rows.push({date:d,arena:a.name,resource:r,club:x.club||'—',sport:x.sport||'—',origin:x.origin||'external',s:x.s,e:x.e,type:x.type});
    });
   });
  });
 }
 return rows;
}
function reportArenaHours(start,end){
 const out={};
 for(let d=start;d<=end;d=addDays(d,1)){
  data.arenas.forEach(a=>{
   a.resources.forEach(r=>{
    const key=`${a.name} · ${r}`;out[key]??={event:0,training:0};
    const seenEvent=new Set(),seenTraining=new Set();
    allOccupancy(d,a.id,r).forEach(x=>{
     const mins=Math.max(0,timeMin(x.e)-timeMin(x.s));
     if(x.type==='event'){
      const k=[x.eventId,x.s,x.e].join('|');if(!seenEvent.has(k)){seenEvent.add(k);out[key].event+=mins/60}
     }else if(x.type==='master'||x.type==='manual'){
      const k=[x.id,x.type,x.s,x.e].join('|');if(!seenTraining.has(k)){seenTraining.add(k);out[key].training+=mins/60}
     }
    });
   });
  });
 }
 return out;
}
function populateReportFilters(){
 fillArenaSelect('reportArena',true);
 const evs=data.events.filter(e=>e.active!==false);
 const insts=[...new Set(evs.map(reportEventInstitution).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 const mods=[...new Set(evs.flatMap(reportEventModalities))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 const cats=[...new Set(evs.map(e=>e.ops?.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 const configs=[['reportInstitution',insts],['reportModality',mods],['reportCategory',cats]];
 configs.forEach(([id,arr])=>{const el=document.getElementById(id),old=el.value||'ALL';el.innerHTML='<option value="ALL">Todas</option>'+arr.map(v=>`<option>${v}</option>`).join('');if([...el.options].some(o=>o.value===old))el.value=old});
}
function renderReports(){
 populateReportFilters();
 const {start,end}=reportDateRange(),type=document.getElementById('reportType').value;
 const aid=document.getElementById('reportArena').value||'ALL';
 let headers=[],rows=[],title='',kpis=[];
 if(type==='events'){
  const evs=data.events.filter(e=>eventOverlapsRange(e,start,end)&&eventMatchesReportFilters(e));
  title='Relatório de eventos';
  headers=['Evento','Início','Fim','Categoria','Modalidade(s)','Instituição','Arena(s)','Atletas','Comissão','Público','Alimentação','Hospedagem','Centro de custo'];
  rows=evs.map(ev=>[ev.name,fmtDate(ev.startDate),fmtDate(ev.endDate),ev.ops?.category||'—',reportEventModalities(ev).join(', ')||'—',reportEventInstitution(ev),ev.ops?.ctClosed?'CT FECHADO':[...new Set((ev.blocks||[]).map(b=>arena(b.a)?.name).filter(Boolean))].join(', '),Number(ev.ops?.athletes)||0,Number(ev.ops?.committee)||0,Number(ev.ops?.publicAudience)||0,Number(ev.ops?.meals)||0,Number(ev.ops?.lodging)||0,ev.ops?.centerCost||ev.ops?.paymentResponsible||'—']);
  kpis=[{label:'Eventos',value:evs.length},{label:'Atletas',value:evs.reduce((n,e)=>n+(Number(e.ops?.athletes)||0),0)},{label:'Público',value:evs.reduce((n,e)=>n+(Number(e.ops?.publicAudience)||0),0)},{label:'Alimentação',value:evs.reduce((n,e)=>n+(Number(e.ops?.meals)||0),0)},{label:'Hospedagem',value:evs.reduce((n,e)=>n+(Number(e.ops?.lodging)||0),0)}];
 }else if(type==='training'){
  const occ=reportTrainingOccurrences(start,end,aid);
  title='Relatório de programação / treinamentos';
  headers=['Data','Arena','Recurso','Clube / Instituição','Modalidade','Origem','Início','Fim','Tipo'];
  rows=occ.map(x=>[fmtDate(x.date),x.arena,x.resource,x.club,x.sport,x.origin==='cpb'?'CPB':'Externo',x.s,x.e,x.type==='manual'?'Ajuste manual':'Programação fixa']);
  kpis=[{label:'Ocorrências',value:occ.length},{label:'Instituições',value:new Set(occ.map(x=>x.club)).size},{label:'Modalidades',value:new Set(occ.map(x=>x.sport)).size},{label:'Horas',value:(occ.reduce((n,x)=>n+(timeMin(x.e)-timeMin(x.s)),0)/60).toFixed(1)}];
 }else if(type==='lodging'){
  title='Relatório de hospedagem';
  headers=['Data','Eventos com hospedagem','Hospedados','Capacidade','Ocupação','Status'];
  for(let d=start;d<=end;d=addDays(d,1)){
   const x=lodgingByDate(d),totalDia=Number(x.total)||0,pct=Math.round(totalDia/280*100);
   const eventos=x.items.length?x.items.map(i=>`${i.event} (${i.count})`).join(' · '):'—';
   rows.push([fmtDate(d),eventos,totalDia,280,`${pct}%`,totalDia>280?'SUPERLOTAÇÃO':pct>90?'ALTA':pct>70?'ATENÇÃO':'OK'])
  }
  const total=rows.reduce((n,r)=>n+Number(r[2]),0),max=Math.max(0,...rows.map(r=>Number(r[2])));
  kpis=[{label:'Diárias acumuladas',value:total},{label:'Maior ocupação',value:max},{label:'Capacidade diária',value:280},{label:'Dias superlotados',value:rows.filter(r=>Number(r[2])>280).length}];
 }else if(type==='institution'){
  const evs=data.events.filter(e=>eventOverlapsRange(e,start,end)&&eventMatchesReportFilters(e));
  title='Eventos por instituição e tipo';
  const cats=[...new Set(evs.map(e=>e.ops?.category||'Não informada'))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  headers=['Instituição',...cats,'Total'];
  const map={};evs.forEach(e=>{const i=reportEventInstitution(e),c=e.ops?.category||'Não informada';map[i]??={};map[i][c]=(map[i][c]||0)+1});
  rows=Object.keys(map).sort((a,b)=>a.localeCompare(b,'pt-BR')).map(i=>[i,...cats.map(c=>map[i][c]||0),Object.values(map[i]).reduce((a,b)=>a+b,0)]);
  kpis=[{label:'Instituições',value:rows.length},{label:'Eventos',value:evs.length},{label:'Categorias',value:cats.length},{label:'Modalidades',value:new Set(evs.flatMap(reportEventModalities)).size}];
 }else if(type==='arena'){
  title='Relatório de utilização das arenas';
  headers=['Arena / Recurso','Horas de eventos','Horas de treinamentos','Horas totais'];
  const usage=reportArenaHours(start,end);
  rows=Object.entries(usage).filter(([k])=>aid==='ALL'||k.startsWith((arena(aid)?.name||'')+' · ')).map(([k,v])=>[k,v.event.toFixed(1),v.training.toFixed(1),(v.event+v.training).toFixed(1)]).sort((a,b)=>Number(b[3])-Number(a[3]));
  kpis=[{label:'Recursos',value:rows.length},{label:'Horas eventos',value:rows.reduce((n,r)=>n+Number(r[1]),0).toFixed(1)},{label:'Horas treinamentos',value:rows.reduce((n,r)=>n+Number(r[2]),0).toFixed(1)},{label:'Horas totais',value:rows.reduce((n,r)=>n+Number(r[3]),0).toFixed(1)}];
 }else{
  title='Relatório do histórico de alterações';
  headers=['Data / Hora','Usuário','Área','Ação','Registro','Alteração'];
  const hist=(data.history||[]).filter(x=>{const d=(x.at||'').slice(0,10);return d>=start&&d<=end});
  rows=hist.map(x=>[new Date(x.at).toLocaleString('pt-BR'),x.user||'Não identificado',x.area||guessArea(x.action),x.action,x.record||'—',x.change||x.detail||'—']);
  kpis=[{label:'Alterações',value:rows.length},{label:'Usuários',value:new Set(hist.map(x=>x.user||'Não identificado')).size},{label:'Áreas',value:new Set(hist.map(x=>x.area||guessArea(x.action))).size},{label:'Período',value:`${fmtDate(start)}–${fmtDate(end)}`}];
 }
 document.getElementById('reportTitle').textContent=title;
 document.getElementById('reportPeriod').textContent=`Período: ${fmtDate(start)} a ${fmtDate(end)}`;
 document.getElementById('reportRowCount').textContent=`${rows.length} registro${rows.length===1?'':'s'}`;
 reportKpis(kpis);
 document.getElementById('reportPreview').innerHTML=reportTable(headers,rows);
 lastReport={title,headers,rows,start,end};
}

function renderHistory(){const base=data.history||[];const userSel=document.getElementById('historyUser'),areaSel=document.getElementById('historyArea'),search=document.getElementById('historySearch');if(userSel){const old=userSel.value;const users=[...new Set(base.map(x=>x.user||'Não identificado'))].sort((a,b)=>a.localeCompare(b));userSel.innerHTML='<option value="ALL">Todos</option>'+users.map(x=>`<option>${x}</option>`).join('');if([...userSel.options].some(o=>o.value===old))userSel.value=old}if(areaSel){const old=areaSel.value;const areas=[...new Set(base.map(x=>x.area||guessArea(x.action)))].sort((a,b)=>a.localeCompare(b));areaSel.innerHTML='<option value="ALL">Todas</option>'+areas.map(x=>`<option>${x}</option>`).join('');if([...areaSel.options].some(o=>o.value===old))areaSel.value=old}const uf=userSel?.value||'ALL',af=areaSel?.value||'ALL',q=(search?.value||'').trim().toLowerCase();const arr=base.filter(x=>(uf==='ALL'||(x.user||'Não identificado')===uf)&&(af==='ALL'||(x.area||guessArea(x.action))===af)&&(!q||[x.action,x.detail,x.record,x.change,x.user,x.area].join(' ').toLowerCase().includes(q)));document.getElementById('historyTable').innerHTML=arr.length?`<table class="table"><thead><tr><th>Data</th><th>Usuário</th><th>Área</th><th>Ação</th><th>Registro</th><th>Alteração</th></tr></thead><tbody>${arr.map(x=>`<tr><td>${new Date(x.at).toLocaleString('pt-BR')}</td><td>${x.user||'Não identificado'}</td><td>${x.area||guessArea(x.action)}</td><td>${x.action}</td><td>${x.record||'—'}</td><td>${x.change||x.detail||'—'}</td></tr>`).join('')}</tbody></table>`:'<div class="empty">Nenhuma alteração encontrada.</div>'}


let publicMode='day';

function publicItemHtml(x, resource){
 const isEvent=x.type==='event', isClosed=isEvent&&x.ctClosed;
 const cls=isClosed?'ctclosed':isEvent?'event':x.type==='master'?('master '+originClass(x)):x.type==='manual'?('manual '+originClass(x)):'suspended';
 const title=isClosed?`CT FECHADO — ${x.eventName}`:isEvent?x.eventName:(x.club||'—');
 const sub=isClosed?'Todas as atividades suspensas':
   isEvent?`${x.category||'EVENTO'}${x.sport?` · ${x.sport}`:''}`:
   x.type==='master'?`Programação fixa${x.sport?` · ${x.sport}`:''}`:
   x.type==='manual'?`Ajuste manual${x.sport?` · ${x.sport}`:''}`:
   `Suspenso${x.eventName?` · ${x.eventName}`:''}`;
 return `<div class="public-item ${cls}">
   <div class="public-item-time">${x.s}–${x.e}${resource?` · ${resource}`:''}</div>
   <div class="public-item-title">${title}</div>
   <div class="public-item-sub">${sub}</div>
 </div>`;
}

function publicClosureForDate(date){
 const closures=eventBlocksForDate(date).filter(x=>x.ctClosed);
 if(!closures.length)return null;
 const first=closures[0];
 return {eventName:first.eventName||'CT Fechado',s:first.s||'00:00',e:first.e||'23:59',category:first.category||'FECHAMENTO'};
}
function publicClosureHtml(c){
 return `<div class="public-item ctclosed" style="border-left-width:5px;padding:11px 12px;margin-bottom:10px">
   <div class="public-item-time">${c.s}–${c.e}</div>
   <div class="public-item-title">CT FECHADO — ${c.eventName}</div>
   <div class="public-item-sub">Todas as arenas e atividades estão suspensas neste dia.</div>
 </div>`;
}

function publicDayItems(date){
 const out=[];
 data.arenas.forEach(a=>{
  const seen=new Set();
  a.resources.forEach(r=>{
   allOccupancy(date,a.id,r).forEach(x=>{
    const key=(x.id||x.eventId||'')+'|'+x.type+'|'+x.s+'|'+x.e+'|'+r;
    if(seen.has(key))return;seen.add(key);
    out.push({...x,arenaId:a.id,arenaName:a.name,resource:r});
   });
  });
 });
 return out.sort((a,b)=>timeMin(a.s)-timeMin(b.s)||a.arenaName.localeCompare(b.arenaName,'pt-BR'));
}


function populatePublicClubSelect(){
 const el=document.getElementById('publicClub');if(!el)return;
 const old=el.value;
 const names=[
  ...data.masters.filter(x=>x.active!==false).map(x=>(x.club||'').trim()),
  ...data.manual.filter(x=>x.active!==false).map(x=>(x.club||'').trim()),
  ...data.events.filter(x=>x.active!==false).map(x=>(eventInstitution(x)||'').trim())
 ].filter(Boolean);
 const unique=[...new Set(names)].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 el.innerHTML=unique.length?unique.map(v=>`<option value="${v}">${v}</option>`).join(''):'<option value="">Nenhum clube cadastrado</option>';
 if(old&&unique.includes(old))el.value=old;
}
function publicClubItems(date,club){
 const out=[];
 // Programação fixa: inclui também ocorrências suspensas, para o clube visualizar que seu horário foi afetado.
 data.masters.filter(m=>{
  if(m.active===false||(m.club||'').trim()!==club)return false;
  if(Number(m.day)!==new Date(date+'T12:00:00').getDay())return false;
  if(m.startDate&&date<m.startDate)return false;
  if(m.endDate&&date>m.endDate)return false;
  return true;
 }).forEach(m=>{
  const suspension=data.suspensions.find(x=>x.active&&x.masterId===m.id&&x.date===date);
  out.push({...m,type:suspension?'suspended':'master',date,arenaId:m.a,arenaName:arena(m.a)?.name||m.a,resource:m.r,eventName:suspension?.eventName||''});
 });
 // Ajustes manuais do clube.
 data.manual.filter(m=>m.active!==false&&m.date===date&&(m.club||'').trim()===club).forEach(m=>{
  out.push({...m,type:'manual',date,arenaId:m.a,arenaName:arena(m.a)?.name||m.a,resource:m.r});
 });
 // Eventos solicitados/atribuídos à instituição selecionada.
 data.events.filter(ev=>ev.active!==false&&eventInstitution(ev)===club&&ev.startDate<=date&&date<=ev.endDate).forEach(ev=>{
  (ev.blocks||[]).filter(b=>b.startDate<=date&&date<=b.endDate).forEach(b=>{
   const a=arena(b.a);if(!a)return;
   const resources=b.r==='__ALL__'?a.resources:[b.r];
   resources.forEach(r=>out.push({...b,type:'event',date,eventId:ev.id,eventName:ev.name,category:ev.ops?.category||'Evento',sport:eventModalitiesList(ev).join(', '),ctClosed:!!ev.ops?.ctClosed,arenaId:b.a,arenaName:a.name,resource:r}));
  });
 });
 return out.sort((a,b)=>timeMin(a.s)-timeMin(b.s)||a.arenaName.localeCompare(b.arenaName,'pt-BR'));
}
function renderPublic(){
 fillArenaSelect('publicArena');
 populatePublicClubSelect();
 const week=mondayOf(document.getElementById('publicWeek').value||isoToday());
 document.getElementById('publicWeek').value=week;
 const dates=Array.from({length:7},(_,i)=>addDays(week,i));
 document.getElementById('publicUpdated').textContent=data.updatedAt?new Date(data.updatedAt).toLocaleString('pt-BR'):'—';

 document.getElementById('publicModeDay').classList.toggle('active',publicMode==='day');
 document.getElementById('publicModeArena').classList.toggle('active',publicMode==='arena');
 document.getElementById('publicModeClub').classList.toggle('active',publicMode==='club');
 document.getElementById('publicArenaField').style.display=publicMode==='arena'?'block':'none';
 document.getElementById('publicClubField').style.display=publicMode==='club'?'block':'none';
 document.getElementById('publicDayView').style.display=publicMode==='day'?'block':'none';
 document.getElementById('publicArenaView').style.display=publicMode==='arena'?'block':'none';
 document.getElementById('publicClubView').style.display=publicMode==='club'?'block':'none';

 if(publicMode==='day'){
  document.getElementById('publicHeader').innerHTML=`<div class="eyebrow">CENTRO DE TREINAMENTO PARALÍMPICO BRASILEIRO</div><div style="font-size:22px;font-weight:850;margin-top:4px">Programação semanal — visão por dia</div><div class="muted" style="font-size:13px;margin-top:2px">${fmtDate(week)} a ${fmtDate(addDays(week,6))}</div>`;
  const html=`<div class="public-days">${dates.map(date=>{
    const closure=publicClosureForDate(date);
    const dayItems=closure?[]:publicDayItems(date);
    const grouped={};
    dayItems.forEach(x=>(grouped[x.arenaName]??=[]).push(x));
    const body=closure
      ? publicClosureHtml(closure)
      : Object.keys(grouped).length
        ? Object.entries(grouped).map(([arenaName,items])=>`<div style="margin-bottom:10px"><div style="font-size:11px;font-weight:900;margin:0 0 5px">${arenaName}</div>${groupUsageItems(items).map(x=>publicItemHtml(x,x.resourceLabel)).join('')}</div>`).join('')
        : '<div class="public-empty">Sem atividades programadas.</div>';
    const d=new Date(date+'T12:00:00');
    return `<div class="public-day"><div class="public-day-head"><div class="public-day-name">${dayShort[d.getDay()]}</div><div class="public-day-date">${fmtDate(date)}</div></div><div class="public-agenda">${body}</div></div>`;
  }).join('')}</div>`;
  document.getElementById('publicDayView').innerHTML=html;
 }else if(publicMode==='arena'){
  const aid=document.getElementById('publicArena').value||data.arenas[0]?.id;
  const a=arena(aid);
  if(!a){document.getElementById('publicArenaView').innerHTML='<div class="public-empty">Nenhuma arena cadastrada.</div>';return}
  document.getElementById('publicHeader').innerHTML=`<div class="eyebrow">CENTRO DE TREINAMENTO PARALÍMPICO BRASILEIRO</div><div style="font-size:22px;font-weight:850;margin-top:4px">Programação semanal — ${a.name}</div><div class="muted" style="font-size:13px;margin-top:2px">${fmtDate(week)} a ${fmtDate(addDays(week,6))} · funcionamento ${hoursLabel(aid)}</div>`;
  const cols=dates.map(date=>{
    const d=new Date(date+'T12:00:00');
    const closure=publicClosureForDate(date);
    const items=[];
    const seen=new Set();
    if(!closure){
      a.resources.forEach(r=>allOccupancy(date,aid,r).forEach(x=>{
        const key=(x.id||x.eventId||'')+'|'+x.type+'|'+x.s+'|'+x.e+'|'+r;
        if(seen.has(key))return;seen.add(key);
        items.push({...x,resource:r});
      }));
      items.sort((x,y)=>timeMin(x.s)-timeMin(y.s));
    }
    return `<div class="public-week-day"><h4>${dayShort[d.getDay()]} · ${fmtDate(date).slice(0,5)}</h4>${closure?publicClosureHtml(closure):(items.length?groupUsageItems(items).map(x=>publicItemHtml(x,x.resourceLabel)).join(''):'<div class="public-empty">Sem atividades.</div>')}</div>`;
  }).join('');
  document.getElementById('publicArenaView').innerHTML=`<div class="public-arena-block"><div class="public-arena-head"><div><div class="public-arena-name">${a.name}</div><div class="muted" style="font-size:10px">${a.resources.length} recurso(s) · ${hoursLabel(aid)}</div></div></div><div class="public-week-list">${cols}</div></div>`;
 }else{
  const club=document.getElementById('publicClub').value;
  document.getElementById('publicHeader').innerHTML=`<div class="eyebrow">CENTRO DE TREINAMENTO PARALÍMPICO BRASILEIRO</div><div style="font-size:22px;font-weight:850;margin-top:4px">Programação semanal — ${club||'Clube'}</div><div class="muted" style="font-size:13px;margin-top:2px">${fmtDate(week)} a ${fmtDate(addDays(week,6))} · somente atividades da instituição selecionada</div>`;
  if(!club){document.getElementById('publicClubView').innerHTML='<div class="public-empty">Nenhum clube/instituição cadastrado.</div>';return}
  const activeDays=[];
  dates.forEach(date=>{
   const items=publicClubItems(date,club);
   if(!items.length)return;
   const grouped={};
   items.forEach(x=>(grouped[x.arenaName]??=[]).push(x));
   activeDays.push({date,grouped});
  });
  document.getElementById('publicClubView').innerHTML=activeDays.length
   ? `<div class="public-days">${activeDays.map(({date,grouped})=>{
      const d=new Date(date+'T12:00:00');
      const body=Object.entries(grouped).map(([arenaName,items])=>`<div style="margin-bottom:10px"><div style="font-size:11px;font-weight:900;margin:0 0 5px">${arenaName}</div>${groupUsageItems(items).map(x=>publicItemHtml(x,x.resourceLabel)).join('')}</div>`).join('');
      return `<div class="public-day"><div class="public-day-head"><div class="public-day-name">${dayShort[d.getDay()]}</div><div class="public-day-date">${fmtDate(date)}</div></div><div class="public-agenda">${body}</div></div>`;
     }).join('')}</div>`
   : '<div class="public-empty">Esta instituição não possui atividades programadas nesta semana.</div>';
 }
}
document.getElementById('publicArena').addEventListener('change',renderPublic);document.getElementById('publicClub').addEventListener('change',renderPublic);document.getElementById('publicWeek').addEventListener('change',renderPublic);document.getElementById('publicModeDay').addEventListener('click',()=>{publicMode='day';renderPublic()});document.getElementById('publicModeArena').addEventListener('click',()=>{publicMode='arena';renderPublic()});document.getElementById('publicModeClub').addEventListener('click',()=>{publicMode='club';renderPublic()});document.getElementById('printPublic').onclick=()=>window.print();document.getElementById('lodgingMonth').addEventListener('change',renderLodging);

function arenaUsage(aid){return{masters:data.masters.filter(x=>x.a===aid).length,manual:data.manual.filter(x=>x.a===aid).length,events:data.events.reduce((n,e)=>n+(e.blocks||[]).filter(b=>b.a===aid).length,0),suspensions:data.suspensions.filter(x=>x.a===aid).length}}
function resourceUsage(aid,r){return{masters:data.masters.filter(x=>x.a===aid&&x.r===r).length,manual:data.manual.filter(x=>x.a===aid&&x.r===r).length,events:data.events.reduce((n,e)=>n+(e.blocks||[]).filter(b=>b.a===aid&&(b.r===r||b.r==='__ALL__')).length,0),suspensions:data.suspensions.filter(x=>x.a===aid&&x.r===r).length}}
function usageText(u){return[`Programação Fixa: ${u.masters}`,`Ajustes: ${u.manual}`,`Eventos: ${u.events}`,`Suspensões: ${u.suspensions}`].join(' · ')}
function hasUsage(u){return Object.values(u).some(Number)}
function renderSetup(){const current=document.getElementById('setupArena')?.value;fillArenaSelect('setupArena');if(current&&data.arenas.some(a=>a.id===current))document.getElementById('setupArena').value=current;const arr=data.arenas;document.getElementById('arenaTable').innerHTML=arr.length?`<table class="table"><thead><tr><th>Arena</th><th>Funcionamento</th><th>Recursos</th><th>Limite total*</th><th>Uso vinculado</th><th></th></tr></thead><tbody>${arr.map(a=>{const u=arenaUsage(a.id);return`<tr><td><b>${a.name}</b></td><td><span class="hours-chip">${a.openTime}–${a.closeTime}</span></td><td>${a.resources.length}</td><td>${arenaTotalCap(a)} clube(s)</td><td><span class="muted" style="font-size:11px">${usageText(u)}</span></td><td><button class="btn small" onclick="editArena('${a.id}')">Renomear</button> <button class="btn small" onclick="editArenaHours('${a.id}')">Horário</button> <button class="btn small danger" onclick="removeArena('${a.id}')">Excluir</button></td></tr>`}).join('')}</tbody></table><div class="muted" style="font-size:10px;margin-top:8px">* Soma dos limites configurados nos recursos. O controle de simultaneidade é feito por recurso. O horário de funcionamento é aplicado às novas programações, ajustes, eventos, Planner e Disponibilidade.</div>`:'<div class="empty">Nenhuma arena cadastrada.</div>';renderResourceManager();fillArenaSelect('homeArena',true);fillArenaSelect('plannerArena');fillArenaSelect('newArena');fillArenaSelect('manualArena');fillArenaSelect('publicArena')}
document.getElementById('addArena').onclick=()=>{const name=document.getElementById('arenaName').value.trim(),openTime=document.getElementById('arenaOpen').value||'07:00',closeTime=document.getElementById('arenaClose').value||'21:00';if(!name)return alert('Informe o nome da arena.');if(timeMin(openTime)>=timeMin(closeTime))return alert('O horário de fechamento deve ser posterior ao de abertura.');if(data.arenas.some(a=>a.name.trim().toLowerCase()===name.toLowerCase()))return alert('Já existe uma arena com esse nome.');data.arenas.push({id:uid('a'),name,resources:['Recurso 1'],resourceCaps:{'Recurso 1':1},openTime,closeTime});log('Arena criada',name,{area:'Arenas e Recursos',record:name,change:`Arena criada com Recurso 1 · limite de 1 clube simultâneo · funcionamento ${openTime}–${closeTime}.`});document.getElementById('arenaName').value='';renderSetup();};
function editArena(aid){const a=arena(aid);if(!a)return;const oldName=a.name;const name=prompt('Novo nome da arena:',a.name);if(name===null)return;const clean=name.trim();if(!clean)return alert('O nome da arena não pode ficar vazio.');if(data.arenas.some(x=>x.id!==aid&&x.name.trim().toLowerCase()===clean.toLowerCase()))return alert('Já existe uma arena com esse nome.');if(oldName===clean)return alert('Nenhuma alteração realizada.');a.name=clean;log('Arena renomeada',`${oldName} → ${a.name}`,{area:'Arenas e Recursos',record:a.name,change:`Nome: ${oldName} → ${a.name}`});renderSetup();renderHome();renderPlanner();renderMasters();renderEvents();renderPublic();}
function editArenaHours(aid){const a=arena(aid);if(!a)return;const oldOpen=a.openTime||'07:00',oldClose=a.closeTime||'21:00';const open=prompt(`Horário de abertura de "${a.name}" (HH:MM):`,oldOpen);if(open===null)return;if(!/^\d{2}:\d{2}$/.test(open)||timeMin(open)<0||timeMin(open)>=24*60)return alert('Informe a abertura no formato HH:MM.');const close=prompt(`Horário de fechamento de "${a.name}" (HH:MM):`,oldClose);if(close===null)return;if(!/^\d{2}:\d{2}$/.test(close)||timeMin(close)<=timeMin(open)||timeMin(close)>24*60)return alert('Informe um fechamento válido e posterior à abertura.');if(open===oldOpen&&close===oldClose)return alert('Nenhuma alteração realizada.');a.openTime=open;a.closeTime=close;log('Horário da arena alterado',`${a.name} · ${oldOpen}–${oldClose} → ${open}–${close}`,{area:'Arenas e Recursos',record:a.name,change:`Funcionamento: ${oldOpen}–${oldClose} → ${open}–${close}`});renderSetup();renderPlanner();renderAvailability();renderHome();renderPublic();alert(`Horário de ${a.name} atualizado para ${open}–${close}. Novos cadastros fora dessa faixa serão bloqueados.`);}
function removeArena(aid){const a=arena(aid);if(!a)return;if(data.arenas.length<=1)return alert('Não é possível excluir a única arena cadastrada.');const u=arenaUsage(aid);if(hasUsage(u))return alert(`Esta arena não pode ser excluída porque possui registros vinculados.\n\n${usageText(u)}\n\nRemova ou ajuste esses vínculos antes de excluir a arena.`);if(!confirm(`Excluir a arena "${a.name}" e seus ${a.resources.length} recurso(s)?`))return;const oldName=a.name;data.arenas=data.arenas.filter(x=>x.id!==aid);log('Arena excluída',oldName,{area:'Arenas e Recursos',record:oldName,change:'Arena excluída sem registros vinculados.'});renderSetup();renderHome();renderPlanner();renderMasters();renderEvents();renderPublic();}
document.getElementById('setupArena').onchange=renderResourceManager;
function renderResourceManager(){const aid=document.getElementById('setupArena').value;const a=arena(aid);if(!a){document.getElementById('resourceManager').innerHTML='<div class="empty">Cadastre uma arena primeiro.</div>';return}document.getElementById('resourceManager').innerHTML=`<div class="muted" style="font-size:12px;margin-bottom:10px">${a.name} · ${a.resources.length} recurso(s) · limite total ${arenaTotalCap(a)} clube(s)</div><div class="grid2"><div><div id="resourceList">${a.resources.map((r,i)=>{const u=resourceUsage(a.id,r);return`<div style="border:1px solid var(--border);padding:10px;border-radius:9px;margin-bottom:7px"><div class="inline" style="justify-content:space-between;align-items:center"><div><b>${r}</b><div class="muted" style="font-size:11px;margin-top:3px">Limite: <b>${resourceCap(a.id,r)}</b> clube(s) simultâneo(s)</div></div><span><button class="btn small" onclick="renameResource('${a.id}',${i})">Renomear</button> <button class="btn small" onclick="changeResourceCap('${a.id}',${i})">Alterar limite</button> <button class="btn small danger" onclick="removeResource('${a.id}',${i})">Excluir</button></span></div><div class="muted" style="font-size:10px;margin-top:5px">${usageText(u)}</div></div>`}).join('')}</div></div><div><div class="field"><label>NOVO RECURSO</label><input id="newResName" placeholder="Ex.: Cancha 5"></div><div class="field" style="margin-top:8px"><label>LIMITE DE CLUBES SIMULTÂNEOS</label><input id="newResCap" type="number" min="1" value="1"></div><div class="form-actions"><button class="btn" id="addResourceBtn">Adicionar recurso</button></div></div></div>`;document.getElementById('addResourceBtn').onclick=()=>{const n=document.getElementById('newResName').value.trim();const cap=Math.max(1,Math.floor(Number(document.getElementById('newResCap').value)||1));if(!n)return;if(a.resources.some(r=>r.toLowerCase()===n.toLowerCase()))return alert('Esse recurso já existe.');a.resources.push(n);a.resourceCaps=a.resourceCaps||{};a.resourceCaps[n]=cap;log('Recurso criado',`${a.name} · ${n}`,{area:'Arenas e Recursos',record:`${a.name} / ${n}`,change:`Recurso adicionado · limite ${cap} clube(s) simultâneo(s).`});renderSetup();};}
function changeResourceCap(aid,i){const a=arena(aid);if(!a)return;const r=a.resources[i];const old=resourceCap(aid,r);const entered=prompt(`Limite de clubes simultâneos em "${r}":`,String(old));if(entered===null)return;const cap=Math.floor(Number(entered));if(!Number.isFinite(cap)||cap<1)return alert('Informe um número inteiro maior ou igual a 1.');if(cap===old)return alert('Nenhuma alteração realizada.');a.resourceCaps=a.resourceCaps||{};a.resourceCaps[r]=cap;log('Limite de recurso alterado',`${a.name} · ${r}`,{area:'Arenas e Recursos',record:`${a.name} / ${r}`,change:`Limite de clubes simultâneos: ${old} → ${cap}`});renderSetup();renderMasters();}
function renameResource(aid,i){const a=arena(aid);if(!a)return;const old=a.resources[i];const entered=prompt('Novo nome do recurso:',old);if(entered===null)return;const n=entered.trim();if(!n)return alert('O nome do recurso não pode ficar vazio.');if(a.resources.some((r,idx)=>idx!==i&&r.toLowerCase()===n.toLowerCase()))return alert('Já existe um recurso com esse nome nesta arena.');if(n===old)return alert('Nenhuma alteração realizada.');data.masters.forEach(x=>{if(x.a===aid&&x.r===old)x.r=n});data.manual.forEach(x=>{if(x.a===aid&&x.r===old)x.r=n});data.events.forEach(e=>(e.blocks||[]).forEach(b=>{if(b.a===aid&&b.r===old)b.r=n}));data.suspensions.forEach(x=>{if(x.a===aid&&x.r===old)x.r=n});a.resourceCaps=a.resourceCaps||{};const cap=resourceCap(aid,old);delete a.resourceCaps[old];a.resourceCaps[n]=cap;a.resources[i]=n;log('Recurso renomeado',`${a.name} · ${old} → ${n}`,{area:'Arenas e Recursos',record:`${a.name} / ${n}`,change:`Recurso: ${old} → ${n} · limite ${cap} preservado · referências existentes atualizadas.`});renderSetup();renderHome();renderPlanner();renderMasters();renderEvents();renderPublic();}
function removeResource(aid,i){const a=arena(aid);if(!a)return;if(a.resources.length<=1)return alert('Não é possível excluir o último recurso da arena.');const r=a.resources[i],u=resourceUsage(aid,r);if(hasUsage(u))return alert(`O recurso "${r}" não pode ser excluído porque possui registros vinculados.\n\n${usageText(u)}\n\nRenomear é permitido e mantém os vínculos existentes.`);if(!confirm(`Excluir o recurso "${r}" de ${a.name}?`))return;a.resources.splice(i,1);if(a.resourceCaps)delete a.resourceCaps[r];log('Recurso excluído',`${a.name} · ${r}`,{area:'Arenas e Recursos',record:`${a.name} / ${r}`,change:'Recurso excluído sem registros vinculados.'});renderSetup();}

function showDetail(x){const title=x.status==='event'?x.eventName:(x.club||x.eventName||'Detalhe');document.getElementById('detailTitle').textContent=title;let body='';if(x.status==='event'){body=`<div class="grid2"><div><b>Categoria:</b> ${x.ops?.category||'—'}</div><div><b>CT fechado:</b> ${x.ops?.ctClosed?'SIM — todas as arenas bloqueadas':'Não'}</div><div><b>Período:</b> ${fmtDate(x.startDate)}–${fmtDate(x.endDate)}</div><div><b>Blocos:</b> ${x.blocks.length}</div><div><b>Status:</b> ${x.active===false?'Cancelado':'Ativo'}</div><div><b>Responsável:</b> ${x.ops?.responsible||'—'}</div><div><b>Solicitante:</b> ${x.ops?.requester||'—'}</div><div><b>Modalidade(s):</b> ${x.ops?.modalities||'—'}</div><div><b>Previsão de público:</b> ${x.ops?.publicAudience||0}</div><div><b>Horário geral:</b> ${x.ops?.generalTime||'—'}</div><div><b>Alimentação (pessoas):</b> ${x.ops?.meals||0}</div><div><b>Hospedagem (pessoas):</b> ${x.ops?.lodging||0}</div><div><b>Centro de custo:</b> ${x.ops?.centerCost||x.ops?.paymentResponsible||'—'}</div><div><b>Atletas:</b> ${x.ops?.athletes||0}</div><div><b>Comissão organizadora:</b> ${x.ops?.committee||0}</div><div><b>Observação:</b> ${x.ops?.observation||'—'}</div></div><h4>Detalhes operacionais</h4><div class="event-block"><div><b>Observação interna:</b> ${x.ops?.internalNote||'—'}</div><div><b>Observação externa:</b> ${x.ops?.publicNote||'—'}</div></div><h4>Espaços</h4>${x.blocks.map(b=>`<div class="event-block"><b>${arena(b.a).name}</b> · ${b.r==='__ALL__'?'Toda a arena':b.r}<div class="muted" style="font-size:12px;margin-top:4px">${fmtDate(b.startDate)}–${fmtDate(b.endDate)} · ${b.s}–${b.e}</div></div>`).join('')}<h4>Suspensões ativas</h4><div>${(x.susp||[]).map(s=>`<div class="today-item suspended">${fmtDate(s.date)} · ${arena(s.a).name} · ${s.r} · ${s.s}–${s.e}</div>`).join('')||'<div class="empty">Nenhuma.</div>'}</div>`}else{body=`<div class="grid2"><div><b>Tipo:</b> ${x.status==='manual'?'Ajuste manual':x.status==='suspended'?'Treinamento suspenso':'Programação Fixa'}</div><div><b>Recurso:</b> ${x.res||x.r}</div><div><b>Data:</b> ${fmtDate(x.date)}</div><div><b>Horário:</b> ${x.s}–${x.e}</div><div><b>Arena:</b> ${x.aid?arena(x.aid).name:arena(x.a).name}</div><div><b>Clube:</b> ${x.club||'—'}</div><div><b>Modalidade:</b> ${x.sport||'—'}</div><div><b>Vínculo:</b> ${x.origin==='cpb'?'CPB':'Externo / Clube'}</div><div><b>Status:</b> ${x.status==='suspended'?'Treinamento suspenso':x.status==='manual'?'Aplicado somente nesta data':'Ativo · recorrente'}</div>${x.status==='manual'?`<div style="grid-column:1/-1"><b>Observação:</b> ${x.note||'—'}</div>`:''}</div>`}document.getElementById('detailBody').innerHTML=body;document.getElementById('detailModal').classList.add('show')}
document.getElementById('closeDetail').onclick=()=>document.getElementById('detailModal').classList.remove('show');document.getElementById('detailModal').onclick=e=>{if(e.target.id==='detailModal')document.getElementById('detailModal').classList.remove('show')};


function eventModalitiesList(ev){
 const raw=(ev?.ops?.modalities||'').trim();
 if(!raw)return [];
 return [...new Set(raw.split(/[,;\/]+|\s+\be\b\s+/i).map(x=>x.trim()).filter(Boolean))];
}
function eventInstitution(ev){return (ev?.ops?.requester||ev?.ops?.responsible||'Não informada').trim()||'Não informada'}
function renderFilteredEvents(events){
 if(!events.length)return '<div class="indicator-empty">Nenhum evento atende aos filtros selecionados.</div>';
 const rows=[...events].sort((a,b)=>a.startDate.localeCompare(b.startDate)||a.name.localeCompare(b.name,'pt-BR')).map(ev=>{
  const arenas=[...new Set((ev.blocks||[]).map(b=>arena(b.a)?.name).filter(Boolean))];
  return `<tr><td><b>${ev.name}</b>${ev.ops?.ctClosed?' <span class="chip" style="margin-left:6px;color:var(--bad)">CT FECHADO</span>':''}</td><td>${fmtDate(ev.startDate)}–${fmtDate(ev.endDate)}</td><td>${ev.ops?.category||'—'}</td><td>${eventModalitiesList(ev).join(', ')||'—'}</td><td>${eventInstitution(ev)}</td><td>${arenas.join(', ')||'Todas as arenas'}</td></tr>`;
 }).join('');
 return `<table class="matrix-table"><thead><tr><th>Evento</th><th>Período</th><th>Categoria</th><th>Modalidade(s)</th><th>Instituição</th><th>Arena(s)</th></tr></thead><tbody>${rows}</tbody></table>`;
}
function indicatorDateRange(){let start=document.getElementById('indicatorStart')?.value||isoToday(),end=document.getElementById('indicatorEnd')?.value||isoToday();if(start>end){const t=start;start=end;end=t}return {start,end}}
function datesBetween(start,end){const out=[];let d=start;let guard=0;while(d<=end&&guard<5000){out.push(d);d=addDays(d,1);guard++}return out}
function eventInRange(ev,start,end){return ev.active!==false&&ev.startDate<=end&&ev.endDate>=start}
function blockDaysInRange(b,start,end){const s=b.startDate>start?b.startDate:start,e=b.endDate<end?b.endDate:end;if(!s||!e||s>e)return 0;let n=0,d=s;while(d<=e&&n<5000){n++;d=addDays(d,1)}return n}
function rankHtml(obj,suffix='',limit=12){const entries=Object.entries(obj).filter(([,v])=>Number(v)>0).sort((a,b)=>b[1]-a[1]).slice(0,limit);if(!entries.length)return '<div class="indicator-empty">Sem dados no período.</div>';const max=Math.max(...entries.map(x=>x[1]),1);return entries.map(([k,v])=>`<div class="rank-row"><div class="rank-name" title="${k}">${k}</div><div class="rank-track"><div class="rank-fill" style="width:${Math.max(3,(v/max)*100)}%"></div></div><div class="rank-val">${Number(v).toLocaleString('pt-BR',{maximumFractionDigits:1})}${suffix}</div></div>`).join('')}
function renderInstitutionCategoryMatrix(events){
 const categories=[...new Set(events.map(ev=>ev.ops?.category||'Não informada'))].sort((a,b)=>a.localeCompare(b,'pt-BR'));
 const rows={};
 events.forEach(ev=>{const inst=(ev.ops?.requester||ev.ops?.responsible||'Não informada').trim()||'Não informada',cat=ev.ops?.category||'Não informada';rows[inst]=rows[inst]||{};rows[inst][cat]=(rows[inst][cat]||0)+1});
 const institutions=Object.keys(rows).sort((a,b)=>{const ta=Object.values(rows[a]).reduce((n,v)=>n+v,0),tb=Object.values(rows[b]).reduce((n,v)=>n+v,0);return tb-ta||a.localeCompare(b,'pt-BR')});
 if(!institutions.length)return '<div class="indicator-empty">Sem eventos no período.</div>';
 const head=categories.map(c=>`<th>${c}</th>`).join('');
 const body=institutions.map(inst=>{const total=categories.reduce((n,c)=>n+(rows[inst][c]||0),0);return `<tr><td title="${inst}">${inst}</td>${categories.map(c=>`<td class="num ${rows[inst][c]?'matrix-highlight':''}">${rows[inst][c]||0}</td>`).join('')}<td class="num matrix-total">${total}</td></tr>`}).join('');
 const totals=categories.map(c=>events.filter(ev=>(ev.ops?.category||'Não informada')===c).length);return `<table class="matrix-table"><thead><tr><th>Instituição / Confederação</th>${head}<th>Total</th></tr></thead><tbody>${body}<tr class="matrix-total"><td>Total</td>${totals.map(v=>`<td class="num">${v}</td>`).join('')}<td class="num">${events.length}</td></tr></tbody></table>`;
}
function renderIndicators(){
 const startEl=document.getElementById('indicatorStart'),endEl=document.getElementById('indicatorEnd');if(!startEl||!endEl)return;
 if(!startEl.value){const y=new Date().getFullYear();startEl.value=`${y}-01-01`}if(!endEl.value)endEl.value=isoToday();
 fillArenaSelect('indicatorArena',true);
 const activeEvents=data.events.filter(e=>e.active!==false);
 const cats=[...new Set(activeEvents.map(e=>e.ops?.category).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'pt-BR'));const catEl=document.getElementById('indicatorCategory'),oldCat=catEl.value||'ALL';catEl.innerHTML='<option value="ALL">Todas</option>'+cats.map(c=>`<option>${c}</option>`).join('');if([...catEl.options].some(o=>o.value===oldCat))catEl.value=oldCat;
 const trainingInstOptions=[...data.masters,...data.manual].filter(x=>x&&x.active!==false).map(x=>(x.club||'').trim()).filter(Boolean);
 const institutionsList=[...new Set([...activeEvents.map(eventInstitution).filter(Boolean),...trainingInstOptions])].sort((a,b)=>a.localeCompare(b,'pt-BR'));const instEl=document.getElementById('indicatorInstitution'),oldInst=instEl.value||'ALL';instEl.innerHTML='<option value="ALL">Todas</option>'+institutionsList.map(v=>`<option>${v}</option>`).join('');if([...instEl.options].some(o=>o.value===oldInst))instEl.value=oldInst;
 const trainingModOptions=[...data.masters,...data.manual].filter(x=>x&&x.active!==false).map(x=>(x.sport||'').trim()).filter(Boolean);
 const modalitiesList=[...new Set([...activeEvents.flatMap(eventModalitiesList),...trainingModOptions])].sort((a,b)=>a.localeCompare(b,'pt-BR'));const modEl=document.getElementById('indicatorModality'),oldMod=modEl.value||'ALL';modEl.innerHTML='<option value="ALL">Todas</option>'+modalitiesList.map(v=>`<option>${v}</option>`).join('');if([...modEl.options].some(o=>o.value===oldMod))modEl.value=oldMod;
 const {start,end}=indicatorDateRange();const aid=document.getElementById('indicatorArena').value||'ALL',category=catEl.value||'ALL',institution=instEl.value||'ALL',modality=modEl.value||'ALL';document.getElementById('indicatorPeriodLabel').textContent=`${fmtDate(start)} a ${fmtDate(end)}`;

 // Eventos: mantidos separados da programação recorrente.
 let allPeriodEvents=data.events.filter(ev=>eventInRange(ev,start,end));if(aid!=='ALL')allPeriodEvents=allPeriodEvents.filter(ev=>(ev.blocks||[]).some(b=>b.a===aid&&b.startDate<=end&&b.endDate>=start));
 let events=allPeriodEvents;if(category!=='ALL')events=events.filter(ev=>(ev.ops?.category||'')===category);if(institution!=='ALL')events=events.filter(ev=>eventInstitution(ev)===institution);if(modality!=='ALL')events=events.filter(ev=>eventModalitiesList(ev).includes(modality));
 const sum=k=>events.reduce((n,e)=>n+(Number(e.ops?.[k])||0),0);document.getElementById('ikEvents').textContent=events.length.toLocaleString('pt-BR');document.getElementById('ikAthletes').textContent=sum('athletes').toLocaleString('pt-BR');document.getElementById('ikCommittee').textContent=sum('committee').toLocaleString('pt-BR');document.getElementById('ikPublic').textContent=sum('publicAudience').toLocaleString('pt-BR');
 const categories={},modalities={},institutions={},eventArenaHours={},eventResourceHours={};
 events.forEach(ev=>{const c=ev.ops?.category||'Não informada';categories[c]=(categories[c]||0)+1;const mods=eventModalitiesList(ev);(mods.length?mods:['Não informada']).forEach(m=>modalities[m]=(modalities[m]||0)+1);const inst=eventInstitution(ev);institutions[inst]=(institutions[inst]||0)+1;(ev.blocks||[]).forEach(b=>{if(aid!=='ALL'&&b.a!==aid)return;const days=blockDaysInRange(b,start,end);if(!days)return;const dur=Math.max(0,(timeMin(b.e)-timeMin(b.s))/60)*days,a=arena(b.a);if(!a)return;eventArenaHours[a.name]=(eventArenaHours[a.name]||0)+dur;const resources=b.r==='__ALL__'?a.resources:[b.r];resources.forEach(r=>{const key=`${a.name} · ${r}`;eventResourceHours[key]=(eventResourceHours[key]||0)+dur})})});
 document.getElementById('indCategories').innerHTML=rankHtml(categories,'');document.getElementById('indModalities').innerHTML=rankHtml(modalities,'',15);document.getElementById('indInstitutions').innerHTML=rankHtml(institutions,'',20);document.getElementById('indInstitutionCategoryMatrix').innerHTML=renderInstitutionCategoryMatrix(events);document.getElementById('indFilteredEvents').innerHTML=renderFilteredEvents(events);document.getElementById('indEventArenas').innerHTML=rankHtml(eventArenaHours,' h',20);

 // Programação / treinamentos: categoria continua sendo filtro exclusivo de eventos.
 // Instituição e modalidade também filtram treinamentos, permitindo analisar a presença anual de um clube específico.
 const trainingInstitutionHours={},trainingInstitutionDaysMap={},trainingModalityHours={},trainingArenaHours={},trainingResourceHours={};let trainingSessions=0,trainingHours=0;const trainingInstitutions=new Set(),trainingModalities=new Set();
 const addTrainingPresence=(inst,d)=>{if(!trainingInstitutionDaysMap[inst])trainingInstitutionDaysMap[inst]=new Set();trainingInstitutionDaysMap[inst].add(d)};
 const trainingMatchesFilters=(m)=>{const inst=(m.club||'Não informado').trim()||'Não informado',mod=(m.sport||'Não informada').trim()||'Não informada';return (institution==='ALL'||inst===institution)&&(modality==='ALL'||mod===modality)};
 const days=datesBetween(start,end);days.forEach(d=>{
  const dow=new Date(d+'T12:00:00').getDay();
  data.masters.filter(m=>m.active!==false&&Number(m.day)===dow&&(aid==='ALL'||m.a===aid)&&(!m.startDate||d>=m.startDate)&&(!m.endDate||d<=m.endDate)&&!isSuspended(m.id,d)&&trainingMatchesFilters(m)).forEach(m=>{
   const dur=Math.max(0,(timeMin(m.e)-timeMin(m.s))/60),a=arena(m.a);if(!a)return;
   trainingSessions++;trainingHours+=dur;
   const inst=(m.club||'Não informado').trim()||'Não informado',mod=(m.sport||'Não informada').trim()||'Não informada';
   trainingInstitutions.add(inst);trainingModalities.add(mod);addTrainingPresence(inst,d);
   trainingInstitutionHours[inst]=(trainingInstitutionHours[inst]||0)+dur;
   trainingModalityHours[mod]=(trainingModalityHours[mod]||0)+dur;
   trainingArenaHours[a.name]=(trainingArenaHours[a.name]||0)+dur;
   trainingResourceHours[`${a.name} · ${m.r}`]=(trainingResourceHours[`${a.name} · ${m.r}`]||0)+dur
  });
  data.manual.filter(m=>m.active!==false&&m.date===d&&(aid==='ALL'||m.a===aid)&&trainingMatchesFilters(m)).forEach(m=>{
   const dur=Math.max(0,(timeMin(m.e)-timeMin(m.s))/60),a=arena(m.a);if(!a)return;
   trainingSessions++;trainingHours+=dur;
   const inst=(m.club||'Não informado').trim()||'Não informado',mod=(m.sport||'Não informada').trim()||'Não informada';
   trainingInstitutions.add(inst);trainingModalities.add(mod);addTrainingPresence(inst,d);
   trainingInstitutionHours[inst]=(trainingInstitutionHours[inst]||0)+dur;
   trainingModalityHours[mod]=(trainingModalityHours[mod]||0)+dur;
   trainingArenaHours[a.name]=(trainingArenaHours[a.name]||0)+dur;
   trainingResourceHours[`${a.name} · ${m.r}`]=(trainingResourceHours[`${a.name} · ${m.r}`]||0)+dur
  })
 });
 const trainingInstitutionDays=Object.fromEntries(Object.entries(trainingInstitutionDaysMap).map(([inst,set])=>[inst,set.size]));
 document.getElementById('ikTrainingSessions').textContent=trainingSessions.toLocaleString('pt-BR');
 document.getElementById('ikTrainingHours').textContent=trainingHours.toLocaleString('pt-BR',{maximumFractionDigits:1});
 document.getElementById('ikTrainingInstitutions').textContent=trainingInstitutions.size.toLocaleString('pt-BR');
 document.getElementById('ikTrainingModalities').textContent=trainingModalities.size.toLocaleString('pt-BR');
 document.getElementById('indTrainingInstitutions').innerHTML=rankHtml(trainingInstitutionHours,' h',20);
 document.getElementById('indTrainingInstitutionDays').innerHTML=rankHtml(trainingInstitutionDays,' dias',30);
 document.getElementById('indTrainingModalities').innerHTML=rankHtml(trainingModalityHours,' h',20);
 document.getElementById('indTrainingArenas').innerHTML=rankHtml(trainingArenaHours,' h',20);

 // Vida dos recursos com separação visual entre evento e treinamento.
 const keys=[...new Set([...Object.keys(eventResourceHours),...Object.keys(trainingResourceHours)])];const rows=keys.map(k=>({k,event:eventResourceHours[k]||0,training:trainingResourceHours[k]||0,total:(eventResourceHours[k]||0)+(trainingResourceHours[k]||0)})).filter(x=>x.total>0).sort((a,b)=>b.total-a.total),maxR=Math.max(1,...rows.map(x=>x.total));document.getElementById('indResources').innerHTML=rows.length?rows.map(x=>`<div class="resource-life"><div class="rank-name" title="${x.k}">${x.k}</div><div class="rank-track"><div class="rank-fill" style="width:${Math.max(2,(x.total/maxR)*100)}%"></div></div><div class="resource-split event-split">Evento ${x.event.toLocaleString('pt-BR',{maximumFractionDigits:1})} h</div><div class="resource-split training-split">Treino ${x.training.toLocaleString('pt-BR',{maximumFractionDigits:1})} h</div><div class="rank-val">${x.total.toLocaleString('pt-BR',{maximumFractionDigits:1})} h</div></div>`).join(''):'<div class="indicator-empty">Sem utilização registrada no período.</div>';
}
document.getElementById('plannerArena')?.addEventListener('change',renderPlanner);
document.getElementById('plannerClub')?.addEventListener('change',renderPlanner);
document.getElementById('plannerWeek')?.addEventListener('change',renderPlanner);
document.getElementById('prevWeek')?.addEventListener('click',()=>{document.getElementById('plannerWeek').value=addDays(mondayOf(document.getElementById('plannerWeek').value||isoToday()),-7);renderPlanner()});
document.getElementById('nextWeek')?.addEventListener('click',()=>{document.getElementById('plannerWeek').value=addDays(mondayOf(document.getElementById('plannerWeek').value||isoToday()),7);renderPlanner()});
document.getElementById('printBtn')?.addEventListener('click',()=>window.print());
document.getElementById('generateReport')?.addEventListener('click',renderReports);
['reportType','reportArena','reportInstitution','reportModality','reportCategory'].forEach(id=>document.getElementById(id)?.addEventListener('change',renderReports));
document.getElementById('exportReportCsv')?.addEventListener('click',()=>{if(!lastReport.headers.length)renderReports();const slug=(lastReport.title||'relatorio').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');downloadCsv(`${slug}_${lastReport.start}_${lastReport.end}.csv`,lastReport.headers,lastReport.rows)});
document.getElementById('printReport')?.addEventListener('click',()=>window.print());
document.getElementById('indicatorApply')?.addEventListener('click',renderIndicators);document.getElementById('indicatorArena')?.addEventListener('change',renderIndicators);document.getElementById('indicatorCategory')?.addEventListener('change',renderIndicators);document.getElementById('indicatorInstitution')?.addEventListener('change',renderIndicators);document.getElementById('indicatorModality')?.addEventListener('change',renderIndicators);document.getElementById('indicatorThisYear')?.addEventListener('click',()=>{const y=new Date().getFullYear();document.getElementById('indicatorStart').value=`${y}-01-01`;document.getElementById('indicatorEnd').value=isoToday();renderIndicators()});document.getElementById('indicatorLast30')?.addEventListener('click',()=>{document.getElementById('indicatorStart').value=addDays(isoToday(),-29);document.getElementById('indicatorEnd').value=isoToday();renderIndicators()});

// Initial setup
['homeDate','plannerWeek','publicWeek','eventStart','eventEnd','availabilityDate','indicatorEnd','reportEnd'].forEach(id=>{const el=document.getElementById(id);if(el&& !el.value)el.value=isoToday()});document.getElementById('plannerWeek').value=mondayOf(isoToday());document.getElementById('publicWeek').value=mondayOf(isoToday());document.getElementById('eventStart').value=isoToday();document.getElementById('eventEnd').value=isoToday();fillArenaSelect('homeArena',true);fillArenaSelect('plannerArena');fillArenaSelect('newArena');fillArenaSelect('manualArena');fillArenaSelect('publicArena');fillArenaSelect('setupArena');fillArenaSelect('availabilityArena',true);fillArenaSelect('indicatorArena',true);fillArenaSelect('reportArena',true);document.getElementById('reportStart').value=`${new Date().getFullYear()}-01-01`;fillResourceSelect(document.getElementById('newArena').value,'newResource');fillResourceSelect(document.getElementById('manualArena').value,'manualResource');document.getElementById('manualDate').value=isoToday();addEventBlock();checkMasterForm();checkManualForm();renderHome();renderPlanner();renderMasters();renderEvents();renderLodging();renderAvailability();renderIndicators();renderReports();renderPublic();renderSetup();

}
