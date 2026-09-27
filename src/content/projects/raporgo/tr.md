---
title: RaporGo
summary: Raporu düz bir JSON dosyası olarak tutan, LLM araçlarının da düzenleyebildiği görsel PDF rapor editörü.
lang: tr
kind: software
status: released
order: 1
logo: ./logo.png
repo: Pandomentall/RaporGo
readme: README.tr.md
readmeLang: tr
tags: [Electron, TypeScript, Paged.js, CLI]
links:
  repo: https://github.com/Pandomentall/RaporGo
  download: https://github.com/Pandomentall/RaporGo/releases/latest
gallery:
  - src: ./01-home.png
    alt: Açılış ekranı ve son raporlar
  - src: ./editor-chart-dark.png
    alt: Editör, koyu tema, grafik düzenleme
  - src: ./06-template-picker.png
    alt: Şablon seçici
  - src: ./11-pdf-exported.png
    alt: Dışa aktarılmış PDF
thumb: ./editor-chart-dark.png
accent: ["#f5a524", "#8cc8ec"]
fx: typing
---

RaporGo, CV oluşturucular gibi çalışan bir rapor editörü: şablon seçiyorsun, segmentleri (başlık, tablo, grafik, akış adımları, uyarı kutusu, görsel) diziyorsun, PDF alıyorsun.

Farkı şurada: rapor uygulamanın içinde kilitli bir durum değil, diskte duran düz bir JSON dosyası. Claude Code, Codex ya da Gemini CLI gibi kod çalıştırabilen her araç raporu tek seferde okuyup düzenleyebiliyor, editör açıkken bile. Editörde gördüğün sayfa ile PDF aynı motordan çıktığı için sayfa kırılmaları da birebir aynı.
