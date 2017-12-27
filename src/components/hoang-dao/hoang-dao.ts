import { Component } from '@angular/core';
import { Input } from '@angular/core';

@Component({
  selector: 'hoang-dao',
  templateUrl: 'hoang-dao.html'
})
export class HoangDaoComponent {
  @Input('data') data: any;
  text: string;

  constructor() {
    this.text = 'Hello World';

  }

  ngAfterViewInit() {
    this.text = "Page " + this.data['id'];
  
  }

}
