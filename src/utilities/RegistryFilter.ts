// noinspection JSUnusedGlobalSymbols

import { Registry } from '../Registry';
import { DeviceRegistryEntry } from '../types/homeassistant/data/device_registry';
import { EntityCategory, EntityRegistryEntry } from '../types/homeassistant/data/entity_registry';
import { RegistryEntry, StrategyConfig } from '../types/strategy/strategy-generics';
import { logMessage, lvlWarn } from './debug';

/**
 * A class for filtering and sorting arrays of Home Assistant's registry entries.
 *
 * Supports chaining for building complex filter queries.
 *
 * @template T The specific type of RegistryEntry being filtered.
 */
class RegistryFilter<T extends RegistryEntry, K extends keyof T = keyof T> {
  private readonly entries: T[];
  private filters: (((entry: T) => boolean) | ((entry: T, index: number) => boolean))[] = [];
  private readonly entryIdentifier: ('entity_id' | 'area_id' | 'id') & K;
  private invertNext: boolean = false;

  /**
   * Creates a RegistryFilter.
   *
   * @param {T[]} entries Registry entries to filter.
   */
  constructor(entries: T[]) {
    this.entries = entries;
    this.entryIdentifier = (
      entries.length === 0 || 'entity_id' in entries[0] ? 'entity_id' : 'floor_id' in entries[0] ? 'area_id' : 'id'
    ) as ('entity_id' | 'area_id' | 'id') & K;
  }

  /**
   * Inverts the outcome of the next filter method in the chain.
   *
   * @remarks
   * Double chaining like `.not().not().whereX()` cancels out the inversion for whereX().
   */
  not(): this {
    this.invertNext = !this.invertNext;

    return this;
  }

  /**
   * Resets the internal filter chain, allowing the instance to be reused for new filtering operations on the same set
   * of entries.
   */
  resetFilters(): this {
    this.filters = [];
    this.invertNext = false;

    return this;
  }

  /**
   * Adds a custom filter predicate to the filter chain.
   *
   * @param {(entry: T) => boolean} predicate A function that takes a registry entry and returns true if it should be
   *                                          included.
   */
  where(predicate: (entry: T) => boolean): this {
    this.filters.push(this.checkInversion(predicate));

    return this;
  }

  /**
   * Filters entries **strictly** by their `area_id`.
   *
   * - Entries with a matching `area_id` are kept.
   * - If `expandToDevice` is `true`, the device's `area_id` is evaluated if the entry's area_id doesn't match.
   * - If `areaId` is `undefined` (or omitted), entries without an `area_id` property are kept.
   *
   * @param {string | undefined} areaId - The area id to match.
   * @param {boolean} [expandToDevice=true] - Whether to use the device's `area_id` if the entry's doesn't match.
   *
   * @remarks
   * For area id `undisclosed`, the `area_id` of the entry's device may be `undisclosed` or `undefined`.
   */
  whereAreaId(areaId?: string, expandToDevice: boolean = true): this {
    const predicate = (entry: T) => {
      let deviceAreaId: string | null | undefined = undefined;
      const entryObject = entry as EntityRegistryEntry;

      // Retrieve the device area ID only if expandToDevice is true
      if (expandToDevice && entryObject.device_id) {
        deviceAreaId = Registry.devices.find((device) => device.id === entryObject.device_id)?.area_id;
      }

      // Logic for 'undisclosed' areaId
      if (areaId === 'undisclosed') {
        return entry.area_id === areaId && (deviceAreaId === areaId || deviceAreaId === undefined);
      }

      // Logic for undefined areaId
      if (areaId === undefined) {
        return entry.area_id === undefined && (!expandToDevice || deviceAreaId === undefined);
      }

      // Logic for any other areaId
      return entry.area_id === areaId || (expandToDevice && deviceAreaId === areaId);
    };

    this.filters.push(this.checkInversion(predicate));
    return this;
  }

  /**
   * Filters entries by whether their name contains a specific subString.
   *
   * It checks different name properties based on the entry type (name, original_name, name_by_user).
   *
   * @param {string} subString The subString to search for in the entry's name.
   */
  whereNameContains(subString: string): this {
    const lowered = subString.toLowerCase();
    const predicate = (entry: T) => {
      const entryObj = entry as { name?: string; original_name?: string; name_by_user?: string };

      return [entryObj.name, entryObj.original_name, entryObj.name_by_user]
        .filter((field): field is string => typeof field === 'string')
        .some((field) => field.toLowerCase().includes(lowered));
    };

    this.filters.push(this.checkInversion(predicate));

    return this;
  }

