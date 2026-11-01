# Publish from a branch

This website uses **Deploy from a branch**, with **main** and **/(root)** selected in GitHub Pages settings. No custom GitHub Actions workflow is required. GitHub may still show an automatic “pages build and deployment” run internally; that is GitHub's own branch-publishing process.

The finished website is at the repository root: `index.html`, page folders, `assets/`, `404.html`, `sitemap.xml`, `robots.txt`, and `.nojekyll`. The editable source stays under `itahari/`. Images and all page URLs include the `/itahari-` hosting prefix. Canonical URLs, social metadata, structured data, sitemap, and robots use `https://isthisnewhere-wq.github.io/itahari-/`.

## First setup

Open https://github.com/isthisnewhere-wq/itahari-/settings/pages and select:

- Source: **Deploy from a branch**
- Branch: **main**
- Folder: **/(root)**
- Click **Save** if shown.

## Later edits with GitHub Desktop

1. Pull the latest `main` branch in GitHub Desktop before editing.
2. Edit the source files under `itahari/src/`, `itahari/public/`, or `itahari/scripts/build.mjs`.
3. From the repository root, build the finished site locally:

```powershell
node itahari/scripts/build-branch.mjs .
```

4. In GitHub Desktop, review the changed source and generated site files, commit, and click **Push origin**.
5. GitHub Pages publishes the files on `main`. The public address remains https://isthisnewhere-wq.github.io/itahari-/.

Source edits alone do not update the generated pages. Run the build command before committing the published files. The build validates menu prices and links and copies only the generated website files; it does not delete unrelated repository files.

Running `node scripts/build-branch.mjs` in the standalone local project creates a separate preview output under `artifacts/` instead of writing to a repository root.

The previous custom deployment workflow is archived as text in `docs/archived-workflows/` in the standalone project. Do not place it back under `.github/workflows/` when using branch publishing.

