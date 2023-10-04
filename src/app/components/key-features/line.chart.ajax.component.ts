import {AfterViewInit, Component, OnDestroy} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {interval, Subscription} from 'rxjs';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {CanvasJSAngularChartsModule} from "@canvasjs/angular-charts";
import {MatChipsModule} from "@angular/material/chips";
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {FormsModule} from "@angular/forms";

@Component({
    selector: 'log-axis-chart',
    templateUrl: 'dynamic.chart.component.html',
    standalone: true,


    imports: [
        FormsModule,
        CanvasJSAngularChartsModule
    ]
})
export class LineChartAjaxComponent implements AfterViewInit, OnDestroy {
    dataPoints: any = [];
    chart: any;

    dataUpdateSubscription: Subscription | undefined;
    selectedInterval: number = 10000; // Default interval is 10 seconds

    constructor(private http: HttpClient) {
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
        this.fetchDataAndUpdateChart(); // Initial data fetch
        this.dataUpdateSubscription = interval(this.selectedInterval).subscribe(() => {
            this.fetchDataAndUpdateChart(); // Fetch data every 10 seconds
        });
    }

    ngOnDestroy() {
        this.fetchDataAndUpdateChart(); // Initial data fetch
        this.startDataUpdateInterval();
        if (this.dataUpdateSubscription) {
            this.dataUpdateSubscription.unsubscribe();
        }
    }

    fetchDataAndUpdateChart() {
        this.http.get('https://localhost:7054/Ram', {responseType: 'json'}).subscribe(
            (response: any) => {
                let data = response;
                this.dataPoints.length = 0; // Clear the existing dataPoints array
                for (let i = 0; i < data.length; i++) {
                    this.dataPoints.push({x: new Date(data[i].date), y: Number(data[i].size)});
                }
                this.chart.subtitles[0].remove();
            },
            (error) => {
                console.error('Error fetching data:', error);
            }
        );
    }


    startDataUpdateInterval() {
        this.stopDataUpdateInterval(); // Stop the existing interval if any
        this.dataUpdateSubscription = interval(this.selectedInterval).subscribe(() => {
            this.fetchDataAndUpdateChart(); // Fetch data based on the selected interval
        });
    }

    stopDataUpdateInterval() {
        if (this.dataUpdateSubscription) {
            this.dataUpdateSubscription.unsubscribe();
        }
    }

    updateInterval(newInterval: number) {
        this.selectedInterval = newInterval;
        this.startDataUpdateInterval(); // Start the interval with the new selected value
    }

    changeInterval() {
        this.startDataUpdateInterval(); // Start the interval with the selected value from the dropdown
    }
}