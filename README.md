# API Lavadero Uniautónoma — Programa de Fidelidad

API REST en **Node.js + Express + MongoDB (Mongoose)** para gestionar los lavados de vehículos de estudiantes de la **Universidad Autónoma del Cauca**.

**Regla de negocio principal:** después de **10 lavados pagados**, el **siguiente (el 11.º) es totalmente gratis**. Luego el ciclo se reinicia.

**Parcial 2  API REST con Node.js y MongoDB**

- **Integrantes:JUAN DAVID ANAYA LOPEZ - FERNEY ARTURO DIAZ CERQUERA** 
- **Docente: DIEGO FERNANDO PRADO OSORIO** 



## Estructura
```
src/
├── config/db.js            # conexión a MongoDB
├── models/                 # Estudiante, Vehiculo, Lavado
├── controllers/            # lógica de cada funcionalidad
├── routes/                 # endpoints REST
├── middlewares/errores.js  # manejo global de errores (400/404/500)
├── app.js
└── server.js
```

## Modelo de datos (colecciones)
- **estudiantes**: nombre, codigo (único), correo (único), programa, telefono, lavadosPagados (ciclo), lavadosTotales, lavadosGratisUsados


- **vehiculos**: placa (única), tipo (`carro`/`moto`), marca, color, estudiante (ref)


- **lavados**: estudiante (ref), vehiculo (ref), tipoLavado (`basico` $15.000 / `completo` $25.000), precio, esGratis, numeroLavadoEstudiante

## Historias de usuario y funcionalidades

| N.º | Historia de usuario | Funcionalidad | Endpoint y método | Resultado esperado |
|---|---|---|---|---|
| 1 | Como **estudiante**, quiero registrarme en el programa, para participar y acumular lavados hacia uno gratis. | Registrar estudiante | `POST /api/estudiantes` | 201 + estudiante creado. 400 si faltan datos o el código/correo se repite |
| 2 | Como **administrador del lavadero**, quiero listar y filtrar estudiantes por programa, para conocer quiénes participan. | Listar/filtrar estudiantes | `GET /api/estudiantes?programa=` | 200 + lista |
| 3 | Como **administrador**, quiero consultar un estudiante con sus vehículos, para atenderlo rápidamente en caja. | Consultar estudiante por id | `GET /api/estudiantes/:id` | 200 + estudiante y vehículos. 404 si no existe |
| 4 | Como **estudiante**, quiero actualizar mi teléfono o correo, para que el lavadero pueda contactarme. | Actualizar estudiante | `PUT /api/estudiantes/:id` | 200 + datos actualizados |
| 5 | Como **estudiante**, quiero registrar mi vehículo, para que mis lavados queden asociados a él. | Registrar vehículo | `POST /api/vehiculos` | 201 + vehículo. 404 si el estudiante no existe. 400 si placa repetida o tipo inválido |
| 6 | Como **operario**, quiero buscar un vehículo por placa, para identificar al dueño al llegar al lavadero. | Buscar vehículo por placa/tipo | `GET /api/vehiculos?placa=` | 200 + vehículos con datos del dueño |
| 7 | Como **estudiante**, quiero que mi lavado se registre y se cobre según mi historial, para que el lavado número 11 sea gratis. | Registrar lavado con regla de fidelidad | `POST /api/lavados` | 201; precio normal o `0` y `esGratis: true` tras 10 pagados |
| 8 | Como **estudiante**, quiero consultar cuántos lavados me faltan, para saber cuándo tendré mi lavado gratis. | Consultar fidelidad | `GET /api/estudiantes/:id/fidelidad` | 200 + lavados restantes |
| 9 | Como **administrador**, quiero ver el historial de lavados filtrado por estudiante, gratis o fechas, para controlar ingresos y promociones. | Historial filtrado con total cobrado | `GET /api/lavados?estudiante=&gratis=&desde=&hasta=` | 200 + lista y `totalCobrado` |
| 10 | Como **estudiante**, quiero eliminar un vehículo que ya vendí, para que no aparezca en mi perfil. | Eliminar vehículo | `DELETE /api/vehiculos/:id` | 200. 404 si no existe |

## Ejemplos de cuerpos JSON
**POST /api/estudiantes**
```json
{ "nombre": "Laura Gómez", "codigo": "20231001", "correo": "laura@uniautonoma.edu.co", "programa": "Ingeniería de Sistemas", "telefono": "3001234567" }


```
**POST /api/vehiculos**
```json
{ "placa": "ABC123", "tipo": "carro", "marca": "Mazda", "color": "Rojo", "estudiante": "<ID_ESTUDIANTE>" }
```


**POST /api/lavados**
```json
{ "estudiante": "<ID_ESTUDIANTE>", "vehiculo": "<ID_VEHICULO>", "tipoLavado": "basico" }
```



## Códigos de estado
`200` / `201` éxito · `400` datos inválidos, duplicados o JSON mal formado · `404` recurso no encontrado · `500` error interno

## Pruebas
Importar `Lavadero_Uniautonoma.postman_collection.json` en **Postman** o **Thunder Client** (Collections → Import). Las peticiones 1 y 5 guardan automáticamente los IDs en variables de la colección. Guion de sustentación en `SUSTENTACION.md`.
