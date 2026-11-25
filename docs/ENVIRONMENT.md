# Environment

Template for the installation notes. Everything marked `TODO(owner)` has to be
filled in from the machine that runs the forms. I left the version numbers out
because I have not finished the installation yet.

## Versions

| Component | Version | Notes |
| --- | --- | --- |
| Oracle Forms / Forms Builder | `TODO(owner)` | e.g. the exact build number shown in Help > About |
| Oracle Fusion Middleware / WebLogic Server | `TODO(owner)` | version that Forms runs on |
| Oracle Database | `TODO(owner)` | 19c used as target; state the real one |
| JDK | `TODO(owner)` | vendor and version used by the client |
| Browser | `TODO(owner)` | name and version used for the browser runtime |
| Operating system | `TODO(owner)` | where the Forms services run |

## Install order (to be written from what I actually did)

1. `TODO(owner)` — database installation / existing instance used
2. `TODO(owner)` — Forms and Reports installation
3. `TODO(owner)` — repository creation (`rcu`) and domain configuration
4. `TODO(owner)` — starting the managed server and the Forms services
5. `TODO(owner)` — connecting Forms Builder to the database (client `tnsnames.ora`,
   `formsweb.cfg` / default environment file)

Placeholders used when writing this section — never commit real values:

```text
DB host      : <db_host>
DB port      : <db_port>
DB service   : <db_service>
DB user      : <db_user>
Connect via  : <db_alias>
Forms URL    : <forms_url>        e.g. http://<host>:<port>/forms/frmservlet
```

Do not paste passwords, wallet files, `tnsnames.ora` files or `formsweb.cfg` files
into this repository; they are ignored by `.gitignore` and should stay local.

## Problems met and how I solved them

`TODO(owner)` — one entry per real problem, for example: the form opens but the
tree is empty; the browser shows an error page; the LOV returns no rows. Write what
the message said and what fixed it. Keep it short.

| # | Symptom | Cause | Fix |
| --- | --- | --- | --- |
| 1 | `TODO(owner)` | `TODO(owner)` | `TODO(owner)` |
| 2 | `TODO(owner)` | `TODO(owner)` | `TODO(owner)` |

## How to open the forms

`TODO(owner)` — the exact steps I use: start the server, open Forms Builder, open
`form_task1.fmb` / `form_task2.fmb`, then Run Form, plus the URL used in the browser.

## What I did not do

- I did not install the environment while writing this repository, so this file
  contains no verified values.
- I did not test that the recorded steps reproduce on a second machine.
