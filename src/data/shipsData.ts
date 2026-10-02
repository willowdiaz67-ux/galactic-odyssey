import { PlayableShip, ShipStats } from '../types/game';

export const PLAYABLE_SHIPS: PlayableShip[] = [
  {
    id: 'normandy_x',
    name: 'Нормандия-X',
    className: 'Исследовательский Корвет Класса "Пилигрим"',
    role: 'Разведчик и Научный Корвет',
    tier: 1,
    faction: 'terran',
    description: 'Многоцелевой корабль дальней экспедиции. Оснащён тахионными сканерами, автономной лабораторией и сбалансированным генератором щита.',
    specialPerk: {
      title: 'Тахионные Сенсоры',
      description: '+25% к получению науки при сканировании и +10% к стабильности щитов в бою.'
    },
    baseStats: {
      hull: 100,
      maxHull: 100,
      shields: 75,
      maxShields: 75,
      energy: 100,
      maxEnergy: 100,
      cargoCapacity: 150,
      warpRange: 280,
      weaponsPower: 25,
      evasion: 15
    },
    price: {
      credits: 0,
      alloys: 0
    },
    image: '/src/assets/images/flagship_astraea_1790243922711.jpg',
    accentColor: '#38BDF8'
  },
  {
    id: 'void_phantom',
    name: 'Тень Пустоты',
    className: 'Стелс-Перехватчик Класса "Фантом"',
    role: 'Скоростной Диверсант и Перехватчик',
    tier: 2,
    faction: 'syndicate',
    description: 'Ультралегкий рейдер с радиопоглощающим покрытием корпуса и форсированными маршевыми ионными ускорителями.',
    specialPerk: {
      title: 'Оптический Камуфляж',
      description: '+15% к базовому уклонению и +40% к урону первого лазерного выстрела в бою.'
    },
    baseStats: {
      hull: 80,
      maxHull: 80,
      shields: 65,
      maxShields: 65,
      energy: 120,
      maxEnergy: 120,
      cargoCapacity: 90,
      warpRange: 360,
      weaponsPower: 34,
      evasion: 32
    },
    price: {
      credits: 1200,
      alloys: 95
    },
    accentColor: '#A855F7'
  },
  {
    id: 'aegis_bastion',
    name: 'Эгида-V',
    className: 'Тяжёлый Фрегат Класса "Бастион"',
    role: 'Бронированный Танк и Защитник',
    tier: 2,
    faction: 'terran',
    description: 'Оборонительный оплот флота Земли. Монолитные бронеплиты и двухконтурные энергощиты выдерживают шквальный огонь.',
    specialPerk: {
      title: 'Фаланга Нано-Брони',
      description: 'Поглощает 20% всего входящего урона и предотвращает критические удары врага.'
    },
    baseStats: {
      hull: 180,
      maxHull: 180,
      shields: 140,
      maxShields: 140,
      energy: 110,
      maxEnergy: 110,
      cargoCapacity: 220,
      warpRange: 240,
      weaponsPower: 28,
      evasion: 8
    },
    price: {
      credits: 2400,
      alloys: 220
    },
    accentColor: '#3B82F6'
  },
  {
    id: 'valkyrie_storm',
    name: 'Огненный Буревестник',
    className: 'Ракетный Штурмовик Класса "Валькирия"',
    role: 'Ракетный Катер Дальнего Боя',
    tier: 3,
    faction: 'miners',
    description: 'Модифицированный тяжелый штурмовик горнорудных гильдий с открытыми торпедными шахтами и усиленным импульсным орудием.',
    specialPerk: {
      title: 'Кассетные Торпеды',
      description: 'Дальность пуска торпед +2 клетки, урон торпед увеличен на +35%.'
    },
    baseStats: {
      hull: 130,
      maxHull: 130,
      shields: 100,
      maxShields: 100,
      energy: 115,
      maxEnergy: 115,
      cargoCapacity: 170,
      warpRange: 320,
      weaponsPower: 44,
      evasion: 18
    },
    price: {
      credits: 3800,
      alloys: 310,
      science: 60
    },
    accentColor: '#F97316'
  },
  {
    id: 'syndicate_leviathan',
    name: 'Левиафан Синдиката',
    className: 'Линейный Крейсер Класса "Джаггернаут"',
    role: 'Тяжелый Крейсер и Торговый Флагман',
    tier: 3,
    faction: 'syndicate',
    description: 'Огромный бронированный крейсер криминальных баронов. Сочетает огромный трюм для контрабанды и спаренные кинетические рейлганы.',
    specialPerk: {
      title: 'Бронебойные Рейлганы',
      description: 'Выстрелы игнорируют 25% брони цели, вместимость трюма расширена до 380 ед.'
    },
    baseStats: {
      hull: 240,
      maxHull: 240,
      shields: 130,
      maxShields: 130,
      energy: 130,
      maxEnergy: 130,
      cargoCapacity: 380,
      warpRange: 300,
      weaponsPower: 48,
      evasion: 10
    },
    price: {
      credits: 5600,
      alloys: 480,
      science: 90
    },
    accentColor: '#EF4444'
  },
  {
    id: 'orion_precursor',
    name: 'Апекс Предтеч',
    className: 'Реликтовый Корвет Класса "Орион"',
    role: 'Ксено-Корабль и Фазовый Фаворит',
    tier: 4,
    faction: 'precursors',
    description: 'Древний артефактный звездолёт Зодчих, найденный в руинах черной дыры. Корпус из живого кристаллического сплава с саморегенерацией.',
    specialPerk: {
      title: 'Эхо Предтеч',
      description: 'Каждый ход автоматически восстанавливает +20 SP щитов и снижает расход топлива на 40%.'
    },
    baseStats: {
      hull: 170,
      maxHull: 170,
      shields: 200,
      maxShields: 200,
      energy: 150,
      maxEnergy: 150,
      cargoCapacity: 200,
      warpRange: 520,
      weaponsPower: 52,
      evasion: 24
    },
    price: {
      credits: 8200,
      alloys: 600,
      science: 150,
      antimatter: 10
    },
    image: '/src/assets/images/precursor_relic_1790243984919.jpg',
    accentColor: '#10B981'
  },
  {
    id: 'helios_dreadnought',
    name: 'Гелиос-9',
    className: 'Плазменный Дредноут Класса "Солнечный Шторм"',
    role: 'Осадный Артиллерийский Дредноут',
    tier: 4,
    faction: 'terran',
    description: 'Сверхмощный линкор с термоядерным реактором от сверхновой. Разрушает строй вражеских эскадр каскадным плазменным огнём.',
    specialPerk: {
      title: 'Протуберанец Термоядерного Огня',
      description: 'ЭМИ-разряд наносит двойной урон щитам и поджигает обшивку цели.'
    },
    baseStats: {
      hull: 310,
      maxHull: 310,
      shields: 180,
      maxShields: 180,
      energy: 140,
      maxEnergy: 140,
      cargoCapacity: 300,
      warpRange: 350,
      weaponsPower: 62,
      evasion: 6
    },
    price: {
      credits: 11500,
      alloys: 850,
      science: 200,
      antimatter: 20
    },
    accentColor: '#F59E0B'
  },
  {
    id: 'quasar_titan',
    name: 'Квазар-Титан',
    className: 'Флагманский Носитель Класса "Сверхновая"',
    role: 'Авианосец-Крепость и База Дронов',
    tier: 5,
    faction: 'terran',
    description: 'Мобильная космическая цитадель, способная нести эскадрильи автоматических боевых дронов и запасы для колонизации целых секторов.',
    specialPerk: {
      title: 'Автономное Авиакрыло',
      description: 'В начале каждого боевого хода боевой дрон наносит 20 ед. прямого урона случайному врагу.'
    },
    baseStats: {
      hull: 360,
      maxHull: 360,
      shields: 240,
      maxShields: 240,
      energy: 160,
      maxEnergy: 160,
      cargoCapacity: 480,
      warpRange: 600,
      weaponsPower: 68,
      evasion: 12
    },
    price: {
      credits: 15000,
      alloys: 1200,
      science: 300,
      antimatter: 35
    },
    accentColor: '#06B6D4'
  },
  {
    id: 'cerberus_void_eater',
    name: 'Пожиратель Бездны',
    className: 'Антиматерийный Рейдер Класса "Цербер"',
    role: 'Экзотический Вампир Бездны',
    tier: 5,
    faction: 'precursors',
    description: 'Корабль-фантом, синтезированный из материи сингулярности. Питается энергией взрывов вражеских кораблей и поглощает щиты.',
    specialPerk: {
      title: 'Вампиризм Гравитонов',
      description: '25% нанесённого врагам урона конвертируется в мгновенное восстановление собственных щитов.'
    },
    baseStats: {
      hull: 260,
      maxHull: 260,
      shields: 220,
      maxShields: 220,
      energy: 175,
      maxEnergy: 175,
      cargoCapacity: 250,
      warpRange: 580,
      weaponsPower: 74,
      evasion: 26
    },
    price: {
      credits: 19500,
      alloys: 1500,
      science: 450,
      antimatter: 50
    },
    accentColor: '#EC4899'
  },
  {
    id: 'omega_behemoth',
    name: 'Астрал-Бегемот',
    className: 'Осадный Галактический Колосс Класса "Омега-10"',
    role: 'Верховный Флагман Галактики',
    tier: 5,
    faction: 'terran',
    description: 'Величайший титан, построенный на орбитальных верфях Юпитера. Обладает сингулярным гиперядром и непревзойдённой огневой мощью.',
    specialPerk: {
      title: 'Омега-Реактор Сверхмассы',
      description: 'Дарует +1 постоянное Очко Действий (AP) каждый ход в тактическом бою и колоссальную выносливость.'
    },
    baseStats: {
      hull: 480,
      maxHull: 480,
      shields: 320,
      maxShields: 320,
      energy: 200,
      maxEnergy: 200,
      cargoCapacity: 600,
      warpRange: 750,
      weaponsPower: 85,
      evasion: 14
    },
    price: {
      credits: 26000,
      alloys: 2000,
      science: 600,
      antimatter: 75
    },
    accentColor: '#EAB308'
  },
  {
    id: 'doomsday_dreadnought',
    name: 'Армагеддон-X «Судный День»',
    className: 'Тяжёлый Термоядерный Дредноут Класса "Судный День"',
    role: 'Стратегический Носитель Ядерок',
    tier: 4,
    faction: 'terran',
    description: 'Колоссальный флагман с шестнадцатью шахтами термоядерных ракет и рельсотронной батареей. Спроектирован для тотального подавления вражеских флотов.',
    specialPerk: {
      title: 'Термоядерный Арсенал',
      description: 'Дарует +3 ядерных боеголовки на борт. Урон от ядерных ударов и торпед увеличен на +45%!'
    },
    baseStats: {
      hull: 360,
      maxHull: 360,
      shields: 260,
      maxShields: 260,
      energy: 180,
      maxEnergy: 180,
      cargoCapacity: 450,
      warpRange: 420,
      weaponsPower: 75,
      evasion: 10
    },
    price: {
      credits: 11000,
      alloys: 900,
      science: 200,
      antimatter: 15
    },
    accentColor: '#EF4444'
  },
  {
    id: 'nuclear_corsair',
    name: 'Корсар «Царь-Бомба»',
    className: 'Ракетно-Торпедный Крейсер Класса "Шайтан"',
    role: 'Тяжёлый Ракетный Рейдер',
    tier: 3,
    faction: 'syndicate',
    description: 'Бронированный перехватчик корсаров с кустарно модернизированными пусковыми шахтами термоядерных торпед.',
    specialPerk: {
      title: 'Контрабандные Боеголовки',
      description: 'Торпеды и ядерки наносят критический урон и мгновенно сжигают вражеские щиты.'
    },
    baseStats: {
      hull: 220,
      maxHull: 220,
      shields: 160,
      maxShields: 160,
      energy: 140,
      maxEnergy: 140,
      cargoCapacity: 340,
      warpRange: 380,
      weaponsPower: 58,
      evasion: 22
    },
    price: {
      credits: 5200,
      alloys: 440,
      science: 80
    },
    accentColor: '#F59E0B'
  },
  {
    id: 'tsar_apocalypse',
    name: 'Царь-Апокалипсис',
    className: 'Сверхтяжёлый Ракетоносец Класса "Судный День"',
    role: 'Стратегический Носитель Ядерок и Уничтожитель Флотов',
    tier: 5,
    faction: 'terran',
    description: 'Вершина военной инженерной мысли Земли. Тяжёлый ракетный крейсер с титановой бронёй и шахтами термоядерных боеголовок сверхвысокой мощности.',
    specialPerk: {
      title: 'Ядерный Шквал',
      description: 'Дарует +5 термоядерных боеголовок (ядерок) на борт. Урон всех ядерных ударов увеличен на +50%, а радиус поражения охватывает всю вражескую эскадру!'
    },
    baseStats: {
      hull: 440,
      maxHull: 440,
      shields: 290,
      maxShields: 290,
      energy: 195,
      maxEnergy: 195,
      cargoCapacity: 520,
      warpRange: 480,
      weaponsPower: 90,
      evasion: 12
    },
    price: {
      credits: 14000,
      alloys: 1100,
      science: 260,
      antimatter: 30
    },
    accentColor: '#EF4444'
  },
  {
    id: 'tachyon_destroyer',
    name: 'Тахионный Каратель',
    className: 'Тяжёлый Артиллерийский Эсминец Класса "Цербер-T"',
    role: 'Снайпер Дальнего Боя и Пробиватель Брони',
    tier: 3,
    faction: 'syndicate',
    description: 'Усиленный боевой корабль с тахионными излучателями и бронебойными пушками Гаусса. Спроектирован для точечной ликвидации флагманов.',
    specialPerk: {
      title: 'Тахионный Пробой',
      description: 'Огневая мощь орудий увеличена на +35%, критические попадания пробивают щиты противника без потерь энергии.'
    },
    baseStats: {
      hull: 230,
      maxHull: 230,
      shields: 170,
      maxShields: 170,
      energy: 145,
      maxEnergy: 145,
      cargoCapacity: 320,
      warpRange: 410,
      weaponsPower: 64,
      evasion: 20
    },
    price: {
      credits: 6200,
      alloys: 520,
      science: 120
    },
    accentColor: '#8B5CF6'
  }
];

