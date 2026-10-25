"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Icon } from "@/components/ui/icon";
import { Plate } from "@/components/ui/plate";
import { cn } from "@/lib/cn";
import { socketTypeMeta, type SocketType } from "./connections.mjs";
import { validateU64 } from "./u64.mjs";
import styles from "./nodes.module.css";

export const itemCatalog = [
  { id: "STORAGE_UNIT", name: "Storage Unit", category: "Structure Fixture", description: "Target entity container for item exchange" },
  { id: "FERAL_DATA", name: "Feral Data", category: "Raw Intel", description: "Unsanitized encrypted sensor data capsule" },
  { id: "EU_40", name: "EU-40 Fuel", category: "Volatile Fuel", description: "Standard refined 40-unit propulsion isotope" },
  { id: "D1_FUEL", name: "D1 Fuel", category: "Propellant", description: "Deuterium grade-1 sub-light propulsion propellant" },
  { id: "D2_FUEL", name: "D2 Fuel", category: "Propellant", description: "Enriched deuterium grade-2 high-impulse fuel" },
  { id: "STRANGERS_HEAD", name: "Strangers Head", category: "Salvage Artifact", description: "Preserved cybernetic cranial module of unknown origin" },
] as const;

const IDENTIFIER = /^[A-Za-z_][A-Za-z0-9_]*$/;

/* 24px targets, as the Field's clear button */
const ICON_BUTTON = cn(
  "grid size-6 flex-none cursor-pointer place-items-center text-muted",
  "hover:text-foreground focus-visible:outline-2 focus-visible:outline-foreground",
  "forced-colors:text-[ButtonText] forced-colors:focus-visible:outline-[Highlight]",
);

const PILL = cn(
  "inline-flex min-h-6 cursor-pointer items-center gap-0.5 border border-line bg-background px-1.5",
  "font-heading text-step--3 font-bold tracking-[0.04em] uppercase",
  "hover:border-accent focus-visible:outline-2 focus-visible:outline-foreground",
  "aria-pressed:border-accent aria-pressed:bg-accent aria-pressed:text-text-on-accent",
  "forced-colors:aria-pressed:border-[Highlight] forced-colors:aria-pressed:bg-[Highlight] forced-colors:aria-pressed:text-[HighlightText]",
);

