import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { HomePage } from './home';
import { HoangDaoComponent } from '../../components/hoang-dao/hoang-dao';


@NgModule({
  declarations: [
    HomePage,
    HoangDaoComponent
  ],
  imports: [
    IonicPageModule.forChild(HomePage)
  ],
})
export class HomePageModule {}
