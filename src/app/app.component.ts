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

	public openStockData: Array<any> = [];
	public plots = {};
	public report: Array<any> = [];
	public dates = [];
	public loading = false;
	public guessed = 0;
	public bank = 0;

	constructor(private stockDataService: StockDataService, private investmentManagerService: InvestmentManagerService) {
		this.timeLineParameters = {
			timePeriod: 50,
			amountOfknownData: 15,
			gap: 1,
		}
	}

	public ngAfterViewInit(): void {
		setTimeout(() => this.refresh());
	}

	public refresh() {
		this.investLocaly();
		// this.investGoogle();
	}

	private investLocaly() {
		const stockData: any = {};
		this.loading = true;
		this.stockDataService.requestStocksFromLocal(this.timeLineParameters.timePeriod).then((data: Array<any>) => {
			this.dates = this.filterTimeLine_l(data);
			stockData.closeStockData = this.filterClosePrice_l(data);
			stockData.openStockData = this.filterOpenPrice_l(data);
			this.invest(stockData);
			this.loading = false;
		});
	}

	private investGoogle() {
		const stockData: any = {};
		this.loading = true;
		this.stockDataService.requestStocksFromGoogleFinance(this.timeLineParameters.timePeriod).then((data: Array<any>) => {
			this.dates = this.filterTimeLine(data);
			stockData.closeStockData = this.filterStockData(data);
			stockData.openStockData = this.filterStockData(data);
			this.invest(stockData);
			this.loading = false;
		});
	}

	private invest(stockData) {
		const { timePeriod, amountOfknownData, gap } = this.timeLineParameters;

		this.investmentManagerService.invest(stockData, amountOfknownData, gap);

		this.report = this.investmentManagerService.report;
		let indexesFromReport = this.report.map(el=>el.i);
		let datesArray = [];
		indexesFromReport.forEach(index=>{
			datesArray.push(this.dates[index-1]);
		})

		let forecastValues = this.report.map(el=>el.forecast);
		forecastValues.unshift(this.report[0].todayClosePrice)
		

		this.plots = {
			data: [
				{ name: 'Цена закрытия', data: this.report.map(el => el.todayClosePrice) },
				{ name: 'Прогноз', data: forecastValues }
			],
			xValue: datesArray
		};
		this.guessed = Math.floor(100 * this.report.filter((el) => el.profit > 0).length / (this.report.filter((el) => el.profit).length));
		this.bank = this.investmentManagerService.bankroll;
	}

	filterTimeLine_l(data: Array<any>) {
		return data.map(el => el.Date);
	}


	filterOpenPrice_l(data: Array<any>) {
		return data.map(el => el.Open);
	}


	filterClosePrice_l(data: Array<any>) {
		return data.map(el => el.Close);
	}

	filterTimeLine(data: Array<any>) {
		return data.reduce((stocks, cur) => {
			return [...stocks, cur[0]];
		}, []);
	}

	filterStockData(data: Array<any>) {
		return data.reduce((stocks, cur) => {
			return [...stocks, +cur[1]];
		}, []);
	}


}
