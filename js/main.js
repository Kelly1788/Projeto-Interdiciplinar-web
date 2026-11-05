// ===== Menu mobile =====
const menuToggle = document.getElementById('menuToggle');
const menu = document.getElementById('menu');

menuToggle.addEventListener('click', () => {
  const aberto = menu.classList.toggle('aberto');
  menuToggle.setAttribute('aria-expanded', String(aberto));
  menuToggle.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
});
menu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    menu.classList.remove('aberto');
    menuToggle.setAttribute('aria-expanded', 'false');
  });
});

// ===== Link ativo conforme a seção visível =====
const secoes = document.querySelectorAll('main section[id]');
const observador = new IntersectionObserver((entradas) => {
  entradas.forEach((e) => {
    if (e.isIntersecting) {
      menu.querySelectorAll('a').forEach((a) => {
        a.classList.toggle('ativo', a.getAttribute('href') === '#' + e.target.id);
      });
    }
  });
}, { rootMargin: '-45% 0px -50% 0px' });
secoes.forEach((s) => observador.observe(s));

// ===== Código digitando no hero =====
const codigoHero = document.getElementById('codigoHero');
const linhasCodigo = [
  [['tk-kw', 'nome'], ['', ' = '], ['tk-str', '"Teresina"']],
  [['tk-kw', 'print'], ['', '(f'], ['tk-str', '"Olá, {nome}!"'], ['', ')']],
  [['tk-out', '\n> Olá, Teresina!']],
];

function renderizarCodigoCompleto() {
  codigoHero.innerHTML = linhasCodigo
    .map((linha) => linha.map(([cls, txt]) => `<span class="${cls}">${txt}</span>`).join(''))
    .join('\n');
}

function digitarCodigo() {
  const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduzir) { renderizarCodigoCompleto(); return; }

  const pecas = linhasCodigo.flatMap((linha, i) => [
    ...linha.map(([cls, txt]) => ({ cls, txt })),
    ...(i < linhasCodigo.length - 1 ? [{ cls: '', txt: '\n' }] : []),
  ]);
  let p = 0, c = 0, html = '';
  const cursor = '<span class="cursor"></span>';

  function passo() {
    if (p >= pecas.length) { codigoHero.innerHTML = html + cursor; return; }
    const { cls, txt } = pecas[p];
    c++;
    const parcial = `<span class="${cls}">${txt.slice(0, c)}</span>`;
    codigoHero.innerHTML = html + parcial + cursor;
    if (c >= txt.length) { html += parcial; p++; c = 0; }
    setTimeout(passo, txt.startsWith('\n>') ? 90 : 55);
  }
  passo();
}
digitarCodigo();

// ===== Botões "Quero este curso" preenchem o formulário =====
document.querySelectorAll('[data-curso]').forEach((botao) => {
  botao.addEventListener('click', () => {
    const select = document.getElementById('interesse');
    select.value = botao.dataset.curso;
  });
});

// ===== Formulário de inscrição =====
const form = document.getElementById('formInscricao');
const statusForm = document.getElementById('formStatus');

function validar() {
  const regras = {
    nome: (v) => v.trim().length >= 3 || 'Digite seu nome completo (mínimo 3 letras).',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Digite um e-mail válido, como nome@email.com.',
    nivel: (v) => v !== '' || 'Selecione seu nível atual.',
    interesse: (v) => v !== '' || 'Selecione um curso ou plano.',
  };
  let valido = true;
  Object.entries(regras).forEach(([campo, regra]) => {
    const input = form.elements[campo];
    const msg = regra(input.value);
    const erro = form.querySelector(`[data-erro-de="${campo}"]`);
    const falhou = msg !== true;
    erro.textContent = falhou ? msg : '';
    input.classList.toggle('invalido', falhou);
    input.setAttribute('aria-invalid', String(falhou));
    if (falhou) valido = false;
  });
  return valido;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  statusForm.className = 'form__status';
  statusForm.textContent = '';
  if (!validar()) return;

  const dados = Object.fromEntries(new FormData(form).entries());
  try {
    const resp = await fetch('/api/inscricao', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    });
    if (!resp.ok) throw new Error('Falha no envio');
    statusForm.classList.add('ok');
    statusForm.textContent = 'Inscrição enviada! Responderemos em até 1 dia útil.';
    form.reset();
  } catch (err) {
    statusForm.classList.add('falha');
    statusForm.textContent = 'Não foi possível enviar agora. Confira se o servidor está rodando e tente de novo.';
  }
});
