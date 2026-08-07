# Constrain Your Data Using Advanced XPath

**Mendix Academy Learning Path**
Level: Advanced &nbsp;|&nbsp; Rating: 4.8 ★ (128 ratings) &nbsp;|&nbsp; Duration: ~4.0 hours &nbsp;|&nbsp; Modules: 7 &nbsp;|&nbsp; Studio Pro Version: 9.12.4

## Course Overview

This advanced learning path teaches Mendix developers how to constrain and shape application data using advanced XPath. Working with a Mendix conversion of Microsoft's AdventureWorks sample database (products, orders, customers, employees, stores), the course walks through the theoretical foundation of data retrieval (relational algebra), how Mendix translates XPath into OQL and then SQL, string/date constraint functions, logical operators (`and`, `or`, `not`), performance optimization strategies, and normalization/denormalization trade-offs. Throughout, learners complete hands-on Studio Pro exercises building list views, microflows, and domain model changes against the AdventureWorks app to reinforce each concept.

---

## Module 1 — Introduction

### 1.1 Welcome
Course learning objectives:
- Apply data selection
- Apply XPath string functions
- Use logical operators
- Increase app performance with normalization and denormalization

Requires Studio Pro 9.12.4, downloadable from the Marketplace.

### 1.2 Audience & Duration
Intended for developers who have completed the intermediate learning paths and want to go deeper into advanced Academy content. Estimated duration: ~4 hours.

### 1.3 Use Case
The course uses the AdventureWorks database from Microsoft (MIT licensed), converted into a Mendix app. Learners write XPath queries to help the fictional AdventureWorks company constrain and manage their large volume of product and order data.

*(No knowledge check for this module.)*

---

## Module 2 — Data Querying

### 2.1 Learning Objectives
- Describe the path of a query from XPath → OQL → SQL
- Apply data selection to retrieve specific data (all products, products per location, products with a review)

### 2.2 Data Selection in General
Mendix's domain model is an abstraction over a relational database. Relational databases (and therefore Mendix's data layer) are grounded in **Relational Algebra** (Edgar F. Codd), which defines five primitive operations:

| Operation | What it does | Mendix equivalent |
|---|---|---|
| **Selection** | Selects a subset of rows (objects) from an entity | XPath constraints, e.g. retrieving a specific set of objects |
| **Projection** | Selects a subset of columns (attributes) from an entity | Mendix security / attribute access rules |
| **Cartesian Product** | Combines the information of two entities into one | Associations |
| **Set Union** | Combines two lists into one containing all elements from both lists, without duplicates | List operations in microflows |
| **Set Difference** | Subtracts one list's elements from another | List operations (Subtract) in microflows |

These five operations underpin virtually everything you do with data in Mendix: XPath uses selection, security uses projection, associations use the Cartesian product concept, and Microflow list activities implement the set operations.

### 2.3 From XPath to OQL
When an XPath query is sent to the runtime, it is **not** translated directly to SQL. It goes through an intermediate language called **OQL (Object Query Language)**, which is closer to SQL syntactically, making it easier for Mendix to generate a database-specific SQL translator.

Pipeline: **Client (XPath)** → Runtime's **Query Manager** (converts to **OQL**, using schema/"Call Schema Information") → **Database Adapter** (converts OQL to **SQL** for the specific target database) → **Database**.

Example — XPath query for all Sales Representatives, selecting their LoginID and HireDate:

```
HumanResources.Employee[JobTitle = 'Sales Representative']
```

Schema information needed: `Schema(LoginID, HireDate)`

Resulting OQL:
```sql
SELECT LoginID, HireDate
FROM HumanResources.Employee
WHERE JobTitle = 'Sales Representative'
```

Resulting SQL (Microsoft SQL Server style):
```sql
SELECT HumanResources$Employee.LoginID, HumanResources$Employee.HireDate
FROM HumanResources$Employee
WHERE HumanResources$Employee.JobTitle = 'Sales Representative'
```

### 2.3.1 Exercise — Get All Currently Available Products *(hands-on)*
1. Open Studio Pro, import the module's project package (`Advanced XPath AdvancedXPath_V9.12.4_L2.2.1.mpk`).
2. Open the **Production** module → **Production_Overview** page.
3. Add a filter for products with no `SellEndDate` set (still being sold).
4. Add the XPath: `[SellEndDate = empty]` on entity `Production.Product`.

