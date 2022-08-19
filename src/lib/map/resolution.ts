/** Resolutions the map may display. */
export enum Resolution {
  STATE = "state",
  DISTRICT = "district",
  ADMINISTRATION = "administration",
  MUNICIPAL = "municipal"
}

export namespace Resolution {
  /**
   * Transforms a {@link Resolution} into the key length.
   * @param res Resolution to find key length
   */
  export function toKeyLength(res: Resolution): number {
    switch (res) {
      case Resolution.STATE: return 2;
      case Resolution.DISTRICT: return 5;
      case Resolution.ADMINISTRATION: return 9;
      case Resolution.MUNICIPAL: return 12
    }
  }

  /**
   * Get the Resolution from a key length.
   * @param length Key length
   * @returns Resolution if found, otherwise `undefined`
   */
  export function toEnum(length: number): Resolution | undefined {
    switch (length) {
      case 2: return Resolution.STATE;
      case 5: return Resolution.DISTRICT;
      case 9: return Resolution.ADMINISTRATION;
      case 12: return Resolution.MUNICIPAL;
      default: return undefined;
    }
  }
}
