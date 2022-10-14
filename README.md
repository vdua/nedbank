# Your Project's Title...
Nedbank's personal banking site

## Environments
- Preview: https://main--nedbank--hlxsites.hlx.page/
- Live: https://main--nedbank--hlxsites.hlx.live/

## Installation

```sh
npm i
```

## Tests

```sh
npm tst
```
## Compile all `.less` files to `.css`
```sh
npm run lessc
```

The above command will run `node less-compile.js` which will compile all `*.less` files to `*.css` files.

## Run less auto-compile and Franklin Pages together

```sh
npm run up
```

The above command will run `less` compiler in watch mode (i.e. watching for any changes in the `*.less` files in the current directory and all its descendents and compiling those changes to `*.css`).

And in parallel, it will also start up your local Franklin Pages development environment with `hlx up` command.

### Note on LESS usage and Franklin Local Development

 The `npm run up` will parse the `styles` and `blocks` directory for any `.less` files. Files that are found will be compiled to css and saved in the same location and name with a `.css` extension. It will then continue to watch for changes to `.less` files and will compile to their associated CSS files on changes.

Examples:
  - `{repo}/blocks/header/header.less` will compile to `{repo}/blocks/header/header.css`
  - `{repo}/styles/style.less` will compile to `{repo}/styles/styles.css`

As both `less-compile.js` and `hlx up` are watching for changes, changes made to your less files while using the `rpm run up` command will be reflected automatically in your localhost.

Note that using only the `hlx up` command will not trigger updates on-change for less files.


## Local development

1. Create a new repository based on the `helix-project-boilerplate` template and add a mountpoint in the `fstab.yaml`
1. Add the [helix-bot](https://github.com/apps/helix-bot) to the repository
1. Install the [Helix CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/helix-cli`
1. Start Helix Pages Proxy: `hlx up` (opens your browser at `http://localhost:3000`)
1. Open the `{repo}` directory in your favorite IDE and start coding :)
