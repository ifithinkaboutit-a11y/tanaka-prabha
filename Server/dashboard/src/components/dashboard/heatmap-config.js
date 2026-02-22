export const INDIA_CENTER = [20.5937, 78.9629];
export const INDIA_ZOOM = 5;
export const INDIA_MIN_ZOOM = 4;
export const INDIA_MAX_ZOOM = 12;

export const HEAT_GRADIENT = {
    0.1: '#16a34a', // green-600
    0.3: '#65a30d', // lime-600
    0.5: '#ca8a04', // yellow-600
    0.7: '#ea580c', // orange-600
    1.0: '#dc2626', // red-600
};

export const HEAT_OPTIONS = {
    radius: 30,
    blur: 20,
    maxZoom: 10,
    minOpacity: 0.4,
    gradient: HEAT_GRADIENT,
};

// CartoDB Dark tile — makes heat colors pop, premium look
export const TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
