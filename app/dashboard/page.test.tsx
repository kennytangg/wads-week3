import React from "react";
import { render, screen } from "@testing-library/react";

const mockRedirect = jest.fn();
const mockGet = jest.fn();
const mockVerifyIdToken = jest.fn();

jest.mock("next/navigation", () => ({
    redirect: (url: string) => {
        mockRedirect(url);
        throw new Error(`NEXT_REDIRECT:${url}`);
    },
}));

jest.mock("next/headers", () => ({
    cookies: jest.fn(() =>
        Promise.resolve({
            get: mockGet,
        })
    ),
}));

jest.mock("@/lib/firebase-admin", () => ({
    adminAuth: {
        verifyIdToken: (...args: any[]) => mockVerifyIdToken(...args),
    },
}));

jest.mock("@/components/logout-button", () => ({
    __esModule: true,
    default: () => <button>Logout</button>,
}));

import DashboardPage from "@/app/dashboard/page";

beforeEach(() => jest.clearAllMocks());

test("redirects to /login when session cookie is missing", async () => {
    mockGet.mockReturnValue(undefined);
    await expect(DashboardPage()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
});

test("redirects to /login when token verification fails", async () => {
    mockGet.mockReturnValue({ value: "bad-token" });
    mockVerifyIdToken.mockRejectedValueOnce(new Error("Invalid token"));
    await expect(DashboardPage()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(mockRedirect).toHaveBeenCalledWith("/login");
});

test("renders Dashboard heading when session is valid", async () => {
    mockGet.mockReturnValue({ value: "valid-token" });
    mockVerifyIdToken.mockResolvedValueOnce({
        uid: "uid-123",
        email: "user@example.com",
        email_verified: true,
    });
    const page = await DashboardPage();
    render(page as React.ReactElement);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
});

test("renders user email from decoded token", async () => {
    mockGet.mockReturnValue({ value: "valid-token" });
    mockVerifyIdToken.mockResolvedValueOnce({
        uid: "uid-123",
        email: "user@example.com",
        email_verified: true,
    });
    const page = await DashboardPage();
    render(page as React.ReactElement);
    expect(screen.getByText("user@example.com")).toBeInTheDocument();
});

test("renders user UID from decoded token", async () => {
    mockGet.mockReturnValue({ value: "valid-token" });
    mockVerifyIdToken.mockResolvedValueOnce({
        uid: "uid-123",
        email: "user@example.com",
        email_verified: false,
    });
    const page = await DashboardPage();
    render(page as React.ReactElement);
    expect(screen.getByText("uid-123")).toBeInTheDocument();
});

test("shows 'Yes' when email_verified is true", async () => {
    mockGet.mockReturnValue({ value: "valid-token" });
    mockVerifyIdToken.mockResolvedValueOnce({
        uid: "uid-123",
        email: "user@example.com",
        email_verified: true,
    });
    const page = await DashboardPage();
    render(page as React.ReactElement);
    expect(screen.getByText("Yes")).toBeInTheDocument();
});

test("shows 'No' when email_verified is false", async () => {
    mockGet.mockReturnValue({ value: "valid-token" });
    mockVerifyIdToken.mockResolvedValueOnce({
        uid: "uid-123",
        email: "user@example.com",
        email_verified: false,
    });
    const page = await DashboardPage();
    render(page as React.ReactElement);
    expect(screen.getByText("No")).toBeInTheDocument();
});

test("renders User Information and Welcome cards", async () => {
    mockGet.mockReturnValue({ value: "valid-token" });
    mockVerifyIdToken.mockResolvedValueOnce({
        uid: "uid-123",
        email: "user@example.com",
        email_verified: true,
    });
    const page = await DashboardPage();
    render(page as React.ReactElement);
    expect(screen.getByText("User Information")).toBeInTheDocument();
    expect(screen.getByText("Welcome")).toBeInTheDocument();
});

test("renders LogoutButton", async () => {
    mockGet.mockReturnValue({ value: "valid-token" });
    mockVerifyIdToken.mockResolvedValueOnce({
        uid: "uid-123",
        email: "user@example.com",
        email_verified: true,
    });
    const page = await DashboardPage();
    render(page as React.ReactElement);
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
});

