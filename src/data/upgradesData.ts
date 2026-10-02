import { ShipUpgrade, ResearchTech, CrewMember, ShipStats } from '../types/game';

export const initialShipStats: ShipStats = {
  id: 'normandy_x',
  name: 'Нормандия-X',
  className: 'Исследовательский Корвет Класса "Пилигрим"',
  hull: 100,
  maxHull: 100,
  shields: 75,
  maxShields: 75,
  energy: 100,
  maxEnergy: 100,
  cargoCapacity: 150,
  warpRange: 280, // световые годы
  weaponsPower: 25,
  evasion: 15,
  specialPerk: {
    title: 'Тахионные Сенсоры',
    description: '+25% к получению науки при сканировании и +10% к стабильности щитов в бою.'
  },
  subsystems: {
    engines: { name: 'Двигатели', health: 100, maxHealth: 100 },
    weapons: { name: 'Орудийная турель', health: 100, maxHealth: 100 },
    shields: { name: 'Генератор щита', health: 100, maxHealth: 100 },
    lifeSupport: { name: 'Система жизнеобеспечения', health: 100, maxHealth: 100 }
  },
  powerAllocation: {
    weapons: 35,
    shields: 35,
    engines: 30
  }
};

export const availableUpgrades: ShipUpgrade[] = [
  {
    id: 'hyperdrive_t2',
    name: 'Варп-Двигатель "Тахион-2"',
    category: 'engines',
    categoryName: 'Двигатели',
    tier: 1,
    description: 'Увеличивает дальность гиперпространственных прыжков до 420 св. лет и снижает расход топлива на 20%.',
    cost: { credits: 450, alloys: 60 },
    effect: '+140 св. лет к радиусу прыжка, -20% расход топлива',
    installed: false,
    applyUpgrade: (stats) => ({ ...stats, warpRange: stats.warpRange + 140 })
  },
  {
    id: 'hyperdrive_t3',
    name: 'Гравитационный Сдвигатель "Сингулярность"',
    category: 'engines',
    categoryName: 'Двигатели',
    tier: 2,
    description: 'Позволяет прыгать через секторы сквозь чёрные дыры и туманности без ограничений по расстоянию.',
    cost: { credits: 1200, alloys: 120, antimatter: 10 },
    effect: '+300 св. лет к радиусу прыжка',
    installed: false,
    applyUpgrade: (stats) => ({ ...stats, warpRange: stats.warpRange + 300 })
  },
  {
    id: 'shields_t2',
    name: 'Бифазный Ионный Барьер',
    category: 'shields',
    categoryName: 'Щиты',
    tier: 1,
    description: 'Уплотняет защитное плазменное поле корабля, поглощая мощные кинетические удары.',
    cost: { credits: 380, alloys: 50, science: 30 },
    effect: '+50 к максимальной ёмкости щитов',
    installed: false,
    applyUpgrade: (stats) => ({ ...stats, maxShields: stats.maxShields + 50, shields: stats.shields + 50 })
  },
  {
    id: 'shields_t3',
    name: 'Матрица Тёмного Поля',
    category: 'shields',
    categoryName: 'Щиты',
    tier: 2,
    description: 'Щит использует антиматерию для мгновенного отражения 30% входящего урона.',
    cost: { credits: 950, alloys: 90, antimatter: 15 },
    effect: '+80 к щитам и быстрое восстановление в бою',
    installed: false,
    applyUpgrade: (stats) => ({ ...stats, maxShields: stats.maxShields + 80, shields: stats.shields + 80 })
  },
  {
    id: 'weapons_t2',
    name: 'Сдвоенные Плазменные Пушки',
    category: 'weapons',
    categoryName: 'Вооружение',
    tier: 1,
    description: 'Тяжёлые импульсные излучатели, прожигающие обшивку пиратских корветов.',
    cost: { credits: 500, alloys: 70 },
    effect: '+20 к огневой мощи корабля',
    installed: false,
    applyUpgrade: (stats) => ({ ...stats, weaponsPower: stats.weaponsPower + 20 })
  },
  {
    id: 'weapons_t3',
    name: 'Рельсотрон "Разрушитель Сверхновых"',
    category: 'weapons',
    categoryName: 'Вооружение',
    tier: 2,
    description: 'Магнитный ускоритель стреляет снарядами с вольфрамовым сердечником на околосветовой скорости.',
    cost: { credits: 1400, alloys: 150, antimatter: 12 },
    effect: '+45 к огневой мощи корабля',
    installed: false,
    applyUpgrade: (stats) => ({ ...stats, weaponsPower: stats.weaponsPower + 45 })
  },
  {
    id: 'weapons_gauss_thanatos',
    name: 'Гиперзвуковая Пушка Гаусса "Танатос"',
    category: 'weapons',
    categoryName: 'Вооружение',
    tier: 2,
    description: 'Сверхскоростная кинетическая артиллерия, прошибающая обшивку вражеских дредноутов без задержек.',
    cost: { credits: 1100, alloys: 130 },
    effect: '+35 к огневой мощи и бронебойный залп',
    installed: false,
    applyUpgrade: (stats) => ({ ...stats, weaponsPower: stats.weaponsPower + 35 })
  },
  {
    id: 'weapons_nuke_launcher',
    name: 'Пусковая Шахта Ядерок "Судный Час"',
    category: 'weapons',
    categoryName: 'Вооружение',
    tier: 3,
    description: 'Тяжёлая пусковая система термоядерных ракет субсветового ускорения. Стирает в пепел вражеские звенья.',
    cost: { credits: 2900, alloys: 280, antimatter: 20 },
    effect: '+80 к огневой мощи и усиление ядерных ударов',
    installed: false,
    applyUpgrade: (stats) => ({ ...stats, weaponsPower: stats.weaponsPower + 80 })
  },
  {
    id: 'weapons_antimatter_torpedoes',
    name: 'Торпедный Комплекс "Чёрная Дыра"',
    category: 'weapons',
    categoryName: 'Вооружение',
    tier: 3,
    description: 'Кластерные торпеды с зарядом сжатой антиматерии. Создают гравитационный разрыв в точке попадания.',
    cost: { credits: 2100, alloys: 190, science: 90, antimatter: 15 },
    effect: '+60 к огневой мощи корабля',
    installed: false,
    applyUpgrade: (stats) => ({ ...stats, weaponsPower: stats.weaponsPower + 60 })
  },
  {
    id: 'weapons_tachyon_beam',
    name: 'Тахионный Дезинтегратор "Астральный Шпиль"',
    category: 'weapons',
    categoryName: 'Вооружение',
    tier: 3,
    description: 'Орудие Древних Зодчих, стреляющее лучом тахионных частиц. Расщепляет молекулярные связи вражеской брони.',
    cost: { credits: 3100, alloys: 260, science: 140, antimatter: 18 },
    effect: '+75 к огневой мощи и пробитие щитов',
    installed: false,
    applyUpgrade: (stats) => ({ ...stats, weaponsPower: stats.weaponsPower + 75 })
  },
  {
    id: 'weapons_cluster_bomb',
    name: 'Кластерная Фотонная Батарея "Гекатонхейр"',
    category: 'weapons',
    categoryName: 'Вооружение',
    tier: 3,
    description: 'Залповая кассетная система, запускающая шквал самонаводящихся фотонных боеприпасов по площади.',
    cost: { credits: 2600, alloys: 230, science: 80 },
    effect: '+55 к огневой мощи и урон по группе врагов',
    installed: false,
    applyUpgrade: (stats) => ({ ...stats, weaponsPower: stats.weaponsPower + 55 })
  },
  {
    id: 'weapons_singularity_lance',
    name: 'Квантовый Аннигилятор Звёзд "Апокалипсис"',
    category: 'weapons',
    categoryName: 'Вооружение',
    tier: 4,
    description: 'Запрещённое галактическое супер-оружие судного дня. Фокусирует микро-сингулярность, аннигилируя целые эскадры.',
    cost: { credits: 6800, alloys: 550, science: 280, antimatter: 45 },
    effect: '+120 к огневой мощи корабля',
    installed: false,
    applyUpgrade: (stats) => ({ ...stats, weaponsPower: stats.weaponsPower + 120 })
  },
  {
    id: 'cargo_t2',
    name: 'Грузовой Трюм с Компрессией Пространства',
    category: 'cargo',
    categoryName: 'Трюм',
    tier: 1,
    description: 'Локальные микро-искажения метрики пространства удваивают вместимость торгового отсека.',
    cost: { credits: 350, alloys: 40 },
    effect: '+150 единиц к вместимости трюма',
    installed: false,
    applyUpgrade: (stats) => ({ ...stats, cargoCapacity: stats.cargoCapacity + 150 })
  },
  {
    id: 'hull_t2',
    name: 'Композитная Нано-Броня',
    category: 'hull',
    categoryName: 'Корпус',
    tier: 1,
    description: 'Слои карбида кремния и титанового графена. Повышает прочность корпуса корабля.',
    cost: { credits: 400, alloys: 80 },
    effect: '+60 к максимальной прочности корпуса',
    installed: false,
    applyUpgrade: (stats) => ({ ...stats, maxHull: stats.maxHull + 60, hull: stats.hull + 60 })
  }
];

