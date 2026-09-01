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
        <img id="header-logo" src="/logo/nexa_logo_horizontal_preto.png" alt="Nexa" />
      </div>
      <nav id="nav-menu">
        <a href="#/" data-route="/">Início</a>
        <a href="#/quem-somos" data-route="/quem-somos">Quem Somos</a>
        <a href="#/contato" data-route="/contato">Contato</a>
        <a href="#/cadastro" data-route="/cadastro">Cadastre seu salão</a>
      </nav>
      <div id="header-user" hidden>
        <span id="header-user-email">
          <small>Logado como</small>
          <strong id="header-user-value"></strong>
        </span>
        <button type="button" id="header-logout-btn" class="btn btn-instagram">Sair</button>
      </div>
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

  <section id="page-cadastro" class="page">
    <div id="salon-auth-view">
      <h2>Entrar</h2>
      <p id="salon-auth-subtitle">
        Entre com seu e-mail e senha para cadastrar ou editar seu salão.
      </p>
      <form id="salon-auth-form">
        <label class="form-field">
          E-mail
          <input id="auth-email" type="email" required autocomplete="email" />
        </label>
        <label class="form-field">
          Senha
          <input id="auth-password" type="password" required minlength="6" autocomplete="current-password" />
        </label>
        <p id="salon-auth-status"></p>
        <button type="submit" id="salon-auth-submit" class="btn btn-whatsapp">Entrar</button>
      </form>
      <button type="button" id="salon-auth-toggle" class="btn btn-instagram">
        Não tem conta? Criar conta
      </button>
    </div>

    <div id="salon-form-view" hidden>
      <h2 id="salon-form-title">Cadastre seu salão</h2>
      <p>
        Preencha os dados abaixo. Seu cadastro passa por uma análise antes de aparecer no site.
      </p>

      <div id="plan-picker">
        <button type="button" class="plan-card" data-plan="basic">
          <span class="plan-free-tag">Grátis no lançamento</span>
          <div class="plan-card-header">
            <h3>Básico</h3>
            <p class="plan-price">R$ 19,90<span>/mês</span></p>
          </div>
          <ul class="plan-benefits">
            <li>Perfil completo do seu salão na Nexa</li>
            <li>Botões diretos de WhatsApp e Instagram</li>
            <li>Apareça nas buscas por cidade, estado e serviço</li>
            <li>Até 10 fotos do salão</li>
            <li>Suporte por e-mail</li>
          </ul>
        </button>
        <button type="button" class="plan-card" data-plan="top">
          <span class="plan-free-tag">Grátis no lançamento</span>
          <div class="plan-card-header">
            <h3>Top</h3>
            <p class="plan-price">R$ 29,90<span>/mês</span></p>
          </div>
          <ul class="plan-benefits">
            <li>Perfil completo do seu salão na Nexa</li>
            <li>Botões diretos de WhatsApp e Instagram</li>
            <li>Apareça nas buscas por cidade, estado e serviço</li>
            <li>Até 10 fotos do salão</li>
            <li>Suporte por e-mail</li>
            <li class="plan-benefit-extra">Seu salão no topo das buscas</li>
            <li class="plan-benefit-extra">Badge "Salão Top" no seu card</li>
            <li class="plan-benefit-extra">Divulgação no Instagram oficial da Nexa</li>
          </ul>
        </button>
      </div>

      <form id="registration-form">
        <label class="form-field">
          Nome do salão
          <input id="reg-name" type="text" required />
        </label>
        <label class="form-field">
          CNPJ
          <input id="reg-cnpj" type="text" required placeholder="00.000.000/0000-00" />
        </label>
        <label class="form-field">
          CEP
          <input
            id="reg-cep"
            type="text"
            placeholder="00000-000"
            inputmode="numeric"
            maxlength="9"
          />
        </label>
        <label class="form-field">
          Rua
          <input id="reg-street" type="text" required />
        </label>
        <div class="form-row">
          <label class="form-field">
            Número
            <input id="reg-number" type="text" required />
          </label>
          <label class="form-field">
            Complemento (opcional)
            <input id="reg-complement" type="text" placeholder="Apto, sala, bloco..." />
          </label>
        </div>
        <div class="form-row">
          <label class="form-field">
            Cidade
            <input id="reg-city" type="text" required />
          </label>
          <label class="form-field">
            Estado
            <input id="reg-state" type="text" required maxlength="2" placeholder="RS" />
          </label>
        </div>
        <div id="reg-map" hidden></div>
        <label class="form-field">
          Telefone / WhatsApp
          <input id="reg-phone" type="tel" required placeholder="+55 (11) 99999-9999" />
        </label>
        <label class="form-field">
          Instagram (opcional)
          <input id="reg-instagram" type="text" placeholder="seu.salao" />
        </label>
        <label class="form-field">
          E-mail de contato do salão
          <input id="reg-email" type="email" required autocomplete="email" />
        </label>
        <fieldset id="reg-services-field">
          <legend>Serviços oferecidos</legend>
          ${ALL_SERVICES.map(
            (service) => `
              <label class="service-option">
                <input type="checkbox" name="reg-service" value="${service}" />
                <span>${service}</span>
              </label>
            `,
          ).join("")}
        </fieldset>
        <label class="form-field">
          Fotos do salão (até 10)
          <div id="reg-photos-field">
            <span class="file-input-btn">Escolher fotos</span>
            <span id="reg-photos-status">Nenhum arquivo selecionado</span>
            <input id="reg-photos" type="file" accept="image/*" multiple hidden />
          </div>
        </label>
        <div id="reg-photo-preview"></div>
        <label class="form-field-checkbox">
          <input id="reg-terms" type="checkbox" required />
          <span>
            Li e aceito os
            <button type="button" id="reg-terms-link">Termos e Condições e a Política de Privacidade (LGPD)</button>
          </span>
        </label>
        <p id="reg-status"></p>
        <button type="submit" id="reg-submit" class="btn btn-whatsapp">Cadastrar salão</button>
      </form>

      <dialog id="terms-dialog">
        <h2>Termos e Condições e Política de Privacidade</h2>
        <div class="terms-content">
          <p>
            Este documento estabelece as condições de uso da plataforma Nexa por parte de
            salões, clínicas estéticas e barbearias ("Estabelecimento") e o tratamento de
            dados pessoais e empresariais em conformidade com a Lei nº 13.709/2018
            (Lei Geral de Proteção de Dados — LGPD).
          </p>

          <h3>1. Dados coletados</h3>
          <p>
            Ao cadastrar seu estabelecimento, você fornece dados como nome do salão, CNPJ,
            endereço, telefone/WhatsApp, e-mail, Instagram, serviços oferecidos e fotos.
            Esses dados podem incluir dados pessoais do responsável pelo cadastro (e-mail e
            telefone de contato).
          </p>

          <h3>2. Finalidade do tratamento</h3>
          <p>
            Os dados informados são utilizados exclusivamente para: (a) exibir publicamente
            o perfil do estabelecimento na plataforma Nexa, incluindo endereço, mapa,
            serviços, fotos e canais de contato (WhatsApp e Instagram); (b) permitir que
            clientes encontrem e entrem em contato com o estabelecimento; (c) comunicação da
            Nexa com o responsável pelo cadastro sobre o status da conta e do anúncio.
          </p>

          <h3>3. Base legal</h3>
          <p>
            O tratamento dos dados ocorre com base no consentimento do titular, dado ao
            marcar a opção de aceite neste cadastro, conforme art. 7º, inciso I, da LGPD.
            Dados de identificação empresarial (CNPJ, endereço comercial) são tratados
            também com base no legítimo interesse da plataforma em divulgar
            estabelecimentos comerciais publicamente.
          </p>

          <h3>4. Compartilhamento</h3>
          <p>
            A Nexa não vende nem compartilha seus dados com terceiros para fins de
            publicidade. As fotos e informações de contato cadastradas são exibidas
            publicamente na plataforma, pois essa é a finalidade do serviço.
          </p>

          <h3>5. Direitos do titular</h3>
          <p>
            Conforme os arts. 17 a 22 da LGPD, você pode, a qualquer momento: confirmar a
            existência de tratamento, acessar, corrigir ou solicitar a exclusão dos seus
            dados, e revogar este consentimento. Para exercer esses direitos, edite seu
            cadastro pela própria plataforma ou entre em contato pelo e-mail
            contato@nexa.com.br.
          </p>

          <h3>6. Retenção</h3>
          <p>
            Os dados são mantidos enquanto o cadastro estiver ativo na plataforma. Ao
            solicitar a exclusão da conta, os dados são removidos, ressalvado o prazo
            necessário para cumprimento de obrigações legais.
          </p>

          <h3>7. Responsabilidade pelas informações</h3>
          <p>
            O Estabelecimento declara que as informações fornecidas (incluindo CNPJ,
            endereço e fotos) são verdadeiras e que possui autorização para divulgá-las
            publicamente, isentando a Nexa por inconsistências decorrentes de dados
            incorretos informados no cadastro.
          </p>
        </div>
        <button type="button" id="terms-close" class="btn btn-whatsapp">Fechar</button>
      </dialog>
    </div>
  </section>

  <footer id="site-footer">
    <div id="footer-inner">
      <div class="footer-col">
        <img id="footer-logo" src="/logo/nexa_logo_vetor.svg" alt="Nexa" />
      </div>
      <div class="footer-col">
        <h4>Navegação</h4>
        <a href="#/" data-route="/">Início</a>
        <a href="#/quem-somos" data-route="/quem-somos">Quem Somos</a>
        <a href="#/contato" data-route="/contato">Contato</a>
        <a href="#/cadastro" data-route="/cadastro">Cadastre seu salão</a>
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
