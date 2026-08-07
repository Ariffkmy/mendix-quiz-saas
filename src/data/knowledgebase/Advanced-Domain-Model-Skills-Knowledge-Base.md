# Advanced Domain Model Skills — Knowledge Base

**Course:** Advanced Domain Model Skills (Mendix Academy)
**Level:** Advanced
**Modules:** 8
**Studio Pro version used in course exercises:** 9.12.4
**Sample application:** SoccerSquad (persona: Adrian, a soccer team administrator)

**Course overview:** This learning path takes an experienced Mendix developer beyond the basics of domain modeling. Using the running example of a soccer-team management app built for the fictional user Adrian, the course covers when and how to use entity inheritance, how to work safely with the built-in `System.FileDocument` and `System.Image` entities, how to model and optimize many-to-many-style relationships (reference sets vs. a joining entity), how database indexes affect read/write performance, how to migrate production data safely when the domain model changes ("four-stage rocket" approach), how to build and query self-referencing associations (e.g., a "buddy" hierarchy of players), and how DateTime values, localization, and time zones behave on the client versus the application server. Each module ends with a scored knowledge check; every module in this run was completed with a 100% score on the first attempt (no retakes were necessary).

> Note on scope: Modules 6, 7, and 8 were captured directly, lecture-by-lecture, in this session, including full exercise steps and every knowledge-check question/answer. Modules 1–5 were completed in an earlier part of the same continuous session; their core concepts, exercises, and aggregate quiz scores are preserved accurately, but a few individual quiz question texts from Modules 1–2 and 5 were not retained verbatim — where that is the case it is noted below.

---

## Module 1: Introduction

The course opens by framing the SoccerSquad sample app and Adrian's persona (a soccer team administrator who needs an increasingly sophisticated data model: players, teams, matches, goals, file/image attachments, and a "buddy" mentorship system for apprentice players). This module sets learning objectives for the rest of the path and does not have its own scored knowledge check.

---

## Module 2: Working with Inheritance

**Core concepts:**
- **Generalization / specialization (inheritance)** lets one entity "inherit" the attributes and associations of another. A specialized entity (e.g., `Goalkeeper`) *is a* more specific version of its generalized entity (e.g., `Player`), sharing all its attributes automatically.
- **Database impact:** an inheritance relationship is stored as **two separate tables** — one for the generalized entity and one for the specialized entity — linked by a shared primary key/ID that stays in sync as objects move through the specialization hierarchy. This is more storage-efficient than duplicating attributes, but every specialized record requires the platform to internally join back to its parent table.
- **Object type decision (green diamond)** in a microflow lets you branch logic based on which concrete (specialized) type an object actually is at runtime, when you only have a reference to the generalized type.
- **Cast activity** converts a generalized object variable into its specialized type (or vice versa) inside a microflow so type-specific attributes/associations become available.
- **Deciding inheritance vs. a 1-1 association** — the course frames this as an "**Is** a / **Has** a" test:
  - If entity B *is a* more specific version of entity A → use **inheritance** (2-table structure).
  - If entity B merely *has* a relationship to entity A but is conceptually a separate thing → use a **1-1 association** (3-table structure: A, B, and the implicit association).
  - Inheritance is generally preferred when the specialized behavior/lifecycle is tightly coupled to the general entity; a 1-1 association is preferred when the "extra" data is optional, independently lifecycled, or could apply to many unrelated entities (more flexible, but requires an extra join).

**Knowledge Check — Score: 4/4 (100%)**
Questions covered: how inheritance is stored in the database (two tables, shared ID), when to use the object type decision vs. Cast, and how to apply the "Is a / Has a" test to choose between inheritance and a 1-1 association. All four answers were correct on the first attempt; no retake needed.

---

## Module 3: Working with System Entities (FileDocument & Image)

**Core concepts:**
- Mendix ships two built-in system entities for handling binary content: **`System.FileDocument`** (any file) and **`System.Image`** (a specialization of FileDocument for images).
- **Key attributes:**
  - `FileID` — internal identifier used for storage lookup.
  - `Name` — the file name.
  - `Contents` — the binary content itself.
  - `HasContents` — boolean flag indicating whether content has actually been uploaded.
  - `DeleteAfterDownload` — boolean, **default value is `false`**. When `true`, the file is removed from storage after being downloaded once (useful for one-time exports/temp files).
  - `System.Image` adds `PublicThumbnailPath` for serving a thumbnail directly.
