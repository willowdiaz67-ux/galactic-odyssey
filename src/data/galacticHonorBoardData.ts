import { CommanderProgression, ShipStats, Resources } from '../types/game';
import { Kingdom, KingdomTitle } from '../types/kingdom';

export interface HonorCommander {
  id: string;
  name: string;
  title: string;
  role: string;
  universe: 'bleach' | 'dragon_ball' | 'galaxy';
  universeLabel: string;
  flagshipName: string;
  avatarEmoji: string;
  themeColor: string;
  level: number;
  score: number;
  militaryPower: number;
  battlesWon: number;
  reputationGrade: 'S+' | 'S' | 'A' | 'B' | 'C';
  speciality: string;
  quote: string;
  flagshipSpecs?: {
    hull: number;
    shields: number;
    weapons: number;
  };
  isPlayer?: boolean;
  rank?: number;
}

export const FAMOUS_NPC_COMMANDERS: HonorCommander[] = [
  {
    id: 'npc_reio',
    name: 'Король Душ (Рейо)',
    title: 'Божественный Суверен Трёх Миров',
    role: 'Монарх Священного Царства Душ',
    universe: 'bleach',
    universeLabel: 'Bleach: Сообщество Душ',
    flagshipName: '«Небесный Ковчег Рейокию»',
    avatarEmoji: '👑',
    themeColor: '#38BDF8',
    level: 50,
    score: 98500,
    militaryPower: 145000,
    battlesWon: 840,
    reputationGrade: 'S+',
    speciality: 'Божественное Реяцу и управление тканью трёх измерений',
    quote: 'Баланс душ незыблем. Мой взор пронзает ткань бесконечности.',
    flagshipSpecs: { hull: 1200, shields: 1500, weapons: 180 }
  },
  {
    id: 'npc_yamamoto_honor',
    name: 'Главнокомандующий Ямамото Генрюсай',
    title: 'Абсолютный Меч Готей 13',
    role: 'Капитан 1-го Отряда Синигами',
    universe: 'bleach',
    universeLabel: 'Bleach: Сообщество Душ',
    flagshipName: '«Рюдзин Дзякка: Пламя Тысячелетия»',
    avatarEmoji: '🔥',
    themeColor: '#EF4444',
    level: 48,
    score: 91200,
    militaryPower: 132000,
    battlesWon: 720,
    reputationGrade: 'S+',
    speciality: 'Всеиспепеляющее пламя, не знающее компромиссов',
    quote: 'Справедливость не знает пощады. Мой клинок обратит в пепел любое зло!',
    flagshipSpecs: { hull: 950, shields: 1100, weapons: 165 }
  },
  {
    id: 'npc_vegeta_honor',
    name: 'Принц Веджета',
    title: 'Гордость Королевской Династии',
    role: 'Элитный Командующий Сайянской Армады',
    universe: 'dragon_ball',
    universeLabel: 'Dragon Ball: Сайяны',
    flagshipName: '«Большой Взрыв: Галик-1»',
    avatarEmoji: '💥',
    themeColor: '#818CF8',
    level: 44,
    score: 83400,
    militaryPower: 118000,
    battlesWon: 610,
    reputationGrade: 'S',
    speciality: 'Безудержная энергия Ки, взрывной натиск и непоколебимая гордость',
    quote: 'Я — Принц всех Сайянов! Ни один корабль во вселенной не превзойдёт мою мощь!',
    flagshipSpecs: { hull: 880, shields: 920, weapons: 150 }
  },
  {
    id: 'npc_lucius_honor',
    name: 'Император Люциус III Валуа',
    title: 'Верховный Монарх Солнечной Метрополии',
    role: 'Главнокомандующий Экспедиционного Флота ОФЗ',
    universe: 'galaxy',
    universeLabel: 'Astraea: Солнечная Монархия',
    flagshipName: '«Солнце Терры: Эгида Человечества»',
    avatarEmoji: '🏛️',
    themeColor: '#F59E0B',
    level: 40,
    score: 75600,
    militaryPower: 105000,
    battlesWon: 480,
    reputationGrade: 'S',
    speciality: 'Имперская координация флотов, тяжелые крейсерские батареи',
    quote: 'Человечество не просто выживает среди звёзд — оно строит несокрушимый порядок.',
    flagshipSpecs: { hull: 900, shields: 850, weapons: 130 }
  },
  {
    id: 'npc_kenpachi_honor',
    name: 'Капитан Зараки Кенпачи',
    title: 'Неукротимый Демон Поля Битвы',
    role: 'Капитан 11-го Боевого Отряда Готей 13',
    universe: 'bleach',
    universeLabel: 'Bleach: Сообщество Душ',
    flagshipName: '«Нозараши: Рассекатель Звёзд»',
    avatarEmoji: '⚔️',
    themeColor: '#F97316',
    level: 38,
    score: 71200,
    militaryPower: 98000,
    battlesWon: 530,
    reputationGrade: 'A',
    speciality: 'Сверхвысокая живучесть, прорыв фронта и сокрушительный ближний таран',
    quote: 'Хватит болтать! Врубай двигатели на полную и покажи мне настоящий бой!',
    flagshipSpecs: { hull: 1100, shields: 600, weapons: 140 }
  },
  {
    id: 'npc_malakai_honor',
    name: 'Малахай «Чёрный Вихрь»',
    title: 'Теневой Король Корсаров',
    role: 'Владыка Пиратского Престола Синдиката',
    universe: 'galaxy',
    universeLabel: 'Astraea: Завеса Веила',
    flagshipName: '«Чёрная Вдова: Дредноут Завесы»',
    avatarEmoji: '☠️',
    themeColor: '#F43F5E',
    level: 35,
    score: 64800,
    militaryPower: 89000,
    battlesWon: 410,
    reputationGrade: 'A',
    speciality: 'Засады в астероидных полях, термоядерные торпеды и каперские рейды',
    quote: 'В варпе правит тот, у кого мощнее пушки и отчаяннее экипаж!',
    flagshipSpecs: { hull: 750, shields: 700, weapons: 125 }
  },
  {
    id: 'npc_celestia_honor',
    name: 'Королева-Оракул Селестия',
    title: 'Верховная Архивариус Врат Предтеч',
    role: 'Повелительница Квантовых Уловителей Конкорда',
    universe: 'galaxy',
    universeLabel: 'Astraea: Конкорд & Пульсары',
    flagshipName: '«Квантовая Вечность Тесла»',
    avatarEmoji: '🔮',
    themeColor: '#C084FC',
    level: 32,
    score: 58900,
    militaryPower: 79000,
    battlesWon: 340,
    reputationGrade: 'A',
    speciality: 'Антиматериевые проекторы, гравитационные щиты и предвидение манёвров',
    quote: 'Время — это спираль. Зодчие оставили нам ключи к тайнам мироздания.',
    flagshipSpecs: { hull: 600, shields: 950, weapons: 110 }
  },
  {
    id: 'npc_thorgrim_honor',
    name: 'Торгрим «Железный Кулак»',
    title: 'Верховный Глава Горных Гильдий',
    role: 'Король Литейных Цитаделей Сириуса',
    universe: 'galaxy',
    universeLabel: 'Astraea: Система Сириус',
    flagshipName: '«Молот Гефеста: Литейный Колосс»',
    avatarEmoji: '⛏️',
    themeColor: '#10B981',
    level: 28,
    score: 51200,
    militaryPower: 71000,
    battlesWon: 290,
    reputationGrade: 'B',
    speciality: 'Сверхпрочная титановая броня, автодобыча ресурсов во время боя',
    quote: 'Металл — это кровь и плоть цивилизации. Наша броня выдержит любой залп!',
    flagshipSpecs: { hull: 850, shields: 600, weapons: 95 }
  },
  {
    id: 'npc_byakuya_honor',
    name: 'Капитан Бьякуя Кучики',
    title: 'Глава Благородного Дома Кучики',
    role: 'Капитан 6-го Отряда Готей 13',
    universe: 'bleach',
    universeLabel: 'Bleach: Сообщество Душ',
    flagshipName: '«Сэндбондзакура: Лепестки Стали»',
    avatarEmoji: '🌸',
    themeColor: '#EC4899',
    level: 26,
    score: 46700,
    militaryPower: 65000,
    battlesWon: 275,
    reputationGrade: 'B',
    speciality: 'Высокоточное лазерное микронаведение и молниеносные варп-прыжки',
    quote: 'Закон превыше эмоций. Мой долг — карать тех, кто нарушает баланс.',
    flagshipSpecs: { hull: 550, shields: 750, weapons: 105 }
  },
  {
    id: 'npc_bulma_honor',
    name: 'Бульма Брифинг',
    title: 'Научный Директор Capsule Corporation',
    role: 'Глава Экспедиционного Исследовательского Флота',
    universe: 'dragon_ball',
    universeLabel: 'Dragon Ball: Намек',
    flagshipName: '«Capsule Corp Alpha-9»',
    avatarEmoji: '🔬',
    themeColor: '#06B6D4',
    level: 23,
    score: 41500,
    militaryPower: 58000,
    battlesWon: 190,
    reputationGrade: 'B',
    speciality: 'Квантовое сканирование секторов, автоматический ремонт наномашинами',
    quote: 'Если что-то невозможно изобрести — просто дайте мне чашку кофе и пятнадцать минут!',
    flagshipSpecs: { hull: 620, shields: 680, weapons: 85 }
  },
  {
    id: 'npc_guru_honor',
    name: 'Великий Патриарх Старейшина Гуру',
    title: 'Патриарх и Монарх Намекианцев',
    role: 'Творец Священных Жемчужин Дракона',
    universe: 'dragon_ball',
    universeLabel: 'Dragon Ball: Намек',
    flagshipName: '«Ковчег Порунги: Мудрость Намека»',
    avatarEmoji: '✨',
    themeColor: '#34D399',
    level: 21,
    score: 37800,
    militaryPower: 53000,
    battlesWon: 160,
    reputationGrade: 'B',
    speciality: 'Пробуждение скрытых резервов экипажа, щиты священной Ки',
    quote: 'Сила духа не знает пределов, если сердце чисто.',
    flagshipSpecs: { hull: 700, shields: 750, weapons: 70 }
  },
  {
    id: 'npc_vance_honor',
    name: 'Коммодор Патруля ОФЗ Вэнс',
    title: 'Старший Инспектор Звёздной Полиции',
    role: 'Командир Секторального Антипиратского Корпуса',
    universe: 'galaxy',
    universeLabel: 'Astraea: Федеральная Полиция',
    flagshipName: '«Страж Сектора Браво»',
    avatarEmoji: '👮',
    themeColor: '#38BDF8',
    level: 16,
    score: 29500,
    militaryPower: 42000,
    battlesWon: 135,
    reputationGrade: 'C',
    speciality: 'Энергетические гарпуны для ареста, перехват контрабандистов',
    quote: 'Ни один корсар не ускользнёт от закона Объединённого Флота.',
    flagshipSpecs: { hull: 480, shields: 520, weapons: 65 }
  },
  {
    id: 'npc_bloodfang_honor',
    name: 'Барон «Кровавый Клык»',
    title: 'Атаман Астероидного Налёта',
    role: 'Командир Банды Чёрного Солнца',
    universe: 'galaxy',
    universeLabel: 'Astraea: Синдикат',
    flagshipName: '«Мародёр Пустоты-7»',
    avatarEmoji: '🩸',
    themeColor: '#E11D48',
    level: 12,
    score: 21400,
    militaryPower: 31000,
    battlesWon: 95,
    reputationGrade: 'C',
    speciality: 'Абордажные крючья и внезапные рейды на гражданские транспорты',
    quote: 'Твой груз теперь наш! Приготовься к абордажу!',
    flagshipSpecs: { hull: 420, shields: 380, weapons: 55 }
  },
  {
    id: 'npc_reynolds_honor',
    name: 'Старший Лейтенант Рейнольдс',
    title: 'Офицер Дальней Разведки',
    role: 'Капитан Разведывательного Корвета',
    universe: 'galaxy',
    universeLabel: 'Astraea: Флот ОФЗ',
    flagshipName: '«Искатель-4»',
    avatarEmoji: '🚀',
    themeColor: '#60A5FA',
    level: 8,
    score: 14800,
    militaryPower: 22000,
    battlesWon: 55,
    reputationGrade: 'C',
    speciality: 'Быстрая картография систем и глубокая телеметрия',
    quote: 'Разведданные доставлены в штаб. Координаты сектора зафиксированы.',
    flagshipSpecs: { hull: 320, shields: 350, weapons: 40 }
  },
  {
    id: 'npc_cadet_honor',
    name: 'Кадет-Испытатель Академии',
    title: 'Выпускник Военно-Космической Академии',
    role: 'Пилот Учебного Экспедиционного Челнока',
    universe: 'galaxy',
    universeLabel: 'Astraea: Академия ОФЗ',
    flagshipName: '«Учебный Челнок Академии-01»',
    avatarEmoji: '🎓',
    themeColor: '#94A3B8',
    level: 4,
    score: 6200,
    militaryPower: 11000,
    battlesWon: 18,
    reputationGrade: 'C',
    speciality: 'Базовое маневрирование и астронавигация',
    quote: 'Все системы в норме. Готов служить на благо Федерации!',
    flagshipSpecs: { hull: 200, shields: 220, weapons: 25 }
  }
];

