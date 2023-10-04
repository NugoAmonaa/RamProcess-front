import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { LineChartAjaxComponent } from './components/key-features/line.chart.ajax.component';


const routes: Routes = [
  { path: '', component: LineChartAjaxComponent, pathMatch: "full"  },
  { path: '**', component: NotFoundComponent, title: "404 Not Found" }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  declarations: []
})
export class AppRoutingModule { }