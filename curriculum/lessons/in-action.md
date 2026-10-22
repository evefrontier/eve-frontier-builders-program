---
duration: 3 min
description: "A first conversation, one message at a time. Watch for the five steps of the loop."
---

# See it in action

```by-answer
answer: tool
label: With your setup
variants:
  none: 'With a free chat app you''re its hands for now: it gives you the files and tells you exactly where to put them and what to click. Still no coding. For rules on your own structures you''ll want an app that works on your files; ask it to walk you through setting one up.'
  chat: 'With a chat app you''re its hands for now: it gives you the files and tells you exactly where to put them and what to click. Still no coding. For rules on your own structures you''ll want an app that works on your files; ask it to walk you through setting one up.'
  desktop: 'Your AI can do all of this itself: read the sources, set up the test copy, run it and show you the result. You approve and look.'
  editor: 'Your AI can do all of this itself: read the sources, set up the test copy, run it and show you the result. You approve and look.'
  cloud: Your AI works on your GitHub project and sends you each change to approve, with a private test link to check.
```

```conversation
by: idea
default: turrets
frames:
  test: Test result
  link: Private test link · not live
  phone: Private test link · on a phone
continue: Continue the chat
all: Show the whole chat
others: 'See another example:'
done: 'That''s the loop: describe, plan, build, prove, save, and round again.'
examples:
  turrets:
    title: Choose who my turrets fire at
    messages:
    - from: you
      stage: Describe
      text: ok so my turrets keep shooting my tribe mates which is a nightmare. I want them to leave my tribe and allies alone, maybe a list I can change, and shoot everyone else. I don't code at all. before anything, read the EVE Frontier docs written for AI, the world contracts on GitHub including the dev branch with the next version, and the builder scaffold so we can test on a copy. ask me anything you need first
      note: Rambling is fine. Tell it where to look, and ask it to question you.
    - from: ai
      stage: Plan
      text: Reading those now, so I'm working from how things are today, not from memory.
      note: It reads the sources you pointed it at.
    - from: ai
      stage: Plan
      text: 'One thing I found: the next version of the world contracts changes how custom rules attach to structures, and turrets aren''t in it yet. I''ll build for today''s version and note it, so we can move it across later. First question: should the safe list be your whole tribe, or a list you edit yourself?'
      note: It looked ahead, and asks one question at a time.
    - from: you
      stage: Describe
      text: a list I edit. and test it first, I don't want to break my base
    - from: ai
      stage: Plan
      text: 'The builder scaffold''s test world has no turret, so here''s the plan: write the rule, plus a test that feeds it a pretend list of ships, some on your list and some not. Nothing real is touched. OK?'
      note: A short plan for you to approve.
    - from: you
      stage: Plan
      text: go for it
    - from: ai
      stage: Build
      text: Writing the rule and the test now.
      note: The smallest piece first.
    - from: ai
      stage: Prove
      text: 'Here''s the test result: your two friends come back as "leave alone", the stranger as "target".'
      note: It shows you, rather than telling you it works.
      proof:
        kind: test
        title: Who does the turret fire at?
        rows:
        - label: Friend 1, on your list
          value: leave alone
          pass: true
        - label: Friend 2, on your list
          value: leave alone
          pass: true
        - label: Stranger
          value: target
          pass: true
        footer: 3 of 3 checks passed · pretend ships, nothing real touched
    - from: ai
      stage: Save
      text: 'Saved a checkpoint, and noted two decisions in the project''s decision log: the list is yours to edit, and it''s built for the current world contracts.'
      note: Notes, so a future chat knows why.
    - from: you
      stage: Describe
      text: brilliant. next I need to add people without asking you every time
      note: Round again.
  gate:
    title: Charge for using my gate
    messages:
    - from: you
      stage: Describe
      text: want to charge people to use my gate. small fee. tribe goes free obviously. no idea how paying works in game. check the EVE Frontier docs for AI and the world contracts on GitHub first, including the next version on the dev branch. ask me questions before you build
      note: Say what you don't know, and where to look.
    - from: ai
      stage: Plan
      text: Reading those now, to see how gate rules and payments work today.
      note: It reads the sources you pointed it at.
    - from: ai
      stage: Plan
      text: Gates can be given rules about who may jump. The next version of the world contracts changes how those rules attach, and gates aren't in it yet, so I'll build for today and keep notes. I'll explain the payment options in plain English before we choose. Should your tribe always go free?
      note: It explains in plain English, then asks.
    - from: you
      stage: Describe
      text: yes always. pick the simplest payment option
    - from: ai
      stage: Plan
      text: 'Plan: use the builder scaffold''s test world, which comes with two linked gates. Rule one: your tribe jumps free. Rule two: everyone else pays a fixed fee. Then a test jump each way. OK?'
      note: A short plan for you to approve.
    - from: you
      stage: Plan
      text: go for it
    - from: ai
      stage: Build
      text: Building the two rules on the test world now.
      note: The smallest piece first.
    - from: ai
      stage: Prove
      text: Done. A tribe test character jumped free; a stranger was asked to pay first. Here's the record of both jumps.
      note: Proof you can look at yourself.
      proof:
        kind: test
        title: Test jumps
        rows:
        - label: Tribe test character
          value: jumped free
          pass: true
        - label: Stranger
          value: asked to pay first
          pass: true
        footer: 2 of 2 checks passed · on the test world
    - from: ai
      stage: Save
      text: 'Checkpoint saved. Noted: tribe always free, one fixed fee for now, built for the current world contracts.'
    - from: you
      stage: Describe
      text: fee's too high, halve it. and can allies get a discount
      note: Round again.
  storage:
    title: Track my tribe's storage
    messages:
    - from: you
      stage: Describe
      text: our tribe shares storage and stuff keeps going missing. want a page that shows what's in there and who took what. about twenty of us, needs to work on phones. check the EVE Frontier docs for AI and the world contracts first for what's actually visible, and ask me what you need
      note: Who it's for, where it's used, and where to look.
    - from: ai
      stage: Plan
      text: Reading those now. I'd rather tell you what's possible before building something that can't work.
      note: It reads the sources you pointed it at.
    - from: ai
      stage: Plan
      text: What's in a storage unit, and items going in and out, are recorded where anyone can read them. Whether that shows who took them, I'll confirm, and it may change in the next version. In that version, moving items with your own code needs the game's permission, but you only want to watch, so that's fine either way. Public page, or tribe only?
      note: It flags the limits early and honestly.
    - from: you
      stage: Plan
      text: tribe only eventually, but get it working first
    - from: ai
      stage: Plan
      text: 'Plan: one page listing what''s in the builder scaffold''s test storage unit. History and tribe-only access come after you''ve seen it. OK?'
      note: A short plan for you to approve.
    - from: you
      stage: Plan
      text: yep
    - from: ai
      stage: Build
      text: Building the page now.
      note: The smallest piece first.
    - from: ai
      stage: Prove
      text: Here's a private test link. Open it on your phone.
      note: Proof you can look at yourself.
      proof:
        kind: phone
        title: Tribe storage
        rows:
        - label: Fuel
          value: 1,200
        - label: Ammunition
          value: '340'
        - label: Salvage
          value: '58'
        footer: Test storage unit · updated just now
    - from: ai
      stage: Save
      text: 'Checkpoint saved. Noted: read-only for now; tribe-only access is next.'
    - from: you
      stage: Describe
      text: list is good. sort it by item name and make the text bigger
      note: Round again.
  bounty:
    title: Run a bounty board
    messages:
    - from: you
      stage: Describe
      text: want a bounty board. people put a reward on someone's head, whoever kills them gets paid. has to be fair. check the EVE Frontier docs for AI and the world contracts first, how are kills recorded. ask me stuff before you build
      note: Say what matters most, and where to look.
    - from: ai
      stage: Plan
      text: Reading those now. The key question is whether kills are recorded somewhere code can check.
      note: It reads the sources you pointed it at.
    - from: ai
      stage: Plan
      text: 'They are: kills are recorded publicly, and anyone can read them. That record is being reworked in the next version, so I''ll keep the part that reads it separate and easy to change. Paying out fairly is the hard part, so I suggest starting with a board that shows bounties and matching kills, with no real money yet. OK?'
      note: It suggests starting with the safe part.
    - from: you
      stage: Plan
      text: yeah start there
    - from: ai
      stage: Build
      text: Building a page that lists open bounties and checks recent kills against them, with test data first.
      note: The smallest piece first.
    - from: ai
      stage: Prove
      text: 'Here''s a private test link: two test bounties, one marked claimed because a matching kill exists.'
      note: Proof you can look at yourself.
      proof:
        kind: link
        title: Bounty board
        rows:
        - label: Pilot A · reward 5,000
          value: Open
        - label: Pilot B · reward 2,000
          value: Claimed
          pass: true
        footer: Test data · no real money
    - from: ai
      stage: Save
      text: 'Checkpoint saved. Noted: no payouts until we''ve designed them properly; the kill record may change shape.'
    - from: you
      stage: Describe
      text: 'nice. next: how would payouts work without anyone cheating?'
      note: Round again.
  killboard:
    title: Build a killboard
    messages:
    - from: you
      stage: Describe
      text: I want a killboard. who killed who, where, when. anyone can look at it, and free to run. check the EVE Frontier docs for AI and the world contracts first for where kills are recorded. ask me what you need first
      note: Rambling is fine. Tell it where to look.
    - from: ai
      stage: Plan
      text: Reading those now, along with the terms for using the game's data.
      note: It checks the rules as well as the code.
    - from: ai
      stage: Plan
      text: 'Kills are recorded publicly, so this is very doable. The record is being reworked in the next version, so I''ll keep the part that reads it in one place. Plan: one page listing recent kills, newest first, that runs in the browser with no server, so it''s free to host. Just a list for now, or a map too?'
      note: It plans for the change it found.
    - from: you
      stage: Plan
      text: list first, map later. go for it
    - from: ai
      stage: Build
      text: Building the list now.
      note: The smallest piece first.
    - from: ai
      stage: Prove
      text: Here's a private test link with the last fifty kills.
      note: Proof you can look at yourself.
      proof:
        kind: link
        title: Recent kills
        rows:
        - label: Pilot C destroyed Pilot D
          value: 2 min ago
        - label: Pilot E destroyed Pilot F
          value: 9 min ago
        - label: Pilot G destroyed Pilot H
          value: 15 min ago
        footer: Showing 3 of 50
    - from: ai
      stage: Save
      text: 'Checkpoint saved. Noted: reading the kill record lives in one place, so the next version is a small change.'
    - from: you
      stage: Describe
      text: can you add a search box for pilot names
      note: Round again.
  other:
    title: A racetrack
    messages:
    - from: you
      stage: Describe
      text: random one. I want a racetrack. pilots fly a course past checkpoints, it records their times automatically, leaderboard at the end. check the EVE Frontier docs for AI and the world contracts first and tell me honestly if it's possible. ask me questions first
      note: If you can describe it, you can start.
    - from: ai
      stage: Plan
      text: Reading those now, looking for anything that knows where a ship is.
      note: It reads the sources you pointed it at.
    - from: ai
      stage: Plan
      text: 'Honest answer: not possible yet. Nothing today tells the chain where a ship is as it flies, so code can''t see a ship pass a checkpoint. There''s public work on proving locations, so it may come later.'
      note: A good agent tells you when something can't be done.
    - from: ai
      stage: Plan
      text: 'What we could do now: pilots check in at each checkpoint themselves, other racers confirm the times, and a leaderboard ranks them. Start there, and I''ll note the automatic version for later?'
      note: Then it finds what can be done.
    - from: you
      stage: Plan
      text: yeah do that
    - from: ai
      stage: Build
      text: Building a race page with a check-in button per checkpoint and a leaderboard.
      note: The smallest piece first.
    - from: ai
      stage: Prove
      text: Here's a private test link with test times on the leaderboard.
      note: Proof you can look at yourself.
      proof:
        kind: link
        title: Leaderboard
        rows:
        - label: 1. Pilot J
          value: '4:12'
        - label: 2. Pilot K
          value: '4:30'
        - label: 3. Pilot L
          value: '5:02'
        footer: Test times · checked in by hand
    - from: ai
      stage: Save
      text: 'Checkpoint saved. Noted: automatic timing is waiting on location data; check the world contracts for it.'
```
