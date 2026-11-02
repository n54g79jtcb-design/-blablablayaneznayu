const vocab = window.VOCAB;

const grammar = [
  ["-기 전에", "before doing something", "집에서 나가기 전에 화장해요.", "I do my makeup before leaving home."],
  ["-(으)ㄴ 후에", "after doing something", "운동한 후에 샤워해요.", "I shower after exercising."],
  ["-다가", "while doing / interruption", "공부하다가 전화를 받았어요.", "I was studying when I got a call."],
  ["-(으)려고 하다", "intend / plan to", "책을 사려고 했어요.", "I was going to buy a book."],
  ["-기로 하다", "decide to", "내일 만나기로 했어요.", "We decided to meet tomorrow."],
  ["-아/어야 되다", "have to / must", "과제를 제출해야 돼요.", "I have to submit the assignment."]
];

const tenseVerbs = [
  { base: "먹다", en: "to eat", present: "먹어요", past: "먹었어요", future: "먹을 거예요" },
  { base: "가다", en: "to go", present: "가요", past: "갔어요", future: "갈 거예요" },
  { base: "하다", en: "to do", present: "해요", past: "했어요", future: "할 거예요" },
  { base: "보다", en: "to see / watch", present: "봐요", past: "봤어요", future: "볼 거예요" },
  { base: "오다", en: "to come", present: "와요", past: "왔어요", future: "올 거예요" },
  { base: "마시다", en: "to drink", present: "마셔요", past: "마셨어요", future: "마실 거예요" },
  { base: "읽다", en: "to read", present: "읽어요", past: "읽었어요", future: "읽을 거예요" },
  { base: "쓰다", en: "to write / use", present: "써요", past: "썼어요", future: "쓸 거예요" },
  { base: "자다", en: "to sleep", present: "자요", past: "잤어요", future: "잘 거예요" },
  { base: "만나다", en: "to meet", present: "만나요", past: "만났어요", future: "만날 거예요" },
  { base: "공부하다", en: "to study", present: "공부해요", past: "공부했어요", future: "공부할 거예요" },
  { base: "기다리다", en: "to wait", present: "기다려요", past: "기다렸어요", future: "기다릴 거예요" },
  { base: "배우다", en: "to learn", present: "배워요", past: "배웠어요", future: "배울 거예요" },
  { base: "만들다", en: "to make", present: "만들어요", past: "만들었어요", future: "만들 거예요" },
  { base: "살다", en: "to live", present: "살아요", past: "살았어요", future: "살 거예요" },
  { base: "듣다", en: "to listen", present: "들어요", past: "들었어요", future: "들을 거예요" },
  { base: "모르다", en: "to not know", present: "몰라요", past: "몰랐어요", future: "모를 거예요" },
  { base: "좋아하다", en: "to like", present: "좋아해요", past: "좋아했어요", future: "좋아할 거예요" }
];

let practiced = Number(localStorage.getItem("practiced") || 0);
let level = "All";
let topic = "All topics";
let query = "";

const $ = id => document.getElementById(id);
const score = $("score");
const progress = $("progress");
const wordList = $("wordList");
const wordCount = $("wordCount");
const levelFilters = $("levelFilters");
const topicFilters = $("topicFilters");

function updateProgress() {
  score.textContent = practiced;
  progress.style.width = Math.min(100, practiced * 4) + "%";
  localStorage.setItem("practiced", practiced);
}

function mk(container, label, active, fn, className) {
  const b = document.createElement("button");
  b.className = className + (active ? " active" : "");
  b.textContent = label;
  b.onclick = fn;
  container.appendChild(b);
}

function renderLevels() {
  levelFilters.innerHTML = "";
  ["All", "A1", "A2", "B1", "B2"].forEach(x =>
    mk(levelFilters, x, x === level, () => {
      level = x;
      renderLevels();
      renderTopics();
      renderWords();
    }, "filter")
  );
}

function topics() {
  const source = level === "All" ? vocab : vocab.filter(x => x.level === level);
  return ["All topics", ...new Set(source.map(x => x.topic))].sort();
}

function renderTopics() {
  const list = topics();
  if (!list.includes(topic)) topic = "All topics";
  topicFilters.innerHTML = "";
  list.forEach(x => mk(topicFilters, x, x === topic, () => {
    topic = x;
    renderTopics();
    renderWords();
  }, "topic"));
}

