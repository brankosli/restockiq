# RestockIQ — Korisničko Uputstvo

**Verzija:** 1.0  
**Jezik:** Srpski

---

## Šta je RestockIQ?

RestockIQ je sistem za automatsko praćenje zaliha koji je povezan sa vašim Shopify prodajnim mjestom. Kada zaliha nekog proizvoda padne ispod postavljenog minimuma, sistem automatski šalje obavještenje vašem dobavljaču — WhatsApp poruku sa fotografijom proizvoda ili email sa listom stavki — bez ikakvog ručnog rada sa vaše strane.

**Ključne prednosti:**
- Nikad više ne zaboravite naručiti robu na vrijeme
- Dobavljači odmah vide koji proizvod treba dopuniti, čak i bez poznavanja jezika
- Vi pregledate i odobravate svaki zahtjev prije slanja
- Sve se dešava automatski, 24/7

---

## 1. Podešavanje kompanije (Settings)

Prije svega, unesite podatke o vašoj kompaniji. Ovi podaci će se koristiti na narudžbenicama i dokumentima.

**[SCREENSHOT: Settings-data.png]**

Idite na **Settings** u lijevom meniju i popunite:

| Polje | Opis |
|---|---|
| Company Name | Naziv vaše firme |
| Tax ID / VAT Number | PIB ili PDV broj |
| Address | Adresa sjedišta |
| City / Country | Grad i država |
| Email | Kontakt email firme |
| Phone | Telefon firme |
| Website | Web stranica (opciono) |
| Logo URL | Direktan link do vašeg loga |
| Currency | Valuta koju koristite |
| Default Notes | Napomena na svakoj narudžbenici |

Kliknite **Save Settings** kada završite.

> **Napomena za Logo URL:** Koristite direktan link do slike koji završava sa `.png`, `.jpg` ili `.svg`. Ako niste sigurni kako da dobijete link, kontaktirajte nas.

---

## 2. Dodavanje dobavljača (Vendors)

Dobavljač je kompanija ili osoba od koje naručujete robu. Svaki dobavljač prima obavještenja kada njegova roba dostigne minimalne zalihe.

### Pregled dobavljača

**[SCREENSHOT: Vendors-main.png]**

Na stranici **Vendors** vidite listu svih vaših dobavljača sa:
- **Name** — naziv dobavljača
- **Email** — email adresa
- **Channel** — kanal notifikacije (WhatsApp ili Email)
- **Products** — broj proizvoda dodijeljenih ovom dobavljaču
- **Status** — Active / Inactive

### Dodavanje novog dobavljača

**[SCREENSHOT: Vendors-add.png]**

Kliknite **+ Add vendor** i popunite formu:

| Polje | Opis |
|---|---|
| Name * | Naziv dobavljača (obavezno) |
| Email | Email adresa dobavljača |
| Phone | WhatsApp broj u međunarodnom formatu |
| Notification channel | WhatsApp ili Email |

Kliknite **Create** da sačuvate dobavljača.

> **Važno za WhatsApp:** Broj telefona mora biti u međunarodnom formatu sa pozivnim brojem države:
> - Kina: `+86 138 1234 5678`
> - Srbija: `+381 61 123 4567`
> - Bosna: `+387 61 123 456`

### Editovanje i brisanje

Koristite **Edit** da promijenite podatke ili **Delete** da obrišete dobavljača.

---

## 3. Upravljanje zalihama (Inventory)

**[SCREENSHOT: Inventory.png]**

Stranica **Inventory** prikazuje sve vaše Shopify proizvode i njihovo trenutno stanje zaliha.

### Pregled statusa

| Kartica | Opis |
|---|---|
| **Total** | Ukupan broj praćenih proizvoda |
| **Critical** (crvena) | Zaliha je na minimumu ili ispod |
| **Warning** (narandžasta) | Zaliha je ispod dvostrukog minimuma |
| **OK** (zelena) | Zaliha je uredna |

### Postavljanje minimalnih zaliha

Kliknite na broj u koloni **Min** pored željenog proizvoda i unesite novu vrijednost. Promjena se čuva automatski.

> **Primjer:** Ako prodate prosječno 5 komada sedmično i dobavljač isporučuje za 2-3 sedmice, postavite Min na 15-20.

### Dodjela dobavljača

U koloni **Vendor** kliknite na dropdown i odaberite dobavljača za taj proizvod.

**Važno:** U trenutku dodjele, sistem automatski provjerava da li je zaliha ispod minimuma. Ako jeste, proizvod se odmah pojavljuje u **Restock Orders**.

