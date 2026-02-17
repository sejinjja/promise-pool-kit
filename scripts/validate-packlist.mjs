#!/usr/bin/env node

import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

function fail(message) {
  console.error(`PACKLIST validation failed: ${message}`);
  process.exit(1);
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`unable to parse ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function runPackDryRun() {
  try {
    return execSync("npm pack --dry-run --json", {
      encoding: "utf8",
      stdio: "pipe"
    });
  } catch (error) {
    const stderr = String(error?.stderr ?? "");
    const stdout = String(error?.stdout ?? "");
    fail(`npm pack --dry-run failed.\n${stdout}\n${stderr}`.trim());
  }
}

const pkg = readJson("package.json");
const packRaw = runPackDryRun();

let packJson;
try {
  packJson = JSON.parse(packRaw);
} catch (error) {
  fail(`unable to parse npm pack output: ${error instanceof Error ? error.message : String(error)}`);
}

if (!Array.isArray(packJson) || packJson.length !== 1) {
  fail("npm pack output must contain a single package entry");
}

const packed = packJson[0];
if (packed.name !== pkg.name) {
  fail(`packed name mismatch: expected '${pkg.name}', got '${packed.name ?? ""}'`);
}
if (packed.version !== pkg.version) {
  fail(`packed version mismatch: expected '${pkg.version}', got '${packed.version ?? ""}'`);
}

const filePaths = new Set((packed.files ?? []).map((file) => file.path));
const requiredPaths = [
  "LICENSE",
  "README.md",
  "dist/index.cjs",
  "dist/index.js",
  "dist/index.d.ts",
  "package.json"
];

for (const required of requiredPaths) {
  if (!filePaths.has(required)) {
    fail(`required file is missing from package tarball: ${required}`);
  }
}

const forbiddenPrefixes = ["src/", "test/", "scripts/"];
for (const path of filePaths) {
  if (forbiddenPrefixes.some((prefix) => path.startsWith(prefix))) {
    fail(`forbidden path included in package tarball: ${path}`);
  }
}

console.log("PACKLIST validation passed.");
