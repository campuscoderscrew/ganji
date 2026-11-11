'use strict';

/**
 * Turns an Instagram caption into a structured event.
 *
 * Ganji's captions follow a loose but real convention: a prose hook, then a
 * details block keyed by emoji, e.g.
 *
 *   WORKSHOP DETAILS
 *   [calendar]: Tuesday, July 1st
 *   [clock]: 7-8PM
 *   [pin]: Activities Room near Terpzone (STAMP)
 *
 * The emoji block is the reliable part. Prose date mentions are not -- real
 * captions have said "THIS THURSDAY" directly above a date line reading
 * "Tuesday, July 1st" -- so only the keyed lines are trusted for dates.
 *
 * Every emoji in this file is written as a \u{...} escape so the source stays
 * pure ASCII. Literal emoji here have been corrupted before by editors that
 * re-saved as Windows-1252, and a mangled regex fails silently.
 */

// ---------------------------------------------------------------------------
// Emoji keys
// ---------------------------------------------------------------------------

const CLOCK_FACES = [];
for (let cp = 0x1f550; cp <= 0x1f567; cp += 1) CLOCK_FACES.push(String.fromCodePoint(cp));

const KEY_GROUPS = {
  date: ['\u{1F5D3}', '\u{1F4C5}', '\u{1F4C6}', '\u{1F4C7}'],
  time: ['\u{23F0}', '\u{23F1}', '\u{23F2}', '\u{231A}', '\u{231B}', ...CLOCK_FACES],
  location: ['\u{1F4CD}', '\u{1F4CC}', '\u{1F3E2}', '\u{1F5FA}'],
  cost: ['\u{1F4B5}', '\u{1F4B0}', '\u{1F4B8}', '\u{1F39F}', '\u{1F4B2}'],
  instructor: ['\u{1F464}', '\u{1F465}', '\u{1F483}', '\u{1F57A}', '\u{1F9D1}'],
};

/** Reverse lookup: single emoji character -> field name. */
const KEY_LOOKUP = new Map();
for (const [field, chars] of Object.entries(KEY_GROUPS)) {
  for (const ch of chars) KEY_LOOKUP.set(ch, field);
}

/** Variation selectors, joiners and skin-tone modifiers, stripped before matching. */
const MODIFIERS = /[\u{FE0E}\u{FE0F}\u{200D}\u{1F3FB}-\u{1F3FF}]/gu;

/** Any pictographic character -- used to strip decorative emoji from prose. */
const PICTOGRAPHIC = /\p{Extended_Pictographic}/gu;

// ---------------------------------------------------------------------------
// Type classification
// ---------------------------------------------------------------------------

/**
 * Checked in order; the first group with a hit wins. Competition is tested
 * before performance because "showcase" appears in both ("Ultimate Showcase"
 * is a competition) and the more specific signals should win.
 */
const TYPE_RULES = [
  {
    type: 'COMPETITION',
    patterns: [
      /\bcompetitions?\b/i,
      /\bcompeting\b/i,
      /\bcompete[ds]?\b/i,
      /\bbattles?\b/i,
      /\bprelims?\b/i,
      /\bsemi-?finals?\b/i,
      /\bfinals\b/i,
      /\bplacement\b/i,
      /\b(?:1st|2nd|3rd|first|second|third)\s+place\b/i,
    ],
  },
  {
    type: 'WORKSHOP',
    patterns: [
      /\bworkshops?\b/i,
      /\bcome\s+learn\b/i,
      /\bteaching\b/i,
      /\btaught\s+by\b/i,
      /\blearn\s+.{1,60}\bby\b/i,
      /\bopen\s+class\b/i,
      /\bmasterclass\b/i,
    ],
  },
  {
    type: 'PERFORMANCE',
    patterns: [
      /\bperformances?\b/i,
      /\bperform(?:ing|ed|s)?\b/i,
      /\bshowcase\b/i,
      /\bstage\b/i,
      /\bsetlist\b/i,
      /\bdebut\b/i,
    ],
  },
];

/**
 * Nothing matched. The caller decides what that means: a post with a parsed
 * date is still an event (and falls back to PERFORMANCE below), while one with
 * neither a type nor a date is ordinary content -- a recap, an e-board
 * announcement -- and stays out of the Archive and the calendar entirely.
 */
const DEFAULT_TYPE = null;

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

const MONTHS = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

const WEEKDAY = /\b(?:mon|tues?|wed(?:nes)?|thur?s?|fri|sat(?:ur)?|sun)(?:day)?\b/gi;

const MONTH_NAMES = Object.keys(MONTHS).sort((a, b) => b.length - a.length).join('|');

