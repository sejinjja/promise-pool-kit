#!/usr/bin/env node

import { readFileSync } from "node:fs";

function fail(message) {
  console.error(message);
  process.exit(1);
}

const arg = process.argv[2];
if (!arg) {
  fail("Usage: node scripts/changelog-section.mjs <version|vversion>");
}

const version = arg.startsWith("v") ? arg.slice(1) : arg;
if (!/^\d+\.\d+\.\d+$/.test(version)) {
  fail(`Invalid version: ${arg}`);
}

const content = readFileSync("CHANGELOG.md", "utf8");
const lines = content.split(/\r?\n/);
const heading = `## ${version} - `;
const start = lines.findIndex((line) => line.startsWith(heading));

if (start < 0) {
  fail(`Version section not found in CHANGELOG.md: ${version}`);
}

let end = lines.length;
for (let i = start + 1; i < lines.length; i += 1) {
  if (lines[i].startsWith("## ")) {
    end = i;
    break;
  }
}

const body = lines.slice(start + 1, end);
while (body.length > 0 && body[0].trim() === "") {
  body.shift();
}
while (body.length > 0 && body[body.length - 1].trim() === "") {
  body.pop();
}

if (body.length === 0) {
  fail(`Version section ${version} has no release notes.`);
}

console.log(body.join("\n"));
