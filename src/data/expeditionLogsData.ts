import { ExpeditionLogEntry, ExpeditionActionType } from '../types/game';

export const INITIAL_EXPEDITION_LOGS: ExpeditionLogEntry[] = [
  {
    id: 'exp_log_10',
    type: 'trade',
    title: 'Закупка квантовых чипов на станции «Элизиум»',
    description: 'Оформлена крупная сделка по модернизации вычислительных матриц флагмана для прыжков через глубокий космос. Торговый терминал ОФЗ подтвердил клиринг.',
    timestamp: 'Зв. Дата 2184.2',
    stardate: 2184.2,
    systemName: 'Солнце',
    sectorName: 'Сектор Альфа (Ядро)',
    badge: 'Крупная закупка',
    metrics: {
      credits: -440,
      science: 15,
      outcome: 'investment'
    }
  },
  {
    id: 'exp_log_9',
    type: 'colony',
    title: 'Развёртывание ретранслятора связи на Титане',
    description: 'Завершена установка субпространственного ретранслятора на луне Сатурна. Создан постоянный квантовый узел связи экспедиции с метрополией.',
    timestamp: 'Зв. Дата 2184.1',
    stardate: 2184.1,
    systemName: 'Солнце',
    sectorName: 'Сектор Альфа (Ядро)',
    badge: 'Инфраструктура',
    metrics: {
      alloys: -25,
      science: 20
    }
  },
  {
    id: 'exp_log_8',
    type: 'docking',
    title: 'Выход на внешнюю орбиту и калибровка гипердвигателя',
    description: 'Флагман завершил стыковочные тесты у внешних навигационных буёв Нептуна. Готовность субсветовых приводов и варп-ядра признана штатной.',
    timestamp: 'Зв. Дата 2184.0',
    stardate: 2184.0,
    systemName: 'Солнце',
    sectorName: 'Сектор Альфа (Ядро)',
    badge: 'Штатная стыковка'
  },
  {
    id: 'exp_log_7',
    type: 'combat',
    title: 'Отражение налёта пиратского катера в поясе Койпера',
    description: 'Попытка перехвата исследовательского конвоя корсарами Синдиката успешно пресечена. Щиты флагмана выдержали плазменный залп, катер обращён в бегство.',
    timestamp: 'Зв. Дата 2183.9',
    stardate: 2183.9,
    systemName: 'Солнце',
    sectorName: 'Сектор Альфа (Ядро)',
    badge: 'Победа в бою',
    metrics: {
      credits: 220,
      alloys: 15,
      xp: 45,
      outcome: 'victory'
    }
  },
  {
    id: 'exp_log_6',
    type: 'trade',
    title: 'Поставка партии медицинских стимуляторов на Цереру',
    description: 'Успешная реализация партии био-регенераторов для шахтёрских бригад астероидной станции. Получена солидная надбавка за срочность доставки.',
    timestamp: 'Зв. Дата 2183.8',
    stardate: 2183.8,
    systemName: 'Солнце',
    sectorName: 'Сектор Альфа (Ядро)',
    badge: 'Высокая прибыль',
    metrics: {
      credits: 380,
      outcome: 'profit'
    }
  },
  {
    id: 'exp_log_5',
    type: 'docking',
    title: 'Швартовка у орбитальной верфи Ганимеда',
    description: 'Корабль пришвартован к техническому доку №4 для заправки криогенных резервуаров изотопом Гелий-3 и финальной юстировки орудийных турелей.',
    timestamp: 'Зв. Дата 2183.7',
    stardate: 2183.7,
    systemName: 'Солнце',
    sectorName: 'Сектор Альфа (Ядро)',
    badge: 'Дозаправка'
  },
  {
    id: 'exp_log_4',
    type: 'colony',
    title: 'Открытие первого научного купола на Марсе',
    description: 'Торжественное открытие купольного сектора «Элизий-1». Размещена группа из 30 учёных и инженеров для разработки глубоких литосферных скважин.',
    timestamp: 'Зв. Дата 2183.6',
    stardate: 2183.6,
    systemName: 'Солнце',
    sectorName: 'Сектор Альфа (Ядро)',
    badge: 'Новая колония',
    metrics: {
      colonists: 30,
      alloys: -40,
      science: 25
    }
  },
  {
    id: 'exp_log_3',
    type: 'combat',
    title: 'Тактические стрельбы и перехват мишени на орбите Фобоса',
    description: 'Учебный боевой контакт с беспилотным боевым дроном. Отработан манёвр уклонения и синхронный залп импульсных лазеров с поражением ядра цели.',
    timestamp: 'Зв. Дата 2183.5',
    stardate: 2183.5,
    systemName: 'Солнце',
    sectorName: 'Сектор Альфа (Ядро)',
    badge: 'Тактический бой',
    metrics: {
      xp: 30,
      outcome: 'victory'
    }
  },
  {
    id: 'exp_log_2',
    type: 'trade',
    title: 'Комплектование стартового грузового отсека экспедиции',
    description: 'Закуплены титановые сплавы и аварийный запас пайков в порту Лунной Базы Альфа по специальной субсидии Объединённой Федерации Земли.',
    timestamp: 'Зв. Дата 2183.4',
    stardate: 2183.4,
    systemName: 'Солнце',
    sectorName: 'Сектор Альфа (Ядро)',
    badge: 'Снабжение флота',
    metrics: {
      credits: -320,
      alloys: 50
    }
  },
  {
    id: 'exp_log_1',
    type: 'docking',
    title: 'Церемония отбытия флагмана со станции «Земля-Орбитальная»',
    description: 'Торжественный отход от главного шлюза Федерации. Подписан приказ о начале дальней исследовательской и колонизационной экспедиции в звёздные сектора.',
    timestamp: 'Зв. Дата 2183.0',
    stardate: 2183.0,
    systemName: 'Солнце',
    sectorName: 'Сектор Альфа (Ядро)',
    badge: 'Старт экспедиции'
  }
];

