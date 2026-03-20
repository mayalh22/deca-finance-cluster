const STORAGE_KEY = 'deca-finance-v2';

let pileX = [];
let pileY = [];
let pileU = [];
let queue = [];
let queueSource = 'unseen';
let current = null;
let answered = false;

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ pileX, pileY, pileU, queue, queueSource, current }));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;
  try {
    const s = JSON.parse(raw);
    if (!Array.isArray(s.pileX) || !Array.isArray(s.pileY) || !Array.isArray(s.pileU)) return false;
    pileX = s.pileX;
    pileY = s.pileY;
    pileU = s.pileU;
    queue = s.queue || [];
    queueSource = s.queueSource || 'unseen';
    current = s.current ?? null;
    return true;
  } catch {
    return false;
  }
}

function resetState() {
  pileX = [];
  pileY = [];
  pileU = ALL_QUESTIONS.map((_, i) => i);
  queue = [];
  current = null;
  buildQueue();
  saveState();
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQueue() {
  if (pileU.length > 0) {
    queue = shuffle(pileU);
    queueSource = 'unseen';
  } else if (pileY.length > 0) {
    queue = shuffle(pileY);
    queueSource = 'review';
  } else {
    queue = shuffle(pileX);
    queueSource = 'mastered';
  }
}

function updateHUD() {
  document.getElementById('count-x').textContent = pileX.length;
  document.getElementById('count-y').textContent = pileY.length;
  document.getElementById('count-u').textContent = pileU.length;
  const pct = (pileX.length / ALL_QUESTIONS.length) * 100;
  document.getElementById('progress-fill').style.width = pct + '%';

  const labels = { unseen: 'Unseen pile', review: 'Review pile', mastered: 'All mastered' };
  document.getElementById('quiz-meta').textContent = labels[queueSource] || '';
}

function renderQuestion() {
  answered = false;
  const q = ALL_QUESTIONS[current];
  const keys = ['A', 'B', 'C', 'D'];

  document.getElementById('question-text').textContent = q.q;

  const list = document.getElementById('options-list');
  list.innerHTML = '';
  q.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.innerHTML = `<span class="option-btn__key">${keys[i]}</span><span class="option-btn__text">${opt}</span>`;
    btn.addEventListener('click', () => handleAnswer(i));
    list.appendChild(btn);
  });

  const expBox = document.getElementById('explanation-box');
  expBox.style.display = 'none';
  expBox.className = 'explanation-box';
  expBox.innerHTML = '';

  document.getElementById('next-btn').style.display = 'none';
  updateHUD();
}

function handleAnswer(chosen) {
  if (answered) return;
  answered = true;

  const q = ALL_QUESTIONS[current];
  const correct = q.ans;
  const btns = document.querySelectorAll('.option-btn');

  btns.forEach(b => b.disabled = true);
  btns[correct].classList.add('option-btn--correct');

  const expBox = document.getElementById('explanation-box');

  if (chosen === correct) {
    pileU = pileU.filter(x => x !== current);
    pileY = pileY.filter(x => x !== current);
    if (!pileX.includes(current)) pileX.push(current);

    expBox.className = 'explanation-box explanation-box--correct';
    expBox.innerHTML = `<strong>Correct &mdash; moved to Mastered.</strong> ${q.exp}`;
  } else {
    btns[chosen].classList.add('option-btn--wrong');
    pileU = pileU.filter(x => x !== current);
    pileX = pileX.filter(x => x !== current);
    if (!pileY.includes(current)) pileY.push(current);

    const keys = ['A', 'B', 'C', 'D'];
    expBox.className = 'explanation-box explanation-box--wrong';
    expBox.innerHTML = `<strong>Incorrect &mdash; moved to Review.</strong> The correct answer is <strong>${keys[correct]}. ${q.opts[correct]}</strong><br><br>${q.exp}`;
  }

  expBox.style.display = 'block';
  document.getElementById('next-btn').style.display = 'inline-flex';
  updateHUD();
  saveState();
}

function nextQuestion() {
  if (queue.length === 0) {
    showRoundComplete();
    return;
  }
  current = queue.shift();
  saveState();
  renderQuestion();
}

function showRoundComplete() {
  document.getElementById('quiz-screen').style.display = 'none';
  document.getElementById('round-complete').style.display = 'block';

  const title = document.getElementById('round-title');
  const sub = document.getElementById('round-sub');
  const btn = document.getElementById('continue-btn');

  if (pileU.length === 0 && pileY.length === 0) {
    title.textContent = 'All questions mastered.';
    sub.textContent = `You worked through all ${ALL_QUESTIONS.length} questions. Reset to start over or keep reviewing.`;
    btn.textContent = 'Review everything again';
  } else if (pileU.length === 0) {
    title.textContent = 'Unseen pile complete.';
    sub.textContent = `${pileX.length} mastered · ${pileY.length} in review. Time to work through what you missed.`;
    btn.textContent = 'Start review pile';
  } else {
    title.textContent = 'Review round done.';
    sub.textContent = `${pileX.length} mastered · ${pileY.length} still in review · ${pileU.length} unseen.`;
    btn.textContent = 'Continue';
  }

  saveState();
}

document.getElementById('next-btn').addEventListener('click', () => {
  nextQuestion();
});

document.getElementById('continue-btn').addEventListener('click', () => {
  if (pileU.length === 0 && pileY.length === 0) {
    pileX = [];
    pileU = ALL_QUESTIONS.map((_, i) => i);
  }
  buildQueue();
  document.getElementById('round-complete').style.display = 'none';
  document.getElementById('quiz-screen').style.display = 'block';
  nextQuestion();
  saveState();
});

document.getElementById('reset-btn').addEventListener('click', () => {
  if (!confirm('Reset all progress? This cannot be undone.')) return;
  localStorage.removeItem(STORAGE_KEY);
  resetState();
  document.getElementById('round-complete').style.display = 'none';
  document.getElementById('quiz-screen').style.display = 'block';
  nextQuestion();
});

function init() {
  const loaded = loadState();
  if (!loaded) {
    pileU = ALL_QUESTIONS.map((_, i) => i);
    buildQueue();
    saveState();
  } else if (queue.length === 0 && current === null) {
    buildQueue();
    saveState();
  }
  nextQuestion();
}

init();