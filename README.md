# Desafio Técnico QA — Agi

Solução completa do desafio técnico de QA, dividida em três frentes independentes. Cada uma tem seu próprio README com instruções detalhadas de configuração e execução.

| Parte | Alvo | Stack | Pasta |
|-------|------|-------|-------|
| 🌐 **Web** | Pesquisa de artigos do [Blog do Agi](https://blogdoagi.com.br/) | Playwright + TypeScript, Page Object Model | [`web-blogdoagi/`](web-blogdoagi/) |
| 🔌 **API** | [Dog API](https://dog.ceo/dog-api/documentation) | Java 17 + RestAssured + JUnit 5 + Allure, validação de contrato (JSON Schema) | [`api-dogapi/`](api-dogapi/) |
| ⚡ **Performance** | [BlazeDemo](https://www.blazedemo.com) — compra de passagem | JMeter 5.6 (carga + pico), 250 req/s, p90 < 2s | [`performance-blazedemo/`](performance-blazedemo/) |

## Execução rápida

```bash
# Web (Node 18+)
cd web-blogdoagi && npm ci && npx playwright install --with-deps chromium && npm test

# API (Java 17 + Maven)
cd api-dogapi && mvn test

# Performance (JMeter 5.6+)
cd performance-blazedemo && jmeter -n -t load-test.jmx -l resultado-carga.jtl -e -o relatorio-carga
```

## CI/CD

O repositório possui pipelines no **GitHub Actions** (`.github/workflows/`):

- `web.yml` — executa a suíte Playwright a cada push/PR e publica o relatório HTML como artefato
- `api.yml` — executa a suíte RestAssured a cada push/PR e publica os resultados (Surefire/Allure) como artefato

Assim, qualquer avaliador consegue ver os testes executando sem configurar nada localmente — basta abrir a aba **Actions**.

## Decisões técnicas (resumo)

- **Web em Playwright/TS:** auto-waiting nativo reduz flakiness; seletores resilientes a variações de tema WordPress; POM com massa de teste centralizada; trace/screenshot/vídeo em falha para evidência.
- **API em Java:** atendendo à preferência indicada no desafio; specs reutilizáveis (request/response), testes data-driven, cenário negativo (404) e validação de contrato via JSON Schema — não apenas status code.
- **Performance:** vazão controlada por Constant Throughput Timer (15.000 req/min = 250 req/s), critérios parametrizáveis via `-J` properties, asserções de negócio ("Thank you for your purchase today") e de SLA (2s) em todo o fluxo.

## Autor

**Fabio Henrique Rabelo** — QA Analyst · 15+ anos em sistemas de missão crítica (governo, bancos, pagamentos e telecom)