- **Storage location:** by default, file contents are stored on the application server's own filesystem; this can be reconfigured to use an external object store such as **Amazon S3** for scalability.
- **Best practice:** never use `System.FileDocument`/`System.Image` directly in your own domain model. Instead, create a **module-specific specialization** (e.g., `SoccerSquad.PlayerPhoto` inheriting from `System.Image`). Reasons:
  1. **Purpose** — lets you add your own attributes/associations (e.g., linking a photo to a specific Player) without polluting the system entity.
  2. **Security** — module roles/entity access can be scoped precisely to your specialization rather than the shared system entity.
  3. **Maintainability** — keeps file-handling logic contained and upgrade-safe.

**Knowledge Check — Score: 3/3 (100%)**
Confirmed question: *"What is the default value of the attribute DeleteAfterDownload?"* → correct answer **False**. Other questions covered the purpose of creating module-specific specializations of FileDocument/Image and where file contents are stored by default. All three answers correct on first attempt.

---

## Module 4: Associations and Reference Sets

**Core concepts:**
- **Ownership in associations** — Mendix associations are directional in terms of "ownership" (shown with a dot on the owning side in the domain-model diagram). Ownership determines which side's deletion behavior/consistency rules apply and affects how the relationship is stored.
- **Reference set (1 owner, `1-*`)** — a single entity owns a set of references to many other objects; storage is a single foreign-key-style list on the owning side.
- **Reference set "both" (`*-*`, both-sided ownership)** — both entities own a reference set to each other. This duplicates relationship bookkeeping at both ends and is the **most expensive** option — generally discouraged except in rare cases where true bidirectional ownership is required.
- **Joining entity pattern** — instead of a many-to-many reference set, model an explicit joining entity (e.g., `Player_Team`) connected to both sides via two `1-*` associations. This is the Mendix-recommended way to represent many-to-many relationships because it allows extra attributes on the relationship itself (e.g., a join date) and performs significantly better.
- **Empirical performance results** (from the course's built-in `PerformanceTest` module/dashboard): the **joining entity pattern was roughly 3–4x faster** than a plain reference set for typical queries, and the **reference set "both" was the slowest** of the three options tested.
- **Reading domain-model diagrams:** ownership dots indicate which entity's table holds the foreign key / ID list; this was tested directly via diagram-reading questions (see below).

**Knowledge Check — Score: 5/5 (100%)**
Confirmed detail: one question showed a domain-model diagram with ownership dots and asked where the resulting ID list would physically be stored — answered correctly by tracing which entity owned the association. Another question presented two alternative domain models (A and B) for a "select a staff member for a team" use case and asked which was the better design — answered correctly by applying the ownership/cardinality reasoning above (favoring the model whose ownership and cardinality matched the real-world relationship, avoiding an unnecessary `*-*` reference set). All five answers were correct on the first attempt; verified via the post-submission checkmarks.

---

## Module 5: Indexes and Data Conversions

**Part A — Database indexes:**
- An index is a sorted lookup structure mapping an attribute's value to its record location, allowing the database to find matching rows without scanning the whole table.
- **Trade-off:** indexes speed up **reads** (searches/sorts) but slow down **writes** (every insert/update must also update the index).
- **Best practices:**
  - Add indexes on larger tables and on attributes that are searched/filtered frequently.
  - Prefer indexing attributes with many unique values (high cardinality) over attributes with few distinct values (e.g., a boolean).
  - Use indexes when reads significantly outnumber writes.
  - Make sure the indexed attribute matches the attribute used to sort a list view, for the index to be used effectively.
  - Indexes work best with **Equals** or **Starts-with** XPath conditions; a **Contains** or **Ends-with** condition generally cannot use the index efficiently.
  - Avoid indexing unlimited-length string attributes (they are expensive to index and rarely appropriate for exact-match lookups).
- **Empirical result:** in the course's own benchmark, adding the right index gave a **4–8x speedup** for the tested query scenario.

**Part B — Data conversions (the "four-stage rocket"):**
- Two kinds of domain-model change require different handling:
  - **Type changes** (an attribute or association's type changes) — partially handled automatically by Mendix, but a custom conversion microflow is recommended for full control.
  - **Structural changes** (new entities/attributes/associations added) — always require a custom conversion microflow; nothing is automatic.
- **Four-stage rocket methodology** for safely evolving a live production domain model:
  1. **Stage 1 — Extend:** add the new structure to the domain model while keeping the old structure in place side by side. If a new attribute would collide in name with an old one, rename the old one with an `_Old` suffix.
  2. **Stage 2 — Model the conversion:** build a conversion microflow (and typically an admin-only button/page to trigger it) that copies/transforms data from the old structure into the new structure.
  3. **Stage 3 — Deploy & run:** deploy this version to production, run the conversion microflow, and verify the results using a comparison page that shows old vs. new values side by side.
  4. **Stage 4 — Clean up:** once verified, delete the old attributes, the temporary conversion microflow, and the comparison page, then fix any resulting build errors. **Tip:** deleting the old attributes *first* is a deliberate technique — Studio Pro's error list then becomes a free "to‑do list" of every remaining place that still references the old structure, so nothing is missed. Deploy this final, cleaned-up version. Don't delay Stage 4 — leaving old and new structures side by side for too long increases the risk of future database-sync problems.

**Knowledge Check — Score: 3/3 (100%)**
Questions covered the read/write trade-off of indexes, which XPath operators can use an index (Equals/Starts-with vs. Contains/Ends-with), and the purpose/ordering of the four-stage rocket conversion approach (in particular, why old attributes are deleted before cleanup is considered complete). All three answers were correct on the first attempt.

---

## Module 6: Advanced Associations Using Self Reference

**6.1–6.3 — Concept and implementation:**
A **self-reference** is an association from an entity back to itself (e.g., `Player` to `Player`), enabling hierarchical/networked relationships such as "buddy" mentorship pairs, with no limit on how many levels deep the hierarchy can go.
- **Naming convention:** rename the default generic `Entity_Entity` association name to clearly distinguish the two roles it plays — in the course example, `Player_Player` was renamed to **`Apprentice_Buddy`**, making it immediately clear which side is the mentee ("Apprentice") and which is the mentor ("Buddy").
- **Ownership:** by convention in this course's model, ownership sits on the "child" side of the relationship (the Apprentice owns the association to their Buddy) — i.e., a many-to-one association where each apprentice has exactly one buddy, but a buddy can have many apprentices.

**6.4 — Querying a self-reference:**
- **6.4.1 Querying children (apprentices) from a parent (buddy):** starting from a data view holding a `Player` object referred to as `$Buddy`, a List View using an **XPath** data source with the constraint:
  ```
  [SoccerSquad.Apprentice_Buddy = '[%CurrentObject%]']
  ```
  This is read **right-to-left**: `[%CurrentObject%]` is the current data-view object (`$Buddy`); the platform applies the constraint on the right/parent side of the association by default and returns the matching apprentice Players. This directionality is described as "key to interpreting which direction you should follow the association."
- **6.4.2 Querying in reverse (buddy from an apprentice):** going the other way — starting from a Player who is an apprentice and wanting their buddy — requires the special **`[reversed()]`** expression, which flips which side of the association Mendix reads the constraint from:
  ```
  [SoccerSquad.Apprentice_Buddy [reversed ()] = '[%CurrentObject%]']
  ```
  `[reversed()]` only applies to the one association it's attached to; it works only on self-references (for associations between two *different* entity types, Mendix can determine the join direction automatically, so `reversed()` is unnecessary there).
- **6.4.3 Creating more complex queries:** `[reversed()]` composes with longer association paths. Example: retrieving all `Goal` objects scored by the apprentices of a given buddy:
  ```
  [SoccerSquad.Goal_Player/SoccerSquad.Player/SoccerSquad.Apprentice_Buddy = '[%CurrentObject%]']
  ```
  and, to instead retrieve the goals of *the buddy of* a given apprentice (reversing only the self-reference hop, not the whole path):
  ```
  [SoccerSquad.Goal_Player/SoccerSquad.Player/SoccerSquad.Apprentice_Buddy [reversed()] = '[%CurrentObject%]']
  ```

**6.5 — Exercise: Build the Config Page for Adrian**
A hands-on exercise builds a `Player_View` page with:
- **6.5.1 Create the Basic Page:** duplicate/configure a chevron link button (icon = `cog`) on the Person overview list view to open a new `Player_View` page (layout `Atlas_Topbar`, template "Form horizontal"), visible only to Administrator, showing the player's `FullName` as a Heading 3.
- **6.5.2 Add Buddy and Apprentices:** add a 2-column layout grid with a "Select buddy" reference selector bound to `Player/Apprentice_Buddy/Player/FullName`, and an "Apprentices" list (List 1 building block) using an XPath data source (`Entity = Player`, constraint `[SoccerSquad.Apprentice_Buddy = '[%CurrentObject%]']`). The exercise also has the learner deliberately add `[reversed()]` to this XPath to observe how the results change (it flips the list from "my apprentices" to effectively showing "my buddy" instead), then revert it back before moving on.
- **6.5.3 Show the Goals of Your Buddy:** add a "Buddy's goals" list (List 2) using the compound reversed XPath from 6.4.3 to show goals scored by the selected buddy. After running the app (login `Adrian/Mendix123`) and testing on the Person overview, the page correctly displays a selected buddy, that buddy's list of apprentices, and the buddy's goals.

**6.6 Summary:** self-references let you implement, query normally, and query in reverse; ownership direction and the self-reference naming convention both matter for readability and correctness.

**Knowledge Check — Score: 3/3 (100%)**
| # | Question | Selected Answer | Rationale |
|---|---|---|---|
| 1 | What does the function `reversed()` do? | **It changes the direction in which the association is queried.** | Matches the lecture's explicit description of `reversed()` flipping which side of a self-reference is used as the query anchor. |
| 2 | Best naming for a self-reference where the buddy is referenced by an apprentice? | **Apprentice_Buddy** | Directly matches the naming convention taught and used throughout the module's exercises. |
| 3 | Correct XPath to retrieve the goals of the buddy of an apprentice? | **`[SoccerSquad.Goal_Player/SoccerSquad.Player/SoccerSquad.Apprentice_Buddy [reversed()] = '[%CurrentObject%]']`** | `reversed()` must be placed immediately after the self-reference step in the path (not at the very start or end of the whole expression) to reverse only that hop. |

---

## Module 7: Date Time Handling

**7.1–7.2 Objectives & Introduction:** Adrian's matches have a DateTime start component; showing the correct date/time to every user (regardless of their location) is critical so no one misses a match.

**7.3 DateTime Attribute:**
- A DateTime value is **always stored in the database as seconds since 1 Jan 1970 00:00:00 UTC** (the Unix epoch) — this never changes regardless of display settings.
- Every DateTime attribute has a **Localize** property (default **Yes**). When Localize = Yes, the value is displayed/edited using the **browser's (client device's) time zone**. When Localize = No, the client always shows/edits the raw **UTC** value.
- Worked example (user in UTC-6 picks 07/11/2020 12:00 AM in a date picker):

  | Localize | Database | User UTC-6 | User UTC+4 |
  |---|---|---|---|
  | Yes | 07/11/2020 06:00 AM | 07/11/2020 12:00 AM | 07/11/2020 10:00 AM |
  | No | 07/11/2020 12:00 AM | 07/11/2020 12:00 AM | 07/11/2020 12:00 AM |

  With localization on, the same stored instant appears different to users in different zones (correct for "this happens at a specific real moment" data). With localization off, every user sees the identical clock value regardless of location (correct for "this is just a label, not a real-world instant" data).

**7.4 Time Zone Settings:**
Time zones can be configured at three levels, used on the **application server** (for XPath/microflow date handling, unless UTC expressions are used):
- **User** — the time zone set on an individual user account.
- **App Settings** — the default time zone applied to users who have none set.
- **Scheduled Events** — the time zone that scheduled-event activities themselves run in (distinct from *when* the schedule triggers).
- **Fallback:** if neither User nor App time zone is set, Mendix falls back to the **browser's reported UTC offset** — but this fallback cannot correctly account for Daylight Saving Time, since it only has an instantaneous offset, not a named time zone.
- **Configuring correctly:**
  - **Single time zone app:** just set the App-level (default) time zone; all new users inherit it automatically.
  - **Multi time zone app**, four viable strategies: (1) do nothing and rely on the browser-offset fallback (acceptable but DST-unsafe); (2) let users set their own time zone on their account page (only takes effect after logging out/in again); (3) have an administrator set each user's time zone manually via an admin edit page (fine for a small user base); (4) auto-assign the time zone via an "after startup" (or account-creation) microflow, e.g., derived from external system data.

**7.5 When Not to Localize:**
Turn Localize off when the time offset is not actually meaningful to the reader — e.g., a **fixed-location class schedule**. Example: a Boston class schedule (9AM–4PM) viewed by a Boston user and an Amsterdam user:
- **Localized:** Boston user sees 9AM–4PM; Amsterdam user sees a different, converted 3PM–10PM — technically "correct" but confusing, since the schedule is fixed to Boston regardless of who's looking at it. A user viewing from Sydney could even see the date roll to the next calendar day, and might book a flight for the wrong day if they forgot to convert back to Boston time.
- **Non-localized:** both users see the same literal 9AM–4PM, correctly matching the real, location-fixed schedule.
- **Rule of thumb:** before using a DateTime attribute, decide how users will read it and how it will be used in downstream logic; if the time offset is irrelevant to the meaning of the data, set Localize to **No**.

**7.6 Date Magic on the Application Server:**
- Most DateTime expressions in Mendix (e.g., `formatDateTime()`) have a **UTC variant** (`formatDateTimeUTC()`). The non-UTC variant formats using the **localized** (user/app) time zone; the UTC variant always formats using the raw stored UTC value.
- The course runs a worked example comparing a user in Amsterdam (UTC+2) and a user in Boston (UTC-4), each formatting the same stored DateTime with all four combinations of {localized/non-localized attribute} × {formatDateTime/formatDateTimeUTC}. The key conclusion, highlighted in the results table:
  - **When the attribute is localized → use the non-UTC expression** (`formatDateTime`) to get a correct, per-user-time-zone result on the server.
  - **When the attribute is not localized → use the UTC expression** (`formatDateTimeUTC`) to get a consistent result regardless of the acting user's time zone.
  - Mixing these up (e.g., using `formatDateTime` on a non-localized attribute) produces a value that is silently shifted by the user's time-zone offset — a common source of subtle bugs.
- Overall takeaway: DateTime handling across a round globe is inherently tricky for humans who think linearly — always test with a representative set of users/time zones rather than assuming the "obvious" behavior.

**7.7 Exercise — See DateTime Values at Work:**
Running the app as `Adrian/Mendix123`, opening a match's Edit Match popup shows Localized vs. Non-localized date/time side by side; when the browser is in the Europe/Amsterdam zone, the two match, and differ for any other zone. A "Test" button runs a microflow that displays all four expression results at once, e.g. (Amsterdam browser vs. Boston-timezone administrator account both tested):
```
FormatDateTime      - Localized       2 Jul 2020 18:00 -0400
FormatDateTime      - NonLocalized    2 Jul 2020 20:00 -0400
FormatDateTimeUTC   - Localized       2 Jul 2020 22:00 +0000
FormatDateTimeUTC   - NonLocalized    3 Jul 2020 00:00 +0000
```
Switching the demo user to "Administrator – Boston" and repeating the test shows how both the localized display *and* the microflow-formatted values shift, directly illustrating the interaction between the account's/browser's time zone and the choice of UTC vs. non-UTC expression.

**7.8 Summary — key takeaways (verbatim rules from the module):**
- A DateTime value is always stored as seconds since 1 Jan 1970 00:00:00 UTC.
- DateTime attributes are localized by default; this can be turned off.
- Turn off localization when the time offset isn't relevant to users.
- In the browser, localized DateTime values follow the client's time zone.
- On the application server, DateTime values follow the user/app time zone only when non-UTC expressions are used.
- Use non-UTC expressions when the attribute is localized.
- Use UTC expressions when the attribute is not localized.
- DateTime handling remains genuinely challenging even with a good grasp of the rules — always test.

**Knowledge Check — Score: 5/5 (100%)**
| # | Question | Selected Answer | Rationale |
|---|---|---|---|
| 1 | When localize is set to No, the date displayed in the client is based on the: | **UTC value** | Non-localized attributes always show the raw stored UTC value in the client, regardless of browser time zone. |
| 2 | Localizing a DateTime attribute has an effect on: | **Both client and application server** | Localization changes both how the client widget displays/captures the value and how server-side non-UTC expressions resolve it. |
| 3 | If both the App and User time zones are set, the value of the localized DateTime attribute displayed in the client depends on: | **The Client time zone** | User/App time zone settings only govern application-server-side handling (XPath/microflow expressions); the client's *displayed* localized value is always driven by the browser/device's own time zone. |
| 4 | Jane (Amsterdam, UTC+2) selects 07/11/2020 in a date picker for a non-localized attribute. What is stored in the database? | **07/11/2020 12:00 AM** | Non-localized attributes store the picked value as-is, with no time-zone conversion applied — matching the Localize=No row of the 7.3 worked-example table. |
| 5 | Nick (Amsterdam, UTC+2) selects 07/11/2020 in a date picker for a non-localized attribute. What value results if he converts it to a string using `formatDateTime` (non-UTC)? | **07/11/2020 02:00 AM** | Applying the non-UTC expression to a non-localized attribute's raw stored value still shifts it by the acting user's offset (+2h from the stored/entered value), which is exactly the "mismatched expression" pitfall highlighted in 7.6. |

---

## Module 8: Conclusion

**8.1 Summary** — recap of everything learned across the path:
1. How to decide whether to use inheritance.
2. The impact of inheritance on the database, objects, logic, and pages.
3. How to work with the FileDocument and Image entities.
4. How to improve app performance with indexes.
5. The performance impact of reference sets, and how to optimize them.
6. How to convert existing app data after type and structural domain-model changes.
7. How to use self-references and query them correctly (including in reverse).
8. How to present and communicate the right DateTime values in combination with time zones and localization.

**8.2 Next Steps** — suggested follow-up Mendix Academy learning paths:
- Configure Advanced Security
- Learn How to Administer your Apps
- Master Modeling Microflows

No knowledge check for this module. Completing 8.2 triggered the course-completion confirmation: *"Congratulations! You have successfully completed the learning path 'Advanced Domain Model Skills.'"*

---

## Appendix — Quick Reference

**Inheritance**
- Inheritance = 2 DB tables + shared synced ID; a 1-1 association = 3 tables (more flexible, extra join).
- Ask "Is a" (→ inheritance) vs. "Has a" (→ 1-1 association).
- Use the object-type decision + Cast to work with specialized types from a generalized reference in a microflow.

**System entities**
- Never model against `System.FileDocument`/`System.Image` directly — always create a module-specific specialization for purpose, security, and maintainability.
- `DeleteAfterDownload` defaults to `false`.
- File contents live on the app server filesystem by default; can be moved to S3.

**Associations & reference sets**
- Avoid reference set "both" (`*-*`) — it's the most expensive option.
- Prefer a joining entity over a plain reference set for many-to-many data — it's faster (~3-4x in this course's benchmark) and lets you attach extra data to the relationship.
- Read ownership dots on domain-model diagrams carefully — they determine where the foreign key/ID list physically lives.

