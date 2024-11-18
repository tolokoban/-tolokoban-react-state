# @tolokoban/react-state

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
