<p align="center">
  <a href="https://example.com/">
    <img src="https://avatars.githubusercontent.com/u/78617814?s=72&v=4" alt="SOCIU" width=72 height=72>
  </a>

  <h3 align="center">Order Management</h3>

  <p align="center">
    A CLI tool for get & sync Kiotviet, GHTK, GHN, VNPost data
    <br>
    <a href="https://github.com/sociuvn/order-management/issues/new?labels=bug&title=New+bug+report">Report bug</a>
    ·
    <a href="https://github.com/sociuvn/order-management/issues/new?labels=feature&title=New+feature">Request feature</a>
  </p>
</p>

[![CI](https://github.com/sociuvn/order-management/actions/workflows/ci.yml/badge.svg)](https://github.com/sociuvn/order-management/actions/workflows/ci.yml)

## Table of contents

- [Bugs and feature requests](#bugs-and-feature-requests)
- [Some commands](#some-commands)
- [Creators](#creators)
- [Thanks](#thanks)
- [Copyright and license](#copyright-and-license)

## Bugs and feature requests

Have a bug or a feature request? Please first read the [issue guidelines](https://github.com/sociuvn/order-management/blob/main/CONTRIBUTING.md) and search for existing and closed issues. If your problem or idea is not addressed yet, [please open a new issue](https://github.com/sociuvn/order-management/issues/new).

## Some commands

### Dev

**Setting:**

- ENV:

```bash
# Setting ENV (key & value) to .env
npm run cli -- setting env -k KEY_ABC -v value_xyz
```

**GHTK:**

- Token:

```bash
# Save token into .env
npm run cli -- ghtk token -s eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6xxxxxxxxxxxxxxxxxxxxxxxx
```

- Orders:

```bash
# Get order by code
npm run cli -- ghtk get -c 123456789
```

**GHN:**

- Token:

```bash
# Save token into .env
npm run cli -- ghn token -s xxxxxxxxxxxxxxxxxxxxxxxx
```

- Orders:

```bash
# Get order by code
npm run cli -- ghn get -c EE123456789VN

# Get orders by date
npm run cli -- ghn get -d 2023-02-20

# Get orders from the date to current date
npm run cli -- ghn get -f 2023-02-20

# Get orders from the date to other date
npm run cli -- ghn get -f 2023-02-20 -t 2023-02-23

# Get orders from current date to the date
npm run cli -- ghn get -t 2023-02-26
```

**VNPost:**

- Token:

```bash
# Save token into .env
npm run cli -- vnpost token -s eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6xxxxxxxxxxxxxxxxxxxxxxxx
```

- Orders:

```bash
# Get order by code
npm run cli -- vnpost get -c EE123456789VN

# Get orders by date
npm run cli -- vnpost get -d 2023-02-20

# Get orders from the date to current date
npm run cli -- vnpost get -f 2023-02-20

# Get orders from the date to other date
npm run cli -- vnpost get -f 2023-02-20 -t 2023-02-23

# Get orders from current date to the date
npm run cli -- vnpost get -t 2023-02-26
```

**ViettelPost:**

- Token:

```bash
# Save token into .env
npm run cli -- viettelpost token -s eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6xxxxxxxxxxxxxxxxxxxxxxxx
```

- Orders:

```bash
# Get order by code
npm run cli -- viettelpost get -c 1755979111111

# Get orders by date
npm run cli -- viettelpost get -d 2023-02-20

# Get orders from the date to current date
npm run cli -- viettelpost get -f 2023-02-20

# Get orders from the date to other date
npm run cli -- viettelpost get -f 2023-02-20 -t 2023-02-23

# Get orders from current date to the date
npm run cli -- viettelpost get -t 2023-02-26
```

#### Kiotviet

- Token:

```bash
# Get token
npm run cli -- kiotviet token -g

# Save token into .env
npm run cli -- kiotviet token -s

# Show and save token into .env
npm run cli -- kiotviet token -gs
```

- Branches:

```bash
# Show list branches
npm run cli -- kiotviet branches list
```

- Customers:

```bash
# Create customers from VNPost, GHTK orders by date
npm run cli -- kiotviet customers create -d 2023-02-20

# Create customers from VNPost, GHTK orders from the date to current date
npm run cli -- kiotviet customers create -f 2023-02-20

# Create customers from VNPost, GHTK orders from the date to other date
npm run cli -- kiotviet customers create -f 2023-02-20 -t 2023-02-23

# Create customers from VNPost, GHTK orders from current date to the date
npm run cli -- kiotviet customers create -t 2023-02-26
```

- Invoices:

```bash
# Get invoice by code
npm run cli -- kiotviet invoices get -c HD123456

# Sync invoice by code
npm run cli -- kiotviet invoices sync -c HD123456

# Sync invoices by date
npm run cli -- kiotviet invoices sync -d 2023-02-20

# Sync invoices from the date to current date
npm run cli -- kiotviet invoices sync -f 2023-02-20

# Sync invoices from the date to other date
npm run cli -- kiotviet invoices sync -f 2023-02-20 -t 2023-02-23

# Sync invoices from current date to the date
npm run cli -- kiotviet invoices sync -t 2023-02-26
```

## Creators

- [lamngockhuong](https://github.com/lamngockhuong/)
- [khuongln-1346](https://github.com/khuongln-1346/)

## Thanks

## Copyright and license

Copyright 2022. Code released under the [MIT License](https://github.com/sociuvn/order-management/blob/main/LICENSE).

Enjoy :metal:
