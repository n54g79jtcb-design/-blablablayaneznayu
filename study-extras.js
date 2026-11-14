(() => {
"use strict";
const CONF = "koreanWelcomeV1", SESSION = "koreanCloudSessionV1", PLUS = "advancedLearningV1", SRS = "srsV1";
const API = "https://edlysmrqqnxvvdnizrpz.supabase.co";
const PUBLIC_KEY = "sb_publishable_uD-cWg7KAxCTXVIZ5OB8wA_OFAC-O_S";
const $ = id => document.getElementById(id);
const get = (k, fallback) => { try { const v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } };
const set = (k, value) => localStorage.setItem(k, JSON.stringify(value));
const esc = x => String(x ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const today = d => (d || new Date()).toLocaleDateString("en-CA");
const dateDaysAgo = n => { const d = new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate()-n); return today(d); };
const dateAfter = n => { const d = new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate()+n); return today(d); };
const allWords = () => typeof vocab !== "undefined" && Array.isArray(vocab) ? vocab : (window.VOCAB || []);
const keyFor = w => [w.level,w.ko,w.en].join("|");
const shuffle = arr => { const a=[...arr]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a; };
const normalize = x => String(x||"").toLowerCase().replace(/[^\p{L}\p{N}]/gu,"");
let section = "speaking", reviewQueue = [], reviewAt = 0, revealed = false, speakingChoice = 0, speakingTurn = 0, recognition = null, lastTranscript = "";

const scenarios = [
 {name:"At a café",emoji:"☕",turns:[
  {prompt:"무엇을 주문하시겠어요?",translation:"What would you like to order?",example:"아이스 아메리카노 한 잔 주세요.",tip:"Order a drink using 한 잔 주세요."},
  {prompt:"매장에서 드시겠어요, 포장하시겠어요?",translation:"For here or to go?",example:"포장해 주세요.",tip:"Say you would like it to go."}]},
 {name:"University",emoji:"🎓",turns:[
  {prompt:"오늘 수업이 몇 시에 시작해요?",translation:"What time does class start today?",example:"오늘 수업은 아홉 시에 시작해요.",tip:"Answer using time + 에 시작해요."},
  {prompt:"과제는 언제까지 제출해야 해요?",translation:"When do we have to submit the assignment?",example:"금요일까지 제출해야 해요.",tip:"Use 까지 and -아/어야 해요."}]},
 {name:"Shopping",emoji:"🛍️",turns:[
  {prompt:"어떤 사이즈 찾으세요?",translation:"Which size are you looking for?",example:"스몰 사이즈 있어요?",tip:"Ask if a small size is available."},
  {prompt:"입어 보시겠어요?",translation:"Would you like to try it on?",example:"네, 입어 봐도 돼요?",tip:"Ask for permission using -아/어도 돼요."}]},
 {name:"Delivery",emoji:"📦",turns:[
  {prompt:"택배를 어디에 놓아 드릴까요?",translation:"Where should I leave your delivery?",example:"이 층 문 앞에 놓아 주세요.",tip:"Request delivery to the second-floor door."},
  {prompt:"문 비밀번호가 어떻게 되나요?",translation:"What's the door entry code?",example:"문자로 보내 드릴게요.",tip:"Say you will send it by text. Don't share your real code here."}]},
 {name:"Meeting friends",emoji:"💬",turns:[
  {prompt:"주말에 시간 있어?",translation:"Are you free this weekend?",example:"응, 토요일 오후에 시간 있어.",tip:"Answer naturally in casual Korean."},
  {prompt:"우리 어디에서 만날까?",translation:"Where should we meet?",example:"강남역 앞에서 만나자.",tip:"Suggest a meeting place using -에서."}]},
 {name:"At a clinic",emoji:"🏥",turns:[
  {prompt:"어디가 불편하세요?",translation:"What's bothering you?",example:"머리가 아프고 어지러워요.",tip:"Describe symptoms politely."},
  {prompt:"언제부터 아프셨어요?",translation:"Since when have you felt unwell?",example:"어제부터 아팠어요.",tip:"Use -부터 to describe when symptoms started."}]}
];

function reward(amount,label) {
  if(window.KoreanAdvanced && typeof window.KoreanAdvanced.awardXP === "function") window.KoreanAdvanced.awardXP(amount,label);
}
function activate(id) {
  if(window.KoreanAdvanced && typeof window.KoreanAdvanced.activate === "function") window.KoreanAdvanced.activate(id);
  else if(typeof activateTab === "function") activateTab(id);
  else { document.querySelectorAll(".section").forEach(x=>x.classList.toggle("active",x.id===id));document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x.dataset.tab===id));}
}
function go(sub) {section=sub;activate("extraSection");renderExtras();}
function weeklyRoute(p) {
  const options={
    "Everyday Korean":[["Smart vocabulary","reviews"],["Real-life dialogue","speaking"],["Grammar practice","conjugation"],["Listening skills","dictation"],["Short conversation","speaking"],["Mistake review","mistakes"],["Weekly recap","analytics"]],
    "TOPIK exam":[["Core vocabulary","reviews"],["TOPIK grammar","topik"],["Listening practice","dictation"],["Reading & TOPIK","topik"],["Weak words","reviews"],["Mock test","topik"],["Weekly results","analytics"]],
    "University life":[["Campus vocabulary","reviews"],["University dialogue","speaking"],["Classroom grammar","conjugation"],["Listen and take notes","dictation"],["Campus conversation","speaking"],["Assignment language","journal"],["Weekly recap","analytics"]],
    "Travel and work":[["Practical vocabulary","reviews"],["Café conversation","speaking"],["Requests & polite forms","conjugation"],["Delivery listening","dictation"],["Shopping conversation","speaking"],["Real-life practice","reallife"],["Weekly recap","analytics"]],
    "Natural speaking":[["Everyday phrases","reviews"],["Conversation practice","speaking"],["Natural verb endings","conjugation"],["Listen & repeat","dictation"],["Situation role-play","speaking"],["Speak more naturally","speaking"],["Weekly speaking recap","analytics"]]
  };
  return options[p.goal]||options["Everyday Korean"];
}
function routeAction(action) {
  if(["reviews","speaking","analytics"].includes(action))return go(action);
  if(["topik","dictation","mistakes","journal","reallife","conjugation"].includes(action) && window.KoreanAdvanced?.openLearn)return window.KoreanAdvanced.openLearn(action);
  return go("reviews");
}
function routeHTML(p) {
  const arr=weeklyRoute(p),daysSince=Math.max(0,Math.floor((Date.now()-Date.parse(p.savedAt||new Date().toISOString()))/86400000)),index=daysSince%7;
  return '<div class="extra-route"><div class="extra-route-heading"><div><h3>✨ Your 7-day study path</h3><p>'+esc(p.level||"A1")+' · '+esc(p.goal||"Everyday Korean")+' · '+esc(p.minutes||30)+' minutes/day. Day '+(index+1)+' is recommended today.</p></div><button class="plus-btn" id="extraRouteStart" data-route="'+arr[index][1]+'">Start today’s lesson</button></div><div class="extra-route-days">'+arr.map((x,i)=>'<div class="extra-route-day'+(i===index?' today':'')+'"><small>DAY '+(i+1)+'</small><b>'+esc(x[0])+'</b><button class="plus-btn secondary" data-route="'+x[1]+'">Open</button></div>').join("")+'</div></div>';
}