/** "July 1st", "Jul 1", "July 1st, 2025" */
const DATE_MONTH_FIRST = new RegExp(
  '\\b(' + MONTH_NAMES + ')\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?(?:,?\\s*(\\d{4}))?',
  'i'
);

/** "1st of July", "1 July" */
const DATE_DAY_FIRST = new RegExp(
  '\\b(\\d{1,2})(?:st|nd|rd|th)?\\s+(?:of\\s+)?(' + MONTH_NAMES + ')\\.?(?:,?\\s*(\\d{4}))?',
  'i'
);

/** "7/1", "7/1/25", "07-01-2025" */
const DATE_NUMERIC = /\b(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?\b/;

/**
 * Picks the year for a month/day that was written without one.
 *
 * Captions almost never include a year, so it is inferred from when the post
 * went up. Trying the post's year plus its neighbours and taking whichever
 * lands closest to the post date handles the December-post-about-a-January-
 * event case without special-casing it.
 */
function inferYear(month, day, postDate) {
  const postYear = postDate.getUTCFullYear();
  let best = null;

  for (const year of [postYear - 1, postYear, postYear + 1]) {
    const candidate = new Date(Date.UTC(year, month, day));
    if (candidate.getUTCMonth() !== month) continue; // rejects e.g. Feb 30
    const distance = Math.abs(candidate.getTime() - postDate.getTime());
    if (best === null || distance < best.distance) {
      best = { candidate, distance };
    }
  }

  return best ? best.candidate : null;
}

function toIsoDay(date) {
  return date.toISOString().slice(0, 10);
}

/**
 * Parses a date out of a single details line. Returns an ISO "YYYY-MM-DD"
 * string, or null when the line has no date in it.
 */
function parseDateLine(text, postDate) {
  // The weekday is dropped before matching: captions get it wrong often enough
  // that cross-checking is not worth it, and it can swallow the day number.
  const cleaned = text.replace(WEEKDAY, ' ').replace(/\s+/g, ' ').trim();

  let match = cleaned.match(DATE_MONTH_FIRST);
  if (match) {
    const month = MONTHS[match[1].toLowerCase()];
    const day = Number(match[2]);
    if (match[3]) return toIsoDay(new Date(Date.UTC(Number(match[3]), month, day)));
    const resolved = inferYear(month, day, postDate);
    return resolved ? toIsoDay(resolved) : null;
  }

  match = cleaned.match(DATE_DAY_FIRST);
  if (match) {
    const day = Number(match[1]);
    const month = MONTHS[match[2].toLowerCase()];
    if (match[3]) return toIsoDay(new Date(Date.UTC(Number(match[3]), month, day)));
    const resolved = inferYear(month, day, postDate);
    return resolved ? toIsoDay(resolved) : null;
  }

  match = cleaned.match(DATE_NUMERIC);
  if (match) {
    const month = Number(match[1]) - 1;
    const day = Number(match[2]);
    if (month < 0 || month > 11 || day < 1 || day > 31) return null;
    if (match[3]) {
      const raw = Number(match[3]);
      const year = raw < 100 ? 2000 + raw : raw;
      return toIsoDay(new Date(Date.UTC(year, month, day)));
    }
    const resolved = inferYear(month, day, postDate);
    return resolved ? toIsoDay(resolved) : null;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Title and artist
// ---------------------------------------------------------------------------

/** Ordered most-specific first. Each captures title in $1 and artist in $2. */
const SONG_PATTERNS = [
  // "come learn EENIE MEENIE by CHUNG HA taught by @ije.526"
  /\b(?:come\s+)?learn(?:ing)?\s+(.+?)\s+by\s+(.+?)(?=\s+taught\b|\s+choreo|\s+with\b|\s+this\b|\s+on\b|[!.,\n]|$)/i,
  // "performing Daydream by ENHYPEN"
  /\b(?:perform(?:ing)?|cover(?:ing)?|dancing(?:\s+to)?)\s+(.+?)\s+by\s+(.+?)(?=\s+at\b|\s+choreo|\s+with\b|\s+this\b|\s+on\b|[!.,\n]|$)/i,
  // "Daydream - ENHYPEN" on its own line
  /^(.+?)\s+(?:by|-|\u{2013}|\u{2014})\s+(.+?)$/iu,
];

/** Leading words that signal the capture ran past the title into prose. */
const TITLE_NOISE = /^(?:the|a|an|our|this|that|some|more|new)\s+/i;

function titleCase(value) {
  // Captions shout song titles ("EENIE MEENIE") but artist names are often
  // genuinely stylised in caps ("ENHYPEN", "KATSEYE"), so only titles are
  // normalised, and only when they are entirely uppercase.
  if (value !== value.toUpperCase()) return value;
  return value.toLowerCase().replace(/\b([a-z])/g, (_, ch) => ch.toUpperCase());
}

function extractSong(cleanCaption) {
  const lines = cleanCaption.split('\n').map((l) => l.trim()).filter(Boolean);

  for (let i = 0; i < SONG_PATTERNS.length; i += 1) {
    const pattern = SONG_PATTERNS[i];
    // The last pattern is anchored, so it is only tried line by line.
    const haystacks = i === SONG_PATTERNS.length - 1 ? lines : [cleanCaption];

    for (const haystack of haystacks) {
      const match = haystack.match(pattern);
      if (!match) continue;

      const title = match[1].replace(TITLE_NOISE, '').trim();
      const artist = match[2].trim();

      // Anything this long is prose the regex over-captured.
      if (!title || title.length > 60 || artist.length > 40) continue;
      // An @mention in the title slot means "taught by @x" matched instead.
      if (title.startsWith('@')) continue;

      return {
        title: titleCase(title),
        artist: artist.replace(/[.,!]+$/, ''),
        confidence: i < 2 ? 'high' : 'low',
      };
    }
  }

  return { title: null, artist: null, confidence: 'none' };
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

/**
 * Splits a caption into its emoji-keyed detail lines.
 * Returns a map of field name -> raw text following the key.
 */
function extractKeyedLines(caption) {
  const fields = {};

  for (const rawLine of caption.split(/\r?\n/)) {
    const line = rawLine.replace(MODIFIERS, '').trim();
    if (!line) continue;

    // A keyed line opens with one or more emoji, then an optional separator.
    const match = line.match(/^(\p{Extended_Pictographic}+)\s*[:：\-–—]?\s*(.*)$/u);
    if (!match) continue;

    const [, keys, value] = match;
    if (!value.trim()) continue;

    for (const ch of keys) {
      const field = KEY_LOOKUP.get(ch);
      // First key wins, so a decorative emoji later in the run cannot
      // overwrite a value that was already captured.
      if (field && !fields[field]) fields[field] = value.trim();
    }
  }

  return fields;
}

function classifyType(cleanCaption) {
  for (const { type, patterns } of TYPE_RULES) {
    if (patterns.some((pattern) => pattern.test(cleanCaption))) {
      return { type, confidence: 'high' };
    }
  }
  return { type: DEFAULT_TYPE, confidence: 'none' };
}

/**
 * @param {string} caption   Raw caption text from the API.
 * @param {string} timestamp ISO timestamp of the post, used for year inference.
 * @returns {object} Structured fields plus per-field confidence.
 */
function parseCaption(caption, timestamp) {
  const postDate = new Date(timestamp);
  const safeCaption = typeof caption === 'string' ? caption : '';

  // Decorative emoji are stripped for prose matching -- captions wrap song
  // titles in them ("learn [star][heart]EENIE MEENIE[heart][star] by ...").
  const cleanCaption = safeCaption
    .replace(PICTOGRAPHIC, ' ')
    .replace(MODIFIERS, '')
    .replace(/[ \t]+/g, ' ');

  const keyed = extractKeyedLines(safeCaption);
  const song = extractSong(cleanCaption);
  const classified = classifyType(cleanCaption);

  const date = keyed.date ? parseDateLine(keyed.date, postDate) : null;

  // The first non-empty, non-hashtag line doubles as a headline when no song
  // could be identified.
  const firstLine = cleanCaption
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0 && !l.startsWith('#'));

  const instructorMatch = cleanCaption.match(
    /\b(?:taught|choreo(?:graphed)?|led)\s+by\s+(@?[\w.]+)/i
  );

  // A post counts as an event when it either names an event type or carries a
  // parsed date. Everything else is ordinary feed content.
  const isEvent = Boolean(date) || classified.confidence !== 'none';

  return {
    isEvent,
    type: classified.type || (isEvent ? 'PERFORMANCE' : null),
    title: song.title || (firstLine ? firstLine.slice(0, 60).trim() : null),
    artist: song.artist,
    date,
    dateText: keyed.date || null,
    time: keyed.time || null,
    location: keyed.location || null,
    cost: keyed.cost || null,
    instructor: keyed.instructor || (instructorMatch ? instructorMatch[1] : null),
    hashtags: (safeCaption.match(/#[\w]+/g) || []).map((t) => t.toLowerCase()),
    confidence: {
      type: classified.confidence,
      title: song.title ? song.confidence : 'none',
      date: date ? 'high' : 'none',
    },
  };
}

module.exports = {
  parseCaption,
  // Exported for the test suite.
  parseDateLine,
  extractKeyedLines,
  classifyType,
  extractSong,
};
