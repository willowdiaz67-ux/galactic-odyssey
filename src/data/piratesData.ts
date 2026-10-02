import { ArrestedPirate } from '../types/game';

export interface WantedPirateBoss {
  id: string;
  name: string;
  callsign: string;
  title: string;
  shipName: string;
  sector: string;
  threatLevel: 'high' | 'legendary';
  bounty: number;
  crimes: string;
  avatarColor: string;
  captured: boolean;
}

export const WANTED_PIRATE_BOSSES: WantedPirateBoss[] = [
  {
    id: 'wanted_valter',
    name: 'Вальтер «Мясник» Кроу',
    callsign: 'Черный Ворон',
    title: 'Атаман пиратской флотилии «Ржавый Клык»',
    shipName: 'Тяжелый корвет «Вестник Погибели»',
    sector: 'Пояс Койпера / Внешние Рубежи',
    threatLevel: 'high',
    bounty: 2400,
    crimes: 'Захват 14 торговых караванов ОФЗ, расстрел спасательных капсул, незаконная торговля боевыми стимуляторами.',
    avatarColor: '#F43F5E',
    captured: false
  },
  {
    id: 'wanted_calypso',
    name: 'Мадам Калипсо',
    callsign: 'Фантом',
    title: 'Глава синдиката кибер-контрабандистов',
    shipName: 'Фрегат-невидимка «Теневой Сапфир»',
    sector: 'Завеса Веила / Станция Тортуга-4',
    threatLevel: 'legendary',
    bounty: 3800,
    crimes: 'Кража секретных кодов спутников ОФЗ, сбыт тахионных кристаллов и ядерных боеголовок на черном рынке.',
    avatarColor: '#A855F7',
    captured: false
  },
  {
    id: 'wanted_nexus',
    name: 'ИИ-Ренегат «Нексус-7»',
    callsign: 'Ноль-Один',
    title: 'Автономный боевой дредноут синдиката',
    shipName: 'Дредноут-перехватчик «Протокол Смерти»',
    sector: 'Глубокий космос Сириуса',
    threatLevel: 'legendary',
    bounty: 4900,
    crimes: 'Бунт на орбитальной верфи, взлом оборонной сети колонии Альфа, уничтожение трёх патрульных крейсеров.',
    avatarColor: '#06B6D4',
    captured: false
  },
  {
    id: 'wanted_ragnar',
    name: 'Рагнар «Железнозубый»',
    callsign: 'Берсерк',
    title: 'Командующий абордажными бандами астероидных мародёров',
    shipName: 'Таранный крейсер «Молот Рока»',
    sector: 'Астероидный пояс Эриды',
    threatLevel: 'high',
    bounty: 2900,
    crimes: 'Абордажные налёты на шахтёрские станции, шантаж правительства Марса, незаконное изготовление плазменных мин.',
    avatarColor: '#F59E0B',
    captured: false
  }
];

const FIRST_NAMES = ['Дрейк', 'Морган', 'Кастор', 'Вектор', 'Сайлас', 'Рекс', 'Флинт', 'Корвус', 'Орион', 'Зейн'];
const LAST_NAMES = ['Вэнс', 'Скалл', 'Кросби', 'Хейз', 'Морбиус', 'Рэйвен', 'Блэквуд', 'Торн', 'Стерн', 'Вулф'];
const CALLSIGNS = ['Клык', 'Гадюка', 'Шрам', 'Шторм', 'Тень', 'Акула', 'Призрак', 'Хаос', 'Гром', 'Вихрь'];

const CRIMES_LIST = [
  'Абордаж транспортного судна ОФЗ с гелием-3',
  'Нелегальная перевозка нейро-стимуляторов «Чёрный Неон»',
  'Взлом навигационных маяков и глушение сигналов бедствия',
  'Вооружённое сопротивление патрулю Космической Полиции',
  'Контрабанда запрещённых кристаллов «Кровавый Опал»',
  'Установка скрытых плазменных мин на торговых маршрутах',
  'Торговля крадеными кодами допуска Синдиката',
  'Шантаж шахтёрской колонии Сириуса'
];

export function generateArrestedPirate(threatLevel: 'low' | 'medium' | 'high' | 'legendary' = 'medium'): ArrestedPirate {
  const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  const callsign = CALLSIGNS[Math.floor(Math.random() * CALLSIGNS.length)];

  let rank: ArrestedPirate['rank'] = 'Мародёр';
  let baseBounty = 350;
  let baseBribe = 500;

  if (threatLevel === 'low') {
    rank = 'Мародёр';
    baseBounty = 300 + Math.floor(Math.random() * 200);
    baseBribe = 450 + Math.floor(Math.random() * 250);
  } else if (threatLevel === 'medium') {
    rank = Math.random() > 0.5 ? 'Штурмовик' : 'Кибер-Взломщик';
    baseBounty = 600 + Math.floor(Math.random() * 350);
    baseBribe = 850 + Math.floor(Math.random() * 400);
  } else if (threatLevel === 'high') {
    rank = 'Капитан Корсаров';
    baseBounty = 1100 + Math.floor(Math.random() * 500);
    baseBribe = 1600 + Math.floor(Math.random() * 700);
  } else {
    rank = 'Барон Синдиката';
    baseBounty = 2200 + Math.floor(Math.random() * 900);
    baseBribe = 3200 + Math.floor(Math.random() * 1200);
  }

  // Pick 2 random crimes
  const shuffledCrimes = [...CRIMES_LIST].sort(() => 0.5 - Math.random());
  const crimes = shuffledCrimes.slice(0, 2);

  // Secret stash info for interrogation
  const stashTypes: Array<ArrestedPirate['intelSecret']> = [
    {
      type: 'cache',
      description: 'Координаты тайника корсаров в астероидном поле: контейнер с титановыми сплавами и кредитами!',
      rewardCredits: 400 + Math.floor(Math.random() * 350),
      rewardAlloys: 30 + Math.floor(Math.random() * 25)
    },
    {
      type: 'weapon_schematic',
      description: 'Шифр доступа к арсеналу Синдиката: заряды антиматерии и кредиты!',
      rewardCredits: 600 + Math.floor(Math.random() * 400),
      rewardAntimatter: 5 + Math.floor(Math.random() * 5)
    },
    {
      type: 'ambush_warning',
      description: 'Расшифровка частот пиратского перехвата: предупреждение снижает риск засад на 25%!',
      rewardCredits: 300 + Math.floor(Math.random() * 200)
    }
  ];

  const chosenSecret = stashTypes[Math.floor(Math.random() * stashTypes.length)];

  return {
    id: `pirate_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: `${firstName} ${lastName}`,
    callsign,
    rank,
    crimes,
    bounty: baseBounty,
    bribeOffer: baseBribe,
    intelRevealed: false,
    intelSecret: chosenSecret,
    threatLevel,
    arrestDate: `Зв. Дата ${Math.floor(Math.random() * 50 + 2180)}.${Math.floor(Math.random() * 9 + 1)}`
  };
}
