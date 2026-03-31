'use strict';

const FLIPBOARD_CONFIG = {
  charset: ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-+/:.,!?%',
  rows: Array.from({ length: 6 }, (_, index) => ({ id: `row-${index}`, cols: 22 })),
  flipSpeedMs: 80,
  rowStaggerMs: 80,
  weatherRefreshMs: 30 * 60 * 1000,
  weatherRowId: 'row-2',
  clockRows: { time: 'row-0', date: 'row-1' },
  dualRows: { time: 'row-3', date: 'row-4', weather: 'row-5' },
  defaultCoords: { lat: 50.68, lon: 8.28 },
  defaultLocationName: 'DILLENBURG',
  weatherCycle: {
    weatherMs: 2 * 60 * 1000,
    locationMs: 30 * 1000,
  },
  presets: [
    { label: 'Standard', action: 'clock' },
    { label: 'Text', action: 'custom' },
    { label: 'Clear', action: 'clear' },
  ],
  hooks: {
    onFlipStart: null,
    onFlipComplete: null,
    onBoardIdle: null,
  },
};

const DAY_NAMES = ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA'];
const WEATHER_CODES = {
  0: 'KLAR',
  1: 'HEITER',
  2: 'BEWOELKT',
  3: 'BEDECKT',
  45: 'NEBLIG',
  48: 'REIFNEBEL',
  51: 'NIESEL',
  53: 'NIESEL',
  55: 'STARKER NIESEL',
  61: 'REGEN',
  63: 'REGEN',
  65: 'STARKER REGEN',
  71: 'SCHNEE',
  73: 'SCHNEE',
  75: 'STARKER SCHNEE',
  77: 'SCHNEEGRIESEL',
  80: 'SCHAUER',
  81: 'SCHAUER',
  82: 'STARKER SCHAUER',
  85: 'SCHNEESCHAUER',
  86: 'STARKER SCHNEESCHAUER',
  95: 'GEWITTER',
  96: 'GEWITTER',
  99: 'STARKES GEWITTER',
};

const CHARSET_LOOKUP = new Set(FLIPBOARD_CONFIG.charset.split(''));

function el(id) {
  return document.getElementById(id);
}

function setToggle(activeId, inactiveId) {
  el(activeId).classList.add('active');
  el(inactiveId).classList.remove('active');
}

function normalizeDisplayText(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/Ä/g, 'AE')
    .replace(/Ö/g, 'OE')
    .replace(/Ü/g, 'UE')
    .replace(/ß/g, 'SS')
    .replace(/\s+/g, ' ')
    .split('')
    .map(char => (CHARSET_LOOKUP.has(char) ? char : ' '))
    .join('')
    .trim();
}

function alignText(value, cols, align) {
  const text = normalizeDisplayText(value).slice(0, cols);
  const free = Math.max(0, cols - text.length);
  if (align === 'center') {
    const left = Math.floor(free / 2);
    return `${' '.repeat(left)}${text}${' '.repeat(free - left)}`;
  }
  return `${text}${' '.repeat(free)}`;
}

function wrapText(value, cols, maxLines) {
  const words = normalizeDisplayText(value).split(' ').filter(Boolean);
  const lines = [];
  let current = '';

  words.forEach(word => {
    if (!current) {
      current = word.slice(0, cols);
      return;
    }

    if (`${current} ${word}`.length <= cols) {
      current = `${current} ${word}`;
      return;
    }

    lines.push(current);
    current = word.slice(0, cols);
  });

  if (current) {
    lines.push(current);
  }

  return lines.slice(0, maxLines);
}

function getExpandedDisplayLength(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/Ä/g, 'AE')
    .replace(/Ö/g, 'OE')
    .replace(/Ü/g, 'UE')
    .replace(/ẞ/g, 'SS')
    .replace(/ß/g, 'SS')
    .length;
}

function expandBoardText(value) {
  return String(value || '')
    .toUpperCase()
    .replace(/Ä/g, 'AE')
    .replace(/Ö/g, 'OE')
    .replace(/Ü/g, 'UE')
    .replace(/ẞ/g, 'SS')
    .replace(/ß/g, 'SS')
    .split('')
    .map(char => (CHARSET_LOOKUP.has(char) ? char : ' '))
    .join('');
}

function analyzeBoardText(value, cols, maxLines) {
  const expanded = expandBoardText(value);
  const lines = [];
  let cursor = 0;

  while (cursor < expanded.length && lines.length < maxLines) {
    const remaining = expanded.slice(cursor);
    if (remaining.length <= cols) {
      lines.push(remaining);
      cursor = expanded.length;
      break;
    }

    const slice = remaining.slice(0, cols + 1);
    const breakAt = slice.lastIndexOf(' ');
    if (breakAt > 0) {
      lines.push(remaining.slice(0, breakAt));
      cursor += breakAt + 1;
      continue;
    }

    lines.push(remaining.slice(0, cols));
    cursor += cols;
  }

  const fits = cursor >= expanded.length;
  return {
    fits,
    lines: lines.slice(0, maxLines),
    expanded,
  };
}

function getRemainingBoardChars(value, cols, maxLines) {
  let remaining = 0;
  let probe = String(value || '');

  while (remaining < 132) {
    const next = `${probe}A`;
    if (!analyzeBoardText(next, cols, maxLines).fits) {
      break;
    }
    probe = next;
    remaining += 1;
  }

  return remaining;
}

function formatCoordLabel(lat, lon) {
  return `${Math.abs(lat).toFixed(2)}${lat >= 0 ? 'N' : 'S'} ${Math.abs(lon).toFixed(2)}${lon >= 0 ? 'E' : 'W'}`;
}

