# 🌐 Automação Web — Pesquisa de artigos do Blog do Agi

Automação da funcionalidade de **pesquisa de artigos** (lupa no canto superior direito) do [Blog do Agi](https://blogdoagi.com.br/), com **Playwright + TypeScript**.

## Cenários automatizados (e por que foram escolhidos)

| # | Cenário | Relevância |
|---|---------|------------|
| 1 | Busca por termo existente ("consignado") exibe lista de artigos | Caminho feliz do principal fluxo de descoberta de conteúdo do blog |
| 2 | Busca por termo inexistente exibe mensagem de "nenhum resultado" | Feedback claro ao usuário; garante que a página não quebra no fluxo alternativo |
| 3 | Relevância: o termo buscado aparece nos títulos dos resultados | Valida a **qualidade** da busca, não apenas que "algo voltou" |
| 4 | Busca com múltiplas palavras retorna resultados | Comportamento com entrada composta, comum em buscas reais |

## Estrutura

```
web-blogdoagi/
├── pages/                  # Page Object Model
│   ├── HomePage.ts         # Home + interação com a lupa/campo de busca
│   └── SearchResultsPage.ts# Página de resultados + validações
├── tests/busca.spec.ts     # Cenários (documentados no próprio spec)
├── utils/massa-de-teste.ts # Massa de teste centralizada
└── playwright.config.ts    # baseURL, retries em CI, trace/vídeo em falha
```

## Pré-requisitos

- Node.js 18+ (Linux, Windows ou macOS)

## Como executar

```bash
npm ci
npx playwright install --with-deps chromium
npm test              # execução headless
npm run test:headed   # com navegador visível
npm run report        # abre o relatório HTML da última execução
```

## Boas práticas aplicadas

- **POM** com seletores resilientes (aria-label, papéis, fallbacks para variações de tema WordPress)
- **Auto-waiting** do Playwright + asserções com timeout explícito (sem sleeps)
- **Evidências em falha:** trace, screenshot e vídeo (`test-results/`)
- **Retries apenas em CI** para absorver instabilidade de rede sem mascarar bugs localmente
- Tratamento de banner de cookies para não interceptar cliques
