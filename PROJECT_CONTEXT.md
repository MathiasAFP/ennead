# Contexto do Projeto - Hackathon

## Equipe

- Nome da equipe: Ennead
- Grupo: 16
- Hackathon do IFC Campus Concórdia

## Produto

- Nome definitivo do produto: Reperio

## Situação Atual

O problema já foi validado com usuários.
Não devemos procurar outro problema neste momento.
O próximo objetivo é desenvolver e demonstrar um MVP convincente.

## Problema Validado

Equipes de suporte têm dificuldade para recuperar e reaproveitar conhecimento de atendimentos anteriores quando:

- Chamados semelhantes são descritos de maneiras diferentes.
- Registros anteriores possuem poucas informações.
- Informações ficam distribuídas.
- O reconhecimento de casos recorrentes depende muito da experiência individual do atendente.

Isso faz com que problemas já resolvidos sejam investigados novamente, causando:

- Repetição de perguntas.
- Repetição de diagnósticos.
- Retrabalho.
- Perda de tempo.
- Dependência de funcionários mais experientes.
- Dificuldade de reutilizar conhecimento que a própria empresa já possui.

## Público-Alvo

Equipes de suporte e atendimento técnico que lidam com chamados recorrentes e possuem histórico pouco padronizado ou disperso.

## Validação

Foi realizado um formulário com 18 respostas.

Resultados principais:

- 55,6% recebem problemas recorrentes diariamente ou semanalmente.
- 77,8% enfrentam recorrências pelo menos mensalmente.
- 83,3% relataram situações em que um problema já resolvido anteriormente precisou ser investigado novamente.
- 72,2% indicaram que problemas semelhantes costumam ser descritos de formas diferentes.
- 66,7% apontaram que registros anteriores possuem poucas informações.
- 77,8% disseram que o reconhecimento de problemas já resolvidos varia de acordo com o atendente.
- O nível médio percebido de retrabalho foi 2,56 em uma escala de 1 a 5.

Esses dados indicam que o problema não é simplesmente falta de informação, mas dificuldade de localizar, reconhecer e reutilizar conhecimento existente.

## Solução Proposta

Criar uma espécie de "copiloto de memória operacional" para equipes de suporte.

Ao receber a descrição de um novo chamado, o sistema deverá buscar semanticamente no histórico e encontrar atendimentos anteriores semelhantes, mesmo que tenham sido escritos com palavras diferentes.

Em vez de simplesmente mostrar uma lista de tickets, o sistema deverá apresentar conhecimento útil extraído dos casos anteriores.

## Experiência Principal

Fluxo simplificado:

1. O atendente recebe ou cria um novo chamado.
2. Insere ou visualiza a descrição do problema.
3. O sistema analisa a descrição.
4. Uma busca semântica procura casos anteriores semelhantes.
5. O sistema apresenta aproximadamente 3 casos mais relevantes.
6. Para cada caso, devem ser destacados:
   - Problema.
   - Possível causa.
   - Solução utilizada.
   - Passos executados.
   - Informações relevantes do atendimento anterior.
7. O atendente utiliza essas informações como apoio ao diagnóstico.
8. A decisão final continua sendo humana.
9. Após resolver o chamado, o atendimento deve ser registrado de maneira mais estruturada para melhorar a base de conhecimento.

## Princípio Importante

A solução não deve tentar substituir o atendente nem responder automaticamente tudo.

O objetivo é recuperar memória organizacional e ajudar o atendente a encontrar rapidamente conhecimento que já existe.

Sempre deve existir confirmação humana antes de aplicar uma solução sugerida.

## MVP

O MVP deve demonstrar principalmente:

- Criação/visualização de um chamado.
- Campo com descrição do problema.
- Análise do chamado.
- Busca de casos semelhantes.
- Exibição dos casos anteriores mais relevantes.
- Visualização da causa, solução e passos utilizados.
- Possibilidade de selecionar/ver detalhes de um caso.
- Finalização do chamado.
- Registro estruturado da solução utilizada.

Evitar funcionalidades secundárias que não sejam necessárias para provar a proposta de valor.

## Plataforma

O produto será uma aplicação web desktop-first.

Desktop é prioritário porque o uso principal ocorre durante o trabalho do atendente, normalmente em um computador.

Não desenvolver um aplicativo mobile nativo para o MVP.

A interface pode ser responsiva, mas celular não é prioridade nesta etapa.

## Prototipagem

Já existe uma direção de wireframe/protótipo voltada para desktop.

O fluxo da interface deve deixar muito evidente:

**Chamado novo -> análise -> casos semelhantes -> detalhes da solução -> resolução.**

