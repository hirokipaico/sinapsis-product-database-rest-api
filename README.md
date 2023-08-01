<p align="center" style="font-size: 36px;">Sinapsis product database API</p>
<p align="center" style="font-size: 22px;">sinapsis-product-database-rest-api</p>

## Descripción

Este repositorio contiene una aplicación backend desarrollada en Node.js con NestJS. La API está diseñada para gestionar productos y categorías y proporciona varios endpoints para manejar operaciones CRUD. La aplicación está conectada a una base de datos MySQL para almacenar los datos de productos y categorías.

## Requisitos

- Node.js
- Base de datos MySQL
- Docker/Docker Compose (opcional)

## Inicio

Siga los pasos a continuación para configurar y ejecutar la aplicación localmente:

1. Clonar el repositorio:

```bash
git clone https://github.com/your-username/sinapsis-product-database-rest-api.git
cd sinapsis-product-database-rest-api
```
2. Navegar hasta la dirección en tu archivo local e instalar las dependencias:
```bash
npm install
```
3. Configurar la base de datos:
Cree una base de datos MySQL con el nombre `sinapsis_product_db`.
Importe el esquema de la base de datos utilizando el archivo `dump.sql` proporcionado:

```bash
mysql -u tu_usuario -p sinapsis_product_db < dump.sql
```

De manera similar, puede usar el archivo `docker-compose.yml` presente en el repositorio para levantar contenedores con Docker Compose mediante el siguiente commando:
```bash
docker-compose up -d
```

Este archivo levanta dos contenedores:
- `sinapsis-dev-mysql-container` (MySQL)
- `sinapsis-dev-phymyadmin-container` PhpMyAdmin

De esta manera, el servicio PhpMyAdmin debería ser accesible en http://localhost:8080, por medio del cual usted podrá insertar directamente el contenido del archivo `dump.sql` para insertar los usuarios, productos y categorías.


4. Configure las variables de entorno:

Cree o modifique el archivo llamado `development.env`, situado en `src/config/env`, para luego establecer las variables de entorno de la siguiente manera (este archivo también se puede llamar `production.env`, pues está configurado para cargar variables de entorno de manera dinámica según si es entorno de desarrollo o producción mediante la variable de entorno `NODE_ENV` que es insertada en la consola al momento de correr `npm run start:dev` o `npm run start`):

```makefile
PORT=3001

# MySQL database connection variables
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=db_username
DB_PASSWORD=db_password
DB_NAME=product_db # Nombre de database

# Passport.js variables
PASSPORT_SECRET=your_passport_secret

# JWT variables
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION_TIME=1h
```

Nota: Si ha inicializado los contenedores en el archivo de `docker-compose.yml`, en su contenido se encuentra presente las variables de entorno (environment variables) necesarias para su conexión, de forma que puede copiar y pegarlo en el archivo. De la misma manera, el archivo `development.env` se ha incluido para empezar más rapidamente. Recuerda usar el archivo `production.env` en cuando decidas levantar el proyecto en un servidor en producción.

5. Iniciar la aplicación:
```bash
npm run start
```
La API ahora debería ser accesible en http://localhost:3001/api.

## Principales endpoints

### GET /api/products
Este endpoint obtiene una lista de todos los productos y sus respectivas categorías, estando todos documentados a través de OpenAPI y Swagger.

#### Parámetros:
Ninguno
#### Respuesta:

```json
[
  {
    "id": 1,
    "name": "T-shirt",
    "description": "Camiseta de manga corta en color negro y rayas blancas para mujeres.",
    "price": "129.49",
    "category": {
      "name": "Ropa"
    }
  },
  {
    "id": 2,
    "name": "Jeans",
    "description": "Jeans de color azul y rayas negras para hombres.",
    "price": "159.90",
    "category": {
      "name": "Ropa"
    }
  },
  // ...
]
```

### GET /api/products/:categoryName
Este endpoint obtiene una lista de productos filtrados por categoría.

#### Parámetros:
- categoryName: El nombre de la categoría para filtrar.

#### Respuesta:

```json
[
  {
    "id": 1,
    "name": "T-shirt",
    "description": "Camiseta de manga corta en color negro y rayas blancas para mujeres.",
    "price": "129.49",
    "category": {
      "name": "Ropa"
    }
  },
  {
    "id": 2,
    "name": "Jeans",
    "description": "Jeans de color azul y rayas negras para hombres.",
    "price": "159.90",
    "category": {
      "name": "Ropa"
    }
  },
  // ...
]
```
Nota: Si la categoría especificada no existe, la API devolverá un error.

### POST /api/products
Este endpoint permite registrar un nuevo producto.

#### Request body:

```json
Copy code
{
  "name": "Nuevo Producto",
  "description": "Descripción del nuevo producto.",
  "category": "Ropa",
  "price": 49.90
}
```
Respuesta:

```json
{
  "id": 7,
  "name": "Nuevo Producto",
  "description": "Descripción del nuevo producto.",
  "price": "49.90",
  "category": {
    "name": "Ropa"
  }
}
```

### GET /api/categories
Este endpoint obtiene una lista de todas las categorías.

#### Parámetros:
Ninguno

#### Respuesta:

```json
[
  {
    "id": 1,
    "name": "Ropa",
    "description": "Artículos de ropa para la calle."
  },
  {
    "id": 2,
    "name": "Aire libre",
    "description": "Descripción de la categoría."
  },
  // ...
]
```

## Documentación
Las API están documentadas utilizando Swagger/OpenAPI. Puede acceder a la documentación de la API en http://localhost:3001/api/docs.

```bash
npm run test
```

## Tecnologías Utilizadas
- Node.js
- NestJS (con TypeScript)
- MySQL
- Docker/Docker compose
- Swagger/OpenAPI

## Contribuciones
Si desea contribuir a este proyecto, siéntase libre de crear una solicitud de extracción (pull request).

## Licencia
Este proyecto está bajo la Licencia MIT. Consulte el archivo LICENSE para obtener más detalles.