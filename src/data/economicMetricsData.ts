import { CycleEconomicSnapshot } from '../types/game';

/**
 * Generates an authentic, immersive history of 10 previous cycles + current active cycle (11 total)
 * anchored to the player's current resources, colonies, and stardate.
 */
export function generateDefaultEconomicHistory(
  currentCredits: number = 850,
  currentAlloys: number = 75,
  currentStardate: number = 2184.2,
  liveColonyIncome?: {
    credits?: number;
    alloys?: number;
    science?: number;
    fuel?: number;
    food?: number;
  }
): CycleEconomicSnapshot[] {
  const currentStardateFixed = parseFloat(currentStardate.toFixed(1));

  // Baseline templates for 10 historical cycles prior to current
  const historyTemplates = [
    {
      stardateOffset: -10.0,
      creditsRatio: 0.18,
      alloysRatio: 0.16,
      colonyCredits: 12,
      colonyAlloys: 3,
      colonyScience: 5,
      colonyFood: 10,
      colonyFuel: 4,
      desc: 'Старт экспедиции: первый полевой купол ОФЗ'
    },
    {
      stardateOffset: -9.0,
      creditsRatio: 0.24,
      alloysRatio: 0.22,
      colonyCredits: 18,
      colonyAlloys: 5,
      colonyScience: 8,
      colonyFood: 14,
      colonyFuel: 6,
      desc: 'Ввод в строй первых буровых вышек на спутниках'
    },
    {
      stardateOffset: -8.0,
      creditsRatio: 0.32,
      alloysRatio: 0.28,
      colonyCredits: 26,
      colonyAlloys: 8,
      colonyScience: 12,
      colonyFood: 18,
      colonyFuel: 8,
      desc: 'Запуск орбитального гидропонного сектора'
    },
    {
      stardateOffset: -7.0,
      creditsRatio: 0.40,
      alloysRatio: 0.35,
      colonyCredits: 38,
      colonyAlloys: 11,
      colonyScience: 16,
      colonyFood: 22,
      colonyFuel: 10,
      desc: 'Освоение астероидного пояса и рудный арбитраж'
    },
    {
      stardateOffset: -6.0,
      creditsRatio: 0.48,
      alloysRatio: 0.42,
      colonyCredits: 50,
      colonyAlloys: 14,
      colonyScience: 20,
      colonyFood: 28,
      colonyFuel: 13,
      desc: 'Открытие литосферных шахт на Марсе'
    },
    {
      stardateOffset: -5.0,
      creditsRatio: 0.58,
      alloysRatio: 0.52,
      colonyCredits: 65,
      colonyAlloys: 18,
      colonyScience: 25,
      colonyFood: 34,
      colonyFuel: 16,
      desc: 'Монтаж первого термоядерного генератора'
    },
    {
      stardateOffset: -4.0,
      creditsRatio: 0.68,
      alloysRatio: 0.62,
      colonyCredits: 82,
      colonyAlloys: 22,
      colonyScience: 30,
      colonyFood: 40,
      colonyFuel: 20,
      desc: 'Формирование торговой сети на станциях Цереры'
    },
    {
      stardateOffset: -3.0,
      creditsRatio: 0.78,
      alloysRatio: 0.72,
      colonyCredits: 102,
      colonyAlloys: 26,
      colonyScience: 36,
      colonyFood: 46,
      colonyFuel: 24,
      desc: 'Развёртывание квантовых лабораторий Проксимы'
    },
    {
      stardateOffset: -2.0,
      creditsRatio: 0.88,
      alloysRatio: 0.82,
      colonyCredits: 125,
      colonyAlloys: 30,
      colonyScience: 42,
      colonyFood: 52,
      colonyFuel: 28,
      desc: 'Автоматизация обогатительных фабрик и ретрансляторов'
    },
    {
      stardateOffset: -1.0,
      creditsRatio: 0.94,
      alloysRatio: 0.92,
      colonyCredits: 145,
      colonyAlloys: 34,
      colonyScience: 48,
      colonyFood: 58,
      colonyFuel: 32,
      desc: 'Экспансия колониального флота на дальние рубежи'
    }
  ];

  const snapshots: CycleEconomicSnapshot[] = historyTemplates.map((item, index) => {
    const sDate = parseFloat((currentStardateFixed + item.stardateOffset).toFixed(1));
    return {
      cycle: index + 1,
      stardate: sDate,
      cycleLabel: `Зв. Дата ${sDate.toFixed(1)} (Цикл ${index + 1})`,
      credits: Math.max(120, Math.round(currentCredits * item.creditsRatio)),
      alloys: Math.max(12, Math.round(currentAlloys * item.alloysRatio)),
      creditsDelta: 0,
      alloysDelta: 0,
      colonyProductionCredits: item.colonyCredits,
      colonyProductionAlloys: item.colonyAlloys,
      colonyProductionScience: item.colonyScience,
      colonyProductionFood: item.colonyFood,
      colonyProductionFuel: item.colonyFuel,
      tradeTurnoverCredits: Math.round(item.colonyCredits * 5.5),
      eventDescription: item.desc
    };
  });

  // Add the 11th entry: Current active cycle
  const currentSnapshot: CycleEconomicSnapshot = {
    cycle: 11,
    stardate: currentStardateFixed,
    cycleLabel: `Зв. Дата ${currentStardateFixed.toFixed(1)} (Текущий цикл 11)`,
    credits: currentCredits,
    alloys: currentAlloys,
    creditsDelta: 0,
    alloysDelta: 0,
    colonyProductionCredits: liveColonyIncome?.credits ?? 165,
    colonyProductionAlloys: liveColonyIncome?.alloys ?? 38,
    colonyProductionScience: liveColonyIncome?.science ?? 54,
    colonyProductionFood: liveColonyIncome?.food ?? 65,
    colonyProductionFuel: liveColonyIncome?.fuel ?? 36,
    tradeTurnoverCredits: Math.round((liveColonyIncome?.credits ?? 165) * 6),
    eventDescription: 'Текущий операционный цикл флагмана «Астрея»'
  };

  snapshots.push(currentSnapshot);

  // Calculate realistic delta increments from cycle to cycle
  for (let i = 1; i < snapshots.length; i++) {
    snapshots[i].creditsDelta = snapshots[i].credits - snapshots[i - 1].credits;
    snapshots[i].alloysDelta = snapshots[i].alloys - snapshots[i - 1].alloys;
  }

  return snapshots;
}
