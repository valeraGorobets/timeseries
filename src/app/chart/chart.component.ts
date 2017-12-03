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
	public gap;

	constructor() {
	}

	ngOnChanges(changes: { [propertyName: string]: SimpleChanges }) {
		if (changes['timeLineParameters'] ) {
			this.amountOfknownData = changes.timeLineParameters.currentValue['amountOfknownData'];
			this.gap = changes.timeLineParameters.currentValue['gap'];
		}

		if (changes['plots'] ) {
			this.plots = changes.plots.currentValue;
			this.drawPlot(this.plots);
		}
	}

	drawPlot(plots) {
		if(!Object.keys(plots).length){
			return;
		}

		const clearGapedDates = (data, gap) => {
			const known = data.slice(0, this.amountOfknownData);
			let rest = data.slice(this.amountOfknownData);
			for(let i = 0; i<rest.length; i++){
				for(let j = 0; j< gap-1; j++){
					rest.splice(i, 1);
				}
			}
			return known.concat(rest);
		}

		const plotItem = (plot) => {
			let x = plot.gap ? clearGapedDates(plots.xValue, plot.gap) : plots.xValue;
			return {
				x: x,
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
		Plotly.newPlot('displayPlot', plots.data.map((plot) => plotItem(plot)), layout);
	}
}