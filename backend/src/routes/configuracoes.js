const express = require('express');
const supabase = require('../db');
const router = express.Router();

// GET /configuracoes
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('configuracoes').select('*').eq('id', 1).single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// PUT /configuracoes
router.put('/', async (req, res) => {
  const { nome_empresa, nif, email, telefone, morada, plano, max_camioes, max_utilizadores } = req.body;
  try {
    const updates = {};
    if (nome_empresa !== undefined) updates.nome_empresa = nome_empresa;
    if (nif !== undefined) updates.nif = nif;
    if (email !== undefined) updates.email = email;
    if (telefone !== undefined) updates.telefone = telefone;
    if (morada !== undefined) updates.morada = morada;
    if (plano !== undefined) updates.plano = plano;
    if (max_camioes !== undefined) updates.max_camioes = max_camioes;
    if (max_utilizadores !== undefined) updates.max_utilizadores = max_utilizadores;

    const { data, error } = await supabase
      .from('configuracoes')
      .update(updates)
      .eq('id', 1)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

module.exports = router;
