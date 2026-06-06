<div align="center">
  <img src="https://sam.netdw.tech/logo_big.svg" alt="SAM – Sistema de Apoio Municipal" width="160" />

  <h1>SAM - Sistema de Apoio Municipal</h1>
  <p><em>Back-end da plataforma</em></p>

  <p>
    <img src="https://img.shields.io/badge/Node.js-22-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express 5" />
    <img src="https://img.shields.io/badge/Sequelize-6-52B0E7?style=for-the-badge&logo=sequelize&logoColor=white" alt="Sequelize 6" />
    <img src="https://img.shields.io/badge/Mongoose-9-880000?style=for-the-badge&logo=mongodb&logoColor=white" alt="Mongoose 9" />
    <img src="https://img.shields.io/badge/Socket.IO-4-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO 4" />
    <img src="https://img.shields.io/badge/JWT-Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
    <img src="https://img.shields.io/badge/MinIO-Storage-C72E49?style=for-the-badge&logo=minio&logoColor=white" alt="MinIO" />
  </p>

  <p>
    <a href="https://github.com/amorima/p2-sam-frontend">
      <img src="https://img.shields.io/badge/GitHub-Front--end-181717?style=flat-square&logo=github" alt="Repositório Front-end" />
    </a>
    <a href="https://github.com/amorima/p2-sam-backend">
      <img src="https://img.shields.io/badge/GitHub-Back--end-181717?style=flat-square&logo=github" alt="Repositório Back-end" />
    </a>
    <a href="https://github.com/amorima/p2-SAM-data-generator">
      <img src="https://img.shields.io/badge/GitHub-Gerador_de_Dados-181717?style=flat-square&logo=github" alt="Repositório Data Generator" />
    </a>
  </p>

  <p>
    <a href="https://github.com/amorima/p2-sam-backend/actions/workflows/deploy.yml">
      <img src="https://github.com/amorima/p2-sam-backend/actions/workflows/deploy.yml/badge.svg" alt="deploy backend" />
    </a>
  </p>
</div>

---

## Contexto Académico

Projeto Interdisciplinar WebPII desenvolvido no âmbito da:

> **Licenciatura em Tecnologias e Sistemas de Informação para a Web**  
> Escola Superior de Media Artes e Design (ESMAD)  
> Politécnico do Porto

Unidades curriculares envolvidas:

| Unidade Curricular       | Âmbito no projeto                                         |
| ------------------------ | --------------------------------------------------------- |
| Engenharia de Software   | Arquitetura, modelação e boas práticas de desenvolvimento |
| Base de Dados            | Modelação de dados, esquema relacional e persistência     |
| Programação Web II       | Implementação do back-end e integração com API REST       |
| Projeto II               | Gestão de projeto, documentação e entrega                 |
| Testes e Performance Web | Testes funcionais, de performance e de usabilidade        |

### Docentes

- Prof. Doutor Lino Rui dos Santos Oliveira
- Prof. Manuel Jorge de Abreu Antunes Lima
- Prof. Diogo Filipe de Bastos Sousa Ribeiro
- Prof.ª Inês Sofia Antunes Moura Reis
- Prof.ª Viviana da Costa Neto Henriques
- Prof.ª Doutora Teresa Cristina de Sousa Azevedo Terroso
- Prof. António Francisco da Costa Machado

---

## Sobre o Projeto

O **SAM (Sistema de Apoio Municipal)** é uma plataforma web para apoio à gestão de serviços e recursos do Município de Vila do Conde. Este repositório contém a API REST que suporta todas as operações da plataforma: autenticação, gestão de entidades, pedidos de bens, doações, leads de cidadãos, notificações em tempo real e telemetria de equipamentos.

A API usa **dois motores de persistência** em paralelo: MySQL para dados relacionais estruturados e MongoDB para dados semi-estruturados e de alta frequência.

---

## Funcionalidades

### Autenticação e Segurança

- Autenticação por NIF/email com JWT (access token 15 min + refresh token 7 dias)
- Rotação de refresh tokens com detecção de reutilização por família de tokens
- Tokens de API permanentes (`sam_*`) para integração com painéis e sistemas externos
- Controlo de acesso por role: `admin`, `institution`, `business`, `patron`
- Rate limiting granular (global, login, refresh)
- Headers de segurança via Helmet e CORS restritivo por domínio

### Gestão de Entidades

- **Mecenas (Patrons)**: registo, edição e gestão de doadores
- **Negócios**: registo, edição, gestão de ofertas e resposta a atribuições de bens
- **Instituições**: registo, edição e criação de pedidos de bens
- **Cidadãos**: registo automático no primeiro uso e gestão por administradores
- Suspensão/reactivação de entidades com motivo registado
- Upload de avatares para MinIO com limpeza automática de ficheiros anteriores

### Fluxo de Bens

- Instituição cria **pedido** com lista de bens necessários
- Admin aprova, aloca negócios parceiros e associa painéis digitais
- Negócio responde à atribuição (ACEITE / RECUSADO / CONCLUIDO)
- Cidadão cria **lead** no painel com PIN de entrega enviado por email
- Admin valida o PIN → lead marcada como ENTREGUE

