begin;

insert into public.organizations (id, name)
values ('00000000-0000-4000-8000-000000000001', 'Empresa Demo Reperio')
on conflict (id) do update
set name = excluded.name;

alter table public.tickets disable trigger tickets_set_updated_at;

insert into public.tickets (
  organization_id,
  ticket_number,
  title,
  description_original,
  description_sanitized,
  category,
  status,
  department,
  equipment,
  created_at,
  updated_at,
  resolved_at
)
values
  (
    '00000000-0000-4000-8000-000000000001',
    1048,
    'Impressora não aparece na rede',
    'O computador do setor financeiro não consegue localizar a impressora compartilhada. Outros computadores continuam imprimindo normalmente.',
    'Estação de trabalho não consegue localizar impressora compartilhada enquanto outras estações continuam imprimindo normalmente.',
    'Impressão',
    'analyzing',
    'Financeiro',
    'Estação-FIN-02',
    '2026-09-09T09:10:00-03:00',
    '2026-09-09T14:25:00-03:00',
    null
  ),
  (
    '00000000-0000-4000-8000-000000000001',
    1047,
    'Usuário não consegue acessar o ERP',
    'Usuário recebe erro de autenticação ao tentar acessar o sistema ERP após troca de senha.',
    'Usuário recebe erro de autenticação ao acessar sistema ERP após alteração de credenciais.',
    'Acesso',
    'open',
    'Administrativo',
    null,
    '2026-09-09T08:45:00-03:00',
    '2026-09-09T13:40:00-03:00',
    null
  ),
  (
    '00000000-0000-4000-8000-000000000001',
    1046,
    'Computador perde conexão durante o expediente',
    'Estação cabeada apresenta quedas recorrentes de conexão durante o expediente.',
    'Estação cabeada apresenta interrupções recorrentes de conectividade durante o expediente.',
    'Rede',
    'resolved',
    'Operações',
    'Estação-OPS-04',
    '2026-09-08T08:05:00-03:00',
    '2026-09-08T11:18:00-03:00',
    '2026-09-08T11:18:00-03:00'
  ),
  (
    '00000000-0000-4000-8000-000000000001',
    1045,
    'Erro ao sincronizar arquivos compartilhados',
    'Aplicativo de sincronização interrompe o processamento ao abrir uma pasta compartilhada.',
    'Aplicativo de sincronização interrompe processamento ao abrir pasta compartilhada.',
    'Software',
    'analyzing',
    'Projetos',
    'Estação-PROJ-01',
    '2026-09-08T14:20:00-03:00',
    '2026-09-08T17:52:00-03:00',
    null
  ),
  (
    '00000000-0000-4000-8000-000000000001',
    1044,
    'Monitor secundário não é reconhecido',
    'Tela externa não é reconhecida pela estação após reinicialização.',
    'Monitor secundário não é reconhecido após reinicialização da estação.',
    'Hardware',
    'resolved',
    'Administrativo',
    'Estação-ADM-06',
    '2026-09-07T13:50:00-03:00',
    '2026-09-07T15:06:00-03:00',
    '2026-09-07T15:06:00-03:00'
  ),
  (
    '00000000-0000-4000-8000-000000000001',
    1043,
    'Senha expirada impede acesso ao sistema',
    'Credencial expirada impede acesso ao portal interno.',
    'Credencial expirada impede acesso ao sistema interno.',
    'Acesso',
    'resolved',
    'Atendimento',
    null,
    '2026-09-06T08:20:00-03:00',
    '2026-09-06T09:34:00-03:00',
    '2026-09-06T09:34:00-03:00'
  ),
  (
    '00000000-0000-4000-8000-000000000001',
    1042,
    'Impressora compartilhada perde mapeamento',
    'Uma estação deixou de acessar a impressora compartilhada após atualização da rede local.',
    'Estação perdeu acesso à impressora compartilhada após atualização da rede.',
    'Impressão',
    'resolved',
    'Logística',
    'Estação-LOG-03',
    '2026-09-05T14:30:00-03:00',
    '2026-09-05T16:42:00-03:00',
    '2026-09-05T16:42:00-03:00'
  ),
  (
    '00000000-0000-4000-8000-000000000001',
    1041,
    'Estação não encontra servidor de impressão',
    'Uma estação não consegue alcançar o servidor de impressão, embora outras estações imprimam normalmente.',
    'Estação não alcança servidor de impressão enquanto outras estações imprimem normalmente.',
    'Rede',
    'resolved',
    'Compras',
    'Estação-COMP-02',
    '2026-09-04T09:00:00-03:00',
    '2026-09-04T10:20:00-03:00',
    '2026-09-04T10:20:00-03:00'
  ),
  (
    '00000000-0000-4000-8000-000000000001',
    987,
    'Estação do financeiro não localiza impressora compartilhada',
    'Uma estação deixou de localizar uma impressora de rede que continuava disponível para outras máquinas.',
    'Estação não localiza impressora de rede enquanto outras estações continuam imprimindo.',
    'Impressão',
    'resolved',
    'Financeiro',
    'Estação-FIN-01',
    '2026-08-28T13:00:00-03:00',
    '2026-08-28T14:10:00-03:00',
    '2026-08-28T14:10:00-03:00'
  ),
  (
    '00000000-0000-4000-8000-000000000001',
    914,
    'Impressora de rede desaparece após alteração de configuração',
    'Uma estação deixou de visualizar a impressora compartilhada após alteração na configuração da rede interna.',
    'Estação não visualiza impressora compartilhada após alteração na configuração de rede.',
    'Rede',
    'resolved',
    'Operações',
    'Estação-OPS-01',
    '2026-08-21T08:20:00-03:00',
    '2026-08-21T09:45:00-03:00',
    '2026-08-21T09:45:00-03:00'
  ),
  (
    '00000000-0000-4000-8000-000000000001',
    762,
    'Fila de impressão não conecta ao servidor',
    'A impressora aparece instalada na estação, mas os documentos permanecem presos na fila compartilhada.',
    'Impressora instalada mantém documentos retidos na fila compartilhada.',
    'Impressão',
    'resolved',
    'Administrativo',
    'Estação-ADM-02',
    '2026-08-14T12:00:00-03:00',
    '2026-08-14T13:30:00-03:00',
    '2026-08-14T13:30:00-03:00'
  )
