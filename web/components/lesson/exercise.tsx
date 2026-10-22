import type { ComponentType } from "react";
import { VendingExercise, type VendingExerciseProps } from "@/exercises/feral-vending/vending-exercise";

/** Exercises a lesson can place with an `exercise` code block, by ID. */
const exercises: Record<string, ComponentType<{ config: Record<string, unknown> }>> = {
  "feral-vending": ({ config }) => <VendingExercise config={config as VendingExerciseProps["config"]} />,
};

export function Exercise({ id, config }: { id: string; config: Record<string, unknown> }) {
  const Component = exercises[id];
  if (!Component) throw new Error(`No exercise with the ID "${id}"`);
  return <Component config={config} />;
}
