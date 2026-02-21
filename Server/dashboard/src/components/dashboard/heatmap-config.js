export const INDIA_CENTER = [20.5937, 78.9629];
export const INDIA_ZOOM = 5;
export const INDIA_MIN_ZOOM = 4;
export const INDIA_MAX_ZOOM = 12;

export const HEAT_GRADIENT = {
    0.1: '#3b82f6', // blue — sparse
    0.4: '#22c55e', // green — moderate
    0.6: '#eab308', // yellow — dense
    0.8: '#f97316', // orange — very dense
    1.0: '#ef4444', // red — hotspot
};

export const HEAT_OPTIONS = {
    radius: 35,
    blur: 25,
    maxZoom: 10,
    gradient: HEAT_GRADIENT,
};

// CartoDB Dark tile — makes heat colors pop, premium look
export const TILE_URL = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
