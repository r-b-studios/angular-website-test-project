import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppsComponent } from './components/pages/apps/apps.component';
import { HomeComponent } from './components/pages/home/home.component';
import { QuotesComponent } from './components/pages/quotes/quotes.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'quotes', component: QuotesComponent },
  { path: 'apps', component: AppsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
