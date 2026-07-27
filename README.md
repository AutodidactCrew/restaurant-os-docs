# Restaurant OS Documentation

Professional product and engineering documentation site built with Docusaurus.

## Local development

```bash
npm install
npm start
```

## Production build

```bash
npm run build
npm run serve
```

## GitHub Pages setup

1. Replace `YOUR_GITHUB_USERNAME` in `docusaurus.config.js`.
2. Create a GitHub repository named `restaurant-os-docs`.
3. Push this project to the `main` branch.
4. In **Settings → Pages**, select **GitHub Actions** as the source.
5. The included workflow builds and deploys the site.

## Documentation conventions

- One concern per page.
- Use Mermaid for architecture and process diagrams.
- Record significant technical decisions as ADRs.
- Add owner, status and last-reviewed date to mature documents.
- Keep product requirements separate from detailed solution design.
