# Library Management System

Sistema de gestión de biblioteca desarrollado con arquitectura limpia y contenedores Docker.

## 🚀 Tecnologías

- **Backend**: Node.js + TypeScript + Express + SQLite
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Base de datos**: SQLite
- **Contenedores**: Docker + Docker Compose

## 📦 Configuración del Entorno

### 1. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura las variables:

```bash
cp .env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```bash
# Configuración básica
NODE_ENV=development
JWT_SECRET=tu-clave-secreta-segura-aqui
FRONTEND_PORT=3001
BACKEND_PORT=3000
DATA_PATH=./data
VITE_API_URL=http://localhost:3000
```

> ⚠️ **Importante**: Cambia `JWT_SECRET` por una clave segura en producción.

### 2. Ejecutar con Docker

#### Desarrollo
```bash
docker-compose -f docker-compose.dev.yml up --build
```

#### Producción
```bash
docker-compose up --build
```

### 3. Ejecutar sin Docker

#### Instalar dependencias
```bash
yarn install
```

#### Desarrollo
```bash
yarn dev
```

#### Producción
```bash
yarn build
yarn start
```

## 🌐 Acceso a la Aplicación

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000

## 📁 Estructura del Proyecto

```
library-management/
├── apps/
│   ├── backend/          # API del servidor
│   └── frontend/         # Aplicación React
├── domain/               # Lógica de dominio
├── scripts/             # Scripts de utilidad
├── docker-compose.yml   # Configuración de producción
├── docker-compose.dev.yml # Configuración de desarrollo
└── .env.example         # Ejemplo de variables de entorno
```

## 🔧 Desarrollo

### Comandos disponibles

```bash
# Construir todos los proyectos
yarn build

# Ejecutar en modo desarrollo
yarn dev

# Limpiar y reinstalar dependencias
yarn clean && yarn install

# Ejecutar tests
yarn test
```

### Base de datos

La base de datos SQLite se crea automáticamente en el primer arranque. Los datos se persisten en el directorio configurado en `DATA_PATH`.

## 🐳 Docker

### Sin nginx (configuración actual)

El sistema ahora sirve el frontend directamente sin nginx como proxy reverso:

- **Frontend**: Servido con un servidor HTTP simple en el puerto 3001
- **Backend**: API REST en el puerto 3000
- **Base de datos**: SQLite con persistencia en volumen Docker

### Arquitectura simplificada

```
Cliente → Frontend (Puerto 3001) → Backend (Puerto 3000) → SQLite
```

## 🚀 Despliegue

### Variables de entorno para producción

```bash
NODE_ENV=production
JWT_SECRET=tu-clave-super-segura-de-produccion
FRONTEND_PORT=80
BACKEND_PORT=3000
DATA_PATH=/var/lib/library-app/data
VITE_API_URL=http://tu-dominio.com:3000
```

### Consideraciones de seguridad

1. **JWT_SECRET**: Usa una clave aleatoria segura
2. **CORS**: Configura los orígenes permitidos
3. **Datos**: Asegura la persistencia y respaldo de la base de datos
4. **HTTPS**: Para producción, considera usar un proxy inverso con HTTPS

## 📝 Licencia

MIT License