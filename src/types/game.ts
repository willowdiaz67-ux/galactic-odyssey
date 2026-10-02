export type FactionId = 'terran' | 'syndicate' | 'precursors' | 'miners';

export interface Faction {
  id: FactionId;
  name: string;
  shortName: string;
  description: string;
  color: string;
  reputation: number; // -100 to +100
  perk: string;
}

export interface Resources {
  credits: number;     // Валюта
  fuel: number;        // Гелий-3
  maxFuel: number;
  alloys: number;      // Сверхпрочные сплавы
  science: number;     // Научные данные
  antimatter: number;  // Редкая антиматерия
  food: number;        // Продовольствие
  colonists: number;   // Поселенцы
  nukes: number;       // Термоядерные заряды / Ядерки
}

export interface ShipSubsystem {
  name: string;
  health: number; // 0 - 100
  maxHealth: number;
}

export interface PlayableShip {
  id: string;
  name: string;
  className: string;
  role: string;
  tier: number;
  faction: FactionId;
  description: string;
  specialPerk: {
    title: string;
    description: string;
  };
  baseStats: {
    hull: number;
    maxHull: number;
    shields: number;
    maxShields: number;
    energy: number;
    maxEnergy: number;
    cargoCapacity: number;
    warpRange: number;
    weaponsPower: number;
    evasion: number;
  };
  price: {
    credits: number;
    alloys: number;
    science?: number;
    antimatter?: number;
  };
  image?: string;
  accentColor?: string;
}

export type CombatDifficulty = 'normal' | 'veteran' | 'nightmare';

export interface ShipStats {
  id?: string;
  name: string;
  className: string;
  hull: number;
  maxHull: number;
  shields: number;
  maxShields: number;
  energy: number;
  maxEnergy: number;
  cargoCapacity: number;
  warpRange: number; // в световых годах
  weaponsPower: number;
  evasion: number;
  specialPerk?: {
    title: string;
    description: string;
  };
  subsystems: {
    engines: ShipSubsystem;
    weapons: ShipSubsystem;
    shields: ShipSubsystem;
    lifeSupport: ShipSubsystem;
  };
  powerAllocation: {
    weapons: number; // e.g. 40%
    shields: number; // e.g. 35%
    engines: number; // e.g. 25%
  };
}

export interface CrewMember {
  id: string;
  name: string;
  role: 'captain' | 'engineer' | 'navigator' | 'scientist' | 'tactician';
  roleName: string;
  bonusText: string;
  level: number;
  salary: number;
  portraitIcon: string;
}

export interface ShipUpgrade {
  id: string;
  name: string;
  category: 'weapons' | 'shields' | 'engines' | 'science' | 'cargo' | 'hull';
  categoryName: string;
  tier: number;
  description: string;
  cost: {
    credits?: number;
    alloys?: number;
    science?: number;
    antimatter?: number;
  };
  effect: string;
  installed: boolean;
  applyUpgrade: (stats: ShipStats) => ShipStats;
}

export type CelestialType = 
  | 'terrestrial' 
  | 'ocean' 
  | 'gas_giant' 
  | 'ice' 
  | 'lava' 
  | 'asteroid_belt' 
  | 'orbital_station' 
  | 'alien_ruin'
  | 'derelict_ship';

export interface ColonyBuilding {
  id: string;
  name: string;
  description: string;
  cost: { credits: number; alloys: number; science?: number };
  production: Partial<Resources>;
  energyCost: number;
  built: boolean;
}

export interface ColonyCycleProductionHistory {
  cycle: number;
  credits: number;
  alloys: number;
  science: number;
  fuel: number;
  food: number;
  totalOutput?: number;
  population?: number;
}

export interface PlanetColony {
  planetId: string;
  name: string;
  population: number;
  buildings: ColonyBuilding[];
  happiness: number; // 0 - 100
  defenseRating: number;
  productionHistory?: ColonyCycleProductionHistory[];
}

