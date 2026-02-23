import { POST } from "@/app/api/logout/route";

test("returns 200 status", async () => {
    const res = await POST();
    expect(res.status).toBe(200);
});

test("returns { message: 'Logged out' } in body", async () => {
    const res = await POST();
    expect(await res.json()).toEqual({ message: "Logged out" });
});

test("sets session cookie to empty string", async () => {
    const res = await POST();
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("session=;");
});

test("sets cookie with HttpOnly flag", async () => {
    const res = await POST();
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("HttpOnly");
});

test("sets cookie Path to /login", async () => {
    const res = await POST();
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("Path=/login");
});

test("sets cookie with a past Expires date (to clear it)", async () => {
    const res = await POST();
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("Expires=");
    // The epoch date Thu, 01 Jan 1970 should appear in the cookie
    expect(setCookie).toContain("1970");
});

test("does not include Secure flag in non-production", async () => {
    const original = process.env.NODE_ENV;
    // jest runs in 'test' environment, so Secure should NOT be set
    const res = await POST();
    const setCookie = res.headers.get("set-cookie");
    // In test env NODE_ENV !== 'production', secure should be absent
    expect(setCookie).not.toContain("Secure");
    // restore
    Object.defineProperty(process.env, "NODE_ENV", { value: original });
});