function renderWords() {
  const q = query.trim().toLowerCase();
  const items = vocab.filter(x =>
    (level === "All" || x.level === level) &&
    (topic === "All topics" || x.topic === topic) &&
    (!q || x.ko.toLowerCase().includes(q) || x.en.toLowerCase().includes(q))
  );
  wordCount.textContent = items.length + " words";
  wordList.innerHTML = "";
  items.forEach(i => {
    const b = document.createElement("button");
    b.className = "word-card";
    b.innerHTML = `<span class="badge">${i.level}</span><span class="word-ko">${i.ko}</span><span class="word-en">Tap to reveal</span>`;
    let revealed = false;
    b.onclick = () => {
      revealed = !revealed;
      b.querySelector(".word-en").textContent = revealed ? i.en : "Tap to reveal";
      if (revealed) {
        practiced++;
        updateProgress();
      }
    };
    wordList.appendChild(b);
  });
}

$("search").oninput = e => {
  query = e.target.value;
  renderWords();
};

grammar.forEach(([form, use, example, translation]) => {
  const d = document.createElement("details");
  d.className = "grammar-card";
  d.innerHTML = `<summary>${form} <span class="grammar-use">— ${use}</span></summary><div class="example">${example}</div><div class="translation">${translation}</div>`;
  $("grammarList").appendChild(d);
});

document.querySelectorAll(".tab").forEach(b => b.onclick = () => {
  document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
  document.querySelectorAll(".section").forEach(x => x.classList.remove("active"));
  b.classList.add("active");
  $(b.dataset.tab).classList.add("active");
});

const TEST_LENGTH = 10;
let testMode = "vocab";
let testLevel = "All";
let tenseMode = "mixed";
let testQuestions = [];
let testIndex = 0;
let testScore = 0;
let answered = false;

const style = document.createElement("style");
style.textContent = `
.test-switch,.test-settings{display:flex;flex-wrap:wrap;gap:9px;margin-bottom:16px}
.test-switch button,.test-settings button{min-height:42px;border:1px solid var(--border);border-radius:999px;background:transparent;padding:0 15px}
.test-switch button.active,.test-settings button.active{background:var(--soft);border-color:#2a3b65}
.test-meta{display:flex;justify-content:space-between;gap:12px;color:var(--muted);margin-bottom:8px;font-size:14px}
.test-result{padding:22px;border:1px solid var(--border);border-radius:18px;background:#0d0d0d;margin-top:16px}
.test-result strong{font-size:32px;display:block;margin-bottom:8px}
.answer.correct{border-color:var(--good);background:rgba(118,223,160,.08)}
.answer.wrong{border-color:var(--bad);background:rgba(255,146,146,.08)}
.answer:disabled{cursor:default;opacity:1}
@media(max-width:760px){.test-meta{font-size:13px}}
`;
document.head.appendChild(style);

const practice = $("practice");
practice.innerHTML = `
  <div class="section-head"><h2>Tests</h2><p>Practice vocabulary and Korean verb tenses in 10-question mini tests.</p></div>
  <div class="test-switch" id="testSwitch">
    <button data-mode="vocab" class="active">Vocabulary Test</button>
    <button data-mode="tense">Tenses Test</button>
  </div>
  <div class="test-settings" id="testSettings"></div>
  <div class="quiz-box">
    <div class="test-meta"><span id="testProgress">Question 1 / 10</span><span id="testScore">Score: 0</span></div>
    <div class="quiz-label" id="quizLabel"></div>
    <div class="quiz-word" id="quizWord"></div>
    <div class="answers" id="answers"></div>
    <div class="feedback" id="feedback"></div>
    <button class="next" id="nextQ">Next question</button>
    <div id="testResult"></div>
  </div>`;

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function uniqueRandomOptions(correct, pool, count = 4) {
  const others = shuffle([...new Set(pool.filter(x => x !== correct))]).slice(0, count - 1);
  return shuffle([correct, ...others]);
}

function makeVocabQuestions() {
  let pool = testLevel === "All" ? vocab : vocab.filter(x => x.level === testLevel);
  pool = shuffle(pool);
  const chosen = pool.slice(0, Math.min(TEST_LENGTH, pool.length));
  const answerPool = pool.map(x => x.en);
  return chosen.map(item => ({
    label: `What does ${item.ko} mean?`,
    prompt: item.ko,
    correct: item.en,
    options: uniqueRandomOptions(item.en, answerPool),
    detail: `${item.level} · ${item.topic}`
  }));
}

