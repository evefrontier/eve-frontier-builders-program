/*
 * Every word on the agentic coding pages lives here, apart from the page
 * layout. Edit the text freely; keep the shape (the field names) the same.
 * Tool names, prices, links and free tiers change quickly: update
 * `lastChecked` whenever you re-check them.
 *
 * Game examples stay at the level of what a player wants, not how the world
 * contracts do it: the contracts are being rebuilt in the open.
 */

export const lastChecked = "22 October 2026";

export type IdeaId = "turrets" | "gate" | "storage" | "bounty" | "killboard" | "other";
export type AudienceId = "me" | "friends" | "tribe" | "everyone";
export type ToolId = "none" | "chat" | "desktop" | "editor" | "cloud";
export type Stage = "Describe" | "Plan" | "Build" | "Prove" | "Save";

export type Choice<Id extends string> = { id: Id; label: string; hint: string };

/** A mocked result the AI shows as proof. Drawn, not screenshotted, so it doesn't date. */
export type Visual = {
  kind: "test" | "link" | "phone";
  title: string;
  rows: { label: string; value: string; pass?: boolean }[];
  footer?: string;
};

export type Message = {
  from: "you" | "ai";
  text: string;
  /** A mocked result shown under the message. */
  visual?: Visual;
  /** Which step of the loop this message is. */
  stage?: Stage;
  /** A short teaching point beside the message. */
  note?: string;
};

export type Source = { label: string; href: string; what: string };

/* ---------- The front door (/start/) ---------- */

export const ideas: {
  id: IdeaId;
  title: string;
  body: string;
  /** The idea as the first sentence of an opening message. */
  want: string;
  /** The idea as a short name inside a sentence: "Before we start on ___". */
  topic: string;
}[] = [
  {
    id: "turrets",
    title: "Choose who my turrets fire at",
    body: "Leave your friends alone, shoot everyone else.",
    want: "I want my turrets to leave my friends alone and shoot everyone else.",
    topic: "my turret rules",
  },
  {
    id: "gate",
    title: "Charge for using my gate",
    body: "Let people through for a fee. Tribe goes free.",
    want: "I want to charge a small fee for using my gate, with my tribe going free.",
    topic: "the gate fee",
  },
  {
    id: "storage",
    title: "Track my tribe's storage",
    body: "See what's in there and who took what.",
    want: "I want a page that shows what's in my tribe's shared storage and who took what.",
    topic: "the storage page",
  },
  {
    id: "bounty",
    title: "Run a bounty board",
    body: "Put a price on someone's head.",
    want: "I want to run a bounty board where people put a reward on a pilot.",
    topic: "the bounty board",
  },
  {
    id: "killboard",
    title: "Build a killboard",
    body: "Who's fighting where, open to every player.",
    want: "I want a public killboard showing who killed who, where and when.",
    topic: "the killboard",
  },
  {
    id: "other",
    title: "Something else",
    body: "A racetrack? Hauling contracts? If you can describe it, you can start.",
    want: "I want to build something new for EVE Frontier: [say your idea here, in your own words].",
    topic: "my idea",
  },
];

export const frontDoor = {
  kicker: "EVE Frontier Builders",
  ideas: {
    step: "Step 1 of 2",
    title: "What do you want to build?",
    intro: "You don't need to know how yet. Pick the closest idea.",
  },
  ways: {
    step: "Step 2 of 2",
    title: "How do you want to build it?",
    intro: "There are three ways in. This prototype only covers the first.",
    yourIdea: "Your idea",
    change: "Pick a different idea",
    list: [
      {
        id: "agentic",
        label: "Agentic coding",
        title: "Describe it to an AI",
        body: "Say what you want in your own words. AI agents write the code; you never have to.",
        href: "/agentic/",
        action: "Start here",
      },
      {
        id: "low-code",
        label: "Low-code",
        title: "Use building blocks",
        body: "Connect ready-made pieces in a visual editor, and the tool writes the code.",
        elsewhere: "Another part of the program",
      },
      {
        id: "manual",
        label: "Manual coding",
        title: "Write the code yourself",
        body: "Learn Sui and Move step by step, from your first contract to the Frontier world.",
        elsewhere: "Pillars 3 and 4 of the program",
      },
    ],
  },
};

/* ---------- The course (/agentic/) ---------- */

