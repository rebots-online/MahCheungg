/**
 * VectorClock
 * 
 * This class implements a vector clock for distributed event ordering and conflict resolution.
 * Vector clocks are used to determine the causal relationship between events in a distributed system.
 */

/**
 * VectorClock class
 */
class VectorClock {
  private clock: Map<string, number> = new Map();
  
  /**
   * Constructor
   * @param players Array of player IDs to initialize the clock with
   */
  constructor(players: string[] = []) {
    // Initialize clock with zero for each player
    players.forEach(player => {
      this.clock.set(player, 0);
    });
  }
  
  /**
   * Add a player to the clock
   * @param playerId The ID of the player to add
   */
  public addPlayer(playerId: string): void {
    if (!this.clock.has(playerId)) {
      this.clock.set(playerId, 0);
    }
  }
  
  /**
   * Remove a player from the clock
   * @param playerId The ID of the player to remove
   */
  public removePlayer(playerId: string): void {
    this.clock.delete(playerId);
  }
  
  /**
   * Increment the clock value for a player
   * @param playerId The ID of the player
   */
  public increment(playerId: string): void {
    const currentValue = this.clock.get(playerId) || 0;
    this.clock.set(playerId, currentValue + 1);
  }
  
  /**
   * Get the clock value for a player
   * @param playerId The ID of the player
   * @returns The clock value for the player, or 0 if the player is not in the clock
   */
  public getValue(playerId: string): number {
    return this.clock.get(playerId) || 0;
  }
  
  /**
   * Get all entries in the clock
   * @returns Array of [playerId, value] pairs
   */
  public getEntries(): [string, number][] {
    return Array.from(this.clock.entries());
  }
  
  /**
   * Get all player IDs in the clock
   * @returns Array of player IDs
   */
  public getPlayers(): string[] {
    return Array.from(this.clock.keys());
  }
  
  /**
   * Merge this clock with another clock
   * @param otherClock The other clock to merge with
   */
  public merge(otherClock: VectorClock): void {
    // Take the maximum value for each player
    otherClock.getEntries().forEach(([playerId, value]) => {
      const currentValue = this.clock.get(playerId) || 0;
      this.clock.set(playerId, Math.max(currentValue, value));
    });
  }
  
  /**
   * Compare this clock with another clock
   * @param otherClock The other clock to compare with
   * @returns 'before' if this clock is causally before the other clock,
   *          'after' if this clock is causally after the other clock,
   *          'concurrent' if the clocks are concurrent (neither before nor after)
   */
  public compare(otherClock: VectorClock): 'before' | 'after' | 'concurrent' {
    let before = false;
    let after = false;
    
    // Get all player IDs from both clocks
    const allPlayers = new Set([...this.getPlayers(), ...otherClock.getPlayers()]);
    
    // Compare each entry
    for (const playerId of allPlayers) {
      const thisValue = this.getValue(playerId);
      const otherValue = otherClock.getValue(playerId);
      
      if (thisValue < otherValue) {
        before = true;
      } else if (thisValue > otherValue) {
        after = true;
      }
    }
    
    if (before && !after) return 'before';
    if (after && !before) return 'after';
    return 'concurrent';
  }
  
  /**
   * Check if this clock is causally before another clock
   * @param otherClock The other clock to compare with
   * @returns True if this clock is causally before the other clock
   */
  public isBefore(otherClock: VectorClock): boolean {
    return this.compare(otherClock) === 'before';
  }
  
  /**
   * Check if this clock is causally after another clock
   * @param otherClock The other clock to compare with
   * @returns True if this clock is causally after the other clock
   */
  public isAfter(otherClock: VectorClock): boolean {
    return this.compare(otherClock) === 'after';
  }
  
  /**
   * Check if this clock is concurrent with another clock
   * @param otherClock The other clock to compare with
   * @returns True if this clock is concurrent with the other clock
   */
  public isConcurrent(otherClock: VectorClock): boolean {
    return this.compare(otherClock) === 'concurrent';
  }
  
  /**
   * Serialize the clock to a string
   * @returns Serialized representation of the clock
   */
  public serialize(): string {
    return JSON.stringify(Array.from(this.clock.entries()));
  }
  
  /**
   * Create a clone of this clock
   * @returns A new VectorClock with the same values
   */
  public clone(): VectorClock {
    const clone = new VectorClock();
    this.getEntries().forEach(([playerId, value]) => {
      clone.clock.set(playerId, value);
    });
    return clone;
  }
  
  /**
   * Create a VectorClock from a serialized string
   * @param serialized Serialized representation of a clock
   * @returns A new VectorClock with the deserialized values
   */
  public static deserialize(serialized: string): VectorClock {
    try {
      const entries = JSON.parse(serialized) as [string, number][];
      const clock = new VectorClock();
      
      entries.forEach(([playerId, value]) => {
        clock.clock.set(playerId, value);
      });
      
      return clock;
    } catch (error) {
      console.error('Failed to deserialize vector clock:', error);
      return new VectorClock();
    }
  }
  
  /**
   * Create a VectorClock from an array of entries
   * @param entries Array of [playerId, value] pairs
   * @returns A new VectorClock with the given values
   */
  public static fromEntries(entries: [string, number][]): VectorClock {
    const clock = new VectorClock();
    
    entries.forEach(([playerId, value]) => {
      clock.clock.set(playerId, value);
    });
    
    return clock;
  }
}

export default VectorClock;
