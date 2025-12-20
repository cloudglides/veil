import { describe, it, expect } from "vitest";
import { getFingerprint } from "./index";

describe("veil fingerprinting", () => {
  it("should generate consistent fingerprint", async () => {
    const fp1 = await getFingerprint();
    const fp2 = await getFingerprint();
    expect(fp1).toBe(fp2);
  });

  it("should generate different fingerprints with different options", async () => {
    const fp1 = await getFingerprint({ entropy: { canvas: true } });
    const fp2 = await getFingerprint({ entropy: { canvas: false } });
    expect(fp1).not.toBe(fp2);
  });

  it("should support SHA-512", async () => {
    const fp = await getFingerprint({ hash: "sha512" });
    expect(fp.length).toBeGreaterThan(64);
  });

  it("should return hex string", async () => {
    const fp = await getFingerprint();
    expect(/^[a-f0-9]+$/.test(fp)).toBe(true);
  });
});