function choosePlaceName(address = {}) {
  return normalizeDisplayText(
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.suburb ||
    address.county ||
    address.state ||
    address.country ||
    ''
  );
}

async function fetchWeatherSummary(lat, lon) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
  );
  if (!response.ok) {
    throw new Error('Weather request failed');
  }

  const data = await response.json();
  const current = data.current || {};
  const temperature = Math.round(current.temperature_2m);
  const condition = WEATHER_CODES[current.weather_code] || 'UNBEKANNT';
  return `${temperature > 0 ? '+' : ''}${temperature}C ${condition}`;
}

async function fetchLocationSearch(query) {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=de&format=json`
  );

  if (!response.ok) {
    throw new Error('Geocoding request failed');
  }

  const data = await response.json();
  if (!Array.isArray(data.results) || data.results.length === 0) {
    throw new Error('Ort nicht gefunden');
  }

  return data.results[0];
}

async function fetchReverseLocationName(lat, lon) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=10&addressdetails=1&accept-language=de`
  );

  if (!response.ok) {
    throw new Error('Reverse geocoding request failed');
  }

  const data = await response.json();
  return choosePlaceName(data.address);
}

function createAppState(config) {
  return {
    align: 'center',
    showSeconds: false,
    soundEnabled: true,
    weatherEnabled: true,
    dualTimeEnabled: false,
    controlsVisible: false,
    theme: getDefaultTheme(),
    activePreset: 'clock',
    customText: '',
    cols: config.rows[0].cols,
  };
}

function getDefaultTheme(date = new Date()) {
  const hour = date.getHours();
  return hour >= 7 && hour < 19 ? 'light' : 'dark';
}

function createStatusController(config) {
  const dot = el('statusDot');
  const text = el('statusText');
  const controls = [el('submitBtn'), el('locationBtn'), el('dualLocationBtn')].filter(Boolean);
  let activeFlips = 0;

  function render() {
    if (activeFlips > 0) {
      dot.className = 'status-dot busy';
      if (text) {
        text.textContent = 'Flippt ...';
      }
      controls.forEach(control => {
        control.disabled = true;
      });
      return;
    }

    dot.className = 'status-dot done';
    if (text) {
      text.textContent = 'Bereit';
    }
    controls.forEach(control => {
      control.disabled = false;
    });

    if (typeof config.hooks.onBoardIdle === 'function') {
      config.hooks.onBoardIdle();
    }
  }

  render();

  return {
    startFlip() {
      activeFlips += 1;
      render();
    },
    endFlip() {
      activeFlips = Math.max(0, activeFlips - 1);
      render();
    },
    reset() {
      activeFlips = 0;
      render();
    },
  };
}

function createSoundModule(state) {
  let audioContext = null;
  let initialized = false;
  let audioBuffer = null;
  let lastFlapAt = 0;

  function getContext() {
    if (!audioContext) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) {
        return null;
      }
      audioContext = new AudioCtor();
    }

    if (audioContext.state === 'suspended') {
      audioContext.resume().catch(() => {});
    }

    return audioContext;
  }

  async function init() {
    if (initialized) {
      return;
    }

    const context = getContext();
    if (!context) {
      return;
    }

    initialized = true;

    try {
      const base64 = window.FLIPBOARD_FLAP_AUDIO_BASE64;
      if (!base64) {
        return;
      }
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index += 1) {
        bytes[index] = binary.charCodeAt(index);
      }
      audioBuffer = await context.decodeAudioData(bytes.buffer);
    } catch (error) {
      console.warn('Failed to decode flap audio:', error);
    }
  }

  function resume() {
    const context = getContext();
    if (context && context.state === 'suspended') {
      context.resume().catch(() => {});
    }
  }

  function playBuffer({ gainValue = 0.8, clipStart = 0, clipDuration = 0.12 } = {}) {
    const context = getContext();
    if (!context || !audioBuffer) {
      return false;
    }

    const source = context.createBufferSource();
    source.buffer = audioBuffer;

    const gain = context.createGain();
    gain.gain.value = gainValue;

    source.connect(gain);
    gain.connect(context.destination);
    source.start(0, clipStart, clipDuration);

    return true;
  }

  async function playTransition() {
    await playFlap(true);
  }

  async function playFlap(force = false) {
    if (!state.soundEnabled) {
      return;
    }

    const now = performance.now();
    if (!force && now - lastFlapAt < 75) {
      return;
    }

    await init();
    const context = getContext();
    if (!context || !audioBuffer) {
      return;
    }

    resume();
    const played = playBuffer({
      gainValue: 0.75,
      clipStart: 0.02,
      clipDuration: 0.12,
    });
    if (played) {
      lastFlapAt = now;
    }
  }

  return {
    click() {
      playFlap();
    },
    init,
    setEnabled(enabled) {
      state.soundEnabled = enabled;
      setToggle(enabled ? 'soundOn' : 'soundOff', enabled ? 'soundOff' : 'soundOn');
    },
  };
}

class FlipTile {
  constructor(container, options) {
    this.charset = options.charset;
    this.flipSpeedMs = options.flipSpeedMs;
    this.status = options.status;
    this.sound = options.sound;
    this.currentIndex = 0;
    this.pendingTargetIndex = 0;
    this.isFlipping = false;
    this.element = this.build();
    container.appendChild(this.element);
  }

  buildHalf(className) {
    const part = document.createElement('div');
    part.className = className;
    return part;
  }

  buildChar(container) {
    const char = document.createElement('div');
    char.className = 'char-inner';
    char.textContent = ' ';
    container.appendChild(char);
    return char;
  }

