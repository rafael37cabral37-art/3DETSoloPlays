# 3DeT Victory — Solo RPG (versão modular)

Este projeto foi dividido a partir do arquivo único original em:

```
index.html
js/
 ├── core.js              (storage / localStorage / IndexedDB)
 ├── nucleo_app.js        (navegação, capa do menu)
 ├── mundo_tempo.js       (tempo, fome, descanso, mapa)
 ├── ficha_personagem.js  (criador de PJ, transformações, equipamento)
 ├── combate.js           (motor de dados, bestiário, resolução/XP)
 ├── arena.js             (seleção de grupo para batalha)
 ├── encontros.js         (encontros aleatórios)
 ├── masmorra.js          (gerador de masmorra)
 ├── mercado_templo.js    (catálogo e venda)
 ├── trabalho.js          (trabalho do herói)
 ├── missoes.js
 ├── sessao.js
 ├── campanha.js          (marcos, diário)
 ├── npcs.js              (NPCs, cidade, humor)
 ├── reputacao.js
 ├── oraculo.js
 ├── consequencias_falha.js
 ├── rivais.js
 ├── apostas.js
 ├── casa_veu_prateado.js
 ├── casa_luz_vermelha.js
 ├── servos.js
 ├── cenas_sociais.js
 └── init.js              (bootstrap — precisa ser o ÚLTIMO <script> carregado)
```

Os arquivos `.js` são **scripts clássicos** (não `type="module"`), então toda função
declarada em qualquer um deles fica global — os botões `onclick="..."` do HTML
continuam funcionando normalmente, não importa em qual arquivo a função esteja.

**Regra de ouro ao editar:** a pasta `js/` precisa continuar ao lado do `index.html`.
Se renomear um arquivo `.js`, atualize o `<script src="js/nome.js">` correspondente
no `index.html`. A ordem dos scripts pode mudar livremente, **exceto** `init.js`,
que deve continuar sendo o último.

---

## Trabalhando só pelo celular: usando GitHub Pages

Isso te dá um link público para jogar (testar no navegador do celular) e um editor
completo de código (VS Code no navegador) sem precisar instalar nada além do app
do GitHub ou usar o navegador.

### 1. Criar o repositório

1. Baixe o app **GitHub** (Android/iOS) ou acesse **github.com** pelo navegador do celular e faça login (crie uma conta se não tiver).
2. Toque em **+** → **New repository**.
3. Dê um nome, por exemplo `3det-victory-solo`.
4. Marque como **Public** (necessário para o GitHub Pages gratuito) ou **Private** (também funciona no plano gratuito atual do GitHub, mas confirme nas configurações de Pages do seu repositório).
5. Crie o repositório.

### 2. Subir os arquivos

Pelo navegador do celular (funciona bem no Chrome):

1. Abra o repositório recém-criado no site do GitHub.
2. Toque em **Add file → Upload files**.
3. Envie primeiro o `index.html` e o `README.md` (solto, na raiz).
4. Toque em **Add file → Upload files** de novo, e dessa vez envie **todos os arquivos dentro da pasta `js/`**. Ao arrastar/selecionar vários arquivos de uma vez, o GitHub tende a criar a pasta automaticamente se você mantiver o caminho — mas no navegador mobile às vezes ele solta tudo na raiz. Se isso acontecer, veja o passo 2b abaixo.
5. Confirme o commit ("Commit changes").

**2b. Se os arquivos `.js` caírem na raiz em vez de dentro de `js/`:**
No site do GitHub, dentro do repositório, toque em **Add file → Create new file**,
digite `js/core.js` no campo do nome (o `/` já cria a pasta), cole o conteúdo, e
repita para os demais — ou use o editor `github.dev` (próximo passo) para
arrastar/mover arquivos para dentro da pasta `js/` de forma mais visual.

### 3. Editar o código com um VS Code completo no navegador

1. Com o repositório aberto no navegador, troque `github.com` por `github.dev` na
   barra de endereço (ex.: `github.dev/seu-usuario/3det-victory-solo`) e dê Enter.
   Ou, dentro do repositório, aperte a tecla `.` (ponto) se estiver usando um
   navegador desktop; no celular, editar a URL é o caminho mais confiável.
2. Isso abre o **Visual Studio Code** rodando direto no navegador, com a árvore de
   arquivos do projeto na lateral — dá pra clicar em qualquer `.js`, editar, e
   salvar com `Ctrl+S` (ou o botão de salvar).
3. As alterações ficam pendentes até você ir na aba **Source Control** (ícone de
   ramificação) e fazer **Commit** → **Sync Changes** (isso publica direto no
   repositório, sem precisar de terminal nem Git instalado).

### 4. Ativar o GitHub Pages (link público para jogar)

1. No repositório, vá em **Settings** (aba do repositório, não da conta).
2. No menu lateral, toque em **Pages**.
3. Em **Source**, selecione **Deploy from a branch**.
4. Em **Branch**, selecione `main` (ou `master`) e a pasta `/ (root)`.
5. Toque em **Save**.
6. Espere 1–2 minutos. A própria página vai te mostrar o link, algo como:
   `https://seu-usuario.github.io/3det-victory-solo/`

Esse link abre o `index.html` publicado — carrega todos os `.js` da pasta `js/`
normalmente (ali não existe o problema de `file://` que existe ao abrir local pelo
gerenciador de arquivos). Toda vez que você editar algo pelo `github.dev` e der
**Sync Changes**, o site atualiza sozinho em menos de um minuto.

### Resumo do fluxo do dia a dia

1. Abrir `github.dev/seu-usuario/3det-victory-solo` → editar → **Commit & Sync**.
2. Abrir `seu-usuario.github.io/3det-victory-solo/` → jogar/testar no navegador.
3. Repetir.

Nenhum dos dois passos exige computador, terminal, ou instalar Git — só navegador.
