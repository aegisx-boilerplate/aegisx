# Semantic Release Guide

## Overview

This project uses [semantic-release](https://semantic-release.gitbook.io/) for automated versioning and package publishing based on conventional commits.

## How It Works

### Commit Types → Version Bumps

| Commit Type | Version Bump | Example |
|-------------|--------------|---------|
| `feat:` | Minor (0.1.0 → 0.2.0) | `feat: add user authentication` |
| `fix:` | Patch (0.1.0 → 0.1.1) | `fix: resolve database connection issue` |
| `perf:` | Patch (0.1.0 → 0.1.1) | `perf: optimize query performance` |
| `refactor:` | Patch (0.1.0 → 0.1.1) | `refactor: improve code structure` |
| Breaking Change | Major (0.1.0 → 1.0.0) | See below |

### Breaking Changes

For major version bumps, add `BREAKING CHANGE:` in the commit body:

```bash
git commit -m "feat: change API response format

BREAKING CHANGE: API now returns data in different structure"
```

### No Release Commits

These commit types don't trigger releases:
- `docs:`, `style:`, `test:`, `build:`, `ci:`, `chore:`

## Branching Strategy

### Production Releases
- **`main` branch** → Stable releases (1.0.0, 1.1.0, etc.)

### Pre-releases  
- **`beta` branch** → Beta releases (1.0.0-beta.1, 1.0.0-beta.2)
- **`alpha` branch** → Alpha releases (1.0.0-alpha.1, 1.0.0-alpha.2)

## Commands

```bash
# Test what version would be released (no actual release)
npm run release:dry

# Manual release (only needed for troubleshooting)
npm run release
```

## Automated Process

When you push to `main`:

1. **CI runs** → Lint, type-check, build, test
2. **semantic-release analyzes** → Commits since last release  
3. **Determines version** → Based on commit types
4. **Generates changelog** → From conventional commits
5. **Creates git tag** → With new version
6. **Updates package.json** → With new version
7. **Creates GitHub release** → With release notes
8. **Publishes package** → (if configured)

## Release Notes

Release notes are automatically generated from:
- Commit messages
- Pull request titles  
- Breaking changes
- Contributors

## Configuration

The release configuration is in `.releaserc.json`:

```json
{
  "branches": ["main", "beta", "alpha"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator", 
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git",
    "@semantic-release/github"
  ]
}
```

## GitHub Setup

For automated releases, set these repository secrets:

- `GITHUB_TOKEN` → Automatically available
- `NPM_TOKEN` → For npm publishing (if needed)

## Troubleshooting

### No Release Created
- Check commit messages follow conventional format
- Ensure commits contain releasable types (`feat`, `fix`, etc.)
- Verify CI passes all checks

### Wrong Version Bump
- Review commit types in your commits
- Check for `BREAKING CHANGE:` in commit bodies
- Use `npm run release:dry` to preview

### Release Failed
- Check GitHub Actions logs
- Verify repository permissions
- Ensure no manual tags conflict with semantic-release

## Best Practices

1. **Use `npm run commit`** → Interactive conventional commits
2. **Write clear commit messages** → They become release notes
3. **Test with dry run** → Before important releases
4. **Review generated changelogs** → Ensure accuracy
5. **Use feature branches** → Keep main clean

## Examples

### Feature Release (Minor)
```bash
git commit -m "feat: add OAuth2 authentication support"
# Results in: 1.0.0 → 1.1.0
```

### Bug Fix (Patch)
```bash
git commit -m "fix: resolve memory leak in Redis connection"
# Results in: 1.1.0 → 1.1.1
```

### Breaking Change (Major)
```bash
git commit -m "feat!: redesign API endpoints

BREAKING CHANGE: All endpoints now use /api/v2/ prefix"
# Results in: 1.1.1 → 2.0.0
```

---

**Semantic Release makes versioning automatic and predictable! 🚀**
