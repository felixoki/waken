import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "fs";
import { VERSION } from "./globals";

test("VERSION matches package.json", () => {
  const url = new URL("../../package.json", import.meta.url);
  const { version } = JSON.parse(readFileSync(url, "utf8"));

  assert.equal(VERSION, version);
});
