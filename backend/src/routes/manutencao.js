const express = require('express');
const supabase = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase.from('manutencoes').select('*, camioes(matricula)').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

router.post('/', async (req, res) => {
  const { camiao_id, tipo, data_agendada, oficina, custo, prioridade, observacoes } = req.body;
  try {
    const { data, error } = await supabase.from('manutencoes').insert([{ camiao_id, tipo, data_agendada, oficina, custo: custo || 0, prioridade: prioridade || 'normal', observacoes }]).select().single();
    if (error) throw error;
    await supabase.from('camioes').update({ estado: 'manutencao' }).eq('id', camiao_id);
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

router.put('/:id/concluir', async (req, res) => {
  try {
    const { data, error } = await supabase.from('manutencoes').update({ estado: 'concluida', data_conclusao: new Date().toISOString().split('T')[0] }).eq('id', req.params.id).select().single();
    if (error) throw error;
    if (data?.camiao_id) {
      await supabase.from('camioes').update({ estado: 'disponivel' }).eq('id', data.camiao_id);
    }
    res.json(data);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

module.exports = router;
