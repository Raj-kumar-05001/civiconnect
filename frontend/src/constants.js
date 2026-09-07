export const STATUSES = ["Submitted", "In Progress", "Resolved", "Verified"];

export const CATEGORY_COLORS = {
  "Road Damage": "#C1502E",
  "Garbage/Waste": "#6B7A3F",
  "Streetlight": "#C9821F",
  "Water Leakage": "#2A6F97",
  "Sanitation": "#2A6F97",
  "Traffic Signal": "#C1502E",
  "Fallen Tree": "#2F7A4F",
  "Other": "#5B6572",
};

export function categoryColor(name) {
  return CATEGORY_COLORS[name] || CATEGORY_COLORS.Other;
}
