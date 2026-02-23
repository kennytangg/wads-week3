import { POST } from "@/app/api/session/route";
import { NextRequest } from "next/server";

const mockVerifyIdToken = jest.fn();

jest.mock("@/lib/firebase-admin", () => ({
    adminAuth: {
        verifyIdToken: (...args: any[]) => mockVerifyIdToken(...args),
    },
}));

function makeRequest(authHeader?: string): NextRequest {
    const headers: Record<string, string> = {};
    if (authHeader) headers["Authorization"] = authHeader;
    return new NextRequest("http://localhost/api/session", {
        method: "POST",
        headers,
    });
}

beforeEach(() => jest.clearAllMocks());

test("returns 401 when Authorization header is missing", async () => {
    const res = await POST(makeRequest());
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
});

test("returns 401 when Authorization does not start with 'Bearer '", async () => {
    const res = await POST(makeRequest("Basic sometoken"));
    expect(res.status).toBe(401);
    expect(await res.json()).toEqual({ error: "Unauthorized" });
});

test("calls adminAuth.verifyIdToken with the extracted token", async () => {
    mockVerifyIdToken.mockResolvedValueOnce({});
    await POST(makeRequest("Bearer my-token-abc"));
    expect(mockVerifyIdToken).toHaveBeenCalledWith("my-token-abc", true);
});

test("returns 200 with { status: 'success' } on valid token", async () => {
    mockVerifyIdToken.mockResolvedValueOnce({});
    const res = await POST(makeRequest("Bearer valid-token"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "success" });
});

test("sets session cookie in the response", async () => {
    mockVerifyIdToken.mockResolvedValueOnce({});
    const res = await POST(makeRequest("Bearer valid-token"));
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("session=valid-token");
});

test("sets session cookie with httpOnly flag", async () => {
    mockVerifyIdToken.mockResolvedValueOnce({});
    const res = await POST(makeRequest("Bearer valid-token"));
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("HttpOnly");
});

test("sets session cookie with Secure flag", async () => {
    mockVerifyIdToken.mockResolvedValueOnce({});
    const res = await POST(makeRequest("Bearer valid-token"));
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("Secure");
});

test("sets session cookie Path to /", async () => {
    mockVerifyIdToken.mockResolvedValueOnce({});
    const res = await POST(makeRequest("Bearer valid-token"));
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("Path=/");
});

test("returns 500 when verifyIdToken throws", async () => {
    mockVerifyIdToken.mockRejectedValueOnce(new Error("Token expired"));
    await expect(POST(makeRequest("Bearer bad-token"))).rejects.toThrow("Token expired");
});

