/**
 * Gerenciamento de LocalStorage
 * @module storage
 */

import { CONSTANTS } from '../config/constants.js';

/**
 * Salva a grade no localStorage
 * @param {Object} scheduleData - Dados da grade a serem salvos
 */
export function saveSchedule(scheduleData) {
  try {
    localStorage.setItem(
      CONSTANTS.STORAGE_KEYS.SCHEDULE,
      JSON.stringify(scheduleData)
    );
  } catch (error) {
    console.error('Erro ao salvar grade no localStorage:', error);
    showToast('Erro ao salvar grade. Verifique o espaço disponível.', 'error');
  }
}

/**
 * Carrega a grade do localStorage
 * @returns {Object|null} Dados da grade ou null se não existir
 */
export function loadSchedule() {
  try {
    const data = localStorage.getItem(CONSTANTS.STORAGE_KEYS.SCHEDULE);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erro ao carregar grade do localStorage:', error);
    return null;
  }
}

/**
 * Limpa a grade do localStorage
 */
export function clearSchedule() {
  try {
    localStorage.removeItem(CONSTANTS.STORAGE_KEYS.SCHEDULE);
  } catch (error) {
    console.error('Erro ao limpar grade do localStorage:', error);
  }
}

/**
 * Salva preferências do usuário
 * @param {Object} preferences - Preferências a serem salvas
 */
export function savePreferences(preferences) {
  try {
    localStorage.setItem(
      CONSTANTS.STORAGE_KEYS.PREFERENCES,
      JSON.stringify(preferences)
    );
  } catch (error) {
    console.error('Erro ao salvar preferências:', error);
  }
}

/**
 * Carrega preferências do usuário
 * @returns {Object} Preferências do usuário
 */
export function loadPreferences() {
  try {
    const data = localStorage.getItem(CONSTANTS.STORAGE_KEYS.PREFERENCES);
    return data ? JSON.parse(data) : { theme: 'light' };
  } catch (error) {
    console.error('Erro ao carregar preferências:', error);
    return { theme: 'light' };
  }
}

/**
 * Mostra mensagem toast (será implementada no módulo UI)
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo da mensagem (success, error, info)
 */
function showToast(message, type = 'info') {
  // Esta função será implementada no módulo ui.js
  console.log(`[${type.toUpperCase()}] ${message}`);
}
