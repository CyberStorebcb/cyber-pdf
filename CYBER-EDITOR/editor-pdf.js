
function generate() {
    const doc = new docx.Document({
      sections: [{
        properties: {},
        children: [
          new docx.Paragraph({
            children: [
              new docx.TextRun("Hello World"),
              new docx.TextRun({
                text: "Foo Bar",
                bold: true,
              }),
              new docx.TextRun({
                text: "\tGithub is the best",
                bold: true,
              }),
            ],
          }),
        ],
      }]
    });

    docx.Packer.toBlob(doc).then(blob => {
      console.log(blob);
      saveAs(blob, "example.docx");
      console.log("Document created successfully");
    });
  }
  
document.getElementById('download-word').addEventListener('click', () => {
    // Verifica se a biblioteca docx está carregada
    if (!window.docx) {
        console.error('A biblioteca docx não foi carregada.');
        alert('Erro: A biblioteca docx não foi carregada.');
        return;
    }

    // Obtém o conteúdo do editor
    const content = document.getElementById('word-editor').value;

    // Verifica se o conteúdo está vazio
    if (!content) {
        alert('Por favor, insira algum texto antes de baixar.');
        return;
    }

    try {
        // Cria o documento Word
        const doc = new docx.Document({
            sections: [
                {
                    children: [
                        new docx.Paragraph({
                            text: content,
                            spacing: { after: 200 },
                        }),
                    ],
                },
            ],
        });

        // Gera o arquivo Word e inicia o download
        docx.Packer.toBlob(doc).then((blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'documento.docx';
            a.click();
            URL.revokeObjectURL(url);
            alert('O arquivo Word foi gerado e baixado com sucesso! Verifique sua pasta de downloads.');
        }).catch((error) => {
            console.error('Erro ao gerar o arquivo Word:', error.message, error.stack);
            alert('Ocorreu um erro ao gerar o arquivo Word.');
        });
    } catch (error) {
        console.error('Erro inesperado:', error.message, error.stack);
        alert('Ocorreu um erro inesperado ao tentar gerar o arquivo Word.');
    }
});