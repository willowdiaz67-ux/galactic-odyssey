export type KingdomId = 
  | 'soul_society' 
  | 'namek_realm' 
  | 'terran_monarchy' 
  | 'sirius_cyber' 
  | 'shadow_syndicate';

export type AllegianceRank = 
  | 'neutral' 
  | 'friend' 
  | 'knight' 
  | 'baron' 
  | 'lord_protector' 
  | 'grand_champion';

export interface RoyalPrivilege {
  id: string;
  title: string;
  description: string;
  effectSummary: string;
  minReputation: number;
  costCredits?: number;
  costAlloys?: number;
  costScience?: number;
  costAntimatter?: number;
  unlocked: boolean;
  passiveBonus?: {
    extraHull?: number;
    extraShields?: number;
    weaponsPower?: number;
    evasion?: number;
    warpBonus?: number;
    cargoBonus?: number;
    cycleCreditsYield?: number;
    cycleAlloysYield?: number;
    cycleScienceYield?: number;
    cycleAntimatterYield?: number;
    cycleFoodYield?: number;
  };
}

export interface RoyalPetition {
  id: string;
  title: string;
  description: string;
  requirementText: string;
  rewardSummary: string;
  cost?: {
    credits?: number;
    alloys?: number;
    science?: number;
    antimatter?: number;
    food?: number;
  };
  reward?: {
    credits?: number;
    alloys?: number;
    science?: number;
    antimatter?: number;
    food?: number;
    nukes?: number;
    xp?: number;
    reputationGain: number;
  };
  completed: boolean;
}

export interface KingdomTitle {
  id: string;
  kingdomId: KingdomId;
  kingdomName: string;
  rank: AllegianceRank;
  title: string;
  description: string;
  minReputation: number;
  badgeEmoji: string;
  color: string;
  bonusSummary: string;
  perk?: {
    extraCredits?: number;
    extraHull?: number;
    extraShields?: number;
    extraWeapons?: number;
    extraScience?: number;
  };
}

export interface Kingdom {
  id: KingdomId;
  name: string;
  shortName: string;
  universe: 'bleach' | 'dragon_ball' | 'galaxy';
  universeName: string;
  monarchName: string;
  monarchTitle: string;
  monarchNpcId: string; // Links to NPC in npcData
  capitalSystemId: string;
  capitalName: string;
  controlledSystemIds: string[];
  bannerEmoji: string;
  bannerSymbol: string;
  color: string;
  accentBg: string;
  borderColor: string;
  governmentType: string;
  ideology: string;
  lore: string;
  anthemQuote: string;
  militaryPower: number; // e.g. 110,000
  treasury: number; // Royal funds
  territorySharePercent: number; // e.g. 24%
  reputation: number; // -100 to +100 with player
  allegiance: AllegianceRank;
  playerInvestment: number; // Total credits invested
  privileges: RoyalPrivilege[];
  petitions: RoyalPetition[];
  titles: KingdomTitle[];
}
