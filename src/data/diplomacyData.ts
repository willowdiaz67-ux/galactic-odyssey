import { DiplomaticMission, DiplomaticPact, FactionId } from '../types/game';

export const DIPLOMATIC_MISSIONS: DiplomaticMission[] = [
  // --- IMPROVE MISSIONS (Миротворческие и созидательные миссии) ---
  {
    id: 'humanitarian_convoy',
    title: 'Гуманитарный конвой в колонии',
    intent: 'improve',
    category: 'aid',
    description: 'Отправка транспортных челноков с гидропонным продовольствием и медицинскими пайками в отдаленные поселения фракции.',
    cost: {
      credits: 120,
      food: 15
    },
    reputationDelta: 12,
    bonusForFaction: {
      factionId: 'miners',
      extraReputation: 8,
      explanation: 'Шахтёры Внешнего Кольца остро страдают от дефицита свежих пайков — восторг рабочих огромен (+20 к репутации)!'
    }
  },
  {
    id: 'tech_exchange',
    title: 'Научно-технический трансфер данных',
    intent: 'improve',
    category: 'tech',
    description: 'Передача криптографических таблиц древних реликвий, карт звездных гравитационных градиентов и расчетов аномалий.',
    cost: {
      credits: 80,
      science: 25
    },
    reputationDelta: 15,
    bonusForFaction: {
      factionId: 'precursors',
      extraReputation: 12,
      explanation: 'Адепты Конкорда Искателей Предтеч восхищены переданными сигнатурами артефактов (+27 к репутации)!'
    }
  },
  {
    id: 'strategic_fleet_supply',
    title: 'Поставка сплавов и топлива на верфи',
    intent: 'improve',
    category: 'military',
    description: 'Прямая поставка титановых сплавов и очищенного гелия-3 для ремонта и заправки пограничных кораблей фракции.',
    cost: {
      alloys: 20,
      fuel: 15
    },
    reputationDelta: 14,
    bonusForFaction: {
      factionId: 'miners',
      extraReputation: 6,
      explanation: 'Горнодобывающий синдикат ценит крепкий металл превыше пустых дипломатических речей (+20 к репутации).'
    }
  },
  {
    id: 'high_embassy_delegation',
    title: 'Открытие постоянного Посольства',
    intent: 'improve',
    category: 'embassy',
    description: 'Торжественное прибытие дипломатического корпуса, финансирование культурного обмена и постоянной резидентуры.',
    cost: {
      credits: 380,
      colonists: 3
    },
    reputationDelta: 28,
    bonusForFaction: {
      factionId: 'terran',
      extraReputation: 10,
      explanation: 'Федерация Земли с почтением относится к высоким нормам классической дипломатии (+38 к репутации)!'
    }
  },
  {
    id: 'anti_piracy_security',
    title: 'Совместное подавление пиратов',
    intent: 'improve',
    category: 'military',
    description: 'Направление охранных эскадр для прикрытия торговых барж фракции от налётов мародёров и корсаров.',
    cost: {
      credits: 150,
      alloys: 15,
      fuel: 12
    },
    reputationDelta: 18,
    rivalReputationChange: {
      rivalFactionId: 'syndicate',
      delta: -12,
      explanation: 'Синдикат Свободных Звёзд потерял несколько каперских кораблей и озлоблен на вас (-12 репутации с Синдикатом).'
    }
  },
  {
    id: 'syndicate_black_market_bribe',
    title: 'Теневой взнос в кассу Синдиката',
    intent: 'improve',
    category: 'bribe',
    description: 'Негласный перевод кредитов и редких материалов в теневой общак корсарских баронов для покупки их расположения.',
    cost: {
      credits: 260,
      alloys: 10
    },
    reputationDelta: 22,
    bonusForFaction: {
      factionId: 'syndicate',
      extraReputation: 8,
      explanation: 'Синдикат Свободных Звёзд ценит чистозвонные кредиты без лишних формальностей (+30 к репутации).'
    },
    rivalReputationChange: {
      rivalFactionId: 'terran',
      delta: -10,
      explanation: 'Контрразведка ОФЗ засекла теневую транзакцию в пользу пиратов (-10 репутации с Федерацией).'
    }
  },

  // --- WORSEN / PRESSURE MISSIONS (Ухудшение отношений, давление, саботаж) ---
  {
    id: 'diplomatic_denunciation',
    title: 'Официальная Нота Протеста',
    intent: 'worsen',
    category: 'denunciation',
    description: 'Публичное обвинение верховного совета фракции в агрессивном поведении, дестабилизации сектора и нарушении границ.',
    cost: {
      credits: 40
    },
    reputationDelta: -16,
    bonusForFaction: undefined
  },
  {
    id: 'trade_sanctions',
    title: 'Торговое Эмбарго и Тарифная Блокада',
    intent: 'worsen',
    category: 'sanction',
    description: 'Запрет на допуск торговых судов фракции в подконтрольные порты и объявление всеобщего бойкота их товаров.',
    cost: {
      credits: 110
    },
    reputationDelta: -25,
    rivalReputationChange: {
      rivalFactionId: 'syndicate',
      delta: 10,
      explanation: 'Конкурирующие торговые дома Синдиката рады вытеснению соперника с рынка (+10 к репутации).'
    }
  },
  {
    id: 'covert_espionage_sabotage',
    title: 'Тайная диверсия и похищение чертежей',
    intent: 'covert',
    category: 'sabotage',
    description: 'Скрытная засылка группы хакеров на закрытую станцию фракции с целью перехвата секретных баз данных и порчи реакторов.',
    cost: {
      credits: 180,
      alloys: 10
    },
    reputationDelta: -32,
    resourceReward: {
      science: 35,
      credits: 120
    },
    rivalReputationChange: {
      rivalFactionId: 'syndicate',
      delta: 8,
      explanation: 'Теневые операторы Синдиката оценили дерзкую операцию против их врагов (+8 репутации).'
    }
  },
  {
    id: 'border_provocation',
    title: 'Вооружённая пограничная провокация',
    intent: 'worsen',
    category: 'provocation',
    description: 'Демонстративный пролёт боевого ударного крейсера с отключенным маяком и взятием станций фракции на орудийный прицел.',
    cost: {
      fuel: 22
    },
    reputationDelta: -45,
    bonusForFaction: undefined
  }
];

