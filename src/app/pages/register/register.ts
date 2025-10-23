import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  // Personal Data
  firstName = signal('');
  lastName = signal('');
  email = signal('');
  phone = signal('');
  
  // Address Data
  address = signal('');
  city = signal('');
  state = signal('');
  zipCode = signal('');
  country = signal('Colombia');
  
  // Account Data
  password = signal('');
  confirmPassword = signal('');
  acceptTerms = signal(false);
  
  // UI States
  isLoading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  currentStep = signal(1); // Step 1: Personal, Step 2: Address, Step 3: Account
  errors = signal<string[]>([]);

  goToNextStep() {
    this.errors.set([]);
    if (this.currentStep() === 1) {
      if (this.validatePersonalData()) {
        this.currentStep.set(2);
      }
    } else if (this.currentStep() === 2) {
      if (this.validateAddressData()) {
        this.currentStep.set(3);
      }
    }
  }

  goToPreviousStep() {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
      this.errors.set([]);
    }
  }

  validatePersonalData(): boolean {
    const newErrors: string[] = [];
    
    if (!this.firstName()) newErrors.push('El nombre es requerido');
    if (!this.lastName()) newErrors.push('El apellido es requerido');
    if (!this.email()) newErrors.push('El correo es requerido');
    else if (!this.isValidEmail(this.email())) newErrors.push('El correo no es válido');
    if (!this.phone()) newErrors.push('El teléfono es requerido');
    
    if (newErrors.length > 0) {
      this.errors.set(newErrors);
      return false;
    }
    return true;
  }

  validateAddressData(): boolean {
    const newErrors: string[] = [];
    
    if (!this.address()) newErrors.push('La dirección es requerida');
    if (!this.city()) newErrors.push('La ciudad es requerida');
    if (!this.state()) newErrors.push('El departamento es requerido');
    if (!this.zipCode()) newErrors.push('El código postal es requerido');
    
    if (newErrors.length > 0) {
      this.errors.set(newErrors);
      return false;
    }
    return true;
  }

  validateAccountData(): boolean {
    const newErrors: string[] = [];
    
    if (!this.password()) newErrors.push('La contraseña es requerida');
    else if (this.password().length < 8) newErrors.push('La contraseña debe tener al menos 8 caracteres');
    
    if (!this.confirmPassword()) newErrors.push('Debe confirmar la contraseña');
    
    if (this.password() !== this.confirmPassword()) {
      newErrors.push('Las contraseñas no coinciden');
    }
    
    if (!this.acceptTerms()) {
      newErrors.push('Debe aceptar los términos y condiciones');
    }
    
    if (newErrors.length > 0) {
      this.errors.set(newErrors);
      return false;
    }
    return true;
  }

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  onSubmit() {
    if (this.validateAccountData()) {
      this.isLoading.set(true);
      
      // Simulate registration process
      setTimeout(() => {
        console.log('Registration with:', {
          firstName: this.firstName(),
          lastName: this.lastName(),
          email: this.email(),
          phone: this.phone(),
          address: this.address(),
          city: this.city(),
          state: this.state(),
          zipCode: this.zipCode(),
          country: this.country()
        });
        this.isLoading.set(false);
        // Aquí iría la navegación al dashboard después del registro exitoso
      }, 1500);
    }
  }

  togglePasswordVisibility() {
    this.showPassword.set(!this.showPassword());
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword.set(!this.showConfirmPassword());
  }
}
