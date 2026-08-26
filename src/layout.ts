import searchIcon from "@material-design-icons/svg/filled/search.svg?raw";
import myLocationIcon from "@material-design-icons/svg/filled/my_location.svg?raw";
import expandMoreIcon from "@material-design-icons/svg/filled/expand_more.svg?raw";
import { ALL_SERVICES } from "./services";

export function renderAppShell(): string {
  return `
  <header id="topbar">
    <div id="header-inner">
      <button id="menu-btn" type="button" aria-label="Abrir menu" aria-expanded="false" aria-controls="nav-menu">
        <span></span><span></span><span></span>
      </button>
      <div id="header-titles">
        <h1>Nexa</h1>
        <p class="subtitle">Onde a beleza encontra conexão</p>
      </div>
      <nav id="nav-menu">
        <a href="#/" data-route="/">Início</a>
        <a href="#/quem-somos" data-route="/quem-somos">Quem Somos</a>
        <a href="#/contato" data-route="/contato">Contato</a>
      </nav>
    </div>
  </header>

  <section id="page-home" class="page">
    <div id="search-row">
      <div id="search-box">
        <input
          id="search-input"
          type="search"
          placeholder="Buscar por cidade, estado, rua ou nome..."
          autocomplete="off"
        />
        <button id="search-btn" type="button" aria-label="Buscar">${searchIcon}</button>
        <ul id="search-suggestions" hidden></ul>
      </div>
      <button id="locate-btn" type="button">${myLocationIcon} Usar minha localização</button>
    </div>
    <div id="active-search" hidden>
      <span>Buscando por: <strong id="active-search-term"></strong></span>
      <button id="clear-search-btn" type="button" aria-label="Limpar busca">✕</button>
    </div>
    <p id="locate-status"></p>

    <div id="map"></div>

    <div id="filters-row">
      <label class="filter-field">
        Ordenar por
        <select id="sort-filter">
          <option value="">Padrão</option>
          <option value="distance">Menor distância</option>
          <option value="rating">Melhor avaliação</option>
        </select>
      </label>
      <label class="filter-field">
        Avaliação
        <select id="rating-filter">
          <option value="0">Qualquer</option>
          <option value="5">5 estrelas</option>
          <option value="4.5">4,5+ estrelas</option>
          <option value="4">4+ estrelas</option>
          <option value="3.5">3,5+ estrelas</option>
          <option value="3">3+ estrelas</option>
        </select>
      </label>
      <div class="filter-field" id="service-filter-field">
        Serviço
        <button
          type="button"
          id="service-filter-btn"
          aria-haspopup="true"
          aria-expanded="false"
        >
          <span id="service-filter-summary">Todos</span>
          ${expandMoreIcon}
        </button>
        <div id="service-filter-panel" hidden>
          ${ALL_SERVICES.map(
            (service) => `
              <label class="service-option">
                <input type="checkbox" value="${service}" />
                <span>${service}</span>
              </label>
            `,
          ).join("")}
          <button type="button" id="service-filter-clear">Limpar seleção</button>
        </div>
      </div>
    </div>

    <main id="results"></main>
    <nav id="pagination"></nav>
  </section>

  <section id="page-about" class="page">
    <h2>Quem Somos</h2>
    <p>
      A NEXA conecta pessoas a espaços de beleza, clinicas estéticas e barbearias locais, promovendo uma visibilidade aos estabelecimentos e proporcionando aos usuários uma experiencia única de beleza, cuidado e conexão em cada destino.
    </p>
    <p>
      Nosso objetivo é valorizar profissionais da beleza, dando visibilidade a salões de todos
      os tamanhos e regiões, com uma experiência simples, elegante e direta.
    </p>
  </section>

  <section id="page-contact" class="page">
    <h2>Contato</h2>
    <p>Tem alguma dúvida, sugestão ou quer cadastrar seu salão? Fale com a gente.</p>
    <form id="contact-form">
      <label class="form-field">
        Nome
        <input id="contact-name" type="text" name="name" required autocomplete="name" />
      </label>
      <label class="form-field">
        E-mail
        <input id="contact-email" type="email" name="email" required autocomplete="email" />
      </label>
      <label class="form-field">
        Mensagem
        <textarea id="contact-message" name="message" rows="5" required></textarea>
      </label>
      <button type="submit" class="btn btn-whatsapp">Enviar</button>
    </form>
  </section>

  <footer id="site-footer">
    <div id="footer-inner">
      <div class="footer-col">
        <h3>Nexa</h3>
        <p>Onde a beleza encontra conexão.</p>
      </div>
      <div class="footer-col">
        <h4>Navegação</h4>
        <a href="#/" data-route="/">Início</a>
        <a href="#/quem-somos" data-route="/quem-somos">Quem Somos</a>
        <a href="#/contato" data-route="/contato">Contato</a>
      </div>
      <div class="footer-col">
        <h4>Contato</h4>
        <a href="mailto:contato@nexa.com.br">contato@nexa.com.br</a>
      </div>
    </div>
    <div id="footer-bottom">
      <p>&copy; <span id="footer-year"></span> Nexa. Todos os direitos reservados.</p>
    </div>
  </footer>
  `;
}
