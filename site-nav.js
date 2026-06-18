/* 统一站点导航：所有页面引用同一份，注入一致的美化导航 + 当前页高亮。
   健壮性：无论页面原本有 <nav> 还是散落的 <a> 链接，都会被替换成统一导航。 */
(function(){
"use strict";
var L=[
  ["index.html","⚔️","PvP"],
  ["pve.html","🏟","团战"],
  ["sim.html","🎮","模拟"],
  ["team.html","🛡️","队伍"],
  ["dmax.html","💥","极巨"],
  ["cal.html","📅","日历"],
  ["rocket.html","🚀","火箭队"],
  ["shiny.html","✨","异色"],
  ["myth.html","🔮","幻兽"],
  ["search.html","🔍","搜索"],
  ["db.html","🗄️","数据库"]
];
var NAVPAGES={};L.forEach(function(x){NAVPAGES[x[0]]=1;});
function curPage(){
  var c=(location.pathname.split("/").pop()||"index.html").toLowerCase();
  if(c===""||c==="pogo-pvp")c="index.html";
  return c;
}
function buildNav(cur){
  var nav=document.createElement("nav");
  nav.className="sitenav";
  nav.innerHTML=L.map(function(x){
    var on=x[0]===cur;
    return '<a href="'+x[0]+'"'+(on?' class="navcur" aria-current="page"':'')+
      '><span class="ni">'+x[1]+'</span><span class="nt">'+x[2]+'</span></a>';
  }).join("");
  return nav;
}
function injectCSS(){
  if(document.getElementById("sitenavcss"))return;
  var s=document.createElement("style");s.id="sitenavcss";
  s.textContent=
  ".top nav.sitenav{display:flex;gap:4px;flex-wrap:wrap;align-items:center;margin-top:8px;width:100%}"+
  ".top nav.sitenav a{display:inline-flex;align-items:center;gap:5px;font-size:12.5px!important;line-height:1;text-decoration:none;white-space:nowrap;color:#aeb6c9!important;padding:6px 11px;border-radius:11px;transition:background .14s,color .14s,box-shadow .14s,transform .1s;font-weight:600;border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.03)}"+
  ".top nav.sitenav a:hover{background:rgba(255,255,255,.1);color:#fff!important;transform:translateY(-1px)}"+
  ".top nav.sitenav a.navcur{background:linear-gradient(135deg,#3b6cff,#8a5cff);color:#fff!important;border-color:transparent;box-shadow:0 3px 14px -3px rgba(90,108,255,.7)}"+
  ".top nav.sitenav a .ni{font-size:14px}"+
  "@media(max-width:600px){.top nav.sitenav a .nt{display:none}.top nav.sitenav a{padding:7px 10px}.top nav.sitenav a .ni{font-size:16px}}";
  document.head.appendChild(s);
}
function init(){
  var top=document.querySelector(".top")||document.querySelector("header")||document.body;
  if(!top)return;
  var cur=curPage();
  // 移除已有 <nav>
  Array.prototype.forEach.call(top.querySelectorAll("nav"),function(n){n.parentNode.removeChild(n);});
  // 移除 .top 内散落的导航 <a>（指向其它工具页 *.html 或 pvpoke 的链接）
  Array.prototype.slice.call(top.children).forEach(function(a){
    if(a.tagName==="A"){
      var raw=a.getAttribute("href")||"";
      var href=raw.split("/").pop().split("#")[0].toLowerCase();
      if(NAVPAGES[href]||raw.indexOf("pvpoke")>=0){
        a.parentNode.removeChild(a);
      }
    }
  });
  injectCSS();
  top.appendChild(buildNav(cur));
}
if(document.readyState!=="loading")init();else document.addEventListener("DOMContentLoaded",init);
})();