export interface CelestialBody {
  id: string;
  name: string;
  type: CelestialType;
  typeName: string;
  description: string;
  color: string;
  size: number; // relative render size
  orbitRadius: number; // distance from star
  orbitSpeed: number;
  angle: number;
  canColonize: boolean;
  canMine: boolean;
  minedOut?: boolean;
  hasStation?: boolean;
  scanned: boolean;
  resourcesYield?: Partial<Resources>;
  colony?: PlanetColony;
}

export type StarClass = 
  | 'yellow_dwarf' 
  | 'red_giant' 
  | 'blue_supergiant' 
  | 'neutron_star' 
  | 'black_hole' 
  | 'binary_system'
  | 'triple_star'
  | 'spirit_core';

export type SystemEconomyType = 
  | 'industrial'      // Heavy manufacturing, metals, alloys, high demand for food & medical
  | 'agricultural'    // High food production, high demand for high-tech & alloys
  | 'hightech'        // Advanced electronics, processors, high demand for raw alloys & fuel
  | 'extraction'      // Mining colonies, fuel harvesting, high demand for consumer & food
  | 'outlaw'          // Black market, contraband, pirate dens, high demand for weapons & fuel
  | 'relic_research'  // Archaeo-science, precursor studies, huge demand for research chips & artifacts
  | 'spiritual'       // Mystical realm, reishi & soul artifacts, high demand for electronics & food
  | 'trade_hub';      // Balanced central hub

export type MarketEventType = 
  | 'famine'                // Дефицит продовольствия
  | 'tech_boom'             // Технологический бум
  | 'mining_rush'           // Горнорудная лихорадка
  | 'medical_epidemic'      // Эпидемия звёздной лихорадки
  | 'fuel_crisis'           // Топливный кризис
  | 'contraband_crackdown'  // Облава на Синдикат
  | 'precursor_surge'       // Археологический ажиотаж
  | 'harvest_abundance'     // Рекордный урожай
  | 'military_mobilization';// Военная мобилизация

export interface MarketEventPriceModifier {
  itemId?: string;
  category?: MarketItem['category'];
  multiplier: number; // e.g. 1.65 (+65%)
  label: string;
  demandLevel: 'critical_high' | 'high' | 'normal' | 'low';
  supplyLevel: 'critical_deficit' | 'low' | 'normal' | 'surplus';
}

export interface MarketEvent {
  id: string;
  type: MarketEventType;
  systemId: string;
  systemName: string;
  sector: string;
  title: string;
  description: string;
  urgency: 'normal' | 'high' | 'critical';
  icon: string;
  color: string;
  remainingCycles: number;
  maxCycles: number;
  startStardate: number;
  modifiers: MarketEventPriceModifier[];
  flavorTip: string;
}

export interface ComprehensivePriceInfo {
  baseBuyPrice: number;
  baseSellPrice: number;
  finalBuyPrice: number;
  finalSellPrice: number;
  multiplier: number;
  percentageChange: number;
  trend: 'up' | 'down' | 'neutral';
  demandLevel: 'critical_high' | 'high' | 'normal' | 'low';
  demandLabel: string;
  demandScore: number; // 1 to 5
  supplyLevel: 'critical_deficit' | 'low' | 'normal' | 'surplus';
  supplyLabel: string;
  supplyScore: number; // 1 to 5
  economyType: SystemEconomyType;
  economyName: string;
  economyModifier: number;
  economyReason: string;
  activeEvents: MarketEvent[];
  affectingNews: GalacticNewsItem[];
  breakdown: {
    source: 'base' | 'economy' | 'event' | 'news';
    title: string;
    factor: number;
    description: string;
  }[];
}

