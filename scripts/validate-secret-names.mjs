#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

function fromCodes(codes) {
  return String.fromCharCode(...codes);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const FORBIDDEN_PATTERNS = [
  {
    label: "legacy alias A",
    regex: new RegExp(`\\b${escapeRegExp(fromCodes([78, 80, 77, 95, 84, 79, 75, 69, 78]))}\\b`, "gi")
  },
  {
    label: "legacy alias B",
    regex: new RegExp(
      `\\b${escapeRegExp(fromCodes([78, 79, 68, 69, 95, 65, 85, 84, 72, 95, 84, 79, 75, 69, 78]))}\\b`,
      "gi"
    )
  }
];

const IGNORED_FILES = new Set(["scripts/validate-secret-names.mjs"]);

function fail(message) {
  console.error(`SECRET naming validation failed: ${message}`);
  process.exit(1);
}

function listTrackedFiles() {
  const output = execFileSync("git", ["ls-files"], { encoding: "utf8" });
  return output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function isLikelyText(content) {
  return !content.includes("\u0000");
}

const violations = [];

for (const file of listTrackedFiles()) {
  if (IGNORED_FILES.has(file)) {
    continue;
  }

  let content;
  try {
    content = readFileSync(file, "utf8");
  } catch {
    continue;
  }

  if (!isLikelyText(content)) {
    continue;
  }

  const lines = content.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    for (const pattern of FORBIDDEN_PATTERNS) {
      pattern.regex.lastIndex = 0;
      if (pattern.regex.test(line)) {
        violations.push({
          file,
          line: i + 1,
          label: pattern.label
        });
      }
    }
  }
}

if (violations.length > 0) {
  for (const violation of violations) {
    console.error(
      `${violation.file}:${violation.line} contains forbidden secret alias '${violation.label}'.`
    );
  }
  fail("remove legacy secret aliases from repository files");
}

console.log("SECRET naming validation passed.");
