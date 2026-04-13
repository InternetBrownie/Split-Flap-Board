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
    { labelKey: 'presetClock', action: 'clock' },
    { labelKey: 'presetCustom', action: 'custom' },
    { labelKey: 'presetClear', action: 'clear' },
  ],
  hooks: {
    onFlipStart: null,
    onFlipComplete: null,
    onBoardIdle: null,
  },
};

const LANGUAGE_STORAGE_KEY = 'flipboard.language';
const SUPPORTED_LANGUAGES = ['en', 'de'];
const DAY_NAMES = {
  de: ['SO', 'MO', 'DI', 'MI', 'DO', 'FR', 'SA'],
  en: ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'],
};
const WEATHER_CODES = {
  de: {
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
  },
  en: {
    0: 'CLEAR',
    1: 'FAIR',
    2: 'CLOUDY',
    3: 'OVERCAST',
    45: 'FOG',
    48: 'RIME FOG',
    51: 'DRIZZLE',
    53: 'DRIZZLE',
    55: 'HVY DRIZZLE',
    61: 'RAIN',
    63: 'RAIN',
    65: 'HVY RAIN',
    71: 'SNOW',
    73: 'SNOW',
    75: 'HVY SNOW',
    77: 'SNOW GRAINS',
    80: 'SHOWERS',
    81: 'SHOWERS',
    82: 'HVY SHOWERS',
    85: 'SNOW SHOWERS',
    86: 'HVY SNOW SHWRS',
    95: 'T STORM',
    96: 'T STORM',
    99: 'HVY T STORM',
  },
};
const UI_STRINGS = {
  de: {
    appTitle: 'Daily Hub Board',
    headerTagline: 'Retro Split-Flap Dashboard',
    languageButton: 'DE',
    languageLabel: 'Sprache auf Deutsch stellen',
    themeLight: 'Light Mode aktiv',
    themeDark: 'Dark Mode aktiv',
    greetingMorning: 'Guten Morgen.',
    greetingNoon: 'Guten Mittag.',
    greetingEvening: 'Guten Abend.',
    greetingNight: 'Gute Nacht.',
    controlsShow: 'Steuerung einblenden',
    controlsHide: 'Steuerung schließen',
    boardControls: 'Board steuern',
    display: 'Anzeige',
    weather: 'Wetter',
    dualTime: 'Dual-Time',
    customPlaceholder: 'Eigenen Text eingeben ...',
    submit: 'Setzen',
    remaining: 'Rest',
    seconds: 'Sekunden',
    sound: 'Sound',
    alignment: 'Ausrichtung',
    left: 'Links',
    center: 'Mitte',
    on: 'Ein',
    off: 'Aus',
    location: 'Standort',
    place: 'Ort',
    search: 'Suchen',
    add: 'Hinzufügen',
    current: 'Aktuell',
    secondPlace: 'Zweitort',
    notSet: 'NICHT GESETZT',
    help: 'Hilfe',
    helpOpen: 'Hilfe öffnen',
    fullscreenOpen: 'Vollbild öffnen',
    fullscreenClose: 'Vollbild schließen',
    helpWeatherTitle: 'Wetter:',
    helpWeatherBody: 'Open-Meteo. Für Ortssuche und Ortsauflösung nutzt die App Open-Meteo Geocoding sowie Nominatim / OpenStreetMap.',
    helpFullscreenTitle: 'Vollbild:',
    helpFullscreenBody: 'Mit der Taste F startest und beendest du den Vollbildmodus.',
    statusBusy: 'Flippt ...',
    statusReady: 'Bereit',
    presetClock: 'Standard',
    presetCustom: 'Text',
    presetClear: 'Clear',
    locationUnknown: 'UNBEKANNT',
    locationSearchPrefix: 'SUCHE',
    weatherLoading: 'LADEN...',
    weatherUnavailable: 'WETTER N/A',
    weatherOff: 'WETTER AUS',
    weatherLoadingBoard: 'WETTER LAEDT',
    notFound: 'NICHT GEFUNDEN',
    placeNotFoundError: 'Ort nicht gefunden',
    removeEntry: 'Entfernen',
    removeEntryAria: '{value} entfernen',
  },
  en: {
    appTitle: 'Daily Hub Board',
    headerTagline: 'Retro Split-Flap Dashboard',
    languageButton: 'EN',
    languageLabel: 'Switch language to English',
    themeLight: 'Light mode active',
    themeDark: 'Dark mode active',
    greetingMorning: 'Good morning.',
    greetingNoon: 'Good afternoon.',
    greetingEvening: 'Good evening.',
    greetingNight: 'Good night.',
    controlsShow: 'Show controls',
    controlsHide: 'Hide controls',
    boardControls: 'Board controls',
    display: 'Display',
    weather: 'Weather',
    dualTime: 'Dual Time',
    customPlaceholder: 'Enter custom text ...',
    submit: 'Set',
    remaining: 'Left',
    seconds: 'Seconds',
    sound: 'Sound',
    alignment: 'Alignment',
    left: 'Left',
    center: 'Center',
    on: 'On',
    off: 'Off',
    location: 'Location',
    place: 'Place',
    search: 'Search',
    add: 'Add',
    current: 'Current',
    secondPlace: 'Second place',
    notSet: 'NOT SET',
    help: 'Help',
    helpOpen: 'Open help',
    fullscreenOpen: 'Open fullscreen',
    fullscreenClose: 'Close fullscreen',
    helpWeatherTitle: 'Weather:',
    helpWeatherBody: 'Open-Meteo powers weather, place search, and reverse geocoding with Nominatim / OpenStreetMap.',
    helpFullscreenTitle: 'Fullscreen:',
    helpFullscreenBody: 'Press F to enter or exit fullscreen mode.',
    statusBusy: 'Flipping ...',
    statusReady: 'Ready',
    presetClock: 'Standard',
    presetCustom: 'Text',
    presetClear: 'Clear',
    locationUnknown: 'UNKNOWN',
    locationSearchPrefix: 'SEARCH',
    weatherLoading: 'LOADING...',
    weatherUnavailable: 'WEATHER N/A',
    weatherOff: 'WEATHER OFF',
    weatherLoadingBoard: 'WEATHER LOADS',
    notFound: 'NOT FOUND',
    placeNotFoundError: 'Place not found',
    removeEntry: 'Remove',
    removeEntryAria: 'Remove {value}',
  },
};

