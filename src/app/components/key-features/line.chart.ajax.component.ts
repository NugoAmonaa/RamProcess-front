import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {interval, Subscription} from 'rxjs';
import {CanvasJSAngularChartsModule} from "@canvasjs/angular-charts";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatNativeDateModule} from '@angular/material/core';
import {FormGroup, FormControl, ReactiveFormsModule} from '@angular/forms';
import {NgIf, JsonPipe} from '@angular/common';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

@Component({
    selector: 'log-axis-chart',
    templateUrl: 'dynamic.chart.component.html',
    standalone: true,


    imports: [
        FormsModule,
        CanvasJSAngularChartsModule,
        CommonModule, MatInputModule, MatDatepickerModule, MatNativeDateModule,
        MatInputModule, MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonToggleModule


    ]
})
export class LineChartAjaxComponent implements AfterViewInit, OnDestroy {
    dataPoints: any = [];
    chart: any;
    appNames: string[] = [];
    selectedAppName: string = 'All';
    selectedAppNames: string[] = [];

    dataUpdateSubscription: Subscription | undefined;
    selectedInterval: number = 10000;
    selectedStartDate: string = '';
    selectedEndDate: string = '';
    constructor(private http: HttpClient) {
        this.fetchApplicationNames();

    }

    chartOptions = {
        theme: "light2",
        zoomEnabled: true,
        exportEnabled: true,
        title: {
            text: "RAM Usage"
        },
        subtitles: [{
            text: "Loading Data...",
            fontSize: 40,
            horizontalAlign: "center",
            verticalAlign: "center",
            dockInsidePlotArea: true
        }],
        axisY: {
            title: "RAM",
            suffix: " MB"
        },
        data: [{
            type: "line",
            name: "RAM Usage",
            yValueFormatString: "#,###MB",
            xValueType: "date",
            dataPoints: this.dataPoints
        }]
    }

    getChartInstance(chart: object) {
        this.chart = chart;
    }

    ngAfterViewInit() {
        this.fetchDataAndUpdateChart();
        this.dataUpdateSubscription = interval(this.selectedInterval).subscribe(() => {
            this.fetchDataAndUpdateChart();
        });
    }

    ngOnDestroy() {
        this.fetchDataAndUpdateChart();
        this.startDataUpdateInterval();
        if (this.dataUpdateSubscription) {
            this.dataUpdateSubscription.unsubscribe();
        }
    }
    fetchApplicationNames() {
        this.http.get<string[]>('https://localhost:7054/Ram/Applications', { responseType: 'json' }).subscribe(
            (response: string[]) => {
                this.appNames = response;
            },
            (error) => {
                console.error('Error fetching application names:', error);
            }
        );
    }
    fetchDataAndUpdateChart() {
        let apiUrl = 'https://localhost:7054/Ram';
        if (this.selectedStartDate && this.selectedEndDate) {
            apiUrl += `?startDate=${this.selectedStartDate}&endDate=${this.selectedEndDate}`;
        }
        if (this.selectedAppName!='') {
            apiUrl += `&appName=${this.selectedAppName}`;
        }
        this.http.get(apiUrl, { responseType: 'json' }).subscribe(
            (response: any) => {
                let data = response;

                this.dataPoints.length = 0;

                for (let i = 0; i < data.length; i++) {


                        this.dataPoints.push({ x: new Date(data[i].date), y: Number(data[i].size) });


                }
                this.chart.subtitles[0].remove();
                this.startDataUpdateInterval();
            },
            (error) => {
                console.error('Error fetching data:', error);
            }
        );
    }

    changeApplications(selectedApps: string[]) {
        this.selectedAppNames = selectedApps;
        this.fetchDataAndUpdateChart();
    }

    changeStartDate() {
        if (this.selectedStartDate) {
            const startDate = new Date(this.selectedStartDate).toISOString();
            this.selectedStartDate = startDate;
        }
        this.fetchDataAndUpdateChart();
    }

    changeEndDate() {
        if (this.selectedEndDate) {
            const endDate = new Date(this.selectedEndDate).toISOString();
            this.selectedEndDate = endDate;
        }
        this.fetchDataAndUpdateChart();
    }


    startDataUpdateInterval() {
        this.stopDataUpdateInterval();
        this.dataUpdateSubscription = interval(this.selectedInterval).subscribe(() => {
            this.fetchDataAndUpdateChart();
        });
    }

    stopDataUpdateInterval() {
        if (this.dataUpdateSubscription) {
            this.dataUpdateSubscription.unsubscribe();
        }
    }

    updateInterval(newInterval: number) {
        this.selectedInterval = newInterval;
        this.startDataUpdateInterval();
    }
    changeApplication() {
        this.fetchDataAndUpdateChart();

    }


    changeInterval() {
        this.startDataUpdateInterval();
    }
}