  build() {
    const tile = document.createElement('div');
    tile.className = 'flip-tile';

    this.upper = this.buildHalf('tile-upper');
    this.lower = this.buildHalf('tile-lower');
    this.frontFlap = this.buildHalf('tile-flap-front');
    this.backFlap = this.buildHalf('tile-flap-back');

    this.upperChar = this.buildChar(this.upper);
    this.lowerChar = this.buildChar(this.lower);
    this.frontChar = this.buildChar(this.frontFlap);
    this.backChar = this.buildChar(this.backFlap);

    const divider = document.createElement('div');
    divider.className = 'tile-divider';
    tile.append(this.upper, this.lower, this.frontFlap, this.backFlap, divider);
    return tile;
  }

  get currentChar() {
    return this.charset[this.currentIndex] || ' ';
  }

  reset(char = ' ') {
    const targetIndex = Math.max(0, this.charset.indexOf(char));
    this.currentIndex = targetIndex;
    this.pendingTargetIndex = targetIndex;
    this.isFlipping = false;
    this.upperChar.textContent = char;
    this.lowerChar.textContent = char;
    this.frontChar.textContent = char;
    this.backChar.textContent = char;
    this.element.classList.remove('flipping');
  }

  async flipTo(char) {
    const targetChar = this.charset.includes(char) ? char : ' ';
    this.pendingTargetIndex = Math.max(0, this.charset.indexOf(targetChar));

    if (this.isFlipping || this.currentIndex === this.pendingTargetIndex) {
      return;
    }

    this.isFlipping = true;
    this.status.startFlip();

    while (this.currentIndex !== this.pendingTargetIndex) {
      const nextIndex = (this.currentIndex + 1) % this.charset.length;
      await this.step(this.charset[nextIndex]);
      this.currentIndex = nextIndex;
    }

    this.isFlipping = false;
    this.status.endFlip();
  }

  step(nextChar) {
    return new Promise(resolve => {
      const halfDuration = this.flipSpeedMs / 2;
      const currentChar = this.currentChar;

      this.frontChar.textContent = nextChar;
      this.backChar.textContent = nextChar;
      this.upperChar.textContent = currentChar;
      this.lowerChar.textContent = currentChar;

      this.element.classList.add('flipping');
      this.frontFlap.style.transition = 'none';
      this.backFlap.style.transition = 'none';
      this.frontFlap.style.transform = 'rotateX(0deg)';
      this.backFlap.style.transform = 'rotateX(90deg)';
      void this.frontFlap.offsetHeight;

      this.frontFlap.style.transition = `transform ${halfDuration}ms linear`;
      this.frontFlap.style.transform = 'rotateX(-90deg)';

      window.setTimeout(() => {
        this.upperChar.textContent = nextChar;
        this.sound.click();
        this.backFlap.style.transition = `transform ${halfDuration}ms linear`;
        this.backFlap.style.transform = 'rotateX(0deg)';

        window.setTimeout(() => {
          this.lowerChar.textContent = nextChar;
          this.element.classList.remove('flipping');
          resolve();
        }, halfDuration);
      }, halfDuration);
    });
  }
}

function createBoard(config, state, status, sound) {
  const grid = el('boardGrid');
  const rows = new Map();

  function init() {
    grid.innerHTML = '';
    config.rows.forEach(rowDef => {
      const rowElement = document.createElement('div');
      rowElement.className = 'board-row';

      const group = document.createElement('div');
      group.className = 'tile-group';
      group.id = rowDef.id;

      const tiles = Array.from({ length: rowDef.cols }, () => new FlipTile(group, {
        charset: config.charset,
        flipSpeedMs: config.flipSpeedMs,
        status,
        sound,
      }));

      rows.set(rowDef.id, tiles);
      rowElement.appendChild(group);
      grid.appendChild(rowElement);
    });
  }

  async function setRow(rowId, text, options = {}) {
    const tiles = rows.get(rowId);
    if (!tiles) {
      return;
    }

    const rendered = alignText(text, tiles.length, state.align);
    if (typeof config.hooks.onFlipStart === 'function') {
      config.hooks.onFlipStart(rowId, rendered);
    }

    await Promise.all(tiles.map((tile, index) => {
      const target = rendered[index] || ' ';
      if (options.smart && tile.currentChar === target) {
        return Promise.resolve();
      }
      return tile.flipTo(target);
    }));

    if (typeof config.hooks.onFlipComplete === 'function') {
      config.hooks.onFlipComplete(rowId, rendered);
    }
  }

  function countPendingChanges(rowMap) {
    let changes = 0;
    Object.entries(rowMap).forEach(([rowId, text]) => {
      const tiles = rows.get(rowId);
      if (!tiles) {
        return;
      }
      const rendered = alignText(text, tiles.length, state.align);
      tiles.forEach((tile, index) => {
        if (tile.currentChar !== (rendered[index] || ' ')) {
          changes += 1;
        }
      });
    });
    return changes;
  }

  function setRows(rowMap, options = {}) {
    let delay = 0;
    const tasks = Object.entries(rowMap).map(([rowId, text]) => new Promise(resolve => {
      window.setTimeout(async () => {
        await setRow(rowId, text, options);
        resolve();
      }, delay);
      delay += options.stagger ? config.rowStaggerMs : 0;
    }));

    return Promise.all(tasks);
  }

  function clear() {
    const emptyRows = Object.fromEntries(config.rows.map(row => [row.id, '']));
    return setRows(emptyRows, { stagger: true, playTransitionSound: true });
  }

  async function repair() {
    const snapshot = {};
    rows.forEach((tiles, rowId) => {
      snapshot[rowId] = tiles.map(tile => tile.currentChar).join('');
      tiles.forEach(tile => tile.reset(' '));
    });

    status.reset();

    await setRows(
      Object.fromEntries(
        Object.entries(snapshot).map(([rowId, text]) => [rowId, text.trimEnd()])
      ),
      { stagger: true, playTransitionSound: true }
    );
  }

  async function setAllText(text) {
    const lines = analyzeBoardText(text, state.cols, config.rows.length).lines;
    const rowMap = {};
    config.rows.forEach((row, index) => {
      rowMap[row.id] = lines[index] || '';
    });
    await setRows(rowMap, { stagger: true, playTransitionSound: true });
  }

  return {
    init,
    setRow,
    setRows,
    clear,
    repair,
    setAllText,
  };
}

