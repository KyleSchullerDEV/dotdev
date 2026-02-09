import { describe, it, expect } from "vitest";
import { slugify, formatDate, readingTime } from "./utils";

describe("slugify", () => {
  it("converts text to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("my blog post")).toBe("my-blog-post");
  });

  it("removes special characters", () => {
    expect(slugify("Hello! How are you?")).toBe("hello-how-are-you");
  });

  it("handles multiple spaces and hyphens", () => {
    expect(slugify("too   many   spaces")).toBe("too-many-spaces");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("  hello world  ")).toBe("hello-world");
  });

  it("handles empty strings", () => {
    expect(slugify("")).toBe("");
  });
});

describe("formatDate", () => {
  it("formats a Date object", () => {
    const date = new Date("2025-01-15");
    expect(formatDate(date)).toBe("15 January 2025");
  });

  it("formats a timestamp", () => {
    const timestamp = new Date("2025-06-01").getTime();
    expect(formatDate(timestamp)).toBe("1 June 2025");
  });
});

describe("readingTime", () => {
  it("returns 1 min read for short text", () => {
    expect(readingTime("Hello world")).toBe("1 min read");
  });

  it("estimates correctly for longer text", () => {
    const words = Array(400).fill("word").join(" ");
    expect(readingTime(words)).toBe("2 min read");
  });

  it("rounds to nearest minute", () => {
    const words = Array(500).fill("word").join(" ");
    expect(readingTime(words)).toBe("3 min read");
  });

  it("handles empty string", () => {
    expect(readingTime("")).toBe("1 min read");
  });
});
