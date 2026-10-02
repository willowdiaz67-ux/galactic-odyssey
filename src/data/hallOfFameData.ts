import { CommanderProgression, Resources, ShipStats } from '../types/game';
import { Kingdom, KingdomTitle } from '../types/kingdom';

export interface HallOfFameCommander {
  id: string;
  name: string;
  title: string;
  universe: 'bleach' | 'dragon_ball' | 'galaxy';
  universeName: string;
  factionName: string;
  avatarEmoji: string;
  themeColor: string;
  score: number;
  militaryPower: number;
  rankTier: 'SSS+' | 'SSS' | 'SS+' | 'SS' | 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B';
  quote: string;
  specialization: string;
  isPlayer?: boolean;
  rankPosition?: number;
  activeTitle?: KingdomTitle | null;
}

export const FAMOUS_NPC_COMMANDERS: Omit<HallOfFameCommander, 'rankPosition'>[] = [
  {
    id: 'fame_yamamoto',
    name: 'Главнокомандующий Ямамото Генрюсай',
    title: 'Абсолютный Меч Готей 13, Капитан 1-го Отряда',
    universe: 'bleach',
    universeName: 'Bleach: Сообщество Душ',
    factionName: 'Готей 13',
    avatarEmoji: '🔥',
    themeColor: '#EF4444',
    score: 12850,
    militaryPower: 98000,
    rankTier: 'SSS+',
    quote: '«Справедливость не знает компромиссов. Мой клинок испепелит любую тьму во вселенной».',
    specialization: 'Термоядерная пирокинетика и абсолютное тактическое превосходство'
  },
  {
    id: 'fame_lucius',
    name: 'Император Люциус III Валуа',
    title: 'Верховный Монарх Солнечной Метрополии ОФЗ',
    universe: 'galaxy',
    universeName: 'Astraea: Солнечная Система',
    factionName: 'Федерация Терры (ОФЗ)',
    avatarEmoji: '🏛️',
    themeColor: '#38BDF8',
    score: 11400,
    militaryPower: 89500,
    rankTier: 'SSS',
    quote: '«Звёздный флот человечества — щит цивилизации и гарант галактического мира».',
    specialization: 'Имперские армады дредноутов и орбитальная дипломатия'
  },
  {
    id: 'fame_vegeta',
    name: 'Принц Веджета',
    title: 'Гордый Принц Всех Сайянов, Непобедимый Стратег',
    universe: 'dragon_ball',
    universeName: 'Dragon Ball: Сайяны',
    factionName: 'Королевский Флот Сайянов',
    avatarEmoji: '⚡',
    themeColor: '#6366F1',
    score: 10920,
    militaryPower: 85000,
    rankTier: 'SS+',
    quote: '«Я не позволю никому превзойти сайянскую кровь! Моя сила сокрушает планеты!»',
    specialization: 'Энергетические залпы Final Flash и штурмовые прорывы'
  },
  {
    id: 'fame_malakai',
    name: 'Малахай «Чёрный Вихрь»',
    title: 'Теневой Король Корсаров, Владыка Завесы',
    universe: 'galaxy',
    universeName: 'Astraea: Завеса Веила',
    factionName: 'Синдикат Свободных Звёзд',
    avatarEmoji: '☠️',
    themeColor: '#F59E0B',
    score: 9750,
    militaryPower: 76000,
    rankTier: 'SS',
    quote: '«В варпе нет законов, кроме калибра твоих турелей и верности команды».',
    specialization: 'Абордажные рейды, контрабанда и засады из гиперпространства'
  },
  {
    id: 'fame_goku',
    name: 'Сон Гоку',
    title: 'Легендарный Супер Сайян, Защитник Земли',
    universe: 'dragon_ball',
    universeName: 'Dragon Ball: Земля & Намек',
    factionName: 'Защитники Земли',
    avatarEmoji: '🐉',
    themeColor: '#F97316',
    score: 9400,
    militaryPower: 74000,
    rankTier: 'SS',
    quote: '«Давай сразимся на пределе сил! В бескрайнем космосе столько удивительных соперников!»',
    specialization: 'Сверхсветовое мгновенное перемещение и Камехамеха'
  },
  {
    id: 'fame_shunsui',
    name: 'Сюнсуй Кёраку',
    title: 'Капитан 8-го Отряда, Мастер Теневых Игр',
    universe: 'bleach',
    universeName: 'Bleach: Сообщество Душ',
    factionName: 'Готей 13',
    avatarEmoji: '🌸',
    themeColor: '#EC4899',
    score: 8850,
    militaryPower: 68500,
    rankTier: 'S+',
    quote: '«Война — это не место для излишней серьёзности, пока не придёт время обнажить второй клинок».',
    specialization: 'Иллюзорные тени, духовные маневры и непредсказуемая тактика'
  },
  {
    id: 'fame_celestia',
    name: 'Королева-Оракул Селестия',
    title: 'Верховная Архивариус и Королева Врат Предтеч',
    universe: 'galaxy',
    universeName: 'Astraea: Пульсар & Врата',
    factionName: 'Конкорд Предтеч',
    avatarEmoji: '🔮',
    themeColor: '#C084FC',
    score: 8200,
    militaryPower: 63000,
    rankTier: 'S',
    quote: '«Ткань пространства помнит каждый шаг Зодчих. Будущее открыто тем, кто умеет слушать звёзды».',
    specialization: 'Квантовая телеметрия, уловители антиматерии и псионические щиты'
  },
  {
    id: 'fame_thorgrim',
    name: 'Торгрим «Железный Кулак»',
    title: 'Король Недр, Верховный Глава Горных Гильдий',
    universe: 'galaxy',
    universeName: 'Astraea: Система Сириус',
    factionName: 'Шахтёрский Синдикат',
    avatarEmoji: '⛏️',
    themeColor: '#10B981',
    score: 7450,
    militaryPower: 56000,
    rankTier: 'S',
    quote: '«Толстая титановая броня и верный плазменный резак надежнее любых красивых слов».',
    specialization: 'Тяжёлое бронирование, астероидная артиллерия и промышленная фортификация'
  },
  {
    id: 'fame_vance',
    name: 'Шериф Маркус Вэнс',
    title: 'Верховный Маршал Патрульного Корпуса ОФЗ',
    universe: 'galaxy',
    universeName: 'Astraea: Патруль',
    factionName: 'Полиция ОФЗ',
    avatarEmoji: '🛡️',
    themeColor: '#0EA5E9',
    score: 5500,
    militaryPower: 42000,
    rankTier: 'A+',
    quote: '«Ни один контрабандист и пират не уйдёт от правосудия Патруля в секторах Ядра».',
    specialization: 'Перехват корсаров, гарпунные системы и досмотровые протоколы'
  },
  {
    id: 'fame_bulma',
    name: 'Бульма Брифинг',
    title: 'Главный Научный Гений Capsule Corporation',
    universe: 'dragon_ball',
    universeName: 'Dragon Ball: Земля',
    factionName: 'Capsule Corporation',
    avatarEmoji: '🔬',
    themeColor: '#06B6D4',
    score: 4700,
    militaryPower: 35000,
    rankTier: 'A',
    quote: '«Мои радары и капсульные корабли способны исследовать даже параллельные вселенные!»',
    specialization: 'Капсульные технологии, квантовые сенсоры и межзвёздные радары'
  },
  {
    id: 'fame_bloody_fang',
    name: 'Капитан «Кровавый Клык»',
    title: 'Главарь Банды Астероидных Опустошителей',
    universe: 'galaxy',
    universeName: 'Astraea: Внешний Рубеж',
    factionName: 'Мародёры Рубежа',
    avatarEmoji: '🐺',
    themeColor: '#E11D48',
    score: 3850,
    militaryPower: 26000,
    rankTier: 'B+',
    quote: '«Легкая добыча сама плывет в руки, пока патрули спят в своих тёплых казармах».',
    specialization: 'Быстрые налёты на торговые конвои и минные заграждения'
  },
  {
    id: 'fame_renji',
    name: 'Лейтенант Ренджи Абараи',
    title: 'Лейтенант 6-го Отряда Готей 13',
    universe: 'bleach',
    universeName: 'Bleach: Сообщество Душ',
    factionName: 'Готей 13',
    avatarEmoji: '🗡️',
    themeColor: '#DC2626',
    score: 3200,
    militaryPower: 22000,
    rankTier: 'B',
    quote: '«Реви, Забимару! Мы никогда не отступаем перед превосходящими силами врага!»',
    specialization: 'Сегментированные клинки Дзанпакто и духовное сокрушение'
  }
];