function makeTenseQuestions() {
  const names = { present: "Present", past: "Past", future: "Future" };
  const keys = tenseMode === "mixed" ? ["present", "past", "future"] : [tenseMode];
  const verbs = shuffle(tenseVerbs).slice(0, TEST_LENGTH);
  return verbs.map((verb, i) => {
    const key = keys[i % keys.length];
    const correct = verb[key];
    const sameVerbForms = [verb.present, verb.past, verb.future];
    const otherSameTense = shuffle(tenseVerbs.filter(v => v.base !== verb.base).map(v => v[key]));
    const options = uniqueRandomOptions(correct, [...sameVerbForms, ...otherSameTense]);
    return {
      label: `Choose the ${names[key]} form of ${verb.base} (${verb.en}).`,
      prompt: verb.base,
      correct,
      options,
      detail: names[key]
    };
  });
}

function renderTestSettings() {
  const c = $("testSettings");
  c.innerHTML = "";
  if (testMode === "vocab") {
    ["All", "A1", "A2", "B1", "B2"].forEach(x => mk(c, x, x === testLevel, () => {
      testLevel = x;
      renderTestSettings();
      startTest();
    }, "test-setting"));
  } else {
    [["mixed", "Mixed"], ["present", "Present"], ["past", "Past"], ["future", "Future"]].forEach(([key, label]) =>
      mk(c, label, key === tenseMode, () => {
        tenseMode = key;
        renderTestSettings();
        startTest();
      }, "test-setting")
    );
  }
}

function startTest() {
  testQuestions = testMode === "vocab" ? makeVocabQuestions() : makeTenseQuestions();
  testIndex = 0;
  testScore = 0;
  answered = false;
  $("testResult").innerHTML = "";
  $("nextQ").textContent = "Next question";
  renderQuestion();
}

function renderQuestion() {
  const q = testQuestions[testIndex];
  if (!q) return finishTest();
  answered = false;
  $("testProgress").textContent = `Question ${testIndex + 1} / ${testQuestions.length}`;
  $("testScore").textContent = `Score: ${testScore}`;
  $("quizLabel").textContent = q.label;
  $("quizWord").textContent = q.prompt;
  $("feedback").textContent = q.detail;
  $("testResult").innerHTML = "";
  const answers = $("answers");
  answers.innerHTML = "";
  q.options.forEach(option => {
    const b = document.createElement("button");
    b.className = "answer";
    b.textContent = option;
    b.onclick = () => answerQuestion(b, option);
    answers.appendChild(b);
  });
  $("nextQ").style.display = "none";
}

function answerQuestion(button, option) {
  if (answered) return;
  answered = true;
  const q = testQuestions[testIndex];
  const buttons = [...$("answers").querySelectorAll("button")];
  buttons.forEach(b => {
    b.disabled = true;
    if (b.textContent === q.correct) b.classList.add("correct");
  });
  if (option === q.correct) {
    testScore++;
    practiced++;
    updateProgress();
    $("feedback").textContent = "✓ Correct";
  } else {
    button.classList.add("wrong");
    $("feedback").textContent = `Correct answer: ${q.correct}`;
  }
  $("testScore").textContent = `Score: ${testScore}`;
  $("nextQ").textContent = testIndex === testQuestions.length - 1 ? "See result" : "Next question";
  $("nextQ").style.display = "inline-block";
}

function finishTest() {
  const key = testMode === "vocab" ? `best-vocab-${testLevel}` : `best-tense-${tenseMode}`;
  const oldBest = Number(localStorage.getItem(key) || 0);
  const best = Math.max(oldBest, testScore);
  localStorage.setItem(key, best);
  $("testProgress").textContent = "Test complete";
  $("quizLabel").textContent = testMode === "vocab" ? "Vocabulary Test" : "Tenses Test";
  $("quizWord").textContent = `${testScore} / ${testQuestions.length}`;
  $("answers").innerHTML = "";
  $("feedback").textContent = testScore >= 9 ? "Excellent." : testScore >= 7 ? "Good job — one more round will make it stick." : "Keep practicing — try another round.";
  $("nextQ").style.display = "none";
  $("testResult").innerHTML = `<div class="test-result"><strong>${Math.round(testScore / testQuestions.length * 100)}%</strong>Best score for this mode: ${best}/${testQuestions.length}<br><button class="next" id="restartTest">Start new test</button></div>`;
  $("restartTest").onclick = startTest;
}

$("nextQ").onclick = () => {
  if (!answered) return;
  testIndex++;
  if (testIndex >= testQuestions.length) finishTest();
  else renderQuestion();
};

$("testSwitch").querySelectorAll("button").forEach(b => b.onclick = () => {
  testMode = b.dataset.mode;
  $("testSwitch").querySelectorAll("button").forEach(x => x.classList.toggle("active", x === b));
  renderTestSettings();
  startTest();
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}

updateProgress();
renderLevels();
renderTopics();
renderWords();
renderTestSettings();
startTest();