## Critério Para Decisões Técnicas

Este é um projeto de hackathon.

Priorizar:

1. MVP funcionando.
2. Demonstração clara.
3. Velocidade de desenvolvimento.
4. Boa experiência visual.
5. Código simples e fácil de modificar.

Evitar:

- Arquitetura excessivamente complexa.
- Funcionalidades que não fortalecem a demonstração.
- Tentar construir um sistema corporativo completo.

## Objetivo da Demo

Uma pessoa assistindo à demonstração deve entender rapidamente:

> "Um atendente recebeu um problema. Em vez de investigar tudo novamente, o sistema encontrou casos semelhantes que a empresa já resolveu e mostrou como eles foram solucionados."

Esse momento deve ser o principal efeito de demonstração do produto.

## Próxima Etapa

Definir a stack técnica e construir a primeira versão funcional do MVP.

## Stack Técnica

Decisões técnicas para o MVP:

- Next.js com App Router.
- TypeScript.
- Tailwind CSS.
- Supabase/PostgreSQL.
- pgvector para busca por similaridade semântica.
- Ollama local com o modelo bge-m3 para embeddings de 1024 dimensões.
- Lucide React para ícones.
- Vercel como opção de deploy.

Princípios técnicos:

- Frontend e backend devem permanecer no mesmo projeto Next.js.
- Nenhuma chave de API deve ser exposta no navegador.
- Autenticação não fará parte do MVP inicial.
- Evitar dependências e abstrações desnecessárias.
- Priorizar uma aplicação funcional para demonstração.
- Preparar dados fictícios realistas para demonstrar chamados anteriores.
- A busca semântica real será a funcionalidade central.
- Deve existir posteriormente uma estratégia simples de fallback para a demo caso algum serviço externo esteja indisponível.
- A geração de embeddings ocorre somente no servidor, usando Ollama local durante o hackathon, sem custo de API.
- Uma versão futura em produção poderá trocar o provedor de embeddings sem alterar o conceito do sistema.

## Fluxo e Telas do MVP

### 1. Dashboard

Tela inicial desktop.

Objetivo:

Permitir que o atendente veja rapidamente os chamados e inicie um novo atendimento.

Elementos:

- Nome/logo do produto.
- Sidebar simples.
- Botão "Novo chamado".
- Lista de chamados recentes.
- Status dos chamados.
- Título e pequena descrição.
- Data.
- Alguns indicadores simples, como:
  - Chamados abertos.
  - Resolvidos.
  - Casos semelhantes encontrados.

Não transformar o dashboard em uma tela analítica complexa.

### 2. Novo Chamado

Objetivo:

Registrar rapidamente o problema recebido pelo atendente.

Campos:

- Título do chamado.
- Descrição do problema.
- Categoria opcional.

CTA principal:

**"Analisar chamado"**

A descrição do problema deve ser o elemento mais importante da tela.

Após clicar em "Analisar chamado", o sistema deve iniciar a busca semântica por chamados anteriores.

### 3. Workspace do Chamado

Esta deve ser a tela central do produto e a mais importante durante a demonstração.

Deve apresentar:

#### Chamado Atual

- Título.
- Descrição.
- Categoria.
- Status.

#### Casos Semelhantes

Mostrar aproximadamente 3 casos anteriores encontrados pela busca semântica.

Cada card deve possuir:

- Título do chamado anterior.
- Resumo.
- Categoria.
- Indicador de similaridade.
- Status/resolução.

Usar o termo "Similaridade" e não "Confiança da IA".

Exemplo:

**"Similaridade: 87%"**

#### Detalhes do Caso Anterior

Ao selecionar um caso semelhante, abrir um painel lateral, modal ou área expandida, sem necessariamente navegar para outra página.

Mostrar:

- Problema relatado.
- Causa identificada.
- Solução utilizada.
- Passos executados.
- Observações relevantes.

Deve existir uma ação como:

**"Usar como referência"**

Isso não deve aplicar automaticamente a solução.

A decisão continua sendo do atendente.

#### Resolução do Chamado

Após investigar o problema, o atendente poderá registrar:

- Causa identificada.
- Solução aplicada.
- Passos executados.
- Observações.

CTA:

**"Resolver chamado"**

Ao concluir, essas informações devem formar um registro estruturado que posteriormente poderá ser encontrado em buscas semelhantes.

## Fluxo Principal da Demonstração

Dashboard
-> Novo chamado
-> Preencher problema
-> Analisar chamado
-> Buscar casos semelhantes
-> Mostrar 3 resultados
-> Selecionar caso
-> Visualizar causa, solução e passos
-> Usar como referência
-> Registrar solução atual
-> Resolver chamado

