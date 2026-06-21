# Aurium-Stall 🛒

App de **lista de compras inteligente** para o dia a dia. Feito em
**React Native + Expo** (roda em iOS e Android com o mesmo código).

A ideia é simples: antes de ir ao mercado, você marca o que precisa comprar.
No mercado, vai marcando o que coloca no carrinho e o app **soma o total
automaticamente**. Tudo fica salvo para acompanhar seus gastos e a evolução
dos preços ao longo do tempo.

## Funcionalidades

- **Login local** — cada pessoa tem suas próprias compras (com PIN de 4 dígitos).
- **Lista de compras** — adicione itens, marque o que já pegou e veja o total
  do carrinho somando em tempo real.
- **Catálogo de produtos** — itens novos ficam salvos no seu perfil, com
  categoria e preço, para reusar na próxima compra.
- **Painel de indicadores (KPIs):**
  - Gasto no mês atual e nos últimos 6 meses.
  - O que mais pesou na cesta (produtos por valor gasto).
  - Produtos que mais subiram e que mais caíram de preço.
- **Dados no aparelho** — tudo é guardado localmente (AsyncStorage), sem
  servidor e sem internet.

## Como rodar

Você vai precisar do [Node.js](https://nodejs.org) instalado.

```bash
# 1. Instalar as dependências
npm install

# 2. Iniciar o app
npx expo start
```

Depois, no seu celular:

1. Instale o app **Expo Go** (App Store / Play Store).
2. Escaneie o QR code que aparece no terminal.

> Não precisa de Mac nem Xcode para testar — o **Expo Go** roda o app
> diretamente no seu celular.

Para gerar o app final para publicar na App Store, use o
[EAS Build](https://docs.expo.dev/build/introduction/) (`npx eas build -p ios`),
que requer uma conta Apple Developer.

## Estrutura do projeto

```
src/
├── app/                 # Telas (navegação por arquivos — expo-router)
│   ├── _layout.tsx      # Layout raiz + controle de login
│   ├── login.tsx        # Tela de login / cadastro
│   └── (tabs)/          # Abas principais
│       ├── index.tsx    # Lista de compras
│       ├── produtos.tsx # Catálogo de produtos
│       └── painel.tsx   # Indicadores (KPIs)
├── components/          # Componentes visuais reutilizáveis (UI, gráficos)
├── context/             # Estado global (autenticação + dados)
├── lib/                 # Armazenamento, formatação e cálculo dos indicadores
├── types.ts             # Modelos de dados
└── theme.ts             # Cores, espaçamentos e tipografia
```

## Próximos passos (ideias)

- **Chat entre membros da família** (ex.: lembrar o marido do que comprar).
  Isso precisa de um servidor para sincronizar mensagens entre celulares —
  fica para uma fase 2 (ex.: usando Firebase).
- Compartilhar a lista entre vários aparelhos.
- Ícone e tela de abertura personalizados.
