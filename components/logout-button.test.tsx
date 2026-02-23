import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LogoutButton from "@/components/logout-button";

const mockPush = jest.fn();
const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push: mockPush,
        refresh: mockRefresh,
    }),
}));

jest.mock("sonner", () => ({
    toast: {
        success: jest.fn(),
        error: jest.fn(),
    },
}));

global.fetch = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();
});

test("renders the Logout trigger button", () => {
    render(<LogoutButton />);
    expect(screen.getByRole("button", { name: /logout/i })).toBeInTheDocument();
});

test("opens confirmation dialog when Logout is clicked", async () => {
    render(<LogoutButton />);
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));
    await waitFor(() => {
        expect(screen.getByText("Logout Confirmation")).toBeInTheDocument();
    });
});

test("shows confirmation description in dialog", async () => {
    render(<LogoutButton />);
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));
    await waitFor(() => {
        expect(screen.getByText("Are you sure want to logout?")).toBeInTheDocument();
    });
});

test("shows Cancel and Yes, Logout buttons in dialog", async () => {
    render(<LogoutButton />);
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));
    await waitFor(() => {
        expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /yes, logout/i })).toBeInTheDocument();
    });
});

test("calls POST /api/logout when Yes, Logout is clicked", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    render(<LogoutButton />);
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));
    await waitFor(() => screen.getByRole("button", { name: /yes, logout/i }));
    fireEvent.click(screen.getByRole("button", { name: /yes, logout/i }));
    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/logout", { method: "POST" });
    });
});

test("shows success toast and navigates to /login on success", async () => {
    const { toast } = require("sonner");
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true });
    render(<LogoutButton />);
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));
    await waitFor(() => screen.getByRole("button", { name: /yes, logout/i }));
    fireEvent.click(screen.getByRole("button", { name: /yes, logout/i }));
    await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("logout success");
        expect(mockPush).toHaveBeenCalledWith("/login");
        expect(mockRefresh).toHaveBeenCalled();
    });
});

test("shows error toast when fetch returns non-ok", async () => {
    const { toast } = require("sonner");
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    render(<LogoutButton />);
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));
    await waitFor(() => screen.getByRole("button", { name: /yes, logout/i }));
    fireEvent.click(screen.getByRole("button", { name: /yes, logout/i }));
    await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Logout failed");
    });
});

test("shows error toast when fetch throws an error", async () => {
    const { toast } = require("sonner");
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
    render(<LogoutButton />);
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));
    await waitFor(() => screen.getByRole("button", { name: /yes, logout/i }));
    fireEvent.click(screen.getByRole("button", { name: /yes, logout/i }));
    await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Network error");
    });
});

test("does not navigate to /login when logout fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false });
    render(<LogoutButton />);
    fireEvent.click(screen.getByRole("button", { name: /logout/i }));
    await waitFor(() => screen.getByRole("button", { name: /yes, logout/i }));
    fireEvent.click(screen.getByRole("button", { name: /yes, logout/i }));
    await waitFor(() => {
        expect(mockPush).not.toHaveBeenCalled();
    });
});

