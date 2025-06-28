import DataManager from "../../systems/managers/data.manager.js";

class GeneratorsUIRegistry {
  constructor() {
    this.dataGeneratorRegistry = DataManager.getDataGeneratorRegistry();
    this._registry = new Map();
    this._pointChances = new Map();
  }

  /**
   * Registers a UI element under a specific generator, category, and item ID.
   * @param {string} generator
   * @param {string} category
   * @param {string} itemId
   * @param {Node} element
   */
  register(generator, category, itemId, element) {
    if (!this._registry.has(generator)) {
      this._registry.set(generator, new Map());
    }

    const genMap = this._registry.get(generator);

    if (!genMap.has(category)) {
      genMap.set(category, new Map());
    }

    const categoryMap = genMap.get(category);
    if (categoryMap.has(itemId)) console.warn(`Overwriting element for ${generator} > ${category} > ${itemId}`);
    categoryMap.set(itemId, element);
    console.log(`Generator registry - itemId: ${itemId}`);

    if (itemId.startsWith(this.dataGeneratorRegistry.itemPrefixes.pointChance)) {
      const key = `${generator}:${itemId}`;
      this._pointChances.set(key, element);
      console.log(`Generator registry - key: ${key}`);
    }
  }

  /**
   * Retrieves a specific UI element by generator, category, and item ID.
   * @param {string} generator
   * @param {string} category
   * @param {string} itemId
   */
  get(generator, category, itemId) {
    return this._registry
      .get(generator)
      ?.get(category)
      ?.get(itemId) || null;
  }

  /**
   * Returns all items for a given generator and category.
   * @param {string} generator
   * @param {string} category
   */
  getAllFrom(generator, category) {

    return this._registry
      .get(generator)
      ?.get(category) || new Map();
  }

  /**
   * Filters and returns all items whose key starts with a given prefix.
   * @param {string} generator
   * @param {string} category
   * @param {string} prefix
   */
  getAllByPrefix(generator, category, prefix) {
    const items = this.getAllFrom(generator, category);
    return [...items.entries()]
      .filter(([key]) => key.startsWith(prefix))
      .map(([_, el]) => el);
  }

  /**
   * @param {string} generator 
   * @returns {Node[]}
   */
  getPointChancesFromGenerator(generator) {
    const pointChances = [];
    for (const [key, value] of this._pointChances.entries()) {
      if (key.startsWith(`${generator}:`)) {
        pointChances.push(value);
      }
    }
    return pointChances;
  }

  /**
   * @param {Node} element 
   * @returns {boolean}
   */
  hasElement(element) {
    for (const genMap of this._registry.values()) {
      for (const categoryMap of genMap.values()) {
        for (const el of categoryMap.values()) {
          if (el === element) return true;
        }
      }
    }
    return false;
  }

  /**
   * @param {Node} element 
   * @returns {{ generator: string, category: string, itemId: string } | null}
   */
  findElement(element) {
    for (const [genKey, genMap] of this._registry.entries()) {
      for (const [catKey, categoryMap] of genMap.entries()) {
        for (const [itemKey, el] of categoryMap.entries()) {
          if (el === element) {
            return { generator: genKey, category: catKey, itemId: itemKey };
          }
        }
      }
    }
    return null;
  }

  /**
   * Removes a specific UI element.
   * @param {string} generator
   * @param {string} category
   * @param {string} itemId
   */
  remove(generator, category, itemId) {
    this._registry
      .get(generator)
      ?.get(category)
      ?.delete(itemId);
    if (itemId.startsWith(this.dataGeneratorRegistry.itemPrefixes.pointChance)) {
      const key = `${generator}:${itemId}`;
      this._pointChances.delete(key);
    }
  }

  /**
   * Clears all items from a given category of a generator.
   * @param {string} generator
   * @param {string} category
   */
  clearCategory(generator, category) {
    this._registry
      .get(generator)
      ?.get(category)
      ?.clear();
    if (this.dataGeneratorRegistry.category.statusItems === category) {
      const keysToDelete = [];
      for (const key of this._pointChances.keys()) {
        if (key.startsWith(`${generator}:`)) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => this._pointChances.delete(key));
    }
  }

  /**
   * Checks if a specific item is registered.
   * @param {string} generator
   * @param {string} category
   * @param {string} itemId
   */
  has(generator, category, itemId) {
    return this._registry
      .get(generator)
      ?.get(category)
      ?.has(itemId) || false;
  }
}
export const GenUIReg = new GeneratorsUIRegistry();
