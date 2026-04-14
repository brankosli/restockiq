# RestockIQ — Korisničko Uputstvo

**Verzija:** 1.0  
**Jezik:** Srpski

---

## Šta je RestockIQ?

RestockIQ je sistem za automatsko praćenje zaliha koji je povezan sa vašim Shopify prodajnim mjestom. Kada zaliha nekog proizvoda padne ispod postavljenog minimuma, sistem automatski šalje WhatsApp poruku vašem dobavljaču (vendoru) sa fotografijom proizvoda i trenutnim stanjem zaliha — bez ikakvog ručnog rada sa vaše strane.

**Ključne prednosti:**
- Nikad više ne zaboravite naručiti robu na vrijeme
- Dobavljači odmah vide koji proizvod treba dopuniti, čak i bez poznavanja jezika
- Sve se dešava automatski, 24/7

---

## 1. Podešavanje kompanije (Settings)

Prije svega, unesite podatke o vašoj kompaniji. Ovi podaci će se koristiti na narudžbenicama i dokumentima.

**[SCREENSHOT: Settings]**

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
| Logo URL | Link do vašeg loga (npr. sa vaše web stranice) |
| Currency | Valuta koju koristite |
| Default Notes | Napomena koja se prikazuje na svakoj narudžbenici |

Kliknite **Save Settings** kada završite.

> **Napomena:** Za Logo URL koristite direktan link do slike (završava sa `.png`, `.jpg` ili `.svg`). Ako niste sigurni kako da dobijete link, kontaktirajte nas.

---

## 2. Dodavanje dobavljača (Vendors)

Dobavljač (vendor) je kompanija ili osoba od koje naručujete robu. Svaki dobavljač prima WhatsApp obavještenja kada njegova roba dostigne minimalne zalihe.

### Pregled dobavljača

**[SCREENSHOT: Vendors-main]**

Na stranici **Vendors** vidite listu svih vaših dobavljača sa:
- **Name** — naziv dobavljača
- **Email** — email adresa
- **Channel** — kanal notifikacije (WhatsApp)
- **Products** — broj proizvoda koji su dodijeljeni ovom dobavljaču
- **Status** — Active / Inactive

### Dodavanje novog dobavljača

**[SCREENSHOT: Vendors-add]**

Kliknite **+ Add vendor** i popunite formu:

| Polje | Opis |
|---|---|
| Name * | Naziv dobavljača (obavezno) |
| Email | Email adresa dobavljača |
| Phone | WhatsApp broj u međunarodnom formatu (npr. `+8613812345678` za Kinu) |
| Notification channel | Odaberite **WhatsApp** |

Kliknite **Create** da sačuvate dobavljača.

> **Važno za WhatsApp:** Broj telefona mora biti u međunarodnom formatu sa pozivnim brojem države. Primjeri:
> - Kina: `+86 138 1234 5678`
> - Srbija: `+381 61 123 4567`
> - Bosna: `+387 61 123 456`
>
> Dobavljač mora imati instaliran WhatsApp na tom broju da bi primao poruke.

### Editovanje i brisanje

Koristite **Edit** da promijenite podatke dobavljača ili **Delete** da ga obrišete. Dobavljača koji je dodijeljen proizvodima nije moguće obrisati dok god ima aktivnih dodjela.

---

## 3. Upravljanje zalihama (Inventory)

**[SCREENSHOT: Inventory]**

Stranica **Inventory** prikazuje sve vaše Shopify proizvode i njihovo trenutno stanje zaliha.

### Pregled statusa

Na vrhu stranice vidite sažetak:

| Kartica | Opis |
|---|---|
| **Total** | Ukupan broj praćenih proizvoda |
| **Critical** (crvena) | Zaliha je na minimumu ili ispod |
| **Warning** (narandžasta) | Zaliha je ispod dvostrukog minimuma |
| **OK** (zelena) | Zaliha je uredna |

### Tabela proizvoda

Svaki red prikazuje:
- **Product** — naziv i varijanta proizvoda (boja, veličina i sl.) sa slikom
- **SKU** — kataloški broj
- **Stock** — trenutna zaliha (crvena = kritično, narandžasta = upozorenje, zelena = OK)
- **Min** — minimalni prag zalihe koji možete promijeniti direktno u tabeli
- **Vendor** — dodijeljeni dobavljač

