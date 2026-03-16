const CATEGORY_LABELS = {
  music: "Music",
  sports: "Sports",
  dance: "Dance",
  food: "Food",
  other: "Lifestyle",
};

const BRAND_COLORS = {
  phoenix: "linear-gradient(135deg, #fb923c, #ef4444)",
  nexus: "linear-gradient(135deg, #14b8a6, #0f766e)",
  bhartiya: "linear-gradient(135deg, #8b5cf6, #4f46e5)",
  rcube: "linear-gradient(135deg, #38bdf8, #2563eb)",
  default: "linear-gradient(135deg, #f59e0b, #d97706)",
};

export function formatRupee(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(value);
}

export function formatEventDate(value) {
  if (!value) return "Date to be announced";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getCategoryLabel(category) {
  return CATEGORY_LABELS[category] || "Lifestyle";
}

export function getEventBranding(event) {
  const venue = event.mallName || event.location || "Event Venue";
  const words = venue.split(/\s+/).filter(Boolean);
  const initials = words.slice(0, 2).map((word) => word[0]).join("").toUpperCase() || "EV";
  const brandKey = (event.mallSlug || "").toLowerCase();

  return {
    venue,
    initials,
    gradient: BRAND_COLORS[brandKey] || BRAND_COLORS.default,
  };
}