### Doações e Financeiro

- Registo de doações monetárias com comprovativos
- Logs financeiros em MongoDB associados a cada doação
- Estatísticas agregadas por estado (pendente / aceite / rejeitado)
- Gestão própria pelo mecenas e gestão global pelo administrador

### Tempo Real e Telemetria

- Notificações em tempo real via Socket.IO (admins, por utilizador, painéis)
- Telemetria de lockers inteligentes com agregação de alertas
- Logs de interação com painéis digitais

### Cache e Performance

- Cache em memória com TTL de 60 s para endpoints de leitura frequente
- Invalidação por prefixo de rota em mutações
- Compressão de respostas HTTP

---

## Stack Tecnológica

| Tecnologia | Versão | Para quê |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) | 22 | Runtime JavaScript (ESM nativo) |
| [Express](https://expressjs.com/) | 5 | Framework HTTP |
| [Sequelize](https://sequelize.org/) | 6 | ORM para MySQL (dados relacionais) |
| [Mongoose](https://mongoosejs.com/) | 9 | ODM para MongoDB (dados semi-estruturados) |
| [Socket.IO](https://socket.io/) | 4 | WebSocket para notificações em tempo real |
| [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | 9 | Geração e verificação de JWT |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | 3 | Hash de passwords |
| [MinIO SDK](https://min.io/docs/minio/linux/developers/javascript/) | 8 | Armazenamento de ficheiros (avatares, comprovativos) |
| [Nodemailer](https://nodemailer.com/) | 8 | Envio de emails (PIN de entrega, registo) |
| [node-cache](https://github.com/node-cache/node-cache) | 5 | Cache em memória |
| [Helmet](https://helmetjs.github.io/) | 8 | Headers de segurança HTTP |
| [express-rate-limit](https://github.com/express-rate-limit/express-rate-limit) | 8 | Rate limiting por rota |
| [multer](https://github.com/expressjs/multer) | 2 | Upload de ficheiros multipart |
| [compression](https://github.com/expressjs/compression) | 1 | Compressão gzip das respostas |

### Outros Repositórios

| Repositório | Descrição |
| --- | --- |
| [p2-sam-frontend](https://github.com/amorima/p2-sam-frontend) | Interface Nuxt 3 (administração e painel do cidadão) |
| [p2-sam-backend](https://github.com/amorima/p2-sam-backend) | Este repositório |
| [p2-SAM-data-generator](https://github.com/amorima/p2-SAM-data-generator) | Scripts de geração de dados sintéticos para testes |

---

## Estrutura do Projeto

```
p2-sam-backend/
├── controllers/
│   ├── auth.controllers.js          # Login, refresh, logout, perfil, avatar
│   ├── api_tokens.controllers.js    # Tokens de API permanentes
│   ├── business.controllers.js      # CRUD negócios + ofertas
│   ├── citizens.controllers.js      # CRUD cidadãos
│   ├── donations.controllers.js     # CRUD doações (admin e por mecenas)
│   ├── entities.controllers.js      # Perfil, bloqueio e eliminação de entidades
│   ├── goods_services.controllers.js # Catálogo de bens e serviços
│   ├── institutions.controllers.js  # CRUD instituições
│   ├── leads.controllers.js         # CRUD leads + validação de PIN
│   ├── logs.controllers.js          # Logs financeiros e de interação
│   ├── minio.controllers.js         # Upload e download de ficheiros
│   ├── needs.controllers.js         # CRUD pedidos + resposta de negócio
│   ├── notifications.controllers.js # CRUD notificações + marcar como lidas
│   ├── offers.controllers.js        # CRUD ofertas (global e por negócio)
│   ├── patrons.controllers.js       # CRUD mecenas
│   ├── telemetry.controllers.js     # Telemetria de lockers
│   └── vouchers.controllers.js      # CRUD vouchers
├── middleware/
│   ├── auth.middleware.js           # Verificação JWT, API token e controlo de roles
│   ├── cache.middleware.js          # Cache em memória com invalidação por prefixo
│   ├── donations.middleware.js      # Validação de payloads de doações
│   ├── needs.middleware.js          # Validação de payloads de pedidos
│   └── offers.middleware.js         # Validação de payloads de ofertas
├── models/
│   ├── db.config.js                 # Inicialização Sequelize + Mongoose e relações
│   ├── entities.models.js           # Entidade base (patron / business / institution)
│   ├── business.models.js
│   ├── institutions.models.js
│   ├── citizens.models.js
│   ├── needs.models.js
│   ├── need_item.models.js
│   ├── goods_services.models.js
│   ├── offers.models.js
│   ├── donations.models.js
│   ├── leads.models.js
│   ├── panels.models.js
│   ├── lockers.model.js
│   ├── locations.model.js
│   ├── contacts.models.js
│   ├── notifications.models.js      # MongoDB
│   ├── refresh_tokens.models.js     # MongoDB
│   ├── api_tokens.models.js         # MongoDB
│   ├── financial_logs.models.js     # MongoDB
│   ├── interaction_logs.models.js   # MongoDB
│   ├── locker_telemetry.models.js   # MongoDB
│   └── vouchers.models.js           # MongoDB
├── routes/                          # Definição de rotas por recurso
├── utils/
│   ├── auth.utils.js                # JWT, bcrypt, tokens de API
│   ├── cache.utils.js               # Cache em memória
│   ├── donation.utils.js            # Validação e construção de logs financeiros
│   ├── email.utils.js               # Envio de emails (PIN, registo)
│   ├── entity.utils.js              # Formatação e sincronização de entidades
│   ├── error.utils.js               # Fábrica de erros HTTP tipados
│   ├── minio.utils.js               # Cliente MinIO e operações sobre ficheiros
│   ├── need.utils.js                # Construção e validação de items de pedidos
│   ├── offer.utils.js               # Validação de ofertas
│   ├── paginate.utils.js            # Paginação e links HATEOAS
│   └── socket.js                    # Socket.IO: salas, notificações, telemetria
├── server.js                        # Ponto de entrada: Express, middlewares globais
└── .env                             # Variáveis de ambiente (não versionado)
```

---

## Instalação

### Pré-requisitos

- [Node.js](https://nodejs.org/) >= 20
- MySQL >= 8
- MongoDB >= 6
- Instância MinIO (ou compatível S3)

### Passos

```bash
git clone https://github.com/amorima/p2-sam-backend.git
cd p2-sam-backend
npm install
```

Criar um ficheiro `.env` na raiz (ver secção [Variáveis de Ambiente](#variáveis-de-ambiente)).

```bash
# Desenvolvimento
npx nodemon server.js

# Produção
pm2 start server.js --name backend
```

A API fica disponível em `http://localhost:<PORT>`.

---

## Variáveis de Ambiente

| Variável | Descrição |
| --- | --- |
| `DB_HOST` | Host do servidor MySQL |
| `DB_NAME` | Nome da base de dados MySQL |
| `DB_USER` | Utilizador MySQL |
| `DB_PASS` | Password MySQL |
| `DB_DIAL` | Dialecto Sequelize (`mysql`) |
| `MONGO_URI` | URI de ligação MongoDB |
| `PORT` | Porta do servidor HTTP |
| `HOST` | Host de escuta (`0.0.0.0` em produção) |
| `JWT_SECRET` | Segredo para assinar access tokens |
| `JWT_EXPIRE` | Validade do access token (ex: `15m`) |
| `JWT_REFRESH_SECRET` | Segredo para assinar refresh tokens |
| `JWT_REFRESH_EXPIRE` | Validade do refresh token (ex: `7d`) |
| `INTERNAL_API_KEY` | Chave para o proxy interno Nuxt → backend |
| `API_TOKEN_SECRET` | Segredo HMAC para tokens de API permanentes |
| `MINIO_ENDPOINT` | Endpoint MinIO |
| `MINIO_PORT` | Porta MinIO |
| `MINIO_ACCESS_KEY` | Access key MinIO |
| `MINIO_SECRET_KEY` | Secret key MinIO |
| `MINIO_USE_SSL` | Usar SSL no MinIO (`true` / `false`) |
| `EMAIL_HOST` | Host SMTP |
| `EMAIL_PORT` | Porta SMTP |
| `EMAIL_USER` | Utilizador SMTP |
| `EMAIL_PASS` | Password SMTP |
| `EMAIL_FROM` | Endereço de remetente |

---

## Roles e Permissões

| Funcionalidade | Admin | Institution | Business | Patron |
| --- | --- | --- | --- | --- |
| Gestão de entidades | ✅ | ❌ | ❌ | ❌ |
| Criar / gerir pedidos | ✅ | ✅ (próprios) | ❌ | ❌ |
| Responder a atribuições | ❌ | ❌ | ✅ (próprias) | ❌ |
| Gerir ofertas | ✅ | ❌ | ✅ (próprias) | ❌ |
| Criar / gerir doações | ✅ | ❌ | ❌ | ✅ (próprias) |
| Gerir leads | ✅ | ❌ | ❌ | ❌ |
| Validar PIN de entrega | ✅ | ❌ | ❌ | ❌ |
| Notificações próprias | ✅ | ✅ | ✅ | ✅ |
| Tokens de API | ✅ | ✅ | ✅ | ✅ |

---

## Estado do Projeto

- [x] Autenticação JWT com rotação de tokens e detecção de reutilização
- [x] Tokens de API permanentes para painéis e integrações externas
- [x] CRUD completo de instituições, negócios, mecenas e cidadãos
- [x] Fluxo de pedidos: criação, alocação, resposta de negócio e entrega
- [x] Sistema de leads com validação de PIN e notificação por email
- [x] Doações com logs financeiros e estatísticas agregadas
- [x] Notificações em tempo real via Socket.IO
- [x] Telemetria de lockers com alertas agregados
- [x] Cache em memória com invalidação automática
- [x] Upload e gestão de ficheiros via MinIO
- [x] Rate limiting granular e headers de segurança
- [x] Paginação e busca em todos os recursos de listagem

---

<div align="center">
  <sub>Desenvolvido para fins académicos · ESMAD - Politécnico do Porto · 2025/2026</sub>
</div>
