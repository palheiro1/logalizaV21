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

A correção de dados foi aplicada em produção em 6 de outubro de 2026, após um
ensaio transacional revertido e a verificação de uma cópia encriptada dos cinco
resultados e das duas linhas de estatísticas no disco externo. Foram removidas
as quatro partidas copiadas de 31 de agosto, 1, 2 e 13 de setembro, e a linha
redundante de estatísticas iniciais. A partida de 10 de setembro foi preservada
integralmente: 160 pontos, vitória na primeira tentativa e três bónus.

Cepequena passou de 345 para 160 pontos no histórico registado e de 100 para
1 jogo nas estatísticas gerais. As estatísticas corrigidas indicam uma vitória,
100% de vitórias, sequências atual e máxima de 1, distância média de 0 e uma
vitória na primeira tentativa. Os dados de Chantadeninha mantiveram os mesmos
checksums antes e depois da correção. O script de reparação é
`scripts/repairs/2026-10-06-cepequena.sql` e aborta se os registos já tiverem mudado.

A evidência recuperável deve ser conservada até o utilizador autorizar a sua
libertação. A cópia está em
`/mnt/usb-TOSHIBA_External_USB_3.0_20150716000684C-0:0-part1/Codex-encrypted-recovery/logaliza/cepequena-repair-20261006-before.json.age`.
A chave privada de recuperação está protegida com permissões 0600 em
`/home/usuario/.local/share/logaliza-recovery/cepequena-repair-20261006.agekey`, fora
do repositório. O conteúdo foi desencriptado em memória e comparado com a cópia
original antes da alteração; o manifesto no disco externo regista os checksums.

Foram acrescentadas proteções para respeitar correções do servidor: uma sessão
com estatísticas antigas não pode substituir uma versão mais recente, e as
partidas concluídas anteriormente reconhecidas pelo servidor que foram removidas
numa correção de contadores deixam de ser recuperadas a partir do cache da conta.
O progresso offline ainda não reconhecido e as outras contas são preservados.

Validação local: 60 testes passaram, incluindo troca de contas, respostas de
sessões antigas, recuperação, conservação das estatísticas históricas e uma
gravação interrompida. A compilação TypeScript e a build de produção passaram.
O aviso de tamanho do bundle permanece. O espaço disponível ficou em cerca de
279 GB antes e depois; foram reutilizadas as dependências existentes.