const CHARSET_LOOKUP = new Set(FLIPBOARD_CONFIG.charset.split(''));

function detectInitialLanguage() {
  try {
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (SUPPORTED_LANGUAGES.includes(stored)) {
      return stored;
    }
  } catch (error) {
    // ignore storage errors
  }

  const browserLanguages = []
    .concat(navigator.languages || [])
    .concat(navigator.language || [])
    .filter(Boolean)
    .map(value => String(value).toLowerCase());

  return browserLanguages.some(value => value.startsWith('de')) ? 'de' : 'en';
}

function setStoredLanguage(language) {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    // ignore storage errors
  }
}

function getLocale(language) {
  return language === 'de' ? 'de-DE' : 'en-US';
}

function t(language, key, params = {}) {
  const template = (UI_STRINGS[language] && UI_STRINGS[language][key]) || UI_STRINGS.en[key] || key;
  return Object.entries(params).reduce(
    (output, [paramKey, value]) => output.replace(`{${paramKey}}`, value),
    template
  );
}

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

async function fetchWeatherSummary(lat, lon, language) {
  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`
  );
  if (!response.ok) {
    throw new Error('Weather request failed');
  }

  const data = await response.json();
  const current = data.current || {};
  const temperature = Math.round(current.temperature_2m);
  const labels = WEATHER_CODES[language] || WEATHER_CODES.en;
  const condition = labels[current.weather_code] || t(language, 'locationUnknown');
  return `${temperature > 0 ? '+' : ''}${temperature}C ${condition}`;
}

async function fetchLocationSearch(query, language) {
  const results = await fetchLocationSuggestions(query, language, 1);
  if (!results.length) {
    throw new Error(t(language, 'placeNotFoundError'));
  }
  return results[0];
}

async function fetchLocationSuggestions(query, language, count = 5) {
  const response = await fetch(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=${count}&language=${language}&format=json`
  );

  if (!response.ok) {
    throw new Error('Geocoding request failed');
  }

  const data = await response.json();
  return Array.isArray(data.results) ? data.results : [];
}