Ako promijenite dobavljača za neki proizvod, sistem automatski:
- Uklanja proizvod iz narudžbine starog dobavljača
- Dodaje ga u narudžbinu novog dobavljača (ako je stock ispod minimuma)

### Sinhronizacija sa Shopify

Kliknite **Sync now** (gornji desni ugao) da povučete najnovije podatke iz Shopifya.

---

## 4. Restock Orders — Pregled i slanje narudžbina

**[SCREENSHOT: Restock-WhatsApp.png]**

Stranica **Restock Orders** je centralno mjesto gdje pregledavate i šaljete zahtjeve dobavljačima. Svaki dobavljač ima svoj **tab** sa listom proizvoda koji trebaju restok.

### Kako se narudžbina kreira?

Sistem automatski kreira narudžbinu kada:
1. Dodijelite dobavljača proizvodu čija je zaliha ispod minimuma
2. Shopify javi da je stock pao ispod minimuma (prodaja, korekcija)

Sve nadalje kontroliše Shopify — nema potrebe za ručnim pokretanjem.

### Pregled narudžbine

Za svakog dobavljača vidite:
- **Lista proizvoda** sa slikom, nazivom i trenutnim stockom
- **Qty** — predložena količina za naručivanje (možete promijeniti)
- **Preview** — tačan prikaz poruke koju će dobavljač primiti

### WhatsApp narudžbina

**[SCREENSHOT: Restock-WhatsApp.png]**

Kada je dobavljač podešen na **WhatsApp**, preview prikazuje svaki proizvod kao zasebnu poruku sa slikom i količinom — upravo onako kako će dobavljač vidjeti na svom telefonu.

### Email narudžbina

**[SCREENSHOT: Restock-Email.png]**

Kada je dobavljač podešen na **Email**, preview prikazuje formatirani email sa listom svih proizvoda, slikama i količinama.

### Editovanje prije slanja

Prije nego pošaljete možete:
- **Promijeniti Qty** — kliknite na broj i upišite novu vrijednost
- **Ukloniti proizvod** — kliknite × pored proizvoda
- **Dodati napomenu** — unesite tekst u polje ispod liste (pojavljuje se na kraju poruke)

### Slanje

Kliknite **Send to [vendor name]** kada ste zadovoljni. Narudžbina se šalje i nestaje sa liste.

Kliknite **Dismiss** ako ne želite poslati narudžbinu (npr. već ste kontaktirali dobavljača direktno).

> **Napomena:** Nakon slanja, isti proizvodi se neće ponovo pojaviti dok Shopify ne javi novu promjenu zalihe.

---

## 5. Pregled historije obavještenja (Alert Log)

**[SCREENSHOT: Alert-Log.png]**

Na stranici **Alert Log** možete vidjeti historiju svih poslatih obavještenja:

| Kolona | Opis |
|---|---|
| Time | Datum i vrijeme slanja |
| Vendor | Naziv dobavljača koji je primio poruku |
| Channel | Kanal (WhatsApp ili Email) |
| Status | **sent** = uspješno / **failed** = neuspješno |
| Message | Sadržaj poruke |

> Ako vidite **failed** status, kontaktirajte nas — vjerovatno postoji problem sa brojem telefona ili email adresom dobavljača.

---

## Česta pitanja (FAQ)

**Kada dobavljač počne da prima poruke?**
Odmah nakon što dodijelite dobavljača proizvodu čija je zaliha ispod minimuma.

**Može li jedan dobavljač biti dodijeljen više proizvoda?**
Da, jedan dobavljač može biti dodijeljen neograničenom broju proizvoda.

**Šta ako promijenim dobavljača za neki proizvod?**
Sistem automatski premješta proizvod na novog dobavljača i ažurira Restock Orders.

**Mogu li pauzirati obavještenja za određenog dobavljača?**
Da — kliknite **Edit** pored dobavljača i postavite status na Inactive.

**Šta ako dobavljač ne dobije poruku?**
Provjerite Alert Log — ako je status "failed", kontaktirajte nas.

**Da li sistem radi ako nemam interneta?**
Da — sistem radi na serverima i nije zavisan od vašeg lokalnog interneta.

---

## Podrška

Za tehničku podršku ili pitanja kontaktirajte nas na:

**Email:** [vaš kontakt email]  
**WhatsApp:** [vaš kontakt broj]

---

*RestockIQ — Automatizujte restock, fokusirajte se na prodaju.*