export const availableCrew: CrewMember[] = [
  {
    id: 'crew_1',
    name: 'Капитан Елена Векслер',
    role: 'captain',
    roleName: 'Капитан',
    bonusText: '+15% к наградам за выполнение миссий и торговлю',
    level: 1,
    salary: 20,
    portraitIcon: 'Commander'
  },
  {
    id: 'crew_2',
    name: 'Главный Инженер Кайл Торн',
    role: 'engineer',
    roleName: 'Инженер',
    bonusText: 'Автоматический ремонт систем и +25% к регенерации щитов',
    level: 1,
    salary: 15,
    portraitIcon: 'Wrench'
  },
  {
    id: 'crew_3',
    name: 'Астронавигатор Зара Чен',
    role: 'navigator',
    roleName: 'Штурман',
    bonusText: '-30% расход топлива при межзвёздных прыжках',
    level: 1,
    salary: 18,
    portraitIcon: 'Compass'
  },
  {
    id: 'crew_4',
    name: 'Доктор Артур Рено',
    role: 'scientist',
    roleName: 'Учёный',
    bonusText: '+40% научных данных при сканировании планет и реликвий',
    level: 1,
    salary: 22,
    portraitIcon: 'Atom'
  },
  {
    id: 'crew_5',
    name: 'Ветеран Семён "Гром" Морозов',
    role: 'tactician',
    roleName: 'Оружейник',
    bonusText: '+25% к шансу критического попадания в бою',
    level: 1,
    salary: 25,
    portraitIcon: 'Crosshair'
  }
];