function ItemSearchDialog({
  open,
  onOpenChange,
  currentValue,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentValue: string;
  onSelect: (itemId: string) => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const customId = query.trim().toUpperCase().replace(/\s+/g, "_");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return itemCatalog;
    return itemCatalog.filter(
      item =>
        item.id.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q),
    );
  }, [query]);

  const choose = (itemId: string) => {
    onSelect(itemId);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className={cn("fixed inset-0 z-(--layer-scrim) bg-[rgb(0_0_0/0.6)] backdrop-blur-xs", styles.backdrop)} />
        <Dialog.Popup
          className={cn(
            "fixed top-1/2 left-1/2 z-(--layer-menu) flex max-h-[calc(100vh-64px)] w-[calc(100vw-32px)] max-w-120 -translate-1/2 flex-col outline-none",
            styles.popup,
          )}
          initialFocus={inputRef}
        >
          <Plate className={cn("flex w-full flex-col px-5 pt-4 pb-3.5", styles.dialogSurface)}>
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <Dialog.Title className="font-heading text-step--1 font-bold tracking-[0.04em] uppercase">
                  Select item type
                </Dialog.Title>
                <Dialog.Description className="mt-0.5 text-step--2 text-muted">
                  Search and pick a known Move item or entity type identifier.
                </Dialog.Description>
              </div>
              <Dialog.Close
                className={cn(ICON_BUTTON, "border border-line hover:border-foreground")}
                aria-label="Close dialog"
              >
                <Icon name="cross" className="size-2.5" />
              </Dialog.Close>
            </div>

            <input
              ref={inputRef}
              /* 16px: iOS zooms the page when a focused input is smaller */
              className={cn(
                "mb-2.5 w-full border border-socket-item bg-background px-3 py-2 font-heading text-base text-foreground outline-none",
                "placeholder:text-muted focus-visible:outline-2 focus-visible:outline-foreground",
              )}
              type="search"
              placeholder="Search by ID, name, or category (e.g. EU_40, Feral, Fuel)..."
              value={query}
              onChange={event => setQuery(event.target.value)}
              aria-label="Search item types"
            />

            {filtered.length === 0 ? (
              <div
                className="flex flex-col items-center gap-2.5 border border-line bg-card px-4 py-5 text-center text-step--2 text-muted"
                role="status"
              >
                No items match &ldquo;{query}&rdquo;.
                <button
                  type="button"
                  className={cn(
                    "min-h-6 cursor-pointer border border-socket-item bg-background px-2.5 font-heading text-step--2 font-bold text-socket-item",
                    "hover:bg-[color-mix(in_oklab,var(--color-socket-item)_12%,var(--color-background))]",
                    "focus-visible:outline-2 focus-visible:outline-foreground",
                  )}
                  onClick={() => {
                    if (customId) choose(customId);
                  }}
                >
                  Use custom identifier &ldquo;{customId}&rdquo;
                </button>
              </div>
            ) : (
              <div
                className="flex max-h-65 flex-col gap-1 overflow-y-auto border border-line bg-card p-1"
                role="listbox"
                aria-label="Available item types"
              >
                {filtered.map(item => (
                  <button
                    key={item.id}
                    type="button"
                    role="option"
                    aria-selected={item.id === currentValue.toUpperCase()}
                    className={cn(
                      "flex cursor-pointer flex-col gap-0.5 border border-transparent px-2.5 py-2 text-left text-foreground",
                      "hover:border-socket-item hover:bg-[color-mix(in_oklab,var(--color-socket-item)_12%,var(--color-background))]",
                      "aria-selected:border-socket-item aria-selected:bg-[color-mix(in_oklab,var(--color-socket-item)_18%,var(--color-background))]",
                      "focus-visible:outline-2 focus-visible:outline-foreground",
                    )}
                    onClick={() => choose(item.id)}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-heading text-step--2 font-bold tracking-[0.04em] text-socket-item">
                        <span aria-hidden="true">◆</span> {item.id}
                      </span>
                      <span className="text-step--2 font-semibold">{item.name}</span>
                    </span>
                    <span className="flex items-center gap-2 text-step--3 text-muted">
                      <span className="font-semibold tracking-[0.04em] uppercase">{item.category}</span>
                      <span className="truncate">{item.description}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}

            <p className="mt-2.5 text-step--3 text-muted">
              Press <kbd className="border border-line bg-background px-1 font-heading">Esc</kbd> or click ✕ to cancel
            </p>
          </Plate>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const operationRoles = [
  "Start Request",
  "Require Item",
  "Transfer Item",
  "Assert Condition",
  "Complete Request",
] as const;
export type OperationRole = (typeof operationRoles)[number];

export type OperationHandleId = "exec-in" | "exec-out" | "item" | "quantity" | "condition";

const primitiveSpec: Record<OperationRole, {
  symbol: string;
  summary: string;
  accent: SocketType;
  defaultItem?: string;
  hasExecIn: boolean;
  hasExecOut: boolean;
  valueInput?: { id: "quantity" | "condition"; type: SocketType; label: string };
}> = {
  "Start Request": {
    symbol: "entity::start_request",
    summary: "Open a linear Request on the target entity.",
    accent: "execution",
    hasExecIn: false,
    hasExecOut: true,
  },
  "Require Item": {
    symbol: "inventory::require_item",
    summary: "Enforce exact item deposit into the active Request.",
    accent: "item",
    defaultItem: "FERAL_DATA",
    hasExecIn: true,
    hasExecOut: true,
    valueInput: { id: "quantity", type: "u64", label: "Quantity in" },
  },
  "Transfer Item": {
    symbol: "inventory::transfer_item",
    summary: "Withdraw and route item quantity in the active Request.",
    accent: "item",
    defaultItem: "EU_40",
    hasExecIn: true,
    hasExecOut: true,
    valueInput: { id: "quantity", type: "u64", label: "Quantity in" },
  },
  "Assert Condition": {
    symbol: "assert!",
    summary: "Abort the Request unless the boolean predicate holds.",
    accent: "boolean",
    hasExecIn: true,
    hasExecOut: true,
    valueInput: { id: "condition", type: "boolean", label: "Condition in" },
  },
  "Complete Request": {
    symbol: "request::complete_request",
    summary: "Consume the linear Request after all requirements pass.",
    accent: "execution",
    hasExecIn: true,
    hasExecOut: false,
  },
};

/** Classes for a port, on the standalone marker or a React Flow handle. */
export function socketPortClassName({
  direction,
  type = "u64",
  connected = false,
}: {
  direction: "in" | "out";
  type?: SocketType;
  connected?: boolean;
}) {
  return cn(
    "border-2 border-(--node-socket-color) forced-colors:border-[CanvasText]",
    connected ? "bg-(--node-socket-fill) forced-colors:bg-[Highlight]" : "bg-background forced-colors:bg-[Canvas]",
    styles.port,
    styles[direction],
    styles[type],
  );
}

export type SocketProps = {
  direction: "in" | "out";
  type?: SocketType;
  label?: string;
  binding?: string;
  connected?: boolean;
  handle?: ReactNode;
};

export function Socket({
  direction,
  type = "u64",
  label,
  binding,
  connected = false,
  handle,
}: SocketProps) {
  return (
    <div
      className={cn(
        "relative -mx-5 flex items-center justify-between gap-2 border-t border-line px-5 pt-2 pb-0.5 text-step--2",
        direction === "out" && "flex-row-reverse",
        styles.socket,
        styles[type],
      )}
    >
      {handle ?? <span aria-hidden="true" className={socketPortClassName({ direction, type, connected })} />}
      <span className={cn("inline-flex min-w-0 items-center gap-1.5", direction === "out" && "flex-row-reverse")}>
        <TypeBadge type={type} />
        {label && <span className="font-semibold text-foreground">{label}</span>}
      </span>
      {binding && (
        <span className="font-heading text-step--2 font-bold whitespace-nowrap text-(--node-socket-color) forced-colors:text-[CanvasText]">
          {binding}
        </span>
      )}
    </div>
  );
}

/* Reads its colour from the enclosing socket or type class */
function TypeBadge({ type }: { type: SocketType }) {
  const meta = socketTypeMeta[type];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 border px-1.5 font-heading text-step--3 leading-tight font-bold tracking-[0.04em] whitespace-nowrap uppercase",
        "border-(--node-socket-color) bg-card text-(--node-socket-color)",
        "forced-colors:border-[CanvasText] forced-colors:bg-[Canvas] forced-colors:text-[CanvasText]",
      )}
    >
      <span aria-hidden="true">{meta.glyph}</span> {meta.badge}
    </span>
  );
}

function NodeShell({
  title,
  category,
  accentType = "execution",
  selected,
  highlighted,
  invalid,
  eyebrow,
  children,
}: {
  title: string;
  category?: string;
  accentType?: SocketType;
  selected?: boolean;
  highlighted?: boolean;
  invalid?: boolean;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative w-76 text-step--1 text-foreground",
        styles.node,
        selected && styles.selected,
        highlighted && !selected && styles.highlighted,
        invalid && styles.invalid,
      )}
      data-accent={accentType}
    >
      <Plate className={styles.ring} aria-hidden="true">
        <Plate className={styles.surface} />
      </Plate>
      <div className={cn("bg-card", styles.fill)} aria-hidden="true" />
      <div className="relative z-[1] grid gap-2 px-5 pt-4 pb-5 *:min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-heading text-step--2 tracking-[0.05em] text-muted uppercase forced-colors:text-[CanvasText]">
              {eyebrow ?? category}
            </div>
            <h3 className={cn("truncate font-heading text-step--1 font-bold", eyebrow && "sr-only")}>{title}</h3>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

const editableTypes: SocketType[] = ["u64", "boolean", "item"];

function validateConstantValue(type: SocketType, value: string): string | null {
  if (type === "u64") return validateU64(value).error;
  if (type === "boolean") {
    const trimmed = value.trim().toLowerCase();
    return trimmed === "true" || trimmed === "false" ? null : "Boolean must be 'true' or 'false'";
  }
  if (type === "item") {
    const trimmed = value.trim();
    if (!trimmed) return "Item identifier cannot be empty";
    return IDENTIFIER.test(trimmed) ? null : "Must be a valid identifier (alphanumeric and underscore)";
  }
  return null;
}

function EditIcon() {
  return (
    <svg
      className="size-3"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11.5 2.5a1.414 1.414 0 0 1 2 2L5 13H2.5v-2.5L11.5 2.5z" />
    </svg>
  );
}

/* Closing an inline editor unmounts the focused input, so focus goes back to
  the button that opened it unless it has already moved somewhere else */
function useReturnFocus(editing: boolean, target: RefObject<HTMLButtonElement | null>) {
  const pending = useRef(false);
  useEffect(() => {
    if (editing || !pending.current) return;
    pending.current = false;
    target.current?.focus();
  }, [editing, target]);
  return useCallback(() => {
    pending.current = true;
  }, []);
}

function focusLeavesRow(event: FocusEvent<HTMLElement>) {
  const next = event.relatedTarget;
  return !(next instanceof Node) || !event.currentTarget.contains(next);
}

function PropRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex min-h-6 items-center justify-between gap-2">
      <span className="w-13 flex-none font-heading text-step--2 font-bold tracking-[0.05em] text-muted uppercase forced-colors:text-[CanvasText]">
        {label}:
      </span>
      <div className="flex min-w-0 flex-1 items-center justify-end">{children}</div>
    </div>
  );
}

