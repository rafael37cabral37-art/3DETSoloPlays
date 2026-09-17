/* ===== [CATALOGO_MERCADO_TEMPLO] linhas originais 4841-5112 ===== */
/* ---------- Catálogo do Mercado + Templo (compra → inventário) ---------- */
const SHOP_CATALOG = [
  // 🧪 Poções e Consumíveis (Mercado)
  {
    id: 'pocao_cura_menor', nome: 'Poção de Cura Menor', tipo: 'consumivel', categoria: 'mercado',
    valor: 25, usavel: true, efeito: 'cura1d1',
    desc: 'Frasco de vidro pequeno com líquido vermelho-claro. Recupera 1d+1 PVs instantaneamente. Consumido após o uso.',
    invNome: 'Poção de Cura Menor (1 uso)'
  },
  {
    id: 'pocao_cura_maior', nome: 'Poção de Cura Maior', tipo: 'consumivel', categoria: 'mercado',
    valor: 60, usavel: true, efeito: 'cura3d3',
    desc: 'Frasco médio com líquido vermelho-escuro e brilhante. Recupera 3d+3 PVs. Consumido após o uso.',
    invNome: 'Poção de Cura Maior (1 uso)'
  },
  {
    id: 'elixir_mana_menor', nome: 'Elixir de Mana Menor', tipo: 'consumivel', categoria: 'mercado',
    valor: 25, usavel: true, efeito: 'mana1d1',
    desc: 'Frasco azul-transparente com líquido que brilha suavemente. Recupera 1d+1 PMs. Consumido após o uso.',
    invNome: 'Elixir de Mana Menor (1 uso)'
  },
  {
    id: 'antidoto', nome: 'Antídoto', tipo: 'consumivel', categoria: 'mercado',
    valor: 20, usavel: true, efeito: 'antidoto',
    desc: 'Frasco verde-escuro com odor forte de ervas. Cura qualquer envenenamento ou toxina comum. Consumido após o uso.',
    invNome: 'Antídoto (1 uso)'
  },
  {
    id: 'racoes_viagem', nome: 'Rações de Viagem (1 semana)', tipo: 'consumivel', categoria: 'mercado',
    valor: 30, usavel: true, efeito: 'racoes7',
    desc: 'Pacote de comida seca, carne defumada e pão duro. Evita regras de fome/privação por 7 dias.',
    invNome: 'Rações de Viagem (1 semana)'
  },
  // 🛠️ Equipamento Utilitário
  {
    id: 'kit_ladrao', nome: 'Kit de Ladrão (Ganzuas)', tipo: 'equipamento', categoria: 'mercado',
    valor: 40, usavel: false, efeito: null,
    desc: 'Conjunto de ganzuas, limas e ferramentas pequenas em estojo de couro. Permite testes de arrombamento. +1 em testes de Crime ou Investigação para abrir fechaduras.',
    invNome: 'Kit de Ladrão (Ganzuas)'
  },
  {
    id: 'corda_seda', nome: 'Corda de Seda (15 metros)', tipo: 'equipamento', categoria: 'mercado',
    valor: 15, usavel: false, efeito: null,
    desc: 'Corda fina, leve e extremamente resistente. +1 em testes de escalada ou para amarrar alvos.',
    invNome: 'Corda de Seda (15 m)'
  },
  {
    id: 'tochas', nome: 'Tocha (Pacote com 5)', tipo: 'consumivel', categoria: 'mercado',
    valor: 5, usavel: true, efeito: 'tocha',
    desc: 'Cinco tochas de madeira com pano embebido em óleo. Ilumina 6 metros de raio por 1 hora cada. Evita penalidade de escuridão.',
    invNome: 'Tochas (5 unidades)'
  },
  {
    id: 'espelho_metal', nome: 'Espelho de Metal', tipo: 'equipamento', categoria: 'mercado',
    valor: 10, usavel: false, efeito: null,
    desc: 'Espelho pequeno e polido de metal. Permite olhar em esquinas ou enfrentar criaturas de olhar petrificante sem se expor diretamente.',
    invNome: 'Espelho de Metal'
  },
  // ⚔️ Armas e Armaduras
  {
    id: 'arma_aco', nome: 'Arma de Aço Forjado', tipo: 'equipamento', categoria: 'mercado',
    valor: 80, usavel: false, efeito: 'arma_aco',
    desc: 'Espada, machado ou lança de excelência. +1 na Força de Ataque (FA) apenas no primeiro turno de combate.',
    invNome: 'Arma de Aço Forjado (+1 FA no 1º turno)'
  },
  {
    id: 'escudo_carvalho', nome: 'Escudo de Carvalho', tipo: 'equipamento', categoria: 'mercado',
    valor: 50, usavel: false, efeito: 'escudo_carvalho',
    desc: 'Escudo reforçado de madeira de carvalho. +1 na Força de Defesa (FD) contra ataques de projéteis (Pdf) ao usar Bloqueio.',
    invNome: 'Escudo de Carvalho (+1 FD vs. projéteis)'
  },
  {
    id: 'armadura_couro', nome: 'Armadura de Couro Batido', tipo: 'equipamento', categoria: 'mercado',
    valor: 60, usavel: false, efeito: 'armadura_couro',
    desc: 'Armadura de couro endurecido e tratado. +1 na FD apenas contra dano de esmagamento/impacto.',
    invNome: 'Armadura de Couro Batido (+1 FD vs. esmagamento)'
  },
  // ⚔️ Armas com tipo de dano (equipar muda o dano na arena)
  {
    id: 'espada_prata', nome: 'Espada de Prata', tipo: 'equipamento', categoria: 'mercado',
    valor: 120, usavel: false, efeito: 'arma_prata', danoTipo: 'Prata', slot: 'arma',
    desc: 'Lâmina de prata ritual. Dano tipo Prata — eficaz contra mortos-vivos, espectros e liches (ignora imunidade física).',
    invNome: 'Espada de Prata [dano: Prata]'
  },
  {
    id: 'maca_sagrada', nome: 'Maça Sagrada', tipo: 'equipamento', categoria: 'templo',
    valor: 100, usavel: false, efeito: 'arma_sagrada', danoTipo: 'Sagrado', slot: 'arma',
    desc: 'Maça abençoada no templo. Dano Sagrado — fere liches, demônios e mortos-vivos; dobra dano se o alvo for vulnerável a Sagrado.',
    invNome: 'Maça Sagrada [dano: Sagrado]'
  },
  {
    id: 'adaga_flamejante', nome: 'Adaga Flamejante', tipo: 'equipamento', categoria: 'mercado',
    valor: 95, usavel: false, efeito: 'arma_fogo', danoTipo: 'Fogo', slot: 'arma',
    desc: 'Adaga com runas de fogo. Dano tipo Fogo — útil contra trolls, plantas e criaturas vulneráveis ao fogo.',
    invNome: 'Adaga Flamejante [dano: Fogo]'
  },
  {
    id: 'bastao_arcano', nome: 'Bastão Arcano', tipo: 'equipamento', categoria: 'mercado',
    valor: 110, usavel: false, efeito: 'arma_magica', danoTipo: 'Mágico', slot: 'arma', faAlways: 1,
    desc: 'Bastão canalizador. Golpes contam como dano Mágico (+1 FA). Não gasta PM (diferente do botão Feitiço).',
    invNome: 'Bastão Arcano [dano: Mágico · +1 FA]'
  },
  {
    id: 'machado_guerra', nome: 'Machado de Guerra', tipo: 'equipamento', categoria: 'mercado',
    valor: 70, usavel: false, efeito: 'arma_corte', danoTipo: 'Corte', slot: 'arma',
    desc: 'Machado pesado de aço. Dano tipo Corte (físico comum — não fere incorpóreos/imunes a físico).',
    invNome: 'Machado de Guerra [dano: Corte]'
  },
  // 🔮 Itens mágicos menores
  {
    id: 'pergaminho_magico', nome: 'Pergaminho Mágico', tipo: 'consumivel', categoria: 'mercado',
    valor: 50, usavel: true, efeito: 'pergaminho',
    desc: 'Pergaminho selado com a magia escrita. Permite conjurar a magia uma única vez (ainda gasta os PMs necessários).',
    invNome: 'Pergaminho Mágico (1 uso)'
  },
  {
    id: 'pedra_amolar', nome: 'Pedra de Amolar Encantada', tipo: 'consumivel', categoria: 'mercado',
    valor: 35, usavel: true, efeito: 'pedra_amolar',
    desc: 'Pedra pequena que brilha levemente. Concede Ataque Especial (+1 em F ou Pdf) no próximo ataque. Depois a magia se esgota.',
    invNome: 'Pedra de Amolar Encantada (1 uso)'
  },
  {
    id: 'capa_furtividade', nome: 'Capa dos Passos Silenciosos', tipo: 'equipamento', categoria: 'mercado',
    valor: 90, usavel: false, efeito: 'capa_furtividade',
    desc: 'Capa leve tecida por elfos, de cor escura. Enquanto usada, concede a especialização Furtividade.',
    invNome: 'Capa dos Passos Silenciosos (Furtividade)'
  },
  // ⛪ Templo — itens físicos
  {
    id: 'agua_benta', nome: 'Água Benta (Frasco)', tipo: 'consumivel', categoria: 'templo',
    valor: 15, usavel: true, efeito: 'agua_benta',
    desc: 'Frasco de vidro com água sagrada. Causa 1d + Pdf de dano contra mortos-vivos ou demônios, ignorando armadura.',
    invNome: 'Água Benta (1 frasco)'
  },
  {
    id: 'bencao_protetor', nome: 'Bênção do Protetor', tipo: 'servico', categoria: 'templo',
    valor: 40, usavel: false, efeito: 'bencao_protetor',
    desc: 'Ritual realizado pelos clérigos. +1 em testes de Resistência (R) contra magias e efeitos mentais por 24 horas (ou até o fim da próxima masmorra).',
    invNome: 'Bênção do Protetor (+1 R vs. magias/mentais – 24h)'
  },
  // ⛪ Templo — serviços (não geram item físico, aplicam status)
  {
    id: 'cura_divina', nome: 'Cura Divina Completa', tipo: 'servico', categoria: 'templo',
    valor: 50, usavel: false, efeito: 'cura_divina',
    desc: 'Restaura todos os PVs do personagem. Não gera item físico.',
    invNome: null
  },
  {
    id: 'tratamento_doencas', nome: 'Tratamento de Doenças', tipo: 'servico', categoria: 'templo',
    valor: 35, usavel: false, efeito: 'tratamento_doencas',
    desc: 'Remove doenças e toxinas comuns. Não gera item físico.',
    invNome: null
  },
  {
    id: 'remocao_maldicao', nome: 'Remoção de Maldição', tipo: 'servico', categoria: 'templo',
    valor: 80, usavel: false, efeito: 'remocao_maldicao',
    desc: 'Remove maldições menores. Não gera item físico.',
    invNome: null
  },
  {
    id: 'exorcismo', nome: 'Exorcismo', tipo: 'servico', categoria: 'templo',
    valor: 70, usavel: false, efeito: 'exorcismo',
    desc: 'Expulsa possessões e influências demoníacas menores. Não gera item físico.',
    invNome: null
  },
  {
    id: 'santuario', nome: 'Santuário Protetor', tipo: 'servico', categoria: 'templo',
    valor: 25, usavel: false, efeito: 'santuario',
    desc: 'Refúgio seguro por uma noite (restaura PV/PM e remove fadiga). Não gera item físico.',
    invNome: null
  },
  {
    id: 'ressurreicao', nome: 'Ressurreição', tipo: 'servico', categoria: 'templo',
    valor: 150, usavel: false, efeito: 'ressurreicao',
    desc: 'Traz de volta um personagem morto. Gera cicatriz e dívida com a Igreja (−10 reputação). Não gera item físico.',
    invNome: null
  },
  // 🔴 Casa da Luz Vermelha
  {
    id: 'luz_carinho', nome: 'Companhia Carinhosa', tipo: 'servico', categoria: 'luz',
    valor: 15, usavel: false, efeito: 'luz_carinho',
    desc: 'Uma noite de carinho e conversa. Recupera 1d6 PM e remove status “faminto”/“dormindo”. Descanso leve.',
    invNome: null
  },
  {
    id: 'luz_prazer', nome: 'Noite de Prazer', tipo: 'servico', categoria: 'luz',
    valor: 35, usavel: false, efeito: 'luz_prazer',
    desc: 'Descanso prazeroso completo. Recupera 1d6+R PV e 1d6+H PM. Gasta 1 período. Ânimo restaurado.',
    invNome: null
  },
  {
    id: 'luz_luxo', nome: 'Suíte de Luxo', tipo: 'servico', categoria: 'luz',
    valor: 70, usavel: false, efeito: 'luz_luxo',
    desc: 'Quarto privado, banho e companhia de alto nível. Recupera PV e PM quase por completo. +1 afeto com um NPC romanceável se houver. Status “abençoado” até o próximo descanso longo.',
    invNome: null
  },
  {
    id: 'luz_segredo', nome: 'Segredos de Travesseiro', tipo: 'servico', categoria: 'luz',
    valor: 25, usavel: false, efeito: 'luz_segredo',
    desc: 'Além do prazer, obtém um rumor ou pista local (registre no diário). Recupera 1d6 PM.',
    invNome: null
  }
];