export interface StarSystem {
  id: string;
  name: string;
  sector: 'alpha' | 'beta' | 'gamma' | 'soul_society' | string;
  sectorName: string;
  starClass: StarClass;
  starClassName: string;
  starColor: string;
  x: number; // 0 - 1000 map coordinates
  y: number;
  hazardLevel: 1 | 2 | 3 | 4 | 5;
  faction: FactionId;
  bodies: CelestialBody[];
  visited: boolean;
  market: MarketItem[];
  loreSnippet: string;
  economyType?: SystemEconomyType;
  economyTypeName?: string;
  economyDescription?: string;
}

export interface MarketItem {
  id: string;
  name: string;
  category: 'mineral' | 'tech' | 'luxury' | 'food' | 'medical' | 'precursor' | 'contraband';
  buyPrice: number;
  sellPrice: number;
  stock: number;
  playerStock: number;
  description: string;
  isContraband?: boolean;
  contrabandRisk?: number; // Risk of pirate ambush per unit (e.g. 15 = +15% pirate heat)
  contrabandTier?: 'rare' | 'banned' | 'military' | 'black_market';
  dangerDescription?: string;
  targetDemandSector?: string; // High-profit recommendation hint
}

export interface EnemyShip {
  id: string;
  name: string;
  faction: FactionId;
  hull: number;
  maxHull: number;
  shields: number;
  maxShields: number;
  weaponsPower: number;
  evasion: number;
  gridX?: number;
  gridY?: number;
  shipType?: 'interceptor' | 'frigate' | 'dreadnought' | 'drone' | 'turret';
  range?: number;
  movementPoints?: number;
  color?: string;
  reward: {
    credits: number;
    alloys: number;
    science?: number;
    antimatter?: number;
  };
}

export interface TacticalTileItem {
  id: string;
  type: 'asteroid' | 'cargo_crate' | 'nano_repair' | 'plasma_barrel' | 'mine';
  x: number;
  y: number;
  health?: number;
  value?: { credits?: number; alloys?: number; fuel?: number; science?: number; antimatter?: number };
  owner?: 'player' | 'enemy';
}

export interface TacticalMission {
  id: string;
  levelNumber?: number; // 1 to 40
  title: string;
  subtitle: string;
  difficulty: 'Легко' | 'Средне' | 'Опасно' | 'Экстрим' | 'БОСС';
  sectorName?: string;
  enemies: EnemyShip[];
  environment: 'asteroid_field' | 'derelict_station' | 'plasma_storm' | 'quantum_rift' | 'nebula';
  description: string;
  isBossLevel?: boolean;
  unlocked?: boolean;
  stars?: number;
  xpReward?: number;
  initialItems?: TacticalTileItem[];
}

export interface CommanderProgression {
  level: number; // 1 to 40
  xp: number;
  xpToNextLevel: number;
  skillPoints: number;
  skills: {
    weapons: number; // bonus weapon dmg
    shields: number; // bonus shields
    engines: number; // bonus evasion and MP
    tactics: number; // bonus crit & loot
    reactor: number; // AP and cooldowns
  };
}

export interface CombatLogEntry {
  id: string;
  timestamp: string;
  text: string;
  type: 'player_attack' | 'enemy_attack' | 'shield_hit' | 'hull_damage' | 'system' | 'victory' | 'defeat';
  actionName?: string;
  initiatorName?: string;
  targetName?: string;
  damageDealt?: number;
  isCritical?: boolean;
  targetShieldRemaining?: number;
  targetHullRemaining?: number;
  targetStatus?: 'destroyed' | 'critical' | 'damaged' | 'shield_broken' | 'operational';
}

export interface NarrativeEventChoice {
  text: string;
  requirement?: {
    resource?: keyof Resources;
    amount?: number;
    crewRole?: string;
  };
  outcomeText: string;
  reward?: Partial<Resources>;
  reputationChange?: { faction: FactionId; delta: number };
  hullDamage?: number;
}

export interface NarrativeEvent {
  id: string;
  title: string;
  subtitle: string;
  text: string;
  icon: string;
  choices: NarrativeEventChoice[];
}

