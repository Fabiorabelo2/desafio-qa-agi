import { Locator, Page } from '@playwright/test';

/**
 * Page Object da página inicial do Blog do Agi.
 * A busca é acionada pela "lupa" no canto superior direito,
 * que exibe um campo de busca (padrão WordPress: input[name="s"]).
 */
export class HomePage {
  readonly page: Page;
  readonly botaoLupa: Locator;
  readonly campoBusca: Locator;

  constructor(page: Page) {
    this.page = page;
    // Seletores resilientes: cobrem variações de tema WordPress (aria-label em pt/en)
    this.botaoLupa = page
      .locator(
        'a[aria-label*="search" i], button[aria-label*="search" i], ' +
          'a[aria-label*="pesquis" i], button[aria-label*="pesquis" i], ' +
          '.search-toggle, a[href*="?s="]:has(svg), [data-toggle="search"]'
      )
      .first();
    this.campoBusca = page
      .locator('input[type="search"]:visible, input[name="s"]:visible')
      .first();
  }

  async acessar(): Promise<void> {
    await this.page.goto('/');
    // Fecha banner de cookies, se existir, para não interceptar cliques
    const aceitarCookies = this.page
      .getByRole('button', { name: /aceitar|accept|concordo|ok/i })
      .first();
    if (await aceitarCookies.isVisible({ timeout: 3000 }).catch(() => false)) {
      await aceitarCookies.click();
    }
  }

  /** Fluxo principal do desafio: clica na lupa, digita o termo e envia com Enter. */
  async buscarPor(termo: string): Promise<void> {
    await this.botaoLupa.click();
    await this.campoBusca.waitFor({ state: 'visible' });
    await this.campoBusca.fill(termo);
    await this.campoBusca.press('Enter');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /** Rota alternativa (padrão WordPress) usada como fallback de robustez. */
  async buscarPorUrl(termo: string): Promise<void> {
    await this.page.goto(`/?s=${encodeURIComponent(termo)}`);
    await this.page.waitForLoadState('domcontentloaded');
  }
}