function PropValue({ children, placeholder = false, title }: { children: ReactNode; placeholder?: boolean; title: string }) {
  return (
    <span
      className={cn(
        "max-w-[170px] truncate font-heading text-step--2 font-bold",
        placeholder && "font-normal text-muted italic",
      )}
      title={title}
    >
      {children}
    </span>
  );
}

export type PrimitiveConstantProps = {
  name?: string;
  dataType?: SocketType;
  value: string;
  onChange: (text: string) => void;
  onNameChange?: (name: string) => void;
  onTypeChange?: (type: SocketType) => void;
  selected?: boolean;
  highlighted?: boolean;
  connected?: boolean;
  handle?: ReactNode;
};

export function PrimitiveConstant({
  name = "CONSTANT_A",
  dataType = "u64",
  value,
  onChange,
  onNameChange,
  onTypeChange,
  selected,
  highlighted,
  connected,
  handle,
}: PrimitiveConstantProps) {
  const errorId = useId();
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(name);
  const [isEditingType, setIsEditingType] = useState(false);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [valueDraft, setValueDraft] = useState(value);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);

  const nameButton = useRef<HTMLButtonElement>(null);
  const typeButton = useRef<HTMLButtonElement>(null);
  const valueButton = useRef<HTMLButtonElement>(null);
  const returnToName = useReturnFocus(isEditingName, nameButton);
  const returnToType = useReturnFocus(isEditingType, typeButton);
  const returnToValue = useReturnFocus(isEditingValue, valueButton);

  const error = validateConstantValue(dataType, isEditingValue ? valueDraft : value);
  const isTrue = value.trim().toLowerCase() === "true";

  function commitName() {
    const trimmed = nameDraft.trim();
    if (trimmed && trimmed !== name) onNameChange?.(trimmed);
    else setNameDraft(name);
    setIsEditingName(false);
  }

  function cancelName() {
    setNameDraft(name);
    setIsEditingName(false);
  }

  function commitValue() {
    onChange(valueDraft);
    setIsEditingValue(false);
  }

  function cancelValue() {
    setValueDraft(value);
    setIsEditingValue(false);
  }

  function onEditorKeyDown(event: KeyboardEvent<HTMLInputElement>, commit: () => void, cancel: () => void, returnFocus: () => void) {
    if (event.key !== "Enter" && event.key !== "Escape") return;
    event.preventDefault();
    returnFocus();
    if (event.key === "Enter") commit();
    else cancel();
  }

  function onPickerKeyDown(event: KeyboardEvent<HTMLElement>, close: () => void, returnFocus: () => void) {
    if (event.key !== "Escape") return;
    event.preventDefault();
    event.stopPropagation();
    returnFocus();
    close();
  }

  function selectType(next: SocketType) {
    onTypeChange?.(next);
    if (next === "boolean" && !["true", "false"].includes(value.trim().toLowerCase())) {
      onChange("true");
      setValueDraft("true");
    } else if (next === "item" && !IDENTIFIER.test(value.trim())) {
      onChange("STORAGE_UNIT");
      setValueDraft("STORAGE_UNIT");
    }
    returnToType();
    setIsEditingType(false);
  }

  function setBoolean(next: "true" | "false") {
    onChange(next);
    setValueDraft(next);
    returnToValue();
    setIsEditingValue(false);
  }

  const placeholder =
    dataType === "u64" ? "Decimal u64 (e.g. 40)"
    : dataType === "boolean" ? "true or false"
    : dataType === "item" ? "Item ID (e.g. EU_40)"
    : "Value";

  return (
    <>
      <NodeShell
        title={name}
        eyebrow="Primitive Constant"
        accentType={dataType}
        selected={selected}
        highlighted={highlighted}
        invalid={Boolean(error)}
      >
        <div className="nodrag nopan flex flex-col gap-2 pt-0.5 pb-1.5">
          <PropRow label="Name">
            {isEditingName ? (
              <div
                className="flex w-full items-center justify-end gap-1"
                onBlur={event => {
                  if (!focusLeavesRow(event)) return;
                  if (event.relatedTarget === null) returnToName();
                  commitName();
                }}
              >
                <input
                  /* 16px: iOS zooms the page when a focused input is smaller */
                  className="w-full max-w-[170px] min-w-0 border border-accent bg-background px-1.5 py-0.5 font-heading text-base font-bold text-foreground outline-none"
                  value={nameDraft}
                  autoFocus
                  onChange={event => setNameDraft(event.target.value)}
                  onKeyDown={event => onEditorKeyDown(event, commitName, cancelName, returnToName)}
                  aria-label="Edit constant name"
                />
                <button
                  type="button"
                  className={cn(ICON_BUTTON, "bg-accent text-step--2 font-bold text-text-on-accent hover:text-text-on-accent")}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => {
                    returnToName();
                    commitName();
                  }}
                  aria-label="Save name"
                >
                  ✓
                </button>
              </div>
            ) : (
              <div className="inline-flex max-w-full items-center justify-end gap-1.5">
                <PropValue title={name}>{name}</PropValue>
                <button
                  ref={nameButton}
                  type="button"
                  className={ICON_BUTTON}
                  onClick={() => {
                    setNameDraft(name);
                    setIsEditingName(true);
                  }}
                  aria-label={`Edit name for ${name}`}
                >
                  <EditIcon />
                </button>
              </div>
            )}
          </PropRow>

          <PropRow label="Type">
            {isEditingType ? (
              <div
                className="inline-flex flex-wrap items-center justify-end gap-1"
                onKeyDown={event => onPickerKeyDown(event, () => setIsEditingType(false), returnToType)}
              >
                {editableTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    autoFocus={type === dataType}
                    className={PILL}
                    aria-pressed={type === dataType}
                    onClick={() => selectType(type)}
                  >
                    <span aria-hidden="true">{socketTypeMeta[type].glyph}</span> {socketTypeMeta[type].badge}
                  </button>
                ))}
                <button
                  type="button"
                  className={cn(ICON_BUTTON, "hover:text-danger")}
                  onClick={() => {
                    returnToType();
                    setIsEditingType(false);
                  }}
                  aria-label="Close type picker"
                >
                  <Icon name="cross" className="size-2.5" />
                </button>
              </div>
            ) : (
              <div className={cn("inline-flex max-w-full items-center justify-end gap-1.5", styles[dataType])}>
                <TypeBadge type={dataType} />
                <button
                  ref={typeButton}
                  type="button"
                  className={ICON_BUTTON}
                  onClick={() => setIsEditingType(true)}
                  aria-label={`Edit type (currently ${dataType})`}
                >
                  <EditIcon />
                </button>
              </div>
            )}
          </PropRow>

          <PropRow label="Value">
            {dataType === "boolean" ? (
              isEditingValue ? (
                <div
                  className="inline-flex flex-wrap items-center justify-end gap-1"
                  onKeyDown={event => onPickerKeyDown(event, () => setIsEditingValue(false), returnToValue)}
                >
                  {(["true", "false"] as const).map(option => (
                    <button
                      key={option}
                      type="button"
                      autoFocus={option === valueDraft.toLowerCase()}
                      className={PILL}
                      aria-pressed={option === valueDraft.toLowerCase()}
                      onClick={() => setBoolean(option)}
                    >
                      {option}
                    </button>
                  ))}
                  <button
                    type="button"
                    className={cn(ICON_BUTTON, "hover:text-danger")}
                    onClick={() => {
                      returnToValue();
                      setIsEditingValue(false);
                    }}
                    aria-label="Close boolean selector"
                  >
                    <Icon name="cross" className="size-2.5" />
                  </button>
                </div>
              ) : (
                <div className="inline-flex max-w-full items-center justify-end gap-1.5">
                  <PropValue title={value}>{isTrue ? "True" : "False"}</PropValue>
                  <button
                    ref={valueButton}
                    type="button"
                    className={ICON_BUTTON}
                    onClick={() => {
                      setValueDraft(isTrue ? "true" : "false");
                      setIsEditingValue(true);
                    }}
                    aria-label={`Edit boolean value (currently ${value})`}
                  >
                    <EditIcon />
                  </button>
                </div>
              )
            ) : dataType === "item" ? (
              <div className="inline-flex max-w-full items-center justify-end gap-1.5">
                <PropValue title={value || "Select item..."} placeholder={!value}>
                  {value || "Select item..."}
                </PropValue>
                <button
                  ref={valueButton}
                  type="button"
                  className={ICON_BUTTON}
                  onClick={() => setIsItemDialogOpen(true)}
                  aria-label={`Select item type (currently ${value || "none"})`}
                >
                  <EditIcon />
                </button>
              </div>
            ) : isEditingValue ? (
              <div
                className="flex w-full items-center justify-end gap-1"
                onBlur={event => {
                  if (!focusLeavesRow(event)) return;
                  if (event.relatedTarget === null) returnToValue();
                  commitValue();
                }}
              >
                <input
                  /* 16px: iOS zooms the page when a focused input is smaller */
                  className="w-full max-w-[170px] min-w-0 border border-accent bg-background px-1.5 py-0.5 font-heading text-base font-bold text-foreground outline-none placeholder:text-muted"
                  type="text"
                  inputMode={dataType === "u64" ? "numeric" : "text"}
                  placeholder={placeholder}
                  value={valueDraft}
                  autoFocus
                  onChange={event => setValueDraft(event.target.value)}
                  onKeyDown={event => onEditorKeyDown(event, commitValue, cancelValue, returnToValue)}
                  aria-label="Edit constant value"
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? errorId : undefined}
                />
                <button
                  type="button"
                  className={cn(ICON_BUTTON, "bg-accent text-step--2 font-bold text-text-on-accent hover:text-text-on-accent")}
                  onMouseDown={event => event.preventDefault()}
                  onClick={() => {
                    returnToValue();
                    commitValue();
                  }}
                  aria-label="Save value"
                >
                  ✓
                </button>
              </div>
            ) : (
              <div className="inline-flex max-w-full items-center justify-end gap-1.5">
                <PropValue title={value || placeholder} placeholder={!value}>
                  {value || placeholder}
                </PropValue>
                <button
                  ref={valueButton}
                  type="button"
                  className={ICON_BUTTON}
                  onClick={() => {
                    setValueDraft(value);
                    setIsEditingValue(true);
                  }}
                  aria-label={`Edit value for ${name}`}
                >
                  <EditIcon />
                </button>
              </div>
            )}
          </PropRow>
        </div>

        {error && (
          <p id={errorId} className="text-step--2 font-semibold text-danger forced-colors:text-[CanvasText]">
            Error: {error}
          </p>
        )}

        <div className="grid gap-1.5">
          <Socket direction="out" type={dataType} connected={connected} handle={handle} />
        </div>
      </NodeShell>

      <ItemSearchDialog
        open={isItemDialogOpen}
        onOpenChange={setIsItemDialogOpen}
        currentValue={value}
        onSelect={itemId => {
          onChange(itemId);
          setValueDraft(itemId);
        }}
      />
    </>
  );
}

