import { Injectable } from '@angular/core';

import { ForecastService } from '../forecast/forecast.service';
import { KellyCriterionService } from '../kelly-criterion/kelly-criterion.service';

@Injectable()
export class InvestmentManagerService {
	private _bankroll = 100;
	private _kellyBetStrategy = [];
	public _arrayOfKnownStockValues = [];
	public _arrayOfProfits = [];

	public report = [];
	public stockData = [];
	public amountOfknownData;

	constructor(public forecastService: ForecastService, public kellyCriterionService: KellyCriterionService) { }

	get bankroll(): number {
		return this._bankroll;
	}

	get kellyBetStrategy(): Array<any> {
		return this._kellyBetStrategy;
	}

	get arrayOfKnownStockValues(): Array<any> {
		return this._arrayOfKnownStockValues;
	}

	get arrayOfProfits(): Array<any> {
		return this._arrayOfProfits;
	}

	invest(stockData, amountOfknownData, gap) {
		// this.stockData = stockData.map(el => el.close);
		this.stockData = stockData;
		this.amountOfknownData = amountOfknownData;
		this._arrayOfKnownStockValues = this.stockData.slice(0, amountOfknownData);

		let dataTillDatapoint;

		for (let i = amountOfknownData; i < this.stockData.length; i++) {

			let forecastDatapoint = i;
			if ((i - amountOfknownData) % gap === 0) {
				dataTillDatapoint = this.stockData.slice(0, forecastDatapoint);
			} else {
				dataTillDatapoint = this._arrayOfKnownStockValues;
			}

			const knownStocksPrices = this.stockData.slice(0, i);
			const forecast = this.forecastService.forecastNextValue(dataTillDatapoint);
			const todayStockPrice = this.stockData[i - 1];
			const odds = forecast / todayStockPrice;
			const probability = 0.5;
			const kellyBet = this.kellyCriterionService.kellyBet(odds, probability);

			const actualStockPrice = this.stockData[i];
			let investAmount;
			let profit;

			this._arrayOfKnownStockValues.push(forecast);
			this._kellyBetStrategy.push(kellyBet);

			if (kellyBet > 0) {
				investAmount = this.bankroll * kellyBet;
				profit = investAmount - (investAmount / todayStockPrice) * actualStockPrice;
				this._bankroll += profit;
				this._arrayOfProfits.push(profit)

			}

			this.report.push({
				i: i,
				todayStockPrice: todayStockPrice,
				forecast: forecast,
				odds: odds,
				investAmount: investAmount,
				actualStockPrice: actualStockPrice,
				profit: profit,
				bankroll: this._bankroll
			})

		}
	}
}