function renderExtras() {
  const node=$("extraSection"); if(!node)return;
  const prefs=get(CONF,{goal:"Everyday Korean",minutes:30,level:"A1",name:"Learner"});
  const cards=[["speaking","🎙️","AI Speaking","Role-play Korean conversations with your microphone or keyboard."],["reviews","🧠","Smart Reviews","Revisit due vocabulary using spaced repetition."],["analytics","📊","Learning Analytics","See streaks, accuracy, weak areas and real study trends."],["challenges","🏆","Challenges","Opt-in weekly leaderboards and group goals with friends."]];
  node.innerHTML='<div class="section-head"><h2>Explore ✨</h2><p>More ways to become fluent — tailored to your goals.</p></div>'+
  '<div class="extra-intro"><div><b>'+esc(prefs.goal)+'</b> · '+esc(prefs.level)+' · '+esc(prefs.minutes)+' min/day <span class="muted">Your personal settings</span></div><button class="plus-btn secondary" id="extraEditProfile">Edit goal</button></div>'+
  (get(CONF,null)?routeHTML(prefs):'<div class="extra-note">Set up your study path to unlock a weekly learning route.</div>')+
  '<div class="extra-grid">'+cards.map(c=>'<button class="extra-tile'+(c[0]===section?' selected':'')+'" data-extra="'+c[0]+'"><span>'+c[1]+'</span><b>'+esc(c[2])+'</b><small>'+esc(c[3])+'</small></button>').join("")+'</div><div class="extra-panel" id="extraPanel"></div>';
  node.querySelectorAll("[data-extra]").forEach(b=>b.onclick=()=>go(b.dataset.extra));
  node.querySelectorAll("[data-route]").forEach(b=>b.onclick=()=>routeAction(b.dataset.route));
  $("extraEditProfile").onclick=()=>welcome();
  if(section==="speaking") renderSpeaking();
  if(section==="reviews") renderReviews();
  if(section==="analytics") renderAnalytics();
  if(section==="challenges") renderChallenges();
}

