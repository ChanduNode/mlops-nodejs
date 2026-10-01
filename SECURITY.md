# Security Policy

## Dependency Management

Dependencies must be declared in `package.json` with exact versions.

`package-lock.json` must be committed to source control and kept synchronized
with `package.json`.

CI and Docker builds must use:

```bash
npm ci