import { Component, AfterViewInit } from '@angular/core';
import Plotly from 'plotly.js/lib/core';
import timeseries from 'timeseries-analysis';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
	public chart_url: string;

	constructor() {
	}
	public ngAfterViewInit(): void {
		const amountOfData = 30;
		const amountOfknownData = 14;
		const gap = 5;


		const data = this.initData(amountOfData);
		const knownData = data.slice(0, amountOfknownData);

		let slidingRegressionForecast = this.countSlidingRegressionForecast(data);
		let stepByStepPrediction = this.countStepByStepPrediction(data, knownData, gap);

		this.drawPlot(data.length, amountOfknownData,
			{ name: 'Data', data: data },
			// { name: 'Sliding Regression Forecast', data: slidingRegressionForecast },
			{ name: 'Step By Step Prediction', data: stepByStepPrediction, gap: gap }
		);
	}

	initData(length) {
		return Array.apply(null, { length: length }).map(Number.call, Number);
		// return Array.apply(null, { length: length }).map(Number.call, Number).map(i => Math.cos(i) * i);
		// return [2, 1, -35, 1, 23, -45, 23, 45, 2, -45, 1, 43, 12, -4, 45, 56, 23, 35, -35, 2, 15, 8, 4, 23, 7, 5, 76, 4, 34]
	}


	countSlidingRegressionForecast(data) {
		const t = new timeseries.main(timeseries.adapter.fromArray(data));
		t.smoother({ period: 1 }).save('smoothed');
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

	drawPlot(amountOfData, amountOfknownData, ...plots) {


		function plotItem(plot) {
			return {
				x: initXValues(plot.gap),
				y: plot.data,
				mode: 'lines+markers',
				name: plot.name,
				line: { shape: 'spline' },
				type: 'scatter'
			}
		}

		function initXValues(gap = 1) {
			var xValues = Array.apply(null, { length: amountOfData }).map(Number.call, Number);
			return xValues.map((el, index) => {
				if (index <= amountOfknownData || (index - amountOfknownData) % gap === 0) {
					return el;
				}
			}).filter(el => el)
		}

		var layout = {
			shapes: [
				{
					'type': 'line',
					'x0': amountOfknownData,
					'y0': -100,
					'x1': amountOfknownData,
					'y1': 100,
					'line': {
						'color': 'rgb(50, 171, 96)',
						'width': 3,
					},
				},
			]
		}
		let pl = plots.map((plot) => plotItem(plot));
		Plotly.newPlot('myDiv', pl, layout);
	}
}