**Indexes**
- Indexes speed up reads, slow down writes — use them on larger, frequently-searched, high-cardinality attributes when reads dominate writes.
- Only Equals/Starts-with XPath conditions can use an index; Contains/Ends-with cannot.
- Match the indexed attribute to the list view's sort attribute.
- Don't index unlimited-length string attributes.

**Data conversions — "four-stage rocket"**
1. Extend the model, keep old + new side by side (suffix collisions with `_Old`).
2. Model the conversion microflow (+ admin trigger/comparison page).
3. Deploy, run the conversion, verify with a comparison page.
4. Clean up: delete old attributes first (lets Studio Pro's error list find every leftover reference), fix errors, then delete the temp microflow/page, and redeploy. Don't delay this stage.

**Self-references**
- Rename the generic `Entity_Entity` association to clearly name both roles (e.g., `Apprentice_Buddy`).
- Ownership conventionally sits on the "child" side.
- XPath toward the parent: `[Entity.SelfRef = '[%CurrentObject%]']` (read right-to-left).
- XPath toward the child (or any reversed hop in a longer path): add `[reversed()]` directly after the self-reference step — it only works on self-references and only affects the one association it's attached to.

**DateTime handling**
- Values are always stored as UTC seconds since the Unix epoch — display settings never change what's stored.
- `Localize = Yes` (default): client shows/edits values in the browser's time zone. `Localize = No`: client always shows raw UTC.
- Turn Localize off whenever the time offset isn't meaningful to the data (e.g., a schedule fixed to one location).
- On the application server: use the **non-UTC** expression (`formatDateTime`) for **localized** attributes, and the **UTC** expression (`formatDateTimeUTC`) for **non-localized** attributes. Mismatching these silently shifts the result by the acting user's offset.
- User/App/Scheduled-Event time zone settings only affect server-side (XPath/microflow) handling — the client's displayed value always follows the browser/device time zone, not these settings.
- Without a User or App time zone set, Mendix falls back to the browser's UTC offset, which cannot correctly handle Daylight Saving Time.