/** Gera uma recompensa concreta (com qtd/ouro resolvidos) */
function gerarRecompensa() {
  const base = RECOMPENSAS[Math.floor(Math.random() * RECOMPENSAS.length)];
  if (base.tipo === 'ouro') {
    const qtd = (base.valorMin || 10) + Math.floor(Math.random() * ((base.valorMax || 50) - (base.valorMin || 10) + 1));
    return { tipo: 'ouro', nome: base.nome, qtd, desc: base.desc + ` (${qtd} Tibar)` };
  }
  return {
    id: 'item_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    nome: base.nome,
    tipo: base.tipo,
    valor: base.valor || 10,
    qtd: 1,
    usavel: !!base.usavel,
    efeito: base.efeito || null,
    desc: base.desc || base.nome
  };
}

/** Adiciona recompensa ao inventário/ouro/XP de um personagem (mutates e salva) */
function concederRecompensaAoPersonagem(charId, recompensa) {
  let list = getSaved();
  const idx = list.findIndex(c => c.id === charId);
  if (idx < 0) return false;
  const c = normalizeCharacter(list[idx]);
  if (recompensa.tipo === 'ouro') {
    creditarOuroComDivida(c, recompensa.qtd || 0);
  } else if (recompensa.tipo === 'xp') {
    c.XP = (c.XP || 0) + (recompensa.qtd || 1);
    convertXpToPoints(c);
  } else {
    // item: empilha se já existe igual
    const existing = (c.inventario || []).find(i => i.nome === recompensa.nome && i.tipo === recompensa.tipo);
    if (existing) {
      existing.qtd = (existing.qtd || 1) + (recompensa.qtd || 1);
    } else {
      c.inventario = c.inventario || [];
      const toAdd = { ...recompensa };
      delete toAdd._extraOuro;
      delete toAdd._extraXp;
      c.inventario.push(toAdd);
    }
  }
  // extras de boss (ouro/xp junto com item)
  if (recompensa._extraOuro) creditarOuroComDivida(c, recompensa._extraOuro);
  if (recompensa._extraXp) {
    c.XP = (c.XP || 0) + recompensa._extraXp;
    convertXpToPoints(c);
  }
  list[idx] = c;
  setSaved(list);
  return true;
}