export function calculatePlayerFameScore(
  commander: CommanderProgression,
  shipStats: ShipStats,
  resources: Resources,
  kingdoms: Kingdom[],
  activeTitle?: KingdomTitle | null
): number {
  const levelPoints = commander.level * 280;
  const xpPoints = Math.round(commander.xp * 0.4);
  const combatPower = (shipStats.weaponsPower * 15) + Math.round(shipStats.maxShields * 2.5) + Math.round(shipStats.maxHull * 1.8);
  const wealthBonus = Math.min(1500, Math.round(resources.credits * 0.15) + (resources.antimatter * 12));
  
  // Kingdoms diplomatic contribution
  const kingdomBonus = kingdoms.reduce((acc, k) => {
    return acc + Math.max(0, k.reputation * 12) + Math.round(k.playerInvestment * 0.05);
  }, 0);

  // Active title prestige bonus
  const titleBonus = activeTitle ? 400 : 0;

  return Math.round(levelPoints + xpPoints + combatPower + wealthBonus + kingdomBonus + titleBonus);
}

export function getPlayerRankTier(score: number): HallOfFameCommander['rankTier'] {
  if (score >= 12000) return 'SSS+';
  if (score >= 10500) return 'SSS';
  if (score >= 9500) return 'SS+';
  if (score >= 8800) return 'SS';
  if (score >= 7800) return 'S+';
  if (score >= 6800) return 'S';
  if (score >= 5000) return 'A+';
  if (score >= 4000) return 'A';
  if (score >= 3200) return 'B+';
  return 'B';
}

