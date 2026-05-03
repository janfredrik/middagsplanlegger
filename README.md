# Middagsplanlegger

En mobilvennlig webapp for handleliste og middagsplanlegger. Ekstrahert fra [familieplanlegger](https://github.com/janfredrik/familieplanlegger) — kun de to relevante funksjonene, med egen dataisolasjon via en separat PocketBase-instans.

Bygget med React 19, TypeScript, Tailwind CSS og PocketBase.

## Funksjoner

| Fane | Beskrivelse |
|------|-------------|
| **🛒 Handleliste** | Gruppert etter kategori med emoji-ikoner. Auto-gjetting av kategori basert på varenavn. Kryss av når ting er kjøpt. Tagg-system (Trippel Trumf, Nå, Tilbud). |
| **🍽️ Middag** | Middagsbibliotek med ingredienser, kategorier og ukeplanlegger. Eksporter ingredienser direkte til handlelisten. Filtrer på kategori (asiatisk, fisk, italiensk osv.). |

Real-time synkronisering på tvers av enheter via PocketBase WebSockets. PWA-støtte (kan installeres på mobil).

---

## Kom i gang

### 1. PocketBase-oppsett

Last ned og start [PocketBase](https://pocketbase.io), eller bruk Docker-oppsettet nedenfor.

Opprett disse **6 collections** i PocketBase Admin (`http://din-server:8090/_/`):

#### `family_members`
| Felt | Type | Påkrevd |
|------|------|---------|
| `name` | Text | ✅ |
| `avatar_color` | Text | ✅ |
| `email` | Email | ❌ |

#### `shopping_categories`
| Felt | Type | Påkrevd |
|------|------|---------|
| `name` | Text | ✅ |
| `emoji` | Text | ✅ |
| `sort_order` | Number | ✅ |

Legg til disse radene som seed-data:

| sort_order | name | emoji |
|---|---|---|
| 1 | frukt & grønt | 🥦 |
| 2 | meieri | 🥛 |
| 3 | kjøtt & fisk | 🥩 |
| 4 | brød & bakevarer | 🍞 |
| 5 | pålegg og tilbehør | 🧀 |
| 6 | saus, dressing, krydder | 🫙 |
| 7 | tørrvarer og hermetikk | 🫘 |
| 8 | snacks | 🍿 |
| 9 | frys | 🧊 |
| 10 | drikke | 🧃 |
| 11 | helse og hygiene | 🧴 |
| 12 | renhold | 🧹 |
| 13 | Annet | 📦 |

#### `shopping_items`
| Felt | Type | Påkrevd | Notat |
|------|------|---------|-------|
| `name` | Text | ✅ | |
| `quantity` | Text | ❌ | |
| `checked` | Bool | ✅ | Standard: false |
| `category` | Relation → shopping_categories | ✅ | |
| `added_by` | Relation → family_members | ✅ | |
| `tags` | JSON | ❌ | Array, f.eks. `["trumf","naa"]` |

Aktiver **real-time** på denne collectionen.

#### `meals`
| Felt | Type | Påkrevd |
|------|------|---------|
| `name` | Text | ✅ |
| `description` | Text | ❌ |
| `category` | Text | ❌ |

Aktiver **real-time**.

#### `meal_ingredients`
| Felt | Type | Påkrevd |
|------|------|---------|
| `meal` | Relation → meals | ✅ |
| `name` | Text | ✅ |
| `quantity` | Text | ❌ |
| `category` | Relation → shopping_categories | ❌ |

Aktiver **real-time**.

#### `meal_plan`
| Felt | Type | Påkrevd | Notat |
|------|------|---------|-------|
| `date` | Text | ✅ | Format: `YYYY-MM-DD` |
| `meal` | Relation → meals | ✅ | |

Aktiver **real-time**.

#### API-regler

For alle 6 collections: sett **alle API-regler** (List, View, Create, Update, Delete) til tom streng `""` — dette tillater alle uten autentisering (tillitsbasert modell).

I PocketBase Admin → Collection → API Rules → sett alle til `""`.

#### Brukere

Legg til familiemedlemmer i `family_members`-collectionen via PocketBase Admin. Minimum:
- `name`: f.eks. `"Mamma"`
- `avatar_color`: hex-farge, f.eks. `"#10b981"`

---

### 2. Kjør med Docker

```bash
# Klon repoet
git clone https://github.com/DITT_BRUKERNAVN/middagsplanlegger.git
cd middagsplanlegger

# Kopier og tilpass docker-compose.yml
# - Oppdater volum-stien til hvor du vil lagre dataene
# - Oppdater port om 3200 er opptatt

docker compose up -d
```

Appen er nå tilgjengelig på `http://din-server:3200`.
PocketBase Admin er på `http://din-server:3200/_/`.

**Bygg selv:**
```bash
docker build -t middagsplanlegger .
docker run -p 3200:8090 -v /sti/til/data:/pb/pb_data middagsplanlegger
```

---

### 3. Lokal utvikling

```bash
npm install
```

Oppdater proxy-target i `vite.config.ts` til din lokale PocketBase-URL:
```ts
'/_pb': {
  target: 'http://localhost:8090',  // eller der PocketBase kjører
  rewrite: (path) => path.replace(/^\/_pb/, ''),
},
```

```bash
npm run dev
```

Appen kjører på `http://localhost:5173`.

```bash
npm run build   # Bygg for produksjon
npm test        # Kjør tester
```

---

## Miljøvariabler

| Variabel | Standard | Beskrivelse |
|---|---|---|
| `VITE_PB_URL` | `window.location.origin` | PocketBase-URL. Trengs bare hvis PocketBase kjører separat fra frontend. |

I produksjon (PocketBase server frontend) trenger du ingen miljøvariabler.

For utvikling mot ekstern PocketBase:
```bash
VITE_PB_URL=http://min-server:8090 npm run dev
```

---

## Teknologi

- **React 19** med TypeScript
- **Vite** (build + dev server)
- **Tailwind CSS v4** (styling)
- **PocketBase** (backend, database, real-time API)
- **PWA** (service worker, installerbar på mobil)
