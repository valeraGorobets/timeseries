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
	public chart_url: string;
	public amountOfData: number;
	public amountOfknownData: number = 14;
	public gap: number = 1;
	public stockData: Array<any> = [];

	constructor(private stockDataService: StockDataService) {
	}


	public ngAfterViewInit(): void {
		setTimeout(_ => this.inflate());

	}

	inflate() {
		const data = this.initData(this.amountOfData);
		this.amountOfData = data.length;
		const knownData = data.slice(0, this.amountOfknownData);

		this.stockData = this.stockDataService.requestStocksFromGoogleFinance(this.amountOfData);

		console.log(this.stockData)

		// let slidingRegressionForecast = this.countSlidingRegressionForecast(data);
		// let stepByStepPrediction = this.countStepByStepPrediction(data, knownData, this.gap);

		// this.drawPlot(
		// 	{ name: 'Data', data: data },
		// 	{ name: 'Sliding Regression Forecast', data: slidingRegressionForecast },
		// 	{ name: 'Step By Step Prediction', data: stepByStepPrediction, gap: this.gap }
		// );
	}



	initData(length) {
		return this.stockDataService.getStockData();
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

	countStepByStepPrediction(data, knownData, gap) {
		let dataTillDatapoint;
		const array = knownData.slice();

		for (let i = knownData.length; i < data.length; i++) {
			let forecastDatapoint = i;
			if ((i - knownData.length) % gap === 0) {
				dataTillDatapoint = data.slice(0, forecastDatapoint);
			} else {
				dataTillDatapoint = array;
			}
			const forecast = this.forecastNextValue(dataTillDatapoint)
			array.push(forecast)
		}
		return array;
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

		return forecast;
	}

	drawPlot(...plots) {
		const initXValues = (gap = 1) => {
			const xValues = Array.apply(null, { length: this.amountOfData }).map(Number.call, Number);
			return xValues.map((el, index) => {
				if (index <= this.amountOfknownData || (index - this.amountOfknownData) % gap === 0) {
					return el;
				}
			}).filter(el => el)
		}

		const plotItem = (plot) => {
			return {
				x: initXValues(plot.gap),
				y: plot.data,
				mode: 'lines+markers',
				name: plot.name,
				line: { shape: 'spline' },
				type: 'scatter'
			}
		}

		const layout = {
			shapes: [
				{
					'type': 'line',
					'x0': this.amountOfknownData,
					'y0': -100,
					'x1': this.amountOfknownData,
					'y1': 100,
					'line': {
						'color': 'rgb(50, 171, 96)',
						'width': 3,
					},
				},
			]
		}
		Plotly.newPlot('displayPlot', plots.map((plot) => plotItem(plot)), layout);
	}
}