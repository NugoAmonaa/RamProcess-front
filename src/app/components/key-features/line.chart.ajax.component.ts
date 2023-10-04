import { Component, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'log-axis-chart',
  templateUrl: 'dynamic.chart.component.html',
})
export class LineChartAjaxComponent implements AfterViewInit {
  dataPoints:any = [];
  chart:any;
 
  constructor(private http : HttpClient) {  
  }
 
  chartOptions = {
    theme: "light2",
    zoomEnabled: true,
    exportEnabled: true,
    title: {
      text:"RAM Usage"
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
      suffix:" MB"
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
    this.http.get('https://localhost:7054/Ram', { responseType: 'json' }).subscribe((response: any) => {
      let data = response;
      for(let i = 0; i < data.length; i++){
        this.dataPoints.push({x: new Date(data[i].date), y: Number(data[i].size) });
      }
      this.chart.subtitles[0].remove();
    });
  }	
}
