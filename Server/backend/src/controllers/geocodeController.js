import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pre-load the locations data lazily once required
let locationsData = null;

const loadLocationsData = () => {
    if (locationsData) return locationsData;

    try {
        // Try to load comprehensive locations structure
        const dataPath = path.join(__dirname, '../data/locations.json');
        if (fs.existsSync(dataPath)) {
            const rawData = fs.readFileSync(dataPath, 'utf-8');
            locationsData = JSON.parse(rawData);
            return locationsData;
        }
    } catch (error) {
        console.error("Error loading locations data:", error);
    }

    // Fallback dictionary for basic mapping if JSON is missing
    return { states: [] };
};

/**
 * Helper function to find the closest Indian location matching the geocoded regions
 * Falls back string matching since storing millions of GPS coordinates is heavy
 */
const findClosestHierarchy = (googleAddressComponents) => {
    const data = loadLocationsData();
    const result = {
        state: "",
        district: "",
        tehsil: "",
        block: "",
        village: "",
        pinCode: ""
    };

    // Extract basic components from Google
    // Google Maps structure:
    // administrative_area_level_1 -> State
    // administrative_area_level_3 -> District
    // sublocality / locality -> Tehsil / Block / Village
    // postal_code -> Pin code

    googleAddressComponents.forEach(component => {
        const types = component.types;

        if (types.includes('administrative_area_level_1')) {
            result.state = component.long_name;
        } else if (types.includes('administrative_area_level_3')) {
            result.district = component.long_name;
        } else if (types.includes('locality')) {
            result.village = component.long_name;
        } else if (types.includes('sublocality')) {
            // Google often mixes tehsils/blocks into sublocality
            result.tehsil = component.long_name;
        } else if (types.includes('postal_code')) {
            result.pinCode = component.long_name;
        }
    });

    // TODO: Map string matches to the ones in `data.states` for perfect dropdown synchronization
    // E.g., if Google says "Uttar Pradesh" but locations.json says "UP", we'd translate here.
    return result;
};

/**
 * Reverse geocode latitude and longitude using Google Maps API
 * POST/GET /api/geocode/reverse
 */
export const reverseGeocode = async (req, res) => {
    try {
        const { lat, lng } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({
                status: 'error',
                message: 'Latitude and longitude are required'
            });
        }

        const apiKey = process.env.GOOGLE_MAPS_API_KEY;

        if (!apiKey) {
            console.warn("GOOGLE_MAPS_API_KEY missing. Falling back to simple mock based on coordinates.");
            return res.status(200).json({
                status: 'success',
                data: {
                    state: "Uttar Pradesh",
                    district: "Lucknow",
                    tehsil: "Lucknow",
                    block: "Lucknow",
                    village: "Sample Village",
                    pinCode: "226001",
                    raw: "Mock address due to missing API Key"
                }
            });
        }

        // Call Google Maps API securely from the backend
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
        const response = await axios.get(geocodeUrl);

        if (response.data.status !== "OK" || response.data.results.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Location not found'
            });
        }

        const primeResult = response.data.results[0];

        // Transform the Google format into our App's hierarchical format
        const hierarchicalData = findClosestHierarchy(primeResult.address_components);

        // Supply full formatted address
        hierarchicalData.raw = primeResult.formatted_address;

        res.status(200).json({
            status: 'success',
            data: hierarchicalData
        });

    } catch (error) {
        console.error('Reverse Geocode Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to reverse geocode location'
        });
    }
};