function existingStudy() {
  if(get("placementResultV1",null))return true;
  if(Object.keys(get("wordStateV2",{})).length>8)return true;
  if(get("activityDaysV2",[]).length)return true;
  if((get(PLUS,{xp:0}).xp||0)>30)return true;
  return false;
}
function welcome() {
  $("studyWelcomeOverlay")?.remove();
  const p=get(CONF,get("localProfileV1",{}));
  const el=document.createElement("div");el.id="studyWelcomeOverlay";el.className="extra-overlay";
  const options=(values,selected)=>values.map(x=>'<option value="'+esc(x)+'"'+(x===selected?' selected':'')+'>'+esc(x)+'</option>').join("");
  el.innerHTML='<div class="extra-welcome" role="dialog" aria-modal="true" aria-label="Personal study setup"><div class="extra-welcome-icon">🌸 한국어</div><h2>Welcome to your Korean era ♡</h2>'+
   '<p>Tell us what you want to learn. Your goals will shape your study shortcuts — you can change them any time.</p>'+
   '<label for="extraName">What should we call you?</label><input class="plus-input" id="extraName" maxlength="36" placeholder="Your study name" value="'+esc(p.name&&p.name!=="My profile"?p.name:"")+'">'+
   '<label for="extraGoal">My main goal</label><select class="plus-input" id="extraGoal">'+options(["Everyday Korean","TOPIK exam","University life","Travel and work","Natural speaking"],p.goal||"Everyday Korean")+'</select>'+
   '<label for="extraLevel">Current level</label><select class="plus-input" id="extraLevel">'+options(["New to Korean","A1","A2","B1","B2"],p.level||"A1")+'</select>'+
   '<label for="extraMinutes">Minutes per day</label><select class="plus-input" id="extraMinutes">'+[15,30,45,60].map(x=>'<option value="'+x+'"'+(Number(p.minutes||30)===x?' selected':'')+'>'+x+' minutes</option>').join("")+'</select>'+
   '<div class="extra-actions"><button class="plus-btn" id="extraSaveWelcome">Create my study path</button><button class="plus-btn secondary" id="extraCancelWelcome">Maybe later</button></div><p class="extra-note">Your current progress is preserved. Level is self-selected, not a placement-test result.</p></div>';
  document.body.appendChild(el);
  $("extraCancelWelcome").onclick=()=>el.remove();
  $("extraSaveWelcome").onclick=()=>{
    const x={name:$("extraName").value.trim().slice(0,36)||"Learner",goal:$("extraGoal").value,level:$("extraLevel").value,minutes:Number($("extraMinutes").value),savedAt:new Date().toISOString()};
    set(CONF,x);
    set("koreanPersonalPathV1",{createdAt:x.savedAt,goal:x.goal,level:x.level,minutes:x.minutes,days:weeklyRoute(x).map(([title,tool],i)=>({day:i+1,title,tool}))});
    const old=get("localProfileV1",{});set("localProfileV1",{...old,name:x.name,minutes:x.minutes,goal:x.goal,startingLevel:x.level});
    el.remove();renderExtras();const h=$("homeExtraCTA");if(h)updateHomeCTA(h);
  };
  $("extraName").focus();
}
function speak(text) {
  if(!("speechSynthesis" in window))return false;
  speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="ko-KR";u.rate=.85;speechSynthesis.speak(u);return true;
}
function renderSpeaking() {
  const p=$("extraPanel"),scenario=scenarios[speakingChoice],turn=scenario.turns[speakingTurn];
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  p.innerHTML='<div class="extra-box"><h3>🎙️ Speaking Practice</h3><p>Listen to a real-life question, answer in Korean, and get transcript-based feedback.</p>'+
  '<label class="extra-label" for="extraScenario">Choose a situation</label><select id="extraScenario" class="plus-input">'+scenarios.map((x,i)=>'<option value="'+i+'"'+(i===speakingChoice?' selected':'')+'>'+x.emoji+' '+esc(x.name)+'</option>').join("")+'</select>'+
  '<div class="extra-speech"><span class="muted">Turn '+(speakingTurn+1)+' of '+scenario.turns.length+'</span><h3 lang="ko">'+esc(turn.prompt)+'</h3><p>'+esc(turn.translation)+'</p><div class="extra-actions"><button class="plus-btn secondary" id="extraListen">▶ Hear Korean</button><button class="plus-btn secondary" id="extraExample">Show example</button></div></div>'+
  '<div id="extraExampleBox" class="extra-note" aria-live="polite">Hint: '+esc(turn.tip)+'</div>'+
  '<label class="extra-label" for="extraSpeechInput">Your answer in Korean</label><textarea id="extraSpeechInput" class="plus-textarea" lang="ko" placeholder="Speak or type your reply…">'+esc(lastTranscript)+'</textarea>'+
  '<div class="extra-actions"><button class="plus-btn" id="extraMic"'+(!SR?' disabled title="Speech recognition unsupported"':'')+'>🎤 Start speaking</button><button class="plus-btn secondary" id="extraEvaluate">Check transcript</button><button class="plus-btn secondary" id="extraAI">Get AI feedback</button><button class="plus-btn secondary" id="extraNextTurn">Next turn</button></div>'+
  '<div id="extraSpeakStatus" class="extra-note" aria-live="polite">'+(SR?"Microphone access is requested only when you tap Start speaking. Some browsers send audio to their speech recognition provider.":"Microphone transcription is not supported by this browser. You can type your answer instead.")+'</div>'+
  '<div id="extraSpeakResult" class="extra-feedback"></div><p class="extra-note">Speech recognition checks words, not your accent. AI grammar feedback requires login and a configured server key.</p></div>';
  $("extraScenario").onchange=e=>{speakingChoice=Number(e.target.value);speakingTurn=0;lastTranscript="";renderSpeaking();};
  $("extraListen").onclick=()=>{if(!speak(turn.prompt))$("extraSpeakStatus").textContent="Korean speech playback is unavailable in this browser.";};
  $("extraExample").onclick=()=>{$("extraExampleBox").textContent="Example: "+turn.example+" · "+turn.tip;};
  $("extraNextTurn").onclick=()=>{speakingTurn=(speakingTurn+1)%scenario.turns.length;lastTranscript="";renderSpeaking();};
  $("extraMic").onclick=()=>{
    if(!SR)return;
    if(recognition){try{recognition.stop();}catch{}recognition=null;}
    try{
      recognition=new SR();recognition.lang="ko-KR";recognition.interimResults=false;recognition.maxAlternatives=1;
      $("extraSpeakStatus").textContent="Listening… speak Korean now.";
      recognition.onresult=e=>{lastTranscript=e.results[0][0].transcript;$("extraSpeechInput").value=lastTranscript;$("extraSpeakStatus").textContent="Heard: "+lastTranscript;};
      recognition.onerror=e=>{$("extraSpeakStatus").textContent="Speech recognition: "+e.error+". You can type your answer instead.";};
      recognition.onend=()=>{recognition=null;};
      speechSynthesis?.cancel();recognition.start();
    }catch(e){$("extraSpeakStatus").textContent="Microphone unavailable: "+e.message;}
  };
  $("extraEvaluate").onclick=()=>evaluateSpoken(false);
  $("extraAI").onclick=()=>evaluateSpoken(true);
}
async function evaluateSpoken(withAI) {
  const text=$("extraSpeechInput")?.value.trim(),slot=$("extraSpeakResult");
  if(!text){slot.textContent="Please speak or type an answer first.";return;}
  const t=scenarios[speakingChoice].turns[speakingTurn];
  lastTranscript=text;
  const a=normalize(t.example),b=normalize(text);
  const overlap=a&&b?(a===b?"You matched the example reply.":"Your reply differs from the example; it may still be completely natural."):"";
  slot.innerHTML='<b>✍️ Your Korean:</b> <span lang="ko">'+esc(text)+'</span><p>Example: '+esc(t.example)+'</p><p>'+esc(overlap)+'</p>';
  const history=get("speakingHistoryV1",[]);history.push({date:today(),scenario:scenarios[speakingChoice].name,prompt:t.prompt,reply:text});set("speakingHistoryV1",history.slice(-100));
  if(!withAI){reward(3,"Speaking practice");return;}
  const s=get(SESSION,null);
  if(!s?.access_token){slot.innerHTML+='<p><b>AI feedback needs your account:</b> sign in via Account. You can continue practicing with examples for free.</p>';return;}
  slot.innerHTML+='<p>Asking AI Tutor for naturalness and grammar feedback…</p>';
  try {
    const prompt="I am practicing spoken Korean at "+(get(CONF,{}).level||"A1")+". Situation: "+scenarios[speakingChoice].name+". Teacher said: "+t.prompt+". I replied: "+text+". Correct my Korean if necessary. Explain briefly in English, suggest a natural alternative, and ask one short follow-up question in Korean. Do not pretend to score accent or pronunciation.";
    const rsp=await fetch(API+"/functions/v1/korean-tutor",{method:"POST",headers:{"apikey":PUBLIC_KEY,"Authorization":"Bearer "+s.access_token,"Content-Type":"application/json"},body:JSON.stringify({message:prompt,history:[]})});
    const data=await rsp.json().catch(()=>({}));
    if(!rsp.ok)throw new Error(data.error||data.message||("AI feedback unavailable ("+rsp.status+")"));
    slot.innerHTML+='<div class="extra-feedback"><b>✨ AI Korean Tutor</b><p style="white-space:pre-wrap">'+esc(data.reply||"")+'</p></div>';
    reward(5,"AI Speaking");
  }catch(e){slot.innerHTML+='<p><b>AI Tutor:</b> '+esc(e.message)+'. Your local speaking practice is still saved.</p>';}
}

