# Win at Working with Data — Mendix Academy Knowledge Base

**Course:** Win at Working with Data
**Level:** Advanced
**Rating:** 4.8 ★ (162 ratings)
**Duration:** 4.0 Hrs
**Modules:** 5 (32 lectures total)
**Studio Pro Version used in exercises:** 9.12.4
**Certification track:** Prepares for the Mendix Advanced Developer Exam (Advanced Developer Certificate)

## Course Overview

This learning path teaches how Mendix applications handle, retrieve, and optimize data end-to-end — from the client-server-database architecture, through sourcing data on pages, retrieving and aggregating data in microflows, and finally querying data effectively with XPath. The course uses a running example scenario: **Car Supply**, a company selling die-cast car models, whose Mendix app (built from a starter package `WinAtWorkingWithData_9.12.4_StartPackage.mpk`) needs to manage products, orders, suppliers, and stock. Throughout the modules, hands-on exercises have the learner inspect Studio Pro console logs and generated SQL to *see* the platform's behavior directly, reinforcing performance best practices tested on the Advanced Developer Exam.

---

## Module 1 — Introduction to Working with Data

*4 lectures · 10 minutes*

### 1.1 Welcome
States the learning path's end goals: describe how Mendix handles application data across various locations; optimize page data sources for various scenarios; query data effectively with XPath.

### 1.2 Audience & Duration
A 4-hour, advanced-level path intended for learners who completed the Intermediate Certification learning paths and have hands-on Mendix Studio Pro experience.

### 1.3 Use Case
Introduces **Car Supply**, a company selling exclusive, high-end die-cast car models and modeling supplies to collectors. Their existing app manages customer orders and shipments but needs extending to better manage product base, stock, suppliers, and pricing (search, ordering, etc.). The learning path frames all exercises around investigating and extending how this app handles data.

### 1.4 Open the Application Model
Setup instructions: use Studio Pro **9.12.4** exactly (newer versions may look different). Two ways to start: (1) download and open the `.mpk` Application Model package directly in Studio Pro (select version 9.12.4 if prompted, choose extraction directory, optionally enable Team Server), or (2) open Studio Pro first and use **File > Import App Package**.

---

## Module 2 — Data in Pages

*7 lectures · 60 minutes*

### 2.1 Learning Objectives
By the end of this module: summarize how the Mendix Client, Mendix Runtime, and Database Server work together; choose a source to display data on a page.

### 2.2 Architecture Overview
Three core Mendix platform components work together to serve an app:

- **Mendix Client** — runs in the browser, built from HTML/CSS/JavaScript. Communicates with the Mendix Runtime to retrieve page definitions and data, or to trigger logic execution. Each logged-in user gets a browser session with its own local object storage (holding objects currently on display or newly changed). Clicking a button sends a signal to the Runtime (running in a JVM on a server), which executes any relevant microflows (transactions) and processes data.
- **Mendix Runtime** — the application server providing the runtime environment; sits between Client and Database. Executes logic defined in microflows plus standard object-handling logic used by Client/microflows. Runs as a Java application in a JVM. Each Client session/transaction has its own separate **transaction object cache** — caches are unique per session, don't exchange data, and can't directly affect each other; a change must be committed to the database before another session can see it. When a transaction completes, the Runtime discards the associated object cache (data may linger in the JVM until Java garbage collection, but Mendix no longer has access to it).
- **Database Server** — any Mendix-supported RDBMS (e.g. PostgreSQL, MS SQL); configurable in App Settings > Configurations. The database structure is fully driven by the Domain Model, so the app model is never dependent on the specific database used.

**Communication between Client and Runtime** — two types:
1. Requests for **static resources** (pages in XML representation, stylesheets/CSS, images) — retrieved via normal HTTP GET.
2. Requests that **trigger execution of logic** in the Runtime — JSON messages, always POSTed to the `xas/` URL on the server.

**Communication between Runtime and Database** — uses **JDBC** (Java Database Connectivity), the JavaSoft standard API for Java programs to access DBMSs. Data retrievals are internally translated: **XPath → OQL → SQL**, executed on the database server.

**Data Transformation round-trip:** user-entered form data (JS objects) → serialized to JSON → Runtime transforms JSON to Java **MxObjects** → MxObject properties bound as SQL statement parameters → DB result set transformed back to MxObjects → MxObjects serialized to JSON → sent to Client.

