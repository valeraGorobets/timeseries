import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import request from 'request';
import csv from 'csvtojson';

@Injectable()
export class StockDataService {

	constructor(private http: Http) { }

	getStockData() {
		const amountOfData: number = 30;
		return Array.apply(null, { length: amountOfData }).map(Number.call, Number);
		// return Array.apply(null, { length: amountOfData }).map(Number.call, Number).map(i => Math.cos(i) * i);
		// return [2, 1, -35, 1, 23, -45, 23, 45, 2, -45, 1, 43, 12, -4, 45, 56, 23, 35, -35, 2, 15, 8, 4, 23, 7, 5, 76, 4, 34]
	}

	requestStocksFromGoogleFinance(period): Promise<Array<any>> {
		const today = this.getDateAgo(0);
		const fromDate = this.getDateAgo(period);
		const company = 'EPAM';
		let stocks = [];
		return new Promise((resolve, reject) => {
			csv().fromStream(request.get(`https://www.quandl.com/api/v1/datasets/WIKI/${company}.csv?column=4&sort_order=asc&trim_start=${fromDate}&trim_end=${today}`))
				.on('csv', (csvRow) => {
					stocks.push(csvRow);
				})
				.on('done', () => {
					resolve(stocks);
				})
		});
	}

	requestBitcoinPrice(period) {
		const today = this.getDateAgo(0);
		const fromDate = this.getDateAgo(period);
		let stocks = [];
		return new Promise((resolve, reject) => {
			csv().fromStream(request.get(`https://api.coindesk.com/v1/bpi/historical/close.csv?start=${fromDate}&end=${today}`))
				.on('csv', (row) => {
					if (row.length == 2) {
						stocks.push(row);
					}
				})
				.on('done', () => {
					resolve(stocks);
				})
		});
	}


	getDateAgo(period) {
		var today = new Date()
		today.setDate(new Date().getDate() - period)
		return today.toISOString().slice(0, 10);
	}
}
