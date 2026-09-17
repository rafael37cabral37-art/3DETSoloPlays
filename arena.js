/* ===== [SELECAO_GRUPO] linhas originais 5651-5699 ===== */
/* ---------- Seleção de Grupo (agora por ID) ---------- */
function populateEncounterHeroes() {
  const list = getSaved();
  ['hero1','hero2','hero3','hero4'].forEach((id, idx) => {
    const sel = document.getElementById(id);
    const current = sel.value;
    if (idx === 0) {
      sel.innerHTML = list.length === 0 
        ? '<option value="">— Nenhum personagem salvo —</option>' 
        : '<option value="">— Escolha o Herói 1 —</option>';
    } else {
      sel.innerHTML = '<option value="">(Nenhum)</option>';
    }
    list.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.nome} (P${c.P} H${c.H} R${c.R})`;
      sel.appendChild(opt);
    });
    if (current) sel.value = current;
  });
  initSessionTrackers();
}

function getSelectedPartyIds() {
  let ids = [];
  ['hero1','hero2','hero3','hero4'].forEach(id => {
    let val = document.getElementById(id).value;
    if (val && val.trim() !== '') ids.push(val);
  });
  return ids;
}

function getSelectedPartyNames() {
  const ids = getSelectedPartyIds();
  if (ids.length === 0) return ["Aventureiros Anônimos"];
  const list = getSaved();
  return ids.map(id => {
    const c = list.find(x => x.id === id);
    return c ? c.nome : 'Desconhecido';
  });
}

function getSelectedPartyChars() {
  const ids = getSelectedPartyIds();
  const list = getSaved();
  return ids.map(id => list.find(x => x.id === id)).filter(Boolean);
}

