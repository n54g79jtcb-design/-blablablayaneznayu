const vocab = window.VOCAB || [];

const grammar = [
  {form:"-기 전에", use:"before doing something", example:"집에서 나가기 전에 화장해요.", translation:"I do my makeup before leaving home."},
  {form:"-(으)ㄴ 후에", use:"after doing something", example:"운동한 후에 샤워해요.", translation:"I shower after exercising."},
  {form:"-다가", use:"while doing / interruption", example:"공부하다가 전화를 받았어요.", translation:"I was studying when I got a call."},
  {form:"-(으)려고 하다", use:"intend / plan to", example:"책을 사려고 했어요.", translation:"I was going to buy a book."},
  {form:"-기로 하다", use:"decide to", example:"내일 만나기로 했어요.", translation:"We decided to meet tomorrow."},
  {form:"-아/어야 되다", use:"have to / must", example:"과제를 제출해야 돼요.", translation:"I have to submit the assignment."}
];

const tenseVerbs = [
  { base:"먹다", en:"to eat", present:"먹어요", past:"먹었어요", future:"먹을 거예요" },
  { base:"가다", en:"to go", present:"가요", past:"갔어요", future:"갈 거예요" },
  { base:"하다", en:"to do", present:"해요", past:"했어요", future:"할 거예요" },
  { base:"보다", en:"to see / watch", present:"봐요", past:"봤어요", future:"볼 거예요" },
  { base:"오다", en:"to come", present:"와요", past:"왔어요", future:"올 거예요" },
  { base:"마시다", en:"to drink", present:"마셔요", past:"마셨어요", future:"마실 거예요" },
  { base:"읽다", en:"to read", present:"읽어요", past:"읽었어요", future:"읽을 거예요" },
  { base:"쓰다", en:"to write / use", present:"써요", past:"썼어요", future:"쓸 거예요" },
  { base:"자다", en:"to sleep", present:"자요", past:"잤어요", future:"잘 거예요" },
  { base:"만나다", en:"to meet", present:"만나요", past:"만났어요", future:"만날 거예요" },
  { base:"공부하다", en:"to study", present:"공부해요", past:"공부했어요", future:"공부할 거예요" },
  { base:"기다리다", en:"to wait", present:"기다려요", past:"기다렸어요", future:"기다릴 거예요" },
  { base:"배우다", en:"to learn", present:"배워요", past:"배웠어요", future:"배울 거예요" },
  { base:"만들다", en:"to make", present:"만들어요", past:"만들었어요", future:"만들 거예요" },
  { base:"살다", en:"to live", present:"살아요", past:"살았어요", future:"살 거예요" },
  { base:"듣다", en:"to listen", present:"들어요", past:"들었어요", future:"들을 거예요" },
  { base:"모르다", en:"to not know", present:"몰라요", past:"몰랐어요", future:"모를 거예요" },
  { base:"좋아하다", en:"to like", present:"좋아해요", past:"좋아했어요", future:"좋아할 거예요" }
];

const grammarQuestionBank = [
  {prompt:"Choose the grammar for: ‘before doing something’", correct:"-기 전에", options:["-기 전에","-(으)ㄴ 후에","-다가","-기로 하다"], detail:"Meaning"},
  {prompt:"Choose the grammar for: ‘after doing something’", correct:"-(으)ㄴ 후에", options:["-(으)려고 하다","-(으)ㄴ 후에","-아/어야 되다","-다가"], detail:"Meaning"},
  {prompt:"Choose the grammar used when one action is interrupted by another.", correct:"-다가", options:["-기로 하다","-다가","-기 전에","-(으)ㄴ 후에"], detail:"Usage"},
  {prompt:"Choose the grammar for an intention or plan.", correct:"-(으)려고 하다", options:["-아/어야 되다","-(으)려고 하다","-기로 하다","-다가"], detail:"Usage"},
  {prompt:"Choose the grammar for a decision: decide to do.", correct:"-기로 하다", options:["-기로 하다","-기 전에","-(으)려고 하다","-아/어야 되다"], detail:"Usage"},
  {prompt:"Choose the grammar meaning have to / must.", correct:"-아/어야 되다", options:["-(으)ㄴ 후에","-다가","-아/어야 되다","-기로 하다"], detail:"Meaning"},
  {prompt:"집에서 나가기 ___ 화장해요. (I do my makeup before leaving home.)", correct:"전에", options:["전에","후에","다가","기로"], detail:"Sentence completion"},
  {prompt:"운동한 ___ 샤워해요. (I shower after exercising.)", correct:"후에", options:["후에","전에","다가","려고"], detail:"Sentence completion"},
  {prompt:"공부하___ 전화를 받았어요. (I was studying when I got a call.)", correct:"다가", options:["다가","기 전에","기로","야 돼서"], detail:"Sentence completion"},
  {prompt:"내일 만나___ 했어요. (We decided to meet tomorrow.)", correct:"기로", options:["기로","다가","기 전에","후에"], detail:"Sentence completion"},
  {prompt:"책을 사___ 했는데 돈이 부족했어요. (I was going to buy a book, but...) ", correct:"려고", options:["려고","기로","다가","후에"], detail:"Sentence completion"},
  {prompt:"과제를 제출___ 돼요. (I have to submit the assignment.)", correct:"해야", options:["해야","하려고","하다가","한 후에"], detail:"Sentence completion"}
];

