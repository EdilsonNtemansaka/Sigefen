const express = require('express');
const supabase = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('motoristas').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('motoristas').select('*').eq('id', req.params.id).single();
    if (error) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(data);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

router.post('/', async (req, res) => {
  const { nome, bi, licenca_cat, licenca_val, contacto, cidade } = req.body;
  if (!nome) return res.status(400).json({ erro: 'Nome obrigatório' });
  try {
    const { data, error } = await supabase.from('motoristas').insert([{ nome, bi, licenca_cat, licenca_val, contacto, cidade }]).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

router.put('/:id', async (req, res) => {
  const { nome, bi, licenca_cat, licenca_val, contacto, cidade, estado, camiao_id } = req.body;
  try {
    const { data, error } = await supabase.from('motoristas').update({ nome, bi, licenca_cat, licenca_val, contacto, cidade, estado, camiao_id: camiao_id || null }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

module.exports = router;
