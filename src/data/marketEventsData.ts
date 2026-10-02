import { 
  StarSystem, 
  MarketItem, 
  GalacticNewsItem, 
  SystemEconomyType, 
  MarketEvent, 
  MarketEventType,
  ComprehensivePriceInfo 
} from '../types/game';

export interface SystemEconomyDefinition {
  economyType: SystemEconomyType;
  name: string;
  shortTag: string;
  badgeColor: string;
  iconName: string;
  description: string;
  tradingAdvice: string;
  categoryModifiers: Partial<Record<MarketItem['category'], {
    multiplier: number;
    demandLevel: 'critical_high' | 'high' | 'normal' | 'low';
    supplyLevel: 'critical_deficit' | 'low' | 'normal' | 'surplus';
    reason: string;
  }>>;
  itemSpecificModifiers?: Record<string, {
    multiplier: number;
    demandLevel: 'critical_high' | 'high' | 'normal' | 'low';
    supplyLevel: 'critical_deficit' | 'low' | 'normal' | 'surplus';
    reason: string;
  }>;
}

export const SYSTEM_ECONOMY_PROFILES: Record<string, SystemEconomyDefinition> = {
  // Sol (Earth / Metropolis)
  sol: {
    economyType: 'agricultural',
    name: 'Аграрно-Торговая Метрополия',
    shortTag: 'Метрополия / Агросфера',
    badgeColor: 'border-emerald-600/70 bg-emerald-950/70 text-emerald-300',
    iconName: 'Sprout',
    description: 'Колыбель человечества. Развитые гидропонные комплексы Земли и Марса производят колоссальные объёмы продовольствия. Высокий спрос на сырьевые сплавы и квантовые процессоры.',
    tradingAdvice: 'Выгодно закупать дешёвую еду для экспорта на промышленные планеты; привозите сюда сплавы и квантовые чипы.',
    categoryModifiers: {
      food: {
        multiplier: 0.65,
        demandLevel: 'low',
        supplyLevel: 'surplus',
        reason: 'Гигантские агрокаскады Земли и Марса — дешевейшая еда в секторе (-35%)'
      },
      mineral: {
        multiplier: 1.25,
        demandLevel: 'high',
        supplyLevel: 'low',
        reason: 'Постоянная модернизация орбитальных верфей требует больших партий сплавов (+25%)'
      },
      tech: {
        multiplier: 1.20,
        demandLevel: 'high',
        supplyLevel: 'normal',
        reason: 'Высокий спрос мегаполисов на вычислительные процессоры (+20%)'
      },
      precursor: {
        multiplier: 1.30,
        demandLevel: 'high',
        supplyLevel: 'critical_deficit',
        reason: 'Музеи и лаборатории Верховного Командования скупают реликвии Предтеч (+30%)'
      }
    }
  },

  // Sirius (Heavy Foundry / Industrial Citadel)
  sirius: {
    economyType: 'industrial',
    name: 'Тяжёлая Литейная Индустрия',
    shortTag: 'Индустриальная Цитадель',
    badgeColor: 'border-amber-600/70 bg-amber-950/70 text-amber-300',
    iconName: 'Factory',
    description: 'Цитадель тяжёлого машиностроения и плавильных заводов Гефеста. Сверхпроизводство титановых сплавов и топлива He-3, но острый дефицит свежей провизии и био-стимуляторов.',
    tradingAdvice: 'Продавайте здесь гидропонные пайки и медикаменты с максимальной наценкой; скупайте дешёвые титановые сплавы оптом.',
    categoryModifiers: {
      mineral: {
        multiplier: 0.70,
        demandLevel: 'low',
        supplyLevel: 'surplus',
        reason: 'Плавильные комплексы Гефеста перенасыщены титановыми плитами (-30% закупка)'
      },
      food: {
        multiplier: 1.50,
        demandLevel: 'critical_high',
        supplyLevel: 'critical_deficit',
        reason: 'Индустриальная планета лишена биосферы — шахтёрам критически нужна еда (+50%)'
      },
      medical: {
        multiplier: 1.30,
        demandLevel: 'high',
        supplyLevel: 'low',
        reason: 'Тяжёлые металлургические условия труда требуют постоянного притока био-гелей (+30%)'
      }
    },
    itemSpecificModifiers: {
      fuel_cell: {
        multiplier: 0.80,
        demandLevel: 'low',
        supplyLevel: 'surplus',
        reason: 'Термоядерные конденсаторы литейных заводов сбрасывают избыток He-3 (-20%)'
      }
    }
  },

  // Kepler-452 (High-Tech & Cybernetics Hub)
  kepler: {
    economyType: 'hightech',
    name: 'Кибернетический Технополис',
    shortTag: 'Высокие Технологии',
    badgeColor: 'border-cyan-600/70 bg-cyan-950/70 text-cyan-300',
    iconName: 'Cpu',
    description: 'Центр передовых квантовых разработок и робототехники ОФЗ. Массовое производство микрочипов и нано-стимуляторов. Постоянная потребность в чистых сплавах и топливе для генераторов.',
    tradingAdvice: 'Скупайте здесь дешёвые квантовые процессоры и био-стимуляторы; привозите сплавы и топливные ячейки.',
    categoryModifiers: {
      tech: {
        multiplier: 0.75,
        demandLevel: 'low',
        supplyLevel: 'surplus',
        reason: 'Сверхплотное производство квантовых чипов в дата-центрах Кеплера (-25%)'
      },
      medical: {
        multiplier: 0.85,
        demandLevel: 'normal',
        supplyLevel: 'surplus',
        reason: 'Клинические лаборатории поставляют свежие био-регенераторы со скидкой (-15%)'
      },
      mineral: {
        multiplier: 1.35,
        demandLevel: 'high',
        supplyLevel: 'low',
        reason: 'Сверхчистый титан необходим для шасси дронов и герметичных серверов (+35%)'
      }
    },
    itemSpecificModifiers: {
      fuel_cell: {
        multiplier: 1.30,
        demandLevel: 'high',
        supplyLevel: 'low',
        reason: 'Квантовые суперкомпьютеры потребляют гигаватты термоядерной энергии (+30%)'
      }
    }
  },

  // Proxima Centauri (Frontier Mining Outpost)
  proxima: {
    economyType: 'extraction',
    name: 'Фронтирный Горный Рубеж',
    shortTag: 'Добывающий Форпост',
    badgeColor: 'border-emerald-700/70 bg-emerald-950/70 text-emerald-300',
    iconName: 'Pickaxe',
    description: 'Глубокий форпост на границе исследованного космоса. Добыча редких руд из астероидов. Зависит от внешних поставок провизии, медикаментов и навигационных процессоров.',
    tradingAdvice: 'Привозите гидропонные пайки и квантовые процессоры; увозите дешёвое сырьё и гелий-3.',
    categoryModifiers: {
      mineral: {
        multiplier: 0.80,
        demandLevel: 'low',
        supplyLevel: 'surplus',
        reason: 'Прямая отгрузка руды с карьеров станции «Авангард» (-20%)'
      },
      food: {
        multiplier: 1.40,
        demandLevel: 'high',
        supplyLevel: 'critical_deficit',
        reason: 'Удалённый гарнизон лишён посевных площадей и остро нуждается в провизии (+40%)'
      },
      medical: {
        multiplier: 1.25,
        demandLevel: 'high',
        supplyLevel: 'low',
        reason: 'Травмы при шахтных взрывах истощают медицинские склады (+25%)'
      },
      tech: {
        multiplier: 1.30,
        demandLevel: 'high',
        supplyLevel: 'low',
        reason: 'Дефицит навигационных процессоров для буровых челноков (+30%)'
      }
    },
    itemSpecificModifiers: {
      fuel_cell: {
        multiplier: 0.85,
        demandLevel: 'low',
        supplyLevel: 'surplus',
        reason: 'Сбор изотопов в пылевом хвосте Проксимы (-15%)'
      }
    }
  },

  // Veil Nebula (Pirate Haven / Tortuga-4)
  veil: {
    economyType: 'outlaw',
    name: 'Теневая Гавань Синдиката',
    shortTag: 'Чёрный Рынок',
    badgeColor: 'border-rose-600/70 bg-rose-950/70 text-rose-300',
    iconName: 'Skull',
    description: 'Логово вольных корсаров, пиратов и скупщиков краденого. Избыток нелегальной контрабанды, психостимуляторов и тёмной плазмы. Легальные припасы в жестоком дефиците.',
    tradingAdvice: 'Скупайте нелегальную контрабанду для контрабандных рейдов в Метрополию; привозите сюда медикаменты и пайки.',
    categoryModifiers: {
      contraband: {
        multiplier: 0.75,
        demandLevel: 'low',
        supplyLevel: 'surplus',
        reason: 'Склады Тортуги забиты трофеями корсарских набегов (-25% на чёрном рынке)'
      },
      medical: {
        multiplier: 1.45,
        demandLevel: 'critical_high',
        supplyLevel: 'critical_deficit',
        reason: 'После абордажей раненым пиратам критически нужны био-регенераторы (+45%)'
      },
      food: {
        multiplier: 1.35,
        demandLevel: 'high',
        supplyLevel: 'low',
        reason: 'Блокада патрулей ОФЗ затрудняет доставку свежего продовольствия (+35%)'
      },
      tech: {
        multiplier: 1.30,
        demandLevel: 'high',
        supplyLevel: 'low',
        reason: 'Корсары скупают взломанные кибер-чипы для систем маскировки (+30%)'
      }
    }
  },

  // Rigel Prime (Archaeo-Science / Precursor Studies)
  rigel: {
    economyType: 'relic_research',
    name: 'Археологический Кластер Зодчих',
    shortTag: 'Штаб Архео-Науки',
    badgeColor: 'border-purple-600/70 bg-purple-950/70 text-purple-300',
    iconName: 'Sparkles',
    description: 'Экспедиционные комплексы Конкорда вокруг древнего Монолита Предтеч. Академики платят астрономические суммы за осколки артефактов и квантовые процессоры.',
    tradingAdvice: 'Продавайте любые артефакты Предтеч и процессоры; привозите строительные сплавы для защитных куполов.',
    categoryModifiers: {
      precursor: {
        multiplier: 1.55,
        demandLevel: 'critical_high',
        supplyLevel: 'critical_deficit',
        reason: 'Институты Конкорда платят колоссальную премию за любые следы Зодчих (+55%)'
      },
      tech: {
        multiplier: 1.35,
        demandLevel: 'high',
        supplyLevel: 'low',
        reason: 'Квантовые чипы сгорают при дешифровке гравитационных аномалий (+35%)'
      },
      mineral: {
        multiplier: 1.25,
        demandLevel: 'high',
        supplyLevel: 'low',
        reason: 'Возведение радиационных щитов вокруг монолитов требует титана (+25%)'
      }
    }
  },

  // Pulsar PSR-J0737 (High-Energy Antimatter Station)
  pulsar: {
    economyType: 'extraction',
    name: 'Плазменно-Энергетический Терминал',
    shortTag: 'Энергетический Хаб',
    badgeColor: 'border-blue-600/70 bg-blue-950/70 text-blue-300',
    iconName: 'Zap',
    description: 'Грандиозный уловитель антиматерии «Тесла» в магнитном поле релятивистского пульсара. Бесконечные запасы гелия-3 и антиматерии. Жёсткое гамма-излучение разрушает металл.',
    tradingAdvice: 'Закупайте топливо по рекордно низкой цене; привозите тяжёлые титановые сплавы для замены повреждённых ловушек.',
    categoryModifiers: {
      mineral: {
        multiplier: 1.40,
        demandLevel: 'critical_high',
        supplyLevel: 'critical_deficit',
        reason: 'Радиационный шторм пульсара разъедает обшивку станции — огромный спрос на титан (+40%)'
      },
      food: {
        multiplier: 1.35,
        demandLevel: 'high',
        supplyLevel: 'low',
        reason: 'Экипажи защитных платформ нуждаются в регулярной доставке пайков (+35%)'
      }
    },
    itemSpecificModifiers: {
      fuel_cell: {
        multiplier: 0.60,
        demandLevel: 'low',
        supplyLevel: 'surplus',
        reason: 'Уловители пульсара генерируют избыток высокоочищенного He-3 (-40%)'
      }
    }
  },

  // Abyss (Cygnus Event Horizon Outpost)
  abyss: {
    economyType: 'relic_research',
    name: 'Аванпост Черной Дыры «Астрея»',
    shortTag: 'Гравитационный Рубеж',
    badgeColor: 'border-slate-600/70 bg-slate-900/90 text-slate-300',
    iconName: 'Radio',
    description: 'Исследовательская станция на орбите горизонта событий. Изолированный рубеж, изучающий тахионные разломы.',
    tradingAdvice: 'Привозите квантовые чипы и антиматерию; продавайте экзотические артефакты с высокой наценкой.',
    categoryModifiers: {
      tech: {
        multiplier: 1.45,
        demandLevel: 'critical_high',
        supplyLevel: 'critical_deficit',
        reason: 'Сверхточные навигационные процессоры необходимы для удержания орбиты (+45%)'
      },
      food: {
        multiplier: 1.35,
        demandLevel: 'high',
        supplyLevel: 'low',
        reason: 'Изолированный гарнизон на краю сингулярности (+35%)'
      },
      precursor: {
        multiplier: 1.40,
        demandLevel: 'high',
        supplyLevel: 'critical_deficit',
        reason: 'Изучение реликтовых гравитационных полей Предтеч (+40%)'
      }
    }
  },

  // Namek (Dragon Ball)
  namek: {
    economyType: 'spiritual',
    name: 'Аграрно-Мистический Мир Намека',
    shortTag: 'Священный Мир',
    badgeColor: 'border-emerald-500/70 bg-emerald-950/70 text-emerald-300',
    iconName: 'Sparkles',
    description: 'Родина Намекианцев и священных Жемчужин Дракона. Избыток бобов Сэндзу и приборов Capsule Corp. Нуждаются в промышленных металлах и строительных материалах.',
    tradingAdvice: 'Покупайте волшебные бобы Сэндзу и Драконьи Радары; продавайте титановые сплавы и инструменты.',
    categoryModifiers: {
      mineral: {
        multiplier: 1.45,
        demandLevel: 'critical_high',
        supplyLevel: 'critical_deficit',
        reason: 'Намекианцы берегут природу и не имеют шахт — высокий спрос на сплавы (+45%)'
      },
      food: {
        multiplier: 1.25,
        demandLevel: 'normal',
        supplyLevel: 'normal',
        reason: 'Хотя намекианцы пьют воду, пайки ценятся для гостей планеты (+25%)'
      }
    },
    itemSpecificModifiers: {
      senzu_beans: {
        multiplier: 0.75,
        demandLevel: 'low',
        supplyLevel: 'surplus',
        reason: 'Башня Карин на Намеке обеспечивает стабильный сбор бобов (-25%)'
      },
      dragon_radar: {
        multiplier: 0.80,
        demandLevel: 'normal',
        supplyLevel: 'surplus',
        reason: 'Мастерские Capsule Corp поставляют радары (-20%)'
      }
    }
  },

  // Soul Society: Seireitei (Bleach)
  soul_society: {
    economyType: 'spiritual',
    name: 'Цитадель Сэйрэйтэй (Готей 13)',
    shortTag: 'Духовная Метрополия',
    badgeColor: 'border-purple-600/70 bg-purple-950/70 text-purple-300',
    iconName: 'Shield',
    description: 'Обитель синигами. Высочайшая плотность духовных частиц Рейши и арсеналы стали Зампакто. НИИ Куроцути охотится за передовой кибернетикой и процессорами смертных.',
    tradingAdvice: 'Закупайте духовную сталь и эссенцию Рейши; продавайте квантовые процессоры и земные деликатесы.',
    categoryModifiers: {
      tech: {
        multiplier: 1.55,
        demandLevel: 'critical_high',
        supplyLevel: 'critical_deficit',
        reason: 'НИИ Маюри Куроцути готов платить любые деньги за передовую электронику (+55%)'
      },
      food: {
        multiplier: 1.30,
        demandLevel: 'high',
        supplyLevel: 'low',
        reason: 'Снабжение казарм и праздничных банкетов 13 отрядов (+30%)'
      }
    },
    itemSpecificModifiers: {
      zanpakuto_steel: {
        multiplier: 0.75,
        demandLevel: 'low',
        supplyLevel: 'surplus',
        reason: 'Кузницы Сакахоко непрерывно отливают духовную сталь (-25%)'
      },
      reishi_essence: {
        multiplier: 0.80,
        demandLevel: 'low',
        supplyLevel: 'surplus',
        reason: 'Концентрация духовных частиц в Сэйрэйтэе выше нормы (-20%)'
      }
    }
  },

  // Senkaimon & Rukongai (Bleach)
  senkaimon: {
    economyType: 'trade_hub',
    name: 'Транзитный Узел Сэнкаймон',
    shortTag: 'Межмировой Портал',
    badgeColor: 'border-cyan-600/70 bg-cyan-950/70 text-cyan-300',
    iconName: 'ArrowUpDown',
    description: 'Межпространственный транзитный хаб между миром живых и Сообществом Душ. Свободная торговля капсулами душ «Гиконган» и сбалансированный обмен товарами.',
    tradingAdvice: 'Покупайте капсулы «Гиконган»; привозите термоядерное топливо для питания врат Сэнкаймон.',
    categoryModifiers: {
      food: {
        multiplier: 1.25,
        demandLevel: 'high',
        supplyLevel: 'low',
        reason: 'Бедные районы Руконгая нуждаются в регулярных поставках еды (+25%)'
      },
      tech: {
        multiplier: 1.15,
        demandLevel: 'high',
        supplyLevel: 'normal',
        reason: 'Модернизация барьеров контрольного пункта Сэнкаймон (+15%)'
      }
    },
    itemSpecificModifiers: {
      gikongan_candy: {
        multiplier: 0.75,
        demandLevel: 'low',
        supplyLevel: 'surplus',
        reason: 'Аптеки Руконгая продают конфеты душ по оптовым ценам (-25%)'
      },
      fuel_cell: {
        multiplier: 1.35,
        demandLevel: 'high',
        supplyLevel: 'low',
        reason: 'Врата перехода требуют огромных затрат чистой энергии (+35%)'
      }
    }
  }
};

