(() => {
  const $ = id => document.getElementById(id);
  const hasHangul = text => /[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(text || "");

  function koreanVoice() {
    if (!("speechSynthesis" in window)) return null;
    const voices = speechSynthesis.getVoices();
    return voices.find(v => /^ko(-|_)/i.test(v.lang)) || voices.find(v => /korean/i.test(v.name)) || null;
  }

  window.speakKorean = function(text, slow = false) {
    if (!text || !("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR";
    u.rate = slow ? 0.68 : 0.86;
    u.pitch = 1;
    const v = koreanVoice();
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  };

  if ("speechSynthesis" in window) {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => koreanVoice();
  }

  const extraStyle = document.createElement("style");
  extraStyle.textContent = `
    .tabs{grid-template-columns:repeat(6,1fr)}
    .speak-btn{width:38px;height:34px;border:1px solid var(--border);border-radius:10px;background:transparent;display:inline-flex;align-items:center;justify-content:center;font-size:16px;color:var(--text)}
    .speak-btn:hover{background:var(--soft);border-color:#2a3b65}
    .quiz-speak-row{display:flex;gap:9px;margin:-4px 0 16px}.quiz-speak-row[hidden]{display:none}
    .hangul-tabs{display:flex;flex-wrap:wrap;gap:9px;margin-bottom:18px}.hangul-tabs button{min-height:42px;border:1px solid var(--border);border-radius:999px;background:transparent;padding:0 15px}.hangul-tabs button.active{background:var(--soft);border-color:#2a3b65}
    .hangul-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(118px,1fr));gap:10px}.hangul-card{border:1px solid var(--border);background:var(--card);border-radius:18px;padding:16px;text-align:center;min-height:120px}.hangul-letter{font-size:40px;font-weight:800;line-height:1.1}.hangul-roman{color:var(--muted);font-size:14px;margin-top:7px}.hangul-example{margin-top:10px;font-size:18px}.hangul-card button,.syllable-btn{margin-top:10px;min-height:34px;border:1px solid var(--border);border-radius:10px;background:transparent;padding:0 10px}
    .hangul-note{border:1px solid var(--border);border-radius:18px;background:#0d0d0d;padding:20px;margin:14px 0}.hangul-note h3{margin:0 0 8px}.hangul-note p{margin:7px 0;color:var(--muted);line-height:1.55}.syllable-row{display:flex;flex-wrap:wrap;gap:9px;margin-top:12px}.syllable-btn{font-size:20px;min-width:54px}
    .hangul-quiz{border:1px solid var(--border);background:var(--card);border-radius:20px;padding:24px;margin-top:18px}.hangul-q{font-size:42px;font-weight:800;margin:12px 0}.hangul-answers{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.hangul-answer{min-height:48px;border:1px solid var(--border);border-radius:13px;background:transparent;padding:10px}.hangul-answer.correct{border-color:var(--good);background:rgba(118,223,160,.08)}.hangul-answer.wrong{border-color:var(--bad);background:rgba(255,146,146,.08)}
    @media(max-width:760px){.tabs{grid-template-columns:repeat(2,1fr)}.hangul-grid{grid-template-columns:repeat(2,1fr)}.hangul-answers{grid-template-columns:1fr}}
  `;
  document.head.appendChild(extraStyle);

  // Add pronunciation buttons to vocabulary cards without changing the existing card behavior.
  if (typeof window.renderWords === "function") {
    const originalRenderWords = window.renderWords;
    window.renderWords = function(...args) {
      const result = originalRenderWords.apply(this, args);
      document.querySelectorAll(".word-card").forEach(card => {
        if (card.querySelector("[data-speak-word]")) return;
        const ko = card.querySelector(".word-ko")?.textContent?.trim();
        const actions = card.querySelector(".card-actions");
        if (!ko || !actions) return;
        const sp = document.createElement("span");
        sp.className = "speak-btn";
        sp.dataset.speakWord = "1";
        sp.title = "Hear pronunciation";
        sp.setAttribute("aria-label", `Hear ${ko}`);
        sp.textContent = "🔊";
        sp.addEventListener("click", e => {
          e.preventDefault();
          e.stopPropagation();
          window.speakKorean(ko);
        });
        actions.insertBefore(sp, actions.lastElementChild);
      });
      return result;
    };
    window.renderWords();
  }

  // Pronunciation button for practice whenever the visible prompt contains Korean.
  function ensureQuizSpeaker() {
    const word = $("quizWord");
    if (!word || $("quizSpeakRow")) return;
    const row = document.createElement("div");
    row.id = "quizSpeakRow";
    row.className = "quiz-speak-row";
    row.innerHTML = `<button class="speak-btn" id="quizSpeakBtn" type="button" title="Hear pronunciation">🔊</button><button class="speak-btn" id="quizSlowBtn" type="button" title="Hear slowly">🐢</button>`;
    word.after(row);
    const refresh = () => {
      const text = word.textContent.trim();
      row.hidden = !hasHangul(text);
      row.dataset.text = text;
    };
    $("quizSpeakBtn").onclick = () => window.speakKorean(row.dataset.text || word.textContent.trim());
    $("quizSlowBtn").onclick = () => window.speakKorean(row.dataset.text || word.textContent.trim(), true);
    new MutationObserver(refresh).observe(word, {childList:true,subtree:true,characterData:true});
    refresh();
  }
  ensureQuizSpeaker();

  // Add Hangul tab before Progress.
  const nav = document.querySelector(".tabs");
  let hangulTab = nav?.querySelector('[data-tab="hangulSection"]');
  if (nav && !hangulTab) {
    hangulTab = document.createElement("button");
    hangulTab.className = "tab";
    hangulTab.dataset.tab = "hangulSection";
    hangulTab.textContent = "Hangul";
    const progressTab = nav.querySelector('[data-tab="progressSection"]');
    nav.insertBefore(hangulTab, progressTab || null);
  }

  let sec = $("hangulSection");
  if (!sec) {
    sec = document.createElement("section");
    sec.className = "section";
    sec.id = "hangulSection";
    document.querySelector("main.app")?.appendChild(sec);
  }

  const vowels = [
    ["ㅏ","a","아","a as in father"],["ㅓ","eo","어","open eo sound"],["ㅗ","o","오","o"],["ㅜ","u","우","oo"],["ㅡ","eu","으","unrounded eu"],["ㅣ","i","이","ee"],
    ["ㅑ","ya","야","ya"],["ㅕ","yeo","여","yeo"],["ㅛ","yo","요","yo"],["ㅠ","yu","유","yu"],["ㅐ","ae","애","ae/e"],["ㅔ","e","에","e"]
  ];
  const consonants = [
    ["ㄱ","g/k","가","g/k"],["ㄴ","n","나","n"],["ㄷ","d/t","다","d/t"],["ㄹ","r/l","라","r/l"],["ㅁ","m","마","m"],["ㅂ","b/p","바","b/p"],["ㅅ","s","사","s"],["ㅇ","silent/ng","아","silent initially, ng finally"],["ㅈ","j","자","j"],["ㅊ","ch","차","aspirated ch"],["ㅋ","k","카","aspirated k"],["ㅌ","t","타","aspirated t"],["ㅍ","p","파","aspirated p"],["ㅎ","h","하","h"]
  ];
  const doubles = [["ㄲ","kk","까"],["ㄸ","tt","따"],["ㅃ","pp","빠"],["ㅆ","ss","싸"],["ㅉ","jj","짜"]];
  const compounds = [["ㅘ","wa","와"],["ㅙ","wae","왜"],["ㅚ","oe/we","외"],["ㅝ","wo","워"],["ㅞ","we","웨"],["ㅟ","wi","위"],["ㅢ","ui","의"]];
  const batchim = [
    ["ㄱ","k","국","국 (guk)"],["ㄴ","n","산","산 (san)"],["ㄷ","t","옷","옷 (ot)"],["ㄹ","l","달","달 (dal)"],["ㅁ","m","밤","밤 (bam)"],["ㅂ","p","밥","밥 (bap)"],["ㅇ","ng","방","방 (bang)"]
  ];

  const letterCards = arr => `<div class="hangul-grid">${arr.map(x => `<div class="hangul-card"><div class="hangul-letter">${x[0]}</div><div class="hangul-roman">${x[1]}</div><div class="hangul-example">${x[2]}</div>${x[3]?`<div class="hangul-roman">${x[3]}</div>`:""}<button type="button" data-hangul-speak="${x[2]}">🔊 Hear</button></div>`).join("")}</div>`;

  const lessons = {
    vowels: () => `<div class="section-head"><h2>Hangul · Vowels</h2><p>Start with the basic vowels. Tap Hear to connect the symbol with its sound.</p></div>${letterCards(vowels)}<div class="hangul-note"><h3>Pattern tip</h3><p>ㅏ/ㅓ have a short stroke to the side. ㅗ/ㅜ place the short stroke above or below. Adding a second short stroke often adds a y-sound: ㅏ → ㅑ, ㅓ → ㅕ.</p></div>`,
    consonants: () => `<div class="section-head"><h2>Hangul · Consonants</h2><p>Korean consonants can change slightly depending on position, so learn them with syllables, not as isolated English letters.</p></div>${letterCards(consonants)}`,
    double: () => `<div class="section-head"><h2>Hangul · Double & compound letters</h2><p>Tense consonants are tighter and stronger. Compound vowels combine simpler vowel shapes.</p></div><h3>Tense consonants</h3>${letterCards(doubles)}<h3 style="margin-top:24px">Compound vowels</h3>${letterCards(compounds)}`,
    syllables: () => `<div class="section-head"><h2>Building syllables</h2><p>Hangul letters are grouped into square syllable blocks.</p></div><div class="hangul-note"><h3>Consonant + vowel</h3><p>ㄱ + ㅏ = 가 · ㄴ + ㅏ = 나 · ㅁ + ㅜ = 무</p><div class="syllable-row">${["가","나","다","라","마","바","사","아","자","차","카","타","파","하","고","누","미","서","요"].map(s=>`<button class="syllable-btn" data-hangul-speak="${s}">${s} 🔊</button>`).join("")}</div></div><div class="hangul-note"><h3>Reading direction</h3><p>Read each block from initial consonant → vowel → optional final consonant. Example: 한 = ㅎ + ㅏ + ㄴ.</p></div>`,
    batchim: () => `<div class="section-head"><h2>받침 · Final consonants</h2><p>A consonant at the bottom of a syllable block is called 받침 (batchim).</p></div>${letterCards(batchim)}<div class="hangul-note"><h3>Important</h3><p>Many written final consonants collapse into a smaller set of final sounds in actual pronunciation. Start with these seven representative final sounds before learning sound-change rules.</p></div>`,
    quiz: () => `<div class="section-head"><h2>Hangul Quiz</h2><p>10 quick questions on letters, syllables and final consonants.</p></div><div class="hangul-quiz"><div class="test-meta"><span id="hangulQNum">Question 1 / 10</span><span id="hangulScore">Score: 0</span></div><div class="quiz-label" id="hangulPrompt"></div><div class="hangul-q" id="hangulQ"></div><div class="hangul-answers" id="hangulAnswers"></div><div class="feedback" id="hangulFeedback"></div><button class="next" id="hangulNext" type="button" style="display:none">Next question</button></div>`
  };

  const tabs = [
    ["vowels","Vowels"],["consonants","Consonants"],["double","Double & compound"],["syllables","Syllables"],["batchim","받침"],["quiz","Quiz"]
  ];
  let hangulMode = localStorage.getItem("hangulMode") || "vowels";

  const quizBank = [
    {q:"ㅏ",p:"Which romanization matches this vowel?",a:"a",o:["a","eo","o","u"]},
    {q:"ㅓ",p:"Which romanization matches this vowel?",a:"eo",o:["i","eo","ya","eu"]},
    {q:"ㄴ",p:"Which basic sound is closest?",a:"n",o:["m","n","r/l","s"]},
    {q:"ㅁ",p:"Which basic sound is closest?",a:"m",o:["b/p","m","n","h"]},
    {q:"가",p:"Which letters build this syllable?",a:"ㄱ + ㅏ",o:["ㄱ + ㅏ","ㄴ + ㅏ","ㄱ + ㅓ","ㅋ + ㅏ"]},
    {q:"한",p:"Which final consonant (받침) appears here?",a:"ㄴ",o:["ㄱ","ㄴ","ㄹ","ㅇ"]},
    {q:"방",p:"What is the final sound in this syllable?",a:"ng",o:["n","m","ng","k"]},
    {q:"ㅑ",p:"Which sound begins with y?",a:"ya",o:["a","ya","yo","yu"]},
    {q:"ㄲ",p:"What kind of consonant is this?",a:"tense/double ㄱ",o:["aspirated ㄱ","tense/double ㄱ","final-only consonant","vowel"]},
    {q:"ㅘ",p:"Which romanization is commonly used?",a:"wa",o:["we","wi","wa","ui"]},
    {q:"달",p:"Which representative 받침 sound ends this syllable?",a:"l",o:["n","l","t","p"]},
    {q:"우",p:"Which vowel is inside this syllable?",a:"ㅜ",o:["ㅗ","ㅜ","ㅡ","ㅣ"]}
  ];
  let hQuestions=[], hIndex=0, hScore=0, hAnswered=false;
  const shuf = a => {const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;};

  function startHangulQuiz(){hQuestions=shuf(quizBank).slice(0,10);hIndex=0;hScore=0;renderHangulQuestion();}
  function renderHangulQuestion(){
    const q=hQuestions[hIndex]; if(!q)return;
    hAnswered=false;$("hangulQNum").textContent=`Question ${hIndex+1} / ${hQuestions.length}`;$("hangulScore").textContent=`Score: ${hScore}`;$("hangulPrompt").textContent=q.p;$("hangulQ").textContent=q.q;$("hangulFeedback").textContent="";$("hangulNext").style.display="none";
    const a=$("hangulAnswers");a.innerHTML="";shuf(q.o).forEach(opt=>{const b=document.createElement("button");b.className="hangul-answer";b.textContent=opt;b.onclick=()=>{if(hAnswered)return;hAnswered=true;a.querySelectorAll("button").forEach(x=>{x.disabled=true;if(x.textContent===q.a)x.classList.add("correct")});if(opt===q.a){hScore++;$("hangulFeedback").textContent="✓ Correct";}else{b.classList.add("wrong");$("hangulFeedback").textContent=`Correct answer: ${q.a}`;}$("hangulScore").textContent=`Score: ${hScore}`;$("hangulNext").textContent=hIndex===hQuestions.length-1?"See result":"Next question";$("hangulNext").style.display="inline-block";};a.appendChild(b)});
    if(hasHangul(q.q)) { const hear=document.createElement("button");hear.className="speak-btn";hear.type="button";hear.textContent="🔊";hear.title="Hear example";hear.onclick=()=>window.speakKorean(q.q,true);$("hangulQ").append(" ",hear); }
    $("hangulNext").onclick=()=>{hIndex++;if(hIndex>=hQuestions.length){const pct=Math.round(hScore/hQuestions.length*100);$("hangulQNum").textContent="Quiz complete";$("hangulPrompt").textContent="Hangul Quiz";$("hangulQ").textContent=`${hScore} / ${hQuestions.length}`;$("hangulAnswers").innerHTML="";$("hangulFeedback").textContent=`${pct}% · ${pct>=90?"Excellent — move on to reading words.":pct>=70?"Good — review the letters you missed.":"Review vowels and consonants, then try again."}`;$("hangulNext").textContent="Start again";$("hangulNext").style.display="inline-block";$("hangulNext").onclick=startHangulQuiz;return;}renderHangulQuestion();};
  }

  function bindHangulSounds(){sec.querySelectorAll("[data-hangul-speak]").forEach(b=>b.onclick=e=>{e.stopPropagation();window.speakKorean(b.dataset.hangulSpeak,true)});}
  function renderHangul(){
    sec.innerHTML=`<div class="hangul-tabs">${tabs.map(([id,label])=>`<button type="button" data-hmode="${id}" class="${id===hangulMode?"active":""}">${label}</button>`).join("")}</div><div id="hangulContent">${lessons[hangulMode]()}</div>`;
    sec.querySelectorAll("[data-hmode]").forEach(b=>b.onclick=()=>{hangulMode=b.dataset.hmode;localStorage.setItem("hangulMode",hangulMode);renderHangul()});
    bindHangulSounds();
    if(hangulMode==="quiz")startHangulQuiz();
  }
  renderHangul();

  if (hangulTab) {
    hangulTab.onclick = () => {
      if (typeof window.activateTab === "function") window.activateTab("hangulSection");
      else {
        document.querySelectorAll(".tab").forEach(x=>x.classList.toggle("active",x===hangulTab));
        document.querySelectorAll(".section").forEach(x=>x.classList.toggle("active",x.id==="hangulSection"));
      }
      renderHangul();
    };
  }
})();
