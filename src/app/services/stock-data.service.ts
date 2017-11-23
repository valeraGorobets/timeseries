import { Injectable } from '@angular/core';

@Injectable()
export class StockDataService {

	constructor() { }

	getStockData() {
		const amountOfData: number = 50;
		return Array.apply(null, { length: amountOfData }).map(Number.call, Number);
		// return Array.apply(null, { length: length }).map(Number.call, Number).map(i => Math.cos(i) * i);
		// return [2, 1, -35, 1, 23, -45, 23, 45, 2, -45, 1, 43, 12, -4, 45, 56, 23, 35, -35, 2, 15, 8, 4, 23, 7, 5, 76, 4, 34]
	}
}
