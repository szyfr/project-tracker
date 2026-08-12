---
paths:
  - 'app/{Concerns,Http/Requests}/**'
---

# Requests

## Project date rules are bounded
`ProjectValidationRules` bounds start_date/due_date to 1900-01-01..2100-12-31 with `date_format:Y-m-d`. This is deliberate: a bare `date` rule accepts values like `999999-12-31`, which the date column silently truncates on write (it stored as `1999-12-31`).

Two traps when editing these rules:
- due_date's lower bound uses `after:1899-12-31`, not `after_or_equal:1900-01-01`, so its message does not collide with the `after_or_equal:start_date` message. Validation messages are keyed `field.rule`, so the same rule name cannot carry two meanings on one field.
- With `date_format` present, Laravel parses the *comparison parameter* using that same format. Only plain `Y-m-d` literals work there; relative strings like `1900-01-01 -1 day` silently fail every time.

`UpdateProjectRequest` reuses these rules unchanged: an update is a full replace over PUT, so every field stays required. Partial updates are out of scope — do not add `sometimes` here without a requirement asking for them.
