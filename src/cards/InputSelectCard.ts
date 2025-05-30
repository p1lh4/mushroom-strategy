// noinspection JSUnusedGlobalSymbols Class is dynamically imported.

import { EntityRegistryEntry } from '../types/homeassistant/data/entity_registry';
import { SelectCardConfig } from '../types/lovelace-mushroom/cards/select-card-config';
import SelectCard from './SelectCard';

/**
 * InputSelect Card Class
 *
 * Used to create a card configuration to control an entity of the input_select domain.
 */
class InputSelectCard extends SelectCard {
  /** Returns the default configuration object for the card. */
  static getDefaultConfig(): SelectCardConfig {
    return {
      type: 'custom:mushroom-select-card',
      icon: undefined,
    };
  }

  /**
   * Class constructor.
   *
   * @param {EntityRegistryEntry} entity The HASS entity to create a card configuration for.
   * @param {SelectCardConfig} [customConfiguration] Custom card configuration.
   */
  constructor(entity: EntityRegistryEntry, customConfiguration?: SelectCardConfig) {
    super(entity);

    this.configuration = { ...this.configuration, ...InputSelectCard.getDefaultConfig(), ...customConfiguration };
  }
}

export default InputSelectCard;
