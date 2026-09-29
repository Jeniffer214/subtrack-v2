import { describe, expect, it } from "vitest";
import { isAuthorized } from "@/lib/access";
import { createRateLimiter } from "@/lib/rate-limit";

const basic = (s: string) => `Basic ${Buffer.from(s).toString("base64")}`;

describe("isAuthorized", () => {
  it("accepts any username with the right password", () => {
    expect(isAuthorized(basic("guest:s3cret"), "s3cret")).toBe(true);
    expect(isAuthorized(basic(":s3cret"), "s3cret")).toBe(true);
    expect(isAuthorized(basic("u:pa:ss"), "pa:ss")).toBe(true);
  });

  it("rejects wrong, missing or malformed credentials", () => {
    expect(isAuthorized(basic("guest:nope"), "s3cret")).toBe(false);
    expect(isAuthorized(basic("no-colon"), "s3cret")).toBe(false);
    expect(isAuthorized(null, "s3cret")).toBe(false);
    expect(isAuthorized("Bearer x", "s3cret")).toBe(false);
  });
});

describe("createRateLimiter", () => {
  it("allows up to the limit per window, per key", () => {
    const allow = createRateLimiter(2, 1000);
    expect([allow("a", 0), allow("a", 10), allow("a", 20)]).toEqual([true, true, false]);
    expect(allow("b", 20)).toBe(true);
    expect(allow("a", 1000)).toBe(true);
  });
});
