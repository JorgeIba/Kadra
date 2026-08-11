# Kadra

Kadra is a personal, local-first PWA for keeping up with fixed-income
investments. It gives a person one clear place to see what they own, what it is
worth, what it is earning, how it may grow, and what deserves attention.

## Product Direction

- Mobile-first, especially an installed iPhone PWA
- Personal portfolio visibility designed for brief, repeated check-ins
- Local-only data storage, with no login or third-party tracking
- Downloadable portfolio backups for safe local recovery after reinstalling
- Fixed-income investments first, with MXN as the required MVP currency
- Calm financial information with tactile, occasionally playful interactions
- No institution connections, money movement, or trade execution

## Local Backups

Use **Export backup** from the app menu before reinstalling the PWA. Restoring
that JSON file replaces the current local portfolio after Kadra validates it.
Backup files contain your complete investment history and are not encrypted, so
keep them only in storage you trust.

## Documentation

- [Project plan](./docs/project-plan.md)
- [Product context](./PRODUCT.md)
- [Design system](./DESIGN.md)
- [Brand identity](./docs/brand/README.md)
- [Domain model](./docs/domain-model.md)