export interface ResearchTech {
  id: string;
  name: string;
  category: 'propulsion' | 'defense' | 'economy' | 'xenology';
  categoryName: string;
  tier: number;
  cost: number; // science data required
  description: string;
  unlocked: boolean;
  prerequisiteId?: string;
}

export interface ArrestedPirate {
  id: string;
  name: string;
  callsign: string;
  rank: 'Мародёр' | 'Штурмовик' | 'Капитан Корсаров' | 'Барон Синдиката' | 'Кибер-Взломщик' | 'Пиратский Атаман';
  crimes: string[];
  bounty: number; // Официальная премия от Полиции ОФЗ
  bribeOffer: number; // Размер взятки за побег
  intelRevealed?: boolean;
  intelSecret?: {
    type: 'cache' | 'ambush_warning' | 'weapon_schematic';
    description: string;
    rewardCredits?: number;
    rewardAlloys?: number;
    rewardAntimatter?: number;
  };
  threatLevel: 'low' | 'medium' | 'high' | 'legendary';
  arrestDate: string;
}

export interface PoliceProfile {
  bountiesCollected: number;
  piratesHandedOver: number;
  officerRank: 'Гражданский содействующий' | 'Помощник Патрульного' | 'Охотник за Головами ОФЗ' | 'Галактический Детектив' | 'Верховный Маршал ОФЗ';
  reputationWithPolice: number; // 0 - 100
  totalBountyCredits: number;
  licenses: {
    bountyHunterBadge: boolean;
    customsImmunity: boolean;
    stunHarpoonAuthorized: boolean;
  };
}

export interface PriceModifier {
  itemId?: string; // specific item id or undefined
  category?: MarketItem['category']; // target category
  multiplier: number; // e.g. 1.4 (+40%) or 0.65 (-35%)
  label: string;
}

export type NewsCategory = 'crisis' | 'boom' | 'military' | 'science' | 'scandal' | 'anomaly';

export interface GalacticNewsItem {
  id: string;
  headline: string;
  source: string;
  category: NewsCategory;
  timestamp: string;
  summary: string;
  targetSector: 'alpha' | 'beta' | 'gamma' | 'soul_society' | 'all' | string;
  targetSystemId?: string;
  priceModifiers: PriceModifier[];
  urgency: 'normal' | 'high' | 'critical';
  stardate: number;
}

export type ActiveScreen = 
  | 'GALAXY_MAP' 
  | 'SYSTEM_VIEW' 
  | 'COLONY_MANAGER' 
  | 'SHIP_HANGAR' 
  | 'TRADE_STATION' 
  | 'POLICE_PRISON' 
  | 'RESEARCH' 
  | 'COMBAT' 
  | 'KINGS_NPC'
  | 'KINGDOMS'
  | 'LOGS';

export type DiplomaticIntent = 'improve' | 'worsen' | 'covert';

export interface DiplomaticMission {
  id: string;
  title: string;
  intent: DiplomaticIntent;
  category: 'aid' | 'tech' | 'military' | 'embassy' | 'sanction' | 'sabotage' | 'denunciation' | 'provocation' | 'bribe';
  description: string;
  cost: Partial<Resources>;
  reputationDelta: number;
  bonusForFaction?: {
    factionId: FactionId;
    extraReputation: number;
    explanation: string;
  };
  resourceReward?: Partial<Resources>;
  rivalReputationChange?: {
    rivalFactionId: FactionId;
    delta: number;
    explanation: string;
  };
}

export interface DiplomaticPact {
  id: string;
  factionId: FactionId;
  type: 'non_aggression' | 'trade_accord' | 'defense_treaty' | 'science_alliance';
  title: string;
  minReputation: number;
  cost: Partial<Resources>;
  description: string;
  benefit: string;
  active: boolean;
  signedStardate?: number;
}

