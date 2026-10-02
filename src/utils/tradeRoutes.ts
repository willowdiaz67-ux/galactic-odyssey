import { StarSystem, MarketItem, GalacticNewsItem, MarketEvent } from '../types/game';
import { calculateComprehensiveItemPrice } from '../data/marketEventsData';

export interface TradeRoute {
  id: string;
  fromSystem: StarSystem;
  toSystem: StarSystem;
  item: MarketItem;
  buyPrice: number;
  sellPrice: number;
  profitPerUnit: number;
  profitMarginPercent: number;
  distance: number;
  fuelCost: number;
  isContraband: boolean;
  tier: 'legendary' | 'high' | 'normal';
  estimatedFullCargoProfit: number;
  affectingNewsCount: number;
  affectingEventsCount?: number;
}

/**
 * Finds all profitable trade routes between systems in the galaxy,
 * taking into account system economy profiles, active market events, and news modifiers.
 */
export function calculateGalaxyTradeRoutes(
  systems: StarSystem[],
  activeNews: GalacticNewsItem[] = [],
  cargoCapacity: number = 50,
  activeMarketEvents: MarketEvent[] = []
): TradeRoute[] {
  const routes: TradeRoute[] = [];

  for (const fromSys of systems) {
    for (const toSys of systems) {
      if (fromSys.id === toSys.id) continue;

      const dx = toSys.x - fromSys.x;
      const dy = toSys.y - fromSys.y;
      const distance = Math.round(Math.hypot(dx, dy));
      const fuelCost = Math.max(5, Math.round(distance / 10));

      for (const originItem of fromSys.market) {
        // Can only buy if origin market has stock or produces it
        if (originItem.stock <= 0 && !originItem.isContraband) continue;

        // Check if destination system buys this item
        const destItem = toSys.market.find(m => m.id === originItem.id);
        if (!destItem) continue;

        // Calculate dynamic prices with system economy profiles, market events & news
        const originCalc = calculateComprehensiveItemPrice(originItem, fromSys, activeNews, activeMarketEvents);
        const destCalc = calculateComprehensiveItemPrice(destItem, toSys, activeNews, activeMarketEvents);

        const effectiveBuyPrice = originCalc.finalBuyPrice;
        const effectiveSellPrice = destCalc.finalSellPrice;

        const profitPerUnit = effectiveSellPrice - effectiveBuyPrice;
        if (profitPerUnit <= 0) continue;

        const profitMarginPercent = Math.round((profitPerUnit / effectiveBuyPrice) * 100);

        let tier: TradeRoute['tier'] = 'normal';
        if (profitMarginPercent >= 70 || profitPerUnit >= 140) {
          tier = 'legendary';
        } else if (profitMarginPercent >= 35 || profitPerUnit >= 60) {
          tier = 'high';
        }

        const affectingNewsCount = originCalc.affectingNews.length + destCalc.affectingNews.length;
        const affectingEventsCount = originCalc.activeEvents.length + destCalc.activeEvents.length;

        routes.push({
          id: `${fromSys.id}->${toSys.id}_${originItem.id}`,
          fromSystem: fromSys,
          toSystem: toSys,
          item: originItem,
          buyPrice: effectiveBuyPrice,
          sellPrice: effectiveSellPrice,
          profitPerUnit,
          profitMarginPercent,
          distance,
          fuelCost,
          isContraband: !!originItem.isContraband,
          tier,
          estimatedFullCargoProfit: profitPerUnit * cargoCapacity,
          affectingNewsCount,
          affectingEventsCount
        });
      }
    }
  }

  // Sort by profit per unit descending
  return routes.sort((a, b) => b.profitPerUnit - a.profitPerUnit);
}

/**
 * Filter routes for a specific system (either departing from it or arriving to it)
 */
export function getSystemTradeOpportunities(
  systemId: string,
  allRoutes: TradeRoute[]
): {
  exports: TradeRoute[];
  imports: TradeRoute[];
} {
  const exports = allRoutes
    .filter(r => r.fromSystem.id === systemId)
    .sort((a, b) => b.profitPerUnit - a.profitPerUnit);

  const imports = allRoutes
    .filter(r => r.toSystem.id === systemId)
    .sort((a, b) => b.profitPerUnit - a.profitPerUnit);

  return { exports, imports };
}
