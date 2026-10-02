import { GalacticNewsItem, MarketItem, StarSystem, PriceModifier } from '../types/game';

export const INITIAL_GALACTIC_NEWS: GalacticNewsItem[] = [
  {
    id: 'news_titanium_strike',
    headline: 'Забастовка горняков в поясе Койпера: острый дефицит титановых сплавов в Секторе Альфа!',
    source: 'Информбюро ОФЗ (Солнце)',
    category: 'crisis',
    timestamp: 'Зв. Дата 2184.1',
    summary: 'Независимый профсоюз шахтёров перекрыл отгрузку руды с астероидных карьеров. Цены на титановые сплавы на верфях Солнца и Проксимы взлетели на +45%!',
    targetSector: 'alpha',
    urgency: 'high',
    stardate: 2184.1,
    priceModifiers: [
      {
        itemId: 'hyper_alloy',
        multiplier: 1.45,
        label: '+45% к цене титановых сплавов'
      }
    ]
  },
  {
    id: 'news_hydroponic_harvest',
    headline: 'Рекордный урожай на гидропонных орбиталях Земли: цены на пайки упали на треть',
    source: 'Агро-Вестник Метрополии',
    category: 'boom',
    timestamp: 'Зв. Дата 2184.0',
    summary: 'Ввод в эксплуатацию десятого био-купола на орбите Марса вызвал избыток пищевых концентратов. Закупочные цены на гидропонные пайки снижены на -35%.',
    targetSector: 'all',
    urgency: 'normal',
    stardate: 2184.0,
    priceModifiers: [
      {
        itemId: 'food_packs',
        multiplier: 0.65,
        label: '-35% к цене пайков'
      }
    ]
  },
  {
    id: 'news_cyber_virus_kepler',
    headline: 'Вспышка кибер-вируса в Секторе Бета: ажиотажный спрос на квантовые процессоры!',
    source: 'Техно-Сводка Кеплера',
    category: 'science',
    timestamp: 'Зв. Дата 2183.9',
    summary: 'Неизвестный сетевой червь повредил вычислительные узлы на станциях Сириуса и Кеплера. Инженеры готовы скупать квантовые чипы с наценкой +55%!',
    targetSector: 'beta',
    urgency: 'high',
    stardate: 2183.9,
    priceModifiers: [
      {
        itemId: 'quantum_chips',
        multiplier: 1.55,
        label: '+55% к цене квантовых чипов'
      },
      {
        itemId: 'medical_stims',
        multiplier: 1.25,
        label: '+25% к цене био-регенераторов'
      }
    ]
  },
  {
    id: 'news_police_raid_veil',
    headline: 'Облава Космической Полиции в Завесе Веила: обвал поставок контрабанды!',
    source: 'Служба Безопасности ОФЗ',
    category: 'military',
    timestamp: 'Зв. Дата 2183.8',
    summary: 'Флот патрульных крейсеров блокировал нелегальные перевалочные базы Синдиката в Секторе Гамма. Стоимость контрабанды на чёрном рынке выросла на +60%!',
    targetSector: 'gamma',
    urgency: 'critical',
    stardate: 2183.8,
    priceModifiers: [
      {
        category: 'contraband',
        multiplier: 1.60,
        label: '+60% к скупке контрабанды'
      }
    ]
  }
];

export interface NewsTemplate {
  headline: string;
  source: string;
  category: GalacticNewsItem['category'];
  summary: string;
  targetSector: 'alpha' | 'beta' | 'gamma' | 'soul_society' | 'all';
  urgency: 'normal' | 'high' | 'critical';
  priceModifiers: PriceModifier[];
}

