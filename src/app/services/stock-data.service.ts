import { Http } from '@angular/http';
import { Injectable } from '@angular/core';
import googleFinance from 'google-finance';

@Injectable()
export class StockDataService {

	constructor(private http: Http) { }

	getStockData() {
		const amountOfData: number = 50;
		// return Array.apply(null, { length: amountOfData }).map(Number.call, Number);
		return Array.apply(null, { length: amountOfData }).map(Number.call, Number).map(i => Math.cos(i) * i);
		// return [2, 1, -35, 1, 23, -45, 23, 45, 2, -45, 1, 43, 12, -4, 45, 56, 23, 35, -35, 2, 15, 8, 4, 23, 7, 5, 76, 4, 34]
	}

	requestStocksFromGoogleFinance(period) {
		const today = this.getDateAgo(0);
		const fromDate = this.getDateAgo(period);


		let response;
		googleFinance.historical({
			symbol: 'NASDAQ:AAPL',
			from: fromDate,
			to: today
		}, function(err, quotes) {
			console.log(quotes)
			response = {
				err: err,
				quotes: quotes
			}
		});
		return response;
	}

	getDateAgo(period) {
		var today = new Date()
		today.setDate(new Date().getDate() - period)
		return today.toISOString().slice(0, 10);
	}
}
