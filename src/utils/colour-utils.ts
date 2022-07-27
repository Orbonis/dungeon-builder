export interface RGBColour {
    r: number;
    b: number;
    g: number;
}

export const Hex2RGB = (colour: number): RGBColour | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(colour.toString(16));
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
  }