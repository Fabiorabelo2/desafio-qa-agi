# 🔌 Automação de API — Dog API

Suíte de testes automatizados da [Dog API](https://dog.ceo/dog-api/documentation) com **Java 17 + RestAssured + JUnit 5 + Allure**, conforme preferência indicada no desafio.

## Endpoints cobertos

| Endpoint | Testes |
|----------|--------|
| `GET /breeds/list/all` | 200 + `status=success`; lista não vazia; raças/sub-raças conhecidas; **contrato via JSON Schema** |
| `GET /breed/{breed}/images` | Data-driven (hound, pug, labrador); URLs no domínio oficial e da raça consultada; **negativo: raça inexistente → 404 + `status=error`** |
| `GET /breeds/image/random` | URL de imagem válida; contrato; estabilidade em chamadas consecutivas |

Todos os testes também validam **content-type JSON** e **SLA de tempo de resposta** (5s) via `ResponseSpecification` compartilhada.

## Pré-requisitos

- Java 17+ e Maven 3.8+ (Linux, Windows ou macOS)

## Como executar

```bash
mvn test
```

## Relatório de resultados

1. **Surefire (nativo):** `target/surefire-reports/` — resultado de cada teste com detalhes de falha.
2. **Allure (recomendado):**
   ```bash
   mvn allure:report   # gera em target/site/allure-maven-plugin/
   mvn allure:serve    # gera e abre no navegador
   ```
   O relatório inclui cada requisição/resposta anexada (filtro `AllureRestAssured`), passos, severidade e histórico de falhas — com detalhes completos de qualquer erro encontrado.

## Boas práticas aplicadas

- `BaseTest` com **specs reutilizáveis** de request/response (DRY)
- **Validação de contrato** (JSON Schema em `src/test/resources/schemas/`) — garante o formato dos dados, não só o status
- **Testes data-driven** (`@ParameterizedTest`) e **cenário negativo** explícito
- Base URI parametrizável: `mvn test -Dapi.base.uri=...`
- Logs de request/response automáticos quando uma validação falha
