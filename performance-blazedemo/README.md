# ⚡ Teste de Performance — BlazeDemo (compra de passagem)

Scripts **JMeter** para o fluxo completo de compra de passagem aérea em https://www.blazedemo.com, finalizando com a validação de negócio **"Thank you for your purchase today"**.

## Critério de aceitação

> **250 requisições por segundo** com tempo de resposta **90th percentil inferior a 2 segundos**.

## Fluxo simulado (4 requisições por iteração)

1. `GET /` — home ("Welcome to the Simple Travel Agency")
2. `POST /reserve.php` — escolha de origem/destino (Paris → Buenos Aires)
3. `POST /purchase.php` — seleção do voo
4. `POST /confirmation.php` — dados do comprador (massa fictícia) e confirmação da compra

Cada requisição tem **asserção de conteúdo**; a confirmação tem também **asserção de duração (2s)**.

## Scripts

| Arquivo | Tipo | Perfil padrão |
|---------|------|----------------|
| `load-test.jmx` | **Carga** | 400 threads, ramp-up 60s, 300s de duração, vazão alvo de 15.000 req/min (250 req/s) via Constant Throughput Timer |
| `spike-test.jmx` | **Pico** | Baseline de 100 threads (60 req/s) sustentada por 300s + rajada de 500 threads subindo em 10s aos 120s de teste, mirando 250 req/s durante o pico |

Todos os parâmetros são configuráveis por properties, ex.: `-Jthreads=200 -Jduration=180`.

## Pré-requisitos

- JMeter 5.6+ e Java 17+
- Máquina geradora com recursos suficientes (250 req/s pode exigir ajuste de heap: `HEAP="-Xms1g -Xmx4g"`)

## Como executar (modo não-GUI, como manda a boa prática)

```bash
# Teste de carga + relatório HTML
jmeter -n -t load-test.jmx -l resultado-carga.jtl -e -o relatorio-carga

# Teste de pico + relatório HTML
jmeter -n -t spike-test.jmx -l resultado-pico.jtl -e -o relatorio-pico
```

O relatório HTML (pasta `relatorio-*/index.html`) traz **APDEX, throughput, percentis (90/95/99), erros e gráficos ao longo do tempo** — usar o gráfico *Response Times Percentiles Over Time* e o *Transactions Per Second* para o parecer.

## Como avaliar o critério de aceitação

1. **Vazão:** no relatório, conferir se o throughput sustentado atingiu ~250 req/s (Statistics → Throughput / gráfico TPS).
2. **p90:** conferir o **90th pct** consolidado e por requisição (Statistics). Critério atendido ⇔ vazão ≥ 250 req/s **e** p90 < 2.000 ms **sem erros relevantes** (taxa de erro < 1%).
3. No teste de **pico**, avaliar adicionalmente: degradação durante a rajada, tempo de recuperação após o pico e se houve erros 5xx/timeouts.

> 📎 **Relatório de execução:** após rodar em sua máquina/infra, anexe as pastas `relatorio-carga/` e `relatorio-pico/` (ou capturas das telas de Statistics) neste repositório e registre o parecer na seção abaixo.

## Parecer da execução (preencher após rodar)

- Vazão sustentada atingida: ___ req/s
- p90 (carga): ___ ms | p90 (pico): ___ ms
- Taxa de erro: ___ %
- **Critério atendido?** ☐ Sim ☐ Não — justificativa: considerar saturação do gerador de carga, capacidade do site de demonstração (ambiente público e compartilhado, sem SLA) e comportamento na janela do pico.
