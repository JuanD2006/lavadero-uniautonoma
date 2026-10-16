const Lavado = require('../models/Lavado');
const Estudiante = require('../models/Estudiante');
const Vehiculo = require('../models/Vehiculo');
const { HttpError } = require('../middlewares/errores');

const PRECIOS = { basico: 15000, completo: 25000 };
const LAVADOS_PARA_GRATIS = 10;

// F7: registrar lavado aplicando la regla de negocio: tras 10 lavados pagados, el siguiente es gratis
exports.crear = async (req, res) => {
  const { estudiante: estudianteId, vehiculo: vehiculoId, tipoLavado } = req.body;
  if (!estudianteId || !vehiculoId || !tipoLavado)
    throw new HttpError(400, 'estudiante, vehiculo y tipoLavado son obligatorios');
  if (!PRECIOS[tipoLavado])
    throw new HttpError(400, `tipoLavado debe ser: ${Object.keys(PRECIOS).join(' o ')}`);

  const estudiante = await Estudiante.findById(estudianteId);
  if (!estudiante) throw new HttpError(404, 'Estudiante no encontrado');
  const vehiculo = await Vehiculo.findById(vehiculoId);
  if (!vehiculo) throw new HttpError(404, 'Vehículo no encontrado');
  if (String(vehiculo.estudiante) !== String(estudiante._id))
    throw new HttpError(400, 'El vehículo no pertenece a este estudiante');

  const esGratis = estudiante.lavadosPagados >= LAVADOS_PARA_GRATIS;
  if (esGratis) {
    estudiante.lavadosPagados = 0;          // se reinicia el ciclo
    estudiante.lavadosGratisUsados += 1;
  } else {
    estudiante.lavadosPagados += 1;
  }
  estudiante.lavadosTotales += 1;
  await estudiante.save();

  const lavado = await Lavado.create({
    estudiante: estudiante._id,
    vehiculo: vehiculo._id,
    tipoLavado,
    precio: esGratis ? 0 : PRECIOS[tipoLavado],
    esGratis,
    numeroLavadoEstudiante: estudiante.lavadosTotales
  });

  res.status(201).json({
    ok: true,
    mensaje: esGratis ? '¡Este lavado es GRATIS por fidelidad!' : 'Lavado registrado',
    data: lavado,
    lavadosRestantesParaGratis: Math.max(LAVADOS_PARA_GRATIS - estudiante.lavadosPagados, 0)
  });
};

// F9: historial filtrado (?estudiante=id &gratis=true|false &desde=YYYY-MM-DD &hasta=YYYY-MM-DD)
exports.listar = async (req, res) => {
  const { estudiante, gratis, desde, hasta } = req.query;
  const filtro = {};
  if (estudiante) filtro.estudiante = estudiante;
  if (gratis !== undefined) filtro.esGratis = gratis === 'true';
  if (desde || hasta) {
    filtro.createdAt = {};
    if (desde) filtro.createdAt.$gte = new Date(desde);
    if (hasta) filtro.createdAt.$lte = new Date(`${hasta}T23:59:59.999Z`);
    if (Object.values(filtro.createdAt).some(d => isNaN(d))) throw new HttpError(400, 'Fecha inválida (use YYYY-MM-DD)');
  }
  const lavados = await Lavado.find(filtro)
    .populate('estudiante', 'nombre codigo')
    .populate('vehiculo', 'placa tipo')
    .sort({ createdAt: -1 });
  const totalCobrado = lavados.reduce((s, l) => s + l.precio, 0);
  res.status(200).json({ ok: true, total: lavados.length, totalCobrado, data: lavados });
};
