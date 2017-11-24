import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';


import { AppComponent } from './app.component';
import { ChartComponent } from './chart/chart.component';

import { StockDataService } from './services/stock-data/stock-data.service';
import { KellyCriterionService } from './services/kelly-criterion/kelly-criterion.service';
import { InvestmentManagerService } from './services/investment-manager/investment-manager.service';
import { ForecastService } from './services/forecast/forecast.service';


@NgModule({
  declarations: [
    AppComponent,
    ChartComponent
  ],
  imports: [
    BrowserModule,
    HttpModule
  ],
  providers: [StockDataService, KellyCriterionService, InvestmentManagerService, ForecastService],
  bootstrap: [AppComponent]
})
export class AppModule { }
