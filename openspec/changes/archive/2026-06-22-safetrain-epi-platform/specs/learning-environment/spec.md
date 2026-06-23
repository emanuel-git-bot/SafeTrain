## ADDED Requirements

### Requirement: Reprodução de vídeo com rastreamento de tempo de tela
O sistema SHALL rastrear o tempo efetivo que o aluno permanece com o vídeo em reprodução (`playing = true`). O frontend SHALL enviar um ping (heartbeat) à API a cada 30 segundos enquanto o vídeo estiver em reprodução. O backend SHALL acumular o tempo em `ScreenTimeLog` e só marcar o módulo como concluído quando `totalSeconds >= requiredSeconds`.

#### Scenario: Aluno assiste ao vídeo pelo tempo mínimo
- **WHEN** o aluno mantém o vídeo em reprodução e acumula pings suficientes para totalizar o tempo mínimo
- **THEN** o sistema SHALL desbloquear o botão "Fazer Avaliação" e marcar o módulo como apto para avaliação

#### Scenario: Aluno pausa o vídeo
- **WHEN** o aluno pausa o vídeo
- **THEN** o frontend SHALL parar de enviar pings e o tempo SHALL parar de ser acumulado no backend

#### Scenario: Aluno tenta burlar o rastreamento enviando pings em excesso
- **WHEN** o backend recebe mais de 1 ping em menos de 25 segundos para o mesmo `(userId, lessonId)`
- **THEN** o backend SHALL ignorar o ping excedente e registrar tentativa de fraude no log

### Requirement: Avaliação pós-vídeo com nota de corte configurável
O sistema SHALL apresentar o quiz do curso somente após o aluno ter atingido o tempo mínimo de permanência. O sistema SHALL calcular a nota do aluno e compará-la com a nota de corte definida pelo Admin para o módulo.

#### Scenario: Aluno é aprovado na avaliação
- **WHEN** o aluno responde todas as questões e sua nota é maior ou igual à nota de corte
- **THEN** o sistema SHALL marcar o módulo como `completed`, exibir parabéns e habilitar o botão "Ver Certificado"

#### Scenario: Aluno é reprovado na avaliação
- **WHEN** a nota do aluno é inferior à nota de corte
- **THEN** o sistema SHALL exibir a nota obtida, permitir nova tentativa e não marcar o módulo como concluído

#### Scenario: Aluno tenta acessar avaliação sem atingir tempo mínimo
- **WHEN** o aluno tenta clicar em "Fazer Avaliação" antes de atingir o tempo mínimo
- **THEN** o botão SHALL permanecer desabilitado e o sistema SHALL exibir o tempo restante

### Requirement: Progresso e retomada de curso
O sistema SHALL persistir o progresso do aluno em cada módulo. Quando o aluno retornar ao curso, o sistema SHALL retomar o curso no módulo onde parou.

#### Scenario: Aluno retorna ao curso após interrupção
- **WHEN** o aluno acessa novamente um curso que já iniciou
- **THEN** o sistema SHALL exibir o módulo atual com o progresso salvo e tempo de tela acumulado

#### Scenario: Aluno conclui todos os módulos do curso
- **WHEN** o aluno conclui o último módulo avaliativo com aprovação
- **THEN** o sistema SHALL marcar o `Enrollment` como `completed`, gerar o certificado e notificar o aluno

### Requirement: Painel do aluno com cursos e certificados
O sistema SHALL fornecer ao aluno um painel pessoal com abas: "Em andamento" (cursos iniciados), "Concluídos" (com acesso ao certificado e PDF) e "Recomendados" (baseado na área de atuação).

#### Scenario: Aluno visualiza cursos em andamento
- **WHEN** o aluno acessa a aba "Em andamento" do painel
- **THEN** o sistema SHALL exibir os cursos com barra de progresso percentual e botão "Continuar"

#### Scenario: Aluno baixa certificado em PDF
- **WHEN** o aluno clica em "PDF" em um curso concluído
- **THEN** o sistema SHALL gerar e baixar um arquivo PDF do certificado
