import { Component } from '@angular/core';
import timeseries from 'timeseries-analysis';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
	public data = [12,16,14,13,11,10,9,11,23];
 
	public t     = new timeseries.main(timeseries.adapter.fromArray(this.data));
	chart_url = this.t.ma({period: 14}).chart();

  
}
