/**
 * Módulo de geração de calendário (iCalendar .ics)
 * @module calendar
 */

import { normalizeString, createTalkId } from '../utils/utils.js';

const SLOT_END_TIMES = {
  '10:00': '10:50',
  '10:50': '11:40',
  '11:40': '12:30', 
  '13:40': '14:30',
  '14:30': '15:20',
  '15:20': '16:10',
};

/**
 * Formata um objeto Date do JS para o padrão de data/hora do ICS (YYYYMMDDTHHMMSS)
 * @param {Date} date - O objeto Date a ser formatado
 * @returns {string} A data formatada para ICS
 */
function formatDateToICS(date) {
  const pad = (n) => n.toString().padStart(2, '0');
  
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  
  return `${year}${month}${day}T${hours}${minutes}00`;
}

/**
 * Encontra a palestra completa nos dados
 * @param {string} timeSlot - O horário
 * @param {string} talkId - O ID da palestra
 * @param {Object} talksData - Todos os dados das palestras
 * @returns {Object|null} O objeto da palestra ou null
 */
function getTalkDetails(timeSlot, talkId, talksData) {
  if (!talksData[timeSlot]) return null;
  // Use the imported createTalkId for consistency
  return talksData[timeSlot].find(t => createTalkId(timeSlot, t.title) === talkId);
}

/**
 * Calcula o horário de término de uma palestra
 * @param {string} timeSlot - O horário de início
 * @param {Object} talk - O objeto da palestra (para saber se é workshop)
 * @param {string[]} allTimes - Array com todos os horários (ex: ["10:00", "10:50", ...])
 * @param {number} defaultDuration - Duração padrão em minutos
 * @returns {string} O horário de término (HH:MM)
 */
function getEndTime(timeSlot, talk, allTimes) {
  // Se for workshop, a lógica original (pegar 2 slots à frente) está correta
  if (talk && talk.isWorkshop) {
    const currentIndex = allTimes.indexOf(timeSlot);
    const nextIndex = currentIndex + 2; // Workshops ocupam 2 slots

    if (nextIndex < allTimes.length) {
      return allTimes[nextIndex]; 
    }
  }

  // Para palestras normais, usa o mapa de horários
  const endTime = SLOT_END_TIMES[timeSlot];
  if (endTime) {
    return endTime;
  }

  // Fallback (caso o JSON mude e o mapa não seja atualizado)
  // Pega o próximo horário, se existir
  const currentIndex = allTimes.indexOf(timeSlot);
  if (currentIndex + 1 < allTimes.length) {
    return allTimes[currentIndex + 1];
  }

  // Se for o último slot, retorna um fallback ex: 17:00
  return '17:00';
}

/**
 * Gera o conteúdo de texto para um arquivo .ics
 * @param {Object} selectedTalks - O objeto de palestras selecionadas
 * @param {Object} talksData - Todos os dados das palestras
 * @param {string} eventDate - A data do evento (AAAA-MM-DD)
 * @param {string[]} allTimes - Array com todos os horários
 * @returns {string} O conteúdo do arquivo .ics
 */
export function generateICS(selectedTalks, talksData, eventDate, allTimes) {
  const [year, month, day] = eventDate.split('-').map(Number);
  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DevFestBH//Organizador de Grade v1.0//PT',
    'CALSCALE:GREGORIAN',
  ];

  const sortedTimeSlots = Object.keys(selectedTalks).sort();

  for (const timeSlot of sortedTimeSlots) {
    const talkId = selectedTalks[timeSlot];
    const talk = getTalkDetails(timeSlot, talkId, talksData);

    if (!talk) continue;

    const endTime = getEndTime(timeSlot, talk, allTimes);
    const [startHours, startMinutes] = timeSlot.split(':').map(Number);
    const [endHours, endMinutes] = endTime.split(':').map(Number);

    const startDate = new Date(year, month - 1, day, startHours, startMinutes);
    const endDate = new Date(year, month - 1, day, endHours, endMinutes);

    // Gera um UID único para o evento
    const uid = `${timeSlot}-${talk.title.replace(/\s+/g, '')}@devfest.bh`;

    // (LOCATION E DESCRIPTION ATUALIZADOS)
    icsLines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${formatDateToICS(new Date())}`,
      `DTSTART:${formatDateToICS(startDate)}`,
      `DTEND:${formatDateToICS(endDate)}`,
      `SUMMARY:${talk.title}`,
      'LOCATION:Puc Minas - Lourdes - Av. Brasil, 2023',
      `DESCRIPTION:Palestra na Trilha ${talk.track}`,
      'END:VEVENT'
    );
  }

  icsLines.push('END:VCALENDAR');
  return icsLines.join('\r\n'); // OBRIGATÓRIO: para o padrão ICS
}

/**
 * Inicia o download de um arquivo de texto
 * @param {string} content 
 * @param {string} fileName 
 * @param {string} mimeType 
 */
export function downloadFile(content, fileName, mimeType = 'text/plain') {
  const link = document.createElement('a');
  const file = new Blob([content], { type: mimeType });
  
  link.href = URL.createObjectURL(file);
  link.download = fileName;
  
  document.body.appendChild(link);
  link.click();
  
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }, 100);
}