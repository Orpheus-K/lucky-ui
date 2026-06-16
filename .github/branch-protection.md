# GitHub Branch Protection

Configure these rules in GitHub repository settings. They are documented here so maintainers apply the same policy consistently.

## main

- Require a pull request before merging.
- Require at least 1 approving review.
- Require status checks to pass before merging.
- Require the `uni-compat` workflow.
- Restrict merges to `release/*` and `hotfix/*` PRs through the workflow policy job.
- Disable force pushes.
- Disable direct pushes.

## develop

- Require a pull request before merging.
- Require at least 1 approving review.
- Require status checks to pass before merging.
- Require the `uni-compat` workflow.
- Disable force pushes.
- Disable direct pushes.

## release/*

- Require status checks to pass before merging.
- Disable force pushes.

## Merge Strategy

- Use Squash Merge for normal feature, fix, docs, chore, and refactor PRs.
- Use Merge Commit for `release/*` and `hotfix/*` PRs into `main` when preserving the release node is useful.
- Do not use rebase merge for public protected branches.

