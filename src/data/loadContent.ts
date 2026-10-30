// Content loaders. Edit the source files in contents/ and push.
//   - profile.json holds identity, bio, links and stats (structured, so it stays JSON).
//   - Every list section is a CSV so it can be edited in any spreadsheet
//     (Excel / Numbers / Google Sheets): add a row, save as CSV, push.
import profile from '@/contents/profile.json';

import educationCsv from '@/contents/education.csv?raw';
import awardsCsv from '@/contents/awards.csv?raw';
import fundingCsv from '@/contents/funding.csv?raw';
import teachingCsv from '@/contents/teaching.csv?raw';
import serviceCsv from '@/contents/service.csv?raw';
import talksCsv from '@/contents/talks.csv?raw';
import membershipCsv from '@/contents/membership.csv?raw';
import pressCsv from '@/contents/press.csv?raw';
import publicationsCsv from '@/contents/publications.csv?raw';

export interface ListItem {
  text: string;
  highlight?: boolean;
  new?: boolean;
  url?: string;
  /** Optional second line, shown smaller (e.g. an advisor). */
  note?: string;
}

/**
 * Minimal RFC-4180-style CSV parser: handles quoted fields, embedded commas,
 * and escaped double-quotes (""). Returns an array of row objects keyed by the header row.
 */
function parseCsv(raw: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;

  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (inQuotes) {
      if (c === '"') {
        if (raw[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  if (rows.length === 0) return [];

  const header = rows[0].map((h) => h.trim().replace(/^﻿/, ''));
  return rows
    .slice(1)
    .filter((r) => r.some((c) => c.trim() !== ''))
    .map((r) => {
      const obj: Record<string, string> = {};
      header.forEach((h, idx) => {
        obj[h] = (r[idx] ?? '').trim();
      });
      return obj;
    });
}

const truthy = (v?: string): boolean =>
  !!v && ['true', 'yes', '1', 'x', 'y'].includes(v.toLowerCase());

function csvToItems(raw: string): ListItem[] {
  return parseCsv(raw)
    .map((r) => {
      const item: ListItem = { text: r.text ?? '' };
      if (truthy(r.highlight)) item.highlight = true;
      if (truthy(r.new)) item.new = true;
      if (r.url) item.url = r.url;
      if (r.note) item.note = r.note;
      return item;
    })
    .filter((i) => i.text.length > 0);
}

export interface Profile {
  name: string;
  /** Part of the name to underline in the Home page headline (the name you go by). */
  preferredName?: string;
  credential: string;
  roles: { role: string; org: string; url: string }[];
  email: string;
  office: string;
  headshot: string;
  initials: string;
  cv: string;
  siteUrl: string;
  links: {
    scholar: string;
    researchgate?: string;
    dblp?: string;
    orcid?: string;
    github: string;
    linkedin: string;
  };
  jobMarket: { title: string; text: string; url: string };
  stats: { label: string; value: string }[];
  bio: string[];
  /** true = show bioNotice instead of the bio paragraphs (bio text is kept). */
  bioUnderConstruction?: boolean;
  bioNotice?: string;
  futureLab: { eyebrow: string; heading: string; text: string; ctaLabel: string; ctaUrl: string };
  contactNote: string;
  researchNotice: string;
}

export const profileData = profile as Profile;

// Section headings for the CSV-backed lists (edit here if you rename a section);
// the rows themselves live in the matching contents/*.csv files.
export const educationData = { heading: 'Education', items: csvToItems(educationCsv) };
export const awardsData = { heading: 'Awards & Honors', items: csvToItems(awardsCsv) };
export const fundingData = { heading: 'Research Funding and Grants', items: csvToItems(fundingCsv) };
export const teachingData = { heading: 'Teaching and Faculty Appointments', items: csvToItems(teachingCsv) };
export const serviceData = { heading: 'Service, Mentoring, and Leadership', items: csvToItems(serviceCsv) };
export const talksData = { heading: 'Invited Talks', items: csvToItems(talksCsv) };
export const membershipData = { heading: 'Honor Societies and Memberships', items: csvToItems(membershipCsv) };
export const pressData = { heading: 'In the News', items: csvToItems(pressCsv) };

// Publications: one row per paper; rows are grouped by the "group" column in file order.
export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: string;
  link?: string;
  new?: boolean;
}
export interface PublicationGroup {
  heading: string;
  items: Publication[];
}

function loadPublications(raw: string): PublicationGroup[] {
  const groups: PublicationGroup[] = [];
  for (const r of parseCsv(raw)) {
    if (!r.title) continue;
    const heading = r.group || 'Publications';
    let g = groups.find((x) => x.heading === heading);
    if (!g) {
      g = { heading, items: [] };
      groups.push(g);
    }
    g.items.push({
      id: r.id ?? '',
      title: r.title,
      authors: r.authors ?? '',
      venue: r.venue ?? '',
      year: r.year ?? '',
      link: r.link || undefined,
      new: truthy(r.new),
    });
  }
  return groups;
}

export const publicationGroups = loadPublications(publicationsCsv);
