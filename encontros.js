/* ===== [ENCONTROS] linhas originais 4314-4840 ===== */
/* ==================== ENCONTROS ALEATÓRIOS ==================== */
let totalSessionXp = 0;          // XP já distribuído (banked)
let accumulatedXp = 0;           // XP acumulado aguardando banco
let sessionVictories = 0;        // vitórias atuais
let victoryThreshold = 5;        // meta (3 a 7)
let totalEncounters = 0;         // total de encontros resolvidos
let currentEventDataForLog = null;
let currentSucessos = 0, currentFalhas = 0;
let currentEventType = null;
let currentEnemiesForBattle = [];
let currentAdventureHook = null;
let eventResolved = false;       // evita marcar o mesmo encontro duas vezes

/* Missões estruturadas:
   dias = prazo total | locais = biomas sugeridos
   objetivos: tipo conversar|matar|coletar|escoltar|explorar|entregar
   recompensa base; bônus = dias restantes × 10 ouro + 1 XP se sobrar prazo
*/
const ADVENTURE_HOOKS = [
  { titulo:"O Artefato Roubado", enredo:"Um artefato sagrado foi roubado do templo. Rastreie o ladrão antes do ritual sombrio.", tom:"Investigação / Ação", dias:5, locais:["cidade","esgotos","ruinas"], complexidade:"Média",
    objetivos:[
      {id:"a1", tipo:"conversar", desc:"Conversar com o sacerdote do templo sobre o roubo"},
      {id:"a2", tipo:"conversar", desc:"Interrogar informantes na taverna/cidade"},
      {id:"a3", tipo:"matar", desc:"Derrotar o batedor/ladrão ou seus capangas"},
      {id:"a4", tipo:"coletar", desc:"Recuperar o artefato sagrado"},
      {id:"a5", tipo:"entregar", desc:"Devolver o artefato ao templo"}
    ], recompensa:{xp:4, ouro:80} },
  { titulo:"Resgate na Torre Sombria", enredo:"Um aliado foi sequestrado. Infiltre-se, liberte-o e fuja antes do reforço inimigo.", tom:"Infiltração / Combate", dias:4, locais:["masmorra","ruinas","montanha"], complexidade:"Difícil",
    objetivos:[
      {id:"b1", tipo:"explorar", desc:"Localizar a torre/fortaleza onde o refém está"},
      {id:"b2", tipo:"conversar", desc:"Obter a rotina dos guardas (suborno ou escuta)"},
      {id:"b3", tipo:"matar", desc:"Eliminar os guardas do corredor principal"},
      {id:"b4", tipo:"coletar", desc:"Libertar o refém e levá-lo consigo"},
      {id:"b5", tipo:"escoltar", desc:"Escoltar o refém até local seguro"}
    ], recompensa:{xp:5, ouro:120} },
  { titulo:"A Praga Misteriosa", enredo:"Doença mágica se espalha. Encontre a origem e o antídoto a tempo.", tom:"Investigação / Sobrevivência", dias:6, locais:["cidade","floresta","esgotos"], complexidade:"Média",
    objetivos:[
      {id:"c1", tipo:"conversar", desc:"Falar com o curandeiro/herbalista da região"},
      {id:"c2", tipo:"explorar", desc:"Investigar o foco da praga (poço, esgoto ou bosque)"},
      {id:"c3", tipo:"coletar", desc:"Obter o ingrediente raro do antídoto"},
      {id:"c4", tipo:"matar", desc:"Derrotar a criatura/cultista que espalha a praga"},
      {id:"c5", tipo:"entregar", desc:"Entregar o antídoto à população afetada"}
    ], recompensa:{xp:4, ouro:90} },
  { titulo:"Escolta Perigosa", enredo:"Escolte uma caravana/diplomata por terras hostis até o destino.", tom:"Viagem / Combate", dias:5, locais:["floresta","deserto","montanha","cidade"], complexidade:"Média",
    objetivos:[
      {id:"d1", tipo:"conversar", desc:"Receber o contrato e a rota do contratante"},
      {id:"d2", tipo:"escoltar", desc:"Proteger a caravana no primeiro trecho"},
      {id:"d3", tipo:"matar", desc:"Repelir pelo menos uma emboscada de bandidos/monstros"},
      {id:"d4", tipo:"escoltar", desc:"Chegar com a carga/pessoa intacta ao destino"},
      {id:"d5", tipo:"entregar", desc:"Entregar o relatório e receber o pagamento"}
    ], recompensa:{xp:4, ouro:100} },
  { titulo:"Caçada ao Monstro", enredo:"Uma criatura aterroriza vilarejos. Cace-a e traga prova da morte.", tom:"Caçada / Combate", dias:4, locais:["floresta","montanha","ilhas","deserto"], complexidade:"Difícil",
    objetivos:[
      {id:"e1", tipo:"conversar", desc:"Ouvir sobreviventes e mapear os ataques"},
      {id:"e2", tipo:"explorar", desc:"Rastrear o covil da criatura"},
      {id:"e3", tipo:"matar", desc:"Derrotar o monstro principal"},
      {id:"e4", tipo:"coletar", desc:"Obter prova da morte (presa, cabeça, troféu)"},
      {id:"e5", tipo:"entregar", desc:"Apresentar a prova ao contratante do vilarejo"}
    ], recompensa:{xp:5, ouro:110} },
  { titulo:"O Mapa do Tesouro", enredo:"Um mapa aponta um tesouro. Rivais e guardiões estão no caminho.", tom:"Exploração / Aventura", dias:5, locais:["ruinas","ilhas","deserto","minas"], complexidade:"Média",
    objetivos:[
      {id:"f1", tipo:"conversar", desc:"Decifrar pistas do mapa com um sábio/mercador"},
      {id:"f2", tipo:"explorar", desc:"Chegar ao local marcado no mapa"},
      {id:"f3", tipo:"matar", desc:"Derrotar os guardiões do tesouro"},
      {id:"f4", tipo:"coletar", desc:"Recuperar o tesouro principal"},
      {id:"f5", tipo:"entregar", desc:"Levar o tesouro a um local seguro (ou dividi-lo)"}
    ], recompensa:{xp:4, ouro:150} },
  { titulo:"Conspiração na Corte", enredo:"Trama política: descubra o culpado e impeça o golpe.", tom:"Intriga / Social", dias:5, locais:["cidade","taverna"], complexidade:"Difícil",
    objetivos:[
      {id:"g1", tipo:"conversar", desc:"Obter audiência com um nobre aliado"},
      {id:"g2", tipo:"conversar", desc:"Coletar depoimentos de 2 informantes"},
      {id:"g3", tipo:"coletar", desc:"Obter a prova escrita da conspiração"},
      {id:"g4", tipo:"matar", desc:"Impedir o assassinato/golpe (combate ou exposição)"},
      {id:"g5", tipo:"entregar", desc:"Apresentar as provas às autoridades legítimas"}
    ], recompensa:{xp:5, ouro:100} },
  { titulo:"O Culto das Sombras", enredo:"Um culto prepara um ritual. Infiltre-se e impeça o ápice.", tom:"Horror / Infiltração", dias:4, locais:["esgotos","ruinas","masmorra"], complexidade:"Difícil",
    objetivos:[
      {id:"h1", tipo:"conversar", desc:"Identificar um membro do culto disfarçado"},
      {id:"h2", tipo:"explorar", desc:"Localizar o templo/câmara do ritual"},
      {id:"h3", tipo:"coletar", desc:"Roubar ou destruir o componente do ritual"},
      {id:"h4", tipo:"matar", desc:"Derrotar o líder do culto"},
      {id:"h5", tipo:"entregar", desc:"Selar ou denunciar o local do culto"}
    ], recompensa:{xp:5, ouro:120} },
  { titulo:"Naufrágio e Sobrevivência", enredo:"Presos após desastre. Sobreviva, explore e encontre fuga.", tom:"Sobrevivência / Exploração", dias:6, locais:["ilhas","floresta"], complexidade:"Média",
    objetivos:[
      {id:"i1", tipo:"explorar", desc:"Encontrar abrigo e água potável"},
      {id:"i2", tipo:"coletar", desc:"Reunir suprimentos do naufrágio/região"},
      {id:"i3", tipo:"matar", desc:"Repelir predadores locais"},
      {id:"i4", tipo:"conversar", desc:"Contactar nativos ou outro náufrago"},
      {id:"i5", tipo:"escoltar", desc:"Alcançar um ponto de resgate ou embarcação"}
    ], recompensa:{xp:4, ouro:70} },
  { titulo:"Fuga da Prisão", enredo:"Presos injustamente. Planejem e executem a fuga.", tom:"Furtividade / Ação", dias:3, locais:["masmorra","cidade"], complexidade:"Difícil",
    objetivos:[
      {id:"j1", tipo:"conversar", desc:"Alimentar confiança de um guarda ou prisioneiro útil"},
      {id:"j2", tipo:"coletar", desc:"Obter chave, ferramenta ou mapa da prisão"},
      {id:"j3", tipo:"explorar", desc:"Abrir caminho até a saída (túnel/portão)"},
      {id:"j4", tipo:"matar", desc:"Neutralizar a patrulha no momento da fuga"},
      {id:"j5", tipo:"escoltar", desc:"Todos os alvos da fuga em segurança fora dos muros"}
    ], recompensa:{xp:5, ouro:90} },
  { titulo:"O Portal Instável", enredo:"Portal dimensional ameaça a região. Feche-o antes da invasão total.", tom:"Fantasia / Combate", dias:4, locais:["ruinas","deserto","montanha"], complexidade:"Épica",
    objetivos:[
      {id:"k1", tipo:"conversar", desc:"Consultar um mago/sábio sobre o portal"},
      {id:"k2", tipo:"coletar", desc:"Reunir 2 componentes para o selo"},
      {id:"k3", tipo:"explorar", desc:"Chegar ao portal em atividade"},
      {id:"k4", tipo:"matar", desc:"Derrotar a vanguarda que sai do portal"},
      {id:"k5", tipo:"entregar", desc:"Ativar o selo e fechar o portal"}
    ], recompensa:{xp:6, ouro:140} },
  { titulo:"Escolta do Diplomata", enredo:"Um emissário precisa cruzar território hostil para assinar a paz.", tom:"Viagem / Social", dias:4, locais:["cidade","floresta","montanha"], complexidade:"Média",
    objetivos:[
      {id:"l1", tipo:"conversar", desc:"Receber as ordens e o itinerário do emissário"},
      {id:"l2", tipo:"escoltar", desc:"Proteger o diplomata no caminho"},
      {id:"l3", tipo:"matar", desc:"Impedir atentado de sabotaores"},
      {id:"l4", tipo:"conversar", desc:"Mediar tensão em um posto de fronteira"},
      {id:"l5", tipo:"entregar", desc:"Entregar o emissário vivo no local da assinatura"}
    ], recompensa:{xp:4, ouro:100} },
  { titulo:"O Testamento Perdido", enredo:"Documento que muda o poder da região. Encontre-o antes dos rivais.", tom:"Investigação / Política", dias:5, locais:["cidade","ruinas","taverna"], complexidade:"Média",
    objetivos:[
      {id:"m1", tipo:"conversar", desc:"Falar com o tabelião/herdeiro legítimo"},
      {id:"m2", tipo:"explorar", desc:"Vasculhar o local onde o testamento foi visto pela última vez"},
      {id:"m3", tipo:"matar", desc:"Impedir os agentes rivais de destruí-lo"},
      {id:"m4", tipo:"coletar", desc:"Obter o testamento intacto"},
      {id:"m5", tipo:"entregar", desc:"Entregar o documento à autoridade correta"}
    ], recompensa:{xp:4, ouro:95} },
  { titulo:"A Última Esperança", enredo:"Invasão iminente. Organize a defesa e segure a linha.", tom:"Guerra / Heroísmo", dias:3, locais:["cidade","montanha","floresta"], complexidade:"Épica",
    objetivos:[
      {id:"n1", tipo:"conversar", desc:"Convencer milícia/aliados a lutar"},
      {id:"n2", tipo:"coletar", desc:"Reunir armas e suprimentos de defesa"},
      {id:"n3", tipo:"explorar", desc:"Fortificar o ponto estratégico"},
      {id:"n4", tipo:"matar", desc:"Repelir a primeira onda inimiga"},
      {id:"n5", tipo:"matar", desc:"Derrotar o comandante da invasão"}
    ], recompensa:{xp:6, ouro:130} },
  { titulo:"Caçadores de Recompensa", enredo:"Há preço pela cabeça do grupo. Sobreviva e limpe o nome — ou elimine quem persegue.", tom:"Perseguição / Sobrevivência", dias:4, locais:["cidade","taverna","floresta"], complexidade:"Difícil",
    objetivos:[
      {id:"o1", tipo:"conversar", desc:"Descobrir quem pagou a recompensa"},
      {id:"o2", tipo:"explorar", desc:"Evitar ou desarmar uma emboscada"},
      {id:"o3", tipo:"matar", desc:"Derrotar um grupo de caçadores"},
      {id:"o4", tipo:"coletar", desc:"Obter prova de inocência ou o contrato original"},
      {id:"o5", tipo:"entregar", desc:"Anular a recompensa perante a guilda/autoridade"}
    ], recompensa:{xp:5, ouro:110} },
  { titulo:"O Último Dragão", enredo:"Rumores de um dragão nos picos. Mate, negocie ou roube o tesouro — mas decida a tempo.", tom:"Épico / Exploração", dias:6, locais:["montanha","minas","ruinas"], complexidade:"Épica",
    objetivos:[
      {id:"p1", tipo:"conversar", desc:"Ouvir testemunhas nos vilarejos de montanha"},
      {id:"p2", tipo:"explorar", desc:"Localizar o covil do dragão"},
      {id:"p3", tipo:"coletar", desc:"Obter um item/relíquia ligada ao dragão"},
      {id:"p4", tipo:"matar", desc:"Enfrentar o dragão (ou seu campeão)"},
      {id:"p5", tipo:"entregar", desc:"Levar o desfecho (troféu, pacto ou tesouro) de volta à civilização"}
    ], recompensa:{xp:7, ouro:200} },
  { titulo:"Mercadoria Amaldiçoada", enredo:"Uma carga amaldiçoada precisa ser levada e desarmada antes de contaminar a cidade.", tom:"Escolta / Sobrenatural", dias:3, locais:["cidade","esgotos","floresta"], complexidade:"Média",
    objetivos:[
      {id:"q1", tipo:"conversar", desc:"Receber a carga e o aviso do mercador"},
      {id:"q2", tipo:"escoltar", desc:"Transportar a carga sem abri-la"},
      {id:"q3", tipo:"matar", desc:"Repelir quem tenta roubar a mercadoria"},
      {id:"q4", tipo:"explorar", desc:"Levar ao local de descarte/sacerdote"},
      {id:"q5", tipo:"entregar", desc:"Neutralizar a maldição com o ritual correto"}
    ], recompensa:{xp:4, ouro:85} },
  { titulo:"A Cidade Fantasma", enredo:"Uma cidade sumiu ou foi amaldiçoada. Descubra o que aconteceu e reverta se puder.", tom:"Mistério / Horror", dias:5, locais:["ruinas","cidade","deserto"], complexidade:"Difícil",
    objetivos:[
      {id:"r1", tipo:"explorar", desc:"Entrar na cidade fantasma e mapear o centro"},
      {id:"r2", tipo:"conversar", desc:"Contactar um espírito ou sobrevivente"},
      {id:"r3", tipo:"coletar", desc:"Recuperar o objeto que ancora a maldição"},
      {id:"r4", tipo:"matar", desc:"Derrotar a entidade que sustenta a maldição"},
      {id:"r5", tipo:"entregar", desc:"Quebrar o ancoradouro e sair com evidências"}
    ], recompensa:{xp:5, ouro:120} }
];