### Postavljanje minimalnih zaliha

Kliknite na broj u koloni **Min** pored željenog proizvoda i unesite novu vrijednost. Promjena se čuva automatski.

> **Primjer:** Ako prodate prosječno 5 komada sedmično, postavite Min na 10-15 da imate reserve za 2-3 sedmice isporuke.

### Dodjela dobavljača

U koloni **Vendor** kliknite na dropdown i odaberite dobavljača za taj proizvod. Od tog trenutka, taj dobavljač će primati WhatsApp obavještenja kada zaliha padne ispod minimuma.

### Sinhronizacija sa Shopify

Kliknite **Sync now** (gornji desni ugao) da povučete najnovije podatke o zalihama sa vašeg Shopify prodajnog mjesta. Ovo je korisno ako ste ručno mijenjali zalihe u Shopifyu.

> **Napomena:** Sistem automatski prima obavještenja od Shopifya kada se zaliha promijeni (prodaja, povrat, korekcija). Ručna sinhronizacija obično nije potrebna.

---

## 4. Kako funkcionišu obavještenja?

Sistem automatski šalje WhatsApp poruku dobavljaču kada:

1. Zaliha nekog proizvoda padne **ispod postavljenog minimuma**
2. Prošlo je **najmanje 24 sata** od posljednjeg obavještenja za isti proizvod

Poruka sadržava:
- Naziv i fotografiju proizvoda
- Trenutnu zalihu
- Minimalni prag
- Zahtjev za hitnim restockom

**Primjer poruke:**
```
⚠️ Low Stock Alert — RestockIQ

Hi [Naziv dobavljača],

[Naziv proizvoda]
Current stock: 3
Minimum stock: 10

Please restock as soon as possible.
```

---

## 5. Pregled historije obavještenja (Alert Log)

**[SCREENSHOT: Alert-Log]**

Na stranici **Alert Log** možete vidjeti historiju svih poslatih obavještenja:

| Kolona | Opis |
|---|---|
| Time | Datum i vrijeme slanja |
| Vendor | Naziv dobavljača koji je primio poruku |
| Channel | Kanal (WhatsApp) |
| Status | **sent** = uspješno poslato / **failed** = neuspješno |
| Message | Sadržaj poruke |

U gornjem desnom uglu vidite ukupan broj poslatih i neuspješnih poruka.

> Ako vidite **failed** status, kontaktirajte nas — vjerovatno postoji problem sa brojem telefona dobavljača.

---

## Česta pitanja (FAQ)

**Kada dobavljač počne da prima poruke?**
Odmah nakon što dodijelite dobavljača proizvodu i zaliha tog proizvoda bude ispod postavljenog minimuma.

**Može li jedan dobavljač biti dodijeljen više proizvoda?**
Da, jedan dobavljač može biti dodijeljen neograničenom broju proizvoda. Dobijaće posebnu poruku za svaki proizvod čija zaliha padne ispod minimuma.

**Može li više dobavljača biti dodjeljeno jednom proizvodu?**
Trenutno jedan proizvod može imati jednog dobavljača. Ovo je planirano za buduće verzije.

**Šta ako dobavljač ne dobije poruku?**
Provjerite da li je broj telefona ispravan i u međunarodnom formatu. Provjerite Alert Log da vidite da li je poruka označena kao "sent" ili "failed". Ako je "failed", kontaktirajte nas.

**Da li sistem radi ako nemam interneta?**
Sistem radi na serverima i nije zavisan od vašeg interneta. Jedino je potrebno da Shopify može da šalje podatke o promjenama zaliha.

**Mogu li pauzirati obavještenja za određenog dobavljača?**
Da, kliknite **Edit** pored dobavljača i deaktivirajte ga postavljanjem statusa na Inactive.

---

## Podrška

Za tehničku podršku ili pitanja kontaktirajte nas na:

**Email:** [vaš kontakt email]  
**WhatsApp:** [vaš kontakt broj]

---

*RestockIQ — Automatizujte restock, fokusirajte se na prodaju.*