async function fetchReverseLocationName(lat, lon, language) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&zoom=10&addressdetails=1&accept-language=${language}`
  );

  if (!response.ok) {
    throw new Error('Reverse geocoding request failed');
  }

  const data = await response.json();
  return choosePlaceName(data.address);
}

function createAppState(config) {
  return {
    language: detectInitialLanguage(),
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

function formatLocationSuggestion(result, language) {
  const parts = [
    result.name,
    result.admin1,
    result.country,
  ]
    .map(value => String(value || '').trim())
    .filter(Boolean);

  const label = parts.join(', ');
  return label || (language === 'de' ? 'Unbekannter Ort' : 'Unknown place');
}

function getDefaultTheme(date = new Date()) {
  const hour = date.getHours();
  return hour >= 7 && hour < 19 ? 'light' : 'dark';
}

function createStatusController(config) {
  const dot = el('statusDot');
  const controls = [el('submitBtn'), el('locationBtn'), el('dualLocationBtn')].filter(Boolean);
  let language = 'en';
  let activeFlips = 0;

  function render() {
    if (activeFlips > 0) {
      dot.className = 'status-dot busy';
      controls.forEach(control => {
        control.disabled = true;
      });
      return;
    }

    dot.className = 'status-dot done';
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
    setLanguage(nextLanguage) {
      language = nextLanguage;
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
  let weatherText = t(state.language, 'weatherLoading');

  function renderLocationStatus(label) {
    const target = el('weatherLocationValue');
    if (!target) {
      return;
    }
    target.textContent = normalizeDisplayText(label) || t(state.language, 'locationUnknown');
    target.title = target.textContent;
  }

  function stopTimers() {
    window.clearTimeout(cycleTimer);
    window.clearInterval(refreshTimer);
    cycleTimer = null;
    refreshTimer = null;
  }

  async function fetchWeatherData() {
    weatherText = await fetchWeatherSummary(lat, lon, state.language);
  }

  async function resolveLocationName() {
    try {
      locationName = (await fetchReverseLocationName(lat, lon, state.language)) || formatCoordLabel(lat, lon);
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
        weatherText = t(state.language, 'weatherUnavailable');
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
      weatherText = t(state.language, 'weatherUnavailable');
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

  async function setLocation(nextLocation) {
    const query = typeof nextLocation === 'string'
      ? nextLocation
      : formatLocationSuggestion(nextLocation, state.language);

    if (!normalizeDisplayText(query)) {
      return;
    }

    if (!state.weatherEnabled) {
      await setEnabled(true);
    }

    running = true;
    stopTimers();
    const version = ++requestVersion;
    renderLocationStatus(`${t(state.language, 'locationSearchPrefix')} ${query}`);

    try {
      const result = typeof nextLocation === 'string'
        ? await fetchLocationSearch(query, state.language)
        : nextLocation;
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
      weatherText = t(state.language, 'weatherUnavailable');
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
    async syncLanguage() {
      renderLocationStatus(locationName);
      if (!running || !state.weatherEnabled) {
        weatherText = state.weatherEnabled ? t(state.language, 'weatherLoading') : t(state.language, 'weatherOff');
        return;
      }
      weatherText = t(state.language, 'weatherLoading');
      await refreshData();
    },
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
    target.textContent = normalizeDisplayText(label) || t(state.language, 'notSet');
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
    const formatter = new Intl.DateTimeFormat(getLocale(state.language), {
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
      date: state.language === 'de'
        ? `${normalizeDisplayText(lookup.weekday).slice(0, 2)} ${lookup.day}.${lookup.month}.${lookup.year}`
        : `${normalizeDisplayText(lookup.weekday).slice(0, 2)} ${lookup.month}/${lookup.day}/${lookup.year}`,
    };
  }

  async function fetchWeatherData() {
    if (lat === null || lon === null || !state.weatherEnabled) {
      return;
    }

    weatherText = await fetchWeatherSummary(lat, lon, state.language);
  }

  function renderTime(date = new Date()) {
    if (!running || !state.dualTimeEnabled || !timeZone) {
      return;
    }

    const parts = formatParts(date);
    board.setRows({
      [config.dualRows.time]: `${parts.time} ${locationName}`,
      [config.dualRows.date]: parts.date,
      [config.dualRows.weather]: weatherText || t(state.language, 'weatherLoadingBoard'),
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
      weatherText = t(state.language, 'weatherOff');
      renderTime();
      return;
    }

    try {
      await fetchWeatherData();
    } catch (error) {
      weatherText = t(state.language, 'weatherUnavailable');
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

  async function setLocation(nextLocation) {
    const query = typeof nextLocation === 'string'
      ? nextLocation
      : formatLocationSuggestion(nextLocation, state.language);

    if (!normalizeDisplayText(query)) {
      return;
    }

    state.dualTimeEnabled = true;
    renderState();
    weather.syncDisplayMode();
    renderLocationStatus(`${t(state.language, 'locationSearchPrefix')} ${query}`);
    const version = ++requestVersion;

    try {
      const result = typeof nextLocation === 'string'
        ? await fetchLocationSearch(query, state.language)
        : nextLocation;
      lat = result.latitude;
      lon = result.longitude;
      timeZone = result.timezone || 'Europe/Berlin';
      locationName = normalizeDisplayText(result.name || query) || formatCoordLabel(lat, lon);
      if (state.weatherEnabled) {
        weatherText = await fetchWeatherSummary(lat, lon, state.language);
      } else {
        weatherText = t(state.language, 'weatherOff');
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
      renderLocationStatus(t(state.language, 'notFound'));
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
        weatherText = t(state.language, 'weatherOff');
        renderTime();
        return;
      }

      await refreshWeather();
      if (running) {
        refreshTimer = window.setInterval(refreshWeather, config.weatherRefreshMs);
      }
    },
    renderState,
    async syncLanguage() {
      renderLocationStatus(hasLocation ? locationName : t(state.language, 'notSet'));
      await this.syncWeatherState();
      renderTime();
    },
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
    return state.language === 'de'
      ? `${DAY_NAMES[state.language][date.getDay()]} ${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`
      : `${DAY_NAMES[state.language][date.getDay()]} ${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}`;
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
      button.textContent = t(state.language, preset.labelKey);
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
    renderLabels() {
      config.presets.forEach(preset => {
        const button = buttons.get(preset.action);
        if (button) {
          button.textContent = t(state.language, preset.labelKey);
        }
      });
    },
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
      button.setAttribute('aria-label', isLight ? t(state.language, 'themeLight') : t(state.language, 'themeDark'));
      button.setAttribute('title', isLight ? t(state.language, 'themeLight') : t(state.language, 'themeDark'));
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

function createGreetingController(state) {
  function getGreeting(hour) {
    if (hour >= 5 && hour < 11) {
      return t(state.language, 'greetingMorning');
    }
    if (hour >= 11 && hour < 17) {
      return t(state.language, 'greetingNoon');
    }
    if (hour >= 17 && hour < 22) {
      return t(state.language, 'greetingEvening');
    }
    return t(state.language, 'greetingNight');
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
  let fallbackActive = false;

  function applyFallback(active) {
    fallbackActive = active;
    document.documentElement.classList.toggle('mobile-fullscreen', active);
  }

  async function lockLandscape() {
    if (screen.orientation && typeof screen.orientation.lock === 'function') {
      await screen.orientation.lock('landscape').catch(() => {});
    }
  }

  async function unlockLandscape() {
    if (screen.orientation && typeof screen.orientation.unlock === 'function') {
      screen.orientation.unlock();
    }
  }

  async function enter() {
    const target = el('boardSection');
    if (!target) {
      return false;
    }

    const requestFullscreen =
      target.requestFullscreen ||
      target.webkitRequestFullscreen ||
      target.msRequestFullscreen;

    if (requestFullscreen) {
      const result = requestFullscreen.call(target);
      if (result && typeof result.catch === 'function') {
        await result.catch(() => {});
      }
      await lockLandscape();
      return true;
    }

    applyFallback(true);
    await lockLandscape();
    return true;
  }

  async function exit() {
    if (fallbackActive) {
      applyFallback(false);
      await unlockLandscape();
      return;
    }

    if (!document.fullscreenElement) {
      return;
    }

    await document.exitFullscreen().catch(() => {});
    await unlockLandscape();
  }

  return {
    async toggle() {
      if (document.fullscreenElement || fallbackActive) {
        await exit();
        return;
      }
      await enter();
    },
    exit,
    get active() {
      return fallbackActive || Boolean(document.fullscreenElement);
    },
  };
}

function createBoardViewportController(fullscreen) {
  let resizeHandler = null;
  let orientationHandler = null;

  function getAvailableSpace() {
    const section = el('boardSection');
    const shell = section ? section.querySelector('.board-shell') : null;
    if (!section || !shell) {
      return null;
    }

    const sectionRect = section.getBoundingClientRect();
    const shellRect = shell.getBoundingClientRect();
    const style = window.getComputedStyle(section);
    const paddingX = parseFloat(style.paddingLeft || '0') + parseFloat(style.paddingRight || '0');
    const paddingY = parseFloat(style.paddingTop || '0') + parseFloat(style.paddingBottom || '0');

    let availableWidth = Math.max(0, sectionRect.width - paddingX);
    let availableHeight = Math.max(0, sectionRect.height - paddingY);

    if (!fullscreen.active) {
      const header = document.querySelector('.header');
      const overlay = el('controlsOverlay');
      if (header) {
        availableHeight = Math.min(availableHeight, window.innerHeight - header.getBoundingClientRect().height - 24);
      }
      if (overlay && overlay.classList.contains('open')) {
        availableHeight = Math.min(availableHeight, window.innerHeight * 0.56);
      }
    }

    return {
      availableWidth,
      availableHeight,
      contentWidth: shellRect.width,
      contentHeight: shellRect.height,
      section,
    };
  }

  function fit() {
    const motion = document.querySelector('.board-motion');
    if (!motion) {
      return;
    }

    motion.style.setProperty('--board-scale', '1');

    const space = getAvailableSpace();
    if (!space || !space.contentWidth || !space.contentHeight) {
      return;
    }

    const widthScale = space.availableWidth / space.contentWidth;
    const heightScale = space.availableHeight / space.contentHeight;
    const scale = Math.min(1, widthScale, heightScale);
    motion.style.setProperty('--board-scale', String(Math.max(0.38, scale)));
  }

  function boot() {
    resizeHandler = () => fit();
    orientationHandler = () => window.setTimeout(fit, 120);
    window.addEventListener('resize', resizeHandler);
    window.addEventListener('orientationchange', orientationHandler);
    document.addEventListener('fullscreenchange', () => window.setTimeout(fit, 120));
    fit();
    window.setTimeout(fit, 60);
    window.setTimeout(fit, 260);
  }

  return {
    boot,
    fit,
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

function createHistoryController(store, state) {
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
      removeButton.setAttribute('aria-label', t(state.language, 'removeEntryAria', { value: entry }));
      removeButton.title = t(state.language, 'removeEntry');

      const removeShadow = document.createElement('span');
      removeShadow.className = 'history-chip-delete-shadow';
      removeButton.appendChild(removeShadow);

      const removeIcon = document.createElement('span');
      removeIcon.className = 'history-chip-delete-icon';
      removeIcon.textContent = 'x';
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

function createLocationSuggestionController(state) {
  const bindings = new Map();

  function getBinding(inputId) {
    return bindings.get(inputId) || null;
  }

  function close(inputId) {
    const binding = getBinding(inputId);
    if (!binding) {
      return;
    }

    binding.items = [];
    binding.highlightedIndex = -1;
    binding.requestVersion += 1;
    binding.wrap.innerHTML = '';
    binding.wrap.hidden = true;
  }

  function closeAll() {
    bindings.forEach((_, inputId) => close(inputId));
  }

  function render(binding) {
    binding.wrap.innerHTML = '';

    if (!binding.items.length) {
      binding.wrap.hidden = true;
      return;
    }

    binding.items.forEach((item, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'suggestion-item';
      button.classList.toggle('active', index === binding.highlightedIndex);

      const primary = document.createElement('span');
      primary.className = 'suggestion-primary';
      primary.textContent = String(item.name || '').trim() || formatLocationSuggestion(item, state.language);

      const secondary = document.createElement('span');
      secondary.className = 'suggestion-secondary';
      secondary.textContent = formatLocationSuggestion(item, state.language);

      button.append(primary, secondary);
      button.addEventListener('mousedown', event => {
        event.preventDefault();
      });
      button.addEventListener('click', async () => {
        binding.input.value = formatLocationSuggestion(item, state.language);
        close(binding.input.id);
        await binding.onSelect(item);
      });
      binding.wrap.appendChild(button);
    });

    binding.wrap.hidden = false;
  }

  async function loadSuggestions(binding) {
    const query = binding.input.value.trim();
    if (query.length < 2) {
      close(binding.input.id);
      return;
    }

    const requestVersion = ++binding.requestVersion;

    try {
      const results = await fetchLocationSuggestions(query, state.language, 5);
      if (requestVersion !== binding.requestVersion) {
        return;
      }

      binding.items = results;
      binding.highlightedIndex = results.length ? 0 : -1;
      render(binding);
    } catch (error) {
      if (requestVersion !== binding.requestVersion) {
        return;
      }
      binding.items = [];
      binding.highlightedIndex = -1;
      render(binding);
    }
  }

  function scheduleLoad(binding) {
    window.clearTimeout(binding.timerId);
    binding.timerId = window.setTimeout(() => {
      loadSuggestions(binding);
    }, 180);
  }

  function register({ inputId, listId, onSelect }) {
    const input = el(inputId);
    const wrap = el(listId);
    if (!input || !wrap) {
      return;
    }

    const binding = {
      input,
      wrap,
      onSelect,
      items: [],
      highlightedIndex: -1,
      requestVersion: 0,
      timerId: 0,
    };

    bindings.set(inputId, binding);

    input.addEventListener('input', () => {
      scheduleLoad(binding);
    });

    input.addEventListener('focus', () => {
      if (binding.input.value.trim().length >= 2) {
        scheduleLoad(binding);
      }
    });

    input.addEventListener('blur', () => {
      window.setTimeout(() => close(inputId), 120);
    });
  }

  function handleKeydown(inputId, event) {
    const binding = getBinding(inputId);
    if (!binding || binding.wrap.hidden || !binding.items.length) {
      return false;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      binding.highlightedIndex = (binding.highlightedIndex + 1) % binding.items.length;
      render(binding);
      return true;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      binding.highlightedIndex = binding.highlightedIndex <= 0 ? binding.items.length - 1 : binding.highlightedIndex - 1;
      render(binding);
      return true;
    }

    if (event.key === 'Escape') {
      close(inputId);
      return true;
    }

    if (event.key === 'Enter' && binding.highlightedIndex >= 0) {
      event.preventDefault();
      const item = binding.items[binding.highlightedIndex];
      if (!item) {
        return true;
      }
      binding.input.value = formatLocationSuggestion(item, state.language);
      close(inputId);
      binding.onSelect(item);
      return true;
    }

    return false;
  }

  function syncLanguage() {
    bindings.forEach(binding => {
      if (binding.items.length) {
        render(binding);
      }
    });
  }

  return {
    register,
    handleKeydown,
    close,
    closeAll,
    syncLanguage,
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
  const greeting = createGreetingController(state);
  const controlsOverlay = createControlsOverlayController(state);
  const help = createHelpController();
  const fullscreen = createFullscreenController();
  const viewport = createBoardViewportController(fullscreen);
  const oledProtection = createOledProtectionController();
  const historyStore = createHistoryStore();
  const history = createHistoryController(historyStore, state);
  const locationSuggestions = createLocationSuggestionController(state);

  async function refreshCurrentView() {
    if (state.activePreset === 'custom' && state.customText) {
      await board.setAllText(state.customText);
      viewport.fit();
      return;
    }

    clock.refresh();
    viewport.fit();
  }

  function updateCustomInputMeta() {
    const meta = el('customInputMeta');
    const input = el('customInput');
    if (!meta || !input) {
      return;
    }

    meta.textContent = `${t(state.language, 'remaining')}: ${getRemainingBoardChars(input.value, state.cols, config.rows.length)}`;
  }

  function setTextContent(id, value) {
    const target = el(id);
    if (target) {
      target.textContent = value;
    }
  }

  function setInputPlaceholder(id, value) {
    const target = el(id);
    if (target) {
      target.setAttribute('placeholder', value);
    }
  }

  function renderLanguageUi() {
    document.documentElement.lang = state.language;
    document.title = t(state.language, 'appTitle');
    const nextLanguage = state.language === 'de' ? 'en' : 'de';
    setTextContent('headerNavCopy', t(state.language, 'headerTagline'));
    setTextContent('languageBtn', nextLanguage.toUpperCase());
    setTextContent('boardControlsTitle', t(state.language, 'boardControls'));
    setTextContent('displayTitle', t(state.language, 'display'));
    setTextContent('weatherTitle', t(state.language, 'weather'));
    setTextContent('dualTimeTitle', t(state.language, 'dualTime'));
    setTextContent('secondsLabel', t(state.language, 'seconds'));
    setTextContent('soundLabel', t(state.language, 'sound'));
    setTextContent('alignmentLabel', t(state.language, 'alignment'));
    setTextContent('weatherToggleLabel', t(state.language, 'weather'));
    setTextContent('locationLabel', t(state.language, 'location'));
    setTextContent('weatherLocationChipLabel', t(state.language, 'current'));
    setTextContent('dualTimeToggleLabel', t(state.language, 'dualTime'));
    setTextContent('placeLabel', t(state.language, 'place'));
    setTextContent('dualLocationChipLabel', t(state.language, 'secondPlace'));
    setTextContent('submitBtn', t(state.language, 'submit'));
    setTextContent('locationBtn', t(state.language, 'search'));
    setTextContent('dualLocationBtn', t(state.language, 'add'));
    setTextContent('secOn', t(state.language, 'on'));
    setTextContent('secOff', t(state.language, 'off'));
    setTextContent('soundOn', t(state.language, 'on'));
    setTextContent('soundOff', t(state.language, 'off'));
    setTextContent('alignLeft', t(state.language, 'left'));
    setTextContent('alignCenter', t(state.language, 'center'));
    setTextContent('weatherOn', t(state.language, 'on'));
    setTextContent('weatherOff', t(state.language, 'off'));
    setTextContent('dualOn', t(state.language, 'on'));
    setTextContent('dualOff', t(state.language, 'off'));
    setTextContent('helpTitle', t(state.language, 'help'));
    setTextContent('helpWeatherTitle', t(state.language, 'helpWeatherTitle'));
    setTextContent('helpWeatherBody', t(state.language, 'helpWeatherBody'));
    setTextContent('helpFullscreenTitle', t(state.language, 'helpFullscreenTitle'));
    setTextContent('helpFullscreenBody', t(state.language, 'helpFullscreenBody'));
    setInputPlaceholder('customInput', t(state.language, 'customPlaceholder'));
    setInputPlaceholder(
      'locationInput',
      state.language === 'de' ? 'z.B. Berlin, Paris, Tokyo ...' : 'e.g. Berlin, Paris, Tokyo ...'
    );
    setInputPlaceholder(
      'dualLocationInput',
      state.language === 'de' ? 'z.B. New York, Tokyo, Sydney ...' : 'e.g. New York, Tokyo, Sydney ...'
    );

    const languageButton = el('languageBtn');
    if (languageButton) {
      languageButton.setAttribute('aria-label', nextLanguage === 'de' ? 'Sprache auf Deutsch stellen' : 'Switch language to English');
      languageButton.setAttribute('title', nextLanguage === 'de' ? 'Sprache auf Deutsch stellen' : 'Switch language to English');
    }

    const controlsToggle = el('controlsToggle');
    if (controlsToggle) {
      controlsToggle.setAttribute('title', t(state.language, 'controlsShow'));
    }

    const controlsCollapse = el('controlsCollapse');
    if (controlsCollapse) {
      controlsCollapse.setAttribute('aria-label', t(state.language, 'controlsHide'));
      controlsCollapse.setAttribute('title', t(state.language, 'controlsHide'));
    }

    const helpFab = el('helpFab');
    if (helpFab) {
      helpFab.setAttribute('aria-label', t(state.language, 'helpOpen'));
      helpFab.setAttribute('title', t(state.language, 'help'));
    }

    const fullscreenButton = el('fullscreenBtn');
    if (fullscreenButton) {
      fullscreenButton.setAttribute('aria-label', fullscreen.active ? t(state.language, 'fullscreenClose') : t(state.language, 'fullscreenOpen'));
      fullscreenButton.setAttribute('title', fullscreen.active ? t(state.language, 'fullscreenClose') : t(state.language, 'fullscreenOpen'));
    }

    presets.renderLabels();
  }

  async function applyLanguage(language) {
    state.language = language;
    setStoredLanguage(language);
    status.setLanguage(language);
    renderUiState();
    renderLanguageUi();
    locationSuggestions.syncLanguage();
    await weather.syncLanguage();
    await dualTime.syncLanguage();
    await refreshCurrentView();
    viewport.fit();
    history.render('custom', submitCustomTextFromHistory);
    history.render('dual', runDualLocationSearchFromHistory);
  }

  async function toggleFullscreenView() {
    await fullscreen.toggle();
    renderLanguageUi();
    window.setTimeout(() => viewport.fit(), 180);
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

  let runDualLocationSearchFromHistory = async () => {};
  let submitCustomTextFromHistory = async () => {};

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
        toggleFullscreenView();
        return;
      }

      if (event.key === 'Escape' && fullscreen.active) {
        fullscreen.exit().then(() => {
          renderLanguageUi();
          window.setTimeout(() => viewport.fit(), 180);
        });
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
    document.addEventListener('pointerdown', event => {
      if (!(event.target instanceof HTMLElement) || !event.target.closest('.suggestion-wrap')) {
        locationSuggestions.closeAll();
      }
    });

    el('languageBtn').addEventListener('click', async () => {
      await applyLanguage(state.language === 'de' ? 'en' : 'de');
    });
    el('themeBtn').addEventListener('click', () => theme.toggle());
    el('fullscreenBtn').addEventListener('click', () => {
      toggleFullscreenView();
    });
    el('controlsToggle').addEventListener('click', () => {
      controlsOverlay.toggle();
      window.setTimeout(() => viewport.fit(), 320);
    });
    el('controlsCollapse').addEventListener('click', () => {
      controlsOverlay.close();
      window.setTimeout(() => viewport.fit(), 180);
    });
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
      locationSuggestions.close('locationInput');
      el('locationInput').value = '';
      el('locationInput').blur();
    };

    el('locationBtn').addEventListener('click', runLocationSearch);
    locationSuggestions.register({
      inputId: 'locationInput',
      listId: 'locationSuggestions',
      onSelect: async result => {
        await weather.setLocation(result);
        el('locationInput').value = '';
        el('locationInput').blur();
      },
    });
    el('locationInput').addEventListener('keydown', event => {
      if (locationSuggestions.handleKeydown('locationInput', event)) {
        return;
      }
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
      locationSuggestions.close('dualLocationInput');
      history.save('dual', value, runDualLocationSearchFromHistory);
      el('dualLocationInput').value = '';
      el('dualLocationInput').blur();
    };

    runDualLocationSearchFromHistory = async value => {
      if (!value) {
        return;
      }
      await dualTime.setLocation(value);
    };

    el('dualLocationBtn').addEventListener('click', runDualLocationSearch);
    locationSuggestions.register({
      inputId: 'dualLocationInput',
      listId: 'dualLocationSuggestions',
      onSelect: async result => {
        const label = formatLocationSuggestion(result, state.language);
        await dualTime.setLocation(result);
        history.save('dual', label, runDualLocationSearchFromHistory);
        el('dualLocationInput').value = '';
        el('dualLocationInput').blur();
      },
    });
    el('dualLocationInput').addEventListener('keydown', event => {
      if (locationSuggestions.handleKeydown('dualLocationInput', event)) {
        return;
      }
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

    submitCustomTextFromHistory = async value => {
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
      viewport.fit();
    });
    weather.renderLocationStatus(config.defaultLocationName);
    dualTime.renderLocationStatus(t(state.language, 'notSet'));
    history.render('custom', async value => {
      clock.stop();
      await board.setAllText(value);
      presets.markPreset('custom');
    });
    history.render('dual', async value => {
      await dualTime.setLocation(value);
    });
    status.setLanguage(state.language);
    renderUiState();
    renderLanguageUi();
    updateCustomInputMeta();
    bindEvents();
    exposeApi();
    viewport.boot();
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

