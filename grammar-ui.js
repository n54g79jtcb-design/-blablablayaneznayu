(() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  let level = "All", category = "All categories", query = "";

  const style = document.createElement("style");
  style.textContent = `
    .grammar-tools{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;margin:0 0 14px}
    .grammar-search{min-height:48px;border:1px solid var(--border);border-radius:15px;background:var(--card);color:var(--text);padding:0 15px;outline:none}
    .grammar-search:focus{border-color:var(--accent)}
    .grammar-filter-row{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px}
    .grammar-filter-row button{min-height:38px;border:1px solid var(--border);border-radius:999px;background:rgba(255,255,255,.52);padding:0 13px;color:var(--muted)}
    .grammar-filter-row button.active{background:linear-gradient(145deg,#fffafd,#efd0db);border-color:#dca7bb;color:var(--text)}
    .grammar-count{color:var(--muted);font-size:14px;white-space:nowrap}
    .grammar-ref-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:18px 0 14px}
    .grammar-ref-tabs button{min-height:40px;border:1px solid var(--border);border-radius:999px;background:rgba(255,255,255,.52);padding:0 14px;color:var(--muted)}
    .grammar-ref-tabs button.active{background:linear-gradient(145deg,#fffafd,#efd0db);border-color:#dca7bb;color:var(--text)}
    .grammar-reference{display:none;margin:0 0 18px}.grammar-reference.show{display:block}
    .reference-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .reference-card{border:1px solid rgba(255,255,255,.9);background:linear-gradient(145deg,rgba(255,255,255,.78),rgba(247,233,238,.65));border-radius:18px;padding:17px;box-shadow:var(--small-shadow)}
    .reference-card h3{margin:0 0 8px;font-size:17px;color:#654b55}.reference-card p{margin:5px 0;color:var(--muted);line-height:1.45}
    .reference-line{display:grid;grid-template-columns:130px 1fr;gap:10px;margin:5px 0;font-size:14px}.reference-line b{color:#7b5966}
    .g-badges{display:inline-flex;gap:6px;flex-wrap:wrap;margin-right:8px;vertical-align:middle}
    .g-badge{font-size:11px;border:1px solid rgba(205,153,173,.3);background:rgba(255,255,255,.65);border-radius:999px;padding:3px 7px;color:#9a7080}
    .grammar-note{margin-top:10px;padding:10px 12px;border-radius:12px;background:rgba(239,208,219,.28);color:var(--muted);font-size:14px}
    .grammar-empty{padding:28px;text-align:center;color:var(--muted);border:1px dashed var(--border);border-radius:18px}
    .tense-master{display:grid;gap:18px}.tense-ref-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .tense-master-card{border:1px solid rgba(255,255,255,.9);background:linear-gradient(145deg,rgba(255,255,255,.79),rgba(247,233,238,.66));border-radius:20px;padding:19px;box-shadow:var(--small-shadow)}
    .tense-master-card h3{margin:0 0 8px;color:#654b55}.tense-master-card .form{font-size:20px;color:#7a5564;margin:8px 0}.tense-master-card .meaning,.tense-master-card .ex{color:var(--muted);line-height:1.5}
    .speech-table{width:100%;border-collapse:separate;border-spacing:0 7px;font-size:14px}.speech-table th{text-align:left;color:#8f7380;padding:6px 8px}.speech-table td{background:rgba(255,255,255,.55);padding:10px 8px;border-top:1px solid rgba(205,153,173,.18);border-bottom:1px solid rgba(205,153,173,.18)}.speech-table td:first-child{border-left:1px solid rgba(205,153,173,.18);border-radius:12px 0 0 12px}.speech-table td:last-child{border-right:1px solid rgba(205,153,173,.18);border-radius:0 12px 12px 0}
    @media(max-width:760px){.grammar-tools{grid-template-columns:1fr}.reference-grid,.tense-ref-grid{grid-template-columns:1fr}.reference-line{grid-template-columns:1fr}.speech-table{display:block;overflow-x:auto;white-space:nowrap}}
  `;
  document.head.appendChild(style);

  function refButtons(container, active){
    const refs = [["speech","Speech levels"],["honorific","Honorifics"],["tense","Tense & aspect"]];
    container.innerHTML = refs.map(([k,l]) => `<button data-ref="${k}" class="${active===k?"active":""}">${l}</button>`).join("");
  }

  function renderReference(which=""){
    const box = $("grammarReference");
    if(!box) return;
    if(!which){ box.className="grammar-reference"; box.innerHTML=""; return; }
    const ref = window.KOREAN_GRAMMAR_REFERENCE || {};
    box.className="grammar-reference show";
    if(which==="speech"){
      box.innerHTML = `<div class="reference-grid">${(ref.speechLevels||[]).map(x=>`<div class="reference-card"><h3>${esc(x.name)}</h3><p>${esc(x.register)}</p><div class="reference-line"><b>Statement</b><span>${esc(x.statement)}</span></div><div class="reference-line"><b>Question</b><span>${esc(x.question)}</span></div><div class="reference-line"><b>Command</b><span>${esc(x.command)}</span></div><div class="reference-line"><b>Suggestion</b><span>${esc(x.suggestion)}</span></div><p>${esc(x.usage)}</p></div>`).join("")}</div>`;
    } else if(which==="honorific"){
      box.innerHTML = `<div class="reference-grid">${(ref.honorifics||[]).map(x=>`<div class="reference-card"><h3>${esc(x.system)}</h3><div class="form">${esc(x.forms)}</div><p>${esc(x.meaning)}</p><p><b>${esc(x.example)}</b></p></div>`).join("")}</div>`;
    } else {
      box.innerHTML = `<div class="reference-grid">${(ref.tenseAspect||[]).map(x=>`<div class="reference-card"><h3>${esc(x.name)}</h3><div class="form">${esc(x.form)}</div><p>${esc(x.meaning)}</p><p><b>${esc(x.example)}</b></p></div>`).join("")}</div>`;
    }
  }

  function filteredGrammar(){
    const q=query.trim().toLowerCase();
    return grammar.filter(g=>{
      const lv=String(g.topik || 2);
      const levelOk=level==="All" || lv===level;
      const catOk=category==="All categories" || g.category===category;
      const text=`${g.form} ${g.use} ${g.example} ${g.translation} ${g.category} ${g.note||""}`.toLowerCase();
      return levelOk && catOk && (!q || text.includes(q));
    }).sort((a,b)=>(a.topik-b.topik)||a.category.localeCompare(b.category)||a.form.localeCompare(b.form,"ko"));
  }

  function renderGrammarMaster(){
    const list=$("grammarList");
    if(!list) return;
    const categories=[...new Set(grammar.map(g=>g.category||"Core Grammar"))].sort();
    list.innerHTML=`
      <div class="grammar-tools">
        <input id="grammarSearch" class="grammar-search" placeholder="Search grammar, meaning, example...">
        <div id="grammarCount" class="grammar-count"></div>
      </div>
      <div class="grammar-filter-row" id="grammarLevels"></div>
      <div class="grammar-filter-row" id="grammarCategories"></div>
      <div class="grammar-ref-tabs" id="grammarRefTabs"></div>
      <div class="grammar-reference" id="grammarReference"></div>
      <div id="grammarCards" style="display:grid;gap:10px"></div>
    `;
    const levels=$("grammarLevels");
    ["All","1","2","3","4","5","6"].forEach(x=>{
      const b=document.createElement("button"); b.textContent=x==="All"?"All levels":`TOPIK ${x}`; b.className=level===x?"active":"";
      b.onclick=()=>{level=x;renderGrammarMaster();}; levels.appendChild(b);
    });
    const cats=$("grammarCategories");
    ["All categories",...categories].forEach(x=>{
      const b=document.createElement("button"); b.textContent=x; b.className=category===x?"active":"";
      b.onclick=()=>{category=x;renderGrammarMaster();}; cats.appendChild(b);
    });
    $("grammarSearch").value=query;
    $("grammarSearch").oninput=e=>{query=e.target.value;renderCardsOnly();};
    refButtons($("grammarRefTabs"),"");
    $("grammarRefTabs").querySelectorAll("button").forEach(b=>b.onclick=()=>{
      const was=b.classList.contains("active"); $("grammarRefTabs").querySelectorAll("button").forEach(x=>x.classList.remove("active"));
      if(was){renderReference("");return;} b.classList.add("active");renderReference(b.dataset.ref);
    });
    renderCardsOnly();
  }

  function renderCardsOnly(){
    const cards=$("grammarCards"), count=$("grammarCount"); if(!cards) return;
    const rows=filteredGrammar();
    if(count) count.textContent=`${rows.length} grammar points`;
    if(!rows.length){cards.innerHTML=`<div class="grammar-empty">No grammar points match these filters.</div>`;return;}
    cards.innerHTML=rows.map(g=>`<details class="grammar-card">
      <summary><span class="g-badges"><span class="g-badge">TOPIK ${esc(g.topik||2)}</span><span class="g-badge">${esc(g.category||"Grammar")}</span></span>${esc(g.form)} <span class="grammar-use">— ${esc(g.use)}</span></summary>
      <div class="example">${esc(g.example)}</div>
      <div class="translation">${esc(g.translation)}</div>
      ${g.note?`<div class="grammar-note">${esc(g.note)}</div>`:""}
    </details>`).join("");
  }

  function renderTenseMaster(){
    const sec=$("tenses"), ref=window.KOREAN_GRAMMAR_REFERENCE||{}; if(!sec)return;
    sec.innerHTML=`
      <div class="section-head"><h2>Tenses & Forms</h2><p>Korean tense, aspect, mood, retrospective forms and politeness endings in one reference.</p></div>
      <div class="tense-master">
        <div>
          <h3 style="margin:0 0 12px">Tense & aspect system</h3>
          <div class="tense-ref-grid">${(ref.tenseAspect||[]).map(x=>`<div class="tense-master-card"><h3>${esc(x.name)}</h3><div class="form">${esc(x.form)}</div><div class="meaning">${esc(x.meaning)}</div><div class="ex">${esc(x.example)}</div></div>`).join("")}</div>
        </div>
        <div>
          <h3 style="margin:8px 0 12px">Speech level comparison</h3>
          <div class="tense-master-card" style="overflow:auto">
            <table class="speech-table"><thead><tr><th>Level</th><th>Register</th><th>Statement</th><th>Question</th><th>Command</th><th>Suggestion</th></tr></thead><tbody>
              ${(ref.speechLevels||[]).map(x=>`<tr><td><b>${esc(x.name)}</b></td><td>${esc(x.register)}</td><td>${esc(x.statement)}</td><td>${esc(x.question)}</td><td>${esc(x.command)}</td><td>${esc(x.suggestion)}</td></tr>`).join("")}
            </tbody></table>
          </div>
        </div>
        <div>
          <h3 style="margin:8px 0 12px">Honorific system</h3>
          <div class="reference-grid">${(ref.honorifics||[]).map(x=>`<div class="reference-card"><h3>${esc(x.system)}</h3><div class="form">${esc(x.forms)}</div><p>${esc(x.meaning)}</p><p><b>${esc(x.example)}</b></p></div>`).join("")}</div>
        </div>
      </div>`;
  }

  function init(){
    if(!window.KOREAN_GRAMMAR_REFERENCE || typeof grammar==="undefined") return setTimeout(init,120);
    const head=document.querySelector("#grammar .section-head");
    if(head) head.innerHTML=`<h2>Grammar</h2><p>TOPIK 1–6 grammar, speech levels, honorifics, conjugation and advanced written constructions. TOPIK labels are study-oriented, not an official finite syllabus.</p>`;
    renderGrammarMaster(); renderTenseMaster();
    document.querySelectorAll('.tab[data-tab="grammar"]').forEach(b=>b.addEventListener("click",()=>setTimeout(renderGrammarMaster,0)));
    document.querySelectorAll('.tab[data-tab="tenses"]').forEach(b=>b.addEventListener("click",()=>setTimeout(renderTenseMaster,0)));
  }
  setTimeout(init,420);
})();