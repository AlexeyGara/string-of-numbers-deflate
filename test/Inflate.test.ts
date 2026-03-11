/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: String of Numbers Deflate
 * File: Inflate.ts
 * Path: test/
 * Author: alexeygara
 * Last modified: 2026-03-01 23:31
 */

import { Inflate } from 'Inflate';

// Polyfill for the Node.js environment (if running via jest/vitest)
if (typeof atob === 'undefined') {
	global.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
}

describe('Inflate Class', () => {

	// Test data:
	// "1,1,3,4,26,188,237,256,300" (in deltas this is 1,0,2,1,22,162,49,19,44)
	const mockBase64 = "AQACARaiMRMs";
	const mockBits = 8;
	const mockCount = 9;
	const expectedString = "1,1,3,4,26,188,237,256,300";

	describe('deserialize()', () => {

		test('should correctly inflate base64 to original comma-separated string', () => {
			const result = Inflate.deserialize(mockBase64, mockBits, mockCount);

			expect(typeof result).toBe('string');
			expect(result).toBe(expectedString);
		});

		test('should restore correct numbers from small bit-size (e.g. 3 bits)', () => {
			// Numbers: 1, 2, 3, 4, 5 (deltas: 1, 1, 1, 1, 1)
			// 5 numbers of 3 bits = 15 bits (2 bytes)
			// In bits (LSB): 001 001 001 001 001 -> 01001001 00010010 -> 0x49, 0x12
			const base64Small = btoa(String.fromCharCode(0x49, 0x12));
			const result = Inflate.deserialize(base64Small, 3, 5);

			expect(result).toBe("1,2,3,4,5");
		});

		test('should handle single-value input (edge case)', () => {
			// Number 300 (9 bits): 1 0010 1100 -> bytes [0x2c, 0x01]
			const base64Single = btoa(String.fromCharCode(0x2c, 0x01));
			const result = Inflate.deserialize(base64Single, 9, 1);

			expect(result).toBe("300");
		});

		test('should throw error if base64 is corrupted', () => {
			const corrupted = "!!!NotBase64!!!";
			// atob() will throw an exception on invalid characters
			expect(() => {
				Inflate.deserialize(corrupted, 9, 9);
			}).toThrow();
		});
	});

	describe('Internal logic: convertFromResiduals', () => {
		// Here we check indirectly through the result of deserialize.
		test('should handle zero differences (repeated numbers)', () => {
			// Numbers 8, 8 (deltas 8, 0)
			const base64Repeated = btoa(String.fromCharCode(0x08, 0x00));
			const result = Inflate.deserialize(base64Repeated, 9, 2);
			expect(result).toBe("8,8");
		});
	});
});