/** Concede recompensa a todos os membros do grupo selecionado */
function concederRecompensaAoGrupo(recompensa) {
  const ids = getSelectedPartyIds();
  if (ids.length === 0) return [];
  const nomes = [];
  ids.forEach(id => {
    if (concederRecompensaAoPersonagem(id, recompensa)) {
      const c = getSaved().find(x => x.id === id);
      if (c) nomes.push(c.nome);
    }
  });
  return nomes;
}

/* ===== [MERCADO_VENDA] linhas originais 6149-6172 ===== */
/* ---------- Mercado / Venda de Itens ---------- */
function openMarket() {
  let chars = typeof getSelectedPartyChars === 'function' ? getSelectedPartyChars() : [];
  if (!chars.length) {
    // Fallback: todos os personagens salvos (exceto temporários)
    chars = (typeof getSaved === 'function' ? getSaved() : []).filter(c => c && !c.isTemp);
  }
  if (!chars.length) {
    alert('Crie ou selecione pelo menos um herói para abrir o mercado.');
    return;
  }
  const sel = document.getElementById('marketHeroSelect');
  if (!sel) return;
  sel.innerHTML = chars.map(c => `<option value="${c.id}">${esc(c.nome)} (${c.ouro || 0} Tibar)</option>`).join('');
  document.getElementById('marketPanel').classList.remove('hidden');
  switchShopTab('mercado');
  document.getElementById('marketPanel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function closeMarket() {
  document.getElementById('marketPanel').classList.add('hidden');
}