export const course = {
  kicker: "Pillar 1 · Agentic coding",
  title: "Build it with AI agents",
  body: "You describe what you want. AI agents write the code, test it and keep notes. You never need to learn to code: your job is to decide what gets built and whether it's right.",
  stats: "3 short lessons · 11 screens · about 15 minutes",
  start: "Start the course",
  yourIdea: "We'll use your idea as the example throughout:",
};

export type Screen = { slug: string; title: string; lead: string };

export const lessons: { title: string; screens: Screen[] }[] = [
  {
    title: "How it works",
    screens: [
      {
        slug: "you-direct",
        title: "You never write the code",
        lead: "AI agents write it, run it and check it. You decide what gets built and whether it's right.",
      },
      {
        slug: "the-loop",
        title: "The loop",
        lead: "Every build, big or small, goes round the same five steps.",
      },
    ],
  },
  {
    title: "Set yourself up",
    screens: [
      { slug: "who-for", title: "Who is it for?", lead: "This decides how much setup you need. Start small; you can grow it later." },
      {
        slug: "your-ai",
        title: "Which AI do you have?",
        lead: "Each rung does more of the work for you. Pick the closest; the lines blur more every month.",
      },
      {
        slug: "sources",
        title: "Tell it where to look",
        lead: "Garbage in, garbage out. AI learned from old information, and EVE Frontier changes with every update.",
      },
      { slug: "try-it", title: "Which would you send?", lead: "Two ways to start the same conversation. Pick the one you think gets the better result." },
    ],
  },
  {
    title: "Watch a first build",
    screens: [
      {
        slug: "in-action",
        title: "See it in action",
        lead: "A first conversation, one message at a time. Watch for the five steps of the loop.",
      },
      {
        slug: "notes",
        title: "Ask it to keep notes",
        lead: "Your AI forgets everything between chats, and only takes notes when you ask. Notes kept in your project don't forget.",
      },
      { slug: "habits", title: "Habits that work", lead: "Six small habits that save the most time, each as a weaker and a stronger way to ask." },
      {
        slug: "keep-it-safe",
        title: "Keep it safe and running",
        lead: "AI gets you most of the way fast. The last stretch is security, cost and keeping it running.",
      },
      { slug: "ready", title: "You're ready", lead: "Here's what you now know, and a way to start." },
    ],
  },
];

/** What the reader's setup means in practice, shown where the course assumes an agent. */
export const withYourAi: { label: string; byTool: Record<ToolId, string> } = {
  label: "With your setup",
  byTool: {
    none: "With a free chat app you're its hands for now: it gives you the files and tells you exactly where to put them and what to click. Still no coding. For rules on your own structures you'll want an app that works on your files; ask it to walk you through setting one up.",
    chat: "With a chat app you're its hands for now: it gives you the files and tells you exactly where to put them and what to click. Still no coding. For rules on your own structures you'll want an app that works on your files; ask it to walk you through setting one up.",
    desktop: "Your AI can do all of this itself: read the sources, set up the test copy, run it and show you the result. You approve and look.",
    editor: "Your AI can do all of this itself: read the sources, set up the test copy, run it and show you the result. You approve and look.",
    cloud: "Your AI works on your GitHub project and sends you each change to approve, with a private test link to check.",
  },
};

/* ---------- Lesson 1: How it works ---------- */

export const team = {
  roles: [
    { name: "You", role: "The project manager", body: "Say what you want. Look at what comes back. Decide what's next." },
    { name: "AI agents", role: "Your team", body: "Plan it, write the code, test it, fix it, and write down what they did." },
    { name: "Your tool", role: "The result", body: "Something that works, built a piece at a time." },
  ],
  points: [
    "Your skills are describing what you want, looking at what comes back, and saying what's wrong.",
    "You know the game; it knows the code. You say what matters in game, it says what's possible in code, and you get there together.",
  ],
  agent: "An AI agent is an AI that does the work, not just chats about it: it can write files, run them and check the result. A chat app on its own is the first step towards one.",
};

export const loop: { stage: Stage; who: string; body: string }[] = [
  {
    stage: "Describe",
    who: "You",
    body: "Say what you want and tell it where to look. You can ramble; it sorts out the order. Ask it to question you and plan before it builds.",
  },
  {
    stage: "Plan",
    who: "AI, then you",
    body: "Asked to, it reads the sources, asks you questions, then writes a short plan. You approve it. Left alone, it often guesses instead.",
  },
  { stage: "Build", who: "AI", body: "Ask for the smallest piece that works first. Left alone, many AIs build everything at once." },
  { stage: "Prove", who: "AI, then you", body: "It shows you it working: a screenshot, a private test link, or a test result. You look." },
  { stage: "Save", who: "AI", body: "It saves a checkpoint, a save point it can go back to, and notes what was decided, when you ask." },
];

