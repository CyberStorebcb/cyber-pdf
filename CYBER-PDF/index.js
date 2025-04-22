// Função para carregar e visualizar várias imagens com melhor qualidade
function loadImages(event) {
    const files = event.target.files;
    const container = document.getElementById('image-container');
    container.innerHTML = ''; // Limpa as imagens anteriores

    Array.from(files).forEach((file, index) => {
        if (file.size > 5 * 1024 * 1024) { // 5 MB
            alert('O arquivo é muito grande. Por favor, carregue arquivos menores que 5 MB.');
            return;
        }

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

const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const imageContainer = document.getElementById('image-container');

// Valida o arquivo antes de processá-lo
function isValidFile(file) {
    if (file.size > 5 * 1024 * 1024) {
        alert('O arquivo é muito grande. Por favor, carregue arquivos menores que 5 MB.');
        return false;
    }
    if (!file.type.startsWith('image/')) {
        alert('Por favor, carregue apenas arquivos de imagem.');
        return false;
    }
    return true;
}

// Exibe as imagens carregadas
function displayImages(files) {
    Array.from(files).forEach((file) => {
        if (!isValidFile(file)) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.alt = 'Imagem carregada';
            img.classList.add('img-thumbnail');
            img.style.maxWidth = '150px';
            img.style.margin = '10px';
            imageContainer.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

// Evento de clique na área de arrastar e soltar
dropZone.addEventListener('click', () => fileInput.click());

// Evento de mudança no input de arquivos
fileInput.addEventListener('change', (event) => {
    displayImages(event.target.files);
});

// Evento de arrastar arquivos para a área
dropZone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropZone.classList.add('dragover');
});

// Evento de sair da área de arrastar
dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

// Evento de soltar arquivos na área
dropZone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropZone.classList.remove('dragover');
    displayImages(event.dataTransfer.files);
});

// Gera o PDF com as imagens carregadas
document.getElementById('generate-pdf').addEventListener('click', async () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;

    const images = imageContainer.getElementsByTagName('img');
    if (images.length === 0) {
        alert("Por favor, carregue pelo menos uma imagem antes de gerar o PDF.");
        return;
    }

    Array.from(images).forEach((img, index) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

        const imgData = canvas.toDataURL('image/jpeg');
        const imgWidth = Math.min(img.naturalWidth * 0.264583, pageWidth - 2 * margin);
        const imgHeight = (imgWidth / img.naturalWidth) * img.naturalHeight;
        const xOffset = (pageWidth - imgWidth) / 2;
        const yOffset = (pageHeight - imgHeight) / 2;

        pdf.addImage(imgData, 'JPEG', xOffset, yOffset, imgWidth, imgHeight);
        if (index < images.length - 1) pdf.addPage();
    });

    const fileName = prompt("Digite o nome do arquivo (sem extensão):", "imagens");
    if (fileName) pdf.save(`${fileName}.pdf`);
});

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Verifica o tema salvo no localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.classList.add(savedTheme);
        themeToggle.textContent = savedTheme === 'dark-mode' ? '🌞' : '🌙';
    } else {
        body.classList.add('light-mode');
    }

    // Alterna entre os temas
    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('dark-mode')) {
            body.classList.replace('dark-mode', 'light-mode');
            themeToggle.textContent = '🌙'; // Emoji de lua para modo escuro
            localStorage.setItem('theme', 'light-mode');
        } else {
            body.classList.replace('light-mode', 'dark-mode');
            themeToggle.textContent = '🌞'; // Emoji de sol para modo claro
            localStorage.setItem('theme', 'dark-mode');
        }
    });
});

document.getElementById('clear-images').addEventListener('click', () => {
    imageContainer.innerHTML = '';
});
