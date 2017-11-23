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
	public amountOfData: number = 100;
	public amountOfknownData: number = 14;
	public gap: number = 1;

	constructor() {
	}
	public ngAfterViewInit(): void {


		const data = this.initData(this.amountOfData);
		const knownData = data.slice(0, this.amountOfknownData);

		let slidingRegressionForecast = this.countSlidingRegressionForecast(data);
		let stepByStepPrediction = this.countStepByStepPrediction(data, knownData, this.gap);

		this.drawPlot(
			{ name: 'Data', data: data },
			{ name: 'Sliding Regression Forecast', data: slidingRegressionForecast },
			{ name: 'Step By Step Prediction', data: stepByStepPrediction, gap: this.gap }
		);
	}

	initData(length) {
		return Array.apply(null, { length: length }).map(Number.call, Number);
		// return Array.apply(null, { length: length }).map(Number.call, Number).map(i => Math.cos(i) * i);
		// return [2, 1, -35, 1, 23, -45, 23, 45, 2, -45, 1, 43, 12, -4, 45, 56, 23, 35, -35, 2, 15, 8, 4, 23, 7, 5, 76, 4, 34]
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
		Plotly.newPlot('myDiv', plots.map((plot) => plotItem(plot)), layout);
	}
}