const sentenceQuestionBank = [
  {prompt:"I shower after exercising.", correct:"운동한 후에 샤워해요.", options:["운동한 후에 샤워해요.","운동하기 전에 샤워해요.","운동하다가 샤워했어요.","운동하기로 샤워해요."]},
  {prompt:"I do my makeup before leaving home.", correct:"집에서 나가기 전에 화장해요.", options:["집에서 나간 후에 화장해요.","집에서 나가기 전에 화장해요.","집에서 나가다가 화장해요.","집에서 나가기로 화장해요."]},
  {prompt:"I was studying when I got a call.", correct:"공부하다가 전화를 받았어요.", options:["공부하기 전에 전화를 받았어요.","공부한 후에 전화를 받았어요.","공부하다가 전화를 받았어요.","공부하기로 전화를 받았어요."]},
  {prompt:"We decided to meet tomorrow.", correct:"내일 만나기로 했어요.", options:["내일 만나려고 했어요.","내일 만나기로 했어요.","내일 만나다가 했어요.","내일 만난 후에 했어요."]},
  {prompt:"I have to submit the assignment.", correct:"과제를 제출해야 돼요.", options:["과제를 제출하려고 해요.","과제를 제출해야 돼요.","과제를 제출하다가 해요.","과제를 제출한 후에 돼요."]},
  {prompt:"I am going to study tomorrow.", correct:"내일 공부할 거예요.", options:["내일 공부했어요.","내일 공부해요.","내일 공부할 거예요.","내일 공부하다가요."]},
  {prompt:"I drank coffee yesterday.", correct:"어제 커피를 마셨어요.", options:["어제 커피를 마실 거예요.","어제 커피를 마셨어요.","어제 커피를 마셔요.","어제 커피를 마시기로 해요."]},
  {prompt:"I like Korean food.", correct:"한국 음식을 좋아해요.", options:["한국 음식을 좋아했어요.","한국 음식을 좋아해요.","한국 음식을 좋아할 거예요.","한국 음식을 좋아하다가요."]},
  {prompt:"I will meet my friend tomorrow.", correct:"내일 친구를 만날 거예요.", options:["내일 친구를 만났어요.","내일 친구를 만나요.","내일 친구를 만날 거예요.","내일 친구를 만나기로 했어요."]},
  {prompt:"I read a book yesterday.", correct:"어제 책을 읽었어요.", options:["어제 책을 읽어요.","어제 책을 읽었어요.","어제 책을 읽을 거예요.","어제 책을 읽다가요."]}
];

const $ = id => document.getElementById(id);
const LS = {
  get(key, fallback) { try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; } catch { return fallback; } },
  set(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
};
const wordKey = item => `${item.level}|${item.ko}|${item.en}`;
const todayKey = () => new Date().toLocaleDateString("en-CA");
const normalize = s => (s || "").trim().replace(/\s+/g," ").toLowerCase();
const shuffle = arr => { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; };
const sample = (arr,n) => shuffle(arr).slice(0,Math.min(n,arr.length));

let wordState = LS.get("wordStateV2", {});
let mistakes = LS.get("mistakesV2", {});
let stats = LS.get("statsV2", {correct:0,wrong:0,tests:0});
let activityDays = LS.get("activityDaysV2", []);
let practicedByDay = LS.get("practicedByDayV2", {});
let practiced = Number(practicedByDay[todayKey()] || 0);
let level = "All", topic = "All topics", query = "", viewFilter = "All";

