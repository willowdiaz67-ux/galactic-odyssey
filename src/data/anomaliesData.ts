import { SpatialAnomaly, AnomalyEffectType, StarSystem } from '../types/game';

interface AnomalyTemplate {
  name: string;
  type: AnomalyEffectType;
  polarity: 'bonus' | 'penalty' | 'hazard' | 'quantum';
  title: string;
  description: string;
  effectDescription: string;
  effectValues: SpatialAnomaly['effectValues'];
  visualColor: string;
  visualGlow: string;
  pulseSpeed: number;
}

export const ANOMALY_TEMPLATES: AnomalyTemplate[] = [
  {
    name: 'Тахионный поток «Стрела Проксимы»',
    type: 'speed_boost',
    polarity: 'bonus',
    title: 'Удвоение скорости варпа',
    description: 'Сверхплотный направленный поток тахионов подхватывает субсветовые приводы корабля, создавая мощнейшую катапульту в подпространстве.',
    effectDescription: 'Удвоение скорости перехода: расход топлива Гелий-3 снижен до 0 (бесплатный прыжок)!',
    effectValues: {
      freeFuel: true
    },
    visualColor: '#38BDF8', // Cyan
    visualGlow: 'rgba(56, 189, 248, 0.65)',
    pulseSpeed: 2.8
  },
  {
    name: 'Гравитационный шторм «Эреб»',
    type: 'shield_damage',
    polarity: 'penalty',
    title: 'Коллапс защитных полей',
    description: 'Аномальная гравитационная флуктуация вызывает резонанс в силовых дефлекторах флагмана, перегружая эмиттеры щитов.',
    effectDescription: 'Урон щитам: щиты корабля теряют 30 ед. мощности при входе в сектор!',
    effectValues: {
      shieldDelta: -30
    },
    visualColor: '#F43F5E', // Rose/Red
    visualGlow: 'rgba(244, 63, 94, 0.65)',
    pulseSpeed: 3.5
  },
  {
    name: 'Квантовый рифт «Око Зодчих»',
    type: 'quantum_relic',
    polarity: 'quantum',
    title: 'Резонанс Предтеч',
    description: 'Древний артефактный разлом излучает закодированные пакеты данных и частицы стабильной антиматерии.',
    effectDescription: 'Бонус исследований: получение +45 научных данных и +8 ед. антиматерии!',
    effectValues: {
      scienceReward: 45,
      antimatterReward: 8
    },
    visualColor: '#A855F7', // Purple
    visualGlow: 'rgba(168, 85, 247, 0.7)',
    pulseSpeed: 1.8
  },
  {
    name: 'Ионизационная супер-вспышка',
    type: 'shield_overcharge',
    polarity: 'bonus',
    title: 'Ионная подпитка щитов',
    description: 'Благоприятное поле высокоэнергетических позитронов насыщает накопители дефлекторов флагмана сверх номинала.',
    effectDescription: 'Сверхзаряд щитов: мгновенное полное восстановление и временный буст +40 щитов!',
    effectValues: {
      shieldDelta: 40
    },
    visualColor: '#34D399', // Emerald
    visualGlow: 'rgba(52, 211, 153, 0.65)',
    pulseSpeed: 2.2
  },
  {
    name: 'Метеоритный смерч Пустоты',
    type: 'hull_corrosion',
    polarity: 'penalty',
    title: 'Абразивный износ корпуса',
    description: 'Плотный шлейф микрометеоритов из твёрдого карбида кремния бомбардирует композитную броню корабля.',
    effectDescription: 'Урон обшивке: корпус корабля получает 15 ед. кинетических повреждений!',
    effectValues: {
      hullDelta: -15
    },
    visualColor: '#FB923C', // Orange
    visualGlow: 'rgba(251, 146, 60, 0.65)',
    pulseSpeed: 3.2
  },
  {
    name: 'Хроно-карман «Хронос-9»',
    type: 'chronos_treasury',
    polarity: 'bonus',
    title: 'Тайник эпохи экспансии',
    description: 'Временная петля выбросила дрейфующий контейнер первой исследовательской экспедиции с золотыми слитками и архивами.',
    effectDescription: 'Археологическая находка: +320 кредитов ОФЗ и +45 XP тактического опыта командира!',
    effectValues: {
      creditsReward: 320,
      xpReward: 45
    },
    visualColor: '#FBBF24', // Amber/Gold
    visualGlow: 'rgba(251, 191, 36, 0.7)',
    pulseSpeed: 2.0
  },
  {
    name: 'Астероидный грави-коллапс',
    type: 'asteroid_harvest',
    polarity: 'bonus',
    title: 'Выброс титановой руды',
    description: 'Приливные силы разлома раздробили богатый астероид, рассеяв готовые к погрузке плиты титанового сплава.',
    effectDescription: 'Сбор сырья: бортовые манипуляторы флагмана захватывают +35 т очищенных сплавов!',
    effectValues: {
      alloysReward: 35
    },
    visualColor: '#2DD4BF', // Teal
    visualGlow: 'rgba(45, 212, 191, 0.65)',
    pulseSpeed: 1.6
  },
  {
    name: 'Субпространственный дренаж',
    type: 'fuel_leak',
    polarity: 'penalty',
    title: 'Утечка изотопа Гелий-3',
    description: 'Полярные поля аномалии вступают в реакцию с криогенными баками, вызывая испарение субсветового топлива.',
    effectDescription: 'Потеря топлива: потеря 15 канистр Гелия-3 из-за аварийного клапана сброса давления!',
    effectValues: {
      fuelDelta: -15
    },
    visualColor: '#E11D48', // Crimson
    visualGlow: 'rgba(225, 29, 72, 0.7)',
    pulseSpeed: 2.6
  },
  {
    name: 'Плазменный шлейф Сверхновой',
    type: 'supernova_surge',
    polarity: 'hazard',
    title: 'Плазменный резонанс',
    description: 'Остаточная ударная волна взорвавшейся звезды пронизывает сектор мощным гамма-излучением.',
    effectDescription: 'Смешанный эффект: урон щитам -20 HP, но ценные астрофизические замеры дают +30 науки!',
    effectValues: {
      shieldDelta: -20,
      scienceReward: 30
    },
    visualColor: '#EC4899', // Pink
    visualGlow: 'rgba(236, 72, 153, 0.7)',
    pulseSpeed: 2.9
  }
];

