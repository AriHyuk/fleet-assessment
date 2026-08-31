---
activation: always_on
description: Frontend guidelines for React. Applies when writing frontend code.
---

# Frontend Guidelines

- **TypeScript is Mandatory**: All React components, hooks, utilities, and API files must be written in strict TypeScript (`.ts` or `.tsx`). 
- Do not create `.jsx` or `.js` files for the frontend unless it's a legacy config file (like tailwind or vite config) that specifically requires it.
- **Type Safety**: Avoid using `any`. Create explicit interfaces or types (usually in `src/types.ts`) for data structures, API responses, and Component Props.
- **Styling**: Use Tailwind CSS v4. Stick to modern UI aesthetics with proper dark mode colors and hover transitions.
