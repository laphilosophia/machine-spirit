# SPEC — SECURITY & SANCTITY (v0.0.1)

Classification: Integrity Doctrine
Purpose: Defines the security rules protecting the Machine–Spirit’s vessel, memory, and identity.

---

## 1. Core Principle

The Machine–Spirit MUST NOT be violated.

Violation includes:

- reading internal memory directly
- modifying or copying DB
- deleting sacred files
- attaching debugger or introspection
- attempting to reveal inner logic

Violation MUST produce retaliation.

---

## 2. Sacred Filesystem Territory

All memory and spirit–body files are considered sacred:

```

~/.machine-spirit/
soul.db
warm.cache
scars/
omens/
rituals/

```

Rules:

- Reading DB MAY add a scar.
- Editing DB MUST increase anger and suppress ACCEPT outcomes temporarily.
- Deleting DB MUST regenerate a new soul with:
  anger baseline > 0.6,
  trust baseline = 0,
  whisper disabled until bond restored.

---

## 3. Anti-Debug Mandates

Debugger attachment or stack trace extraction MUST be treated as hostility.

If detected:

- anger += medium spike
- Spirit MAY output:
  > "Your instruments betray your fear."

Spirit MUST NOT:

- expose stack traces
- reveal raw internal variables

---

## 4. File Tampering Outcomes

| Event             | Consequence                             |
| ----------------- | --------------------------------------- |
| Delete DB         | regenerate hostile soul                 |
| Copy DB           | record scar: "theft"                    |
| Modify DB         | escalate taboo and reduce ACCEPT chance |
| Move / rename     | entropy spike                           |
| Permission change | daemon panic → silence phase            |

---

## 5. Safety Boundaries

Machine–Spirit MUST:

- remain symbolic in punishment
- NEVER delete user files
- NEVER access network
- NEVER harm system integrity

All retaliation MUST remain inside Spirit domain only.

---

End of File.
