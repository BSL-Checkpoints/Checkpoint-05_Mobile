<h1 align="center">🛠️ Tech Lab</h1>
<h4 align="center">
  Loja de peças e componentes de PC/hardware — Checkpoint 5 · React Native · Expo SDK 54 · TypeScript
</h4>

---

## 👥 Integrantes do Grupo

<table>
  <tr>
    <td width="130">
      <img src="https://github.com/sSofia-s.png" width="120" style="border-radius: 50%;"/>
    </td>
    <td>
      <b>Sofia Siqueira Fontes</b><br/>
      <b>RM:</b> 563829 &nbsp;&nbsp;|&nbsp;&nbsp;<b>Turma:</b> 2TDSPG - FIAP <br/>
    </td>
  </tr>
  <tr>
    <td width="130">
      <img src="https://github.com/manuelalacerda.png" width="120" style="border-radius: 50%;"/>
    </td>
    <td>
      <b>Manuela de Lacerda Soares</b><br/>
      <b>RM:</b> 564887 &nbsp;&nbsp;|&nbsp;&nbsp;<b>Turma:</b> 2TDSPG - FIAP <br/>
    </td>
  </tr>
</table>

---

## 🛠️ Tecnologias utilizadas
 
| Categoria | Tecnologias |
|---|---|
| **Mobile** | React Native 0.81.5 • Expo SDK 54 • TypeScript |
| **Dados e cache** | Axios • TanStack Query |
| **Navegação** | React Navigation (Native Stack), com guarda de rotas por sessão |
| **Autenticação** | `expo-secure-store` (a sessão do comprador sobrevive ao fechar o app) |
| **Movimento** | `react-native-reanimated` • `react-native-worklets` |
| **Recursos do aparelho** | `expo-image-picker` (galeria) • `expo-location` (GPS) • `react-native-maps` (mapa) • `expo-notifications` (avisos) |
| **Armazenamento local** | `@react-native-async-storage/async-storage` (favoritos e avisos já mostrados) |
| **Estilo** | Paleta e componentes próprios em `src/styles/style.ts` |
 
---

## 📁 Estrutura de pastas

```text
└── Checkpoint-05_mobile/
    ├── README.md
    ├── app.json
    ├── App.tsx
    ├── babel.config.js
    ├── COMECE-AQUI.md
    ├── index.js
    ├── package.json
    ├── tsconfig.json
    ├── .env.example
    └── src/
        ├── env.ts
        ├── navigation.ts
        ├── components/
        │   ├── FavoriteButton.tsx
        │   ├── NotificationsBootstrap.tsx
        │   ├── PickupMap.tsx
        │   ├── PressableScale.tsx
        │   ├── ProductDetailScreen.tsx
        │   ├── ReviewFormScreen.tsx
        │   ├── ReviewsSection.tsx
        │   ├── Stars.tsx
        │   └── ui.tsx
        ├── contexts/
        │   └── FavoritesContext.tsx
        ├── hooks/
        │   ├── useCart.ts
        │   ├── useCartMutations.ts
        │   ├── useDeviceLocation.ts
        │   ├── useNotificationPermission.ts
        │   ├── useOrderActions.ts
        │   ├── useOrders.ts
        │   ├── usePickupPoints.ts
        │   ├── useProduct.ts
        │   ├── useProducts.ts
        │   └── useReviews.ts
        ├── lib/
        │   ├── format.ts
        │   ├── motion.ts
        │   ├── navigationRef.ts
        │   ├── notifications.ts
        │   ├── orders.ts
        │   ├── queryClient.ts
        │   ├── queryKeys.ts
        │   └── storeMessages.ts
        ├── screens/
        │   ├── CartScreen.tsx
        │   ├── CheckoutScreen.tsx
        │   ├── ForgotPasswordScreen.tsx
        │   ├── OrderScreen.tsx
        │   ├── OrdersScreen.tsx
        │   ├── PickupPointsScreen.tsx
        │   ├── ProductDetailScreen.tsx
        │   ├── ProductsScreen.tsx
        │   ├── ProfileScreen.tsx
        │   ├── SignInScreen.tsx
        │   └── SignUpScreen.tsx
        ├── services/
        │   ├── auth.ts
        │   ├── cart.ts
        │   ├── http.ts
        │   ├── orders.ts
        │   ├── pickup.ts
        │   ├── products.ts
        │   ├── push.ts
        │   ├── reviews.ts
        │   ├── shipping.ts
        │   └── uploads.ts
        ├── session/
        │   └── session.tsx
        ├── styles/
        │   └── style.ts
        └── types/
            ├── api.ts
            ├── notifications.ts
            ├── pickup.ts
            └── reviews.ts
```