export const INITIAL_DIPLOMATIC_PACTS: DiplomaticPact[] = [
  // Terran Pacts
  {
    id: 'pact_terran_non_aggression',
    factionId: 'terran',
    type: 'non_aggression',
    title: 'Акт о Нейтралитете ОФЗ',
    minReputation: 15,
    cost: { credits: 180 },
    description: 'Гарантия ненападения и взаимного признания суверенитета в звездных системах ОФЗ.',
    benefit: 'Таможенные патрули ОФЗ реже досматривают груз и не открывают предупредительный огонь.',
    active: false
  },
  {
    id: 'pact_terran_trade_accord',
    factionId: 'terran',
    type: 'trade_accord',
    title: 'Договор Преференциальной Торговли',
    minReputation: 40,
    cost: { credits: 350, alloys: 20 },
    description: 'Снижение пошлин и доступ к закрытым торговым реестрам метрополии.',
    benefit: '+15% к прибыли при продаже товаров на станциях ОФЗ и скидка 10% на все покупки.',
    active: false
  },
  {
    id: 'pact_terran_alliance',
    factionId: 'terran',
    type: 'defense_treaty',
    title: 'Военный Союз с Земным Адмиралтейством',
    minReputation: 70,
    cost: { credits: 600, science: 30, alloys: 30 },
    description: 'Полный военный пакт взаимной помощи и поставки бронепакетов.',
    benefit: 'Срочный ремонт корпуса на базах ОФЗ и эскорт военных патрулей при атаке пиратов.',
    active: false
  },

  // Syndicate Pacts
  {
    id: 'pact_syndicate_non_aggression',
    factionId: 'syndicate',
    type: 'non_aggression',
    title: 'Корсарский Знак Безопасности',
    minReputation: 15,
    cost: { credits: 200 },
    description: 'Официальный амулет Синдиката, опознаваемый всеми пиратскими перехватчиками.',
    benefit: 'Пиратские корсары не устраивают засад на ваше судно при перевозке ценных грузов.',
    active: false
  },
  {
    id: 'pact_syndicate_trade_accord',
    factionId: 'syndicate',
    type: 'trade_accord',
    title: 'Доступ к Теневому Консорциуму',
    minReputation: 40,
    cost: { credits: 380, food: 15 },
    description: 'Включение корабля в теневую сеть контрабанды без посреднических наценок.',
    benefit: 'Снижение штрафов за контрабанду на 50% и доступ к эксклюзивным товарам чёрного рынка.',
    active: false
  },
  {
    id: 'pact_syndicate_alliance',
    factionId: 'syndicate',
    type: 'defense_treaty',
    title: 'Братство Свободных Каперов',
    minReputation: 70,
    cost: { credits: 700, alloys: 25, antimatter: 3 },
    description: 'Признание статуса Почётного Корсара в синдикате.',
    benefit: '+20% к уклонению корабля в секторах Синдиката и выкуп пленных со скидкой 50%.',
    active: false
  },

  // Precursors Pacts
  {
    id: 'pact_precursors_non_aggression',
    factionId: 'precursors',
    type: 'non_aggression',
    title: 'Обет Исследовательского Мира',
    minReputation: 15,
    cost: { credits: 160, science: 10 },
    description: 'Признание права исследователя на изучение древних реликвий.',
    benefit: 'Древние сторожевые дроны Предтеч не проявляют агрессии при приближении.',
    active: false
  },
  {
    id: 'pact_precursors_trade_accord',
    factionId: 'precursors',
    type: 'science_alliance',
    title: 'Конкорд Обмена Древними Знаниями',
    minReputation: 40,
    cost: { credits: 300, science: 35 },
    description: 'Доступ к квантовым архивам и библиотекам Зодчих.',
    benefit: '+25% к получаемым очкам Науки при любых сканированиях и исследованиях.',
    active: false
  },
  {
    id: 'pact_precursors_alliance',
    factionId: 'precursors',
    type: 'defense_treaty',
    title: 'Абсолютный Симбиоз с Архитекторами',
    minReputation: 70,
    cost: { credits: 650, science: 50, antimatter: 5 },
    description: 'Интеграция древних энергоматриц прямо в бортовой компьютер корабля.',
    benefit: '+30 к максимальной энергоёмкости щитов корабля и ускоренное восстановление полей.',
    active: false
  },

  // Miners Pacts
  {
    id: 'pact_miners_non_aggression',
    factionId: 'miners',
    type: 'non_aggression',
    title: 'Хартия Шахтёрского Спокойствия',
    minReputation: 15,
    cost: { credits: 150, fuel: 10 },
    description: 'Взаимное соглашение о ненападении в поясах астероидов и на буровых вышках.',
    benefit: 'Шахтёрские буровые платформы делятся излишками топлива бесплатно при посадке.',
    active: false
  },
  {
    id: 'pact_miners_trade_accord',
    factionId: 'miners',
    type: 'trade_accord',
    title: 'Сырьевой Профсоюзный Контракт',
    minReputation: 40,
    cost: { credits: 320, food: 20 },
    description: 'Прямые закупки титановых сплавов и гелия-3 по себестоимости добычи.',
    benefit: 'Скидка 30% на закупку сплавов и топлива на всех шахтёрских базах.',
    active: false
  },
  {
    id: 'pact_miners_alliance',
    factionId: 'miners',
    type: 'defense_treaty',
    title: 'Монолит Внешнего Кольца',
    minReputation: 70,
    cost: { credits: 550, alloys: 45, fuel: 25 },
    description: 'Титул Почётного Бригадира и право вызова тяжёлых бронированных буксиров.',
    benefit: '+35 к максимальной прочности обшивки корабля за счёт титанового усиления.',
    active: false
  }
];

