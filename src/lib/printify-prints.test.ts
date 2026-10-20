import { test } from "node:test";
import { strictEqual } from "node:assert";
import { printCatalogLine } from "./printify.server";

const variant = (label: string) => {
  const l = printCatalogLine(label, "https://x/y.jpg", 1);
  return l && "blueprintId" in l ? l.variantId : null;
};

test("12x16 print uses fine art poster", () => strictEqual(variant("Fine art print — 12 × 16 in"), 75290));
test("18x24 print uses fine art poster", () => strictEqual(variant("Fine art print — 18 × 24 in"), 100938));
test("framed 24x32 uses black framed print", () => strictEqual(variant("Framed print — 24 × 32 in"), 93826));
test("unknown size is not sent", () => strictEqual(variant("Canvas tote bag"), null));
