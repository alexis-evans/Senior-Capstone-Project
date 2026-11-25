import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ReviewerView } from "@/components/homebase/ReviewerView";
import { HomebaseProvider } from "@/lib/homebase-store";

// Each category must offer exactly one clickable star per rating level — the
// control used to nest a full five-star row inside every one of its five buttons.
function renderReviewForm() {
  return render(
    <HomebaseProvider>
      <ReviewerView />
    </HomebaseProvider>,
  );
}

function radios(group: HTMLElement) {
  return within(group).getAllByRole("radio");
}

function checkedLabel(group: HTMLElement) {
  const checked = radios(group).filter((r) => r.getAttribute("aria-checked") === "true");
  expect(checked).toHaveLength(1);
  return checked[0]?.getAttribute("aria-label");
}

describe("Review rating control", () => {
  it("offers exactly five stars for each of the six categories", () => {
    renderReviewForm();
    // The form also has a "How your name appears" radio group; only rating groups count.
    const groups = screen.getAllByRole("radiogroup").filter((g) => (g.getAttribute("aria-label") ?? "").endsWith(" rating"));
    expect(groups).toHaveLength(6);
    for (const g of groups) expect(radios(g)).toHaveLength(5);
  });

  it("sets that category's rating when a star is clicked", () => {
    renderReviewForm();
    const management = screen.getByRole("radiogroup", { name: "management rating" });
    // Sample state starts management at 4; clicking the 3rd star must move it to 3.
    expect(checkedLabel(management)).toBe("4 of 5");

    const third = radios(management).at(2);
    if (!third) throw new Error("expected a third star button");
    fireEvent.click(third);

    expect(checkedLabel(management)).toBe("3 of 5");
    // Other categories are untouched.
    expect(checkedLabel(screen.getByRole("radiogroup", { name: "noise rating" }))).toBe("3 of 5");
  });
});
