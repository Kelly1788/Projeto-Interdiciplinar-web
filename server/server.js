// Servidor Express: entrega o site e faz a ponte segura com a API de IA (Gemini).
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const { PERSONA } = require('./persona');

const RAIZ = path.join(__dirname, '..');
const PORTA = process.env.PORT || 3000;
const CHAVE = process.env.GEMINI_API_KEY;
const MODELO = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

const app = express();
app.use(express.json({ limit: '20kb' }));

// Só as pastas públicas são servidas (assim .env e server/ nunca ficam expostos)
app.use('/css', express.static(path.join(RAIZ, 'css')));
app.use('/js', express.static(path.join(RAIZ, 'js')));
app.use('/img', express.static(path.join(RAIZ, 'img')));
app.get('/', (req, res) => res.sendFile(path.join(RAIZ, 'index.html')));

// Limite simples de requisições por IP (20 por minuto)
const acessos = new Map();
function limitar(req, res, next) {
  const agora = Date.now();
  const lista = (acessos.get(req.ip) || []).filter((t) => agora - t < 60000);
  if (lista.length >= 20) return res.status(429).json({ erro: 'Muitas mensagens. Aguarde um minuto.' });
  lista.push(agora);
  acessos.set(req.ip, lista);
  next();
}

// ===== Chatbot =====
app.post('/api/chat', limitar, async (req, res) => {
  if (!CHAVE) return res.status(500).json({ erro: 'GEMINI_API_KEY não configurada no arquivo .env' });

  const mensagens = Array.isArray(req.body.mensagens) ? req.body.mensagens.slice(-12) : [];
  const contents = mensagens
    .filter((m) => (m.role === 'user' || m.role === 'model') && typeof m.text === 'string' && m.text.trim())
    .map((m) => ({ role: m.role, parts: [{ text: m.text.slice(0, 400) }] }));

  if (!contents.length || contents[contents.length - 1].role !== 'user') {
    return res.status(400).json({ erro: 'Mensagem inválida.' });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELO}:generateContent`;
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': CHAVE },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: PERSONA }] },
        contents,
        generationConfig: { temperature: 0.6, maxOutputTokens: 500 },
      }),
    });
    const dados = await resp.json();
    if (!resp.ok) {
      console.error('Erro da API de IA:', dados.error?.message || resp.status);
      return res.status(502).json({ erro: 'Falha ao consultar a IA.' });
    }
    const texto = dados.candidates?.[0]?.content?.parts?.map((p) => p.text).join('').trim();
    res.json({ resposta: texto || 'Não consegui formular uma resposta. Pode reformular a pergunta?' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno.' });
  }
});

// ===== Formulário de inscrição (salva em server/data/inscricoes.json) =====
app.post('/api/inscricao', limitar, (req, res) => {
  const { nome, email, nivel, interesse, mensagem } = req.body;
  const emailOk = typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (typeof nome !== 'string' || nome.trim().length < 3 || !emailOk || !nivel || !interesse) {
    return res.status(400).json({ erro: 'Dados inválidos.' });
  }
  const pasta = path.join(__dirname, 'data');
  const arquivo = path.join(pasta, 'inscricoes.json');
  fs.mkdirSync(pasta, { recursive: true });
  const lista = fs.existsSync(arquivo) ? JSON.parse(fs.readFileSync(arquivo, 'utf8')) : [];
  lista.push({
    nome: nome.trim().slice(0, 100),
    email: email.trim().slice(0, 100),
    nivel: String(nivel).slice(0, 60),
    interesse: String(interesse).slice(0, 80),
    mensagem: String(mensagem || '').slice(0, 500),
    data: new Date().toISOString(),
  });
  fs.writeFileSync(arquivo, JSON.stringify(lista, null, 2));
  res.json({ ok: true });
});

app.listen(PORTA, () => console.log(`PJK SimpliCode rodando em http://localhost:${PORTA}`));
