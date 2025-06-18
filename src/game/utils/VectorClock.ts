/**
 * Implementation of a vector clock for distributed event ordering
 * Used to establish causality between events in a distributed system
 */
export class VectorClock {
  private clock: Map<string, number> = new Map();

  /**
   * Creates a new vector clock
   * @param playerIds Array of player IDs to initialize the clock with
   */
  constructor(playerIds: string[] = []) {
    // Initialize clock values to 0 for all players
    playerIds.forEach(id => {
      this.clock.set(id, 0);
    });
  }

  /**
   * Increments the clock value for a specific player
   * @param playerId ID of the player to increment
   * @returns The updated vector clock
   */
  public increment(playerId: string): VectorClock {
    const currentValue = this.clock.get(playerId) || 0;
    this.clock.set(playerId, currentValue + 1);
    return this;
  }

  /**
   * Compares this vector clock with another to determine causality
   * @param other The other vector clock to compare with
   * @returns -1 if this happens before other, 1 if this happens after other, 0 if concurrent
   */
  public compareTo(other: VectorClock): number {
    let thisBeforeOther = false;
    let otherBeforeThis = false;

    // Get all player IDs from both clocks
    const allPlayerIds = new Set([
      ...Array.from(this.clock.keys()),
      ...Array.from(other.clock.keys())
    ]);

    // Compare each player's clock value
    for (const playerId of allPlayerIds) {
      const thisValue = this.clock.get(playerId) || 0;
      const otherValue = other.clock.get(playerId) || 0;

      if (thisValue < otherValue) {
        thisBeforeOther = true;
      } else if (thisValue > otherValue) {
        otherBeforeThis = true;
      }
    }

    // Determine causality
    if (thisBeforeOther && !otherBeforeThis) {
      return -1; // This happens before other
    } else if (!thisBeforeOther && otherBeforeThis) {
      return 1;  // This happens after other
    } else {
      return 0;  // Concurrent events
    }
  }

  /**
   * Merges this vector clock with another
   * Takes the maximum value for each player
   * @param other The other vector clock to merge with
   * @returns The merged vector clock
   */
  public merge(other: VectorClock): VectorClock {
    // Get all player IDs from both clocks
    const allPlayerIds = new Set([
      ...Array.from(this.clock.keys()),
      ...Array.from(other.clock.keys())
    ]);

    // Take the maximum value for each player
    for (const playerId of allPlayerIds) {
      const thisValue = this.clock.get(playerId) || 0;
      const otherValue = other.clock.get(playerId) || 0;
      this.clock.set(playerId, Math.max(thisValue, otherValue));
    }

    return this;
  }

  /**
   * Converts the vector clock to a JSON object
   * @returns JSON representation of the vector clock
   */
  public toJSON(): Record<string, number> {
    const result: Record<string, number> = {};
    this.clock.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  /**
   * Creates a vector clock from a JSON object
   * @param json JSON representation of a vector clock
   * @returns A new vector clock instance
   */
  public static fromJSON(json: Record<string, number>): VectorClock {
    const clock = new VectorClock();
    Object.entries(json).forEach(([key, value]) => {
      clock.clock.set(key, value);
    });
    return clock;
  }

  /**
   * Creates a copy of this vector clock
   * @returns A new vector clock with the same values
   */
  public clone(): VectorClock {
    return VectorClock.fromJSON(this.toJSON());
  }
}
