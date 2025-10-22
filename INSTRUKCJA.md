# Instrukcja uruchomienia projektu dziki-api

1. Sklonuj repozytorium:

```
git clone https://github.com/staafnet/dzikiapi.git
cd dzikiapi
```

2. Zainstaluj zależności:

```
npm install
```

3. Skonfiguruj plik środowiskowy `.env` (jeśli wymagany, na podstawie dokumentacji lub przykładu)

4. Wykonaj migracje bazy danych (jeśli używasz Prisma):

```
npx prisma migrate deploy
```

5. Uruchom serwer developerski:

```
npm run start:dev
```

6. (Opcjonalnie) Uruchom testy:

```
npm test
```

---

**Wymagania:**
- Node.js (zalecana wersja zgodna z package.json)
- npm
- (Opcjonalnie) PostgreSQL lub inna baza danych, jeśli projekt tego wymaga

W razie problemów sprawdź README.md lub napisz do autora repozytorium.