export const initialTechTree: ResearchTech[] = [
  {
    id: 'tech_mining_efficiency',
    name: 'Лазерное Бурение Глубоких Пластов',
    category: 'economy',
    categoryName: 'Экономика',
    tier: 1,
    cost: 40,
    description: 'Увеличивает добычу сплавов и кристаллов на планетах на 50%.',
    unlocked: false
  },
  {
    id: 'tech_shield_harmonics',
    name: 'Гармонические Фазовые Щиты',
    category: 'defense',
    categoryName: 'Оборона',
    tier: 1,
    cost: 50,
    description: 'Щиты поглощают на 20% больше урона от лазерного оружия.',
    unlocked: false
  },
  {
    id: 'tech_dark_matter_drive',
    name: 'Двигатели на Тёмной Материи',
    category: 'propulsion',
    categoryName: 'Двигатели',
    tier: 2,
    cost: 100,
    prerequisiteId: 'tech_mining_efficiency',
    description: 'Уменьшает расход топлива в прыжках вдвое и повышает уклонение на 15%.',
    unlocked: false
  },
  {
    id: 'tech_precursor_translation',
    name: 'Расшифровка Языка Зодчих',
    category: 'xenology',
    categoryName: 'Ксенология',
    tier: 2,
    cost: 120,
    description: 'Открывает возможность активировать порталы Предтеч и находить скрытые реликвии.',
    unlocked: false
  },
  {
    id: 'tech_colony_automation',
    name: 'Роботизированные Терраформеры',
    category: 'economy',
    categoryName: 'Экономика',
    tier: 2,
    cost: 140,
    prerequisiteId: 'tech_mining_efficiency',
    description: 'Колонии производят вдвое больше ресурсов и снижают затраты энергии.',
    unlocked: false
  },
  {
    id: 'tech_omega_catalyst',
    name: 'Омега-Синтезатор Реальности',
    category: 'xenology',
    categoryName: 'Ксенология',
    tier: 3,
    cost: 250,
    prerequisiteId: 'tech_precursor_translation',
    description: 'Ключевая технология для запуска Врат Бездны и завершения Великой Одиссеи.',
    unlocked: false
  }
];
