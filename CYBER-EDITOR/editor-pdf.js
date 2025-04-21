// Função para carregar o arquivo .docx
document.getElementById('upload-docx').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) {
        alert('Por favor, selecione um arquivo .docx.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const arrayBuffer = e.target.result;

        try {
            const result = await mammoth.extractRawText({ arrayBuffer });
            console.log('Texto extraído:', result.value);
            document.getElementById('docx-editor').value = result.value;
        } catch (error) {
            console.error('Erro ao carregar o arquivo .docx:', error);
            alert('Não foi possível carregar o arquivo. Verifique se ele está no formato correto.');
        }
    };
    reader.readAsArrayBuffer(file);
});

// Função para salvar o conteúdo do editor como um arquivo .docx
document.getElementById('save-docx').addEventListener('click', async () => {
    const { Document, Packer, Paragraph } = window.docx;

    // Obter o texto atualizado do editor
    const updatedText = document.getElementById('docx-editor').value.trim();

    if (!updatedText) {
        alert('O conteúdo do documento está vazio. Por favor, insira algum texto antes de salvar.');
        return;
    }

    try {
        // Criar um novo documento com o texto atualizado
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: updatedText.split('\n').map((line) => new Paragraph(line)),
                },
            ],
        });

        // Gerar o arquivo .docx
        const blob = await Packer.toBlob(doc);
        saveAs(blob, 'documento-atualizado.docx');
        alert('Arquivo salvo com sucesso!');
    } catch (error) {
        console.error('Erro ao salvar o arquivo:', error);
        alert('Ocorreu um erro ao salvar o arquivo. Tente novamente.');
    }
});