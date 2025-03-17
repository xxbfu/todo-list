# 📝 TODO List App

Vítejte v naší interaktivní TODO List aplikaci! Jednoduchý, ale výkonný nástroj pro organizaci vašich úkolů s bonusovou hrou pro oddech. 😎

## ✨ Hlavní funkce

### 📋 Správa úkolů
- **Vytváření úkolů** - Jednoduše přidávejte nové úkoly s detaily a termíny
- **Kategorie úkolů** - Organizujte úkoly do různých kategorií (Prioritní, Práce, Zábava)
- **Barevné označení** - Vizuální odlišení úkolů pomocí vlastních barev
- **Termíny dokončení** - Nastavte termíny a sledujte zpožděné úkoly
- **Detaily úkolů** - Přidejte podrobné informace k vašim úkolům
- **Dokončené úkoly** - Sledujte svůj pokrok v sekci hotových úkolů

### 🎮 Hra Had
- **Prokrastinační režim** - Vyzkoušejte klasickou hru Had, když potřebujete pauzu
- **2-hráčový režim** - Rozsekni nás - soutěžte s kamarádem o to, kdo bude dělat určený úkol
- **Mobilní ovládání** - Hrajte pohodlně i na mobilních zařízeních
- **Jednoduché ovládání** - Na mobilu stačí dvě tlačítka pro každého hráče

### ⚙️ Přizpůsobení
- **Vlastní kategorie** - Vytvářejte a spravujte vlastní kategorie úkolů
- **Tmavý režim** - Přepínejte mezi světlým a tmavým režimem dle potřeby
- **Archivace** - Automatická archivace starých úkolů s nastavitelným intervalem

## 🚀 Jak začít

1. Otevřete soubor `index.html` v libovolném moderním prohlížeči
2. Začněte přidávat své úkoly do kategorie "Prioritní"
3. Organizujte úkoly pomocí kategorií a barev
4. Využijte nastavení pro přizpůsobení aplikace vašim potřebám
5. Dopřejte si přestávku a zahrajte si hru Had kliknutím na tlačítko 🐍

## 💻 Technická dokumentace

### Struktura projektu
```
todo-app/
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   └── games/
│       └── snake.js
└── index.html
```

### Použité technologie
- **HTML5** - Struktura aplikace
- **CSS3** - Stylování a responzivní design
- **JavaScript** - Interaktivita a logika aplikace
- **localStorage API** - Ukládání dat v prohlížeči

### Spuštění aplikace
Aplikaci lze spustit několika způsoby:

1. **Přímé otevření v prohlížeči**
   - Stačí otevřít soubor `index.html` v jakémkoliv moderním prohlížeči

2. **Lokální vývojový server**
   - Pro vývoj a testování můžete použít Python server:
   ```bash
   python3 -m http.server 8008 --bind 0.0.0.0
   ```
   - Aplikace pak bude dostupná na adrese: `http://localhost:8008`

### Datový model
Aplikace ukládá všechna data do lokálního úložiště prohlížeče (localStorage) ve formátu JSON. Hlavní datovou strukturou je objekt `todoList`, který obsahuje:
- Úkoly rozdělené podle kategorií
- Dokončené úkoly
- Archivované úkoly
- Uživatelská nastavení

## 🙏 Poděkování
Tato aplikace byla vytvořena s pomocí Claude, AI asistenta od Anthropic. Všechen kód byl napsán na základě uživatelských požadavků a promptů s cílem vytvořit praktickou, uživatelsky přívětivou a responzivní aplikaci pro správu úkolů.

Aplikace využívá pouze běžné webové technologie bez externích knihoven, což znamená rychlé načítání a jednoduchou údržbu.

---

Vytvořeno s ❤️ pomocí Claude AI