export function getActionTypeColor(type: ExpeditionActionType): {
  bg: string;
  border: string;
  text: string;
  badgeBg: string;
  glow: string;
} {
  switch (type) {
    case 'docking':
      return {
        bg: 'bg-cyan-950/40 hover:bg-cyan-950/70',
        border: 'border-cyan-800/60',
        text: 'text-cyan-300',
        badgeBg: 'bg-cyan-950 text-cyan-300 border-cyan-700',
        glow: 'shadow-cyan-950/50'
      };
    case 'combat':
      return {
        bg: 'bg-rose-950/40 hover:bg-rose-950/70',
        border: 'border-rose-800/60',
        text: 'text-rose-300',
        badgeBg: 'bg-rose-950 text-rose-300 border-rose-700',
        glow: 'shadow-rose-950/50'
      };
    case 'colony':
      return {
        bg: 'bg-emerald-950/40 hover:bg-emerald-950/70',
        border: 'border-emerald-800/60',
        text: 'text-emerald-300',
        badgeBg: 'bg-emerald-950 text-emerald-300 border-emerald-700',
        glow: 'shadow-emerald-950/50'
      };
    case 'trade':
      return {
        bg: 'bg-amber-950/40 hover:bg-amber-950/70',
        border: 'border-amber-800/60',
        text: 'text-amber-300',
        badgeBg: 'bg-amber-950 text-amber-300 border-amber-700',
        glow: 'shadow-amber-950/50'
      };
    case 'anomaly':
      return {
        bg: 'bg-purple-950/40 hover:bg-purple-950/70',
        border: 'border-purple-800/60',
        text: 'text-purple-300',
        badgeBg: 'bg-purple-950 text-purple-300 border-purple-700',
        glow: 'shadow-purple-950/50'
      };
  }
}

export function getActionTypeLabel(type: ExpeditionActionType): string {
  switch (type) {
    case 'docking':
      return 'Стыковка';
    case 'combat':
      return 'Битва';
    case 'colony':
      return 'Колония';
    case 'trade':
      return 'Торговля';
    case 'anomaly':
      return 'Аномалия';
  }
}