/**
 * Generates an array of temporary spatial anomalies placed in random star systems.
 */
export function generateRandomSpatialAnomalies(
  systems: StarSystem[],
  currentStardate: number = 2184.2,
  count: number = 4,
  existingAnomalies: SpatialAnomaly[] = []
): SpatialAnomaly[] {
  if (!systems || systems.length === 0) return [];

  const occupiedSystemIds = new Set(existingAnomalies.map(a => a.systemId));

  // Exclude sol system from initial hazard anomalies to keep starting base welcoming
  const eligibleSystems = systems.filter(s => s.id !== 'sol' && !occupiedSystemIds.has(s.id));
  const fallbackSystems = systems.filter(s => s.id !== 'sol');
  const pool = eligibleSystems.length >= count ? eligibleSystems : fallbackSystems;
  const shuffledSystems = [...pool].sort(() => Math.random() - 0.5);
  const selectedSystems = shuffledSystems.slice(0, Math.min(count, shuffledSystems.length));

  const shuffledTemplates = [...ANOMALY_TEMPLATES].sort(() => Math.random() - 0.5);

  return selectedSystems.map((sys, idx) => {
    const template = shuffledTemplates[idx % shuffledTemplates.length];
    const durationJumps = Math.floor(Math.random() * 3) + 3; // 3 to 5 jumps
    const expiresStardate = parseFloat((currentStardate + durationJumps * 0.4).toFixed(1));

    return {
      id: `anomaly_${Date.now()}_${idx}_${sys.id}`,
      name: template.name,
      type: template.type,
      polarity: template.polarity,
      systemId: sys.id,
      systemName: sys.name,
      sector: sys.sector,
      sectorName: sys.sectorName,
      x: sys.x,
      y: sys.y,
      durationJumps,
      expiresStardate,
      title: template.title,
      description: template.description,
      effectDescription: template.effectDescription,
      effectValues: template.effectValues,
      visualColor: template.visualColor,
      visualGlow: template.visualGlow,
      pulseSpeed: template.pulseSpeed
    };
  });
}

export function getAnomalyPolarityBadge(polarity: SpatialAnomaly['polarity']): {
  label: string;
  bg: string;
  text: string;
  border: string;
} {
  switch (polarity) {
    case 'bonus':
      return {
        label: 'БОНУС',
        bg: 'bg-emerald-950/90',
        text: 'text-emerald-300',
        border: 'border-emerald-600'
      };
    case 'penalty':
      return {
        label: 'ШТРАФ / УГРОЗА',
        bg: 'bg-rose-950/90',
        text: 'text-rose-300',
        border: 'border-rose-600'
      };
    case 'hazard':
      return {
        label: 'РИСК И ВЫГОДА',
        bg: 'bg-amber-950/90',
        text: 'text-amber-300',
        border: 'border-amber-600'
      };
    case 'quantum':
      return {
        label: 'КВАНТОВЫЙ ДАР',
        bg: 'bg-purple-950/90',
        text: 'text-purple-300',
        border: 'border-purple-600'
      };
  }
}
