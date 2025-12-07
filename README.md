# @tolokoban/react-state

## Simple global state

```ts
import AtomicState from "@tolokoban/react-state"

export default {
    language: new AtomicState(navigator.language, {
        storage: {
            id: "language",
            guard: isString,
        },
        transform(value: string) {
            const lang = value.trim().substring(0, 2).toLocaleLowerCase()
            return ["en", "fr"].includes(lang) ? lang : "en"
        },
    }),
    events: {
        list: new AtomicState<TpEvent[] | null>(null),
    },
}

```

## Multi-language

### Setup

In a folder called (for example) `translation`,
create as many translation files as languages you want to provide:

**`translate.fr.ts`**

```ts
import { Translation } from "@tolokoban/react-state";

const FR = {
  greetings: "Bonjour le monde !",
  welcome: "Bienvenue $1."
}

export default FR
```

**`translate.en.ts`**

```ts
import { Translation } from "@tolokoban/react-state";

import FR from "./translation.fr";

const EN: typeof FR = {
  greetings: "Hello world!",
  welcome: "Welcome $1."
}

export default EN
```

**`translate.it.ts`**

```ts
import { Translation } from "@tolokoban/react-state";

import FR from "./translation.fr";

const IT: typeof FR = {
  greetings: "Ciao mondo!",
  welcome: "Benvenuto $1."
}

export default IT
```

**`index.ts`**

```ts
import { useTanslatorGeneric } from "@tolokoban/react-state"

import FR from "./translation.fr"

export function useTranslator() {
    return useTanslatorGeneric(FR, {
        en: () => import("./translation.en"),
        it: () => import("./translation.it"),
    })
}
```

### Usage

```tsx
export function WelcomePage({ name }: { name: string }) {
    const tr = useTanslator()

    return <article>
        <h1>{tr.greetings}</h1>
        <p>{tr.welcome$(name)}</p>
    </article>
}
```
