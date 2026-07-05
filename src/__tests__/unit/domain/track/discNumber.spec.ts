import DiscNumber from "#domain/track/DiscNumber.js";
import { describe, expect, it } from "vitest";

describe("DiscNumber Value Object", () => {
	it("should create a correct object", () => {
		const discNumber = new DiscNumber(1);
		expect(discNumber.value).toBe(1);
	});
	it("should throw error if is not an integer", () => {
		expect(() => new DiscNumber(10.9)).toThrow(
			"Disc number must be a non-negative integer"
		);
	});
	it("should throw error if is a negative number", () => {
		expect(() => new DiscNumber(-10)).toThrow(
			"Disc number must be a non-negative integer"
		);
	});
	it("should throw error if is less than 1", () => {
		expect(() => new DiscNumber(0)).toThrow(
			"Disc number must be at least 1"
		);
	});
})