export type OperationNodeProps = {
  role: OperationRole;
  item?: string;
  connected?: boolean;
  execInConnected?: boolean;
  execOutConnected?: boolean;
  selected?: boolean;
  highlighted?: boolean;
  handles?: Partial<Record<OperationHandleId, ReactNode>>;
};

export function OperationNode({
  role,
  item,
  connected = false,
  execInConnected = true,
  execOutConnected = true,
  selected,
  highlighted,
  handles,
}: OperationNodeProps) {
  const spec = primitiveSpec[role];
  const resolvedItem = item ?? spec.defaultItem;

  return (
    <NodeShell
      title={role}
      category={spec.symbol}
      accentType={spec.accent}
      selected={selected}
      highlighted={highlighted}
    >
      <p className="text-step--2 text-muted forced-colors:text-[CanvasText]">{spec.summary}</p>
      <div className="grid gap-1.5">
        {spec.valueInput && (
          <Socket
            direction="in"
            type={spec.valueInput.type}
            label={spec.valueInput.label}
            connected={connected}
            handle={handles?.[spec.valueInput.id]}
          />
        )}
        {resolvedItem && role !== "Start Request" && (
          <Socket direction="in" type="item" label="Item type" binding={resolvedItem} connected handle={handles?.item} />
        )}
        {spec.hasExecIn && (
          <Socket direction="in" type="execution" label="Request in" connected={execInConnected} handle={handles?.["exec-in"]} />
        )}
        {spec.hasExecOut && (
          <Socket direction="out" type="execution" label="Request out" connected={execOutConnected} handle={handles?.["exec-out"]} />
        )}
      </div>
    </NodeShell>
  );
}
