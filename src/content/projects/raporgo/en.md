---
title: RaporGo
summary: A visual PDF report editor that keeps every report as a plain JSON file, so LLM tools can edit it too.
lang: en
kind: software
status: released
order: 1
logo: ./logo.png
repo: Pandomentall/RaporGo
readme: README.md
readmeLang: en
tags: [Electron, TypeScript, Paged.js, CLI]
links:
  repo: https://github.com/Pandomentall/RaporGo
  download: https://github.com/Pandomentall/RaporGo/releases/latest
gallery:
  - src: ./01-home.png
    alt: Home screen with recent reports
  - src: ./editor-chart-dark.png
    alt: Editor in dark theme, editing a chart
  - src: ./06-template-picker.png
    alt: Template picker
  - src: ./11-pdf-exported.png
    alt: Exported PDF
thumb: ./editor-chart-dark.png
accent: ["#f5a524", "#8cc8ec"]
fx: typing
---

RaporGo is a report editor that works like a CV builder: pick a template, arrange segments (headings, tables, charts, flow steps, callouts, images) and export a PDF.

The difference: a report is not state locked inside the app, it is a plain JSON file on disk. Any tool that can run code, such as Claude Code, Codex or Gemini CLI, can read and edit it in one go, even while the editor is open. The editor preview and the PDF come from the same render engine, so page breaks match exactly.
