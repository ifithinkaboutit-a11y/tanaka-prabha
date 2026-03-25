// Client/src/__tests__/beneficiaries.test.ts
// Tests for filterFarmers pure function
// Validates: Requirements 18.3, 18.7

import { filterFarmers } from "../utils/filterFarmers";
import type { ApiUserProfile } from "../services/apiService";

function makeFarmer(overrides: Partial<ApiUserProfile>): ApiUserProfile {
    return {
        id: "1",
        name: "Test Farmer",
        mobile_number: "9000000000",
        ...overrides,
    };
}

const farmers: ApiUserProfile[] = [
    makeFarmer({ id: "1", name: "Ramesh Kumar", mobile_number: "9876543210" }),
    makeFarmer({ id: "2", name: "Suresh Yadav", mobile_number: "9123456789" }),
    makeFarmer({ id: "3", name: "Priya Singh", mobile_number: "8000000001" }),
    makeFarmer({ id: "4", name: "Anita Devi", mobile_number: "7000000002" }),
];

describe("filterFarmers", () => {
    test("filtering by name returns only matching farmers", () => {
        const result = filterFarmers(farmers, "Ramesh");
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("Ramesh Kumar");
    });

    test("filtering by mobile number returns only matching farmers", () => {
        const result = filterFarmers(farmers, "9123456789");
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe("Suresh Yadav");
    });

    test("an empty query returns all farmers", () => {
        expect(filterFarmers(farmers, "")).toHaveLength(farmers.length);
    });

    test("a whitespace-only query returns all farmers", () => {
        expect(filterFarmers(farmers, "   ")).toHaveLength(farmers.length);
    });

    test("a query that matches no farmers returns an empty array", () => {
        const result = filterFarmers(farmers, "zzznomatch");
        expect(result).toHaveLength(0);
    });

    test("filtering is case-insensitive for names", () => {
        const lower = filterFarmers(farmers, "ramesh kumar");
        const upper = filterFarmers(farmers, "RAMESH KUMAR");
        const mixed = filterFarmers(farmers, "rAmEsH");
        expect(lower).toHaveLength(1);
        expect(upper).toHaveLength(1);
        expect(mixed).toHaveLength(1);
    });
});
