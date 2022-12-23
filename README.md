# ensure-commits-have-ticket-gh-action

This action checks that ALL commits present in a pull request include a JIRA ticket. Useful for teams that require an extra level of traceability on their work and tasks. Here is an example:


```yml
name: CI
on:
  pull_request:
    branches: ["main"]
jobs:
  ensure-commits-have-tickets:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - uses: pixel-systems/ensure-commits-have-ticket-gh-action@main
        name: Ensure Jira ticket in all commits
        with:
          base-branch: $GITHUB_BASE_REF
          pr-branch: $GITHUB_HEAD_REF
          ignore-pr-from-branches:
            snyk-*
            other-branch-regex
```

The action essentially scans your commit messages [looking](https://stackoverflow.com/questions/19322669/regular-expression-for-a-jira-identifier) for JIRA tickets. In case a commit has no ticket, the action will fail.

## Optional parameter

There is an optional parameter in this action:
  - ignore-pr-from-branches: List of strings containing regular expressions for PR branch names to ignore.<br />
  Each regular expression needs to have at least 3 consecutive alphanumeric characters.<br />
  Input samples:
      - Multiline input parameter:
        ```yaml
        ignore-pr-from-branches:
          snyk-*
          other-branch-regex
        ```
      - Delimited list:
        - space: 'snyk-\* other-branch-regex'
        - semicolon: 'snyk-\*;other-branch-regex'
        - comma: 'snyk-\*,other-branch-regex'
      - Json array: '[ \"snyk-\*\", \"other-branch-regex\" ]' 
## remarks

:warning: commits that contain `[skip ci]` are skipped from the validation.