**Optimization of generated queries:** (1) only data required for the user action is involved; (2) efficient transport protocols are used (JSON Client↔Runtime, native SQL Runtime↔DB); (3) data already available in the Client is reused where possible (e.g. an edit/update form reuses the data already fetched for the data grid).

### 2.3 Communication Patterns
Core Mendix app functionality revolves around CRUD (Create, Read, Update, Delete) patterns. Illustrated with a customer list page and a customer edit page:

- **Read** (7 steps): Client asks Runtime for page definition → if not cached, Runtime sends it → Client renders page → Client requests data → Runtime retrieves records from DB table → DB returns data to Runtime → Runtime forwards data to Client, which updates its view.
- **Create**: Client sends an `"action": "instantiate"` request (with `objecttype` and a `preventCache` nonce) to create a new object.
- **Update** (8 steps): user selects object in table → Client requests edit form → Client shows already-available (cached) object data in the form → Client sends changed values to Runtime → Runtime gets records from DB → Runtime validates the changes → Client tells Runtime to commit → Runtime updates data and commits to DB.
- **Delete** (7 steps): Client sends delete message → Runtime forwards to DB, record deleted → Runtime confirms deletion to Client → Client re-requests updated data → Runtime gets data from DB → DB returns data → Client updates its view.

Example generated SQL for a Read: `SELECT ... FROM "ordermanagement$customer" ORDER BY "ordermanagement$customer"."id" ASC LIMIT 20`. Example Update SQL: a `SELECT ... WHERE id = ...` followed by `UPDATE "ordermanagement$customer" SET "address" = 'downtown' WHERE "id" = ...`.

### 2.4 Sourcing and Displaying Data on Pages
Covers implications of data source choices for widgets. Most simple input widgets derive content from context; widgets needing an entire object (Data View) or list of objects (Data Grid, Template Grid, List View) let you choose a data source.

**Database vs. XPath retrieval for list widgets** — both translate into SQL queries, but the **Database** option:
- Lets you specify constraints much more easily, with guided configuration in Studio Pro.
- Is the only option available in **offline mobile apps** (XPath constraints aren't supported offline because parsing complex constraints is too resource-intensive for many mobile devices; the Database option only allows simpler constraints, which is why it's safe for offline).

XPath constraints remain necessary when you need more complex constraints — spanning multiple entities, or using system variables — since the Database option only allows simple constraints on the directly retrieved entity.

**Best practice:** Use the **Database** option whenever it covers your functional needs; only use the **XPath** option when you need constraints that the Database option cannot express.

#### Exercise 2.4.1 — Analyze Requests
Hands-on: enable request logging for `ConnectionBus_Retrieve` and related log nodes (Info/Trace level) in Studio Pro's console. Open the app in browser, log in as `MxAdmin/1`, navigate to `Customer_Overview`. Add a database constraint (`Status Equals 'Bronze'`) to the data grid, then inspect the resulting SQL in the console log. Then switch the same data grid to **XPath** with the equivalent constraint `[Status='Bronze']`, repeat, and compare logs.

**Key finding:** Both the Database option and the equivalent XPath constraint generate **exactly the same SQL query** to the database — confirming they are functionally equivalent under the hood; the choice is purely about ease-of-use, offline support, and constraint complexity.

### 2.5 Summary
Recaps the architectural overview of Client/Runtime/Database Server and their communication, plus applying that theory to choosing a data source on pages.

### Knowledge Check — Data in Pages (Score: 100%)

1. **The Mendix Client is:** **Built on a combination of HTML, CSS, and JavaScript and runs in your browser.** — Directly matches the lecture's description of the Client.
2. **Static resources in Mendix:** **Include stylesheets transmitted in CSS format to the client.** — Static resources (pages/XML, stylesheets/CSS, images) are retrieved via normal HTTP GET as taught.
3. **The Communication between the Mendix Runtime and Database Server:** **Includes communication between the supported database servers using JDBC.** — Matches the lecture's explicit statement that Runtime↔DB communication uses JDBC.
4. **What is NOT an advantage of using the database source option versus the XPath option?** **The database source option can be used to specify constraints that span entities.** — This is backwards: spanning multiple entities is something only XPath constraints can do; the Database option only allows simple constraints on the retrieved entity, so this statement is false and therefore correctly identified as NOT an advantage.
5. **Will the Database data source generate a different request than the XPath data source when showing shipped orders?** **No, the database data source will always lead to the same request as the XPath data source.** — Directly confirmed by the 2.4.1 exercise, where both approaches produced identical SQL.