export function getSystemEconomyProfile(system: StarSystem): SystemEconomyDefinition {
  if (SYSTEM_ECONOMY_PROFILES[system.id]) {
    return SYSTEM_ECONOMY_PROFILES[system.id];
  }

  // Fallback based on sector / faction
  if (system.sector === 'gamma' || system.faction === 'syndicate') {
    return SYSTEM_ECONOMY_PROFILES.veil;
  }
  if (system.sector === 'soul_society') {
    return SYSTEM_ECONOMY_PROFILES.senkaimon;
  }
  if (system.starClass === 'neutron_star' || system.starClass === 'black_hole') {
    return SYSTEM_ECONOMY_PROFILES.pulsar;
  }

  return SYSTEM_ECONOMY_PROFILES.sol;
}

// ============================================================================
// TEMPORARY MARKET EVENTS
// ============================================================================

export interface MarketEventTemplate {
  type: MarketEventType;
  title: string;
  description: string;
  urgency: 'normal' | 'high' | 'critical';
  icon: string;
  color: string;
  targetSystemTypes: SystemEconomyType[];
  targetSystemIds?: string[];
  durationMin: number;
  durationMax: number;
  flavorTip: string;
  modifiers: {
    itemId?: string;
    category?: MarketItem['category'];
    multiplier: number;
    label: string;
    demandLevel: 'critical_high' | 'high' | 'normal' | 'low';
    supplyLevel: 'critical_deficit' | 'low' | 'normal' | 'surplus';
  }[];
}

