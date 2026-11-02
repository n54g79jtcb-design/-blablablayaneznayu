(() => {
  const waitForData = async () => { try { if (window.VOCAB_READY) await window.VOCAB_READY; } catch {} };
  const DAY = 86400000;
  const SRS_KEY="srsV1", NOTES_KEY="wordNotesV1", DECKS_KEY="customDecksV1", SHADOW_KEY="shadowDoneV1", THEME_KEY="moodThemeV1";
  let srs=LS.get(SRS_KEY,{}), notes=LS.get(NOTES_KEY,{}), decks=LS.get(DECKS_KEY,{}), shadowDone=LS.get(SHADOW_KEY,{});
  const save=()=>{LS.set(SRS_KEY,srs);LS.set(NOTES_KEY,notes);LS.set(DECKS_KEY,decks);LS.set(SHADOW_KEY,shadowDone)};
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  const dateSeed=()=>Number(todayKey().replaceAll("-",""));
  const seeded=(arr,n)=>{let seed=dateSeed()||1,a=[...arr];for(let i=a.length-1;i>0;i--){seed=(seed*9301+49297)%233280;const j=Math.floor(seed/233280*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,n)};
  const dueDate=days=>new Date(Date.now()+days*DAY).toISOString().slice(0,10);

  function srsState(item){const k=wordKey(item);return srs[k]||(srs[k]={interval:0,due:todayKey(),streak:0});}
  function schedule(item,correct){if(!item)return;const st=srsState(item);if(correct){st.streak++;st.interval=st.streak===1?1:st.streak===2?3:st.streak===3?7:Math.min(60,Math.max(14,Math.round(st.interval*1.8)));}else{st.streak=0;st.interval=1;}st.due=dueDate(st.interval);save();}
  function markKnown(item){const st=getState(item);st.status="learned";st.correct=Math.max(st.correct||0,3);saveWordState();const sr=srsState(item);sr.streak=Math.max(sr.streak,4);sr.interval=30;sr.due=dueDate(30);save();renderWords();renderProgress();}

  const oldUpdate=typeof updateWordResult==="function"?updateWordResult:null;
  if(oldUpdate){window.updateWordResult=updateWordResult=function(item,correct){oldUpdate(item,correct);schedule(item,correct);};}

  const grammarPlus=[
    {level:"A1",form:"-고 싶다",use:"want to",example:"한국에 가고 싶어요.",translation:"I want to go to Korea."},
    {level:"A1",form:"-고 있다",use:"be doing",example:"지금 공부하고 있어요.",translation:"I am studying now."},
    {level:"A1",form:"-(으)세요",use:"polite request / command",example:"여기 앉으세요.",translation:"Please sit here."},
    {level:"A1",form:"-아/어서",use:"because / and then",example:"피곤해서 일찍 잤어요.",translation:"I was tired, so I slept early."},
    {level:"A2",form:"-(으)ㄹ 수 있다",use:"can / be able to",example:"한국어로 말할 수 있어요.",translation:"I can speak in Korean."},
    {level:"A2",form:"-아/어 보다",use:"try doing",example:"한복을 입어 봤어요.",translation:"I tried wearing hanbok."},
    {level:"A2",form:"-(으)면",use:"if / when",example:"시간이 있으면 만나요.",translation:"If you have time, let's meet."},
    {level:"A2",form:"-지만",use:"but / although",example:"비싸지만 예뻐요.",translation:"It is expensive, but pretty."},
    {level:"A2",form:"-(으)ㄹ 것 같다",use:"it seems / I think",example:"비가 올 것 같아요.",translation:"I think it will rain."},
    {level:"B1",form:"-는 동안",use:"while / during",example:"한국에 사는 동안 많이 배웠어요.",translation:"I learned a lot while living in Korea."},
    {level:"B1",form:"-게 되다",use:"come to / end up",example:"한국에서 공부하게 됐어요.",translation:"I came to study in Korea."},
    {level:"B1",form:"-(으)ㄴ/는 편이다",use:"tend to / rather",example:"저는 일찍 자는 편이에요.",translation:"I tend to sleep early."},
    {level:"B1",form:"-느라고",use:"because of doing (negative result)",example:"공부하느라고 못 잤어요.",translation:"I couldn't sleep because I was studying."},
    {level:"B1",form:"-(으)ㄹ 뿐만 아니라",use:"not only... but also",example:"예쁠 뿐만 아니라 편해요.",translation:"It is not only pretty but also comfortable."},
    {level:"B2",form:"-(으)ㄴ/는 반면에",use:"whereas / on the other hand",example:"도시는 편리한 반면에 복잡해요.",translation:"Cities are convenient, whereas they are crowded."},
    {level:"B2",form:"-(으)ㄹ수록",use:"the more... the more",example:"공부할수록 재미있어요.",translation:"The more I study, the more interesting it gets."},
    {level:"B2",form:"-기는커녕",use:"far from / let alone",example:"쉬기는커녕 더 바빴어요.",translation:"Far from resting, I was even busier."},
    {level:"B2",form:"-(으)ㄴ/는 데다가",use:"in addition to",example:"비싼 데다가 멀어요.",translation:"It is expensive and, on top of that, far away."}
  ];
  const baseLevels={"-기 전에":"A2","-(으)ㄴ 후에":"A2","-다가":"B1","-(으)려고 하다":"A2","-기로 하다":"A2","-아/어야 되다":"A2"};
  grammar.forEach(g=>g.level=g.level||baseLevels[g.form]||"A2");
  grammarPlus.forEach(g=>{if(!grammar.some(x=>x.form===g.form))grammar.push(g)});
  grammarPlus.forEach(g=>{if(!grammarQuestionBank.some(x=>x.correct===g.form))grammarQuestionBank.push({prompt:`Choose the grammar meaning “${g.use}”.`,correct:g.form,options:shuffle([g.form,...sample(grammar.filter(x=>x.form!==g.form).map(x=>x.form),3)]),detail:g.level})});

  const slang=[
    ["대박","awesome / wow"],["헐","no way / omg"],["진짜?","really?"],["완전","totally / super"],["꿀잼","super fun"],["노잼","boring / no fun"],["웃겨","that's funny"],["미쳤다","that's crazy / insane"],["뭐 해?","what are you doing?"],["어디야?","where are you?"],["보고 싶어","I miss you"],["잘 자","sleep well"],["조심히 가","get home safely"],["연락해","text/call me"],["답장해 줘","reply to me"],["알겠어","got it / okay"],["몰라","I don't know"],["왜 이래?","what's with you?"],["괜찮아?","are you okay?"],["ㅋㅋㅋ","lol"],["ㅎㅎ","hehe / soft laugh"],["ㅠㅠ","crying / sad"],["ㄱㄱ","let's go / go go"],["ㅇㅋ","okay"],["ㄴㄴ","no no"],["ㅇㅇ","yeah / yep"],["잠깐만","wait a second"],["아 맞다","oh right!"],["그니까","exactly / I know, right"],["뭔 소리야?","what are you talking about?"]
  ];
  const shadowPhrases=["오늘 뭐 했어?","지금 어디야?","나중에 연락할게.","괜찮아, 천천히 해.","진짜 보고 싶었어.","오늘 너무 피곤해.","이거 어떻게 하는 거야?","시간 되면 같이 가자.","생각보다 괜찮은 것 같아.","한국어를 더 자연스럽게 말하고 싶어요."];

  const particleBank=[
    ["저__ 학생이에요.","는",["는","가","를","에"]],["친구__ 만나요.","를",["를","가","에","에서"]],["학교__ 가요.","에",["에","에서","를","는"]],["카페__ 공부해요.","에서",["에서","에","를","가"]],["비__ 와요.","가",["가","를","는","에"]],["한국 음식__ 좋아해요.","을",["을","이","에","에서"]],["저__ 한국어를 공부해요.","는",["는","를","가","에서"]],["책상 위__ 책이 있어요.","에",["에","에서","을","는"]],["서울__ 살아요.","에",["에","에서","를","가"]],["도서관__ 책을 읽어요.","에서",["에서","에","가","를"]],["제가 커피__ 샀어요.","를",["를","가","는","에"]],["친구__ 전화가 왔어요.","에게서",["에게서","에게","에서","으로"]]
  ];
  const counterBank=[
    ["사과 세 __","개",["개","명","잔","권"]],["학생 두 __","명",["명","개","병","대"]],["커피 한 __","잔",["잔","병","권","번"]],["물 두 __","병",["병","잔","명","벌"]],["책 네 __","권",["권","개","대","장"]],["차 한 __","대",["대","명","권","켤레"]],["종이 다섯 __","장",["장","권","잔","병"]],["신발 한 __","켤레",["켤레","벌","개","장"]],["옷 두 __","벌",["벌","켤레","명","대"]],["세 __ 갔어요. (three times)","번",["번","개","시","명"]],["오후 세 __","시",["시","분","번","개"]],["스무 __ 기다렸어요. (minutes)","분",["분","시","번","장"]]
  ];
  const topikBank=[
    ["‘결정하다’와 가장 가까운 뜻은?","decide",["decide","forget","repeat","borrow"]],
    ["빈칸: 시간이 ___ 같이 점심을 먹어요.","있으면",["있으면","있지만","있다가","있기로"]],
    ["‘오히려’의 뜻으로 가장 알맞은 것은?","rather / on the contrary",["rather / on the contrary","slowly","already","especially"]],
    ["빈칸: 비가 많이 와서 길이 많이 ___.","막혔어요",["막혔어요","열렸어요","말랐어요","줄었어요"]],
    ["‘가능성’의 뜻은?","possibility",["possibility","responsibility","relationship","experience"]],
    ["상황: 약속 시간에 늦을 것 같아요. 가장 자연스러운 말은?","조금 늦을 것 같아요. 미안해요.",["조금 늦을 것 같아요. 미안해요.","밥을 먹기로 했어요.","날씨가 좋아졌어요.","이름이 뭐예요?"]],
    ["‘반면에’는 어떤 관계를 나타내요?","contrast",["contrast","cause","sequence","purpose"]],
    ["빈칸: 한국어는 공부하면 할___ 더 재미있어요.","수록",["수록","뿐","다가","전에"]],
    ["‘지원하다’의 뜻으로 알맞은 것은?","to apply / support",["to apply / support","to cancel","to translate","to repair"]],
    ["‘환경을 보호하다’의 뜻은?","protect the environment",["protect the environment","change the schedule","pay the bill","take medicine"]],
    ["빈칸: 수업이 끝난 ___ 친구를 만났어요.","후에",["후에","전에","수록","커녕"]],
    ["‘적응하다’의 뜻은?","to adapt",["to adapt","to refuse","to deliver","to compare"]]
  ];
  const readings=[
    {text:"민지는 이번 학기부터 한국에서 대학 생활을 시작했습니다. 처음에는 수업 내용을 이해하기 어려웠지만, 매일 복습하고 모르는 표현을 따로 정리하면서 점점 익숙해졌습니다.",qs:[["민지가 처음에 어려워한 것은 무엇입니까?","수업 내용을 이해하는 것",["수업 내용을 이해하는 것","기숙사를 찾는 것","친구를 만나는 것","음식을 주문하는 것"]],["민지는 어떻게 공부했습니까?","매일 복습하고 표현을 정리했다",["매일 복습하고 표현을 정리했다","수업을 자주 빠졌다","한국어 공부를 그만뒀다","시험만 공부했다"]]]},
    {text:"최근에는 배달 대신 직접 장을 보고 요리하는 사람이 늘고 있습니다. 돈을 절약할 수 있을 뿐만 아니라 자신이 먹는 재료를 직접 고를 수 있다는 장점이 있기 때문입니다.",qs:[["직접 요리하는 장점이 아닌 것은?","배달 시간이 더 짧다",["배달 시간이 더 짧다","돈을 절약할 수 있다","재료를 직접 고를 수 있다","식생활을 관리할 수 있다"]],["사람들이 직접 요리하는 이유는 무엇입니까?","여러 장점이 있기 때문이다",["여러 장점이 있기 때문이다","식당이 모두 문을 닫아서","요리가 항상 쉬워서","배달이 불법이라서"]]]},
    {text:"지수는 중요한 약속이 있는 날에는 출발하기 전에 교통 상황을 확인합니다. 지하철이 지연되거나 길이 막힐 수도 있기 때문에 평소보다 조금 일찍 집에서 나갑니다.",qs:[["지수는 왜 일찍 출발합니까?","늦을 가능성을 줄이기 위해",["늦을 가능성을 줄이기 위해","운동을 하기 위해","친구를 피하기 위해","쇼핑을 하기 위해"]],["출발 전에 무엇을 확인합니까?","교통 상황",["교통 상황","날씨만","메뉴","숙제"]]]},
    {text:"온라인 수업은 장소에 상관없이 들을 수 있다는 점에서 편리합니다. 반면에 집중하기 어렵거나 다른 학생들과 자연스럽게 대화할 기회가 적다는 단점도 있습니다.",qs:[["글의 중심 내용은 무엇입니까?","온라인 수업의 장단점",["온라인 수업의 장단점","학교의 역사","인터넷 요금","친구 사귀는 방법"]],["온라인 수업의 단점은 무엇입니까?","집중과 교류가 어려울 수 있다",["집중과 교류가 어려울 수 있다","어디서나 들을 수 있다","시간을 절약한다","교통비가 들지 않는다"]]]}
  ];

  function qChoice(category,id,label,prompt,correct,options,detail=""){return {type:"choice",category,id,label,prompt,correct,options:shuffle(options),detail};}
  function vocabQs(items,len=10){const pool=vocab.map(v=>v.en);return sample(items,len).map(item=>qChoice("vocab",`plus:${wordKey(item)}`,`What does ${item.ko} mean?`,item.ko,item.en,uniqueOptions(item.en,pool),`${item.level} · ${item.topic}`));}
  function listeningQs(len=10){return sample(vocab.filter(v=>v.ko.length<18),len).map(item=>({...qChoice("vocab",`listen:${wordKey(item)}`,"Listen and choose the meaning.","🔊 Listen",item.en,uniqueOptions(item.en,vocab.map(v=>v.en)),`${item.level} · Listening`),item,audioText:item.ko}));}
  function particleQs(){return sample(particleBank,10).map((x,i)=>qChoice("grammar",`particle:${i}:${x[0]}`,"Choose the correct particle.",x[0],x[1],x[2],"Particles trainer"));}
  function counterQs(){return sample(counterBank,10).map((x,i)=>qChoice("grammar",`counter:${i}:${x[0]}`,"Choose the correct counter.",x[0],x[1],x[2],"Counters trainer"));}
  function topikQs(){return sample(topikBank,10).map((x,i)=>qChoice("topik",`topik:${i}:${x[0]}`,"TOPIK-style question",x[0],x[1],x[2],"TOPIK practice"));}
  function readingQs(){const r=sample(readings,2);return r.flatMap((p,pi)=>p.qs.map((x,qi)=>qChoice("reading",`reading:${pi}:${qi}:${x[0]}`,p.text,x[0],x[1],x[2],"Mini reading")));}
  function dueWords(){const today=todayKey();const due=vocab.filter(v=>{const st=srs[wordKey(v)];return st&&st.due<=today});if(due.length)return due;const learning=vocab.filter(v=>getState(v).status==="learning"||getState(v).wrong>0);return learning.length?learning:sample(vocab,25);}
  function randomChallenge(){const a=makeVocabQuestions("ko-en",5),b=makeGrammarQuestions(3),c=makeTenseQuestions(3),d=particleQs().slice(0,3),e=counterQs().slice(0,2),f=listeningQs(4);return shuffle([...a,...b,...c,...d,...e,...f]).slice(0,20)}

  const oldRQ=typeof renderQuestion==="function"?renderQuestion:null;
  if(oldRQ){window.renderQuestion=renderQuestion=function(){oldRQ();const q=questions[qIndex];if(q?.audioText){const w=$("quizWord");w.innerHTML=`<button type="button" class="listen-big" id="listenReplay">🔊 Listen again</button>`;$("listenReplay").onclick=()=>window.speakKorean?window.speakKorean(q.audioText):speakFallback(q.audioText);setTimeout(()=>{if(window.speakKorean)window.speakKorean(q.audioText);else speakFallback(q.audioText)},120);}};}
  function speakFallback(t,slow=false){if(!("speechSynthesis" in window))return;const u=new SpeechSynthesisUtterance(t);u.lang="ko-KR";u.rate=slow?.68:.86;speechSynthesis.cancel();speechSynthesis.speak(u)}

  function exampleFor(item){
    const curated={"사랑":"사랑은 서로를 이해하려는 마음이기도 해요.","약속":"오늘 친구와 약속이 있어요.","공부하다":"저는 매일 한국어를 공부해요.","기다리다":"역에서 친구를 기다리고 있어요.","좋아하다":"저는 한국 음식을 좋아해요.","연락하다":"집에 도착하면 연락해 주세요.","걱정하다":"너무 걱정하지 마세요.","결정하다":"이번 주에 일정을 결정할 거예요.","경험":"한국에서 새로운 경험을 많이 했어요.","적응하다":"새로운 생활에 조금씩 적응하고 있어요.","대박":"대박, 진짜 예쁘다!","헐":"헐, 나 그거 몰랐어."};
    return curated[item.ko]||`오늘 “${item.ko}”라는 단어를 배웠어요.`;
  }
  function usageLabel(item){if(item.topic==="Useful Expressions"||slang.some(x=>x[0]===item.ko))return "Everyday";if(["B1","B2"].includes(item.level)&&["Nouns","Function Words","Expanded Vocabulary"].includes(item.topic))return "Textbook";return "Standard";}

  const oldRW=typeof window.renderWords==="function"?window.renderWords:null;
  function enhanceCards(){document.querySelectorAll(".word-card").forEach(card=>{if(card.dataset.plusDone)return;card.dataset.plusDone="1";const ko=card.querySelector(".word-ko")?.textContent?.trim();const item=vocab.find(v=>v.ko===ko);if(!item)return;const extra=document.createElement("div");extra.className="word-plus-extra";extra.innerHTML=`<div class="usage-line"><span>${usageLabel(item)}</span><span>${item.level}</span></div><div class="example-ko">${esc(exampleFor(item))}</div>${notes[wordKey(item)]?`<div class="note-preview">♡ ${esc(notes[wordKey(item)])}</div>`:""}`;card.appendChild(extra);const actions=card.querySelector(".card-actions");if(actions){const known=document.createElement("span");known.className="plus-chip";known.textContent="✓ Know";known.title="I know this";known.onclick=e=>{e.preventDefault();e.stopPropagation();markKnown(item)};const note=document.createElement("span");note.className="plus-chip";note.textContent="✎ Note";note.onclick=e=>{e.preventDefault();e.stopPropagation();const k=wordKey(item),v=prompt(`Note for ${item.ko}`,notes[k]||"");if(v===null)return;if(v.trim())notes[k]=v.trim();else delete notes[k];save();renderWords()};const deck=document.createElement("span");deck.className="plus-chip";deck.textContent="＋ Deck";deck.onclick=e=>{e.preventDefault();e.stopPropagation();const name=prompt("Deck name",Object.keys(decks)[0]||"My words");if(!name?.trim())return;const n=name.trim();decks[n]=decks[n]||[];const k=wordKey(item);if(!decks[n].includes(k))decks[n].push(k);save();renderStudyPlus()};actions.append(known,note,deck)}card.addEventListener("click",()=>setTimeout(()=>{extra.classList.toggle("show",card.querySelector(".word-en")?.textContent!=="Tap to reveal")},0));});}
  if(oldRW){window.renderWords=renderWords=function(...args){const r=oldRW.apply(this,args);enhanceCards();return r;};setTimeout(()=>renderWords(),150)}

  function renderGrammar(level="All"){
    const list=$("grammarList");if(!list)return;list.innerHTML="";const controls=document.createElement("div");controls.className="grammar-levels";["All","A1","A2","B1","B2"].forEach(l=>{const b=document.createElement("button");b.textContent=l;b.className=l===level?"active":"";b.onclick=()=>renderGrammar(l);controls.appendChild(b)});list.appendChild(controls);grammar.filter(g=>level==="All"||g.level===level).forEach(g=>{const d=document.createElement("details");d.className="grammar-card";d.innerHTML=`<summary><span class="g-level">${g.level||"A2"}</span> ${esc(g.form)} <span class="grammar-use">— ${esc(g.use)}</span></summary><div class="example">${esc(g.example)}</div><div class="translation">${esc(g.translation)}</div>`;list.appendChild(d)});
  }

  function achievementData(){const learned=vocab.filter(v=>getState(v).status==="learned").length,total=stats.correct+stats.wrong,acc=total?Math.round(stats.correct/total*100):0,st=streakCount();return [
    ["First Bloom","Learn 10 words",learned>=10],["Pink Hundred","Learn 100 words",learned>=100],["Vocabulary Angel","Learn 500 words",learned>=500],["Seven Days","7-day streak",st>=7],["Accuracy Glow","Reach 90% accuracy",total>=20&&acc>=90],["Test Lover","Complete 20 tests",stats.tests>=20],["3000 Era","Open the 3,000-word library",vocab.length>=3000]
  ]}
  function deckCards(){const entries=Object.entries(decks);if(!entries.length)return `<div class="empty">No custom decks yet. Use “＋ Deck” on any vocabulary card.</div>`;return `<div class="deck-grid">${entries.map(([name,keys])=>`<div class="plus-card"><h3>${esc(name)}</h3><p>${keys.length} words</p><button class="soft-action" data-deck-test="${encodeURIComponent(name)}">Test deck</button></div>`).join("")}</div>`}
  function wordOfDay(){return seeded(vocab,5)}

  function runCustom(kind){activateTab("practice");if(kind==="srs")startTest(vocabQs(dueWords(),15),"Spaced Review");if(kind==="listening")startTest(listeningQs(),"Listening Test");if(kind==="particles")startTest(particleQs(),"Particles Trainer");if(kind==="counters")startTest(counterQs(),"Counters Trainer");if(kind==="topik")startTest(topikQs(),"TOPIK Mode");if(kind==="reading")startTest(readingQs(),"Mini Reading");if(kind==="random")startTest(randomChallenge(),"Random Challenge");}

  function renderStudyPlus(){
    const sec=$("studyPlusSection");if(!sec)return;const wotd=wordOfDay(),ach=achievementData();
    sec.innerHTML=`<div class="section-head plus-head"><div><div class="eyebrow">✧ angel study room ✧</div><h2>Study+</h2><p>Smart review, listening, real Korean and custom practice.</p></div><button class="soft-action" id="themeToggle">${document.body.classList.contains("night-pink")?"☀ Pearl":"☾ Moon"}</button></div>
    <div class="plus-hero"><div><span class="mini-label">WORD OF THE DAY · 5</span><h3>Today’s little bouquet</h3><p>Five words selected from your library for today.</p></div><div class="daily-words">${wotd.map(v=>`<button data-wotd="${encodeURIComponent(wordKey(v))}"><b>${esc(v.ko)}</b><span>${esc(v.en)}</span><small>${v.level}</small></button>`).join("")}</div></div>
    <div class="plus-grid">
      <button class="feature-card" data-run="srs"><b>✦ Spaced Review</b><span>Review words exactly when they are due.</span></button>
      <button class="feature-card" data-run="listening"><b>🔊 Listening Test</b><span>Hear Korean without seeing the word.</span></button>
      <button class="feature-card" id="shadowBtn"><b>♡ Shadowing</b><span>Listen, repeat and copy natural rhythm.</span></button>
      <button class="feature-card" data-run="topik"><b>TOPIK Mode</b><span>Meaning, cloze and situation questions.</span></button>
      <button class="feature-card" data-run="reading"><b>Mini Reading</b><span>Short texts with comprehension questions.</span></button>
      <button class="feature-card" data-run="particles"><b>은/는 · 이/가</b><span>Particles trainer.</span></button>
      <button class="feature-card" data-run="counters"><b>명 · 개 · 잔</b><span>Korean counters trainer.</span></button>
      <button class="feature-card" data-run="random"><b>Random Challenge · 20</b><span>Vocab + grammar + tenses + listening.</span></button>
    </div>
    <div class="plus-section"><div class="section-head"><h2 style="font-size:26px">Texting & Slang</h2><p>Everyday Korean you actually see in chats.</p></div><div class="slang-grid">${slang.map(x=>`<button data-slang="${esc(x[0])}"><b>${esc(x[0])}</b><span>${esc(x[1])}</span><small>🔊</small></button>`).join("")}</div></div>
    <div class="plus-section" id="shadowPanel" hidden><div class="section-head"><h2 style="font-size:26px">Shadowing</h2><p>Play → repeat aloud → mark it done.</p></div><div class="shadow-list">${shadowPhrases.map((p,i)=>`<div class="shadow-row"><div><b>${esc(p)}</b><small>${shadowDone[p]?"✓ repeated":"not practiced yet"}</small></div><div><button data-shadow-hear="${i}">🔊</button><button data-shadow-slow="${i}">🐢</button><button data-shadow-done="${i}">${shadowDone[p]?"✓":"Done"}</button></div></div>`).join("")}</div></div>
    <div class="plus-section"><div class="section-head"><h2 style="font-size:26px">Achievements</h2><p>Little milestones from your actual progress.</p></div><div class="achievement-grid">${ach.map(a=>`<div class="achievement ${a[2]?"unlocked":""}"><span>${a[2]?"✦":"◇"}</span><b>${a[0]}</b><small>${a[1]}</small></div>`).join("")}</div></div>
    <div class="plus-section"><div class="section-head"><h2 style="font-size:26px">Custom Decks</h2><p>Create decks from any vocabulary card.</p></div>${deckCards()}</div>`;
    sec.querySelectorAll("[data-run]").forEach(b=>b.onclick=()=>runCustom(b.dataset.run));
    sec.querySelectorAll("[data-wotd]").forEach(b=>b.onclick=()=>{const k=decodeURIComponent(b.dataset.wotd),v=vocab.find(x=>wordKey(x)===k);if(v){window.speakKorean?window.speakKorean(v.ko):speakFallback(v.ko);}});
    sec.querySelectorAll("[data-slang]").forEach(b=>b.onclick=()=>{const t=b.dataset.slang;window.speakKorean?window.speakKorean(t):speakFallback(t)});
    $("shadowBtn").onclick=()=>{$("shadowPanel").hidden=!$("shadowPanel").hidden;if(!$("shadowPanel").hidden)$("shadowPanel").scrollIntoView({behavior:"smooth",block:"start"})};
    sec.querySelectorAll("[data-shadow-hear]").forEach(b=>b.onclick=()=>{const p=shadowPhrases[+b.dataset.shadowHear];window.speakKorean?window.speakKorean(p):speakFallback(p)});
    sec.querySelectorAll("[data-shadow-slow]").forEach(b=>b.onclick=()=>{const p=shadowPhrases[+b.dataset.shadowSlow];window.speakKorean?window.speakKorean(p,true):speakFallback(p,true)});
    sec.querySelectorAll("[data-shadow-done]").forEach(b=>b.onclick=()=>{const p=shadowPhrases[+b.dataset.shadowDone];shadowDone[p]=true;save();b.textContent="✓";b.closest(".shadow-row").querySelector("small").textContent="✓ repeated";bumpPractice()});
    sec.querySelectorAll("[data-deck-test]").forEach(b=>b.onclick=()=>{const name=decodeURIComponent(b.dataset.deckTest),keys=decks[name]||[],items=keys.map(k=>vocab.find(v=>wordKey(v)===k)).filter(Boolean);if(items.length){activateTab("practice");startTest(vocabQs(items,Math.min(10,items.length)),`Deck · ${name}`)}});
    $("themeToggle").onclick=()=>{document.body.classList.toggle("night-pink");localStorage.setItem(THEME_KEY,document.body.classList.contains("night-pink")?"night":"pearl");renderStudyPlus()};
  }

  function addUI(){
    const style=document.createElement("style");style.textContent=`
      .tabs{grid-template-columns:repeat(7,1fr)}.plus-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.plus-hero,.plus-section{border:1px solid var(--border);border-radius:26px;background:rgba(255,255,255,.42);box-shadow:0 18px 50px rgba(145,91,113,.08);padding:24px;margin-bottom:16px}.plus-hero{display:grid;grid-template-columns:.7fr 1.3fr;gap:18px;align-items:center}.plus-hero h3{font-size:28px;margin:8px 0}.mini-label{font-size:11px;letter-spacing:.16em;color:var(--muted)}.daily-words{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.daily-words button,.slang-grid button{border:1px solid var(--border);background:rgba(255,255,255,.52);border-radius:16px;padding:14px;text-align:left}.daily-words b,.slang-grid b{display:block;font-size:18px}.daily-words span,.slang-grid span{display:block;color:var(--muted);font-size:12px;margin-top:5px}.daily-words small,.slang-grid small{display:block;margin-top:8px;color:#9b6680}.plus-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}.feature-card{min-height:125px;border:1px solid var(--border);border-radius:20px;background:rgba(255,255,255,.5);padding:18px;text-align:left}.feature-card b{display:block;font-size:18px;margin-bottom:8px}.feature-card span{color:var(--muted);line-height:1.4}.soft-action{border:1px solid var(--border);background:rgba(255,255,255,.55);border-radius:999px;min-height:40px;padding:0 15px}.slang-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px}.shadow-list{display:grid;gap:9px}.shadow-row{display:flex;align-items:center;justify-content:space-between;gap:12px;border:1px solid var(--border);border-radius:16px;padding:12px 14px;background:rgba(255,255,255,.38)}.shadow-row small{display:block;color:var(--muted);margin-top:4px}.shadow-row button{border:1px solid var(--border);background:rgba(255,255,255,.55);border-radius:10px;min-height:34px;padding:0 10px}.achievement-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.achievement{border:1px solid var(--border);border-radius:16px;padding:16px;opacity:.48}.achievement.unlocked{opacity:1;background:linear-gradient(145deg,rgba(255,255,255,.72),rgba(239,198,213,.5));box-shadow:inset 0 1px rgba(255,255,255,.8)}.achievement span{font-size:22px}.achievement b,.achievement small{display:block}.achievement small{color:var(--muted);margin-top:5px}.deck-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px}.plus-card{border:1px solid var(--border);border-radius:16px;padding:16px;background:rgba(255,255,255,.4)}.plus-card h3{margin:0 0 6px}.word-plus-extra{display:none;text-align:left;margin-top:14px;padding:12px;border-radius:13px;background:rgba(255,255,255,.35);border:1px solid rgba(220,167,187,.35);font-size:13px}.word-plus-extra.show{display:block}.usage-line{display:flex;gap:8px;margin-bottom:7px}.usage-line span{font-size:10px;text-transform:uppercase;letter-spacing:.08em;padding:4px 7px;border-radius:999px;background:rgba(220,167,187,.25)}.example-ko{line-height:1.5}.note-preview{margin-top:6px;color:var(--muted)}.plus-chip{font-size:10px;border:1px solid var(--border);border-radius:8px;padding:5px 7px;background:rgba(255,255,255,.45);white-space:nowrap}.card-actions{gap:5px;flex-wrap:wrap}.word-card{padding-bottom:82px}.listen-big{border:1px solid var(--border);border-radius:18px;background:rgba(255,255,255,.5);padding:18px 24px;font-size:20px}.grammar-levels{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}.grammar-levels button{border:1px solid var(--border);border-radius:999px;background:rgba(255,255,255,.42);min-height:38px;padding:0 14px}.grammar-levels button.active{background:var(--accent);color:#fff}.g-level{font-size:11px;padding:4px 7px;border-radius:999px;background:rgba(220,167,187,.24);margin-right:6px}.night-pink{--bg:#241a20!important;--panel:#33252d!important;--card:#382832!important;--text:#fff5f8!important;--muted:#d8bac6!important;--border:#65495a!important;--soft:#513545!important;--accent:#dca7bb!important;background:radial-gradient(circle at 15% 0%,#523849 0,transparent 33%),radial-gradient(circle at 90% 10%,#43303a 0,transparent 30%),#241a20!important}.night-pink .panel,.night-pink .word-card,.night-pink .grammar-card,.night-pink .tense-card,.night-pink .quiz-box,.night-pink .plus-hero,.night-pink .plus-section,.night-pink .feature-card,.night-pink .daily-words button,.night-pink .slang-grid button,.night-pink .plus-card{background:rgba(66,45,57,.84)!important;color:var(--text)!important}.night-pink input{background:#302129!important;color:#fff!important}.night-pink .word-plus-extra,.night-pink .shadow-row{background:rgba(255,255,255,.06)}
      @media(max-width:980px){.plus-grid{grid-template-columns:repeat(2,1fr)}.daily-words,.slang-grid{grid-template-columns:repeat(3,1fr)}.achievement-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:760px){.tabs{grid-template-columns:repeat(2,1fr)}.plus-hero{grid-template-columns:1fr}.daily-words,.slang-grid{grid-template-columns:repeat(2,1fr)}.plus-grid,.deck-grid{grid-template-columns:1fr}.shadow-row{align-items:flex-start;flex-direction:column}.achievement-grid{grid-template-columns:1fr 1fr}.plus-head{align-items:center}}
    `;document.head.appendChild(style);
    if(localStorage.getItem(THEME_KEY)==="night")document.body.classList.add("night-pink");
    const nav=document.querySelector(".tabs");if(nav&&!nav.querySelector('[data-tab="studyPlusSection"]')){const b=document.createElement("button");b.className="tab";b.dataset.tab="studyPlusSection";b.textContent="Study+";const progress=nav.querySelector('[data-tab="progressSection"]');nav.insertBefore(b,progress||null);b.onclick=()=>{activateTab("studyPlusSection");renderStudyPlus()}}
    if(!$("studyPlusSection")){const s=document.createElement("section");s.className="section";s.id="studyPlusSection";document.querySelector("main.app").appendChild(s)}
    renderGrammar();renderStudyPlus();
  }

  waitForData().then(()=>setTimeout(addUI,220));
})();