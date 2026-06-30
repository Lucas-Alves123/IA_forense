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
});