export const MARKET_EVENT_TEMPLATES: MarketEventTemplate[] = [
  {
    type: 'famine',
    title: 'Критический Дефицит Продовольствия',
    description: 'Внезапная авария в системе фильтрации гидропонных куполов вызвала острую нехватку продовольственных пайков. Станция готова платить рекордную цену за любые поставки еды!',
    urgency: 'critical',
    icon: 'UtensilsCrossed',
    color: '#F43F5E', // Rose
    targetSystemTypes: ['industrial', 'extraction', 'outlaw'],
    durationMin: 3,
    durationMax: 5,
    flavorTip: 'Срочно везите Гидропонные пайки из Солнечной системы для чистой прибыли свыше +70%!',
    modifiers: [
      {
        category: 'food',
        multiplier: 1.70,
        label: '+70% к цене продовольствия (Ажиотажный спрос)',
        demandLevel: 'critical_high',
        supplyLevel: 'critical_deficit'
      }
    ]
  },
  {
    type: 'tech_boom',
    title: 'Квантовый Технологический Бум',
    description: 'Инженеры и исследовательские корпорации совершили прорыв в квантовых вычислениях. Местные заводы лихорадочно скупают квантовые процессоры и древние артефакты для расширения вычислительных кластеров.',
    urgency: 'high',
    icon: 'Cpu',
    color: '#06B6D4', // Cyan
    targetSystemTypes: ['hightech', 'agricultural', 'relic_research'],
    durationMin: 3,
    durationMax: 6,
    flavorTip: 'Выгодно продавать Квантовые процессоры и Реликвии Предтеч по максимальному тарифу!',
    modifiers: [
      {
        itemId: 'quantum_chips',
        multiplier: 1.65,
        label: '+65% на Квантовые процессоры',
        demandLevel: 'critical_high',
        supplyLevel: 'critical_deficit'
      },
      {
        itemId: 'precursor_artifact',
        multiplier: 1.45,
        label: '+45% на Артефакты Предтеч',
        demandLevel: 'high',
        supplyLevel: 'low'
      }
    ]
  },
  {
    type: 'mining_rush',
    title: 'Астероидная Лихорадка: Обвал Цен на Сплавы',
    description: 'Шахтёры вскрыли богатейшую жилу сверхплотного титана. Рынок наводнён дешёвыми сплавами (-35% к цене закупки), но местным буровым судам отчаянно необходимо термоядерное топливо (+50%)!',
    urgency: 'normal',
    icon: 'Pickaxe',
    color: '#10B981', // Emerald
    targetSystemTypes: ['industrial', 'extraction'],
    durationMin: 3,
    durationMax: 5,
    flavorTip: 'Скупайте Титановые сплавы по рекордно низкой цене и везите топливо He-3 на продажу!',
    modifiers: [
      {
        itemId: 'hyper_alloy',
        multiplier: 0.65,
        label: '-35% на Титановые сплавы (Избыток предложения)',
        demandLevel: 'low',
        supplyLevel: 'surplus'
      },
      {
        itemId: 'fuel_cell',
        multiplier: 1.50,
        label: '+50% на Топливо He-3 (Высокий спрос буровиков)',
        demandLevel: 'critical_high',
        supplyLevel: 'low'
      }
    ]
  },
  {
    type: 'medical_epidemic',
    title: 'Вспышка Звёздной Лихорадки (Чрезвычайная Ситуация)',
    description: 'Мутагенный вирус из открытого космоса поразил доки станции. Медицинская служба объявила экстренный карантин и скупает любые био-регенераторы и бобы Сэндзу с премией до +80%!',
    urgency: 'critical',
    icon: 'HeartPulse',
    color: '#EC4899', // Pink
    targetSystemTypes: ['industrial', 'extraction', 'outlaw', 'trade_hub'],
    durationMin: 2,
    durationMax: 4,
    flavorTip: 'Везите Био-регенераторы и Волшебные бобы Сэндзу — спасите сектор и заработайте состояние!',
    modifiers: [
      {
        category: 'medical',
        multiplier: 1.80,
        label: '+80% к закупке медикаментов (Экстренный дефицит)',
        demandLevel: 'critical_high',
        supplyLevel: 'critical_deficit'
      }
    ]
  },
  {
    type: 'fuel_crisis',
    title: 'Энергетический Коллапс: Дефицит Гелия-3',
    description: 'Авария в реакторном кольце привела к потере стратегических запасов топлива. Орбитальные электростанции готовы платить двойную цену за канистры Гелия-3 (+75%)!',
    urgency: 'high',
    icon: 'Zap',
    color: '#F59E0B', // Amber
    targetSystemTypes: ['agricultural', 'hightech', 'trade_hub'],
    durationMin: 2,
    durationMax: 4,
    flavorTip: 'Закупайте топливо в Сириусе или на Пульсаре и везите в этот сектор для сверхприбыли!',
    modifiers: [
      {
        itemId: 'fuel_cell',
        multiplier: 1.75,
        label: '+75% на Топливо He-3 (Критический дефицит энергии)',
        demandLevel: 'critical_high',
        supplyLevel: 'critical_deficit'
      }
    ]
  },
  {
    type: 'contraband_crackdown',
    title: 'Облава Патрульного Флота: Чёрный Рынок в Огне',
    description: 'Федеральный флот блокировал контрабандные каналы. Цены на скупку запрещённых товаров на теневых биржах взлетели на +85%, однако риск перехвата патрулями максимален!',
    urgency: 'critical',
    icon: 'ShieldAlert',
    color: '#E11D48', // Red
    targetSystemTypes: ['outlaw', 'hightech', 'agricultural'],
    durationMin: 2,
    durationMax: 4,
    flavorTip: 'Сбывайте Контрабанду Синдиката за колоссальные кредиты, но опасайтесь корсаров и патрулей!',
    modifiers: [
      {
        category: 'contraband',
        multiplier: 1.85,
        label: '+85% к скупке контрабанды на чёрном рынке',
        demandLevel: 'critical_high',
        supplyLevel: 'critical_deficit'
      }
    ]
  },
  {
    type: 'precursor_surge',
    title: 'Археологическая Сенсация Предтеч',
    description: 'Расшифровка сигнатуры Зодчих подтвердила существование древнего хранилища знаний. Научные институты и частные олигархи готовы платить двойную цену (+90%) за любые реликвии Предтеч!',
    urgency: 'high',
    icon: 'Sparkles',
    color: '#8B5CF6', // Purple
    targetSystemTypes: ['relic_research', 'agricultural', 'spiritual'],
    durationMin: 3,
    durationMax: 6,
    flavorTip: 'Продавайте Осколки Предтеч и сферы Намека с максимальной наценкой в галактике!',
    modifiers: [
      {
        category: 'precursor',
        multiplier: 1.90,
        label: '+90% на Реликвии Предтеч и Древние Артефакты',
        demandLevel: 'critical_high',
        supplyLevel: 'critical_deficit'
      }
    ]
  },
  {
    type: 'harvest_abundance',
    title: 'Рекордный Урожай Орбитальных Агрокуполов',
    description: 'Благоприятная солнечная активность привела к рекордному сбору органики. Склады переполнены гидропонными пайками: цены на закупку обвалились на -40%!',
    urgency: 'normal',
    icon: 'Apple',
    color: '#84CC16', // Lime
    targetSystemTypes: ['agricultural'],
    durationMin: 3,
    durationMax: 5,
    flavorTip: 'Закупайте пайки по смешным ценам (-40%) и экспортируйте в Сириус или на Проксиму!',
    modifiers: [
      {
        category: 'food',
        multiplier: 0.60,
        label: '-40% на Пайки (Колоссальный избыток урожая)',
        demandLevel: 'low',
        supplyLevel: 'surplus'
      }
    ]
  },
  {
    type: 'military_mobilization',
    title: 'Военная Мобилизация Орбитальных Верфей',
    description: 'Обострение конфликта за внешние рубежи заставило флот заложить новые боевые эсминцы. Спрос на титановые сплавы (+55%) и квантовые процессоры (+40%) взлетел!',
    urgency: 'high',
    icon: 'Swords',
    color: '#F97316', // Orange
    targetSystemTypes: ['industrial', 'hightech', 'agricultural'],
    durationMin: 3,
    durationMax: 5,
    flavorTip: 'Снабжайте военные верфи сплавами и чипами для быстрой капитализации!',
    modifiers: [
      {
        itemId: 'hyper_alloy',
        multiplier: 1.55,
        label: '+55% на Титановые сплавы (Госзаказ флота)',
        demandLevel: 'critical_high',
        supplyLevel: 'low'
      },
      {
        itemId: 'quantum_chips',
        multiplier: 1.40,
        label: '+40% на Квантовые чипы (Боевые матрицы)',
        demandLevel: 'high',
        supplyLevel: 'low'
      }
    ]
  }
];

