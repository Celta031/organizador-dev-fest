/**
 * Aplicação principal - Organizador de Grade DevFest
 * @module app
 */

import { CONSTANTS } from '../config/constants.js';
import {
  debounce,
  normalizeString,
  validateTalk,
  createTalkId,
  generateShareUrl,
  decodeScheduleData,
  createElement
} from '../utils/utils.js';
import { saveSchedule, loadSchedule, clearSchedule, savePreferences, loadPreferences } from './storage.js';
import { showToast, showLoading, showConfirmModal, updateSlotIndicator } from './ui.js';
import { generateICS, downloadFile } from './calendar.js';
/**
 * Classe principal da aplicação
 */
export class DevFestScheduler {
  constructor() {
    this.talksData = {};
    this.slotTimes = [];
    this.nextSlotMap = {};
    this.prevSlotMap = {};
    this.selectedTalks = {};
    this.currentFilter = 'all';
    this.searchTerm = '';
    this.currentTheme = 'light';
    
    // Performance optimization: indexed lookups
    this.talkIdToTalkMap = new Map(); // Maps talkId -> talk object
    this.cachedDomElements = {}; // Cache for frequently accessed DOM elements

    this.initializeElements();
    this.loadTheme();
    this.loadData();
  }

  /**
   * Inicializa elementos do DOM
   */
  initializeElements() {
    this.palette = document.getElementById('talk-palette');
    this.downloadBtn = document.getElementById('download-btn');
    this.clearBtn = document.getElementById('clear-all-btn');
    this.shareBtn = document.getElementById('share-btn');
    this.scheduleBuilder = document.getElementById('schedule-builder');
    this.searchInput = document.getElementById('search-input');
    this.filterButtons = document.querySelectorAll('.filter-btn');
    this.themeToggleBtn = document.getElementById('theme-toggle-btn');
    this.calendarBtn = document.getElementById('calendar-btn');
  }

  /**
   * Carrega dados das palestras
   */
  async loadData() {
    try {
      showLoading(true);
      const response = await fetch(CONSTANTS.URLS.DATA);

      if (!response.ok) {
        throw new Error('Erro ao carregar dados das palestras');
      }

      this.talksData = await response.json();

      // Validar dados
      let isValid = true;
      Object.values(this.talksData).forEach(talks => {
        talks.forEach(talk => {
          if (!validateTalk(talk)) {
            console.error('Palestra inválida:', talk);
            isValid = false;
          }
        });
      });

      if (!isValid) {
        throw new Error('Dados de palestras contêm informações inválidas');
      }

      this.setupSlotMaps();
      this.buildTalkIndexes();
      this.loadScheduleFromStorage();
      this.loadScheduleFromURL();
      this.setupEventListeners();
      this.populatePalette();
      this.restoreSchedule();

      showLoading(false);
      showToast('Grade carregada com sucesso!', 'success');
    } catch (error) {
      showLoading(false);
      console.error('Erro ao carregar dados:', error);
      showToast('Erro ao carregar dados. Por favor, recarregue a página.', 'error', 5000);
    }
  }

  /**
   * Configura mapeamento de slots
   */
  setupSlotMaps() {
    this.slotTimes = Object.keys(this.talksData);

    for (let i = 0; i < this.slotTimes.length; i++) {
      const time = this.slotTimes[i];
      const slotId = 'slot-' + time.replace(':', '');

      if (i < this.slotTimes.length - 1) {
        const nextTime = this.slotTimes[i + 1];
        const nextSlotId = 'slot-' + nextTime.replace(':', '');
        this.nextSlotMap[slotId] = nextSlotId;
      }

      if (i > 0) {
        const prevTime = this.slotTimes[i - 1];
        const prevSlotId = 'slot-' + prevTime.replace(':', '');
        this.prevSlotMap[slotId] = prevSlotId;
      }
    }
  }

  /**
   * Builds indexed lookups for talks for O(1) access
   * Performance optimization to avoid linear searches
   */
  buildTalkIndexes() {
    this.talkIdToTalkMap.clear();
    
    Object.keys(this.talksData).forEach(timeSlot => {
      this.talksData[timeSlot].forEach(talk => {
        const talkId = createTalkId(timeSlot, talk.title);
        // Store reference with timeSlot for efficient lookup
        // Small object wrapper keeps code clear while maintaining performance
        this.talkIdToTalkMap.set(talkId, { talk, timeSlot });
      });
    });
  }

  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Event delegation for talk clicks - more efficient than individual listeners
    this.palette.addEventListener('click', (e) => this.handleTalkClick(e));