export function getReputationStatus(rep: number): {
  label: string;
  colorClass: string;
  badgeBg: string;
  description: string;
} {
  if (rep >= 60) {
    return {
      label: 'Верные Союзники',
      colorClass: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300',
      description: 'Максимальный уровень доверия. Доступны высшие военные и торговые пакты.'
    };
  }
  if (rep >= 20) {
    return {
      label: 'Дружелюбие',
      colorClass: 'text-cyan-400',
      badgeBg: 'bg-cyan-950/80 border-cyan-500/50 text-cyan-300',
      description: 'Фракция благосклонна к вашей экспедиции. Готова к торговым договорам.'
    };
  }
  if (rep >= -19) {
    return {
      label: 'Нейтралитет',
      colorClass: 'text-slate-300',
      badgeBg: 'bg-slate-900 border-slate-700 text-slate-300',
      description: 'Формальные холодные отношения. Стандартные рыночные расценки.'
    };
  }
  if (rep >= -59) {
    return {
      label: 'Настороженность',
      colorClass: 'text-amber-400',
      badgeBg: 'bg-amber-950/80 border-amber-600/50 text-amber-300',
      description: 'Отношения накалены. Патрули фракции подозрительно сканируют корабль.'
    };
  }
  return {
    label: 'Открытая Вражда',
    colorClass: 'text-rose-400',
    badgeBg: 'bg-rose-950/80 border-rose-600/50 text-rose-300',
    description: 'Состояние горячего конфликта. Боевые корабли фракции могут атаковать без предупреждения.'
  };
}