---

## Module 3 — Data in Microflows

*9 lectures · 90 minutes*

### 3.1 Learning Objectives
Differentiate between Database and By Association retrieves; use batches to reduce runtime memory load; optimize data handling.

### 3.2 Database vs. Association Retrieve
Microflow logic needs data from **four primary sources**:
- **Input parameter** — received through the Mendix Client, or received in a sub-microflow called from another microflow.
- **Retrieved through a Retrieve action.**
- **Created in the microflow.**
- **Return value** — from a sub-microflow, or from an integration activity.

The **Retrieve** activity has two source options: **By Association** and **From Database**.

- **By Association:** the platform first checks if the requested object(s) are already in memory (the transaction **object cache**); only retrieves from the database if not found there.
- **Difference in value:** an association retrieve returns values from the object cache, which may include **recent, not-yet-committed** changes. A database retrieve always gets the **actual committed database values**, even if the cache holds a newer uncommitted version.
- **Different number of requests:** By-association retrieval has the *best performance* when data is already cached (an in-memory, lightweight operation), and is generally *preferred* for that reason — but it can silently generate **many individual database queries** (one per object) if the association chain isn't already cached, leading to an "N+1"-style performance problem. From-database retrieval with an XPath constraint executes as **one single, more efficient SQL query**.

**Best Practice:** When performing data-intensive actions where the information is *not yet in memory*, perform the retrieve on the database directly for best performance (the DB server is optimized for handling data). However, don't query the database more than necessary — reuse data already available in memory rather than re-retrieving it.

#### Exercise 3.2.1 — Analyze Microflow Retrieves
Uses `ACT_RetrieveSupplier`, which retrieves the same Supplier object **twice**, both by association, with debug log messages between them. First retrieve: the object isn't yet cached, so the console log shows a full SQL `SELECT` chain (RequestAnalyzer → SQL SELECT → data table result). Second retrieve of the *same* object: **no new database query is triggered** — it's served from the object cache.

Second half: two versions of a "get orders for a product" flow are compared — `Product_Orders_Association` (retrieve by association, looping through many OrderLine associations) vs `Product_Orders_Database` (a single From-Database retrieve with an XPath constraint). The By-Association version generates a long chain of repeated `SQL: SELECT ... WHERE id = ...` calls (one per related record — an N+1 pattern), while the From-Database version generates just a **single** SQL query.

**Conclusion:** A retrieve by association is *not always* an in-memory retrieve — but this doesn't mean association retrieves should be avoided; the opposite is often true. The Mendix Runtime only converts a by-association retrieve into a database retrieve **if the data isn't already cached**, so in many cases (especially with a *single* association) it remains a cheap in-memory operation and is the best default. When multiple associations are chained, the data is much less likely to be fully cached — in that case, analyze whether the data can realistically be in memory; if not, a direct From-Database retrieve is the better choice.

### 3.3 Using Batches
**Concept:** For very large data sets (e.g. more than ~10,000 records), retrieving everything at once can strain Runtime memory. **Batching** splits the full dataset into smaller chunks (e.g. batches of 250) processed iteratively, using a **Limit/Amount** and **Offset** on the retrieve, inside a loop that increments the offset each pass.

**Sorting is critical.** Without an explicit **sort order**, the database may return records in an arbitrary/non-deterministic order across successive retrieves. Combined with an incrementing offset, this can cause records to be **skipped or processed multiple times** between iterations, since the underlying order isn't guaranteed stable. Always define a sort — ideally on a unique, stable attribute — to keep the batch process's record order static and predictable.

**Conclusion / Best Practices for batching:**
- **Amount/Limit and Offset:** keep limits to roughly **≤ 3,000** records per batch to minimize memory/cache impact; use an offset only if the retrieval constraint does not itself cause the underlying record set to shrink/change between iterations (offset should be a variable tracking your position in the list).
- **Sorting:** always sort for a predictable process order; sort on the most unique attribute available to make the retrieve stable across iterations.

#### Exercise 3.3.1 — Test Batch Processes
Uses the **`ACT_CheckStock_Batch`** microflow (nightly-style job wired to a test button) that retrieves all Products in batches, determines stock status, and sets order status per batch. Steps performed:

