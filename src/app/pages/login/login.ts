import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

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

  constructor(private router: Router) {}

  onSubmit() {
    if (this.email() && this.password()) {
      this.isLoading.set(true);
      // Simulate login process
      setTimeout(() => {
        console.log('Login attempt with:', {
          email: this.email(),
          password: this.password(),
          rememberMe: this.rememberMe()
        });
        this.isLoading.set(false);
        // Redirigir al perfil después del login exitoso
        this.router.navigate(['/profile']);
      }, 1500);
    }
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }
}
