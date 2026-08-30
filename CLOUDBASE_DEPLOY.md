# CloudBase deployment

Use this project with CloudBase static hosting by building first, then deploying the generated client files.

## CloudBase console settings

Set the deployment version configuration to:

```bash
Target directory: ./
Install command: npm ci
Build command: npm run build:cloudbase
Deploy command: tcb hosting deploy ./dist/client /
```

If the console appends the environment id automatically, keep its generated `-e ...` suffix.

## Node.js version

This project requires Node.js 22 or newer:

```json
"engines": {
  "node": ">=22.13.0"
}
```

In CloudBase, set `NODE_JS_VERSION` to `22`. The failed deployment used Node.js 18, which is too old for this project.

## Why the previous deployment failed

The previous command deployed `./dist`, but the build step was empty. CloudBase clones the repository fresh for every deployment, and `dist/` is intentionally ignored by git, so the directory did not exist in the deployment container.

After `npm run build:cloudbase`, the static hosting files are created in:

```bash
dist/client
```

Deploying `dist/client` is the correct static hosting target. The CloudBase build script uses a static Vite entry so the output includes an `index.html` file.

## Local check

Before redeploying, you can verify the build locally:

```bash
npm run build:cloudbase
```

Then deploy from your machine if needed:

```bash
npm run deploy:cloudbase
```

Note: this app also contains `/api/rooms/:room`. Static hosting only serves the frontend files. If that room-sharing API must work online, it needs to be moved to a CloudBase function, CloudBase database-backed API, or another server runtime.