export const loopAsk =
  "Most AIs only plan, work in small steps and save when you ask. Put the asking in your ground rules once, and it happens every time. How well it goes also depends on which AI you use.";

export const loopNote =
  "Doing it this way is sometimes called agentic engineering. Skipping the plan and the proof is often called vibe coding: great for a quick experiment, risky for anything people rely on.";

/* ---------- Lesson 2: Set yourself up ---------- */

export const audienceQuestion = {
  step: "Question 1 of 2",
  choices: [
    { id: "me", label: "Just me", hint: "A tool or script for your own use" },
    { id: "friends", label: "A few friends", hint: "Something small you share with a handful of people" },
    { id: "tribe", label: "My tribe", hint: "A tool your tribe relies on every day" },
    { id: "everyone", label: "The whole game", hint: "A public tool anyone in EVE Frontier can use" },
  ] satisfies Choice<AudienceId>[],
};

/** Shown whoever it's for. */
export const always = {
  short: "Whoever it's for: never give any AI your wallet recovery phrase or private keys.",
  title: "Whoever it's for",
  body: "Never give any AI your wallet recovery phrase or private keys. Try everything with test items first, and get a second person to check anything that holds other people's items or money.",
};

export const audiences: Record<
  AudienceId,
  { confirm: string; phrase: string; watch: { label: string; text: string }[] }
> = {
  me: {
    confirm: "Something just for you. Keep it simple: no website or hosting needed yet.",
    phrase: "just for me",
    watch: [
      { label: "Cost", text: "Anything that bills by use, like AI account keys or hosting, can surprise you. Set a spending limit first." },
      { label: "Security", text: "Keep passwords and AI account keys out of your code and out of the chat." },
      { label: "Upkeep", text: "When the game updates, your tool may need a fix. Ask your AI to check what changed." },
    ],
  },
  friends: {
    confirm: "Something small you share with a link. You'll want a safe copy of your code and somewhere free to put it online.",
    phrase: "for a few friends",
    watch: [
      { label: "Cost", text: "Free hosting has limits. Find out what happens if you go over before you share the link." },
      { label: "Security", text: "Other people use it now. Keep passwords and account keys out of the code and out of the chat." },
      { label: "Upkeep", text: "Someone has to fix it when the game updates. That's you, and your AI." },
    ],
  },
  tribe: {
    confirm: "A tool people rely on. You'll want a safe copy of your code, and a private test link to check before anything goes live.",
    phrase: "for my tribe",
    watch: [
      { label: "Cost", text: "More use means more cost. Set alerts as well as limits." },
      { label: "Security", text: "Check every change on a private test link before it goes live, and keep account keys somewhere safe." },
      { label: "Upkeep", text: "People notice when it breaks. Keep a way back to the last version that worked." },
    ],
  },
  everyone: {
    confirm: "A public tool. Everything a tribe tool needs, plus planning for traffic, security and keeping it running.",
    phrase: "for anyone in EVE Frontier",
    watch: [
      { label: "Cost", text: "Traffic can spike overnight. Know your worst-case bill before launch." },
      { label: "Security", text: "Expect people to poke at it. Ask your AI to review it for security before it goes live." },
      { label: "Upkeep", text: "Updates, outages, questions from players: plan for keeping it running, not just building it." },
    ],
  },
};

export const toolQuestion = {
  step: "Question 2 of 2",
  choices: [
    {
      id: "none",
      label: "Haven't tried one yet",
      hint: "ChatGPT, Claude, Gemini and Microsoft Copilot all have free versions",
    },
    { id: "chat", label: "A chat app", hint: "In a browser or on your phone. Many can now reach GitHub too" },
    { id: "desktop", label: "An app that works on my files", hint: "The AI company's own app, working in a folder you choose" },
    { id: "editor", label: "A code editor with an AI agent", hint: "Like VS Code: files, commands and test links in one place" },
    { id: "cloud", label: "AI agents in the cloud", hint: "They work on your GitHub project and send you changes to approve" },
  ] satisfies Choice<ToolId>[],
};