/* Formato novo de encontro:
   { tipo:'teste'|'combate'|'boss', titulo, desc, testes:[{attr,meta,desc}], inimigos:[{nome,P,H,R,qtd}], recompensa:{...} }
   attr = 'P'|'H'|'R'  meta = 6|9|12|15
*/
const BIOMAS = {
  taverna: {
    // Formato NOVO: lista unificada de 30 encontros
    encontros: [
      { tipo:'teste', titulo:'Discussão de Salão', desc:'Um freguês esbarra na sua mesa e quer brigar.', testes:[{attr:'P',meta:7,desc:'Intimidar (Poder/Social)'},{attr:'H',meta:7,desc:'Apaziguar (Habilidade/Social)'}], recompensa:{tipo:'xp', qtd:1, nome:'+1 XP (respeito da taverna)'} },
      { tipo:'teste', titulo:'Jogatina de Dados Viciados', desc:'A aposta é alta na mesa ao lado.', testes:[{attr:'H',meta:7,desc:'Notar a tramoia (Habilidade/Mental)'},{attr:'H',meta:9,desc:'Blefar e vencer (Habilidade/Social)'}], recompensa:{tipo:'ouro', qtd:25, nome:'Ganho na mesa'} },
      { tipo:'teste', titulo:'Bêbado Pegajoso', desc:'Um nobre embriagado insiste em pagar rodadas e abraçar o grupo.', testes:[{attr:'R',meta:5,desc:'Aturar sem perder a paciência (Resistência/Social)'}], recompensa:{tipo:'ouro', qtd:15, nome:'Rodadas pagas pelo nobre'} },
      { tipo:'teste', titulo:'Combate de Braço', desc:'Desafio de força no balcão.', testes:[{attr:'P',meta:7,desc:'Vencer o brutamontes (Poder/Físico)'}], recompensa:{tipo:'ouro', qtd:20, nome:'Prêmio da aposta'} },
      { tipo:'teste', titulo:'Comida Estragada', desc:'O ensopado da estalagem estava rançoso.', testes:[{attr:'R',meta:7,desc:'Não contrair intoxicação (Resistência/Físico)'}], recompensa:{tipo:'xp', qtd:1, nome:'+1 XP (estômago de ferro)'} },
      { tipo:'teste', titulo:'Batedor de Carteira Ágil', desc:'Alguém tenta furtar suas moedas na multidão.', testes:[{attr:'H',meta:7,desc:'Agarrar o ladrão no flagra (Habilidade/Físico)'}], recompensa:{tipo:'ouro', qtd:30, nome:'Bolsa recuperada do ladrão'} },
      { tipo:'teste', titulo:'Fofoca Valiosa', desc:'Ouvir segredos comerciais ou sobre dungeons locais.', testes:[{attr:'H',meta:5,desc:'Extrair a informação (Habilidade/Social)'}], recompensa:{tipo:'xp', qtd:1, nome:'+1 XP (informação útil)'} },
      { tipo:'teste', titulo:'Duelo de Poesia/Insultos', desc:'Trova ofensiva direcionada ao grupo.', testes:[{attr:'P',meta:7,desc:'Contra-argumentar à altura (Poder/Mental)'}], recompensa:{tipo:'xp', qtd:1, nome:'+1 XP (respeito da taverna)'} },
      { tipo:'teste', titulo:'Incêndio na Cozinha', desc:'Uma panela de óleo pega fogo perto do estoque de bebida.', testes:[{attr:'H',meta:7,desc:'Abafar o fogo a tempo (Habilidade/Físico)'}], recompensa:{tipo:'item', nome:'Frasco de Óleo', valor:10, desc:'Óleo inflamável recuperado'} },
      { tipo:'teste', titulo:'Aposta de Corrida de Ratos', desc:'Ratos treinados pelo taverneiro.', testes:[{attr:'H',meta:5,desc:'Escolher o vencedor e lucrar (Habilidade/Mental)'}], recompensa:{tipo:'ouro', qtd:18, nome:'Lucro na corrida'} },
      { tipo:'teste', titulo:'Mercador de Relíquias Falsas', desc:'Um trambiqueiro vende um "mapa do tesouro".', testes:[{attr:'H',meta:7,desc:'Verificar autenticidade (Habilidade/Mental)'}], recompensa:{tipo:'item', nome:'Mapa Duvidoso', valor:5, desc:'Pode ser real... ou não'} },
      { tipo:'teste', titulo:'Boato de Inquisição', desc:'Guardas corruptos chegam revistando forasteiros.', testes:[{attr:'R',meta:7,desc:'Manter a calma sob interrogatório (Resistência/Mental)'}], recompensa:{tipo:'xp', qtd:1, nome:'+1 XP (sangue-frio)'} },
      { tipo:'teste', titulo:'Bandidagem Disfarçada', desc:'Mercenários avaliam o grupo de canto.', testes:[{attr:'H',meta:9,desc:'Perceber a emboscada (Habilidade/Social)'}], recompensa:{tipo:'xp', qtd:1, nome:'+1 XP (vigilância)'} },
      { tipo:'combate', titulo:'Bêbados Valentes', desc:'Combate direto de taberna.', inimigos:[{nome:'Bêbado Valente',P:4,H:4,R:3,qtd:2}], recompensa:{tipo:'ouro', qtd:15, nome:'Moedas caídas na briga'} },
      { tipo:'teste', titulo:'Canção Contagiante', desc:'O bardo toca uma melodia mágica que induz ao sono.', testes:[{attr:'R',meta:7,desc:'Resistir ao transe (Resistência/Mental)'}], recompensa:{tipo:'xp', qtd:1, nome:'+1 XP (vontade firme)'} },
      { tipo:'teste', titulo:'Praga de Insetos na Dispensa', desc:'Baratas gigantes invadem a área de comida.', testes:[{attr:'P',meta:5,desc:'Esmagá-las rapidamente (Poder/Físico)'}], recompensa:{tipo:'item', nome:'Suprimentos Salvos', valor:12, desc:'Comida recuperada da dispensa'} },
      { tipo:'teste', titulo:'Cobrador de Impostos Abusivo', desc:'Exige taxa extra para forasteiros.', testes:[{attr:'P',meta:9,desc:'Pechinchar ou impor respeito (Poder/Social)'}], recompensa:{tipo:'ouro', qtd:20, nome:'Taxa evitada / devolvida'} },
      { tipo:'combate', titulo:'Batedor de Carteira', desc:'Combate rápido contra um gatuno furtivo.', inimigos:[{nome:'Batedor de Carteira',P:3,H:6,R:2,qtd:1}], recompensa:{tipo:'ouro', qtd:28, nome:'Bolsa do gatuno'} },
      { tipo:'teste', titulo:'Briga Geral', desc:'A taverna inteira entra em conflito generalizado.', testes:[{attr:'H',meta:7,desc:'Desviar de móveis e socos (Habilidade/Físico)'}], recompensa:{tipo:'xp', qtd:1, nome:'+1 XP (sobreviver ao caos)'} },
      { tipo:'teste', titulo:'Mensageiro Secreto', desc:'Alguém deixa um bilhete cifrado na sua mesa.', testes:[{attr:'H',meta:9,desc:'Decodificar a mensagem (Habilidade/Mental)'}], recompensa:{tipo:'item', nome:'Bilhete Cifrado', valor:15, desc:'Informação valiosa decifrada'} },
      { tipo:'teste', titulo:'Vítima de Hipnose', desc:'Um cliente está enfeitiçado e ameaça se ferir.', testes:[{attr:'R',meta:7,desc:'Quebrar o efeito psíquico (Resistência/Mental)'}], recompensa:{tipo:'xp', qtd:1, nome:'+1 XP (ajuda prestada)'} },
      { tipo:'combate', titulo:'Elementar de Cerveja', desc:'Uma massa animada de espuma e álcool ácido.', inimigos:[{nome:'Elementar de Cerveja',P:6,H:3,R:5,qtd:1}], recompensa:{tipo:'item', nome:'Caneca Encantada', valor:25, desc:'Caneca que nunca esvazia de verdade... quase'} },
      { tipo:'teste', titulo:'Porta Trancada do Quarto', desc:'A chave sumiu e há pressa para entrar.', testes:[{attr:'P',meta:7,desc:'Arrombar a madeira (Poder/Físico)'}], recompensa:{tipo:'xp', qtd:1, nome:'+1 XP (entrada forçada)'} },
      { tipo:'teste', titulo:'Assédio de Criatura Mágica Menor', desc:'Um duende invisível rouba talheres.', testes:[{attr:'H',meta:7,desc:'Capturar o pestinha (Habilidade/Físico)'}], recompensa:{tipo:'item', nome:'Talheres de Prata', valor:20, desc:'Talheres recuperados do duende'} },
      { tipo:'teste', titulo:'Dívida de Jogo Herdada', desc:'Um cobrador alega que o grupo assumiu a dívida de um finado.', testes:[{attr:'H',meta:9,desc:'Reverter a situação na lábia (Habilidade/Social)'}], recompensa:{tipo:'xp', qtd:1, nome:'+1 XP (lábia afiada)'} },
      { tipo:'teste', titulo:'Vazamento de Gás Místico', desc:'O caldeirão de poções da estalagem racha no porão.', testes:[{attr:'R',meta:9,desc:'Não desmaiar com os vapores (Resistência/Físico)'}], recompensa:{tipo:'item', nome:'Poção Instável', valor:30, desc:'Resíduo do caldeirão — use com cuidado'} },
      { tipo:'combate', titulo:'Capangas de Aluguel', desc:'Sicários profissionais aguardam na saída traseira.', inimigos:[{nome:'Capanga de Aluguel',P:6,H:5,R:5,qtd:2}], recompensa:{tipo:'ouro', qtd:40, nome:'Pagamento dos capangas'} },
      { tipo:'teste', titulo:'Desabamento de Teto Parcial', desc:'Vigas podres cedem na área comum.', testes:[{attr:'H',meta:7,desc:'Saltar para longe dos escombros (Habilidade/Físico)'}], recompensa:{tipo:'xp', qtd:1, nome:'+1 XP (reflexos)'} },
      { tipo:'teste', titulo:'Proposta Imoral', desc:'Um nobre mascarado oferece ouro por um assassinato a sangue-frio.', testes:[{attr:'R',meta:9,desc:'Recusar sem gerar inimigos mortais (Resistência/Social)'}], recompensa:{tipo:'xp', qtd:1, nome:'+1 XP (integridade)'} },
      { tipo:'boss', titulo:'O Estalajadeiro Mimic', desc:'A taverna inteira ganha vida. O estabelecimento original foi devorado por um monstro colossal disfarçado de estalajadeiro.', inimigos:[{nome:'Estalajadeiro Mimic',P:9,H:6,R:10,qtd:1}], recompensa:{tipo:'mista', ouro:200, xp:5, item:{nome:'Chave-Mestra da Estalagem', valor:80, desc:'Abre qualquer porta da região'}} }
    ],
  },

  cidade: {
    encontros: [
      { tipo:'teste', titulo:'Multidão Apressada', desc:'Um tumulto na feira separa o grupo.', testes:[{attr:'H',meta:5,desc:'Navegar pelas barracas (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (orientação urbana)'} },
      { tipo:'teste', titulo:'Queda de Carga Pesada', desc:'Um carrinho de ferro com barris despenca ladeira abaixo.', testes:[{attr:'P',meta:7,desc:'Segurar o impacto (Poder/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (força bruta)'} },
      { tipo:'teste', titulo:'Golpe do Camelo', desc:'Vendedor empurra poções falsificadas de cura.', testes:[{attr:'H',meta:7,desc:'Notar a fraude química (Habilidade/Mental)'}], recompensa:{tipo:'item',nome:'Poção Falsa Identificada',valor:5,desc:'Evidência de fraude'} },
      { tipo:'combate', titulo:'Ladrões de Rua', desc:'Abordagem violenta em beco estreito.', inimigos:[{nome:'Ladrão de Rua',P:4,H:6,R:3,qtd:2}], recompensa:{tipo:'ouro',qtd:25,nome:'Bolsa dos ladrões'} },
      { tipo:'teste', titulo:'Inspeção de Guarda', desc:'Patrulha exige suborno arbitrário.', testes:[{attr:'H',meta:7,desc:'Subornar sutilmente (Habilidade/Social)'},{attr:'P',meta:9,desc:'Intimidar a patrulha (Poder/Social)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (lidou com a guarda)'} },
      { tipo:'teste', titulo:'Protesto Político', desc:'Manifestantes bloqueiam a praça central.', testes:[{attr:'R',meta:7,desc:'Atravessar pacificamente (Resistência/Social)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (diplomacia de rua)'} },
      { tipo:'teste', titulo:'Animal Fugitivo', desc:'Um javali de carga enlouquece no mercado.', testes:[{attr:'H',meta:7,desc:'Laçar o animal (Habilidade/Físico)'}], recompensa:{tipo:'ouro',qtd:20,nome:'Recompensa do dono'} },
      { tipo:'combate', titulo:'Guardas Corruptos', desc:'Milicianos armados até os dentes.', inimigos:[{nome:'Guarda Corrupto',P:6,H:5,R:6,qtd:2}], recompensa:{tipo:'ouro',qtd:35,nome:'Suborno recuperado'} },
      { tipo:'teste', titulo:'Furto de Símbolo Sagrado', desc:'Acusação falsa de roubo de um templo local.', testes:[{attr:'H',meta:9,desc:'Provar inocência (Habilidade/Social)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (oratória)'} },
      { tipo:'teste', titulo:'Desmoronamento de Andaime', desc:'Obras na catedral atingem a rua.', testes:[{attr:'H',meta:7,desc:'Desviar dos tijolos (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (reflexos)'} },
      { tipo:'combate', titulo:'Assassinos de Guilda', desc:'Alvos de um contrato profissional nos telhados.', inimigos:[{nome:'Assassino de Guilda',P:7,H:8,R:5,qtd:2}], recompensa:{tipo:'ouro',qtd:50,nome:'Contrato dos assassinos'} },
      { tipo:'teste', titulo:'Inalação de Fumaça de Fundição', desc:'Poluição intensa nos distritos industriais.', testes:[{attr:'R',meta:7,desc:'Manter o fôlego (Resistência/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (pulmões de ferro)'} },
      { tipo:'teste', titulo:'Propaganda Subversiva', desc:'Panfletos revolucionários jogados nos bolsos dos heróis.', testes:[{attr:'H',meta:5,desc:'Esconder os papéis (Habilidade/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (discrição)'} },
      { tipo:'combate', titulo:'Cães de Guarda de Elite', desc:'Mastodontes caninos blindados.', inimigos:[{nome:'Cão de Guarda de Elite',P:6,H:6,R:6,qtd:2}], recompensa:{tipo:'item',nome:'Coleira Blindada',valor:25,desc:'Coleira de cão de elite'} },
      { tipo:'teste', titulo:'Negociação com Guilda de Comércio', desc:'Contrato de escolta lucrativo, mas arriscado.', testes:[{attr:'H',meta:9,desc:'Negociar melhores termos (Habilidade/Social)'}], recompensa:{tipo:'ouro',qtd:60,nome:'Adiantamento do contrato'} },
      { tipo:'combate', titulo:'Fanáticos Religiosos', desc:'Pregadores agressivos cercam o grupo.', inimigos:[{nome:'Fanático Religioso',P:5,H:4,R:6,qtd:3}], recompensa:{tipo:'item',nome:'Símbolo Sagrado',valor:20,desc:'Medalha religiosa'} },
      { tipo:'teste', titulo:'Armadilha de Esgoto Aberto', desc:'Bueiro destampado coberto por lixo na via pública.', testes:[{attr:'H',meta:5,desc:'Evitar a queda (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (atenção)'} },
      { tipo:'teste', titulo:'Chantagem de Informante', desc:'Um mendigo cobra caro por dados da nobreza.', testes:[{attr:'H',meta:7,desc:'Barganhar o preço (Habilidade/Social)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (informação)'} },
      { tipo:'teste', titulo:'Batalha de Falsificadores', desc:'Policiais cercam uma tipografia clandestina onde o grupo está.', testes:[{attr:'H',meta:9,desc:'Escapar pelos telhados (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (fuga urbana)'} },
      { tipo:'teste', titulo:'Surto de Pânico Coletivo', desc:'Boato de invasão gera correria desenfreada.', testes:[{attr:'R',meta:7,desc:'Não ser pisoteado (Resistência/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (manter a calma)'} },
      { tipo:'teste', titulo:'Interrogatório Inesperado', desc:'Guardas especiais bloqueiam os portões da cidade.', testes:[{attr:'R',meta:9,desc:'Manter álibis perfeitos (Resistência/Social)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (álibi sólido)'} },
      { tipo:'combate', titulo:'Vigarista de Elite', desc:'Mágico de rua que furta itens mágicos.', inimigos:[{nome:'Vigarista de Elite',P:4,H:9,R:4,qtd:1}], recompensa:{tipo:'item',nome:'Anel Furtado Recuperado',valor:45,desc:'Anel mágico menor'} },
      { tipo:'teste', titulo:'Desfile Real', desc:'A carruagem do rei passa e exige reverência absoluta.', testes:[{attr:'R',meta:5,desc:'Curvar-se no tempo certo (Resistência/Social)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (etiqueta)'} },
      { tipo:'teste', titulo:'Tóxico em Fonte Pública', desc:'Água envenenada por cultistas.', testes:[{attr:'R',meta:9,desc:'Purificar o organismo (Resistência/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (resistência a veneno)'} },
      { tipo:'combate', titulo:'Gárgula Urbana', desc:'Estátua animada que protege torres do governo.', inimigos:[{nome:'Gárgula Urbana',P:8,H:4,R:9,qtd:1}], recompensa:{tipo:'item',nome:'Fragmento de Pedra Mágica',valor:40,desc:'Fragmento de gárgula'} },
      { tipo:'teste', titulo:'Desabamento de Ponte de Pedra', desc:'Arco histórico racha no canal da cidade.', testes:[{attr:'H',meta:9,desc:'Saltar para a margem (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (salto preciso)'} },
      { tipo:'teste', titulo:'Falso Testemunho', desc:'Uma testemunha corrompida aponta o grupo como criminosos.', testes:[{attr:'P',meta:9,desc:'Desmascarar o mentiroso (Poder/Social)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (oratória)'} },
      { tipo:'combate', titulo:'Sicários de Alvenaria', desc:'Mercenários urbanos em emboscada em beco cego.', inimigos:[{nome:'Sicário de Alvenaria',P:7,H:6,R:7,qtd:2}], recompensa:{tipo:'ouro',qtd:45,nome:'Moedas de prata'} },
      { tipo:'teste', titulo:'Enigma de Alquimista Louco', desc:'Portão mágico tranca a saída de uma praça comercial.', testes:[{attr:'H',meta:9,desc:'Resolver a charada alquímica (Habilidade/Mental)'}], recompensa:{tipo:'item',nome:'Poção de Pequena Cura',valor:25,desc:'Poção de cura menor'} },
      { tipo:'boss', titulo:'O Magistrado Sombra', desc:'O governante corrupto revela sua verdadeira face monstruosa. Controla o submundo da metrópole.', inimigos:[{nome:'Magistrado Sombra',P:10,H:9,R:11,qtd:1}], recompensa:{tipo:'mista',ouro:300,xp:5,item:{nome:'Capa da Discrição',valor:120,desc:'Capa que facilita furtividade urbana'}} }
    ],
  },

  esgotos: {
    encontros: [
      { tipo:'teste', titulo:'Lodo Corrosivo', desc:'Gotas ácidas pingam do teto abobadado.', testes:[{attr:'H',meta:7,desc:'Desviar das poças (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (reflexos)'} },
      { tipo:'combate', titulo:'Ratos Gigantes', desc:'Enxame de roedores ferozes.', inimigos:[{nome:'Rato Gigante',P:4,H:6,R:3,qtd:3}], recompensa:{tipo:'item',nome:'Peles de Roedor',valor:10,desc:'5 peles rústicas'} },
      { tipo:'teste', titulo:'Ponte de Pedra Esvaziada', desc:'Travessia sobre canal de esgoto com vigas quebradas.', testes:[{attr:'H',meta:7,desc:'Cruzar equilibrando-se (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (equilíbrio)'} },
      { tipo:'teste', titulo:'Vapor Tóxico', desc:'Bolsão de gás metano nas tubulações antigas.', testes:[{attr:'R',meta:9,desc:'Não desmaiar (Resistência/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (pulmões de ferro)'} },
      { tipo:'combate', titulo:'Gosmas Ácidas', desc:'Massas gelatinosas transparentes e devoradoras.', inimigos:[{nome:'Gosma Ácida',P:6,H:3,R:8,qtd:2}], recompensa:{tipo:'item',nome:'Núcleo Gelatinoso',valor:35,desc:'Reagente alquímico'} },
      { tipo:'teste', titulo:'Mecanismo de Comporta Enferrujado', desc:'Abrir a comporta para drenar o caminho.', testes:[{attr:'P',meta:7,desc:'Girar a roda de ferro (Poder/Físico)'}], recompensa:{tipo:'item',nome:'Engrenagem de Bronze',valor:20,desc:'Peça antiga'} },
      { tipo:'combate', titulo:'Homens-Rato', desc:'Bandidos mutantes das profundezas.', inimigos:[{nome:'Homem-Rato',P:5,H:7,R:5,qtd:2}], recompensa:{tipo:'ouro',qtd:22,nome:'Moedas sujas de lodo'} },
      { tipo:'teste', titulo:'Ataque de Sanguessugas Gigantes', desc:'Água contaminada oculta parasitas.', testes:[{attr:'H',meta:7,desc:'Retirá-las a tempo (Habilidade/Físico)'}], recompensa:{tipo:'item',nome:'Frasco de Sangue de Monstro',valor:15,desc:'Reagente'} },
      { tipo:'teste', titulo:'Armadilha de Lâmina no Lodo', desc:'Fios invisíveis acionam guilhotinas subterrâneas.', testes:[{attr:'H',meta:9,desc:'Notar o gatilho (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (percepção)'} },
      { tipo:'teste', titulo:'Eco Desorientador', desc:'Túneis circulares criam ilusões auditivas.', testes:[{attr:'R',meta:7,desc:'Não seguir o som errado (Resistência/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (foco mental)'} },
      { tipo:'combate', titulo:'Cultistas do Lodo', desc:'Fanáticos adoradores de deuses da decomposição.', inimigos:[{nome:'Cultista do Lodo',P:6,H:5,R:7,qtd:2}], recompensa:{tipo:'item',nome:'Adaga Ritualística de Osso',valor:30,desc:'Adaga entalhada'} },
      { tipo:'teste', titulo:'Inundação Repentina', desc:'Esgotos superiores liberam dejetos em onda.', testes:[{attr:'H',meta:9,desc:'Nadar contra a correnteza (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (natação)'} },
      { tipo:'teste', titulo:'Esqueleto Afogado', desc:'Restos de aventureiro com itens presos em grade.', testes:[{attr:'P',meta:5,desc:'Entortar as barras (Poder/Físico)'}], recompensa:{tipo:'item',nome:'Anel de Prata com Sinete',valor:50,desc:'Anel antigo'} },
      { tipo:'combate', titulo:'Insetos Parasitas', desc:'Besouros necrófagos do tamanho de escudos.', inimigos:[{nome:'Besouro Parasita',P:5,H:5,R:5,qtd:3}], recompensa:{tipo:'item',nome:'Carapaças Quitinosas',valor:15,desc:'4 carapaças'} },
      { tipo:'teste', titulo:'Inscrição Misteriosa', desc:'Códigos antigos indicando rotas seguras.', testes:[{attr:'H',meta:7,desc:'Decifrar os símbolos (Habilidade/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (runas)'} },
      { tipo:'combate', titulo:'Crocodilo de Esgoto', desc:'Répteis mutantes gigantescos.', inimigos:[{nome:'Crocodilo de Esgoto',P:8,H:4,R:8,qtd:1}], recompensa:{tipo:'item',nome:'Couro de Réptil',valor:40,desc:'Couro espesso'} },
      { tipo:'teste', titulo:'Desabamento de Túnel', desc:'Pedras bloqueiam o caminho de volta.', testes:[{attr:'P',meta:9,desc:'Abrir passagem (Poder/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (força)'} },
      { tipo:'teste', titulo:'Gás Alucinógeno', desc:'Fungos liberam esporos que distorcem a realidade.', testes:[{attr:'R',meta:9,desc:'Repelir as visões (Resistência/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (resistência psíquica)'} },
      { tipo:'combate', titulo:'Zumbis Afogados', desc:'Cadáveres reanimados pela umidade fétida.', inimigos:[{nome:'Zumbi Afogado',P:6,H:3,R:7,qtd:3}], recompensa:{tipo:'item',nome:'Joia Empoeirada',valor:45,desc:'Joia do lodo'} },
      { tipo:'teste', titulo:'Negociação com Mercador do Submundo', desc:'Um pária vende itens raros achados no lixo nobre.', testes:[{attr:'H',meta:7,desc:'Pechinchar sem insultá-lo (Habilidade/Social)'}], recompensa:{tipo:'item',nome:'Adaga de Arremesso',valor:20,desc:'Adaga envenenada leve'} },
      { tipo:'combate', titulo:'Centopeias Venenosas', desc:'Insetos de dezenas de patas com ferrões letais.', inimigos:[{nome:'Centopeia Venenosa',P:4,H:7,R:4,qtd:2}], recompensa:{tipo:'item',nome:'Glândulas de Veneno',valor:20,desc:'2 glândulas'} },
      { tipo:'teste', titulo:'Areia Movediça de Lodo', desc:'Lamaçal profundo que suga os passos.', testes:[{attr:'H',meta:7,desc:'Puxar os colegas (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (trabalho em equipe)'} },
      { tipo:'teste', titulo:'Porta Secreta Hidráulica', desc:'Enigma hidráulico para acessar covil secreto.', testes:[{attr:'H',meta:9,desc:'Alinhar os fluxos de água (Habilidade/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (lógica mecânica)'} },
      { tipo:'combate', titulo:'Prole de Lodo', desc:'Mini-chefes gelatinosos divididos.', inimigos:[{nome:'Prole de Lodo',P:7,H:4,R:6,qtd:2}], recompensa:{tipo:'item',nome:'Frasco de Ácido Estável',valor:30,desc:'Item de ataque leve'} },
      { tipo:'teste', titulo:'Pressão Psicológica da Escuridão', desc:'O isolamento e o fedor afetam a mente.', testes:[{attr:'R',meta:7,desc:'Manter a coragem (Resistência/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (resiliência)'} },
      { tipo:'combate', titulo:'Espectro do Esgoto', desc:'Alma penada de prisioneiros afogados.', inimigos:[{nome:'Espectro do Esgoto',P:6,H:7,R:6,qtd:1}], recompensa:{tipo:'item',nome:'Essência Ectoplásmica',valor:40,desc:'Essência espectral'} },
      { tipo:'teste', titulo:'Alçapão Falso', desc:'Piso apodrecido cede sob o peso do grupo.', testes:[{attr:'H',meta:9,desc:'Agarrar-se à borda (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (agarre)'} },
      { tipo:'combate', titulo:'Enxame de Morcegos Vampiros', desc:'Criaturas aladas cegas pelo escuro.', inimigos:[{nome:'Morcego Vampiro',P:4,H:8,R:4,qtd:4}], recompensa:{tipo:'item',nome:'Asas de Morcego',valor:10,desc:'2 asas preservadas'} },
      { tipo:'teste', titulo:'Correnteza Elétrica Subterrânea', desc:'Fios desencapados em poça energizada por magia antiga.', testes:[{attr:'R',meta:9,desc:'Resistir ao choque (Resistência/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (isolamento)'} },
      { tipo:'boss', titulo:'O Rei dos Vermes', desc:'Amalgama gigantesca de carniça e consciência coletiva dos esgotos.', inimigos:[{nome:'Rei dos Vermes',P:11,H:6,R:12,qtd:1}], recompensa:{tipo:'mista',ouro:250,xp:5,item:{nome:'Amuleto de Resistência a Venenos',valor:90,desc:'Proteção contra toxinas'}} }
    ],
  },

  ruinas: {
    encontros: [
      { tipo:'teste', titulo:'Laje com Armadilha de Pressão', desc:'O piso afunda ao toque.', testes:[{attr:'H',meta:7,desc:'Saltar fora da zona de dardos (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (acrobacia)'} },
      { tipo:'combate', titulo:'Esqueletos Guerreiros', desc:'Patrulha óssea ancestral.', inimigos:[{nome:'Esqueleto Guerreiro',P:5,H:5,R:5,qtd:3}], recompensa:{tipo:'item',nome:'Espada Curta Antiga',valor:15,desc:'Ferrugenta mas vendável'} },
      { tipo:'teste', titulo:'Estátua com Enigma', desc:'Inscrições bloqueiam a porta principal.', testes:[{attr:'H',meta:7,desc:'Decifrar a charada (Habilidade/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (erudição)'} },
      { tipo:'teste', titulo:'Desmoronamento de Coluna', desc:'Pedras monumentais despencam do teto.', testes:[{attr:'H',meta:7,desc:'Correr para o vão seguro (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (atletismo)'} },
      { tipo:'combate', titulo:'Gárgulas de Ruína', desc:'Guardiões alados de granito.', inimigos:[{nome:'Gárgula de Ruína',P:7,H:5,R:8,qtd:2}], recompensa:{tipo:'item',nome:'Fragmentos de Granito Morfo',valor:60,desc:'2 fragmentos'} },
      { tipo:'teste', titulo:'Maldição do Desrespeito', desc:'Tocar em oferendas causa desespero espiritual.', testes:[{attr:'R',meta:7,desc:'Repelir a angústia (Resistência/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (espírito)'} },
      { tipo:'teste', titulo:'Ponte Quebrada sobre Abismo', desc:'Vão sem sustentação completa.', testes:[{attr:'H',meta:9,desc:'Cruzar por vigas estreitas (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (equilíbrio)'} },
      { tipo:'combate', titulo:'Constructos de Pedra', desc:'Autômatos mágicos protetores.', inimigos:[{nome:'Constructo de Pedra',P:8,H:3,R:10,qtd:1}], recompensa:{tipo:'item',nome:'Núcleo de Mana Bruta',valor:80,desc:'Núcleo de constructo'} },
      { tipo:'teste', titulo:'Corredor de Chamas Mágicas', desc:'Fogo ancestral dispara das paredes.', testes:[{attr:'H',meta:9,desc:'Cronometrar a corrida (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (sincronia)'} },
      { tipo:'teste', titulo:'Eco Histórico', desc:'Visões do passado sobrecarregam a mente.', testes:[{attr:'R',meta:7,desc:'Manter o foco (Resistência/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (arcano)'} },
      { tipo:'combate', titulo:'Aparições', desc:'Espíritos rancorosos.', inimigos:[{nome:'Aparição',P:6,H:7,R:6,qtd:2}], recompensa:{tipo:'item',nome:'Poção de Visão Espiritual',valor:35,desc:'Poção especial'} },
      { tipo:'teste', titulo:'Portão de Ferro Gigante', desc:'Tranca milenar emperrada.', testes:[{attr:'P',meta:9,desc:'Forçar a abertura (Poder/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (força)'} },
      { tipo:'teste', titulo:'Nuvem de Esporos Antigos', desc:'Cogumelos venenosos estouram ao toque.', testes:[{attr:'R',meta:7,desc:'Segurar a respiração (Resistência/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (fôlego)'} },
      { tipo:'combate', titulo:'Animais Corrompidos', desc:'Lobos com corrupção mágica.', inimigos:[{nome:'Lobo Corrompido',P:6,H:6,R:5,qtd:2}], recompensa:{tipo:'item',nome:'Presas Mágicas',valor:30,desc:'2 presas'} },
      { tipo:'teste', titulo:'Charada do Altar', desc:'Oferenda correta aciona tesouro.', testes:[{attr:'H',meta:7,desc:'Deduzir o tributo (Habilidade/Mental)'}], recompensa:{tipo:'item',nome:'Cálice de Prata',valor:70,desc:'Cálice com oferendas'} },
      { tipo:'combate', titulo:'Múmias Menores', desc:'Cadáveres enfaixados.', inimigos:[{nome:'Múmia Menor',P:7,H:4,R:8,qtd:2}], recompensa:{tipo:'item',nome:'Máscara Funerária de Ouro',valor:100,desc:'Máscara leve'} },
      { tipo:'teste', titulo:'Labirinto de Espelhos Mágicos', desc:'Caminhos falsos desorientam.', testes:[{attr:'H',meta:9,desc:'Encontrar a saída (Habilidade/Mental)'}], recompensa:{tipo:'item',nome:'Espelho Anti-Ilusão',valor:50,desc:'Espelho prateado'} },
      { tipo:'combate', titulo:'Sombras Vorazes', desc:'Criaturas de penumbra.', inimigos:[{nome:'Sombra Voraz',P:6,H:8,R:5,qtd:2}], recompensa:{tipo:'item',nome:'Essência de Sombra',valor:50,desc:'Essência sombria'} },
      { tipo:'teste', titulo:'Alavanca com Carga Explosiva', desc:'Armadilha anti-intruso.', testes:[{attr:'H',meta:9,desc:'Desarmar o detonador (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (desarme)'} },
      { tipo:'teste', titulo:'Vibração Sísmica', desc:'Ruínas tremem.', testes:[{attr:'H',meta:7,desc:'Manter o equilíbrio (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (estabilidade)'} },
      { tipo:'combate', titulo:'Guardião de Bronze', desc:'Autômato pesado.', inimigos:[{nome:'Guardião de Bronze',P:9,H:4,R:9,qtd:1}], recompensa:{tipo:'item',nome:'Placa de Bronze Puro',valor:90,desc:'Placa valiosa'} },
      { tipo:'combate', titulo:'Baú Falso (Mimic Ancestral)', desc:'Tesouro com dentes de pedra.', inimigos:[{nome:'Mimic Ancestral',P:8,H:5,R:8,qtd:1}], recompensa:{tipo:'ouro',qtd:60,nome:'Tibar na carcaça'} },
      { tipo:'teste', titulo:'Teste de Vontade Sacra', desc:'Aura do templo testa intenções.', testes:[{attr:'R',meta:9,desc:'Convencer a magia do local (Resistência/Social)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (bênção)'} },
      { tipo:'combate', titulo:'Serpentes de Pedra Animadas', desc:'Cobras esculpidas vivas.', inimigos:[{nome:'Serpente de Pedra',P:6,H:7,R:6,qtd:2}], recompensa:{tipo:'item',nome:'Olhos de Rubi Falso',valor:40,desc:'2 olhos'} },
      { tipo:'teste', titulo:'Queda de Teto de Mosaico', desc:'Pedras caem em padrões letais.', testes:[{attr:'H',meta:7,desc:'Escapar da zona de impacto (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (reflexos)'} },
      { tipo:'combate', titulo:'Xamã Esqueleto', desc:'Morto-vivo conjurador.', inimigos:[{nome:'Xamã Esqueleto',P:7,H:6,R:7,qtd:1}], recompensa:{tipo:'item',nome:'Cajado de Osso Entalhado',valor:75,desc:'Cajado ritual'} },
      { tipo:'teste', titulo:'Enigma de Pesagem', desc:'Balança mágica exige pesos.', testes:[{attr:'H',meta:9,desc:'Calcular a proporção (Habilidade/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (lógica)'} },
      { tipo:'combate', titulo:'Cães Fantasmas', desc:'Feras espectrais.', inimigos:[{nome:'Cão Fantasma',P:6,H:8,R:6,qtd:2}], recompensa:{tipo:'item',nome:'Bracelete Etéreo',valor:60,desc:'Bracelete espectral'} },
      { tipo:'teste', titulo:'Correnteza de Ar Cortante', desc:'Ventos mágicos em corredor.', testes:[{attr:'H',meta:9,desc:'Rastejar rente ao chão (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (tática)'} },
      { tipo:'boss', titulo:'O Sacerdote Caído (Lich)', desc:'Lich milenar guardião do templo.', inimigos:[{nome:'Sacerdote Caído',P:12,H:8,R:12,qtd:1,bestiarioId:'lich',imuneFisico:true,vulneravel:['Sagrado','Mágico','Prata','Fogo']}], recompensa:{tipo:'mista',ouro:400,xp:5,item:{nome:'Livro de Magias Ancestrais',valor:150,desc:'Tomo de poder antigo'}} }
    ],
  },
  masmorra: {
    encontros: [
      { tipo:'teste', titulo:'Correntes Oscilantes', desc:'Pêndulos com ganchos no corredor.', testes:[{attr:'H',meta:7,desc:'Cronometrar a passagem (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (timing)'} },
      { tipo:'combate', titulo:'Goblins Espiões', desc:'Patrulha furtiva e covarde.', inimigos:[{nome:'Goblin Espião',P:3,H:7,R:3,qtd:3}], recompensa:{tipo:'ouro',qtd:12,nome:'Adaga curva + moedas'} },
      { tipo:'teste', titulo:'Prisioneiro Desesperado', desc:'Nobre trancado implora resgate.', testes:[{attr:'H',meta:7,desc:'Acalmá-lo e coordenar fuga (Habilidade/Social)'}], recompensa:{tipo:'item',nome:'Anel de Agradecimento',valor:30,desc:'Anel do prisioneiro'} },
      { tipo:'teste', titulo:'Armadilha de Fosso com Estacas', desc:'Piso falso com estacas envenenadas.', testes:[{attr:'H',meta:7,desc:'Saltar o buraco (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (percepção)'} },
      { tipo:'combate', titulo:'Orcs Brutais', desc:'Soldados musculosos de linha.', inimigos:[{nome:'Orc Brutal',P:7,H:4,R:7,qtd:2}], recompensa:{tipo:'ouro',qtd:25,nome:'Machado rudimentar + moedas'} },
      { tipo:'teste', titulo:'Gás do Desespero', desc:'Resíduos químicos causam pânico.', testes:[{attr:'R',meta:9,desc:'Conter o medo (Resistência/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (força mental)'} },
      { tipo:'teste', titulo:'Porta de Cela Trancada', desc:'Cadeado duplo complexo.', testes:[{attr:'H',meta:9,desc:'Pickar a fechadura (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (chaveamento)'} },
      { tipo:'combate', titulo:'Torturadores Insanos', desc:'Carrascos com ferros quentes.', inimigos:[{nome:'Torturador Insano',P:6,H:5,R:7,qtd:2}], recompensa:{tipo:'ouro',qtd:35,nome:'Algema de ferro'} },
      { tipo:'teste', titulo:'Desabamento de Pedras de Celas', desc:'Blocos desabam após explosão.', testes:[{attr:'P',meta:7,desc:'Segurar o impacto (Poder/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (força)'} },
      { tipo:'teste', titulo:'Interrogatório Hostil', desc:'Guardas confundem o grupo com fugitivos.', testes:[{attr:'H',meta:9,desc:'Fingir autoridade (Habilidade/Social)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (blefe)'} },
      { tipo:'combate', titulo:'Cães de Masmorra', desc:'Feras famintas treinadas.', inimigos:[{nome:'Cão de Masmorra',P:6,H:6,R:5,qtd:2}], recompensa:{tipo:'item',nome:'Coleiras de Ferro',valor:15,desc:'2 coleiras'} },
      { tipo:'teste', titulo:'Inundação de Cela', desc:'Válvula enche o espaço de água.', testes:[{attr:'H',meta:7,desc:'Arrombar a grade submersa (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (submerso)'} },
      { tipo:'teste', titulo:'Armadilha de Flechas Automáticas', desc:'Sensores acionam bestas.', testes:[{attr:'H',meta:7,desc:'Abaixar-se a tempo (Habilidade/Físico)'}], recompensa:{tipo:'item',nome:'Bestas de Mão',valor:20,desc:'3 bestas leves'} },
      { tipo:'combate', titulo:'Cavaleiros Negros', desc:'Guardiões com armaduras negras.', inimigos:[{nome:'Cavaleiro Negro',P:8,H:6,R:9,qtd:2}], recompensa:{tipo:'item',nome:'Armadura Parcial Danificada',valor:80,desc:'Ferro recuperável'} },
      { tipo:'teste', titulo:'Alucinação de Tortura', desc:'Ilusão projeta gritos de dor.', testes:[{attr:'R',meta:7,desc:'Ignorar os tormentos (Resistência/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (foco)'} },
      { tipo:'combate', titulo:'Ogros Carcereiros', desc:'Brutamontes com clavas.', inimigos:[{nome:'Ogro Carcereiro',P:9,H:3,R:9,qtd:1}], recompensa:{tipo:'ouro',qtd:50,nome:'Sacola de couro'} },
      { tipo:'teste', titulo:'Corredor com Lâminas Rotativas', desc:'Obstáculo mecânico mortal.', testes:[{attr:'H',meta:9,desc:'Correr no tempo das engrenagens (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (corrida)'} },
      { tipo:'combate', titulo:'Xamã Goblin', desc:'Conjurador de truques e maldições.', inimigos:[{nome:'Xamã Goblin',P:4,H:7,R:5,qtd:1}], recompensa:{tipo:'item',nome:'Poção de Cura Menor',valor:25,desc:'Poção caseira'} },
      { tipo:'teste', titulo:'Vazamento de Óleo Quente', desc:'Armadilha de teto.', testes:[{attr:'H',meta:9,desc:'Saltar fora do raio (Habilidade/Físico)'}], recompensa:{tipo:'item',nome:'Frascos de Óleo',valor:15,desc:'2 frascos inflamáveis'} },
      { tipo:'teste', titulo:'Suborno de Guarda Corrupto', desc:'Negociar passagem livre.', testes:[{attr:'H',meta:7,desc:'Convencer o guarda (Habilidade/Social)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (negociação)'} },
      { tipo:'combate', titulo:'Troll de Calabouço', desc:'Monstro regenerativo.', inimigos:[{nome:'Troll de Calabouço',P:9,H:4,R:10,qtd:1}], recompensa:{tipo:'item',nome:'Carne Regenerativa',valor:60,desc:'Reagente de 60 Tibar'} },
      { tipo:'teste', titulo:'Piso Elétrico por Runas', desc:'Placas condutoras mágicas.', testes:[{attr:'R',meta:7,desc:'Suportar a carga (Resistência/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (choque)'} },
      { tipo:'combate', titulo:'Espectros de Prisioneiros', desc:'Almas presas a correntes.', inimigos:[{nome:'Espectro de Prisioneiro',P:6,H:6,R:6,qtd:2}], recompensa:{tipo:'item',nome:'Algema Etérea',valor:45,desc:'Algema espectral'} },
      { tipo:'teste', titulo:'Enigma das Celas Numeradas', desc:'Sequência para abrir o portão.', testes:[{attr:'H',meta:9,desc:'Desvendar o padrão (Habilidade/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (lógica)'} },
      { tipo:'combate', titulo:'Minotauro Guardião', desc:'Fera labiríntica brutal.', inimigos:[{nome:'Minotauro Guardião',P:10,H:5,R:10,qtd:1}], recompensa:{tipo:'item',nome:'Machado de Chifres',valor:100,desc:'Machado pesado'} },
      { tipo:'teste', titulo:'Desmoronamento da Torre Central', desc:'A masmorra colapsa.', testes:[{attr:'H',meta:9,desc:'Correr até a saída (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (fuga)'} },
      { tipo:'combate', titulo:'Assassinos de Prisioneiros', desc:'Sicários para queimar arquivos vivos.', inimigos:[{nome:'Assassino de Prisioneiros',P:7,H:7,R:6,qtd:2}], recompensa:{tipo:'item',nome:'Poção de Invisibilidade Menor',valor:40,desc:'Uso único'} },
      { tipo:'teste', titulo:'Gás Venenoso de Contenção', desc:'Sistema lança gás letal.', testes:[{attr:'R',meta:9,desc:'Resistir aos tóxicos (Resistência/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (resistência)'} },
      { tipo:'teste', titulo:'Disputa de Força com Portão', desc:'Levantar a grade manualmente.', testes:[{attr:'P',meta:9,desc:'Erguer o ferro pesado (Poder/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (atlético)'} },
      { tipo:'boss', titulo:'O Carniceiro das Correntes', desc:'Mestre executor mutante da masmorra.', inimigos:[{nome:'Carniceiro das Correntes',P:12,H:6,R:12,qtd:1}], recompensa:{tipo:'mista',ouro:350,xp:5,item:{nome:'Espada Bastarda Cruel',valor:140,desc:'Lâmina cruel'}} }
    ],
  },
  minas: {
    encontros: [
      { tipo:'teste', titulo:'Carrinho Desgovernado', desc:'Vagão de minério em alta velocidade.', testes:[{attr:'H',meta:7,desc:'Saltar para o desvio (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (desvio)'} },
      { tipo:'combate', titulo:'Kobolds Mineiros', desc:'Pequenos sabotadores com armadilhas.', inimigos:[{nome:'Kobold Mineiro',P:3,H:7,R:3,qtd:3}], recompensa:{tipo:'ouro',qtd:15,nome:'Pepitas de ouro bruto'} },
      { tipo:'teste', titulo:'Desabamento de Galeria', desc:'Vigas de madeira cedem.', testes:[{attr:'P',meta:7,desc:'Escorar a viga (Poder/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (escoramento)'} },
      { tipo:'teste', titulo:'Gás Firedamp', desc:'Tochas perto de metano inflamável.', testes:[{attr:'H',meta:7,desc:'Apagar as chamas (Habilidade/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (prudência)'} },
      { tipo:'combate', titulo:'Aranhas Gigantes das Profundezas', desc:'Tecelãs de teias paralisantes.', inimigos:[{nome:'Aranha Gigante',P:6,H:7,R:5,qtd:2}], recompensa:{tipo:'item',nome:'Teias Endurecidas',valor:20,desc:'3 teias úteis'} },
      { tipo:'teste', titulo:'Ponte de Trilhos Suspensa', desc:'Travessia sobre abismo vertical.', testes:[{attr:'H',meta:7,desc:'Caminhar nas vigas (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (equilíbrio)'} },
      { tipo:'combate', titulo:'Espectros de Mineradores', desc:'Almas presas por soterramento.', inimigos:[{nome:'Espectro de Minerador',P:6,H:6,R:6,qtd:2}], recompensa:{tipo:'item',nome:'Picareta de Prata Antiga',valor:80,desc:'Picareta valiosa'} },
      { tipo:'teste', titulo:'Inalação de Pó de Carvão', desc:'Ar irrespirável.', testes:[{attr:'R',meta:7,desc:'Resistir à tosse (Resistência/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (respiração)'} },
      { tipo:'teste', titulo:'Armadilha de Desmoronamento', desc:'Fios ligados a pedras no teto.', testes:[{attr:'H',meta:9,desc:'Escapar do soterramento (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (reflexos)'} },
      { tipo:'combate', titulo:'Trogloditas', desc:'Criaturas reptilianas nauseabundas.', inimigos:[{nome:'Troglodita',P:7,H:5,R:7,qtd:2}], recompensa:{tipo:'item',nome:'Dentes de Lagarto',valor:20,desc:'2 dentes'} },
      { tipo:'teste', titulo:'Veio de Cristal Rúnico', desc:'Minério reage a metal.', testes:[{attr:'H',meta:9,desc:'Estabilizar a frequência (Habilidade/Mental)'}], recompensa:{tipo:'item',nome:'Cristal de Frequência',valor:70,desc:'Cristal estável'} },
      { tipo:'combate', titulo:'Golems de Minério', desc:'Autômatos de escória e pedra.', inimigos:[{nome:'Golem de Minério',P:8,H:3,R:9,qtd:1}], recompensa:{tipo:'item',nome:'Núcleo de Escória',valor:90,desc:'Núcleo metálico'} },
      { tipo:'teste', titulo:'Queda em Poço de Ventilação', desc:'Abertura oculta no chão.', testes:[{attr:'H',meta:9,desc:'Agarrar-se à borda (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (agarre)'} },
      { tipo:'combate', titulo:'Enxame de Morcegos Cavernosos', desc:'Centenas de morcegos em pânico.', inimigos:[{nome:'Morcego Cavernoso',P:4,H:8,R:4,qtd:4}], recompensa:{tipo:'item',nome:'Saco de Guano',valor:15,desc:'Útil para pólvora'} },
      { tipo:'teste', titulo:'Enigma da Alavanca de Ventilação', desc:'Sequência dos foles de ar.', testes:[{attr:'H',meta:7,desc:'Deduzir o circuito (Habilidade/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (mecânica)'} },
      { tipo:'combate', titulo:'Besouros de Aço', desc:'Carapaças duras como metal.', inimigos:[{nome:'Besouro de Aço',P:7,H:4,R:8,qtd:2}], recompensa:{tipo:'item',nome:'Carapaças Metálicas',valor:60,desc:'2 carapaças'} },
      { tipo:'teste', titulo:'Correnteza de Água Subterrânea', desc:'Represa interna rompe.', testes:[{attr:'H',meta:7,desc:'Nadar contra a enxurrada (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (natação)'} },
      { tipo:'combate', titulo:'Xamã Troglodita', desc:'Líder com magias de pedra.', inimigos:[{nome:'Xamã Troglodita',P:7,H:6,R:7,qtd:1}], recompensa:{tipo:'item',nome:'Amuleto de Osso e Lama',valor:40,desc:'Amuleto tribal'} },
      { tipo:'teste', titulo:'Piso Deslizante de Lama', desc:'Encosta sem tração.', testes:[{attr:'H',meta:7,desc:'Descer com segurança (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (tração)'} },
      { tipo:'combate', titulo:'Centopeias Gigantes de Túnel', desc:'Pragas de picada letal.', inimigos:[{nome:'Centopeia de Túnel',P:6,H:7,R:5,qtd:2}], recompensa:{tipo:'item',nome:'Veneno Ácido de Túnel',valor:30,desc:'Frasco de veneno'} },
      { tipo:'teste', titulo:'Pressão Atmosférica Extrema', desc:'Zumbido e vertigem.', testes:[{attr:'R',meta:7,desc:'Manter o equilíbrio psicológico (Resistência/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (pressão)'} },
      { tipo:'combate', titulo:'Verme Devorador de Rocha', desc:'Anelídeo que cava rocha sólida.', inimigos:[{nome:'Verme Devorador',P:10,H:3,R:10,qtd:1}], recompensa:{tipo:'item',nome:'Exoesqueleto Anelídeo',valor:120,desc:'Exoesqueleto'} },
      { tipo:'teste', titulo:'Baú de Ouro Armadilhado', desc:'Cofre com veneno de contato.', testes:[{attr:'H',meta:9,desc:'Abrir com proteção (Habilidade/Físico)'}], recompensa:{tipo:'ouro',qtd:90,nome:'Moedas antigas de mina'} },
      { tipo:'combate', titulo:'Mercenários de Minas', desc:'Salteadores no posto de extração.', inimigos:[{nome:'Mercenário de Minas',P:7,H:6,R:7,qtd:2}], recompensa:{tipo:'ouro',qtd:55,nome:'Saque'} },
      { tipo:'teste', titulo:'Desabamento de Poço Principal', desc:'Rocha bloqueia o retorno.', testes:[{attr:'P',meta:9,desc:'Remover pedregulhos (Poder/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (força extrema)'} },
      { tipo:'combate', titulo:'Prole de Aranhas', desc:'Dezenas de filhotes venenosos.', inimigos:[{nome:'Prole de Aranha',P:5,H:8,R:4,qtd:4}], recompensa:{tipo:'item',nome:'Veneno de Filhote',valor:30,desc:'Frasco'} },
      { tipo:'teste', titulo:'Armadilha de Fios de Aço', desc:'Corta-cabos na altura do pescoço.', testes:[{attr:'H',meta:9,desc:'Abaixar-se a tempo (Habilidade/Físico)'}], recompensa:{tipo:'item',nome:'Cabo de Aço',valor:25,desc:'5 metros de cabo'} },
      { tipo:'combate', titulo:'Elemental de Terra Instável', desc:'Massa rochosa animada.', inimigos:[{nome:'Elemental de Terra',P:9,H:4,R:9,qtd:1}], recompensa:{tipo:'item',nome:'Fragmento de Terra Animada',valor:70,desc:'Fragmento'} },
      { tipo:'teste', titulo:'Vibração de Explosão Próxima', desc:'Desmoronamento remoto abala túneis.', testes:[{attr:'H',meta:7,desc:'Manter estabilidade (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (estabilização)'} },
      { tipo:'boss', titulo:'O Colosso de Ferro e Magma', desc:'Máquina de guerra anã corrompida.', inimigos:[{nome:'Colosso de Ferro e Magma',P:12,H:5,R:13,qtd:1}], recompensa:{tipo:'mista',ouro:400,xp:5,item:{nome:'Minério de Aço Mágico',valor:160,desc:'Minério lendário'}} }
    ],
  },
  floresta: {
    encontros: [
      { tipo:'teste', titulo:'Névoa Ilusionista', desc:'Caminhos que mudam de direção.', testes:[{attr:'H',meta:7,desc:'Enxergar através da ilusão (Habilidade/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (percepção)'} },
      { tipo:'combate', titulo:'Fadas Maliciosas', desc:'Peças letais em miniatura.', inimigos:[{nome:'Fada Maliciosa',P:3,H:9,R:4,qtd:3}], recompensa:{tipo:'item',nome:'Pó de Fada Estelar',valor:40,desc:'Poção de leveza'} },
      { tipo:'teste', titulo:'Cipós Carnívoros', desc:'Plantas agarram os tornozelos.', testes:[{attr:'H',meta:7,desc:'Cortar as amarras (Habilidade/Físico)'}], recompensa:{tipo:'item',nome:'Fibra Vegetal Resistente',valor:20,desc:'Material de arco'} },
      { tipo:'combate', titulo:'Lobos Gigantes da Mata', desc:'Matilha alfa silvestre.', inimigos:[{nome:'Lobo Gigante',P:6,H:7,R:6,qtd:3}], recompensa:{tipo:'item',nome:'Peles de Lobo Prateado',valor:60,desc:'2 peles'} },
      { tipo:'teste', titulo:'Esporos do Sono Eterno', desc:'Cogumelos liberam fumaça sonífera.', testes:[{attr:'R',meta:7,desc:'Resistir ao cansaço (Resistência/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (biológico)'} },
      { tipo:'teste', titulo:'Árvore Protetora Enciumada', desc:'Raízes chicoteiam invasores.', testes:[{attr:'H',meta:7,desc:'Desviar dos golpes (Habilidade/Físico)'}], recompensa:{tipo:'item',nome:'Galho de Madeira de Ferro',valor:30,desc:'Cabo de arma'} },
      { tipo:'combate', titulo:'Ents Corrompidos', desc:'Árvores sencientes sombrias.', inimigos:[{nome:'Ent Corrompido',P:9,H:3,R:10,qtd:1}], recompensa:{tipo:'item',nome:'Seiva Negra Corrompida',valor:90,desc:'Reagente alquímico'} },
      { tipo:'teste', titulo:'Rio Encantado', desc:'Tronco escorregadio sobre corredeiras.', testes:[{attr:'H',meta:7,desc:'Não cair na água (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (travessia)'} },
      { tipo:'combate', titulo:'Dríades Hostis', desc:'Guardiãs enfurecidas.', inimigos:[{nome:'Dríade Hostil',P:6,H:7,R:6,qtd:2}], recompensa:{tipo:'item',nome:'Folha de Prata Silvestre',valor:50,desc:'Folha mágica'} },
      { tipo:'teste', titulo:'Canto de Sereia da Floresta', desc:'Vozes chamam para fora da trilha.', testes:[{attr:'R',meta:7,desc:'Resistir ao chamado (Resistência/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (vontade)'} },
      { tipo:'combate', titulo:'Bestas Feéricas', desc:'Chifres de cristal e pelagem estelar.', inimigos:[{nome:'Besta Feérica',P:7,H:7,R:7,qtd:2}], recompensa:{tipo:'item',nome:'Chifre de Cristal Silvestre',valor:110,desc:'Chifre valioso'} },
      { tipo:'teste', titulo:'Armadilha de Teia Arbórea', desc:'Teias entre galhos altos.', testes:[{attr:'H',meta:7,desc:'Escapar antes de ser suspenso (Habilidade/Físico)'}], recompensa:{tipo:'item',nome:'Redinha de Teia',valor:15,desc:'Utilidade tática'} },
      { tipo:'teste', titulo:'Labirinto de Samambaias', desc:'Folhagens bloqueiam a visão.', testes:[{attr:'H',meta:7,desc:'Orientação lógica (Habilidade/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (orientação)'} },
      { tipo:'combate', titulo:'Javali Espinhoso', desc:'Fera com cerdas de ferro.', inimigos:[{nome:'Javali Espinhoso',P:8,H:5,R:8,qtd:1}], recompensa:{tipo:'item',nome:'Espinhos de Ferro Silvestre',valor:40,desc:'4 espinhos'} },
      { tipo:'teste', titulo:'Maldição da Metamorfose Menor', desc:'Pó transforma pele em casca.', testes:[{attr:'R',meta:9,desc:'Purificar o corpo (Resistência/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (purificação)'} },
      { tipo:'combate', titulo:'Bandidos Silvestres', desc:'Foras da lei na copa.', inimigos:[{nome:'Bandido Silvestre',P:6,H:6,R:6,qtd:3}], recompensa:{tipo:'ouro',qtd:40,nome:'Saques de viajantes'} },
      { tipo:'teste', titulo:'Queda de Galho Ancestral', desc:'Tronco colossal desaba.', testes:[{attr:'H',meta:9,desc:'Saltar fora da zona (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (acrobacia)'} },
      { tipo:'combate', titulo:'Aranha de Cristal', desc:'Predador de teias cortantes.', inimigos:[{nome:'Aranha de Cristal',P:7,H:8,R:6,qtd:1}], recompensa:{tipo:'item',nome:'Olho de Cristal',valor:70,desc:'Olho translúcido'} },
      { tipo:'teste', titulo:'Negociação com Guardião do Bosque', desc:'Criatura exige tributo.', testes:[{attr:'H',meta:9,desc:'Convencer com respeito (Habilidade/Social)'}], recompensa:{tipo:'item',nome:'Fruta da Vitalidade',valor:35,desc:'Cura ferimentos médios'} },
      { tipo:'combate', titulo:'Enxame de Vespas Mágicas', desc:'Ferrões brilhantes.', inimigos:[{nome:'Vespa Mágica',P:5,H:8,R:5,qtd:4}], recompensa:{tipo:'item',nome:'Ferrões Brilhantes',valor:25,desc:'2 ferrões'} },
      { tipo:'teste', titulo:'Brilho de Fogo-Fátuo', desc:'Luzes guiam para o pântano.', testes:[{attr:'H',meta:7,desc:'Ignorar os reflexos (Habilidade/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (discernimento)'} },
      { tipo:'combate', titulo:'Urso das Sombras', desc:'Fera corrompida.', inimigos:[{nome:'Urso das Sombras',P:9,H:4,R:9,qtd:1}], recompensa:{tipo:'item',nome:'Pele de Urso Sombrio',valor:90,desc:'Pele valiosa'} },
      { tipo:'teste', titulo:'Pântano Oculto sob Folhagens', desc:'Lamaçal disfarçado.', testes:[{attr:'H',meta:7,desc:'Puxar o pé a tempo (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (salvamento)'} },
      { tipo:'combate', titulo:'Xamã dos Elfos Negros Silvestres', desc:'Conjurador exilado.', inimigos:[{nome:'Xamã Elfo Negro',P:7,H:8,R:6,qtd:1}], recompensa:{tipo:'item',nome:'Adaga Drow Envenenada',valor:80,desc:'Adaga rara'} },
      { tipo:'teste', titulo:'Tempestade de Pólen Alérgico', desc:'Nuvem causa cegueira.', testes:[{attr:'R',meta:7,desc:'Proteger vias respiratórias (Resistência/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (proteção)'} },
      { tipo:'combate', titulo:'Chimera Silvestre', desc:'Leão, cabra e serpente.', inimigos:[{nome:'Chimera Silvestre',P:10,H:6,R:10,qtd:1}], recompensa:{tipo:'item',nome:'Garra de Leão Alado',valor:130,desc:'Garra lendária'} },
      { tipo:'teste', titulo:'Raízes Vivas Aprisionadoras', desc:'O chão imobiliza o grupo.', testes:[{attr:'P',meta:9,desc:'Romper a vegetação (Poder/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (força pura)'} },
      { tipo:'combate', titulo:'Espectros da Mata', desc:'Almas de viajantes perdidos.', inimigos:[{nome:'Espectro da Mata',P:7,H:7,R:7,qtd:2}], recompensa:{tipo:'item',nome:'Orvalho Espectral',valor:60,desc:'Orvalho mágico'} },
      { tipo:'teste', titulo:'Eco de Grito Silvestre', desc:'Som abala a moral.', testes:[{attr:'R',meta:7,desc:'Manter a bravura (Resistência/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (bravura)'} },
      { tipo:'boss', titulo:'A Rainha dos Espinhos', desc:'Soberana corrompida do coração da floresta.', inimigos:[{nome:'Rainha dos Espinhos',P:12,H:7,R:12,qtd:1}], recompensa:{tipo:'mista',ouro:450,xp:5,item:{nome:'Coroa de Espinhos Mágica',valor:180,desc:'Coroa lendária'}} }
    ],
  },
  ilhas: {
    encontros: [
      { tipo:'teste', titulo:'Onda Gigante de Penhasco', desc:'Maré alta atinge as rochas.', testes:[{attr:'H',meta:7,desc:'Firmar-se nas rochas (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (firmeza)'} },
      { tipo:'combate', titulo:'Homens-Peixe', desc:'Guerreiros anfíbios com lanças.', inimigos:[{nome:'Homem-Peixe',P:6,H:6,R:6,qtd:2}], recompensa:{tipo:'item',nome:"Lanças d'Água",valor:40,desc:'2 lanças ornamentais'} },
      { tipo:'teste', titulo:'Areia Movediça de Praia', desc:'Banco de areia suga as botas.', testes:[{attr:'H',meta:7,desc:'Escapar do sumidouro (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (fuga)'} },
      { tipo:'combate', titulo:'Caranguejos Gigantes', desc:'Pinças blindadas.', inimigos:[{nome:'Caranguejo Gigante',P:7,H:4,R:8,qtd:2}], recompensa:{tipo:'item',nome:'Pinças Blindadas',valor:70,desc:'2 pinças'} },
      { tipo:'teste', titulo:'Canto de Sereias Malignas', desc:'Melodia enfeitiça marinheiros.', testes:[{attr:'R',meta:7,desc:'Resistir ao transe (Resistência/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (auditivo)'} },
      { tipo:'teste', titulo:'Desmoronamento de Falésia', desc:'Blocos de arenito despencam.', testes:[{attr:'H',meta:9,desc:'Correr para a praia (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (corrida)'} },
      { tipo:'combate', titulo:'Piratas Fantasmas', desc:'Espectros de saqueadores.', inimigos:[{nome:'Pirata Fantasma',P:7,H:6,R:7,qtd:2}], recompensa:{tipo:'item',nome:'Moeda de Ouro Espectral',valor:50,desc:'Moeda especial'} },
      { tipo:'teste', titulo:'Nevoeiro Marítimo Denso', desc:'Visibilidade zero.', testes:[{attr:'H',meta:7,desc:'Navegar às cegas (Habilidade/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (navegação)'} },
      { tipo:'combate', titulo:'Elementares de Água', desc:'Massas líquidas violentas.', inimigos:[{nome:'Elemental de Água',P:8,H:5,R:9,qtd:1}], recompensa:{tipo:'item',nome:'Núcleo Líquido Estável',valor:80,desc:'Núcleo'} },
      { tipo:'teste', titulo:'Gaivotas Carnívoras Gigantes', desc:'Aves defendem ninhos.', testes:[{attr:'H',meta:5,desc:'Espantar o bando (Habilidade/Físico)'}], recompensa:{tipo:'item',nome:'Penas Impermeáveis',valor:20,desc:'2 penas'} },
      { tipo:'combate', titulo:'Harpias Costeiras', desc:'Cantos estridentes e garras.', inimigos:[{nome:'Harpia Costeira',P:6,H:7,R:6,qtd:2}], recompensa:{tipo:'item',nome:'Pena de Harpia Cortante',valor:30,desc:'Pena'} },
      { tipo:'teste', titulo:'Gruta com Maré Subindo', desc:'Água inunda a caverna.', testes:[{attr:'H',meta:9,desc:'Nadar até a saída (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (natação)'} },
      { tipo:'teste', titulo:'Armadilha de Naufrágio', desc:'Destroços sob a areia.', testes:[{attr:'H',meta:7,desc:'Evitar ferimentos (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (atenção)'} },
      { tipo:'combate', titulo:'Crocodilos de Estuário', desc:'Répteis de água salobra.', inimigos:[{nome:'Crocodilo de Estuário',P:8,H:4,R:8,qtd:2}], recompensa:{tipo:'item',nome:'Couro de Crocodilo',valor:75,desc:'Couro salgado'} },
      { tipo:'teste', titulo:'Negociação com Capitão Pirata', desc:'Corsários na costa.', testes:[{attr:'H',meta:9,desc:'Barganhar passagem (Habilidade/Social)'}], recompensa:{tipo:'item',nome:'Garrafa de Rum Envelhecido',valor:40,desc:'Bom para troca social'} },
      { tipo:'combate', titulo:'Polvos Gigantes de Rocha', desc:'Tentáculos da espuma.', inimigos:[{nome:'Polvo Gigante',P:8,H:6,R:8,qtd:1}], recompensa:{tipo:'item',nome:'Tinta de Polvo Gigante',valor:60,desc:'Reagente valioso'} },
      { tipo:'teste', titulo:'Correnteza de Retorno', desc:'Nadar torna-se exaustivo.', testes:[{attr:'R',meta:7,desc:'Não ser puxado mar adentro (Resistência/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (fôlego)'} },
      { tipo:'combate', titulo:'Xamã dos Homens-Peixe', desc:'Conjurador de tempestade.', inimigos:[{nome:'Xamã Homem-Peixe',P:7,H:6,R:7,qtd:1}], recompensa:{tipo:'item',nome:'Concha de Marfim',valor:90,desc:'Concha mágica'} },
      { tipo:'teste', titulo:'Tesouro Armadilhado na Areia', desc:'Baú com veneno de peixe-pedra.', testes:[{attr:'H',meta:9,desc:'Manusear com segurança (Habilidade/Físico)'}], recompensa:{tipo:'ouro',qtd:110,nome:'Moedas banhadas a sal'} },
      { tipo:'combate', titulo:'Espectros de Afogados', desc:'Almas em recifes de coral.', inimigos:[{nome:'Espectro de Afogado',P:6,H:7,R:6,qtd:2}], recompensa:{tipo:'item',nome:'Pérola Branca Opaca',valor:100,desc:'Pérola'} },
      { tipo:'teste', titulo:'Vapores Sulfurosos', desc:'Gases em rochas vulcânicas.', testes:[{attr:'R',meta:7,desc:'Contornar a nuvem (Resistência/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (contorno)'} },
      { tipo:'combate', titulo:'Tubarões Mutantes', desc:'Predadores com barbatanas blindadas.', inimigos:[{nome:'Tubarão Mutante',P:8,H:7,R:7,qtd:2}], recompensa:{tipo:'item',nome:'Dentes de Tubarão Blindado',valor:50,desc:'2 dentes'} },
      { tipo:'teste', titulo:'Enigma das Marés e Conchas', desc:'Inscrição exige ciclo lunar.', testes:[{attr:'H',meta:9,desc:'Abrir a passagem secreta (Habilidade/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (cálculo lunar)'} },
      { tipo:'combate', titulo:'Seres das Profundezas Menores', desc:'Híbridos escamosos e cegos.', inimigos:[{nome:'Ser das Profundezas',P:7,H:6,R:7,qtd:2}], recompensa:{tipo:'item',nome:'Amuleto de Coral Negro',valor:60,desc:'Amuleto'} },
      { tipo:'teste', titulo:'Tempestade Relâmpago na Costa', desc:'Raios na areia aberta.', testes:[{attr:'H',meta:7,desc:'Buscar abrigo (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (abrigo)'} },
      { tipo:'combate', titulo:'Hidra de Mangue', desc:'Monstro de múltiplas cabeças.', inimigos:[{nome:'Hidra de Mangue',P:10,H:5,R:11,qtd:1}], recompensa:{tipo:'item',nome:'Dentes de Hidra Venenosa',valor:150,desc:'3 dentes'} },
      { tipo:'teste', titulo:'Deslizamento de Duna de Areia', desc:'Toneladas de areia soterram trilhas.', testes:[{attr:'H',meta:7,desc:'Correr para o topo firme (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (escalada)'} },
      { tipo:'combate', titulo:'Corsários Mortos-Vivos', desc:'Tripulação zumbi de galeão.', inimigos:[{nome:'Corsário Zumbi',P:7,H:5,R:8,qtd:3}], recompensa:{tipo:'ouro',qtd:65,nome:'Saque encharcado'} },
      { tipo:'teste', titulo:'Vibração Sísmica Submarina', desc:'Alerta de tsunami.', testes:[{attr:'H',meta:9,desc:'Correr para o topo do penhasco (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (alerta)'} },
      { tipo:'boss', titulo:'O Kraken das Profundezas', desc:'Monstruosidade titânica do oceano.', inimigos:[{nome:'Kraken das Profundezas',P:13,H:6,R:13,qtd:1}], recompensa:{tipo:'mista',ouro:500,xp:5,item:{nome:'Olho do Kraken',valor:200,desc:'Item lendário de alquimia'}} }
    ],
  },
  deserto: {
    encontros: [
      { tipo:'teste', titulo:'Calor Extenuante', desc:'Sol escaldante drena o vigor.', testes:[{attr:'R',meta:7,desc:'Suportar a desidratação (Resistência/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (desidratação)'} },
      { tipo:'combate', titulo:'Escorpiões Gigantes', desc:'Artrópodes com carapaças douradas.', inimigos:[{nome:'Escorpião Gigante',P:6,H:7,R:6,qtd:2}], recompensa:{tipo:'item',nome:'Ferrões de Ouro Natural',valor:80,desc:'2 ferrões'} },
      { tipo:'teste', titulo:'Miragem Desorientadora', desc:'Oásis falso no deserto.', testes:[{attr:'H',meta:7,desc:'Perceber a ilusão térmica (Habilidade/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (discernimento)'} },
      { tipo:'combate', titulo:'Esfinges Menores', desc:'Guardiões enigmáticos de portais.', inimigos:[{nome:'Esfinge Menor',P:8,H:7,R:8,qtd:1}], recompensa:{tipo:'item',nome:'Pergaminho de Enigmas Antigos',valor:100,desc:'Pergaminho'} },
      { tipo:'teste', titulo:'Tempestade de Areia Mágica', desc:'Ventos com partículas de éter.', testes:[{attr:'H',meta:9,desc:'Montar abrigo de emergência (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (abrigo)'} },
      { tipo:'teste', titulo:'Areia Movediça Etérea', desc:'Solo falso absorve o grupo.', testes:[{attr:'H',meta:7,desc:'Resgate em equipe (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (equipe)'} },
      { tipo:'combate', titulo:'Nômades Corrompidos', desc:'Viajantes tomados por trevas.', inimigos:[{nome:'Nômade Corrompido',P:6,H:6,R:6,qtd:3}], recompensa:{tipo:'ouro',qtd:50,nome:'Joias do deserto'} },
      { tipo:'teste', titulo:'Alucinação Psíquica', desc:'O éter distorce a sanidade.', testes:[{attr:'R',meta:7,desc:'Manter a sanidade (Resistência/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (sanidade)'} },
      { tipo:'combate', titulo:'Elementares de Fogo/Éter', desc:'Massas de plasma estelar.', inimigos:[{nome:'Elemental de Éter',P:8,H:5,R:8,qtd:1}], recompensa:{tipo:'item',nome:'Núcleo de Plasma Estelar',valor:110,desc:'Núcleo'} },
      { tipo:'teste', titulo:'Desabamento de Duna', desc:'Encostas cedes sob os pés.', testes:[{attr:'H',meta:7,desc:'Agilidade em encostas (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (agilidade)'} },
      { tipo:'combate', titulo:'Múmias das Areias', desc:'Mortos-vivos do deserto.', inimigos:[{nome:'Múmia das Areias',P:7,H:4,R:8,qtd:2}], recompensa:{tipo:'item',nome:'Bracelete de Ouro Solar',valor:140,desc:'Bracelete'} },
      { tipo:'teste', titulo:'Enigma do Otimizador', desc:'Leitura de constelações.', testes:[{attr:'H',meta:9,desc:'Decifrar o padrão estelar (Habilidade/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (constelações)'} },
      { tipo:'combate', titulo:'Vagas-Lumes do Deserto', desc:'Luzes enganosas.', inimigos:[{nome:'Vaga-Lume do Deserto',P:3,H:8,R:3,qtd:4}], recompensa:{tipo:'item',nome:'Frascos de Bioluminescência',valor:30,desc:'Luz 24h'} },
      { tipo:'combate', titulo:'Serpentes de Areia', desc:'Cobras douradas sob a duna.', inimigos:[{nome:'Serpente de Areia',P:6,H:7,R:5,qtd:2}], recompensa:{tipo:'item',nome:'Pele Escamosa Dourada',valor:70,desc:'Pele'} },
      { tipo:'teste', titulo:'Caravanas Fantasmas', desc:'Barganha sem perda de memórias.', testes:[{attr:'H',meta:7,desc:'Barganhar com cuidado (Habilidade/Social)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (barganha)'} },
      { tipo:'combate', titulo:'Gárgulas de Arenito', desc:'Estátuas de pedra solar.', inimigos:[{nome:'Gárgula de Arenito',P:7,H:4,R:9,qtd:1}], recompensa:{tipo:'item',nome:'Fragmentos de Pedra Solar',valor:90,desc:'2 fragmentos'} },
      { tipo:'teste', titulo:'Poço Seco Armadilhado', desc:'Descarga mágica no fundo.', testes:[{attr:'R',meta:7,desc:'Resistir à descarga (Resistência/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (descarga)'} },
      { tipo:'combate', titulo:'Xamã do Deserto', desc:'Conjurador das areias.', inimigos:[{nome:'Xamã do Deserto',P:7,H:6,R:7,qtd:1}], recompensa:{tipo:'item',nome:'Cajado de Cedro Etéreo',valor:100,desc:'Cajado'} },
      { tipo:'teste', titulo:'Vórtice Térmico', desc:'Coluna de ar quente.', testes:[{attr:'P',meta:7,desc:'Firmeza de carga (Poder/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (firmeza)'} },
      { tipo:'combate', titulo:'Bestas de Osso e Areia', desc:'Quimeras polidas pelo vento.', inimigos:[{nome:'Besta de Osso e Areia',P:8,H:5,R:8,qtd:1}], recompensa:{tipo:'item',nome:'Crânio Quimérico',valor:80,desc:'Crânio polido'} },
      { tipo:'teste', titulo:'Radiação de Éter', desc:'Energia corrói o corpo.', testes:[{attr:'R',meta:9,desc:'Resistência celular (Resistência/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (radiação)'} },
      { tipo:'combate', titulo:'Leões das Dunas', desc:'Predadores de pelos dourados.', inimigos:[{nome:'Leão das Dunas',P:8,H:6,R:7,qtd:2}], recompensa:{tipo:'item',nome:'Couros Dourados',valor:120,desc:'2 couros'} },
      { tipo:'teste', titulo:'Alçapão de Tumba', desc:'Piso falso em ruína soterrada.', testes:[{attr:'H',meta:7,desc:'Salto lateral (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (salto)'} },
      { tipo:'combate', titulo:'Aparições do Sol', desc:'Espíritos sob o sol escaldante.', inimigos:[{nome:'Aparição do Sol',P:6,H:7,R:6,qtd:2}], recompensa:{tipo:'item',nome:'Essência Solar Etérea',valor:90,desc:'Essência'} },
      { tipo:'teste', titulo:'Chuva de Meteoros', desc:'Fragmentos caem do céu.', testes:[{attr:'H',meta:9,desc:'Evitar os impactos (Habilidade/Físico)'}], recompensa:{tipo:'item',nome:'Fragmento de Meteorito',valor:150,desc:'Meteorito pequeno'} },
      { tipo:'combate', titulo:'Verme das Dunas Colossal', desc:'Anelídeo titânico sob a areia.', inimigos:[{nome:'Verme das Dunas',P:11,H:3,R:12,qtd:1}], recompensa:{tipo:'item',nome:'Placa de Quitina Dourada',valor:200,desc:'Placa gigante'} },
      { tipo:'teste', titulo:'Perda de Rota', desc:'Desorientação total.', testes:[{attr:'H',meta:7,desc:'Reorientação estelar (Habilidade/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (orientação)'} },
      { tipo:'combate', titulo:'Esqueletos Guerreiros do Deserto', desc:'Patrulha óssea nas dunas.', inimigos:[{nome:'Esqueleto Guerreiro do Deserto',P:6,H:5,R:6,qtd:3}], recompensa:{tipo:'item',nome:'Cimitarra com Fio de Ouro',valor:110,desc:'Espada'} },
      { tipo:'teste', titulo:'Vibração de Portal', desc:'Barreiras entre mundos enfraquecem.', testes:[{attr:'R',meta:7,desc:'Foco na realidade (Resistência/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (foco)'} },
      { tipo:'boss', titulo:'O Faraó Etéreo', desc:'Semideus mumificado que manipula tempo e areias.', inimigos:[{nome:'Faraó Etéreo',P:12,H:9,R:12,qtd:1}], recompensa:{tipo:'mista',ouro:600,xp:5,item:{nome:'Relíquia do Tempo Estelar',valor:220,desc:'Relíquia lendária'}} }
    ],
  },
  montanha: {
    encontros: [
      { tipo:'teste', titulo:'Vento Congelante', desc:'Gélido vento dos picos.', testes:[{attr:'R',meta:7,desc:'Prevenir hipotermia (Resistência/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (frio)'} },
      { tipo:'combate', titulo:'Yetis', desc:'Gigantes brancos das neves.', inimigos:[{nome:'Yeti',P:8,H:4,R:9,qtd:2}], recompensa:{tipo:'item',nome:'Peles de Yeti',valor:100,desc:'2 peles'} },
      { tipo:'teste', titulo:'Avalanche Súbita', desc:'Neve desce a encosta.', testes:[{attr:'H',meta:9,desc:'Fuga para rocha segura (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (fuga)'} },
      { tipo:'combate', titulo:'Grifos', desc:'Predadores alados majestosos.', inimigos:[{nome:'Grifo',P:8,H:7,R:7,qtd:1}], recompensa:{tipo:'item',nome:'Pena de Grifo Majestosa',valor:120,desc:'Pena'} },
      { tipo:'teste', titulo:'Ponte de Gelo', desc:'Travessia precária alpina.', testes:[{attr:'H',meta:7,desc:'Equilíbrio alpino (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (equilíbrio)'} },
      { tipo:'teste', titulo:'Fenda Oculta', desc:'Gelo cede sob os pés.', testes:[{attr:'H',meta:7,desc:'Reflexos de borda (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (reflexos)'} },
      { tipo:'combate', titulo:'Orcs das Montanhas', desc:'Bárbaros de machados de gelo.', inimigos:[{nome:'Orc das Montanhas',P:7,H:5,R:7,qtd:3}], recompensa:{tipo:'ouro',qtd:60,nome:'Machado de gelo + moedas'} },
      { tipo:'teste', titulo:'Ar Rarefeito', desc:'Altitude afeta a respiração.', testes:[{attr:'R',meta:7,desc:'Controle respiratório (Resistência/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (altitude)'} },
      { tipo:'combate', titulo:'Harpias de Gelo', desc:'Penas azuladas congeladas.', inimigos:[{nome:'Harpia de Gelo',P:6,H:7,R:5,qtd:2}], recompensa:{tipo:'item',nome:'Penas Azuladas',valor:50,desc:'2 penas'} },
      { tipo:'teste', titulo:'Deslizamento de Gelo', desc:'Encosta lisa.', testes:[{attr:'H',meta:7,desc:'Desvio rápido (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (desvio)'} },
      { tipo:'combate', titulo:'Elementares de Gelo', desc:'Massas de gelo eterno.', inimigos:[{nome:'Elemental de Gelo',P:8,H:4,R:9,qtd:1}], recompensa:{tipo:'item',nome:'Núcleo de Gelo Eterno',valor:130,desc:'Núcleo'} },
      { tipo:'teste', titulo:'Enigma do Santuário', desc:'Relevos de gelo a decifrar.', testes:[{attr:'H',meta:9,desc:'Decifrar relevos (Habilidade/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (decifração)'} },
      { tipo:'combate', titulo:'Corujas Gigantes', desc:'Camuflagem nevada.', inimigos:[{nome:'Coruja Gigante',P:5,H:8,R:5,qtd:2}], recompensa:{tipo:'item',nome:'Penas de Camuflagem',valor:40,desc:'2 penas'} },
      { tipo:'combate', titulo:'Xamã dos Gigantes de Gelo', desc:'Cetro rúnico de gelo.', inimigos:[{nome:'Xamã de Gelo',P:7,H:6,R:8,qtd:1}], recompensa:{tipo:'item',nome:'Cetro de Gelo Rúnico',valor:160,desc:'Cetro'} },
      { tipo:'teste', titulo:'Isolamento Psicológico', desc:'Vertigem das alturas.', testes:[{attr:'R',meta:7,desc:'Resistir à vertigem (Resistência/Mental)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (vertigem)'} },
      { tipo:'combate', titulo:'Lobos das Neves', desc:'Matilha alpina.', inimigos:[{nome:'Lobo das Neves',P:6,H:7,R:6,qtd:3}], recompensa:{tipo:'item',nome:'Peles de Lobo Alpino',valor:70,desc:'2 peles'} },
      { tipo:'teste', titulo:'Corte de Cabo', desc:'Escalada com mãos livres.', testes:[{attr:'H',meta:9,desc:'Escalada forçada (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (escalada)'} },
      { tipo:'combate', titulo:'Espectros Alpinos', desc:'Almas presas no gelo.', inimigos:[{nome:'Espectro Alpino',P:6,H:7,R:6,qtd:2}], recompensa:{tipo:'item',nome:'Cristal de Gelo Espectral',valor:90,desc:'Cristal'} },
      { tipo:'teste', titulo:'Tempestade Branca', desc:'Blizzard polar.', testes:[{attr:'R',meta:9,desc:'Resistir ao frio polar (Resistência/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (blizzard)'} },
      { tipo:'combate', titulo:'Mantícoras', desc:'Espinhos de cauda venenosos.', inimigos:[{nome:'Mantícora',P:9,H:6,R:8,qtd:1}], recompensa:{tipo:'item',nome:'Espinhos de Cauda',valor:140,desc:'3 espinhos'} },
      { tipo:'teste', titulo:'Gruta de Gelo Azul', desc:'Cristais de quartzo.', testes:[{attr:'H',meta:7,desc:'Explorar com cuidado (Habilidade/Físico)'}], recompensa:{tipo:'item',nome:'Cristal de Quartzo Azul',valor:110,desc:'Cristal lapidado'} },
      { tipo:'combate', titulo:'Golems de Gelo e Rocha', desc:'Autômatos de permafrost.', inimigos:[{nome:'Golem de Gelo',P:9,H:3,R:10,qtd:1}], recompensa:{tipo:'item',nome:'Núcleo de Permafrost',valor:150,desc:'Núcleo'} },
      { tipo:'teste', titulo:'Eremita da Montanha', desc:'Ensinamento de foco.', testes:[{attr:'H',meta:7,desc:'Mostrar respeito (Habilidade/Social)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (foco mental)'} },
      { tipo:'combate', titulo:'Arautos da Tempestade', desc:'Núcleos de vento eletrificado.', inimigos:[{nome:'Arauto da Tempestade',P:7,H:7,R:7,qtd:2}], recompensa:{tipo:'item',nome:'Núcleo de Vento Eletrificado',valor:140,desc:'Núcleo'} },
      { tipo:'teste', titulo:'Vibração Sísmica na Geleira', desc:'Fissuras se abrem.', testes:[{attr:'H',meta:9,desc:'Saltar fissuras (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (salto)'} },
      { tipo:'combate', titulo:'Wyvern dos Picos', desc:'Réptil alado venenoso.', inimigos:[{nome:'Wyvern dos Picos',P:10,H:7,R:9,qtd:1}], recompensa:{tipo:'item',nome:'Glândula de Veneno de Wyvern',valor:180,desc:'Glândula'} },
      { tipo:'teste', titulo:'Exaustão de Escalada', desc:'Condicionamento no limite.', testes:[{attr:'R',meta:7,desc:'Condicionamento muscular (Resistência/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (condicionamento)'} },
      { tipo:'combate', titulo:'Sentinelas de Pedra', desc:'Placas de granito antigo.', inimigos:[{nome:'Sentinela de Pedra',P:8,H:3,R:10,qtd:2}], recompensa:{tipo:'item',nome:'Placas de Granito Antigo',valor:80,desc:'2 placas'} },
      { tipo:'teste', titulo:'Relâmpago Alpino', desc:'Descargas nos picos.', testes:[{attr:'H',meta:7,desc:'Desviar da carga (Habilidade/Físico)'}], recompensa:{tipo:'xp',qtd:1,nome:'+1 XP (desvio elétrico)'} },
      { tipo:'boss', titulo:'O Dragão dos Picos', desc:'Dragão ancestral dos cumes nevados.', inimigos:[{nome:'Dragão dos Picos',P:14,H:8,R:14,qtd:1}], recompensa:{tipo:'mista',ouro:800,xp:5,item:{nome:'Escama de Dragão Ancestral',valor:250,desc:'Escama lendária'}} }
    ],
  }};

const RECOMPENSAS = [
  { nome: "Bolsa de Tibar", tipo: "ouro", valorMin: 20, valorMax: 120, desc: "Moedas de ouro (Tibar)" },
  { nome: "Poção de Cura", tipo: "consumivel", valor: 30, efeito: "cura5", usavel: true, desc: "Recupera 5 PV ao usar" },
  { nome: "Cristal de Mana", tipo: "consumivel", valor: 25, efeito: "mana5", usavel: true, desc: "Recupera 5 PM ao usar" },
  { nome: "Suprimentos de Viagem", tipo: "misc", valor: 15, usavel: false, desc: "Comida e material de acampamento" },
  { nome: "Gema Bruta", tipo: "misc", valor: 40, usavel: false, desc: "Pode ser vendida no mercado" },
  { nome: "Adaga Enferrujada", tipo: "equipamento", valor: 18, usavel: false, desc: "Arma simples de qualidade mediana" },
  { nome: "Amuleto de Proteção", tipo: "equipamento", valor: 50, usavel: false, desc: "Pequeno talismã protetor" },
  { nome: "Pergaminho Antigo", tipo: "misc", valor: 35, usavel: false, desc: "Documento misterioso de valor histórico" }
];

/* ===== [GERACAO_ENCONTRO] linhas originais 5700-5927 ===== */
/* ---------- Geração de Encontro ---------- */

/** Converte recompensa do formato novo (por encontro) para o formato de concessão */
function normalizarRecompensaEncontro(rec) {
  if (!rec) return gerarRecompensa();
  if (rec.tipo === 'ouro') {
    return { tipo: 'ouro', nome: rec.nome || 'Tibar', qtd: rec.qtd || 10, desc: (rec.nome || 'Ouro') + ` (${rec.qtd} Tibar)` };
  }
  if (rec.tipo === 'xp') {
    return { tipo: 'xp', nome: rec.nome || '+1 XP', qtd: rec.qtd || 1, desc: rec.nome || '+1 XP' };
  }
  if (rec.tipo === 'item') {
    return {
      id: 'item_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      nome: rec.nome,
      tipo: 'misc',
      valor: rec.valor || 10,
      qtd: 1,
      usavel: false,
      desc: rec.desc || rec.nome
    };
  }
  if (rec.tipo === 'mista') {
    // para bosses: prioriza item + marca ouro/xp extras
    const out = rec.item ? {
      id: 'item_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      nome: rec.item.nome,
      tipo: 'equipamento',
      valor: rec.item.valor || 50,
      qtd: 1,
      usavel: false,
      desc: rec.item.desc || rec.item.nome,
      _extraOuro: rec.ouro || 0,
      _extraXp: rec.xp || 0
    } : { tipo: 'ouro', nome: 'Saque do Boss', qtd: rec.ouro || 100 };
    return out;
  }
  return gerarRecompensa();
}

/** Poder total de um encontro de combate (soma P+H+R × quantidade). */
function poderEncontro(enc) {
  if (!enc || !Array.isArray(enc.inimigos) || !enc.inimigos.length) return 0;
  return enc.inimigos.reduce((s, e) => {
    const unit = (Number(e.P) || 0) + (Number(e.H) || 0) + (Number(e.R) || 0);
    return s + unit * (Number(e.qtd) || 1);
  }, 0);
}

/**
 * Sorteia encontro respeitando a Escala de Perigo (threatSelect).
 * Antes: sorteio uniforme → maioria dos combates vinha forte (mediana alta).
 * Agora: pesos por faixa de poder + chance de boss conforme ameaça.
 */
function pickEncontroBalanceado(lista, threatLevel) {
  if (!lista || !lista.length) return null;
  const tl = Math.max(1, Math.min(4, parseInt(threatLevel, 10) || 2));
  const bosses = lista.filter(e => e.tipo === 'boss');
  const normais = lista.filter(e => e.tipo !== 'boss');
  const bossChance = ({ 1: 0.01, 2: 0.04, 3: 0.10, 4: 0.18 })[tl] || 0.04;
  if (bosses.length && Math.random() < bossChance) {
    return bosses[Math.floor(Math.random() * bosses.length)];
  }
  if (!normais.length) return lista[Math.floor(Math.random() * lista.length)];

  function weightFor(enc) {
    const tipo = enc.tipo || '';
    // testes / sociais: mantém variedade sem esmagar combates
    if (tipo !== 'combate') return 1.15;
    const power = poderEncontro(enc);
    // faixas calibradas na tabela atual (mediana ~19 por inimigo, totais ~20–50)
    if (tl === 1) {
      if (power <= 22) return 6.0;
      if (power <= 32) return 2.5;
      if (power <= 42) return 0.45;
      return 0.08;
    }
    if (tl === 2) {
      if (power <= 22) return 2.0;
      if (power <= 36) return 3.5;
      if (power <= 48) return 1.4;
      return 0.35;
    }
    if (tl === 3) {
      if (power <= 28) return 0.4;
      if (power <= 45) return 2.2;
      return 3.2;
    }
    // tl 4 extremo
    if (power <= 32) return 0.25;
    if (power <= 48) return 1.3;
    return 4.0;
  }

  const weights = normais.map(weightFor);
  let total = weights.reduce((a, b) => a + b, 0);
  if (total <= 0) return normais[Math.floor(Math.random() * normais.length)];
  let r = Math.random() * total;
  for (let i = 0; i < normais.length; i++) {
    r -= weights[i];
    if (r <= 0) return normais[i];
  }
  return normais[normais.length - 1];
}

/** Ajuste fino de atributos dos inimigos conforme ameaça. */
function aplicarEscalaAmeacaInimigos(enemies, threatLevel) {
  const tl = Math.max(1, Math.min(4, parseInt(threatLevel, 10) || 2));
  const adj = ({ 1: -2, 2: 0, 3: 1, 4: 2 })[tl] || 0;
  (enemies || []).forEach(e => {
    e.P = Math.max(1, Math.min(15, (Number(e.P) || 1) + adj));
    e.H = Math.max(0, Math.min(15, (Number(e.H) || 0) + adj));
    e.R = Math.max(1, Math.min(15, (Number(e.R) || 1) + adj));
  });
  return enemies;
}

function rotuloFaixaCombate(enemies) {
  if (!enemies || !enemies.length) return '';
  const avg = enemies.reduce((s, e) => s + (Number(e.P)||0)+(Number(e.H)||0)+(Number(e.R)||0), 0) / enemies.length;
  if (avg <= 11) return '🟢 Fraco';
  if (avg <= 16) return '🟡 Moderado';
  if (avg <= 21) return '🟠 Forte';
  return '🔴 Muito forte';
}

function generateNewFormatEvent(biomeKey, biomeData, party, threatLevel) {
  const lista = biomeData.encontros;
  const encontro = pickEncontroBalanceado(lista, threatLevel)
    || lista[Math.floor(Math.random() * lista.length)];

  currentEventType = encontro.tipo;
  const recompensa = normalizarRecompensaEncontro(encontro.recompensa);
  window.currentReward = recompensa;
  window.currentEncounterMeta = encontro; // para testes com meta

  const recompensaTexto = recompensa.tipo === 'ouro'
    ? `${recompensa.nome}: ${recompensa.qtd} Tibar`
    : recompensa.tipo === 'xp'
      ? `${recompensa.nome}`
      : `${recompensa.nome}${recompensa.desc ? ' — ' + recompensa.desc : ''} (valor: ${recompensa.valor || 0} Tibar)`
        + (recompensa._extraOuro ? ` + ${recompensa._extraOuro} Tibar` : '')
        + (recompensa._extraXp ? ` + ${recompensa._extraXp} XP` : '');

  const hookBanner = currentAdventureHook
    ? `<div style="background:rgba(168,85,247,0.12); border:1px solid var(--magic); border-radius:8px; padding:8px 12px; margin-bottom:12px; font-size:0.85rem;">
         <strong style="color:var(--magic);">🎯 Gancho Ativo:</strong> ${currentAdventureHook.titulo}
       </div>`
    : '';

  let typeClass = 'type-desafio';
  let typeLabel = '🚨 Desafio / Teste';
  if (encontro.tipo === 'combate') { typeClass = 'type-combate'; typeLabel = '⚔️ Combate'; }
  if (encontro.tipo === 'boss') { typeClass = 'type-combate'; typeLabel = '💀 BOSS OCULTO'; }
  if (encontro.tipo === 'teste') { typeClass = 'type-desafio'; typeLabel = '🎲 Teste de Atributo'; }

  currentEventDataForLog = {
    tipo: encontro.tipo === 'boss' ? 'Boss' : (encontro.tipo === 'combate' ? 'Combate' : 'Teste'),
    titulo: encontro.titulo,
    desc: encontro.desc,
    party: party.join(', ')
  };

  let html = `${hookBanner}
    <div class="event-header">
      <span class="event-type ${typeClass}">${typeLabel}</span>
      <span style="font-size:0.8rem; color:var(--muted)">Grupo: ${party.join(', ')}</span>
    </div>
    <div class="detail-row" style="font-size:1.1rem; font-weight:700; color:var(--accent);">${encontro.titulo}</div>
    <div class="detail-row">${encontro.desc}</div>`;

  let actionButtons = '';

  if (encontro.tipo === 'teste') {
    const testesHtml = (encontro.testes || []).map(t =>
      `<div style="margin:4px 0;">• <strong>${t.desc}</strong> — Meta <span style="color:var(--accent)">${t.meta}</span> (2D6 + ${t.attr} ≥ ${t.meta})</div>`
    ).join('');
    html += `<div class="rule-badge"><strong>Testes possíveis:</strong>${testesHtml}</div>
      <div class="detail-row"><strong>Recompensa:</strong> ${recompensaTexto}</div>`;
    const first = (encontro.testes && encontro.testes[0]) || { attr: 'H', meta: 9 };
    actionButtons = `
      <button class="btn" onclick="performSkillTestMeta('${first.attr}', ${first.meta})">🎲 Testar ${first.attr} (Meta ${first.meta})</button>
      ${(encontro.testes || []).slice(1).map(t =>
        `<button class="btn btn-outline" onclick="performSkillTestMeta('${t.attr}', ${t.meta})">🎲 Testar ${t.attr} (Meta ${t.meta})</button>`
      ).join('')}
      <button class="btn btn-success" onclick="resolveEncounter(true)">✅ Vitória (+1 XP + Recompensa)</button>
      <button class="btn btn-danger" onclick="resolveEncounter(false)">❌ Fracasso (-1 XP)</button>
      <button class="btn btn-outline" onclick="saveCurrentEventToLog()">📥 Salvar no Diário</button>`;
  } else if (encontro.tipo === 'combate' || encontro.tipo === 'boss') {
    const enemies = [];
    (encontro.inimigos || []).forEach(e => {
      let q = e.qtd || 1;
      // Em ameaça baixa, reduz quantidade excessiva (ex.: 3 → 2)
      if ((parseInt(threatLevel, 10) || 2) <= 1 && q > 2) q = 2;
      for (let i = 0; i < q; i++) {
        enemies.push({
          nome: q > 1 ? `${e.nome} #${i+1}` : e.nome,
          P: e.P, H: e.H, R: e.R,
          vantagens: e.vantagens || [],
          bestiarioId: e.bestiarioId || e.id || null
        });
      }
    });
    // Escala conforme ameaça (baixo enfraquece; alto fortalece)
    if (encontro.tipo !== 'boss') {
      aplicarEscalaAmeacaInimigos(enemies, threatLevel);
    } else if ((parseInt(threatLevel, 10) || 2) >= 3) {
      aplicarEscalaAmeacaInimigos(enemies, threatLevel);
    }
    currentEnemiesForBattle = enemies;
    const faixa = rotuloFaixaCombate(enemies);
    html += `<div class="detail-row"><strong>Inimigos:</strong> <span style="font-size:0.8rem;color:var(--muted)">${faixa}</span>
      <div class="enemy-list">${enemies.map(e => `<span class="enemy-chip">${e.nome} (P${e.P} H${e.H} R${e.R})</span>`).join('')}</div>
    </div>
    <div class="detail-row"><strong>Espólio:</strong> ${recompensaTexto}</div>`;
    actionButtons = `
      <button class="btn" style="background:linear-gradient(135deg,#a855f7,#6366f1); color:#fff;" onclick="startEncounterBattle()">⚔️ Ir para Arena de Batalha</button>
      <button class="btn btn-success" onclick="resolveEncounter(true)">✅ Vitória na Batalha (+1 XP + Recompensa)</button>
      <button class="btn btn-danger" onclick="resolveEncounter(false)">❌ Derrota (-1 XP)</button>
      <button class="btn btn-outline" onclick="saveCurrentEventToLog()">📥 Salvar no Diário</button>`;
  }

  document.getElementById('eventContent').innerHTML = html;
  document.getElementById('eventActionButtons').innerHTML = actionButtons;
  document.getElementById('resultCard').classList.remove('hidden');
}


