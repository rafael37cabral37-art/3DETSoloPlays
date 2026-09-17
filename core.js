/* ===== [PRE] linhas originais 1-306 ===== */
const STORE_DB_NAME = '3det_victory_db';
const STORE_DB_VER = 1;
const STORE_STORE = 'kv';

/** Chaves oficiais do jogo */
const KEYS = {
  chars: '3det_victory_chars_v4',
  npcs: '3det_victory_npcs_v1',
  logs: '3det_victory_campaign_logs_v1',
  time: '3det_victory_time_v1',
  cover: '3det_victory_menu_cover_v1',
  oracle: '3det_victory_oracle_v1',
  reputation: '3det_victory_reputation_v1',
  activeMissions: '3det_victory_active_missions_v1',
  servos: '3det_victory_servos_v1',
  capturados: '3det_victory_capturados_v1',
  apostas: '3det_victory_apostas_v1',
  damasMercado: '3det_victory_damas_mercado_v1',
  luzCasa: '3det_victory_luz_casa_v1',
  veuCasa: '3det_victory_veu_casa_v1',
  agenda: '3det_victory_agenda_v1',
  falhas: '3det_victory_falhas_v1',
  marcos: '3det_victory_marcos_v1',
  planilhaRivais: '3det_victory_planilha_rivais_v1'
};

let _idb = null;
let _idbReady = false;
let _idbFailed = false;

function openIdb() {
  return new Promise((resolve, reject) => {
    if (_idbFailed) return reject(new Error('idb unavailable'));
    if (_idb) return resolve(_idb);
    if (!window.indexedDB) {
      _idbFailed = true;
      return reject(new Error('no indexedDB'));
    }
    try {
      const req = indexedDB.open(STORE_DB_NAME, STORE_DB_VER);
      req.onerror = () => { _idbFailed = true; reject(req.error); };
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_STORE)) {
          db.createObjectStore(STORE_STORE);
        }
      };
      req.onsuccess = () => {
        _idb = req.result;
        _idbReady = true;
        _idb.onclose = () => { _idb = null; _idbReady = false; };
        resolve(_idb);
      };
    } catch (err) {
      _idbFailed = true;
      reject(err);
    }
  });
}

function idbGet(key) {
  return openIdb().then(db => new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_STORE, 'readonly');
      const req = tx.objectStore(STORE_STORE).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (e) { reject(e); }
  })).catch(() => undefined);
}

function idbSet(key, value) {
  return openIdb().then(db => new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_STORE, 'readwrite');
      tx.objectStore(STORE_STORE).put(value, key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    } catch (e) { reject(e); }
  })).catch(() => false);
}

function idbDelete(key) {
  return openIdb().then(db => new Promise((resolve, reject) => {
    try {
      const tx = db.transaction(STORE_STORE, 'readwrite');
      tx.objectStore(STORE_STORE).delete(key);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    } catch (e) { reject(e); }
  })).catch(() => false);
}

/** Leitura síncrona: localStorage (cache rápido) */
function storeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return raw;
  } catch (e) {
    return fallback;
  }
}

