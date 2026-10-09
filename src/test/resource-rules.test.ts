import { describe, expect, it } from "vitest";
import { RESOURCE_CATEGORIES } from "@/lib/resources";

describe("resource categories", () => {
  it("uses the three curated member collections", () => {
    expect(RESOURCE_CATEGORIES).toEqual(["Presentations", "Guides & PDFs", "Media & Assets"]);
  });
});