document.addEventListener('DOMContentLoaded', () => {
    // Handling index.html / painel.html
    const processForm = document.getElementById('processForm');
    if (processForm) {
        processForm.addEventListener('submit', (e) => {
            e.preventDefault();
            window.location.href = 'upload.html';
        });
    }

    // Handling upload.html
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const uploadForm = document.getElementById('uploadForm');
    const loadingState = document.getElementById('loadingState');
    const terminalOutput = document.getElementById('terminalOutput');
    const actionButtons = document.getElementById('actionButtons');

    if (uploadArea) {
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => { e.preventDefault(); uploadArea.style.borderColor = 'var(--primary-btn)'; });
        uploadArea.addEventListener('dragleave', () => uploadArea.style.borderColor = 'var(--border-color)');
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault(); 
            uploadArea.style.borderColor = 'var(--border-color)';
            if (e.dataTransfer.files.length) { 
                fileInput.files = e.dataTransfer.files; 
                updateUploadText(e.dataTransfer.files[0].name); 
            }
        });
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length) updateUploadText(e.target.files[0].name);
        });

        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!fileInput.files.length) {
                alert('Por favor, selecione um arquivo PDF primeiro.');
                return;
            }

            actionButtons.classList.add('hidden');
            loadingState.classList.remove('hidden');
            
            // Highlight step 3
            const steps = document.querySelectorAll('.step');
            if(steps.length > 2) {
                steps[1].classList.remove('active');
                steps[2].classList.add('active');
            }

            const logs = [
                "Lendo arquivo PDF (34 páginas)... Concluído.",
                "Aplicando OCR e extraindo texto... Concluído.",
                "Identificando entidades e estrutura jurídica...",
                "Consultando jurisprudência cruzada...",
                "Analisando riscos e mapeando provas...",
                "Gerando relatório estratégico final..."
            ];

            const barFill = document.querySelector('.progress-bar-fill');
            let delay = 0;
            
            logs.forEach((log, index) => {
                setTimeout(() => {
                    const line = document.createElement('div');
                    line.style.marginBottom = '0.3rem';
                    line.textContent = `> ${log}`;
                    terminalOutput.appendChild(line);
                    
                    if (barFill) {
                        barFill.style.width = `${((index + 1) / logs.length) * 100}%`;
                    }
                    
                    if (index === logs.length - 1) {
                        setTimeout(() => window.location.href = 'relatorio.html', 1000);
                    }
                }, delay += 800);
            });
        });
    }

    function updateUploadText(filename) {
        const textElement = uploadArea.querySelector('p');
        textElement.innerHTML = `Arquivo <strong>${filename}</strong> selecionado.`;
    }
});
