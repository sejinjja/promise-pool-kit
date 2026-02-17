#!/usr/bin/env node

import { readFileSync } from "node:fs";

function fail(message) {
  console.error(`CHANGELOG validation failed: ${message}`);
  process.exit(1);
}

function parseSemver(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);
  if (!match) {
    return null;
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3])
  };
}

function compareSemverDesc(a, b) {
  if (a.major !== b.major) return b.major - a.major;
  if (a.minor !== b.minor) return b.minor - a.minor;
  return b.patch - a.patch;
}

function isValidDate(dateString) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

const content = readFileSync("CHANGELOG.md", "utf8");
const lines = content.split(/\r?\n/);

const headingLines = lines
  .map((line, index) => ({ line: line.trim(), index: index + 1 }))
  .filter(({ line }) => line.startsWith("## "));

if (headingLines.length === 0) {
  fail("no level-2 headings found");
}

if (headingLines[0].line !== "## Unreleased") {
  fail("first section must be '## Unreleased'");
}

const releaseHeadings = headingLines.slice(1);
if (releaseHeadings.length === 0) {
  fail("at least one released version section is required");
}

const seen = new Set();
let previous = null;

for (let i = 0; i < releaseHeadings.length; i += 1) {
  const { line, index } = releaseHeadings[i];
  const match = /^## (\d+\.\d+\.\d+) - (\d{4}-\d{2}-\d{2})$/.exec(line);
  if (!match) {
    fail(`invalid release heading format at line ${index}: '${line}'`);
  }

  const version = match[1];
  const dateString = match[2];
  const parsed = parseSemver(version);
  if (!parsed) {
    fail(`invalid semantic version at line ${index}: '${version}'`);
  }
  if (!isValidDate(dateString)) {
    fail(`invalid release date at line ${index}: '${dateString}'`);
  }
  if (seen.has(version)) {
    fail(`duplicate version heading '${version}' at line ${index}`);
  }
  seen.add(version);

  if (previous && compareSemverDesc(previous, parsed) >= 0) {
    fail("release versions must be in strictly descending order");
  }
  previous = parsed;

  const nextHeading = releaseHeadings[i + 1];
  const sectionBody = lines.slice(index, nextHeading ? nextHeading.index - 1 : lines.length);
  const hasBullet = sectionBody.some((bodyLine) => bodyLine.trim().startsWith("- "));
  if (!hasBullet) {
    fail(`release section ${version} must include at least one bullet item`);
  }
}

console.log("CHANGELOG validation passed.");
