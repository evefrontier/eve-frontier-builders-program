---
duration: 2 min
description: "Two ways to start the same conversation. Pick the one you think gets the better result."
---

# Which would you send?

```pick
by: idea
default: turrets
label: Pick one
strong-first:
- gate
- bounty
- other
right: Yes. It says who it's for and what matters, tells the AI where to look, and asks it to interview you before building. Rambling is fine.
wrong: 'That one sounds thorough, but it leaves the AI guessing: it doesn''t say who it''s for, what matters most, or where to look. You''d get a confident answer built from old information.'
again: Try the other one.
pairs:
  turrets:
    weak: Write me a production-ready Sui Move smart contract so my EVE Frontier turrets don't shoot my tribe. Use best practices and make it secure.
    strong: my turrets keep shooting my tribe mates. I want them to leave my tribe and a list of allies alone and shoot everyone else. I don't code. read the EVE Frontier docs for AI and the world contracts first, including the next version, then ask me questions one at a time before you build anything
  gate:
    weak: Create a complete, professional toll system for my EVE Frontier gate with payments, using the best architecture.
    strong: I want to charge a small fee to use my gate, tribe goes free. no idea how paying works in game. check the EVE Frontier docs for AI and the world contracts first and explain the options in plain English, then ask me what you need to know
  storage:
    weak: Build a full-featured inventory tracking dashboard for EVE Frontier storage with every feature a tribe could need.
    strong: our tribe's shared storage keeps losing stuff. I want a page that shows what's in there and who took what, for about twenty of us, on phones. check the EVE Frontier docs for AI for what's actually visible first, then ask me questions
  bounty:
    weak: Write a secure, fair bounty contract for EVE Frontier that pays out automatically. Make it production quality.
    strong: I want a bounty board where people put a reward on a pilot and whoever kills them gets paid. check the EVE Frontier docs for AI and the world contracts for how kills are recorded first. start without real money, and ask me questions before building
  killboard:
    weak: Build me a professional killboard website for EVE Frontier with all the best features and a great design.
    strong: 'I want a free public killboard: who killed who, where, when. check the EVE Frontier docs for AI and the world contracts for where kills are recorded, keep it cheap to run, and ask me questions before you build anything'
  other:
    weak: Make a racing game for EVE Frontier with automatic timing and a leaderboard. Make it work perfectly.
    strong: 'I want a racetrack: pilots fly past checkpoints, times recorded, a leaderboard. check the EVE Frontier docs for AI and the world contracts for whether anything can see where ships are, tell me honestly if it''s not possible, and suggest what we could do instead'
```
