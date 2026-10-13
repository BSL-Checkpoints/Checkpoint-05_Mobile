<h1 align="center">🛠️ Tech Lab</h1>
<h4 align="center">
  Loja de peças e componentes de PC/hardware — Checkpoint 4 · React Native · Expo SDK 54 · TypeScript
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

**Repositório:** https://github.com/BSL-Checkpoints/Checkpoint_01-02-Mobile.git

---

## 🛠️ Tecnologias utilizadas

| Categoria | Tecnologias |
|---|---|
| **Mobile** | React Native 0.81.5 • Expo SDK 54 • TypeScript |
| **Dados e cache** | Axios (instância única em `services/http.ts`) • TanStack Query |
| **Navegação** | React Navigation (Native Stack), com guarda de rotas por sessão |
| **Autenticação** | `expo-secure-store` para o token do comprador |
| **Estilo** | Paleta e componentes próprios em `src/styles/style.ts` |

---

## 📁 Estrutura de pastas

```text
Checkpoint_01-02-Mobile/
├── src/
│   ├── assets/
│   ├── components/       # ui.tsx — Button, TextField, Badge, Loading, ErrorState
│   ├── hooks/             # useProducts, useProduct, useCart, useCartMutations,
│   │                       # useOrders, useOrderActions
│   ├── lib/                 # format.ts, orders.ts, queryClient.ts, queryKeys.ts
│   ├── screens/
│   ├── services/           # http.ts, auth.ts, products.ts, cart.ts, orders.ts, shipping.ts
│   ├── session/             # session.tsx (contexto de sessão do comprador)
│   ├── styles/               # style.ts
│   ├── types/                 # api.ts
│   └── env.ts
├── App.tsx
├── app.json
├── .env.example
├── package.json
└── tsconfig.json
```

---

## ▶️ Como rodar

### Pré-requisitos
- Node.js e npm
- Expo Go instalado no celular, ou emulador Android/iOS

### Passo a passo
```bash
git clone https://github.com/BSL-Checkpoints/Checkpoint_01-02-Mobile.git
cd Checkpoint_01-02-Mobile
npm install
cp .env.example .env
```

Preencha o `.env`:
```env
EXPO_PUBLIC_API_URL=https://api.mockmerce.com.br
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

- **Que loja é essa:** Tech Lab, uma loja de peças e componentes de PC/hardware.
- **Para quem:** montadores e entusiastas que buscam peças específicas com estoque e variantes claras (ex: capacidade, cor, modelo).
- **Por que essas telas:** o fluxo segue o padrão de compra (catálogo → detalhe → carrinho → checkout → pagamento → histórico), com a adição de cotação de frete no carrinho, relevante para compra de hardware com peso/porte variados.

## ⚙️ Decisões técnicas

1. **Cotação de frete no carrinho** — adicionamos um fluxo de consulta de frete por CEP (`services/shipping.ts`, `CartScreen.tsx`) que não faz parte do app de referência, via serviço próprio em vez de lógica solta na tela, para não violar o RF-02 (nenhuma tela importa Axios diretamente). Commit: `[completar hash]`
2. **Mutations de compra sem atualização otimista** — checkout e pagamento (`useOrderActions.ts`) esperam a resposta do servidor antes de atualizar a UI, já que envolvem estoque e dinheiro, seguindo a orientação do enunciado. Commit: `[completar hash]`
3. **Linha do tempo do pedido** — `OrderScreen.tsx` consome `useOrderTimeline` para exibir o histórico de mudanças de status do pedido (PENDING → PAID/CANCELLED), tornando o estado do pedido visível em vez de apenas o status atual. Commit: `[completar hash]`
4. **Fluxo de recuperação de senha em duas fases numa única tela** — `ForgotPasswordScreen.tsx` concentra pedido de código e redefinição na mesma tela, com login automático após redefinir, evitando uma tela extra apenas para reautenticar. Commit: `[completar hash]`

---

## 🤖 Uso de IA

Foi utilizado na criação do README, e na resolução de erros.

---


## 🎯 Missões concluídas

| Integrante | Missões |
|---|---|
| **Moisés** | Usar o carrinho ✅ · Cotar frete ✅ · Configurar um webhook ✅ · Compra ponta a ponta ✅ · Emitir NF-e ✅ |
| **Sofia** | Cadastrar cliente final ✅ · Criar produto variável ✅ · Receber um webhook ✅ |
| **Manuela** | Tratar pagamento recusado ✅ · Reembolsar um pedido ✅ |

## 🗺️ Mapa de autoria

| Integrante | Responsabilidade | Principais arquivos |
|---|---|---|
| Moisés | Carrinho, frete, checkout ponta a ponta, webhook, NF-e | `src/screens/ProductsScreen.tsx`, `src/screens/CartScreen.tsx`, `src/screens/OrderScreen.tsx`, `src/services/shipping.ts` |
| Sofia | Login, cadastro de cliente, produto variável, recuperação de senha, webhook | `src/screens/SignInScreen.tsx`, `src/screens/ProductDetailScreen.tsx`, `src/screens/ForgotPasswordScreen.tsx` |
| Manuela | Cadastro de conta, histórico de pedidos, checkout, pagamento recusado, reembolso | `src/screens/SignUpScreen.tsx`, `src/screens/OrdersScreen.tsx`, `src/screens/CheckoutScreen.tsx` |