1. **Test with no constraint** — confirms baseline batching behavior across ~10,000 test products (grouped: Active, Sold out, End of life, Deactivated).
2. **Test a batch with a constraint** (`[BatchProduct][Status != 'Deactivated']`) — adding a status-based *exclusion* constraint alongside Limit+Offset caused records to be **skipped**, because the underlying result set changes between iterations (products flip to `Deactivated` mid-run) while the offset assumes a static set.
3. **Test a batch without Offset** — removing the offset (relying purely on the shrinking constrained set) still skipped records for the same underlying reason: `Deactivated` isn't a stable/indisputable value across the whole run.

**Conclusion — two hard rules:**
1. When using **Limit and Offset together**, ensure the attribute(s) that can *change during the run* are **not** part of the retrieve's constraint.
2. When using **Limit only** (no offset), ensure the **first batch always represents a different set** each time — i.e. the changing values (like "already processed") *should* be part of the constraint, and that value must change consistently for every processed record (e.g. flip a "processed" flag on every record as you go).

### 3.4 Data Handling Optimizations
- **Progress bars:** for microflows likely to take a long time (webservice calls, document generation, big batch jobs), configure the calling button's **Microflow settings** to show a progress bar (Blocking call, with a custom "please wait" message) so users get feedback.
- **Aggregate-list optimization (Count/Sum/Average/Min/Max):** When a microflow retrieves a list purely to **Count** (or Average/Max/Min) it, the platform automatically optimizes this into a single `SELECT COUNT(...)` SQL query rather than pulling every row into memory and counting there. **Critically, this optimization only applies if the retrieved list is not reused anywhere else** in the microflow (e.g. not also looped over). If you loop over the same list afterward, Mendix falls back to a full retrieve of all rows plus an in-Runtime count — losing the optimization.
- **Optimizing data retrieval with Indexes:** Sub-optimal XPaths / complex security XPaths / complex calculated attributes can slow retrievals. A database **index** (defined per-entity in the domain model) speeds up retrieval when the indexed attribute(s) are used in search fields, XPath constraints on list widgets, or `WHERE` clauses of OQL/SQL queries. Note: search fields using **Contains** do **not** benefit from indexes. Indexes are **ordered** — when indexing multiple attributes, queries should filter on them in the *same order* as the index to get the performance benefit; if constrained by only one attribute, that attribute must be the **first** in the index to benefit. Indexes only apply to **persistable** entities (a database concept) — non-persistable entities cannot have indexes. **Trade-off:** indexes speed up reads but slow down writes (every insert/update must also update the index page).
- **Best Practices — Using Indexes:** Start *without* indexes; only add them if a valid performance test (representative dataset + realistic scenarios) reveals a problem. **Indexing Guidelines:**
  1. Only useful on **larger tables** (little/no effect on small tables).
  2. Only on attributes that are searched on a lot (e.g. `Name` on a `User` entity).
  3. Only on attributes with **many unique values** (e.g. String) — a Boolean is a poor index candidate (roughly 50/50 split).
  4. Never on a **String – unlimited** attribute (creates unwieldy large index pages).
  5. Best when there are more **read** actions than **write** actions.
  6. Beneficial when the indexed attribute is also the **sort attribute** of a data grid.
  7. Only benefits searches using the **Starts with** function — other search modes (e.g. Contains) gain nothing from an index.
- **Task Queue:** lets you queue asynchronous background tasks (microflows/Java actions) so the runtime doses execution to avoid exceeding available memory — useful for splitting a large batch process into multiple transactions. **Limitations:** background tasks run FIFO but can execute in **parallel** across threads (no guaranteed strict single-file execution unless you cap threads to 1 with a single Runtime node); can only accept parameter types Boolean, Integer/Long, Decimal, String, Date and time, Enumeration, and committed Persistent Entity; only start executing once the *creating* transaction has fully committed (a rolled-back transaction never triggers the queued task); in Mendix versions **below 9.9.0**, total per-node parallelism is capped at **40** (across all queues combined), and failed tasks aren't auto-rescheduled without extra configuration (though a scheduled microflow can query `System.ProcessedQueueTask` to detect and retry failures).
- **Mx Assist Performance Bot:** a Studio Pro tool that inspects your app for known anti-patterns and lists potential performance issues (e.g. "Non-indexed attribute used in an XPath expression"), showing identified issue, potential impact, and a suggested fix (with an option to auto-apply, e.g. "Add index").