export interface PlayerHonorData {
  score: number;
  militaryPower: number;
  rank: number;
  totalCommanders: number;
  nextCommander?: HonorCommander;
  pointsToNextRank: number;
  prevCommander?: HonorCommander;
  tierName: string;
}

/**
 * Calculates the player's dynamic score and ranking among famous commanders.
 */
export const calculatePlayerHonorScore = (
  commander?: CommanderProgression,
  shipStats?: ShipStats,
  resources?: Resources,
  kingdoms?: Kingdom[]
): { score: number; militaryPower: number } => {
  const level = commander?.level ?? 1;
  const xp = commander?.xp ?? 0;

  // Level & XP contribution (1250 pts per level, bonus for XP)
  const levelScore = level * 1400 + Math.round(xp * 0.85);

  // Ship combat contribution
  const weaponPower = shipStats?.weaponsPower ?? 20;
  const maxShields = shipStats?.maxShields ?? 100;
  const maxHull = shipStats?.maxHull ?? 100;
  const combatScore = (weaponPower * 220) + (maxShields * 32) + (maxHull * 20);

  // Economic contribution
  const credits = resources?.credits ?? 1000;
  const alloys = resources?.alloys ?? 50;
  const science = resources?.science ?? 25;
  const antimatter = resources?.antimatter ?? 0;
  const nukes = resources?.nukes ?? 0;
  const econScore = Math.min(30000, Math.round(credits * 0.45) + (alloys * 12) + (science * 15) + (antimatter * 60) + (nukes * 250));

  // Kingdoms Allegiances & Reputations contribution
  let kingdomScore = 0;
  if (kingdoms && kingdoms.length > 0) {
    kingdomScore = kingdoms.reduce((acc, k) => {
      const repPts = Math.max(0, k.reputation) * 90;
      const investPts = Math.round(k.playerInvestment * 0.12);
      const privPts = k.privileges.filter(p => p.unlocked).length * 1500;
      const petPts = k.petitions.filter(p => p.completed).length * 1200;
      return acc + repPts + investPts + privPts + petPts;
    }, 0);
  }

  const totalScore = Math.max(4500, levelScore + combatScore + econScore + kingdomScore);
  const totalMilitaryPower = Math.round((weaponPower * 350) + (maxShields * 75) + (maxHull * 50) + (level * 800));

  return {
    score: totalScore,
    militaryPower: totalMilitaryPower
  };
};

