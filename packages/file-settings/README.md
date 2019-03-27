# `file-settings`

This package is used to import the Frontity settings from a local file. The file must be located in the root directory of the project and it must be named `frontity.settings.ts` or `frontity.settings.js`.

## Usage example

You can install it with `npm`:

```
npm i @frontity/file-settings
```

Here is a small example of how to use `getSettings`:

```javascript
import { getSettings } from "@frontity/file-settings";

const settings = await getSettings({
  name: "example-name",
  url: "https://example.site"
});
```

## API reference

### `getSettings(options)`

Used to retrieve the settings from the `frontity.settings.ts` file.

#### Parameters

**`options`** : `{ name?: string; url: string; }`

Used to match the right set of settings when there is more than one.

- **`options.name`** : `string`
  The name of the set of settings you want to retrieve. When provided, `getSettings` will forget about using `options.url`.

- **`options.url`** : `string`
  The url of the site using Frontity. The `matches` field of each set of settings will be tested against this url to determine which set of settings should be used.

#### Return

**`settings`** : `Settings`
An object containing a set of settings with the type `Settings`.

### `getPackages()`

Used to retrieve a list of names of the packages used in each settings set.

#### Return

**`packages`** : `{ [key: string]: string[] }`
If the settings file exports only one set of settings (or _mono settings_), `packages` will have only one key with the name `default`:

```js
{
  default: [ "theme-package", "source-package" ]
}
```

If the settings file exports various sets of settings (or _multi settings_), `packages` will have one key per set of settings with the name of that set.

```js
{
  "settings-one": [ "theme-one", "source-one" ],
  "settings-two": [ "theme-two", "source-two" ]
}
```