export const tools: Record<ToolId, { confirm: string; next: string; phrase: string; extra?: string }> = {
  none: {
    confirm: "Start with the free version of any chat app. Then ask it to search the web for which AI tools are best for building right now, because the answer keeps changing.",
    next: "Once you've tried a few ideas, a chat app is your first rung.",
    phrase: "I haven't used an AI for building before",
    extra: "Give me one step at a time and tell me exactly what to click.",
  },
  chat: {
    confirm: "You'll copy and paste between the chat and your files, unless you connect it to GitHub.",
    next: "When copying gets tedious, step up to an app that works on your files.",
    phrase: "I'm using a chat app in my browser",
    extra: "Give me one step at a time and tell me exactly what to click.",
  },
  desktop: {
    confirm: "It opens, changes and runs files in a folder you choose. Give it ground rules before it starts.",
    next: "When you want test links, GitHub and the agent in one window, step up to a code editor.",
    phrase: "I'm using an AI app that works on a folder on my computer",
  },
  editor: {
    confirm: "The most capable setup on your own computer: the agent edits, runs, tests and saves checkpoints.",
    next: "When you want to hand off a job and check it later, even from your phone, try agents in the cloud.",
    phrase: "I'm using a code editor with an AI agent",
  },
  cloud: {
    confirm: "Agents work on your GitHub project and send you changes to approve. You need a project on GitHub first.",
    next: "You're at the top. Most people mix rungs: the cloud for small jobs, an editor for big ones.",
    phrase: "I'm using an AI agent that works on my GitHub project",
  },
};

/** Filled in with the reader's idea. */
export const sourcesPrompt = (topic: string) =>
  `Before we start on ${topic}, find and read the official EVE Frontier builder docs written for AI, the Sui docs, and the world contracts and builder scaffold on GitHub, including what's changing in the next version on the dev branch. Tell me if anything I ask isn't possible.`;

export const sourcesUi = {
  note: "A good AI can find these itself. Many docs sites publish a version written for AI, often a file called llms.txt.",
  fallback: "If your AI can't find them",
  chatNote: "If your chat app can't open links, download the file and attach it.",
};

export const sources: Source[] = [
  { label: "EVE Frontier builder docs", href: "https://docs.evefrontier.com/llms-full.txt", what: "the whole builder documentation in one file, written for AI" },
  {
    label: "World contracts",
    href: "https://github.com/evefrontier/world-contracts",
    what: "the rules of the world as code; the dev branch holds the next version",
  },
  {
    label: "Builder scaffold",
    href: "https://github.com/evefrontier/builder-scaffold",
    what: "a small test version of the world on your own computer: a test character, a storage unit and two gates",
  },
  { label: "Sui docs", href: "https://docs.sui.io/llms.txt", what: "the blockchain EVE Frontier runs on, written for AI" },
  { label: "The Move Book", href: "https://move-book.com/llms.txt", what: "the language the world contracts are written in" },
];

export const tryIt = {
  pick: "Pick one",
  right: "Yes. It says who it's for and what matters, tells the AI where to look, and asks it to interview you before building. Rambling is fine.",
  wrong: "That one sounds thorough, but it leaves the AI guessing: it doesn't say who it's for, what matters most, or where to look. You'd get a confident answer built from old information.",
  again: "Try the other one.",
};

export const tryPairs: Record<IdeaId, { weak: string; strong: string }> = {
  turrets: {
    weak: "Write me a production-ready Sui Move smart contract so my EVE Frontier turrets don't shoot my tribe. Use best practices and make it secure.",
    strong:
      "my turrets keep shooting my tribe mates. I want them to leave my tribe and a list of allies alone and shoot everyone else. I don't code. read the EVE Frontier docs for AI and the world contracts first, including the next version, then ask me questions one at a time before you build anything",
  },
  gate: {
    weak: "Create a complete, professional toll system for my EVE Frontier gate with payments, using the best architecture.",
    strong:
      "I want to charge a small fee to use my gate, tribe goes free. no idea how paying works in game. check the EVE Frontier docs for AI and the world contracts first and explain the options in plain English, then ask me what you need to know",
  },
  storage: {
    weak: "Build a full-featured inventory tracking dashboard for EVE Frontier storage with every feature a tribe could need.",
    strong:
      "our tribe's shared storage keeps losing stuff. I want a page that shows what's in there and who took what, for about twenty of us, on phones. check the EVE Frontier docs for AI for what's actually visible first, then ask me questions",
  },
  bounty: {
    weak: "Write a secure, fair bounty contract for EVE Frontier that pays out automatically. Make it production quality.",
    strong:
      "I want a bounty board where people put a reward on a pilot and whoever kills them gets paid. check the EVE Frontier docs for AI and the world contracts for how kills are recorded first. start without real money, and ask me questions before building",
  },
  killboard: {
    weak: "Build me a professional killboard website for EVE Frontier with all the best features and a great design.",
    strong:
      "I want a free public killboard: who killed who, where, when. check the EVE Frontier docs for AI and the world contracts for where kills are recorded, keep it cheap to run, and ask me questions before you build anything",
  },
  other: {
    weak: "Make a racing game for EVE Frontier with automatic timing and a leaderboard. Make it work perfectly.",
    strong:
      "I want a racetrack: pilots fly past checkpoints, times recorded, a leaderboard. check the EVE Frontier docs for AI and the world contracts for whether anything can see where ships are, tell me honestly if it's not possible, and suggest what we could do instead",
  },
};