/**
 * Builds the full sorted leaderboard including the player and returns rankings.
 */
export const getHonorLeaderboard = (
  playerName: string = 'Командир Астреи',
  activeTitle: KingdomTitle | null = null,
  commander?: CommanderProgression,
  shipStats?: ShipStats,
  resources?: Resources,
  kingdoms?: Kingdom[]
): {
  leaderboard: (HonorCommander & { rank: number })[];
  playerEntry: HonorCommander & { rank: number };
  playerStats: PlayerHonorData;
} => {
  const { score: playerScore, militaryPower: playerMilPower } = calculatePlayerHonorScore(
    commander,
    shipStats,
    resources,
    kingdoms
  );

  const playerLevel = commander?.level ?? 1;

  let repGrade: 'S+' | 'S' | 'A' | 'B' | 'C' = 'C';
  if (playerScore >= 80000) repGrade = 'S+';
  else if (playerScore >= 65000) repGrade = 'S';
  else if (playerScore >= 45000) repGrade = 'A';
  else if (playerScore >= 25000) repGrade = 'B';

  const playerTitle = activeTitle ? activeTitle.title : 'Командор Экспедиционного Флота';
  const playerTheme = activeTitle?.color || '#38BDF8';
  const playerAvatar = activeTitle?.badgeEmoji || '🎖️';

  const playerCommander: HonorCommander = {
    id: 'player_commander',
    name: playerName,
    title: playerTitle,
    role: activeTitle ? `Титулованный союзник: ${activeTitle.kingdomName}` : 'Флагманский Командир Astraea',
    universe: 'galaxy',
    universeLabel: activeTitle ? activeTitle.kingdomName : 'Экспедиционный Флот Astraea',
    flagshipName: '«Астрея: Флагман Скитальцев»',
    avatarEmoji: playerAvatar,
    themeColor: playerTheme,
    level: playerLevel,
    score: playerScore,
    militaryPower: playerMilPower,
    battlesWon: Math.max(12, Math.round(playerLevel * 6.5)),
    reputationGrade: repGrade,
    speciality: activeTitle ? activeTitle.bonusSummary : 'Тактическое маневрирование, дипломатия и освоение дальних рубежей',
    quote: 'Звёзды покоряются тем, кто не боится шагать в неизведанную бездну!',
    flagshipSpecs: {
      hull: shipStats?.maxHull ?? 100,
      shields: shipStats?.maxShields ?? 100,
      weapons: shipStats?.weaponsPower ?? 20
    },
    isPlayer: true
  };

  // Combine NPC commanders with player and sort descending
  const combined = [...FAMOUS_NPC_COMMANDERS, playerCommander].sort((a, b) => b.score - a.score);

  const rankedLeaderboard = combined.map((cmd, index) => ({
    ...cmd,
    rank: index + 1
  }));

  const playerRanked = rankedLeaderboard.find(c => c.isPlayer)!;
  const playerIndex = rankedLeaderboard.findIndex(c => c.isPlayer);

  const nextCommander = playerIndex > 0 ? rankedLeaderboard[playerIndex - 1] : undefined;
  const prevCommander = playerIndex < rankedLeaderboard.length - 1 ? rankedLeaderboard[playerIndex + 1] : undefined;
  const pointsToNextRank = nextCommander ? Math.max(0, nextCommander.score - playerRanked.score) : 0;

  let tierName = 'Курсант Галактики';
  if (playerRanked.rank === 1) tierName = 'Легендарный Владыка Звёзд (#1)';
  else if (playerRanked.rank <= 3) tierName = 'Тройка Высших Монархов Галактики';
  else if (playerRanked.rank <= 5) tierName = 'Великий Адмирал Звёздных Армад';
  else if (playerRanked.rank <= 10) tierName = 'Элитный Командор Галактического Совета';
  else if (playerRanked.rank <= 13) tierName = 'Закалённый Ветеран Рубежей';

  return {
    leaderboard: rankedLeaderboard,
    playerEntry: playerRanked,
    playerStats: {
      score: playerScore,
      militaryPower: playerMilPower,
      rank: playerRanked.rank,
      totalCommanders: rankedLeaderboard.length,
      nextCommander,
      pointsToNextRank,
      prevCommander,
      tierName
    }
  };
};
