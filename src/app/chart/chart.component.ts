import { Component, AfterViewInit } from '@angular/core';
import Plotly from 'plotly.js/lib/core';
import timeseries from 'timeseries-analysis';
import { StockDataService } from '../services/stock-data.service';

@Component({
	selector: 'app-chart',
	templateUrl: './chart.component.html',
	styleUrls: ['./chart.component.css']
})

export class ChartComponent implements AfterViewInit {
	public timePeriod: number = 100;
	public amountOfknownData: number = 14;
	public gap: number = 1;
	public stockData: Array<any> = [];

	constructor(private stockDataService: StockDataService) {
	}


	public ngAfterViewInit(): void {
		setTimeout(() => this.inflate());
	}

	inflate() {

		this.stockDataService.requestStocksFromGoogleFinance(this.timePeriod).then((data) => {
			console.log(data)
			this.stockData = data;


			let stepByStepPrediction = this.countStepByStepPrediction(this.stockData, this.amountOfknownData);
			console.log(stepByStepPrediction)
			this.drawPlot(
				{ name: 'Data', data: this.stockData.map(el => el.close) },
				{ name: 'Step By Step Prediction', data: stepByStepPrediction, gap: this.gap }
			);
		});

		// let slidingRegressionForecast = this.countSlidingRegressionForecast(data);

		// this.drawPlot(
		// 	{ name: 'Data', data: data },
		// 	{ name: 'Sliding Regression Forecast', data: slidingRegressionForecast },
		// 	{ name: 'Step By Step Prediction', data: stepByStepPrediction, gap: this.gap }
		// );
	}

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

	countStepByStepPrediction(data, amountOfknownData) {
		const arrayOfStockCloseValue = data.map(el => el.close);
		const arrayOfKnownStockValues = arrayOfStockCloseValue.slice(0, amountOfknownData);
		let dataTillDatapoint;


		for (let i = amountOfknownData; i < data.length; i++) {
			let forecastDatapoint = i;
			if ((i - amountOfknownData) % this.gap === 0) {
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

		return forecast<0?forecast*(-1):forecast;
	}

	drawPlot(...plots) {
		const initXValues = (amountOfData, gap = 1) => {
			const xValues = Array.apply(null, { length: amountOfData }).map(Number.call, Number);
			return xValues.map((el, index) => {
				if (index <= this.amountOfknownData || (index - this.amountOfknownData) % gap === 0) {
					return el;
				}
			}).filter(el => el)
		}

		const plotItem = (plot) => {
			return {
				x: initXValues(plot.data.length, plot.gap),
				y: plot.data,
				mode: 'lines+markers',
				name: plot.name,
				line: { shape: 'spline' },
				type: 'scatter'
			}
		}

		const layout = {
			// shapes: [
			// 	{
			// 		'type': 'line',
			// 		'x0': this.amountOfknownData,
			// 		'y0': 150,
			// 		'x1': this.amountOfknownData,
			// 		'y1': 170,
			// 		'line': {
			// 			'color': 'rgb(50, 171, 96)',
			// 			'width': 3,
			// 		},
			// 	},
			// ]
		}
		Plotly.newPlot('displayPlot', plots.map((plot) => plotItem(plot)), layout);
	}
}