function storeGetJSON(key, fallback) {
  try {
    const raw = storeGet(key, null);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

/** Escrita: localStorage + espelho IndexedDB */
function storeSet(key, value) {
  const str = typeof value === 'string' ? value : JSON.stringify(value);
  try {
    localStorage.setItem(key, str);
  } catch (e) {
    console.warn('localStorage cheio ou bloqueado:', key, e);
    try {
      // tenta liberar capa se for quota e a chave não for a capa
      if (e && (e.name === 'QuotaExceededError' || e.code === 22) && key !== KEYS.cover) {
        localStorage.removeItem(KEYS.cover);
        localStorage.setItem(key, str);
      } else {
        alert('Espaço de armazenamento cheio. Exporte um backup e limpe dados antigos (ex.: capa).');
        throw e;
      }
    } catch (e2) {
      // ainda assim grava no IDB
    }
  }
  idbSet(key, str);
  return true;
}

function storeRemove(key) {
  try { localStorage.removeItem(key); } catch (e) {}
  idbDelete(key);
}

/** Na inicialização: se IndexedDB tem dados e localStorage está vazio, restaura */
async function hydrateFromIndexedDB() {
  const keys = Object.values(KEYS);
  let restored = 0;
  for (const key of keys) {
    try {
      const lsVal = storeGet(key, null);
      const idbVal = await idbGet(key);
      if (idbVal != null && idbVal !== undefined && idbVal !== '') {
        if (lsVal == null || lsVal === '' || lsVal === '[]' || lsVal === '{}') {
          try {
            localStorage.setItem(key, typeof idbVal === 'string' ? idbVal : JSON.stringify(idbVal));
            restored++;
          } catch (e) {}
        } else {
          // mantém LS como fonte da verdade e re-espelha no IDB
          idbSet(key, lsVal);
        }
      } else if (lsVal != null && lsVal !== '') {
        idbSet(key, lsVal);
      }
    } catch (e) {}
  }
  return restored;
}

async function syncAllToIndexedDB() {
  let n = 0;
  for (const key of Object.values(KEYS)) {
    const v = storeGet(key, null);
    if (v != null) {
      const ok = await idbSet(key, v);
      if (ok) n++;
    }
  }
  return n;
}

function updateStorageStatusUI() {
  const el = document.getElementById('storageStatus');
  if (!el) return;
  let chars = 0, npcs = 0, servos = 0, capt = 0;
  try { chars = (storeGetJSON(KEYS.chars, []) || []).length; } catch (e) {}
  try { npcs = (storeGetJSON(KEYS.npcs, []) || []).length; } catch (e) {}
  try { servos = (storeGetJSON(KEYS.servos, []) || []).length; } catch (e) {}
  try { capt = (storeGetJSON(KEYS.capturados, []) || []).length; } catch (e) {}
  const idbTxt = _idbFailed ? 'IndexedDB indisponível' : (_idbReady ? 'IndexedDB ativo' : 'IndexedDB…');
  el.innerHTML = `Personagens: <strong>${chars}</strong> · NPCs: <strong>${npcs}</strong> · Servos: <strong>${servos}</strong> · Capturados: <strong>${capt}</strong> · ${idbTxt}`;
}

function exportFullBackup() {
  const payload = {
    app: '3DeT Victory Solo RPG',
    version: 2,
    exportedAt: new Date().toISOString(),
    exportedAtLocal: new Date().toLocaleString('pt-BR'),
    data: {
      chars: storeGetJSON(KEYS.chars, []),
      npcs: storeGetJSON(KEYS.npcs, []),
      logs: storeGetJSON(KEYS.logs, {}),
      time: storeGetJSON(KEYS.time, null),
      cover: storeGet(KEYS.cover, null),
      oracle: storeGetJSON(KEYS.oracle, { clocks: [] }),
      reputation: storeGetJSON(KEYS.reputation, null),
      activeMissions: storeGetJSON(KEYS.activeMissions, []),
      servos: storeGetJSON(KEYS.servos, []),
      capturados: storeGetJSON(KEYS.capturados, []),
      apostas: storeGetJSON(KEYS.apostas, null),
      damasMercado: storeGetJSON(KEYS.damasMercado, []),
      luzCasa: storeGetJSON(KEYS.luzCasa, null),
      veuCasa: storeGetJSON(KEYS.veuCasa, null),
      agenda: storeGetJSON(KEYS.agenda, []),
      falhas: storeGetJSON(KEYS.falhas, { lista: [], rivais: [] }),
      marcos: storeGetJSON(KEYS.marcos, null),
      planilhaRivais: storeGetJSON(KEYS.planilhaRivais, null)
    }
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  const stamp = new Date().toISOString().slice(0, 10);
  a.download = `3det_victory_backup_${stamp}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
  alert('Backup completo gerado!\nGuarde o arquivo JSON no celular (Downloads / Arquivos).\nInclui: personagens, NPCs, diário, tempo, capa, oráculo, reputação, missões ativas e servos contratuais.');
}

function importFullBackup(ev) {
  const f = ev.target.files && ev.target.files[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      const payload = JSON.parse(r.result);
      const data = payload.data || payload;
      if (!data || (typeof data !== 'object')) throw new Error('formato');

      const hasAny = data.chars || data.npcs || data.logs || data.time || data.cover || data.oracle || data.reputation || data.activeMissions || data.servos || data.capturados || data.agenda || data.falhas || data.marcos || data.planilhaRivais;
      if (!hasAny) throw new Error('vazio');

      if (!confirm('Restaurar backup completo?\nIsso SUBSTITUI os dados atuais de personagens, NPCs, diário, tempo, capa, oráculo, reputação, missões ativas e servos.')) {
        ev.target.value = '';
        return;
      }

      if (data.chars != null) storeSet(KEYS.chars, data.chars);
      if (data.npcs != null) storeSet(KEYS.npcs, data.npcs);
      if (data.logs != null) storeSet(KEYS.logs, data.logs);
      if (data.time != null) {
        storeSet(KEYS.time, data.time);
        try {
          if (typeof timeState !== 'undefined' && data.time) {
            Object.assign(timeState, data.time);
            if (typeof updateTimeUI === 'function') updateTimeUI();
          }
        } catch (e) {}
      }
      if (data.cover != null) {
        storeSet(KEYS.cover, data.cover);
        if (typeof applyCover === 'function') applyCover(data.cover);
      } else {
        storeRemove(KEYS.cover);
        if (typeof applyCover === 'function') applyCover(null);
      }
      if (data.oracle != null) storeSet(KEYS.oracle, data.oracle);
      if (data.reputation != null) storeSet(KEYS.reputation, data.reputation);
      if (data.activeMissions != null) storeSet(KEYS.activeMissions, data.activeMissions);
      if (data.servos != null) storeSet(KEYS.servos, data.servos);
      if (data.capturados != null) storeSet(KEYS.capturados, data.capturados);
      if (data.apostas != null) storeSet(KEYS.apostas, data.apostas);
      if (data.damasMercado != null) storeSet(KEYS.damasMercado, data.damasMercado);
      if (data.luzCasa != null) storeSet(KEYS.luzCasa, data.luzCasa);
      if (data.veuCasa != null) storeSet(KEYS.veuCasa, data.veuCasa);
      if (data.agenda != null) storeSet(KEYS.agenda, data.agenda);
      if (data.falhas != null) storeSet(KEYS.falhas, data.falhas);
      if (data.marcos != null) storeSet(KEYS.marcos, data.marcos);
      if (data.planilhaRivais != null) storeSet(KEYS.planilhaRivais, data.planilhaRivais);

      updateStorageStatusUI();
      alert('Backup restaurado com sucesso!\nRecarregue as telas (Menu → Personagens / NPCs / Reputação) para ver os dados.');
      if (typeof renderNpcList === 'function') try { renderNpcList(); } catch (e) {}
      if (typeof renderSavedList === 'function') try { renderSavedList(); } catch (e) {}
      if (typeof loadCampaignLog === 'function') try { loadCampaignLog(); } catch (e) {}
      if (typeof renderReputationScreen === 'function') try { renderReputationScreen(); } catch (e) {}
    } catch (err) {
      alert('Arquivo de backup inválido.');
    }
    ev.target.value = '';
  };
  r.readAsText(f);
}

async function syncStorageNow() {
  try {
    const n = await syncAllToIndexedDB();
    _idbReady = !_idbFailed;
    updateStorageStatusUI();
    alert('Sincronizado com IndexedDB: ' + n + ' chave(s).\nIsso ajuda a recuperar dados se o localStorage for limpo.');
  } catch (e) {
    alert('Não foi possível sincronizar o IndexedDB neste navegador.');
  }
}