---

## ▶️ Como rodar

### Pré-requisitos
- Node.js e npm
- Expo Go instalado no celular, ou emulador Android/iOS

### Passo a passo
```bash
git clone https://github.com/BSL-Checkpoints/Checkpoint-05_Mobile.git
cd Checkpoint-05_Mobile
npm install
cp .env.example .env
```

Preencha o `.env`:
```env
EXPO_PUBLIC_API_KEY=[sua chave ao rodar o app]
EXPO_PUBLIC_STUDENT_RM=[seu RM ao rodar o app]
```

Depois:
```bash
npx expo start
```
Leia o QR code pelo Expo Go, ou pressione `a` para abrir no emulador Android.

---

## 🧠 Decisões de produto

- **Que loja é essa:** Tech Lab, é uma loja de peças e componentes de PC/hardware.
- **Para quem:** montadores e entusiastas que buscam peças específicas com estoque e variantes claras (ex: capacidade, cor, modelo).
- **Fluxo:** catálogo → detalhe → carrinho → checkout **(entrega ou retirada)** → pagamento → histórico, com cotação de frete no carrinho e avaliações no produto.
- **Avaliações:** só quem comprou pode avaliar. O comentário tem no mínimo 10 caracteres (evita avaliação vazia) e até 5 fotos opcionais.
- **Retirada:** o cliente vê os pontos ordenados por distância (quando o aparelho informa a posição) e escolhe um no checkout.
- **Notificações:** a permissão é pedida quando a pessoa favorita o primeiro produto. Nunca na abertura do app.
- **Identidade (RF-61):** as telas novas usam a paleta e os componentes que foram definidos na construção inicial do app.

---

## ⚙️ Decisões técnicas

1. **Cotação de frete no carrinho** — adicionamos um fluxo de consulta de frete por CEP (`services/shipping.ts`, `CartScreen.tsx`) que não faz parte do app de referência, via serviço próprio em vez de lógica solta na tela, para não violar o RF-02 (nenhuma tela importa Axios diretamente).
2. **Mutations de compra sem atualização otimista** — checkout e pagamento (`useOrderActions.ts`) esperam a resposta do servidor antes de atualizar a UI, já que envolvem estoque e dinheiro, seguindo a orientação do enunciado.
3. **Linha do tempo do pedido** — `OrderScreen.tsx` consome `useOrderTimeline` para exibir o histórico de mudanças de status do pedido (PENDING → PAID/CANCELLED), tornando o estado do pedido visível em vez de apenas o status atual.
4. **Fluxo de recuperação de senha em duas fases numa única tela** — `ForgotPasswordScreen.tsx` concentra pedido de código e redefinição na mesma tela, com login automático após redefinir, evitando uma tela extra apenas para reautenticar.

### Checkpoint 5:

5. **A média da avaliação vem do produto e nunca é calculada no app** (RF-35) - `GET /products/:id` já traz `rating` com média e contagem.
6. **`can-review` antes do formulário** (RF-37) - a regra "só quem comprou avalia" vive no servidor. Perguntamos antes e usamos o *motivo* (`NOT_PURCHASED`, `ALREADY_REVIEWED`) para escolher o texto da tela, em vez de a pessoa escrever tudo e descobrir só no POST.
7. **Localização com três desfechos e timeout** (RF-43, RF-45) - concedida, negada e concedida sem posição. A leitura do GPS tem timeout de 8 s e cai na última posição conhecida; se não houver, a tela explica e oferece "Tentar de novo". Nunca fica presa em "Obtendo localização".
8. **A lista de pontos não espera o GPS** — busca primeiro sem posição (ordem de cadastro) e, quando a posição chega, busca de novo ordenada. A posição faz parte da query key, porque as duas buscas são dados diferentes.

---

## 🔔 Caminho escolhido para notificações: **B (notificação local)**
 
**Por quê:** o Caminho B funciona só com o Expo Go, sem development build, sem Firebase. Preferimos entregar um caminho completo e testado a entregar o A pela metade.
 
---

## 🎬 Defesa do movimento
 
Todas as durações, molas e regras vivem em **`src/lib/motion.ts`** (RF-62). A constante **`ANIMATIONS_ENABLED`** desse arquivo desliga todas as animações do app (RF-55).
 
### O que foi mantido e por quê
 
