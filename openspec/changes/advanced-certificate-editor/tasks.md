## 1. Backend: PDF Preview e Novas Propriedades

- [x] 1.1 Atualizar `CertElement` interface no frontend e backend para suportar `color`, `fontFamily` e `fontWeight`
- [x] 1.2 Atualizar `utils/pdfGenerator.js` para ler e aplicar cor (RGB via hex-to-rgb conversion), familia da fonte (Helvetica, Times, Courier) e estilo (bold/normal)
- [x] 1.3 Criar nova rota `POST /admin/certificate-templates/preview` em `certificates.ts` que aceita o payload de template, gera PDF com dados falsos ("João da Silva") e retorna o buffer

## 2. Frontend: Controles de Formatação Avançada

- [x] 2.1 Adicionar Color Picker nativo (`<input type="color">`) nas propriedades em `CertificateBuilder.tsx` para mudar a cor do elemento selecionado
- [x] 2.2 Adicionar `<select>` de `fontFamily` (com fontes padrões) nas propriedades
- [x] 2.3 Adicionar checkbox/toggle de `fontWeight` (Negrito) nas propriedades
- [x] 2.4 Renderizar visualmente as novas propriedades na UI do editor (usando CSS style color e fontWeight)

## 3. Frontend: Botão de Preview

- [x] 3.1 Adicionar botão "Visualizar Prévia" na barra superior do `CertificateBuilder.tsx`
- [x] 3.2 Implementar lógica do botão para fazer POST no endpoint `/preview` com os elementos atuais
- [x] 3.3 Abrir uma nova aba no navegador (com `URL.createObjectURL(blob)`) ou exibir o PDF em um iframe num Modal interno