function createWeatherModule(config, state, board) {
  let refreshTimer = null;
  let cycleTimer = null;
  let requestVersion = 0;
  let running = false;
  let showingLocation = false;
  let lat = config.defaultCoords.lat;
  let lon = config.defaultCoords.lon;
  let locationName = config.defaultLocationName;
  let weatherText = 'LADEN...';

  function renderLocationStatus(label) {
    const target = el('weatherLocationValue');
    if (!target) {
      return;
    }
    target.textContent = normalizeDisplayText(label) || 'UNBEKANNT';
    target.title = target.textContent;
  }

  function stopTimers() {
    window.clearTimeout(cycleTimer);
    window.clearInterval(refreshTimer);
    cycleTimer = null;
    refreshTimer = null;
  }

  async function fetchWeatherData() {
    weatherText = await fetchWeatherSummary(lat, lon);
  }

  async function resolveLocationName() {
    try {
      locationName = (await fetchReverseLocationName(lat, lon)) || formatCoordLabel(lat, lon);
    } catch (error) {
      locationName = formatCoordLabel(lat, lon);
    }

    renderLocationStatus(locationName);
  }

  function renderWeather() {
    if (!running || !state.weatherEnabled) {
      return;
    }
    showingLocation = false;
    board.setRow(config.weatherRowId, weatherText, { smart: true });
  }

  function renderLocation() {
    if (!running || !state.weatherEnabled) {
      return;
    }
    showingLocation = true;
    board.setRow(config.weatherRowId, locationName, { smart: true });
  }

  function startCycle() {
    stopTimers();

    const showWeatherPhase = () => {
      renderWeather();
      cycleTimer = window.setTimeout(showLocationPhase, config.weatherCycle.weatherMs);
    };

    const showLocationPhase = () => {
      renderLocation();
      cycleTimer = window.setTimeout(showWeatherPhase, config.weatherCycle.locationMs);
    };

    showWeatherPhase();
    refreshTimer = window.setInterval(async () => {
      try {
        await fetchWeatherData();
        if (!showingLocation) {
          renderWeather();
        }
      } catch (error) {
        weatherText = 'WETTER N/A';
        if (!showingLocation) {
          renderWeather();
        }
      }
    }, config.weatherRefreshMs);
  }

  async function refreshData() {
    const version = ++requestVersion;
    try {
      await Promise.all([fetchWeatherData(), resolveLocationName()]);
    } catch (error) {
      weatherText = 'WETTER N/A';
    }

    if (!running || version !== requestVersion) {
      return;
    }

    startCycle();
  }

  function locateUser() {
    if (!('geolocation' in navigator)) {
      refreshData();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        refreshData();
      },
      () => {
        refreshData();
      },
      { maximumAge: 5 * 60 * 1000, timeout: 5000 }
    );
  }

  async function start() {
    if (!state.weatherEnabled || running) {
      return;
    }
    running = true;
    locateUser();
  }

  async function stop() {
    running = false;
    requestVersion += 1;
    stopTimers();
    await board.setRow(config.weatherRowId, '', { smart: true });
  }

  async function setEnabled(enabled) {
    state.weatherEnabled = enabled;
    setToggle(enabled ? 'weatherOn' : 'weatherOff', enabled ? 'weatherOff' : 'weatherOn');
    if (!enabled) {
      await stop();
      return;
    }
    if (state.activePreset === 'clock') {
      running = false;
      await start();
    }
  }

  async function setLocation(query) {
    if (!normalizeDisplayText(query)) {
      return;
    }

    if (!state.weatherEnabled) {
      await setEnabled(true);
    }

    running = true;
    stopTimers();
    const version = ++requestVersion;
    renderLocationStatus(`SUCHE ${query}`);

    try {
      const result = await fetchLocationSearch(query);
      lat = result.latitude;
      lon = result.longitude;
      locationName = normalizeDisplayText(result.name || query) || formatCoordLabel(lat, lon);
      renderLocationStatus(locationName);
      await fetchWeatherData();

      if (!running || version !== requestVersion) {
        return;
      }

      startCycle();
    } catch (error) {
      console.warn('Weather lookup failed:', error);
      weatherText = 'WETTER N/A';
      renderWeather();
    }
  }

  function refresh() {
    if (!running || !state.weatherEnabled) {
      return;
    }
    if (showingLocation) {
      renderLocation();
      return;
    }
    renderWeather();
  }

  function syncDisplayMode() {
    if (!running || !state.weatherEnabled) {
      return;
    }
    startCycle();
  }

  return {
    start,
    stop,
    refresh,
    setEnabled,
    setLocation,
    renderLocationStatus,
    syncDisplayMode,
    get running() {
      return running;
    },
  };
}

