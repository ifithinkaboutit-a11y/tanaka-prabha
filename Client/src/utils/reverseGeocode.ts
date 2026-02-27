import locationsData from "../data/indianLocations.json";

function deg2rad(deg: number) {
    return deg * (Math.PI / 180);
}

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

export function getClosestLocation(lat: number, lng: number) {
    let closestState = "";
    let closestDistrict = "";
    let closestTehsil = "";
    let closestBlock = "";
    let closestVillage = "";
    let minDistance = Infinity;

    for (const state of locationsData.states) {
        for (const district of state.districts) {
            const dist = getDistanceFromLatLonInKm(lat, lng, district.coordinates.lat, district.coordinates.lng);
            if (dist < minDistance) {
                minDistance = dist;

                // Format values to match the standard snake_case used in the hardcoded lists
                const formatVal = (val: string) => val.toLowerCase().replace(/ /g, "_");

                closestState = formatVal(state.name);
                closestDistrict = formatVal(district.name);

                if (district.tehsils && district.tehsils.length > 0) {
                    closestTehsil = district.tehsils[0].name;
                    if (district.tehsils[0].blocks && district.tehsils[0].blocks.length > 0) {
                        closestBlock = district.tehsils[0].blocks[0].name;
                        if (district.tehsils[0].blocks[0].villages && district.tehsils[0].blocks[0].villages.length > 0) {
                            closestVillage = district.tehsils[0].blocks[0].villages[0];
                        }
                    }
                }
            }
        }
    }

    // If distance is too far (e.g. > 500km), we assume the sample DB doesn't cover it
    if (minDistance > 500) {
        return { state: "", district: "", tehsil: "", block: "", village: "" };
    }

    return {
        state: closestState,
        district: closestDistrict,
        tehsil: closestTehsil,
        block: closestBlock,
        village: closestVillage
    };
}
