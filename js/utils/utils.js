/**
 * Funções utilitárias
 * @module utils
 */

/**
 * Debounce function para otimizar performance
 * @param {Function} func - Função a ser executada
 * @param {number} wait - Tempo de espera em ms
 * @returns {Function} Função com debounce aplicado
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Normaliza string para busca (remove acentos e converte para lowercase)
 * @param {string} str - String a ser normalizada
 * @returns {string} String normalizada
 */
export function normalizeString(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Valida se um objeto de palestra tem todos os campos necessários
 * @param {Object} talk - Objeto da palestra
 * @returns {boolean} True se válido
 */
export function validateTalk(talk) {
  return (
    talk &&
    typeof talk.title === 'string' &&
    typeof talk.track === 'string' &&
    typeof talk.cardImage === 'string'
  );
}

/**
 * Cria um ID único para uma palestra
 * @param {string} timeSlot - Horário da palestra
 * @param {string} title - Título da palestra
 * @returns {string} ID único
 */
export function createTalkId(timeSlot, title) {
  return `${timeSlot}-${normalizeString(title).replace(/\s+/g, '-')}`;
}

/**
 * Codifica dados para URL
 * @param {Object} data - Dados a serem codificados
 * @returns {string} String codificada
 */
export function encodeScheduleData(data) {
  try {
    return btoa(JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao codificar dados:', error);
    return '';
  }
}

/**
 * Decodifica dados da URL
 * @param {string} encoded - String codificada
 * @returns {Object|null} Dados decodificados ou null
 */
export function decodeScheduleData(encoded) {
  try {
    return JSON.parse(atob(encoded));
  } catch (error) {
    console.error('Erro ao decodificar dados:', error);
    return null;
  }
}

/**
 * Gera URL compartilhável
 * @param {Object} scheduleData - Dados da grade
 * @param {string} baseUrl - URL base
 * @returns {string} URL compartilhável
 */
export function generateShareUrl(scheduleData, baseUrl) {
  const encoded = encodeScheduleData(scheduleData);
  return `${baseUrl}?schedule=${encoded}`;
}

/**
 * Cria elemento com atributos
 * @param {string} tag - Tag do elemento
 * @param {Object} attributes - Atributos do elemento
 * @param {string} content - Conteúdo do elemento
 * @returns {HTMLElement} Elemento criado
 */
export function createElement(tag, attributes = {}, content = '') {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else {
      element.setAttribute(key, value);
    }
  });
  if (content) {
    element.innerHTML = content;
  }
  return element;
}
