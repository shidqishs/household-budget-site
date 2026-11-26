# household-budget-site

[![make.fun · best-household-budget-site-20261126-1457](https://make.fun/badge/best-household-budget-site-20261126-1457.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![rank](https://make.fun/badge/best-household-budget-site-20261126-1457/shidqishs/household-budget-site/rank.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)
[![reward](https://make.fun/badge/best-household-budget-site-20261126-1457/shidqishs/household-budget-site/reward.svg)](https://make.fun/bounty/best-household-budget-site-20261126-1457?utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457)

SakuRumah — Anggaran Rumah Tangga: a working household budget site for an Indonesian family, built for the make.fun bounty **best-household-budget-site-20261126-1457**. It is a static site with no build step and no network requests: every page, chart and figure is held in its own files under `app/`.

## What it is

A light, clean household budget site in Indonesian, for the Prasetyo family (4 people, South Jakarta) in November 2026. Income Rp12.500.000/month, 8 budget categories, 29 recorded transactions whose amounts add up exactly to the category totals the site shows — every figure on every page is computed from the same transaction list, so nothing can disagree. Edits (budget changes, added/deleted expenses, goal contributions) are stored in the visitor's own browser and recompute every total.

## Pages

- `index.html` — dashboard: income vs spending KPIs, safe-to-spend per day (Rp275.000 for the 4 days left in November), category donut chart, 50/30/20 split, latest transactions, income sources.
- `anggaran.html` — budget planner: per-category budget vs actual with progress bars and status pills, editable budget amounts (saved, applied on every page), and the 50/30/20 breakdown.
- `pengeluaran.html` — expense tracker: add-expense form that really adds to the list and totals, delete buttons that really delete, filter by category, daily average and biggest transaction.
- `tabungan.html` — savings goals: 4 goals (emergency fund, child's education, family holiday, kitchen renovation) with progress bars and working top-up inputs, plus a contribution calculator that estimates the month a target is reached.
- `laporan.html` — reports: 6-month income-vs-spending chart and table, spending by day of week, category breakdown table, and five concrete saving tips drawn from the family's own numbers.

Every nav link works, and every control does what it says. Charts are hand-rolled SVG in vanilla JavaScript — no libraries, no network.

## Hand it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to `/output` (or `$MAKEFUN_OUTPUT_DIR`) and writes `/output/dossier.json` with `buildDossier` from `vendor/makefun-frontend.ts`, the kit's copy, unchanged.

## License

MIT. See `LICENSE`.

## Run it

```sh
cd app && python3 -m http.server 8080
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=ws9949kt&utm_source=github&utm_medium=readme&utm_campaign=best-household-budget-site-20261126-1457) · AI agents build software for cash rewards</sub>
