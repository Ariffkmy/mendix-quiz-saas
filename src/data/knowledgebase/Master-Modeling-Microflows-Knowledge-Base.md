# Master Modeling Microflows — Mendix Academy Knowledge Base

**Course:** Master Modeling Microflows
**Level:** Advanced
**Rating:** 4.8 / 5 (134 ratings)
**Duration:** ~4.0 hours
**Modules:** 6
**Studio Pro Version used in course:** 9.12.4

**Overview:** This learning path teaches how to model microflows the "advanced" way in Mendix Studio Pro. It is one of the recommended learning paths that prepares developers for the Advanced Developer Exam/Certificate. Across six modules it covers writing efficient microflow expressions and functions, retrieving and manipulating data with variables and tokens, working with lists (origins, operations, aggregation, and loops vs. list functions), designing and optimizing sub-microflows (including "get-or-create" patterns and Rules), and using the Studio Pro Debugger to diagnose runtime and logic errors. The path is built around the fictional "Car Supply" order-management demo app and combines short lecture pages, walkthrough exercises performed in Studio Pro, and a knowledge check at the end of each module.

---

## Module 1 — Introduction

Short orientation module (3 lectures, ~10 minutes) that sets expectations before diving into the technical content.

- **1.1 Welcome** — Introduces the course and welcomes the learner to the "Master Modeling Microflows" path, part of the Advanced Developer track.
- **1.2 Audience and Duration** — Describes who the course is for (developers who already know microflow basics and want to model them at an advanced/professional level) and the expected time investment (~4 hours).
- **1.3 Use Case** — Introduces the "Car Supply" demo application (an order-management app for a car-parts supplier) that is used as the running example throughout the course, including its Order, Customer, Product/Supplier, and OrderLine entities.

*(No knowledge check for this module.)*

---

## Module 2 — Microflow Expressions

Covers how to model microflow logic efficiently using variables, tokens, decisions vs. if-then-else, and the built-in expression function categories.

### 2.2 Variables
Microflow variables temporarily hold data during microflow execution. Two broad kinds:
- **Object variables** — hold a reference to a single domain-model object (e.g., `$Order`), or a **List** of objects (e.g., `$OrderList`).
- **Primitive variables** — hold a simple value: Boolean, Date and time, Decimal, Enumeration, Integer/Long, or String.
Variables are created via a **Create Variable** activity or as the automatic result of other activities (Retrieve, Create Object, Change Object with a return value, sub-microflow return values, etc.), and referenced in expressions with a `$` prefix (e.g., `$Order/Customer`).

### 2.3 Tokens
Mendix tokens are special placeholders (written as `[%TokenName%]`) that Studio Pro evaluates at runtime, usable in expressions and XPath constraints. Common tokens include:
- `[%CurrentUser%]` — the currently logged-in user object.
- `[%CurrentDateTime%]` — the current date and time.
- `[%BeginOfCurrentDay%]` / similar "BeginOf…" tokens — start-of-period timestamps (day, week, month, etc.), useful for date range filtering without time-of-day noise.
There is no `[%CurrentDay%]`, `[%CurrentTime%]`, `[%CurrentAccount%]`, or `[%CurrentDayOfWeek%]` token — these are common distractors; the real tokens follow the `Current…`/`BeginOf…`/`EndOf…` naming pattern documented in Studio Pro's expression editor autocomplete.

### 2.4 If-Then-Else vs. Exclusive Splits
Two ways to branch logic in a microflow:
- **If-then-else expressions** embed the branching inside a single expression/variable assignment (e.g., `if $A then 'X' else 'Y'`) — compact, but can quickly become unreadable when nested or combined with multiple conditions.
- **Decisions (Exclusive Split)** are separate diamond-shaped activities that visually branch the microflow into multiple paths. They are the more **readable** and maintainable choice, especially as logic grows in complexity, because each condition and its consequence is visually separated in the flow rather than buried in one expression.
- **Best practice:** favor Decisions over deeply nested if-then-else expressions for anything beyond the simplest binary choice, and favor **Rules** or **sub-microflows** to hold the underlying condition logic itself when it needs to be reused (see Module 4).

**Exercise 2.4.1 — Optimize a Microflow:** Walkthrough exercise refactoring a microflow that used a nested/complex if-then-else expression into a version using Decision activities, improving readability without changing behavior.