function getState(item){
  const k=wordKey(item);
  if(!wordState[k]) wordState[k]={status:"new",favorite:false,correct:0,wrong:0,seen:0};
  return wordState[k];
}
function saveWordState(){LS.set("wordStateV2",wordState)}
function saveMistakes(){LS.set("mistakesV2",mistakes)}
function saveStats(){LS.set("statsV2",stats)}
function registerActivity(){
  const d=todayKey();
  if(!activityDays.includes(d)){activityDays.push(d);activityDays.sort();LS.set("activityDaysV2",activityDays)}
}
function bumpPractice(n=1){
  practiced+=n; practicedByDay[todayKey()]=practiced; LS.set("practicedByDayV2",practicedByDay); registerActivity(); updateProgress();
}
function streakCount(){
  const set=new Set(activityDays); let d=new Date(); let count=0;
  if(!set.has(d.toLocaleDateString("en-CA"))){d.setDate(d.getDate()-1)}
  while(set.has(d.toLocaleDateString("en-CA"))){count++;d.setDate(d.getDate()-1)}
  return count;
}
function updateProgress(){
  if($("score")) $("score").textContent=practiced;
  if($("progress")) $("progress").style.width=Math.min(100,practiced*4)+"%";
}
function recordMistake(id, data){
  const m=mistakes[id] || {...data,count:0,last:""}; m.count++; m.last=todayKey(); mistakes[id]=m; saveMistakes();
}
function clearMistake(id){ if(mistakes[id]){delete mistakes[id];saveMistakes();} }
function updateWordResult(item,correct){
  if(!item) return;
  const s=getState(item); if(correct){s.correct++; if(s.correct>=3 && s.correct>=s.wrong+1)s.status="learned"; else if(s.status==="new")s.status="learning";} else {s.wrong++;s.status="learning";} saveWordState();
}

const style=document.createElement("style");
style.textContent=`
.tabs{grid-template-columns:repeat(5,1fr)}
.test-switch,.test-settings,.view-filters,.status-row{display:flex;flex-wrap:wrap;gap:9px;margin-bottom:16px}
.test-switch button,.test-settings button,.view-filters button,.status-btn,.tiny-btn{min-height:40px;border:1px solid var(--border);border-radius:999px;background:transparent;padding:0 14px}
.test-switch button.active,.test-settings button.active,.view-filters button.active,.status-btn.active{background:var(--soft);border-color:#2a3b65}
.test-meta{display:flex;justify-content:space-between;gap:12px;color:var(--muted);margin-bottom:8px;font-size:14px}
.test-result,.progress-card,.mistake-card,.daily-card{padding:20px;border:1px solid var(--border);border-radius:18px;background:#0d0d0d}
.test-result strong{font-size:32px;display:block;margin-bottom:8px}.answer.correct{border-color:var(--good);background:rgba(118,223,160,.08)}.answer.wrong{border-color:var(--bad);background:rgba(255,146,146,.08)}.answer:disabled{cursor:default;opacity:1}
.word-card{padding-bottom:62px}.card-actions{position:absolute;left:16px;right:16px;bottom:14px;display:flex;align-items:center;justify-content:space-between;gap:8px}.favorite-btn{width:38px;height:34px;border:1px solid var(--border);border-radius:10px;background:transparent;font-size:19px}.favorite-btn.on{color:#ffd86a}.status-chip{font-size:12px;border:1px solid var(--border);border-radius:999px;padding:7px 10px;color:var(--muted);background:#080808}.status-chip.learning{color:#ffd86a}.status-chip.learned{color:var(--good)}
.type-wrap{display:flex;gap:10px;margin-top:14px}.type-input{flex:1;min-height:52px;border:1px solid var(--border);border-radius:14px;background:#090909;color:var(--text);padding:0 14px}.submit-answer{min-height:52px;border:0;border-radius:14px;background:var(--accent);color:#0b1020;padding:0 18px;font-weight:750}
.progress-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}.progress-card .big{font-size:30px;font-weight:800;margin-top:8px}.level-progress{display:grid;gap:12px;margin:18px 0}.level-line{display:grid;grid-template-columns:48px 1fr 72px;gap:10px;align-items:center}.level-track{height:10px;background:#2d2d2d;border-radius:999px;overflow:hidden}.level-fill{height:100%;background:var(--accent)}
.progress-columns{display:grid;grid-template-columns:1fr 1fr;gap:16px}.mistake-list,.hard-list,.favorite-list{display:grid;gap:10px}.mistake-card b{display:block;margin-bottom:5px}.mistake-card .muted{font-size:13px}.small-actions{display:flex;gap:8px;margin-top:12px;flex-wrap:wrap}.daily-card{margin-bottom:16px}.daily-card h3{margin:0 0 8px}.daily-card p{color:var(--muted);margin:0 0 14px}.danger{border-color:#653737!important;color:#ffaaaa}.empty{color:var(--muted);padding:16px 0}
@media(max-width:900px){.progress-grid{grid-template-columns:repeat(2,1fr)}.progress-columns{grid-template-columns:1fr}}@media(max-width:760px){.tabs{grid-template-columns:repeat(2,1fr)}.test-meta{font-size:13px}.type-wrap{flex-direction:column}.progress-grid{grid-template-columns:1fr 1fr}.level-line{grid-template-columns:40px 1fr 64px}}
`;
document.head.appendChild(style);

