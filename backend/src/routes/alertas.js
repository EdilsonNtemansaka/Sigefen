const express = require('express');
const { getAlertas, marcarLido } = require('../alertas');
const router = express.Router();

router.get('/', (req, res) => {
  const todos = getAlertas();
  const naoLidos = todos.filter(a => !a.lido);
  res.json({ total: todos.length, nao_lidos: naoLidos.length, alertas: todos });
});

router.put('/:id/lido', (req, res) => {
  marcarLido(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