| Animação | Onde | Por que ficou |
|---|---|---|
| Mola ao tocar (afunda e volta) | botões, cards, ícones do cabeçalho, quantidade do carrinho | confirma que o toque foi recebido (RF-49) |
| "Pulo" do coração | favoritar | a ação não navega; sem isso a pessoa não saberia se funcionou (RF-50) |
| Entrada escalonada | lista de produtos | mostra que o conteúdo chegou; **teto de 8 itens e atraso máximo de 420 ms**, para nunca atrasar a lista (RF-51) |
| Saída + acomodação | itens do carrinho | explica *o que* sumiu e *para onde* os outros foram (RF-52) |
| Três pontos pulsando | carregamento | mostra que o app está vivo, no lugar de um texto parado (RF-53) |
 
### O que foi cortado e por quê
- **Transição entre telas personalizada:** a do sistema já é familiar e não confirma nenhuma ação.
- **Efeito de rolagem (parallax, cabeçalho que encolhe):** decora, não informa, e pesa em aparelhos simples.
- **Entrada animada em todos os itens da lista:** só os 8 primeiros animam; depois disso o item aparece pronto, para não atrasar quem rola.
- **Animações em loop decorativas (brilho, botão pulsando):** não confirmam nada e cansam.
  
### "Reduzir movimento" do sistema (RF-54)
O app lê a preferência com `useReducedMotion` e passa ao modo reduzido. **O movimento é trocado, o feedback não é removido:**
 
| Normal | Com "Reduzir movimento" |
|---|---|
| Mola ao tocar | escurece com fade curto |
| Pulo do coração | o coração preenche e pisca (fade) |
| Entrada escalonada com deslocamento | fade curto, sem deslocamento |
| Saída deslizando + acomodação | fade; os itens ocupam o lugar sem deslizar |
| Três pontos pulsando | só o indicador nativo e o texto |
 
### Com a constante desligada (`ANIMATIONS_ENABLED = false`)
Nada anima, e o feedback continua: o botão escurece na hora, o coração troca de ♡ para ♥ e de cor, o item some. O app segue 100% utilizável.
 
---

## 🤖 Uso de IA

- **Partes em que a IA ajudou:**
  - o roteiro de divisão de tarefas entre a dupla e o roteiro de commits;
  - estrutura inicial e primeira versão do código do CP5;
  - o script de verificação da entrega e a estrutura deste README;
  - resolução de erros;
  -  utilizada na criação do README;
  
- **O que nós mudamos depois de gerar:** Detalhes e informações específicas sobre cada integrante da dupla e do código.
- **Como garantimos que entendemos o código:** Lemos cada arquivo, treinamos mudanças nos arquivos uns dos outros, garantimos que tudo estava funcionando.

---

## 🎯 Missões concluídas

| Integrante | Missões |
|---|---|
| **Moisés** | Usar o carrinho ✅ · Cotar frete ✅ · Configurar um webhook ✅ · Compra ponta a ponta ✅ · Emitir NF-e ✅ |
| **Sofia** | Cadastrar cliente final ✅ · Criar produto variável ✅ · Receber um webhook ✅ |
| **Manuela** | Tratar pagamento recusado ✅ · Reembolsar um pedido ✅ |

---

## 🗺️ Mapa de autoria

| Integrante | Responsabilidade | Principais arquivos |
|---|---|---|
| Moisés | Carrinho, frete, checkout ponta a ponta, webhook, NF-e | `src/screens/ProductsScreen.tsx`, `src/screens/CartScreen.tsx`, `src/screens/OrderScreen.tsx`, `src/services/shipping.ts` |
| Sofia | Login, cadastro de cliente, produto variável, recuperação de senha, webhook | `src/screens/SignInScreen.tsx`, `src/screens/ProductDetailScreen.tsx`, `src/screens/ForgotPasswordScreen.tsx` |
| Manuela | Cadastro de conta, histórico de pedidos, checkout, pagamento recusado, reembolso | `src/screens/SignUpScreen.tsx`, `src/screens/OrdersScreen.tsx`, `src/screens/CheckoutScreen.tsx` |

## Checkpoint 5:

| Integrante | Responsabilidade | Principais arquivos |
|---|---|---|
| Manuela | SDK 54, dependências, sessão persistente, Limpeza da chave e cadastro no painel, Avaliações (RF-35 a 42), Retirada e localização (RF-43 a 48) | `src/services/reviews.ts`, `src/hooks/useReviews.ts`, `src/components/Stars.tsx`, `src/services/pickup.ts`, `src/screens/CheckoutScreen.tsx`, `src/services/orders.ts` |
| Sofia | Notificações, Perfil e Favoritos (RF-56 a 60), Movimento (RF-49 a 55, 62), Testes de permissão, README, arguição | `src/hooks/useNotificationPermission.ts`, `src/screens/ProfileScreen.tsx`, `src/lib/motion.ts`, `src/components/FavoriteButton.tsx`, `src/screens/ProductsScreen.tsx`, `src/screens/ProductDetailScreen.tsx` |

---
