import { describe, expect, it } from "vitest";
import { placeSelectPopup } from "../lib/ui/select-placement";

describe("select popup placement", () => {
  it("places a fitting popup below its trigger", () => {
    expect(placeSelectPopup({
      anchor: { top: 100, bottom: 144, left: 100, width: 240 },
      viewport: { width: 1_000, height: 800 },
      contentHeight: 180
    })).toEqual({
      side: "below",
      top: 152,
      left: 100,
      width: 240,
      maxHeight: 288
    });
  });

  it("flips above when the content does not fit below and more room exists above", () => {
    expect(placeSelectPopup({
      anchor: { top: 650, bottom: 694, left: 100, width: 240 },
      viewport: { width: 1_000, height: 800 },
      contentHeight: 280
    })).toEqual({
      side: "above",
      top: 362,
      left: 100,
      width: 240,
      maxHeight: 288
    });
  });

  it("clamps the popup within both horizontal viewport edges", () => {
    expect(placeSelectPopup({
      anchor: { top: 100, bottom: 144, left: 330, width: 160 },
      viewport: { width: 390, height: 800 },
      contentHeight: 180
    })).toMatchObject({ left: 222, width: 160 });

    expect(placeSelectPopup({
      anchor: { top: 100, bottom: 144, left: -20, width: 500 },
      viewport: { width: 390, height: 800 },
      contentHeight: 180
    })).toMatchObject({ left: 8, width: 374 });
  });

  it("constrains height to the available side of a short viewport", () => {
    expect(placeSelectPopup({
      anchor: { top: 120, bottom: 164, left: 20, width: 240 },
      viewport: { width: 390, height: 260 },
      contentHeight: 400
    })).toMatchObject({ side: "above", top: 8, maxHeight: 104 });
  });

  it("respects a visual viewport offset when clamping position", () => {
    expect(placeSelectPopup({
      anchor: { top: 390, bottom: 434, left: 340, width: 180 },
      viewport: { top: 100, left: 50, width: 320, height: 400 },
      contentHeight: 220
    })).toEqual({
      side: "above",
      top: 162,
      left: 182,
      width: 180,
      maxHeight: 274
    });
  });
});
