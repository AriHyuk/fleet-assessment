---
activation: always_on
description: Business logic rules for Fleet & Rental System — overlap validation and discount calculation. Non-negotiable, applies to any backend code touching bookings.
---

# Business Logic Rules — Fleet & Rental System

These rules override your default judgment on how to implement rental overlap validation and discount calculation. Do not "simplify" or "optimize" these formulas — they encode business decisions already made, not implementation suggestions.

## 1. Overlap Check — exact formula

Two date ranges overlap if and only if:

```
existing.tanggal_mulai <= new.tanggal_selesai
AND existing.tanggal_selesai >= new.tanggal_mulai
```

Do NOT implement this as a "point-in-range" check (e.g. checking if new.start falls between existing.start and existing.end). That approach misses containment cases (one range fully inside another) and is a known source of bugs. Use the interval-overlap formula above, derived from negating the non-overlap condition.

**Policy: inclusive boundaries.** The same calendar date cannot be booked twice for the same unit. There is no time-of-day granularity in this system (only dates), so `<=` / `>=` are correct — do not switch to strict `<` / `>`.

**Where this must live:** in a service or repository layer method (e.g. `BookingService::hasOverlap()` or equivalent), called before any booking INSERT. Never rely on frontend validation alone — frontend checks are UX sugar, not the source of truth.

**Exclusion:** the query must exclude the booking being edited (if this is an update flow) from comparing against itself. If a `status` field exists and cancelled bookings are implemented, exclude `status = 'cancelled'` from the conflict query. Do not invent a status/cancellation flow if one was not explicitly requested — check `docs/BUILD_PLAN.md` scope first.

**On conflict:** reject with a clear, specific error message (not a generic 500) stating the unit is unavailable for the requested date range. Use HTTP 422 or 409 consistently across the API — pick one and do not mix.

## 2. Duration Calculation

```
durasi_hari = tanggal_selesai - tanggal_mulai + 1
```

Inclusive on both ends (a booking from day 1 to day 1 = 1 day, not 0). This must be consistent with how overlap boundaries are treated — do not introduce a different date-math convention elsewhere in the codebase.

## 3. Discount Calculation — exact formula

```
if durasi_hari > 7:
    total_harga = harga_sebelum_diskon * 0.9   # 10% off
else:
    total_harga = harga_sebelum_diskon
```

Where `harga_sebelum_diskon = unit.harga_sewa_per_hari * durasi_hari`.

The threshold is strictly greater than 7 (a 7-day rental does NOT get the discount; an 8-day rental does). Do not round the discount or introduce tiered discounts — this is a flat 10% cutoff, nothing more.

Store `harga_sebelum_diskon`, `diskon_persen`, and `total_harga` as separate fields on the booking record — do not store only the final total. The breakdown must be reconstructable without recalculating from the unit's current price (which may change later).

## 4. General Constraints

- All business logic above lives in PHP backend (service layer), never duplicated as the source of truth in React. React may mirror the calculation for instant UI preview, but the backend value is authoritative and must be recalculated server-side on submit, ignoring any total sent from the client.
- Do not add authentication, booking cancellation, or DB-level row locking unless explicitly asked — see `docs/BUILD_PLAN.md` section 6 (Out of Scope).
- When generating tests or seeders involving bookings, always include at least one case for each: partial overlap from the left, partial overlap from the right, full containment (new range inside existing), full containment (existing inside new), edge-touching (same boundary date), and a genuinely non-overlapping case. A seeder or test suite missing containment or edge-touching cases is incomplete.