// Add Progress tab and section.
const nav=document.querySelector(".tabs");
if(nav && !nav.querySelector('[data-tab="progressSection"]')){
  const b=document.createElement("button"); b.className="tab"; b.dataset.tab="progressSection"; b.textContent="Progress"; nav.appendChild(b);
}
if(!$("progressSection")){
  const sec=document.createElement("section");sec.className="section";sec.id="progressSection";document.querySelector("main.app").appendChild(sec);
}

function mk(container,label,active,fn,className="filter"){
  const b=document.createElement("button");b.className=className+(active?" active":"");b.textContent=label;b.onclick=fn;container.appendChild(b);return b;
}

function renderLevels(){
  const c=$("levelFilters");c.innerHTML="";["All","A1","A2","B1","B2"].forEach(x=>mk(c,x,x===level,()=>{level=x;renderLevels();renderTopics();renderWords()}));
}
function topics(){const src=level==="All"?vocab:vocab.filter(x=>x.level===level);return ["All topics",...new Set(src.map(x=>x.topic))].sort();}
function renderTopics(){
  const list=topics();if(!list.includes(topic))topic="All topics";const c=$("topicFilters");c.innerHTML="";list.forEach(x=>mk(c,x,x===topic,()=>{topic=x;renderTopics();renderWords()},"topic"));
}
function ensureViewFilters(){
  if($("viewFilters"))return;const c=document.createElement("div");c.id="viewFilters";c.className="view-filters";$("topicFilters").after(c);
}
function renderViewFilters(){
  ensureViewFilters();const c=$("viewFilters");c.innerHTML="";["All","Favorites","New","Learning","Learned","Mistakes"].forEach(x=>mk(c,x,x===viewFilter,()=>{viewFilter=x;renderViewFilters();renderWords()},"filter"));
}
function itemMatchesView(item){
  const s=getState(item);if(viewFilter==="All")return true;if(viewFilter==="Favorites")return s.favorite;if(viewFilter==="New")return s.status==="new";if(viewFilter==="Learning")return s.status==="learning";if(viewFilter==="Learned")return s.status==="learned";if(viewFilter==="Mistakes")return s.wrong>0;return true;
}
function cycleStatus(item){const s=getState(item);s.status=s.status==="new"?"learning":s.status==="learning"?"learned":"new";saveWordState();renderWords();renderProgress();}
function renderWords(){
  const q=query.trim().toLowerCase();const items=vocab.filter(x=>(level==="All"||x.level===level)&&(topic==="All topics"||x.topic===topic)&&itemMatchesView(x)&&(!q||x.ko.toLowerCase().includes(q)||x.en.toLowerCase().includes(q)));
  $("wordCount").textContent=items.length+" words";const list=$("wordList");list.innerHTML="";
  items.forEach(i=>{const s=getState(i);const card=document.createElement("button");card.className="word-card";card.innerHTML=`<span class="badge">${i.level}</span><span class="word-ko">${i.ko}</span><span class="word-en">Tap to reveal</span><span class="card-actions"><span class="favorite-btn ${s.favorite?"on":""}" data-fav>${s.favorite?"★":"☆"}</span><span class="status-chip ${s.status}" data-status>${s.status[0].toUpperCase()+s.status.slice(1)}</span></span>`;let revealed=false;
    card.onclick=e=>{if(e.target.closest("[data-fav]")){e.preventDefault();e.stopPropagation();s.favorite=!s.favorite;saveWordState();renderWords();renderProgress();return}if(e.target.closest("[data-status]")){e.preventDefault();e.stopPropagation();cycleStatus(i);return}revealed=!revealed;card.querySelector(".word-en").textContent=revealed?i.en:"Tap to reveal";if(revealed){s.seen++;if(s.status==="new")s.status="learning";saveWordState();bumpPractice();renderProgress();}};list.appendChild(card);
  });
}
$("search").oninput=e=>{query=e.target.value;renderWords()};

grammar.forEach(g=>{const d=document.createElement("details");d.className="grammar-card";d.innerHTML=`<summary>${g.form} <span class="grammar-use">— ${g.use}</span></summary><div class="example">${g.example}</div><div class="translation">${g.translation}</div>`;$("grammarList").appendChild(d)});

function activateTab(id){document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.tab===id));document.querySelectorAll(".section").forEach(x=>x.classList.toggle("active",x.id===id));if(id==="progressSection")renderProgress();}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>activateTab(b.dataset.tab));
