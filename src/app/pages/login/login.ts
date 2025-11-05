import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { EnvironmentService } from '../../services/environment.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = signal('');
  password = signal('');
  rememberMe = signal(false);
  isLoading = signal(false);
  showPassword = signal(false);

  constructor(
    private router: Router,
    private env: EnvironmentService
  ) {}

  onSubmit() {
    if (this.email() && this.password()) {
      this.isLoading.set(true);
      
      // Log usando el servicio de entorno (solo en desarrollo)
      this.env.log('Login attempt with:', {
        email: this.email(),
        password: this.password(),
        rememberMe: this.rememberMe(),
        apiUrl: this.env.apiUrl
      });
      
      // Simulate login process
      // TODO: Descomentar cuando el backend esté listo
      // this.authService.login({
      //   email: this.email(),
      //   password: this.password()
      // }).subscribe({
      //   next: (response) => {
      //     this.isLoading.set(false);
      //     this.router.navigate(['/profile']);
      //   },
      //   error: (error) => {
      //     this.isLoading.set(false);
      //     this.env.log('Login error:', error);
      //   }
      // });
      
      setTimeout(() => {
        this.isLoading.set(false);
        this.router.navigate(['/profile']);
      }, 1500);
    }
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }
}