function makeQueue() {
  const selected=get(CONF,{}).level||"A1",allowed={ "New to Korean":["A1"],"A1":["A1"],"A2":["A1","A2"],"B1":["A2","B1"],"B2":["B1","B2"] }[selected]||["A1","A2"];
  const words=allWords(),wordState=get("wordStateV2",{}),srs=get(SRS,{}),now=today();
  const due=[],learning=[],fresh=[];
  for(const w of words){
    const k=keyFor(w),sr=srs[k],st=wordState[k];
    if(sr&&sr.due&&sr.due<=now)due.push(w);
    else if(st?.status==="learning")learning.push(w);
    else if(!sr && (!st || st.status==="new") && allowed.includes(w.level))fresh.push(w);
  }
  const ids=new Set(),arr=[];
  for(const candidates of [shuffle(due),shuffle(learning),shuffle(fresh),shuffle(words)]){
    for(const w of candidates){const k=keyFor(w);if(ids.has(k))continue;arr.push(w);ids.add(k);if(arr.length===10)break;}
    if(arr.length===10)break;
  }
  return {queue:arr,due:due.length,learning:learning.length};
}
function newReview() {reviewQueue=makeQueue().queue;reviewAt=0;revealed=false;renderReviews();}
function renderReviews() {
  const p=$("extraPanel"),srs=get(SRS,{}),now=today(),due=Object.values(srs).filter(v=>v?.due&&v.due<=now).length;
  if(!reviewQueue.length)reviewQueue=makeQueue().queue;
  const w=reviewQueue[reviewAt];
  if(!w){
    p.innerHTML='<div class="extra-box"><h3>🌸 Session complete!</h3><p>Your study progress and SRS review dates are saved.</p><div class="extra-actions"><button class="plus-btn" id="extraAgain">Start another 10</button><button class="plus-btn secondary" id="extraAnalyticsFromReview">View analytics</button></div></div>';
    $("extraAgain").onclick=newReview;$("extraAnalyticsFromReview").onclick=()=>go("analytics");return;
  }
  const st=srs[keyFor(w)]||{},done=reviewAt,total=reviewQueue.length;
  p.innerHTML='<div class="extra-box"><h3>🧠 Smart Reviews</h3><p>Spaced repetition based on your previous answers. Choose a rating after revealing the meaning.</p>'+
  '<div class="extra-stats"><b>'+due+' due now</b><b>'+done+' / '+total+' reviewed</b><b>'+(st.interval||0)+'-day last interval</b></div>'+
  '<div class="mission-track"><div class="mission-fill" style="width:'+Math.round(done/total*100)+'%"></div></div>'+
  '<div class="extra-flashcard"><small>'+esc(w.level||"Korean")+'</small><h2 lang="ko">'+esc(w.ko)+'</h2><div class="extra-meaning">'+(revealed?esc(w.en):"Can you remember its meaning?")+'</div></div>'+
  '<div class="extra-actions"><button class="plus-btn secondary" id="extraPlayWord">▶ Listen</button>'+(revealed?'':'<button class="plus-btn" id="extraReveal">Reveal answer</button>')+'</div>'+
  (revealed?'<p class="extra-note">Rate how well you remembered this word:</p><div class="extra-actions">'+[["again","Again","Didn't remember"],["hard","Hard","With effort"],["good","Good","Remembered"],["easy","Easy","Very easy"]].map(x=>'<button class="plus-btn secondary" data-grade="'+x[0]+'" title="'+x[2]+'">'+x[1]+'</button>').join("")+'</div>':'')+
  '<div class="extra-note">The next review date will be adjusted to your answer. Works without an account; signs in to sync between devices.</div></div>';
  $("extraPlayWord").onclick=()=>speak(w.ko);
  if($("extraReveal"))$("extraReveal").onclick=()=>{revealed=true;renderReviews();};
  p.querySelectorAll("[data-grade]").forEach(b=>b.onclick=()=>rateWord(b.dataset.grade,w));
}
function rateWord(grade,w) {
  if(!revealed)return;
  const good=grade!=="again";
  if(typeof updateWordResult==="function") updateWordResult(w,good);
  else {
    const s=get("wordStateV2",{}),k=keyFor(w),v=s[k]||{status:"new",correct:0,wrong:0};
    v[good?"correct":"wrong"]=(v[good?"correct":"wrong"]||0)+1;v.status=good?"learning":"learning";s[k]=v;set("wordStateV2",s);
  }
  const state=get(SRS,{}),k=keyFor(w),old=state[k]||{interval:0,streak:0},last=old.interval||0;
  let days=0;
  if(grade==="again"){days=0;old.streak=0;}
  if(grade==="hard"){days=Math.max(1,Math.round(last*1.2));old.streak=Math.max(1,old.streak||0);}
  if(grade==="good"){days=Math.max(2,Math.round(last*2));old.streak=(old.streak||0)+1;}
  if(grade==="easy"){days=Math.max(5,Math.round(last*2.6));old.streak=(old.streak||0)+1;}
  old.interval=days;old.due=dateAfter(days);state[k]=old;set(SRS,state);
  if(typeof bumpPractice==="function")bumpPractice(1);
  else {const a=get("activityDaysV2",[]);if(!a.includes(today())){a.push(today());set("activityDaysV2",a);}}
  if(typeof stats!=="undefined"&&typeof saveStats==="function"){stats[good?"correct":"wrong"]=(stats[good?"correct":"wrong"]||0)+1;saveStats();}
  reward(good?(grade==="easy"?8:5):1,"Smart Reviews");
  reviewAt++;revealed=false;renderReviews();
}
function renderAnalytics() {
  const p=$("extraPanel"),a=get(PLUS,{xp:0,xpLog:[],moduleStats:{}}),profile=get(CONF,{}),by=get("practicedByDayV2",{}),words=get("wordStateV2",{}),statsData=get("statsV2",{correct:0,wrong:0}),activities=get("activityDaysV2",[]);
  const n=Number(statsData.correct||0)+Number(statsData.wrong||0),acc=n?Math.round(100*Number(statsData.correct||0)/n):0;
  const last7=Array.from({length:7},(_,i)=>dateDaysAgo(6-i)),prev7=Array.from({length:7},(_,i)=>dateDaysAgo(13-i));
  const sum=a=>a.reduce((n,k)=>n+Number(by[k]||0),0);
  const recent=sum(last7),previous=sum(prev7),learned=Object.values(words).filter(x=>x?.status==="learned").length;
  const chart=Array.from({length:28},(_,i)=>dateDaysAgo(27-i)).map(k=>({date:k,val:Number(by[k]||0),xp:(a.xpLog||[]).filter(x=>x.date===k).reduce((v,x)=>v+Number(x.amount||0),0)}));
  const max=Math.max(1,...chart.map(x=>x.val));
  const skills=Object.entries(a.moduleStats||{}).filter(([k,v])=>v&&typeof v==="object"&&(v.correct||v.wrong)).map(([k,v])=>[k,Number(v.correct||0),Number(v.wrong||0)]);
  const mistakes=Object.values(get("mistakesV2",{})),hard=mistakes.filter(x=>x).sort((x,y)=>Number(y.count||0)-Number(x.count||0)).slice(0,4);
  const groups=["A1","A2","B1","B2"].map(level=>{const ls=allWords().filter(w=>w.level===level),num=ls.filter(w=>words[keyFor(w)]?.status==="learned").length;return {level,total:ls.length,done:num};});
  p.innerHTML='<div class="extra-box"><h3>📊 Learning Analytics</h3><p>Real progress from your saved study activity — no invented scores.</p>'+
   '<div class="extra-metrics"><div><b>'+recent+'</b><small>items · last 7 days</small></div><div><b>'+acc+'%</b><small>overall quiz accuracy</small></div><div><b>'+learned+'</b><small>learned words</small></div><div><b>'+Number(a.xp||0)+'</b><small>total XP</small></div></div>'+
   '<h4>28-day study activity</h4><div class="extra-chart" role="img" aria-label="Daily items practiced over the last 28 days">'+chart.map((x,i)=>'<div class="extra-chart-day" title="'+esc(x.date)+': '+x.val+' items, '+x.xp+' XP"><i style="height:'+Math.max(3,Math.round(100*x.val/max))+'%"></i>'+(i%7===0?'<small>'+esc(x.date.slice(5))+'</small>':'')+'</div>').join("")+'</div>'+
   '<p class="extra-note">Previous 7 days: '+previous+' items · '+(recent>=previous?"+":"")+(recent-previous)+' items compared with the previous week.</p>'+
   '<div class="extra-columns"><div><h4>Vocabulary by level</h4>'+groups.map(x=>'<div class="extra-progress-line"><span>'+x.level+'</span><div class="extra-track"><i style="width:'+Math.round(x.done/Math.max(1,x.total)*100)+'%"></i></div><small>'+x.done+'/'+x.total+'</small></div>').join("")+
   '</div><div><h4>Practice accuracy by mode</h4>'+(skills.length?skills.map(([k,c,w])=>'<div class="extra-progress-line"><span>'+esc(k)+'</span><div class="extra-track"><i style="width:'+Math.round(c/Math.max(1,c+w)*100)+'%"></i></div><small>'+Math.round(c/Math.max(1,c+w)*100)+'%</small></div>').join(""):'<p class="extra-note">Complete Learn+ exercises to reveal skill accuracy.</p>')+'</div></div>'+
   '<h4>Weak spots to revisit</h4>'+(hard.length?hard.map(m=>'<p class="extra-weak"><b>'+esc(m.category||m.word||"Review")+'</b> · '+esc(m.prompt||"Practice again")+' <small>×'+Number(m.count||1)+'</small></p>').join(""):'<p class="extra-note">No stored mistakes yet.</p>')+
   '<h4>Your next 4-week goal</h4><p>At your current pace of <b>'+(recent/7).toFixed(1)+'</b> recorded items per day, you could complete roughly <b>'+Math.round(recent/7*28)+'</b> practice items in the next four weeks. Your target is <b>'+esc(profile.minutes||30)+' minutes/day</b> for '+esc(profile.goal||"Everyday Korean")+'.</p>'+
   '<p class="extra-note">This is a simple pace projection, not an official TOPIK-level prediction or a measure of minutes studied.</p>'+
   '<div class="extra-actions"><button class="plus-btn" id="extraReviewWeak">Review weak words</button><button class="plus-btn secondary" id="extraAdjustGoal">Change study goal</button></div></div>';
  $("extraReviewWeak").onclick=()=>{newReview();go("reviews");};
  $("extraAdjustGoal").onclick=welcome;
}