## Diretrizes de Interface

- Desktop-first.
- Aparência profissional de software corporativo moderno.
- Interface limpa.
- Hierarquia visual forte.
- Evitar excesso de cards.
- Evitar gráficos que não ajudem a proposta.
- Navegação simples.
- Poucas cores.
- Estados de loading claros durante a análise.
- Feedback visual quando casos semelhantes forem encontrados.
- Priorizar velocidade e clareza durante a demonstração.

A tela mais importante do sistema é o Workspace do Chamado.

## Privacidade, Segurança e LGPD

Privacidade e proteção de dados são requisitos fundamentais da arquitetura do Reperio e devem ser consideradas desde o desenvolvimento, seguindo princípios de privacy by design.

### Princípios

- Coletar e armazenar somente dados necessários para a finalidade do atendimento.
- Evitar armazenamento de dados pessoais desnecessários.
- Aplicar cuidado reforçado a dados pessoais sensíveis.
- Utilizar dados fictícios durante desenvolvimento e demonstração do hackathon.
- Nunca considerar embeddings automaticamente anônimos.
- Nunca expor chaves privadas, service_role ou segredos no frontend.
- Não registrar dados pessoais ou sensíveis desnecessariamente em logs.

### Banco de Dados

Quando Supabase/PostgreSQL for implementado:

- Utilizar tenant_id para separar dados de diferentes organizações.
- Ativar Row Level Security (RLS).
- Impedir acesso entre organizações.
- Utilizar UUIDs como identificadores.
- Aplicar políticas de acesso restritivas.
- Permitir exclusão ou anonimização de dados quando necessário.
- Considerar política de retenção de dados.
- Manter informações sensíveis fora de tabelas ou campos quando não forem necessárias.

### Busca Semântica e Embeddings

Antes da geração de embeddings, criar futuramente uma etapa de sanitização/minimização.

Sempre que possível, remover ou substituir do texto usado para busca semântica:

- Nomes completos.
- CPF.
- RG.
- E-mails.
- Telefones.
- Endereços.
- Identificadores pessoais.
- Dados de saúde.
- Biometria.
- Religião.
- Opinião política.
- Origem racial ou étnica.
- Vida sexual.
- Outros dados sensíveis não necessários para solucionar o chamado.

O texto sanitizado deve ser utilizado para geração de embeddings.

No MVP, os embeddings utilizam Ollama local com o modelo bge-m3 e 1024 dimensões. Somente conteúdo previamente sanitizado pode ser enviado ao Ollama. `description_original` nunca deve ser usado como fallback para geração de embeddings.

O Ollama roda localmente no computador responsável pela demonstração. Uma futura versão em produção poderá usar outro provedor de embeddings sem alterar o conceito de recuperação de conhecimento do sistema.

O conteúdo original, quando realmente necessário para a operação, deve permanecer separado e sujeito a controles de acesso mais restritos.

### APIs Externas

- Enviar para APIs externas somente o conteúdo mínimo necessário.
- Priorizar texto previamente sanitizado.
- Nunca enviar segredos ou informações pessoais desnecessárias.
- Chamadas de embeddings devem ocorrer exclusivamente no servidor.
- Antes de uso em produção, avaliar políticas de tratamento de dados, contratos, retenção e transferência internacional dos fornecedores envolvidos.

### Segurança

A arquitetura deverá posteriormente considerar:

- Autenticação.
- Autorização.
- Isolamento entre organizações.
- Proteção contra acesso indevido.
- Auditoria de ações relevantes.
- Tratamento seguro de variáveis de ambiente.
- Prevenção de exposição de dados em logs e mensagens de erro.
- Proteção dos endpoints do servidor.

### Importante

O MVP de hackathon não deve alegar automaticamente estar "100% em conformidade com a LGPD".

A arquitetura deve ser desenvolvida com os princípios da LGPD em mente, mas conformidade real também depende de aspectos jurídicos, organizacionais, bases legais, políticas internas, contratos e processos de tratamento de dados.

## Melhorias Futuras

### Registro Inteligente por Voz

Possível evolução futura:

- Permitir que o atendente grave um áudio após resolver o chamado.
- Transcrever o áudio.
- Utilizar IA para sugerir causa, solução e passos executados.
- Exigir revisão e confirmação humana antes de salvar.
- Manter preenchimento manual como alternativa.
- Aplicar sanitização/minimização de dados antes do processamento.
- Evitar armazenar o áudio original por padrão.
- Considerar requisitos de LGPD e privacidade.

Essa funcionalidade não faz parte do MVP atual.