  /**
   * Filters entities by their domain (e.g., "light", "sensor").
   *
   * @param {string} domain The domain to filter by.
   *                        Entries whose entity_id starts with the domain are kept.
   */
  whereDomain(domain: string): this {
    const prefix = domain + '.';
    const predicate = (entry: T) => 'entity_id' in entry && entry.entity_id.startsWith(prefix);

    this.filters.push(this.checkInversion(predicate));

    return this;
  }

  /**
   * Filters entries by their floor id.
   *
   * - Entries with a **strictly** matching `floor_id` are kept.
   * - If `floorId` is undefined (or omitted), entries without a `floor_id` property are kept.
   *
   * @param {string | null | undefined} [floorId] The floor id to strictly match.
   */
  whereFloorId(floorId?: string | null): this {
    const predicate = (entry: T) => {
      const hasFloorId = 'floor_id' in entry;

      return floorId === undefined ? !hasFloorId : hasFloorId && entry.floor_id === floorId;
    };

    this.filters.push(this.checkInversion(predicate));

    return this;
  }

  /**
   * Filters entries by their device id.
   *
   * - Entries with a **strictly** matching `id` or `device_id` are kept.
   * - If `deviceId` is undefined, only entries without both `id` and `device_id` are kept.
   *
   * @param {string | null | undefined} [deviceId] The device id to strictly match.
   */
  whereDeviceId(deviceId?: string | null): this {
    const predicate = (entry: T) => {
      const hasId = 'id' in entry;
      const hasDeviceId = 'device_id' in entry;

      if (deviceId === undefined) {
        return !hasId && !hasDeviceId;
      }

      return (hasId && entry.id === deviceId) || (hasDeviceId && entry.device_id === deviceId);
    };

    this.filters.push(this.checkInversion(predicate));
    return this;
  }

  /**
   * Filters entities by their id.
   *
   * - Entities with a matching `entity_id` are kept.
   * - If `entityId` is undefined, only entries without an `entity_id` property are kept.
   *
   * @param {string | null | undefined} [entityId] The entity id to match.
   */
  whereEntityId(entityId?: string | null): this {
    const predicate = (entry: T) =>
      entityId === undefined ? !('entity_id' in entry) : 'entity_id' in entry && entry.entity_id === entityId;

    this.filters.push(this.checkInversion(predicate));
    return this;
  }

  /**
   * Filters entries **strictly** by their `disabled_by` status.
   *
   * @param {EntityRegistryEntry['disabled_by'] | DeviceRegistryEntry['disabled_by'] | undefined} [disabledBy]
   *   The reason the entry was disabled (e.g., "user", "integration", etc.).
   *   Entries with a matching `disabled_by` value are kept.
   *   If `disabledBy` is undefined, only entries without a `disabled_by` property are kept.
   */
  whereDisabledBy(disabledBy?: EntityRegistryEntry['disabled_by'] | DeviceRegistryEntry['disabled_by']): this {
    const predicate = (entry: T) => {
      const hasDisabledBy = 'disabled_by' in entry;

      return disabledBy === undefined ? !hasDisabledBy : hasDisabledBy && entry.disabled_by === disabledBy;
    };

    this.filters.push(this.checkInversion(predicate));

    return this;
  }

  /**
   * Filters entities by their `hidden_by` status.
   *
   * @param {EntityRegistryEntry['hidden_by'] | undefined} [hiddenBy]
   *   The reason the entity was hidden (e.g., "user", "integration", etc.).
   *   Entries with a matching `hidden_by` value are included.
   *   If undefined, only entries without a `hidden_by` property are included.
   */
  whereHiddenBy(hiddenBy?: EntityRegistryEntry['hidden_by']): this {
    const predicate = (entry: T) => {
      const hasHiddenBy = 'hidden_by' in entry;

      return hiddenBy === undefined ? !hasHiddenBy : hasHiddenBy && entry.hidden_by === hiddenBy;
    };

    this.filters.push(this.checkInversion(predicate));

    return this;
  }

