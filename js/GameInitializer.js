// GameInitializer.js
export class GameInitializer {
  static initAll() {
    // Phase 1: Core Systems
    Player.init();
    
    // Phase 2: Financial Systems
    FinancesManager.init(Player); // Inject Player dependency
    
    // Phase 3: Dependent Systems
    RealEstateManager.init(FinancesManager);
    RelationshipManager.init(Player, FinancesManager);
    
    // Phase 4: UI Systems
    UIManager.init();
  }
}