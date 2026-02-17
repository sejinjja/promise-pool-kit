#!/usr/bin/env node

import { readFileSync } from "node:fs";

function fail(message) {
  console.error(`LOCKFILE validation failed: ${message}`);
  process.exit(1);
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`unable to parse ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const pkg = readJson("package.json");
const lock = readJson("package-lock.json");

if (!pkg.name || !pkg.version) {
  fail("package.json must contain both name and version");
}

if (lock.name !== pkg.name) {
  fail(`package-lock.json name mismatch: expected '${pkg.name}', got '${lock.name ?? ""}'`);
}

if (lock.version !== pkg.version) {
  fail(`package-lock.json version mismatch: expected '${pkg.version}', got '${lock.version ?? ""}'`);
}

const root = lock.packages?.[""];
if (!root) {
  fail("package-lock.json must include root packages[''] metadata");
}

if (root.name && root.name !== pkg.name) {
  fail(`package-lock root name mismatch: expected '${pkg.name}', got '${root.name}'`);
}

if (root.version !== pkg.version) {
  fail(`package-lock root version mismatch: expected '${pkg.version}', got '${root.version ?? ""}'`);
}

console.log("LOCKFILE validation passed.");