    // Clique direito para remover
    this.scheduleBuilder.addEventListener('contextmenu', (e) => this.handleSlotRightClick(e));

    // Botões principais
    this.downloadBtn?.addEventListener('click', () => this.downloadSchedule());
    this.clearBtn?.addEventListener('click', () => this.handleClearAll());
    this.shareBtn?.addEventListener('click', () => this.handleShare());
    this.calendarBtn?.addEventListener('click', () => this.handleExportCalendar());

    // Toggle tema
    this.themeToggleBtn?.addEventListener('click', () => this.toggleTheme());

    // Busca com debounce
    if (this.searchInput) {
      const debouncedSearch = debounce(() => this.handleSearch(), CONSTANTS.ANIMATION.DEBOUNCE_DELAY);
      this.searchInput.addEventListener('input', debouncedSearch);
    }

    // Filtros
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleFilter(e));
    });

  }

  loadTheme() {
    const prefs = loadPreferences();
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // O tema salvo tem prioridade, se não houver, usa a preferência do sistema
    this.currentTheme = prefs.theme || (systemPrefersDark ? 'dark' : 'light');
    
    this.applyTheme();
  }

  /**
   * Aplica o tema (dark/light) ao body e salva a preferência
   */
  applyTheme() {
    if (this.currentTheme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // Atualiza o aria-label do botão para acessibilidade
    if (this.themeToggleBtn) {
      this.themeToggleBtn.setAttribute('aria-label', 
        this.currentTheme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'
      );
    }

    // Salva a preferência no localStorage
    savePreferences({ theme: this.currentTheme });
  }

  /**
   * Alterna entre os temas
   */
  toggleTheme() {
    this.currentTheme = (this.currentTheme === 'light') ? 'dark' : 'light';
    this.applyTheme();
    showToast(`Modo ${this.currentTheme === 'dark' ? 'Escuro' : 'Claro'} ativado!`, 'info', 1500);
  }

  /**
   * Popula paleta de palestras
   * Optimized to use DocumentFragment for better performance
   */
  populatePalette() {
    // Salvar posição do scroll antes de recriar
    const existingScrollContainer = this.palette.querySelector('.talk-palette-scroll');
    const scrollPosition = existingScrollContainer ? existingScrollContainer.scrollTop : 0;

    // Criar estrutura com título fixo e área de scroll
    this.palette.innerHTML = `
      <h2>Escolha suas palestras:</h2>
      <div class="talk-palette-scroll"></div>
    `;

    const scrollContainer = this.palette.querySelector('.talk-palette-scroll');
    
    // Use DocumentFragment for batch DOM operations - better performance
    const fragment = document.createDocumentFragment();

    Object.keys(this.talksData).forEach(timeSlot => {
      const groupDiv = createElement('div', { className: 'talk-group' });
      const title = createElement('h3', {}, timeSlot);
      groupDiv.appendChild(title);

      this.talksData[timeSlot].forEach((talk, index) => {
        if (this.shouldShowTalk(talk)) {
          const talkId = createTalkId(timeSlot, talk.title);
          const isSelected = this.selectedTalks[timeSlot] === talkId;

          const talkItem = createElement('div', {
            className: `talk-item ${isSelected ? 'talk-selected' : ''}`,
            tabIndex: '0',
            role: 'button',
            'aria-pressed': isSelected,
            dataset: {
              cardImage: talk.cardImage,
              timeSlot: timeSlot,
              isWorkshop: talk.isWorkshop || false,
              talkId: talkId,
              track: talk.track
            }
          }, `${talk.title} <span class="track-badge track-${normalizeString(talk.track)}">${talk.track}</span>`);

          // Use event delegation instead of individual listeners for better performance
          // Keyboard events handled via delegation in setupEventListeners
          groupDiv.appendChild(talkItem);
        }
      });

      if (groupDiv.children.length > 1) {
        fragment.appendChild(groupDiv);
      }
    });
    
    // Single DOM update instead of multiple - much faster
    scrollContainer.appendChild(fragment);

    // Restaurar posição do scroll
    if (scrollPosition > 0) {
      scrollContainer.scrollTop = scrollPosition;
    }
    
    // Setup keyboard navigation via event delegation
    this.setupPaletteKeyboardHandlers();
  }
  
  /**
   * Setup keyboard handlers using event delegation
   * More efficient than individual listeners on each item
   */
  setupPaletteKeyboardHandlers() {
    const scrollContainer = this.palette.querySelector('.talk-palette-scroll');
    if (!scrollContainer) return;
    
    // Clean up old listener before attaching new one
    this.cleanupPaletteKeyboardHandlers();
    
    // Store reference for proper cleanup
    this._paletteScrollContainer = scrollContainer;
    
    // Single listener for all talk items
    this._paletteKeyHandler = (e) => {
      const talkItem = e.target.closest('.talk-item');
      if (!talkItem) return;
      
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        // Pass element directly - handleTalkClick now handles both events and elements
        this.handleTalkClick(talkItem);
      }
    };
    
    scrollContainer.addEventListener('keydown', this._paletteKeyHandler);
  }
  
  /**
   * Cleanup keyboard handlers
   * Ensures no memory leaks from event listeners
   */
  cleanupPaletteKeyboardHandlers() {
    if (this._paletteKeyHandler && this._paletteScrollContainer) {
      this._paletteScrollContainer.removeEventListener('keydown', this._paletteKeyHandler);
    }
  }

  /**
   * Verifica se deve mostrar palestra baseado em filtros e busca
   * Optimized with pre-computed search term
   * @param {Object} talk - Dados da palestra
   * @returns {boolean}
   */
  shouldShowTalk(talk) {
    // Filtro por trilha
    if (this.currentFilter !== 'all' && talk.track !== this.currentFilter) {
      return false;
    }

    // Filtro por busca - use pre-computed normalized term
    if (this._normalizedSearchTerm) {
      const normalizedTitle = normalizeString(talk.title);
      const normalizedTrack = normalizeString(talk.track);

      return normalizedTitle.includes(this._normalizedSearchTerm) ||
             normalizedTrack.includes(this._normalizedSearchTerm);
    }

    return true;
  }

  /**
   * Manipula clique em palestra
   * Accepts either an Event object or an element directly
   * @param {Event|Object} eventOrElement - Event object or object with target property
   */
  handleTalkClick(eventOrElement) {
    // Support both event objects and synthetic objects from keyboard handler
    const target = eventOrElement.target || eventOrElement;
    const talkElement = target.closest ? target.closest('.talk-item') : target;
    if (!talkElement) return;

    const { cardImage, timeSlot, isWorkshop, talkId } = talkElement.dataset;
    const slotId = 'slot-' + timeSlot.replace(':', '');
    const placeholder = document.getElementById(slotId);

    if (!placeholder) return;

    // Verificar se já existe uma palestra selecionada
    const hasExistingTalk = placeholder.style.backgroundImage &&
                           placeholder.style.backgroundImage !== 'none';

    if (hasExistingTalk) {
      showConfirmModal(
        'Já existe uma palestra selecionada neste horário. Deseja substituí-la?',
        () => this.selectTalk(placeholder, slotId, cardImage, isWorkshop === 'true', timeSlot, talkId)
      );
    } else {
      this.selectTalk(placeholder, slotId, cardImage, isWorkshop === 'true', timeSlot, talkId);
    }
  }

  /**
   * Seleciona uma palestra
   * @param {HTMLElement} placeholder - Elemento do slot
   * @param {string} slotId - ID do slot
   * @param {string} cardImage - Caminho da imagem
   * @param {boolean} isWorkshop - Se é workshop
   * @param {string} timeSlot - Horário
   * @param {string} talkId - ID da palestra
   */
  selectTalk(placeholder, slotId, cardImage, isWorkshop, timeSlot, talkId) {
    const prevSlotId = this.prevSlotMap[slotId];
    const prevPlaceholder = prevSlotId ? document.getElementById(prevSlotId) : null;
    const nextSlotId = this.nextSlotMap[slotId];
    const nextPlaceholder = nextSlotId ? document.getElementById(nextSlotId) : null;

    // Verificar conflito com workshop anterior
    if (prevPlaceholder && prevPlaceholder.classList.contains('workshop-slot')) {
      showToast('Este horário conflita com o workshop anterior!', 'warning');
      return;
    }

    // Resolver conflitos
    if (placeholder.classList.contains('workshop-slot') && !isWorkshop) {
      placeholder.classList.remove('workshop-slot');
      if (nextPlaceholder) {
        nextPlaceholder.classList.remove('workshop-hidden');
        nextPlaceholder.style.display = 'block';
        nextPlaceholder.style.backgroundImage = 'none';
      }
    }

    // Adicionar palestra
    placeholder.style.backgroundImage = `url('${cardImage}')`;
    placeholder.classList.add('slot-fade-in');
    updateSlotIndicator(placeholder, true);

    setTimeout(() => placeholder.classList.remove('slot-fade-in'), CONSTANTS.ANIMATION.DURATION);

    if (isWorkshop) {
      placeholder.classList.add('workshop-slot');
      placeholder.style.zIndex = '10';

      if (nextPlaceholder) {
        nextPlaceholder.classList.add('workshop-hidden');
        nextPlaceholder.style.display = 'none';
        nextPlaceholder.style.backgroundImage = 'none';
      }
    }

    // Salvar seleção
    this.selectedTalks[timeSlot] = talkId;
    this.saveCurrentSchedule();
    this.populatePalette(); // Atualizar destaque

    showToast('Palestra adicionada!', 'success', 1500);
  }

  /**
   * Manipula clique direito no slot
   * @param {Event} event
   */
  handleSlotRightClick(event) {
    event.preventDefault();

    const slot = event.target.closest('.placeholder-slot');
    if (!slot) return;

    const hasImage = slot.style.backgroundImage && slot.style.backgroundImage !== 'none';
    if (!hasImage) return;

    showConfirmModal(
      'Deseja remover esta palestra?',
      () => this.removeTalkFromSlot(slot)
    );
  }

  /**
   * Remove palestra de um slot
   * @param {HTMLElement} slot - Elemento do slot
   */
  removeTalkFromSlot(slot) {
    const slotId = slot.id;
    const timeSlot = slotId.replace('slot-', '').replace(/(\d{2})(\d{2})/, '$1:$2');
    const nextSlotId = this.nextSlotMap[slotId];
    const nextPlaceholder = nextSlotId ? document.getElementById(nextSlotId) : null;

    // Limpar slot
    slot.style.backgroundImage = 'none';
    slot.classList.remove('workshop-slot', 'slot-fade-in');
    slot.style.zIndex = '';
    updateSlotIndicator(slot, false);

    // Restaurar próximo slot se era workshop
    if (nextPlaceholder && nextPlaceholder.classList.contains('workshop-hidden')) {
      nextPlaceholder.classList.remove('workshop-hidden');
      nextPlaceholder.style.display = 'block';
    }

    // Remover seleção
    delete this.selectedTalks[timeSlot];
    this.saveCurrentSchedule();
    this.populatePalette();

    showToast('Palestra removida!', 'info', 1500);
  }

  /**
   * Limpa toda a grade
   * Optimized to batch DOM operations
   */
  handleClearAll() {
    showConfirmModal(
      'Tem certeza que deseja limpar toda a grade?',
      () => {
        const slots = document.querySelectorAll('.placeholder-slot');
        
        // Batch all DOM updates for better performance
        slots.forEach(slot => {
          slot.style.backgroundImage = 'none';
          slot.classList.remove('workshop-slot', 'workshop-hidden');
          slot.style.display = 'block';
          slot.style.zIndex = '';
          updateSlotIndicator(slot, false);
        });

        this.selectedTalks = {};
        this.saveCurrentSchedule();
        this.populatePalette();

        showToast('Grade limpa!', 'success');
      }
    );
  }

  /**
   * Manipula filtro por trilha
   * @param {Event} event
   */
  handleFilter(event) {
    const btn = event.target;
    const filter = btn.dataset.filter;

    this.currentFilter = filter;

    // Atualizar UI dos botões
    this.filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    this.populatePalette();
  }

  /**
   * Manipula busca
   * Pre-computes normalized search term for better performance
   */
  handleSearch() {
    this.searchTerm = this.searchInput.value;
    // Pre-compute normalized search term once for better performance
    this._normalizedSearchTerm = this.searchTerm ? normalizeString(this.searchTerm) : '';
    this.populatePalette();
  }

  /**
   * Salva grade atual no localStorage
   */
  saveCurrentSchedule() {
    const scheduleData = {
      selectedTalks: this.selectedTalks,
      timestamp: new Date().toISOString()
    };
    saveSchedule(scheduleData);
  }

  /**
   * Carrega grade do localStorage
   */
  loadScheduleFromStorage() {
    const data = loadSchedule();
    if (data && data.selectedTalks) {
      this.selectedTalks = data.selectedTalks;
    }
  }

  /**
   * Carrega grade da URL
   */
  loadScheduleFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const scheduleParam = urlParams.get('schedule');

    if (scheduleParam) {
      const data = decodeScheduleData(scheduleParam);
      if (data && data.selectedTalks) {
        this.selectedTalks = data.selectedTalks;
        this.saveCurrentSchedule();
        showToast('Grade carregada do link compartilhado!', 'info');
      }
    }
  }

  /**
   * Restaura grade visual
   * Optimized to use indexed lookup instead of linear search
   */
  restoreSchedule() {
    // Batch DOM reads and writes for better performance
    const updates = [];
    
    Object.entries(this.selectedTalks).forEach(([timeSlot, talkId]) => {
      // Use indexed lookup - O(1) instead of O(n)
      const talkData = this.talkIdToTalkMap.get(talkId);
      if (!talkData) return;
      
      const talk = talkData.talk;
      const slotId = 'slot-' + timeSlot.replace(':', '');
      const placeholder = document.getElementById(slotId);
      if (!placeholder) return;

      const nextSlotId = this.nextSlotMap[slotId];
      const nextPlaceholder = nextSlotId ? document.getElementById(nextSlotId) : null;

      updates.push({ placeholder, talk, nextPlaceholder });
    });
    
    // Apply all DOM updates at once - reduces reflows
    updates.forEach(({ placeholder, talk, nextPlaceholder }) => {
      placeholder.style.backgroundImage = `url('${talk.cardImage}')`;
      updateSlotIndicator(placeholder, true);

      if (talk.isWorkshop) {
        placeholder.classList.add('workshop-slot');
        placeholder.style.zIndex = '10';

        if (nextPlaceholder) {
          nextPlaceholder.classList.add('workshop-hidden');
          nextPlaceholder.style.display = 'none';
        }
      }
    });
  }

  /**
   * Faz download da grade como imagem
   */
  async downloadSchedule() {
    try {
      showLoading(true);
      this.scheduleBuilder.classList.add('capturing');

      const canvas = await html2canvas(this.scheduleBuilder, {
        useCORS: true,
        allowTaint: true,
        scale: CONSTANTS.CAPTURE.SCALE
      });

      const imageData = canvas.toDataURL(CONSTANTS.CAPTURE.FORMAT);
      const link = document.createElement('a');
      link.href = imageData;
      link.download = CONSTANTS.CAPTURE.FILENAME;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      this.scheduleBuilder.classList.remove('capturing');
      showLoading(false);
      showToast('Grade baixada com sucesso!', 'success');
    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      this.scheduleBuilder.classList.remove('capturing');
      showLoading(false);
      showToast('Erro ao gerar imagem. Tente novamente.', 'error');
    }
  }

  /**
   * Compartilha grade como imagem
   */
  async handleShare() {
    try {
      showLoading(true, 'Gerando imagem para compartilhar...');
      this.scheduleBuilder.classList.add('capturing');

      // Gera o canvas da grade
      const canvas = await html2canvas(this.scheduleBuilder, {
        useCORS: true,
        allowTaint: true,
        scale: CONSTANTS.CAPTURE.SCALE
      });

      this.scheduleBuilder.classList.remove('capturing');

      // Converte canvas para blob
      const blob = await new Promise(resolve => {
        canvas.toBlob(resolve, 'image/png');
      });

      const shareText = `🚀 Montei minha grade personalizada do DevFest 2025!

🎯 Vem conferir as palestras que escolhi e monte a sua também!

💡 Não perca as novidades da maior conferência de tecnologia do Google! Junte-se à nossa comunidade e fique por dentro de tudo sobre IA, Cloud, Mobile e muito mais!

👉 Monte sua grade em: https://celta031.github.io/organizador-dev-fest/`;

      // Tenta compartilhar a imagem usando Web Share API
      if (navigator.canShare && navigator.canShare({ files: [new File([blob], 'minha-grade-devfest.png', { type: 'image/png' })] })) {
        const file = new File([blob], 'minha-grade-devfest.png', { type: 'image/png' });

        await navigator.share({
          title: 'Minha Grade Personalizada - DevFest 2025',
          text: shareText,
          files: [file]
        });

        showLoading(false);
        showToast('Imagem compartilhada com sucesso!', 'success');
      } else {
        // Fallback: tenta copiar a imagem para área de transferência
        showLoading(false);
        await this.copyImageToClipboard(blob, shareText);
      }
    } catch (error) {
      console.error('Erro ao compartilhar:', error);
      this.scheduleBuilder.classList.remove('capturing');
      showLoading(false);

      // Se falhar, oferece download
      if (error.name !== 'AbortError') {
        showToast('Não foi possível compartilhar. Baixando a imagem...', 'info');
        this.downloadSchedule();
      }
    }
  }

  /**
   * Copia imagem para área de transferência
   * @param {Blob} blob - Blob da imagem
   * @param {string} shareText - Texto de compartilhamento
   */
  async copyImageToClipboard(blob, shareText) {
    try {
      // Tenta copiar a imagem para a área de transferência
      const clipboardItem = new ClipboardItem({
        'image/png': blob
      });

      await navigator.clipboard.write([clipboardItem]);
      showToast('Imagem copiada! Cole no WhatsApp, Instagram ou onde preferir!', 'success', 3000);

      // Também copia o texto em seguida
      setTimeout(async () => {
        try {
          await navigator.clipboard.writeText(shareText);
          showToast('Texto também copiado! Cole junto com a imagem!', 'info', 3000);
        } catch (err) {
          console.error('Erro ao copiar texto:', err);
        }
      }, 1000);
    } catch (error) {
      console.error('Erro ao copiar imagem:', error);
      // Se não conseguir copiar, baixa a imagem
      showToast('Não foi possível copiar. Baixando a imagem...', 'info');
      this.downloadSchedule();
    }
  }
  async handleExportCalendar() {
    // Verifica se há palestras selecionadas
    if (Object.keys(this.selectedTalks).length === 0) {
      showToast('Sua grade está vazia. Adicione algumas palestras!', 'warning');
      return;
    }
    
    showConfirmModal(
      // A mensagem
      "Você baixará um arquivo <strong>.ics</strong>. <br><br>Este é o formato universal. Após o download, basta clicar no arquivo para importar <strong>toda a sua grade</strong> no seu aplicativo preferido (Google Agenda, Outlook, Calendário Apple, etc.).",
      // O callback de confirmação
      () => {
        this.executeCalendarExport();
      },
      null, // Sem callback de cancelamento
      "Baixar e Importar"
    );
  }

  async executeCalendarExport() {
    showLoading(true);
    try {
      // Passa todos os horários para a função, para que ela possa calcular as durações
      const allTimes = Object.keys(this.talksData);

      // Gera o conteúdo do arquivo .ics
      const icsContent = generateICS(
        this.selectedTalks,
        this.talksData,
        CONSTANTS.CALENDAR.EVENT_DATE,
        allTimes,
        CONSTANTS.CALENDAR.DEFAULT_DURATION_MINUTES
      );

      // Inicia o download
      downloadFile(
        icsContent,
        CONSTANTS.CALENDAR.FILENAME,
        'text/calendar;charset=utf-8' // mime-type correto
      );

      showLoading(false);
      showToast('Calendário exportado! Abra o arquivo para importar.', 'success');

    } catch (error) {
      showLoading(false);
      console.error('Erro ao gerar calendário:', error);
      showToast('Erro ao gerar o calendário. Tente novamente.', 'error');
    }
  }

}

