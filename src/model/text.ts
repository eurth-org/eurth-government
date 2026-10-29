/**
 * Text people type, made safe wherever it goes. There's no server or database to attack, and the
 * page escapes everything it shows, but a name also travels into links, file names, Markdown and
 * wikitext, where some characters mean something.
 */

/** The longest name Governmint keeps. */
export const nameLimit = 60;

// Control characters, zero-width ones, and those that flip the direction of text (which can make
// a name read differently from what it is).
const invisible = /[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁦-⁩﻿]/g;

/** A country's name as typed, linked or saved: no invisible characters, at most 60 characters. */
export function cleanName(raw: string): string {
  return raw.replace(invisible, '').replace(/\s+/g, ' ').slice(0, nameLimit);
}

/** A name in Markdown, as plain text: it can't become a link, a table break, formatting or HTML. */
export function markdownText(text: string): string {
  return text.replace(/[\\`*_[\]|]/g, (c) => `\\${c}`).replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** A name in wikitext: wrapped in <nowiki> when it holds anything the wiki would read as markup. */
export function wikiText(text: string): string {
  return /[[\]{}|<>]|''|~~~/.test(text) ? `<nowiki>${text.replace(/<\/?nowiki\s*>/gi, '')}</nowiki>` : text;
}

/** A file name: without the characters file systems refuse, and not too long. */
export function fileName(text: string): string {
  return text.replace(invisible, '').replace(/[\\/:*?"<>|]/g, '').replace(/\s+/g, ' ').trim().slice(0, 100) || 'governmint';
}
