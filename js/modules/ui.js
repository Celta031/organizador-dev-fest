/**
 * Módulo de interface do usuário
 * @module ui
 */

import { createElement } from '../utils/utils.js';

/**
 * Mostra mensagem toast
 * @param {string} message - Mensagem a ser exibida
 * @param {string} type - Tipo da mensagem (success, error, info, warning)
 * @param {number} duration - Duração em ms
 */
export function showToast(message, type = 'info', duration = 3000) {
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = createElement('div', {
    className: `toast toast-${type}`,
    role: 'alert',
    'aria-live': 'polite'
  }, message);

  document.body.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('toast-show'), 10);

  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Mostra spinner de loading
 * @param {boolean} show - Se deve mostrar ou esconder
 * @param {string} message - Mensagem opcional de loading
 */
export function showLoading(show = true, message = 'Carregando') {
  let spinner = document.getElementById('loading-spinner');

  if (show) {
    if (!spinner) {
      spinner = createElement('div', {
        id: 'loading-spinner',
        className: 'loading-spinner',
        role: 'status',
        'aria-label': message
      }, `<div class="spinner"></div><p class="loading-message">${message}</p>`);
      document.body.appendChild(spinner);
    } else {
      // Atualiza mensagem se já existe
      const messageEl = spinner.querySelector('.loading-message');
      if (messageEl) {
        messageEl.textContent = message;
      }
      spinner.setAttribute('aria-label', message);
    }
    spinner.classList.add('show');
  } else {
    if (spinner) {
      spinner.classList.remove('show');
      setTimeout(() => spinner.remove(), 300);
    }
  }
}

/**
 * Mostra modal de confirmação
 * @param {string} message - Mensagem a ser exibida
 * @param {Function} onConfirm - Callback ao confirmar
 * @param {Function} onCancel - Callback ao cancelar
 * @param {string} [confirmText='Confirmar']
 */
export function showConfirmModal(message, onConfirm, onCancel = null, confirmText = 'Confirmar') {
  const modal = createElement('div', {
    className: 'modal-overlay',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': 'modal-title'
  });

  const modalContent = createElement('div', { className: 'modal-content' });

  const title = createElement('h3', {
    id: 'modal-title',
    className: 'modal-title'
  }, 'Confirmação');

  const messageEl = createElement('p', {
    className: 'modal-message'
  }, message);

  const buttonsContainer = createElement('div', {
    className: 'modal-buttons'
  });

  const cancelBtn = createElement('button', {
    className: 'btn btn-secondary',
    type: 'button'
  }, 'Cancelar');

  const confirmBtn = createElement('button', {
    className: 'btn btn-primary',
    type: 'button'
  }, confirmText);

  cancelBtn.addEventListener('click', () => {
    modal.remove();
    if (onCancel) onCancel();
  });

  confirmBtn.addEventListener('click', () => {
    modal.remove();
    onConfirm();
  });

  buttonsContainer.appendChild(cancelBtn);
  buttonsContainer.appendChild(confirmBtn);

  modalContent.appendChild(title);
  modalContent.appendChild(messageEl);
  modalContent.appendChild(buttonsContainer);
  modal.appendChild(modalContent);

  document.body.appendChild(modal);

  // Focus no botão de confirmar
  setTimeout(() => confirmBtn.focus(), 10);

  // Fechar com ESC
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      if (onCancel) onCancel();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
}


/**
 * Adiciona indicador visual de slot ocupado
 * @param {HTMLElement} slot - Elemento do slot
 * @param {boolean} occupied - Se está ocupado
 */
export function updateSlotIndicator(slot, occupied) {
  if (occupied) {
    slot.classList.add('slot-occupied');
    slot.setAttribute('aria-label', 'Slot ocupado - Clique com botão direito para remover');
  } else {
    slot.classList.remove('slot-occupied');
    slot.setAttribute('aria-label', 'Slot vazio - Clique em uma palestra para adicionar');
  }
}
