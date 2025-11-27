import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { EnvironmentService } from '../../services/environment.service';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

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
  errorMessage = signal<string | null>(null);

  constructor(
    private router: Router,
    private env: EnvironmentService,
    private authService: AuthService
  ) {}

  onSubmit() {
    if (this.email() && this.password()) {
      this.isLoading.set(true);
      this.errorMessage.set(null);
      
      // Autenticar con Keycloak usando Direct Access Grant
      this.authService.login(this.email(), this.password()).subscribe({
        next: (authState) => {
          this.isLoading.set(false);
          this.env.log('Login exitoso:', authState);
          
          // Redirigir al catálogo con los tokens como query params
          const catalogUrl = environment.catalogUrl;
          const params = new URLSearchParams({
            access_token: authState.token || '',
            refresh_token: authState.refreshToken || ''
          });
          
          if (catalogUrl.startsWith('http')) {
            // URL externa - redirigir con window.location
            window.location.href = `${catalogUrl}?${params.toString()}`;
          } else {
            // Ruta interna - usar Angular Router
            this.router.navigate([catalogUrl], {
              queryParams: {
                access_token: authState.token,
                refresh_token: authState.refreshToken
              }
            });
          }
        },
        error: (error) => {
          this.isLoading.set(false);
          this.errorMessage.set(error.message);
          this.env.log('Error en login:', error);
        }
      });
    } else {
      this.errorMessage.set('Por favor completa todos los campos');
    }
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }
}
