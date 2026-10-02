import { FactionWar } from '../types/game';

export const INITIAL_FACTION_WARS: FactionWar[] = [
  {
    id: 'war_terran_syndicate',
    name: 'Война за Рубеж Орионов',
    codename: 'Операция «Стальной Заслон»',
    description: 'Масштабное столкновение броненосных эскадр Объединённой Федерации Земли и каперских армад Синдиката Свободных Звёзд. ОФЗ пытается ликвидировать пиратские доки в туманности Веила, в то время как Синдикат пускает в ход рейдовые эсминцы и диверсионные мины.',
    attackerFaction: 'terran',
    defenderFaction: 'syndicate',
    frontSector: 'beta',
    warGoal: 'Полный разгром пиратских цитаделей и демилитаризация Сектора Бета.',
    frontlineControl: 54, // 54% in favor of Terran
    intensity: 'all_out_war',
    targetSystemIds: ['veil_nebula', 'tortuga', 'kepler'],
    active: true,
    startDate: 2183.8,
    warBounty: {
      credits: 1200,
      alloys: 110,
      science: 40,
      nukes: 2
    }
  },
  {
    id: 'war_precursors_miners',
    name: 'Битва за Наследие Зодчих',
    codename: 'Протокол «Очищение Руин»',
    description: 'Горнодобывающий Профсоюз начал промышленную добычу редких изотопов прямо в священных некрополях Древних Архитекторов в секторе Гамма. Боевые автоматоны и тахионные крейсеры Конкорда Предтеч начали массированное наступление на шахтёрские орбитальные платформы.',
    attackerFaction: 'precursors',
    defenderFaction: 'miners',
    frontSector: 'gamma',
    warGoal: 'Защита древних артефактов и изгнание тяжёлых буровых платформ из сектора.',
    frontlineControl: 46, // 46% (slight Miners advantage)
    intensity: 'all_out_war',
    targetSystemIds: ['cygnus_void', 'pulsar_bastion', 'architect_core'],
    active: true,
    startDate: 2184.0,
    warBounty: {
      credits: 1500,
      alloys: 140,
      science: 85,
      nukes: 2
    }
  }
];

export function getWarStatusBadge(intensity: FactionWar['intensity']): {
  label: string;
  badgeClass: string;
} {
  switch (intensity) {
    case 'all_out_war':
      return {
        label: 'Тотальная Война',
        badgeClass: 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse'
      };
    case 'siege':
      return {
        label: 'Планетарная Осада',
        badgeClass: 'bg-amber-950 text-amber-300 border-amber-600'
      };
    case 'skirmish':
      return {
        label: 'Пограничный Конфликт',
        badgeClass: 'bg-orange-950 text-orange-300 border-orange-600'
      };
  }
}
