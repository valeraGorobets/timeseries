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
	public report = [];

	constructor(private stockDataService: StockDataService, private investmentManagerService: InvestmentManagerService) {
		this.timeLineParameters = {
			timePeriod: 50,
			amountOfknownData: 15,
			gap: 1,
		}
	}

	public ngAfterViewInit(): void {
		setTimeout(() => this.inflate());
	}

	inflate() {
		const { timePeriod, amountOfknownData, gap } = this.timeLineParameters;
		this.stockDataService.requestBitcoinPrice(timePeriod).then((data: Array<any>) => {
			const xValue = this.filterTimeLine(data);
			this.stockData = this.filterStockData(data);
			this.investmentManagerService.invest(this.stockData, amountOfknownData, gap);

			this.plots = {
				data: [
					{ name: 'Data', data: this.stockData },
					{ name: 'Step By Step Prediction', data: this.investmentManagerService.arrayOfKnownStockValues, gap: gap }
				],
				xValue: xValue
			};

			console.log(this.investmentManagerService.bankroll)
			console.log(this.investmentManagerService.arrayOfProfits)
			this.report = this.investmentManagerService.report;
		})
	}

	refresh() {
		const period = (<HTMLInputElement>document.getElementById('period')).value;
		this.timeLineParameters.timePeriod = period;
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
