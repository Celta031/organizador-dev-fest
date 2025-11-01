/**
 * Constantes da aplicação
 * @module constants
 */

export const CONSTANTS = {
  // Dimensões do slot
  SLOT: {
    WIDTH: 317,
    HEIGHT: 64,
    WORKSHOP_HEIGHT: 130,
    LEFT_POSITION: 24
  },

  // Posições dos slots
  SLOT_POSITIONS: {
    '1000': 120,
    '1050': 190,
    '1140': 260,
    '1340': 330,
    '1430': 400,
    '1520': 470
  },

  // LocalStorage keys
  STORAGE_KEYS: {
    SCHEDULE: 'devfest_schedule',
    PREFERENCES: 'devfest_preferences'
  },

  // Trilhas disponíveis
  TRACKS: ['Iniciante', 'Avançado', 'Carreiras', 'Workshop', 'WTM', 'Onfly'],

  // Configurações de captura
  CAPTURE: {
    SCALE: 3,
    FORMAT: 'image/png',
    FILENAME: 'minha-grade-devfest-bh.png'
  },

  // Animações
  ANIMATION: {
    DURATION: 300,
    DEBOUNCE_DELAY: 300
  },

  // URLs base
  URLS: {
    DATA: './data/talks.json',
    SHARE_BASE: window.location.origin + window.location.pathname
  }
};
