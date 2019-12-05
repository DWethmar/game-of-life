export function to1D(gridSize: number, x: number, y: number) {
    return x * gridSize + y;
}

export function to2D(gridSize: number, i: number): [number, number] {
    return [
        i % gridSize,              // x
        Math.floor(i / gridSize)   // y
    ];
}

export function getIntParam(name: string, defaultValue: number, maxValue: number) {
    const param = getParam(name);
    if (param != null) {
        const value = parseInt(param);
        if(value !== NaN && value <= maxValue) {
            return value;
        }
    }
    return defaultValue;
}

export function getBooleanParam(name: string, defaultValue: boolean) {
    const param = getParam(name);
    if (param != null) {
        return param === "1" || param.toLowerCase() === "true";
    }
    return defaultValue;
}

export function getParam(name: string): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has(name) && urlParams.get(name) !== null) {
        return urlParams.get(name) as string;
    }
    return null;
}
