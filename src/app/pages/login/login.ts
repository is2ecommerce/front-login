import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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
        // Aquí iría la navegación al dashboard después del login exitoso
      }, 1500);
    }
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }
}
