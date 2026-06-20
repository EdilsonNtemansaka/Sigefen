require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth');
const camioesRoutes = require('./routes/camioes');
const motoristasRoutes = require('./routes/motoristas');
const viagensRoutes = require('./routes/viagens');
const manutencaoRoutes = require('./routes/manutencao');
const abastecimentosRoutes = require('./routes/abastecimentos');
const alertasRoutes = require('./routes/alertas');
const relatoriosRoutes = require('./routes/relatorios');
const { authMiddleware } = require('./middleware/auth');
const { iniciarAlertas } = require('./alertas');

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*' }));
app.use(express.json());

// Servir o frontend
app.use(express.static(path.join(__dirname, '../../')));


const limiter = rateLimit({ windowMs: 60 * 1000, max: 100 });
app.use('/auth', limiter);

// Rotas públicas
app.use('/auth', authRoutes);

// Rotas protegidas
app.use('/camioes', authMiddleware, camioesRoutes);
app.use('/motoristas', authMiddleware, motoristasRoutes);
app.use('/viagens', authMiddleware, viagensRoutes);
app.use('/manutencao', authMiddleware, manutencaoRoutes);
app.use('/abastecimentos', authMiddleware, abastecimentosRoutes);
app.use('/alertas', authMiddleware, alertasRoutes);
app.use('/relatorios', authMiddleware, relatoriosRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', versao: '1.0.0' }));

// Rota principal — servir o frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../SIGEFEN_v2.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`SIGEFEN API a correr na porta ${PORT}`);
  iniciarAlertas();
});
