/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: String of Numbers Deflate
 * File: Deflate.ts
 * Path: src/
 * Author: alexeygara
 * Last modified: 2026-03-01 17:28
 */

export class Deflate {

	static INPUT_DATA_MINIMAL_COUNT = 5 as const;

	/**
	 * Deflate (compress) a string represented a comma separated numbers to shorter base64 (ASCII) string.
	 * <br/>**Example:** _"**1,300,237,188,26,3,4,1,256**" (26-length)_ **-->** _"**AQACARaiMRMs**" (12-length)_
	 * @param inputStr Input data - comma separated numbers, like: _"1,300,237,188,26,..."_.
	 * <br/>**NOTE:** Minimum count of numbers is __5__.
	 * @param keepNumbersOrder Set it to _**'true'**_ if there is required to __keep order of numbers__.
	 * @return A tuple of: [<deflated_result>, <bits_per_number>, <count_of_numbers>, <keep_order_of_numbers_flag>]
	 */
	static serialize(inputStr:string, keepNumbersOrder?:true):[string, number, number, boolean] | Error {

		let inArr:number[];

		// parse string with numbers to number array:
		try {
			inArr = parseToArr(inputStr);
		}
		catch(e) {
			return new Error(`Cannot convert source string to number array by reason: ${e}`);
		}

		if(inArr.length < Deflate.INPUT_DATA_MINIMAL_COUNT) {
			return new Error(
				`Minimal count of number values is ${Deflate.INPUT_DATA_MINIMAL_COUNT}, but input data has only ${inArr.length}.`);
		}

		const countOfValues = inArr.length;

		if(!keepNumbersOrder) {
			// sort numbers:
			inArr = sortNumberArr(inArr);

			// convert input values to residuals of numbers:
			inArr = convertToResiduals(inArr);
		}

		// get maximum of bits count to represent the maximal number of input data:
		const maxBitPerNum = getMaxBitPerNum(inArr);

		// pack all input values to bits
		const bitNPacked = packNBit(inArr, maxBitPerNum);

		// convert to ASCII string (base64):
		//const binaryString = String.fromCharCode(...bitNPacked);
		const binaryString = bitNPacked.reduce((str, byte) => str + String.fromCharCode(byte), '');

		const packedStr = btoa(binaryString);

		return [packedStr, maxBitPerNum, countOfValues, !!keepNumbersOrder];
	}

}

const parseToArr = (source:string):number[] => {
	return source.split(",").map((v) => {
		const n = Number(v);
		if(Number.isNaN(n)) {
			throw new Error(`Not valid value '${v}' at source string!`);
		}
		return n;
	});
};

const sortNumberArr = (source:number[]):number[] => {
	return source.sort((a, b) => a - b)
};

const convertToResiduals = (source:number[]):number[] => {
	return source.map((val, i, arr) => {
		if(i === 0) {
			return val;
		} // first number as anchor
		return val - arr[i - 1]; // difference from the previous number
	});
};

const getMaxBitPerNum = (source:number[]):number => {
	const maxNum = Math.max(...source);
	return 32 - Math.clz32(maxNum);
};

const packNBit = (numbers:number[], bitsPerNum:number):Uint8Array => {
	const totalBits = numbers.length * bitsPerNum;
	const buffer    = new Uint8Array(Math.ceil(totalBits / 8));

	let currentBit = 0;

	for(const num of numbers) {
		for(let i = 0; i < bitsPerNum; i++) {
			// Extract the i-th bit of the number (from LSB to MSB)
			const bit = (num >> i) & 1;

			if(bit) {
				const byteIndex = Math.floor(currentBit / 8);
				const bitIndex  = currentBit % 8;
				// Set the bit in the target byte
				buffer[byteIndex] |= (1 << bitIndex);
			}
			currentBit++;
		}
	}
	return buffer;
};
