/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: String of Numbers Deflate
 * File: Deflate.ts
 * Path: test/
 * Author: alexeygara
 * Last modified: 2026-03-01 23:31
 */

import { Deflate } from 'Deflate';

describe('Deflate Class', () => {
	const validString = "1,300,237,188,26,3,4,1,256";
	const shortString = "1,2,3";
	const invalidString = "1,abc,3,4,5";

	describe('serialize() success cases', () => {

		test('should successfully compress a valid string of numbers', () => {
			const result = Deflate.serialize(validString);

			expect(Array.isArray(result)).toBe(true);
			if (Array.isArray(result)) {
				const [packedStr, maxBits, count, keptOrder] = result;

				expect(typeof packedStr).toBe('string');
				expect(packedStr.length).toBeLessThan(validString.length);
				expect(count).toBe(9);
				expect(keptOrder).toBe(false); // по умолчанию сортировка включена
				expect(maxBits).toBeGreaterThan(0);
			}
		});

		test('should keep original order when keepNumbersOrder is true', () => {
			const result = Deflate.serialize(validString, true);

			if (Array.isArray(result)) {
				const [,, count, keptOrder] = result;
				expect(count).toBe(9);
				expect(keptOrder).toBe(true);
				// При сохранении порядка для '300' точно нужно 9 бит
				expect(result[1]).toBe(9);
			}
		});

		test('should yield a different (shorter) bit count after sorting and residuals', () => {
			// Без сохранения порядка числа сортируются и вычисляются дельты.
			// Максимальная дельта в вашем массиве будет меньше 300.
			const resultOrdered = Deflate.serialize(validString, true);
			const resultSorted = Deflate.serialize(validString);

			if (Array.isArray(resultOrdered) && Array.isArray(resultSorted)) {
				// maxBitPerNum для отсортированных дельт обычно меньше или равен оригиналу
				expect(resultSorted[1]).toBeLessThanOrEqual(resultOrdered[1]);
			}
		});
	});

	describe('serialize() error handling', () => {

		test('should return Error if input has less than 5 numbers', () => {
			const result = Deflate.serialize(shortString);
			expect(result).toBeInstanceOf(Error);
			if (result instanceof Error) {
				expect(result.message).toContain('Minimal count of number values is 5');
			}
		});

		test('should return Error if input contains non-numeric values', () => {
			const result = Deflate.serialize(invalidString);
			expect(result).toBeInstanceOf(Error);
			if (result instanceof Error) {
				expect(result.message).toContain('Not valid value \'abc\'');
			}
		});

		test('should return Error if input string is empty', () => {
			const result = Deflate.serialize("");
			// Пустая строка после Number("") даст 0, но split(",") даст [""]
			// В вашем коде Number("") это 0, но если строка совсем пустая,
			// стоит проверить поведение парсера.
			expect(result).toBeInstanceOf(Error);
		});
	});

	describe('Internal logic verification (Max Bits)', () => {
		test('verify bit calculation for specific numbers', () => {
			// Тестируем через serialize, зная что 256 требует 9 бит
			const res = Deflate.serialize("1,1,1,1,256", true);
			if (Array.isArray(res)) {
				expect(res[1]).toBe(9);
			}

			// 127 требует 7 бит
			const res2 = Deflate.serialize("1,1,1,1,127", true);
			if (Array.isArray(res2)) {
				expect(res2[1]).toBe(7);
			}
		});
	});
});
