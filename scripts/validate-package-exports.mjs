#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function fail(message) {
  console.error(`EXPORTS validation failed: ${message}`);
  process.exit(1);
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`unable to parse ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function requireString(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    fail(`${label} must be a non-empty string`);
  }
  return value;
}

const pkg = readJson("package.json");

const main = requireString(pkg.main, "package.json main");
const modulePath = requireString(pkg.module, "package.json module");
const types = requireString(pkg.types, "package.json types");

const rootExports = pkg.exports?.["."];
if (!rootExports || typeof rootExports !== "object") {
  fail("package.json exports['.'] must exist");
}

const exportTypes = requireString(rootExports.types, "package.json exports['.'].types");
const exportImport = requireString(rootExports.import, "package.json exports['.'].import");
const exportRequire = requireString(rootExports.require, "package.json exports['.'].require");

if (types !== exportTypes) {
  fail(`types mismatch: package.json types='${types}' vs exports.types='${exportTypes}'`);
}
if (modulePath !== exportImport) {
  fail(`module mismatch: package.json module='${modulePath}' vs exports.import='${exportImport}'`);
}
if (main !== exportRequire) {
  fail(`main mismatch: package.json main='${main}' vs exports.require='${exportRequire}'`);
}

const fileRefs = new Set([main, modulePath, types, exportTypes, exportImport, exportRequire]);
for (const relPath of fileRefs) {
  if (!relPath.startsWith("./")) {
    fail(`path must be relative and start with './': ${relPath}`);
  }
  if (!existsSync(resolve(relPath))) {
    fail(`referenced file does not exist: ${relPath}`);
  }
}

const files = Array.isArray(pkg.files) ? pkg.files : [];
for (const required of ["dist", "README.md", "LICENSE"]) {
  if (!files.includes(required)) {
    fail(`package.json files must include '${required}'`);
  }
}

console.log("EXPORTS validation passed.");