#### Exercise 3.4.1 — Optimize Data Handling
Compares `ACT_GetNumberOfOrders` (retrieve → Count → return, list not reused) against `ACT_GetNumberOfOrders_WithLoop` (retrieve → loop over the list → Count). Logging confirms: the first microflow generates an optimized `SELECT COUNT(...)` SQL query; the second — because the list is reused inside a loop — generates the **full unoptimized retrieve** of all matching rows, counted afterward at the Runtime level. **This concretely demonstrates the "don't reuse the list" caveat** from the theory lecture.

### 3.5 Summary
Recaps retrieving, aggregating, and optimizing data with microflows: Database vs. By Association retrieves, using batches to reduce runtime memory load, and optimizing data handling.

### Knowledge Check — Data in Microflows (Score: 100%)

1. **Which of the following is not a possible source of data for a microflow?** **A page passed as input parameter by another microflow.** — Pages are not a valid microflow parameter type; the four real sources are input parameters (variable/object), retrieve actions, objects created in-flow, and return values (sub-microflow/integration).
2. **True or false: by association will always be an in-memory retrieve.** **False, if objects aren't available in memory, a retrieve by association will automatically result in a database retrieve.** — Matches the exercise 3.2.1 conclusion: association retrieve only stays in-memory if the object is already cached.
3. **Is there ever a reason to retrieve an object from database instead of over association?** **Yes, in cases where constraints other than a single association are applicable or where stored database values are required.** — Matches the "Difference in Value" (committed vs. cached values) and multi-constraint scenarios from 3.2.
4. **In which microflow will the combination retrieve and aggregation be optimized?** **Only in microflow A** (the version without a loop reusing the retrieved list). — Directly matches the Count-optimization rule: optimization is lost once the list is reused (e.g. in a loop), as shown in exercise 3.4.1.
5. **What is an important rule to keep in mind when creating effective indexes?** **The index should have the same order of attributes defined as in search and retrieve queries in order to be available for queries.** — Matches the Indexing Guidelines' point about index attribute order mattering for multi-attribute indexes.

---

## Module 4 — XPath

*9 lectures · 75 minutes*

### 4.1 Learning Objectives
Use XPath constraints with correct syntax on pages, in microflows, and in security access rules; apply XPath functions, operators, keywords, system variables, and expressions; optimize XPath by following best practices.

### 4.2 Introduction to XPath
**What is XPath?** The main language used to navigate the domain model when querying data in a Mendix app. Uses hierarchical path expressions over entities, associations, and attributes. Chosen because it's an easy-to-understand, uniform way to describe data retrieval regardless of the underlying database.

**Where XPath appears:**
- **List widgets on pages** — as a data-source constraint option (e.g. list view, data grid).
- **Entity access rules (security)** — an XPath constraint restricts which records a role can read/write/delete (e.g. append-constraint helpers "Owner" or "Path to user...").

**XPath syntax example:** to select all `Order` objects that contain an `OrderLine` for a `Ferrari 599XX` (walking Order → OrderLine_Order → OrderLine → OrderLine_Product → Product → ProductName):
```
//OrderManagement.Order[OrderManagement.OrderLine_Order/OrderManagement.OrderLine/
OrderManagement.OrderLine_Product/OrderManagement.Product/ProductName = 'Ferrari 599XX']
```

**Token reference:**
| Token | Meaning |
|---|---|
| `//` | Queried entity — auto-generated by Studio Pro; you never write this yourself. |
| `[ ]` | An XPath constraint is always written between brackets. |
| `/` | Jump to a new node/attribute along an association path. |
| `( )` | Group constraints to indicate priority, e.g. `[(A or B) and C]`. |

**Constructing XPath constraints — 3 steps:** (1) identify the entity you're retrieving, (2) from that entity identify the path to the attribute(s)/association(s) you want to constrain on, (3) construct the expression from the building blocks.

**Tips:**
1. Know your domain model structure.
2. Have a well-named domain model — clear, non-technical entity/attribute names; **singular** entity names (`Customer` not `Customers`); **CamelCase** entity names, never underscores; **always use underscores in association names**; make association names between the same two entities **unique and descriptive** (e.g. `Price_Product` and `Price_Product_Current` rather than `Price_Product` / `Price_Product_2`).
3. Split your screen with the domain model and the XPath editor side by side.
4. Use Studio Pro's **auto-completion** (triggered by typing `[` or `/`, or via `Ctrl+Spacebar`) when constructing queries.