export function generateInitialMarketEvents(systems: StarSystem[], currentStardate: number = 2184.2): MarketEvent[] {
  const events: MarketEvent[] = [];
  const systemMap = new Map(systems.map(s => [s.id, s]));

  // Curate 3 rich initial market events showcasing different aspects
  // 1. Food Shortage in Sirius (Foundry)
  const siriusSys = systemMap.get('sirius');
  if (siriusSys) {
    const template = MARKET_EVENT_TEMPLATES.find(t => t.type === 'famine')!;
    events.push({
      id: `me_sirius_famine_${Date.now()}_1`,
      type: template.type,
      systemId: siriusSys.id,
      systemName: siriusSys.name,
      sector: siriusSys.sector,
      title: 'Дефицит продовольствия на верфях Сириуса',
      description: 'Поломка опреснителей и биокуполов Гефеста вызвала острый голод среди сотен тысяч шахтёров. Станция скупает любые пищевые пайки по сверхвысоким расценкам (+70%)!',
      urgency: 'critical',
      icon: template.icon,
      color: template.color,
      remainingCycles: 4,
      maxCycles: 5,
      startStardate: currentStardate,
      modifiers: template.modifiers,
      flavorTip: template.flavorTip
    });
  }

  // 2. Tech Boom in Kepler-452
  const keplerSys = systemMap.get('kepler');
  if (keplerSys) {
    const template = MARKET_EVENT_TEMPLATES.find(t => t.type === 'tech_boom')!;
    events.push({
      id: `me_kepler_boom_${Date.now()}_2`,
      type: template.type,
      systemId: keplerSys.id,
      systemName: keplerSys.name,
      sector: keplerSys.sector,
      title: 'Квантовый бум в порту «Новая Заря» (Кеплер)',
      description: 'Исследовательский совет Кеплера расширяет суперкомпьютерный кластер. Спрос на квантовые процессоры вырос на +65%, на артефакты Предтеч — на +45%!',
      urgency: 'high',
      icon: template.icon,
      color: template.color,
      remainingCycles: 3,
      maxCycles: 4,
      startStardate: currentStardate,
      modifiers: template.modifiers,
      flavorTip: template.flavorTip
    });
  }

  // 3. Mining Rush in Proxima Centauri
  const proximaSys = systemMap.get('proxima');
  if (proximaSys) {
    const template = MARKET_EVENT_TEMPLATES.find(t => t.type === 'mining_rush')!;
    events.push({
      id: `me_proxima_mining_${Date.now()}_3`,
      type: template.type,
      systemId: proximaSys.id,
      systemName: proximaSys.name,
      sector: proximaSys.sector,
      title: 'Титановый бум на станции «Авангард» (Проксима)',
      description: 'Вскрытие гигантской астероидной жилы вызвало избыток титановых сплавов со скидкой -35%, а спрос на термоядерное топливо He-3 подскочил на +50%!',
      urgency: 'normal',
      icon: template.icon,
      color: template.color,
      remainingCycles: 5,
      maxCycles: 5,
      startStardate: currentStardate,
      modifiers: template.modifiers,
      flavorTip: template.flavorTip
    });
  }

  return events;
}