/* ---------- Lesson 3: Watch a first build ---------- */

const reads = "It reads the sources you pointed it at.";
const proof = "Proof you can look at yourself.";
const again = "Round again.";

export const conversations: Record<IdeaId, { title: string; messages: Message[] }> = {
  turrets: {
    title: "Choose who my turrets fire at",
    messages: [
      {
        from: "you",
        stage: "Describe",
        text: "ok so my turrets keep shooting my tribe mates which is a nightmare. I want them to leave my tribe and allies alone, maybe a list I can change, and shoot everyone else. I don't code at all. before anything, read the EVE Frontier docs written for AI, the world contracts on GitHub including the dev branch with the next version, and the builder scaffold so we can test on a copy. ask me anything you need first",
        note: "Rambling is fine. Tell it where to look, and ask it to question you.",
      },
      { from: "ai", stage: "Plan", text: "Reading those now, so I'm working from how things are today, not from memory.", note: reads },
      {
        from: "ai",
        stage: "Plan",
        text: "One thing I found: the next version of the world contracts changes how custom rules attach to structures, and turrets aren't in it yet. I'll build for today's version and note it, so we can move it across later. First question: should the safe list be your whole tribe, or a list you edit yourself?",
        note: "It looked ahead, and asks one question at a time.",
      },
      { from: "you", stage: "Describe", text: "a list I edit. and test it first, I don't want to break my base" },
      {
        from: "ai",
        stage: "Plan",
        text: "The builder scaffold's test world has no turret, so here's the plan: write the rule, plus a test that feeds it a pretend list of ships, some on your list and some not. Nothing real is touched. OK?",
        note: "A short plan for you to approve.",
      },
      { from: "you", stage: "Plan", text: "go for it" },
      { from: "ai", stage: "Build", text: "Writing the rule and the test now.", note: "The smallest piece first." },
      {
        from: "ai",
        stage: "Prove",
        text: "Here's the test result: your two friends come back as \"leave alone\", the stranger as \"target\".",
        note: "It shows you, rather than telling you it works.",
        visual: {
          kind: "test",
          title: "Who does the turret fire at?",
          rows: [
            { label: "Friend 1, on your list", value: "leave alone", pass: true },
            { label: "Friend 2, on your list", value: "leave alone", pass: true },
            { label: "Stranger", value: "target", pass: true },
          ],
          footer: "3 of 3 checks passed · pretend ships, nothing real touched",
        },
      },
      {
        from: "ai",
        stage: "Save",
        text: "Saved a checkpoint, and noted two decisions in the project's decision log: the list is yours to edit, and it's built for the current world contracts.",
        note: "Notes, so a future chat knows why.",
      },
      { from: "you", stage: "Describe", text: "brilliant. next I need to add people without asking you every time", note: again },
    ],
  },
  gate: {
    title: "Charge for using my gate",
    messages: [
      {
        from: "you",
        stage: "Describe",
        text: "want to charge people to use my gate. small fee. tribe goes free obviously. no idea how paying works in game. check the EVE Frontier docs for AI and the world contracts on GitHub first, including the next version on the dev branch. ask me questions before you build",
        note: "Say what you don't know, and where to look.",
      },
      { from: "ai", stage: "Plan", text: "Reading those now, to see how gate rules and payments work today.", note: reads },
      {
        from: "ai",
        stage: "Plan",
        text: "Gates can be given rules about who may jump. The next version of the world contracts changes how those rules attach, and gates aren't in it yet, so I'll build for today and keep notes. I'll explain the payment options in plain English before we choose. Should your tribe always go free?",
        note: "It explains in plain English, then asks.",
      },
      { from: "you", stage: "Describe", text: "yes always. pick the simplest payment option" },
      {
        from: "ai",
        stage: "Plan",
        text: "Plan: use the builder scaffold's test world, which comes with two linked gates. Rule one: your tribe jumps free. Rule two: everyone else pays a fixed fee. Then a test jump each way. OK?",
        note: "A short plan for you to approve.",
      },
      { from: "you", stage: "Plan", text: "go for it" },
      { from: "ai", stage: "Build", text: "Building the two rules on the test world now.", note: "The smallest piece first." },
      {
        from: "ai",
        stage: "Prove",
        text: "Done. A tribe test character jumped free; a stranger was asked to pay first. Here's the record of both jumps.",
        note: proof,
        visual: {
          kind: "test",
          title: "Test jumps",
          rows: [
            { label: "Tribe test character", value: "jumped free", pass: true },
            { label: "Stranger", value: "asked to pay first", pass: true },
          ],
          footer: "2 of 2 checks passed · on the test world",
        },
      },
      { from: "ai", stage: "Save", text: "Checkpoint saved. Noted: tribe always free, one fixed fee for now, built for the current world contracts." },
      { from: "you", stage: "Describe", text: "fee's too high, halve it. and can allies get a discount", note: again },
    ],
  },
  storage: {
    title: "Track my tribe's storage",
    messages: [
      {
        from: "you",
        stage: "Describe",
        text: "our tribe shares storage and stuff keeps going missing. want a page that shows what's in there and who took what. about twenty of us, needs to work on phones. check the EVE Frontier docs for AI and the world contracts first for what's actually visible, and ask me what you need",
        note: "Who it's for, where it's used, and where to look.",
      },
      {
        from: "ai",
        stage: "Plan",
        text: "Reading those now. I'd rather tell you what's possible before building something that can't work.",
        note: reads,
      },
      {
        from: "ai",
        stage: "Plan",
        text: "What's in a storage unit, and items going in and out, are recorded where anyone can read them. Whether that shows who took them, I'll confirm, and it may change in the next version. In that version, moving items with your own code needs the game's permission, but you only want to watch, so that's fine either way. Public page, or tribe only?",
        note: "It flags the limits early and honestly.",
      },
      { from: "you", stage: "Plan", text: "tribe only eventually, but get it working first" },
      {
        from: "ai",
        stage: "Plan",
        text: "Plan: one page listing what's in the builder scaffold's test storage unit. History and tribe-only access come after you've seen it. OK?",
        note: "A short plan for you to approve.",
      },
      { from: "you", stage: "Plan", text: "yep" },
      { from: "ai", stage: "Build", text: "Building the page now.", note: "The smallest piece first." },
      {
        from: "ai",
        stage: "Prove",
        text: "Here's a private test link. Open it on your phone.",
        note: proof,
        visual: {
          kind: "phone",
          title: "Tribe storage",
          rows: [
            { label: "Fuel", value: "1,200" },
            { label: "Ammunition", value: "340" },
            { label: "Salvage", value: "58" },
          ],
          footer: "Test storage unit · updated just now",
        },
      },
      { from: "ai", stage: "Save", text: "Checkpoint saved. Noted: read-only for now; tribe-only access is next." },
      { from: "you", stage: "Describe", text: "list is good. sort it by item name and make the text bigger", note: again },
    ],
  },
  bounty: {
    title: "Run a bounty board",
    messages: [
      {
        from: "you",
        stage: "Describe",
        text: "want a bounty board. people put a reward on someone's head, whoever kills them gets paid. has to be fair. check the EVE Frontier docs for AI and the world contracts first, how are kills recorded. ask me stuff before you build",
        note: "Say what matters most, and where to look.",
      },
      {
        from: "ai",
        stage: "Plan",
        text: "Reading those now. The key question is whether kills are recorded somewhere code can check.",
        note: reads,
      },
      {
        from: "ai",
        stage: "Plan",
        text: "They are: kills are recorded publicly, and anyone can read them. That record is being reworked in the next version, so I'll keep the part that reads it separate and easy to change. Paying out fairly is the hard part, so I suggest starting with a board that shows bounties and matching kills, with no real money yet. OK?",
        note: "It suggests starting with the safe part.",
      },
      { from: "you", stage: "Plan", text: "yeah start there" },
      {
        from: "ai",
        stage: "Build",
        text: "Building a page that lists open bounties and checks recent kills against them, with test data first.",
        note: "The smallest piece first.",
      },
      {
        from: "ai",
        stage: "Prove",
        text: "Here's a private test link: two test bounties, one marked claimed because a matching kill exists.",
        note: proof,
        visual: {
          kind: "link",
          title: "Bounty board",
          rows: [
            { label: "Pilot A · reward 5,000", value: "Open" },
            { label: "Pilot B · reward 2,000", value: "Claimed", pass: true },
          ],
          footer: "Test data · no real money",
        },
      },
      { from: "ai", stage: "Save", text: "Checkpoint saved. Noted: no payouts until we've designed them properly; the kill record may change shape." },
      { from: "you", stage: "Describe", text: "nice. next: how would payouts work without anyone cheating?", note: again },
    ],
  },
  killboard: {
    title: "Build a killboard",
    messages: [
      {
        from: "you",
        stage: "Describe",
        text: "I want a killboard. who killed who, where, when. anyone can look at it, and free to run. check the EVE Frontier docs for AI and the world contracts first for where kills are recorded. ask me what you need first",
        note: "Rambling is fine. Tell it where to look.",
      },
      {
        from: "ai",
        stage: "Plan",
        text: "Reading those now, along with the terms for using the game's data.",
        note: "It checks the rules as well as the code.",
      },
      {
        from: "ai",
        stage: "Plan",
        text: "Kills are recorded publicly, so this is very doable. The record is being reworked in the next version, so I'll keep the part that reads it in one place. Plan: one page listing recent kills, newest first, that runs in the browser with no server, so it's free to host. Just a list for now, or a map too?",
        note: "It plans for the change it found.",
      },
      { from: "you", stage: "Plan", text: "list first, map later. go for it" },
      { from: "ai", stage: "Build", text: "Building the list now.", note: "The smallest piece first." },
      {
        from: "ai",
        stage: "Prove",
        text: "Here's a private test link with the last fifty kills.",
        note: proof,
        visual: {
          kind: "link",
          title: "Recent kills",
          rows: [
            { label: "Pilot C destroyed Pilot D", value: "2 min ago" },
            { label: "Pilot E destroyed Pilot F", value: "9 min ago" },
            { label: "Pilot G destroyed Pilot H", value: "15 min ago" },
          ],
          footer: "Showing 3 of 50",
        },
      },
      { from: "ai", stage: "Save", text: "Checkpoint saved. Noted: reading the kill record lives in one place, so the next version is a small change." },
      { from: "you", stage: "Describe", text: "can you add a search box for pilot names", note: again },
    ],
  },
  other: {
    title: "A racetrack",
    messages: [
      {
        from: "you",
        stage: "Describe",
        text: "random one. I want a racetrack. pilots fly a course past checkpoints, it records their times automatically, leaderboard at the end. check the EVE Frontier docs for AI and the world contracts first and tell me honestly if it's possible. ask me questions first",
        note: "If you can describe it, you can start.",
      },
      { from: "ai", stage: "Plan", text: "Reading those now, looking for anything that knows where a ship is.", note: reads },
      {
        from: "ai",
        stage: "Plan",
        text: "Honest answer: not possible yet. Nothing today tells the chain where a ship is as it flies, so code can't see a ship pass a checkpoint. There's public work on proving locations, so it may come later.",
        note: "A good agent tells you when something can't be done.",
      },
      {
        from: "ai",
        stage: "Plan",
        text: "What we could do now: pilots check in at each checkpoint themselves, other racers confirm the times, and a leaderboard ranks them. Start there, and I'll note the automatic version for later?",
        note: "Then it finds what can be done.",
      },
      { from: "you", stage: "Plan", text: "yeah do that" },
      { from: "ai", stage: "Build", text: "Building a race page with a check-in button per checkpoint and a leaderboard.", note: "The smallest piece first." },
      {
        from: "ai",
        stage: "Prove",
        text: "Here's a private test link with test times on the leaderboard.",
        note: proof,
        visual: {
          kind: "link",
          title: "Leaderboard",
          rows: [
            { label: "1. Pilot J", value: "4:12" },
            { label: "2. Pilot K", value: "4:30" },
            { label: "3. Pilot L", value: "5:02" },
          ],
          footer: "Test times · checked in by hand",
        },
      },
      { from: "ai", stage: "Save", text: "Checkpoint saved. Noted: automatic timing is waiting on location data; check the world contracts for it." },
    ],
  },
};