  /**
   * Filters out entries that are hidden.
   *
   * Optionally, it can also filter out entries that are marked as hidden in the strategy options.
   *
   * @param {boolean} [applyStrategyOptions = true] If true, entries marked as hidden in the strategy options are also
   *                                                filtered out.
   */
  isNotHidden(applyStrategyOptions: boolean = true): this {
    const predicate = (entry: T) => {
      const isHiddenByProperty = 'hidden_by' in entry && entry.hidden_by;

      if (!applyStrategyOptions) {
        return !isHiddenByProperty;
      }

      const id = entry[this.entryIdentifier] as keyof StrategyConfig['card_options'];
      const options =
        this.entryIdentifier === 'area_id'
          ? { ...Registry.strategyOptions.areas['_'], ...Registry.strategyOptions.areas[id] }
          : Registry.strategyOptions.card_options?.[id];

      const isHiddenByConfig = options?.hidden === true;

      return !isHiddenByProperty && !isHiddenByConfig;
    };

    this.filters.push(this.checkInversion(predicate));
    return this;
  }

  /**
   * Filters entries **strictly** by their `entity_category`.
   *
   * - Without `.not()`: returns only entries where `entity_category` exactly matches the given argument (e.g.,
   *   'config', 'diagnostic', null, or undefined).
   * - With `.not()`: returns all entries where `entity_category` does NOT match the given argument.
   *
   * @param {EntityCategory | null} entityCategory The desired entity_category (e.g., 'config', 'diagnostic', null, or
   *   undefined)
   *
   * @remarks
   * Visibility via the strategy options:
   * - If `hide_{category}_entities: true` is set, entries of that category are NEVER kept, regardless of the filter.
   * - If `hide_{category}_entities: false` is set, entries of that category are ALWAYS kept when filtering for that
   *   category, even when preceded by `.not()`.
   * - If neither is set:
   *   - If preceded by not(), entries of that category are implicitly filtered out.
   *   - Otherwise they are implicitly kept.
   *
   * @example
   *  .whereEntityCategory('config')           // Only 'config' entries (unless explicitly hidden)
   *  .not().whereEntityCategory('diagnostic') // All except 'diagnostic' entries
   *  .whereEntityCategory(null)               // Only entries with 'entity_category: null'
   *  .whereEntityCategory()                   // Only entries without an 'entity_category' field
   */
  whereEntityCategory(entityCategory?: EntityCategory | null): this {
    const invert = this.invertNext;
    this.invertNext = false;

    const predicate = (entry: T) => {
      const category = 'entity_category' in entry ? entry.entity_category : undefined;
      const hideOption =
        typeof category === 'string'
          ? Registry.strategyOptions?.domains?.['_']?.[`hide_${category}_entities`]
          : undefined;

      if (hideOption === true) {
        return false;
      }

      if (hideOption === false && category === entityCategory) {
        return true;
      }

      return invert ? category !== entityCategory : category === entityCategory;
    };
    this.filters.push(predicate);
    return this;
  }

  /**
   * Sort the entries based in priority order of the provided keys.
   *
   * @template K A key to sort by, which must be a key of the registry entry types.
   * @template T The specific type of RegistryEntry being sorted.
   *
   * @param {K[]} keys The keys to sort on, in order of priority.
   * @param {'asc' | 'desc'} [direction='asc'] The sorting direction ('asc' for ascending, 'desc' for descending).
   *
   * @returns {RegistryFilter<T>} A new RegistryFilter instance with the sorted entries and the current filters.
   */
  orderBy<K extends keyof T>(keys: K[], direction: 'asc' | 'desc' = 'asc'): RegistryFilter<T> {
    const getValue = (entry: T, keys: K[]): unknown => {
      for (const k of keys) {
        const value = entry[k];

        if (value !== null && value !== undefined) {
          return value;
        }
      }

      return undefined;
    };

    const sortedEntries = [...this.entries].sort((a, b) => {
      const valueA = getValue(a, keys);
      const valueB = getValue(b, keys);

      if (valueA === valueB) {
        return 0;
      }

      const ascendingMultiplier = direction === 'asc' ? 1 : -1;

      if (valueA === undefined || valueA === null) {
        return ascendingMultiplier;
      }

      if (valueB === undefined || valueB === null) {
        return -ascendingMultiplier;
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return valueA.localeCompare(valueB) * ascendingMultiplier;
      }

      return (valueA < valueB ? -1 : 1) * ascendingMultiplier;
    });

    const newFilter = new RegistryFilter(sortedEntries);

    newFilter.filters = [...this.filters];

    return newFilter;
  }

