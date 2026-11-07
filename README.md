# PJK SimpliCode

Site de venda de cursos de programação, com um assistente de IA chamado **Byte**. Projeto da AV3 (Parte 1) da disciplina de Desenvolvimento Web para IA, Bacharelado em Inteligência Artificial, Faculdade Estadual Piauí, Instituto de Tecnologia (PIT).

> Cenário fictício: a PJK SimpliCode é uma escola online de Teresina (PI) que ensina programação do zero para quem quer entrar na área de tecnologia.

## Integrantes

| Nome | Responsabilidade principal |
|------|----------------------------|
| Karina Lira De Almeida | HTML e CSS (layout, cards, responsividade) |
| Paula Beron Silva Cardoso | JavaScript (menu, formulário) e imagens |
| Jennifer Kelly Cunha Santos | Servidor, chatbot e persona da IA |

## Público-alvo

Iniciantes, estudantes e pessoas em transição de carreira que querem aprender programação em português, com projetos práticos.

## Tecnologias utilizadas

- HTML5, CSS3 (Grid e Flexbox) e JavaScript
- Node.js e Express (servidor e API do site)
- API do Google Gemini (inteligência artificial do chatbot)
- Git e GitHub (controle de versão)

## Instalação e execução

Pré-requisito: [Node.js](https://nodejs.org) 20 ou superior.

```bash
git clone https://github.com/Kelly1788/Projeto-Interdisciplinar-web.git
cd Projeto-Interdisciplinar-web
npm install
cp .env.example .env     # no Windows: copy .env.example .env
```

Abra o arquivo `.env` e coloque sua chave do Gemini (gratuita em https://aistudio.google.com/apikey) em `GEMINI_API_KEY`. Depois:

```bash
npm start
```

Acesse **http://localhost:3000**.

## Funcionalidades

- Cabeçalho fixo com logomarca e menu de navegação (Início, Sobre, Cursos, Planos, Contato), com menu "hambúrguer" no celular
- Seções: apresentação, sobre, cursos (cards em CSS Grid), planos (cards em Flexbox), contato e rodapé
- Formulário de inscrição com validação no navegador e no servidor; os dados ficam em `server/data/inscricoes.json`
- Layout responsivo, foco visível para teclado e respeito a "reduzir movimento"
- Chatbot flutuante com sugestões de perguntas

## Integração com Inteligência Artificial

O assistente **Byte** é um mentor virtual com persona própria: simpático, direto e com leve toque regional, que conhece os cursos, preços e planos da PJK SimpliCode.

Como funciona:

1. O visitante escreve no chat (`js/chatbot.js`).
2. O navegador envia o histórico para `POST /api/chat` no nosso servidor (`server/server.js`).
3. O servidor chama a API do Gemini enviando a **persona** (`server/persona.js`) como `systemInstruction`, junto com as últimas mensagens.
4. A resposta volta ao navegador e é exibida no chat.

Pontos importantes:

- A chave da API fica só no `.env` (ignorado pelo Git), nunca no código do navegador.
- A persona define informações oficiais e **limites**: o Byte recusa assuntos fora do site e não inventa dados.
- O servidor limita o tamanho das mensagens, o histórico enviado e o número de requisições por minuto.

## Estrutura de pastas

```
pjk-simplicode/
├── index.html            Página única do site
├── css/
│   └── style.css         Estilos, cores e responsividade
├── js/
│   ├── main.js           Menu, animação do hero e formulário
│   └── chatbot.js        Interface do chat com o Byte
├── img/
│   └── logo.svg          Logomarca
├── server/
│   ├── server.js         Servidor Express, rotas /api/chat e /api/inscricao
│   └── persona.js        Persona e contexto do Byte
├── .env.example          Modelo das variáveis de ambiente
├── .gitignore
├── package.json
└── README.md
```