export const conversationUi = {
  frames: { test: "Test result", link: "Private test link · not live", phone: "Private test link · on a phone" },
  continue: "Continue the chat",
  all: "Show the whole chat",
  others: "See another example:",
  done: "That's the loop: describe, plan, build, prove, save, and round again.",
};

export const notes = {
  body: "Ask your AI to keep these two files up to date. Every new chat starts by reading them, so it follows your rules, picks up where you left off, and can tell you why something was done the way it was.",
  rules: {
    title: "Ground rules",
    file: "AGENTS.md",
    about: "Your ground rules. Many AI agents look for a file with this name at the start of every chat.",
    lines: [
      "Ask before deleting anything.",
      "Explain changes in plain English.",
      "Test on a copy of the world before anything goes live.",
    ],
  },
  log: {
    title: "Decision log",
    file: "decisions.md",
    about: "Each decision, when it was made, and why.",
    lines: [
      "22 Oct: The safe list is one the owner edits, not the whole tribe. Owner wants to add allies.",
      "23 Oct: Built for the current world contracts. The next version changes how rules attach; revisit then.",
    ],
  },
};

export const habits: { title: string; weak: string; strong: string }[] = [
  {
    title: "More detail, less polish",
    weak: "Make a storage tool.",
    strong: "storage page for my tribe, about twenty of us, shows what's in there and who took what, oh and it has to work on phones",
  },
  {
    title: "Show it a screenshot",
    weak: "Make it orange, like the game.",
    strong: "Here are three screenshots. Use the exact colours from the first, and lay it out like the second.",
  },
  {
    title: "Ask for plain English",
    weak: "OK, sure, do that.",
    strong: "I don't follow. Explain that in plain English, like I've never written code.",
  },
  {
    title: "Start small",
    weak: "Build the whole thing with every feature.",
    strong: "Just the list of items first. Once I've seen that working, we'll add the search.",
  },
  {
    title: "Make it prove it",
    weak: "Great, you said it works. On to the next feature.",
    strong: "Show me where that's documented, with a link. Then run it and show me it working.",
  },
  {
    title: "Start fresh when it's stuck",
    weak: "No, still wrong. Try again. And again.",
    strong: "Write down where we got to in the decision log. I'll start a new chat and we'll go again.",
  },
];

