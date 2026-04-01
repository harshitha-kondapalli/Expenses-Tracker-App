# Excel Format

Planned workbook path: `data/expenses.xlsx`

## Sheet: `transactions`

Columns:

```text
id
externalId
date
amount
currency
direction
status
merchant
merchantNormalized
description
note
paymentMethod
source
sourceRef
accountLast4
upiHandle
cardNetwork
category
categoryConfidence
isAutoCategorized
tags
rawMessage
createdAt
updatedAt
```

## Sheet: `category_rules`

Columns:

```text
id
matchType
pattern
category
priority
isActive
```

## Sheet: `monthly_summary`

Columns:

```text
month
category
paymentMethod
totalAmount
transactionCount
```