export function createShipStatsFromPlayable(ship: PlayableShip, previousStats?: ShipStats): ShipStats {
  const subsystems = previousStats?.subsystems ?? {
    engines: { name: 'Двигатели', health: 100, maxHealth: 100 },
    weapons: { name: 'Орудийная турель', health: 100, maxHealth: 100 },
    shields: { name: 'Генератор щита', health: 100, maxHealth: 100 },
    lifeSupport: { name: 'Система жизнеобеспечения', health: 100, maxHealth: 100 }
  };

  const powerAllocation = previousStats?.powerAllocation ?? {
    weapons: 35,
    shields: 35,
    engines: 30
  };

  return {
    id: ship.id,
    name: ship.name,
    className: ship.className,
    hull: ship.baseStats.hull,
    maxHull: ship.baseStats.maxHull,
    shields: ship.baseStats.shields,
    maxShields: ship.baseStats.maxShields,
    energy: ship.baseStats.energy,
    maxEnergy: ship.baseStats.maxEnergy,
    cargoCapacity: ship.baseStats.cargoCapacity,
    warpRange: ship.baseStats.warpRange,
    weaponsPower: ship.baseStats.weaponsPower,
    evasion: ship.baseStats.evasion,
    specialPerk: ship.specialPerk,
    subsystems,
    powerAllocation
  };
}
