// Interface do chat com o Byte. A chave da API NUNCA fica aqui:
// as mensagens vão para /api/chat (server/server.js), que fala com a IA.
const chatAbrir = document.getElementById('chatAbrir');
const chatFechar = document.getElementById('chatFechar');
const chatJanela = document.getElementById('chatJanela');
const chatMensagens = document.getElementById('chatMensagens');
const chatForm = document.getElementById('chatForm');
const chatEntrada = document.getElementById('chatEntrada');
const chatSugestoes = document.getElementById('chatSugestoes');

const historico = []; // { role: 'user' | 'model', text: string }
let saudou = false;

function adicionarMensagem(texto, tipo) {
  const div = document.createElement('div');
  div.className = `msg msg--${tipo}`;
  div.textContent = texto;
  chatMensagens.appendChild(div);
  chatMensagens.scrollTop = chatMensagens.scrollHeight;
  return div;
}

function abrirChat() {
  chatJanela.hidden = false;
  chatAbrir.setAttribute('aria-expanded', 'true');
  if (!saudou) {
    adicionarMensagem('Oi! Eu sou o Byte, mentor virtual da PJK SimpliCode. Posso te ajudar a escolher um curso, entender os planos ou fazer sua inscrição. Qual é a sua dúvida?', 'bot');
    saudou = true;
  }
  chatEntrada.focus();
}

function fecharChat() {
  chatJanela.hidden = true;
  chatAbrir.setAttribute('aria-expanded', 'false');
  chatAbrir.focus();
}

chatAbrir.addEventListener('click', () => (chatJanela.hidden ? abrirChat() : fecharChat()));
chatFechar.addEventListener('click', fecharChat);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !chatJanela.hidden) fecharChat(); });

async function enviar(texto) {
  const pergunta = texto.trim();
  if (!pergunta) return;

  chatSugestoes.hidden = true;
  adicionarMensagem(pergunta, 'user');
  historico.push({ role: 'user', text: pergunta });
  chatEntrada.value = '';

  const botao = chatForm.querySelector('button');
  botao.disabled = true;
  const digitando = adicionarMensagem('Byte está digitando...', 'bot');
  digitando.classList.add('msg--digitando');

  try {
    const resp = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mensagens: historico }),
    });
    const dados = await resp.json();
    if (!resp.ok) throw new Error(dados.erro || 'Erro no servidor');
    digitando.remove();
    adicionarMensagem(dados.resposta, 'bot');
    historico.push({ role: 'model', text: dados.resposta });
  } catch (err) {
    digitando.remove();
    historico.pop(); // remove a pergunta que não foi respondida
    adicionarMensagem('Tive um problema para responder agora. Tente de novo em instantes ou use o formulário de contato.', 'bot');
  } finally {
    botao.disabled = false;
    chatEntrada.focus();
  }
}

chatForm.addEventListener('submit', (e) => { e.preventDefault(); enviar(chatEntrada.value); });
chatSugestoes.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => enviar(b.textContent)));
