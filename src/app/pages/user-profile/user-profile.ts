import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, NgFor, NgIf } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

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

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.cargarUsuario();
  }

  cargarUsuario(): void {
    this.http.get<any>('http://localhost:8080/api/usuarios/1').subscribe({
      next: (data) => {
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
        this.cdr.detectChanges(); // 👈 Forzar actualización del DOM
      },
      error: (err) => {
        console.warn('⚠️ No se pudo conectar al backend, usando datos locales...');
        this.usuario = this.datosMock();
        this.cargando = false;
        this.cdr.detectChanges(); // 👈 Arregla el ExpressionChangedAfterItHasBeenCheckedError
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
}



