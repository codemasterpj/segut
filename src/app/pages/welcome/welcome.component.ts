import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'],
  imports: [RouterModule]
})
export class WelcomeComponent implements OnInit {

  constructor() { }

  ngOnInit() { }

}