export function buildHallOfFameLeaderboard(
  commander: CommanderProgression,
  shipStats: ShipStats,
  resources: Resources,
  kingdoms: Kingdom[],
  activeTitle?: KingdomTitle | null
): {
  leaderboard: HallOfFameCommander[];
  playerCommander: HallOfFameCommander;
  playerRank: number;
  totalCommanders: number;
  nextRival: HallOfFameCommander | null;
  pointsToNextRank: number;
} {
  const playerScore = calculatePlayerFameScore(commander, shipStats, resources, kingdoms, activeTitle);
  const playerRankTier = getPlayerRankTier(playerScore);
  const playerPower = Math.round((shipStats.weaponsPower * 350) + (shipStats.maxHull * 50) + (shipStats.maxShields * 60));

  const playerTitleDisplay = activeTitle 
    ? `${activeTitle.badgeEmoji} ${activeTitle.title}`
    : `Капитан Звёздного Флагмана «${shipStats.name || 'Астрея'}»`;

  const playerCommander: HallOfFameCommander = {
    id: 'player_commander',
    name: 'Капитан Астреи (Игрок)',
    title: playerTitleDisplay,
    universe: 'galaxy',
    universeName: 'Флагман Игрока',
    factionName: 'Экспедиционный Корпус Астреи',
    avatarEmoji: '🚀',
    themeColor: '#22D3EE',
    score: playerScore,
    militaryPower: playerPower,
    rankTier: playerRankTier,
    quote: '«Звёзды покоряются тем, кто не боится шагать в неизведанные глубины космоса».',
    specialization: 'Универсальное тактическое командование и межзвёздная экспансия',
    isPlayer: true,
    activeTitle
  };

  const all: HallOfFameCommander[] = [...FAMOUS_NPC_COMMANDERS, playerCommander]
    .sort((a, b) => b.score - a.score)
    .map((c, idx) => ({
      ...c,
      rankPosition: idx + 1
    }));

  const playerEntry = all.find(c => c.isPlayer) || playerCommander;
  const playerRank = playerEntry.rankPosition || all.length;
  const nextRival = playerRank > 1 ? all[playerRank - 2] : null;
  const pointsToNextRank = nextRival ? Math.max(0, nextRival.score - playerEntry.score + 1) : 0;

  return {
    leaderboard: all,
    playerCommander: playerEntry,
    playerRank,
    totalCommanders: all.length,
    nextRival,
    pointsToNextRank
  };
}
