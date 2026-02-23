import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginPage from "@/app/login/page";

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

jest.mock("@/lib/firebase", () => ({ auth: {} }));

const mockSignInWithPopup = jest.fn();
const mockSignInWithEmailAndPassword = jest.fn();

jest.mock("firebase/auth", () => ({
    signInWithPopup: (...args: any[]) => mockSignInWithPopup(...args),
    signInWithEmailAndPassword: (...args: any[]) => mockSignInWithEmailAndPassword(...args),
    GoogleAuthProvider: jest.fn().mockImplementation(() => ({})),
}));

jest.mock("sonner", () => ({
    toast: { success: jest.fn(), error: jest.fn() },
}));

global.fetch = jest.fn();

beforeEach(() => jest.clearAllMocks());

test("renders the Sign in heading", () => {
    render(<LoginPage />);
    expect(screen.getByText("Sign in to Your Account")).toBeInTheDocument();
});

test("renders Email address input", () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText("Email address")).toBeInTheDocument();
});

test("renders Password input", () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
});

test("renders Continue with Google button", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
});

test("renders Login with Email button", () => {
    render(<LoginPage />);
    expect(screen.getByRole("button", { name: /login with email/i })).toBeInTheDocument();
});

test("renders OR separator text", () => {
    render(<LoginPage />);
    expect(screen.getByText("OR")).toBeInTheDocument();
});

test("updates email input on change", () => {
    render(<LoginPage />);
    const input = screen.getByPlaceholderText("Email address");
    fireEvent.change(input, { target: { value: "user@example.com" } });
    expect(input).toHaveValue("user@example.com");
});

test("updates password input on change", () => {
    render(<LoginPage />);
    const input = screen.getByPlaceholderText("Password");
    fireEvent.change(input, { target: { value: "secret123" } });
    expect(input).toHaveValue("secret123");
});

test("shows Processing... during Google login", async () => {
    mockSignInWithPopup.mockReturnValue(new Promise(() => { }));
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));
    await waitFor(() => {
        expect(screen.getByRole("button", { name: /processing/i })).toBeInTheDocument();
    });
});

test("shows Signing in... during email login", async () => {
    mockSignInWithEmailAndPassword.mockReturnValue(new Promise(() => { }));
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /login with email/i }));
    await waitFor(() => {
        expect(screen.getByRole("button", { name: /signing in/i })).toBeInTheDocument();
    });
});

test("handles Google login success — shows toast and redirects", async () => {
    const { toast } = require("sonner");
    mockSignInWithPopup.mockResolvedValueOnce({
        user: { getIdToken: jest.fn().mockResolvedValueOnce("google-token") },
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));
    await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Login success 🎉");
        expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
});

test("handles Google login failure — shows error toast", async () => {
    const { toast } = require("sonner");
    mockSignInWithPopup.mockRejectedValueOnce({ message: "Popup closed" });
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /continue with google/i }));
    await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Popup closed");
    });
});

test("handles email login success — shows toast and redirects", async () => {
    const { toast } = require("sonner");
    mockSignInWithEmailAndPassword.mockResolvedValueOnce({
        user: { getIdToken: jest.fn().mockResolvedValueOnce("email-token") },
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    render(<LoginPage />);
    fireEvent.change(screen.getByPlaceholderText("Email address"), {
        target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
        target: { value: "pass123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login with email/i }));
    await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Login success");
        expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
});

test("shows 'User not found' for auth/user-not-found", async () => {
    const { toast } = require("sonner");
    mockSignInWithEmailAndPassword.mockRejectedValueOnce({ code: "auth/user-not-found" });
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /login with email/i }));
    await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("User not found");
    });
});

test("shows 'wrong password' for auth/wrong-password", async () => {
    const { toast } = require("sonner");
    mockSignInWithEmailAndPassword.mockRejectedValueOnce({ code: "auth/wrong-password" });
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /login with email/i }));
    await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("wrong password");
    });
});

test("shows 'invalid email format' for auth/invalid-email", async () => {
    const { toast } = require("sonner");
    mockSignInWithEmailAndPassword.mockRejectedValueOnce({ code: "auth/invalid-email" });
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /login with email/i }));
    await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("invalid email format");
    });
});

test("shows 'Login failed' for unknown error codes", async () => {
    const { toast } = require("sonner");
    mockSignInWithEmailAndPassword.mockRejectedValueOnce({ code: "auth/unknown" });
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /login with email/i }));
    await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Login failed");
    });
});

test("calls createSession (POST /api/session) with Bearer token on email login", async () => {
    mockSignInWithEmailAndPassword.mockResolvedValueOnce({
        user: { getIdToken: jest.fn().mockResolvedValueOnce("my-id-token") },
    });
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    render(<LoginPage />);
    fireEvent.click(screen.getByRole("button", { name: /login with email/i }));
    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/session", {
            method: "POST",
            headers: { Authorization: "Bearer my-id-token" },
        });
    });
});