### 2.3.2 Exercise — Get Products Per Location *(hands-on)*
1. Add a new page `Inventory_Overview` (Master Detail template, `Atlas_TopBar` layout) in the `ProductManagement` folder.
2. Master list view: data source **Location** entity (from database).
3. Detail data view bound to the master's Location.
4. Add a **ListView** in the detail using a **Microflow** data source; create `DS_Product_GetProductForLocation`.
5. In the microflow, add a **Retrieve** over the `$Location` parameter using the association path:
   ```
   [Production.Product/Production.ProductInventory_Product/Production.ProductInventory/Production.ProductInventory_Location = $Location]
   ```
   (Illustrates traversing multiple associations with `/` in an XPath constraint to filter by a related entity.)
6. Copy the layout grid from `Production_Overview` into the new list view.

### 2.3.3 Exercise — Get All Products With a Review *(hands-on)*
1. On `Production_Overview`, go to the **Reviewed Products** tab.
2. Set the list view's XPath data source on `Production.Product`:
   ```
   [Production.ProductReview_Product/Production.ProductReview]
   ```
   This filters for products that have at least one associated `ProductReview` object.

### 2.4 Summary
Recap: relational algebra operations underpin Mendix data retrieval; XPath is translated to OQL then SQL; learners practiced selection queries for available products, products per location (via association traversal + microflow), and products with a review.

### Knowledge Check — Module 2
| # | Question | Selected Answer | Rationale |
|---|---|---|---|
| 1 | Which operation can be used to select a specific set of rows in a table? | **Selection** | Selection is the relational algebra operation for filtering rows/objects — matches XPath's core purpose. |
| 2 | The Set Union operation combines two lists into one that contains: | **All elements from both lists without duplicates.** | Matches the lecture's definition of Set Union. |
| 3 | What operation combines the data from two different entities into one table? | **Cartesian product** | The lecture explicitly states Cartesian Product "combines the information from two entities into one" (associations use this concept). |
| 4 | What does the Projection operation do? | **It allows you to select attributes for all objects.** | Projection = selecting a subset of columns/attributes, as defined in the lecture. |

*Score: 100% (retaken after an initial 75% — Q3 was originally answered "Set union" incorrectly).*

---

## Module 3 — Constraint Functions

### 3.1 Learning Objectives
- Apply XPath functions to retrieve data by manipulating Strings and DateTimes.

### 3.2 General Functions
Mendix provides built-in XPath functions to filter based on attribute characteristics (numbers, strings, date/time values). For numbers, arithmetic/comparison operators are typically used. For strings, functions match the start, end, or a substring of a value — the attribute being searched is always passed as the first argument.

Example — find all products whose Name contains "frame":
```
//Production.Product[contains(Name, 'frame')]
```