  /**
   * Takes a specified number of entries from the beginning of the filtered results.
   *
   * @param {number} count The number of entries to take. If negative, defaults to 0.
   */
  take(count: number): this {
    const safeCount = Math.max(0, count);

    this.filters.push((_, index: number) => index < safeCount);

    return this;
  }

  /**
   * Skips a specified number of entries from the beginning of the filtered results.
   *
   * @param {number} count The number of entries to skip. If negative, defaults to 0.
   */
  skip(count: number): this {
    const safeCount = Math.max(0, count);

    this.filters.push((_, index: number) => index >= safeCount);

    return this;
  }

  /**
   * Applies all the accumulated filters to the entries and returns the resulting array.
   *
   * @remarks
   * - This method creates a forked (shallow-copied) RegistryFilter instance to ensure immutability.
   * - The original `entries` and `filters` arrays are not mutated or affected by this operation.
   * - This allows chainable and reusable filter logic, so you can call additional filtering methods on the original
   *   instance after calling this method.
   */
  toList(): T[] {
    const fork = new RegistryFilter(this.entries);

    fork.filters = [...this.filters];

    return fork.entries.filter((entry, index) => fork.filters.every((filter) => filter(entry, index)));
  }

  /**
   * Retrieves an array of values for a specified property from the filtered entries.
   *
   * @param {keyof T} propertyName - The name of the property whose values are to be retrieved.
   * @returns {Array<T[keyof T]>} An array of values corresponding to the specified property.
   *                               If the property does not exist in any entry, those entries will be filtered out.
   */
  getValuesByProperty(propertyName: keyof T): Array<T[keyof T]> {
    const entries = this.toList(); // Call toList to get the full entries
    return entries.map((entry) => entry[propertyName]).filter((value) => value !== undefined) as Array<T[keyof T]>;
  }

  /**
   * Applies all the accumulated filters to the entries and returns the first remaining entry.
   *
   * @remarks
   * - This method creates a forked (shallow-copied) RegistryFilter instance to ensure immutability.
   * - The original `entries` and `filters` arrays are not mutated or affected by this operation.
   * - This allows chainable and reusable filter logic, so you can call additional filtering methods on the original
   *   instance after calling this method.
   */
  first(): T | undefined {
    const fork = new RegistryFilter(this.entries);

    fork.filters = [...this.filters];

    return fork.entries.find((entry, index) => fork.filters.every((filter) => filter(entry, index)));
  }

  /**
   * Applies the filters on a forked instance and returns the single matching entry.
   *
   * @remarks
   * - This method creates a forked (shallow-copied) RegistryFilter instance to ensure immutability.
   * - The original `entries` and `filters` arrays are not mutated or affected by this operation.
   */
  single(): T | undefined {
    const fork = new RegistryFilter(this.entries);

    fork.filters = [...this.filters];

    const result = fork.entries.filter((entry, index) => fork.filters.every((filter) => filter(entry, index)));

    if (result.length === 1) {
      return result[0];
    }

    logMessage(lvlWarn, `Expected a single element, but found ${result.length}.`);

    return undefined;
  }

  /**
   * Applies the filters on a forked instance and returns the number of matching entries.
   * The original RegistryFilter instance remains unchanged and can be reused for further filtering.
   *
   * @remarks
   * - This method creates a forked (shallow-copied) RegistryFilter instance to ensure immutability.
   * - The original `entries` and `filters` arrays are not mutated or affected by this operation.
   */
  count(): number {
    const fork = new RegistryFilter(this.entries);

    fork.filters = [...this.filters];

    return fork.entries.filter((entry, index) => fork.filters.every((filter) => filter(entry, index))).length;
  }

  /**
   * Checks the inversion flag set by {@link not} to a filter predicate and applies the inversion if necessary.
   *
   * @param {((entry: T) => boolean)} predicate The filter predicate to apply the inversion to.
   *
   * @returns {((entry: T) => boolean)} The predicate with the inversion applied, or the original predicate if no
   *                                    inversion is to be applied.
   *
   * @private
   */
  private checkInversion(predicate: (entry: T) => boolean): (entry: T) => boolean {
    if (this.invertNext) {
      this.invertNext = false;

      return (entry: T) => !predicate(entry);
    }

    return predicate;
  }
}

export default RegistryFilter;
