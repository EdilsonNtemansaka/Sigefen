const express = require('express');
const supabase = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    let query = supabase.from('viagens').select('*, camioes(matricula), motoristas(nome)').order('created_at', { ascending: false });
    if (req.query.estado) query = query.eq('estado', req.query.estado);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

router.post('/', async (req, res) => {
  const { camiao_id, motorista_id, origem, destino, tipo_carga, peso_t, cliente, data_partida, custo_total } = req.body;
  try {
    const { data, error } = await supabase.from('viagens').insert([{ camiao_id, motorista_id, origem, destino, tipo_carga, peso_t, cliente, data_partida, custo_total: custo_total || 0 }]).select().single();
    if (error) throw error;
    await supabase.from('camioes').update({ estado: 'em-rota' }).eq('id', camiao_id);
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

router.put('/:id/estado', async (req, res) => {
  const { estado, km_percorridos, data_chegada } = req.body;
  try {
    const updates = { estado };
    if (km_percorridos) updates.km_percorridos = km_percorridos;
    if (data_chegada) updates.data_chegada = data_chegada;
    const { data, error } = await supabase.from('viagens').update(updates).eq('id', req.params.id).select().single();
    if (error) throw error;
    if (estado === 'entregue' && data?.camiao_id) {
      await supabase.from('camioes').update({ estado: 'disponivel' }).eq('id', data.camiao_id);
    }
    res.json(data);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

module.exports = router;
