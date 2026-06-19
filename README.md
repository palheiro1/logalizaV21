# LoGaliza!

**Joga e aprende geografia galega aqui: [https://logaliza.estreleira.gal](https://logaliza.estreleira.gal) !**

LoGaliza! é um jogo diário de geografia inspirado no Worldle, focado nas comarcas da Galiza. Cada dia, os jogadores têm a oportunidade de adivinhar uma comarca específica usando pistas progressivas, promovendo o conhecimento sobre a cultura, história e geografia da região.

## Como Jogar

### Objetivo
Adivinhe a comarca galega do dia em até 4 tentativas. Cada tentativa revela pistas sobre a comarca correta.

### Mecânica do Jogo
1. **Pistas Progressivas**: A cada tentativa incorreta, você recebe novas pistas sobre a comarca:
   - População
   - Área
   - Distância e direção da comarca correta
   - Outras informações culturais e históricas (como cabeceiras, comarcas limítrofes, escudos, etc.)

2. **Modos de Jogo**:
   - **Modo Clássico**: Adivinhe a comarca usando as pistas fornecidas.
   - **Modo Mapa**: Visualize a localização no mapa interativo.

3. **Pontuação e Estatísticas**:
   - Ganhe pontos baseados no número de tentativas e nos bónus diários.
   - Acompanhe seu progresso no campeonato mensal e no leaderboard geral.
   - Compartilhe seus resultados com amigos.

### Dicas para Jogadores
- Comece com comarcas que você conhece bem para ganhar pistas iniciais.
- Use as informações sobre população e área para estreitar as possibilidades.
- Preste atenção às pistas culturais para identificar a comarca única.

## Funcionalidades

- **Jogo Diário**: Uma nova comarca todos os dias.
- **Pistas Diversificadas**: Além das silhuetas dos mapas, inclui informações sobre cultura, história e costumes.
- **Leaderboard**: Compita com outros jogadores no campeonato mensal.
- **Partilha social**: Compartilhe resultados e bónus do dia.
- **Interface Responsiva**: Jogue no desktop ou mobile.
- **Suporte a Múltiplos Idiomas**: Disponível em galego e português.
- **Autenticação**: Faça login para salvar seu progresso e estatísticas.

## Tecnologias Utilizadas

Este projeto é desenvolvido com as seguintes tecnologias:

- **Frontend**: React.js com TypeScript
- **Styling**: Tailwind CSS e PostCSS
- **Backend**: Supabase (para autenticação, banco de dados e funções serverless)
- **Mapas e Imagens**: SVG maps de amCharts e imagens da Wikipedia
- **Emojis**: Twemoji (Twitter Emojis)
- **Build Tool**: Create React App
- **Outros**: Service Workers para PWA, i18n para internacionalização

## Instalação e Desenvolvimento

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn
- Conta no Supabase (para configuração do backend)

### Passos para Instalação
1. **Clone o repositório**:
   ```bash
   git clone https://github.com/palheiro1/logalizaV21.git
   cd logalizaV21
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure o Supabase**:
   - Crie um projeto no [Supabase](https://supabase.com/).
   - Copie as chaves da API (anon key e service role key).
   - Configure as variáveis de ambiente no arquivo `.env`:
     ```
     REACT_APP_SUPABASE_URL=your_supabase_url
     REACT_APP_SUPABASE_ANON_KEY=your_anon_key
     ```

4. **Configure o banco de dados**:
   - Execute o script `database-setup.sql` no seu projeto Supabase para criar as tabelas necessárias.

5. **Execute o projeto em modo de desenvolvimento**:
   ```bash
   npm start
   ```
   O aplicativo estará disponível em `http://localhost:3000`.

6. **Build para produção**:
   ```bash
   npm run build
   ```

### Scripts Disponíveis
- `npm start`: Inicia o servidor de desenvolvimento.
- `npm run build`: Cria uma build otimizada para produção.
- `npm test`: Executa os testes.
- `npm run eject`: Ejeta do Create React App (irreversível).

### Estrutura do Projeto
```
src/
├── components/          # Componentes React
├── contexts/            # Contextos (ex: AuthContext)
├── domain/              # Lógica de domínio e tipos
├── hooks/               # Hooks customizados
├── lib/                 # Configurações (ex: Supabase)
├── services/            # Serviços (ex: statsService)
└── types/               # Tipos TypeScript
```

## Contribuição

Este projeto é open-source e aceitamos contribuições de todos! Se você é um desenvolvedor, designer ou entusiasta da geografia galega, sinta-se à vontade para contribuir.

### Como Contribuir
1. **Fork o repositório** e crie uma branch para sua feature:
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```

2. **Faça suas mudanças** e teste localmente.

3. **Envie um Pull Request** com uma descrição detalhada das mudanças.

### Ideias para Melhorias
- Adicionar mais pistas (ex: bandeiras, hinos, personalidades famosas).
- Melhorar a UI/UX com animações e transições.
- Implementar modo offline.
- Expandir para outras regiões além da Galiza.
- Adicionar testes automatizados mais abrangentes.

### Diretrizes de Código
- Use TypeScript para tipagem forte.
- Siga as convenções de nomenclatura do projeto.
- Escreva testes para novas funcionalidades.
- Mantenha a compatibilidade com navegadores modernos.

## Licença

Este projeto é licenciado sob a [MIT License](LICENSE). Veja o arquivo LICENSE para mais detalhes.

## Créditos

- **Inspirado em**: [Worldle](https://worldle.teuteuf.fr/) por @teuteuf.
- **Desenvolvedores**: Comunidade open-source.
- **Recursos**:
  - Mapas SVG: [amCharts](http://www.amcharts.com/svg-maps/)
  - Imagens: Wikipedia
  - Emojis: [Twemoji](https://github.com/twitter/twemoji)

Agradecemos a todos os contribuidores e à comunidade por tornar este projeto possível!

---

**Divirta-se aprendendo geografia galega com LoGaliza!**
