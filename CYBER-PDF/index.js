// Função para carregar e visualizar várias imagens com melhor qualidade
function loadImages(event) {
    const files = event.target.files;
    const container = document.getElementById('image-container');
    container.innerHTML = ''; // Limpa as imagens anteriores

    Array.from(files).forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;

            img.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                // Define o tamanho máximo para redimensionar a imagem
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 800;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                // Cria uma nova imagem a partir do canvas
                const processedImg = document.createElement('img');
                processedImg.src = canvas.toDataURL('image/jpeg', 0.9); // Qualidade ajustada
                processedImg.alt = 'Imagem carregada';
                processedImg.style.maxWidth = '150px';
                processedImg.style.border = '1px solid #ccc';
                processedImg.style.borderRadius = '5px';
                processedImg.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
                processedImg.style.margin = '5px';
                processedImg.draggable = true; // Torna a imagem arrastável
                processedImg.dataset.index = index; // Armazena o índice da imagem

                // Eventos de arrastar e soltar
                processedImg.addEventListener('dragstart', handleDragStart);
                processedImg.addEventListener('dragover', handleDragOver);
                processedImg.addEventListener('drop', handleDrop);

                container.appendChild(processedImg);
            };
        };
        reader.readAsDataURL(file);
    });
}

// Variáveis para armazenar o elemento arrastado
let draggedElement = null;

// Função chamada ao iniciar o arraste
function handleDragStart(event) {
    draggedElement = event.target; // Armazena o elemento arrastado
    event.dataTransfer.effectAllowed = 'move';
}

// Função chamada ao passar sobre outro elemento
function handleDragOver(event) {
    event.preventDefault(); // Permite o drop
    event.dataTransfer.dropEffect = 'move';
}

// Função chamada ao soltar o elemento
function handleDrop(event) {
    event.preventDefault();
    const container = document.getElementById('image-container');
    const targetElement = event.target; // Elemento onde o drop ocorreu

    // Verifica se o elemento de destino é uma imagem
    if (targetElement.tagName === 'IMG' && draggedElement !== targetElement) {
        // Reorganiza os elementos no contêiner
        const draggedIndex = Array.from(container.children).indexOf(draggedElement);
        const targetIndex = Array.from(container.children).indexOf(targetElement);

        if (draggedIndex < targetIndex) {
            container.insertBefore(draggedElement, targetElement.nextSibling);
        } else {
            container.insertBefore(draggedElement, targetElement);
        }
    }
}

// Função para gerar o PDF com uma imagem por página
document.getElementById('generate-pdf').addEventListener('click', async () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4'); // Formato A4
    const pageWidth = 210; // Largura da página A4 em mm
    const pageHeight = 297; // Altura da página A4 em mm
    const margin = 10; // Margem superior e lateral

    const container = document.getElementById('image-container');
    const images = container.getElementsByTagName('img');

    if (images.length === 0) {
        alert("Por favor, carregue pelo menos uma imagem antes de gerar o PDF.");
        return;
    }

    for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

        const imgData = canvas.toDataURL('image/jpeg');

        // Calcula a escala para ajustar a imagem ao PDF, mantendo o tamanho proporcional
        const imgWidth = Math.min(img.naturalWidth * 0.264583, pageWidth - 2 * margin); // Converte px para mm
        const imgHeight = (imgWidth / img.naturalWidth) * img.naturalHeight;

        // Centraliza a imagem na página
        const xOffset = (pageWidth - imgWidth) / 2;
        const yOffset = (pageHeight - imgHeight) / 2;

        // Adiciona a imagem ao PDF
        pdf.addImage(imgData, 'JPEG', xOffset, yOffset, imgWidth, imgHeight);

        // Adiciona uma nova página, exceto para a última imagem
        if (i < images.length - 1) {
            pdf.addPage();
        }
    }

    // Solicita o nome do arquivo ao usuário
    const fileName = prompt("Digite o nome do arquivo (sem extensão):", "imagens");
    if (fileName) {
        pdf.save(`${fileName}.pdf`); // Salva o PDF com o nome escolhido
    } else {
        alert("O nome do arquivo não foi fornecido. O PDF não será salvo.");
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const navbar = document.querySelector('.navbar');

    // Verifica o tema salvo no localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('bg-dark', 'text-light');
        navbar.classList.replace('bg-light', 'bg-dark');
        themeToggle.innerHTML = '🌞'; // Emoji de sol para modo claro
    } else {
        body.classList.add('bg-light', 'text-dark');
        navbar.classList.replace('bg-dark', 'bg-light');
        themeToggle.innerHTML = '🌙'; // Emoji de lua para modo escuro
    }

    // Alterna entre os temas
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('bg-dark')) {
            body.classList.replace('bg-dark', 'bg-light');
            body.classList.replace('text-light', 'text-dark');
            navbar.classList.replace('bg-dark', 'bg-light');
            themeToggle.innerHTML = '🌙'; // Emoji de lua para modo escuro
            localStorage.setItem('theme', 'light');
        } else {
            body.classList.replace('bg-light', 'bg-dark');
            body.classList.replace('text-dark', 'text-light');
            navbar.classList.replace('bg-light', 'bg-dark');
            themeToggle.innerHTML = '🌞'; // Emoji de sol para modo claro
            localStorage.setItem('theme', 'dark');
        }
    });
});