on conflict (organization_id, ticket_number) do update
set
  title = excluded.title,
  description_original = excluded.description_original,
  description_sanitized = excluded.description_sanitized,
  category = excluded.category,
  status = excluded.status,
  department = excluded.department,
  equipment = excluded.equipment,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  resolved_at = excluded.resolved_at;

alter table public.tickets enable trigger tickets_set_updated_at;

with resolution_seed (ticket_number, cause, solution, steps, notes) as (
  values
    (
      1046,
      'Conector de rede apresentava folga e provocava interrupções na conexão cabeada.',
      'Substituição do conector de rede e novo teste de conectividade.',
      '["Inspecionado o ponto de rede", "Substituído o conector", "Executado teste de conectividade"]'::jsonb,
      null
    ),
    (
      1044,
      'Cabo de vídeo estava conectado em uma porta incompatível com a configuração atual da estação.',
      'Reconexão do cabo na porta correta e detecção manual do monitor.',
      '["Verificada a conexão do cabo", "Reconectado o monitor", "Confirmada a detecção no sistema"]'::jsonb,
      null
    ),
    (
      1043,
      'Credencial do portal interno havia expirado conforme a política de acesso.',
      'Atualização da credencial e confirmação de acesso ao portal.',
      '["Confirmada a expiração da credencial", "Atualizada a credencial", "Validado o acesso ao portal"]'::jsonb,
      null
    ),
    (
      1042,
      'Mapeamento da impressora mantinha um endereço anterior do servidor de impressão.',
      'Remoção do mapeamento antigo e nova conexão com o compartilhamento atualizado.',
      '["Removida a impressora antiga", "Confirmado o servidor de impressão", "Adicionada a impressora atualizada"]'::jsonb,
      null
    ),
    (
      1041,
      'Configuração local de rede impedia a resolução do nome do servidor de impressão.',
      'Atualização das informações de rede e reconexão ao servidor de impressão.',
      '["Verificada a comunicação com a rede", "Atualizadas as informações de rede", "Testada a impressão"]'::jsonb,
      null
    ),
    (
      987,
      'Mapeamento antigo da impressora permaneceu associado a um endereço de rede alterado.',
      'Remoção da impressora antiga e novo mapeamento utilizando o endereço atualizado do servidor de impressão.',
      '["Removida a impressora existente no Windows", "Confirmada conectividade com o servidor de impressão", "Localizado o compartilhamento atualizado", "Adicionada novamente a impressora", "Realizado teste de impressão"]'::jsonb,
      'Não foi necessário alterar configurações em outras estações.'
    ),
    (
      914,
      'A estação utilizava informações antigas de resolução do servidor.',
      'Atualização das informações de rede e novo acesso ao compartilhamento da impressora.',
      '["Verificada comunicação com o servidor", "Limpado cache de resolução de nomes", "Reconectado ao compartilhamento", "Remapeada a impressora", "Testada impressão"]'::jsonb,
      null
    ),
    (
      762,
      'A conexão com a fila compartilhada estava corrompida.',
      'Recriação da conexão com a fila de impressão.',
      '["Cancelados documentos pendentes", "Removida a conexão existente", "Reiniciado o serviço de impressão", "Adicionada novamente a fila compartilhada", "Realizado teste"]'::jsonb,
      null
    )
)
insert into public.ticket_resolutions (
  organization_id,
  ticket_id,
  cause,
  solution,
  steps,
  notes
)
select
  '00000000-0000-4000-8000-000000000001',
  tickets.id,
  resolution_seed.cause,
  resolution_seed.solution,
  resolution_seed.steps,
  resolution_seed.notes
from resolution_seed
join public.tickets
  on tickets.organization_id = '00000000-0000-4000-8000-000000000001'
  and tickets.ticket_number = resolution_seed.ticket_number
on conflict (ticket_id) do update
set
  organization_id = excluded.organization_id,
  cause = excluded.cause,
  solution = excluded.solution,
  steps = excluded.steps,
  notes = excluded.notes,
  reference_ticket_id = null,
  reference_similarity = null;

commit;
