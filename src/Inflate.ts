/*
 * Copyright © 2026 Alexey Gara (alexey.gara@gmail.com). All rights reserved.
 * Project: String of Numbers Deflate
 * File: Inflate.ts
 * Path: src/
 * Author: alexeygara
 * Last modified: 2026-03-01 22:45
 */

export class Inflate {

	/**
	 * Inflate (decompress) shorted base64 (ASCII) string to original string represented a comma separated numbers.
	 * <br/>**Example:**(with _'keep order of numbers'_-flag) _"**AQACARaiMRMs**" (12-length)_ **-->** _"**1,300,237,188,26,3,4,1,256**" (26-length)_
	 * <br/>**Example:**(without _'keep order of numbers'_-flag) _"**AQACARaiMRMs**" (12-length)_ **-->** _"**"1,1,3,4,26,188,237,256,300"6**" (26-length)_
	 * @param inputStr
	 * @param bitsPerNumber
	 * @param valuesCount
	 */
	static deserialize(inputStr:string, bitsPerNumber:number, valuesCount:number, numbersOrderKept?:true):string {

		// convert from ASCII string (base64) ...
		const binaryString = atob(inputStr);

		// ... to Uint8Array:
		const packedBytes = new Uint8Array(binaryString.length);
		for(let i = 0; i < binaryString.length; i++) {
			packedBytes[i] = binaryString.charCodeAt(i);
		}

		// unpack to array of residuals numbers:
		let numArr = unpackNBit(packedBytes, bitsPerNumber, valuesCount);

		if(!numbersOrderKept) {
			// restore array of original numbers from residual numbers array:
			numArr = convertFromResiduals(numArr);
		}

		return numArr.join(",");
	}

}

const unpackNBit = (packedBytes:Uint8Array, bitsPerNum:number, numsCount:number):number[] => {
	const result:number[] = [];

	let currentBit = 0;

	for(let n = 0; n < numsCount; n++) {
		let num = 0;
		for(let i = 0; i < bitsPerNum; i++) {
			const byteIndex = Math.floor(currentBit / 8);
			const bitIndex  = currentBit % 8;

			// Проверяем, установлен ли бит в байте
			if((packedBytes[byteIndex] >> bitIndex) & 1) {
				num |= (1 << i);
			}
			currentBit++;
		}
		result.push(num);
	}
	return result;
};

const convertFromResiduals = (source:number[]):number[] => {
	let current = 0;
	return source.map((delta) => {
		// To reconstruct the original sequence, we add each delta to the previously accumulated value.
		current += delta;
		return current;
	});
};
