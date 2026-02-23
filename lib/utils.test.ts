import { cn } from "@/lib/utils";

test("returns a single class name unchanged", () => {
    expect(cn("text-red-500")).toBe("text-red-500");
});

test("merges multiple class names", () => {
    expect(cn("text-red-500", "bg-blue-500")).toBe("text-red-500 bg-blue-500");
});

test("resolves tailwind conflicting classes — last one wins", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
});

test("handles conditional classes with object syntax (true)", () => {
    expect(cn("base", { "text-red-500": true, "text-blue-500": false })).toBe("base text-red-500");
});

test("handles conditional classes with object syntax (false)", () => {
    expect(cn("base", { hidden: false })).toBe("base");
});

test("handles undefined values", () => {
    expect(cn("base", undefined, "end")).toBe("base end");
});

test("handles null values", () => {
    expect(cn("base", null, "end")).toBe("base end");
});

test("handles empty strings", () => {
    expect(cn("", "text-red-500")).toBe("text-red-500");
});

test("returns empty string for no input", () => {
    expect(cn()).toBe("");
});

test("handles array of class names", () => {
    expect(cn(["text-sm", "font-bold"])).toBe("text-sm font-bold");
});

test("resolves conflicting padding classes — last wins", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
});

test("resolves conflicting margin classes — last wins", () => {
    expect(cn("mt-2", "mt-8")).toBe("mt-8");
});

test("merges non-conflicting utility classes", () => {
    expect(cn("rounded", "border", "p-4")).toBe("rounded border p-4");
});

