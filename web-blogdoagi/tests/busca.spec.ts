import { expect, test } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { SearchResultsPage } from '../pages/SearchResultsPage';
import { massaDeTeste } from '../utils/massa-de-teste';

/**
 * Cenários levantados para a funcionalidade de PESQUISA DE ARTIGOS do Blog do Agi
 * (lupa no canto superior direito), escolhidos por relevância de negócio:
 *
 * CENÁRIO 1 (caminho feliz — crítico): buscar por um termo do domínio do banco
 *   ("consignado") deve retornar uma lista de artigos relacionados ao termo.
 *   É o principal fluxo de descoberta de conteúdo do blog.
 *
 * CENÁRIO 2 (caminho alternativo — crítico): buscar por um termo sem correspondência
 *   deve informar claramente que nada foi encontrado, sem quebrar a página.
 *   Garante feedback adequado ao usuário e evita "tela morta".
 *
 * CENÁRIOS COMPLEMENTARES: relevância dos resultados (o termo aparece nos títulos)
 *   e busca com múltiplas palavras.
 */

test.describe('Blog do Agi — Pesquisa de artigos', () => {
  let home: HomePage;
  let resultados: SearchResultsPage;

  test.beforeEach(async ({ page }) => {
    home = new HomePage(page);
    resultados = new SearchResultsPage(page);
    await home.acessar();
  });

  test('Cenário 1: busca por termo existente exibe lista de artigos relacionados', async () => {
    await home.buscarPor(massaDeTeste.termoExistente);

    await resultados.validarUrlDeBusca(massaDeTeste.termoExistente);
    const quantidade = await resultados.obterQuantidadeDeResultados();
    expect(quantidade, 'A busca deve retornar ao menos um artigo').toBeGreaterThan(0);
  });

  test('Cenário 2: busca por termo inexistente exibe mensagem de nenhum resultado', async () => {
    await home.buscarPor(massaDeTeste.termoInexistente);

    await resultados.validarSemResultados();
  });

  test('Cenário 3: resultados são relevantes — o termo buscado aparece nos títulos', async () => {
    await home.buscarPor(massaDeTeste.termoExistente);

    const titulos = await resultados.obterTitulos();
    expect(titulos.length).toBeGreaterThan(0);

    const relacionados = titulos.filter((t) =>
      t.toLowerCase().includes(massaDeTeste.termoExistente.toLowerCase())
    );
    expect(
      relacionados.length,
      `Ao menos um título deve conter o termo "${massaDeTeste.termoExistente}". Títulos: ${titulos.join(' | ')}`
    ).toBeGreaterThan(0);
  });

  test('Cenário 4: busca com múltiplas palavras retorna resultados', async () => {
    await home.buscarPor(massaDeTeste.termoComposto);

    await resultados.validarUrlDeBusca(massaDeTeste.termoComposto);
    const quantidade = await resultados.obterQuantidadeDeResultados();
    expect(quantidade).toBeGreaterThan(0);
  });
});
