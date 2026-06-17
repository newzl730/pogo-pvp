/* PvPoke 中文化层：1) 路径→get 兜底(深链刷新) 2) 界面字符串翻译(DOM+动态) */
(function(){
"use strict";
// ---- 1) deep-link get shim: parse clean-URL path into window.get ----
try{
  var path=location.pathname;
  function seg(tool){var i=path.indexOf("/"+tool+"/");if(i<0)return null;return path.slice(i+tool.length+2).replace(/\/+$/,"").split("/").filter(Boolean);}
  var g=(typeof window.get==="object"&&window.get)?window.get:{};
  var r=seg("rankings"); if(r&&r.length){if(r[0])g.cup=r[0];if(r[1])g.cp=r[1];if(r[2])g.category=r[2];}
  var t=seg("team-builder"); if(t&&t.length){if(t[0])g.cup=t[0];if(t[1])g.cp=t[1];}
  var b=seg("battle"); if(b&&b.length){ if(b[0]==="matrix")g.mode="matrix"; else if(b[0]==="multi")g.mode="multi"; }
  window.get=g;
}catch(e){}

// ---- 2) UI string dictionary (EN -> 中文) ----
var D={
"Rankings":"排名榜","Battle":"对战","Team Builder":"队伍构建","Teams":"队伍","Custom Rankings":"自定义排名","Pokedex":"图鉴","Moves":"招式","Train":"训练","Articles":"文章","Settings":"设置","More":"更多","Home":"首页","Sandbox":"沙盒",
"Single Battle":"单体对战","Multi Battle":"多体对战","Matrix Battle":"对战矩阵","Fast Search":"快速搜索",
"Overall":"综合","Leads":"先锋","Switches":"换人","Closers":"收尾","Chargers":"蓄力","Attackers":"进攻","Consistency":"稳定",
"Great League":"超级联盟","Ultra League":"高级联盟","Master League":"大师联盟","Little Cup":"小小杯","Little League":"小小杯",
"Choose a Pokemon":"选择宝可梦","Choose a Pokémon":"选择宝可梦","Search name":"搜索名称","Search":"搜索",
"Fast Move":"快速招式","Fast Moves":"快速招式","Charged Move":"充能招式","Charged Moves":"充能招式","Charged Move 1":"充能招式1","Charged Move 2":"充能招式2","Charged Attack":"充能招式",
"Moveset":"配招","Movesets":"配招","Recommended":"推荐","Best Movesets":"最佳配招",
"Shields":"护盾","Shield":"护盾","No Shields":"无护盾","1 Shield":"1 护盾","2 Shields":"2 护盾","Shield Baiting":"骗盾",
"Stats":"属性值","Attack":"攻击","Defense":"防御","Stamina":"耐力","HP":"血量","CP":"CP","Level":"等级","IVs":"个体值","Typing":"属性",
"Counters":"克制","Key Counters":"主要克制","Top Counters":"主要克制","Key Matchups":"关键对位","Weaknesses":"弱点","Wins":"胜","Losses":"负","Win":"胜","Loss":"负",
"Rating":"评分","Score":"评分","Rank":"排名","Reset":"重置","Share":"分享","Save":"保存","Export":"导出","Apply":"应用","Close":"关闭","Cancel":"取消","Continue":"继续","Add Pokemon":"添加宝可梦","Add Pokémon":"添加宝可梦","Remove":"移除","Clear":"清空","Copy":"复制",
"Threats":"威胁","Custom Threats":"自定义威胁","Alternatives":"替代选择","Coverage":"覆盖","Team":"队伍","Your Team":"你的队伍","Meta":"环境","Meta Picks":"环境热门",
"Timeline":"时间轴","Battle Timeline":"对战时间轴","Summary":"总结","Details":"详情","Sandbox Mode":"沙盒模式","Simulate":"模拟","Simulate Battle":"模拟对战",
"Energy":"能量","Damage":"伤害","Turns":"回合","Cooldown":"冷却","Power":"威力","Duration":"持续",
"Type":"属性","Cup":"杯赛","Format":"赛制","Category":"类别","League":"联盟","All Pokemon":"全部宝可梦","All Pokémon":"全部宝可梦",
"Show advanced options":"显示高级选项","Hide advanced options":"隐藏高级选项","Advanced":"高级","Options":"选项",
"Pokemon":"宝可梦","Pokémon":"宝可梦","Dex":"图鉴号","Family":"家族","Released":"已实装","Buddy Distance":"伙伴距离",
"Self":"自身","Opponent":"对手","vs":"对","or":"或","and":"和","Total":"合计","Best Buddy":"最佳伙伴","Shadow":"暗影","Mega":"超级","Best":"最佳",
"Sort By":"排序方式","Show Move Counts":"显示招式次数","Search Pokemon":"搜索宝可梦","Search Pokémon":"搜索宝可梦",
"The best Pokemon overall across multiple roles.":"多种定位下综合表现最佳的宝可梦。","They have the typing, moves, and stats to succeed as top contenders.":"它们的属性、招式与种族值使其成为顶尖竞争者。",
"Help provide usage data for the rankings at":"帮助提供排名使用数据：","Choose a cup":"选择杯赛","Choose a format":"选择赛制",
"Lead":"先锋","Switch":"换人","Closer":"收尾","Charger":"蓄力","Attacker":"进攻","Self-Rating":"自评分","Move Counts":"招式次数",
"Show":"显示","Hide":"隐藏","results":"结果","No results":"无结果","Loading":"加载中","Loading...":"加载中…",
"Buddy":"伙伴","Third Move":"第二大招","Unlock":"解锁","Fast":"快","Charged":"大招","DPT":"每回合伤害","EPT":"每回合能量","DPE":"每能量伤害",
"Compare":"对比","Top Threats":"主要威胁","Recommended Moves":"推荐招式","Alternative Moves":"备选招式","Legacy":"传承","Elite TM":"精英刷招器",
"Great League (1500)":"超级联盟(1500)","Ultra League (2500)":"高级联盟(2500)","Master League (10000)":"大师联盟","Master League (Level 50)":"大师联盟(50级)",
"Select a Pokemon":"选择宝可梦","Select a Pokémon":"选择宝可梦","Search name":"搜索名称",
"Single":"单体","Multi":"多体","Matrix":"矩阵","Random":"随机","Swap":"交换","Import from Pokebox":"从宝可梦盒导入",
"Select two Pokemon from any league to fight a simulated battle. Customize movesets, levels, IV's, and shields.":"从任意联盟选两只宝可梦进行模拟对战，可自定义配招、等级、个体值与护盾。",
"Build a team and discover its top threats and best partners.":"构建队伍，找出主要威胁与最佳搭档。","Add a Pokemon to your team to get started.":"添加宝可梦开始构建队伍。",
"Pokebox":"宝可梦盒","Battle Again":"再战一次","Next":"下一个","Previous":"上一个","Edit":"编辑","Done":"完成","More Options":"更多选项",
"Quick Fill":"快速填充","Ranking":"排名","Format":"赛制","Scenario":"情景","Custom":"自定义","Default":"默认",
"Get Battle Rating":"获取对战评分","Battle Rating":"对战评分","Win Rate":"胜率","Per Pokemon":"逐只","Overall Performance":"综合表现",
"Top Performers":"最佳表现","Team Rating":"队伍评分","Defenders":"防守方","Attackers":"进攻方","Generate":"生成","Calculate":"计算"
};
function tr(s){if(!s)return s;var k=s.trim();if(D[k])return s.replace(k,D[k]);return s;}
function walk(root){
  try{
    var w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null);
    var n,arr=[];while(n=w.nextNode())arr.push(n);
    arr.forEach(function(t){var v=t.nodeValue;if(v&&v.trim()&&D[v.trim()]){t.nodeValue=v.replace(v.trim(),D[v.trim()]);}});
    // attributes
    root.querySelectorAll&&root.querySelectorAll("[placeholder],[title]").forEach(function(el){
      var p=el.getAttribute("placeholder");if(p&&D[p.trim()])el.setAttribute("placeholder",D[p.trim()]);
      var ti=el.getAttribute("title");if(ti&&D[ti.trim()])el.setAttribute("title",D[ti.trim()]);
    });
  }catch(e){}
}
function run(){walk(document.body);}
if(document.readyState!=="loading")run();else document.addEventListener("DOMContentLoaded",run);
// dynamic content (rankings table, battle results) — observe
document.addEventListener("DOMContentLoaded",function(){
  try{var mo=new MutationObserver(function(muts){muts.forEach(function(m){m.addedNodes&&m.addedNodes.forEach(function(nd){if(nd.nodeType===1)walk(nd);else if(nd.nodeType===3&&nd.nodeValue&&D[nd.nodeValue.trim()])nd.nodeValue=nd.nodeValue.replace(nd.nodeValue.trim(),D[nd.nodeValue.trim()]);});});});
  mo.observe(document.body,{childList:true,subtree:true});}catch(e){}
});
})();
