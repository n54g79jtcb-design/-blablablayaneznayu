(() => {
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const LS2 = {
    get(k,f){ try { const v=JSON.parse(localStorage.getItem(k)); return v ?? f; } catch { return f; } },
    set(k,v){ localStorage.setItem(k,JSON.stringify(v)); }
  };
  const RESULT_KEY="placementResultV1", PLAN_KEY="learningPlanV1", CHECK_KEY="planChecksV1", PROFILE_KEY="localProfileV1";
  let result=LS2.get(RESULT_KEY,null), plan=LS2.get(PLAN_KEY,null), checks=LS2.get(CHECK_KEY,{}), profile=LS2.get(PROFILE_KEY,{name:"My profile",minutes:45});
  let testIndex=0, testAnswers=[], testStarted=false;

  const questions=[
    // TOPIK 1
    {band:1,skill:"vocabulary",q:"What does 학교 mean?",a:"school",o:["school","hospital","market","station"]},
    {band:1,skill:"grammar",q:"Choose the natural sentence for ‘I drink coffee.’",a:"커피를 마셔요.",o:["커피를 마셔요.","커피가 가요.","커피에서 자요.","커피는 학생이에요."]},
    {band:1,skill:"particles",q:"학교__ 가요. Choose the correct particle.",a:"에",o:["에","에서","를","가"]},
    {band:1,skill:"reading",q:"민수는 학생이에요. 매일 학교에 가요. What is true?",a:"Minsu goes to school every day.",o:["Minsu goes to school every day.","Minsu is a teacher.","Minsu never goes to school.","Minsu works at a hospital."]},
    {band:1,skill:"listening",audio:"오늘 날씨가 좋아요.",q:"Listen and choose the meaning.",a:"The weather is good today.",o:["The weather is good today.","It rained yesterday.","I am busy today.","The food is good today."]},
    // TOPIK 2
    {band:2,skill:"vocabulary",q:"What does 약속 mean?",a:"appointment / promise",o:["appointment / promise","exercise","discount","mistake"]},
    {band:2,skill:"grammar",q:"내일 시험이 있어서 오늘 공부___. Choose the best ending: ‘I have to study today.’",a:"해야 해요",o:["해야 해요","하고 싶었어요","할까요","한 적이 있어요"]},
    {band:2,skill:"particles",q:"카페__ 친구를 만났어요. Choose the place-of-action particle.",a:"에서",o:["에서","에","에게","부터"]},
    {band:2,skill:"reading",q:"수업이 끝난 후에 도서관에 가서 숙제를 했어요. What happened first?",a:"The class ended.",o:["The class ended.","The homework was finished.","The speaker went home.","The library closed."]},
    {band:2,skill:"listening",audio:"주말에 친구를 만나려고 해요.",q:"Listen and choose the closest meaning.",a:"I plan to meet a friend on the weekend.",o:["I plan to meet a friend on the weekend.","I met a friend yesterday.","I cannot meet my friend.","My friend plans to study."]},
    // TOPIK 3
    {band:3,skill:"vocabulary",q:"What does 적응하다 mean?",a:"to adapt",o:["to adapt","to reserve","to translate","to refuse"]},
    {band:3,skill:"grammar",q:"한국에서 살__ 한국어가 많이 늘었어요. Choose the form meaning ‘while living’. ",a:"는 동안",o:["는 동안","기 전에","기로","는 대신"]},
    {band:3,skill:"particles",q:"교수님__ 질문을 드렸어요. Choose the respectful recipient particle.",a:"께",o:["께","이","를","부터"]},
    {band:3,skill:"reading",q:"처음에는 한국 생활이 낯설었지만, 시간이 지나면서 조금씩 익숙해졌어요. What changed?",a:"Korean life gradually became familiar.",o:["Korean life gradually became familiar.","The speaker decided to leave Korea.","The speaker stopped studying Korean.","Life became more unfamiliar over time."]},
    {band:3,skill:"listening",audio:"비가 올 것 같으니까 우산을 가져가세요.",q:"Listen. Why should the listener take an umbrella?",a:"Because it looks like it will rain.",o:["Because it looks like it will rain.","Because it is very sunny.","Because the umbrella is broken.","Because it already stopped raining."]},
    // TOPIK 4
    {band:4,skill:"vocabulary",q:"What does 가능성 mean?",a:"possibility",o:["possibility","responsibility","personality","relationship"]},
    {band:4,skill:"grammar",q:"공부하면 할__ 더 재미있어져요. Choose the form meaning ‘the more...’. ",a:"수록",o:["수록","뿐","커녕","다가"]},
    {band:4,skill:"grammar",q:"도시는 편리한 ___ 사람이 너무 많아요. Choose a contrast form meaning ‘whereas/on the other hand’. ",a:"반면에",o:["반면에","덕분에","바람에","김에"]},
    {band:4,skill:"reading",q:"회사는 비용을 줄이기 위해 재택근무 제도를 확대했다. 그러나 직원들 사이에서는 소통이 어려워졌다는 의견도 나왔다. Which issue was mentioned?",a:"Communication became more difficult.",o:["Communication became more difficult.","Costs increased because of office rent.","Employees refused remote work entirely.","The company stopped reducing costs."]},
    {band:4,skill:"listening",audio:"예상보다 시간이 오래 걸리는 바람에 약속에 늦었어요.",q:"Listen. What caused the speaker to be late?",a:"It took longer than expected.",o:["It took longer than expected.","The appointment was cancelled.","The speaker left too early.","The weather was better than expected."]},
    // TOPIK 5
    {band:5,skill:"vocabulary",q:"What does 불가피하다 mean?",a:"to be unavoidable",o:["to be unavoidable","to be flexible","to be temporary","to be obvious"]},
    {band:5,skill:"grammar",q:"그 정책은 문제를 해결하기는___ 오히려 상황을 악화시켰다. Choose the form meaning ‘far from / let alone’. ",a:"커녕",o:["커녕","마저","만큼","조차도"]},
    {band:5,skill:"grammar",q:"결과가 좋다고 해서 과정까지 정당한 ___. Choose the expression meaning ‘it does not necessarily mean’. ",a:"것은 아니다",o:["것은 아니다","셈이다","법이다","뿐이다"]},
    {band:5,skill:"reading",q:"기술 발전은 생활의 편의를 높였다는 점에서 긍정적으로 평가할 수 있다. 다만 개인정보 침해 가능성이 커졌다는 점은 해결해야 할 과제로 남아 있다. What is the writer’s position?",a:"Technology has benefits, but privacy risks remain a problem.",o:["Technology has benefits, but privacy risks remain a problem.","Technology should be completely rejected.","Privacy is no longer an important issue.","Technological development has only negative effects."]},
    {band:5,skill:"listening",audio:"경기가 회복되는 듯했으나 소비 심리는 여전히 위축되어 있는 것으로 나타났습니다.",q:"Listen. What remains weak?",a:"Consumer sentiment",o:["Consumer sentiment","Employment applications","International tourism","University enrollment"]},
    // TOPIK 6
    {band:6,skill:"vocabulary",q:"What does 간과하다 mean?",a:"to overlook",o:["to overlook","to exaggerate","to negotiate","to verify"]},
    {band:6,skill:"grammar",q:"그의 주장은 일부 타당성이 있기는 ___ 근거가 충분하다고 보기는 어렵다. Choose the concessive form.",a:"하나",o:["하나","커녕","마다","든지"]},
    {band:6,skill:"grammar",q:"사회적 합의 없이 제도를 성급히 도입할 __ 부작용이 생길 수 있다. Choose the formal written form meaning ‘if/in the event that’. ",a:"경우",o:["경우","나름","셈","리"]},
    {band:6,skill:"reading",q:"개인의 선택을 존중해야 한다는 원칙은 중요하다. 그러나 그 선택이 타인의 권리를 침해하거나 사회 전체에 상당한 비용을 초래하는 경우에는 일정한 제한이 정당화될 수 있다. Which conclusion best matches the passage?",a:"Individual choice can be limited when it seriously harms others or society.",o:["Individual choice can be limited when it seriously harms others or society.","Individual choice should never be restricted.","Social costs should never affect policy.","Rights of others are less important than personal preference."]},
    {band:6,skill:"listening",audio:"단기적인 성과에만 치중할 경우 장기적인 경쟁력을 훼손할 우려가 있다는 지적이 제기되고 있습니다.",q:"Listen. What concern is being raised?",a:"Focusing only on short-term results may harm long-term competitiveness.",o:["Focusing only on short-term results may harm long-term competitiveness.","Long-term competition has already disappeared.","Short-term results are impossible to measure.","Competition should be eliminated entirely."]}
  ];

  const weeklyThemes={
    1:["Hangul speed + core particles","Present/past/future basics","Daily vocabulary & counters","Requests, negation, location","Simple listening & shadowing","Short reading and review","Mini test + weak points","Consolidation and retest"],
    2:["A1 foundations audit","Ability, obligation, permission","Time, purpose, intention","Reported speech basics","Relative clauses & nominalization","Everyday listening + texting","TOPIK 2 reading patterns","Consolidation and retest"],
    3:["TOPIK 2 repair week","Intermediate connectors","Cause / contrast / conditions","Retrospective forms","Honorifics and speech levels","Paragraph reading","Listening for reason & sequence","TOPIK 3 mock + review"],
    4:["Intermediate grammar audit","Nuance: -는 편, -게 되다, -느라고","Contrast & concession","Inference and conjecture","Formal vocabulary expansion","Reading longer passages","Listening for stance","TOPIK 4 mock + review"],
    5:["TOPIK 4 repair week","Advanced connectors","Written/formal grammar","Abstract vocabulary","Argument structure in reading","News-style listening","Error log + production","TOPIK 5 mock + review"],
    6:["Advanced grammar audit","Academic & formal vocabulary","Subtle concession/inference","Dense reading speed","News/lecture listening","Paraphrase & summary","TOPIK 6-style mixed practice","Full review + retest"]
  };

  function scoreTest(){
    const byBand={}, bySkill={}; let correct=0;
    questions.forEach((q,i)=>{
      const ok=testAnswers[i]===q.a; if(ok)correct++;
      byBand[q.band] ||= {correct:0,total:0}; byBand[q.band].total++; if(ok)byBand[q.band].correct++;
      bySkill[q.skill] ||= {correct:0,total:0}; bySkill[q.skill].total++; if(ok)bySkill[q.skill].correct++;
    });
    let level=0;
    for(let b=1;b<=6;b++){
      const cur=byBand[b], pct=cur.correct/cur.total;
      const lower=[]; for(let x=1;x<b;x++) lower.push(byBand[x].correct/byBand[x].total);
      const lowerAvg=lower.length?lower.reduce((a,v)=>a+v,0)/lower.length:1;
      if(pct>=.6 && lowerAvg>=.6) level=b;
    }
    const totalPct=Math.round(correct/questions.length*100);
    if(level===0 && byBand[1].correct>=2) level=1;
    const skillPct=Object.fromEntries(Object.entries(bySkill).map(([k,v])=>[k,Math.round(v.correct/v.total*100)]));
    const weakest=Object.entries(skillPct).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);
    return {level,correct,total:questions.length,totalPct,byBand,skillPct,weakest,date:new Date().toISOString()};
  }

  function makePlan(res){
    const current=Math.max(1,res.level||1), target=Math.min(6,current<6?current+1:6);
    const minutes=Number(profile.minutes||45);
    const weak=res.weakest.slice(0,2);
    const daily = minutes<=30
      ? {vocab:10,grammar:1,listening:5,reading:5,review:5}
      : minutes<=45
      ? {vocab:15,grammar:2,listening:8,reading:8,review:7}
      : {vocab:20,grammar:3,listening:12,reading:12,review:10};
    weak.forEach(s=>{ if(s==="vocabulary")daily.vocab+=5; if(s==="grammar"||s==="particles")daily.grammar+=1; if(s==="listening")daily.listening+=5; if(s==="reading")daily.reading+=5; });
    return {created:new Date().toISOString(),current,target,minutes,weak,daily,weeks:weeklyThemes[target]||weeklyThemes[6]};
  }

  const style=document.createElement("style");
  style.textContent=`
    .plan-shell{display:grid;gap:16px}.plan-card,.placement-card,.profile-card{border:1px solid rgba(255,255,255,.9);background:linear-gradient(145deg,rgba(255,255,255,.8),rgba(247,233,238,.66));border-radius:22px;padding:22px;box-shadow:var(--small-shadow)}
    .placement-start{display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center}.placement-start h3,.plan-card h3,.profile-card h3{margin:0 0 8px;color:#654b55}.placement-start p,.plan-card p,.profile-card p{color:var(--muted);line-height:1.55;margin:6px 0}.primary-plan-btn,.plan-small-btn{border:1px solid rgba(255,255,255,.7);background:linear-gradient(145deg,#efd0db,#dca7bb);color:#654451;border-radius:14px;min-height:44px;padding:0 17px;font-weight:700;box-shadow:0 8px 20px rgba(183,129,151,.14)}
    .plan-small-btn{background:rgba(255,255,255,.65);border-color:rgba(205,153,173,.28);font-weight:600;min-height:38px}.placement-meta{display:flex;justify-content:space-between;gap:12px;color:var(--muted);font-size:14px;margin-bottom:12px}.placement-q{font-size:23px;color:#604650;line-height:1.45;margin:10px 0 16px}.placement-options{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.placement-option{min-height:50px;text-align:left;border:1px solid rgba(205,153,173,.28);background:rgba(255,255,255,.62);color:#6f535e;border-radius:14px;padding:10px 13px}.placement-option:hover{background:#fffafd;border-color:#dca7bb}.listen-placement{margin:0 0 12px}.result-level{font-family:"Iowan Old Style",Georgia,serif;font-size:42px;color:#b98298}.skill-bars{display:grid;gap:9px;margin-top:16px}.skill-row{display:grid;grid-template-columns:110px 1fr 46px;gap:10px;align-items:center;font-size:14px}.skill-track{height:8px;background:rgba(224,188,200,.28);border-radius:99px;overflow:hidden}.skill-fill{height:100%;background:linear-gradient(90deg,#e4cfd6,#dca7bb)}
    .weekly-plan{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.week-card{border:1px solid rgba(205,153,173,.2);background:rgba(255,255,255,.53);border-radius:16px;padding:15px}.week-card b{color:#745562}.week-card p{font-size:14px;margin:5px 0 0}.daily-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;margin-top:12px}.daily-box{background:rgba(255,255,255,.56);border:1px solid rgba(205,153,173,.2);border-radius:14px;padding:12px;text-align:center}.daily-box strong{display:block;font-size:20px;color:#a67186}.daily-box span{font-size:12px;color:var(--muted)}
    .today-checks{display:grid;gap:8px}.today-check{display:flex;align-items:center;gap:10px;border:1px solid rgba(205,153,173,.2);background:rgba(255,255,255,.5);border-radius:13px;padding:10px 12px}.today-check input{width:18px;height:18px}.profile-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center}.profile-row input,.profile-row select{min-height:42px;border:1px solid rgba(205,153,173,.28);border-radius:12px;background:rgba(255,255,255,.7);color:var(--text);padding:0 12px}.backup-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.local-data-note{font-size:13px;color:var(--muted);margin-top:10px;padding:10px 12px;border-radius:12px;background:rgba(239,208,219,.24)}
    @media(max-width:760px){.placement-start,.profile-row{grid-template-columns:1fr}.placement-options,.weekly-plan{grid-template-columns:1fr}.daily-grid{grid-template-columns:repeat(2,1fr)}.skill-row{grid-template-columns:90px 1fr 40px}}
  `;document.head.appendChild(style);

  function ensureTab(){
    const nav=document.querySelector(".tabs"); if(!nav)return;
    if(!nav.querySelector('[data-tab="planSection"]')){
      const b=document.createElement("button");b.className="tab";b.dataset.tab="planSection";b.textContent="My Plan";
      const progress=nav.querySelector('[data-tab="progressSection"]');nav.insertBefore(b,progress||null);
      b.onclick=()=>{ if(window.activateTab)activateTab("planSection"); else {document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));$("planSection")?.classList.add('active');document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active',t===b));} renderPlan(); };
    }
    if(!$("planSection")){const s=document.createElement("section");s.className="section";s.id="planSection";document.querySelector("main.app")?.appendChild(s)}
  }

  function startTest(){testIndex=0;testAnswers=[];testStarted=true;renderPlan();}
  function renderQuestion(){
    const q=questions[testIndex];
    return `<div class="placement-card"><div class="placement-meta"><span>Question ${testIndex+1} / ${questions.length}</span><span>Band ${q.band} · ${esc(q.skill)}</span></div>${q.audio?`<button class="plan-small-btn listen-placement" id="placementListen">🔊 Play audio</button>`:""}<div class="placement-q">${esc(q.q)}</div><div class="placement-options">${q.o.map(o=>`<button class="placement-option" data-place-answer="${esc(o)}">${esc(o)}</button>`).join("")}</div></div>`;
  }

  function profilePanel(){
    return `<div class="profile-card"><h3>Profile & data</h3><p>Your progress is stored in this browser and survives normal tab/browser closing. Another person opening the same site on their own device/browser gets separate data.</p><div class="profile-row"><input id="profileName" value="${esc(profile.name||"My profile")}" placeholder="Profile name"><select id="studyMinutes"><option value="30" ${profile.minutes==30?"selected":""}>30 min/day</option><option value="45" ${profile.minutes==45?"selected":""}>45 min/day</option><option value="60" ${profile.minutes==60?"selected":""}>60 min/day</option></select></div><div class="backup-actions"><button class="plan-small-btn" id="saveProfile">Save profile</button><button class="plan-small-btn" id="exportProgress">Export backup</button><label class="plan-small-btn" style="display:inline-flex;align-items:center;cursor:pointer">Import backup<input id="importProgress" type="file" accept="application/json" style="display:none"></label></div><div class="local-data-note">Local storage can still be lost if browser/site data is cleared, private browsing is used, or you switch devices. Cloud accounts will solve that by syncing progress to a backend.</div></div>`;
  }

  function resultPanel(){
    if(!result)return "";
    const label=result.level?`Estimated TOPIK ${result.level}`:"Starter / pre-TOPIK 1";
    const bars=Object.entries(result.skillPct).map(([k,v])=>`<div class="skill-row"><span>${esc(k)}</span><div class="skill-track"><div class="skill-fill" style="width:${v}%"></div></div><b>${v}%</b></div>`).join("");
    return `<div class="plan-card"><h3>Placement result</h3><div class="result-level">${label}</div><p>${result.correct}/${result.total} correct · ${result.totalPct}% overall. This is a study estimate, not an official TOPIK score.</p><div class="skill-bars">${bars}</div><div class="backup-actions"><button class="plan-small-btn" id="retakeTest">Retake test</button><button class="primary-plan-btn" id="rebuildPlan">Build / refresh my plan</button></div></div>`;
  }

  function planPanel(){
    if(!plan)return `<div class="plan-card"><h3>Your study program</h3><p>Finish the placement test first. Your plan will be generated from your estimated level and weakest skills.</p></div>`;
    const today=new Date().toLocaleDateString("en-CA");
    const daily=[[`Vocabulary`,`${plan.daily.vocab} new/review words`],[`Grammar`,`${plan.daily.grammar} points`],[`Listening`,`${plan.daily.listening} min`],[`Reading`,`${plan.daily.reading} min`],[`SRS review`,`${plan.daily.review} min`]];
    const dayChecks=checks[today]||{};
    const checkRows=daily.map(([n,d],i)=>`<label class="today-check"><input type="checkbox" data-plan-check="${i}" ${dayChecks[i]?"checked":""}><span><b>${n}</b> · ${d}</span></label>`).join("");
    return `<div class="plan-card"><h3>8-week program · TOPIK ${plan.current} → ${plan.target}</h3><p>Daily target: about ${plan.minutes} minutes. Priority weaknesses: <b>${plan.weak.map(esc).join(" + ")}</b>.</p><div class="daily-grid">${daily.map(([n,d])=>`<div class="daily-box"><strong>${esc(d.split(" ")[0])}</strong><span>${esc(n)}</span></div>`).join("")}</div><h3 style="margin-top:20px">Today</h3><div class="today-checks">${checkRows}</div></div><div class="plan-card"><h3>Weekly roadmap</h3><div class="weekly-plan">${plan.weeks.map((w,i)=>`<div class="week-card"><b>Week ${i+1}</b><p>${esc(w)}</p></div>`).join("")}</div></div>`;
  }

  function renderPlan(){
    const sec=$("planSection");if(!sec)return;
    if(testStarted){sec.innerHTML=`<div class="section-head"><h2>Level Test</h2><p>30 questions across TOPIK 1–6. Answer without a dictionary for a useful estimate.</p></div><div class="plan-shell">${renderQuestion()}</div>`;bindTest();return;}
    sec.innerHTML=`<div class="section-head"><h2>My Plan</h2><p>Placement test, personalized study roadmap, daily checklist and local data backup.</p></div><div class="plan-shell">${!result?`<div class="placement-card placement-start"><div><h3>Find your Korean level</h3><p>The test checks vocabulary, grammar, particles/forms, reading and listening from TOPIK 1 through 6. Your result becomes the starting point for an 8-week study program.</p></div><button class="primary-plan-btn" id="startPlacement">Start 30-question test</button></div>`:""}${resultPanel()}${planPanel()}${profilePanel()}</div>`;
    bindMain();
  }

  function bindTest(){
    const q=questions[testIndex];
    $("placementListen") && ($("placementListen").onclick=()=>window.speakKorean?window.speakKorean(q.audio):speech(q.audio));
    document.querySelectorAll("[data-place-answer]").forEach(b=>b.onclick=()=>{
      testAnswers[testIndex]=b.dataset.placeAnswer;testIndex++;
      if(testIndex>=questions.length){result=scoreTest();LS2.set(RESULT_KEY,result);plan=makePlan(result);LS2.set(PLAN_KEY,plan);testStarted=false;renderPlan();}
      else renderPlan();
    });
  }
  function speech(t){if(!("speechSynthesis" in window))return;const u=new SpeechSynthesisUtterance(t);u.lang="ko-KR";u.rate=.86;speechSynthesis.cancel();speechSynthesis.speak(u)}

  function exportData(){
    const data={version:1,exportedAt:new Date().toISOString(),storage:{}};
    for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);data.storage[k]=localStorage.getItem(k)}
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`korean-study-backup-${new Date().toISOString().slice(0,10)}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  }
  function importData(file){
    const r=new FileReader();r.onload=()=>{try{const data=JSON.parse(r.result);if(!data?.storage)throw new Error("Invalid backup");Object.entries(data.storage).forEach(([k,v])=>localStorage.setItem(k,v));alert("Backup imported. The page will reload.");location.reload();}catch(e){alert("Could not import this backup file.")}};r.readAsText(file);
  }
  function bindMain(){
    $("startPlacement") && ($("startPlacement").onclick=startTest);
    $("retakeTest") && ($("retakeTest").onclick=startTest);
    $("rebuildPlan") && ($("rebuildPlan").onclick=()=>{plan=makePlan(result);LS2.set(PLAN_KEY,plan);renderPlan()});
    $("saveProfile") && ($("saveProfile").onclick=()=>{profile={name:$("profileName").value.trim()||"My profile",minutes:Number($("studyMinutes").value)};LS2.set(PROFILE_KEY,profile);if(result){plan=makePlan(result);LS2.set(PLAN_KEY,plan)}renderPlan()});
    $("exportProgress") && ($("exportProgress").onclick=exportData);
    $("importProgress") && ($("importProgress").onchange=e=>e.target.files?.[0]&&importData(e.target.files[0]));
    document.querySelectorAll("[data-plan-check]").forEach(x=>x.onchange=()=>{const today=new Date().toLocaleDateString("en-CA");checks[today] ||= {};checks[today][x.dataset.planCheck]=x.checked;LS2.set(CHECK_KEY,checks)});
  }

  function init(){ensureTab();renderPlan()}
  setTimeout(init,700);
})();