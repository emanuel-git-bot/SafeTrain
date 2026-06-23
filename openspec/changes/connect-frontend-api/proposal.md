## Why

A infraestrutura do backend foi concluída com sucesso e algumas páginas (Login, Registro, Catálogo) já foram conectadas e integradas. No entanto, o restante do sistema (ClassroomPage, MyPanel, CertificatePage, CertificateValidator e as páginas de Admin/B2B) continuam utilizando os mocks estáticos de `mockData.ts` em vez de chamar os endpoints recém-criados. Precisamos fechar essa lacuna para que a plataforma seja 100% funcional.

## What Changes

- Conectar `ClassroomPage.tsx` à API (substituir o timer mock por `POST /ping` e validações de quiz via backend).
- Conectar `MyPanel.tsx` à API (substituir array estático `MY_COURSES` por chamadas em `/users/me/enrollments`).
- Conectar as páginas de Certificado (`CertificatePage.tsx` e `CertificateValidator.tsx`) à API.
- Conectar painéis de administração (`AdminDashboard`, `B2BDashboard`) às chamadas reais (`/admin/analytics`, `/companies/students`).
- Remover totalmente as dependências do frontend em relação às lógicas estáticas do `mockData.ts`.

## Capabilities

### New Capabilities
- `frontend-api-integration`: Integração do UI com os endpoints do backend.

### Modified Capabilities
- N/A

## Impact

- Modificações focadas na camada Frontend (Arquivos em `/src/app/pages/` e `/src/app/components/`).
- Não impacta os dados do backend já validados, apenas a camada de rede do UI (utilizando `apiFetch`).