export function generateSingleRandomMarketEvent(
  systems: StarSystem[],
  currentStardate: number,
  existingEvents: MarketEvent[] = []
): MarketEvent | null {
  if (!systems || systems.length === 0) return null;

  // Filter out systems that already have an active event
  const occupiedSystemIds = new Set(existingEvents.map(e => e.systemId));
  const availableSystems = systems.filter(s => !occupiedSystemIds.has(s.id));
  if (availableSystems.length === 0) return null;

  // Pick random system
  const targetSys = availableSystems[Math.floor(Math.random() * availableSystems.length)];
  const sysEcon = getSystemEconomyProfile(targetSys);

  // Pick template that matches system economy type if possible
  const matchingTemplates = MARKET_EVENT_TEMPLATES.filter(t => 
    t.targetSystemTypes.includes(sysEcon.economyType)
  );
  const eligibleTemplates = matchingTemplates.length > 0 ? matchingTemplates : MARKET_EVENT_TEMPLATES;
  const template = eligibleTemplates[Math.floor(Math.random() * eligibleTemplates.length)];

  const cycles = Math.floor(Math.random() * (template.durationMax - template.durationMin + 1)) + template.durationMin;
  const id = `me_${targetSys.id}_${template.type}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  return {
    id,
    type: template.type,
    systemId: targetSys.id,
    systemName: targetSys.name,
    sector: targetSys.sector,
    title: `${template.title} в системе ${targetSys.name}`,
    description: template.description,
    urgency: template.urgency,
    icon: template.icon,
    color: template.color,
    remainingCycles: cycles,
    maxCycles: cycles,
    startStardate: currentStardate,
    modifiers: template.modifiers,
    flavorTip: template.flavorTip
  };
}

export function advanceMarketEvents(
  currentEvents: MarketEvent[],
  systems: StarSystem[],
  nextStardate: number
): MarketEvent[] {
  // Decrement cycles and filter out expired
  const active = currentEvents
    .map(event => ({ ...event, remainingCycles: event.remainingCycles - 1 }))
    .filter(event => event.remainingCycles > 0);

  // Maintain 2 to 4 active events across the galaxy
  const targetCount = 3;
  while (active.length < targetCount) {
    const fresh = generateSingleRandomMarketEvent(systems, nextStardate, active);
    if (!fresh) break;
    active.push(fresh);
  }

  return active;
}

// ============================================================================
// COMPREHENSIVE PRICE & SUPPLY/DEMAND CALCULATOR
// ============================================================================

export function calculateComprehensiveItemPrice(
  item: MarketItem,
  system: StarSystem,
  activeNews: GalacticNewsItem[] = [],
  marketEvents: MarketEvent[] = []
): ComprehensivePriceInfo {
  const breakdown: ComprehensivePriceInfo['breakdown'] = [];
  
  // 1. Base Prices
  const baseBuyPrice = item.buyPrice;
  const baseSellPrice = item.sellPrice;
  breakdown.push({
    source: 'base',
    title: 'Базовая цена товара',
    factor: 1.0,
    description: `Базовая закупка ${baseBuyPrice} ⬡, скупка ${baseSellPrice} ⬡`
  });

  // 2. System Economy Profile Multiplier
  const sysEcon = getSystemEconomyProfile(system);
  let economyMultiplier = 1.0;
  let economyReason = 'Сбалансированный региональный спрос';
  let econDemandLevel: 'critical_high' | 'high' | 'normal' | 'low' = 'normal';
  let econSupplyLevel: 'critical_deficit' | 'low' | 'normal' | 'surplus' = 'normal';

  // Check specific item modifier first
  if (sysEcon.itemSpecificModifiers && sysEcon.itemSpecificModifiers[item.id]) {
    const m = sysEcon.itemSpecificModifiers[item.id];
    economyMultiplier = m.multiplier;
    economyReason = m.reason;
    econDemandLevel = m.demandLevel;
    econSupplyLevel = m.supplyLevel;
  } else if (sysEcon.categoryModifiers && sysEcon.categoryModifiers[item.category]) {
    const m = sysEcon.categoryModifiers[item.category]!;
    economyMultiplier = m.multiplier;
    economyReason = m.reason;
    econDemandLevel = m.demandLevel;
    econSupplyLevel = m.supplyLevel;
  }

  if (economyMultiplier !== 1.0) {
    breakdown.push({
      source: 'economy',
      title: `${sysEcon.name}`,
      factor: economyMultiplier,
      description: economyReason
    });
  }

  // 3. Active Market Events affecting this system
  let eventMultiplier = 1.0;
  const affectingEventsInSystem: MarketEvent[] = [];
  let eventDemandLevel: 'critical_high' | 'high' | 'normal' | 'low' = 'normal';
  let eventSupplyLevel: 'critical_deficit' | 'low' | 'normal' | 'surplus' = 'normal';

  const systemEvents = marketEvents.filter(e => e.systemId === system.id);
  for (const event of systemEvents) {
    for (const mod of event.modifiers) {
      const matchItem = mod.itemId && mod.itemId === item.id;
      const matchCat = mod.category && mod.category === item.category;

      if (matchItem || matchCat) {
        eventMultiplier *= mod.multiplier;
        if (!affectingEventsInSystem.some(e => e.id === event.id)) {
          affectingEventsInSystem.push(event);
        }
        if (mod.demandLevel === 'critical_high' || (mod.demandLevel === 'high' && eventDemandLevel !== 'critical_high')) {
          eventDemandLevel = mod.demandLevel;
        }
        if (mod.supplyLevel) {
          eventSupplyLevel = mod.supplyLevel;
        }

        breakdown.push({
          source: 'event',
          title: `Событие: ${event.title}`,
          factor: mod.multiplier,
          description: mod.label
        });
      }
    }
  }

  // 4. Galactic News Modifiers
  let newsMultiplier = 1.0;
  const affectingNewsList: GalacticNewsItem[] = [];

  for (const news of activeNews) {
    const isSectorMatch = news.targetSector === 'all' || news.targetSector === system.sector;
    const isSystemMatch = !news.targetSystemId || news.targetSystemId === system.id;
    if (!isSectorMatch || !isSystemMatch) continue;

    for (const mod of news.priceModifiers) {
      const matchItem = mod.itemId && mod.itemId === item.id;
      const matchCategory = mod.category && mod.category === item.category;

      if (matchItem || matchCategory) {
        newsMultiplier *= mod.multiplier;
        if (!affectingNewsList.some(n => n.id === news.id)) {
          affectingNewsList.push(news);
        }

        breakdown.push({
          source: 'news',
          title: `Вестник: ${news.headline.substring(0, 36)}...`,
          factor: mod.multiplier,
          description: mod.label
        });
      }
    }
  }

  // Combined Multiplier
  let totalMultiplier = economyMultiplier * eventMultiplier * newsMultiplier;
  // Bounded between 0.35 and 3.50
  totalMultiplier = Math.max(0.35, Math.min(3.50, totalMultiplier));

  const finalBuyPrice = Math.max(1, Math.round(baseBuyPrice * totalMultiplier));
  const finalSellPrice = Math.max(1, Math.round(baseSellPrice * totalMultiplier));
  const percentageChange = Math.round((totalMultiplier - 1.0) * 100);

  const trend: ComprehensivePriceInfo['trend'] = 
    percentageChange > 3 ? 'up' : percentageChange < -3 ? 'down' : 'neutral';

  // Determine Overall Demand Level and Score (1 - 5)
  let finalDemandLevel: ComprehensivePriceInfo['demandLevel'] = 'normal';
  let demandLabel = 'Умеренный спрос';
  let demandScore = 3;

  if (eventDemandLevel === 'critical_high' || totalMultiplier >= 1.55) {
    finalDemandLevel = 'critical_high';
    demandLabel = `Критический спрос (+${percentageChange}%)`;
    demandScore = 5;
  } else if (eventDemandLevel === 'high' || econDemandLevel === 'high' || totalMultiplier >= 1.20) {
    finalDemandLevel = 'high';
    demandLabel = `Высокий спрос (+${percentageChange}%)`;
    demandScore = 4;
  } else if (econDemandLevel === 'low' || totalMultiplier <= 0.80) {
    finalDemandLevel = 'low';
    demandLabel = `Низкий спрос (${percentageChange}%)`;
    demandScore = 2;
  } else {
    finalDemandLevel = 'normal';
    demandLabel = 'Сбалансированный спрос';
    demandScore = 3;
  }

  // Determine Overall Supply Level and Score (1 - 5)
  let finalSupplyLevel: ComprehensivePriceInfo['supplyLevel'] = 'normal';
  let supplyLabel = 'Стабильное предложение';
  let supplyScore = 3;

  if (eventSupplyLevel === 'critical_deficit' || (finalDemandLevel === 'critical_high' && totalMultiplier >= 1.50)) {
    finalSupplyLevel = 'critical_deficit';
    supplyLabel = 'Острый дефицит';
    supplyScore = 1;
  } else if (eventSupplyLevel === 'surplus' || econSupplyLevel === 'surplus' || totalMultiplier <= 0.80) {
    finalSupplyLevel = 'surplus';
    supplyLabel = `Избыток предложения (${percentageChange}%)`;
    supplyScore = 5;
  } else if (eventSupplyLevel === 'low' || econSupplyLevel === 'low' || totalMultiplier >= 1.25) {
    finalSupplyLevel = 'low';
    supplyLabel = 'Пониженное предложение';
    supplyScore = 2;
  } else {
    finalSupplyLevel = 'normal';
    supplyLabel = 'Штатное снабжение';
    supplyScore = 3;
  }

  return {
    baseBuyPrice,
    baseSellPrice,
    finalBuyPrice,
    finalSellPrice,
    multiplier: totalMultiplier,
    percentageChange,
    trend,
    demandLevel: finalDemandLevel,
    demandLabel,
    demandScore,
    supplyLevel: finalSupplyLevel,
    supplyLabel,
    supplyScore,
    economyType: sysEcon.economyType,
    economyName: sysEcon.name,
    economyModifier: economyMultiplier,
    economyReason,
    activeEvents: affectingEventsInSystem,
    affectingNews: affectingNewsList,
    breakdown
  };
}
