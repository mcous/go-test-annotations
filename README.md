# Go test annotations

Add annotations from `go test` to a GitHub Actions workflow run using the [`test2json`][test2json] output.

[test2json]: https://pkg.go.dev/cmd/test2json

## Usage

```yaml
on:
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - uses: actions/setup-go@v5
        with:
          go-version: '1.24'

      - name: Run tests
        run: go test -json ./... > test.json

      - name: Annotate tests
        if: ${{ !cancelled() }
        uses: mcous/go-test-annotations@v1
```

## Options

```yaml
- uses: mcous/go-test-annotations@v1
  with:
    test-results: test.json
```

| name           | default     |
| -------------- | ----------- |
| `test-results` | `test.json` |
