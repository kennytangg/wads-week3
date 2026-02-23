import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "@/app/page";

test("renders the heading text", () => {
    render(<Home />);
    expect(screen.getByText("This is button component from shadcn/ui")).toBeInTheDocument();
});

test("renders a button element", () => {
    render(<Home />);
    expect(screen.getByRole("button", { name: /button/i })).toBeInTheDocument();
});

test("renders the button with outline variant", () => {
    render(<Home />);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "outline");
});

test("renders the button with custom class names applied", () => {
    render(<Home />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveClass("bg-red-400");
    expect(btn).toHaveClass("border-2");
    expect(btn).toHaveClass("border-gray-700");
});

test("renders the heading inside a div", () => {
    const { container } = render(<Home />);
    const heading = screen.getByText("This is button component from shadcn/ui");
    expect(container.firstChild).toContainElement(heading);
});