function currentSession(){const s=get(SESSION,null);return s?.access_token&&s?.user?.id?s:null;}
async function api(path,opts) {
  const s=currentSession();if(!s)throw new Error("Please sign in from Account first.");
  const r=await fetch(API+path,{...opts,headers:{"apikey":PUBLIC_KEY,"Authorization":"Bearer "+s.access_token,"Content-Type":"application/json",...(opts?.headers||{})}});
  const body=await r.text();let parsed=null;try{parsed=body?JSON.parse(body):null;}catch{parsed={message:body};}
  if(!r.ok)throw new Error(parsed?.message||parsed?.error||("Cloud request failed ("+r.status+")"));
  return parsed;
}
const recentXP=()=>{const a=get(PLUS,{xpLog:[]});return (a.xpLog||[]).filter(x=>x.date>=dateDaysAgo(6)).reduce((n,x)=>n+Number(x.amount||0),0);};
async function loadCompetition() {
 const s=currentSession();if(!s)throw new Error("Sign in to join challenges.");
 if(window.KoreanAdvanced?.upsertFriendProfile)await window.KoreanAdvanced.upsertFriendProfile();
 const relations=await api("/rest/v1/friendships?select=requester_id,addressee_id,status&status=eq.accepted&or=(requester_id.eq."+s.user.id+",addressee_id.eq."+s.user.id+")");
 const ids=[s.user.id,...(relations||[]).map(x=>x.requester_id===s.user.id?x.addressee_id:x.requester_id)].filter(x=>/^[0-9a-f-]{36}$/.test(x));
 const unique=[...new Set(ids)];
 if(!unique.length)return {players:[],me:null};
 const players=await api("/rest/v1/friend_profiles?select=user_id,display_name,xp,weekly_xp,weekly_items,weekly_goal,show_in_leaderboard&user_id=in.("+unique.join(",")+")");
 return {players:players||[],me:(players||[]).find(x=>x.user_id===s.user.id)||null};
}
function challengeBadges() {
 const days=get("activityDaysV2",[]),setDays=new Set(days),active=Array.from({length:7},(_,i)=>dateDaysAgo(i)).filter(d=>setDays.has(d)).length;
 const items=Array.from({length:7},(_,i)=>dateDaysAgo(i)).reduce((n,k)=>n+Number(get("practicedByDayV2",{})[k]||0),0);
 return {days:active,items};
}
function renderChallenges(){
 const node=$("extraPanel");const s=currentSession();
 if(!s){node.innerHTML='<div class="extra-box"><h3>🏆 Challenges & Friends</h3><p>For privacy, friend leaderboards require a signed-in account. Your own daily challenges continue working offline.</p><button class="plus-btn" id="extraGoAccount">Open Account</button></div>';$("extraGoAccount").onclick=()=>activate("accountSection");return;}
 node.innerHTML='<div class="extra-box"><h3>🏆 Weekly Challenges</h3><p>Loading your accepted friends and opt-in statistics…</p></div>';
 loadCompetition().then(({players,me})=>{
   if(!$("extraPanel")||section!=="challenges")return;
   const optIn=!!me?.show_in_leaderboard,goal=Number(me?.weekly_goal||100),team=players.filter(x=>x.show_in_leaderboard).sort((a,b)=>(b.weekly_xp||0)-(a.weekly_xp||0));
   const total=team.reduce((n,x)=>n+Number(x.weekly_items||0),0),target=team.reduce((n,x)=>n+Number(x.weekly_goal||100),0),badge=challengeBadges();
   node.innerHTML='<div class="extra-box"><h3>🏆 Challenges & Leaderboards</h3><p>Only accepted friends who explicitly opt in appear in your leaderboard.</p>'+
   '<div class="extra-challenge"><b>🌷 My 7-day consistency quest</b><p>Study on every day of the last seven days.</p><div class="extra-track"><i style="width:'+Math.round(badge.days/7*100)+'%"></i></div><small>'+badge.days+' / 7 active days</small></div>'+
   '<div class="extra-challenge"><b>📚 My weekly practice sprint</b><p>Target '+goal+' practice items in a rolling seven-day window.</p><div class="extra-track"><i style="width:'+Math.min(100,Math.round(badge.items/Math.max(1,goal)*100))+'%"></i></div><small>'+badge.items+' / '+goal+' items</small></div>'+
   '<div class="extra-challenge"><b>💞 Friends study-together goal</b><p>Everyone who joins contributes their own weekly goal.</p><div class="extra-track"><i style="width:'+Math.min(100,Math.round(total/Math.max(1,target)*100))+'%"></i></div><small>'+total+' / '+target+' items · '+team.length+' opted-in participants</small></div>'+
   '<div class="extra-columns"><div><h4>My settings</h4><label class="extra-toggle"><input type="checkbox" id="extraJoinLeaderboard"'+(optIn?" checked":"")+'> Join leaderboard & group challenge</label><p class="extra-note">Off by default. Only name, XP, streak and activity already used by Friends may appear; never journal or email.</p><label class="extra-label" for="extraWeeklyGoal">My weekly target (10–1000 items)</label><input class="plus-input" id="extraWeeklyGoal" type="number" min="10" max="1000" value="'+goal+'"><button class="plus-btn" id="extraSaveCompetition">Save preferences</button><p id="extraCompetitionStatus" class="extra-note" aria-live="polite"></p></div>'+
   '<div><h4>XP leaderboard · last 7 days</h4>'+(team.length?team.map((x,i)=>'<div class="extra-leader"><b>'+(i+1)+'. '+esc(x.display_name||"Learner")+(x.user_id===s.user.id?" (you)":"")+'</b><span>'+Number(x.weekly_xp||0)+' XP · '+Number(x.weekly_items||0)+' items</span></div>').join(""):'<p class="extra-note">No participants yet. Join above, then invite friends from the Friends tab.</p>')+
   '<button class="plus-btn secondary" id="extraInvite">Find friends</button></div></div><p class="extra-note">Friendly challenges use self-reported study progress, not an anti-cheat ranking. The team goal updates when friends open the app and sync.</p></div>';
   $("extraInvite").onclick=()=>activate("friendsPlus");
   $("extraSaveCompetition").onclick=async()=>{
      const x=Number($("extraWeeklyGoal").value),checked=$("extraJoinLeaderboard").checked,slot=$("extraCompetitionStatus");
      if(!Number.isInteger(x)||x<10||x>1000){slot.textContent="Please choose 10–1000 items.";return;}
      slot.textContent="Saving…";
      try{await api("/rest/v1/friend_profiles?user_id=eq."+s.user.id,{method:"PATCH",headers:{"Prefer":"return=minimal"},body:JSON.stringify({show_in_leaderboard:checked,weekly_goal:x,weekly_xp:recentXP(),updated_at:new Date().toISOString()})});slot.textContent="Saved ✓";setTimeout(renderChallenges,500);}
      catch(e){slot.textContent=e.message;}
   };
 }).catch(e=>{if(node)node.innerHTML='<div class="extra-box"><h3>🏆 Challenges</h3><p>'+esc(e.message)+'</p><button class="plus-btn" id="extraTryChallenges">Try again</button></div>';if($("extraTryChallenges"))$("extraTryChallenges").onclick=renderChallenges;});
}

