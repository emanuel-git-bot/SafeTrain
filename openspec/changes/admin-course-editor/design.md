## Context

O `AdminCourseEditor` atual é uma UI estática que usa `MODULES_BUILDER` (mock) e exibe sempre o mesmo curso hardcoded. O backend já expõe todas as rotas de CRUD de cursos e módulos em `admin.ts`. A mudança consiste em conectar o frontend a essas rotas, refatorar o fluxo de edição para ser orientado a `courseId`, e implementar o editor de quiz com alternativas.

**Estado atual do fluxo:**
```
AdminCourses → onEdit() (sem courseId) → AdminCourseEditor (mock, sem persistência)
```

**Estado desejado:**
```
AdminCourses → carrega GET /courses → onEdit(courseId) → AdminCourseEditor(courseId)
            → onCreate() → POST /admin/courses → onEdit(newCourseId)
AdminCourseEditor → GET /courses/:id → exibe módulos reais
                 → adicionar módulo → POST /admin/courses/:id/modules
                 → editar módulo → PUT /admin/courses/:id/modules/:moduleId
                 → deletar módulo → DELETE /admin/courses/:id/modules/:moduleId
                 → salvar dados do curso → PUT /admin/courses/:id
                 → publicar → PUT /admin/courses/:id { published: true }
```

## Goals / Non-Goals

**Goals:**
- Listar cursos reais do banco no `AdminCourses`
- Criar novos cursos (entra direto no editor com curso em branco criado no backend)
- Editar título, área, preço, descrição e carga horária inline no editor
- Criar e salvar módulos de vídeo (URL externa) com tempo mínimo de tela
- Criar e salvar módulos de quiz com questões de múltipla escolha (4 alternativas + gabarito)
- Deletar cursos e módulos com chamadas reais à API
- Publicar/despublicar o curso inteiro com um botão

**Non-Goals:**
- Upload de arquivo de vídeo (usar somente URL)
- Player de vídeo integrado no editor
- Reordenação de módulos por drag-and-drop com persistência (pode manter UX visual, mas order será manual)
- Sistema de revisão/aprovação de cursos

## Decisions

### D1: Criar curso antes de entrar no editor
**Decisão:** Ao clicar "Novo Curso", fazer imediatamente `POST /admin/courses` com dados mínimos (título padrão "Novo Curso", `published: false`) e entrar no editor com o `courseId` retornado.

**Alternativa:** Modal de criação antes do editor.

**Rationale:** O usuário quer "entrar direto no editor" e editar tudo lá dentro. Criar o recurso antes garante que todos os módulos possam ser persistidos imediatamente (precisam do `courseId`).

**Tradeoff:** Pode gerar cursos em branco "fantasmas" se o usuário fechar sem salvar. Mitigação: cursos `published: false` criados sem módulos podem ser detectados e limpos.

---

### D2: Salvar módulo individualmente
**Decisão:** Cada módulo tem seu próprio botão "Salvar módulo" que chama `POST` (novo) ou `PUT` (existente). Não existe "salvar tudo de uma vez".

**Alternativa:** Auto-save com debounce.

**Rationale:** Auto-save em conteúdo estruturado como quiz (com alternativas) pode gerar estados parcialmente salvos inconsistentes. Salvar explicitamente é mais seguro e dá feedback claro ao admin.

---

### D3: Questões do quiz armazenadas como JSON no campo `questions` (String?)
**Decisão:** Manter o schema atual onde `questions` é um `String?` no modelo `Module`, armazenando o array de questões como JSON serializado.

**Alternativa:** Criar tabela `Question` normalizada.

**Rationale:** Escopo desta mudança não inclui alteração de schema. O formato JSON é suficiente para o volume esperado. Pode ser normalizado em mudança futura.

**Estrutura do JSON de questões:**
```json
[
  {
    "id": "uuid",
    "text": "Qual altura mínima define trabalho em altura?",
    "options": ["1 metro", "1,5 metro", "2 metros", "3 metros"],
    "correctIndex": 2
  }
]
```

---

### D4: Vídeo como URL
**Decisão:** Campo de texto para URL do vídeo (YouTube embed, Vimeo, MP4 direto). Armazenado em `videoUrl`.

**Rationale:** Upload de arquivo está fora do escopo. URL é suficiente para MVP e compatível com qualquer fonte de vídeo.

## Risks / Trade-offs

- **Cursos fantasmas**: POST imediato ao clicar "Novo Curso" cria registros sem conteúdo → Mitigação: listar cursos sem módulos com badge "Vazio" no `AdminCourses` e exibir botão de exclusão fácil
- **Dados mock ainda usados em outras telas**: `COURSES` de `mockData.ts` ainda alimenta o catálogo público e `MyPanel` → Não alterar essas telas nesta mudança
- **Sem validação de URL de vídeo**: Admin pode inserir URL inválida → Mitigação: validação básica de formato no frontend (prefixo `http`)
