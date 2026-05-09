// CoC API → Prisma enum dönüşümleri.
// CoC API lowerCamel ("moreThanOncePerWeek"), bizim enum UPPER_SNAKE.

import { WarFrequency } from "@prisma/client";

export function mapWarFrequency(input: string | null | undefined): WarFrequency {
  switch (input) {
    case "always":
    case "ALWAYS":
      return WarFrequency.ALWAYS;
    case "moreThanOncePerWeek":
    case "MORE_THAN_ONCE_PER_WEEK":
      return WarFrequency.MORE_THAN_ONCE_PER_WEEK;
    case "oncePerWeek":
    case "ONCE_PER_WEEK":
      return WarFrequency.ONCE_PER_WEEK;
    case "lessThanOncePerWeek":
    case "LESS_THAN_ONCE_PER_WEEK":
      return WarFrequency.LESS_THAN_ONCE_PER_WEEK;
    case "never":
    case "NEVER":
      return WarFrequency.NEVER;
    case "any":
    case "ANY":
      return WarFrequency.ANY;
    default:
      return WarFrequency.UNKNOWN;
  }
}

const WAR_FREQ_LABELS_TR: Record<WarFrequency, string> = {
  ALWAYS: "Sürekli",
  MORE_THAN_ONCE_PER_WEEK: "Haftada birden fazla",
  ONCE_PER_WEEK: "Haftada bir",
  LESS_THAN_ONCE_PER_WEEK: "Haftada birden az",
  NEVER: "Asla",
  ANY: "Fark etmez",
  UNKNOWN: "Belirsiz",
};

export function warFrequencyLabel(value: WarFrequency): string {
  return WAR_FREQ_LABELS_TR[value] ?? "Belirsiz";
}
