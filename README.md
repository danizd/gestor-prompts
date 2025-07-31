# Gestor de Prompts de IA

[![Licencia: MIT](https://img.shields.io/badge/Licencia-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Una aplicación web full-stack para gestionar y generar prompts de IA de manera eficiente. Esta herramienta te permite organizar, buscar y reutilizar prompts para diferentes modelos de IA.

## Características

- **Gestión de Prompts**: Crea, lee, actualiza y elimina prompts de IA.
- **Organización por Categorías**: Clasifica tus prompts por categorías para un acceso rápido.
- **Sistema de Tareas**: Gestiona tareas relacionadas con el desarrollo y uso de prompts.
- **API RESTful**: Interfaz de programación completa para integraciones.
- **Interfaz Web Intuitiva**: Fácil de usar desde cualquier navegador web.
- **Base de Datos SQLite**: Almacenamiento local de datos sin necesidad de configuración de servidor.
- **Docker**: Soporte para despliegue en contenedores.

## Requisitos Previos

- Node.js (v14 o superior)
- npm (v6 o superior) o yarn
- SQLite3
- Opcional: Docker para despliegue en contenedores

## Instalación

1. Clona el repositorio:
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd ia
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Inicia la base de datos:
   ```bash
   npm run migrate
   ```

4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

5. Abre tu navegador en [http://localhost:4000](http://localhost:4000)

## Usando Docker

Puedes desplegar la aplicación usando Docker:

```bash
# Construir la imagen
docker build -t ai-prompt-manager .

# Ejecutar el contenedor
docker run -p 4000:4000 ai-prompt-manager
```

## Uso

### Páginas Principales

- **Inicio**: Vista general de la aplicación
- **Generador**: Herramienta para crear y probar prompts
- **Tareas**: Gestión de tareas relacionadas con prompts

### API Endpoints

#### Prompts
- `GET /api/prompts` - Obtener todos los prompts
- `GET /api/prompts/:id` - Obtener un prompt específico
- `POST /api/prompts` - Crear un nuevo prompt
- `PUT /api/prompts/:id` - Actualizar un prompt existente
- `DELETE /api/prompts/:id` - Eliminar un prompt

#### Tareas
- `GET /api/tareas` - Obtener todas las tareas
- `POST /api/tareas` - Crear/Actualizar múltiples tareas
- `DELETE /api/tareas` - Eliminar todas las tareas

## Desarrollo

### Estructura del Proyecto

```
├── public/           # Archivos estáticos (HTML, CSS, JS, imágenes)
├── src/
│   ├── database/     # Configuración y migraciones de la base de datos
│   ├── routes/       # Rutas de la API
│   ├── server.js     # Punto de entrada de la aplicación
│   └── tests/        # Pruebas unitarias
├── .gitignore
├── Dockerfile
├── package.json
└── README.md
```

### Comandos Útiles

- `npm start` - Inicia el servidor en producción
- `npm run dev` - Inicia el servidor en modo desarrollo con recarga automática
- `npm test` - Ejecuta las pruebas
- `npm run migrate` - Ejecuta las migraciones de la base de datos
- `npm run lint` - Ejecuta el linter
- `npm run format` - Formatea el código automáticamente

## Contribución

Las contribuciones son bienvenidas. Por favor, lee nuestras pautas de contribución antes de enviar un pull request.

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Contacto

¿Preguntas o comentarios? Por favor, abre un issue en el repositorio.
