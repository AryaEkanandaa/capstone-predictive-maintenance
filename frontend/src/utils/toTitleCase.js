export default function toTitleCase(str) {
  return str
    ?.toLowerCase()
    .split(" ")
    .map((w) => w[0].toUpperCase() + w.slice(1))
    .join(" ");
}
