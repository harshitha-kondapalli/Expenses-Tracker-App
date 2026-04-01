# Categorization Rules

Categorization starts rule-based so we can keep it deterministic and easy to audit.

## Rule strategy

- Normalize merchant names before matching.
- Match highest-priority active rule first.
- Fall back to `Other` when no rule matches.
- Preserve a `categoryConfidence` value so weak matches can be reviewed later.

## Starter examples

```text
swiggy     -> Food
zomato     -> Food
uber       -> Transport
ola        -> Transport
amazon     -> Shopping
flipkart   -> Shopping
airtel     -> Recharge
jio        -> Recharge
apollo     -> Health
```

## Next step

Persist rules in Excel or a database and expose CRUD endpoints through the API.