export const NEWS_TEMPLATES: NewsTemplate[] = [
  {
    headline: 'Драконий Резонанс на Планете Намек: все семь Жемчужин испускают небесное сияние!',
    source: 'Капсульная Корпорация & Радар Бульмы',
    category: 'science',
    summary: 'Священные Жемчужины Дракона на Намеке вошли в квантовый синхрон. Спрос на Драконьи Радары и бобы Сэндзу вырос на +65%!',
    targetSector: 'beta',
    urgency: 'high',
    priceModifiers: [
      { itemId: 'dragon_radar', multiplier: 1.65, label: '+65% на Драконьи Радары' },
      { itemId: 'senzu_beans', multiplier: 1.45, label: '+45% на бобы Сэндзу' }
    ]
  },
  {
    headline: 'Колебания плотности духовных частиц в Сообществе Душ: Готей 13 мобилизует запасы!',
    source: 'НИИ Синигами (Сэйрэйтэй)',
    category: 'anomaly',
    summary: '12-й отряд зафиксировал возмущение в Сэнкаймоне. Станции Сообщества Душ срочно скупают эссенцию Рейши (+50%) и духовную сталь Зампакто (+40%)!',
    targetSector: 'soul_society',
    urgency: 'critical',
    priceModifiers: [
      { itemId: 'reishi_essence', multiplier: 1.50, label: '+50% на Эссенцию Рейши' },
      { itemId: 'zanpakuto_steel', multiplier: 1.40, label: '+40% на сталь Зампакто' }
    ]
  },
  {
    headline: 'Вспышка протуберанцев в системе Проксима: скачок спроса на гелий-3 и защитные сплавы!',
    source: 'Гелиосферная Служба ОФЗ',
    category: 'anomaly',
    summary: 'Аномальная солнечная буря истощила энергоресурсы орбитальных щитов. Станции срочно закупают канистры Гелия-3 (+40%) и сплавы (+30%).',
    targetSector: 'alpha',
    urgency: 'high',
    priceModifiers: [
      { itemId: 'fuel_cell', multiplier: 1.40, label: '+40% на топливо He-3' },
      { itemId: 'hyper_alloy', multiplier: 1.30, label: '+30% на сплавы' }
    ]
  },
  {
    headline: 'Найдена запечатанная крипта Зодчих в глубоком космосе: бум цен на артефакты Предтеч!',
    source: 'Археологический Вестник Адептов',
    category: 'science',
    summary: 'Учёные Конкорда расшифровали древний маяк Предтеч. Коллекционеры и научные лаборатории платят за любые реликвии Зодчих вдвое больше (+75%)!',
    targetSector: 'all',
    urgency: 'critical',
    priceModifiers: [
      { itemId: 'precursor_artifact', multiplier: 1.75, label: '+75% на реликвии Предтеч' }
    ]
  },
  {
    headline: 'Авария на терраформирующем куполе Сириуса: срочно требуются медицинские препараты!',
    source: 'Экстренный Канал Сириус-Прайм',
    category: 'crisis',
    summary: 'Прорыв ядовитых газов в жилые сектора вызвал масштабную эвакуацию. Цены на био-регенераторы в Секторе Бета подскочили на +50%!',
    targetSector: 'beta',
    urgency: 'high',
    priceModifiers: [
      { itemId: 'medical_stims', multiplier: 1.50, label: '+50% на био-регенераторы' }
    ]
  },
  {
    headline: 'Война пиратских кланов Синдиката: демпинг нелегальных нейро-стимуляторов «Чёрный Неон»!',
    source: 'Пиратское радио «Свободная Тортуга»',
    category: 'scandal',
    summary: 'Конфликт между баронами Корсаров привёл к сбросу захваченных складов стимуляторов. Цены на покупку упали на -30%!',
    targetSector: 'gamma',
    urgency: 'normal',
    priceModifiers: [
      { itemId: 'contraband_neural_stims', multiplier: 0.70, label: '-30% на стимуляторы' }
    ]
  },
  {
    headline: 'Крупный госзаказ ОФЗ на расширение колониального флота: спрос на сплавы и квантовые чипы!',
    source: 'Министерство Промышленности ОФЗ',
    category: 'boom',
    summary: 'Федерация заложила пять новых звёздных супер-линкоров. Все орбитальные верфи Сектора Альфа скупают сплавы (+35%) и чипы (+40%).',
    targetSector: 'alpha',
    urgency: 'normal',
    priceModifiers: [
      { itemId: 'hyper_alloy', multiplier: 1.35, label: '+35% на сплавы' },
      { itemId: 'quantum_chips', multiplier: 1.40, label: '+40% на чипы' }
    ]
  },
  {
    headline: 'Утечка на гелиевом терминале Кеплера: дефицит термоядерного топлива He-3!',
    source: 'Энергетический Мониторинг Кеплера',
    category: 'crisis',
    summary: 'Взрыв компрессора парализовал заправку торговых конвоев. Канистры Гелия-3 в Секторе Бета подорожали на +55%!',
    targetSector: 'beta',
    urgency: 'high',
    priceModifiers: [
      { itemId: 'fuel_cell', multiplier: 1.55, label: '+55% на гелий-3' }
    ]
  },
  {
    headline: 'Шпионаж в лаборатории кибернетики: спрос на взломанные ИИ-модули «Цербер» вырос до небес!',
    source: 'Теневой Датанет Тортуги',
    category: 'military',
    summary: 'Корпоративные наёмники ведут охоту за передовыми алгоритмами взлома. Бароны Синдиката платят за матрицы «Цербер» на +70% больше!',
    targetSector: 'gamma',
    urgency: 'critical',
    priceModifiers: [
      { itemId: 'contraband_cerberus_ai', multiplier: 1.70, label: '+70% на ИИ «Цербер»' }
    ]
  },
  {
    headline: 'Фестиваль колониального содружества: гастрономический бум во всех секторах Галактики!',
    source: 'Культурное Агентство ОФЗ',
    category: 'boom',
    summary: 'Празднование основания Звёздного Пактa вызвало ажиотажную скупку гидропонных пайков и деликатесов по всей галактике (+30%).',
    targetSector: 'all',
    urgency: 'normal',
    priceModifiers: [
      { itemId: 'food_packs', multiplier: 1.30, label: '+30% на пайки' }
    ]
  }
];