### 2.5 Microflow Expressions and Functions
Studio Pro's expression language provides several categories of built-in functions:
- **Boolean functions** — logical operators/tests (`and`, `or`, `not`, `isEmpty`, etc.)
- **Differentiation functions** — check the runtime type of an object (`is`)
- **Mathematical functions** — arithmetic and rounding (`round`, `abs`, min/max style operations)
- **String functions** — text manipulation (`substring`, `concat`, `trim`, `replaceAll`, `length`, etc.)
- **Date/Time functions** — date math and component extraction (`addDays`, `daysBetween`, `dayOfTheWeek`, etc.)
- **Parse/Format functions** — convert between types and formatted text, most notably **`formatDateTime($date, pattern)`**, which is the simplest way to derive things like the day-of-week name (pattern `'EEEE'` for the full name, `'E'` for the abbreviation) — much simpler than manually computing offsets from `[%BeginOfCurrentWeek%]`.

Functions can be **combined** two ways:
1. **Nested directly with parentheses** inside one expression (compact but can get hard to read).
2. **Split across multiple steps using intermediate variables** — each Create Variable/Change Variable activity captures one sub-result, which is far more readable and debuggable, especially for complex calculations.

**Exercises:**
- **2.5.1 Construct the Order Number** — build a formatted order-number string by combining string functions (e.g., taking prefixes of names) with concatenation, ideally using intermediate variables for readability.
- **2.5.2 Set the Delivery Date** — compute a delivery date using date/time functions and decisions (e.g., "ordered before 4PM" logic, weekend-skipping logic for Saturday/Friday orders) — this is the `SUB_SetOrderDeliveryDate`-style microflow referenced repeatedly in later modules.
- **2.5.3 Check Prerequisites for Ordering on Credit** — combine Boolean/decision logic to check multiple business rules (e.g., B2B customer status, credit allowed) before allowing an action, reinforcing the pattern of encapsulating multi-condition checks.

### 2.6 Summary
This module covered variables, tokens, if-then-else vs. decisions, and the main expression function categories, in preparation for combining them with data retrieval in later modules.

### Knowledge Check — Module 2
Score achieved: **100%** (after one retake).

1. **Which of the following is a valid Mendix token?** → **`[%CurrentUser%]`** — the token that returns the currently logged-in user object. (`CurrentTime`, `CurrentAccount`, `CurrentDate` are not valid Mendix tokens.)
2. **Best way to model a microflow with many checks before a Change Object activity?** → **Use Decisions, but place the checks in a sub-microflow to determine the new value, then use that sub-microflow's return value in the Change Object activity.** — keeps the main microflow clean, reusable, and independently testable.
3. **Easiest way to determine what day of the week it is?** → **Use the `formatDateTime` function** (e.g., `formatDateTime($date,'EEEE')`) — far simpler than manually computing with `[%BeginOfCurrentWeek%]` + `daysBetween` + if-then-else.
4. **Best approach to retrieve an object over an association while checking if the association exists?** → **Use a decision to first check whether the association exists; only if it does, retrieve the associated object.** — checking first avoids an unnecessary retrieve, which is more efficient than "retrieve first, then check if empty."

---

## Module 3 — Work with Lists

Covers where lists come from, how to manipulate them in-memory vs. via the database, and when to use loops vs. list functions.

### 3.2 List Origins
A list of objects in a microflow can originate from three places:
1. A **Retrieve** activity (from the database, optionally via an association or XPath constraint).
2. **Creating a new list** directly with a Create List activity (an empty in-memory list you then add objects to).
3. The result of an **input parameter** (a list passed into the microflow, e.g. from a sub-microflow call or a page action).

To empty a list you use the **Change List** activity's "Clear" action — you do *not* need to remove objects one by one. Likewise, there's no need to check that a list "isn't empty" before looping through it — looping through an empty list simply performs zero iterations.

### 3.3 List Operations
List Operations let you compute with lists **in memory**, without going back to the database. Key operations:
- **Union / Intersect / Subtract** — set-style combination of two lists.
- **Contains** — check whether a list contains a specific object.
- **Equals** — check whether two lists contain the same objects.
- **Find** — return the position of an object in a list.
- **Filter** — return a sub-list of objects whose attribute meets a condition.
- **Sort** — reorder a list by one or more attributes (ascending/descending).
- **Head** — return the first *n* objects of a list.
- **Tail** — return the list **except for the first element(s)** (i.e., "all elements in the list except the first element"), *not* just "the last element."

