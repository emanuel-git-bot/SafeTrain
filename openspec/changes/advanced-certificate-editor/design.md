## Context

O atual criador de certificados (`CertificateBuilder`) renderiza variáveis dinâmicas do aluno em posições X/Y usando a biblioteca `react-rnd`. O tamanho da fonte é configurável, mas outras opções cruciais de design (como cor, peso da fonte e família da fonte) estão ausentes, limitando a adequação à identidade visual das empresas. Além disso, não há uma maneira de pré-visualizar como o PDF final gerado pelo `pdf-lib` no back-end será montado antes de emitir um certificado real.

## Goals / Non-Goals

**Goals:**
- Implementar um Color Picker nativo (ou via biblioteca leve como nativo `<input type="color">` ou paleta customizada) para trocar a cor do texto no Certificate Builder.
- Permitir seleção de `fontFamily` padrão (Arial, Times New Roman, Courier) e `fontWeight` (Normal/Bold).
- Sincronizar essas novas propriedades com o gerador PDF no backend (`pdf-lib`).
- Criar a funcionalidade de "Preview" no Frontend para simular a geração sem poluir o banco de dados.

**Non-Goals:**
- Mudar para um motor baseado em Canvas (Fabric.js/Konva). As limitações de HTML puro e de geração manual via `pdf-lib` serão mantidas.
- Upload arbitrário de fontes TTF customizadas (apenas fontes Built-in Standard do PDF-lib).
- Desenho livre a mão.

## Decisions

**1. Geração do Preview via Backend**
Em vez de tentar simular perfeitamente a aparência no frontend através do DOM, criaremos um endpoint `/admin/certificate-templates/preview` que recebe o objeto de template modificado no corpo da requisição e retorna um Buffer de PDF, utilizando dados mocados (ex: "Nome do Aluno"). Isso assegura que o administrador visualize *exatamente* o que será gerado, removendo a discrepância DOM x PDF.

**2. Uso de Standard Fonts no PDF-lib**
O `pdf-lib` tem as 14 Standard Fonts embarcadas (Helvetica, Times Roman, Courier e suas variações em Bold). Ofereceremos apenas essas fontes no menu suspenso do Frontend. Caso o elemento esteja marcado como Bold, o backend carregará a respectiva versão Bold (ex: `Helvetica-Bold` em vez de `Helvetica`).

**3. Gerenciamento de Cores**
As cores no frontend serão selecionadas via `<input type="color">` nativo (retorna formato HEX, ex: `#FF0000`). No backend, usaremos uma função auxiliar para converter o HEX para os valores RGB `[0-1]` exigidos pelo `pdf-lib` (ex: `rgb(r/255, g/255, b/255)`).

## Risks / Trade-offs

- **Discrepância na tela do Editor:** O editor HTML pode renderizar fontes ligeiramente diferentes das Standard Fonts do PDF. *Mitigação*: O botão Preview (renderizado pelo backend real) atua como fonte da verdade.
- **Sobrecarga do Backend com Previews:** Gerar PDF on-the-fly para preview consome CPU. *Mitigação*: Este é um fluxo de Admin; o volume de acessos será mínimo, não justificando preocupações profundas com gargalos.
