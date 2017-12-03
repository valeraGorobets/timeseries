import { Component, AfterViewInit } from '@angular/core';

import { StockDataService } from './services/stock-data/stock-data.service';
import { InvestmentManagerService } from './services/investment-manager/investment-manager.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
	public timeLineParameters: any = {};
	public stockData: Array<any> = [];
	public plots = {};
	public report: Array<any> = [];
	public dates = [];
	public loading = false;
	public guessed = 0;

	constructor(private stockDataService: StockDataService, private investmentManagerService: InvestmentManagerService) {
		this.timeLineParameters = {
			timePeriod: 50,
			amountOfknownData: 15,
			gap: 2,
		}
	}

	public ngAfterViewInit(): void {
		setTimeout(() => this.inflate());
	}

	inflate() {
		this.loading = true;
		const { timePeriod, amountOfknownData, gap } = this.timeLineParameters;
		this.stockDataService.requestStocksFromGoogleFinance(timePeriod).then((data: Array<any>) => {
			this.dates = this.filterTimeLine(data);
			this.stockData = this.filterStockData(data);
			this.investmentManagerService.invest(this.stockData, amountOfknownData, gap);

			this.plots = {
				data: [
					{ name: 'Data', data: this.stockData },
					{ name: 'Prediction', data: this.investmentManagerService.arrayOfKnownStockValues, gap: gap }
				],
				xValue: this.dates
			};

			console.log(this.dates)
			console.log(this.investmentManagerService.bankroll)
			console.log(this.investmentManagerService.kellyBetStrategy)
			this.report = this.investmentManagerService.report;

			this.guessed = Math.floor(100*this.report.filter((el) => el.profit > 0).length / (this.report.length));
			this.loading = false;
		})
	}

	refresh() {
		// const period = (<HTMLInputElement>document.getElementById('period')).value;
		// const gap = (<HTMLInputElement>document.getElementById('gap')).value;
		// this.timeLineParameters.timePeriod = period || 50;
		// this.timeLineParameters.gap = gap || 1;
		this.inflate();
	}

	filterStockData(data: Array<any>) {
		return data.reduce((stocks, cur) => {
			return [...stocks, +cur[1]];
		}, []);
	}

	filterTimeLine(data: Array<any>) {
		return data.reduce((stocks, cur) => {
			return [...stocks, cur[0]];
		}, []);
	}

}