#### Exercise 4.2.1 — XPath Basics
Hands-on exercises: converted a `Product_Overview` data grid's database constraint (`BatchProduct Equals false`) into the equivalent XPath `[Status = 'Active']`; noted a shorthand — for Boolean attributes you can omit `= true()`/`= false()` (e.g. `[ToBeOrdered]` alone works). Implemented **XPath in a Microflow** (`ACT_GetBestSupplier`) using `[OrderManagement.SupplierProductDetail_Product = $Product]` to retrieve the lowest-price supplier for the current product (retrieve pre-sorted by `PurchasePrice`, First object). Implemented **XPath on a Security Rule**: constrained the `Customer` role's access to the `Product` entity to `[Status = 'Active']` in the entity's Access rules tab, so customers only ever see active products.

### 4.3 More XPath Options
- **Functions** — compare/test attribute values, e.g. `[contains(ProductName, 'Alfa')]` (substring match) or `[ToBeOrdered = false()]`.
- **Operators** — compare values/records, e.g. `[TotalStock > 10]`. Combine with `or`/`and`: `[ToBeOrdered = true() or Status = 'SoldOut']`, `[ToBeOrdered = true() and Status = 'SoldOut']`. **Consecutive bracketed constraints without an explicit operator are implicitly ANDed** — `[ToBeOrdered = true()][Status = 'SoldOut']` is the same as using `and`.
- **Keywords** — test whether a value exists, e.g. `[ProductName = empty]` and `[ProductName = NULL]` both return objects with an empty `ProductName`.
- **System Variables** — work with system/date-related values (e.g. `[%BeginOfCurrentDay%]`, `[%UserRole_Customer%]`, `[%YearLength%]`); must be used as **String** values, quoted. Time-related tokens combined with period-related tokens must be grouped in quotes as one expression, e.g. `[Date > ('[%BeginOfCurrentDay%] - 3 * [%YearLength%]')]` (orders from the last three years).
- **Exist Expression** — checks whether a specific to-many association is set at all, e.g. `[OrderManagement.Order_Customer/OrderManagement.Order]` returns all Customers that have at least one Order.

#### Exercise 4.3.1 — Use Extended XPath Options
- **Multiple paths with `and`:** extended `ACT_GetBestSupplier`'s constraint to also require the supplier be active: `[OrderManagement.SupplierProductDetail_Product = $Product] and [OrderManagement.SupplierProductDetail_Supplier/OrderManagement.Supplier/Active]`.
- **Using a token:** restricted the `Order` entity's Customer access rule to only the logged-in user's own orders, using a system-variable token in the path (via `OrderManagement.Order_Customer/OrderManagement.Customer/OrderManagement.Customer_Account = '[%CurrentUser%]'`-style constraint), ensuring customers can never see other customers' orders.

### 4.4 XPath Optimizations
Data retrievals are ultimately executed as SQL by the database server; the Mendix Runtime converts XPath into SQL statements. How well the underlying DB can optimize that SQL is context-specific, but several **guidelines** (not hard "laws") greatly help:

- **XPath Order:** when using multiple constraints, write the **most limiting constraint first** — the database evaluates constraints in the order written, so putting the most restrictive filter first shrinks the working set as early as possible (e.g. filter `[Status = 'Active']` before `[ToBeOrdered = true()]` rather than the reverse).
- **The `or` operator across different paths:** if constraints on *different* association paths are combined with `or`, the database can't apply one constraint to already-narrow the set before evaluating the other — **all** records must be evaluated against **both** constraints, sequentially, then merged — which is slower. It can be significantly faster to run **two separate retrieves** (each along one path) and **union/merge the resulting lists** in the microflow instead of a single `or`-based XPath.
- **The `not()` operator with an association:** using `not()` on a path forces the database into an **outer join** instead of an inner join — the outer join does all the work of an inner join *plus* the extra work of evaluating (and keeping) records that don't match. **Recommendation:** invert the logic — retrieve the *full* list of the entity, retrieve the (smaller) list you *don't* want, and **subtract** the second list from the first with a **Subtract list operation**. Same end result, often significantly faster.
- **Combine Paths:** when multiple constraints consume the **same association path** (e.g. two separate `[...]` constraints both starting `Stock_Product/Product/...`), merge them into a single sub-query at the end of the shared path using `and`/`or` inside one set of brackets — e.g. `[Stock_Product/Product[Status = 'SoldOut' and ToBeOrdered]]` instead of two separate full-path constraints, which otherwise forces the database to evaluate all unique path combinations twice.
- **Large XPaths:** limit the use of long/many-association paths. Merge queries where possible — including 3–5 entities in one query makes the database evaluate all unique combinations across every association before even applying additional constraints, exponentially increasing the resources required as more associations are added.
- **How to verify performance:** these are tips/guidelines, not requirements — most of the time they won't matter for performance. They matter most with complex domain models, big data sets, or heavy queries. Implementing them "by default" avoids having to retrofit later. To investigate actual behavior, enable **trace-level application logging** to inspect the real SQL queries fired, and (as an advanced, out-of-scope topic) analyze the database's query execution plan.

