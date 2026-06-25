const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../db');
const router = express.Router();

// GET /utilizadores — listar todos
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('utilizadores')
      .select('id, nome, email, papel, ativo, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// POST /utilizadores — criar utilizador
router.post('/', async (req, res) => {
  const { nome, email, password, papel } = req.body;
  if (!nome || !email || !password) return res.status(400).json({ erro: 'Nome, email e password obrigatórios' });
  try {
    const hash = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('utilizadores')
      .insert([{ nome, email, password_hash: hash, papel: papel || 'gestor' }])
      .select('id, nome, email, papel, ativo, created_at')
      .single();
    if (error) {
      if (error.code === '23505') return res.status(409).json({ erro: 'Email já existe' });
      throw error;
    }
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// PUT /utilizadores/:id — actualizar utilizador
router.put('/:id', async (req, res) => {
  const { nome, papel, ativo, password } = req.body;
  try {
    const updates = {};
    if (nome !== undefined) updates.nome = nome;
    if (papel !== undefined) updates.papel = papel;
    if (ativo !== undefined) updates.ativo = ativo;
    if (password) updates.password_hash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from('utilizadores')
      .update(updates)
      .eq('id', req.params.id)
      .select('id, nome, email, papel, ativo')
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// DELETE /utilizadores/:id — desactivar (não apaga)
router.delete('/:id', async (req, res) => {
  try {
    const { error } = await supabase
      .from('utilizadores')
      .update({ ativo: false })
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

module.exports = router;
