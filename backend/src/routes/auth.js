const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../db');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ erro: 'Email e password obrigatórios' });
  try {
    // maybeSingle() retorna null em vez de lançar erro quando não encontra registo
    const { data, error } = await supabase
      .from('utilizadores')
      .select('*')
      .eq('email', email)
      .eq('ativo', true)
      .maybeSingle();

    if (error) {
      console.error('[login] erro supabase:', error.message);
      return res.status(500).json({ erro: 'Erro interno do servidor' });
    }
    if (!data) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const valido = await bcrypt.compare(password, data.password_hash);
    if (!valido) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const expiresIn = (process.env.JWT_EXPIRES_IN || '8h').replace(/['"]/g, '');
    const token = jwt.sign(
      { id: data.id, nome: data.nome, email: data.email, papel: data.papel },
      process.env.JWT_SECRET,
      { expiresIn }
    );
    res.json({ token, user: { id: data.id, nome: data.nome, email: data.email, papel: data.papel } });
  } catch (err) {
    console.error('[login] erro inesperado:', err.message);
    res.status(500).json({ erro: 'Erro interno do servidor' });
  }
});

router.post('/registar', async (req, res) => {
  const { nome, email, password, papel } = req.body;
  if (!nome || !email || !password) return res.status(400).json({ erro: 'Nome, email e password obrigatórios' });
  try {
    const hash = await bcrypt.hash(password, 12);
    const { data, error } = await supabase.from('utilizadores').insert([{ nome, email, password_hash: hash, papel: papel || 'gestor' }]).select('id, nome, email, papel').single();
    if (error) {
      if (error.code === '23505') return res.status(409).json({ erro: 'Email já existe' });
      throw error;
    }
    res.status(201).json(data);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

module.exports = router;
