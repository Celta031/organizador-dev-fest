document.addEventListener('DOMContentLoaded', () => {

    const talksData = {
        "10:00": [
            { title: "Desenvolvimento de Agents com o ADK", track: "Iniciante", cardImage: "./assets/cards/1000_iniciante.png" },
            { title: "BigQuery Advanced", track: "Avançado", cardImage: "./assets/cards/1000_avancado.png" },
            { title: "Testes Técnicos Sem Mistério: O Guia para se Destacar", track: "Carreiras", cardImage: "./assets/cards/1000_carreiras.png" },
            { title: "Docker para Iniciantes (Workshop 10:00-11:40)", track: "Workshop", cardImage: "./assets/cards/1000_workshop.png", isWorkshop: true }, 
            { title: "Mentoria em: Transição de Carreira, Produto e Agilidade", track: "WTM", cardImage: "./assets/cards/1000_wtm.png" },
            { title: "De Aprendiz a Referência: Construindo Espaço na Tecnologia com Propósito", track: "Onfly", cardImage: "./assets/cards/1000_onfly.png" }
        ],
        "10:50": [
            { title: "Earth Engine no Atendimento das Emergências Climáticas", track: "Iniciante", cardImage: "./assets/cards/1050_iniciante.png" },
            { title: "Generative UI: UIs Dinâmicas e LLMs", track: "Avançado", cardImage: "./assets/cards/1050_avancado.png" },
            { title: "Tenha o LinkedIn Como Seu Aliado para se Destacar no Mercado de Trabalho", track: "Carreiras", cardImage: "./assets/cards/1050_carreiras.png" },
            { title: "Mentoria em: Carreira em Tecnologia, Transição de Carreira, Saúde Mental e Bem-estar", track: "WTM", cardImage: "./assets/cards/1050_wtm.png" },
            { title: "De Monolito para Micro Serviços: A transição da Onfly", track: "Onfly", cardImage: "./assets/cards/1050_onfly.png" }
        ],
        "11:40": [
            { title: "IA no Design de Produtos Inovadores", track: "Iniciante", cardImage: "./assets/cards/1140_iniciante.png" },
            { title: "Implement Bulletproof AgentOps", track: "Avançado", cardImage: "./assets/cards/1140_avancado.png" },
            { title: "Por dentro da Análise de Dados: O Divertido, o Difícil e o Essencial", track: "Carreiras", cardImage: "./assets/cards/1140_carreiras.png" },
            { title: "Mentoria em: Carreira em Desenvolvimento, Software, Inteligência Artificial", track: "WTM", cardImage: "./assets/cards/1140_wtm.png" },
            { title: "Dominando o Flutter: Estratégias de Qualidade para Vencer no Mercado Nacional", track: "Onfly", cardImage: "./assets/cards/1140_onfly.png" }
        ],
        "13:40": [
            { title: "A Era Gemma: Desvendando a Família de Modelos Abertos do Google", track: "Iniciante", cardImage: "./assets/cards/1340_iniciante.png" },
            { title: "Docker Offload: To the Cloud and Beyond", track: "Avançado", cardImage: "./assets/cards/1340_avancado.png" },
            { title: "Work-life Balance em Carreiras Globais", track: "Carreiras", cardImage: "./assets/cards/1340_carreiras.png" },
            { title: "Arquitetura Frontend Moderna (Workshop 13:40-15:20)", track: "Workshop", cardImage: "./assets/cards/1340_workshop.png", isWorkshop: true },
            { title: "Mentoria em: Carreira em Desenvolvimento, Liderança e Gestão de Times", track: "WTM", cardImage: "./assets/cards/1340_wtm.png" },
            { title: "Um Framework Vivo para a Web Moderna da Onfly", track: "Onfly", cardImage: "./assets/cards/1340_onfly.png" }
        ],
        "14:30": [
            { title: "Vamos falar de Inteligência Artificial? Apps Inteligentes com Flutter e Gemini", track: "Iniciante", cardImage: "./assets/cards/1430_iniciante.png" },
            { title: "Aprimorando Agentic AI com Servidores MCP Serverless", track: "Avançado", cardImage: "./assets/cards/1430_avancado.png" },
            { title: "De Dev a Tech Manager: Coisas que Aprendi nessa Jornada", track: "Carreiras", cardImage: "./assets/cards/1430_carreiras.png" },
            { title: "Mentoria em: Carreira em Produto, Produto e Agilidade, Liderança e Gestão de Times", track: "WTM", cardImage: "./assets/cards/1430_wtm.png" },
            { title: "Data Platform Modular: Estratégias de Migração do Monolito para Microsserviços", track: "Onfly", cardImage: "./assets/cards/1430_onfly.png" }
        ],
        "15:20": [
            { title: "A Mentalidade do desenvolvedor Secure-First", track: "Iniciante", cardImage: "./assets/cards/1520_iniciante.png" },
            { title: "Arquitetura e Modelagem de Software: O Processo de Decisão por Trás de Sistemas Resilientes", track: "Avançado", cardImage: "./assets/cards/1520_avancado.png" },
            { title: "Storytelling Estratégico: Como mostrar seu trabalho com intenção e gerar impacto", track: "Carreiras", cardImage: "./assets/cards/1520_carreiras.png" },
            { title: "Mentoria em: Carreira em Produto, UX/UI Design, Produto e Agilidade, Empreendedorismo", track: "WTM", cardImage: "./assets/cards/1520_wtm.png" },
            { title: "Do Rascunho ao Robô: Como a Onfly Transforma Ideias de IA em Agentes de Produção", track: "Onfly", cardImage: "./assets/cards/1520_onfly.png" }
        ]
    };

    const slotTimes = Object.keys(talksData);
    const nextSlotMap = {};
    const prevSlotMap = {};
    for (let i = 0; i < slotTimes.length; i++) {
        const time = slotTimes[i];
        const slotId = 'slot-' + time.replace(':', '');
        if (i < slotTimes.length - 1) {
            const nextTime = slotTimes[i+1];
            const nextSlotId = 'slot-' + nextTime.replace(':', '');
            nextSlotMap[slotId] = nextSlotId;
        }
        if (i > 0) {
            const prevTime = slotTimes[i-1];
            const prevSlotId = 'slot-' + prevTime.replace(':', '');
            prevSlotMap[slotId] = prevSlotId;
        }
    }

    const palette = document.getElementById('talk-palette');
    const downloadBtn = document.getElementById('download-btn');
    const scheduleBuilder = document.getElementById('schedule-builder');

    function populatePalette() {
        Object.keys(talksData).forEach(timeSlot => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'talk-group';
            const title = document.createElement('h3');
            title.textContent = timeSlot;
            groupDiv.appendChild(title);

            talksData[timeSlot].forEach(talk => {
                const talkItem = document.createElement('div');
                talkItem.className = 'talk-item';
                talkItem.innerHTML = `${talk.title} <span>(Trilha: ${talk.track})</span>`;
                talkItem.dataset.cardImage = talk.cardImage;
                talkItem.dataset.timeSlot = timeSlot;
                talkItem.dataset.isWorkshop = talk.isWorkshop || false;
                groupDiv.appendChild(talkItem);
            });
            palette.appendChild(groupDiv);
        });
    }

    function handleTalkClick(event) {
        const talkElement = event.target.closest('.talk-item');
        if (!talkElement) return;

        const cardImage = talkElement.dataset.cardImage;
        const timeSlot = talkElement.dataset.timeSlot;
        const isWorkshop = talkElement.dataset.isWorkshop === 'true';
        const slotId = 'slot-' + timeSlot.replace(':', '');
        
        const placeholder = document.getElementById(slotId);
        if (!placeholder) return;

        const prevSlotId = prevSlotMap[slotId];
        const prevPlaceholder = prevSlotId ? document.getElementById(prevSlotId) : null;
        
        const nextSlotId = nextSlotMap[slotId];
        const nextPlaceholder = nextSlotId ? document.getElementById(nextSlotId) : null;

        // Checa se o slot ANTERIOR é um workshop que está "cobrindo" o slot atual.
        if (prevPlaceholder && prevPlaceholder.classList.contains('workshop-slot')) {
            alert('Ação bloqueada: O horário desta palestra ( ' + timeSlot + ' ) conflita com o workshop que você selecionou no horário anterior.');
            return; 
        }

        
        // 3. Resolver Conflitos
        if (placeholder.classList.contains('workshop-slot') && !isWorkshop) {
            placeholder.classList.remove('workshop-slot');
            if (nextPlaceholder) {
                nextPlaceholder.classList.remove('workshop-hidden');
                nextPlaceholder.style.display = 'block';
                nextPlaceholder.style.backgroundImage = 'none'; // Limpa o slot
            }
        }
        
        
        placeholder.style.backgroundImage = `url('${cardImage}')`;

        if (isWorkshop) {
            placeholder.classList.add('workshop-slot');
            placeholder.style.zIndex = '10';

            if (nextPlaceholder) {
                nextPlaceholder.classList.add('workshop-hidden');
                nextPlaceholder.style.display = 'none';
                nextPlaceholder.style.backgroundImage = 'none';
            }
        }
    }


    function downloadSchedule() {
        console.log('Iniciando captura da grade...');
        scheduleBuilder.classList.add('capturing');
        html2canvas(scheduleBuilder, {
            useCORS: true,
            allowTaint: true,
            scale: 3
        }).then(canvas => {
            const imageData = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = imageData;
            link.download = 'minha-grade-devfest-bh.png';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            scheduleBuilder.classList.remove('capturing');
            console.log('Download da grade iniciado.');
        }).catch(err => {
            console.error('Erro ao gerar a imagem com html2canvas:', err);
            scheduleBuilder.classList.remove('capturing');
        });
    }
    populatePalette();
    palette.addEventListener('click', handleTalkClick);
    downloadBtn.addEventListener('click', downloadSchedule);
});