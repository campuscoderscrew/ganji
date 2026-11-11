'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

const { parseCaption, parseDateLine, classifyType } = require('../lib/parse-caption.js');

// Emoji are \u escapes throughout so this file stays pure ASCII and cannot be
// broken by an editor re-saving it in a different encoding.
const CAL = '\u{1F5D3}\u{FE0F}';
const CLOCK = '\u{23F0}';
const PIN = '\u{1F4CD}';
const STAR = '\u{2B50}\u{FE0F}';
const HEART = '\u{2764}\u{FE0F}';
const SPARK = '\u{2728}';
const BANG = '\u{203C}\u{FE0F}';

/** The real caption that was hardcoded into the Events page. */
const REAL_WORKSHOP_CAPTION =
  `Come learn ${STAR}${HEART}EENIE MEENIE by CHUNG HA${HEART}${STAR} ` +
  `taught by ${SPARK}@ije.526${SPARK} THIS THURSDAY ${BANG}\n` +
  `\nWORKSHOP DETAILS ${BANG}\n` +
  `${CAL}: Tuesday, July 1st\n` +
  `${CLOCK}: 7-8PM\n` +
  `${PIN}: Activities Room near Terpzone (STAMP)`;

test('parses the real workshop caption end to end', () => {
  const result = parseCaption(REAL_WORKSHOP_CAPTION, '2025-06-26T18:04:11+0000');

  assert.equal(result.type, 'WORKSHOP');
  assert.equal(result.title, 'Eenie Meenie');
  assert.equal(result.artist, 'CHUNG HA');
  assert.equal(result.date, '2025-07-01');
  assert.equal(result.time, '7-8PM');
  assert.equal(result.location, 'Activities Room near Terpzone (STAMP)');
  assert.equal(result.instructor, '@ije.526');
  assert.equal(result.isEvent, true);
});

test('trusts the keyed date line over a contradictory prose date', () => {
  // The real caption says "THIS THURSDAY" two lines above a date line reading
  // "Tuesday, July 1st". July 1 2025 was a Tuesday, so the keyed line is the
  // correct one -- this is the whole reason prose dates are ignored.
  const result = parseCaption(REAL_WORKSHOP_CAPTION, '2025-06-26T18:04:11+0000');
  assert.equal(result.date, '2025-07-01');
  assert.equal(new Date(result.date).getUTCDay(), 2); // Tuesday
});

test('strips decorative emoji wrapping a song title', () => {
  const caption = `come learn ${SPARK}Gnarly${SPARK} by KATSEYE`;
  const result = parseCaption(caption, '2025-04-10T00:00:00+0000');
  assert.equal(result.title, 'Gnarly');
  assert.equal(result.artist, 'KATSEYE');
});

test('leaves stylised artist names in their original casing', () => {
  const caption = 'performing Daydream by ENHYPEN at the showcase';
  const result = parseCaption(caption, '2025-04-02T00:00:00+0000');
  assert.equal(result.artist, 'ENHYPEN');
  assert.equal(result.title, 'Daydream');
});

test('title-cases a shouted song title but not a mixed-case one', () => {
  const shouted = parseCaption('come learn EENIE MEENIE by CHUNG HA', '2025-01-01T00:00:00Z');
  assert.equal(shouted.title, 'Eenie Meenie');

  const mixed = parseCaption('come learn Golden by HUNTR/X', '2025-01-01T00:00:00Z');
  assert.equal(mixed.title, 'Golden');
});

test('classifies competition ahead of performance when both words appear', () => {
  // "Ultimate Showcase" is a competition despite containing "showcase".
  const caption = 'Ganji is competing at Ultimate Showcase! Finals are open to the public.';
  assert.equal(classifyType(caption).type, 'COMPETITION');
});

test('classifies workshops, performances and competitions', () => {
  assert.equal(classifyType('come learn this dance with us').type, 'WORKSHOP');
  assert.equal(classifyType('we are performing on Saturday').type, 'PERFORMANCE');
  assert.equal(classifyType('prelims are this weekend').type, 'COMPETITION');
});

test('marks non-event posts so they stay out of the archive', () => {
  const recap = parseCaption(
    'thank you to everyone who came out this semester, see you in the fall!!',
    '2025-05-14T22:10:00+0000'
  );
  assert.equal(recap.isEvent, false);
  assert.equal(recap.type, null);
});

test('treats a dated post as an event even without a type keyword', () => {
  const caption = `pull up ${BANG}\n${CAL}: March 3rd\n${PIN}: Eppley`;
  const result = parseCaption(caption, '2025-02-25T00:00:00Z');
  assert.equal(result.isEvent, true);
  assert.equal(result.type, 'PERFORMANCE'); // fallback badge
  assert.equal(result.date, '2025-03-03');
});

// ---------------------------------------------------------------------------
// Date parsing
// ---------------------------------------------------------------------------

test('parses the date formats captions actually use', () => {
  const post = new Date('2025-04-01T00:00:00Z');
  assert.equal(parseDateLine('Saturday, April 12th', post), '2025-04-12');
  assert.equal(parseDateLine('April 12', post), '2025-04-12');
  assert.equal(parseDateLine('Apr 12th', post), '2025-04-12');
  assert.equal(parseDateLine('12th of April', post), '2025-04-12');
  assert.equal(parseDateLine('4/12', post), '2025-04-12');
  assert.equal(parseDateLine('4/12/25', post), '2025-04-12');
});

test('infers the year from the post date', () => {
  // A December post announcing a January event belongs to the next year.
  assert.equal(
    parseDateLine('January 15th', new Date('2025-12-20T00:00:00Z')),
    '2026-01-15'
  );
  // A January post recapping a December event belongs to the previous year.
  assert.equal(
    parseDateLine('December 20th', new Date('2026-01-05T00:00:00Z')),
    '2025-12-20'
  );
});

test('prefers an explicit year over inference', () => {
  assert.equal(
    parseDateLine('July 1st, 2024', new Date('2025-06-26T00:00:00Z')),
    '2024-07-01'
  );
});

test('rejects impossible dates instead of rolling them over', () => {
  assert.equal(parseDateLine('February 30th', new Date('2025-02-01T00:00:00Z')), null);
  assert.equal(parseDateLine('13/45', new Date('2025-01-01T00:00:00Z')), null);
});

test('returns null for a line with no date in it', () => {
  assert.equal(parseDateLine('Activities Room near Terpzone', new Date()), null);
});

// ---------------------------------------------------------------------------
// Robustness
// ---------------------------------------------------------------------------

test('survives a missing or empty caption', () => {
  for (const caption of [null, undefined, '']) {
    const result = parseCaption(caption, '2025-01-01T00:00:00Z');
    assert.equal(result.isEvent, false);
    assert.equal(result.date, null);
    assert.deepEqual(result.hashtags, []);
  }
});

test('collects hashtags in lower case', () => {
  const result = parseCaption('see you there #Ganji #UMD #KpopDance', '2025-01-01T00:00:00Z');
  assert.deepEqual(result.hashtags, ['#ganji', '#umd', '#kpopdance']);
});

test('does not mistake "taught by @handle" for the song title', () => {
  const result = parseCaption('taught by @ije.526', '2025-01-01T00:00:00Z');
  assert.notEqual(result.title, '@ije.526');
  assert.equal(result.instructor, '@ije.526');
});
