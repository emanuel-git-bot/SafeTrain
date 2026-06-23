## Why

O atual criador de templates de certificados permite arrastar elementos (nome do aluno, documento, etc.) sobre uma imagem de fundo, mas carece de formatação avançada (fontes personalizadas, cores, negrito) e não oferece ao administrador uma forma de visualizar como o PDF final será renderizado. Essas melhorias transformarão a ferramenta em algo mais flexível e seguro, garantindo que o resultado impresso seja exatamente o planejado, sem precisar recriar o editor do zero usando Canvas.

## What Changes

- **Botão de Preview**: Adicionar um botão no editor para abrir uma pré-visualização (Modal ou nova aba) renderizando o PDF em tempo real usando dados de preenchimento (ex: "João da Silva").
- **Formatação de Cores**: Adicionar um color picker (estilo VSCode) nas propriedades para alterar a cor do texto do elemento selecionado.
- **Formatação de Fonte**: Adicionar controle de "Família da Fonte" (ex: Arial, Times New Roman) e "Peso" (Negrito/Normal) nas propriedades do elemento selecionado.
- **Integração no Backend**: O serviço gerador de PDF (`pdf-lib`) passará a ler e aplicar a cor, fonte e o estilo do texto conforme salvo no template JSON.

## Capabilities

### New Capabilities
- `certificate-builder-preview`: Define o comportamento do botão de Preview que renderiza o certificado com dados de demonstração.

### Modified Capabilities
- `certificate-builder`: Adicionada a capacidade de definir cor (HEX/RGB), peso (bold/normal) e família da fonte (font-family) nos elementos.

## Impact

- `src/app/pages/admin/CertificateBuilder.tsx`: Adição de novos controles na barra lateral (ColorPicker, Dropdown de Fonte, Checkbox de Negrito) e botão de Preview.
- Banco de Dados (`CertificateTemplate.elements`): O JSON salvo passará a conter novas chaves (`color`, `fontFamily`, `fontWeight`).
- `server/src/routes/certificates.ts`: Rota adicional para gerar o preview sem persistir no banco (ex: `POST /admin/certificate-templates/preview`).
- `server/src/utils/pdfGenerator.js`: Deve mapear as fontes, cores RGB e estilos (bold) ao utilizar os comandos do `pdf-lib`.
