#!/usr/bin/env node
/**
 * Lightweight structural validation for OpenAPI 3.x JSON/YAML-ish JSON files.
 * Does not require external deps (no Spectral).
 *
 * Usage:
 *   node scripts/validate-openapi.mjs openapi/openapi.base.yaml
 *   node scripts/validate-openapi.mjs openapi/api.example.com.json
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

function fail(msg) {
	console.error(`FAIL: ${msg}`);
	process.exitCode = 1;
}

function ok(msg) {
	console.log(`OK: ${msg}`);
}

/** Minimal YAML subset: only for our hand-written openapi.base.yaml — prefer JSON for full specs. */
async function loadDoc(path) {
	const raw = await readFile(path, 'utf8');
	if (path.endsWith('.json')) {
		return JSON.parse(raw);
	}
	// For YAML base file we do a very small check without a YAML parser:
	// require openapi key via regex, then advise JSON for deep validation.
	if (!/^openapi:\s*['"]?3\./m.test(raw)) {
		fail(`${path}: missing openapi: 3.x header`);
	} else {
		ok(`${path}: openapi 3.x header present (YAML shallow check)`);
	}
	if (!/^info:/m.test(raw)) fail(`${path}: missing info:`);
	else ok(`${path}: info present`);
	if (!/^paths:/m.test(raw)) fail(`${path}: missing paths:`);
	else ok(`${path}: paths present`);
	if (!/bearerAuth|securitySchemes/m.test(raw)) {
		fail(`${path}: expected securitySchemes / bearerAuth`);
	} else {
		ok(`${path}: security schemes mentioned`);
	}
	return null;
}

function validateJsonSpec(doc, path) {
	if (typeof doc !== 'object' || doc == null) {
		fail(`${path}: root must be object`);
		return;
	}
	const ver = doc.openapi ?? doc.swagger;
	if (!ver || !String(ver).startsWith('3')) {
		fail(`${path}: openapi must be 3.x (got ${ver})`);
	} else {
		ok(`${path}: openapi ${ver}`);
	}
	if (!doc.info?.title) fail(`${path}: info.title required`);
	else ok(`${path}: info.title = ${doc.info.title}`);
	if (!doc.paths || typeof doc.paths !== 'object') fail(`${path}: paths required`);
	else ok(`${path}: paths count = ${Object.keys(doc.paths).length}`);
	const schemes = doc.components?.securitySchemes;
	if (schemes) ok(`${path}: securitySchemes = ${Object.keys(schemes).join(', ')}`);
	else console.warn(`WARN: ${path}: no components.securitySchemes`);
}

async function main() {
	const files = process.argv.slice(2);
	if (files.length === 0) {
		console.error('Usage: node scripts/validate-openapi.mjs <file>...');
		process.exit(1);
	}
	for (const f of files) {
		const path = resolve(f);
		const doc = await loadDoc(path);
		if (doc) validateJsonSpec(doc, path);
	}
	if (process.exitCode) process.exit(process.exitCode);
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
