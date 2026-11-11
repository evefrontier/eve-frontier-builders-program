import type { ComponentType } from "react";
import { Habits } from "./habits";
import { InAction } from "./in-action";
import { KeepItSafe } from "./keep-it-safe";
import { Notes } from "./notes";
import { Ready } from "./ready";
import { Sources } from "./sources";
import { TheLoop } from "./the-loop";
import { TryIt } from "./try-it";
import { WhoFor } from "./who-for";
import { YouDirect } from "./you-direct";
import { YourAi } from "./your-ai";

/** The body of each screen, by its slug in the course content. */
export const screenBodies: Record<string, ComponentType> = {
  "you-direct": YouDirect,
  "the-loop": TheLoop,
  notes: Notes,
  "who-for": WhoFor,
  "your-ai": YourAi,
  sources: Sources,
  "try-it": TryIt,
  "in-action": InAction,
  habits: Habits,
  "keep-it-safe": KeepItSafe,
  ready: Ready,
};
