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
	public plots = [];

	constructor(private stockDataService: StockDataService, private investmentManagerService: InvestmentManagerService) {
		this.timeLineParameters = {
			timePeriod: 50,
			amountOfknownData: 14,
			gap: 1,
		}
	}

	public ngAfterViewInit(): void {
		setTimeout(() => this.inflate());
	}

	inflate() {
		const { timePeriod, amountOfknownData, gap } = this.timeLineParameters;
		this.stockDataService.requestStocksFromGoogleFinance(timePeriod).then((data) => {
			this.stockData = data;
			const stepByStepPrediction = this.investmentManagerService.countStepByStepPrediction(this.stockData, amountOfknownData, gap);
			
			this.plots = [
				{ name: 'Data', data: this.stockData.map(el => el.close) },
				{ name: 'Step By Step Prediction', data: stepByStepPrediction, gap: gap }
			];
		});
	}
}
