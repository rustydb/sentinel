# Quickstart: Disclaimer and Issue Templates

Since this feature introduces standard UI text and standard GitHub issue templates, there are no special boot sequences required.

1. Install dependencies and start the dashboard local stack normally:

```bash
podman compose -f docker-compose.dev.yml up
```

2. Navigate to `http://127.0.0.1:5174` and scroll to the bottom to verify the new prerelease disclaimer.
3. Test the GitHub issue templates on GitHub by navigating to `https://github.com/rustydb/sentinel/issues/new/choose` after these templates are merged to master.
