import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';



import { AppComponent } from './app.component';
import { ChartComponent } from './chart/chart.component';

import { StockDataService } from './services/stock-data/stock-data.service';
import { KellyCriterionService } from './services/kelly-criterion/kelly-criterion.service';
import { InvestmentManagerService } from './services/investment-manager/investment-manager.service';
import { ForecastService } from './services/forecast/forecast.service';
import { RoundPipe } from './pipes/round/round.pipe';


@NgModule({
  declarations: [
    AppComponent,
    ChartComponent,
    RoundPipe
  ],
  imports: [
    BrowserModule,
    HttpModule,
    FormsModule
  ],
  providers: [StockDataService, KellyCriterionService, InvestmentManagerService, ForecastService],
  bootstrap: [AppComponent]
})
export class AppModule { }
