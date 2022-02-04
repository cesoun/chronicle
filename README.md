# chronicle

a blog application for cst-391

## env

set and unset the environment variables locally

```shell
export $(grep -v '^#' .env | xargs)
```

```shell
unset $(grep -v '^#' .env | sed -E 's/(.*)=.*/\1/' | xargs)
```
