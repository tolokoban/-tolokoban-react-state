import React from "react"

export interface AtomicStateStorageOptions<T> {
    id: string
    guard: (data: unknown) => data is T
}

export interface AtomicStateOptions<T> {
    storage?: AtomicStateStorageOptions<T>
    transform?: (value: T) => T
}

export default class AtomicState<T> {
    private currentValue: T
    private readonly listeners = new Set<(value: T) => void>()
    private readonly id: string

    constructor(
        initialValue: T,
        private readonly options: AtomicStateOptions<T> = {}
    ) {
        this.currentValue = options.transform
            ? options.transform(initialValue)
            : initialValue
        this.id = `AtomicState\n${options.storage?.id}`
        if (options.storage) this.loadFromStorage()
    }

    get value() {
        return this.currentValue
    }
    set value(value: T) {
        const { transform, storage } = this.options
        if (transform) value = transform(value)
        if (value === this.currentValue) return

        this.currentValue = value
        if (storage) window.localStorage.setItem(this.id, JSON.stringify(value))
        for (const listener of this.listeners) {
            listener(value)
        }
    }

    useListener(listener: (value: T) => void): void {
        React.useEffect(() => {
            this.listeners.add(listener)
            return () => {
                this.listeners.delete(listener)
            }
        }, [])
    }

    useValue(): T {
        const [value, setValue] = React.useState(this.currentValue)
        React.useEffect(() => {
            this.listeners.add(setValue)
            return () => {
                this.listeners.delete(setValue)
            }
        }, [])
        return value
    }

    useState(): [value: T, setValue: (value: T) => void] {
        const [value, setValue] = React.useState(this.currentValue)
        React.useEffect(() => {
            this.listeners.add(setValue)
            return () => {
                this.listeners.delete(setValue)
            }
        }, [])
        return [
            value,
            (v: T) => {
                this.value = v
            },
        ]
    }

    addListener(listener: (value: T) => void) {
        this.listeners.add(listener)
    }

    removeListener(listener: (value: T) => void) {
        this.listeners.delete(listener)
    }

    private loadFromStorage() {
        const { storage } = this.options
        if (!storage) return

        try {
            const text = window.localStorage.getItem(this.id)
            if (!text) return

            const data = JSON.parse(text)
            if (!storage.guard(data)) throw Error(`Invalid type!`)

            this.currentValue = data
        } catch (ex) {
            console.error(`Unable to retrieve AtomicState "${storage.id}":`, ex)
        }
    }
}