#### Exercise 4.4.1 — Optimize XPath
- **Combine Paths** applied to the SupplierProductDetail retrieve, merging two constraints sharing the `SupplierProductDetail_Product/Product` path into one bracketed sub-query.
- **`not()` Operator** applied to a scenario finding orphaned `ProfileImage` objects (not linked to either an Employee or a Customer) — original XPath used two `not(...)` clauses across associations; optimized solution instead retrieves **all** ProfileImages, retrieves **all** ProfileImages of Customers, retrieves **all** ProfileImages of Employees, then **subtracts** both from the full list to isolate the truly orphaned ones (and delete them).

### 4.5 Summary
Recaps the XPath query language: correct syntax on pages/microflows/security rules, functions/operators/keywords/system variables/expressions, and optimizing XPath via best practices. Notes a completed `.mpk` with worked exercises is available under Resources.

### Knowledge Check — XPath (Score: 100% on retake; initial attempt 80%)

1. **Which of the following is NOT a benefit that XPath provides to the Mendix Platform?** **XPath can be used to automatically generate pages and widgets to show data on.** — XPath is a query/constraint language for retrieving and constraining data, not a page/widget generator; the other three options (uniform query language regardless of DB, notation derivable by walking the domain model visually, abstracting away SQL dialect differences) are all real stated benefits.
2. **What does `[OrderManagement.OrderLine_Product/OrderManagement.OrderLine/OrderManagement.OrderLine_Order != $Order]` return?** **All the products that are ordered at least once, but not on the affected order.** — *(Note: my first attempt guessed "including on the affected order" based on SQL join/EXISTS semantics reasoning, which the platform marked incorrect; the confirmed correct answer per the knowledge check is that it excludes products also present on the affected order.)*
3. **Optimizing `[OrderLine_Product/Product/MinimalStock > 50][OrderLine_Product/Product/Status = 'Active']`:** **`[OrderManagement.OrderLine_Product/OrderManagement.Product[MinimalStock > 50 and Status = 'Active']]`** — direct application of the "Combine Paths" technique: merge the shared path and bracket both conditions together with `and`.
4. **Optimizing an `or` XPath spanning two different paths (`Stock_Product/Product/Status = 'Deactivated' or Stock_Supplier/Supplier/Active = false()`):** **The request can be optimized by splitting it into different requests and joining the results.** — matches the "or operator across different paths" guideline exactly.
5. **Which statement is NOT an XPath best practice for optimal performance?** **Do not use XPath when you can use SQL instead.** — Not a real recommendation from the course; XPath is the platform-standard, database-agnostic approach. The other three (limit associations crossed, limit `or` usage, put most constraining limit first) are all genuine taught guidelines.

---

## Module 5 — Concluding Working with Data

*2 lectures · 5 minutes · No knowledge check*

### 5.1 Concluding Working with Data
Wrap-up summary of all four content modules:
- **Data in Pages** — how data widgets trigger requests and receive data; which requests fire and what data-source options are available; optimizing requests through smart page modeling.
- **Data in Microflows** — how microflows handle data; retrieving data (available options and when to use which); optimizing triggered requests via smart use of those options.
- **XPath** — from basics through complex combined scenarios (operators, functions), plus optimizing XPath and combining it smartly with list operations.
- **Overall theme:** every module showed ways you can *influence* how application data is retrieved and handled — always keep this in mind by default when modeling, so applications start healthy from a performance standpoint.

