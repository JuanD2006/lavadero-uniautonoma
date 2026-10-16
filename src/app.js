const express = require('express');
const { noEncontrada, manejadorErrores } = require('./middlewares/errores');

const app = express();
app.use(express.json());

app.get('/', (req, res) => res.json({ ok: true, mensaje: 'API Lavadero Uniautónoma funcionando' }));
app.use('/api/estudiantes', require('./routes/estudiantes.routes'));
app.use('/api/vehiculos', require('./routes/vehiculos.routes'));
app.use('/api/lavados', require('./routes/lavados.routes'));

app.use(noEncontrada);
app.use(manejadorErrores);

module.exports = app;
