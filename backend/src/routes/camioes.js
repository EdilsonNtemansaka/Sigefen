const express = require('express');
const supabase = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let query = supabase.from('camioes').select('*').order('created_at', { ascending: false });
    if (req.query.estado) query = query.eq('estado', req.query.estado);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await supabase.from('camioes').select('*').eq('id', req.params.id).single();
    if (error) return res.status(404).json({ erro: 'Não encontrado' });
    res.json(data);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

router.post('/', async (req, res) => {
  const { matricula, marca, modelo, ano, capacidade_t, chassis } = req.body;
  if (!matricula) return res.status(400).json({ erro: 'Matrícula obrigatória' });
  try {
    const { data, error } = await supabase.from('camioes').insert([{ matricula, marca, modelo, ano, capacidade_t, chassis }]).select().single();
    if (error) {
      if (error.code === '23505') return res.status(409).json({ erro: 'Matrícula já existe' });
      throw error;
    }
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

router.put('/:id', async (req, res) => {
  const { marca, modelo, ano, capacidade_t, km_total, estado, combustivel_pct } = req.body;
  try {
    const { data, error } = await supabase.from('camioes').update({ marca, modelo, ano, capacidade_t, km_total, estado, combustivel_pct }).eq('id', req.params.id).select().single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase.from('camioes').update({ estado: 'inactivo' }).eq('id', req.params.id);
    if (error) throw error;
    res.json({ mensagem: 'Camião desactivado' });
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

module.exports = router;
