import { Injectable } from '@angular/core';
import timeseries from 'timeseries-analysis';

@Injectable()
export class ForecastService {

  constructor() { }
  	countSlidingRegressionForecast(data) {
		const t = new timeseries.main(timeseries.adapter.fromArray(data));
		t.smoother({ period: 5 }).save('smoothed');
		const bestSettings = t.regression_forecast_optimize();
		t.sliding_regression_forecast({
			sample: bestSettings.sample,
			degree: bestSettings.degree,
			method: bestSettings.method
		});
		return t.data.map(el => el[1]);
	}

	countStepByStepPrediction(data, amountOfknownData, gap) {
		const arrayOfStockCloseValue = data.map(el => el.close);
		const arrayOfKnownStockValues = arrayOfStockCloseValue.slice(0, amountOfknownData);
		let dataTillDatapoint;


		for (let i = amountOfknownData; i < data.length; i++) {
			let forecastDatapoint = i;
			if ((i - amountOfknownData) % gap === 0) {
				dataTillDatapoint = arrayOfStockCloseValue.slice(0, forecastDatapoint);
			} else {
				dataTillDatapoint = arrayOfKnownStockValues;
			}
			const forecast = this.forecastNextValue(dataTillDatapoint)
			arrayOfKnownStockValues.push(forecast)
		}
		return arrayOfKnownStockValues;
	}

	forecastNextValue(data) {
		const t = new timeseries.main(timeseries.adapter.fromArray(data));
		const timeseriesData = t.data.slice(0, data.length);
		const bestSettings = t.regression_forecast_optimize();

		const coeffs = t[bestSettings.method]({
			data: timeseriesData,
			sample: bestSettings.sample,
			degree: bestSettings.degree
		});

		let forecast = 0;
		for (let j = 0; j < coeffs.length; j++) {
			forecast -= t.data[timeseriesData.length - 1 - j][1] * coeffs[j];
		}

		return forecast < 0 ? forecast * (-1) : forecast;
	}
}
