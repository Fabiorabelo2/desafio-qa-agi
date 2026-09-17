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

## Parecer da execução

**Execução:** 17/09/2026, 14:47–14:58 (BRT), com os perfis padrão dos scripts.
**Gerador de carga:** notebook AMD Ryzen 5 3500U (4 núcleos/8 threads), 5,9 GB de RAM, Windows 11, JDK 17.0.20 (Temurin), JMeter 5.6.3 (heap de 2 GB), conexão residencial.
**Relatórios:** `relatorio-carga/index.html` e `relatorio-pico/index.html`.

### Resumo

| Indicador | Carga | Pico |
|-----------|-------|------|
| Vazão sustentada | **250,0 req/s** (regime estável, 60–270s) | **273 req/s** na rajada (baseline de 59 req/s) |
| Vazão média total (inclui ramp-up/encerramento) | 220,8 req/s | 104,7 req/s |
| p90 total (relatório JMeter) | **554 ms** | **2.965 ms** |
| p90 no trecho relevante | 486 ms (regime estável) | **3.314 ms** (durante a rajada) |
| p95 / p99 total | 695 ms / 28.179 ms | 3.829 ms / 7.651 ms |
| Taxa de erro total | **0,62 %** (438 de 70.429) | **4,70 %** (1.478 de 31.414) |
| Amostras | 70.429 | 31.414 |

- Vazão sustentada atingida: **250 req/s** no teste de carga (média total de 220,8 req/s, porque inclui os 60s de ramp-up)
- p90 (carga): **554 ms** | p90 (pico): **2.965 ms** no total e **3.314 ms** durante a rajada
- Taxa de erro: **0,62 %** (carga) | **4,70 %** (pico)
- **Critério atendido?** ☑ **Sim** no teste de carga · ☐ **Não** no teste de pico

### Justificativa

**Teste de carga: critério atendido.**
Após o ramp-up, a vazão ficou estável em 250 req/s (entre 249,4 e 250,7 em janelas de 15s) e o p90 ficou em torno de 0,5s, quatro vezes abaixo do limite de 2s. Das 70.429 requisições, 70.017 retornaram HTTP 200, e o p90 de cada etapa do fluxo ficou entre 489 e 501 ms.

Ressalva: por volta de 275s de teste houve um **travamento de cerca de 15s**. As requisições em andamento ficaram sem resposta e deram *read timeout* (limite de 15s), somando 396 dos 438 erros da execução. É por isso que o p99 total chegou a 28s. Fora desse episódio, a taxa de erro foi de 0,08%. O episódio foi isolado e não se repetiu, mas é recomendável repetir o teste para confirmar se foi instabilidade do site ou da rede.

**Teste de pico: critério não atendido.**
- **Antes do pico** (baseline de 59 req/s): p90 de 420 ms e nenhum erro.
- **Durante a rajada** (+500 threads em 10s, cerca de 273 req/s combinados): o p90 subiu para **3,3s**, e o p95 para 4,4s. Foram 1.478 erros (8,3% das requisições da janela):
  - **1.461** falhas da asserção de duração: HTTP 200, mas acima de 2s. Só a confirmação tem essa asserção, por isso ela concentra 19,2% de erro, embora as demais etapas também tenham ficado com p90 entre 2,6 e 2,8s;
  - **12** *read timeouts*;
  - **5** respostas **HTTP 429 (Too Many Requests)**, ou seja, o próprio servidor passou a limitar as requisições.
- **Depois do pico:** a recuperação foi imediata. Na primeira janela de 15s após o fim da rajada, o p90 já estava em 403 ms, sem erros.

**Conclusão:** o BlazeDemo **sustenta 250 req/s com p90 < 2s quando a carga sobe de forma gradual**, mas **não mantém o p90 abaixo de 2s quando essa vazão chega de forma súbita**. Nesse caso a latência fica acima do SLA durante toda a rajada e aparecem sinais de limitação de requisições (HTTP 429). Como o sistema se recupera sozinho e sem erros residuais, a degradação é temporária.

### Considerações e limitações

- **Ambiente-alvo:** o blazedemo.com é um site público de demonstração, compartilhado e sem SLA, servido por infraestrutura do Google (IPs 216.239.x.x). Os resultados variam com o horário e com a carga de outros usuários, e o HTTP 429 indica limitação de requisições do lado do servidor.
- **Gerador de carga:** a CPU do notebook ficou em média em 41% (carga) e 28% (pico), com picos isolados de 97–100%. A memória livre chegou a 134 MB durante o teste de carga. Não há sinal de que o gerador estivesse saturado nas janelas analisadas, mas uma máquina doméstica numa conexão residencial não isola totalmente a latência do servidor da latência de rede e do gerador. Para um resultado conclusivo, recomenda-se repetir a partir de um gerador dedicado ou distribuído em nuvem.
- **Perfil do pico:** o grupo da rajada mira 250 req/s **somados** à baseline de 60 req/s, então o pico teórico é de cerca de 310 req/s. O valor medido foi de 273 req/s em média, chegando a 300 req/s nas janelas de maior carga.
- **Métrica de p90:** os percentis do relatório HTML do JMeter são aproximados, calculados por janela deslizante. Os valores por fase foram recalculados a partir dos arquivos `.jtl` brutos.
- **Ajuste no script:** a asserção da etapa `02 - Escolher voos (reserve)` buscava o texto "Choose your flight", que não existe na página (o título real é "Flights from Paris to Buenos Aires"). Isso fazia 100% dessa etapa falhar mesmo com HTTP 200. A asserção foi corrigida nos dois scripts antes desta execução.
