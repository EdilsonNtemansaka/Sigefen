const cron = require('node-cron');
const supabase = require('./db');

// Alertas em memória — em produção guardar na BD
const alertasActivos = [];

function addAlerta(tipo, titulo, mensagem, camiao_id = null) {
  alertasActivos.unshift({
    id: Date.now().toString(),
    tipo,        // 'urgente' | 'aviso' | 'info'
    titulo,
    mensagem,
    camiao_id,
    criado_em: new Date().toISOString(),
    lido: false
  });
  // Manter máximo 50 alertas
  if (alertasActivos.length > 50) alertasActivos.pop();
  console.log(`[ALERTA ${tipo.toUpperCase()}] ${titulo}: ${mensagem}`);
}

async function verificarDocumentos() {
  const hoje = new Date();
  const em30dias = new Date(hoje);
  em30dias.setDate(hoje.getDate() + 30);

  const { data: docs } = await supabase
    .from('documentos')
    .select('*, camioes(matricula)')
    .lte('validade', em30dias.toISOString().split('T')[0]);

  if (!docs) return;
  for (const doc of docs) {
    const val = new Date(doc.validade);
    const diasRestantes = Math.ceil((val - hoje) / (1000 * 60 * 60 * 24));
    const matricula = doc.camioes?.matricula || doc.camiao_id;

    if (diasRestantes < 0) {
      addAlerta('urgente', `Documento expirado — ${matricula}`,
        `${doc.tipo} expirou há ${Math.abs(diasRestantes)} dias.`, doc.camiao_id);
      await supabase.from('documentos').update({ estado: 'expirado' }).eq('id', doc.id);
    } else if (diasRestantes <= 30) {
      addAlerta('aviso', `Documento a expirar — ${matricula}`,
        `${doc.tipo} expira em ${diasRestantes} dias (${doc.validade}).`, doc.camiao_id);
      await supabase.from('documentos').update({ estado: 'a_expirar' }).eq('id', doc.id);
    }
  }
}

async function verificarManutencoes() {
  const hoje = new Date().toISOString().split('T')[0];

  const { data: manut } = await supabase
    .from('manutencoes')
    .select('*, camioes(matricula)')
    .lt('data_agendada', hoje)
    .eq('estado', 'agendada');

  if (!manut) return;
  for (const m of manut) {
    const matricula = m.camioes?.matricula || m.camiao_id;
    addAlerta('urgente', `Manutenção em atraso — ${matricula}`,
      `${m.tipo} estava agendada para ${m.data_agendada} e não foi concluída.`, m.camiao_id);
    await supabase.from('manutencoes').update({ estado: 'em-atraso' }).eq('id', m.id);
  }
}

async function verificarViagens() {
  const { data: viagens } = await supabase
    .from('viagens')
    .select('*, camioes(matricula)')
    .eq('estado', 'em-rota')
    .not('data_partida', 'is', null);

  if (!viagens) return;
  const agora = new Date();
  for (const v of viagens) {
    const partida = new Date(v.data_partida);
    const horasDecorridas = (agora - partida) / (1000 * 60 * 60);
    // Alerta se viagem tem mais de 48h sem actualização
    if (horasDecorridas > 48) {
      const matricula = v.camioes?.matricula || '—';
      addAlerta('aviso', `Viagem sem actualização — ${matricula}`,
        `Viagem ${v.origem} → ${v.destino} iniciada há ${Math.floor(horasDecorridas)}h sem confirmação.`, v.camiao_id);
    }
  }
}

async function verificarCombustivel() {
  const { data: camioes } = await supabase
    .from('camioes')
    .select('*')
    .lt('combustivel_pct', 20)
    .neq('estado', 'inactivo');

  if (!camioes) return;
  for (const c of camioes) {
    addAlerta('aviso', `Combustível baixo — ${c.matricula}`,
      `Nível de combustível em ${c.combustivel_pct}%. Abastecer brevemente.`, c.id);
  }
}

async function correrVerificacoes() {
  console.log('[ALERTAS] A verificar sistema...');
  await verificarDocumentos();
  await verificarManutencoes();
  await verificarViagens();
  await verificarCombustivel();
  console.log(`[ALERTAS] Verificação completa. ${alertasActivos.length} alertas activos.`);
}

function iniciarAlertas() {
  // Correr imediatamente ao iniciar
  correrVerificacoes();
  // Depois correr todos os dias às 07:00
  cron.schedule('0 7 * * *', correrVerificacoes);
  console.log('[ALERTAS] Sistema de alertas iniciado.');
}

function getAlertas() { return alertasActivos; }
function marcarLido(id) {
  const a = alertasActivos.find(x => x.id === id);
  if (a) a.lido = true;
}

module.exports = { iniciarAlertas, getAlertas, marcarLido };
