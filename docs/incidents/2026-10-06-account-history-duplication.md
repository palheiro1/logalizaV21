# Histórico duplicado entre Chantadeninha e Cepequena

Verificação em produção feita em 6 de outubro de 2026, com consultas de leitura.

Cepequena foi criada em 10 de setembro de 2026. Tem cinco resultados diários e
o último é de 13 de setembro. Não há novas partidas dessa conta entre 14 de
setembro e 6 de outubro. Chantadeninha tem partidas até 6 de outubro.

| Dia da partida | Cepequena | Chantadeninha | Tentativas iguais |
| --- | ---: | ---: | --- |
| 2026-08-31 | 0 | 0 | Sim |
| 2026-09-01 | 0 | 0 | Sim |
| 2026-09-02 | 115 | 115 | Sim |
| 2026-09-10 | 160 | 110 | Não |
| 2026-09-13 | 70 | 70 | Sim |

Os três resultados anteriores à criação da conta foram inseridos em sequência
no login de 13 de setembro pela recuperação de partidas. O resultado de 13 de
setembro também foi inserido imediatamente após esse login, com as mesmas
tentativas da conta original. As estatísticas gerais de Cepequena indicam 100
jogos e foram atualizadas pela última vez nesse dia: receberam o histórico
partilhado do navegador. Há duas linhas de estatísticas dessa conta, uma inicial
com zero jogos e outra com o histórico copiado. A aplicação deve ler a mais recente.

A gravação de resultados no servidor usa `auth.uid()` e as políticas de escrita
restringem as linhas à própria conta. Não foi encontrado um trigger que replique
resultados entre contas. A origem da cópia está no cliente:

- `guesses` e os bónus eram guardados no navegador sem identificação de conta.
- O login copiava as estatísticas desse histórico para a conta autenticada.
- A recuperação usava as mesmas partidas antigas para cada conta que entrasse.
- A gravação por RPC não validava se a sessão ainda correspondia à conta da chamada.

A correção separa o armazenamento por conta, carrega o histórico dessa conta do
servidor, preserva as estatísticas anteriores ao histórico diário e cancela
respostas de sessões antigas. As escritas validam a conta e fixam o token da
sessão na requisição. O histórico local antigo é preservado, mas não é atribuído
automaticamente a uma conta. Uma partida nova de convidado pode ser atribuída
uma única vez à conta que entrar.

Os dados de produção não foram alterados. Para uma correção posterior dos dados,
os três resultados anteriores à criação são inválidos; o de 13 de setembro tem
evidência de cópia no login. O de 10 de setembro tem tentativas próprias e deve
ser preservado. As estatísticas gerais copiadas precisam de reconstrução a partir
das partidas legítimas. A publicação da correção é necessária para impedir que
clientes com o código antigo voltem a copiar histórico.

Validação local: 57 testes passaram, incluindo troca de contas, respostas de
sessões antigas, recuperação, conservação das estatísticas históricas e uma
gravação interrompida. A compilação TypeScript e a build de produção passaram.
O aviso de tamanho do bundle permanece. O espaço disponível ficou em cerca de
279 GB antes e depois; foram reutilizadas as dependências existentes.