export interface DiplomaticLogEntry {
  id: string;
  stardate: number;
  factionId: FactionId;
  factionName: string;
  missionTitle: string;
  intent: DiplomaticIntent | 'treaty' | 'revoke';
  reputationDelta: number;
  resultingReputation: number;
  summary: string;
  timestamp: number;
}

export interface FactionWar {
  id: string;
  name: string;
  codename: string;
  description: string;
  attackerFaction: FactionId;
  defenderFaction: FactionId;
  frontSector: 'alpha' | 'beta' | 'gamma';
  warGoal: string;
  frontlineControl: number; // 0 (defender full control) to 100 (attacker full control), 50 = balance
  intensity: 'skirmish' | 'all_out_war' | 'siege';
  targetSystemIds: string[];
  active: boolean;
  startDate: number;
  warBounty: {
    credits: number;
    alloys: number;
    science?: number;
    nukes?: number;
  };
}

export type WarInterventionType = 'nuke_strike' | 'fleet_support' | 'supply_munitions' | 'ceasefire';

export type ExpeditionActionType = 'docking' | 'combat' | 'colony' | 'trade' | 'anomaly';

export interface ExpeditionLogEntry {
  id: string;
  type: ExpeditionActionType;
  title: string;
  description: string;
  timestamp: string; // e.g. "Зв. дата 2184.2"
  stardate?: number;
  systemName?: string;
  sectorName?: string;
  badge?: string;
  metrics?: {
    credits?: number;
    alloys?: number;
    fuel?: number;
    science?: number;
    antimatter?: number;
    colonists?: number;
    nukes?: number;
    xp?: number;
    outcome?: 'victory' | 'defeat' | 'flee' | 'bounty' | 'profit' | 'investment';
  };
}

export interface CycleEconomicSnapshot {
  cycle: number;
  stardate: number;
  cycleLabel: string;
  credits: number;
  alloys: number;
  creditsDelta?: number;
  alloysDelta?: number;
  colonyProductionCredits?: number;
  colonyProductionAlloys?: number;
  colonyProductionScience?: number;
  colonyProductionFuel?: number;
  colonyProductionFood?: number;
  tradeTurnoverCredits?: number;
  eventDescription?: string;
}

export type AnomalyEffectType = 
  | 'speed_boost'           // Удвоение скорости варпа: 0 расход топлива Гелий-3
  | 'shield_damage'          // Перегрузка и урон щитам (-25..-35 HP)
  | 'quantum_relic'          // Квантовый резонанс (+40 науки, +8 антиматерии)
  | 'shield_overcharge'      // Ионная подпитка щитов (+40 временных щитов)
  | 'hull_corrosion'         // Микрометеоритная коррозия корпуса (-15 HP)
  | 'chronos_treasury'       // Хроно-тайник (+300 ⬡, +50 XP командира)
  | 'asteroid_harvest'       // Гравитационный выброс руды (+40 сплавов)
  | 'fuel_leak'              // Субпространственная утечка топлива (-15 топлива)
  | 'supernova_surge';       // Плазменная вспышка: -20 щитов, но +20 науки

export type AnomalyPolarity = 'bonus' | 'penalty' | 'hazard' | 'quantum';

export interface SpatialAnomaly {
  id: string;
  name: string;
  type: AnomalyEffectType;
  polarity: AnomalyPolarity;
  systemId: string;
  systemName: string;
  sector: string;
  sectorName: string;
  x: number;
  y: number;
  durationJumps: number;     // Remaining jumps before dissipation
  expiresStardate: number;
  title: string;
  description: string;
  effectDescription: string;
  effectValues: {
    freeFuel?: boolean;       // Double speed / free fuel
    shieldDelta?: number;     // Negative = damage, positive = overcharge
    hullDelta?: number;       // Negative = damage
    scienceReward?: number;
    antimatterReward?: number;
    alloysReward?: number;
    creditsReward?: number;
    fuelDelta?: number;
    xpReward?: number;
  };
  visualColor: string;
  visualGlow: string;
  pulseSpeed: number;
}





