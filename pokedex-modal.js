/* 共享宝可梦详情弹窗：window.pokeModal(dex) / pokeModalSid(sid)。按需懒加载 sql.js + pokemon.db。*/
(function(){
"use strict";
var MDB=null,loading=null;
var SQLBASE="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/";
function ls(src){return new Promise(function(res,rej){var s=document.createElement("script");s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
function load(){ if(MDB)return Promise.resolve(); if(loading)return loading;
  loading=(window.initSqlJs?Promise.resolve():ls(SQLBASE+"sql-wasm.js"))
    .then(function(){return initSqlJs({locateFile:function(f){return SQLBASE+f;}});})
    .then(function(SQL){return fetch("pokemon.db?v20260619-9341").then(function(r){return r.arrayBuffer();}).then(function(b){MDB=new SQL.Database(new Uint8Array(b));});});
  return loading;
}
function rows(sql,p){var st=MDB.prepare(sql);if(p)st.bind(p);var o=[];while(st.step())o.push(st.getAsObject());st.free();return o;}
var TC={normal:"#9099a1",fire:"#ff6b3d",water:"#4f9fff",electric:"#ffd23d",grass:"#5fbf52",ice:"#7fd6d6",fighting:"#d3425f",poison:"#a95fc9",ground:"#d9ab55",flying:"#92a8ff",psychic:"#ff5f8f",bug:"#9fb336",rock:"#c8b681",ghost:"#6f5b9e",dragon:"#5a78e0",dark:"#5a5468",steel:"#5a8fa0",fairy:"#f08fc7"};
var TN={normal:"一般",fire:"火",water:"水",electric:"电",grass:"草",ice:"冰",fighting:"格斗",poison:"毒",ground:"地面",flying:"飞行",psychic:"超能力",bug:"虫",rock:"岩石",ghost:"幽灵",dragon:"龙",dark:"恶",steel:"钢",fairy:"妖精"};
function esc(s){return (""+(s==null?"":s)).replace(/&/g,"&amp;").replace(/</g,"&lt;");}
function art(d){return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/"+d+".png";}
function tchip(t){return t?'<span style="font-size:9px;font-weight:700;color:#0e1016;border-radius:5px;padding:1px 6px;margin-right:3px;background:'+(TC[t]||"#666")+'">'+(TN[t]||t)+'</span>':"";}
function genderStr(g){if(g==null)return "";if(g<0)return "⚲无性别";if(g===0)return "♂100%";if(g===8)return "♀100%";var fp=Math.round(g/8*100);return "♂"+(100-fp)+"% / ♀"+fp+"%";}
function ensure(){
  if(document.getElementById("pmOv"))return;
  var st=document.createElement("style");st.textContent=
  "#pmOv{display:none;position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.66);backdrop-filter:blur(3px);align-items:flex-start;justify-content:center;overflow:auto;padding:24px 10px}"+
  "#pmCard{position:relative;max-width:560px;width:100%;background:#171a23;border:1px solid #2c3142;border-radius:16px;padding:16px 18px;color:#e9ebf2;font-family:-apple-system,'PingFang SC','Microsoft YaHei',system-ui,sans-serif;box-shadow:0 20px 60px -10px rgba(0,0,0,.7)}"+
  "#pmCard h3{margin:0 0 8px;font-size:19px}#pmCard .kv{font-size:13px;line-height:1.9}#pmCard .kv b{color:#ffcb05}#pmCard code{background:#1f2330;border-radius:4px;padding:0 4px}"+
  "#pmCard .mv{font-size:12.5px;line-height:1.7}#pmCard .tag{font-size:10.5px;color:#9aa1b4}"+
  "#pmX{position:absolute;top:10px;right:14px;font-size:26px;line-height:1;color:#9aa1b4;cursor:pointer;font-weight:700}#pmX:hover{color:#fff}"+
  "#pmCard a{color:#46d39a}";
  document.head.appendChild(st);
  var ov=document.createElement("div");ov.id="pmOv";ov.innerHTML='<div id="pmCard"></div>';
  ov.addEventListener("click",function(e){if(e.target===ov)close();});
  document.addEventListener("keydown",function(e){if(e.key==="Escape")close();});
  document.body.appendChild(ov);
}
function close(){var o=document.getElementById("pmOv");if(o)o.style.display="none";}
function detailHtml(sid){
  var p=rows("SELECT * FROM pokemon WHERE species_id=?",[sid])[0];if(!p)return "未找到";
  function mv(slot){return rows("SELECT m.*,pm.is_elite FROM pokemon_moves pm JOIN moves m ON m.move_id=pm.move_id WHERE pm.species_id=? AND pm.slot=?",[sid,slot]);}
  function mvl(a){return a.map(function(m){var bf=m.pvp_buffs?' <span style="color:#ffcb05">±buff</span>':'';return '<div style="padding:2px 0"><span style="cursor:help;color:#8fb0ff;border-bottom:1px dashed #4a5570" onclick="moveTip(event,\''+esc(m.move_id)+'\')">'+(m.is_elite?'🔑':'')+'<b>'+esc(m.name_cn)+'</b> / '+esc(m.name_en)+' ⓘ</span> '+tchip(m.type)+' <span class="tag">PvP '+m.pvp_power+'威 '+m.pvp_energy+'能'+bf+' · PvE '+m.pve_power+'威 '+(m.pve_duration_ms?(m.pve_duration_ms/1000)+'s':'')+'</span></div>';}).join("")||"—";}
  var ivs=rows("SELECT * FROM default_ivs WHERE species_id=?",[sid]);
  var pur=rows("SELECT * FROM shadow_purification WHERE species_id=? AND stardust IS NOT NULL",[sid])[0];
  function _nm(s){var r=rows("SELECT name_cn FROM pokemon WHERE species_id=?",[s])[0];return r?r.name_cn:s;}
  var _root=sid,_seen={};while(true){var pr=rows("SELECT family_parent FROM pokemon WHERE species_id=?",[_root])[0];if(pr&&pr.family_parent&&!_seen[pr.family_parent]){_seen[pr.family_parent]=1;_root=pr.family_parent;}else break;}
  function _chain(node){var tag='<span style="cursor:pointer;'+(node===sid?"color:#ffcb05;font-weight:800":"color:#8fb0ff")+'" onclick="pokeModalSid(\''+node+'\')">'+esc(_nm(node))+'</span>';var kids=rows("SELECT evolves_to,candy,condition FROM evolution WHERE species_id=?",[node]);if(!kids.length)return tag;if(kids.length===1)return tag+' <span class="tag">→'+(kids[0].candy?kids[0].candy+'糖':'')+(kids[0].condition?'·'+esc(kids[0].condition):'')+'</span> '+_chain(kids[0].evolves_to);return tag+'<div style="padding-left:16px;border-left:1px solid #2c3142;margin:3px 0">'+kids.map(function(k){return '<span class="tag">→'+(k.candy?k.candy+'糖':'')+(k.condition?'·'+esc(k.condition):'')+'</span> '+_chain(k.evolves_to);}).join("<br>")+'</div>';}
  var hasEvo=rows("SELECT 1 FROM evolution WHERE species_id=? OR evolves_to=? LIMIT 1",[sid,sid]).length;
  var wb=rows("SELECT DISTINCT weather FROM weather_boost WHERE type=? OR type=?",[p.type1,p.type2||p.type1]);
  // 属性克制：聚合 18 种攻击属性对本宝可梦的倍率（type1×type2）
  var deft=[p.type1,p.type2].filter(Boolean);
  var teRows=rows("SELECT atk_type,def_type,multiplier FROM type_effectiveness WHERE def_type=? OR def_type=?",[p.type1,p.type2||p.type1]);
  var teMap={};teRows.forEach(function(r){if(!teMap[r.atk_type])teMap[r.atk_type]={};teMap[r.atk_type][r.def_type]=r.multiplier;});
  var weakArr=[],resArr=[];
  Object.keys(TN).forEach(function(at){var m=1;deft.forEach(function(dt){m*=(teMap[at]&&teMap[at][dt]!=null)?teMap[at][dt]:1;});if(m>1.01)weakArr.push([at,m]);else if(m<0.99)resArr.push([at,m]);});
  weakArr.sort(function(a,b){return b[1]-a[1];});resArr.sort(function(a,b){return a[1]-b[1];});
  function multLbl(m){return m>=2.5?"×2.56":m>=1.5?"×1.6":m<=0.4?"×0.39":m<=0.65?"×0.63":(m).toFixed(2);}
  function teChip(x){return '<span style="font-size:9px;font-weight:700;color:#0e1016;border-radius:5px;padding:1px 5px;margin:1px;display:inline-block;background:'+(TC[x[0]]||"#666")+'">'+(TN[x[0]]||x[0])+' '+multLbl(x[1])+'</span>';}
  // 最大 CP（L40 / L50）
  var cpmR=rows("SELECT level,cpm FROM cpm WHERE level IN (40,50)");var cpmMap={};cpmR.forEach(function(r){cpmMap[r.level]=r.cpm;});
  function maxcp(cpm){if(!cpm)return null;return Math.max(10,Math.floor((p.atk+15)*Math.sqrt(p.def+15)*Math.sqrt(p.hp+15)*cpm*cpm/10));}
  var cp40=maxcp(cpmMap[40]),cp50=maxcp(cpmMap[50]);
  var ob=rows("SELECT method,detail FROM obtain WHERE dex=?",[p.dex]);
  var flags=[];if(p.is_legendary)flags.push("传说");if(p.is_mythical)flags.push("幻");if(p.is_ultrabeast)flags.push("究极异兽");if(p.is_mega)flags.push("超级进化");if(p.is_regional)flags.push("地区限定");if(p.shadow_eligible)flags.push("可暗影");if(p.gl_ineligible)flags.push("超联不可用");
  var ivmap={great:"超联1500",ultra:"高联2500",master:"大师"};
  var ivh=ivs.map(function(v){return '<span class="tag" style="margin-right:8px">'+(ivmap[v.league]||v.league)+': L'+v.level+' '+v.iv_atk+'/'+v.iv_def+'/'+v.iv_sta+'</span>';}).join("")||"—";
  var WN={"sunny/clear":"☀️晴","rainy":"🌧雨","partly_cloudy":"⛅多云","cloudy":"☁️阴","windy":"🌬风","snow":"❄️雪","fog":"🌫雾"};
  return '<span id="pmX" onclick="pmClose()">×</span><h3>'+esc(p.name_cn)+' <small style="color:#9aa1b4;font-weight:400;font-size:12px">'+esc(p.name_tw)+' · '+esc(p.name_en)+' · #'+p.dex+'</small></h3>'+
    '<div style="display:flex;gap:14px;align-items:flex-start"><img src="'+(p.sprite||art(p.dex))+'" onerror="this.src=\''+art(p.dex)+'\'" style="width:90px;height:90px;object-fit:contain;flex:none"><div class="kv">'+
    '属性：'+tchip(p.type1)+tchip(p.type2)+'　第'+p.gen+'世代·'+esc(p.region)+(p.genus_cn?'　'+esc(p.genus_cn):'')+'<br>种族值：<b>攻 '+p.atk+'</b> / <b>防 '+p.def+'</b> / <b>体 '+p.hp+'</b>'+(p.height_m?'　📏'+p.height_m+'m '+p.weight_kg+'kg':'')+'<br>最大CP：<b>'+(cp40||"?")+'</b>(L40) / <b>'+(cp50||"?")+'</b>(L50)　L25 '+(p.level25cp||"?")+'<br>'+
    (flags.length?'<span style="color:#ffcb05">'+flags.join(" · ")+'</span><br>':'')+
    '✨异色：'+(p.shiny_released?'已实装 '+(p.shiny_date||""):'未实装')+'　糖果距离 '+(p.buddy_km||"?")+'km　'+genderStr(p.gender_rate)+'<br>'+
    '</div></div>'+(p.flavor_cn?'<div class="kv" style="font-style:italic;color:#bcd;margin-top:8px">📖 '+esc(p.flavor_cn)+'</div>':'')+
    '<div class="kv" style="margin-top:8px">🛡 <b style="color:#ff8f6b">弱点</b>：'+(weakArr.length?weakArr.map(teChip).join(""):"无")+'</div>'+
    '<div class="kv">🧱 <b style="color:#7fd6d6">抗性</b>：'+(resArr.length?resArr.map(teChip).join(""):"无")+'</div>'+
    '<div class="kv" style="margin-top:8px"><b style="color:#ffcb05">🏆 PvP 最佳IV</b>：'+ivh+'</div>'+
    (pur?'<div class="kv">🌀 <b style="color:#ffcb05">净化</b>：'+pur.stardust+' 星尘 + '+pur.candy+' 糖果（暗影攻x1.2/防x0.83）</div>':'')+
    (wb.length?'<div class="kv">🌦 <b style="color:#ffcb05">天气加成</b>：'+wb.map(function(x){return WN[x.weather]||x.weather;}).join(" / ")+'</div>':'')+
    (ob.length?'<div class="kv">🎯 <b style="color:#ffcb05">当前获取</b>：'+[].concat.apply([],[Array.from(new Set(ob.map(function(o){var M={raid:"团战",egg:"蛋",research:"调查"};return (M[o.method]||o.method)+(o.detail?'('+esc(o.detail)+')':'');})))]).slice(0,8).join(" · ")+'</div>':'')+
    (hasEvo?'<div class="kv">🔄 <b style="color:#ffcb05">进化链</b>：'+_chain(_root)+'</div>':'')+
    '<div class="mv" style="margin-top:10px">⚡ <b style="color:#bfe0ff">快速招式</b><br>'+mvl(mv("fast"))+'</div>'+
    '<div class="mv" style="margin-top:8px">💥 <b style="color:#ffc59c">充能招式</b><br>'+mvl(mv("charged"))+'</div>';
}
function showHtml(html){ensure();document.getElementById("pmCard").innerHTML=html;var o=document.getElementById("pmOv");o.style.display="flex";o.scrollTop=0;}
function show(sid){showHtml(detailHtml(sid));}
// 招式详情：威力/能量/时长/buff + 哪些宝可梦能学（快攻/大招/精英）
function moveDetailHtml(mid){
  var m=rows("SELECT * FROM moves WHERE move_id=?",[mid])[0];if(!m)return "未找到招式";
  var users=rows("SELECT DISTINCT p.dex,p.name_cn,pm.slot,pm.is_elite FROM pokemon_moves pm JOIN pokemon p ON p.species_id=pm.species_id WHERE pm.move_id=? AND p.is_shadow=0 ORDER BY pm.is_elite,p.dex",[mid]);
  var slotName=m.slot==="fast"?"快速招式":"充能招式";
  var dpe=(m.pve_energy&&m.pve_power)?(m.pve_power/Math.abs(m.pve_energy)).toFixed(2):"";
  var buffTxt="";if(m.pvp_buffs){try{var b=JSON.parse(m.pvp_buffs);buffTxt=JSON.stringify(b);}catch(e){buffTxt=m.pvp_buffs;}}
  var chips=users.map(function(u){return '<span data-pdex="'+u.dex+'" style="cursor:pointer;font-size:11.5px;background:#1f2330;border:1px solid #2c3142;border-radius:7px;padding:1px 7px;margin:2px;display:inline-block">'+(u.is_elite?'🔑':'')+esc(u.name_cn)+'</span>';}).join("");
  return '<span id="pmX" onclick="pmClose()">×</span><h3>'+esc(m.name_cn)+' <small style="color:#9aa1b4;font-weight:400;font-size:12px">'+esc(m.name_en)+'</small></h3>'+
    '<div class="kv">类型：'+tchip(m.type)+'　'+slotName+'</div>'+
    '<div class="kv">⚔️ <b style="color:#ffcb05">PvE（团战/道馆）</b>：威力 <b>'+(m.pve_power||0)+'</b> · 能量 <b>'+(m.pve_energy||0)+'</b> · 时长 <b>'+(m.pve_duration_ms?(m.pve_duration_ms/1000)+'s':'?')+'</b>'+(dpe?' · 威力/能量比 '+dpe:'')+'</div>'+
    '<div class="kv">🥊 <b style="color:#ffcb05">PvP（训练家对战）</b>：威力 <b>'+(m.pvp_power||0)+'</b> · 能量 <b>'+(m.pvp_energy||0)+'</b>'+(m.pvp_turns!=null?' · '+m.pvp_turns+'回合':'')+(buffTxt?' · <span style="color:#ffcb05">效果 '+esc(buffTxt)+'</span>':'')+'</div>'+
    '<div class="kv" style="margin-top:10px">📚 <b style="color:#ffcb05">可学习的宝可梦</b>（'+users.length+'，🔑=需精英学习器）</div>'+
    '<div style="margin-top:4px;max-height:240px;overflow:auto">'+(chips||"—")+'</div>';
}
// 招式 tooltip（浮层，不替换详情弹窗）：紧凑显示威力/能量/时长/buff
function moveTipHtml(mid){
  var m=rows("SELECT * FROM moves WHERE move_id=?",[mid])[0];if(!m)return "未找到招式";
  var slotName=m.slot==="fast"?"快攻":"大招";
  var dpe=(m.pve_energy&&m.pve_power)?(m.pve_power/Math.abs(m.pve_energy)).toFixed(2):"";
  var nUsers=rows("SELECT COUNT(DISTINCT species_id) n FROM pokemon_moves WHERE move_id=?",[mid])[0];
  var buffTxt="";if(m.pvp_buffs){try{buffTxt=JSON.stringify(JSON.parse(m.pvp_buffs));}catch(e){buffTxt=m.pvp_buffs;}}
  return '<div style="font-weight:800;font-size:13.5px;margin-bottom:4px">'+esc(m.name_cn)+' '+tchip(m.type)+' <span style="color:#9aa1b4;font-weight:400;font-size:11px">'+esc(m.name_en)+' · '+slotName+'</span></div>'+
    '<div style="font-size:12px;line-height:1.7">'+
    '⚔️ <b style="color:#ffcb05">PvE</b>：威力 '+(m.pve_power||0)+' · 能量 '+(m.pve_energy||0)+' · 时长 '+(m.pve_duration_ms?(m.pve_duration_ms/1000)+'s':'?')+(dpe?' · 威能比 '+dpe:'')+'<br>'+
    '🥊 <b style="color:#ffcb05">PvP</b>：威力 '+(m.pvp_power||0)+' · 能量 '+(m.pvp_energy||0)+(buffTxt?'<br>✨ 效果：<span style="color:#ffcb05">'+esc(buffTxt)+'</span>':'')+'<br>'+
    '<span style="color:#9aa1b4">📚 '+(nUsers?nUsers.n:0)+' 只可学 · <span style="color:#46d39a;cursor:pointer" onclick="moveModal(\''+esc(mid)+'\')">看完整名单 →</span></span>'+
    '</div>';
}
function ensureTip(){
  if(document.getElementById("pmTip"))return;
  var t=document.createElement("div");t.id="pmTip";
  t.style.cssText="display:none;position:fixed;z-index:10001;max-width:280px;background:#0f1320;border:1px solid #3a4258;border-radius:11px;padding:10px 12px;color:#e9ebf2;font-family:-apple-system,'PingFang SC',system-ui,sans-serif;box-shadow:0 12px 40px -8px rgba(0,0,0,.8)";
  document.body.appendChild(t);
}
function hideTip(){var t=document.getElementById("pmTip");if(t)t.style.display="none";}
window.pokeModal=function(dex){load().then(function(){var r=rows("SELECT species_id FROM pokemon WHERE dex=? AND is_shadow=0 ORDER BY length(species_id) LIMIT 1",[+dex]);if(r[0])show(r[0].species_id);});};
window.pokeModalSid=function(sid){load().then(function(){show(sid);});};
window.moveModal=function(mid){load().then(function(){showHtml(moveDetailHtml(mid));});};
window.moveTip=function(ev,mid){
  if(ev){ev.preventDefault();ev.stopPropagation();}
  load().then(function(){
    ensureTip();var t=document.getElementById("pmTip");
    t.innerHTML=moveTipHtml(mid);t.style.display="block";
    // 定位在点击点附近，做视口夹取
    var x=(ev&&ev.clientX)||120,y=(ev&&ev.clientY)||120;
    var w=t.offsetWidth,h=t.offsetHeight,vw=window.innerWidth,vh=window.innerHeight;
    var left=Math.min(x+12,vw-w-10),top=y+14; if(top+h>vh-10)top=Math.max(10,y-h-12);
    t.style.left=Math.max(10,left)+"px";t.style.top=top+"px";
  });
};
window.pmClose=close;
// 点击 tooltip 以外区域 / 滚动 / Esc 关闭 tooltip
document.addEventListener("click",function(e){var t=document.getElementById("pmTip");if(t&&t.style.display==="block"&&!t.contains(e.target)&&!(e.target.closest&&e.target.closest('[onclick*="moveTip"]')))hideTip();},true);
document.addEventListener("keydown",function(e){if(e.key==="Escape")hideTip();});
// 自动接线：把匹配选择器、且 src 含 official-artwork/<dex>.png 的图片标记为可点（data-pdex）。
// 生成器无关：在页面加载后扫描现有 DOM，无论内容是静态还是脚本注入都能接上弹窗。
window.pokeModalAutowire=function(sel){
  try{
    Array.prototype.forEach.call(document.querySelectorAll(sel||"img"),function(img){
      if(img.closest("#pmOv"))return;
      if(img.getAttribute("data-pdex"))return;
      var m=(img.getAttribute("src")||img.src||"").match(/official-artwork\/(\d+)\.png/);
      if(!m)return;
      img.setAttribute("data-pdex",m[1]);
      img.style.cursor="pointer";
      if(!img.title)img.title="查看完整资料";
    });
  }catch(e){}
};
// 默认自动接线：页面加载后扫描所有 official-artwork 立绘并接上弹窗；延时再扫一次以覆盖懒加载/脚本注入。
(function(){
  function run(){if(window.PM_NO_AUTOWIRE)return;window.pokeModalAutowire("img");}
  if(document.readyState!=="loading")run();else document.addEventListener("DOMContentLoaded",run);
  setTimeout(run,1500);setTimeout(run,4000);
})();
// 事件委托：任意带 data-pdex="<dex>" 或 data-psid="<species_id>" 的元素点击即开弹窗。
document.addEventListener("click",function(e){
  var el=e.target.closest?e.target.closest("[data-pdex],[data-psid]"):null;
  if(!el)return;
  e.preventDefault();e.stopPropagation();
  var sid=el.getAttribute("data-psid");
  if(sid){window.pokeModalSid(sid);return;}
  var dex=el.getAttribute("data-pdex");
  if(dex)window.pokeModal(+dex);
});
})();
