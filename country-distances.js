/* country-distances.js
   Country-to-country estimated distance engine.
   Uses capital coordinates from country.js and a configurable road/route
   multiplier. For islands/air-freight lanes the result is an estimated
   transport distance, not a live courier route.
*/
import { COUNTRIES, getCountryByCode } from "./country.js";

const EARTH_RADIUS_KM = 6371;

function toRad(value) {
    return Number(value) * Math.PI / 180;
}

export function haversineKm(lat1, lon1, lat2, lon2) {
    const p1 = toRad(lat1);
    const p2 = toRad(lat2);
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(p1) * Math.cos(p2) *
        Math.sin(dLon / 2) ** 2;

    return 2 * EARTH_RADIUS_KM *
        Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function normalizeCode(value) {
    return String(value || "").trim().toUpperCase();
}

/* Approximate route multipliers.
   You can change these later when you add a real routing provider. */
export const COUNTRY_ROUTE_MULTIPLIERS = {
    road: 1.25,
    mixed: 1.30,
    international: 1.10,
    island: 1.05
};

export function calculateCountryDistance(fromCode, toCode, mode = "international") {
    const from = getCountryByCode(normalizeCode(fromCode));
    const to = getCountryByCode(normalizeCode(toCode));

    if (!from || !to) return 0;
    if (from.iso2 === to.iso2) return 0;

    const straight = haversineKm(
        from.lat, from.lng,
        to.lat, to.lng
    );

    const multiplier =
        Number(COUNTRY_ROUTE_MULTIPLIERS[mode]) ||
        COUNTRY_ROUTE_MULTIPLIERS.international;

    return Math.max(1, Math.round(straight * multiplier));
}

/* Optional precomputed lookup cache. It is generated at runtime from
   the 100+ country coordinate dataset rather than hardcoding 37,000 pairs. */
export function buildCountryDistanceTable() {
    const table = {};

    for (const from of COUNTRIES) {
        table[from.iso2] = {};
        for (const to of COUNTRIES) {
            table[from.iso2][to.iso2] =
                from.iso2 === to.iso2
                    ? 0
                    : calculateCountryDistance(from.iso2, to.iso2);
        }
    }

    return table;
}