**Performance note:** avoid using string-search functions like `contains()` on string attributes with **unlimited length**, since this hurts performance significantly. See the [XPath Constraint Functions documentation](https://docs.mendix.com) for the full function list (not exhaustively covered in this course).

### 3.2.1 Exercise — Finding All the Washers *(hands-on)*
1. Add a **Washers** tab to `Production_Overview`.
2. Copy an existing list view into it, set data source type to **XPath**.
3. XPath: `[contains(Name, 'washer')]`
   → Matches "black washer", "washer stainless steel", etc.

### 3.2.2 Exercise — Finding All the Bikes *(hands-on)*
1. Add a **Bikes** tab to `Production_Overview`.
2. XPath: `[starts-with(ProductNumber, 'BK')]`
   → `starts-with()` is **case-insensitive**.

### 3.2.3 Exercise — Sales per Quarter *(hands-on)*
1. In the **Sales** module, add a **Sales** folder and a `Sales_Overview` page (List Default template, `Sales_Layout`).
2. Set list view data source to XPath on entity `Sales.SalesOrderHeader`.
3. XPath using the `quarter-from-dateTime()` function on the `OrderDate` attribute:
   ```
   [quarter-from-dateTime(OrderDate) = 1]
   ```
4. Add a 4-tab container (Q1–Q4); copy/adjust the list view + XPath for each quarter (`= 1`, `= 2`, `= 3`, `= 4`).

### 3.3 Summary
Covered general/string/date constraint XPath functions (`contains`, `starts-with`, `quarter-from-dateTime`) and built three tabs demonstrating them against the AdventureWorks Product and SalesOrderHeader entities.

### Knowledge Check — Module 3
| # | Question | Selected Answer | Rationale |
|---|---|---|---|
| 1 | What can you use a constraint function for? | **To filter on strings and dates in XPath queries.** | Matches the module's learning objective and content scope. |
| 2 | Which of the queries below can be used to filter on dates two weeks in the past? | **`[%BeginOfCurrentDay%] - 2 * [%WeekLength%]`** | Using `BeginOfCurrentDay` (not raw `CurrentDay`) avoids time-of-day drift, and multiplying (not adding) 2 × WeekLength correctly computes an offset of two full weeks. |
| 3 | One of your XPath queries that use the `contains()` function is not performing very well. What is the most likely root cause? | **You are using the function on a string that is set to 'unlimited'.** | Directly matches the 3.2 lecture's performance note about avoiding string functions on unlimited-length attributes. |

*Score: 100% (retaken after an initial 33% — original wrong answers were for Q2 and Q3).*

---

## Module 4 — Logical Operators

### 4.1 Learning Objectives
- Use logical operators, including "and", "or", and "not"
- Properly implement best practices when using logical operators for best performance

### 4.2 Logical Operators
Mendix supports two logical operators inside square-bracket XPath constraints: **`and`** and **`or`**. When you write multiple sets of square brackets in one XPath expression, they are **implicitly combined with `and`**. Logical operators **cannot** be used outside of the outer square brackets — doing so is invalid XPath.

Explicit `and` inside one set of brackets:
```
[Available = true()
 and
 Active = false()]
```

Implicit `and` using multiple bracket sets (equivalent to above):
```
[Available = true()]
[Active = false()]
```

Invalid — operator used outside brackets:
```
[Available = true()]
and
[Active = false()]
```

### 4.2.1 Exercise — Using the And Operator *(hands-on)*
1. Add page `ProductAssembleSellable_Overview` in `Production` → `ProductManagement` (template `List Default`, layout `Production_Layout`).
2. List view data source: XPath on `Production.Product`:
   ```
   [MakeFlag = true()
    and
    FinishedGoodsFlag = true()]
   ```
   Retrieves products that require assembly **and** are finished goods sold separately (i.e., spare parts AdventureWorks sells on their own).
3. Add the page to the `Production` module menu.

### 4.2.2 Exercise — Using the Or Operator *(hands-on)*
1. Open the **Black Items** tab on `Production_Overview`.
2. XPath on `Production.Product`:
   ```
   [Color = 'Black'
    or
    Color = 'Silver/Black']
   ```
   Retrieves products whose color is either exactly "Black" or "Silver/Black" (the `Color` attribute sometimes stores two colors as one string).

### 4.3 The Not Function
The `not()` function negates whatever expression is passed to it. **Important performance caveat:** `not()` is generally **slow**, because of the SQL query it generates internally. It is better to avoid `not()` in favor of a subtract-list operation in a microflow wherever practical.

`not()` can be used on boolean attributes:
```
[not(MakeFlag)]
```

`not()` can also negate the existence of an association — the query below finds all Products that do **not** have a link to a `ProductSubcategory`:
```
[not(Production.Product_ProductSubcategory/Production.ProductSubcategory)]
```
Mendix must internally check, for every Product, whether a related ProductSubcategory exists, which is comparatively expensive.

### 4.3.1 Exercise — Using the Not Function *(hands-on)*
1. Open the **Products without category** tab on `Production_Overview`.
2. XPath on `Production.Product`:
   ```
   [not(Production.Product_ProductSubcategory/Production.ProductSubcategory)]
   ```
   Retrieves all products with no linked subcategory.

### 4.4 Summary
Covered `and`, `or`, and `not()`, plus the syntax rules for combining them (implicit vs. explicit brackets) and the performance implications of `not()`.

### Knowledge Check — Module 4
| # | Question | Selected Answer | Rationale |
|---|---|---|---|
| 1 | When using the OR operator: | **Simply place the word 'or' between two XPath statements.** | This matches the syntax shown in the lecture (`[A or B]`) — no extra parentheses or separate bracket sets needed for `or`. |
| 2 | The not() function: | **Generates a slow query.** | Directly stated in the 4.3 lecture: `not()` is "generally slow due to the SQL query that is generated." |

*Score: 100% on first attempt.*

---

## Module 5 — Optimization

### 5.1 Learning Objectives
- Optimize XPath queries
- Develop strategies for XPath optimization
- Use OQL as an alternative to XPath

### 5.2 Different Ways to Optimize XPath Queries
Key optimization techniques:

1. **Compare against associations, not deep object paths.** Prefer comparing a variable directly against an association rather than traversing into the related entity's attribute. You typically don't need to *retrieve* the related object — just confirm the association exists/matches.
   - Sub-optimal: `[Sales.Customer_Account/Administration.Account/id = $currentUser]`
   - Optimal: `[Sales.Customer_Account = $currentUser]`

2. **Avoid `not()` — use a microflow with two retrieves + a Subtract list operation instead.** The underlying query for `not()` retrieves all data in a related sub-query, while `=`/`!=` comparisons don't. Two separate retrieves combined with a **Subtract** list activity generally outperform an XPath `not()`.
   - Example microflow pattern: Retrieve `SalesOrderHeaderWithBillToAddress` list, retrieve `AllSalesOrderHeader` list, then **Subtract** the first from the second to get `SalesOrderHeaderWithoutBillToAddressList`.

3. **Replace `and`/`or` with list operations in microflows.** An `or` can be replaced with a **Union** list operation; an `and` can be replaced with an **Intersect** list operation.

4. **Apply indexes** to speed up searching, but this comes at the cost of slower inserts/updates. Only index attributes that are searched often and change infrequently, and index the correct attribute (the one used in the selection/filter).

5. **Replace long XPath expressions with additional direct associations** in the domain model, avoiding traversal chains of more than ~5–10 entities. Trade-off: added domain model complexity and maintenance burden — only do this when performance analysis has shown a real, significant impact.

**Overall principle:** Optimize *when you encounter performance issues*, not preemptively — always balance performance against maintainability/complexity.

### 5.3 Applying Indexes Properly
Indexes should generally **not** be applied preemptively, because they make data insertion more costly. Analyze application performance first. Some cases are obvious ahead of time — e.g., a searchable customer name is rarely-changing and frequently searched, making it an ideal index candidate. Ambiguous cases (e.g., a postal code field) should be evaluated with real performance data before indexing.

### 5.3.1 Exercise — Adding Indexes to Names *(hands-on)*
1. Open the domain model in the `Person` module, double-click the `Person` entity.
2. On the **Indexes** tab, add a composite index on `FirstName`, `MiddleName`, and `LastName`.
3. Add a new `Customer_Overview` page (Sales module → Sales folder, `Sales_Layout`, List Default template).
4. Left column: `AccountNumber`. Right column: `Title`, `FirstName`, `MiddleName`, `LastName`, `Suffix` (via the Person relation).
5. Add all four searchable name attributes to the search field.
6. Add the page to the Sales menu; run and test the search.

Adding the index lets Mendix jump directly to matching rows instead of scanning every record.

### 5.4 Finding Large XPath Expressions
Studio Pro's **Find Advanced** dialog (**Edit → Find Advanced...** or **Ctrl+Shift+F**) has a "Search for: XPaths" mode with an **Optimization** section containing two checkboxes that flag potentially inefficient constructs across the whole project (including AppStore modules):
- "Limit to constraints with 'or' expression where both sides follow associations."
- "Limit to constraints with a 'not' expression with an association inside."

Running this search surfaces all XPath constraints in access rules, data grids, retrieve actions, etc. — including the intentionally-inefficient `not()` query built earlier in the module — so they can be reviewed and optimized.

### 5.4.1 Exercise — XPaths in Your App *(hands-on)*
1. **Edit → Find Advanced**, check both optimization checkboxes.
2. Click **Find** and review the results grid, which lists every module/document/element containing a flagged XPath expression.

### 5.5 OQL as an Alternative to XPath
XPath is powerful and supports visual (drag-and-drop) development, but sometimes more power is needed — this is where **OQL** comes in. OQL more closely resembles SQL and allows combining information from several entities into a new, computed entity — ideal for reporting/dashboard scenarios, since aggregation can be done in OQL itself, significantly reducing the number of separate database retrieves needed. See the [Mendix OQL documentation](https://docs.mendix.com) for the full feature list.

### 5.6 Summary
Recap of optimization principles/strategies covered, plus OQL as an XPath alternative for advanced reporting/aggregation needs.

### Knowledge Check — Module 5
| # | Question | Selected Answer | Rationale |
|---|---|---|---|
| 1 | Which statement best describes how you would retrieve all related objects in the most optimal way? | **When comparing to a related entity, it is enough to stop at the association to get the most optimal query.** | Matches lecture guidance: compare directly against the association (`[Sales.Customer_Account = $currentUser]`) rather than drilling into the related entity's attributes. |
| 2 | When should you apply an index? | **You should apply indexes on attributes that are used in searches when the performance of your app is not up to par.** | Matches the "analyze performance first, don't index preemptively" guidance from 5.3. |

*Score: 100% on first attempt.*

---

## Module 6 — Normalization and Denormalization

### 6.1 Learning Objectives
- Increase the performance of your app by normalizing or denormalizing data.

### 6.2 General Theory about Optimization
When XPath queries are already optimal but performance is still insufficient, the next lever is changing the **domain model / data storage shape** itself:

- **Normalization** — the removal of duplicate data (e.g., a customer's name stored in several places), reducing the possibility of data errors.
- **Denormalization** — the *intentional* duplication of data (e.g., copying the customer name onto an order record) to avoid extra retrieves.

These are opposite techniques — much like indexes, either one (used appropriately) can speed up a specific scenario, depending on what testing reveals.

### 6.3 Normalization
Normalization removes duplicate data. An **un-normalized** model (e.g., an Order table with no separate Customer table, repeating customer info on every order) suffers from three classic anomalies:

| Anomaly | Problem |
|---|---|
| **Insertion anomaly** | Unintended duplication — customer info must be repeated for every order. |
| **Update anomaly** | Incorrect/inconsistent data — a changed customer address must be updated in every order row, and missing one causes inconsistency. |
| **Deletion anomaly** | Potential data loss — deleting all of a customer's orders would also delete all record of that customer. |

Fix: normalize by introducing a separate `Customer` entity linked to each Order.

### 6.3.1 Exercise — Normalizing Product Reviews *(hands-on)*
1. In the `Production` domain model, add an association between `ProductReview` and `Customer` (Customer lives in the `Sales` module).
2. Once linked, remove the now-redundant `ReviewerName` and `EmailAddress` attributes from `ProductReview`, since that data can be retrieved from the associated `Customer` object instead.

### 6.4 Denormalization
The reverse of normalization: intentionally introducing duplication and accepting the associated anomalies, for reasons including:
- **Increase performance** — faster retrieval by storing data in one table instead of several (avoids joins/associations traversal).
- **Easier management of data** — e.g., introducing calculated attributes.
- **Facilitation of reporting** — retrieving many related tables can make reporting cumbersome; denormalizing speeds report generation.

### 6.5 Summary
This module was largely theoretical, covering how to increase app performance by (de)normalizing data models without changing any XPath queries — an important skill for data-driven application design.

### Knowledge Check — Module 6
| # | Question | Selected Answer | Rationale |
|---|---|---|---|
| 1 | What is normalization? | **The removal of duplicate data from your domain model.** | Directly matches the 6.2/6.3 lecture definition. |
| 2 | Why would you want to normalize your domain model? | **To remove duplicate data from your app so you can avoid insertion, update, and deletion anomalies.** | Matches the three anomalies explicitly discussed in 6.3. |
| 3 | What is denormalization? | **The duplication of information in several entities to increase performance.** | Matches the 6.4 lecture's definition and stated benefit (performance via reduced retrieves). |

*Score: 100% on first attempt.*

---

## Module 7 — Conclusion

### 7.1 Summary
Recap of the full learning path — theory behind data retrieval in relational databases, XPath functions and their use, relational (logical) operators and order-of-operations effects, how to optimize XPath, and what to do when XPath optimization alone isn't enough (normalization/denormalization).

### 7.2 Next Steps
Suggests continuing with other advanced Mendix Academy learning paths, or — once all advanced paths are completed — attempting the Advanced Certification exam.

*(No knowledge check for this module — course completion was confirmed with a "Congratulations! You have successfully completed the learning path" message.)*

---

## Appendix — Quick Reference

### Relational Algebra ↔ Mendix Mapping
- **Selection** → XPath constraints (filtering rows/objects)
- **Projection** → Security / attribute access rules (limiting columns/attributes)
- **Cartesian Product** → Associations (combining two entities)
- **Set Union** → Microflow list "Union" activity
- **Set Difference** → Microflow list "Subtract" activity

### XPath Query Pipeline
`XPath (Client)` → **Query Manager** translates to `OQL` (using schema info) → **Database Adapter** translates to `SQL` → executed against the database.

### XPath Syntax Cheat Sheet
| Pattern | Meaning |
|---|---|
| `[Attr = value]` | Basic selection constraint |
| `[Attr = empty]` | Attribute is unset/null |
| `[Attr1 = true() and Attr2 = true()]` | Explicit AND inside one bracket |
| `[Attr1 = true()][Attr2 = false()]` | Implicit AND via multiple bracket sets (same as above) |
| `[Attr1 = 'A' or Attr1 = 'B']` | OR — simply place `or` between statements, same bracket set |
| `[not(BooleanAttr)]` | Negate a boolean value |
| `[not(Module.Entity_Other/Module.Other)]` | Negate existence of an association (find objects *without* a related object) — **slow**, prefer microflow Subtract |
| `[contains(Attr, 'text')]` | Substring match (avoid on unlimited-length strings — slow) |
| `[starts-with(Attr, 'prefix')]` | Prefix match; case-insensitive |
| `[quarter-from-dateTime(DateAttr) = 1]` | Extract calendar quarter (1–4) from a date/time attribute |
| `[Entity_Assoc/OtherEntity/OtherEntity_Assoc2/Target = $param]` | Multi-hop association traversal via `/` |
| `[Assoc = $currentUser]` | **Preferred**: compare directly against an association instead of drilling into the related object's attribute |

### Operators & Functions Covered
- Logical: `and`, `or`, `not()`
- String: `contains()`, `starts-with()`
- Date/Time: `quarter-from-dateTime()`
- Special values: `empty`, `true()`, `false()`
- Placeholders (conceptual, from knowledge-check content): `%CurrentDay%`, `%BeginOfCurrentDay%`, `%WeekLength%` — prefer `BeginOfCurrentDay`-style begin-of-day markers over raw "current" markers for date range filters, and use multiplication (not addition) when scaling a unit like "week length" by a count.

### Best Practices / Rules of Thumb
- Logical operators (`and`/`or`) only work **inside** square brackets; using them outside brackets is invalid XPath.
- Multiple bracket sets in one XPath expression are implicitly ANDed together.
- Compare against an **association** directly rather than traversing into the related entity's ID/attribute when checking a relationship.
- Avoid `not()` where performance matters — it generates a comparatively expensive sub-query; prefer two retrieves + a **Subtract** list operation in a microflow.
- `or` ⇒ can be replaced with a **Union** list operation in a microflow; `and` ⇒ can be replaced with an **Intersect** list operation.
- Avoid string functions like `contains()` on attributes with **unlimited** string length.
- Don't apply database **indexes** preemptively — they slow down inserts/updates. Add them reactively, based on performance analysis, on attributes that are frequently searched and infrequently changed, and on the specific attribute used in the filter.
- Use Studio Pro's **Find Advanced** (Ctrl+Shift+F) → "XPaths" → Optimization checkboxes to locate potentially inefficient `or`/`not` XPath patterns project-wide.
- Consider replacing long, multi-hop XPath association chains (>5–10 entities) with a direct association in the domain model — but only after performance analysis justifies the added model complexity.
- **OQL** is a more SQL-like alternative to XPath, useful for combining multiple entities' data and performing aggregation (e.g., dashboards/reporting), reducing the number of separate retrieves needed.
- **Normalization** (removing duplicate data) avoids insertion/update/deletion anomalies but may require more associations/retrieves.
- **Denormalization** (intentionally duplicating data) can increase performance, ease data management (e.g., calculated attributes), and simplify reporting — at the cost of reintroducing anomalies.
- Optimize when you actually hit performance issues — don't over-engineer for hypothetical scale at the cost of maintainability.