### 5.2 Next Steps
- **Learn More:** encourages exploring other Advanced-level Mendix Academy learning paths matching the learner's skill/interest.
- **Get Certified:** completing this path (and its knowledge checks) is one of the recommended prerequisites for the **Advanced Developer Certification Exam**; passing it awards the **Advanced Developer Certificate**, showing understanding of advanced Mendix platform theory and the ability to translate it into valuable business apps.

---

## Appendix — Quick Reference: Rules of Thumb & Best Practices

**Architecture & Communication**
- Client ↔ Runtime: static resources over HTTP GET; logic-triggering requests as JSON POSTed to `xas/`.
- Runtime ↔ Database: JDBC; retrievals are converted XPath → OQL → SQL.
- Each session/transaction has its own isolated object cache; changes must be committed before other sessions see them.

**Choosing a Data Source (Pages)**
- Prefer **Database** data source over **XPath** whenever it covers your functional need — easier to configure, guided by Studio Pro, and the only option supported **offline** on mobile.
- Use **XPath** only when you need constraints the Database option can't express (multi-entity spans, system variables).
- Functionally, an equivalent Database constraint and XPath constraint generate the **same SQL**.

**Retrieves in Microflows**
- **By Association** is usually preferred (best performance, uses committed-or-cached data) — but beware it can silently trigger many small DB queries if data isn't cached (especially across multiple/chained associations).
- **From Database** is a single, more efficient query — use it when data-intensive, not already in memory, or when you specifically need the *actual committed* database value (not a possibly-uncommitted cached one) or constraints beyond a single association.
- Don't re-retrieve data you already have in memory.

**Batching Large Data Sets**
- Batch when data sets are large enough to strain Runtime memory (rule of thumb: keep each batch to **≤ ~3,000** records).
- Always apply a **sort order**, ideally on a unique attribute, to keep batches stable/predictable.
- If using **Limit + Offset**, don't let a *changing* value be part of the retrieve's constraint.
- If using **Limit only** (no offset), the constraint itself must guarantee a *different* first batch every iteration (e.g. a flag flipped on every processed record).

**Aggregation & Counting**
- `Count`/`Sum`/`Average`/`Min`/`Max` on a retrieved list is auto-optimized to a single SQL aggregate query — **but only if the list isn't reused elsewhere** in the same microflow (e.g. not also looped over).

**Indexes**
- Start without indexes; add only after a real performance test shows a problem.
- Only useful on large tables, frequently-searched & high-cardinality attributes; never on unlimited Strings or Booleans; matters most when reads >> writes; attribute order must match query order for multi-attribute indexes; only benefits **Starts with** searches (not Contains); only applies to persistable entities.

**Task Queue**
- Good for splitting large processes into asynchronous background transactions; tasks only fire after their creating transaction commits; parameter types are limited (Boolean/Integer/Decimal/String/DateTime/Enum/committed Entity); parallelism capped at 40 per node on versions below 9.9.0.

**XPath Syntax**
- `//Entity` (auto-generated), `[ ]` constraints, `/` association jump, `( )` grouping/priority.
- Consecutive `[...]` `[...]` blocks are implicitly ANDed.
- Boolean constraints can omit `= true()`/`= false()`.
- Use `empty`/`NULL` keywords to test for unset values; use exist-style association paths to test "has at least one related object".
- System variables (e.g. `[%BeginOfCurrentDay%]`) must be quoted as strings; combine with period math inside a single quoted expression.

**XPath Performance Optimization**
1. Put the **most limiting constraint first**.
2. Avoid `or` across **different** association paths — split into two retrieves and merge/union instead.
3. Avoid `not()` on an association (forces an outer join) — retrieve the full set and the unwanted subset, then **subtract**.
4. **Combine** multiple constraints that share the same path into one bracketed sub-query.
5. Keep XPaths **short** — avoid unnecessarily long/many-association chains (cost grows exponentially with entities/associations involved).
6. Verify real-world performance impact via **trace-level logging** of generated SQL before/after optimizing; these are guidelines, not laws — most apps never need them.

**General**
- Naming conventions matter for readable, maintainable XPath: singular CamelCase entity names, always-underscored & uniquely-named associations.
- Use Studio Pro's XPath auto-completion (`[`, `/`, or `Ctrl+Spacebar`) and split-screen domain model view to construct paths accurately.
