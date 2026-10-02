export type NpcCategory = 
  | 'king' 
  | 'emperor' 
  | 'guru' 
  | 'shinigami' 
  | 'trader' 
  | 'scientist' 
  | 'warrior' 
  | 'oracle';

export interface DialogueOption {
  id: string;
  label: string;
  response: string;
  conditionDescription?: string;
  requiredCondition?: {
    credits?: number;
    science?: number;
    antimatter?: number;
    alloys?: number;
    nukes?: number;
    minLevel?: number;
  };
  reward?: {
    credits?: number;
    alloys?: number;
    science?: number;
    antimatter?: number;
    nukes?: number;
    food?: number;
    xp?: number;
    repairHullPercent?: number;
    specialPerkTitle?: string;
    specialPerkDescription?: string;
  };
  cost?: {
    credits?: number;
    science?: number;
    alloys?: number;
    antimatter?: number;
  };
  actionType?: 'blessing' | 'trade' | 'repair' | 'awakening' | 'bounty' | 'decree' | 'quest_accept';
  questId?: string;
  oneTimeOnly?: boolean;
}

export interface NpcQuest {
  id: string;
  title: string;
  description: string;
  giverId: string;
  giverName: string;
  rewardText: string;
  targetValueText: string;
  reward: {
    credits: number;
    alloys?: number;
    science?: number;
    antimatter?: number;
    nukes?: number;
    food?: number;
    xp?: number;
    repairHullPercent?: number;
  };
  requirementType: 
    | 'credits' 
    | 'science' 
    | 'antimatter' 
    | 'nukes' 
    | 'alloys'
    | 'colonists'
    | 'current_system';
  targetValue: number | string;
  completed: boolean;
  claimed: boolean;
}

export interface NpcCharacter {
  id: string;
  name: string;
  title: string;
  universe: 'galaxy' | 'dragon_ball' | 'bleach';
  universeName: string;
  isKing: boolean;
  category: NpcCategory;
  factionId?: string;
  homeSystemId: string;
  locationName: string;
  avatarEmoji: string;
  themeColor: string;
  quote: string;
  backstory: string;
  greeting: string;
  royalDecree?: {
    title: string;
    description: string;
    bonusSummary: string;
    claimed: boolean;
    reward: {
      credits?: number;
      alloys?: number;
      science?: number;
      antimatter?: number;
      nukes?: number;
      xp?: number;
      food?: number;
      repairHullPercent?: number;
    };
  };
  dialogueOptions: DialogueOption[];
  quests: NpcQuest[];
}
