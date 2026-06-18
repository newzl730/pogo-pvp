/* 共享 PvE 团战引擎：与 pve.html 同一套公式（综合战力=DPS×√TDO）。
   用途：任意页面实时计算某宝可梦的最佳属性 + 该属性榜内排名/tier。
   PvEEngine.ready(cb) 加载完成回调；PvEEngine.bestRank(dex) 返回 {type,typeCn,rank,total,tier,dps,tdo} 或 null。 */
(function(){
"use strict";
var DB=null,POK=[],MOVE={},PM={},CPM={},TE={},_rc={},loaded=null;
var SQLBASE="https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/";
var TN={normal:"一般",fire:"火",water:"水",electric:"电",grass:"草",ice:"冰",fighting:"格斗",poison:"毒",ground:"地面",flying:"飞行",psychic:"超能力",bug:"虫",rock:"岩石",ghost:"幽灵",dragon:"龙",dark:"恶",steel:"钢",fairy:"妖精"};
function ls(src){return new Promise(function(res,rej){var s=document.createElement("script");s.src=src;s.onload=res;s.onerror=rej;document.head.appendChild(s);});}
function rows(sql){var st=DB.prepare(sql),o=[];while(st.step())o.push(st.getAsObject());st.free();return o;}
function load(){
  if(loaded)return loaded;
  loaded=(window.initSqlJs?Promise.resolve():ls(SQLBASE+"sql-wasm.js"))
    .then(function(){return initSqlJs({locateFile:function(f){return SQLBASE+f;}});})
    .then(function(SQL){return fetch("pokemon.db?v=pve1").then(function(r){return r.arrayBuffer();}).then(function(buf){
      DB=new SQL.Database(new Uint8Array(buf));
      rows("SELECT level,cpm FROM cpm").forEach(function(r){CPM[r.level]=r.cpm;});
      POK=rows("SELECT species_id,dex,name_cn,type1,type2,atk,def,hp,is_shadow,is_mega,released FROM pokemon");
      rows("SELECT move_id,type,slot,pve_power,pve_energy,pve_duration_ms FROM moves").forEach(function(m){MOVE[m.move_id]=m;});
      rows("SELECT species_id,move_id,slot,is_elite FROM pokemon_moves").forEach(function(r){(PM[r.species_id]=PM[r.species_id]||[]).push(r);});
      rows("SELECT atk_type,def_type,multiplier FROM type_effectiveness").forEach(function(r){(TE[r.atk_type]=TE[r.atk_type]||{})[r.def_type]=r.multiplier;});
    });});
  return loaded;
}
// 与 pve.html calc 完全一致
function calc(p,T,cpm){
  var sh=!!p.is_shadow;
  var types=[p.type1,p.type2].filter(Boolean);
  var eAtk=(p.atk+15)*cpm*(sh?1.2:1), eDef=(p.def+15)*cpm*(sh?0.8333:1), eHP=Math.floor((p.hp+15)*cpm);
  var Dd=180;
  function dmg(pw,mt){return 0.5*pw*(eAtk/Dd)*(types.indexOf(mt)>=0?1.2:1)+1;}
  var pm=PM[p.species_id];if(!pm)return null;
  function cand(slot){return pm.filter(function(m){return m.slot===slot;}).map(function(m){return MOVE[m.move_id];}).filter(function(mv){return mv&&mv.type===T&&mv.pve_duration_ms>0&&(slot==="fast"?mv.pve_energy>0:mv.pve_energy<0);});}
  var fasts=cand("fast"),chs=cand("charged");
  if(!fasts.length||!chs.length)return null;
  var best=null;
  fasts.forEach(function(f){
    var Tf=(f.pve_duration_ms||500)/1000,fDPS=dmg(f.pve_power,f.type)/Tf,fEPS=(f.pve_energy||0)/Tf;
    chs.forEach(function(ch){
      var Tc=(ch.pve_duration_ms||500)/1000,cDPS=dmg(ch.pve_power,ch.type)/Tc,cEPS=Math.abs(ch.pve_energy||1)/Tc;
      var DPS=(cEPS+fEPS)?(fDPS*cEPS+cDPS*fEPS)/(cEPS+fEPS):0;
      var TDO=DPS*eHP*(eDef/Dd)/100,score=DPS*Math.sqrt(TDO);
      if(!best||score>best.score)best={DPS:DPS,TDO:TDO,score:score};
    });
  });
  return best;
}
function rankType(T){
  if(_rc[T])return _rc[T];
  var cpm=CPM[40],res=[];
  POK.forEach(function(p){if(!p.released&&!p.is_mega)return;var b=calc(p,T,cpm);if(b)res.push({p:p,b:b});});
  res.sort(function(a,b){return b.b.score-a.b.score;});
  _rc[T]=res;return res;
}
function tierOf(r){return r>=.97?"S+":r>=.9?"S":r>=.82?"A":r>=.72?"B":"C";}
window.PvEEngine={
  ready:function(cb){load().then(cb).catch(function(e){console.error("PvEEngine load fail",e);});},
  // 找该 dex 的最佳属性 + 在该属性榜内的排名/tier
  bestRank:function(dex){
    var cands=POK.filter(function(p){return p.dex===+dex&&!p.is_shadow;});
    if(!cands.length)return null;
    var cpm=CPM[40],bestT=null,bestScore=-1,bestP=null;
    cands.forEach(function(p){
      [p.type1,p.type2].filter(Boolean).forEach(function(T){
        var b=calc(p,T,cpm);if(b&&b.score>bestScore){bestScore=b.score;bestT=T;bestP=p;}
      });
    });
    if(!bestT)return null;
    var list=rankType(bestT);
    var idx=list.findIndex(function(x){return x.p.species_id===bestP.species_id;});
    if(idx<0)return null;
    var topScore=list[0].b.score||1;
    var b=list[idx].b;
    return {type:bestT,typeCn:TN[bestT],rank:idx+1,total:list.length,tier:tierOf(b.score/topScore),dps:b.DPS,tdo:b.TDO,sid:bestP.species_id};
  }
};
})();
