import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';

import {CanvasJSAngularStockChartsModule} from '@canvasjs/angular-stockcharts';
import {AppComponent} from './app.component';

import {LineChartAjaxComponent} from './components/key-features/line.chart.ajax.component';
import {NotFoundComponent} from './components/not-found/not-found.component';

import {AppRoutingModule} from './app-routing.module';

@NgModule({
    declarations: [
        AppComponent,
        LineChartAjaxComponent,
        NotFoundComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        CanvasJSAngularStockChartsModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