export const habitsNote = "Wrong twice on the same thing? A new chat that reads your notes usually beats a third try.";

export const safety = {
  forYou: "For what you're building",
  safeCopy: {
    title: "Keep a safe copy",
    body: "GitHub keeps a copy of your code online. Changes are tried on a branch, a separate copy away from the version that works. Commits are save points. When a change works, it's merged into the working version. If something breaks, your working version is untouched. Your AI does the GitHub part; you just ask.",
  },
  previewFirst: "Anything other people use: check it on a private test link before it goes live.",
};

export const ready = {
  recapTitle: "Here's what you now know",
  recap: [
    "You direct; AI agents write, run and check the code. You never need to learn to code.",
    "Every build goes round the loop: describe, plan, build, prove, save.",
    "Tell your AI where to look, and get it to keep notes.",
    "Look at the result yourself, and keep it safe, cheap and running.",
  ],
  startTitle: "One way to start",
  startNote: "Built from your answers. Say it your own way; this is just a starting point.",
  copy: "Copy",
  copied: "Copied",
  further: "Go further",
  links: [
    { label: "More agentic coding courses", note: "ground rules, decision logs, reviews and more, coming later" },
    { label: "Pillar 2: how the EVE Frontier world works", note: "coming to the program" },
    { label: "Pillars 3 and 4: Move and Sui", note: "coming to the program" },
  ],
};

/** The opening message on the last screen, built from the reader's answers. */
export const starter = (want: string, audience?: string, tool?: string, extra?: string) =>
  [
    want,
    audience ? `It's ${audience}.` : "",
    tool ? `${tool}, and I don't write code.` : "I don't write code.",
    extra ?? "",
    "Before you build anything, find and read the official EVE Frontier builder docs written for AI and the world contracts on GitHub, including the next version on the dev branch, and tell me if anything I want isn't possible.",
    "Then interview me one question at a time and write a short plan for me to approve.",
    "Build the smallest version first, on a test copy such as the EVE Frontier builder scaffold, and show me it working.",
    "Keep a note of every decision we make.",
  ]
    .filter(Boolean)
    .join(" ");

export const nav = { startOver: "Start over", previous: "Previous", overview: "Course overview" };

export const footer = {
  prototype: "Prototype for the EVE Frontier Builders Program. Wording and layout will change.",
  checked: `Tools, features, links and free tiers last checked ${lastChecked}. They change quickly, so ask your AI what's current.`,
};
