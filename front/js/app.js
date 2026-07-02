document.addEventListener('DOMContentLoaded', () => {
    // Handling cadastro.html
    const cadastroForm = document.getElementById('cadastroForm');
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const nome = document.getElementById('cadNome').value;
            const email = document.getElementById('cadEmail').value;
            localStorage.setItem('usuarioLogado', JSON.stringify({ nome, email }));
            window.location.href = 'painel.html';
        });
    }

    // Handling login.html
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            let user = JSON.parse(localStorage.getItem('usuarioLogado'));
            if (!user || user.email !== email) {
                user = { nome: "Dr(a). " + email.split('@')[0], email: email };
                localStorage.setItem('usuarioLogado', JSON.stringify(user));
            }
            window.location.href = 'painel.html';
        });
    }

    // Update painel.html greeting
    const boasVindasText = document.getElementById('boasVindasText');
    if (boasVindasText) {
        const user = JSON.parse(localStorage.getItem('usuarioLogado'));
        if (user && user.nome) {
            boasVindasText.innerHTML = `Bem-vindo(a), <strong>${user.nome}</strong>! Aqui está o resumo das suas análises estratégicas.`;
        }
    }

    // Handling novo_processo.html
    const processForm = document.getElementById('processForm');
    if (processForm) {
        processForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const nomeCliente = document.getElementById('nomeCliente')?.value || 'Cliente não informado';
            const numeroProcesso = document.getElementById('numeroProcesso')?.value || 'Sem número';
            const faseProcessual = document.getElementById('faseProcessual')?.value || 'Não informada';
            const parteRepresentada = document.getElementById('parteRepresentada')?.value || 'Autor';
            const areaDireito = document.getElementById('areaDireito')?.value || 'Cível';
            
            const novoProcesso = {
                id: Date.now(),
                nome: nomeCliente,
                numero: numeroProcesso,
                fase: faseProcessual,
                parte: parteRepresentada,
                area: areaDireito,
                data: new Date().toLocaleDateString('pt-BR'),
                risco: 'A calcular',
                status: 'Aguardando Upload'
            };

            let processos = JSON.parse(localStorage.getItem('processos')) || [];
            processos.unshift(novoProcesso);
            localStorage.setItem('processos', JSON.stringify(processos));
            localStorage.setItem('processoAtual', novoProcesso.id);

            window.location.href = 'upload.html';
        });
    }

    // Handling painel.html
    const tabelaProcessosBody = document.getElementById('tabelaProcessosBody');
    if (tabelaProcessosBody) {
        let processos = JSON.parse(localStorage.getItem('processos')) || [];
        
        if (processos.length === 0) {
            tabelaProcessosBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">Nenhum processo cadastrado ainda.</td></tr>';
        } else {
            tabelaProcessosBody.innerHTML = '';
            processos.slice(0, 3).forEach(proc => {
                let badgeClass = 'risk-low';
                if (proc.risco === 'Moderado') badgeClass = 'risk-moderate';
                if (proc.risco === 'Crítico') badgeClass = 'risk-high'; 
                
                const styleHigh = proc.risco === 'Crítico' ? 'background-color: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid #ef4444;' : '';

                tabelaProcessosBody.innerHTML += `
                    <tr>
                        <td>
                            <div style="font-weight: 600;">${proc.nome}</div>
                            <div style="font-size: 0.8rem; color: var(--text-muted);">${proc.numero}</div>
                        </td>
                        <td>${proc.fase}</td>
                        <td><span class="risk-badge ${badgeClass}" style="${styleHigh}">${proc.risco}</span></td>
                        <td>${proc.data}</td>
                        <td><a href="relatorio.html?id=${proc.id}" style="color: var(--text-muted); text-decoration: none; font-size: 0.85rem;">Ver Relatório</a></td>
                    </tr>
                `;
            });
        }

        const totalProcessosEl = document.getElementById('totalProcessos');
        const riscosCriticosEl = document.getElementById('riscosCriticos');
        if (totalProcessosEl) totalProcessosEl.textContent = processos.length;
        if (riscosCriticosEl) riscosCriticosEl.textContent = processos.filter(p => p.risco === 'Crítico').length;
    }
    
    // Handling chart rendering on the dashboard
    const ctx = document.getElementById('riscosChart');
    if (ctx) {
        let processos = JSON.parse(localStorage.getItem('processos')) || [];
        let chartInstance = null;

        function renderChart() {
            if (chartInstance) {
                chartInstance.destroy();
            }

            if (processos.length === 0 || typeof Chart === 'undefined') return;

            const metrica = document.getElementById('graficoMetrica')?.value || 'riscos';
            
            let labels = [];
            let data = [];
            let backgroundColors = [];

            if (metrica === 'riscos') {
                const baixo = processos.filter(p => p.risco === 'Baixo').length || (processos.length === 0 ? 1 : 0);
                const moderado = processos.filter(p => p.risco === 'Moderado').length;
                const critico = processos.filter(p => p.risco === 'Crítico').length;
                labels = ['Baixo', 'Moderado', 'Crítico'];
                data = [baixo, moderado, critico];
                backgroundColors = ['#10b981', '#f59e0b', '#ef4444'];
            } else if (metrica === 'fases') {
                const fasesMap = {};
                processos.forEach(p => {
                    fasesMap[p.fase] = (fasesMap[p.fase] || 0) + 1;
                });
                labels = Object.keys(fasesMap);
                data = Object.values(fasesMap);
                // Assign a color palette for phases
                const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
                backgroundColors = labels.map((_, i) => colors[i % colors.length]);
            }

            chartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: backgroundColors,
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom', labels: { color: '#cbd5e1' } }
                    }
                }
            });
        }

        renderChart();

        document.getElementById('graficoMetrica')?.addEventListener('change', renderChart);
    }

    // Handling historico.html
    const tabelaHistoricoBody = document.getElementById('tabelaHistoricoBody');
    if (tabelaHistoricoBody) {
        let processos = JSON.parse(localStorage.getItem('processos')) || [];
        let currentPage = 1;
        const itemsPerPage = 10;
        
        function renderHistorico() {
            const paginacaoDiv = document.getElementById('paginacaoHistorico');
            
            if (processos.length === 0) {
                tabelaHistoricoBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">Nenhum histórico encontrado.</td></tr>';
                if (paginacaoDiv) paginacaoDiv.innerHTML = '';
                return;
            }
            
            const txt = (document.getElementById('filtroTexto')?.value || '').toLowerCase();
            const risco = document.getElementById('filtroRisco')?.value || '';
            const dataFiltro = document.getElementById('filtroData')?.value || '';
            
            let dataFormatada = '';
            if (dataFiltro) {
                const parts = dataFiltro.split('-');
                if (parts.length === 3) {
                    dataFormatada = `${parts[2]}/${parts[1]}/${parts[0]}`;
                }
            }

            const processosFiltrados = processos.filter(p => {
                const matchTexto = p.nome.toLowerCase().includes(txt) || p.numero.toLowerCase().includes(txt);
                const matchRisco = risco === '' || p.risco === risco;
                const matchData = dataFormatada === '' || p.data === dataFormatada;
                return matchTexto && matchRisco && matchData;
            });

            if (processosFiltrados.length === 0) {
                tabelaHistoricoBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">Nenhum processo encontrado com este filtro.</td></tr>';
                if (paginacaoDiv) paginacaoDiv.innerHTML = '';
                return;
            }

            const totalPages = Math.ceil(processosFiltrados.length / itemsPerPage);
            if (currentPage > totalPages) currentPage = totalPages;
            if (currentPage < 1) currentPage = 1;

            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const currentItems = processosFiltrados.slice(startIndex, endIndex);

            tabelaHistoricoBody.innerHTML = '';
            currentItems.forEach(proc => {
                let badgeClass = 'risk-low';
                if (proc.risco === 'Moderado') badgeClass = 'risk-moderate';
                if (proc.risco === 'Crítico') badgeClass = 'risk-high'; 
                
                const styleHigh = proc.risco === 'Crítico' ? 'background-color: rgba(239, 68, 68, 0.1); color: #ef4444; border: 1px solid #ef4444;' : '';

                tabelaHistoricoBody.innerHTML += `
                    <tr>
                        <td>
                            <div style="font-weight: 600;">${proc.nome}</div>
                            <div style="font-size: 0.8rem; color: var(--text-muted);">${proc.numero}</div>
                        </td>
                        <td>${proc.fase}</td>
                        <td><span class="risk-badge ${badgeClass}" style="${styleHigh}">${proc.risco}</span></td>
                        <td>${proc.data}</td>
                        <td><a href="relatorio.html?id=${proc.id}" style="color: var(--text-muted); text-decoration: none; font-size: 0.85rem;">Ver Relatório</a></td>
                    </tr>
                `;
            });
            
            if (paginacaoDiv) {
                if (totalPages > 1) {
                    paginacaoDiv.innerHTML = `
                        <button id="prevPage" class="btn-secondary" style="padding: 0.4rem 0.8rem; opacity: ${currentPage === 1 ? '0.5' : '1'}; cursor: ${currentPage === 1 ? 'not-allowed' : 'pointer'};" ${currentPage === 1 ? 'disabled' : ''}>&larr; Anterior</button>
                        <span style="color: var(--text-muted); font-size: 0.9rem;">Página ${currentPage} de ${totalPages}</span>
                        <button id="nextPage" class="btn-secondary" style="padding: 0.4rem 0.8rem; opacity: ${currentPage === totalPages ? '0.5' : '1'}; cursor: ${currentPage === totalPages ? 'not-allowed' : 'pointer'};" ${currentPage === totalPages ? 'disabled' : ''}>Próxima &rarr;</button>
                    `;
                    document.getElementById('prevPage')?.addEventListener('click', () => { if(currentPage > 1) { currentPage--; renderHistorico(); } });
                    document.getElementById('nextPage')?.addEventListener('click', () => { if(currentPage < totalPages) { currentPage++; renderHistorico(); } });
                } else {
                    paginacaoDiv.innerHTML = '';
                }
            }
        }
        
        renderHistorico();
        
        const applyFilters = () => { currentPage = 1; renderHistorico(); };
        
        document.getElementById('filtroTexto')?.addEventListener('input', applyFilters);
        document.getElementById('filtroRisco')?.addEventListener('change', applyFilters);
        document.getElementById('filtroData')?.addEventListener('change', applyFilters);
        
        document.getElementById('limparFiltros')?.addEventListener('click', () => {
            if(document.getElementById('filtroTexto')) document.getElementById('filtroTexto').value = '';
            if(document.getElementById('filtroRisco')) document.getElementById('filtroRisco').value = '';
            if(document.getElementById('filtroData')) document.getElementById('filtroData').value = '';
            applyFilters();
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
                        const processoAtualId = localStorage.getItem('processoAtual');
                        if (processoAtualId) {
                            let processos = JSON.parse(localStorage.getItem('processos')) || [];
                            const pIndex = processos.findIndex(p => p.id == processoAtualId);
                            if (pIndex !== -1) {
                                const riscos = ['Baixo', 'Moderado', 'Crítico'];
                                processos[pIndex].risco = riscos[Math.floor(Math.random() * riscos.length)];
                                processos[pIndex].status = 'Analisado';
                                localStorage.setItem('processos', JSON.stringify(processos));
                            }
                        }
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

    // Handling relatorio.html
    const relCliente = document.getElementById('relCliente');
    if (relCliente) {
        const urlParams = new URLSearchParams(window.location.search);
        let processoId = urlParams.get('id');
        
        if (!processoId) {
            processoId = localStorage.getItem('processoAtual');
        }

        if (processoId) {
            let processos = JSON.parse(localStorage.getItem('processos')) || [];
            const proc = processos.find(p => p.id == processoId);
            
            if (proc) {
                document.getElementById('relCliente').textContent = proc.nome;
                document.getElementById('relProcesso').textContent = proc.numero;
                document.getElementById('relFase').textContent = proc.fase;
                if (proc.parte) document.getElementById('relParte').textContent = proc.parte;
                if (proc.area) document.getElementById('relArea').textContent = proc.area;
                
                // --- MOCK REALISTA PARA DEMONSTRAÇÃO ---
                if (proc.nome && proc.nome.toUpperCase().includes("MARIA DA SILVA")) {
                    const relSintese = document.getElementById('relSintese');
                    if(relSintese) relSintese.textContent = "Trata-se de ação declaratória de inexistência de débito cumulada com indenização por danos morais. A parte autora alega que foi surpreendida com a negativação de seu nome no SPC/Serasa por uma dívida de cartão de crédito não contratado junto ao Banco Finanças S/A. A análise indica forte viabilidade da tese autoral, fundamentada no Código de Defesa do Consumidor e em provas documentais claras.";
                    
                    const relDocumentos = document.getElementById('relDocumentos');
                    if(relDocumentos) relDocumentos.innerHTML = `
                        <li style="margin-bottom: 0.3rem;">Petição Inicial de Indenização por Danos Morais.</li>
                        <li style="margin-bottom: 0.3rem;">Protocolos de atendimento SAC (nº 20261122A e 20261123B).</li>
                        <li>Extrato de consulta ao SPC/Serasa comprovando a negativação no valor de R$ 5.430,00.</li>
                    `;

                    const relFavoraveis = document.getElementById('relFavoraveis');
                    if(relFavoraveis) relFavoraveis.innerHTML = `
                        <li style="margin-bottom: 0.3rem;">Relação de consumo clara, atraindo a responsabilidade civil objetiva do Réu (art. 14, CDC).</li>
                        <li style="margin-bottom: 0.3rem;">Documentação robusta evidenciando a tentativa prévia de resolução administrativa via SAC.</li>
                        <li>Jurisprudência consolidada do STJ sobre dano moral <em>in re ipsa</em> em casos de negativação indevida.</li>
                    `;

                    const relDesfavoraveis = document.getElementById('relDesfavoraveis');
                    if(relDesfavoraveis) relDesfavoraveis.innerHTML = `
                        <li style="margin-bottom: 0.3rem;">Não há comprovante de recusa de crédito materializado (ex: carta da loja negando financiamento), embora a negativação por si só já gere o dano presumido.</li>
                        <li>Risco de o Réu juntar na contestação algum contrato assinado que justifique a cobrança, alterando a premissa de fraude apresentada na inicial.</li>
                    `;

                    const relProvasFortes = document.getElementById('relProvasFortes');
                    if(relProvasFortes) relProvasFortes.innerHTML = `
                        <li style="margin-bottom: 0.3rem;">Extrato atualizado do Serasa com o valor exato do apontamento de R$ 5.430,00.</li>
                        <li>Protocolos de atendimento telefônico registrados pela autora.</li>
                    `;

                    const relProvasFrageis = document.getElementById('relProvasFrageis');
                    if(relProvasFrageis) relProvasFrageis.innerHTML = `
                        <li style="margin-bottom: 0.3rem;">Alegação de "nunca ter solicitado cartão" é prova negativa (impossível de produzir materialmente pela autora), dependendo necessariamente do deferimento da inversão do ônus probatório.</li>
                    `;

                    const relContradicoes = document.getElementById('relContradicoes');
                    if(relContradicoes) relContradicoes.textContent = "Até a presente fase (Antes do ajuizamento), não foram identificadas contradições processuais, pois ainda não houve apresentação de defesa pelo Banco Réu.";

                    const relRiscos = document.getElementById('relRiscos');
                    if(relRiscos) relRiscos.innerHTML = `
                        <div style="margin-bottom: 1rem; display: flex; align-items: flex-start; gap: 1rem;">
                            <span style="background-color: rgba(16, 185, 129, 0.1); color: #10b981; border: 1px solid #10b981; padding: 0.2rem 0.6rem; border-radius: 4px; font-size: 0.75rem; font-weight: 600; white-space: nowrap;">Risco Baixo</span>
                            <p style="color: var(--text-muted); margin: 0; line-height: 1.4; font-size: 0.95rem;">A tese central é sólida. O principal risco é a fixação de danos morais em valor inferior ao pedido (R$ 15.000,00), o que é comum em juizados dependendo do critério do magistrado.</p>
                        </div>
                    `;

                    const relTeses = document.getElementById('relTeses');
                    if(relTeses) relTeses.innerHTML = `
                        <li style="margin-bottom: 0.3rem;">Inversão do ônus da prova (art. 6º, VIII, CDC).</li>
                        <li style="margin-bottom: 0.3rem;">Declaração de Inexistência do débito.</li>
                        <li>Dano moral presumido decorrente de inscrição indevida nos órgãos de proteção.</li>
                    `;

                    const relTesesNaoRecomendadas = document.getElementById('relTesesNaoRecomendadas');
                    if(relTesesNaoRecomendadas) relTesesNaoRecomendadas.innerHTML = `
                        <li>Pedido de Indenização por Danos Materiais, vez que não foi comprovado desembolso financeiro efetivo pela autora para pagamento da suposta dívida.</li>
                    `;

                    const relProvidencia = document.getElementById('relProvidencia');
                    if(relProvidencia) relProvidencia.textContent = "Recomenda-se o ajuizamento imediato da petição inicial com pedido expresso de Tutela de Urgência Antecipada para exclusão cautelar do nome dos cadastros de inadimplentes, sob pena de multa diária.";

                    const relProximosPassos = document.getElementById('relProximosPassos');
                    if(relProximosPassos) relProximosPassos.innerHTML = `
                        <li style="margin-bottom: 0.3rem;">Distribuir a ação e despachar o pedido liminar com o juiz.</li>
                        <li>Acompanhar prazo para citação e intimação do Banco Finanças S/A.</li>
                    `;
                }
            }
        }
    }

    // --- Acessibilidade Global ---
    const body = document.body;
    
    // Create the Accessibility Button
    const accBtn = document.createElement('button');
    accBtn.className = 'accessibility-btn';
    accBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>';
    accBtn.title = "Acessibilidade";
    
    // Create the Menu
    const accMenu = document.createElement('div');
    accMenu.className = 'accessibility-menu';
    accMenu.innerHTML = `
        <button id="accIncreaseFont"><span>A+</span> Aumentar Fonte</button>
        <button id="accDecreaseFont"><span>A-</span> Diminuir Fonte</button>
        <button id="accHighContrast"><span>◑</span> Alto Contraste</button>
        <button id="accVoiceRead"><span>🔊</span> Leitura em Voz</button>
    `;
    
    body.appendChild(accBtn);
    body.appendChild(accMenu);
    
    // Toggle menu
    accBtn.addEventListener('click', () => {
        accMenu.classList.toggle('show');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!accBtn.contains(e.target) && !accMenu.contains(e.target)) {
            accMenu.classList.remove('show');
        }
    });
    
    // Font Size Logic
    let currentFontSize = 100; // Percentage
    document.getElementById('accIncreaseFont').addEventListener('click', () => {
        if(currentFontSize < 130) {
            currentFontSize += 10;
            document.documentElement.style.fontSize = currentFontSize + '%';
        }
    });
    document.getElementById('accDecreaseFont').addEventListener('click', () => {
        if(currentFontSize > 80) {
            currentFontSize -= 10;
            document.documentElement.style.fontSize = currentFontSize + '%';
        }
    });
    
    // High Contrast Logic
    document.getElementById('accHighContrast').addEventListener('click', () => {
        body.classList.toggle('high-contrast');
    });

    // Voice Reading Logic (Fix)
    let isReading = false;
    let utterance = null;
    document.getElementById('accVoiceRead').addEventListener('click', () => {
        if (isReading) {
            window.speechSynthesis.cancel();
            isReading = false;
            document.getElementById('accVoiceRead').innerHTML = '<span>🔊</span> Leitura em Voz';
            return;
        }
        const text = document.body.innerText
            .replace(/\s+/g, ' ')
            .substring(0, 5000);
        utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.95;
        utterance.onend = () => {
            isReading = false;
            document.getElementById('accVoiceRead').innerHTML = '<span>🔊</span> Leitura em Voz';
        };
        window.speechSynthesis.speak(utterance);
        isReading = true;
        document.getElementById('accVoiceRead').innerHTML = '<span>⏹️</span> Parar leitura';
        accMenu.classList.remove('show');
    });

    // --- Assistente IA (Chat Flutuante) - REDESENHADO ---
    const assistenteStyles = `
        .assistente-btn {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: white;
            border: none;
            border-radius: 50px;
            padding: 0.8rem 1.5rem;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            z-index: 9999;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            box-shadow: 0 4px 25px rgba(99, 102, 241, 0.6);
            transition: all 0.3s;
            font-family: 'Inter', sans-serif;
        }
        .assistente-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(99, 102, 241, 0.75); }
        .assistente-chat {
            position: fixed;
            bottom: 78px;
            right: 20px;
            width: 440px;
            background: #0f172a;
            border: 1px solid rgba(99, 102, 241, 0.4);
            border-radius: 16px;
            z-index: 9998;
            display: none;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 20px 50px rgba(0,0,0,0.7);
            font-family: 'Inter', sans-serif;
        }
        .assistente-chat.show { display: flex; }
        .assistente-chat-header {
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            padding: 1.2rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .assistente-chat-header .header-title { font-weight: 700; font-size: 1rem; }
        .assistente-chat-header .header-sub { font-size: 0.8rem; opacity: 0.85; margin-top: 2px; }
        .assistente-chat-header button { background:transparent;border:none;color:white;cursor:pointer;font-size:1.3rem;line-height:1; }
        .assistente-chat-messages {
            flex: 1;
            overflow-y: auto;
            padding: 1.2rem;
            display: flex;
            flex-direction: column;
            gap: 0.8rem;
            min-height: 160px;
            max-height: 280px;
        }
        .chat-msg { padding: 0.9rem 1.1rem; border-radius: 10px; font-size: 0.88rem; line-height: 1.55; max-width: 92%; }
        .chat-msg.ia { background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.2); align-self: flex-start; width: 100%; max-width: 100%; }
        .chat-msg.user { background: rgba(203,161,83,0.15); border: 1px solid rgba(203,161,83,0.3); align-self: flex-end; }
        .chat-suggestions { display: flex; flex-direction: column; gap: 0.4rem; margin-top: 0.7rem; }
        .chat-suggestion {
            background: rgba(99,102,241,0.08);
            border: 1px solid rgba(99,102,241,0.2);
            border-radius: 6px;
            color: #818cf8;
            padding: 0.45rem 0.8rem;
            font-size: 0.82rem;
            cursor: pointer;
            text-align: left;
            transition: all 0.15s;
            font-family: 'Inter', sans-serif;
        }
        .chat-suggestion:hover { background: rgba(99,102,241,0.18); color: #a5b4fc; }
        .assistente-chat-input {
            padding: 1rem;
            border-top: 1px solid rgba(99,102,241,0.2);
            display: flex;
            flex-direction: column;
            gap: 0.6rem;
            background: rgba(15,23,42,0.8);
        }
        .assistente-chat-input textarea {
            width: 100%;
            background: rgba(255,255,255,0.05);
            border: 1.5px solid rgba(99,102,241,0.35);
            border-radius: 8px;
            color: white;
            padding: 0.8rem 0.9rem;
            font-size: 0.88rem;
            outline: none;
            resize: none;
            min-height: 80px;
            font-family: 'Inter', sans-serif;
            line-height: 1.5;
        }
        .assistente-chat-input textarea::placeholder { color: rgba(255,255,255,0.35); }
        .assistente-chat-input textarea:focus { border-color: #6366f1; }
        .assistente-send-btn {
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 0.7rem 1rem;
            cursor: pointer;
            font-size: 0.92rem;
            font-weight: 600;
            width: 100%;
            font-family: 'Inter', sans-serif;
            transition: opacity 0.2s;
        }
        .assistente-send-btn:hover { opacity: 0.9; }
    `;
    const styleEl = document.createElement('style');
    styleEl.textContent = assistenteStyles;
    document.head.appendChild(styleEl);

    const assistenteBtn = document.createElement('button');
    assistenteBtn.className = 'assistente-btn';
    assistenteBtn.innerHTML = '💬 Assistente';

    const assistenteChat = document.createElement('div');
    assistenteChat.className = 'assistente-chat';
    assistenteChat.innerHTML = `
        <div class="assistente-chat-header">
            <div>
                <div class="header-title">Assistente do Estratégia Forense</div>
                <div class="header-sub">Ajuda você a usar o sistema</div>
            </div>
            <button onclick="this.closest('.assistente-chat').classList.remove('show')">×</button>
        </div>
        <div class="assistente-chat-messages" id="chatMessages">
            <div class="chat-msg ia">
                Olá! Posso te ajudar a navegar pelo sistema. Experimente perguntar:
                <div class="chat-suggestions">
                    <button class="chat-suggestion" onclick="usarSugestao('Como analiso um processo?')">"Como analiso um processo?"</button>
                    <button class="chat-suggestion" onclick="usarSugestao('Onde calculo prazo recursal?')">"Onde calculo prazo recursal?"</button>
                    <button class="chat-suggestion" onclick="usarSugestao('Como envio mensagem ao cliente?')">"Como envio mensagem ao cliente?"</button>
                    <button class="chat-suggestion" onclick="usarSugestao('Como pesquiso jurisprudência do STJ?')">"Como pesquiso jurisprudência do STJ?"</button>
                </div>
            </div>
        </div>
        <div class="assistente-chat-input">
            <textarea id="chatInput" placeholder="Pergunte sobre o sistema..." onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();enviarMensagem();}"></textarea>
            <button class="assistente-send-btn" onclick="enviarMensagem()">Enviar</button>
        </div>
    `;
    body.appendChild(assistenteBtn);
    body.appendChild(assistenteChat);

    assistenteBtn.addEventListener('click', () => {
        assistenteChat.classList.toggle('show');
    });

    window.usarSugestao = function(texto) {
        document.getElementById('chatInput').value = texto;
        enviarMensagem();
    };

    window.enviarMensagem = function() {
        const input = document.getElementById('chatInput');
        const msg = input.value.trim();
        if (!msg) return;
        const msgs = document.getElementById('chatMessages');
        const userDiv = document.createElement('div');
        userDiv.className = 'chat-msg user';
        userDiv.textContent = msg;
        msgs.appendChild(userDiv);
        input.value = '';
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chat-msg ia';
        typingDiv.textContent = '✦ Digitando...';
        typingDiv.id = 'typingIndicator';
        msgs.appendChild(typingDiv);
        msgs.scrollTop = msgs.scrollHeight;
        setTimeout(() => {
            const indicator = document.getElementById('typingIndicator');
            if (indicator) indicator.remove();
            const iaDiv = document.createElement('div');
            iaDiv.className = 'chat-msg ia';
            const msgLower = msg.toLowerCase();
            let resp;
            if (msgLower.includes('processo') || msgLower.includes('analis')) {
                resp = 'Para analisar um processo, vá em "Novo Processo" no menu lateral, preencha os dados e faça upload do PDF. A IA gerará o relatório estratégico completo!';
            } else if (msgLower.includes('prazo')) {
                resp = 'Acesse "Calculadoras" e selecione a aba "📅 Prazos". Informe a data da intimação, o número de dias e o tipo (úteis ou corridos).';
            } else if (msgLower.includes('email') || msgLower.includes('mensagem') || msgLower.includes('cliente')) {
                resp = 'No menu clique em "E-mail IA". Cole o texto do e-mail recebido e a IA identificará prazos, cobranças e o que você precisa fazer.';
            } else if (msgLower.includes('jurisprud') || msgLower.includes('stj') || msgLower.includes('stf')) {
                resp = 'Acesse "Jurisprudência" no menu. Digite o tema ou tese jurídica e clique em "Pesquisar jurisprudência". Os julgados aparecem com links verificáveis.';
            } else if (msgLower.includes('petição') || msgLower.includes('modelo')) {
                resp = 'Vá em "Petições" no menu. Lá você encontra modelos por área. Clique em "Abrir modelo" para visualizar, adaptar com IA ou baixar.';
            } else if (msgLower.includes('calculad')) {
                resp = 'As calculadoras estão no menu. Temos: Prazos, Juros & Correção, Juros Abusivos, Pensão Alimentícia, Execução Penal, Habitacional e Trabalhista.';
            } else {
                const resp_list = [
                    'Entendido! Para qualquer análise de processo: Novo Processo → Upload do PDF → Relatório IA.',
                    'Use o menu lateral para navegar entre as funcionalidades do sistema.',
                    'Explore: Calculadoras, Petições, Jurisprudência e E-mail IA no menu lateral.',
                ];
                resp = resp_list[Math.floor(Math.random() * resp_list.length)];
            }
            iaDiv.textContent = resp;
            msgs.appendChild(iaDiv);
            msgs.scrollTop = msgs.scrollHeight;
        }, 800);
        msgs.scrollTop = msgs.scrollHeight;
    };

});
