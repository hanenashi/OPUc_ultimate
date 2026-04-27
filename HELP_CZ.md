# OPUc Ultimate — česká nápověda (generováno ChatGPTem)

OPUc Ultimate je rozšíření pro Okoun, které napojí obrázkový hosting `opu.peklo.biz` přímo do odpovědního pole na `okoun.cz`.

Jinými slovy: nemusíš ručně otevírat OPU, uploadovat obrázek, kopírovat URL a vkládat ho zpět do příspěvku. OPUc tohle peklo zkrátí na pár kliknutí.

---

## 1. Instalace

Potřebuješ prohlížeč s podporou userscriptů:

- Tampermonkey
- Violentmonkey
- Greasemonkey

Instalace:

1. Otevři instalační odkaz:
   (https://github.com/hanenashi/OPUc_ultimate/raw/main/OPUc.user.js)
2. Userscript manager nabídne instalaci skriptu.
3. Potvrď instalaci.
4. Otevři Okoun klub.
5. U odpovědního pole by se mělo objevit tlačítko OPUc. Levý čudlík myši/poklep na founu na OPUc vyvolá výběr obrázku pro nahrání/OPU galerii. (Nechá se nastavit v Settings, které se vyvolají pravým čudlíkem/podržením prstu na mobilu na OPUcu.)

Poznámka: instalovaný skript je hlavně loader. Skutečné moduly si natahuje z GitHubu, takže při aktualizaci repozitáře se nemusí pokaždé ručně přeinstalovávat celé monstrum. Ano, je to živé. Ano, může to kousnout.

---

## 2. Kde OPUc funguje

OPUc běží hlavně na stránkách Okounu:

- posílání příspěvků
- odpovědi

Registrovaný OPU uživatel má k dispozici nahrávání více obrázků najednou a svoji OPU galerii. Anon/id bez OPU účtu může nahrát právě jeden soubor na každé použití OPUcu.

---

## 3. Základní použití

### Upload jednoho obrázku

1. Otevři klub na Okounu.
2. Klikni na Přispět nebo Odpovědět
3. Klikni na tlačítko OPUc.
4. Vyber obrázek z počítače.
5. Obrázek se objeví ve staging ribbonu. (Při vypnutém staging ribbonu se rovnou nahraje a hotový kód se vloží do odpovědi.) 
6. Klikni na `Upload`.
7. OPUc nahraje obrázek na OPU a vloží hotový kód do odpovědi.

Pak už příspěvek normálně odešleš na Okounu.

---

## 4. Vkládání obrázků

OPUc umí chytat obrázky několika způsoby:

### Přes tlačítko

Klikneš na OPUc tlačítko a vybereš soubor.

### Přetažením myší

Obrázek můžeš přetáhnout přímo na odpovědní pole.

### Ze schránky

Když máš obrázek ve schránce, můžeš použít nastavenou klávesovou zkratku. Výchozí zkratka je:

`Alt+V`

V nastavení se dá změnit třeba na `Ctrl+V`, ale pozor: tím můžeš přepsat běžné vkládání textu. Klasika — pohodlí za cenu malého chaosu.

---

## 5. Staging ribbon

Staging ribbon je pás s připravenými obrázky před uploadem.

U každého obrázku vidíš:

- náhled
- název souboru
- velikost souboru
- rozlišení
- checkbox pro zařazení/vyřazení z uploadu
- tlačítko pro popisek/styl
- tlačítko pro crop/resize
- tlačítko pro odstranění

Obrázky můžeš také přetahovat myší a měnit jejich pořadí.

---

## 6. Výběr obrázků pro upload

Každý obrázek má checkbox.

- zaškrtnuto = obrázek se nahraje
- odškrtnuto = obrázek zůstane ve frontě, ale upload ho přeskočí

To se hodí, když naházíš víc obrázků najednou a pak si rozmyslíš, co vlastně chceš poslat. Což je normální. Mozek není dávkový procesor.

---

## 7. Tlačítka ve staging ribbonu

### Clear

Vyčistí celou frontu.

Použít, když se všechno pokazilo nebo když ses rozhodl, že ten obrázek sýkory z roku 2019 fakt nikdo nepotřebuje.

### Preview

Ukáže náhled kódu, který by se vložil do příspěvku.

Dobré před uploadem, pokud řešíš HTML / Markdown / Radeox nebo vlastní popisky.

### Optimize

Zmenší vybrané obrázky podle nastavení `Manual Optimize Target`.

Výchozí hodnota je obvykle kolem `2500 px` na delší hraně.

### Upload

Nahraje vybrané obrázky na OPU a vloží výsledný kód do odpovědního pole.

---

## 8. Crop & Resize editor

Na každém obrázku je tlačítko nůžek.

Tím otevřeš editor, kde můžeš:

- oříznout obrázek
- změnit rámování
- upravit velikost
- připravit menší verzi před uploadem

Po úpravě se ve frontě použije upravený soubor. Pokud je dostupné tlačítko zpět, můžeš se vrátit k původnímu obrázku.

---

## 9. Popisky a styl obrázku

Tlačítko tužky u obrázku otevře editor souboru.

Tam můžeš nastavit:

- popisek obrázku
- styl vložení jen pro tento konkrétní obrázek

Styl může být například:

- čistá URL
- obrázek
- odkaz
- klikací náhled

Pokud necháš styl prázdný, použije se globální nastavení.

---

## 10. Galerie OPU

OPUc obsahuje i plovoucí OPU galerii.

Slouží k procházení už dříve nahraných obrázků a jejich vložení do příspěvku.

V nastavení můžeš změnit velikost náhledů galerie:

- 80 px
- 100 px
- 150 px
- 200 px

---

## 11. Nastavení

Nastavení otevřeš přes OPUc UI.

### Appearance / Vzhled

#### Replace Main Button with NSKAL Icon

Nahradí hlavní tlačítko ikonou NSKAL.

Pro lidi, kteří mají rádi, když software vypadá jako něco, co uteklo z dílny.

#### Button Position in Row

Pozice tlačítka v řádku:

- vlevo
- uprostřed
- vpravo

#### UI Theme

Dostupná témata:

- Okoun Classic
- Night Mode
- High Contrast
- Retro 8-Bit

#### Mobile UI Scale

Zvětšení nebo zmenšení UI:

- 80 %
- 100 %
- 125 %
- 150 %

Hodí se hlavně na mobilu nebo na displejích, kde jsou tlačítka mikroskopická.

---

## 12. Nastavení chování

### Force Upload Format

Vynucený formát uploadu:

- zachovat původní formát
- převést na JPEG
- převést na WEBP

JPEG je vhodný pro fotky. WEBP bývá menší. PNG nech jen tam, kde dává smysl, například screenshoty nebo průhlednost.

Pozor: při převodu průhledného PNG na JPEG se průhlednost vyplní bílým pozadím.

### Primary Button Click

Co udělá hlavní kliknutí na tlačítko:

- otevře výběr souboru
- otevře OPU galerii

### Enable Staging Ribbon

Zapne nebo vypne staging ribbon.

Bez ribbonu je práce rychlejší, ale méně kontrolovatelná. Takže něco za něco.

### Intercept Drag & Drop

Povolí chytání obrázků přetažených na odpovědní pole.

### Clipboard Shortcut

Zkratka pro vložení obrázku ze schránky.

Výchozí:

`Alt+V`

### Leech URLs on Standard Paste

Když je zapnuto, OPUc se pokusí při běžném paste zpracovat vložené URL obrázků.

Vypnuto je bezpečnější. Zapnuto je pohodlnější. Vyber si svého démona.

---

## 13. Zmenšování obrázků

OPUc má několik druhů zmenšování.

### Auto-Downscale on Ingestion

Zmenší obrázek hned při vložení do fronty.

Příklad:

`3000`

Znamená: delší strana obrázku bude maximálně 3000 px.

Hodnota:

`0`

znamená vypnuto.

Tohle je dobré pro obří fotky z foťáku, které by jinak mohly zatopit browseru. (Obří fotky spolehlivě shoděj kiwi browser při pokusu o nahrání editoru.)

### Manual Optimize Target

Cílová velikost pro tlačítko `Optimize`.

Příklad:

`2500`

Znamená: po kliknutí na Optimize se vybrané obrázky zmenší tak, aby delší hrana byla maximálně 2500 px.

### Global Auto-Resize

Globální fyzické zmenšení před uploadem.

Příklady:

- `100%` — beze změny
- `50%` — poloviční velikost
- `800x` — šířka 800 px, výška se dopočítá
- `x600` — výška 600 px, šířka se dopočítá
- `800x600` — natvrdo 800×600

Pozor u `800x600`: může změnit poměr stran, pokud obrázek nemá stejný poměr. Používat jen když víš, proč to děláš. Nebo když chceš hranaté ptáky.

---

## 14. Formát vložení do příspěvku

OPUc umí vkládat obrázky v různých syntaxích.

### Format / Syntax

- Auto-detect from Form
- Text / Plain
- HTML
- Radeox
- Markdown

Nejbezpečnější volba je:

`Auto-detect from Form`

OPUc se pokusí poznat, jaký formát má aktuální odpovědní pole na Okounu.

### Style / Tag Type

- Pure URL
- Image
- Link
- Linked Thumbnail

#### Pure URL

Vloží jen adresu obrázku.

#### Image

Vloží obrázek přímo.

#### Link

Vloží odkaz.

#### Linked Thumbnail

Vloží náhled, který vede na plný obrázek.

---

## 15. HTML width atribut

Nastavení:

`Inject HTML width="..." attribute`

Příklady:

- `500`
- `100%`
- prázdné pole = nevkládat width

Funguje hlavně pro HTML výstup.

Pozor: tohle mění zobrazenou velikost v příspěvku, ne nutně fyzickou velikost nahraného obrázku. Fyzickou velikost řeší resize/optimize.

---

## 16. Popisky

### Caption Position

Kam se dá popisek:

- pod obrázek
- nad obrázek
- do `title/alt` atributu obrázku

### Caption Spacing

Mezera mezi obrázkem a popiskem:

- jeden řádek
- dva řádky
- mezera v řádku
- žádná mezera

### Spacing BETWEEN uploads

Mezera mezi více nahranými obrázky:

- jeden řádek
- dva řádky
- mezera v řádku
- žádná mezera

---

## 17. Doporučené nastavení

### Bezpečný normální režim

Dobré pro běžné používání:

- Staging Ribbon: zapnuto
- Drag & Drop: zapnuto
- Clipboard Shortcut: `Alt+V`
- Leech URLs on Ctrl+V: vypnuto
- Format: Auto-detect
- Style: Image
- Auto-Downscale on Ingestion: `3000`
- Manual Optimize Target: `2500`
- Global Auto-Resize: `100%`
- Force Upload Format: Original nebo JPEG

### Režim pro obří fotky z foťáku

- Auto-Downscale on Ingestion: `3000`
- Manual Optimize Target: `2500`
- Force Upload Format: JPEG
- Global Auto-Resize: `100%`

Tím se fotky zmenší bez toho, aby ses pokaždé ručně pral s každým souborem.

### Režim pro screenshoty

- Force Upload Format: Original
- Global Auto-Resize: `100%`
- Style: Image nebo Linked Thumbnail

U screenshotů často nechceš JPEG, protože rozmaže text.

---

## 18. Časté problémy

### Tlačítko OPUc se neukazuje

Zkontroluj:

1. Je userscript zapnutý?
2. Jsi na stránce Okounu, kde je odpovědní pole?
3. Má userscript manager povolené spouštění na `okoun.cz`?
4. Nezablokoval prohlížeč načítání skriptů z GitHubu?
5. Zkus reload stránky.

### Upload nefunguje

Zkontroluj:

1. Funguje `opu.peklo.biz` normálně v prohlížeči?
2. Nejsi odhlášený?
3. Není obrázek extrémně velký?
4. Zkus `Optimize`.
5. Otevři konzoli prohlížeče přes F12 a podívej se na chyby.

### Vložený kód vypadá divně

Zkontroluj:

1. Nastavení `Format`.
2. Nastavení `Style`.
3. Jestli Okoun odpovědní pole nepoužívá jinou syntaxi, než čekáš.
4. Zkus `Preview` před uploadem.

### Obrázek je moc velký v příspěvku

Použij jedno z toho:

- fyzicky zmenšit přes `Optimize`
- nastavit `Global Auto-Resize`
- nastavit HTML `width`

Neplést dohromady:

- resize = mění skutečný soubor
- width atribut = mění jen zobrazení

### Mobilní UI je moc malé

V nastavení změň:

`Mobile UI Scale`

na `125%` nebo `150%`.

---

## 19. Pro pokročilé

OPUc je rozdělený do modulů:

- logger
- konfigurace
- téma
- UI
- interceptory
- editor/fronta
- API/upload
- galerie
- init
- settings
- image processor

Když se něco rozbije, nejrychlejší diagnostika je:

1. otevřít Developer Tools
2. jít do Console
3. reload stránky
4. sledovat hlášky OPUc

Logování se dá upravit v modulu loggeru.

---

## 20. Rychlý tahák

### Chci jen nahrát obrázek

1. Klikni OPUc
2. Vyber obrázek
3. Klikni Upload
4. Hotovo

### Chci nahrát víc obrázků

1. Naházej je do staging ribbonu
2. Seřaď přetažením
3. Odškrtni ty, které nechceš
4. Preview
5. Upload

### Chci fotku zmenšit

1. Přidej fotku
2. Klikni Optimize

nebo:

1. Klikni nůžky
2. Ořízni / zmenši ručně
3. Ulož
4. Upload

### Chci popisek

1. Klikni tužku u obrázku
2. Napiš popisek
3. Ulož
4. Upload

---

## 21. Slovníček

### OPU

Obrázkový hosting `opu.peklo.biz`.

### Okoun

Diskuzní server `okoun.cz`.

### Userscript

Malý skript běžící v prohlížeči přes Tampermonkey / Violentmonkey / Greasemonkey.

### Staging ribbon

Fronta obrázků připravených k uploadu.

### Optimize

Zmenšení obrázku před uploadem.

### Crop

Ořez obrázku.

### Syntax

Formát vloženého kódu, například HTML, Markdown nebo Radeox.

---

## 22. Bezpečnost a soukromí

OPUc pracuje s obrázky v prohlížeči a nahrává je na OPU.

Před uploadem mysli na:

- osobní fotky
- SPZ auta
- adresy
- screenshoty s citlivými údaji

---

## 23. Když se to celé chová divně

Zkus toto:

1. reload stránky
2. vypnout/zapnout userscript
3. vyčistit nastavení skriptu v Tampermonkey/Violentmonkey
4. zkusit jiný prohlížeč
5. otevřít konzoli F12 a zkopírovat chybu

Při hlášení chyby se hodí dodat:

- prohlížeč
- userscript manager
- stránku Okounu, kde se to stalo
- co jsi dělal
- co se mělo stát
- co se stalo místo toho
- chybovou hlášku z konzole

---

## 24. Stav projektu

OPUc Ultimate je aktivně vyvíjený nástroj. Některé funkce jsou silné, některé mohou být náladové.

Když se chová jako bestie, není to bug. Je to charakter. Ale bug report stejně pomůže.
