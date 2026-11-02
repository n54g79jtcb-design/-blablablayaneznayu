(() => {
  const SUPABASE_URL = "https://edlysmrqqnxvvdnizrpz.supabase.co";
  const SUPABASE_KEY = "sb_publishable_uD-cWg7KAxCTXVIZ5OB8wA_OFAC-O_S";
  const STATE_KEY = "advancedLearningV1";
  const SESSION_KEY = "koreanCloudSessionV1";
  const FRIEND_CODES_KEY = "friendCodesV1";
  const DISPLAY_NAMES_KEY = "friendDisplayNamesV1";
  const $id = id => document.getElementById(id);
  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const read = (k,f) => { try { const v=JSON.parse(localStorage.getItem(k)); return v ?? f; } catch { return f; } };
  const write = (k,v) => localStorage.setItem(k, JSON.stringify(v));
  const today = () => new Date().toLocaleDateString("en-CA");
  const shuffle = a => { const x=[...a]; for(let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i],x[j]]=[x[j],x[i]];} return x; };
  const norm = s => String(s||"").trim().replace(/[.!?]/g,"").replace(/\s+/g," ").toLowerCase();
  const allVocab = () => (typeof vocab !== "undefined" && Array.isArray(vocab) ? vocab : (window.VOCAB || []));
  const allGrammar = () => (typeof grammar !== "undefined" && Array.isArray(grammar) ? grammar : []);

  let state = read(STATE_KEY, {
    xp:0, initialized:false, xpLog:[], daily:{}, achievements:[], moduleStats:{},
    realLife:{}, topikHistory:[], journal:{}, tutorChat:[]
  });
  let sentenceIndex=0, sentencePicked=[];
  let conjCurrent=null, dictationCurrent=null, realLifeCurrent=0;
  let topikSession=null, topikTimer=null;

  const sentences = [
    ["I shower after exercising.","운동한 후에 샤워해요."],
    ["I do my makeup before leaving home.","집에서 나가기 전에 화장해요."],
    ["I was studying when I got a call.","공부하다가 전화를 받았어요."],
    ["We decided to meet tomorrow.","내일 만나기로 했어요."],
    ["I want to speak Korean naturally.","한국어를 자연스럽게 말하고 싶어요."],
    ["If I have time, I will go to the cafe.","시간이 있으면 카페에 갈 거예요."],
    ["I think it will rain tomorrow.","내일 비가 올 것 같아요."],
    ["I came to study in Korea.","한국에서 공부하게 됐어요."],
    ["I have to submit the assignment today.","오늘 과제를 제출해야 돼요."],
    ["I met my friend at the station.","역에서 친구를 만났어요."],
    ["Please call me when you arrive.","도착하면 전화해 주세요."],
    ["The more I study, the more interesting it gets.","공부할수록 더 재미있어요."],
    ["I could not sleep because I was studying.","공부하느라고 못 잤어요."],
    ["I am going to buy clothes this weekend.","이번 주말에 옷을 사려고 해요."],
    ["After class, I went home right away.","수업이 끝난 후에 바로 집에 갔어요."],
    ["I miss you, so text me later.","보고 싶으니까 나중에 연락해 줘."]
  ];

  const fallbackVerbs = [
    {base:"먹다",en:"to eat",present:"먹어요",past:"먹었어요",future:"먹을 거예요"},
    {base:"가다",en:"to go",present:"가요",past:"갔어요",future:"갈 거예요"},
    {base:"하다",en:"to do",present:"해요",past:"했어요",future:"할 거예요"},
    {base:"보다",en:"to see",present:"봐요",past:"봤어요",future:"볼 거예요"},
    {base:"마시다",en:"to drink",present:"마셔요",past:"마셨어요",future:"마실 거예요"},
    {base:"듣다",en:"to listen",present:"들어요",past:"들었어요",future:"들을 거예요"}
  ];
  const verbs = () => (typeof tenseVerbs !== "undefined" && Array.isArray(tenseVerbs) ? tenseVerbs : fallbackVerbs);

  const dictationPhrases = [
    ["오늘 뭐 했어요?","What did you do today?"],["지금 어디에 있어요?","Where are you now?"],
    ["나중에 다시 연락할게요.","I'll contact you again later."],["천천히 말해 주세요.","Please speak slowly."],
    ["한국어를 더 잘하고 싶어요.","I want to get better at Korean."],["수업이 몇 시에 시작해요?","What time does class start?"],
    ["오늘은 너무 피곤해서 일찍 잘 거예요.","I'm very tired today, so I'll sleep early."],
    ["이 근처에 편의점이 있어요?","Is there a convenience store nearby?"],
    ["예약을 변경하고 싶은데요.","I'd like to change my reservation."],
    ["생각보다 어렵지 않았어요.","It wasn't as hard as I thought."],
    ["시간이 되면 같이 저녁 먹어요.","If you have time, let's have dinner together."],
    ["제가 잘못 이해한 것 같아요.","I think I misunderstood."],
    ["이거 카드로 결제할 수 있어요?","Can I pay for this by card?"],
    ["조금 늦을 것 같아요. 미안해요.","I think I'll be a little late. Sorry."],
    ["다음 역에서 내려야 돼요.","I have to get off at the next station."]
  ];

  const scenarios = [
    {icon:"☕",title:"At a café",place:"Cafe",dialogue:[["어서 오세요. 주문하시겠어요?","Welcome. Are you ready to order?"],["아이스 아메리카노 한 잔 주세요.","One iced Americano, please."],["드시고 가세요, 가지고 가세요?","For here or to go?"],["가지고 갈게요.","To go, please."]],q:"How do you say “to go, please” naturally?",options:["가지고 갈게요.","여기 살아요.","다시 만나요.","먹지 마세요."],a:0},
    {icon:"🎓",title:"At university",place:"Campus",dialogue:[["교수님, 질문이 있어요.","Professor, I have a question."],["네, 어떤 부분이 어려워요?","Sure, which part is difficult?"],["과제 제출 마감이 언제예요?","When is the assignment deadline?"],["금요일 자정까지예요.","It's due by midnight Friday."]],q:"Which phrase asks about the deadline?",options:["과제 제출 마감이 언제예요?","수업이 재미있어요.","금요일에 만나요.","시험을 잘 봤어요."],a:0},
    {icon:"💬",title:"Texting",place:"Chat",dialogue:[["지금 뭐 해?","What are you doing now?"],["집에서 쉬고 있어.","I'm resting at home."],["나중에 시간 돼?","Are you free later?"],["응, 저녁에는 괜찮아.","Yeah, I'm free in the evening."]],q:"What is a casual way to ask if someone is free later?",options:["나중에 시간 돼?","어디에서 왔어요?","얼마예요?","괜찮으세요?"],a:0},
    {icon:"📦",title:"Delivery call",place:"Home",dialogue:[["택배 기사입니다. 집에 계세요?","This is the delivery driver. Are you home?"],["지금 밖에 있어요.","I'm outside right now."],["문 앞에 두셔도 돼요.","You can leave it at the door."],["네, 알겠습니다.","Okay, understood."]],q:"How do you tell the driver they may leave it at the door?",options:["문 앞에 두셔도 돼요.","제가 가져갈게요.","문을 닫아 주세요.","주소를 몰라요."],a:0},
    {icon:"🏥",title:"At a clinic",place:"Hospital",dialogue:[["어디가 불편하세요?","What is bothering you?"],["머리가 아프고 어지러워요.","My head hurts and I feel dizzy."],["언제부터 그랬어요?","Since when?"],["오늘 아침부터요.","Since this morning."]],q:"How do you say “since this morning”?",options:["오늘 아침부터요.","아침마다요.","내일 아침에요.","아침까지요."],a:0},
    {icon:"🛂",title:"Immigration office",place:"Office",dialogue:[["어떤 업무로 오셨어요?","What are you here for?"],["외국인등록증을 받으러 왔어요.","I came to pick up my residence card."],["여권을 보여 주세요.","Please show me your passport."],["여기 있습니다.","Here it is."]],q:"Which sentence means “I came to pick up my residence card”?",options:["외국인등록증을 받으러 왔어요.","여권을 잃어버렸어요.","비자를 신청할 거예요.","주소를 바꾸고 싶어요."],a:0},
    {icon:"🚕",title:"In a taxi",place:"Taxi",dialogue:[["어디로 가세요?","Where are you going?"],["강남역으로 가 주세요.","Please go to Gangnam Station."],["이 길이 많이 막히네요.","This road is very congested."],["네, 시간이 좀 걸리겠어요.","Yes, it may take a while."]],q:"How do you ask the driver to go to a place?",options:["강남역으로 가 주세요.","강남역에서 살아요.","강남역이 좋아요.","강남역에 있었어요."],a:0},
    {icon:"🛍️",title:"Shopping",place:"Store",dialogue:[["이거 입어 봐도 돼요?","Can I try this on?"],["네, 탈의실은 저쪽이에요.","Yes, the fitting room is over there."],["다른 사이즈도 있어요?","Do you have another size?"],["네, 가져다드릴게요.","Yes, I'll bring it for you."]],q:"How do you ask to try clothing on?",options:["이거 입어 봐도 돼요?","이거 먹어 봐도 돼요?","이거 열어 주세요.","이거 버려 주세요."],a:0}
  ];

  const topikQuestions = [
    {type:"Vocabulary",q:"‘결정하다’와 가장 가까운 뜻은?",o:["decide","forget","borrow","repeat"],a:0},
    {type:"Grammar",q:"시간이 ___ 같이 점심을 먹어요.",o:["있으면","있다가","있기로","있느라고"],a:0},
    {type:"Vocabulary",q:"‘오히려’의 뜻으로 가장 알맞은 것은?",o:["rather / on the contrary","slowly","already","especially"],a:0},
    {type:"Grammar",q:"공부하면 할___ 더 재미있어요.",o:["수록","뿐","전에","커녕"],a:0},
    {type:"Reading",q:"민지는 매일 복습하고 모르는 표현을 따로 정리했습니다. 민지는 어떻게 공부했습니까?",o:["매일 복습하고 표현을 정리했다","시험 전날만 공부했다","수업을 자주 빠졌다","공부를 그만뒀다"],a:0},
    {type:"Vocabulary",q:"‘적응하다’의 뜻은?",o:["to adapt","to refuse","to repair","to deliver"],a:0},
    {type:"Grammar",q:"비가 많이 와___ 길이 막혔어요.",o:["서","지만","려고","수록"],a:0},
    {type:"Vocabulary",q:"‘지원하다’의 뜻으로 알맞은 것은?",o:["to apply / support","to cancel","to compare","to translate"],a:0},
    {type:"Listening",audio:"조금 늦을 것 같아요. 미안해요.",q:"What did the speaker say?",o:["They may be a little late and apologized.","They already arrived.","They cancelled class.","They are ordering food."],a:0},
    {type:"Grammar",q:"수업이 끝난 ___ 친구를 만났어요.",o:["후에","전에만","커녕","수록"],a:0},
    {type:"Vocabulary",q:"‘가능성’의 뜻은?",o:["possibility","responsibility","experience","relationship"],a:0},
    {type:"Listening",audio:"예약을 변경하고 싶은데요.",q:"What does the speaker want to do?",o:["Change a reservation","Make a payment","Find a hospital","Order coffee"],a:0},
    {type:"Grammar",q:"한국에 온 ___ 벌써 세 달이 됐어요.",o:["지","다가","려고","도록"],a:0},
    {type:"Reading",q:"지수는 지하철이 너무 복잡해서 한 정거장 전에 내려서 걸어갔습니다. 왜 걸어갔습니까?",o:["The subway was too crowded.","She missed her stop.","She wanted exercise.","The subway was closed."],a:0},
    {type:"Vocabulary",q:"‘환경을 보호하다’의 뜻은?",o:["protect the environment","change the schedule","take medicine","pay the bill"],a:0},
    {type:"Grammar",q:"바쁜 ___ 도와줘서 고마워요.",o:["데도","수록","커녕","전에"],a:0},
    {type:"Listening",audio:"문 앞에 두셔도 돼요.",q:"What permission is being given?",o:["You may leave it at the door.","You may open the door.","You may cancel the delivery.","You may come inside."],a:0},
    {type:"Vocabulary",q:"‘부족하다’의 뜻은?",o:["to be insufficient","to be famous","to be similar","to be quiet"],a:0},
    {type:"Grammar",q:"한국어를 자연스럽게 말___ 매일 연습해요.",o:["기 위해서","는 동안","은커녕","는 대신"],a:0},
    {type:"Listening",audio:"다음 역에서 내려야 돼요.",q:"What must the speaker do?",o:["Get off at the next station","Change buses now","Buy a ticket","Wait at the station"],a:0}
  ];

  const journalPrompts = [
    "오늘 뭐 했어요? Write 3–5 sentences about your day.",
    "이번 주에 가장 기억에 남는 일은 뭐예요?",
    "서울에서 좋아하는 장소를 설명해 보세요.",
    "요즘 배우고 싶은 것은 뭐예요? 왜요?",
    "친구에게 추천하고 싶은 음식이나 카페를 소개해 보세요.",
    "내일 할 일을 -(으)ㄹ 거예요 form으로 써 보세요.",
    "최근에 어려웠던 일을 -지만 / -아/어서를 사용해서 써 보세요."
  ];

  function saveState(){ write(STATE_KEY,state); }
  function session(){ return read(SESSION_KEY,null); }
  function currentName(){
    const s=session(); const names=read(DISPLAY_NAMES_KEY,{});
    return names[s?.user?.id] || s?.user?.email?.split("@")[0] || "Learner";
  }
  function streak(){
    const days=new Set(read("activityDaysV2",[])); let d=new Date(),n=0;
    if(!days.has(d.toLocaleDateString("en-CA")))d.setDate(d.getDate()-1);
    while(days.has(d.toLocaleDateString("en-CA"))){n++;d.setDate(d.getDate()-1);} return n;
  }
  function weekItems(){
    const by=read("practicedByDayV2",{}); let total=0; const d=new Date();
    for(let i=0;i<7;i++){const x=new Date(d);x.setDate(d.getDate()-i);total+=Number(by[x.toLocaleDateString("en-CA")]||0);} return total;
  }
  function accuracy(){ const s=read("statsV2",{correct:0,wrong:0});const n=s.correct+s.wrong;return n?Math.round(s.correct/n*100):0; }
  function learnedCount(){ return Object.values(read("wordStateV2",{})).filter(x=>x?.status==="learned").length; }
  function ensureInitialized(){
    if(state.initialized)return;
    const s=read("statsV2",{correct:0,wrong:0,tests:0});
    state.xp=Math.max(state.xp||0,(s.correct||0)*3+(s.tests||0)*25+learnedCount()*10);
    state.initialized=true; saveState();
  }
  function levelInfo(){
    const level=Math.max(1,Math.floor(Math.sqrt((state.xp||0)/120))+1);
    const prev=(level-1)*(level-1)*120, next=level*level*120;
    return {level,prev,next,pct:Math.max(0,Math.min(100,Math.round(((state.xp-prev)/(next-prev||1))*100)))};
  }
  function awardXP(n,label){
    state.xp=(state.xp||0)+n; state.xpLog=state.xpLog||[];
    state.xpLog.push({date:today(),amount:n,label}); if(state.xpLog.length>250)state.xpLog=state.xpLog.slice(-250);
    saveState(); checkAchievements(); renderHome();
  }
  function daily(){
    state.daily=state.daily||{};
    if(!state.daily[today()])state.daily[today()]={vocab:0,grammar:0,sentence:0,dictation:0,claimed:false};
    return state.daily[today()];
  }
  function bumpDaily(kind,n=1){const d=daily();d[kind]=Math.max(0,(d[kind]||0)+n);saveState();}
  function missionPct(){const d=daily();return Math.round((Math.min(10,d.vocab)/10+Math.min(5,d.grammar)/5+Math.min(3,d.sentence)/3+Math.min(1,d.dictation))/4*100);}

  const achievementDefs = [
    ["first","🌸","First Steps",()=>state.xp>=20],["hundred","💯","100 XP",()=>state.xp>=100],
    ["fivehundred","✨","500 XP",()=>state.xp>=500],["thousand","👑","1,000 XP",()=>state.xp>=1000],
    ["streak3","🔥","3-day streak",()=>streak()>=3],["streak7","💗","7-day streak",()=>streak()>=7],
    ["words100","📚","100 learned words",()=>learnedCount()>=100],["journal3","📝","3 journal entries",()=>Object.keys(state.journal||{}).length>=3],
    ["scenario4","🗺️","Real-life explorer",()=>Object.values(state.realLife||{}).filter(Boolean).length>=4],
    ["topik","🎓","TOPIK challenger",()=>Array.isArray(state.topikHistory)&&state.topikHistory.length>=1]
  ];
  function checkAchievements(){
    state.achievements=state.achievements||[]; let changed=false;
    achievementDefs.forEach(([id,,,cond])=>{if(cond()&&!state.achievements.includes(id)){state.achievements.push(id);changed=true;}});
    if(changed)saveState();
  }
  function weakAreas(){
    const ms=read("mistakesV2",{}), counts={Particles:0,Grammar:0,Vocabulary:0,Tenses:0,Listening:0,Sentences:0};
    Object.values(ms).forEach(m=>{const t=`${m?.category||""} ${m?.prompt||""} ${m?.word||""}`.toLowerCase(); const c=Number(m?.count||1);
      if(/particle|은|는|이|가|을|를|에서|에게/.test(t))counts.Particles+=c;
      else if(/tense|past|future|present|conjug/.test(t))counts.Tenses+=c;
      else if(/listen|dictation/.test(t))counts.Listening+=c;
      else if(/sentence|builder/.test(t))counts.Sentences+=c;
      else if(/grammar|before|after|려고|기로|다가/.test(t))counts.Grammar+=c;
      else counts.Vocabulary+=c;
    });
    return Object.entries(counts).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]);
  }
  function recordAdvancedMistake(id,prompt,answer,category){
    if(typeof recordMistake==="function")recordMistake(id,{prompt,answer,category,word:category});
    else {const ms=read("mistakesV2",{}),m=ms[id]||{prompt,answer,category,word:category,count:0,last:""};m.count++;m.last=today();ms[id]=m;write("mistakesV2",ms);}
  }
  function markActivity(){
    const arr=read("activityDaysV2",[]);if(!arr.includes(today())){arr.push(today());arr.sort();write("activityDaysV2",arr);}
  }

  function addTab(id,label){
    const nav=document.querySelector(".tabs"); if(!nav)return;
    if(!nav.querySelector(`[data-tab="${id}"]`)){const b=document.createElement("button");b.className="tab";b.dataset.tab=id;b.textContent=label;nav.appendChild(b);b.addEventListener("click",()=>activate(id));}
    if(!$id(id)){const s=document.createElement("section");s.className="section";s.id=id;document.querySelector("main.app")?.appendChild(s);}
  }
  function activate(id){
    document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===id));
    document.querySelectorAll(".section").forEach(s=>s.classList.toggle("active",s.id===id));
    if(id==="homePlus")renderHome(); if(id==="learnPlus")renderLearnHub(); if(id==="friendsPlus")renderFriends(); if(id==="aiTutorPlus")renderTutor();
  }
  function openLearn(tool){activate("learnPlus");setTimeout(()=>openTool(tool),20);}

  function injectStyle(){
    if($id("advancedLearningStyle"))return; const st=document.createElement("style");st.id="advancedLearningStyle";
    st.textContent=`
    .tabs{grid-template-columns:repeat(auto-fit,minmax(118px,1fr))!important}.plus-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:13px}.plus-card,.plus-panel{border:1px solid rgba(205,153,173,.26);background:linear-gradient(145deg,rgba(255,255,255,.78),rgba(248,232,239,.66));border-radius:22px;padding:20px;box-shadow:var(--small-shadow)}.plus-card{cursor:pointer;text-align:left;color:var(--text)}.plus-card:hover{transform:translateY(-1px)}.plus-card .plus-icon{font-size:26px}.plus-card h3,.plus-panel h3{margin:9px 0 7px;color:#654b55}.plus-card p,.plus-panel p{color:var(--muted);line-height:1.5;margin:0}.hero-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:15px 0}.hero-stat{padding:16px;border-radius:18px;background:rgba(255,255,255,.55);border:1px solid rgba(205,153,173,.2)}.hero-stat b{display:block;font-size:26px;color:#654b55}.xp-track,.mission-track{height:9px;border-radius:999px;background:rgba(160,110,130,.15);overflow:hidden;margin-top:9px}.xp-fill,.mission-fill{height:100%;background:linear-gradient(90deg,#e9b6ca,#cf8daa);border-radius:inherit}.plus-btn{min-height:42px;border:1px solid rgba(205,153,173,.35);border-radius:999px;background:linear-gradient(145deg,#fffafd,#efd0db);padding:0 15px;color:#654b55;font-weight:700}.plus-btn.secondary{background:rgba(255,255,255,.55)}.plus-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:13px}.tool-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 16px}.tool-tabs button.active{box-shadow:0 0 0 2px rgba(210,145,170,.22)}.mission-list{display:grid;gap:9px;margin-top:12px}.mission-row{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;padding:12px 14px;border-radius:15px;background:rgba(255,255,255,.5)}.token-area{min-height:64px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;padding:10px;border:1px dashed rgba(190,135,155,.5);border-radius:16px;margin:12px 0}.token{border:1px solid rgba(205,153,173,.35);background:#fffafd;border-radius:12px;padding:9px 11px;color:#654b55}.plus-input,.plus-textarea{width:100%;border:1px solid rgba(205,153,173,.35);background:rgba(255,255,255,.72);border-radius:14px;padding:12px;color:var(--text);outline:none}.plus-textarea{min-height:150px;resize:vertical}.feedback-box{margin-top:12px;padding:12px;border-radius:14px;background:rgba(255,255,255,.5);min-height:45px;white-space:pre-wrap}.scenario-dialogue{display:grid;gap:8px;margin:14px 0}.dialogue-line{padding:12px;border-radius:14px;background:rgba(255,255,255,.55)}.dialogue-line b{display:block;color:#654b55;margin-bottom:4px}.choice-grid{display:grid;gap:8px;margin-top:12px}.choice{min-height:46px;text-align:left;border:1px solid rgba(205,153,173,.3);border-radius:13px;background:rgba(255,255,255,.62);padding:10px;color:var(--text)}.choice.selected{border-color:#cf8daa;background:#fff5f8}.calendar{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-top:12px}.cal-day{aspect-ratio:1;border-radius:10px;background:rgba(205,153,173,.12);display:grid;place-items:center;font-size:11px}.cal-day.on{background:#e9b6ca;color:#654b55;font-weight:800}.achievement-grid{display:flex;flex-wrap:wrap;gap:8px}.achievement{padding:9px 11px;border-radius:14px;background:rgba(255,255,255,.55);opacity:.45}.achievement.on{opacity:1;border:1px solid rgba(205,153,173,.3)}.journal-entry,.friend-row,.mistake-plus{padding:13px;border-radius:15px;background:rgba(255,255,255,.53);margin-top:8px}.friend-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center}.code-box{font-size:24px;letter-spacing:3px;font-weight:800;color:#654b55}.chat-box{height:min(52vh,520px);overflow:auto;display:flex;flex-direction:column;gap:10px;padding:12px;border-radius:18px;background:rgba(255,255,255,.42);margin:12px 0}.chat-msg{max-width:86%;padding:12px 14px;border-radius:16px;white-space:pre-wrap;line-height:1.5}.chat-msg.user{align-self:flex-end;background:#efd0db;color:#654b55}.chat-msg.assistant{align-self:flex-start;background:rgba(255,255,255,.82)}.topik-meta{display:flex;justify-content:space-between;gap:10px;margin-bottom:10px}.weekly-bars{display:grid;gap:7px;margin-top:12px}.weekly-line{display:grid;grid-template-columns:42px 1fr 32px;align-items:center;gap:8px}.weekly-line i{height:8px;background:#e9b6ca;border-radius:999px;display:block}.two-col{display:grid;grid-template-columns:1fr 1fr;gap:13px}
    @media(max-width:820px){.plus-grid{grid-template-columns:1fr 1fr}.hero-stats{grid-template-columns:1fr 1fr}.two-col{grid-template-columns:1fr}}@media(max-width:560px){.plus-grid{grid-template-columns:1fr}.tabs{grid-template-columns:repeat(2,1fr)!important}.code-box{font-size:20px}}
    `;document.head.appendChild(st);
  }

  function calendarHTML(){
    const days=new Set(read("activityDaysV2",[])),out=[]; const d=new Date();
    for(let i=34;i>=0;i--){const x=new Date(d);x.setDate(d.getDate()-i);const k=x.toLocaleDateString("en-CA");out.push(`<div class="cal-day ${days.has(k)?"on":""}" title="${k}">${x.getDate()}</div>`);}return out.join("");
  }
  function weeklyHTML(){
    const by=read("practicedByDayV2",{}),rows=[];const d=new Date();let max=1;
    for(let i=6;i>=0;i--){const x=new Date(d);x.setDate(d.getDate()-i);const k=x.toLocaleDateString("en-CA"),v=Number(by[k]||0);max=Math.max(max,v);rows.push([x.toLocaleDateString("en-US",{weekday:"short"}),v]);}
    return rows.map(([n,v])=>`<div class="weekly-line"><span>${n}</span><i style="width:${Math.round(v/max*100)}%"></i><b>${v}</b></div>`).join("");
  }
  function renderHome(){
    const sec=$id("homePlus");if(!sec)return;ensureInitialized();checkAchievements();const li=levelInfo(),d=daily(),weak=weakAreas();
    const hour=new Date().getHours(),g=hour<12?"Good morning":hour<18?"Good afternoon":"Good evening";
    const weekXP=(state.xpLog||[]).filter(x=>{const dt=new Date(x.date+"T00:00:00");return Date.now()-dt.getTime()<7*86400000}).reduce((a,b)=>a+Number(b.amount||0),0);
    sec.innerHTML=`<div class="section-head"><h2>${g}, ${esc(currentName())} ♡</h2><p>Your personalized Korean dashboard.</p></div>
      <div class="plus-panel"><div style="display:flex;justify-content:space-between;gap:14px;align-items:end;flex-wrap:wrap"><div><div class="muted">Level ${li.level}</div><div style="font-size:34px;font-weight:800;color:#654b55">${state.xp} XP</div></div><button class="plus-btn" id="continueStudyBtn">Continue studying</button></div><div class="xp-track"><div class="xp-fill" style="width:${li.pct}%"></div></div><div class="muted" style="margin-top:6px">${Math.max(0,li.next-state.xp)} XP to Level ${li.level+1}</div></div>
      <div class="hero-stats"><div class="hero-stat"><span class="muted">Streak</span><b>🔥 ${streak()}</b></div><div class="hero-stat"><span class="muted">This week</span><b>${weekItems()}</b></div><div class="hero-stat"><span class="muted">Accuracy</span><b>${accuracy()}%</b></div><div class="hero-stat"><span class="muted">Learned</span><b>${learnedCount()}</b></div></div>
      <div class="two-col"><div class="plus-panel"><h3>Daily Mission · ${missionPct()}%</h3><div class="mission-track"><div class="mission-fill" style="width:${missionPct()}%"></div></div><div class="mission-list"><div class="mission-row"><span>10 vocabulary reviews</span><b>${Math.min(10,d.vocab)}/10</b></div><div class="mission-row"><span>5 grammar reviews</span><b>${Math.min(5,d.grammar)}/5</b></div><div class="mission-row"><span>3 sentence builds</span><b>${Math.min(3,d.sentence)}/3</b></div><div class="mission-row"><span>1 dictation</span><b>${Math.min(1,d.dictation)}/1</b></div></div><div class="plus-actions"><button class="plus-btn" id="dailyOpenBtn">Open Daily Mission</button></div></div>
      <div class="plus-panel"><h3>Weak Areas</h3>${weak.length?weak.slice(0,4).map(([x,n])=>`<div class="mission-row"><span>${esc(x)}</span><b>${n} mistakes</b></div>`).join(""):`<p>No repeated weak area yet. Keep practicing and I’ll detect patterns automatically.</p>`}<div class="plus-actions"><button class="plus-btn secondary" id="mistakesOpenBtn">Practice mistakes</button></div></div></div>
      <div class="two-col" style="margin-top:13px"><div class="plus-panel"><h3>35-day streak calendar</h3><div class="calendar">${calendarHTML()}</div></div><div class="plus-panel"><h3>Weekly Report</h3><p><b>${weekXP} XP</b> earned in the last 7 days · ${accuracy()}% overall accuracy</p><div class="weekly-bars">${weeklyHTML()}</div></div></div>
      <div class="plus-panel" style="margin-top:13px"><h3>Achievements</h3><div class="achievement-grid">${achievementDefs.map(([id,icon,title])=>`<div class="achievement ${state.achievements.includes(id)?"on":""}">${icon} ${esc(title)}</div>`).join("")}</div></div>`;
    $id("continueStudyBtn").onclick=()=>openLearn("daily");$id("dailyOpenBtn").onclick=()=>openLearn("daily");$id("mistakesOpenBtn").onclick=()=>openLearn("mistakes");
  }

  const tools=[
    ["daily","🌷","Daily Mission","Your four-part study goal for today."],["sentence","🧩","Sentence Builder","Build natural Korean sentences from blocks."],
    ["conjugation","✍️","Conjugation Trainer","Practice present, past and future forms."],["dictation","🎧","Dictation","Listen in Korean and type what you hear."],
    ["reallife","🗺️","Real-life Korean","Cafe, university, texting, delivery, clinic and more."],["topik","🎓","TOPIK Mock","Timed 20-question practice exam."],
    ["journal","📝","Writing Journal","Save a daily Korean entry and send it to AI Tutor."],["mistakes","💗","Mistake Book","Everything you got wrong, in one place."]
  ];
  function renderLearnHub(){
    const sec=$id("learnPlus");if(!sec)return;sec.innerHTML=`<div class="section-head"><h2>Learn+</h2><p>Focused practice modes for real Korean.</p></div><div class="plus-grid">${tools.map(([id,ic,t,p])=>`<button class="plus-card" data-tool="${id}"><div class="plus-icon">${ic}</div><h3>${t}</h3><p>${p}</p></button>`).join("")}</div><div id="toolPanel" style="margin-top:15px"></div>`;sec.querySelectorAll("[data-tool]").forEach(b=>b.onclick=()=>openTool(b.dataset.tool));
  }
  function toolTabs(active){return `<div class="tool-tabs">${tools.map(([id,ic,t])=>`<button class="plus-btn secondary ${id===active?"active":""}" data-tool-tab="${id}">${ic} ${t}</button>`).join("")}</div>`;}
  function bindToolTabs(){document.querySelectorAll("[data-tool-tab]").forEach(b=>b.onclick=()=>openTool(b.dataset.toolTab));}
  function openTool(name){const p=$id("toolPanel");if(!p){renderLearnHub();return setTimeout(()=>openTool(name),10);} if(name==="daily")renderDaily(p);if(name==="sentence")renderSentence(p);if(name==="conjugation")renderConjugation(p);if(name==="dictation")renderDictation(p);if(name==="reallife")renderRealLife(p);if(name==="topik")renderTopik(p);if(name==="journal")renderJournal(p);if(name==="mistakes")renderMistakes(p);bindToolTabs();p.scrollIntoView({behavior:"smooth",block:"start"});}

  function renderDaily(p){const d=daily(),v=shuffle(allVocab()).slice(0,10),g=shuffle(allGrammar()).slice(0,5);p.innerHTML=`${toolTabs("daily")}<div class="plus-panel"><h3>🌷 Daily Mission</h3><p>Review the material, then mark each block complete. Finish all four for a 50 XP bonus.</p><div class="mission-list"><div class="mission-row"><div><b>Vocabulary</b><div class="muted">${v.map(x=>`${esc(x.ko)} — ${esc(x.en)}`).join(" · ")}</div></div><button class="plus-btn" id="doneVocab">${d.vocab>=10?"Done ✓":"Complete"}</button></div><div class="mission-row"><div><b>Grammar</b><div class="muted">${g.map(x=>esc(x.form)).join(" · ")||"Review five grammar cards"}</div></div><button class="plus-btn" id="doneGrammar">${d.grammar>=5?"Done ✓":"Complete"}</button></div><div class="mission-row"><div><b>Sentence Builder</b><div class="muted">Build three correct sentences.</div></div><button class="plus-btn secondary" id="goSentence">Open</button></div><div class="mission-row"><div><b>Dictation</b><div class="muted">Get one dictation correct.</div></div><button class="plus-btn secondary" id="goDictation">Open</button></div></div><div class="mission-track"><div class="mission-fill" style="width:${missionPct()}%"></div></div><div class="feedback-box">Today: ${missionPct()}% complete</div></div>`;
    $id("doneVocab").onclick=()=>{if(d.vocab<10){d.vocab=10;markActivity();awardXP(15,"Daily vocabulary");saveState();}finishMissionBonus();renderDaily(p)};$id("doneGrammar").onclick=()=>{if(d.grammar<5){d.grammar=5;markActivity();awardXP(15,"Daily grammar");saveState();}finishMissionBonus();renderDaily(p)};$id("goSentence").onclick=()=>openTool("sentence");$id("goDictation").onclick=()=>openTool("dictation");
  }
  function finishMissionBonus(){const d=daily();if(missionPct()===100&&!d.claimed){d.claimed=true;saveState();awardXP(50,"Daily Mission complete");}}

  function renderSentence(p){sentenceIndex%=sentences.length;sentencePicked=[];const [en,ko]=sentences[sentenceIndex],tokens=shuffle(ko.replace(/[.?!]/g,"").split(" "));p.innerHTML=`${toolTabs("sentence")}<div class="plus-panel"><h3>🧩 Sentence Builder</h3><p>${esc(en)}</p><div class="token-area" id="pickedTokens"><span class="muted">Tap words below to build the sentence.</span></div><div class="token-area" id="availableTokens">${tokens.map((t,i)=>`<button class="token" data-token-i="${i}" data-token="${esc(t)}">${esc(t)}</button>`).join("")}</div><div class="plus-actions"><button class="plus-btn" id="checkSentence">Check</button><button class="plus-btn secondary" id="resetSentence">Reset</button><button class="plus-btn secondary" id="nextSentence">Next</button></div><div class="feedback-box" id="sentenceFeedback"></div></div>`;
    const bind=()=>p.querySelectorAll("[data-token]").forEach(b=>b.onclick=()=>{if(b.disabled)return;sentencePicked.push(b.dataset.token);b.disabled=true;b.style.opacity=.35;$id("pickedTokens").innerHTML=sentencePicked.map((x,i)=>`<button class="token" data-picked="${i}">${esc(x)}</button>`).join("");$id("pickedTokens").querySelectorAll("[data-picked]").forEach(x=>x.onclick=()=>renderSentence(p));});bind();
    $id("checkSentence").onclick=()=>{const guess=sentencePicked.join(" "),correct=ko.replace(/[.?!]/g,"");if(norm(guess)===norm(correct)){bumpDaily("sentence",1);markActivity();awardXP(12,"Sentence Builder");$id("sentenceFeedback").textContent="Correct ✓  "+ko;finishMissionBonus();}else{recordAdvancedMistake("builder|"+ko,en,ko,"Sentences");$id("sentenceFeedback").textContent="Not quite. Correct: "+ko;}};
    $id("resetSentence").onclick=()=>renderSentence(p);$id("nextSentence").onclick=()=>{sentenceIndex=(sentenceIndex+1)%sentences.length;renderSentence(p)};
  }

  function renderConjugation(p){const vs=verbs(),forms=["present","past","future"];if(!conjCurrent)conjCurrent={v:vs[Math.floor(Math.random()*vs.length)],form:forms[Math.floor(Math.random()*forms.length)]};const {v,form}=conjCurrent;p.innerHTML=`${toolTabs("conjugation")}<div class="plus-panel"><h3>✍️ Conjugation Trainer</h3><p>Conjugate <b>${esc(v.base)}</b> (${esc(v.en)}) into the <b>${form}</b> polite form.</p><input class="plus-input" id="conjInput" lang="ko" placeholder="Type in Korean"><div class="plus-actions"><button class="plus-btn" id="checkConj">Check</button><button class="plus-btn secondary" id="nextConj">Next</button></div><div class="feedback-box" id="conjFeedback"></div></div>`;
    $id("checkConj").onclick=()=>{const val=$id("conjInput").value,ans=v[form];state.moduleStats.conjugation=state.moduleStats.conjugation||{correct:0,wrong:0};if(norm(val)===norm(ans)){state.moduleStats.conjugation.correct++;markActivity();awardXP(10,"Conjugation");$id("conjFeedback").textContent="Correct ✓ "+ans;}else{state.moduleStats.conjugation.wrong++;recordAdvancedMistake(`conj|${v.base}|${form}`,`${v.base} → ${form}`,ans,"Tenses");saveState();$id("conjFeedback").textContent=`Correct answer: ${ans}`;}};$id("nextConj").onclick=()=>{conjCurrent=null;renderConjugation(p)};$id("conjInput").addEventListener("keydown",e=>{if(e.key==="Enter")$id("checkConj").click()});
  }

  function speakKorean(text){if(!("speechSynthesis" in window))return false;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang="ko-KR";u.rate=.82;window.speechSynthesis.speak(u);return true;}
  function renderDictation(p){if(!dictationCurrent)dictationCurrent=dictationPhrases[Math.floor(Math.random()*dictationPhrases.length)];const [ko,en]=dictationCurrent;p.innerHTML=`${toolTabs("dictation")}<div class="plus-panel"><h3>🎧 Dictation</h3><p>Listen, then type the Korean sentence you hear.</p><div class="plus-actions"><button class="plus-btn" id="playDictation">▶ Play Korean</button><button class="plus-btn secondary" id="hintDictation">English hint</button></div><input class="plus-input" id="dictationInput" lang="ko" placeholder="Type what you hear" style="margin-top:12px"><div class="plus-actions"><button class="plus-btn" id="checkDictation">Check</button><button class="plus-btn secondary" id="nextDictation">Next</button></div><div class="feedback-box" id="dictationFeedback"></div></div>`;
    $id("playDictation").onclick=()=>{if(!speakKorean(ko))$id("dictationFeedback").textContent="Speech synthesis is not supported in this browser."};$id("hintDictation").onclick=()=>$id("dictationFeedback").textContent=en;$id("checkDictation").onclick=()=>{const val=$id("dictationInput").value;if(norm(val)===norm(ko)){bumpDaily("dictation",1);markActivity();awardXP(15,"Dictation");$id("dictationFeedback").textContent="Perfect ✓ "+ko;finishMissionBonus();}else{recordAdvancedMistake("dictation|"+ko,"Dictation",ko,"Listening");$id("dictationFeedback").textContent="Correct sentence: "+ko;}};$id("nextDictation").onclick=()=>{dictationCurrent=null;renderDictation(p)};
  }

  function renderRealLife(p){const s=scenarios[realLifeCurrent%scenarios.length],done=!!state.realLife[s.title];p.innerHTML=`${toolTabs("reallife")}<div class="plus-panel"><div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px">${scenarios.map((x,i)=>`<button class="plus-btn secondary" data-scenario="${i}">${x.icon} ${esc(x.title)}</button>`).join("")}</div><h3>${s.icon} ${esc(s.title)} ${done?"✓":""}</h3><p>Real-life mini dialogue · ${esc(s.place)}</p><div class="scenario-dialogue">${s.dialogue.map(([ko,en])=>`<div class="dialogue-line"><b>${esc(ko)}</b><span class="muted">${esc(en)}</span></div>`).join("")}</div><b>${esc(s.q)}</b><div class="choice-grid">${s.options.map((x,i)=>`<button class="choice" data-real-choice="${i}">${esc(x)}</button>`).join("")}</div><div class="feedback-box" id="realFeedback"></div></div>`;
    p.querySelectorAll("[data-scenario]").forEach(b=>b.onclick=()=>{realLifeCurrent=Number(b.dataset.scenario);renderRealLife(p)});p.querySelectorAll("[data-real-choice]").forEach(b=>b.onclick=()=>{const i=Number(b.dataset.realChoice);p.querySelectorAll("[data-real-choice]").forEach(x=>x.disabled=true);if(i===s.a){if(!state.realLife[s.title]){state.realLife[s.title]=true;saveState();awardXP(20,"Real-life: "+s.title);}markActivity();$id("realFeedback").textContent="Correct ✓ Scenario completed.";}else{recordAdvancedMistake("reallife|"+s.title,s.q,s.options[s.a],"Grammar");$id("realFeedback").textContent="Correct answer: "+s.options[s.a];}});
  }

  function renderTopik(p){p.innerHTML=`${toolTabs("topik")}<div class="plus-panel"><h3>🎓 TOPIK Mock Exam</h3><p>20 timed practice questions: vocabulary, grammar, reading and TTS listening. This is practice, not an official TOPIK score.</p><div class="plus-actions"><button class="plus-btn" id="startTopik">Start 20-minute mock</button></div>${state.topikHistory?.length?`<div class="feedback-box">Last score: ${state.topikHistory.at(-1).score}/20 · ${state.topikHistory.at(-1).estimate}</div>`:""}</div>`;$id("startTopik").onclick=()=>startTopik(p);
  }
  function startTopik(p){clearInterval(topikTimer);topikSession={idx:0,answers:Array(20).fill(null),started:Date.now(),remaining:20*60};renderTopikQuestion(p);topikTimer=setInterval(()=>{if(!topikSession)return clearInterval(topikTimer);topikSession.remaining=Math.max(0,20*60-Math.floor((Date.now()-topikSession.started)/1000));const el=$id("topikTimer");if(el)el.textContent=`${String(Math.floor(topikSession.remaining/60)).padStart(2,"0")}:${String(topikSession.remaining%60).padStart(2,"0")}`;if(topikSession.remaining<=0)finishTopik(p)},1000);}
  function renderTopikQuestion(p){const q=topikQuestions[topikSession.idx],sel=topikSession.answers[topikSession.idx];p.innerHTML=`${toolTabs("topik")}<div class="plus-panel"><div class="topik-meta"><b>${q.type} · ${topikSession.idx+1}/20</b><b id="topikTimer">${String(Math.floor(topikSession.remaining/60)).padStart(2,"0")}:${String(topikSession.remaining%60).padStart(2,"0")}</b></div>${q.audio?`<button class="plus-btn" id="topikAudio">▶ Play listening</button>`:""}<h3 style="margin-top:15px">${esc(q.q)}</h3><div class="choice-grid">${q.o.map((x,i)=>`<button class="choice ${sel===i?"selected":""}" data-topik-choice="${i}">${esc(x)}</button>`).join("")}</div><div class="plus-actions"><button class="plus-btn secondary" id="topikPrev" ${topikSession.idx===0?"disabled":""}>Back</button><button class="plus-btn" id="topikNext">${topikSession.idx===19?"Finish":"Next"}</button></div></div>`;bindToolTabs();if(q.audio)$id("topikAudio").onclick=()=>speakKorean(q.audio);p.querySelectorAll("[data-topik-choice]").forEach(b=>b.onclick=()=>{topikSession.answers[topikSession.idx]=Number(b.dataset.topikChoice);renderTopikQuestion(p)});$id("topikPrev").onclick=()=>{topikSession.idx--;renderTopikQuestion(p)};$id("topikNext").onclick=()=>{if(topikSession.idx===19)finishTopik(p);else{topikSession.idx++;renderTopikQuestion(p)}};}
  function finishTopik(p){if(!topikSession)return;clearInterval(topikTimer);const score=topikQuestions.reduce((n,q,i)=>n+(topikSession.answers[i]===q.a?1:0),0),pct=score/20*100;const estimate=pct<40?"TOPIK I · Level 1 practice range":pct<60?"TOPIK I · Level 2 practice range":pct<75?"TOPIK II · Level 3 practice range":pct<88?"TOPIK II · Level 4 practice range":pct<95?"TOPIK II · Level 5 practice range":"TOPIK II · Level 6 practice range";state.topikHistory=state.topikHistory||[];state.topikHistory.push({date:today(),score,estimate});saveState();awardXP(40+score*2,"TOPIK Mock");markActivity();topikSession=null;p.innerHTML=`${toolTabs("topik")}<div class="plus-panel"><h3>Mock complete 🎓</h3><div style="font-size:42px;font-weight:800;color:#654b55">${score}/20</div><p>${estimate}</p><div class="feedback-box">Practice estimate only — official TOPIK scoring and section cutoffs are different.</div><div class="plus-actions"><button class="plus-btn" id="topikAgain">Try again</button></div></div>`;bindToolTabs();$id("topikAgain").onclick=()=>startTopik(p);checkAchievements();}

  function renderJournal(p){const prompt=journalPrompts[Number(today().replaceAll("-",""))%journalPrompts.length],existing=state.journal?.[today()]||"";const recent=Object.entries(state.journal||{}).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,7);p.innerHTML=`${toolTabs("journal")}<div class="plus-panel"><h3>📝 Writing Journal</h3><p>${esc(prompt)}</p><textarea class="plus-textarea" id="journalText" lang="ko" placeholder="Write in Korean…">${esc(existing)}</textarea><div class="plus-actions"><button class="plus-btn" id="saveJournal">Save entry</button><button class="plus-btn secondary" id="journalToAI">Ask AI Tutor to correct it</button></div><div class="feedback-box" id="journalFeedback"></div></div><div class="plus-panel" style="margin-top:12px"><h3>Recent entries</h3>${recent.length?recent.map(([d,t])=>`<div class="journal-entry"><b>${d}</b><div style="white-space:pre-wrap;margin-top:5px">${esc(t.slice(0,400))}${t.length>400?"…":""}</div></div>`).join(""):`<p>No entries yet.</p>`}</div>`;
    $id("saveJournal").onclick=()=>{const t=$id("journalText").value.trim();if(!t)return $id("journalFeedback").textContent="Write something first.";const first=!state.journal[today()];state.journal[today()]=t;saveState();markActivity();if(first)awardXP(20,"Writing Journal");$id("journalFeedback").textContent="Saved ✓ and included in cloud sync when you are signed in.";checkAchievements();};$id("journalToAI").onclick=()=>{const t=$id("journalText").value.trim();if(!t)return;$id("aiTutorDraft")?.remove();activate("aiTutorPlus");setTimeout(()=>{renderTutor();const input=$id("tutorInput");if(input)input.value=`Please correct my Korean journal entry, explain the important mistakes in English, and give me a natural version:\n\n${t}`;},50)};
  }

  function renderMistakes(p){const ms=read("mistakesV2",{}),entries=Object.entries(ms).sort((a,b)=>(b[1]?.count||0)-(a[1]?.count||0));p.innerHTML=`${toolTabs("mistakes")}<div class="plus-panel"><h3>💗 Mistake Book</h3><p>${entries.length} saved mistake${entries.length===1?"":"s"}. Your Home page uses these to detect weak areas.</p>${entries.length?entries.map(([id,m])=>`<div class="mistake-plus"><b>${esc(m.word||m.category||"Mistake")}</b><div>${esc(m.prompt||"")}</div><div class="muted">Correct: ${esc(m.answer||"")} · missed ${Number(m.count||1)}×</div><div class="plus-actions"><button class="plus-btn secondary" data-fix="${encodeURIComponent(id)}">Mark fixed</button></div></div>`).join(""):`<div class="feedback-box">No saved mistakes yet ✨</div>`}<div class="plus-actions">${entries.length?`<button class="plus-btn" id="practiceExistingMistakes">Practice my mistakes</button>`:""}</div></div>`;p.querySelectorAll("[data-fix]").forEach(b=>b.onclick=()=>{const id=decodeURIComponent(b.dataset.fix);if(typeof clearMistake==="function")clearMistake(id);else{const x=read("mistakesV2",{});delete x[id];write("mistakesV2",x)}renderMistakes(p)});if($id("practiceExistingMistakes"))$id("practiceExistingMistakes").onclick=()=>{if(typeof retryMistakes==="function"){retryMistakes();activate("practice")}else openTool("sentence")};}

  function cloudHeaders(token){return {apikey:SUPABASE_KEY,Authorization:`Bearer ${token}`,"Content-Type":"application/json"};}
  async function cloud(path,opts={}){const s=session();if(!s?.access_token)throw new Error("Sign in first from Account.");const r=await fetch(SUPABASE_URL+path,{...opts,headers:{...cloudHeaders(s.access_token),...(opts.headers||{})}});const text=await r.text();let data=null;try{data=text?JSON.parse(text):null}catch{data=text}if(!r.ok)throw new Error(data?.message||data?.error||`Cloud request failed (${r.status})`);return data;}
  function friendCode(uid){const map=read(FRIEND_CODES_KEY,{});if(!map[uid]){const chars="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";map[uid]=Array.from({length:8},()=>chars[Math.floor(Math.random()*chars.length)]).join("");write(FRIEND_CODES_KEY,map);}return map[uid];}
  async function upsertFriendProfile(){const s=session();if(!s?.user?.id)return;const names=read(DISPLAY_NAMES_KEY,{}),name=names[s.user.id]||s.user.email?.split("@")[0]||"Learner",payload={user_id:s.user.id,friend_code:friendCode(s.user.id),display_name:name.slice(0,40),xp:state.xp||0,streak:streak(),weekly_items:weekItems(),updated_at:new Date().toISOString()};await cloud("/rest/v1/friend_profiles?on_conflict=user_id",{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify(payload)});}
  async function renderFriends(){const sec=$id("friendsPlus");if(!sec)return;const s=session();if(!s?.user?.id){sec.innerHTML=`<div class="section-head"><h2>Friends</h2><p>Sign in from Account to use friend codes and shared study stats.</p></div><div class="plus-panel"><button class="plus-btn" id="goAccount">Open Account</button></div>`;$id("goAccount").onclick=()=>activate("accountSection");return;}sec.innerHTML=`<div class="section-head"><h2>Friends</h2><p>Share only your study name, XP, streak and weekly activity — never your email, journal or notes.</p></div><div class="plus-panel">Loading friends…</div>`;try{await upsertFriendProfile();const rel=await cloud(`/rest/v1/friendships?select=id,requester_id,addressee_id,status,created_at&or=(requester_id.eq.${s.user.id},addressee_id.eq.${s.user.id})`);const ids=[...new Set((rel||[]).map(r=>r.requester_id===s.user.id?r.addressee_id:r.requester_id))];let profiles=[];if(ids.length)profiles=await cloud(`/rest/v1/friend_profiles?select=user_id,friend_code,display_name,xp,streak,weekly_items&user_id=in.(${ids.join(",")})`);const pm=Object.fromEntries((profiles||[]).map(x=>[x.user_id,x]));const names=read(DISPLAY_NAMES_KEY,{}),myName=names[s.user.id]||s.user.email?.split("@")[0]||"Learner";sec.innerHTML=`<div class="section-head"><h2>Friends</h2><p>Study together without sharing private learning data.</p></div><div class="two-col"><div class="plus-panel"><h3>Your friend code</h3><div class="code-box">${friendCode(s.user.id)}</div><p>Share this code with a friend.</p><input class="plus-input" id="displayNameInput" maxlength="40" value="${esc(myName)}" placeholder="Study name"><div class="plus-actions"><button class="plus-btn" id="saveDisplayName">Save name</button></div></div><div class="plus-panel"><h3>Add a friend</h3><input class="plus-input" id="friendCodeInput" maxlength="12" placeholder="Friend code"><div class="plus-actions"><button class="plus-btn" id="addFriendBtn">Send request</button></div><div class="feedback-box" id="friendFeedback"></div></div></div><div class="plus-panel" style="margin-top:13px"><h3>Friend requests & friends</h3>${(rel||[]).length?(rel||[]).map(r=>{const other=r.requester_id===s.user.id?r.addressee_id:r.requester_id,pf=pm[other]||{display_name:"Learner",xp:0,streak:0,weekly_items:0},incoming=r.status==="pending"&&r.addressee_id===s.user.id;return `<div class="friend-row"><div><b>${esc(pf.display_name)}</b><div class="muted">${r.status==="accepted"?`${pf.xp} XP · 🔥 ${pf.streak} · ${pf.weekly_items} items this week`:incoming?"Sent you a friend request":"Request pending"}</div></div><div class="plus-actions">${incoming?`<button class="plus-btn" data-accept="${r.id}">Accept</button>`:""}<button class="plus-btn secondary" data-remove="${r.id}">${r.status==="accepted"?"Remove":"Cancel"}</button></div></div>`}).join(""):`<p>No friends yet. Add someone using their code.</p>`}</div>`;
      $id("saveDisplayName").onclick=async()=>{const v=$id("displayNameInput").value.trim();if(!v)return;const n=read(DISPLAY_NAMES_KEY,{});n[s.user.id]=v.slice(0,40);write(DISPLAY_NAMES_KEY,n);await upsertFriendProfile();renderFriends();};
      $id("addFriendBtn").onclick=async()=>{const fb=$id("friendFeedback"),code=$id("friendCodeInput").value.trim().toUpperCase();fb.textContent="Looking up friend…";try{const rows=await cloud(`/rest/v1/friend_profiles?select=user_id,display_name,friend_code&friend_code=eq.${encodeURIComponent(code)}&limit=1`);const target=rows?.[0];if(!target)throw new Error("No user found with that code.");if(target.user_id===s.user.id)throw new Error("That is your own friend code.");const existing=await cloud(`/rest/v1/friendships?select=id,status,requester_id,addressee_id&or=(and(requester_id.eq.${s.user.id},addressee_id.eq.${target.user_id}),and(requester_id.eq.${target.user_id},addressee_id.eq.${s.user.id}))`);if(existing?.length)throw new Error("A friend request already exists between you.");await cloud("/rest/v1/friendships",{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({requester_id:s.user.id,addressee_id:target.user_id,status:"pending"})});fb.textContent=`Request sent to ${target.display_name} ✓`;setTimeout(renderFriends,600);}catch(e){fb.textContent=e.message}};
      sec.querySelectorAll("[data-accept]").forEach(b=>b.onclick=async()=>{await cloud(`/rest/v1/friendships?id=eq.${b.dataset.accept}`,{method:"PATCH",headers:{Prefer:"return=minimal"},body:JSON.stringify({status:"accepted",updated_at:new Date().toISOString()})});renderFriends()});
      sec.querySelectorAll("[data-remove]").forEach(b=>b.onclick=async()=>{await cloud(`/rest/v1/friendships?id=eq.${b.dataset.remove}`,{method:"DELETE"});renderFriends()});
    }catch(e){sec.innerHTML=`<div class="section-head"><h2>Friends</h2></div><div class="plus-panel"><h3>Could not load Friends</h3><p>${esc(e.message)}</p></div>`;}}

  async function callTutor(message){const s=session();if(!s?.access_token)throw new Error("Sign in from Account to use AI Tutor.");const history=(state.tutorChat||[]).slice(-8).map(x=>({role:x.role,content:x.content}));const r=await fetch(`${SUPABASE_URL}/functions/v1/korean-tutor`,{method:"POST",headers:cloudHeaders(s.access_token),body:JSON.stringify({message,history})});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.error||`AI Tutor error (${r.status})`);return data;}
  function renderTutor(){const sec=$id("aiTutorPlus");if(!sec)return;const chat=state.tutorChat||[];sec.innerHTML=`<div class="section-head"><h2>AI Korean Tutor ✨</h2><p>Ask for corrections, grammar explanations, natural Korean, or one-question-at-a-time practice.</p></div><div class="plus-panel"><div class="plus-actions" style="margin-top:0"><button class="plus-btn secondary" data-prompt="Correct this Korean and explain my mistakes: ">Correct Korean</button><button class="plus-btn secondary" data-prompt="Explain this Korean grammar point in clear English with 3 examples: ">Explain grammar</button><button class="plus-btn secondary" data-prompt="Give me one Korean practice question at my level. Wait for my answer before explaining.">Mini quiz</button><button class="plus-btn secondary" data-prompt="Make this sentence sound natural in Korean and explain the nuance: ">Make it natural</button></div><div class="chat-box" id="tutorChat">${chat.length?chat.map(x=>`<div class="chat-msg ${x.role}">${esc(x.content)}</div>`).join(""):`<div class="chat-msg assistant">안녕! Send me Korean you want corrected, ask about grammar, or ask me to quiz you. 🌸</div>`}</div><textarea class="plus-textarea" id="tutorInput" style="min-height:90px" placeholder="Write a message…"></textarea><div class="plus-actions"><button class="plus-btn" id="sendTutor">Send</button><button class="plus-btn secondary" id="clearTutor">Clear chat</button></div><div class="feedback-box" id="tutorStatus">${session()?.access_token?"Signed in · AI requests are protected by your account.":"Sign in from Account to use AI Tutor."}</div></div>`;const box=$id("tutorChat");box.scrollTop=box.scrollHeight;sec.querySelectorAll("[data-prompt]").forEach(b=>b.onclick=()=>{$id("tutorInput").value=b.dataset.prompt;$id("tutorInput").focus()});$id("clearTutor").onclick=()=>{state.tutorChat=[];saveState();renderTutor()};$id("sendTutor").onclick=async()=>{const input=$id("tutorInput"),msg=input.value.trim(),status=$id("tutorStatus");if(!msg)return;input.value="";state.tutorChat=state.tutorChat||[];state.tutorChat.push({role:"user",content:msg});saveState();renderTutor();const st=$id("tutorStatus");if(st)st.textContent="Tutor is thinking…";try{const data=await callTutor(msg);state.tutorChat.push({role:"assistant",content:data.reply});if(state.tutorChat.length>40)state.tutorChat=state.tutorChat.slice(-40);saveState();awardXP(5,"AI Tutor");renderTutor();const x=$id("tutorStatus");if(x)x.textContent=`Answer received ✓${Number.isFinite(data.remaining)?` · ${data.remaining} requests left today`:""}`;}catch(e){state.tutorChat.push({role:"assistant",content:"⚠ "+e.message});saveState();renderTutor();}};}

  async function init(){
    try{if(window.VOCAB_READY)await window.VOCAB_READY;}catch{}
    injectStyle();ensureInitialized();addTab("homePlus","Home");addTab("learnPlus","Learn+");addTab("friendsPlus","Friends");addTab("aiTutorPlus","AI Tutor");renderHome();renderLearnHub();renderTutor();
    setTimeout(()=>{document.querySelectorAll(".tabs .tab").forEach(b=>{if(!b.dataset.advancedBound){b.dataset.advancedBound="1";b.addEventListener("click",()=>{const id=b.dataset.tab;if(["homePlus","learnPlus","friendsPlus","aiTutorPlus"].includes(id))activate(id);});}})},700);
    setInterval(()=>{if(session()?.access_token)upsertFriendProfile().catch(()=>{});},120000);
  }
  setTimeout(init,850);
})();
