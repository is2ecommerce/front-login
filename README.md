# FrontLoginProfile

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.1.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

Docker — cómo arrancar desde Docker

Producción (SSR)

Construir imagen:

```bash
docker build -t front-login-profile:latest .
```

Arrancar contenedor (puerto 4000):

```bash
docker run --rm -p 4000:4000 --name front-login-profile front-login-profile:latest
```

Si usas otro puerto:

```bash
docker run -e PORT=8080 -p 8080:8080 front-login-profile:latest
```

Desarrollo (ng serve)

Construir imagen dev:

```bash
docker build -f Dockerfile.dev -t front-login-profile:dev .
```

Arrancar contenedor dev (puerto 4200):

```bash
docker run --rm -p 4200:4200 --name front-login-profile-dev front-login-profile:dev
```

Con live-reload (montar volumen):

```bash
docker run --rm -p 4200:4200 \
	-v "$(pwd)":/app \
	-v /app/node_modules \
	--name front-login-profile-dev front-login-profile:dev
```

Comandos útiles

```bash
docker images                         # listar imágenes
docker image rm front-login-profile:dev  # borrar imagen dev
docker tag front-login-profile:dev front-login-profile:latest  # retag
docker ps -a --format 'table {{.ID}}\t{{.Names}}\t{{.Status}}\t{{.Ports}}'  # contenedores
docker logs -f <container-name-or-id>  # ver logs
```

Si el puerto está ocupado:

```bash
sudo ss -ltnp 'sport = :4200' || sudo lsof -i :4200
docker stop <container-id-or-name>
docker rm <container-id-or-name>
```