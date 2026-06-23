## ADDED Requirements

### Requirement: Criação e estruturação de curso pelo Admin
O sistema SHALL permitir que o Admin crie um curso definindo título, área, nível (Obrigatório/Recomendado/Básico), preço, carga horária e validade do certificado.

#### Scenario: Admin cria novo curso
- **WHEN** o Admin preenche os metadados do curso e clica em "Publicar"
- **THEN** o sistema SHALL criar o curso com status `published` e torná-lo visível na vitrine

#### Scenario: Admin salva curso como rascunho
- **WHEN** o Admin salva o curso sem publicar
- **THEN** o sistema SHALL criar o curso com status `draft`, invisível na vitrine pública

### Requirement: Adição de módulos de vídeo ao curso
O sistema SHALL permitir que o Admin adicione módulos de vídeo a um curso. Para cada módulo de vídeo, o Admin SHALL poder: (a) fazer upload de arquivo MP4/MOV diretamente para o Cloudflare R2, ou (b) informar um link externo (ex: Vimeo). O Admin SHALL definir o tempo mínimo de permanência em segundos para aquele módulo.

#### Scenario: Admin faz upload de vídeo para R2
- **WHEN** o Admin seleciona um arquivo MP4/MOV e confirma o upload
- **THEN** o sistema SHALL enviar o arquivo ao Cloudflare R2 via signed URL, associar a URL do vídeo ao módulo e exibir o progresso do upload

#### Scenario: Admin informa link externo de vídeo
- **WHEN** o Admin seleciona "Link externo" e insere uma URL válida
- **THEN** o sistema SHALL associar o link ao módulo sem realizar upload

#### Scenario: Admin define tempo mínimo de permanência
- **WHEN** o Admin define o campo "Tempo mínimo (min)" para um módulo de vídeo
- **THEN** o sistema SHALL salvar o valor em segundos no banco e usá-lo como critério de conclusão do módulo

### Requirement: Adição de módulos de quiz ao curso
O sistema SHALL permitir que o Admin adicione módulos de avaliação (quiz) com múltiplas questões de múltipla escolha. O Admin SHALL poder definir a nota de corte (percentual) para aprovação do quiz.

#### Scenario: Admin cria questão de múltipla escolha
- **WHEN** o Admin adiciona uma questão com 4 alternativas e marca a correta
- **THEN** o sistema SHALL salvar a questão associada ao módulo de quiz

#### Scenario: Admin define nota de corte
- **WHEN** o Admin ajusta o slider de "Nota de corte" para um valor entre 50% e 100%
- **THEN** o sistema SHALL salvar o valor percentual e aplicá-lo na avaliação dos alunos

### Requirement: Reordenação e publicação de módulos
O sistema SHALL permitir que o Admin reordene os módulos via drag-and-drop e altere o status de cada módulo (rascunho/publicado) individualmente.

#### Scenario: Admin publica um módulo em rascunho
- **WHEN** o Admin altera o status do módulo para "Publicado" e salva
- **THEN** o sistema SHALL tornar o módulo acessível aos alunos matriculados no curso

#### Scenario: Admin exclui um módulo
- **WHEN** o Admin clica no ícone de lixeira de um módulo e confirma
- **THEN** o sistema SHALL remover o módulo do curso; alunos com progresso nesse módulo terão o progresso removido
