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
	public amountOfknownData = [];

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
		this.initDefault();
		const { closeStockData, openStockData } = stockData;
		this.amountOfknownData = amountOfknownData;
		this._arrayOfKnownStockValues = closeStockData.slice(0, amountOfknownData);

		for (let i = amountOfknownData; i < closeStockData.length; i += gap) {
			let dataTillDatapoint = closeStockData.slice(0, i);

			const forecast = this.forecastService.forecastNextValue(dataTillDatapoint, gap);
			this._arrayOfKnownStockValues.push(forecast);

			const todayClosePrice = closeStockData[i - 1];
			const nextDayOpenPrice = openStockData[i - 1 + gap];
			const nextDayClosePrice = closeStockData[i - 1 + gap];
			const odds = forecast / todayClosePrice;
			const probability = 0.6;

			//place buy limit order
			const limitOrderPassed = (nextDayOpenPrice - todayClosePrice) <= 0;
			let investAmount;
			let profit;
			if (nextDayClosePrice && limitOrderPassed) {
				const kellyBet = this.kellyCriterionService.kellyBet(odds, probability);
				this._kellyBetStrategy.push(kellyBet);

				investAmount = this.bankroll * kellyBet;
				if (odds > 1) {
					profit = this.openLongPosition(investAmount, todayClosePrice, nextDayClosePrice);
				} else {
					profit = this.openShortPosition(investAmount, todayClosePrice, nextDayClosePrice);
				}
				this._bankroll += profit;
				this._arrayOfProfits.push(profit);
			}
			
			this.report.push({
				i: i,
				todayClosePrice: todayClosePrice,
				limitOrderPassed: limitOrderPassed,
				forecast: forecast,
				odds: odds,
				investAmount: investAmount,
				nextDayClosePrice: nextDayClosePrice,
				nextDayOpenPrice: nextDayOpenPrice,
				profit: profit,
				bankroll: this._bankroll
			})

		}
	}

	initDefault() {
		this._bankroll = 100;
		this._kellyBetStrategy = [];
		this._arrayOfKnownStockValues = [];
		this._arrayOfProfits = [];
		this.report = [];
		this.amountOfknownData = [];
	}

	openLongPosition(investAmount, todayClosePrice, nextDayClosePrice) {
		const amountOfStocks = investAmount / todayClosePrice;
		return (- todayClosePrice + nextDayClosePrice) * amountOfStocks;
	}

	openShortPosition(investAmount, todayClosePrice, nextDayClosePrice) {
		const amountOfStocks = investAmount / todayClosePrice;
		return (todayClosePrice - nextDayClosePrice) * amountOfStocks;
	}
}
