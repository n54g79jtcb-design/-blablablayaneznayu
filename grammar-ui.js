(() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  let level = "All", category = "All categories", query = "", renderingGrammar = false, renderingTenses = false;

  const conjugationReference = [
    {group:"Core tense endings",form:"-아/어요 · -ㅂ/습니다 · -는다/ㄴ다",meaning:"present / habitual / general truth depending on speech style",examples:"먹어요 · 먹습니다 · 먹는다"},
    {group:"Past",form:"-았/었- · -았/었습니다 · -았다/었다",meaning:"past event or state",examples:"먹었어요 · 먹었습니다 · 먹었다"},
    {group:"Future / prospective",form:"-(으)ㄹ 거예요 · -(으)ㄹ 것이다",meaning:"future plan, expectation or prediction",examples:"갈 거예요 · 갈 것이다"},
    {group:"Intention / inference",form:"-겠-",meaning:"formal intention, willingness, inference or prediction",examples:"하겠습니다 · 맛있겠어요"},
    {group:"Promise / reaction",form:"-(으)ㄹ게요",meaning:"speaker's promise or decision made toward the listener",examples:"제가 연락할게요"},
    {group:"Progressive",form:"-고 있다",meaning:"action in progress",examples:"공부하고 있어요"},
    {group:"Resultant state",form:"-아/어 있다",meaning:"state remaining after an action",examples:"문이 열려 있어요"},
    {group:"Repeated / habitual",form:"-곤 하다",meaning:"used to / often do",examples:"주말마다 산책하곤 해요"},
    {group:"Experience",form:"-(으)ㄴ 적이 있다/없다",meaning:"have / have never done",examples:"한국에 간 적이 있어요"},
    {group:"Continuation to now",form:"-아/어 오다",meaning:"action or change continuing up to the present",examples:"계속 공부해 왔어요"},
    {group:"Continuation forward",form:"-아/어 가다",meaning:"action or change continuing onward",examples:"점점 좋아져 가요"},
    {group:"Completion",form:"-아/어 버리다",meaning:"finish completely; often adds emotional nuance",examples:"다 먹어 버렸어요"},
    {group:"Prepared / maintained result",form:"-아/어 놓다 · -아/어 두다",meaning:"do something and leave/keep it that way or prepare in advance",examples:"문을 열어 놓았어요 · 메모해 두세요"},
    {group:"Past recollection",form:"-더- · -던",meaning:"speaker's remembered or observed past",examples:"맛있더라고요 · 자주 가던 카페"},
    {group:"Completed recalled past",form:"-았/었던",meaning:"completed past recalled as a modifier",examples:"전에 읽었던 책"},
    {group:"Earlier / discontinued past",form:"-았/었었-",meaning:"had done / used to; emphasizes distance or discontinuity",examples:"예전에 여기서 살았었어요"},
    {group:"Near future",form:"-(으)려던 참이다",meaning:"be just about to do",examples:"나가려던 참이에요"},
    {group:"Counterfactual past",form:"-았/었더라면 … -았/었을 텐데",meaning:"if had..., would have...",examples:"알았더라면 준비했을 텐데요"}
  ];

  const irregularReference = [
    ["ㅂ irregular","ㅂ → 우/오 before a vowel","돕다 → 도와요 · 춥다 → 추워요"],
    ["ㄷ irregular","ㄷ → ㄹ before a vowel","듣다 → 들어요 · 걷다 → 걸어요"],
    ["르 irregular","르 → ㄹㄹ + 아/어","모르다 → 몰라요 · 빠르다 → 빨라요"],
    ["ㅅ irregular","ㅅ drops before a vowel","짓다 → 지어요 · 낫다 → 나아요"],
    ["ㅎ irregular","ㅎ may drop/change before endings","그렇다 → 그래요 · 하얗다 → 하얘요"],
    ["으 deletion","ㅡ drops before 아/어","쓰다 → 써요 · 크다 → 커요"],
    ["ㄹ deletion","ㄹ drops before ㄴ/ㅂ/ㅅ","살다 → 삽니다 · 알다 → 아는"],
    ["하다 contraction","하여 → 해","하다 → 해요 · 공부하다 → 공부해요"]
  ];

  const voiceReference = [
    ["Passive","-이/히/리/기-; -아/어지다; 되다","문이 열렸어요. · 문제가 해결되었어요."],
    ["Causative","-이/히/리/기/우/구/추-; -게 하다","아이를 앉혔어요. · 학생에게 읽게 했어요."],
    ["Negation","안 / 못 / -지 않다 / -지 못하다","안 가요. · 가지 못했어요."],
    ["Honorific subject","-(으)시-","교수님이 오셨어요."],
    ["Humble verbs","드리다 · 뵙다 · 여쭙다 · 모시다","교수님께 여쭤봤어요."],
    ["Copula","이다 / 아니다","학생이에요. · 학생이 아니에요."]
  ];

  const style = document.createElement("style");
  style.textContent = `
    .grammar-tools{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;margin:0 0 14px}.grammar-search{min-height:48px;border:1px solid var(--border);border-radius:15px;background:var(--card);color:var(--text);padding:0 15px;outline:none}.grammar-search:focus{border-color:var(--accent)}
    .grammar-filter-row,.grammar-ref-tabs,.tense-filter-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}.grammar-filter-row button,.grammar-ref-tabs button,.tense-filter-row button{min-height:38px;border:1px solid var(--border);border-radius:999px;background:rgba(255,255,255,.52);padding:0 13px;color:var(--muted)}.grammar-filter-row button.active,.grammar-ref-tabs button.active,.tense-filter-row button.active{background:linear-gradient(145deg,#fffafd,#efd0db);border-color:#dca7bb;color:var(--text)}
    .grammar-count{color:var(--muted);font-size:14px;white-space:nowrap}.grammar-reference{display:none;margin:0 0 18px}.grammar-reference.show{display:block}.reference-grid,.tense-ref-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.reference-card,.tense-master-card{border:1px solid rgba(255,255,255,.9);background:linear-gradient(145deg,rgba(255,255,255,.78),rgba(247,233,238,.65));border-radius:18px;padding:17px;box-shadow:var(--small-shadow)}.reference-card h3,.tense-master-card h3{margin:0 0 8px;font-size:17px;color:#654b55}.reference-card p,.tense-master-card p{margin:5px 0;color:var(--muted);line-height:1.45}.reference-line{display:grid;grid-template-columns:130px 1fr;gap:10px;margin:5px 0;font-size:14px}.reference-line b{color:#7b5966}.g-badges{display:inline-flex;gap:6px;flex-wrap:wrap;margin-right:8px;vertical-align:middle}.g-badge{font-size:11px;border:1px solid rgba(205,153,173,.3);background:rgba(255,255,255,.65);border-radius:999px;padding:3px 7px;color:#9a7080}.grammar-note{margin-top:10px;padding:10px 12px;border-radius:12px;background:rgba(239,208,219,.28);color:var(--muted);font-size:14px}.grammar-empty{padding:28px;text-align:center;color:var(--muted);border:1px dashed var(--border);border-radius:18px}
    .tense-master{display:grid;gap:22px}.tense-section-title{margin:4px 0 12px;font-size:21px;color:#654b55}.tense-master-card .form,.reference-card .form{font-size:19px;color:#7a5564;margin:7px 0;line-height:1.4}.tense-master-card .meaning,.tense-master-card .ex{color:var(--muted);line-height:1.5}.tense-tag{display:inline-block;font-size:11px;padding:3px 7px;border-radius:999px;border:1px solid rgba(205,153,173,.28);color:#9a7080;margin-bottom:7px;background:rgba(255,255,255,.58)}
    .speech-table{width:100%;border-collapse:separate;border-spacing:0 7px;font-size:14px}.speech-table th{text-align:left;color:#8f7380;padding:6px 8px}.speech-table td{background:rgba(255,255,255,.55);padding:10px 8px;border-top:1px solid rgba(205,153,173,.18);border-bottom:1px solid rgba(205,153,173,.18)}.speech-table td:first-child{border-left:1px solid rgba(205,153,173,.18);border-radius:12px 0 0 12px}.speech-table td:last-child{border-right:1px solid rgba(205,153,173,.18);border-radius:0 12px 12px 0}.mini-ref-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.mini-ref{padding:15px;border:1px solid rgba(255,255,255,.9);background:rgba(255,255,255,.58);border-radius:16px}.mini-ref b{display:block;color:#654b55;margin-bottom:5px}.mini-ref span{display:block;color:var(--muted);line-height:1.45;font-size:14px}
    @media(max-width:760px){.grammar-tools{grid-template-columns:1fr}.reference-grid,.tense-ref-grid,.mini-ref-grid{grid-template-columns:1fr}.reference-line{grid-template-columns:1fr}.speech-table{display:block;overflow-x:auto;white-space:nowrap}}
  `;
  document.head.appendChild(style);

  function getRef(){ return window.KOREAN_GRAMMAR_REFERENCE || {}; }
  function filteredGrammar(){
    const q=query.trim().toLowerCase();
    return grammar.filter(g=>{
      const lv=String(g.topik || 2), cat=g.category||"Core Grammar";
      const text=`${g.form} ${g.use} ${g.example} ${g.translation} ${cat} ${g.note||""}`.toLowerCase();
      return (level==="All"||lv===level) && (category==="All categories"||cat===category) && (!q||text.includes(q));
    }).sort((a,b)=>(a.topik-b.topik)||(a.category||"").localeCompare(b.category||"")||a.form.localeCompare(b.form,"ko"));
  }

  function renderReference(which=""){
    const box=$("grammarReference"), ref=getRef(); if(!box)return;
    if(!which){box.className="grammar-reference";box.innerHTML="";return;}
    box.className="grammar-reference show";
    if(which==="speech") box.innerHTML=`<div class="reference-grid">${(ref.speechLevels||[]).map(x=>`<div class="reference-card"><h3>${esc(x.name)}</h3><p>${esc(x.register)}</p><div class="reference-line"><b>Statement</b><span>${esc(x.statement)}</span></div><div class="reference-line"><b>Question</b><span>${esc(x.question)}</span></div><div class="reference-line"><b>Command</b><span>${esc(x.command)}</span></div><div class="reference-line"><b>Suggestion</b><span>${esc(x.suggestion)}</span></div><p>${esc(x.usage)}</p></div>`).join("")}</div>`;
    else if(which==="honorific") box.innerHTML=`<div class="reference-grid">${(ref.honorifics||[]).map(x=>`<div class="reference-card"><h3>${esc(x.system)}</h3><div class="form">${esc(x.forms)}</div><p>${esc(x.meaning)}</p><p><b>${esc(x.example)}</b></p></div>`).join("")}</div>`;
    else box.innerHTML=`<div class="reference-grid">${(ref.tenseAspect||[]).map(x=>`<div class="reference-card"><h3>${esc(x.name)}</h3><div class="form">${esc(x.form)}</div><p>${esc(x.meaning)}</p><p><b>${esc(x.example)}</b></p></div>`).join("")}</div>`;
  }

  function renderCardsOnly(){
    const cards=$("grammarCards"), count=$("grammarCount"); if(!cards)return;
    const rows=filteredGrammar(); if(count)count.textContent=`${rows.length} grammar points`;
    cards.innerHTML=rows.length?rows.map(g=>`<details class="grammar-card"><summary><span class="g-badges"><span class="g-badge">TOPIK ${esc(g.topik||2)}</span><span class="g-badge">${esc(g.category||"Grammar")}</span></span>${esc(g.form)} <span class="grammar-use">— ${esc(g.use)}</span></summary><div class="example">${esc(g.example)}</div><div class="translation">${esc(g.translation)}</div>${g.note?`<div class="grammar-note">${esc(g.note)}</div>`:""}</details>`).join(""):`<div class="grammar-empty">No grammar points match these filters.</div>`;
  }

  function renderGrammarMaster(){
    if(renderingGrammar)return; const list=$("grammarList"); if(!list||typeof grammar==="undefined")return; renderingGrammar=true;
    const categories=[...new Set(grammar.map(g=>g.category||"Core Grammar"))].sort();
    list.innerHTML=`<div class="grammar-tools"><input id="grammarSearch" class="grammar-search" placeholder="Search grammar, meaning, example..."><div id="grammarCount" class="grammar-count"></div></div><div class="grammar-filter-row" id="grammarLevels"></div><div class="grammar-filter-row" id="grammarCategories"></div><div class="grammar-ref-tabs" id="grammarRefTabs"></div><div class="grammar-reference" id="grammarReference"></div><div id="grammarCards" style="display:grid;gap:10px"></div>`;
    ["All","1","2","3","4","5","6"].forEach(x=>{const b=document.createElement("button");b.textContent=x==="All"?"All levels":`TOPIK ${x}`;b.className=level===x?"active":"";b.onclick=()=>{level=x;renderingGrammar=false;renderGrammarMaster()};$("grammarLevels").appendChild(b)});
    ["All categories",...categories].forEach(x=>{const b=document.createElement("button");b.textContent=x;b.className=category===x?"active":"";b.onclick=()=>{category=x;renderingGrammar=false;renderGrammarMaster()};$("grammarCategories").appendChild(b)});
    $("grammarSearch").value=query; $("grammarSearch").oninput=e=>{query=e.target.value;renderCardsOnly()};
    $("grammarRefTabs").innerHTML=[["speech","Speech levels"],["honorific","Honorifics"],["tense","Tense & aspect"]].map(([k,l])=>`<button data-ref="${k}">${l}</button>`).join("");
    $("grammarRefTabs").querySelectorAll("button").forEach(b=>b.onclick=()=>{const was=b.classList.contains("active");$("grammarRefTabs").querySelectorAll("button").forEach(x=>x.classList.remove("active"));if(was)return renderReference("");b.classList.add("active");renderReference(b.dataset.ref)});
    renderCardsOnly(); renderingGrammar=false;
  }

  function renderTenseMaster(){
    if(renderingTenses)return; const sec=$("tenses"), ref=getRef(); if(!sec||!(ref.tenseAspect||[]).length)return; renderingTenses=true;
    sec.innerHTML=`<div class="section-head"><h2>Tenses & Forms</h2><p>Complete reference for tense, aspect, retrospective forms, speech levels, honorifics, passive/causative forms and irregular conjugation.</p></div><div class="tense-master">
      <div><h3 class="tense-section-title">Tense & aspect</h3><div class="tense-ref-grid">${conjugationReference.map(x=>`<div class="tense-master-card"><span class="tense-tag">${esc(x.group)}</span><div class="form">${esc(x.form)}</div><div class="meaning">${esc(x.meaning)}</div><div class="ex"><b>${esc(x.examples)}</b></div></div>`).join("")}</div></div>
      <div><h3 class="tense-section-title">Speech levels · from 반말 to formal deferential</h3><div class="tense-master-card" style="overflow:auto"><table class="speech-table"><thead><tr><th>Style</th><th>Register</th><th>Statement</th><th>Question</th><th>Command</th><th>Suggestion</th></tr></thead><tbody>${(ref.speechLevels||[]).map(x=>`<tr><td><b>${esc(x.name)}</b></td><td>${esc(x.register)}</td><td>${esc(x.statement)}</td><td>${esc(x.question)}</td><td>${esc(x.command)}</td><td>${esc(x.suggestion)}</td></tr>`).join("")}</tbody></table></div></div>
      <div><h3 class="tense-section-title">Honorific system</h3><div class="reference-grid">${(ref.honorifics||[]).map(x=>`<div class="reference-card"><h3>${esc(x.system)}</h3><div class="form">${esc(x.forms)}</div><p>${esc(x.meaning)}</p><p><b>${esc(x.example)}</b></p></div>`).join("")}</div></div>
      <div><h3 class="tense-section-title">Passive, causative, negation & copula</h3><div class="mini-ref-grid">${voiceReference.map(x=>`<div class="mini-ref"><b>${esc(x[0])}</b><span>${esc(x[1])}</span><span>${esc(x[2])}</span></div>`).join("")}</div></div>
      <div><h3 class="tense-section-title">Irregular conjugation</h3><div class="mini-ref-grid">${irregularReference.map(x=>`<div class="mini-ref"><b>${esc(x[0])}</b><span>${esc(x[1])}</span><span>${esc(x[2])}</span></div>`).join("")}</div></div>
    </div>`;
    sec.dataset.masterTenses="1"; renderingTenses=false;
  }

  function install(){
    if(!window.KOREAN_GRAMMAR_REFERENCE || typeof grammar==="undefined")return false;
    const head=document.querySelector("#grammar .section-head"); if(head)head.innerHTML=`<h2>Grammar</h2><p>TOPIK 1–6 grammar, speech levels, honorifics, conjugation and advanced written constructions. Use search and filters to study by level or function.</p>`;
    renderGrammarMaster(); renderTenseMaster();
    document.querySelectorAll('.tab[data-tab="grammar"]').forEach(b=>{if(!b.dataset.masterHook){b.dataset.masterHook="1";b.addEventListener("click",()=>setTimeout(renderGrammarMaster,0))}});
    document.querySelectorAll('.tab[data-tab="tenses"]').forEach(b=>{if(!b.dataset.masterHook){b.dataset.masterHook="1";b.addEventListener("click",()=>setTimeout(renderTenseMaster,0))}});
    return true;
  }

  let tries=0; const timer=setInterval(()=>{tries++; if(install()||tries>80)clearInterval(timer)},150);
  [700,1600,3500,7000].forEach(ms=>setTimeout(()=>{install(); if($("tenses")&&!$("tenses").dataset.masterTenses)renderTenseMaster(); if($("grammarList")&&!$("grammarList").querySelector(".grammar-tools"))renderGrammarMaster()},ms));
  const mo=new MutationObserver(()=>{const gl=$("grammarList"); if(gl&&!renderingGrammar&&!gl.querySelector(".grammar-tools"))setTimeout(renderGrammarMaster,40); const ts=$("tenses"); if(ts&&!renderingTenses&&!ts.dataset.masterTenses)setTimeout(renderTenseMaster,40)});
  document.addEventListener("DOMContentLoaded",()=>{const main=document.querySelector("main.app");if(main)mo.observe(main,{childList:true,subtree:true})});
})();