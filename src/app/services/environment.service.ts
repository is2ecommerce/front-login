import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  
  get apiUrl(): string {
    return environment.apiUrl;
  }

  get production(): boolean {
    return environment.production;
  }

  get appName(): string {
    return environment.appName;
  }

  get enableDebug(): boolean {
    return environment.enableDebug;
  }

  get version(): string {
    return environment.version;
  }

  // Método para logging condicional basado en el entorno
  log(...args: any[]): void {
    if (this.enableDebug) {
      console.log(...args);
    }
  }

  // Método para obtener la URL completa del endpoint
  getApiEndpoint(path: string): string {
    return `${this.apiUrl}${path.startsWith('/') ? path : '/' + path}`;
  }
}
