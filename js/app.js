(function () {
  "use strict";

  /* ================= Data setup ================= */
  const DIFF = { E: "Easy", M: "Medium", H: "Hard" };
  const DAY = 86400000;
  // Spaced revision: revisit 2, 7 and 14 days after first solving.
  const REVIEW_OFFSETS = [2, 7, 14];

  const PHASES = window.ROADMAP.phases;
  const TOPICS = window.ROADMAP.topics;
  const PROBLEMS = [];
  const BY_ID = {};

  let n = 0;
  TOPICS.forEach((t, ti) => {
    t.index = ti + 1;
    t.items = t.problems.map((line) => {
      const [title, slug, diff, flag] = line.split("|");
      const p = { id: ++n, title, slug, diff, premium: flag === "P", topic: t };
      PROBLEMS.push(p);
      BY_ID[p.id] = p;
      return p;
    });
  });
  const TOTAL = PROBLEMS.length;

  /* ================= Storage ================= */
  const KEY = "dsa-master-v1";
  const blank = () => ({ v: 1, solved: {}, flagged: {}, notes: {}, collapsed: {}, filter: { status: "all", diff: "all" } });
  let state = load();

  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!raw || typeof raw !== "object") return blank();
      return Object.assign(blank(), raw, { filter: Object.assign(blank().filter, raw.filter || {}) });
    } catch (e) {
      return blank();
    }
  }
  function save() {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      toast("Couldn't save. Browser storage may be blocked or full.");
    }
  }

  /* ================= Progress helpers ================= */
  const isDone = (id) => !!state.solved[id];
  const doneIn = (list) => list.filter((p) => isDone(p.id)).length;
  const pct = (a, b) => (b ? Math.round((a / b) * 100) : 0);

  function nextDue(id) {
    const s = state.solved[id];
    if (!s || s.stage >= REVIEW_OFFSETS.length) return null;
    const gap = REVIEW_OFFSETS[s.stage] - (s.stage ? REVIEW_OFFSETS[s.stage - 1] : 0);
    return (s.last || s.at) + gap * DAY;
  }
  const isMastered = (id) => isDone(id) && state.solved[id].stage >= REVIEW_OFFSETS.length;
  function dueList() {
    const now = Date.now();
    return PROBLEMS.filter((p) => {
      const d = nextDue(p.id);
      return d !== null && d <= now;
    });
  }

  function toggleDone(id) {
    if (isDone(id)) delete state.solved[id];
    else state.solved[id] = { at: Date.now(), stage: 0, last: null };
    save();
  }
  function markReviewed(id) {
    const s = state.solved[id];
    if (!s) return;
    s.stage = Math.min(s.stage + 1, REVIEW_OFFSETS.length);
    s.last = Date.now();
    save();
  }

  /* ================= Utils ================= */
  const $ = (sel, root = document) => root.querySelector(sel);
  const app = $("#app");
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const lcUrl = (p) => `https://leetcode.com/problems/${p.slug}/`;

  function fmtRel(ts) {
    const days = Math.round((ts - Date.now()) / DAY);
    if (days === 0) return "today";
    if (days === 1) return "tomorrow";
    if (days === -1) return "yesterday";
    return days > 0 ? `in ${days} days` : `${-days} days ago`;
  }

  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2400);
  }

  function highlightJava(src) {
    const kw = /(\/\/.*$)|\b(int|long|boolean|char|void|return|if|else|for|while|new|class|true|false|null|private|protected|public|final|extends|continue|break|static|super)\b/gm;
    return esc(src).replace(kw, (m, comment, word) =>
      comment ? `<span class="cm">${comment}</span>` : `<span class="kw">${word}</span>`
    );
  }

  const ICON = {
    check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
    ext: '<svg viewBox="0 0 24 24"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
    flag: '<svg viewBox="0 0 24 24"><path d="M5 21V4M5 4h11l-2 4 2 4H5"/></svg>',
    note: '<svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16v4zM13.5 6.5l4 4"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    chev: '<svg class="chev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>',
    redo: '<svg viewBox="0 0 24 24"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/></svg>',
  };

  /* ================= Shared renderers ================= */
  function problemRow(p, opts = {}) {
    const done = isDone(p.id);
    const flagged = !!state.flagged[p.id];
    const note = state.notes[p.id] || "";
    const due = nextDue(p.id);
    let status = "";
    if (isMastered(p.id)) status = '<span class="tag mastered">Mastered</span>';
    else if (due !== null && due <= Date.now()) status = '<span class="tag due">Review due</span>';

    return `
      <div class="prob ${done ? "is-done" : ""}" id="p-${p.id}" data-id="${p.id}">
        <div class="prob-row">
          <button class="checkbox ${done ? "on" : ""}" data-action="toggle-done" data-id="${p.id}"
            role="checkbox" aria-checked="${done}" aria-label="Mark ${esc(p.title)} as solved">${ICON.check}</button>
          <span class="prob-num">${p.id}</span>
          <div class="prob-title">
            <a href="${lcUrl(p)}" target="_blank" rel="noopener">${esc(p.title)}${ICON.ext}</a>
            ${p.premium ? '<span class="tag premium" title="Needs LeetCode Premium">Premium</span>' : ""}
            ${status}
            ${opts.showTopic ? `<span class="prob-topic">· ${esc(p.topic.name)}</span>` : ""}
            ${opts.extra || ""}
          </div>
          <span class="pill ${p.diff}">${DIFF[p.diff]}</span>
          <div class="prob-actions">
            ${opts.reviewBtn ? `<button class="btn btn-sm" data-action="reviewed" data-id="${p.id}">${ICON.redo} Reviewed</button>` : ""}
            <button class="icon-btn ${flagged ? "on" : ""}" data-action="toggle-flag" data-id="${p.id}"
              title="${flagged ? "Remove from revisit list" : "Flag to revisit (got stuck)"}" aria-pressed="${flagged}">${ICON.flag}</button>
            <button class="icon-btn ${note ? "has-note" : ""}" data-action="toggle-notes" data-id="${p.id}" title="Notes">${ICON.note}</button>
          </div>
        </div>
        <div class="prob-notes" hidden>
          <textarea data-note="${p.id}" placeholder="Approach, time/space complexity, the trick you missed…">${esc(note)}</textarea>
          <div class="hint">Saved automatically in this browser.</div>
        </div>
      </div>`;
  }

  function ring(value, total) {
    const r = 63, c = 2 * Math.PI * r;
    const off = c * (1 - (total ? value / total : 0));
    return `
      <div class="ring">
        <svg viewBox="0 0 150 150"><circle class="track" cx="75" cy="75" r="${r}"/>
          <circle class="value" cx="75" cy="75" r="${r}" stroke-dasharray="${c}" stroke-dashoffset="${off}"/></svg>
        <div class="ring-label"><div><strong>${pct(value, total)}%</strong><span>${value} / ${total} solved</span></div></div>
      </div>`;
  }

  /* ================= Views ================= */
  function viewHome() {
    const solved = doneIn(PROBLEMS);
    const next = PROBLEMS.find((p) => !isDone(p.id));
    const weekAgo = Date.now() - 7 * DAY;
    const thisWeek = Object.values(state.solved).filter((s) => s.at >= weekAgo).length;
    const byDiff = (d) => {
      const all = PROBLEMS.filter((p) => p.diff === d);
      return `${doneIn(all)} <small>/ ${all.length}</small>`;
    };
    const topicsDone = TOPICS.filter((t) => doneIn(t.items) === t.items.length).length;

    const phases = PHASES.map((ph) => {
      const ts = TOPICS.filter((t) => t.phase === ph.id);
      const all = ts.flatMap((t) => t.items);
      return `
        <section class="phase">
          <div class="phase-head"><h2>${esc(ph.name)}</h2><span class="muted">${doneIn(all)} / ${all.length}</span></div>
          <p class="phase-blurb">${esc(ph.blurb)}</p>
          <div class="topic-grid">${ts.map(topicCard).join("")}</div>
        </section>`;
    }).join("");

    const due = dueList().length;
    app.innerHTML = `
      <section class="card hero">
        <div>
          <div class="eyebrow">Mid-level interview roadmap</div>
          <h1>180 problems, organised by pattern</h1>
          <p>Work through the topics in order. Read each concept first, then solve its problems on LeetCode and tick them off here. Solved problems come back for review after 2, 7 and 14 days, so the patterns stick.</p>
          <div class="hero-actions">
            ${next
              ? `<a class="btn btn-primary" href="#/topic/${next.topic.slug}/${next.id}">${solved ? "Continue" : "Start"}: ${esc(next.title)}</a>`
              : `<span class="btn btn-primary">All 180 solved 🎉</span>`}
            ${due ? `<a class="btn" href="#/review">${due} due for review</a>` : ""}
          </div>
        </div>
        ${ring(solved, TOTAL)}
      </section>

      <div class="stats">
        <div class="card stat"><div class="label"><span class="dot E"></span>Easy</div><div class="value">${byDiff("E")}</div></div>
        <div class="card stat"><div class="label"><span class="dot M"></span>Medium</div><div class="value">${byDiff("M")}</div></div>
        <div class="card stat"><div class="label"><span class="dot H"></span>Hard</div><div class="value">${byDiff("H")}</div></div>
        <div class="card stat"><div class="label"><span class="dot A"></span>Last 7 days</div><div class="value">${thisWeek} <small>solved · ${topicsDone}/${TOPICS.length} topics done</small></div></div>
      </div>

      <div class="search-row">
        <label class="search">${ICON.search}<input id="search" type="search" placeholder="Search all 180 problems…" autocomplete="off" /></label>
      </div>
      <div id="search-results"></div>
      <div id="roadmap">${phases}</div>`;
  }

  function topicCard(t) {
    const d = doneIn(t.items);
    const complete = d === t.items.length;
    return `
      <a class="card topic-card ${complete ? "complete" : ""}" href="#/topic/${t.slug}">
        <div class="row">
          <h3><span class="topic-num">${String(t.index).padStart(2, "0")}</span>${esc(t.name)}</h3>
          <span class="count">${complete ? ICON.check.replace("<svg", '<svg class="check-icon"') + " " : ""}${d}/${t.items.length}</span>
        </div>
        <div class="meta">Priority: ${esc(t.priority)} · ${t.concepts.slice(0, 3).map(esc).join(", ")}${t.concepts.length > 3 ? "…" : ""}</div>
        <div class="bar ${complete ? "done" : ""}"><span style="width:${pct(d, t.items.length)}%"></span></div>
      </a>`;
  }

  function renderSearch(q) {
    const box = $("#search-results");
    const roadmap = $("#roadmap");
    q = q.trim().toLowerCase();
    if (!q) {
      box.innerHTML = "";
      roadmap.hidden = false;
      return;
    }
    const hits = PROBLEMS.filter(
      (p) => p.title.toLowerCase().includes(q) || p.topic.name.toLowerCase().includes(q) || String(p.id) === q
    );
    roadmap.hidden = true;
    box.innerHTML = `
      <section class="section">
        <h2>${hits.length} result${hits.length === 1 ? "" : "s"}</h2>
        <div class="card plist">${hits.length ? hits.map((p) => problemRow(p, { showTopic: true })).join("") : '<div class="empty">No problems match that search.</div>'}</div>
      </section>`;
  }

  function viewTopic(slug, focusId) {
    const t = TOPICS.find((x) => x.slug === slug);
    if (!t) return viewNotFound();
    const d = doneIn(t.items);
    const ti = TOPICS.indexOf(t);
    const prev = TOPICS[ti - 1], next = TOPICS[ti + 1];
    const phase = PHASES.find((p) => p.id === t.phase);
    const collapsed = !!state.collapsed[t.slug];
    const diffCount = (k) => t.items.filter((p) => p.diff === k).length;
    // Make sure a linked-to problem isn't hidden by the current filters.
    if (focusId) state.filter = { status: "all", diff: "all" };

    app.innerHTML = `
      <div class="crumbs"><a href="#/">Roadmap</a> / ${esc(phase.name.split(" – ")[0])} / ${esc(t.name)}</div>
      <div class="topic-head">
        <div>
          <div class="eyebrow">Topic ${t.index} of ${TOPICS.length}</div>
          <h1>${esc(t.name)}</h1>
          <div class="sub">
            <span>Priority: <strong>${esc(t.priority)}</strong></span>
            <span><span class="dot E"></span> ${diffCount("E")} easy</span>
            <span><span class="dot M"></span> ${diffCount("M")} medium</span>
            <span><span class="dot H"></span> ${diffCount("H")} hard</span>
          </div>
        </div>
        <div class="topic-progress">
          <div class="row"><span class="muted">Progress</span><strong>${d} / ${t.items.length}</strong></div>
          <div class="bar ${d === t.items.length ? "done" : ""}"><span style="width:${pct(d, t.items.length)}%"></span></div>
        </div>
      </div>

      <section class="card learn ${collapsed ? "collapsed" : ""}" id="learn">
        <div class="learn-head" data-action="toggle-learn" data-slug="${t.slug}" role="button" tabindex="0" aria-expanded="${!collapsed}">
          <h2>Understand the concept first</h2>${ICON.chev}
        </div>
        <div class="learn-body">
          ${t.note ? `<div class="note">${esc(t.note)}</div>` : ""}
          <p>${esc(t.overview)}</p>
          <div class="chips">${t.concepts.map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div>
          <div class="learn-grid">
            <div>
              <h3>Spot this pattern when…</h3>
              <ul>${t.recognize.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
              <h3>Common pitfalls</h3>
              <ul>${t.pitfalls.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
            </div>
            <div>
              <h3>Core template (Java)</h3>
              <pre class="code"><code>${highlightJava(t.template)}</code></pre>
            </div>
          </div>
        </div>
      </section>

      <div class="toolbar">
        <h2>Problems</h2>
        <div class="filters">
          <div class="seg" data-filter="status">
            ${["all", "todo", "done"].map((s) => `<button data-value="${s}" class="${state.filter.status === s ? "on" : ""}">${{ all: "All", todo: "To do", done: "Solved" }[s]}</button>`).join("")}
          </div>
          <div class="seg" data-filter="diff">
            ${["all", "E", "M", "H"].map((s) => `<button data-value="${s}" class="${state.filter.diff === s ? "on" : ""}">${s === "all" ? "Any" : DIFF[s]}</button>`).join("")}
          </div>
        </div>
      </div>
      <div class="card plist" id="plist"></div>

      <nav class="pager">
        ${prev ? `<a class="card" href="#/topic/${prev.slug}"><small>← Previous</small>${esc(prev.name)}</a>` : "<span></span>"}
        ${next ? `<a class="card next" href="#/topic/${next.slug}"><small>Next →</small>${esc(next.name)}</a>` : `<a class="card next" href="#/review"><small>Done with the roadmap?</small>Go to review →</a>`}
      </nav>`;

    renderTopicList(t);

    if (focusId) {
      const el = document.getElementById("p-" + focusId);
      if (el) {
        requestAnimationFrame(() => {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.classList.add("flash");
        });
      }
    }
  }

  function renderTopicList(t) {
    const { status, diff } = state.filter;
    const list = t.items.filter(
      (p) =>
        (status === "all" || (status === "done") === isDone(p.id)) && (diff === "all" || p.diff === diff)
    );
    $("#plist").innerHTML = list.length
      ? list.map((p) => problemRow(p)).join("")
      : `<div class="empty">No problems match these filters.</div>`;
  }

  function viewReview() {
    const now = Date.now();
    const due = dueList();
    const flagged = PROBLEMS.filter((p) => state.flagged[p.id]);
    const upcoming = PROBLEMS.map((p) => ({ p, d: nextDue(p.id) }))
      .filter((x) => x.d !== null && x.d > now)
      .sort((a, b) => a.d - b.d)
      .slice(0, 15);
    const mastered = PROBLEMS.filter((p) => isMastered(p.id)).length;

    const stageTag = (p) => {
      const s = state.solved[p.id];
      return `<span class="tag">Review ${s.stage + 1} of ${REVIEW_OFFSETS.length}</span>`;
    };

    app.innerHTML = `
      <div class="page-head">
        <div class="eyebrow">Spaced revision</div>
        <h1>Review</h1>
        <p>Solve each due problem again from scratch, without looking at your old code, then press <strong>Reviewed</strong>. A problem counts as mastered after all three reviews (days 2, 7 and 14). ${mastered ? `You've mastered <strong>${mastered}</strong> so far.` : ""}</p>
      </div>

      <section class="section">
        <h2>Due now ${due.length ? `<span class="badge">${due.length}</span>` : ""}</h2>
        <div class="card plist">
          ${due.length ? due.map((p) => problemRow(p, { showTopic: true, reviewBtn: true, extra: stageTag(p) })).join("") : '<div class="empty">Nothing due right now. Go solve something new.</div>'}
        </div>
      </section>

      <section class="section">
        <h2>Flagged to revisit</h2>
        <div class="card plist">
          ${flagged.length ? flagged.map((p) => problemRow(p, { showTopic: true })).join("") : '<div class="empty">Flag a problem (the flag icon) when you got stuck or used hints. It will show up here.</div>'}
        </div>
      </section>

      <section class="section">
        <h2>Coming up</h2>
        <div class="card plist">
          ${upcoming.length ? upcoming.map(({ p, d }) => problemRow(p, { showTopic: true, extra: `<span class="tag">due ${fmtRel(d)}</span>` })).join("") : '<div class="empty">Nothing scheduled yet.</div>'}
        </div>
      </section>`;
  }

  function viewGuide() {
    const c = { E: 0, M: 0, H: 0 };
    PROBLEMS.forEach((p) => c[p.diff]++);
    app.innerHTML = `
      <div class="page-head">
        <div class="eyebrow">How to use this roadmap</div>
        <h1>Execution plan</h1>
        <p>About 10–12 weeks, depending on how much time you have each day. Don't race through all 180 in order without checking that you actually understand them.</p>
      </div>
      <div class="guide-grid">
        <section class="card guide-card">
          <h2>Daily routine</h2>
          <table class="sched">
            <tr><td>Learn or revise one pattern</td><td>30 min</td></tr>
            <tr><td>Solve 2 new problems</td><td>90 min</td></tr>
            <tr><td>Revisit previously failed problems</td><td>30 min</td></tr>
            <tr><td>Complexity analysis and notes</td><td>15 min</td></tr>
            <tr><td>Total</td><td>2 hr 45 min</td></tr>
          </table>
        </section>
        <section class="card guide-card">
          <h2>Rules for every problem</h2>
          <ul>
            <li>First attempt: 25–35 minutes without looking at solutions.</li>
            <li>If you're stuck, work out which concept you're missing before you check hints.</li>
            <li>Write the brute force before you optimise.</li>
            <li>Implement the optimal approach in Java.</li>
            <li>Revisit after 2, 7 and 14 days. The Review tab does this for you.</li>
            <li>Understanding someone else's solution doesn't mean you've mastered the problem.</li>
          </ul>
        </section>
        <section class="card guide-card">
          <h2>How the tracker works</h2>
          <ol>
            <li>Open a topic and read <em>Understand the concept first</em>.</li>
            <li>Click a problem title to open it on LeetCode, then solve and submit it there.</li>
            <li>Come back and tick the checkbox. Flag it if you needed hints.</li>
            <li>Use the notes icon to jot down the approach and its complexity.</li>
            <li>Check the <a href="#/review">Review</a> tab every day.</li>
          </ol>
        </section>
        <section class="card guide-card">
          <h2>What's in the 180</h2>
          <div class="mix">
            <span style="width:${pct(c.E, TOTAL)}%"></span><span style="width:${pct(c.M, TOTAL)}%"></span><span style="width:${pct(c.H, TOTAL)}%"></span>
          </div>
          <p class="muted" style="margin:0 0 10px">
            <span class="dot E"></span> ${c.E} easy &nbsp; <span class="dot M"></span> ${c.M} medium &nbsp; <span class="dot H"></span> ${c.H} hard
          </p>
          <p style="margin:0">${TOPICS.length} topics across ${PHASES.length} phases. Four problems need LeetCode Premium (they're marked). If you don't have it, read their descriptions elsewhere and practise the same pattern.</p>
        </section>
      </div>`;
  }

  function viewNotFound() {
    app.innerHTML = `<div class="empty card"><p>That page doesn't exist.</p><a class="btn" href="#/">Back to the roadmap</a></div>`;
  }

  /* ================= Router ================= */
  let current = { name: "home" };

  function route() {
    const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
    const prevName = current.name;
    if (!parts.length) current = { name: "home" };
    else if (parts[0] === "topic") current = { name: "topic", slug: parts[1], focus: parts[2] };
    else if (parts[0] === "review") current = { name: "review" };
    else if (parts[0] === "guide") current = { name: "guide" };
    else current = { name: "404" };

    render();
    if (!current.focus && (prevName !== current.name || current.name === "topic")) window.scrollTo(0, 0);
  }

  function render() {
    switch (current.name) {
      case "home": viewHome(); break;
      case "topic": viewTopic(current.slug, current.focus); break;
      case "review": viewReview(); break;
      case "guide": viewGuide(); break;
      default: viewNotFound();
    }
    document.querySelectorAll("[data-nav]").forEach((a) => {
      const map = { home: "home", topic: "home", review: "review", guide: "guide" };
      a.classList.toggle("active", a.dataset.nav === map[current.name]);
    });
    const due = dueList().length;
    const badge = $("#review-badge");
    badge.hidden = !due;
    badge.textContent = due;
    const t = current.name === "topic" && TOPICS.find((x) => x.slug === current.slug);
    document.title = t ? `${t.name} · DSA Master` : "DSA Master – 180 Problem Roadmap";
  }

  // Re-render in place, keeping scroll position and open note panels.
  function refresh() {
    const y = window.scrollY;
    const open = [...document.querySelectorAll(".prob-notes:not([hidden])")].map((el) => el.closest(".prob").dataset.id);
    const q = $("#search") && $("#search").value;
    const focusBackup = current.focus;
    current.focus = null;
    render();
    current.focus = focusBackup;
    if (q) {
      $("#search").value = q;
      renderSearch(q);
    }
    open.forEach((id) => {
      const el = document.querySelector(`#p-${id} .prob-notes`);
      if (el) el.hidden = false;
    });
    window.scrollTo(0, y);
  }

  /* ================= Events ================= */
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-action], .seg button");
    const menu = $("#menu");
    if (!e.target.closest(".menu-wrap")) menu.hidden = true;
    if (!el) return;

    if (el.matches(".seg button")) {
      const key = el.parentElement.dataset.filter;
      state.filter[key] = el.dataset.value;
      save();
      el.parentElement.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b === el));
      const t = TOPICS.find((x) => x.slug === current.slug);
      if (t) renderTopicList(t);
      return;
    }

    const id = Number(el.dataset.id);
    switch (el.dataset.action) {
      case "toggle-done": {
        const was = isDone(id);
        toggleDone(id);
        refresh();
        if (!was) {
          const p = BY_ID[id];
          const t = p.topic;
          toast(doneIn(t.items) === t.items.length ? `🎉 ${t.name} complete!` : `Solved: ${p.title}. First review in 2 days.`);
        }
        break;
      }
      case "toggle-flag":
        if (state.flagged[id]) delete state.flagged[id];
        else state.flagged[id] = true;
        save();
        refresh();
        break;
      case "toggle-notes": {
        const box = el.closest(".prob").querySelector(".prob-notes");
        box.hidden = !box.hidden;
        if (!box.hidden) box.querySelector("textarea").focus();
        break;
      }
      case "reviewed":
        markReviewed(id);
        toast(isMastered(id) ? `Mastered: ${BY_ID[id].title} 💪` : "Review logged. Next one is scheduled.");
        refresh();
        break;
      case "toggle-learn": {
        const s = el.dataset.slug;
        state.collapsed[s] = !state.collapsed[s];
        save();
        $("#learn").classList.toggle("collapsed", state.collapsed[s]);
        el.setAttribute("aria-expanded", String(!state.collapsed[s]));
        break;
      }
      case "toggle-theme": {
        const root = document.documentElement;
        const dark = root.dataset.theme
          ? root.dataset.theme === "dark"
          : matchMedia("(prefers-color-scheme: dark)").matches;
        root.dataset.theme = dark ? "light" : "dark";
        state.theme = root.dataset.theme;
        save();
        break;
      }
      case "toggle-menu":
        menu.hidden = !menu.hidden;
        break;
      case "export":
        exportProgress();
        menu.hidden = true;
        break;
      case "import":
        $("#import-file").click();
        menu.hidden = true;
        break;
      case "reset":
        menu.hidden = true;
        if (confirm("Reset ALL progress, flags and notes? This can't be undone. Export first if you want a backup.")) {
          const theme = state.theme;
          state = blank();
          state.theme = theme;
          save();
          refresh();
          toast("Progress reset.");
        }
        break;
    }
  });

  document.addEventListener("keydown", (e) => {
    if ((e.key === "Enter" || e.key === " ") && e.target.matches(".learn-head")) {
      e.preventDefault();
      e.target.click();
    }
    if (e.key === "Escape") $("#menu").hidden = true;
  });

  let noteTimer;
  document.addEventListener("input", (e) => {
    if (e.target.id === "search") return renderSearch(e.target.value);
    const nid = e.target.dataset && e.target.dataset.note;
    if (!nid) return;
    const val = e.target.value;
    if (val.trim()) state.notes[nid] = val;
    else delete state.notes[nid];
    clearTimeout(noteTimer);
    noteTimer = setTimeout(save, 300);
    const btn = e.target.closest(".prob").querySelector('[data-action="toggle-notes"]');
    btn.classList.toggle("has-note", !!val.trim());
  });

  function exportProgress() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `dsa-master-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  $("#import-file").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data || typeof data.solved !== "object") throw new Error("bad");
      const theme = state.theme;
      state = Object.assign(blank(), data, { theme });
      save();
      refresh();
      toast(`Imported ${Object.keys(state.solved).length} solved problems.`);
    } catch (err) {
      toast("That file doesn't look like a DSA Master export.");
    }
  });

  // Keep tabs in sync.
  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      state = load();
      refresh();
    }
  });
  // Refresh "due" state when returning to the tab (e.g. next day).
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !document.activeElement.matches("textarea, input")) refresh();
  });

  window.addEventListener("hashchange", route);
  route();
})();
