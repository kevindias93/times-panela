# Panela FC ⚽

App web (React + Vite + Firebase) pra organizar a pelada: cada jogador confirma
presença no próprio celular, a lista sincroniza pra todo mundo em tempo real, e
quando fecha um time o botão de **sorteio** libera — times montados por posição
(1 goleiro, 2 zagueiros, 3 meias, 1 atacante) e equilibrados por habilidade.

## Como rodar

```bash
npm install
cp .env.example .env   # preencha com as chaves do seu Firebase
npm run dev
```

## Configurar o Firebase (uma vez)

1. Crie um projeto em https://console.firebase.google.com
2. **Authentication** → Sign-in method → ative **Anônimo**.
3. **Firestore Database** → criar banco (modo produção).
4. **Storage** → ativar (é onde ficam as fotos).
5. Nas **Configurações do projeto → Seus apps (Web)**, copie o objeto de config
   e jogue os valores no seu `.env` (arquivo `.env.example` mostra os nomes).
6. Publique as regras dos arquivos `firestore.rules` e `storage.rules`
   (cole no console ou use `firebase deploy --only firestore:rules,storage`).

## Como funciona

- **Senha única** (`VITE_SENHA_PANELA`): a galera digita pra entrar. Por baixo,
  o app faz login anônimo no Firebase — as regras só aceitam quem está autenticado.
- **Jogador fixo**: cadastro permanente (nome, posição, habilidade 1–5, foto).
- **Avulso do dia**: entra já confirmado e some quando você clica em *Nova pelada*.
- **Confirmar / retirar**: cada um toca no próprio nome. Todos veem na hora.
- **Sortear**: só libera quando dá pra fechar pelo menos 1 time. Depois de
  sortear, **trava** — combinem de rodar só às 18h, com todos no campo.
- **Nova pelada**: zera as presenças, apaga os avulsos e libera um novo sorteio.


## Telas

- **Presença** — confirma/retira, cadastro fixo e avulso, e o sorteio.
- **Times** — escalação estilo video game (Bomba Patch/PES): mini-campo com a formação e lista numerada por posição.
- **Ranking** — presenças da temporada (soma +1 pra cada confirmado quando a rodada é encerrada).
- **Pé de rato** — votação ao vivo (voto por aparelho/uid) do pior da rodada; o mais votado é coroado, vai pra galeria da vergonha e vira um **card em imagem** (canvas) com a foto do jogador pra mandar no zap.

### Fundo IA (grátis) no card
No gerador do card há o botão **🎨 Fundo IA (grátis)**: ele usa o serviço público e sem chave Pollinations (`image.pollinations.ai`) pra gerar só a **arte de fundo** grafitada; a **foto real** do jogador fica no recorte por cima. É gratuito, depende de internet e pode demorar/rate-limitar. Trocar de arte é só clicar de novo. (Redesenhar o rosto real do jogador exigiria um serviço de imagem pago — fica pra depois.)

### Fim da noite
Na aba **Pé de rato**, toque em *Abrir votação*. Cada aparelho vota uma vez (dá pra trocar o voto). Em *Fechar votação e coroar*: o app grava o vencedor no histórico, soma as presenças no ranking, apaga os avulsos e libera a próxima pelada.


## Tela branca? (resolve rápido)

1. **Rode com `npm run dev`** e abra o endereço que o terminal mostra (ex.: http://localhost:5173). **Não abra o `index.html` direto** (dois cliques) — isso dá tela branca, porque precisa do servidor do Vite.
2. **Crie o `.env`** de verdade: `cp .env.example .env` e preencha as chaves do Firebase. Depois **pare e rode de novo** o `npm run dev` (o Vite só lê o `.env` ao iniciar). Sem as chaves, o app agora mostra um aviso na tela em vez de ficar branco.
3. Se aparecer um erro na tela ou no **console do navegador (F12 → Console)**, é ele que aponta o problema — manda o texto.


## Novidades (v2)

- **Sorteio limitado a 2 times** — o resto vai pro banco.
- **Posição secundária** — ex.: goleiro que joga na linha, ou jogador de linha que cobre o gol. O sorteio usa a secundária pra preencher faltas.
- **Editar jogadores** — botão ✎ em cada jogador.
- **Encerrar partida** — informa o placar, sobe a foto do time (vira card com o resultado) e (opcional) avalia cada jogador. Isso abre a votação do pé de rato **só com quem jogou**.
- **Rankings** — três abas: Presenças, Vitórias e Avaliação (nota média).
- **Histórico** — 5ª aba, com placar, time vencedor (foto) e o pé de rato de cada rodada.
- **Card do pé de rato** melhorado (grafite, patas, contorno) e botão **Fundo IA (grátis)** corrigido (agora carrega por fetch/blob).


## Novidades (v2.1)

- **Tudo compartilhado e salvo**: time sorteado, confirmações, votação e histórico ficam no Firestore e sincronizam em tempo real pra todo mundo — ao atualizar a página, continua tudo lá. (Se o time não aparecer pra outros, é a regra do Firestore da coleção `estado` não publicada; o app agora avisa o erro na tela.)
- **Habilidade = média da galera**: cada pessoa avalia o jogador de 1 a 5 tocando nas estrelas na lista; a estrela exibida é a **média** das avaliações (por aparelho/uid) e é ela que o sorteio usa. No cadastro você só dá uma **nota inicial**, que já entra como 1 voto.

## Estrutura

```
src/
  firebase.js            # conexão com o Firebase
  lib/sorteio.js         # regra dos times + equilíbrio por habilidade
  components/
    Cadastro.jsx         # form de jogador fixo / avulso (com upload de foto)
    Escalacao.jsx        # quadro tático com os times
  App.jsx                # tela de senha, lista em tempo real, sorteio
```

## Ideias pra depois

- Botão de capitão/admin pra anular uma rodada do pé de rato se pegar pesado.
- Desempate do pé de rato (voto de minerva do capitão) e "não votar em si mesmo".
- Editar/excluir jogador fixo.
- PWA pra instalar no celular como app.
