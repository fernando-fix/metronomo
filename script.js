(function () {
  "use strict";

  const STORAGE_KEY = "metronomo.config";

  const els = {
    bpmDisplay: document.getElementById("bpmDisplay"),
    currentBpm: document.getElementById("currentBpm"),
    bpmSlider: document.getElementById("bpmSlider"),
    bpmMinus: document.getElementById("bpmMinus"),
    bpmPlus: document.getElementById("bpmPlus"),
    timeSig: document.getElementById("timeSig"),
    beats: document.getElementById("beats"),
    accelToggle: document.getElementById("accelToggle"),
    accelOptions: document.getElementById("accelOptions"),
    targetBpm: document.getElementById("targetBpm"),
    stepBpm: document.getElementById("stepBpm"),
    everyBars: document.getElementById("everyBars"),
    volume: document.getElementById("volume"),
    muteBtn: document.getElementById("muteBtn"),
    playBtn: document.getElementById("playBtn"),
  };

  const state = {
    bpm: 120,
    beatsPerBar: 4,
    volume: 80,
    muted: false,
    accel: false,
    targetBpm: 160,
    stepBpm: 2,
    everyBars: 4,
    playing: false,
    currentBpm: 120,
    beat: 0,
    barCount: 0,
  };

  let audioCtx = null;
  let lookaheadTimer = null;
  let nextNoteTime = 0;
  const scheduleAheadTime = 0.12;
  const lookaheadMs = 25;
  let visualQueue = [];

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function getVolumeGain() {
    return state.muted ? 0 : state.volume / 100;
  }

  function buildBeatDots() {
    els.beats.innerHTML = "";
    for (let i = 0; i < state.beatsPerBar; i++) {
      const dot = document.createElement("span");
      dot.className = "beat-dot";
      els.beats.appendChild(dot);
    }
  }

  function updateBeatDots(activeIndex) {
    const dots = els.beats.children;
    for (let i = 0; i < dots.length; i++) {
      dots[i].classList.toggle("active", i === activeIndex);
      dots[i].classList.toggle("accent", i === 0);
    }
  }

  function clearBeatDots() {
    const dots = els.beats.children;
    for (let i = 0; i < dots.length; i++) {
      dots[i].classList.remove("active");
    }
  }

  function updateRangeFill(input) {
    const min = Number(input.min);
    const max = Number(input.max);
    const val = Number(input.value);
    const pct = ((val - min) / (max - min)) * 100;
    input.style.setProperty("--fill", pct + "%");
  }

  function updateBpmUI() {
    els.bpmSlider.value = state.bpm;
    els.bpmDisplay.textContent = state.bpm;
    updateRangeFill(els.bpmSlider);

    if (state.playing && state.accel) {
      els.bpmDisplay.classList.add("accelerating");
      els.currentBpm.textContent =
        "Atual: " + state.currentBpm + " \u2192 alvo " + state.targetBpm + " BPM";
    } else {
      els.bpmDisplay.classList.remove("accelerating");
      els.currentBpm.textContent = "";
    }
  }

  function initAudio() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new Ctx();
    }
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
  }

  function scheduleClick(time, accent) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const freq = accent ? 1500 : 950;

    osc.type = "square";
    osc.frequency.setValueAtTime(freq, time);

    const peak = 0.9 * getVolumeGain();
    gain.gain.setValueAtTime(0.0001, time);
    gain.gain.exponentialRampToValueAtTime(peak || 0.0001, time + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(time);
    osc.stop(time + 0.06);

    visualQueue.push({ time: time, beat: state.beat });
  }

  function nextNote() {
    const secondsPerBeat = 60.0 / state.currentBpm;
    nextNoteTime += secondsPerBeat;
    state.beat = (state.beat + 1) % state.beatsPerBar;

    if (state.beat === 0) {
      onBarComplete();
    }
  }

  function onBarComplete() {
    if (!state.accel) return;
    state.barCount++;
    if (state.barCount >= state.everyBars) {
      state.barCount = 0;
      if (state.currentBpm < state.targetBpm) {
        state.currentBpm = Math.min(
          state.targetBpm,
          state.currentBpm + state.stepBpm
        );
        if (state.currentBpm >= state.targetBpm) {
          state.accel = false;
          els.accelToggle.checked = false;
          els.accelOptions.classList.remove("open");
        }
      }
    }
  }

  function scheduler() {
    while (nextNoteTime < audioCtx.currentTime + scheduleAheadTime) {
      const accent = state.beat === 0;
      scheduleClick(nextNoteTime, accent);
      nextNote();
    }
    lookaheadTimer = setTimeout(scheduler, lookaheadMs);
  }

  function drawVisuals() {
    const now = audioCtx ? audioCtx.currentTime : 0;
    while (visualQueue.length && visualQueue[0].time <= now) {
      const item = visualQueue.shift();
      updateBeatDots(item.beat);
      els.bpmDisplay.textContent = state.currentBpm;
    }
    if (state.playing) {
      requestAnimationFrame(drawVisuals);
    }
  }

  function start() {
    initAudio();
    state.playing = true;
    state.currentBpm = state.bpm;
    state.beat = 0;
    state.barCount = 0;
    visualQueue = [];
    nextNoteTime = audioCtx.currentTime + 0.06;

    els.playBtn.textContent = "Parar";
    els.playBtn.classList.add("playing");
    updateBpmUI();

    scheduler();
    requestAnimationFrame(drawVisuals);
  }

  function stop() {
    state.playing = false;
    clearTimeout(lookaheadTimer);
    lookaheadTimer = null;
    visualQueue = [];
    clearBeatDots();
    els.playBtn.textContent = "Iniciar";
    els.playBtn.classList.remove("playing");
    els.bpmDisplay.textContent = state.bpm;
    els.bpmDisplay.classList.remove("accelerating");
    els.currentBpm.textContent = "";
  }

  function togglePlay() {
    if (state.playing) {
      stop();
    } else {
      start();
    }
  }

  function saveConfig() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          bpm: state.bpm,
          beatsPerBar: state.beatsPerBar,
          volume: state.volume,
          muted: state.muted,
          accel: state.accel,
          targetBpm: state.targetBpm,
          stepBpm: state.stepBpm,
          everyBars: state.everyBars,
        })
      );
    } catch (e) {
      /* localStorage indisponível */
    }
  }

  function loadConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const cfg = JSON.parse(raw);
      if (typeof cfg.bpm === "number") state.bpm = clamp(cfg.bpm, 30, 300);
      if (typeof cfg.beatsPerBar === "number") state.beatsPerBar = cfg.beatsPerBar;
      if (typeof cfg.volume === "number") state.volume = clamp(cfg.volume, 0, 100);
      if (typeof cfg.muted === "boolean") state.muted = cfg.muted;
      if (typeof cfg.accel === "boolean") state.accel = cfg.accel;
      if (typeof cfg.targetBpm === "number")
        state.targetBpm = clamp(cfg.targetBpm, 30, 300);
      if (typeof cfg.stepBpm === "number") state.stepBpm = clamp(cfg.stepBpm, 1, 50);
      if (typeof cfg.everyBars === "number")
        state.everyBars = clamp(cfg.everyBars, 1, 64);
    } catch (e) {
      /* config inválida, usa padrões */
    }
  }

  function applyConfigToUI() {
    els.timeSig.value = state.beatsPerBar;
    els.accelToggle.checked = state.accel;
    els.accelOptions.classList.toggle("open", state.accel);
    els.targetBpm.value = state.targetBpm;
    els.stepBpm.value = state.stepBpm;
    els.everyBars.value = state.everyBars;
    els.volume.value = state.volume;
    els.muteBtn.classList.toggle("muted", state.muted);
    els.muteBtn.textContent = state.muted ? "\uD83D\uDD07" : "\uD83D\uDD0A";
    els.muteBtn.setAttribute("aria-pressed", String(state.muted));
    buildBeatDots();
    updateBpmUI();
    updateRangeFill(els.volume);
  }

  function setBpm(value) {
    state.bpm = clamp(Math.round(value), 30, 300);
    if (!state.playing || !state.accel) {
      state.currentBpm = state.bpm;
    }
    updateBpmUI();
    saveConfig();
  }

  els.bpmSlider.addEventListener("input", function () {
    setBpm(Number(this.value));
  });

  els.bpmMinus.addEventListener("click", function () {
    setBpm(state.bpm - 1);
  });

  els.bpmPlus.addEventListener("click", function () {
    setBpm(state.bpm + 1);
  });

  els.timeSig.addEventListener("change", function () {
    state.beatsPerBar = Number(this.value);
    state.beat = 0;
    buildBeatDots();
    saveConfig();
  });

  els.accelToggle.addEventListener("change", function () {
    state.accel = this.checked;
    els.accelOptions.classList.toggle("open", state.accel);
    saveConfig();
  });

  els.targetBpm.addEventListener("change", function () {
    state.targetBpm = clamp(Number(this.value) || 30, 30, 300);
    this.value = state.targetBpm;
    saveConfig();
  });

  els.stepBpm.addEventListener("change", function () {
    state.stepBpm = clamp(Number(this.value) || 1, 1, 50);
    this.value = state.stepBpm;
    saveConfig();
  });

  els.everyBars.addEventListener("change", function () {
    state.everyBars = clamp(Number(this.value) || 1, 1, 64);
    this.value = state.everyBars;
    saveConfig();
  });

  els.volume.addEventListener("input", function () {
    state.volume = Number(this.value);
    if (state.volume > 0 && state.muted) {
      state.muted = false;
      els.muteBtn.classList.remove("muted");
      els.muteBtn.textContent = "\uD83D\uDD0A";
      els.muteBtn.setAttribute("aria-pressed", "false");
    }
    updateRangeFill(this);
    saveConfig();
  });

  els.muteBtn.addEventListener("click", function () {
    state.muted = !state.muted;
    this.classList.toggle("muted", state.muted);
    this.textContent = state.muted ? "\uD83D\uDD07" : "\uD83D\uDD0A";
    this.setAttribute("aria-pressed", String(state.muted));
    saveConfig();
  });

  els.playBtn.addEventListener("click", togglePlay);

  document.addEventListener("keydown", function (e) {
    if (e.code === "Space") {
      e.preventDefault();
      togglePlay();
    }
  });

  loadConfig();
  applyConfigToUI();
})();
