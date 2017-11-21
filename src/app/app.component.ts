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
		var data = [12,16,14,13,11,10,9,11,23];
		let arrayOfData = this.getRegressionData(data);
		
		console.log(arrayOfData)
		this.drawPlot(arrayOfData);
	}

	getRegressionData(data) {
		var t = new timeseries.main(timeseries.adapter.sin({cycles:1}));
		t.smoother({ period: 1 }).save('smoothed');
		var bestSettings = t.regression_forecast_optimize();
		t.sliding_regression_forecast({
			sample: bestSettings.sample,
			degree: bestSettings.degree,
			method: bestSettings.method
		});
		return this.arrayOfRegressionData(t);
	}

	arrayOfRegressionData(regression) {
		return regression.data.map(el => el[1]);
	}

	drawPlot(data) {
		var xValues = [];
		for( let i = 1; i <= data.length; i++){
			xValues.push(i);
		}
		var trace = {
			x: xValues,
			y: data,
			mode: 'lines+markers',
			name: 'spline',
			line: { shape: 'spline' },
			type: 'scatter'
		};
		Plotly.newPlot('myDiv', [trace]);
	}

}