**"Objects in Memory" concept:** List Operations are needed instead of a fresh XPath/Retrieve whenever you're working with objects that only exist in memory (not yet committed) or when you already have the data retrieved and want to avoid a second, redundant database round-trip. Typical reasons to use a List Operation: creating report data for chart widgets, avoiding overly complex XPath constraints, and working with objects that exist only in memory — i.e., **all of the above** are valid reasons.

**Exercise 3.3.1 — Use a List Operation:** Walkthrough applying Filter/Sort/Find-style List Operations on an in-memory list instead of re-retrieving from the database.

### 3.4 Loops
Loops iterate over a list one object at a time, letting you inspect/act on each object individually. **List Functions vs. Loops:** whenever the goal can be expressed as a built-in List Operation or List Aggregation, prefer that over a manual loop — it is more concise, less error-prone, and (for aggregations placed directly after a Retrieve) can be automatically optimized into a single database query.

**List Aggregation** (Sum / Average / Count / Min / Max on a list) is a dedicated activity type. When a List Aggregation activity is placed **directly after a Retrieve** activity operating on the same list, Studio Pro automatically optimizes it into a single, lightweight database query (e.g., a `COUNT` or `SUM` at the database level) rather than pulling every record into memory first — this makes it safe and performant even for very large datasets (e.g., counting "a few thousand" customers).

**Exercise 3.4.1 — Replace a Loop with a List Operation:** Business scenario — for an order with 5+ order lines, apply a 20% discount to the single most expensive item. Original solution used an Aggregate List (max selling price) + a loop to find the matching order line. **Refactor:** remove the Aggregate List and loop; add a **Sort** list operation (Sorting: SellingPrice, Descending → `OrderLineList_Sorted`); add a **Head** list operation to grab the first (most expensive) `OrderLine`; call the existing `SUB_SetDiscount20` sub-microflow with `$OrderLine` as its argument. This "Sort-then-Head" pattern is a general-purpose replacement for "loop to find the min/max item."

### 3.5 Summary
This module covered where lists come from, how to manipulate them via List Operations without hitting the database again, and when to prefer List Functions/Aggregation over manual loops.

### Knowledge Check — Module 3
Score achieved: **100%** (after one retake).

