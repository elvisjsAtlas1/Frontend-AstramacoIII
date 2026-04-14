import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Router } from '@angular/router';
import {AuthService} from '../../service/auth.service';


@Component({
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  username = '';
  password = '';

  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  login() {
    const data = {
      username: this.username,
      password: this.password
    };

    this.auth.login(data).subscribe((res: any) => {

      this.auth.guardarToken(res.token);

      this.router.navigate(['/transportistas']);

    });
  }
}
