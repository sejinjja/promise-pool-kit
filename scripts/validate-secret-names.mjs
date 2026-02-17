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
  },
  {
    label: "deprecated indirection alias",
    regex: new RegExp(
      `\\b${escapeRegExp(fromCodes([80, 85, 66, 76, 73, 83, 72, 95, 83, 69, 67, 82, 69, 84, 95, 78, 65, 77, 69]))}\\b`,
      "gi"
    )
  },
  {
    label: "legacy alias C",
    regex: new RegExp(`\\b${escapeRegExp(fromCodes([80, 85, 66, 76, 73, 83, 72, 95, 84, 79, 75, 69, 78]))}\\b`, "gi")
  }
];

const WORKFLOW_SECRET_POLICY = {
  file: ".github/workflows/publish.yml",
  allowedExplicitNames: new Set([
    fromCodes([80, 85, 66, 76, 73, 83, 72, 95, 67, 82, 69, 68, 69, 78, 84, 73, 65, 76])
  ])
};

const WORKFLOW_PATH_REGEX = /^\.github\/workflows\/[^/]+\.ya?ml$/;

const SECRET_NAME_USAGE_POLICY = {
  restrictedNames: [...WORKFLOW_SECRET_POLICY.allowedExplicitNames],
  allowedFiles: new Set([WORKFLOW_SECRET_POLICY.file])
};

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

    if (file === WORKFLOW_SECRET_POLICY.file) {
      for (const match of line.matchAll(/\bsecrets\.([A-Za-z_][A-Za-z0-9_]*)\b/g)) {
        const referencedName = match[1];
        if (!WORKFLOW_SECRET_POLICY.allowedExplicitNames.has(referencedName)) {
          violations.push({
            file,
            line: i + 1,
            label: "unauthorized workflow secret reference",
            detail: referencedName
          });
        }
      }

      if (/\bsecrets\[/.test(line)) {
        violations.push({
          file,
          line: i + 1,
          label: "workflow secret indirection reference"
        });
      }
    }

    if (WORKFLOW_PATH_REGEX.test(file) && file !== WORKFLOW_SECRET_POLICY.file) {
      if (/\bsecrets\.[A-Za-z_][A-Za-z0-9_]*\b|\bsecrets\[/.test(line)) {
        violations.push({
          file,
          line: i + 1,
          label: "workflow secret reference outside approved workflow"
        });
      }
    }

    if (!SECRET_NAME_USAGE_POLICY.allowedFiles.has(file)) {
      for (const restrictedName of SECRET_NAME_USAGE_POLICY.restrictedNames) {
        const restrictedRegex = new RegExp(`\\b${escapeRegExp(restrictedName)}\\b`, "g");
        if (restrictedRegex.test(line)) {
          violations.push({
            file,
            line: i + 1,
            label: "restricted secret-name exposure",
            detail: restrictedName
          });
        }
      }
    }
  }
}

if (violations.length > 0) {
  for (const violation of violations) {
    const detailSuffix = violation.detail ? ` (${violation.detail})` : "";
    console.error(
      `${violation.file}:${violation.line} contains forbidden secret naming pattern '${violation.label}'${detailSuffix}.`
    );
  }
  fail("remove forbidden secret naming patterns from repository files");
}

console.log("SECRET naming validation passed.");
