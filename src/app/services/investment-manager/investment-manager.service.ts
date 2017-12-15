import { Injectable } from '@angular/core';

import { ForecastService } from '../forecast/forecast.service';
import { KellyCriterionService } from '../kelly-criterion/kelly-criterion.service';

@Injectable()
export class InvestmentManagerService {
	private _bankroll = 1000;
	private _kellyBetStrategy = [];
	public _arrayOfKnownStockValues = [];
	public _arrayOfProfits = [];
	public _arrayOfBank = [];
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
		let step = gap;
		const { closeStockData, openStockData } = stockData;
		this.amountOfknownData = amountOfknownData;
		this._arrayOfKnownStockValues = closeStockData.slice(0, amountOfknownData);

		for (let i = amountOfknownData; i < closeStockData.length; i += step) {
			let dataTillDatapoint = closeStockData.slice(0, i);

			const forecast = this.forecastService.forecastNextValue(dataTillDatapoint, gap);
			this._arrayOfKnownStockValues.push(forecast);

			const todayClosePrice = closeStockData[i - 1];
			const tomorowOpenPrice = openStockData[i];
			const nextDayClosePrice = closeStockData[i -1 + gap];
			const odds = forecast / tomorowOpenPrice;
			const probability = 0.54;

			let limitOrderPassed = false;

			if(odds >= 1) {
				limitOrderPassed = (tomorowOpenPrice - todayClosePrice) <= 0;
			}else {
				limitOrderPassed = (tomorowOpenPrice - todayClosePrice) >= 0;
			}

			if(!limitOrderPassed){
				step = 1;
			}

			let investAmount;
			let profit;
			let kellyBet;
			if (nextDayClosePrice && limitOrderPassed) {
				kellyBet = this.kellyCriterionService.kellyBet(odds, probability);
				this._kellyBetStrategy.push(kellyBet);

				investAmount = this.bankroll * kellyBet;
				if (odds > 1) {
					profit = this.openLongPosition(investAmount, tomorowOpenPrice, nextDayClosePrice);
				} else {
					profit = this.openShortPosition(investAmount, tomorowOpenPrice, nextDayClosePrice);
				}
				this._bankroll += profit;
				this._arrayOfBank.push(this._bankroll);
				this._arrayOfProfits.push(profit);
				step = gap;
			}
			
			this.report.push({
				i: i,
				todayClosePrice: todayClosePrice,
				limitOrderPassed: limitOrderPassed,
				forecast: forecast,
				odds: odds,
				kellyBet: kellyBet,
				investAmount: investAmount,
				nextDayClosePrice: nextDayClosePrice,
				tomorowOpenPrice: tomorowOpenPrice,
				profit: profit,
				bankroll: this._bankroll
			})
		}
		console.log(this._arrayOfBank)
	}

	initDefault() {
		this._bankroll = 1000;
		this._kellyBetStrategy = [];
		this._arrayOfKnownStockValues = [];
		this._arrayOfProfits = [];
		this._arrayOfBank = [];
		this.report = [];
		this.amountOfknownData = [];
	}

	openLongPosition(investAmount, tomorowOpenPrice, nextDayClosePrice) {
		const amountOfStocks = investAmount / tomorowOpenPrice;
		return (- tomorowOpenPrice + nextDayClosePrice) * amountOfStocks;
	}

	openShortPosition(investAmount, tomorowOpenPrice, nextDayClosePrice) {
		const amountOfStocks = investAmount / tomorowOpenPrice;
		return (tomorowOpenPrice - nextDayClosePrice) * amountOfStocks;
	}
}