function updateHomeCTA(node) {
 if(!node)return;const p=get(CONF,null),pref=p?esc(p.goal)+" · "+esc(p.minutes)+" min/day":"Create your personal study path";
 node.innerHTML='<div><strong>🌸 Your learning path</strong><p>'+pref+'</p></div><div class="extra-actions"><button class="plus-btn" data-extralink="welcome">Personalize</button><button class="plus-btn secondary" data-extralink="speaking">Speaking</button><button class="plus-btn secondary" data-extralink="reviews">Review due words</button><button class="plus-btn secondary" data-extralink="analytics">My analytics</button><button class="plus-btn secondary" data-extralink="challenges">Challenges</button></div>';
 node.querySelectorAll("[data-extralink]").forEach(b=>b.onclick=()=>b.dataset.extralink==="welcome"?welcome():go(b.dataset.extralink));
}
function insertHomeCTA() {
 const home=$("homePlus");if(!home||$("homeExtraCTA"))return;
 const node=document.createElement("div");node.id="homeExtraCTA";node.className="extra-home-cta";updateHomeCTA(node);
 const sectionHead=home.querySelector(".section-head");if(sectionHead)sectionHead.insertAdjacentElement("afterend",node);else home.prepend(node);
}
function style() {
 const el=document.createElement("style");el.id="extraFeaturesStyle";
 el.textContent='.extra-route{background:linear-gradient(145deg,rgba(255,255,255,.85),rgba(250,235,242,.73));padding:18px;border:1px solid rgba(205,153,173,.3);border-radius:20px;margin:13px 0}.extra-route h3{font-size:18px;margin:0 0 4px;color:#704e5c}.extra-route p{color:#8b6e7e;font-size:13px;margin:0}.extra-route-heading{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}.extra-route-days{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:7px;margin-top:13px}.extra-route-day{border:1px solid rgba(205,153,173,.2);border-radius:12px;padding:9px;display:flex;flex-direction:column;gap:7px;min-width:0}.extra-route-day.today{background:#f7ddea;border-color:#cb8ca9}.extra-route-day small{font-size:10px;color:#8b6e7e}.extra-route-day b{font-size:12px;line-height:1.4;color:#704e5c;flex:1}.extra-route-day button{padding:0 5px;min-height:28px;font-size:11px}@media(max-width:800px){.extra-route-days{grid-template-columns:repeat(2,minmax(0,1fr))}}.extra-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:14px 0}.extra-tile{background:linear-gradient(140deg,rgba(255,255,255,.88),rgba(253,232,241,.76));border:1px solid rgba(206,151,178,.35);border-radius:20px;padding:17px;text-align:left;color:var(--text);display:flex;flex-direction:column;gap:8px;min-height:140px}.extra-tile.selected{outline:2px solid #d5a0b5}.extra-tile span{font-size:26px}.extra-tile b{color:#654b55}.extra-tile small{color:var(--muted);line-height:1.4}.extra-intro,.extra-home-cta{border:1px solid rgba(205,153,173,.4);border-radius:20px;background:rgba(255,250,252,.75);padding:16px;display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap}.extra-home-cta{margin-bottom:14px;display:block}.extra-home-cta p{margin:4px 0 12px}.extra-panel{margin-top:16px}.extra-box{border:1px solid rgba(205,153,173,.3);border-radius:23px;background:linear-gradient(145deg,rgba(255,255,255,.85),rgba(248,230,237,.7));padding:22px;color:var(--text)}.extra-box h3{margin:0 0 8px;color:#654b55;font-size:23px}.extra-box h4{margin:20px 0 10px;color:#654b55}.extra-box p{line-height:1.55}.extra-stats,.extra-actions{display:flex;flex-wrap:wrap;gap:10px;margin:12px 0}.extra-stats b{padding:9px 12px;border:1px solid rgba(201,151,172,.35);border-radius:13px;font-size:13px}.extra-flashcard{min-height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;margin:17px 0;padding:25px;border-radius:20px;background:rgba(255,255,255,.76);border:1px solid rgba(201,151,172,.25)}.extra-flashcard h2{font-size:35px;margin:16px}.extra-meaning{color:#7b5365}.extra-label,.extra-welcome label{display:block;margin:14px 0 6px;font-weight:700;color:#704e5c;font-size:14px}.extra-speech,.extra-challenge{background:rgba(255,255,255,.64);border:1px solid rgba(205,153,173,.25);padding:17px;margin:14px 0;border-radius:18px}.extra-speech h3{font-size:25px;margin:12px 0}.extra-speech p{color:#6b5b63}.extra-feedback{background:rgba(255,255,255,.7);border-radius:14px;padding:14px;margin-top:10px;line-height:1.6;overflow-wrap:anywhere}.extra-note{font-size:13px;color:var(--muted);line-height:1.6}.extra-chart{display:flex;height:144px;gap:4px;align-items:flex-end;padding:12px 4px 22px;border-radius:16px;background:rgba(255,255,255,.6);overflow:hidden}.extra-chart-day{flex:1;min-width:0;height:100%;display:flex;align-items:flex-end;position:relative}.extra-chart-day i{display:block;background:linear-gradient(0deg,#d18da9,#f1bfd0);width:100%;border-radius:4px 4px 0 0;min-height:3px}.extra-chart-day small{font-size:9px;position:absolute;bottom:-18px;left:0;white-space:nowrap;color:#876a79}.extra-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px;margin:15px 0}.extra-metrics>div{background:rgba(255,255,255,.7);border-radius:16px;padding:15px}.extra-metrics b{font-size:22px;display:block;color:#654b55}.extra-metrics small{color:#8c7580}.extra-columns{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}.extra-progress-line{display:grid;grid-template-columns:90px 1fr 60px;gap:8px;align-items:center;margin:10px 0}.extra-progress-line small{text-align:right}.extra-track{height:9px;border-radius:999px;background:#eed6e1;overflow:hidden;margin:10px 0}.extra-track i{display:block;height:100%;background:#cf8fac;border-radius:999px}.extra-weak{padding:10px;background:rgba(255,255,255,.6);border-radius:10px}.extra-leader{display:flex;justify-content:space-between;gap:8px;padding:12px 0;border-bottom:1px solid rgba(200,140,170,.2)}.extra-leader span{color:#8d6f7e}.extra-toggle{display:flex;gap:9px;align-items:center;margin:12px 0}.extra-overlay{position:fixed;inset:0;background:rgba(46,30,43,.54);z-index:100000;display:grid;place-items:center;padding:14px;overflow:auto}.extra-welcome{background:linear-gradient(155deg,#fffafd,#f9e5ef);max-width:490px;width:100%;border:2px solid white;border-radius:27px;padding:25px;max-height:95vh;overflow:auto;box-shadow:0 18px 80px rgba(78,40,57,.25)}.extra-welcome-icon{font-size:25px;color:#995776;margin-bottom:12px}.extra-welcome h2{font-size:28px;color:#704e5c}.extra-welcome p{color:#8b6e7e}.extra-welcome select,.extra-welcome input{width:100%}@media(max-width:800px){.extra-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.extra-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.extra-columns{grid-template-columns:1fr}}@media(max-width:480px){.extra-grid{grid-template-columns:1fr 1fr}.extra-tile{padding:13px;min-height:150px}.extra-box{padding:16px}.extra-welcome{padding:18px}.extra-metrics b{font-size:18px}}';
 document.head.appendChild(el);
}
async function init() {
 if($("extraFeaturesStyle"))return;
 try{if(window.VOCAB_READY)await window.VOCAB_READY;}catch{}
 style();
 const nav=document.querySelector(".tabs"),main=document.querySelector("main.app");
 if(!nav||!main)return;
 const button=document.createElement("button");button.className="tab";button.dataset.tab="extraSection";button.textContent="Explore ✨";
 nav.appendChild(button);
 const panel=document.createElement("section");panel.className="section";panel.id="extraSection";main.appendChild(panel);
 button.onclick=()=>{go(section);};
 renderExtras();
 insertHomeCTA();
 const home=$("homePlus");if(home){const observer=new MutationObserver(insertHomeCTA);observer.observe(home,{childList:true});}
 if(!get(CONF,null)&&!existingStudy())setTimeout(welcome,450);
 window.KoreanExplore={open:go,setup:welcome};
}
setTimeout(init,1650);
})();