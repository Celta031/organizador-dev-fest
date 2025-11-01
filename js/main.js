/**
 * Arquivo principal da aplicação
 * Importa e inicializa o DevFestScheduler
 * @module main
 */

import { DevFestScheduler } from './modules/app.js';

// Inicializa a aplicação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  new DevFestScheduler();
});
