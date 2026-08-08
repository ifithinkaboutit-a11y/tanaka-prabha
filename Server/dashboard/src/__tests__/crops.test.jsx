/**
 * Tests for the crop parsing / filtering helpers behind the beneficiaries table.
 *
 * The land_details crop columns are plain TEXT holding several crops joined
 * with ", ", and the two write paths disagree on format: onboarding stores
 * display labels ("Wheat") while the admin form stores option slugs ("wheat").
 * The old filter compared the raw column to a single slug with `===`, so it
 * matched almost nothing.
 */

import {
    canonicalCrop,
    collectCropOptions,
    cropLabel,
    farmerCropsBySeason,
    matchesCropFilter,
    parseCropList,
    CROP_SEASONS,
} from "@/lib/crops";

const farmer = (rabi, kharif, zaid) => ({
    land_details: { rabi_crop: rabi, kharif_crop: kharif, zaid_crop: zaid },
});

describe("parseCropList", () => {
    it("splits the comma-joined value the app writes", () => {
        expect(parseCropList("Wheat, Mustard, Gram")).toEqual(["wheat", "mustard", "gram"]);
    });

    it("returns a single crop unchanged", () => {
        expect(parseCropList("wheat")).toEqual(["wheat"]);
    });

    it("treats empty / null / undefined as no crops", () => {
        expect(parseCropList("")).toEqual([]);
        expect(parseCropList(null)).toEqual([]);
        expect(parseCropList(undefined)).toEqual([]);
    });

    it("ignores blank segments from trailing or doubled commas", () => {
        expect(parseCropList("Wheat,,Mustard, ")).toEqual(["wheat", "mustard"]);
    });

    it("does NOT split on the slash inside a real crop name", () => {
        // "Tur/Arhar (Pigeon Pea)" is one crop, not two
        expect(parseCropList("Tur/Arhar (Pigeon Pea)")).toEqual(["tur_arhar"]);
    });

    it("canonicalises labels and slugs to the same value", () => {
        expect(parseCropList("Wheat")).toEqual(parseCropList("wheat"));
        expect(parseCropList("Bajra (Pearl Millet)")).toEqual(["bajra"]);
        expect(parseCropList("moong_dal")).toEqual(["moong_dal"]);
        expect(parseCropList("Moong Dal")).toEqual(["moong_dal"]);
    });

    it("de-duplicates crops that differ only in spelling", () => {
        expect(parseCropList("Wheat, wheat, WHEAT")).toEqual(["wheat"]);
    });

    it("keeps unknown free-text crops rather than dropping them", () => {
        expect(parseCropList("Dragonfruit")).toEqual(["Dragonfruit"]);
    });

    it("accepts an array as well as a string", () => {
        expect(parseCropList(["Wheat", "Gram"])).toEqual(["wheat", "gram"]);
    });
});

describe("canonicalCrop / cropLabel", () => {
    it("round-trips a slug to its display label", () => {
        expect(cropLabel(canonicalCrop("Tur/Arhar (Pigeon Pea)"))).toBe("Tur/Arhar (Pigeon Pea)");
    });

    it("shows unknown crops verbatim", () => {
        expect(cropLabel(canonicalCrop("Dragonfruit"))).toBe("Dragonfruit");
    });
});

describe("farmerCropsBySeason", () => {
    it("keeps each season separate", () => {
        const result = farmerCropsBySeason(farmer("Wheat, Gram", "Rice", null));
        expect(result.rabi).toEqual(["wheat", "gram"]);
        expect(result.kharif).toEqual(["rice"]);
        expect(result.zaid).toEqual([]);
    });

    it("handles a farmer with no land details", () => {
        const result = farmerCropsBySeason({});
        for (const season of CROP_SEASONS) {
            expect(result[season.key]).toEqual([]);
        }
    });
});

describe("matchesCropFilter", () => {
    const wheatAndRice = farmer("Wheat, Mustard", "Rice", null);

    it("matches everything when nothing is selected", () => {
        expect(matchesCropFilter(wheatAndRice, [], [])).toBe(true);
        expect(matchesCropFilter(farmer(null, null, null), [], [])).toBe(true);
    });

    it("matches a crop stored alongside others in the same column", () => {
        // This is the case the old `rabi_crop === "mustard"` check missed
        expect(matchesCropFilter(wheatAndRice, ["mustard"], [])).toBe(true);
    });

    it("ORs multiple selected crops", () => {
        expect(matchesCropFilter(wheatAndRice, ["gram", "rice"], [])).toBe(true);
        expect(matchesCropFilter(wheatAndRice, ["gram", "barley"], [])).toBe(false);
    });

    it("filters by season alone", () => {
        expect(matchesCropFilter(wheatAndRice, [], ["zaid"])).toBe(false);
        expect(matchesCropFilter(wheatAndRice, [], ["kharif"])).toBe(true);
    });

    it("ANDs crop and season — the crop must be grown in that season", () => {
        // Wheat is grown, and kharif is grown, but wheat is not a kharif crop here
        expect(matchesCropFilter(wheatAndRice, ["wheat"], ["kharif"])).toBe(false);
        expect(matchesCropFilter(wheatAndRice, ["wheat"], ["rabi"])).toBe(true);
        expect(matchesCropFilter(wheatAndRice, ["wheat"], ["rabi", "kharif"])).toBe(true);
    });

    it("matches regardless of whether the row stored a label or a slug", () => {
        expect(matchesCropFilter(farmer("Wheat", null, null), ["wheat"], [])).toBe(true);
        expect(matchesCropFilter(farmer("wheat", null, null), ["wheat"], [])).toBe(true);
    });

    it("excludes a farmer with no crops at all", () => {
        expect(matchesCropFilter(farmer(null, null, null), ["wheat"], [])).toBe(false);
    });
});

describe("collectCropOptions", () => {
    it("includes crops present in the data", () => {
        const options = collectCropOptions([farmer("Wheat", "Rice", null)]);
        expect(options.some((o) => o.value === "wheat")).toBe(true);
        expect(options.some((o) => o.value === "rice")).toBe(true);
    });

    it("includes the master list so filters exist before data loads", () => {
        const options = collectCropOptions([]);
        expect(options.length).toBeGreaterThan(0);
        expect(options.some((o) => o.value === "sugarcane")).toBe(true);
    });

    it("surfaces unknown free-text crops as their own option", () => {
        const options = collectCropOptions([farmer("Dragonfruit", null, null)]);
        expect(options.some((o) => o.value === "Dragonfruit")).toBe(true);
    });

    it("does not duplicate a crop that is both in the data and the master list", () => {
        const options = collectCropOptions([farmer("Wheat", "wheat", "Wheat")]);
        expect(options.filter((o) => o.value === "wheat")).toHaveLength(1);
    });

    it("is sorted by label", () => {
        const labels = collectCropOptions([]).map((o) => o.label);
        expect(labels).toEqual([...labels].sort((a, b) => a.localeCompare(b)));
    });
});
