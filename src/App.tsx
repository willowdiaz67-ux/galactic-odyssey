import React, { useState, useEffect } from 'react';
import { 
  StarSystem, 
  CelestialBody, 
  Resources, 
  ShipStats, 
  ShipUpgrade, 
  CrewMember, 
  ResearchTech, 
  EnemyShip, 
  NarrativeEvent, 
  NarrativeEventChoice, 
  ActiveScreen,
  Faction,
  CommanderProgression,
  PlayableShip,
  MarketItem,
  ArrestedPirate,
  PoliceProfile,
  GalacticNewsItem,
  ExpeditionLogEntry,
  CycleEconomicSnapshot,
  SpatialAnomaly,
  ColonyCycleProductionHistory,
  MarketEvent
} from './types/game';
import { initialStarSystems, initialFactions } from './data/galaxyData';
import { initialShipStats, availableUpgrades as initialUpgrades, availableCrew, initialTechTree } from './data/upgradesData';
import { PLAYABLE_SHIPS, createShipStatsFromPlayable } from './data/shipsData';
import { narrativeEvents } from './data/eventsData';
import { generateArrestedPirate, WantedPirateBoss } from './data/piratesData';
import { INITIAL_GALACTIC_NEWS, generateRandomNewsEvent } from './data/galacticNewsData';
import { INITIAL_EXPEDITION_LOGS } from './data/expeditionLogsData';
import { generateDefaultEconomicHistory } from './data/economicMetricsData';
import { generateRandomSpatialAnomalies } from './data/anomaliesData';
import { generateInitialMarketEvents, advanceMarketEvents } from './data/marketEventsData';
import { getColony5CycleProductionHistory } from './utils/colonySparklines';
import { sounds } from './services/soundEffects';

import { TopBar } from './components/TopBar';
import { GalacticHerald } from './components/GalacticHerald';
import { GalaxyMap } from './components/GalaxyMap';
import { SpatialAnomalyModal } from './components/SpatialAnomalyModal';
import { ParallaxStarfieldCanvas } from './components/ParallaxStarfieldCanvas';
import { SystemView } from './components/SystemView';
import { ColonyManager } from './components/ColonyManager';
import { ShipHangar } from './components/ShipHangar';
import { TradeStation } from './components/TradeStation';
import { PolicePrisonStation } from './components/PolicePrisonStation';
import { ResearchTechTree } from './components/ResearchTechTree';
import { CombatArena } from './components/CombatArena';
import { EventModal } from './components/EventModal';
import { FactionsModal } from './components/FactionsModal';
import { CommanderModal } from './components/CommanderModal';
import { PirateAmbushModal } from './components/PirateAmbushModal';
import { PoliceCustomsModal } from './components/PoliceCustomsModal';
import { KingsNpcChamber } from './components/KingsNpcChamber';
import { KingdomsView } from './components/KingdomsView';
import { INITIAL_NPCS } from './data/npcData';
import { INITIAL_KINGDOMS } from './data/kingdomsData';
import { NpcCharacter, NpcQuest, DialogueOption } from './types/npc';
import { Kingdom, KingdomId, RoyalPrivilege, RoyalPetition, AllegianceRank, KingdomTitle } from './types/kingdom';

