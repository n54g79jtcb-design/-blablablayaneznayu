(() => {
  const TARGET_TOTAL = 3000;
  const TARGET_PER_LEVEL = { A1: 750, A2: 750, B1: 750, B2: 750 };
  const BASE_RAW = "https://raw.githubusercontent.com/Amulopapa67/open-yonsei-korean-vocabulary/main/data/csv/";
  const BASE_CDN = "https://cdn.jsdelivr.net/gh/Amulopapa67/open-yonsei-korean-vocabulary@main/data/csv/";

  const SOURCE_GROUPS = [
    { level: "A1", files: ["vol-01.csv"] },
    { level: "A2", files: ["vol-02.csv"] },
    { level: "B1", files: ["vol-03.csv", "vol-04.csv"] },
    { level: "B2", files: ["vol-05.csv", "vol-06.csv"] }
  ];

  function parseCSV(text) {
    const rows = [];
    let row = [], field = "", quoted = false;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (quoted) {
        if (ch === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else quoted = false;
        } else field += ch;
      } else {
        if (ch === '"') quoted = true;
        else if (ch === ',') { row.push(field); field = ""; }
        else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ""; }
        else if (ch !== '\r') field += ch;
      }
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    if (!rows.length) return [];
    const headers = rows.shift().map(x => x.trim());
    return rows.filter(r => r.some(Boolean)).map(r => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = r[i] ?? "");
      return obj;
    });
  }

  async function fetchCSV(file) {
    let lastError;
    for (const base of [BASE_RAW, BASE_CDN]) {
      try {
        const res = await fetch(base + file, { cache: "force-cache" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return parseCSV(await res.text());
      } catch (err) { lastError = err; }
    }
    throw lastError || new Error(`Could not load ${file}`);
  }

  function cleanMeaning(value) {
    const parts = String(value || "").split(";").map(x => x.trim()).filter(Boolean);
    return parts.slice(0, 2).join(" / ").replace(/\s+/g, " ").trim();
  }

  function topicFor(row) {
    const pos = String(row.pos || "");
    const kind = String(row.entry_kind || "").toLowerCase();
    if (kind === "expression") return "Useful Expressions";
    if (pos.includes("동사")) return "Verbs";
    if (pos.includes("형용사")) return "Adjectives";
    if (pos.includes("부사")) return "Adverbs";
    if (pos.includes("명사")) return "Nouns";
    if (["조사", "관형사", "대명사", "감탄사", "수사", "의존 명사"].some(x => pos.includes(x))) return "Function Words";
    return "Expanded Vocabulary";
  }

  function validRow(row) {
    const ko = String(row.korean || "").trim();
    const en = cleanMeaning(row.english);
    return ko && en && /[가-힣]/.test(ko) && /[A-Za-z]/.test(en);
  }

  function addCandidate(arr, seen, counts, row, level) {
    if (counts[level] >= TARGET_PER_LEVEL[level] || !validRow(row)) return false;
    const ko = String(row.korean).trim();
    if (seen.has(ko)) return false;
    const en = cleanMeaning(row.english);
    arr.push({ level, topic: topicFor(row), ko, en });
    seen.add(ko);
    counts[level]++;
    return true;
  }

  function addCredit(total) {
    const heading = document.querySelector("#vocab .section-head h2");
    if (heading) heading.textContent = `Vocabulary A1 → B2 · ${total.toLocaleString()} words`;
    if (!document.getElementById("expandedVocabCredit")) {
      const credit = document.createElement("div");
      credit.id = "expandedVocabCredit";
      credit.style.cssText = "margin-top:18px;color:var(--muted);font-size:12px;line-height:1.45";
      credit.innerHTML = 'Expanded vocabulary data adapted from <a href="https://github.com/Amulopapa67/open-yonsei-korean-vocabulary" target="_blank" rel="noopener" style="color:inherit">Open Yonsei Korean Vocabulary contributors</a> (CC BY-SA 3.0).';
      document.getElementById("wordList")?.insertAdjacentElement("afterend", credit);
    }
  }

  window.VOCAB_READY = (async () => {
    const arr = window.VOCAB = window.VOCAB || [];
    const seen = new Set(arr.map(x => String(x.ko || "").trim()).filter(Boolean));
    const counts = { A1: 0, A2: 0, B1: 0, B2: 0 };
    arr.forEach(x => { if (counts[x.level] !== undefined) counts[x.level]++; });

    const loaded = {};
    const errors = [];
    for (const group of SOURCE_GROUPS) {
      for (const file of group.files) {
        try { loaded[file] = await fetchCSV(file); }
        catch (err) { loaded[file] = []; errors.push(`${file}: ${err?.message || err}`); }
      }
    }

    // First fill each CEFR bucket from the closest Yonsei volume(s).
    for (const group of SOURCE_GROUPS) {
      for (const file of group.files) {
        for (const row of loaded[file]) {
          addCandidate(arr, seen, counts, row, group.level);
          if (counts[group.level] >= TARGET_PER_LEVEL[group.level]) break;
        }
        if (counts[group.level] >= TARGET_PER_LEVEL[group.level]) break;
      }
    }

    // Safety fallback: if deduplication leaves a bucket short, use unused entries
    // from the complete loaded pool while keeping the requested 750/level balance.
    const allRows = SOURCE_GROUPS.flatMap(g => g.files.flatMap(f => loaded[f] || []));
    for (const level of ["A1", "A2", "B1", "B2"]) {
      if (counts[level] >= TARGET_PER_LEVEL[level]) continue;
      for (const row of allRows) {
        addCandidate(arr, seen, counts, row, level);
        if (counts[level] >= TARGET_PER_LEVEL[level]) break;
      }
    }

    // Never expose more than the requested total if a future source changes.
    if (arr.length > TARGET_TOTAL) arr.splice(TARGET_TOTAL);

    const status = { total: arr.length, counts, target: TARGET_TOTAL, errors };
    window.VOCAB_LOAD_STATUS = status;
    addCredit(arr.length);
    return status;
  })();
})();
