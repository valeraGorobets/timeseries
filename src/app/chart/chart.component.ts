import { Component, SimpleChanges } from '@angular/core';
import Plotly from 'plotly.js/lib/core';


@Component({
	selector: 'app-chart',
	templateUrl: './chart.component.html',
	styleUrls: ['./chart.component.css'],
	inputs: ['plots', 'timeLineParameters'],
})

export class ChartComponent {
	public plots;
	public amountOfknownData;

	constructor() {
	}

	ngOnChanges(changes: { [propertyName: string]: SimpleChanges }) {
		if (changes['timeLineParameters'] ) {
			this.amountOfknownData = changes.timeLineParameters.currentValue['amountOfknownData'];
		}

		if (changes['plots'] ) {
			this.plots = changes.plots.currentValue;
			this.drawPlot(this.plots);
		}
	}

	drawPlot(plots) {
		if(!plots.length){
			return;
		}

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