export function generateRandomNewsEvent(stardate: number, preferredSector?: 'alpha' | 'beta' | 'gamma' | 'soul_society' | string): GalacticNewsItem {
  let eligibleTemplates = NEWS_TEMPLATES;
  if (preferredSector) {
    const sectorSpecific = NEWS_TEMPLATES.filter(t => t.targetSector === preferredSector || t.targetSector === 'all');
    if (sectorSpecific.length > 0) eligibleTemplates = sectorSpecific;
  }

  const template = eligibleTemplates[Math.floor(Math.random() * eligibleTemplates.length)];
  const id = `news_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

  return {
    id,
    headline: template.headline,
    source: template.source,
    category: template.category,
    timestamp: `Зв. Дата ${stardate.toFixed(1)}`,
    summary: template.summary,
    targetSector: template.targetSector,
    urgency: template.urgency,
    stardate,
    priceModifiers: template.priceModifiers
  };
}

export interface ItemPriceCalculation {
  baseBuyPrice: number;
  baseSellPrice: number;
  finalBuyPrice: number;
  finalSellPrice: number;
  multiplier: number;
  percentageChange: number;
  affectingNews: GalacticNewsItem[];
  trend: 'up' | 'down' | 'neutral';
}

/**
 * Calculates current market price with all active news modifiers applied for a given star system.
 */
export function calculateItemPrice(
  item: MarketItem,
  system: StarSystem,
  activeNews: GalacticNewsItem[]
): ItemPriceCalculation {
  let totalMultiplier = 1.0;
  const affectingNews: GalacticNewsItem[] = [];

  for (const news of activeNews) {
    // Check if news applies to this system/sector
    const isSectorMatch = news.targetSector === 'all' || news.targetSector === system.sector;
    const isSystemMatch = !news.targetSystemId || news.targetSystemId === system.id;

    if (!isSectorMatch || !isSystemMatch) continue;

    // Check if item matches modifier
    for (const mod of news.priceModifiers) {
      const matchItem = mod.itemId && mod.itemId === item.id;
      const matchCategory = mod.category && mod.category === item.category;

      if (matchItem || matchCategory) {
        totalMultiplier *= mod.multiplier;
        if (!affectingNews.some(n => n.id === news.id)) {
          affectingNews.push(news);
        }
      }
    }
  }

  // Bound multiplier between 0.25 and 3.0
  totalMultiplier = Math.max(0.25, Math.min(3.0, totalMultiplier));

  const finalBuyPrice = Math.max(1, Math.round(item.buyPrice * totalMultiplier));
  const finalSellPrice = Math.max(1, Math.round(item.sellPrice * totalMultiplier));
  const percentageChange = Math.round((totalMultiplier - 1.0) * 100);

  const trend: ItemPriceCalculation['trend'] = 
    percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'neutral';

  return {
    baseBuyPrice: item.buyPrice,
    baseSellPrice: item.sellPrice,
    finalBuyPrice,
    finalSellPrice,
    multiplier: totalMultiplier,
    percentageChange,
    affectingNews,
    trend
  };
}
