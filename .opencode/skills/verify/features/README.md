# Feature map

The maintained verification source for this repo. One file per user-facing feature. A proof that
drives one convenient entry point is incomplete when this map lists others.

| Feature                              | Surface              | Journey   | Last proven                              |
| ------------------------------------ | -------------------- | --------- | ---------------------------------------- |
| [Storybook stories](storybook.md)    | Storybook, port 6007 | none yet  | not proven                               |
| [Packaged library](package-build.md) | `dist/`              | none yet  | not proven                               |

Adding a feature to the app means adding a file here and a journey in `scripts/drive.mjs`. A journey
that cannot fail proves nothing; every journey asserts an observable end state.