function createDualTimeModule(config, state, board, weather) {
  let refreshTimer = null;
  let requestVersion = 0;
  let running = false;
  let lat = null;
  let lon = null;
  let timeZone = null;
  let locationName = '';
  let weatherText = '';
  let hasLocation = false;

  function renderLocationStatus(label) {
    const target = el('dualLocationValue');
    if (!target) {
      return;
    }
    target.textContent = normalizeDisplayText(label) || 'NICHT GESETZT';
    target.title = target.textContent;
  }

  function clearRows() {
    return board.setRows({
      [config.dualRows.time]: '',
      [config.dualRows.date]: '',
      [config.dualRows.weather]: '',
    }, { smart: true });
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function formatParts(date) {
    const formatter = new Intl.DateTimeFormat('de-DE', {
      timeZone,
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const lookup = {};
    parts.forEach(part => {
      if (part.type !== 'literal') {
        lookup[part.type] = part.value;
      }
    });

    return {
      time: `${lookup.hour}:${lookup.minute}`,
      date: `${normalizeDisplayText(lookup.weekday).slice(0, 2)} ${lookup.day}.${lookup.month}.${lookup.year}`,
    };
  }

  async function fetchWeatherData() {
    if (lat === null || lon === null || !state.weatherEnabled) {
      return;
    }

    weatherText = await fetchWeatherSummary(lat, lon);
  }

  function renderTime(date = new Date()) {
    if (!running || !state.dualTimeEnabled || !timeZone) {
      return;
    }

    const parts = formatParts(date);
    board.setRows({
      [config.dualRows.time]: `${parts.time} ${locationName}`,
      [config.dualRows.date]: parts.date,
      [config.dualRows.weather]: weatherText || 'WETTER LAEDT',
    }, { smart: true });
  }

  function stopTimer() {
    window.clearInterval(refreshTimer);
    refreshTimer = null;
  }

  function renderState() {
    const visualMode = state.dualTimeEnabled && state.activePreset === 'clock';
    document.documentElement.classList.toggle('dual-time-active', visualMode);
    setToggle(state.dualTimeEnabled ? 'dualOn' : 'dualOff', state.dualTimeEnabled ? 'dualOff' : 'dualOn');
  }

  async function refreshWeather() {
    if (!state.weatherEnabled) {
      weatherText = 'WETTER AUS';
      renderTime();
      return;
    }

    try {
      await fetchWeatherData();
    } catch (error) {
      weatherText = 'WETTER N/A';
    }

    renderTime();
  }

  function start() {
    running = true;
    if (!state.dualTimeEnabled || !timeZone || !hasLocation) {
      clearRows();
      return;
    }

    renderTime();
    stopTimer();
    if (state.weatherEnabled) {
      refreshTimer = window.setInterval(refreshWeather, config.weatherRefreshMs);
    }
  }

  async function stop() {
    running = false;
    stopTimer();
    await clearRows();
  }

  function refresh() {
    if (!running || !state.dualTimeEnabled || !timeZone) {
      return;
    }

    renderTime();
  }

  async function setLocation(query) {
    if (!normalizeDisplayText(query)) {
      return;
    }

    state.dualTimeEnabled = true;
    renderState();
    weather.syncDisplayMode();
    renderLocationStatus(`SUCHE ${query}`);
    const version = ++requestVersion;

    try {
      const result = await fetchLocationSearch(query);
      lat = result.latitude;
      lon = result.longitude;
      timeZone = result.timezone || 'Europe/Berlin';
      locationName = normalizeDisplayText(result.name || query) || formatCoordLabel(lat, lon);
      if (state.weatherEnabled) {
        weatherText = await fetchWeatherSummary(lat, lon);
      } else {
        weatherText = 'WETTER AUS';
      }
      hasLocation = true;
      renderLocationStatus(locationName);

      if (version !== requestVersion) {
        return;
      }

      running = true;
      start();
    } catch (error) {
      console.warn('Dual time lookup failed:', error);
      renderLocationStatus('NICHT GEFUNDEN');
    }
  }

  return {
    start,
    stop,
    refresh,
    setLocation,
    renderLocationStatus,
    async setEnabled(enabled) {
      if (!enabled) {
        await stop();
        state.dualTimeEnabled = false;
        renderState();
        weather.syncDisplayMode();
        return;
      }
      state.dualTimeEnabled = true;
      renderState();
      weather.syncDisplayMode();
      start();
    },
    async syncWeatherState() {
      stopTimer();

      if (!state.dualTimeEnabled || !hasLocation) {
        return;
      }

      if (!state.weatherEnabled) {
        weatherText = 'WETTER AUS';
        renderTime();
        return;
      }

      await refreshWeather();
      if (running) {
        refreshTimer = window.setInterval(refreshWeather, config.weatherRefreshMs);
      }
    },
    renderState,
    get enabled() {
      return state.dualTimeEnabled;
    },
  };
}

function createClockModule(config, state, board, weather, dualTime) {
  let intervalId = null;
  let alignmentTimeoutId = null;
  let running = false;

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function formatTime(date) {
    return state.showSeconds
      ? `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
      : `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function formatDate(date) {
    return `${DAY_NAMES[date.getDay()]} ${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;
  }

  function tick() {
    if (!running) {
      return;
    }
    const now = new Date();
    board.setRow(config.clockRows.time, formatTime(now), { smart: true });
    board.setRow(config.clockRows.date, formatDate(now), { smart: true });
    dualTime.refresh();
  }

  function start() {
    if (running) {
      return;
    }

    running = true;
    tick();
    if (state.weatherEnabled) {
      weather.start();
    }
    dualTime.start();

    alignmentTimeoutId = window.setTimeout(() => {
      if (!running) {
        return;
      }
      tick();
      intervalId = window.setInterval(tick, 1000);
    }, 1000 - (Date.now() % 1000));
  }

  function stop() {
    running = false;
    window.clearTimeout(alignmentTimeoutId);
    window.clearInterval(intervalId);
    alignmentTimeoutId = null;
    intervalId = null;
    weather.stop();
    dualTime.stop();
  }

  function refresh() {
    if (!running) {
      return;
    }
    tick();
    weather.refresh();
    dualTime.refresh();
  }

  return {
    start,
    stop,
    refresh,
    get running() {
      return running;
    },
  };
}

function createPresetController(config, state, board, clock) {
  const wrap = el('presets');
  const buttons = new Map();
  let onChange = null;

  function markPreset(action) {
    state.activePreset = action;
    buttons.forEach((button, key) => {
      button.classList.toggle('active', key === action);
    });
    if (typeof onChange === 'function') {
      onChange(action);
    }
  }

  async function runPreset(action) {
    switch (action) {
      case 'clock':
        clock.start();
        markPreset('clock');
        return;
      case 'repair':
        await board.repair();
        return;
      case 'clear':
        clock.stop();
        await board.clear();
        markPreset('clear');
        return;
      case 'custom':
        markPreset('custom');
        if (el('customInput')) {
          el('customInput').focus();
          el('customInput').select();
        }
        return;
      default:
        break;
    }
  }

  function init() {
    wrap.innerHTML = '';
    config.presets.forEach(preset => {
      const button = document.createElement('button');
      button.className = 'ctrl-btn';
      button.textContent = preset.label;
      button.dataset.action = preset.action;
      button.addEventListener('click', () => {
        runPreset(preset.action);
      });
      buttons.set(preset.action, button);
      wrap.appendChild(button);
    });
  }

  return {
    init,
    runPreset,
    markPreset,
    setOnChange(handler) {
      onChange = handler;
    },
  };
}

function createThemeController(state) {
  function render() {
    const isLight = state.theme === 'light';
    const button = el('themeBtn');
    document.documentElement.classList.toggle('light', isLight);
    if (button) {
      button.textContent = isLight ? '\u2600' : '\u263D';
      button.setAttribute('aria-label', isLight ? 'Light Mode aktiv' : 'Dark Mode aktiv');
      button.setAttribute('title', isLight ? 'Light Mode aktiv' : 'Dark Mode aktiv');
    }
  }

  return {
    toggle() {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      render();
    },
    render,
  };
}

function createGreetingController() {
  function getGreeting(hour) {
    if (hour >= 5 && hour < 11) {
      return 'Guten Morgen.';
    }
    if (hour >= 11 && hour < 17) {
      return 'Guten Mittag.';
    }
    if (hour >= 17 && hour < 22) {
      return 'Guten Abend.';
    }
    return 'Gute Nacht.';
  }

  return {
    render(date = new Date()) {
      const target = el('greetingTitle');
      if (!target) {
        return;
      }
      target.textContent = getGreeting(date.getHours());
    },
  };
}

function createControlsOverlayController(state) {
  function scrollToY(top) {
    window.scrollTo({
      top: Math.max(0, Math.round(top)),
      behavior: 'smooth',
    });
  }

  function getTop(target) {
    if (!target) {
      return 0;
    }
    return target.getBoundingClientRect().top + window.scrollY;
  }

  function render() {
    const overlay = el('controlsOverlay');
    const toggle = el('controlsToggle');
    if (!overlay || !toggle) {
      return;
    }

    overlay.classList.toggle('open', state.controlsVisible);
    overlay.setAttribute('aria-hidden', String(!state.controlsVisible));
    toggle.setAttribute('aria-expanded', String(state.controlsVisible));
  }

  return {
    toggle() {
      state.controlsVisible = !state.controlsVisible;
      render();
      if (state.controlsVisible) {
        window.setTimeout(() => {
          const overlay = el('controlsOverlay');
          scrollToY(getTop(overlay) - 20);
        }, 260);
      } else {
        const toggleButton = el('controlsToggle');
        scrollToY(getTop(toggleButton) - 28);
      }
    },
    close() {
      state.controlsVisible = false;
      render();
      window.setTimeout(() => {
        const toggleButton = el('controlsToggle');
        scrollToY(getTop(toggleButton) - 28);
      }, 120);
    },
    render,
  };
}

function createHelpController() {
  let open = false;

  function render() {
    const fab = el('helpFab');
    const panel = el('helpPanel');
    if (!fab || !panel) {
      return;
    }

    fab.setAttribute('aria-expanded', String(open));
    panel.setAttribute('aria-hidden', String(!open));
    panel.classList.toggle('open', open);
  }

  return {
    toggle() {
      open = !open;
      render();
    },
    close() {
      if (!open) {
        return;
      }
      open = false;
      render();
    },
    render,
    contains(target) {
      const fab = el('helpFab');
      const panel = el('helpPanel');
      return Boolean(
        target &&
        ((fab && fab.contains(target)) || (panel && panel.contains(target)))
      );
    },
  };
}

function createFullscreenController() {
  async function enter() {
    const target = el('boardSection');
    if (!target || !target.requestFullscreen) {
      return;
    }

    await target.requestFullscreen().catch(() => {});
  }

  async function exit() {
    if (!document.fullscreenElement) {
      return;
    }

    await document.exitFullscreen().catch(() => {});
  }

  return {
    async toggle() {
      if (document.fullscreenElement) {
        await exit();
        return;
      }
      await enter();
    },
    exit,
  };
}

function createOledProtectionController() {
  const positions = [
    { x: 0, y: 0 },
    { x: 3, y: -2 },
    { x: -2, y: 3 },
    { x: 4, y: 2 },
    { x: -3, y: -3 },
    { x: 2, y: 4 },
    { x: -4, y: 1 },
    { x: 1, y: -4 },
  ];
  let index = 0;
  let intervalId = 0;

  function applyCurrentPosition() {
    const section = el('boardSection');
    const current = positions[index];
    if (!section || !current) {
      return;
    }

    section.style.setProperty('--burn-x', `${current.x}px`);
    section.style.setProperty('--burn-y', `${current.y}px`);
  }

  function step() {
    index = (index + 1) % positions.length;
    applyCurrentPosition();
  }

  function start() {
    applyCurrentPosition();
    if (intervalId) {
      window.clearInterval(intervalId);
    }

    intervalId = window.setInterval(() => {
      if (!document.hidden) {
        step();
      }
    }, 45000);
  }

  return {
    boot() {
      start();
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          step();
        }
      });
      document.addEventListener('fullscreenchange', applyCurrentPosition);
    },
  };
}

function createHistoryStore() {
  const keys = {
    custom: 'flipboard.customHistory',
    dual: 'flipboard.dualHistory',
  };

  function read(key) {
    try {
      const raw = window.localStorage.getItem(key);
      const parsed = JSON.parse(raw || '[]');
      return Array.isArray(parsed) ? parsed.filter(Boolean).slice(0, 3) : [];
    } catch (error) {
      return [];
    }
  }

  function write(key, values) {
    try {
      window.localStorage.setItem(key, JSON.stringify(values.slice(0, 3)));
    } catch (error) {
      // ignore storage failures
    }
  }

  function push(type, value) {
    const normalized = String(value || '').trim();
    if (!normalized) {
      return read(keys[type]);
    }

    const next = [normalized, ...read(keys[type]).filter(entry => entry !== normalized)].slice(0, 3);
    write(keys[type], next);
    return next;
  }

  function remove(type, value) {
    const normalized = String(value || '').trim();
    const next = read(keys[type]).filter(entry => entry !== normalized);
    write(keys[type], next);
    return next;
  }

  return {
    get(type) {
      return read(keys[type]);
    },
    push,
    remove,
  };
}

function createHistoryController(store) {
  const bindings = {
    custom: { containerId: 'customHistory', inputId: 'customInput' },
    dual: { containerId: 'dualHistory', inputId: 'dualLocationInput' },
  };

  function render(type, onSelect) {
    const binding = bindings[type];
    const wrap = el(binding.containerId);
    if (!wrap) {
      return;
    }

    wrap.innerHTML = '';
    store.get(type).forEach(entry => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'history-chip';
      button.title = entry;

      const label = document.createElement('span');
      label.className = 'history-chip-label';
      label.textContent = normalizeDisplayText(entry) || entry;

      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'history-chip-delete';
      removeButton.setAttribute('aria-label', `${entry} entfernen`);
      removeButton.title = 'Entfernen';

      const removeShadow = document.createElement('span');
      removeShadow.className = 'history-chip-delete-shadow';
      removeButton.appendChild(removeShadow);

      const removeIcon = document.createElement('span');
      removeIcon.className = 'history-chip-delete-icon';
      removeIcon.textContent = '✕';
      removeButton.appendChild(removeIcon);

      removeButton.addEventListener('click', event => {
        event.stopPropagation();
        store.remove(type, entry);
        render(type, onSelect);
      });

      button.append(label, removeButton);
      button.addEventListener('click', () => {
        const input = el(binding.inputId);
        if (input) {
          input.value = entry;
          input.focus();
        }
        onSelect(entry);
      });
      wrap.appendChild(button);
    });
  }

  return {
    save(type, value, onSelect) {
      store.push(type, value);
      render(type, onSelect);
    },
    render,
  };
}

function createApp(config) {
  const state = createAppState(config);
  const status = createStatusController(config);
  const sound = createSoundModule(state);
  const board = createBoard(config, state, status, sound);
  const weather = createWeatherModule(config, state, board);
  const dualTime = createDualTimeModule(config, state, board, weather);
  const clock = createClockModule(config, state, board, weather, dualTime);
  const presets = createPresetController(config, state, board, clock);
  const theme = createThemeController(state);
  const greeting = createGreetingController();
  const controlsOverlay = createControlsOverlayController(state);
  const help = createHelpController();
  const fullscreen = createFullscreenController();
  const oledProtection = createOledProtectionController();
  const historyStore = createHistoryStore();
  const history = createHistoryController(historyStore);

  async function refreshCurrentView() {
    if (state.activePreset === 'custom' && state.customText) {
      await board.setAllText(state.customText);
      return;
    }

    clock.refresh();
  }

  function updateCustomInputMeta() {
    const meta = el('customInputMeta');
    const input = el('customInput');
    if (!meta || !input) {
      return;
    }

    meta.textContent = `Rest: ${getRemainingBoardChars(input.value, state.cols, config.rows.length)}`;
  }

  function renderUiState() {
    setToggle(state.showSeconds ? 'secOn' : 'secOff', state.showSeconds ? 'secOff' : 'secOn');
    setToggle(state.align === 'left' ? 'alignLeft' : 'alignCenter', state.align === 'left' ? 'alignCenter' : 'alignLeft');
    setToggle(state.soundEnabled ? 'soundOn' : 'soundOff', state.soundEnabled ? 'soundOff' : 'soundOn');
    setToggle(state.weatherEnabled ? 'weatherOn' : 'weatherOff', state.weatherEnabled ? 'weatherOff' : 'weatherOn');
    dualTime.renderState();
    theme.render();
    greeting.render();
    controlsOverlay.render();
    help.render();
  }

  function bindEvents() {
    const enforceCustomInputLimit = input => {
      if (!input) {
        return;
      }

      let value = input.value;
      while (!analyzeBoardText(value, state.cols, config.rows.length).fits) {
        value = value.slice(0, -1);
      }

      if (value !== input.value) {
        input.value = value;
      }
    };

    const isTypingTarget = target => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }

      return (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      );
    };

    const primeAudio = () => {
      sound.init();
      document.removeEventListener('pointerdown', primeAudio);
      document.removeEventListener('keydown', primeAudio);
    };

    document.addEventListener('pointerdown', primeAudio, { once: true });
    document.addEventListener('keydown', primeAudio, { once: true });
    document.addEventListener('keydown', event => {
      if (isTypingTarget(event.target)) {
        return;
      }

      if (event.key === 'f' || event.key === 'F') {
        event.preventDefault();
        fullscreen.toggle();
        return;
      }

      if (event.key === 'Escape' && document.fullscreenElement) {
        fullscreen.exit();
        return;
      }

      if (event.key === 'Escape') {
        help.close();
      }
    });

    document.addEventListener('pointerdown', event => {
      if (!help.contains(event.target)) {
        help.close();
      }
    });

    el('themeBtn').addEventListener('click', () => theme.toggle());
    el('controlsToggle').addEventListener('click', () => controlsOverlay.toggle());
    el('controlsCollapse').addEventListener('click', () => controlsOverlay.close());
    el('helpFab').addEventListener('click', event => {
      event.stopPropagation();
      help.toggle();
    });
    el('customInput').addEventListener('input', event => {
      enforceCustomInputLimit(event.currentTarget);
      updateCustomInputMeta();
    });
    el('soundOn').addEventListener('click', () => sound.setEnabled(true));
    el('soundOff').addEventListener('click', () => sound.setEnabled(false));

    el('secOn').addEventListener('click', () => {
      state.showSeconds = true;
      renderUiState();
      refreshCurrentView();
      updateCustomInputMeta();
    });

    el('secOff').addEventListener('click', () => {
      state.showSeconds = false;
      renderUiState();
      refreshCurrentView();
      updateCustomInputMeta();
    });

    el('alignLeft').addEventListener('click', () => {
      state.align = 'left';
      renderUiState();
      refreshCurrentView();
      updateCustomInputMeta();
    });

    el('alignCenter').addEventListener('click', () => {
      state.align = 'center';
      renderUiState();
      refreshCurrentView();
      updateCustomInputMeta();
    });

    el('weatherOn').addEventListener('click', async () => {
      await weather.setEnabled(true);
      await dualTime.syncWeatherState();
      renderUiState();
    });

    el('weatherOff').addEventListener('click', async () => {
      await weather.setEnabled(false);
      await dualTime.syncWeatherState();
      renderUiState();
    });

    el('dualOn').addEventListener('click', async () => {
      await dualTime.setEnabled(true);
      renderUiState();
    });

    el('dualOff').addEventListener('click', async () => {
      await dualTime.setEnabled(false);
      renderUiState();
    });

    const runLocationSearch = async () => {
      const value = el('locationInput').value.trim();
      if (!value) {
        return;
      }
      await weather.setLocation(value);
      el('locationInput').value = '';
      el('locationInput').blur();
    };

    el('locationBtn').addEventListener('click', runLocationSearch);
    el('locationInput').addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        runLocationSearch();
      }
    });

    const runDualLocationSearch = async () => {
      const value = el('dualLocationInput').value.trim();
      if (!value) {
        return;
      }
      await dualTime.setLocation(value);
      history.save('dual', value, runDualLocationSearchFromHistory);
      el('dualLocationInput').value = '';
      el('dualLocationInput').blur();
    };

    const runDualLocationSearchFromHistory = async value => {
      if (!value) {
        return;
      }
      await dualTime.setLocation(value);
    };

    el('dualLocationBtn').addEventListener('click', runDualLocationSearch);
    el('dualLocationInput').addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        runDualLocationSearch();
      }
    });

    const submitCustomText = async () => {
      const input = el('customInput');
      enforceCustomInputLimit(input);
      const value = input.value.trim();
      if (!value) {
        return;
      }
      clock.stop();
      state.customText = value;
      presets.markPreset('custom');
      renderUiState();
      await board.setAllText(value);
      history.save('custom', value, submitCustomTextFromHistory);
      input.value = '';
      updateCustomInputMeta();
    };

    const submitCustomTextFromHistory = async value => {
      if (!value) {
        return;
      }
      clock.stop();
      state.customText = value;
      presets.markPreset('custom');
      renderUiState();
      await board.setAllText(value);
    };

    el('submitBtn').addEventListener('click', submitCustomText);
    el('customInput').addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        submitCustomText();
      }
    });
  }

  function exposeApi() {
    window.FlipboardApp = {
      config,
      state,
      startClock() {
        return presets.runPreset('clock');
      },
      stopClock() {
        clock.stop();
      },
      clear() {
        return presets.runPreset('clear');
      },
      repair() {
        return presets.runPreset('repair');
      },
      setRow(rowId, text, smart = false) {
        return board.setRow(rowId, text, { smart });
      },
      setRows(rowMap, smart = false) {
        return board.setRows(rowMap, { smart, stagger: true });
      },
      setText(text) {
        clock.stop();
        return board.setAllText(text);
      },
      setLocation(city) {
        return weather.setLocation(city);
      },
      enableWeather(enabled) {
        return weather.setEnabled(Boolean(enabled));
      },
      modules: {
        board,
        clock,
        weather,
        dualTime,
      },
    };
  }

  function boot() {
    board.init();
    presets.init();
    presets.setOnChange(() => {
      dualTime.renderState();
    });
    weather.renderLocationStatus(config.defaultLocationName);
    dualTime.renderLocationStatus('NICHT GESETZT');
    history.render('custom', async value => {
      clock.stop();
      await board.setAllText(value);
      presets.markPreset('custom');
    });
    history.render('dual', async value => {
      await dualTime.setLocation(value);
    });
    renderUiState();
    updateCustomInputMeta();
    bindEvents();
    exposeApi();
    oledProtection.boot();
    window.setTimeout(() => {
      presets.runPreset('clock');
    }, 300);
  }

  return { boot };
}

document.addEventListener('DOMContentLoaded', () => {
  createApp(FLIPBOARD_CONFIG).boot();
});
