import { PlanetColony, ColonyCycleProductionHistory } from '../types/game';

/**
 * Calculates current cycle production for a colony based on active buildings.
 */
export function getCurrentColonyProduction(colony: PlanetColony): {
  credits: number;
  alloys: number;
  science: number;
  fuel: number;
  food: number;
  totalOutput: number;
} {
  let credits = 0;
  let alloys = 0;
  let science = 0;
  let fuel = 0;
  let food = 0;

  if (colony.buildings) {
    colony.buildings.forEach(b => {
      if (b.production.credits) credits += b.production.credits;
      if (b.production.alloys) alloys += b.production.alloys;
      if (b.production.science) science += b.production.science;
      if (b.production.fuel) fuel += b.production.fuel;
      if (b.production.food) food += b.production.food;
    });
  }

  // Base colony tax from population
  credits += Math.max(5, Math.round(colony.population * 0.05));

  const totalOutput = credits + alloys * 2 + science * 3 + fuel * 2 + food;

  return { credits, alloys, science, fuel, food, totalOutput };
}

/**
 * Returns guaranteed 5-cycle production history for a colony.
 * If actual recorded history is shorter than 5, generates realistic progressive baseline values.
 */
export function getColony5CycleProductionHistory(
  colony: PlanetColony,
  currentStardateCycle: number = 5
): ColonyCycleProductionHistory[] {
  const current = getCurrentColonyProduction(colony);

  // If colony already has 5 or more recorded snapshots, return the latest 5
  if (colony.productionHistory && colony.productionHistory.length >= 5) {
    return colony.productionHistory.slice(-5);
  }

  // If there are some recorded entries (e.g. 1 to 4)
  const existing = colony.productionHistory ? [...colony.productionHistory] : [];
  const needed = 5 - existing.length;

  const progressiveHistory: ColonyCycleProductionHistory[] = [];

  // Deterministic multiplier curve for historical cycles showing progressive colony development
  const growthCurve = [0.45, 0.6, 0.75, 0.9, 1.0];

  for (let i = 0; i < needed; i++) {
    const factor = growthCurve[i];
    const cycleNum = Math.max(1, currentStardateCycle - (5 - i));
    progressiveHistory.push({
      cycle: cycleNum,
      credits: Math.max(1, Math.round(current.credits * factor)),
      alloys: current.alloys > 0 ? Math.max(1, Math.round(current.alloys * factor)) : 0,
      science: current.science > 0 ? Math.max(1, Math.round(current.science * factor)) : 0,
      fuel: current.fuel > 0 ? Math.max(1, Math.round(current.fuel * factor)) : 0,
      food: current.food > 0 ? Math.max(1, Math.round(current.food * factor)) : 0,
      totalOutput: Math.max(2, Math.round(current.totalOutput * factor)),
      population: Math.max(10, Math.round(colony.population * (0.7 + i * 0.06)))
    });
  }

  return [...progressiveHistory, ...existing].slice(-5);
}

/**
 * Calculates percentage trend and direction over the 5-cycle series.
 */
export function calculateTrend(data: number[]): {
  percent: number;
  formatted: string;
  direction: 'up' | 'down' | 'flat';
} {
  if (!data || data.length < 2) {
    return { percent: 0, formatted: '0%', direction: 'flat' };
  }

  const first = data[0];
  const last = data[data.length - 1];

  if (first === 0 && last === 0) {
    return { percent: 0, formatted: '0%', direction: 'flat' };
  }

  if (first === 0) {
    return { percent: 100, formatted: '+100%', direction: 'up' };
  }

  const delta = last - first;
  const percent = Math.round((delta / first) * 100);

  if (percent > 0) {
    return { percent, formatted: `+${percent}%`, direction: 'up' };
  } else if (percent < 0) {
    return { percent, formatted: `${percent}%`, direction: 'down' };
  } else {
    return { percent: 0, formatted: '0%', direction: 'flat' };
  }
}

/**
 * Generates SVG path coordinates for smooth Sparkline rendering.
 */
export function generateSparklineCoordinates(
  values: number[],
  width: number,
  height: number,
  paddingX: number = 6,
  paddingY: number = 6
): {
  points: { x: number; y: number; val: number; cycleLabel: string }[];
  pathD: string;
  areaD: string;
  minVal: number;
  maxVal: number;
} {
  if (values.length === 0) {
    return { points: [], pathD: '', areaD: '', minVal: 0, maxVal: 0 };
  }

  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal || 1; // avoid division by zero

  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingY * 2;

  const points = values.map((val, idx) => {
    const x = paddingX + (idx / Math.max(1, values.length - 1)) * innerWidth;
    // Invert Y coordinate for SVG (0 is top)
    const normalized = (val - minVal) / range;
    const y = height - paddingY - normalized * innerHeight;
    const cycleLabel = idx === values.length - 1 ? 'Тек.' : `T-${values.length - 1 - idx}`;
    return { x, y, val, cycleLabel };
  });

  // Construct SVG path line
  let pathD = `M ${points[0].x.toFixed(1)},${points[0].y.toFixed(1)}`;
  for (let i = 1; i < points.length; i++) {
    // Subtle smooth Bezier smoothing
    const prev = points[i - 1];
    const curr = points[i];
    const cpX = (prev.x + curr.x) / 2;
    pathD += ` C ${cpX.toFixed(1)},${prev.y.toFixed(1)} ${cpX.toFixed(1)},${curr.y.toFixed(1)} ${curr.x.toFixed(1)},${curr.y.toFixed(1)}`;
  }

  // Construct filled area path
  const areaD = `${pathD} L ${points[points.length - 1].x.toFixed(1)},${(height - 2).toFixed(1)} L ${points[0].x.toFixed(1)},${(height - 2).toFixed(1)} Z`;

  return { points, pathD, areaD, minVal, maxVal };
}
