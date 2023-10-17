import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {interval, Subscription} from 'rxjs';
import {CanvasJSAngularChartsModule} from "@canvasjs/angular-charts";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatNativeDateModule} from '@angular/material/core';
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
        const today = new Date();
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

        this.selectedStartDate = firstDayOfMonth.toISOString().slice(0, 10);
        this.selectedEndDate = lastDayOfMonth.toISOString().slice(0, 10);
        console.log(this.selectedEndDate);
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

        if (this.selectedAppName != '') {
            apiUrl += `&appName=${this.selectedAppName}`;
        }
        this.http.get(apiUrl, { responseType: 'json' }).subscribe(
            (response: any) => {
                let data = response;

                this.dataPoints.length = 0;

                for (let i = 0; i < data.length; i++) {
                    this.dataPoints.push({ x: new Date(data[i].date), y: Number(data[i].size) });
                }

                // Tell the chart to update with new data
                if (this.chart && this.chart.data) {
                    this.chart.data[0].set("dataPoints", this.dataPoints);
                }

                if (this.chart && this.chart.subtitles && this.chart.subtitles[0]) {
                    this.chart.subtitles[0].remove();
                }

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
            this.selectedStartDate = new Date(this.selectedStartDate).toISOString().split('T')[0];
        }
        this.fetchDataAndUpdateChart();
    }

    changeEndDate() {
        if (this.selectedEndDate) {
            this.selectedEndDate = new Date(this.selectedEndDate).toISOString().split('T')[0];
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