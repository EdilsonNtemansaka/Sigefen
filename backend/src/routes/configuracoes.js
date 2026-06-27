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
  const { nome_empresa, nif, email, telefone, morada } = req.body;
  try {
    const { data, error } = await supabase
      .from('configuracoes')
      .update({ nome_empresa, nif, email, telefone, morada })
      .eq('id', 1)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

module.exports = router;
