const express = require('express');
const supabase = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('abastecimentos').select('*, camioes(matricula), motoristas(nome)').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

router.post('/', async (req, res) => {
  const { camiao_id, motorista_id, posto, litros, preco_litro, km_momento } = req.body;
  const total_mt = parseFloat((litros * preco_litro).toFixed(2));
  try {
    const { data, error } = await supabase.from('abastecimentos').insert([{ camiao_id, motorista_id, posto, litros, preco_litro, total_mt, km_momento }]).select().single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

module.exports = router;
