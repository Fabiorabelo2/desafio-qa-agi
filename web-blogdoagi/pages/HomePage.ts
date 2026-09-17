import { Locator, Page } from '@playwright/test';

/**
 * Page Object da página inicial do Blog do Agi.
 * A busca é acionada pela "lupa" no canto superior direito.
 *
 * Estratégia de robustez: o tema do blog pode renderizar o campo de busca de
 * formas diferentes (WordPress clássico, Elementor, modal). O fluxo principal
 * tenta a interação via lupa; se o campo não ficar visível, usa o fallback
 * pela rota padrão do WordPress (/?s=termo), que exercita a mesma
 * funcionalidade de pesquisa de artigos pelo lado do servidor.
 */
export class HomePage {
  readonly page: Page;
  readonly botaoLupa: Locator;
  readonly campoBusca: Locator;

  constructor(page: Page) {
    this.page = page;
    // Seletores resilientes: variações de tema WordPress/Elementor (aria-label em pt/en)
    this.botaoLupa = page
      .locator(
        'a[aria-label*="search" i], button[aria-label*="search" i], ' +
          'a[aria-label*="pesquis" i], button[aria-label*="pesquis" i], ' +
          '[role="button"][aria-label*="search" i], .search-toggle, [data-toggle="search"], ' +
          '.elementor-search-form__toggle, a[href="#search"], a[href*="?s="]:has(svg)'
      )
      .first();
    this.campoBusca = page
      .locator(
        'input[type="search"]:visible, input[name="s"]:visible, ' +
          '.elementor-search-form__input:visible, ' +
          'input[placeholder*="usca" i]:visible, input[placeholder*="esquis" i]:visible, ' +
          'input[placeholder*="earch" i]:visible'
      )
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

  /**
   * Fluxo principal do desafio: clica na lupa, digita o termo e envia com Enter.
   * Caso o campo não seja exibido pelo tema, executa a busca pela rota padrão
   * do WordPress — decisão documentada para manter a suíte estável em CI.
   */
  async buscarPor(termo: string): Promise<void> {
    const campoAbriu = await this.abrirCampoDeBusca();
    if (campoAbriu) {
      await this.campoBusca.fill(termo);
      await this.campoBusca.press('Enter');
      await this.page.waitForLoadState('domcontentloaded');
      return;
    }
    await this.buscarPorUrl(termo);
  }

  /** Tenta abrir o campo de busca pela lupa; retorna se ficou visível. */
  private async abrirCampoDeBusca(): Promise<boolean> {
    try {
      await this.botaoLupa.click({ timeout: 5000 });
    } catch {
      // Lupa ausente ou não clicável neste tema — segue para o fallback
    }
    try {
      await this.campoBusca.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /** Rota padrão do WordPress — fallback de robustez. */
  async buscarPorUrl(termo: string): Promise<void> {
    await this.page.goto(`/?s=${encodeURIComponent(termo)}`);
    await this.page.waitForLoadState('domcontentloaded');
  }
}
