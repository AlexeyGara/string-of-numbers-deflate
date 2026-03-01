/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: String of Numbers Deflate
 * File: deflate-inflate.spec.ts
 * Path: test/
 * Author: alexeygara
 * Last modified: 2026-03-02 01:08
 */

import { Deflate } from 'Deflate';
import { Inflate } from 'Inflate';

// Полифилы для Node.js (если запускаем через pnpm jest/vitest)
if (typeof btoa === 'undefined') {
	(globalThis as any).btoa = (s: string) => Buffer.from(s, 'binary').toString('base64');
	(globalThis as any).atob = (s: string) => Buffer.from(s, 'base64').toString('binary');
}

const testLogs: string[] = [];
const log = (msg: string) => testLogs.push(msg);

describe('Binary Compression Logic E2E', () => {

	const testCases = [
		...[true, false].map(keepOrder => ({
			name: `Custom numbers "1,300,237,188,26,3,4,1,256", keepOrder: ${keepOrder}`,
			input: "1,300,237,188,26,3,4,1,256",
			keepOrder
		})),

		...[true, false].map(keepOrder => ({
			name: `Simple numbers [1,2,3,4,5], keepOrder: ${keepOrder}`,
			input: "1,2,3,4,5",
			keepOrder
		})),

		...[true, false].map(keepOrder => ({
			name: `Repeating numbers [8,8,8,8,8], keepOrder: ${keepOrder}`,
			input: "8,8,8,8,8",
			keepOrder
		})),

		...[true, false].map(keepOrder => ({
			name: `Random 50 numbers (0-9999), keepOrder: ${keepOrder}`,
			input: Array.from({ length: 50 }, () => Math.floor(Math.random() * 10000)).join(","),
			keepOrder
		})),

		...[true, false].map(keepOrder => ({
			name: `Random 50 numbers (0-300), keepOrder: ${keepOrder}`,
			input: Array.from({ length: 50 }, () => Math.floor(Math.random() * 301)).join(","),
			keepOrder
		})),

		...[true, false].map(keepOrder => ({
			name: `Random 100 numbers (0-300), keepOrder: ${keepOrder}`,
			input: Array.from({ length: 100 }, () => Math.floor(Math.random() * 301)).join(","),
			keepOrder
		})),

		...[true, false].map(keepOrder => ({
			name: `Random 500 numbers (0-300), keepOrder: ${keepOrder}`,
			input: Array.from({ length: 500 }, () => Math.floor(Math.random() * 301)).join(","),
			keepOrder
		})),

		...[true, false].map(keepOrder => ({
			name: `Random 1000 numbers (0-300), keepOrder: ${keepOrder}`,
			input: Array.from({ length: 1000 }, () => Math.floor(Math.random() * 301)).join(","),
			keepOrder
		})),

		...[true, false].map(keepOrder => ({
			name: `Random 1000 numbers (0-9), keepOrder: ${keepOrder}`,
			input: Array.from({ length: 1000 }, () => Math.floor(Math.random() * 10)).join(","),
			keepOrder
		})),

		...[true, false].map(keepOrder => ({
			name: `Random 1000 numbers (10-99), keepOrder: ${keepOrder}`,
			input: Array.from({ length: 1000 }, () => 10 + Math.floor(Math.random() * 90)).join(","),
			keepOrder
		})),

		...[true, false].map(keepOrder => ({
			name: `Random 1000 numbers (100-999), keepOrder: ${keepOrder}`,
			input: Array.from({ length: 1000 }, () => 100 + Math.floor(Math.random() * 900)).join(","),
			keepOrder
		})),

		...[true, false].map(keepOrder => ({
			name: `Random 900 numbers (0-300) and each number is repeated 3 times, keepOrder: ${keepOrder}`,
			input: Array.from({ length: 900 }, (_, i) => Math.round(i / 3)).sort(() => Math.random() - 0.5).join(","),
			keepOrder
		}))
	];

	testCases.forEach(({ name, input, keepOrder }) => {
		it(`should correctly deflate/inflate: ${name}`, () => {
			// 1. Сжимаем
			const serialized = Deflate.serialize(input, keepOrder);

			if (serialized instanceof Error) throw serialized;

			const [base64, bits, count] = serialized;

			//log(input, serialized);
			log(`Compression: x${Math.round(input.length / base64.length * 10) / 10} [${input.length}->${base64.length}], tested on: '${name}'`);

			// 2. Распаковываем
			const restored = Inflate.deserialize(base64, bits, count, keepOrder);

			// 3. Сравнение
			if (!keepOrder) {
				// Если порядок не важен, сравниваем отсортированные строки
				const originalSorted = input.split(',').map(Number).sort((a,b) => a-b).join(',');

				expect(restored).toBe(originalSorted);
			} else {
				expect(restored).toBe(input);
			}
		});
	});

	it('should throw an error on a line that is too short', () => {
		const result = Deflate.serialize("1,2,3");
		expect(result).toBeInstanceOf(Error);
	});

	afterAll(() => {
		console.info('\n--- Test Summary ---');
		console.info(testLogs.join('\n'));
		console.info('--------------------------\n');
	});
});
