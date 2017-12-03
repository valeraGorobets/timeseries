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
		this.report = [];
		this.stockData = stockData;
		this.amountOfknownData = amountOfknownData;
		this._arrayOfKnownStockValues = this.stockData.slice(0, amountOfknownData);



		for (let i = amountOfknownData; i < this.stockData.length; i += gap) {
			let dataTillDatapoint = this.stockData.slice(0, i);

			const forecast = this.forecastService.forecastNextValue(dataTillDatapoint, gap);
			this._arrayOfKnownStockValues.push(forecast);

			const todayStockPrice = this.stockData[i - 1];
			const actualStockPrice = this.stockData[i - 1 + gap];
			const odds = forecast / todayStockPrice;
			const probability = 0.54;

			let investAmount;
			let profit;
			if (actualStockPrice) {
				const kellyBet = this.kellyCriterionService.kellyBet(odds, probability);
				this._kellyBetStrategy.push(kellyBet);

				investAmount = this.bankroll * kellyBet;
				if (odds > 1) {
					profit = this.openLongPosition(investAmount, todayStockPrice, actualStockPrice);
				} else {
					profit = this.openShortPosition(investAmount, todayStockPrice, actualStockPrice);
				}
				this._bankroll += profit;
				this._arrayOfProfits.push(profit);
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

	openLongPosition(investAmount, todayStockPrice, actualStockPrice) {
		const amountOfStocks = investAmount / todayStockPrice;
		return (- todayStockPrice + actualStockPrice) * amountOfStocks;
	}

	openShortPosition(investAmount, todayStockPrice, actualStockPrice) {
		const amountOfStocks = investAmount / todayStockPrice;
		return (todayStockPrice - actualStockPrice) * amountOfStocks;
	}
}