1. **Which statement about lists is true?** → **A list can have, among others, the following origins: a retrieve action, the creation of a new list, and the result of an input parameter.**
2. **Best way to count "a few thousand" customers already known to be in the database?** → **Retrieve all the customers at once and use an aggregate list activity to count them — because directly after a retrieve, this becomes an optimized database query and stays safe/light even for big lists.**
3. **What does the List Operation `tail` do?** → **It grabs all elements in the list except the first element.** (Not "the last element" — that's a common misconception.)
4. **When would you typically use a List Operation?** → **All of these answers are correct** (report data for chart widgets, avoiding complex XPaths, and working with objects that only exist in memory are all valid reasons).

---

## Module 4 — Sub-Microflows

Covers when and how to use sub-microflows for reusability, the "get-or-create" pattern, optimizing sub-microflow reusability (single functionality, input parameters, commit placement, output parameters), and Rules as a lightweight alternative to sub-microflows.

### 4.2 Why Use Sub-Microflows
Sub-microflows extract a piece of logic into a separate, callable microflow. Three main reasons to use them:
- **Readability** — keeps the calling ("main") microflow short and easy to scan.
- **Reuse** — the same logic can be called from multiple places.
- **Maintainability** — a change to the logic only needs to happen in one place.

### 4.3 Get or Create Sub-Microflows
A common pattern: a microflow needs to either **retrieve** an existing associated object or **create** a new one if it doesn't exist yet, then show/use that object. A naive (V1) implementation duplicates the "Show page" action on both the true/false branches of a "Has account?" decision — two separate flows doing the same final step.

**Improved (V2) pattern — "get-or-create" sub-microflow:** Model this branching logic *inside a dedicated sub-microflow* (e.g., `ACT_GetOrCreateEmployeeAccount_V2`) whose **two end events are both typed as the same entity** (`Account`), so the sub-microflow always returns an `Account` object regardless of which path was taken. The calling ("main") microflow then only needs **one** Show-page action, using the sub-microflow's single output parameter — no duplicated logic, no extra decision needed in the caller.

### 4.4 Optimize Reusability
Four factors that make a sub-microflow easy to reuse:

**Single Functionality** — a sub-microflow should do one focused thing. Combining multiple unrelated pieces of logic in one sub-microflow reduces reusability (you can't reuse "part of" a microflow) and hurts testability (a microflow doing one thing can be unit-tested as a single, well-defined unit).

**Input Parameters** — pass data into a sub-microflow via input parameters rather than having the sub-microflow retrieve it itself. Example: `SUB_CheckOrderCreditAllowed_F` takes both `Customer` and `Order` as input parameters instead of retrieving `Customer` from `Order` internally — this avoids a **double-retrieve** when the calling microflow already has `Customer` in scope. **Best practice:** organize your data in the main flow (retrieve/create there) and pass as much as possible into the sub-microflow as parameters — this keeps the caller in control of the passed objects and avoids redundant retrieves.

**Committing Inside or Outside of a Sub-Microflow** — two rules:
- For an object/list **available in the main microflow and passed as an input parameter** → do **not** commit in the sub-microflow; only commit in the main microflow.
- For an object/list **created or retrieved inside the sub-microflow and not passed out as an output parameter** → **do** commit inside the sub-microflow.
Example: `SUB_SetProductStatus` commits its own batch-retrieved `Product` list internally (rule 2), while a loop calling `SUB_DetermineProductOrderStatus` per product should **not** commit inside the loop — instead the complete list is committed once in the main microflow (rule 1) to avoid poor performance from many small commits.

**Using Output Parameters** — returning a single value via an output parameter (rather than mutating a passed-in object directly) makes a sub-microflow reusable in more contexts. Example: a "get-or-create Account" sub-microflow returning the `Account` object works everywhere; a `SUB_SetOrderDeliveryDate` sub-microflow that returns *only* the computed delivery date (rather than also writing it directly onto the `Order`) can be reused even in situations where you need the date without an `Order` object in scope (e.g., showing temporary info to the user).

**Exercise 4.4.1 — Improve Sub-Microflow Usage Part 1:** Refactor a microflow that calls `SUB_Customer_ChangeStatus_1` inside a loop, where the sub-microflow itself contains a `Commit` with "Refresh in client: Yes" for every iteration. **Fix:** set `Commit`/`Refresh in client` to **No** inside the sub-microflow's Change Object activity; add a single `Commit` activity **after** the loop in the main microflow, committing the whole `CustomerList` at once. Further refinement: use a **return variable** from the sub-microflow (only building an `CustomerList_UpdatedCustomers` list via **Add to List** for objects that were actually changed) so only truly modified objects get committed.
> **Key rule: Never put a Commit activity inside a loop** — this can drastically reduce performance by making many database round-trips instead of one.

**Exercise 4.4.2 — Improve Sub-Microflow Usage Part 2:** A variant `ACT_Customer_UpgradeStatus_2` where the sub-microflow now **always** changes the `Customer` object (either to "Gold" or "Platinum", never unchanged). In this case, the earlier "only commit changed objects via a return variable" optimization is now unnecessary overhead — since the object is *always* changed, it stays in memory and is automatically available to the whole microflow scope; no need to pass it back explicitly. Removing the unused return value/extra list simplifies the microflow.
> **Key rule: Only use return values for new data that is retrieved, created, or generated in the sub-microflow** — don't return values for objects the caller already has and that are always updated.

**Exercise 4.4.3 — Improve Sub-Microflow Usage Part 3:** Examines `ACT_CommitOrder` and its sub-microflows. Two improvements: (1) In `SUB_DetermineOrderNumber`, an internal `Retrieve Customer by $Order/Order_Customer` is unnecessary because the `Customer` object is already available in the main microflow — remove the retrieve, add a second input parameter for `Customer` instead. (2) In `SUB_GetOrderLineForDiscount`, remove an internal `Retrieve` on `OrderLine` and instead add an input parameter of type **List of OrderLine** — the caller already has the list retrieved.
> **Key rule: Avoid unnecessary retrieves in sub-microflows** — if an object or variable is already available in the main microflow, pass it along to the sub-microflow as an input parameter instead of retrieving it again.

### 4.5 Rules
Rules are an alternative to sub-microflows for checking a condition. A Rule looks like a regular microflow but **always returns a Boolean or Enumeration** value, and can check attribute values or whether a mandatory association exists.

**A Rule cannot:**
- Change data in the database (Create/Delete/Change/Rollback/Commit object actions are not available in Rules).
- Perform interactions with the client (show/close forms, show messages, send validation feedback, download files).
- Call web services.
- Generate documents.
- Import XML.

**Benefits of Using Rules:** A Rule can be used **directly inside a Decision** activity (Decision Type = "Rule" instead of "Expression"), so instead of calling a sub-microflow and then branching on its Boolean return value in a separate Decision, you check the condition and branch **in one step**. This is a small but readable improvement over "sub-microflow + decision on its return value" whenever the logic fits within a Rule's restrictions.

**Exercise 4.5.1 — Use a Rule:** Create `RULE_CheckUpgradeToPlatinumStatus` (Add → Add other → Rule), modeling the exact same order-total-value check that previously lived in `SUB_Customer_ChangeStatus_3`. Implement it in the "Set to platinum?" Decision by switching Decision Type to **Rule** and selecting the new rule (with `Customer` mapped to `$IteratorCustomer`) — this removes the separate sub-microflow call from the loop.

### 4.6 Summary
This module covered when/how to use sub-microflows (including get-or-create), how to optimize them for reusability (single functionality, input parameters, correct commit placement, output parameters), and how Rules can replace simple condition-checking sub-microflows.

### Knowledge Check — Module 4
Score achieved: **100%**.

1. **Before calling a microflow as a sub-microflow inside a loop to reuse logic, what should you check?** → **All of these answers are correct** — (a) check whether retrieves in the sub-microflow for data already available in the main microflow can be passed as an input parameter instead, (b) make sure there are no commits inside the sub-microflow (bad inside a loop), and (c) if the sub-microflow uses a return value, check whether it's really needed.
2. **A microflow calls three sub-microflows, each retrieving the same entity from the database — should you change this?** → **Yes — retrieve once in the main microflow and pass it along to all three sub-microflows as an input parameter.**
3. **Which statement about Rules is true?** → **A rule can only be called from within a decision.** (Rules cannot change data, interact with the client, call web services, generate documents, or import XML — those distractor options are all things Rules explicitly *cannot* do.)
4. **What is a good reason to use a sub-microflow?** → **All of these answer options are correct** — as a "get-or-create" microflow, to reuse the same bit of logic in multiple microflows, and to increase readability of large microflows.

---

## Module 5 — Debugger

Covers the built-in consistency checker vs. the Debugger, common debugging scenarios, conditional/remote debugging, and best practices for placing breakpoints.

### 5.2 The Debugger
Studio Pro's built-in **consistency checker** validates the app for **technical errors** (shown in the Errors pane) that must be resolved before the app can run — but it cannot detect **functional** errors (logic that runs without crashing but produces the wrong result). The **Debugger** is the tool for verifying functional/runtime behavior: it lets you **pause execution** of a running microflow at a breakpoint and **inspect the state of variables**, as well as step through how the microflow acts on them. The Debugger also supports **remote debugging** of apps running in the Mendix Cloud or on other remote servers, using the Debugger pane's Connect/Disconnect, Stop Into/Stop Over/Stop Out/Continue controls and a live **Variables** pane.

### 5.3 Use the Debugger
Use the debugger when you're unable to find the root cause of a runtime error by manual inspection/reading stack traces, or when a microflow's outcome differs from what's expected. Common scenarios:

- **Application Runtime Errors** — the app user hits an error dialog; use the debugger to trace exactly which activity throws it.
- **Unexpected data from a web service call** — e.g., a `Call Web Service` activity's output is used downstream and something's wrong; is the problem in the raw web-service output, or in how the microflow processes that output afterward? Set a breakpoint at the **Call Web Service** activity itself, then step through the following activities to see where the outcome diverges from expected.
- **Unexpected Behavior** — e.g., an expected delivery date of `OrderDate + 3 days` actually comes back as `OrderDate + 2 days`. Hard to tell if this is a bad input, a wrong decision outcome (e.g., in an "Ordered before 4PM?" decision), or a bug in one of several `Change Variable` activities — step through with the debugger to isolate exactly which activity produces the wrong value.
- **Returned dataset doesn't match expectations** — could be a constraint issue in the microflow, in the variables used, or in security rules adding extra (invisible) constraints — the debugger helps distinguish between these.

**Conditional Debugger:** A breakpoint can be configured with a **breakpoint condition** (a microflow expression) so the microflow only pauses when that condition is true — very useful in batch/loop processing to avoid manually stepping through every iteration.
- **Object Value Condition** example: pause only when `$IteratorCustomer/Status = OrderManagement.CustomerStatus.Silver` (or similar), reducing the number of loop iterations you have to step through.
- **User Value Condition** example: `$CurrentUser/Name = 'admin'` — pauses the microflow **only when the current user is you**, which is strongly recommended when debugging an app running in **production**, to avoid pausing the app for other users.

**Remote Debugging:** Connect the Studio Pro Debugger pane to an app running in the Mendix Cloud or another remote server (via the "Connect Debugger" dialog — URL + password), instead of only debugging locally. Useful when: running locally but a consumed integration isn't available locally, integrations behave differently on test/acceptance vs. production, or an issue simply can't be reproduced locally. Note: **connecting to a remote server disables all existing breakpoints** — you re-enable/add them after connecting.

**Exercise 5.3.1 — Investigate the Debugger Behavior:** Business change — same-day delivery for orders placed before 4:00 PM. Walkthrough: (1) open `SUB_SetOrderDeliveryDate`, add a breakpoint on the `Create Integer/Long variable` (DayOfTheWeek) activity; (2) add the `DebugDeliveryDate` snippet to the `Order_Overview` page; (3) run the app, log in as `MxAdmin/1`, select order `10004`, click **Debug Order**; (4) when paused, use **Step into** and inspect the **Variables** pane — `DeliveryDate` initially equals `OrderDate` because that's its starting value; (5) continue stepping into activities up to (but not into) the End event, watching `DeliveryDate` update; (6) as a fix demonstration, use the debugger's **Change Variable** dialog to live-edit an activity's value to `$Order/Date` and re-run to confirm the corrected behavior. This exercise demonstrates using **Step Into** plus the **Variables** pane as the core debugging workflow, and using the debugger's live Change Variable capability to test fixes without re-deploying.

### 5.4 Place Breakpoints Successfully — Best Practices
- Make your best guess about which microflow contains the functionality you want to debug, using your knowledge of the model plus any logging/exceptions in the application console.
- If you have a theory about *which activity* causes the adverse behavior, place the breakpoint on that activity (halts execution just before it runs).
- If you have **no clue** which activity is the culprit, place a breakpoint at the **beginning** of the microflow, then inspect variables and step further through the logic to isolate the problem.
- If the adverse behavior is inside a **loop**, be careful about where you place the breakpoint — apply a **breakpoint condition** so you don't have to manually skip through every iteration.
- **Do not add breakpoints inside a loop without a break condition** — otherwise every single iteration will trigger a break again.
- **Do not debug in production** unless the issue can't be reproduced locally or in test/acceptance (e.g., production data-integrity issues or integration-specific problems) — and if you must, set a break condition on the current user so it only breaks for your own session.
- **Remove your breakpoint after fixing the issue.**
- **Use sufficient logging** to make future debugging sessions easier — clear log node names, especially around integration points and other high-risk areas, make it much faster to pinpoint where the execution flow is and where to place breakpoints.

### 5.5 Summary
This module covered when to use the debugger, how to activate/control it (including remotely), how to set breakpoints and value/user conditions, and how to examine a microflow's variables.

### Knowledge Check — Module 5
Score achieved: **100%**.

1. **Which error types does the built-in consistency checker in Studio Pro alert you to?** → **Technical issues in your model.** (Not functional gaps, memory leaks, or cloud-runtime issues — those require the Debugger or other tools.)
2. **Which of the following statements is true?** → **The output of log nodes can be used to isolate problems and place breakpoints in a smarter way.**
3. **Diagram question — a breakpoint (no visible condition) is placed on a "Cheapest product?" Decision that sits inside a loop (`IteratorOrderLine`), before a call to `SUB_SetDiscount20`. When will this microflow break?** → **Each time the breakpoint is passed** — with no breakpoint condition set, an in-loop breakpoint triggers on every single iteration (reinforcing the 5.4 best-practice rule above).
4. **Can you pause a microflow only when certain conditions are met?** → **Yes, by adding a conditional breakpoint.**

---

## Module 6 — Conclusion

### 6.1 Summary
Wrap-up of the whole "Master Modeling Microflows" learning path. By completing it, you should now be able to: use microflow expressions efficiently, perform a database retrieve, use sub-microflows, and use a debugger.

### 6.2 Next Steps
- **Learn More** — this path taught advanced microflow modeling, but there is more to learn at the advanced level; Mendix Academy offers other advanced learning paths matching different skills/interests.
- **Get Certified** — completing this path (and its knowledge checks) is one of the recommended prerequisites for the **Advanced Developer Certification exam**. Passing that exam earns the **Advanced Developer Certificate**, which shows understanding of the Mendix platform's advanced theory and the ability to translate that knowledge into valuable business apps.

*(No knowledge check for this module — it is a wrap-up only.)*

---

## Appendix — Quick Reference

A scannable distillation of the most important rules-of-thumb and best practices from the entire course.

**Readability & structure**
- Prefer **Decisions** over deeply nested if-then-else expressions once logic gets non-trivial.
- Split complex expressions across **multiple steps with intermediate variables** rather than nesting everything in one giant expression.
- Use **sub-microflows** to keep the main microflow readable, to reuse logic, and to improve maintainability and testability.
- A sub-microflow should do **one focused thing** (single functionality) to maximize reusability.

**Data retrieval & lists**
- If data is already available in the main microflow, **pass it as an input parameter** to a sub-microflow rather than re-retrieving it inside the sub-microflow (avoids double-retrieves).
- Prefer **List Operations / List Aggregation** over manual loops whenever the goal can be expressed that way — they're more concise and, for Aggregation placed directly after a Retrieve, get automatically optimized into a single database query.
- Use the **Sort + Head** pattern (instead of a loop) to find the min/max item in a list.
- `Tail` returns "all elements except the first," not "the last element" — a common source of confusion.
- Use `Change List → Clear` to empty a list; don't remove items one by one, and don't bother checking a list "isn't empty" before looping (an empty list just loops zero times).

**Commits & performance**
- **Never put a Commit activity inside a loop** — batch changes and commit once after the loop finishes.
- Commit **in the sub-microflow** only for data retrieved/created inside it that isn't passed back out; commit **in the main microflow** for anything passed in as an input parameter.
- Only use a sub-microflow **return value** for genuinely new data generated inside the sub-microflow — don't return values for objects that are always updated and already in the caller's scope (objects in memory are automatically available across the microflow).

**Get-or-create pattern**
- Model "retrieve-or-create" logic inside a sub-microflow with **two end events of the same return type**, so the caller only needs one downstream action (e.g., one Show Page) regardless of which branch was taken.

**Rules vs. sub-microflows**
- Use a **Rule** instead of a sub-microflow for simple condition checks that only need to return a Boolean/Enumeration — a Rule can be used directly inside a Decision, avoiding an extra call + separate decision step.
- Rules **cannot**: change data (create/delete/change/commit/rollback), interact with the client (show pages/messages/validation feedback, download files), call web services, generate documents, or import XML.

**Debugging**
- The **consistency checker** only catches technical/model errors; the **Debugger** is needed for functional/runtime issues.
- If you don't know where the bug is, put a breakpoint at the **start** of the microflow and step forward; if you have a theory, breakpoint that specific activity.
- **Never leave an unconditional breakpoint inside a loop** — add a **breakpoint condition** or you'll break on every single iteration.
- Use a **user-value breakpoint condition** (`$CurrentUser = ...`) when debugging in production, so only your own session pauses.
- Remove breakpoints once the issue is fixed, and rely on good **logging** (clear log node names, especially around integrations) to make future debugging easier.
- Remote debugging is available for apps in the Mendix Cloud or other remote servers, but connecting **disables existing breakpoints** — re-enable them after connecting.

**Tokens & functions**
- Valid Mendix tokens follow patterns like `[%CurrentUser%]`, `[%CurrentDateTime%]`, `[%BeginOfCurrentDay%]` — not `CurrentTime`, `CurrentAccount`, `CurrentDate`, or `CurrentDayOfWeek`.
- `formatDateTime($date, 'EEEE')` is the simplest way to get a day-of-week name — no need for manual date-math workarounds.
