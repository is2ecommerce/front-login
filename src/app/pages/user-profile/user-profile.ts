import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { EnvironmentService } from '../../services/environment.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, DatePipe, NgFor, NgIf, HttpClientModule],
  templateUrl: './user-profile.html',
  styleUrls: ['./user-profile.css']
})
export class UserProfile implements OnInit {

  usuario: any;
  cargando = true;

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef, 
    private router: Router,
    private env: EnvironmentService
  ) {}

  ngOnInit(): void {
    this.cargarUsuario();
  }

  cargarUsuario(): void {
    // Usar el servicio de entorno para obtener la URL del API
    const apiEndpoint = this.env.getApiEndpoint('/usuarios/1');
    this.env.log('Cargando usuario desde:', apiEndpoint);
    
    this.http.get<any>(apiEndpoint).subscribe({
      next: (data) => {
        this.env.log('Usuario cargado exitosamente:', data);
        this.usuario = {
          imagen: data.imagen || 'https://previews.123rf.com/images/yupiramos/yupiramos1705/yupiramos170514531/77987158-young-man-profile-icon-vector-illustration-graphic-design.jpg',
          nombre: data.nombre,
          email: data.email,
          miembroDesde: data.fechaRegistro,
          direccion: data.direccion,
          ciudad: data.ciudad,
          departamento: data.departamento,
          pais: data.pais,
          metodoPago: data.metodoPago,
          pedidos: data.pedidos || []
        };
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.env.log('⚠️ Error al conectar con el backend:', err);
        console.warn('⚠️ No se pudo conectar al backend, usando datos locales...');
        this.usuario = this.datosMock();
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  datosMock() {
    return {
      imagen: 'https://previews.123rf.com/images/yupiramos/yupiramos1705/yupiramos170514531/77987158-young-man-profile-icon-vector-illustration-graphic-design.jpg',
      nombre: 'Usuario de Prueba',
      email: 'usuario@demo.com',
      miembroDesde: new Date('2024-01-01'),
      direccion: 'Calle Falsa 123',
      ciudad: 'Bogotá',
      departamento: 'Cundinamarca',
      pais: 'Colombia',
      metodoPago: 'Tarjeta Visa terminada en 1234',
      pedidos: [
        { id: 1, articulos: 2, fechaEntrega: new Date('2024-05-10') },
        { id: 2, articulos: 1, fechaEntrega: new Date('2024-06-21') }
      ]
    };
  }

  editarPerfil(): void { console.log('Editar perfil'); }
  editarDireccion(): void { console.log('Editar dirección'); }
  administrarPagos(): void { console.log('Administrar pagos'); }
  cambiarContrasena(): void { console.log('Cambiar contraseña'); }
  
  cerrarSesion(): void {
    console.log('Cerrando sesión...');
    // Aquí iría la lógica para limpiar token/sesión si la hay
    // localStorage.removeItem('token');
    // sessionStorage.clear();
    this.router.navigate(['/login']);
  }
}



