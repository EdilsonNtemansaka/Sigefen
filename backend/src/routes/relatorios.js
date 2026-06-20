const express = require('express');
const supabase = require('../db');
const router = express.Router();

// GET /relatorios/resumo?mes=6&ano=2026
router.get('/resumo', async (req, res) => {
  try {
    const { data: camioes } = await supabase.from('camioes').select('*').neq('estado', 'inactivo');
    const { data: viagens } = await supabase.from('viagens').select('*');
    const { data: manut }   = await supabase.from('manutencoes').select('*');
    const { data: abast }   = await supabase.from('abastecimentos').select('*');
    const { data: motor }   = await supabase.from('motoristas').select('*');

    const totalCusto = (viagens||[]).reduce((s,v) => s + parseFloat(v.custo_total||0), 0);
    const totalCombustivel = (abast||[]).reduce((s,a) => s + parseFloat(a.total_mt||0), 0);
    const totalManutencao  = (manut||[]).reduce((s,m) => s + parseFloat(m.custo||0), 0);

    res.json({
      frota: {
        total: camioes?.length || 0,
        em_rota: camioes?.filter(c => c.estado === 'em-rota').length || 0,
        manutencao: camioes?.filter(c => c.estado === 'manutencao').length || 0,
        avariados: camioes?.filter(c => c.estado === 'avariado').length || 0,
      },
      viagens: {
        total: viagens?.length || 0,
        entregues: viagens?.filter(v => v.estado === 'entregue').length || 0,
        em_rota: viagens?.filter(v => v.estado === 'em-rota').length || 0,
        receita_total_mt: totalCusto,
      },
      custos: {
        combustivel_mt: totalCombustivel,
        manutencao_mt: totalManutencao,
        total_mt: totalCombustivel + totalManutencao,
      },
      motoristas: {
        total: motor?.length || 0,
        em_servico: motor?.filter(m => m.estado === 'em-servico').length || 0,
      },
      abastecimentos: {
        total_litros: (abast||[]).reduce((s,a) => s + parseFloat(a.litros||0), 0),
        total_registos: abast?.length || 0,
      }
    });
  } catch(err) { res.status(500).json({ erro: err.message }); }
});

// GET /relatorios/camioes — custo por camião
router.get('/camioes', async (req, res) => {
  try {
    const { data: camioes } = await supabase.from('camioes').select('*').neq('estado','inactivo');
    const { data: abast }   = await supabase.from('abastecimentos').select('*');
    const { data: manut }   = await supabase.from('manutencoes').select('*');
    const { data: viagens } = await supabase.from('viagens').select('*');

    const relatorio = (camioes||[]).map(c => {
      const combustivel = (abast||[]).filter(a => a.camiao_id === c.id).reduce((s,a) => s + parseFloat(a.total_mt||0), 0);
      const manutencao  = (manut||[]).filter(m => m.camiao_id === c.id).reduce((s,m) => s + parseFloat(m.custo||0), 0);
      const nViagens    = (viagens||[]).filter(v => v.camiao_id === c.id).length;
      const receita     = (viagens||[]).filter(v => v.camiao_id === c.id).reduce((s,v) => s + parseFloat(v.custo_total||0), 0);
      return {
        matricula: c.matricula, modelo: `${c.marca} ${c.modelo}`,
        estado: c.estado, km_total: c.km_total,
        n_viagens: nViagens, receita_mt: receita,
        custo_combustivel_mt: combustivel, custo_manutencao_mt: manutencao,
        custo_total_mt: combustivel + manutencao,
        lucro_mt: receita - combustivel - manutencao,
      };
    });
    res.json(relatorio);
  } catch(err) { res.status(500).json({ erro: err.message }); }
});

// GET /relatorios/exportar?formato=csv
router.get('/exportar', async (req, res) => {
  try {
    const { data: camioes } = await supabase.from('camioes').select('*').neq('estado','inactivo');
    const { data: abast }   = await supabase.from('abastecimentos').select('*');
    const { data: manut }   = await supabase.from('manutencoes').select('*');
    const { data: viagens } = await supabase.from('viagens').select('*');

    const linhas = [
      ['Matricula','Modelo','Estado','Km Total','Viagens','Receita (MT)','Combustivel (MT)','Manutencao (MT)','Custo Total (MT)','Lucro (MT)']
    ];
    for (const c of camioes||[]) {
      const combustivel = (abast||[]).filter(a => a.camiao_id === c.id).reduce((s,a) => s + parseFloat(a.total_mt||0), 0);
      const manutencao  = (manut||[]).filter(m => m.camiao_id === c.id).reduce((s,m) => s + parseFloat(m.custo||0), 0);
      const nViagens    = (viagens||[]).filter(v => v.camiao_id === c.id).length;
      const receita     = (viagens||[]).filter(v => v.camiao_id === c.id).reduce((s,v) => s + parseFloat(v.custo_total||0), 0);
      linhas.push([c.matricula, `${c.marca} ${c.modelo}`, c.estado, c.km_total, nViagens,
        receita.toFixed(2), combustivel.toFixed(2), manutencao.toFixed(2),
        (combustivel+manutencao).toFixed(2), (receita-combustivel-manutencao).toFixed(2)]);
    }

    const csv = linhas.map(l => l.join(';')).join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="SIGEFEN_relatorio_${new Date().toISOString().split('T')[0]}.csv"`);
    res.send('﻿' + csv); // BOM para Excel reconhecer UTF-8
  } catch(err) { res.status(500).json({ erro: err.message }); }
});

module.exports = router;