const SAVE_KEY = 'astraea_odyssey_save_v1';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('GALAXY_MAP');
  const [systems, setSystems] = useState<StarSystem[]>(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.systems && Array.isArray(parsed.systems)) {
          const existingIds = new Set(parsed.systems.map((s: StarSystem) => s.id));
          const missing = initialStarSystems.filter(s => !existingIds.has(s.id));
          return [...parsed.systems, ...missing];
        }
      }
    } catch {}
    return initialStarSystems;
  });
  const [currentSystemId, setCurrentSystemId] = useState<string>('sol');
  const [resources, setResources] = useState<Resources>(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.resources) {
          return {
            ...parsed.resources,
            nukes: parsed.resources.nukes ?? 2
          };
        }
      }
    } catch {}
    return {
      credits: 850,
      fuel: 100,
      maxFuel: 100,
      alloys: 75,
      science: 45,
      antimatter: 0,
      food: 60,
      colonists: 30,
      nukes: 2
    };
  });
  const [shipStats, setShipStats] = useState<ShipStats>(initialShipStats);
  const [upgrades, setUpgrades] = useState<ShipUpgrade[]>(initialUpgrades);
  const [hiredCrew, setHiredCrew] = useState<CrewMember[]>([availableCrew[0]]); // Captain Elena
  const [techTree, setTechTree] = useState<ResearchTech[]>(initialTechTree);
  const [factions, setFactions] = useState<Record<string, Faction>>(() => {
    try {
      const saved = localStorage.getItem('astraea_factions_v1');
      if (saved) return JSON.parse(saved);
      const saveObj = localStorage.getItem(SAVE_KEY);
      if (saveObj) {
        const parsed = JSON.parse(saveObj);
        if (parsed.factions) return parsed.factions;
      }
    } catch {}
    return initialFactions;
  });
  const [stardate, setStardate] = useState<number>(2184.2);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Commander Progression & 40 Tactical Campaign State
  const [commander, setCommander] = useState<CommanderProgression>(() => {
    try {
      const saved = localStorage.getItem('astraea_commander_progression_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      level: 1,
      xp: 0,
      xpToNextLevel: 150,
      skillPoints: 1,
      skills: {
        weapons: 0,
        shields: 0,
        engines: 0,
        tactics: 0,
        reactor: 0
      }
    };
  });

  const [completedCampaignLevels, setCompletedCampaignLevels] = useState<Record<number, { stars: number }>>(() => {
    try {
      const saved = localStorage.getItem('astraea_campaign_levels_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const [ownedShipIds, setOwnedShipIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('astraea_owned_ships_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['normandy_x'];
  });

  // Persistent Player Cargo Hold (carried across all star systems)
  const [playerCargo, setPlayerCargo] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('astraea_player_cargo_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Ship's Brig (Arrested Pirates)
  const [arrestedPirates, setArrestedPirates] = useState<ArrestedPirate[]>(() => {
    try {
      const saved = localStorage.getItem('astraea_arrested_pirates_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [generateArrestedPirate('medium')];
  });

  // Police Profile & Record
  const [policeProfile, setPoliceProfile] = useState<PoliceProfile>(() => {
    try {
      const saved = localStorage.getItem('astraea_police_profile_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      bountiesCollected: 0,
      piratesHandedOver: 0,
      officerRank: 'Гражданский содействующий',
      reputationWithPolice: 10,
      totalBountyCredits: 0,
      licenses: {
        bountyHunterBadge: false,
        customsImmunity: false,
        stunHarpoonAuthorized: false
      }
    };
  });

  // Galactic Herald News Feed
  const [galacticNews, setGalacticNews] = useState<GalacticNewsItem[]>(() => {
    try {
      const saved = localStorage.getItem('astraea_galactic_news_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_GALACTIC_NEWS;
  });

  // Expedition Action Log (Latest 10 actions: docking, combat, colony, trade)
  const [expeditionLogs, setExpeditionLogs] = useState<ExpeditionLogEntry[]>(() => {
    try {
      const saved = localStorage.getItem('astraea_expedition_logs_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.slice(0, 10);
      }
    } catch {}
    return INITIAL_EXPEDITION_LOGS;
  });

  const addExpeditionLog = (entry: Omit<ExpeditionLogEntry, 'id' | 'timestamp'> & { id?: string; timestamp?: string }) => {
    const newEntry: ExpeditionLogEntry = {
      id: entry.id || `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: entry.timestamp || `Зв. Дата ${stardate.toFixed(1)}`,
      stardate: entry.stardate ?? stardate,
      ...entry
    };
    setExpeditionLogs(prev => {
      const updated = [newEntry, ...prev].slice(0, 10);
      try {
        localStorage.setItem('astraea_expedition_logs_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Spatial Anomalies State
  const [anomalies, setAnomalies] = useState<SpatialAnomaly[]>(() => {
    try {
      const saved = localStorage.getItem('astraea_spatial_anomalies_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return generateRandomSpatialAnomalies(initialStarSystems, 2184.2, 4);
  });
  const [activeAnomalyEncounter, setActiveAnomalyEncounter] = useState<SpatialAnomaly | null>(null);

  // Temporary Market Events State
  const [marketEvents, setMarketEvents] = useState<MarketEvent[]>(() => {
    try {
      const saved = localStorage.getItem('astraea_market_events_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return generateInitialMarketEvents(initialStarSystems, 2184.2);
  });

  // Parallax starfield warp transition dynamics
  const [isWarping, setIsWarping] = useState<boolean>(false);
  const [warpVector, setWarpVector] = useState<{ dx: number; dy: number; dist: number }>({ dx: 0, dy: -1, dist: 0 });

  const handleScanAnomalies = () => {
    sounds.playScanPing();
    const fresh = generateRandomSpatialAnomalies(systems, stardate, 4);
    setAnomalies(fresh);
    try {
      localStorage.setItem('astraea_spatial_anomalies_v1', JSON.stringify(fresh));
    } catch {}
    showToast(`[ДАЛЬНИЙ СЕНСОР]: Глубокое сканирование выявило ${fresh.length} пространственных аномалий!`);
  };

  // Colony production yields memo
  const currentColonyYields = React.useMemo(() => {
    let cCredits = 0;
    let cAlloys = 0;
    let cScience = 0;
    let cFuel = 0;
    let cFood = 0;

    systems.forEach(sys => {
      sys.bodies.forEach(b => {
        if (b.colony) {
          b.colony.buildings.forEach(building => {
            if (building.production.credits) cCredits += building.production.credits;
            if (building.production.alloys) cAlloys += building.production.alloys;
            if (building.production.science) cScience += building.production.science;
            if (building.production.fuel) cFuel += building.production.fuel;
            if (building.production.food) cFood += building.production.food;
          });
        }
      });
    });

    return {
      credits: Math.max(30, cCredits),
      alloys: Math.max(10, cAlloys),
      science: Math.max(15, cScience),
      fuel: Math.max(8, cFuel),
      food: Math.max(20, cFood)
    };
  }, [systems]);

  // Economic Dynamics History (Credits & Alloys for Recharts, with 10 past cycles)
  const [economicHistory, setEconomicHistory] = useState<CycleEconomicSnapshot[]>(() => {
    try {
      const saved = localStorage.getItem('astraea_economic_history_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return generateDefaultEconomicHistory(850, 75, 2184.2);
  });

  const liveEconomicHistory = React.useMemo(() => {
    if (!economicHistory || economicHistory.length === 0) {
      return generateDefaultEconomicHistory(resources.credits, resources.alloys, stardate, currentColonyYields);
    }
    const cloned = [...economicHistory];
    const lastIndex = cloned.length - 1;
    const prevCredits = lastIndex > 0 ? cloned[lastIndex - 1].credits : Math.round(resources.credits * 0.94);
    const prevAlloys = lastIndex > 0 ? cloned[lastIndex - 1].alloys : Math.round(resources.alloys * 0.92);
    cloned[lastIndex] = {
      ...cloned[lastIndex],
      credits: resources.credits,
      alloys: resources.alloys,
      creditsDelta: resources.credits - prevCredits,
      alloysDelta: resources.alloys - prevAlloys,
      colonyProductionCredits: currentColonyYields.credits,
      colonyProductionAlloys: currentColonyYields.alloys,
      colonyProductionScience: currentColonyYields.science,
      colonyProductionFood: currentColonyYields.food,
      colonyProductionFuel: currentColonyYields.fuel,
      stardate: stardate,
      cycleLabel: `Зв. Дата ${stardate.toFixed(1)} (Текущий цикл ${cloned[lastIndex]?.cycle || 11})`
    };
    return cloned;
  }, [economicHistory, resources.credits, resources.alloys, stardate, currentColonyYields]);

  // Kings & Galactic NPCs State
  const [npcs, setNpcs] = useState<NpcCharacter[]>(() => {
    try {
      const saved = localStorage.getItem('astraea_npcs_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const existingMap = new Map(parsed.map((n: NpcCharacter) => [n.id, n]));
          return INITIAL_NPCS.map(n => existingMap.get(n.id) || n);
        }
      }
    } catch {}
    return INITIAL_NPCS;
  });

  // Great Galactic Kingdoms & Sovereign Realms State
  const [kingdoms, setKingdoms] = useState<Kingdom[]>(() => {
    try {
      const saved = localStorage.getItem('astraea_kingdoms_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const existingMap = new Map(parsed.map((k: Kingdom) => [k.id, k]));
          return INITIAL_KINGDOMS.map(k => existingMap.get(k.id) || k);
        }
      }
    } catch {}
    return INITIAL_KINGDOMS;
  });

  // Player Profile: Name & Active Kingdom Title
  const [playerName, setPlayerName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('astraea_player_name_v1');
      if (saved) return saved;
    } catch {}
    return 'Командир Астреи';
  });

  const [activeTitleId, setActiveTitleId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('astraea_active_title_id_v1') || null;
    } catch {}
    return null;
  });

  const activeKingdomTitle = React.useMemo<KingdomTitle | null>(() => {
    if (!activeTitleId) return null;
    for (const k of kingdoms) {
      const found = k.titles.find(t => t.id === activeTitleId);
      if (found) return found;
    }
    return null;
  }, [activeTitleId, kingdoms]);

  const handleSelectActiveTitle = (title: KingdomTitle | null) => {
    const newId = title ? title.id : null;
    setActiveTitleId(newId);
    try {
      if (newId) localStorage.setItem('astraea_active_title_id_v1', newId);
      else localStorage.removeItem('astraea_active_title_id_v1');
    } catch {}
  };

  const handleUpdatePlayerName = (name: string) => {
    setPlayerName(name);
    try {
      localStorage.setItem('astraea_player_name_v1', name);
    } catch {}
    showToast(`Позывной командира обновлён: «${name}»`);
  };

  const [activePoliceCustoms, setActivePoliceCustoms] = useState<boolean>(false);

  const [isCommanderModalOpen, setIsCommanderModalOpen] = useState<boolean>(false);

  // Overlays & Encounters
  const [activeCombatEnemy, setActiveCombatEnemy] = useState<EnemyShip | null>(null);
  const [activePirateAmbush, setActivePirateAmbush] = useState<{
    enemy: EnemyShip;
    detectedContraband: Array<{ name: string; count: number }>;
  } | null>(null);
  const [activeNarrativeEvent, setActiveNarrativeEvent] = useState<NarrativeEvent | null>(null);
  const [isFactionsModalOpen, setIsFactionsModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Calculate total pirate heat from contraband in cargo hold
  const { pirateHeat, contrabandCount, detectedContraband } = React.useMemo(() => {
    let heat = 0;
    let count = 0;
    const detected: Array<{ name: string; count: number }> = [];

    // Map of all market items across all systems
    const itemsMap = new Map<string, MarketItem>();
    systems.forEach(s => s.market.forEach(m => itemsMap.set(m.id, m)));

    for (const [itemId, qty] of Object.entries(playerCargo)) {
      if (qty > 0) {
        const item = itemsMap.get(itemId);
        if (item?.isContraband) {
          heat += (item.contrabandRisk || 15) * qty;
          count += qty;
          detected.push({ name: item.name, count: qty });
        }
      }
    }

    return {
      pirateHeat: Math.min(100, Math.round(heat)),
      contrabandCount: count,
      detectedContraband: detected
    };
  }, [playerCargo, systems]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const handleUpdateFactions = (newFactions: Record<string, Faction>) => {
    setFactions(newFactions);
    try {
      localStorage.setItem('astraea_factions_v1', JSON.stringify(newFactions));
    } catch {}
  };

  // Buy new ship in shipyard
  const handleBuyShip = (ship: PlayableShip) => {
    if (
      resources.credits < ship.price.credits ||
      resources.alloys < ship.price.alloys ||
      (ship.price.science && resources.science < ship.price.science) ||
      (ship.price.antimatter && resources.antimatter < ship.price.antimatter)
    ) {
      sounds.playAlert();
      showToast('Недостаточно ресурсов для постройки этого корабля!');
      return;
    }

    const bonusNukes = ship.id === 'doomsday_dreadnought' ? 3 : ship.id === 'nuclear_corsair' ? 2 : 0;
    setResources(prev => ({
      ...prev,
      credits: prev.credits - ship.price.credits,
      alloys: prev.alloys - ship.price.alloys,
      science: ship.price.science ? prev.science - ship.price.science : prev.science,
      antimatter: ship.price.antimatter ? prev.antimatter - ship.price.antimatter : prev.antimatter,
      nukes: (prev.nukes ?? 0) + bonusNukes
    }));

    const updatedOwned = Array.from(new Set([...ownedShipIds, ship.id]));
    setOwnedShipIds(updatedOwned);
    try {
      localStorage.setItem('astraea_owned_ships_v1', JSON.stringify(updatedOwned));
    } catch {}

    const newStats = createShipStatsFromPlayable(ship, shipStats);
    setShipStats(newStats);
    sounds.playCreditsChime();
    showToast(`Корабль «${ship.name}» (${ship.className}) успешно куплен и введён во флот!${bonusNukes > 0 ? ` Загружено +${bonusNukes} ядерок!` : ''}`);

    addExpeditionLog({
      type: 'trade',
      title: `Приобретение флагмана «${ship.name}»`,
      description: `Флот экспедиции пополнился звездолётом класса ${ship.className}. Верфь завершила установку орудий и передала судно под командование.`,
      systemName: currentSystem.name,
      badge: 'Покупка корабля',
      metrics: {
        credits: -ship.price.credits,
        alloys: -ship.price.alloys,
        science: ship.price.science ? -ship.price.science : undefined,
        outcome: 'investment'
      }
    });
  };

  // Switch active flagship
  const handleSwitchShip = (shipId: string) => {
    const targetShip = PLAYABLE_SHIPS.find(s => s.id === shipId);
    if (!targetShip) return;

    const newStats = createShipStatsFromPlayable(targetShip, shipStats);
    setShipStats(newStats);
    sounds.playScanPing();
    showToast(`Флагман изменён: вы пересели на «${targetShip.name}»!`);
  };

  // Add Commander XP and level up
  const handleAddCommanderXp = (amount: number) => {
    setCommander(prev => {
      let newXp = prev.xp + amount;
      let newLevel = prev.level;
      let newSkillPoints = prev.skillPoints;
      let newXpToNext = prev.xpToNextLevel;

      while (newXp >= newXpToNext && newLevel < 50) {
        newXp -= newXpToNext;
        newLevel += 1;
        newSkillPoints += 1;
        newXpToNext = Math.round(newXpToNext * 1.35 + 40);
        sounds.playCreditsChime();
        showToast(`Повышение! Командир достиг ${newLevel}-го уровня (+1 очко навыков)!`);
      }

      const updated: CommanderProgression = {
        ...prev,
        level: newLevel,
        xp: newXp,
        xpToNextLevel: newXpToNext,
        skillPoints: newSkillPoints
      };
      try {
        localStorage.setItem('astraea_commander_progression_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Upgrade a Commander Skill
  const handleUpgradeCommanderSkill = (skillName: keyof CommanderProgression['skills']) => {
    if (commander.skillPoints <= 0) return;
    sounds.playPowerUp();
    setCommander(prev => {
      if (prev.skillPoints <= 0) return prev;
      const updated: CommanderProgression = {
        ...prev,
        skillPoints: prev.skillPoints - 1,
        skills: {
          ...prev.skills,
          [skillName]: (prev.skills[skillName] || 0) + 1
        }
      };
      try {
        localStorage.setItem('astraea_commander_progression_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(`Навык улучшен! Бонус системы активен.`);
  };

  // Reset Commander Skills (respec)
  const handleResetCommanderSkills = () => {
    sounds.playScanPing();
    setCommander(prev => {
      const totalPoints = Object.values(prev.skills).reduce((a, b) => a + b, 0) + prev.skillPoints;
      const updated: CommanderProgression = {
        ...prev,
        skillPoints: totalPoints,
        skills: {
          weapons: 0,
          shields: 0,
          engines: 0,
          tactics: 0,
          reactor: 0
        }
      };
      try {
        localStorage.setItem('astraea_commander_progression_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast('Навыки командира сброшены. Очки возвращены.');
  };

  // Record Level Completion (Stars)
  const handleRecordLevelCompletion = (levelNumber: number, stars: number) => {
    setCompletedCampaignLevels(prev => {
      const currentBest = prev[levelNumber]?.stars || 0;
      const updated = {
        ...prev,
        [levelNumber]: { stars: Math.max(currentBest, stars) }
      };
      try {
        localStorage.setItem('astraea_campaign_levels_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Load game from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.systems) setSystems(parsed.systems);
        if (parsed.currentSystemId) setCurrentSystemId(parsed.currentSystemId);
        if (parsed.resources) setResources(parsed.resources);
        if (parsed.shipStats) setShipStats(parsed.shipStats);
        if (parsed.stardate) setStardate(parsed.stardate);
        if (parsed.factions) setFactions(parsed.factions);
        if (parsed.hiredCrew) setHiredCrew(parsed.hiredCrew);
        if (parsed.commander) setCommander(parsed.commander);
        if (parsed.completedCampaignLevels) setCompletedCampaignLevels(parsed.completedCampaignLevels);
        if (parsed.ownedShipIds) setOwnedShipIds(parsed.ownedShipIds);
        if (parsed.playerCargo) setPlayerCargo(parsed.playerCargo);
        if (parsed.arrestedPirates) setArrestedPirates(parsed.arrestedPirates);
        if (parsed.policeProfile) setPoliceProfile(parsed.policeProfile);
        if (parsed.galacticNews) setGalacticNews(parsed.galacticNews);
        if (parsed.kingdoms) setKingdoms(parsed.kingdoms);
        if (parsed.playerName) setPlayerName(parsed.playerName);
        if (parsed.activeTitleId !== undefined) setActiveTitleId(parsed.activeTitleId);
        if (parsed.anomalies) setAnomalies(parsed.anomalies);
        if (parsed.marketEvents) setMarketEvents(parsed.marketEvents);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save game to localStorage
  const handleSaveGame = () => {
    try {
      const data = {
        systems,
        currentSystemId,
        resources,
        shipStats,
        stardate,
        factions,
        hiredCrew,
        commander,
        completedCampaignLevels,
        ownedShipIds,
        playerCargo,
        arrestedPirates,
        policeProfile,
        galacticNews,
        kingdoms,
        playerName,
        activeTitleId,
        anomalies,
        marketEvents,
        expeditionLogs: expeditionLogs.slice(0, 10),
        economicHistory: economicHistory.slice(-10)
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      showToast('Прогресс экспедиции, королевств, титулов и флота сохранены!');
    } catch {
      showToast('Ошибка при сохранении данных.');
    }
  };

  const handleRefreshNews = () => {
    sounds.playScanPing();
    const freshNews = generateRandomNewsEvent(stardate, currentSystem.sector);
    setGalacticNews(prev => {
      const updated = [freshNews, ...prev.filter(n => n.headline !== freshNews.headline)].slice(0, 6);
      try {
        localStorage.setItem('astraea_galactic_news_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    showToast(`[ГАЛАКТИЧЕСКИЙ ВЕСТНИК]: Перехвачена свежая сводка из сектора «${currentSystem.sectorName}»!`);
  };

  const currentSystem = systems.find(s => s.id === currentSystemId) || systems[0];

  // Warp Jump Handler
  const handleWarpJump = (targetSystem: StarSystem) => {
    const dx = targetSystem.x - currentSystem.x;
    const dy = targetSystem.y - currentSystem.y;
    const dist = Math.round(Math.sqrt(dx * dx + dy * dy));
    const baseFuelCost = Math.max(5, Math.round(dist / 10));

    // Check speed boost bonus anomaly (origin or destination has tachyon speed boost)
    const hasSpeedBoost = anomalies.some(
      a => (a.systemId === targetSystem.id || a.systemId === currentSystem.id) && a.type === 'speed_boost'
    );
    const effectiveFuelCost = hasSpeedBoost ? 0 : baseFuelCost;

    if (effectiveFuelCost > 0 && resources.fuel < effectiveFuelCost) {
      sounds.playAlert();
      showToast('Недостаточно топлива Гелий-3 для совершения прыжка!');
      return;
    }

    sounds.playWarpJump();
    if (effectiveFuelCost > 0) {
      setResources(prev => ({
        ...prev,
        fuel: Math.max(0, prev.fuel - effectiveFuelCost)
      }));
    }

    // Trigger parallax starfield hyperspace warp streaks along jump vector
    setWarpVector({ dx, dy, dist });
    setIsWarping(true);
    setTimeout(() => {
      setIsWarping(false);
    }, 1400);

    const nextStardate = +(stardate + 0.3).toFixed(1);
    setStardate(nextStardate);
    setCurrentSystemId(targetSystem.id);

    // Mark visited
    setSystems(prev => prev.map(s => s.id === targetSystem.id ? { ...s, visited: true } : s));
    
    if (hasSpeedBoost) {
      showToast(`⚡ Тахионный поток удвоил скорость перехода! Прыжок в ${targetSystem.name} совершён без расхода топлива!`);
    } else {
      showToast(`Варп-переход завершён! Вы прибыли в систему ${targetSystem.name}.`);
    }

    addExpeditionLog({
      type: 'docking',
      title: `Стыковка и выход на орбиту: ${targetSystem.name}`,
      description: `Флагман завершил гиперпрыжок через эфир и лёг на стационарную орбиту звёздной системы ${targetSystem.name} (${targetSystem.sectorName}). Навигационные протоколы и стыковка с орбитальным маяком подтверждены.${hasSpeedBoost ? ' Тахионный поток обеспечил удвоение скорости без расхода топлива.' : ''}`,
      systemName: targetSystem.name,
      sectorName: targetSystem.sectorName,
      badge: hasSpeedBoost ? 'Варп-ускорение (0 He-3)' : 'Варп-стыковка',
      metrics: {
        fuel: -effectiveFuelCost
      }
    });

    // Check if target system has an active Spatial Anomaly!
    const encounteredAnomaly = anomalies.find(a => a.systemId === targetSystem.id);
    if (encounteredAnomaly) {
      const { effectValues, polarity } = encounteredAnomaly;

      // Apply Shield changes
      if (effectValues.shieldDelta !== undefined) {
        const delta = effectValues.shieldDelta;
        setShipStats(prev => {
          let updatedShields = prev.shields + delta;
          if (delta < 0) {
            updatedShields = Math.max(0, updatedShields);
          } else {
            updatedShields = Math.min(prev.maxShields + 40, updatedShields);
          }
          return { ...prev, shields: updatedShields };
        });
        if (delta < 0) {
          sounds.playShieldHit();
        } else {
          sounds.playPowerUp();
        }
      }

      // Apply Hull changes
      if (effectValues.hullDelta !== undefined) {
        setShipStats(prev => ({
          ...prev,
          hull: Math.max(1, prev.hull + (effectValues.hullDelta || 0))
        }));
        sounds.playShieldHit();
      }

      // Apply resource rewards or penalties
      if (
        effectValues.creditsReward ||
        effectValues.alloysReward ||
        effectValues.scienceReward ||
        effectValues.antimatterReward ||
        effectValues.fuelDelta
      ) {
        setResources(prev => ({
          ...prev,
          credits: Math.max(0, prev.credits + (effectValues.creditsReward || 0)),
          alloys: Math.max(0, prev.alloys + (effectValues.alloysReward || 0)),
          science: Math.max(0, prev.science + (effectValues.scienceReward || 0)),
          antimatter: Math.max(0, prev.antimatter + (effectValues.antimatterReward || 0)),
          fuel: Math.max(0, prev.fuel + (effectValues.fuelDelta || 0))
        }));
      }

      // Apply Commander XP reward
      if (effectValues.xpReward) {
        handleAddCommanderXp(effectValues.xpReward);
      }

      // Log into Expedition Log
      addExpeditionLog({
        type: 'anomaly',
        title: `Аномалия: ${encounteredAnomaly.title}`,
        description: `Флагман вошёл в сектор «${targetSystem.sectorName}» и прошёл через разлом «${encounteredAnomaly.name}». ${encounteredAnomaly.effectDescription}`,
        systemName: targetSystem.name,
        sectorName: targetSystem.sectorName,
        badge: polarity === 'bonus' 
          ? 'Аномальный бонус' 
          : polarity === 'penalty' 
            ? 'Аномальный урон' 
            : polarity === 'quantum' 
              ? 'Квантовый дар' 
              : 'Аномальный риск',
        metrics: {
          credits: effectValues.creditsReward,
          alloys: effectValues.alloysReward,
          science: effectValues.scienceReward,
          fuel: effectValues.fuelDelta,
          xp: effectValues.xpReward
        }
      });

      // Show Anomaly Encounter Dialog
      setTimeout(() => {
        setActiveAnomalyEncounter(encounteredAnomaly);
      }, 500);
    }

    // Tick down duration of existing anomalies and regenerate new ones if expired
    setAnomalies(prev => {
      // Decrement duration for all except the encountered one which is absorbed
      const updated = prev
        .filter(a => a.systemId !== targetSystem.id)
        .map(a => ({ ...a, durationJumps: a.durationJumps - 1 }))
        .filter(a => a.durationJumps > 0);

      // If count is low, generate new anomalies in empty systems
      if (updated.length < 3) {
        const countToGenerate = Math.max(1, 4 - updated.length);
        const fresh = generateRandomSpatialAnomalies(systems, nextStardate, countToGenerate, updated);
        const merged = [...updated, ...fresh];
        try {
          localStorage.setItem('astraea_spatial_anomalies_v1', JSON.stringify(merged));
        } catch {}
        return merged;
      }

      try {
        localStorage.setItem('astraea_spatial_anomalies_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Contraband Pirate Ambush Check
    // If player carries contraband, pirate heat significantly raises ambush chance
    const roll = Math.random();
    const ambushChance = 0.20 + (pirateHeat / 100) * 0.70;

    if (pirateHeat > 0 && Math.random() < ambushChance) {
      // Dedicated Pirate Raider Ambush triggered by contraband
      const pirateShip: EnemyShip = {
        id: `pirate_ambush_${Date.now()}`,
        name: pirateHeat >= 65 
          ? `Флагман Барона Корсаров «Кровавая Бездна»` 
          : targetSystem.hazardLevel >= 3 
            ? `Тяжёлый Рейдер Синдиката «Опустошитель»` 
            : `Корсар-Перехватчик «Шершень»`,
        faction: 'syndicate',
        hull: 75 + targetSystem.hazardLevel * 25 + Math.round(pirateHeat * 0.5),
        maxHull: 75 + targetSystem.hazardLevel * 25 + Math.round(pirateHeat * 0.5),
        shields: 40 + targetSystem.hazardLevel * 18 + Math.round(pirateHeat * 0.4),
        maxShields: 40 + targetSystem.hazardLevel * 18 + Math.round(pirateHeat * 0.4),
        weaponsPower: 20 + targetSystem.hazardLevel * 5 + Math.round(pirateHeat * 0.15),
        evasion: 12,
        gridX: 8,
        gridY: 3,
        range: 4,
        movementPoints: 2,
        reward: {
          credits: 320 + targetSystem.hazardLevel * 90 + pirateHeat * 6,
          alloys: 45 + targetSystem.hazardLevel * 15,
          science: 30,
          antimatter: targetSystem.hazardLevel >= 3 || pirateHeat >= 50 ? 8 : 0
        }
      };

      setTimeout(() => {
        sounds.playAlert();
        setActivePirateAmbush({
          enemy: pirateShip,
          detectedContraband
        });
      }, 650);
    } else if (roll < 0.22) {
      // Narrative Event
      const randomEvent = narrativeEvents[Math.floor(Math.random() * narrativeEvents.length)];
      setTimeout(() => {
        sounds.playAlert();
        setActiveNarrativeEvent(randomEvent);
      }, 600);
    } else if (roll < 0.38 && targetSystem.hazardLevel >= 2) {
      // Space Pirate / Marauder Attack
      setTimeout(() => {
        sounds.playAlert();
        setActiveCombatEnemy({
          id: 'pirate_corvette',
          name: targetSystem.hazardLevel >= 4 ? 'Дредноут Опустошителей' : 'Корсар Синдиката',
          faction: 'syndicate',
          hull: 60 + targetSystem.hazardLevel * 20,
          maxHull: 60 + targetSystem.hazardLevel * 20,
          shields: 40 + targetSystem.hazardLevel * 15,
          maxShields: 40 + targetSystem.hazardLevel * 15,
          weaponsPower: 18 + targetSystem.hazardLevel * 5,
          evasion: 10,
          reward: {
            credits: 200 + targetSystem.hazardLevel * 80,
            alloys: 30 + targetSystem.hazardLevel * 15,
            science: 20,
            antimatter: targetSystem.hazardLevel >= 4 ? 6 : 0
          }
        });
        setActiveScreen('COMBAT');
      }, 600);
    } else {
      // Chance of Galactic Police Patrol / Customs scan in civilized space or with contraband
      const isFederationSpace = ['sol', 'kepler', 'proxima'].includes(targetSystem.id);
      if ((isFederationSpace && Math.random() < 0.28) || (contrabandCount > 0 && Math.random() < 0.35)) {
        setTimeout(() => {
          sounds.playScanPing();
          setActivePoliceCustoms(true);
        }, 700);
      }
    }

    // Galactic Herald: Chance of regional broadcast update during warp
    if (Math.random() < 0.65) {
      const jumpNews = generateRandomNewsEvent(stardate + 0.1, targetSystem.sector);
      setGalacticNews(prev => {
        const updated = [jumpNews, ...prev.filter(n => n.headline !== jumpNews.headline)].slice(0, 6);
        try {
          localStorage.setItem('astraea_galactic_news_v1', JSON.stringify(updated));
        } catch {}
        return updated;
      });
    }
  };

  // Planetary Scan Handler
  const handleScanBody = (body: CelestialBody) => {
    setSystems(prev => prev.map(sys => {
      if (sys.id !== currentSystemId) return sys;
      return {
        ...sys,
        bodies: sys.bodies.map(b => b.id === body.id ? { ...b, scanned: true } : b)
      };
    }));

    setResources(prev => ({
      ...prev,
      science: prev.science + 15
    }));
    showToast(`Планета ${body.name} отсканирована! Получено +15 Научных данных.`);
  };

  // Planetary Mining Handler
  const handleMineBody = (body: CelestialBody) => {
    if (!body.resourcesYield) return;

    setResources(prev => ({
      ...prev,
      credits: prev.credits + (body.resourcesYield?.credits || 0),
      alloys: prev.alloys + (body.resourcesYield?.alloys || 0),
      fuel: Math.min(prev.maxFuel, prev.fuel + (body.resourcesYield?.fuel || 0)),
      science: prev.science + (body.resourcesYield?.science || 0),
      antimatter: prev.antimatter + (body.resourcesYield?.antimatter || 0),
      food: prev.food + (body.resourcesYield?.food || 0),
      colonists: prev.colonists + (body.resourcesYield?.colonists || 0)
    }));

    // Mark mined out
    setSystems(prev => prev.map(sys => {
      if (sys.id !== currentSystemId) return sys;
      return {
        ...sys,
        bodies: sys.bodies.map(b => b.id === body.id ? { ...b, minedOut: true } : b)
      };
    }));

    showToast(`Добыча завершена на ${body.name}! Ресурсы перевезены в трюм.`);
  };

  // Found Colony Handler
  const handleFoundColony = (body: CelestialBody) => {
    if (resources.colonists < 10 || resources.alloys < 30) {
      sounds.playAlert();
      showToast('Для основания колонии требуется 10 поселенцев и 30 сплавов!');
      return;
    }

    sounds.playCreditsChime();
    setResources(prev => ({
      ...prev,
      colonists: prev.colonists - 10,
      alloys: prev.alloys - 30
    }));

    setSystems(prev => prev.map(sys => {
      if (sys.id !== currentSystemId) return sys;
      return {
        ...sys,
        bodies: sys.bodies.map(b => {
          if (b.id !== body.id) return b;
          return {
            ...b,
            colony: {
              planetId: b.id,
              name: `Новый Эдем (${b.name})`,
              population: 15,
              happiness: 80,
              defenseRating: 100,
              buildings: [
                {
                  id: 'initial_hab',
                  name: 'Базовый Жилой Модуль',
                  description: 'Стартовое поселение колонистов',
                  cost: { credits: 0, alloys: 0 },
                  production: { credits: 10, alloys: 3 },
                  energyCost: 0,
                  built: true
                }
              ]
            }
          };
        })
      };
    }));

    showToast(`Новая колония успешно основана на ${body.name}!`);
    addExpeditionLog({
      type: 'colony',
      title: `Основание колонии на объекте ${body.name}`,
      description: `Исторический шаг экспедиции: на объекте ${body.name} (${body.typeName}) в системе ${currentSystem.name} развёрнут флагманский купол и высажен контингент колонистов!`,
      systemName: currentSystem.name,
      sectorName: currentSystem.sectorName,
      badge: 'Новая колония',
      metrics: {
        colonists: 10,
        alloys: -30
      }
    });
    setActiveScreen('COLONY_MANAGER');
  };

  // Build Structure in Colony
  const handleBuildStructure = (systemId: string, planetId: string, buildingId: string) => {
    const bDefName = buildingId === 'fusion_plant' ? 'Термоядерный Реактор' :
                     buildingId === 'mining_complex' ? 'Горно-Обогатительный Комбинат' :
                     buildingId === 'hydroponic_dome' ? 'Гидропонный Купол' :
                     buildingId === 'quantum_lab' ? 'Квантовая Лаборатория' : 'Орбитальная Батарея ПКО';

    addExpeditionLog({
      type: 'colony',
      title: `Развитие колонии: монтаж «${bDefName}»`,
      description: `В колониальном секторе успешно введён в строй модуль «${bDefName}». Промышленный и ресурсный потенциал поселения усилен.`,
      systemName: currentSystem.name,
      badge: 'Строительство'
    });

    setSystems(prev => prev.map(sys => {
      if (sys.id !== systemId) return sys;
      return {
        ...sys,
        bodies: sys.bodies.map(b => {
          if (b.id !== planetId || !b.colony) return b;
          return {
            ...b,
            colony: {
              ...b.colony,
              buildings: [
                ...b.colony.buildings,
                {
                  id: buildingId + '_' + Date.now(),
                  name: buildingId === 'fusion_plant' ? 'Термоядерный Реактор' :
                        buildingId === 'mining_complex' ? 'Горно-Обогатительный Комбинат' :
                        buildingId === 'hydroponic_dome' ? 'Гидропонный Купол' :
                        buildingId === 'quantum_lab' ? 'Квантовая Лаборатория' : 'Орбитальная Батарея ПКО',
                  description: 'Функционирующий колониальный комплекс',
                  cost: { credits: 0, alloys: 0 },
                  production: buildingId === 'mining_complex' ? { alloys: 15, credits: 20 } :
                              buildingId === 'hydroponic_dome' ? { food: 25 } :
                              buildingId === 'quantum_lab' ? { science: 18 } : { fuel: 10 },
                  energyCost: 0,
                  built: true
                }
              ]
            }
          };
        })
      };
    }));

    showToast('Строительство комплекса завершено!');
  };

  // Turn Progression / Next Stardate Cycle
  const handleAdvanceCycle = () => {
    let earnedCredits = 0;
    let earnedAlloys = 0;
    let earnedScience = 0;
    let earnedFuel = 0;
    let earnedFood = 0;

    systems.forEach(sys => {
      sys.bodies.forEach(b => {
        if (b.colony) {
          b.colony.buildings.forEach(building => {
            if (building.production.credits) earnedCredits += building.production.credits;
            if (building.production.alloys) earnedAlloys += building.production.alloys;
            if (building.production.science) earnedScience += building.production.science;
            if (building.production.fuel) earnedFuel += building.production.fuel;
            if (building.production.food) earnedFood += building.production.food;
          });
        }
      });
    });

    // Royal Privileges and Kingdom Investment Dividends
    let royalCredits = 0;
    let royalAlloys = 0;
    let royalScience = 0;
    let royalAntimatter = 0;
    let royalFood = 0;

    kingdoms.forEach(k => {
      if (k.playerInvestment > 0) {
        royalCredits += Math.round(k.playerInvestment * 0.08);
      }
      k.privileges.forEach(p => {
        if (p.unlocked && p.passiveBonus) {
          if (p.passiveBonus.cycleCreditsYield) royalCredits += p.passiveBonus.cycleCreditsYield;
          if (p.passiveBonus.cycleAlloysYield) royalAlloys += p.passiveBonus.cycleAlloysYield;
          if (p.passiveBonus.cycleScienceYield) royalScience += p.passiveBonus.cycleScienceYield;
          if (p.passiveBonus.cycleAntimatterYield) royalAntimatter += p.passiveBonus.cycleAntimatterYield;
          if (p.passiveBonus.cycleFoodYield) royalFood += p.passiveBonus.cycleFoodYield;
        }
      });
    });

    // Active Kingdom Title Perks
    if (activeKingdomTitle?.perk) {
      if (activeKingdomTitle.perk.extraCredits) royalCredits += activeKingdomTitle.perk.extraCredits;
      if (activeKingdomTitle.perk.extraScience) royalScience += activeKingdomTitle.perk.extraScience;
    }

    const newTotalCredits = resources.credits + earnedCredits + royalCredits;
    const newTotalAlloys = resources.alloys + earnedAlloys + royalAlloys;
    const nextStardateVal = +(stardate + 1.0).toFixed(1);

    setResources(prev => ({
      ...prev,
      credits: newTotalCredits,
      alloys: newTotalAlloys,
      science: prev.science + earnedScience + royalScience,
      antimatter: prev.antimatter + royalAntimatter,
      fuel: Math.min(prev.maxFuel, prev.fuel + earnedFuel),
      food: prev.food + earnedFood + royalFood
    }));

    setStardate(nextStardateVal);

    // Advance each colony's 5-cycle production history snapshot
    const cycleSnapshotNum = Math.round(nextStardateVal);
    setSystems(prev => {
      const updated = prev.map(sys => ({
        ...sys,
        bodies: sys.bodies.map(b => {
          if (!b.colony) return b;
          let cCredits = 0;
          let cAlloys = 0;
          let cScience = 0;
          let cFuel = 0;
          let cFood = 0;
          b.colony.buildings.forEach(building => {
            if (building.production.credits) cCredits += building.production.credits;
            if (building.production.alloys) cAlloys += building.production.alloys;
            if (building.production.science) cScience += building.production.science;
            if (building.production.fuel) cFuel += building.production.fuel;
            if (building.production.food) cFood += building.production.food;
          });
          cCredits += Math.max(5, Math.round(b.colony.population * 0.05));
          const cTotal = cCredits + cAlloys * 2 + cScience * 3 + cFuel * 2 + cFood;
          const currentHist = getColony5CycleProductionHistory(b.colony, Math.round(stardate));
          const newColonySnapshot: ColonyCycleProductionHistory = {
            cycle: cycleSnapshotNum,
            credits: cCredits,
            alloys: cAlloys,
            science: cScience,
            fuel: cFuel,
            food: cFood,
            totalOutput: cTotal,
            population: b.colony.population
          };
          return {
            ...b,
            colony: {
              ...b.colony,
              productionHistory: [...currentHist, newColonySnapshot].slice(-10)
            }
          };
        })
      }));
      return updated;
    });

    // Record new cycle in economic history for Recharts
    setEconomicHistory(prev => {
      const nextCycleNum = (prev[prev.length - 1]?.cycle || 5) + 1;
      const newSnapshot: CycleEconomicSnapshot = {
        cycle: nextCycleNum,
        stardate: nextStardateVal,
        cycleLabel: `Зв. Дата ${nextStardateVal.toFixed(1)}`,
        credits: newTotalCredits,
        alloys: newTotalAlloys,
        creditsDelta: earnedCredits + royalCredits,
        alloysDelta: earnedAlloys + royalAlloys,
        colonyProductionCredits: earnedCredits,
        colonyProductionAlloys: earnedAlloys,
        tradeTurnoverCredits: 0,
        eventDescription: `Завершение цикла: доход колоний +${earnedCredits} ⬡, монархий +${royalCredits} ⬡, сплавов +${earnedAlloys + royalAlloys} т`
      };
      const updated = [...prev, newSnapshot].slice(-10);
      try {
        localStorage.setItem('astraea_economic_history_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Advance temporary market events across the galaxy
    setMarketEvents(prev => {
      const updated = advanceMarketEvents(prev, systems, nextStardateVal);
      try {
        localStorage.setItem('astraea_market_events_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    const royalSummary = royalCredits > 0 ? ` (в т.ч. +${royalCredits} ⬡ дивидендов от Королевств)` : '';
    showToast(`Звёздный цикл завершён! Доход колоний и монархий: +${earnedCredits + royalCredits} ⬡${royalSummary}, +${earnedAlloys + royalAlloys} Сплавов, +${earnedScience + royalScience} Науки.`);
  };

  // Narrative Choice Handler
  const handleMakeChoice = (choice: NarrativeEventChoice) => {
    if (choice.reward) {
      setResources(prev => ({
        ...prev,
        credits: prev.credits + (choice.reward?.credits || 0),
        alloys: prev.alloys + (choice.reward?.alloys || 0),
        fuel: Math.min(prev.maxFuel, prev.fuel + (choice.reward?.fuel || 0)),
        science: prev.science + (choice.reward?.science || 0),
        antimatter: prev.antimatter + (choice.reward?.antimatter || 0),
        colonists: prev.colonists + (choice.reward?.colonists || 0)
      }));
    }

    if (choice.reputationChange) {
      setFactions(prev => {
        const fac = prev[choice.reputationChange!.faction];
        if (!fac) return prev;
        return {
          ...prev,
          [choice.reputationChange!.faction]: {
            ...fac,
            reputation: Math.max(-100, Math.min(100, fac.reputation + choice.reputationChange!.delta))
          }
        };
      });
    }

    if (choice.hullDamage) {
      setShipStats(prev => ({
        ...prev,
        hull: Math.max(10, prev.hull - choice.hullDamage!)
      }));
    }

    setActiveNarrativeEvent(null);
    showToast(choice.outcomeText);
  };

  // Combat Handlers
  const handleCombatVictory = (reward: EnemyShip['reward']) => {
    const enemyName = activeCombatEnemy?.name || 'Вражеский корабль';
    setResources(prev => ({
      ...prev,
      credits: prev.credits + reward.credits,
      alloys: prev.alloys + reward.alloys,
      science: prev.science + (reward.science || 0),
      antimatter: prev.antimatter + (reward.antimatter || 0)
    }));

    addExpeditionLog({
      type: 'combat',
      title: `Победа в бою над «${enemyName}»`,
      description: `В секторе системы ${currentSystem.name} орудийные батареи и щиты флагмана сокрушили врага. Противник нейтрализован, захвачены трофеи и ценные разведданные.`,
      systemName: currentSystem.name,
      sectorName: currentSystem.sectorName,
      badge: 'Победа в бою',
      metrics: {
        credits: reward.credits,
        alloys: reward.alloys,
        science: reward.science,
        antimatter: reward.antimatter,
        outcome: 'victory'
      }
    });

    setActiveCombatEnemy(null);
    setActiveScreen('SYSTEM_VIEW');
    showToast(`Победа! Получено ${reward.credits} ⬡ и ${reward.alloys} сплавов.`);
  };

  const handleCombatDefeat = () => {
    setShipStats(prev => ({ ...prev, hull: 40, shields: 30 }));
    setResources(prev => ({ ...prev, credits: Math.max(50, prev.credits - 150) }));

    addExpeditionLog({
      type: 'combat',
      title: `Поражение в сражении у системы ${currentSystem.name}`,
      description: `Критический урон энергосетям вынудил экипаж задействовать спасательный гиперпрыжок. Флагман эвакуирован в Солнечную систему на срочный ремонт.`,
      systemName: currentSystem.name,
      badge: 'Аварийный отход',
      metrics: {
        outcome: 'defeat'
      }
    });

    setActiveCombatEnemy(null);
    setCurrentSystemId('sol');
    setActiveScreen('SHIP_HANGAR');
    showToast('Корабль эвакуирован в Солнечную систему на ремонт.');
  };

  const handleFleeCombat = () => {
    const enemyName = activeCombatEnemy?.name || 'Вражеский корабль';
    addExpeditionLog({
      type: 'combat',
      title: `Тактическое отступление из боевого контакта`,
      description: `Флагман поставил комплекс помех и оторвался от «${enemyName}», сохранив экипаж и груз в целости.`,
      systemName: currentSystem.name,
      badge: 'Уход от погони',
      metrics: {
        outcome: 'flee'
      }
    });

    setActiveCombatEnemy(null);
    setActiveScreen('GALAXY_MAP');
    showToast('Экстренный гиперпрыжок успешен! Вы ушли от преследования.');
  };

  // Pirate Ambush Handlers (Contraband Intercept)
  const handleEngagePirateAmbush = () => {
    if (!activePirateAmbush) return;
    setActiveCombatEnemy(activePirateAmbush.enemy);
    setActivePirateAmbush(null);
    setActiveScreen('COMBAT');
  };

  const handleJettisonContrabandFromAmbush = () => {
    // Filter out contraband from player cargo
    setPlayerCargo(prev => {
      const updated: Record<string, number> = {};
      const itemsMap = new Map<string, MarketItem>();
      systems.forEach(s => s.market.forEach(m => itemsMap.set(m.id, m)));

      for (const [id, qty] of Object.entries(prev)) {
        const item = itemsMap.get(id);
        if (!item?.isContraband) {
          updated[id] = qty;
        }
      }
      try {
        localStorage.setItem('astraea_player_cargo_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setActivePirateAmbush(null);
    sounds.playAlert();
    showToast('Контрабанда сброшена в космос! Корсары забрали контейнеры и прекратили преследование.');
  };

  const handleAttemptEvadeFromAmbush = () => {
    if (!activePirateAmbush) return;
    const enginePower = shipStats.powerAllocation.engines;
    const evadeChance = Math.min(85, Math.max(25, Math.round(shipStats.evasion * 2.5 + enginePower * 0.7 - pirateHeat * 0.25)));

    if (Math.random() * 100 < evadeChance) {
      sounds.playWarpJump();
      setActivePirateAmbush(null);
      showToast('Успех! Вы врубили форсаж и оторвались от пиратской эскадры!');
    } else {
      sounds.playExplosion();
      const dmg = 20;
      setShipStats(prev => ({ ...prev, hull: Math.max(10, prev.hull - dmg) }));
      showToast(`Манёвр провален! Пираты пробили обшивку судна на ${dmg} ед. урона!`);
      setActiveCombatEnemy(activePirateAmbush.enemy);
      setActivePirateAmbush(null);
      setActiveScreen('COMBAT');
    }
  };

  // Pirate Arrest Handlers
  const handleAttemptBoardAndArrest = () => {
    if (!activePirateAmbush) return;
    const newPirate = generateArrestedPirate(pirateHeat > 50 ? 'high' : 'medium');
    setArrestedPirates(prev => {
      const updated = [newPirate, ...prev].slice(0, 4);
      try {
        localStorage.setItem('astraea_arrested_pirates_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    sounds.playVictoryFanfare();
    // Reward player with credits and alloys from the raid
    setResources(r => ({
      ...r,
      credits: r.credits + 350,
      alloys: r.alloys + 30
    }));
    showToast(`Абордаж успешен! Главарь «${newPirate.name}» арестован и помещён в судовой карцер! Получено +350 ⬡ и +30 сплавов.`);
    setActivePirateAmbush(null);
  };

  const handleArrestPirateFromCombat = () => {
    const newPirate = generateArrestedPirate('high');
    setArrestedPirates(prev => {
      const updated = [newPirate, ...prev].slice(0, 4);
      try {
        localStorage.setItem('astraea_arrested_pirates_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    sounds.playVictoryFanfare();
    showToast(`Капитан пиратов «${newPirate.name}» взят в плен и переведён в карцер корабля!`);
  };

  const handleInterrogatePirate = (pirateId: string) => {
    setArrestedPirates(prev => {
      const updated = prev.map(p => {
        if (p.id !== pirateId) return p;
        if (p.intelRevealed) return p;
        if (p.intelSecret) {
          setResources(r => ({
            ...r,
            credits: r.credits + (p.intelSecret?.rewardCredits || 0),
            alloys: r.alloys + (p.intelSecret?.rewardAlloys || 0),
            antimatter: r.antimatter + (p.intelSecret?.rewardAntimatter || 0)
          }));
        }
        return { ...p, intelRevealed: true };
      });
      try {
        localStorage.setItem('astraea_arrested_pirates_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    sounds.playScanPing();
  };

  const handleAcceptBribe = (pirateId: string, bribeAmount: number) => {
    setResources(r => ({ ...r, credits: r.credits + bribeAmount }));
    setArrestedPirates(prev => {
      const updated = prev.filter(p => p.id !== pirateId);
      try {
        localStorage.setItem('astraea_arrested_pirates_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setFactions(f => ({
      ...f,
      terran: {
        ...f.terran,
        reputation: Math.max(-100, f.terran.reputation - 5)
      }
    }));
    sounds.playCreditsChime();
    showToast(`Взятка принята (+${bribeAmount} ⬡). Пират тайно катапультирован на спасательной шлюпке.`);
  };

  const handleHandOverPirate = (pirateId: string, bountyAmount: number) => {
    const mult = policeProfile.licenses.bountyHunterBadge ? 1.25 : 1.0;
    const finalBounty = Math.round(bountyAmount * mult);

    setResources(r => ({ ...r, credits: r.credits + finalBounty }));
    setArrestedPirates(prev => {
      const updated = prev.filter(p => p.id !== pirateId);
      try {
        localStorage.setItem('astraea_arrested_pirates_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setPoliceProfile(prof => {
      const newCount = prof.piratesHandedOver + 1;
      const newTotal = prof.totalBountyCredits + finalBounty;
      let rank: PoliceProfile['officerRank'] = prof.officerRank;
      if (newCount >= 15) rank = 'Верховный Маршал ОФЗ';
      else if (newCount >= 9) rank = 'Галактический Детектив';
      else if (newCount >= 5) rank = 'Охотник за Головами ОФЗ';
      else if (newCount >= 2) rank = 'Помощник Патрульного';

      const updated = {
        ...prof,
        piratesHandedOver: newCount,
        bountiesCollected: prof.bountiesCollected + 1,
        totalBountyCredits: newTotal,
        officerRank: rank,
        reputationWithPolice: Math.min(100, prof.reputationWithPolice + 10)
      };
      try {
        localStorage.setItem('astraea_police_profile_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setFactions(f => ({
      ...f,
      terran: {
        ...f.terran,
        reputation: Math.min(100, f.terran.reputation + 4)
      }
    }));

    sounds.playVictoryFanfare();
    showToast(`Преступник передан в пенитенциарий «Тартар»! Выплачена награда +${finalBounty} ⬡.`);
  };

  const handleHandOverAllPirates = (totalBounty: number) => {
    const count = arrestedPirates.length;
    if (count === 0) return;

    setResources(r => ({ ...r, credits: r.credits + totalBounty }));
    setArrestedPirates([]);
    try {
      localStorage.setItem('astraea_arrested_pirates_v1', JSON.stringify([]));
    } catch {}

    setPoliceProfile(prof => {
      const newCount = prof.piratesHandedOver + count;
      const newTotal = prof.totalBountyCredits + totalBounty;
      let rank: PoliceProfile['officerRank'] = prof.officerRank;
      if (newCount >= 15) rank = 'Верховный Маршал ОФЗ';
      else if (newCount >= 9) rank = 'Галактический Детектив';
      else if (newCount >= 5) rank = 'Охотник за Головами ОФЗ';
      else if (newCount >= 2) rank = 'Помощник Патрульного';

      const updated = {
        ...prof,
        piratesHandedOver: newCount,
        bountiesCollected: prof.bountiesCollected + count,
        totalBountyCredits: newTotal,
        officerRank: rank,
        reputationWithPolice: Math.min(100, prof.reputationWithPolice + count * 8)
      };
      try {
        localStorage.setItem('astraea_police_profile_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setFactions(f => ({
      ...f,
      terran: {
        ...f.terran,
        reputation: Math.min(100, f.terran.reputation + count * 3)
      }
    }));

    sounds.playVictoryFanfare();
    showToast(`Все ${count} преступников переданы правосудию! Выплачена награда +${totalBounty} ⬡.`);
  };

  const handleBuyPoliceLicense = (licenseKey: keyof PoliceProfile['licenses'], cost: number) => {
    if (resources.credits < cost) {
      sounds.playAlert();
      showToast('Недостаточно кредитов для оформления лицензии.');
      return;
    }
    setResources(r => ({ ...r, credits: r.credits - cost }));
    setPoliceProfile(prof => {
      const updated = {
        ...prof,
        licenses: {
          ...prof.licenses,
          [licenseKey]: true
        }
      };
      try {
        localStorage.setItem('astraea_police_profile_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    sounds.playCreditsChime();
    showToast('Полицейская лицензия успешно оформлена и внесена в реестр ОФЗ!');
  };

  const handleHuntWantedBoss = (boss: WantedPirateBoss) => {
    setActiveCombatEnemy({
      id: boss.id,
      name: `${boss.name} [${boss.title}]`,
      faction: 'syndicate',
      hull: 180,
      maxHull: 180,
      shields: 90,
      maxShields: 90,
      weaponsPower: 35,
      evasion: 14,
      gridX: 8,
      gridY: 3,
      range: 4,
      movementPoints: 2,
      reward: {
        credits: boss.bounty,
        alloys: 80,
        science: 40,
        antimatter: 10
      }
    });
    setActiveScreen('COMBAT');
    showToast(`Цель взята на прицел: ${boss.name}! Переход в боевой режим!`);
  };

  // Police Customs Handlers
  const handleShowPoliceLicense = () => {
    setActivePoliceCustoms(false);
    sounds.playScanPing();
    showToast('Лицензия предъявлена! Патруль Полиции отдал честь и пожелал удачного полёта.');
  };

  const handleTransferPrisonersToPatrol = () => {
    const totalBounties = arrestedPirates.reduce((sum, p) => sum + p.bounty, 0);
    handleHandOverAllPirates(totalBounties);
    setActivePoliceCustoms(false);
    showToast(`Пираты переданы патрулю прямо на орбите! Получено +${totalBounties} ⬡.`);
  };

  const handleComplyWithScan = () => {
    setActivePoliceCustoms(false);
    if (contrabandCount > 0) {
      sounds.playAlert();
      handleJettisonContraband();
      const fine = Math.min(resources.credits, 200);
      setResources(r => ({ ...r, credits: r.credits - fine }));
      showToast(`Таможенный досмотр: вся контрабанда конфискована! Выписан штраф ${fine} ⬡.`);
    } else {
      sounds.playScanPing();
      showToast('Таможенный досмотр пройден: судно чисто! Полиция желает безопасного полёта.');
    }
  };

  const handleEvadePolice = () => {
    setActivePoliceCustoms(false);
    const enginePower = shipStats.powerAllocation.engines;
    const success = Math.random() * 100 < (shipStats.evasion * 3 + enginePower * 0.5);
    if (success) {
      sounds.playWarpJump();
      showToast('Вы совершили резкий манёвр и скрылись от полицейского патруля!');
    } else {
      sounds.playExplosion();
      const dmg = 15;
      setShipStats(s => ({ ...s, hull: Math.max(10, s.hull - dmg) }));
      const fine = Math.min(resources.credits, 300);
      setResources(r => ({ ...r, credits: r.credits - fine }));
      handleJettisonContraband();
      showToast(`Побег провален! Патруль повредил корпус (-${dmg} HP), изъял контрабанду и взыскал штраф ${fine} ⬡.`);
    }
  };

  // Emergency Jettison Contraband Anywhere (e.g. from TradeStation)
  const handleJettisonContraband = () => {
    setPlayerCargo(prev => {
      const updated: Record<string, number> = {};
      const itemsMap = new Map<string, MarketItem>();
      systems.forEach(s => s.market.forEach(m => itemsMap.set(m.id, m)));

      for (const [id, qty] of Object.entries(prev)) {
        const item = itemsMap.get(id);
        if (!item?.isContraband) {
          updated[id] = qty;
        }
      }
      try {
        localStorage.setItem('astraea_player_cargo_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    sounds.playAlert();
    showToast('Вся запрещённая контрабанда аварийно катапультирована за борт! Уровень угрозы: 0%.');
  };

  // Commodity Buy & Sell
  const handleBuyCommodity = (item: MarketItem, qty: number, totalCost: number) => {
    setResources(prev => ({ ...prev, credits: prev.credits - totalCost }));

    // Persist to ship's cargo hold
    setPlayerCargo(prev => {
      const updated = {
        ...prev,
        [item.id]: (prev[item.id] || 0) + qty
      };
      try {
        localStorage.setItem('astraea_player_cargo_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Update station stock
    setSystems(prev => prev.map(sys => {
      if (sys.id !== currentSystemId) return sys;
      return {
        ...sys,
        market: sys.market.map(m => m.id === item.id ? {
          ...m,
          stock: Math.max(0, m.stock - qty)
        } : m)
      };
    }));

    if (item.isContraband) {
      showToast(`Приобретена контрабанда: ${item.name} (${qty} ед.). Опасность варп-перехватов выросла!`);
    } else {
      showToast(`Куплено ${qty} ед. груза «${item.name}».`);
    }

    addExpeditionLog({
      type: 'trade',
      title: `Закупка: ${item.name} (${qty} ед.)`,
      description: `На торговом терминале системы «${currentSystem.name}» оформлена сделка на сумму ${totalCost} ⬡.${item.isContraband ? ' Внимание: товар внесён в реестр нелегальной контрабанды!' : ''}`,
      systemName: currentSystem.name,
      sectorName: currentSystem.sectorName,
      badge: item.isContraband ? 'Контрабанда' : (totalCost >= 350 ? 'Крупная закупка' : 'Закупка'),
      metrics: {
        credits: -totalCost,
        outcome: 'investment'
      }
    });
  };

  const handleSellCommodity = (item: MarketItem, qty: number, totalEarned: number) => {
    setResources(prev => ({ ...prev, credits: prev.credits + totalEarned }));

    // Persist to ship's cargo hold
    setPlayerCargo(prev => {
      const updated = {
        ...prev,
        [item.id]: Math.max(0, (prev[item.id] || 0) - qty)
      };
      try {
        localStorage.setItem('astraea_player_cargo_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Update station stock
    setSystems(prev => prev.map(sys => {
      if (sys.id !== currentSystemId) return sys;
      return {
        ...sys,
        market: sys.market.map(m => m.id === item.id ? {
          ...m,
          stock: m.stock + qty
        } : m)
      };
    }));

    if (item.isContraband) {
      showToast(`Сделка на чёрном рынке! Продано ${qty} ед. «${item.name}» за +${totalEarned} ⬡!`);
    } else {
      showToast(`Продано ${qty} ед. груза «${item.name}» на сумму +${totalEarned} ⬡.`);
    }

    addExpeditionLog({
      type: 'trade',
      title: `Продажа: ${item.name} (${qty} ед.)`,
      description: `Реализована партия товара на орбитальном рынке станции «${currentSystem.name}». Выручка составила +${totalEarned} ⬡.${item.isContraband ? ' Успешный теневой сбыт контрабанды.' : ''}`,
      systemName: currentSystem.name,
      sectorName: currentSystem.sectorName,
      badge: totalEarned >= 450 ? 'Сверхприбыль' : 'Продажа',
      metrics: {
        credits: totalEarned,
        outcome: 'profit'
      }
    });
  };

  const handleBuyNukes = (count: number, costCredits: number, costAlloys: number) => {
    if (resources.credits < costCredits || resources.alloys < costAlloys) {
      sounds.playAlert();
      showToast('Недостаточно ресурсов для покупки ядерных боеголовок!');
      return;
    }
    setResources(prev => ({
      ...prev,
      credits: prev.credits - costCredits,
      alloys: prev.alloys - costAlloys,
      nukes: (prev.nukes ?? 0) + count
    }));
    sounds.playCreditsChime();
    showToast(`Приобретено боеголовок: +${count} шт. (Всего: ${(resources.nukes ?? 0) + count} шт.)`);

    addExpeditionLog({
      type: 'trade',
      title: `Закупка ядерных боеголовок (+${count} шт.)`,
      description: `Оружейные отсеки корабля пополнены термоядерными торпедами на сумму ${costCredits} ⬡ в системе «${currentSystem.name}».`,
      systemName: currentSystem.name,
      badge: 'Вооружение',
      metrics: {
        credits: -costCredits,
        alloys: -costAlloys,
        nukes: count
      }
    });
  };

  const handleSynthesizeAntimatter = (count: number, costCredits: number, costScience: number) => {
    if (resources.credits < costCredits || resources.science < costScience) {
      sounds.playAlert();
      showToast('Недостаточно ресурсов для квантового синтеза антиматерии!');
      return;
    }
    setResources(prev => ({
      ...prev,
      credits: prev.credits - costCredits,
      science: prev.science - costScience,
      antimatter: prev.antimatter + count
    }));
    sounds.playScanPing();
    showToast(`Синтезировано +${count} ед. стабильной антиматерии!`);

    addExpeditionLog({
      type: 'trade',
      title: `Квантовый синтез антиматерии (+${count} ед.)`,
      description: `В исследовательских реакторах системы «${currentSystem.name}» синтезирован запас антиматерии высокой плотности.`,
      systemName: currentSystem.name,
      badge: 'Синтез энергии',
      metrics: {
        credits: -costCredits,
        science: -costScience,
        antimatter: count
      }
    });
  };

  const handleOpenShipyard = () => {
    setActiveScreen('SHIP_HANGAR');
  };

  // Ship Upgrades & Crew
  const handleInstallUpgrade = (upgrade: ShipUpgrade) => {
    setResources(prev => ({
      ...prev,
      credits: prev.credits - (upgrade.cost.credits || 0),
      alloys: prev.alloys - (upgrade.cost.alloys || 0),
      science: prev.science - (upgrade.cost.science || 0),
      antimatter: prev.antimatter - (upgrade.cost.antimatter || 0)
    }));

    setUpgrades(prev => prev.map(u => u.id === upgrade.id ? { ...u, installed: true } : u));
    setShipStats(prev => upgrade.applyUpgrade(prev));
    showToast(`Модуль "${upgrade.name}" успешно установлен на судно!`);
  };

  const handleHireCrew = (crew: CrewMember) => {
    setHiredCrew(prev => [...prev, crew]);
    showToast(`${crew.roleName} ${crew.name} принят(а) в команду!`);
  };

  const handleFireCrew = (crewId: string) => {
    setHiredCrew(prev => prev.filter(c => c.id !== crewId));
    showToast('Контракт со специалистом расторгнут.');
  };

  // Tech Tree
  const handleUnlockTech = (tech: ResearchTech) => {
    setResources(prev => ({ ...prev, science: prev.science - tech.cost }));
    setTechTree(prev => prev.map(t => t.id === tech.id ? { ...t, unlocked: true } : t));
    showToast(`Технология "${tech.name}" изучена!`);
  };

  // Kings & NPC Actions
  const handleClaimRoyalDecree = (npcId: string) => {
    setNpcs(prev => {
      const updated = prev.map(npc => {
        if (npc.id !== npcId || !npc.royalDecree || npc.royalDecree.claimed) return npc;
        const reward = npc.royalDecree.reward;
        setResources(r => ({
          ...r,
          credits: r.credits + (reward.credits || 0),
          alloys: r.alloys + (reward.alloys || 0),
          science: r.science + (reward.science || 0),
          antimatter: r.antimatter + (reward.antimatter || 0),
          nukes: (r.nukes ?? 0) + (reward.nukes || 0),
          food: r.food + (reward.food || 0)
        }));
        if (reward.xp) {
          handleAddCommanderXp(reward.xp);
        }
        if (reward.repairHullPercent) {
          setShipStats(s => ({ ...s, hull: s.maxHull }));
        }
        return {
          ...npc,
          royalDecree: {
            ...npc.royalDecree,
            claimed: true
          }
        };
      });
      try {
        localStorage.setItem('astraea_npcs_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleClaimQuestReward = (quest: NpcQuest) => {
    setNpcs(prev => {
      const updated = prev.map(npc => {
        const hasQuest = npc.quests.some(q => q.id === quest.id);
        if (!hasQuest) return npc;
        return {
          ...npc,
          quests: npc.quests.map(q => {
            if (q.id !== quest.id) return q;
            return { ...q, claimed: true, completed: true };
          })
        };
      });
      try {
        localStorage.setItem('astraea_npcs_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setResources(r => ({
      ...r,
      credits: r.credits + (quest.reward.credits || 0),
      alloys: r.alloys + (quest.reward.alloys || 0),
      science: r.science + (quest.reward.science || 0),
      antimatter: r.antimatter + (quest.reward.antimatter || 0),
      nukes: (r.nukes ?? 0) + (quest.reward.nukes || 0),
      food: r.food + (quest.reward.food || 0)
    }));

    if (quest.reward.xp) {
      handleAddCommanderXp(quest.reward.xp);
    }

    if (quest.reward.repairHullPercent) {
      setShipStats(s => ({ ...s, hull: s.maxHull }));
    }
  };

  const handleApplyDialogueReward = (
    reward?: DialogueOption['reward'],
    cost?: DialogueOption['cost']
  ) => {
    if (cost) {
      setResources(r => ({
        ...r,
        credits: r.credits - (cost.credits || 0),
        science: r.science - (cost.science || 0),
        alloys: r.alloys - (cost.alloys || 0),
        antimatter: r.antimatter - (cost.antimatter || 0)
      }));
    }

    if (reward) {
      setResources(r => ({
        ...r,
        credits: r.credits + (reward.credits || 0),
        alloys: r.alloys + (reward.alloys || 0),
        science: r.science + (reward.science || 0),
        antimatter: r.antimatter + (reward.antimatter || 0),
        nukes: (r.nukes ?? 0) + (reward.nukes || 0),
        food: r.food + (reward.food || 0)
      }));

      if (reward.xp) {
        handleAddCommanderXp(reward.xp);
      }

      if (reward.repairHullPercent) {
        setShipStats(s => ({ ...s, hull: s.maxHull }));
      }
    }
  };

  const handleInvestInKingdom = (kingdomId: KingdomId, amount: number) => {
    setResources(r => ({ ...r, credits: r.credits - amount }));
    setKingdoms(prev => {
      const updated = prev.map(k => {
        if (k.id !== kingdomId) return k;
        const repGain = Math.round(amount / 50);
        return {
          ...k,
          treasury: k.treasury + amount,
          playerInvestment: k.playerInvestment + amount,
          reputation: Math.min(100, k.reputation + repGain),
          militaryPower: k.militaryPower + Math.round(amount * 0.2)
        };
      });
      try {
        localStorage.setItem('astraea_kingdoms_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    handleAddCommanderXp(Math.round(amount * 0.15));
  };

  const handleUnlockPrivilege = (kingdomId: KingdomId, privilege: RoyalPrivilege) => {
    if (privilege.costCredits) setResources(r => ({ ...r, credits: r.credits - (privilege.costCredits || 0) }));
    if (privilege.costScience) setResources(r => ({ ...r, science: r.science - (privilege.costScience || 0) }));
    if (privilege.costAlloys) setResources(r => ({ ...r, alloys: r.alloys - (privilege.costAlloys || 0) }));
    if (privilege.costAntimatter) setResources(r => ({ ...r, antimatter: r.antimatter - (privilege.costAntimatter || 0) }));

    setKingdoms(prev => {
      const updated = prev.map(k => {
        if (k.id !== kingdomId) return k;
        return {
          ...k,
          privileges: k.privileges.map(p => p.id === privilege.id ? { ...p, unlocked: true } : p)
        };
      });
      try {
        localStorage.setItem('astraea_kingdoms_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    if (privilege.passiveBonus) {
      if (privilege.passiveBonus.extraShields) {
        setShipStats(s => ({
          ...s,
          maxShields: s.maxShields + (privilege.passiveBonus?.extraShields || 0),
          shields: s.shields + (privilege.passiveBonus?.extraShields || 0)
        }));
      }
      if (privilege.passiveBonus.extraHull) {
        setShipStats(s => ({
          ...s,
          maxHull: s.maxHull + (privilege.passiveBonus?.extraHull || 0),
          hull: s.hull + (privilege.passiveBonus?.extraHull || 0)
        }));
      }
      if (privilege.passiveBonus.weaponsPower) {
        setShipStats(s => ({
          ...s,
          weaponsPower: s.weaponsPower + (privilege.passiveBonus?.weaponsPower || 0)
        }));
      }
      if (privilege.passiveBonus.evasion) {
        setShipStats(s => ({
          ...s,
          evasion: s.evasion + (privilege.passiveBonus?.evasion || 0)
        }));
      }
      if (privilege.passiveBonus.cargoBonus) {
        setShipStats(s => ({
          ...s,
          cargoCapacity: s.cargoCapacity + (privilege.passiveBonus?.cargoBonus || 0)
        }));
      }
      if (privilege.passiveBonus.warpBonus) {
        setShipStats(s => ({
          ...s,
          warpRange: s.warpRange + (privilege.passiveBonus?.warpBonus || 0)
        }));
      }
    }
  };

  const handleCompletePetition = (kingdomId: KingdomId, petition: RoyalPetition) => {
    if (petition.cost?.credits) setResources(r => ({ ...r, credits: r.credits - (petition.cost?.credits || 0) }));
    if (petition.cost?.science) setResources(r => ({ ...r, science: r.science - (petition.cost?.science || 0) }));
    if (petition.cost?.alloys) setResources(r => ({ ...r, alloys: r.alloys - (petition.cost?.alloys || 0) }));
    if (petition.cost?.antimatter) setResources(r => ({ ...r, antimatter: r.antimatter - (petition.cost?.antimatter || 0) }));
    if (petition.cost?.food) setResources(r => ({ ...r, food: r.food - (petition.cost?.food || 0) }));

    if (petition.reward) {
      setResources(r => ({
        ...r,
        credits: r.credits + (petition.reward?.credits || 0),
        alloys: r.alloys + (petition.reward?.alloys || 0),
        science: r.science + (petition.reward?.science || 0),
        antimatter: r.antimatter + (petition.reward?.antimatter || 0),
        food: r.food + (petition.reward?.food || 0),
        nukes: (r.nukes ?? 0) + (petition.reward?.nukes || 0)
      }));
      if (petition.reward.xp) {
        handleAddCommanderXp(petition.reward.xp);
      }
    }

    setKingdoms(prev => {
      const updated = prev.map(k => {
        if (k.id !== kingdomId) return k;
        return {
          ...k,
          reputation: Math.min(100, k.reputation + (petition.reward?.reputationGain || 20)),
          petitions: k.petitions.map(p => p.id === petition.id ? { ...p, completed: true } : p)
        };
      });
      try {
        localStorage.setItem('astraea_kingdoms_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSwearAllegiance = (kingdomId: KingdomId, rank: AllegianceRank) => {
    setKingdoms(prev => {
      const updated = prev.map(k => {
        if (k.id !== kingdomId) return k;
        return {
          ...k,
          allegiance: rank,
          reputation: Math.min(100, k.reputation + 15)
        };
      });
      try {
        localStorage.setItem('astraea_kingdoms_v1', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    handleAddCommanderXp(250);
  };

  return (
    <div className="h-screen h-[100dvh] w-full overflow-hidden bg-[#04060C] text-slate-100 flex flex-col font-sans select-none relative">
      {/* Animated Parallax Starfield Canvas reacting to sector navigation and warp transitions */}
      <ParallaxStarfieldCanvas
        currentSector={currentSystem.sector}
        isWarping={isWarping}
        warpVector={warpVector}
      />

      {/* Top Bar with Navigation and Telemetry */}
      <div className="shrink-0 z-50">
        <TopBar
          activeScreen={activeScreen}
          onSelectScreen={setActiveScreen}
          resources={resources}
          shipStats={shipStats}
          stardate={stardate}
          soundEnabled={soundEnabled}
          onToggleSound={() => {
            const newState = sounds.toggleMute();
            setSoundEnabled(newState);
          }}
          onSaveGame={handleSaveGame}
          onOpenFactions={() => setIsFactionsModalOpen(true)}
          commander={commander}
          onOpenCommanderModal={() => setIsCommanderModalOpen(true)}
          pirateHeat={pirateHeat}
          contrabandCount={contrabandCount}
          arrestedPiratesCount={arrestedPirates.length}
          playerName={playerName}
          activeTitle={activeKingdomTitle}
        />
      </div>

      {/* Galactic Herald (Galactic News & Market Impulses Ticker, Board of Honor & Event Log) */}
      <div className="shrink-0 z-40">
        <GalacticHerald
          newsList={galacticNews}
          currentSystem={currentSystem}
          onRefreshNews={handleRefreshNews}
          onNavigateToMarket={() => setActiveScreen('TRADE_STATION')}
          onNavigateToColonies={() => setActiveScreen('COLONY_MANAGER')}
          onNavigateToSystemMap={() => setActiveScreen('SYSTEM_VIEW')}
          playerName={playerName}
          activeTitle={activeKingdomTitle}
          commander={commander}
          shipStats={shipStats}
          resources={resources}
          kingdoms={kingdoms}
          onOpenCommanderModal={() => setIsCommanderModalOpen(true)}
          onOpenKingdomsTitles={() => setActiveScreen('KINGDOMS')}
          actionLogs={expeditionLogs}
          economicHistory={liveEconomicHistory}
        />
      </div>

      {/* Main Screen Views */}
      <main className="flex-1 min-h-0 w-full relative flex flex-col overflow-hidden">
        {activeScreen === 'GALAXY_MAP' && (
          <GalaxyMap
            systems={systems}
            currentSystemId={currentSystemId}
            resources={resources}
            shipStats={shipStats}
            onWarpJump={handleWarpJump}
            onEnterSystem={() => setActiveScreen('SYSTEM_VIEW')}
            pirateHeat={pirateHeat}
            activeNews={galacticNews}
            onOpenTradeStation={() => setActiveScreen('TRADE_STATION')}
            anomalies={anomalies}
            onScanAnomalies={handleScanAnomalies}
            activeMarketEvents={marketEvents}
          />
        )}

        {activeScreen === 'SYSTEM_VIEW' && (
          <SystemView
            system={currentSystem}
            resources={resources}
            shipStats={shipStats}
            onScanBody={handleScanBody}
            onMineBody={handleMineBody}
            onFoundColony={handleFoundColony}
            onDockStation={() => setActiveScreen('TRADE_STATION')}
            onBackToMap={() => setActiveScreen('GALAXY_MAP')}
            onManageColony={() => setActiveScreen('COLONY_MANAGER')}
            onOpenKingsChamber={() => setActiveScreen('KINGS_NPC')}
            onOpenKingdoms={() => setActiveScreen('KINGDOMS')}
            activeAnomaly={anomalies.find(a => a.systemId === currentSystem.id) || null}
          />
        )}

        {activeScreen === 'COLONY_MANAGER' && (
          <ColonyManager
            systems={systems}
            resources={resources}
            onBuildStructure={handleBuildStructure}
            onAdvanceCycle={handleAdvanceCycle}
            stardate={stardate}
          />
        )}

        {activeScreen === 'SHIP_HANGAR' && (
          <ShipHangar
            shipStats={shipStats}
            resources={resources}
            availableUpgrades={upgrades}
            availableCrew={availableCrew}
            hiredCrew={hiredCrew}
            ownedShipIds={ownedShipIds}
            onBuyShip={handleBuyShip}
            onSwitchShip={handleSwitchShip}
            onInstallUpgrade={handleInstallUpgrade}
            onHireCrew={handleHireCrew}
            onFireCrew={handleFireCrew}
            onRepairHull={() => {
              const cost = (shipStats.maxHull - shipStats.hull) * 3;
              setResources(prev => ({ ...prev, credits: prev.credits - cost }));
              setShipStats(prev => ({ ...prev, hull: prev.maxHull }));
              showToast('Корпус корабля полностью восстановлен!');
            }}
            onRefuelShip={() => {
              const cost = (resources.maxFuel - resources.fuel) * 2;
              setResources(prev => ({ ...prev, credits: prev.credits - cost, fuel: prev.maxFuel }));
              showToast('Баки заправлены до максимальной отметки Гелием-3!');
            }}
            onUpdatePowerAllocation={(power) => {
              setShipStats(prev => ({ ...prev, powerAllocation: power }));
            }}
          />
        )}

        {activeScreen === 'TRADE_STATION' && (
          <TradeStation
            currentSystem={currentSystem}
            resources={resources}
            shipStats={shipStats}
            playerCargo={playerCargo}
            pirateHeat={pirateHeat}
            activeNews={galacticNews}
            marketEvents={marketEvents}
            allSystems={systems}
            onBuyCommodity={handleBuyCommodity}
            onSellCommodity={handleSellCommodity}
            onJettisonContraband={handleJettisonContraband}
            onBuyNukes={handleBuyNukes}
            onSynthesizeAntimatter={handleSynthesizeAntimatter}
            onOpenShipyard={handleOpenShipyard}
          />
        )}

        {activeScreen === 'POLICE_PRISON' && (
          <PolicePrisonStation
            arrestedPirates={arrestedPirates}
            policeProfile={policeProfile}
            resources={resources}
            shipStats={shipStats}
            brigCapacity={4}
            onInterrogatePirate={handleInterrogatePirate}
            onAcceptBribe={handleAcceptBribe}
            onHandOverPirate={handleHandOverPirate}
            onHandOverAllPirates={handleHandOverAllPirates}
            onBuyPoliceLicense={handleBuyPoliceLicense}
            onHuntWantedBoss={handleHuntWantedBoss}
          />
        )}

        {activeScreen === 'RESEARCH' && (
          <ResearchTechTree
            techTree={techTree}
            resources={resources}
            onUnlockTech={handleUnlockTech}
          />
        )}

        {activeScreen === 'COMBAT' && (
          <CombatArena
            enemy={activeCombatEnemy || {
              id: 'patrol_corsair',
              name: 'Корсар Синдиката',
              faction: 'syndicate',
              hull: 75,
              maxHull: 75,
              shields: 35,
              maxShields: 35,
              weaponsPower: 16,
              evasion: 12,
              gridX: 8,
              gridY: 3,
              range: 4,
              movementPoints: 3,
              reward: {
                credits: 220,
                alloys: 30,
                science: 20
              }
            }}
            playerShip={shipStats}
            resources={resources}
            commander={commander}
            onAddCommanderXp={handleAddCommanderXp}
            onOpenCommanderModal={() => setIsCommanderModalOpen(true)}
            completedCampaignLevels={completedCampaignLevels}
            onRecordLevelCompletion={handleRecordLevelCompletion}
            onCombatVictory={handleCombatVictory}
            onCombatDefeat={handleCombatDefeat}
            onFleeCombat={handleFleeCombat}
            onDamagePlayerHull={(dmg) => {
              setShipStats(prev => ({ ...prev, hull: Math.max(0, prev.hull - dmg) }));
            }}
            onConsumeNuke={() => {
              setResources(prev => ({
                ...prev,
                nukes: Math.max(0, (prev.nukes ?? 0) - 1)
              }));
            }}
            onArrestPirate={handleArrestPirateFromCombat}
            brigHasSpace={arrestedPirates.length < 4}
          />
        )}

        {activeScreen === 'KINGS_NPC' && (
          <KingsNpcChamber
            currentSystem={currentSystem}
            resources={resources}
            shipStats={shipStats}
            commander={commander}
            npcs={npcs}
            onClaimRoyalDecree={handleClaimRoyalDecree}
            onClaimQuestReward={handleClaimQuestReward}
            onApplyDialogueReward={handleApplyDialogueReward}
            onShowToast={showToast}
            onNavigateToKingdoms={() => setActiveScreen('KINGDOMS')}
            playerName={playerName}
            activeTitle={activeKingdomTitle}
          />
        )}

        {activeScreen === 'KINGDOMS' && (
          <KingdomsView
            kingdoms={kingdoms}
            currentSystem={currentSystem}
            resources={resources}
            shipStats={shipStats}
            commander={commander}
            onInvestInKingdom={handleInvestInKingdom}
            onUnlockPrivilege={handleUnlockPrivilege}
            onCompletePetition={handleCompletePetition}
            onSwearAllegiance={handleSwearAllegiance}
            onJumpToSystem={(sysId) => {
              const target = systems.find(s => s.id === sysId);
              if (target) {
                setCurrentSystemId(target.id);
                setActiveScreen('SYSTEM_VIEW');
                showToast(`Переход к системе ${target.name}!`);
              }
            }}
            onOpenAudienceWithKing={(_monarchNpcId) => {
              setActiveScreen('KINGS_NPC');
              showToast('Вход в Зал Аудиенций с правителями и королями!');
            }}
            onShowToast={showToast}
            playerName={playerName}
            activeTitle={activeKingdomTitle}
            onSelectActiveTitle={handleSelectActiveTitle}
          />
        )}
      </main>

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900/95 border border-cyan-500/50 text-cyan-200 px-4 py-2.5 rounded-lg shadow-xl text-xs font-mono backdrop-blur-md animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Narrative Event Modal */}
      {activeNarrativeEvent && (
        <EventModal
          event={activeNarrativeEvent}
          resources={resources}
          onMakeChoice={handleMakeChoice}
        />
      )}

      {/* Pirate Ambush Modal (Contraband Intercept) */}
      {activePirateAmbush && (
        <PirateAmbushModal
          enemy={activePirateAmbush.enemy}
          playerShip={shipStats}
          pirateHeat={pirateHeat}
          detectedContraband={activePirateAmbush.detectedContraband}
          brigAvailable={arrestedPirates.length < 4}
          onEngageCombat={handleEngagePirateAmbush}
          onAttemptBoardAndArrest={handleAttemptBoardAndArrest}
          onJettisonContraband={handleJettisonContrabandFromAmbush}
          onAttemptEvade={handleAttemptEvadeFromAmbush}
        />
      )}

      {/* Police Customs Patrol Modal */}
      {activePoliceCustoms && (
        <PoliceCustomsModal
          policeProfile={policeProfile}
          contrabandCount={contrabandCount}
          arrestedPirates={arrestedPirates}
          playerShip={shipStats}
          onShowLicense={handleShowPoliceLicense}
          onTransferPrisonersToPatrol={handleTransferPrisonersToPatrol}
          onComplyWithScan={handleComplyWithScan}
          onEvadePolice={handleEvadePolice}
        />
      )}

      {/* Factions Modal */}
      {isFactionsModalOpen && (
        <FactionsModal
          factions={factions}
          resources={resources}
          stardate={stardate}
          onClose={() => setIsFactionsModalOpen(false)}
          onUpdateFactions={handleUpdateFactions}
          onUpdateResources={setResources}
          onShowToast={showToast}
        />
      )}

      {/* Commander Progression Modal */}
      <CommanderModal
        isOpen={isCommanderModalOpen}
        onClose={() => setIsCommanderModalOpen(false)}
        commander={commander}
        onUpgradeSkill={handleUpgradeCommanderSkill}
        onResetSkills={handleResetCommanderSkills}
        playerName={playerName}
        activeTitle={activeKingdomTitle}
        onOpenKingdomsTitles={() => setActiveScreen('KINGDOMS')}
        onUpdatePlayerName={handleUpdatePlayerName}
      />

      {/* Spatial Anomaly Encounter Modal */}
      {activeAnomalyEncounter && (
        <SpatialAnomalyModal
          anomaly={activeAnomalyEncounter}
          onClose={() => setActiveAnomalyEncounter(null)}
          onViewExpeditionLog={() => {
            setActiveAnomalyEncounter(null);
            // Open Herald in Log tab if desired or show toast
            showToast('Запись об аномалии внесена в Журнал событий экспедиции!');
          }}
        />
      )}
    </div>
  );
}
