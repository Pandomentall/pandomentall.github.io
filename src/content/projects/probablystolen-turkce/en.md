---
title: Probably Stolen Turkish Patch
summary: All of the game's text in Turkish; 6,681 lines, 49,061 words. Runs on the official mod system, one click from the Steam Workshop.
lang: en
kind: localization
status: released
order: 2
monogram: { text: PS, color: "#e8b93c" }
repo: Pandomentall/ProbablyStolenTurkceYama-Kurulum
readme: README.md
readmeLang: tr
tags: [Localization, C# mod, Steam Workshop]
links:
  repo: https://github.com/Pandomentall/ProbablyStolenTurkceYama-Kurulum
  site: https://pandomentall.github.io/ProbablyStolenTurkceYama-Kurulum/
  steam: https://steamcommunity.com/sharedfiles/filedetails/?id=3829169438
  download: https://github.com/Pandomentall/ProbablyStolenTurkceYama-Kurulum/releases/latest
thumb: ./thumb.png
accent: ["#e8b93c", "#4fc6c9"]
fx: matrix
---

Probably Stolen is a cyberpunk shopkeeping sim on a dystopian space station where you craft, trade and smuggle goods of questionable origin. It has no Turkish language option, and its mod system only translates a mod's own strings, so the patch is a C# mod that swaps the English tables for Turkish in memory while the game runs. It never touches the game files or the saves.

I extracted the text from the game's localization tables, translated it part by part against a terminology glossary and ran every line through placeholder, tag and line-break checks. The game's font has no Turkish letters, so the patch swaps in a suitable one, and uppercase headings are capitalised with Turkish rules beforehand so ı/i survive. The patch is free and published on the Steam Workshop and GitHub.
