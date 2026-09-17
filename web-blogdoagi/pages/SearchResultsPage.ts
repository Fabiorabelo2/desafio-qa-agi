import { Locator, Page, expect } from '@playwright/test';

/**
 * Page Object da página de resultados de busca (padrão WordPress).
 */
export class SearchResultsPage {
  readonly page: Page;
  readonly resultados: Locator;
  readonly titulosResultados: Locator;
  readonly mensagemSemResultado: Locator;

  constructor(page: Page) {
    this.page = page;
    this.resultados = page.locator('article, .search-result, .post');
    this.titulosResultados = page.locator(
      'article h1 a, article h2 a, article h3 a, .entry-title a'
    );
    this.mensagemSemResultado = page
      .getByText(
        /nenhum resultado|nada foi encontrado|não encontramos|sorry, but nothing matched|no results/i
      )
      .first();
  }

  /** Confirma que a navegação levou à página de busca do WordPress (?s=termo). */
  async validarUrlDeBusca(termo: string): Promise<void> {
    await expect(this.page).toHaveURL(
      new RegExp(`[?&]s=${encodeURIComponent(termo).replace(/\+/g, '(\\+|%20)')}`, 'i')
    );
  }

  async obterQuantidadeDeResultados(): Promise<number> {
    await this.resultados.first().waitFor({ state: 'visible', timeout: 15000 });
    return this.resultados.count();
  }

  async obterTitulos(): Promise<string[]> {
    const titulos = await this.titulosResultados.allTextContents();
    return titulos.map((t) => t.trim()).filter(Boolean);
  }

  async validarSemResultados(): Promise<void> {
    await expect(this.mensagemSemResultado).toBeVisible({ timeout: 15000 });
  }
}
