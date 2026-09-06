# Mendix Advanced Developer Certification — Question Bank

<!-- Source of truth for the exam question bank. Parsed by src/lib/parseQuestions.js.

     Every question is `## <topic>`, then `### <id>` + question text, then its
     options, `**Answer:** <letter>` and `**Source:** <explanation>`.

     Three shapes are supported. The type is inferred from the layout — there is
     no type marker to keep in sync:

     single      four `- A.`..`- D.` options, one correct.

     true-false  exactly two options, `- A. True` and `- B. False`, in that
                 order. The question text is the statement being judged, so
                 write it as an assertion rather than a question.

     roman       numbered `- I.`..`- V.` statements between the question text
                 and the options; the `- A.`..`- D.` options then name the
                 combinations ("I and III only"). The stem must come BEFORE the
                 statements — text after the first statement is not parsed.

     The parser fails the build on out-of-order letters or numerals, a duplicate
     id, an answer that is not among the options, and on a roman question whose
     options never reference its statements. -->

## Advanced domain modeling

### adm-1

What is the default value of the attribute DeleteAfterDownload on System.FileDocument?

- A. False
- B. True
- C. Empty
- D. It depends on the file size

**Answer:** A

**Source:** Module 3 — System Entities. DeleteAfterDownload defaults to false; when set to true the file is removed from storage after being downloaded once.

### adm-2

A DateTime attribute has Localize set to No. The date displayed in the client is based on the:

- A. Browser (client device) time zone
- B. UTC value
- C. App Settings default time zone
- D. User time zone set on the account

**Answer:** B

**Source:** Module 7 — Date Time Handling, Knowledge Check Q1. With Localize = No the client always shows the raw stored UTC value, regardless of browser or account time zone.

### adm-3

Making Goalkeeper a specialization of Player results in a single database table holding all the attributes of both entities.

- A. True
- B. False

**Answer:** B

**Source:** Module 2 — Working with Inheritance. Inheritance is stored as two tables (generalization + specialization) sharing a synchronized primary key. A 1-1 association is the three-table structure.

### adm-4

A developer has a microflow parameter typed as the generalization Player and needs to branch on whether the object is actually a Goalkeeper before reading a goalkeeper-only attribute. Which combination should they use?

- A. An exclusive split on an expression, then a Retrieve by association
- B. A Rule returning an enumeration, then a Change Object
- C. A Cast activity, then an inheritance split
- D. An object type decision, then a Cast activity

**Answer:** D

**Source:** Module 2 — Working with Inheritance. The object type decision (green diamond) branches on the concrete runtime type; the Cast activity converts the generalized variable into the specialized type so its members become available.

### adm-5

Which combination lists only the valid reasons for creating a module-specific specialization of System.Image instead of using System.Image directly?

- I. Purpose — you can add your own attributes and associations
- II. Performance — a specialization stores binary contents in fewer database tables
- III. Security — entity access can be scoped to your own specialization
- IV. Maintainability — file-handling logic stays contained and upgrade-safe

- A. I, II and III only
- B. I, III and IV only
- C. II, III and IV only
- D. I, II, III and IV

**Answer:** B

**Source:** Module 3 — System Entities. The three stated reasons are purpose, security and maintainability. Specializing actually adds a table; it is not a storage/performance optimization.

### adm-6

Where are the contents of a System.FileDocument stored by default, and what is the supported alternative?

- A. In a BLOB column of the entity table; alternatively in a separate schema
- B. On the application server filesystem; alternatively in an external object store such as Amazon S3
- C. In the Mendix Client session cache; alternatively on the app server filesystem
- D. In the System module database table; alternatively in a CDN

**Answer:** B

**Source:** Module 3 — System Entities. File contents live on the application server filesystem by default and can be reconfigured to use an external object store such as Amazon S3 for scalability.

### adm-7

Which combination of statements about modelling a many-to-many relationship is correct?

- I. A joining entity is roughly 3–4x faster than a plain reference set
- II. Reference set "both" (*-*) is the slowest and most expensive option
- III. A plain reference set is the fastest of the three approaches
- IV. All three approaches perform identically; the choice is purely stylistic

- A. I and II only
- B. I and III only
- C. II and IV only
- D. III and IV only

**Answer:** A

**Source:** Module 4 — Associations and Reference Sets. The PerformanceTest benchmark showed the joining entity pattern roughly 3–4x faster than a plain reference set, with reference set "both" (*-*) the slowest and most expensive option.

### adm-9

In the four-stage rocket data-conversion approach, why does Stage 4 delete the old attributes BEFORE fixing the remaining build errors?

- A. Because Studio Pro's error list then acts as a free to-do list of every place still referencing the old structure
- B. Because Studio Pro refuses to compile while duplicate attributes exist
- C. Because the database sync can only run when the model has no unused attributes
- D. Because the conversion microflow cannot be deleted until the attributes are gone

**Answer:** A

**Source:** Module 5 — Data Conversions. Deleting the old attributes first is a deliberate technique: the resulting error list enumerates every leftover reference so nothing is missed.

### adm-10

A developer adds a new entity and two new associations to a live production domain model. Does this structural change require a custom data-conversion microflow?

- A. True
- B. False

**Answer:** A

**Source:** Module 5 — Data Conversions. Type changes are partially handled automatically (a custom microflow is still recommended); structural changes always require a custom conversion microflow.

### adm-13

A DateTime attribute is NOT localized. On the application server, which expression should be used to format it so that every user gets a consistent result?

- A. formatDateTimeUTC()
- B. formatDateTime()
- C. formatDateTime() wrapped in parseDateTimeUTC()
- D. Either one — localization only affects the client

**Answer:** A

**Source:** Module 7 — Date Magic on the Application Server. Rule: localized attribute → non-UTC expression; non-localized attribute → UTC expression. Mismatching them silently shifts the value by the acting user’s offset.

### mf-4

What is the easiest way to determine the name of the day of the week for a given date?

- A. Use formatDateTime($date, 'EEEE')
- B. Compute daysBetween($date, [%BeginOfCurrentWeek%]) and map the number with if-then-else
- C. Use the [%CurrentDayOfWeek%] token
- D. Use a Rule returning an enumeration of weekdays

**Answer:** A

**Source:** Module 2.5 / Knowledge Check. formatDateTime with pattern 'EEEE' (or 'E' for the abbreviation) is far simpler than manual date math.

## Memory and data model optimization

### mf-1

The list operation 'tail' grabs the last element in the list.

- A. True
- B. False

**Answer:** B

**Source:** Module 3.3. Tail returns the list except for the first element(s) — 'the last element' is the common misconception the course explicitly flags. Head returns the first n objects.

### mf-2

Which combination of statements about Rules is correct?

- I. A rule always returns a Boolean or an Enumeration
- II. A rule can be used directly inside a Decision
- III. A rule can commit objects to the database
- IV. A rule can show a page or a message to the user

- A. I and II only
- B. III and IV only
- C. I, II and III only
- D. II, III and IV only

**Answer:** A

**Source:** Module 4.5. A Rule always returns a Boolean or Enumeration and can be used directly inside a Decision. Rules cannot change data, interact with the client, call web services, generate documents, or import XML.

### mf-5

A developer needs an associated object, but the association may be empty. Which approach is most efficient?

- A. Retrieve the object first, then check whether the result is empty
- B. Use a decision to check whether the association exists, and only retrieve if it does
- C. Always retrieve and rely on the null-safe expression operators downstream
- D. Retrieve from database with an XPath constraint instead of by association

**Answer:** B

**Source:** Module 2 Knowledge Check Q4. Checking the association first avoids an unnecessary retrieve, which is more efficient than "retrieve first, then check if empty".

### mf-6

Which combination of statements about lists in a microflow is correct?

- I. A list can originate from a Retrieve action
- II. A list can originate from creating a new list
- III. A list can originate from an input parameter
- IV. To empty a list you must remove its objects one at a time

- A. I and IV only
- B. I, II and III only
- C. II, III and IV only
- D. I, III and IV only

**Answer:** B

**Source:** Module 3.2. Those are the three list origins. Change List → Clear empties a list in one step, so IV is wrong; looping an empty list simply performs zero iterations.

### mf-7

A microflow must count a few thousand Customers that are known to exist in the database. What is the best approach?

- A. Loop over the customers and increment an integer variable
- B. Use a Rule returning the count as an integer
- C. Retrieve in batches of 250 and sum the batch counts
- D. Retrieve all customers and use a List Aggregation Count directly after the retrieve

**Answer:** D

**Source:** Module 3.4 / Knowledge Check. A List Aggregation placed directly after a Retrieve is automatically optimized into a single lightweight database query, staying safe even for large lists.

### mf-8

A loop currently finds the most expensive OrderLine using Aggregate List (max) plus a matching loop. Which approach is most efficient?

- A. Sort descending on SellingPrice, then Head to take the first object
- B. Filter on the max price, then use Find
- C. Use Tail after sorting ascending
- D. Replace the loop with an Intersect list operation

**Answer:** A

**Source:** Module 3.4.1. The Sort-then-Head pattern is the general-purpose replacement for "loop to find the min/max item".

### mf-9

A sub-microflow called inside a loop contains a Commit activity. This is acceptable, because committing on every iteration keeps the data consistent.

- A. True
- B. False

**Answer:** B

**Source:** Module 4.4.1 key rule: never put a Commit activity inside a loop — it causes many database round-trips and drastically hurts performance. Batch the changes and commit the whole list once in the main microflow.

### mf-10

Which commit strategy is correct for objects in sub-microflows?

- A. Always commit inside the sub-microflow, never in the caller
- B. Commit in the sub-microflow for objects passed in as parameters; commit in the caller for objects created inside
- C. Commit in the sub-microflow for objects created or retrieved inside it that are not passed out; commit in the main microflow for objects passed in as input parameters
- D. Never commit in either — always use auto-commit behavior

**Answer:** C

**Source:** Module 4.4 — Committing Inside or Outside of a Sub-Microflow. Those are the two stated rules.

### mf-11

A main microflow calls three sub-microflows, and each one retrieves the same Customer entity from the database. Should this change?

- A. No — each sub-microflow should be self-contained
- B. No — the object cache makes the extra retrieves free
- C. Yes — merge the three sub-microflows into one so the retrieve happens once
- D. Yes — retrieve once in the main microflow and pass the Customer to all three as an input parameter

**Answer:** D

**Source:** Module 4 Knowledge Check Q2 / 4.4.3. Avoid unnecessary retrieves in sub-microflows: pass data already available in the main flow as an input parameter.

### data-1

A retrieve by association will always be an in-memory retrieve.

- A. True
- B. False

**Answer:** B

**Source:** Module 3.2. The Runtime converts a by-association retrieve into a database retrieve when the data isn't already cached — across chained associations this can produce an N+1 pattern of many small queries.

### data-2

What is an important rule to keep in mind when creating effective indexes over multiple attributes?

- A. The index should have the same order of attributes as used in the search and retrieve queries
- B. The index should list the attributes in alphabetical order
- C. The index should always include a Boolean attribute to split the table evenly
- D. The index should be defined on non-persistable entities for best performance

**Answer:** A

**Source:** Module 3.4. Indexes are ordered — queries should filter on the attributes in the same order as the index. If constrained by only one attribute, that attribute must be first in the index to benefit.

### data-3

Which of the following is NOT a possible source of data for a microflow?

- A. An input parameter received from the client or a calling microflow
- B. A page passed as an input parameter by another microflow
- C. The return value of a sub-microflow or integration activity
- D. An object created inside the microflow

**Answer:** B

**Source:** Module 3 Knowledge Check Q1. Pages are not a valid microflow parameter type; the four real sources are input parameters, retrieve actions, objects created in-flow and return values.

### data-4

A microflow must read the value that is actually committed in the database, ignoring a newer uncommitted change held in the transaction cache. Which retrieve should be used?

- A. By association — the cache always mirrors the database
- B. Either, since Mendix always refreshes the cache before a retrieve
- C. From database — an association retrieve may return cached, not-yet-committed values
- D. By association, followed by a Rollback activity

**Answer:** C

**Source:** Module 3.2 — Difference in value. A database retrieve always returns the actual committed values; an association retrieve may serve recent, uncommitted changes from the object cache.

### data-5

A data grid uses the Database source with the constraint Status Equals ‘Bronze’. The same grid is switched to XPath with [Status = ‘Bronze’]. What happens to the generated SQL?

- A. The XPath version generates an extra join
- B. The Database version generates a lighter query without a WHERE clause
- C. The Database version is executed in memory instead of on the database
- D. Both generate exactly the same SQL query

**Answer:** D

**Source:** Module 2.4.1. Both approaches produce identical SQL — the choice is about ease of use, offline support and constraint complexity, not performance.

### data-6

The Database data source option can specify constraints that span multiple entities.

- A. True
- B. False

**Answer:** B

**Source:** Module 2 Knowledge Check Q4. Spanning multiple entities is something only XPath can do; the Database option allows only simple constraints on the retrieved entity.

### data-7

A batch process retrieves 10,000 Products using Limit and Offset. Records are being skipped. What is the most likely root cause?

- A. The batch size of 250 is too small for the dataset
- B. An attribute that changes during the run is part of the retrieve constraint, so the underlying set shifts between iterations
- C. The retrieve is by association instead of from database
- D. The offset variable is an Integer instead of a Long

**Answer:** B

**Source:** Module 3.3.1. Rule 1: when using Limit and Offset together, attributes that can change during the run must not be part of the constraint, or records get skipped as the result set shifts.

### data-8

Why must a batched retrieve always define a sort order?

- A. Because Mendix rejects a retrieve with an offset and no sort order
- B. Because sorting enables the aggregate-list optimization
- C. Because without a stable sort the database may return records in an arbitrary order, so an incrementing offset can skip or reprocess records
- D. Because the sort attribute is automatically indexed by the runtime

**Answer:** C

**Source:** Module 3.3. Sort on the most unique, stable attribute available so the record order stays predictable across successive offset-based retrieves.

### data-9

Microflow A retrieves Orders and counts them. Microflow B retrieves the same Orders, loops over the list, and then counts them. In which is the retrieve-plus-aggregation optimized into a single SELECT COUNT query?

- A. In neither — the optimization requires an index
- B. Only in microflow B
- C. In both
- D. Only in microflow A

**Answer:** D

**Source:** Module 3.4 / Exercise 3.4.1. The Count optimization applies only when the retrieved list is not reused elsewhere; reusing it in a loop forces a full retrieve plus an in-Runtime count.

### data-10

Which combination of statements about the Task Queue is correct?

- I. Queued tasks only start once the creating transaction has fully committed
- II. Queued tasks run in FIFO order but can execute in parallel
- III. Queued task parameters are limited to primitives and committed persistable entities
- IV. Queued tasks accept any parameter type, including non-persistable entities

- A. I, II and III only
- B. II, III and IV only
- C. I and IV only
- D. I, II and IV only

**Answer:** A

**Source:** Module 3.4 — Task Queue. Tasks fire only after the creating transaction commits; they run FIFO but can execute in parallel, and parameter types are limited to primitives and committed persistable entities.

## Security and performance

### sec-1

Entity Request has a Status attribute (Draft / Submitted / Approved). The Customer module role has exactly one access rule: read and write, with XPath constraint [Status = 'Draft']. A page shows a data grid over Request with no page-level constraint. What does a Customer see in that grid?

- A. All the requests, regardless of status
- B. All the requests in the Draft status
- C. No results, because the page has no constraint
- D. Only the Draft requests the Customer created

**Answer:** B

**Source:** Module 2 Knowledge Check. The entity-level XPath is added to every database retrieve, so it applies even though the grid itself is unconstrained. It is not scoped to the creator — that would additionally require [System.owner = '[%CurrentUser%]'].

### sec-2

You are modeling Employee and Customer entities alongside the Account entity. Which modelling approach is correct?

- A. Make Employee and Customer specializations of Account
- B. Make Account a specialization of both Employee and Customer
- C. Model Employee and Customer as separate entities, each with a 1-1 association to Account
- D. Store all employee and customer attributes directly on Account

**Answer:** C

**Source:** Module 4.3. Never inherit from User or Account for process data — specializing Account entangles login/account security with process-data security and produces conflicting restrictions. Associate instead.

### sec-3

The same Request entity has no access rule at all defined for the Administrator module role. An Administrator opening a page that shows Requests will get no results back.

- A. True
- B. False

**Answer:** A

**Source:** Module 2.10 Knowledge Check. Mendix denies by default: if no access rule grants a role access to an entity, that role gets nothing back — administrators do not bypass entity access.

### sec-4

Continuing that scenario, you grant the Administrator page access to the Request page but still define no entity access rule. What happens?

- A. Studio Pro detects an error and prevents deployment
- B. The page runs but silently shows an empty grid
- C. Mendix automatically generates a read-only access rule
- D. The page is hidden from the navigation at runtime

**Answer:** A

**Source:** Module 2.10 Knowledge Check. The 'Check security' analysis flags the inconsistency between page access and missing entity access, blocking deployment.

### sec-5

Which combination of statements about the Apply entity access setting on a microflow is correct?

- I. It adds the current user's entity XPath rules to database actions inside the microflow
- II. It should be enabled on every microflow in the app as a blanket best practice
- III. It should be enabled for anonymous and deep-link microflows handling sensitive data
- IV. A microflow with it set to No cannot call a sub-microflow that has it set to Yes

- A. I, II and III only
- B. I, III and IV only
- C. II, III and IV only
- D. I and II only

**Answer:** B

**Source:** Module 3.2–3.4. Blanket-enabling Apply entity access (II) breaks legitimate microflows that write read-only values or create logs for the user. CE0114 covers the calling restriction in IV.

### sec-6

A microflow with Apply entity access = Yes creates a Security.Counter object and writes its Count attribute. The Customer role has Create rights but only Read on the Count attribute. What does the end user see?

- A. The specific message 'Creating object of type Security.Counter failed for security reasons'
- B. A validation feedback message on the Count field
- C. The generic message 'An error occurred, please contact your system administrator', with the real cause only in the Console log
- D. Nothing — the write is silently skipped and the microflow continues

**Answer:** C

**Source:** Module 3.4.1. A denied create gives the specific message; a denied member write gives the generic UI error, and the Console log reveals “Write access denied for member 'Counter'”.

### sec-7

The ____ checkbox under System members must be enabled before the XPath option "Path to Owner" can generate [System.owner = '[%CurrentUser%]'] for an entity.

- A. Store in system context
- B. Store 'changedDate'
- C. Apply entity access
- D. Store 'owner'

**Answer:** D

**Source:** Module 2.3.1 / 3.4.2. The owner is only available if Store 'owner' is checked, and only for data created after the option was enabled — it is not applied retroactively.

### sec-8

House is a specialization of Building, which has attribute SquareFoot. The Administrator rule on Building grants SquareFoot = Read. The Administrator rule on House grants Bedrooms and SquareFoot = Read, Write. What is the result for an Administrator?

- A. Read SquareFoot in Building data views, and read and write it in House data views
- B. Read and write SquareFoot everywhere, because the specialization rule wins
- C. Read-only SquareFoot everywhere, because the generalization rule wins
- D. A consistency error — conflicting rules on an inherited attribute are not allowed

**Answer:** A

**Source:** Module 3.6 Knowledge Check. Each entity's own access rule governs its own data views, even for an inherited attribute.

### sec-9

What is the recommended value for "Default rights for new members" on an entity access rule, and why?

- A. Read — so new attributes are at least visible without extra work
- B. None — so you must consciously review the rule whenever you add an attribute or association
- C. Read/Write — so the model stays functional as it grows
- D. Inherit — so specializations stay in sync with their generalization

**Answer:** B

**Source:** Module 3.4. Setting it to None forces a deliberate review of each access rule when the entity gains members, instead of the platform silently granting access.

### sec-10

An app has roles Administrator, Teacher and Student. Admins can manage all roles; Teachers can manage users with the Student role. Which statement is FALSE?

- A. Administrators can create student accounts
- B. Teachers can reset the password of any student account in the app
- C. Administrators and teachers can create teacher accounts
- D. Administrators can create teacher accounts

**Answer:** C

**Source:** Module 4.6 Knowledge Check. Teachers manage only the Student role, so they cannot create Teacher accounts — only Administrators (User management = All) can.

### sec-11

Teachers are given User management = Selected → Student so they can manage their own class. This setting is sufficient to limit each teacher to the students in their own class.

- A. True
- B. False

**Answer:** B

**Source:** Module 4.6 Knowledge Check. User management grants access to all users holding that role; scoping to "my students" requires entity-level ownership rules on the process data instead.

### sec-12

Which combination belongs to the recommended checklist for configuring an Anonymous user role?

- I. Give the role the User module role in the System module
- II. Give the role the Administrator module role in the System module so sessions can be created
- III. Grant the role access only to necessary microflows, such as forgot-password
- IV. Remove read access to data that is not visible on the anonymous pages

- A. I, II and III only
- B. II, III and IV only
- C. I, III and IV only
- D. I, II and IV only

**Answer:** C

**Source:** Module 4.4. The Anonymous role needs at least the System User module role plus Anonymous module roles elsewhere — never an administrator-level module role.

### sec-13

A user holds two user roles, and both roles have a role-based home page defined. Which home page does Mendix open?

- A. The one with the most permissive access rules
- B. The one belonging to the first role in the user role list
- C. The app-level default home page, ignoring both role home pages
- D. Mendix raises a consistency error at design time

**Answer:** B

**Source:** Module 5.3. With multiple roles Mendix simply uses the first role in the list — reorder the list to control it, or define a combined user role for a specific role combination.

### rest-2

What must a custom authentication microflow for a published REST service return?

- A. A System.User object
- B. An HttpResponse object
- C. A Boolean indicating whether authentication succeeded
- D. The API key as a String

**Answer:** A

**Source:** Module 5 — Security. Custom authentication requires a microflow that returns a System.User object; the custom authentication parameter (e.g. an X-API-Key header) maps to that microflow's parameter.

### rest-12

Which of these is NOT a selectable authentication method in a published REST service configuration?

- A. Username and password
- B. Active session
- C. API key
- D. Custom

**Answer:** C

**Source:** Module 5 — Security. The three selectable methods are username and password, active session and custom. An API key is a typical authentication *type* implemented through custom authentication.

### rest-13

You create a dedicated user role that exists only to access the published REST service. What extra configuration is necessary to avoid deployment errors?

- A. Give it the Administrator module role in System
- B. Mark the role as the default anonymous role
- C. Set the role’s User management option to All
- D. Disable the "Check security" checkbox on that role

**Answer:** D

**Source:** Module 5 — Standard Authentication. A service-only role must have "Check security" disabled, otherwise the app raises permission errors elsewhere.

## XPath

### xpath-1

In relational algebra, which operation combines the information of two entities into one?

- A. Selection
- B. Projection
- C. Cartesian product
- D. Set union

**Answer:** C

**Source:** Module 2.2. Cartesian Product combines the information of two entities into one; associations use this concept. Selection filters rows, Projection selects columns, Set Union merges two lists without duplicates.

### xpath-2

One of your XPath queries that uses the contains() function is not performing well. What is the most likely root cause?

- A. The function is being applied to an association instead of an attribute
- B. You are using the function inside a security access rule
- C. contains() cannot be combined with the and operator
- D. You are using the function on a string attribute that is set to 'unlimited'

**Answer:** D

**Source:** Module 3.2. Avoid string-search functions such as contains() on attributes with unlimited length — it hurts performance significantly.

### xpath-3

Which concept matches this description: "selects a subset of columns for all objects of an entity, and in Mendix is implemented by attribute access rules"?

- A. Projection
- B. Selection
- C. Set difference
- D. Cartesian product

**Answer:** A

**Source:** Module 2.2. Projection selects a subset of attributes (columns); Mendix security / attribute access rules are its equivalent.

### xpath-4

What is the correct order of translation when the runtime executes an XPath query?

- A. XPath → SQL → OQL → database
- B. XPath → OQL → SQL → database
- C. XPath → JDBC → OQL → database
- D. XPath is executed directly against the database with no translation

**Answer:** B

**Source:** Module 2.3. The Query Manager converts XPath into OQL using schema information, then the Database Adapter converts OQL into the target database's SQL dialect.

### xpath-5

Consider these four XPath expressions. Which combination is valid?

- I. [Available = true() and Active = false()]
- II. [Available = true()][Active = false()]
- III. [Available = true()] and [Active = false()]
- IV. [Color = 'Black' or Color = 'Silver/Black']

- A. I, II and III only
- B. I, II and IV only
- C. II, III and IV only
- D. I, III and IV only

**Answer:** B

**Source:** Module 4.2. Logical operators can only be used inside the square brackets. Multiple bracket sets are implicitly combined with and; placing "and" between bracket sets (III) is invalid XPath.

### xpath-6

The not() function in XPath generates a slow query because of the SQL it produces internally.

- A. True
- B. False

**Answer:** A

**Source:** Module 4.3. not() is generally slow due to the generated SQL — the recommended alternative is two retrieves plus a Subtract list operation in a microflow.

### xpath-7

Which XPath filters SalesOrderHeader objects whose OrderDate falls in the second calendar quarter?

- A. [quarter-from-dateTime(OrderDate) = 2]
- B. [OrderDate = 'Q2']
- C. [month-from-dateTime(OrderDate) between 4 and 6]
- D. [contains(OrderDate, '2')]

**Answer:** A

**Source:** Module 3.2.3. quarter-from-dateTime() extracts the calendar quarter (1–4) from a DateTime attribute.

### xpath-8

A developer wants to constrain Customers to the logged-in user. Which XPath form is most efficient?

- A. [Sales.Customer_Account/Administration.Account/id = $currentUser]
- B. [Sales.Customer_Account = $currentUser]
- C. [Sales.Customer_Account/Administration.Account/Name = $currentUser/Name]
- D. [not(Sales.Customer_Account != $currentUser)]

**Answer:** B

**Source:** Module 5.2. Compare directly against the association — you rarely need to retrieve the related object, so stopping at the association produces the most optimal query.

### xpath-9

Which combination correctly pairs an XPath operator with the microflow list operation that can replace it?

- I. An XPath or can be replaced with a Union list operation
- II. An XPath and can be replaced with an Intersect list operation
- III. An XPath or can be replaced with a Subtract list operation
- IV. An XPath and can be replaced with a Filter list operation

- A. I and II only
- B. III and IV only
- C. I and IV only
- D. II and III only

**Answer:** A

**Source:** Module 5.2. An or can be replaced with a Union list operation; an and can be replaced with an Intersect list operation.

### xpath-10

Database indexes should be applied preemptively to every searchable attribute before go-live.

- A. True
- B. False

**Answer:** B

**Source:** Module 5.3. Do not index preemptively — indexes make inserts more costly. Analyze performance first, then index frequently-searched, rarely-changing attributes.

### xpath-11

An Order table repeats the customer name and address on every row. Deleting all of a customer’s orders would erase every trace of that customer. Which anomaly is this?

- A. Deletion anomaly
- B. Update anomaly
- C. Insertion anomaly
- D. Projection anomaly

**Answer:** A

**Source:** Module 6.3. The deletion anomaly is potential data loss — removing the orders also removes the only record of the customer. Insertion = unintended duplication; update = inconsistent data.

### xpath-12

A reporting dashboard needs aggregated figures combined from several entities, and XPath is already fully optimized. What is the best alternative approach?

- A. Write raw SQL through a Java action
- B. Use OQL, which resembles SQL and can aggregate across entities in one query
- C. Add indexes on every attribute involved in the report
- D. Split the report into one XPath retrieve per entity and merge them on the page

**Answer:** B

**Source:** Module 5.5. OQL is the more SQL-like alternative to XPath: it combines information from several entities and performs aggregation itself, significantly reducing the number of separate retrieves.

### adm-8

Which XPath condition can make effective use of a database index on the constrained attribute?

- A. [contains(Name, 'washer')]
- B. [ends-with(Name, 'er')]
- C. [not(Active)]
- D. [starts-with(ProductNumber, 'BK')]

**Answer:** D

**Source:** Module 5 — Indexes. Indexes work best with Equals or Starts-with conditions; Contains and Ends-with cannot use the index efficiently.

### adm-11

The self-reference Apprentice_Buddy exists on Player. A list view inside a data view on a Player must show that player's buddy (not their apprentices). Which XPath is correct?

- A. [SoccerSquad.Apprentice_Buddy = '[%CurrentObject%]']
- B. [reversed(SoccerSquad.Apprentice_Buddy) = '[%CurrentObject%]']
- C. [SoccerSquad.Apprentice_Buddy [reversed()] = '[%CurrentObject%]']
- D. [SoccerSquad.Apprentice_Buddy = '[%CurrentUser%]'] [reversed()]

**Answer:** C

**Source:** Module 6 — Self References. The plain constraint returns the apprentices of the current object; adding [reversed()] immediately after the self-reference step flips the direction so the buddy is returned.

### adm-12

Which statement about the [reversed()] expression is true?

- A. It reverses the direction of every association in the whole XPath expression
- B. It reverses the sort order of the returned list
- C. It can be used on any association whose two ends have the same cardinality
- D. It works only on self-references and affects only the one association it is attached to

**Answer:** D

**Source:** Module 6 — Self References. [reversed()] applies only to the single association step it is attached to and is only needed for self-references — for associations between two different entities Mendix determines the join direction itself.

### mf-3

Which of the following is a valid Mendix token?

- A. [%CurrentAccount%]
- B. [%CurrentTime%]
- C. [%CurrentDayOfWeek%]
- D. [%CurrentUser%]

**Answer:** D

**Source:** Module 2.3. [%CurrentUser%] returns the logged-in user object. CurrentAccount, CurrentTime and CurrentDayOfWeek are common distractors that do not exist.

### data-11

Which is the optimized form of [OrderLine_Product/Product/MinimalStock > 50][OrderLine_Product/Product/Status = ‘Active’]?

- A. [OrderLine_Product/Product/MinimalStock > 50 or OrderLine_Product/Product/Status = 'Active']
- B. [OrderManagement.OrderLine_Product/OrderManagement.Product[MinimalStock > 50 and Status = 'Active']]
- C. [not(OrderLine_Product/Product/MinimalStock <= 50)][OrderLine_Product/Product/Status = 'Active']
- D. The original form is already optimal because bracket sets are implicitly ANDed

**Answer:** B

**Source:** Module 4.4 — Combine Paths. Merging constraints that share an association path into one bracketed sub-query stops the database evaluating all unique path combinations twice.

### data-12

Which combination lists only genuine XPath best practices for optimal performance?

- I. Put the most limiting constraint first
- II. Limit the number of associations crossed in one query
- III. Do not use XPath when you can use SQL instead
- IV. Avoid or across two different association paths — split into two retrieves and merge the results

- A. I, II and III only
- B. II, III and IV only
- C. I, II and IV only
- D. I, III and IV only

**Answer:** C

**Source:** Module 4 Knowledge Check Q5. "Use SQL instead" is not a course recommendation — XPath is the platform-standard, database-agnostic approach. The other three are genuine guidelines.

## Logging

### log-1

Which field of a log message differs between viewing it in Studio Pro and viewing it in the Mendix Portal?

- A. The Timestamp field
- B. The Log node field
- C. The Source field
- D. The Log level field

**Answer:** C

**Source:** Module 2 Knowledge Check. Source identifies which node/instance in a cloud cluster emitted the message, so it only applies to cloud-deployed environments and is absent from local Studio Pro output.

### log-2

How do you ensure that your log node name is available and configurable immediately after startup?

- A. Declare the log node in the App Settings Loglevels tab
- B. Log nodes are always available; no action is required
- C. Create an enumeration key for it and set the default log level to Trace
- D. Add a log activity to a microflow that you call in the After Startup microflow

**Answer:** D

**Source:** Module 5.4.1. A log node only becomes visible once something has written to it, so register every node at startup via a sub-microflow that logs one message per node, called from After Startup.

### log-3

What is the correct order of Mendix log levels, from least to most severe?

- A. Trace, Debug, Info, Warning, Error, Critical
- B. Debug, Trace, Info, Warning, Critical, Error
- C. Info, Debug, Trace, Warning, Error, Critical
- D. Trace, Info, Debug, Error, Warning, Critical

**Answer:** A

**Source:** Module 2. The order is Trace → Debug → Info → Warning → Error → Critical; configuring a node at a level also surfaces every more-severe level above it.

### log-4

A log node is configured at Warning level. Which combination of levels will be shown for that node?

- I. Trace
- II. Info
- III. Warning
- IV. Error
- V. Critical

- A. I, II and III only
- B. III, IV and V only
- C. III only
- D. I, II, III, IV and V

**Answer:** B

**Source:** Module 2. Levels are cumulative going up in severity — Warning also surfaces Error and Critical, but not Info, Debug or Trace.

### log-5

Log messages are all generated automatically by the Mendix Runtime.

- A. True
- B. False

**Answer:** B

**Source:** Module 2 Knowledge Check. Log messages are written by the person who created the functionality being logged — both the Mendix platform/module developers and the app’s own developers write the messages for what they build.

### log-6

Why should log node names be defined in an Enumeration and read with getKey()?

- A. Because Mendix rejects free-text log node names at runtime
- B. It automatically registers the log node with the Mendix Portal
- C. Because enumerations are the only values allowed in a Log message activity
- D. It standardizes the log node name and groups every log node name in the app in one place

**Answer:** D

**Source:** Module 5.3.1 / Knowledge Check Q1. The enumeration standardizes naming and gives the team a single central list of every log node in the module.

### log-7

A Holiday Request app calls an external weather API. The call fails, but users can still submit requests without weather data. Which log level is appropriate for that error flow?

- A. Warning — you can continue, but someone should look into why the call is failing
- B. Error — every failed call is a real failure requiring action
- C. Critical — an integration failure is application-breaking
- D. Info — the failure is expected and needs no follow-up

**Answer:** A

**Source:** Module 5.5.1 / Knowledge Check Q3. Critical is overkill because the core functionality still works; the quiz’s confirmed answer is Warning — continue, but investigate.

### log-8

Which system variable exposes StatusCode, ReasonPhrase and Content in the error flow of a Call REST service action?

- A. $latestError
- B. $latestHttpResponse
- C. $currentSession/Response
- D. $HttpResponse/Latest

**Answer:** B

**Source:** Module 4 — REST call error handling. With "Custom with rollback" error handling, $latestHttpResponse becomes available with StatusCode, ReasonPhrase and Content.

### log-9

Which combination lists only the common Mendix error categories?

- I. Null pointers
- II. XPath syntax errors detected at runtime
- III. Java out of memory errors
- IV. Autocommitted objects
- V. Security errors

- A. I, II, III and IV only
- B. I, III, IV and V only
- C. II, III, IV and V only
- D. I, II, IV and V only

**Answer:** B

**Source:** Module 4. The categories covered are null pointers, security errors, mathematical errors, Java out of memory errors, autocommitted objects and application breaks on startup. Runtime XPath syntax errors are not one of them.

### log-10

Which option on a Log message activity attaches the chain of microflow calls that led to a failure?

- A. Refresh in client
- B. Include latest error
- C. Blocking
- D. Include latest stack trace

**Answer:** D

**Source:** Module 4 — Stack traces. "Include latest stack trace" attaches the call chain and is especially valuable on Log message activities inside error-handling flows.

### log-11

An operator can be notified automatically the moment an application-breaking issue is logged, by configuring Critical Logs alerts in the Mendix Portal Alerts window.

- A. True
- B. False

**Answer:** A

**Source:** Module 3. The Portal can raise alerts automatically on Critical-level log messages, so operators are notified proactively instead of watching the log stream.

### log-12

Which navigation path is used to configure per-node log levels for an app already running in the Mendix Cloud?

- A. Console > Advanced > Set log levels… in Studio Pro
- B. Deploy > Environments > [environment] > Details > Loglevels tab
- C. Run > Default Log Level in Studio Pro
- D. App Settings > Configurations > Logging

**Answer:** B

**Source:** Module 3. The Studio Pro Console path configures a locally-running app; the Portal Loglevels tab configures a deployed cloud environment.

### mf-13

An unconditional breakpoint is placed on a decision that sits inside a loop. When will the microflow break?

- A. Only on the first iteration
- B. Each time the breakpoint is passed — on every iteration
- C. Only on the last iteration
- D. Never — breakpoints inside loops are ignored by the debugger

**Answer:** B

**Source:** Module 5 Knowledge Check Q3 / 5.4. Without a breakpoint condition, an in-loop breakpoint triggers on every single iteration — hence the rule to always add a break condition inside loops.

## User experience

### rest-1

Which combination lists only the HTTP methods that are considered safe?

- I. GET
- II. POST
- III. HEAD
- IV. PUT
- V. OPTIONS

- A. I, II and III only
- B. I, III and V only
- C. II, IV and V only
- D. I, IV and V only

**Answer:** B

**Source:** Module 2 — Methods. Safe means the state of the system is not changed after the method finishes. Only GET, HEAD and OPTIONS are marked Safe in the properties table.

### rest-3

Which combination lists only the methods that are idempotent?

- I. PUT
- II. POST
- III. DELETE
- IV. HEAD

- A. I, II and III only
- B. II, III and IV only
- C. I, III and IV only
- D. I, II and IV only

**Answer:** C

**Source:** Module 2 — Properties of Methods. POST is neither safe nor idempotent because each call creates a new object. PUT, DELETE, HEAD (and GET/OPTIONS) are idempotent.

### rest-4

A consumer must fetch one specific book by its system-generated id. How should the identifier be passed?

- A. As a query parameter: /books?id=100034
- B. In the request body of the GET
- C. As a path parameter: /books/100034
- D. As a custom header: X-Book-Id: 100034

**Answer:** C

**Source:** Module 2 — GET. Use a path parameter for a single specific resource and query parameters only to filter a collection. If the path-identified resource is missing, return 404 Not Found.

### rest-5

A POST successfully creates a new Book. Which HTTP response is correct?

- A. 200 OK with an empty body
- B. 201 Created with an empty body, since the client already has the data
- C. 204 No Content with a Location header only
- D. 201 Created with the created object, including its identifier, in the body

**Answer:** D

**Source:** Module 2 — POST. Send to the collection endpoint, commit the object, set status 201 Created, and return the created object including the identifier it can be retrieved with.

### rest-6

To implement true PUT semantics in Mendix (fields missing from the request become empty), which import mapping approach is required?

- A. "Retrieve by microflow", where the microflow clears all mapped attributes before the mapping runs
- B. "Find by key", which naturally blanks unmapped attributes
- C. "Create object", so a fresh object replaces the old one entirely
- D. No special handling — Mendix already resets unmapped attributes on PUT

**Answer:** A

**Source:** Module 2 — PUT nuance. "Find by key" will not overwrite existing values with empties. Use "retrieve by microflow": the microflow retrieves the object and sets all mapped attributes to empty first, so only supplied fields get values.

### rest-7

A successful DELETE should return 204 No Content with no response body.

- A. True
- B. False

**Answer:** A

**Source:** Module 2 — DELETE. A successful DELETE returns 204 No Content and no body; a 404 is returned only if the object was not found in the first place.

### rest-8

An external system tries to update a Book, but the record has already been changed by an earlier update. Which status code fits best?

- A. 400 Bad Request
- B. 403 Forbidden
- C. 409 Conflict
- D. 500 Internal Server Error

**Answer:** C

**Source:** Module 3 — Status Codes. 409 Conflict = the object cannot be updated because of an earlier update. 400 is failed validation; 403 is authenticated but not authorized.

### rest-10

A developer builds their mapping documents from JSON snippets rather than message definitions. What is the downside?

- A. There will be no meaningful examples on the Swagger page
- B. The service cannot be secured with custom authentication
- C. PATCH operations cannot be modelled
- D. The service will not appear at /rest-doc/servicename/

**Answer:** A

**Source:** Module 4 — Examples. Only message definitions let you override the generic "string"/0 placeholders with realistic example values shown on the Swagger page.

### rest-11

Which combination lists only places where documentation can be added to a published REST service?

- I. A parameter
- II. A status code
- III. An operation's summary and description
- IV. An attribute's message definition field
- V. The selected authentication method

- A. I, II and III only
- B. I, III and IV only
- C. II, IV and V only
- D. I, III and V only

**Answer:** B

**Source:** Module 4 — Extend API with Documentation. The six documentable places are the service, a resource, an operation (summary + description), parameters, an object message definition and an attribute message definition — all GitHub Flavored Markdown. Status codes, authentication and methods are not documentable.

### err-5

A nightly scheduled event synchronizes data over REST. There is no user present. What is the appropriate error handling strategy?

- A. A Log message activity so the details can be traced later
- B. A Show message activity so the next user to log in sees the failure
- C. Validation feedback on the affected object
- D. No error handling — scheduled events retry automatically

**Answer:** A

**Source:** Module 4.3. Match the strategy to the trigger: system-triggered microflows prioritize logging (no user to notify); user-triggered microflows prioritize a friendly Show message.

### err-7

Why is it necessary to create both a log message and a user message in an error handler?

- A. Because the log message rolls back the transaction and the user message does not
- B. Because a Show message activity cannot include parameters
- C. Because the log message will not appear in the frontend
- D. Because Mendix ignores Show message activities in error flows

**Answer:** C

**Source:** Module 4 Knowledge Check. The log is only written to the server-side log files, invisible to the end user — so a separate user-facing message is needed as well.

### mf-12

A "get or create Account" sub-microflow is modelled with two end events, both typed as Account. What benefit does this give the calling microflow?

- A. The caller needs only one downstream Show page action, with no duplicated logic or extra decision
- B. The caller can skip committing the Account object
- C. The sub-microflow can be reused as a Rule inside a decision
- D. Entity access no longer needs to be applied on the Account entity

**Answer:** A

**Source:** Module 4.3 — the get-or-create pattern. Both end events returning the same entity means the sub-microflow always returns an Account, so the caller needs only one Show page action.

## Error handling

### err-1

By default, Mendix is not able to catch errors that occur inside a Java action — which is why Java actions need error handling of their own.

- A. True
- B. False

**Answer:** A

**Source:** Module 3.3. By default Mendix cannot catch errors occurring inside a Java action — the failure surfaces to the UI as the generic error and the transaction's changes are not executed, unless custom error handling is configured.

### err-2

Which error handling type rolls back everything up to the error and initiates a new transaction, so that only the changes executed in the error-handler flow are applied?

- A. Custom without rollback
- B. Custom with rollback
- C. Error End Event
- D. End Event

**Answer:** B

**Source:** Module 4.2. Custom With Rollback undoes everything up to the error and starts a new transaction. Custom Without Rollback keeps what happened before the error; Error End Event re-throws to parent microflows.

### err-3

What happens when Mendix cannot finish a transaction successfully and no error handling is implemented?

- A. The microflow is retried automatically three times before failing
- B. The transaction is committed partially, up to the failing activity
- C. The transaction is stopped and Mendix shows an error message in the user interface
- D. The error is written to the log only; the user sees nothing

**Answer:** C

**Source:** Module 3 Knowledge Check. The default behavior is to stop the transaction and display the generic "An error occurred, please contact your system administrator" message.

### err-4

Which combination correctly describes the Mendix error handling types?

- I. Custom with rollback undoes everything up to the error and starts a new transaction
- II. Custom without rollback keeps the changes made before the error
- III. Error End Event re-throws the error to all parent microflows after executing the custom activities
- IV. Error End Event silently ends the microflow without informing any caller

- A. I, II and III only
- B. II, III and IV only
- C. I, III and IV only
- D. I, II and IV only

**Answer:** A

**Source:** Module 4.2 reference table. Custom With Rollback undoes everything up to the error and starts a new transaction; Custom Without Rollback keeps what happened before it; the Error End Event executes the custom activities and then re-throws the error upward to every parent microflow.

### err-6

Fill in the blank: inside an error handler flow, the system variable ____ holds the message of the underlying exception.

- A. $latestHttpResponse/Content
- B. $latestError/Message
- C. $currentException/Text
- D. $latestError/StackTrace

**Answer:** B

**Source:** Module 4.2.2 / 4.3.1. $latestError/Message is populated automatically inside an error handler and is used as a parameter in both the Log message and Show message templates.

### err-8

Adding as many layered error-handling combinations as possible makes an app more robust.

- A. True
- B. False

**Answer:** B

**Source:** Module 4.2.2 caution. Do not over-engineer error handling — overly complex handling slows down microflow evaluation and makes behavior on exception harder to predict. Keep it as simple as the situation requires.

### err-9

When building a new microflow, where should development start?

- A. At the end of the microflow, defining the desired outcome first
- B. At the start event, adding parameters first
- C. With the error-handling flow, so failures are covered from the outset
- D. With the domain model changes the microflow will require

**Answer:** A

**Source:** Module 2 Knowledge Check. Start at the end so you focus on the main functionality/outcome first, then work backwards to what must happen to get there.

### err-10

The ExcelImporter Java action StartImportByTemplate requires which inputs?

- A. A System.Image and an ExcelImporter.Column list
- B. An ExcelImporter.Template object and a System.FileDocument, plus an optional import object parameter
- C. A System.FileDocument and a String sheet name
- D. Only the uploaded FileDocument — the template is looked up automatically

**Answer:** B

**Source:** Module 2.2.3. StartImportByTemplate takes a Template object (retrieved via XPath on ExcelImporter.Template) and the import Excel document, with an optional import object parameter.

### err-11

The custom error message reveals "There is no object type selected for the template". What is the correct fix?

- A. Add a Cast activity before the Java action call
- B. Change the error handling type to Custom without rollback
- C. Select the missing object type in the properties of the Excel import template
- D. Add the Template retrieve to the parent microflow instead of the sub-microflow

**Answer:** C

**Source:** Module 5.3.1. The fix is made in the template's own configuration screen via 'Select an objecttype'.

### err-12

After connecting an object type to an Excel import template, what must be done before the template can be saved?

- A. Re-deploy the application
- B. Grant the Administrator role write access to the template entity
- C. Set the template Title attribute to a unique value
- D. Click "Connect matching attributes" to re-link the import columns

**Answer:** D

**Source:** Module 5 Knowledge Check. You must click "Connect matching attributes"; correctly connected columns then show green check marks.

### rest-9

In a REST error response, SystemMessage is mandatory and may contain technical information for developers.

- A. True
- B. False

**Answer:** A

**Source:** Module 3 — Error Messages. SystemMessage must be present and may carry technical info; UserMessage is optional and must not be technical. Stack traces must never be exposed, and the response can be a single object or a list.

<!-- Intermediate certification bank. Category is encoded in each topic heading and parsed into question.category. -->

## Intermediate exam questions — Agile and Scrum

### int-1-01

Which Scrum event takes place at the beginning of a sprint?

- A. Sprint Review
- B. Sprint Planning
- C. Sprint Retrospective
- D. Product Backlog Refinement

**Answer:** B

**Source:** Intermediate exam study guide — Agile and Scrum. Sprint Planning. It begins the sprint and establishes the goal and selected work.

### int-1-02

What is the maximum duration of the Daily Scrum?

- A. 10 minutes
- B. 15 minutes
- C. 30 minutes
- D. 60 minutes

**Answer:** B

**Source:** Intermediate exam study guide — Agile and Scrum. 15 minutes. The Daily Scrum is deliberately short and focused.

### int-1-03

Who is primarily responsible for ordering the Product Backlog by business value?

- A. Scrum Master
- B. Developer
- C. Product Owner
- D. Subject Matter Expert

**Answer:** C

**Source:** Intermediate exam study guide — Agile and Scrum. Product Owner. The PO orders work according to value and stakeholder needs.

### int-1-04

During Sprint Planning, who decides how much work the Developers can complete?

- A. The customer
- B. The Developers
- C. The Scrum Master alone
- D. The Product Owner alone

**Answer:** B

**Source:** Intermediate exam study guide — Agile and Scrum. The Developers. They understand their capacity and select a realistic sprint scope.

### int-1-05

What do story points primarily express?

- A. The exact number of development hours
- B. The financial cost of a story
- C. Relative effort or difficulty
- D. The story's business priority

**Answer:** C

**Source:** Intermediate exam study guide — Agile and Scrum. Relative effort or difficulty. Story points are comparative estimates rather than hours.

### int-1-06

Which statement best describes the Daily Scrum?

- A. It is a detailed problem-solving workshop led by the Product Owner.
- B. It is a status report delivered to the Scrum Master.
- C. It coordinates progress, plans, and impediments among Developers.
- D. It is a demonstration for external stakeholders.

**Answer:** C

**Source:** Intermediate exam study guide — Agile and Scrum. It coordinates progress, plans, and impediments. Detailed solution discussions happen separately.

### int-1-07

What is the main purpose of the Sprint Review?

- A. Inspect the increment with stakeholders and gather feedback
- B. Assign individual performance ratings
- C. Estimate the entire Product Backlog
- D. Select a new Scrum Master

**Answer:** A

**Source:** Intermediate exam study guide — Agile and Scrum. Inspect the increment with stakeholders. Feedback may lead to new or reordered backlog items.

### int-1-08

Who normally participates in the Sprint Retrospective?

- A. Only the Product Owner and customer
- B. The Scrum team
- C. All company employees
- D. Only the Developers

**Answer:** B

**Source:** Intermediate exam study guide — Agile and Scrum. The Scrum team. The retrospective examines and improves the team's way of working.

### int-1-09

Which Scrum value encourages people to communicate honestly and share impediments?

- A. Openness
- B. Velocity
- C. Estimation
- D. Prioritization

**Answer:** A

**Source:** Intermediate exam study guide — Agile and Scrum. Openness. Openness supports transparent communication; respect helps make it safe.

### int-1-10

What is the Definition of Done?

- A. The list of all future Product Backlog items
- B. A shared quality standard for considering work complete
- C. A detailed record of hours spent
- D. A description of the Product Owner role

**Answer:** B

**Source:** Intermediate exam study guide — Agile and Scrum. A shared quality standard. It states what must be true before work is called complete.

### int-1-11

Which statement about Product Backlog Refinement is correct?

- A. It is one of the five official Scrum events.
- B. It replaces Sprint Planning.
- C. It clarifies, estimates, and prepares upcoming work.
- D. It occurs only after the final sprint.

**Answer:** C

**Source:** Intermediate exam study guide — Agile and Scrum. It prepares upcoming work. Refinement is useful but is not one of the official Scrum events.

### int-1-12

What is Sprint 0 in the Academy learning path?

- A. An official Scrum event for releasing the product
- B. A preparation period before the first sprint
- C. The last sprint in a project
- D. A sprint containing no team members

**Answer:** B

**Source:** Intermediate exam study guide — Agile and Scrum. A preparation period. It can include kickoff, initial refinement, agreements, and technical discovery.

### int-1-13

What does a burndown chart show?

- A. Completed work compared with work remaining
- B. The cost of every user story
- C. The hierarchy of Scrum roles
- D. The number of production defects by user

**Answer:** A

**Source:** Intermediate exam study guide — Agile and Scrum. Completed versus remaining work. It helps the team see progress toward the sprint commitment.

### int-1-14

What is a Subject Matter Expert's main role in a Mendix Scrum project?

- A. Own and prioritize the Product Backlog
- B. Provide specialist knowledge when needed
- C. Replace the entire Development Team
- D. Approve every Daily Scrum

**Answer:** B

**Source:** Intermediate exam study guide — Agile and Scrum. Provide specialist knowledge. An SME supports the team but does not own product delivery.

### int-1-15

Why does a team use planning poker?

- A. To assign user roles in Studio Pro
- B. To compare estimates while reducing anchoring bias
- C. To calculate exact development hours
- D. To select the Product Owner

**Answer:** B

**Source:** Intermediate exam study guide — Agile and Scrum. Compare estimates and reduce anchoring. Team members reveal estimates together and discuss differences.

## Intermediate exam questions — Microflows and Nanoflows

### int-2-01

Where does a normal microflow execute?

- A. Only in the browser
- B. On the Mendix Runtime server
- C. Only inside the database
- D. Inside the App Explorer

**Answer:** B

**Source:** Intermediate exam study guide — Microflows and Nanoflows. On the Mendix Runtime server. Microflows implement server-side application logic.

### int-2-02

Which flow is designed for client-side and offline logic?

- A. Microflow
- B. Scheduled event
- C. Nanoflow
- D. Rule only

**Answer:** C

**Source:** Intermediate exam study guide — Microflows and Nanoflows. Nanoflow. Nanoflows primarily run in the browser or on the device and support offline use.

### int-2-03

What is a sub-microflow?

- A. A microflow that cannot have parameters
- B. A microflow called by another microflow
- C. A client-only JavaScript function
- D. A deleted microflow

**Answer:** B

**Source:** Intermediate exam study guide — Microflows and Nanoflows. A microflow called by another microflow. It represents a logical subsection of a larger process.

### int-2-04

What is the main benefit of using sub-microflows?

- A. They bypass security automatically.
- B. They improve maintainability, readability, and reuse.
- C. They always run offline.
- D. They remove the need for domain entities.

**Answer:** B

**Source:** Intermediate exam study guide — Microflows and Nanoflows. Maintainability, readability, and reuse. Smaller focused flows are easier to understand and change.

### int-2-05

What capability limitation does a sub-microflow have compared with a regular microflow?

- A. It cannot retrieve data.
- B. It cannot make decisions.
- C. It cannot return values.
- D. It has no inherent capability limitation.

**Answer:** D

**Source:** Intermediate exam study guide — Microflows and Nanoflows. No inherent capability limitation. A sub-microflow remains a normal microflow that happens to be called by another.

### int-2-06

What is the recommended maximum size of a typical microflow?

- A. 10 elements
- B. 15 elements
- C. 25 elements
- D. 100 elements

**Answer:** C

**Source:** Intermediate exam study guide — Microflows and Nanoflows. 25 elements. Larger flows should normally be divided into logical sub-microflows.

### int-2-07

Which prefix is recommended for a sub-microflow?

- A. `ACT_`
- B. `SUB_`
- C. `VAL_`
- D. `SCE_`

**Answer:** B

**Source:** Intermediate exam study guide — Microflows and Nanoflows. `SUB_`. The prefix makes reusable sub-flows easy to recognize.

### int-2-08

Which prefix identifies a calculated-attribute microflow?

- A. `CAL_`
- B. `DS_`
- C. `PRS_`
- D. `OCH_`

**Answer:** A

**Source:** Intermediate exam study guide — Microflows and Nanoflows. `CAL_`. A typical pattern is `CAL_Entity_Attribute`.

### int-2-09

Which list contains all five Aggregate List functions?

- A. Add, Remove, Clear, Sort, Find
- B. Sum, Average, Count, Minimum, Maximum
- C. Create, Retrieve, Commit, Delete, Rollback
- D. Join, Split, Replace, Trim, Parse

**Answer:** B

**Source:** Intermediate exam study guide — Microflows and Nanoflows. Sum, Average, Count, Minimum, Maximum. These summarize values or object counts across a list.

### int-2-10

What does a break event do inside a loop?

- A. Skips only the current iteration
- B. Restarts the current iteration
- C. Stops the entire loop
- D. Commits the iterator

**Answer:** C

**Source:** Intermediate exam study guide — Microflows and Nanoflows. Stops the entire loop. No later iterators are processed.

### int-2-11

What does a continue event do inside a loop?

- A. Stops the microflow completely
- B. Skips the rest of the current iteration and moves to the next
- C. Returns the iterator from the microflow
- D. Repeats the current object forever

**Answer:** B

**Source:** Intermediate exam study guide — Microflows and Nanoflows. Moves to the next iterator. Only the current iteration ends early.

### int-2-12

Why are batches useful?

- A. They give anonymous users more permissions.
- B. They process large data sets in smaller portions.
- C. They convert microflows into nanoflows.
- D. They translate page labels.

**Answer:** B

**Source:** Intermediate exam study guide — Microflows and Nanoflows. Process large sets in portions. Limits and offsets help prevent excessive memory usage.

### int-2-13

Which value is a microflow variable?

- A. `[%CurrentUser%]`
- B. `$Customer`
- C. `//Sales.Customer`
- D. `SUB_Customer`

**Answer:** B

**Source:** Intermediate exam study guide — Microflows and Nanoflows. `$Customer`. The dollar sign identifies a variable in a microflow expression.

### int-2-14

Which value is a Mendix token?

- A. `$Order`
- B. `Order/Amount`
- C. `[%CurrentDateTime%]`
- D. `ACT_Order_Save`

**Answer:** C

**Source:** Intermediate exam study guide — Microflows and Nanoflows. `[%CurrentDateTime%]`. Tokens are system-generated special values.

### int-2-15

Why should an online nanoflow avoid several database actions?

- A. Each database action can require a separate network request.
- B. Nanoflows cannot contain expressions.
- C. Database actions automatically delete the session.
- D. Nanoflows have no access to objects.

**Answer:** A

**Source:** Intermediate exam study guide — Microflows and Nanoflows. Separate network requests. Server-heavy online logic is often more efficient in one microflow.

## Intermediate exam questions — XPath

### int-3-01

What does an XPath constraint primarily do in Mendix?

- A. Styles page widgets
- B. Selects or restricts data
- C. Creates Java actions
- D. Configures sprint duration

**Answer:** B

**Source:** Intermediate exam study guide — XPath. Selects or restricts data. XPath follows domain-model entities, attributes, and associations.

### int-3-02

Which XPath starts from the `Order` entity in the `Sales` module?

- A. `/Sales/Order`
- B. `[Sales.Order]`
- C. `//Sales.Order`
- D. `$Sales.Order`

**Answer:** C

**Source:** Intermediate exam study guide — XPath. `//Sales.Order`. The double slash introduces a full entity selection.

### int-3-03

What is the purpose of square brackets in XPath?

- A. They enclose constraints.
- B. They define a module.
- C. They create a session.
- D. They call a sub-microflow.

**Answer:** A

**Source:** Intermediate exam study guide — XPath. Enclose constraints. Conditions inside brackets filter the selected objects.

### int-3-04

What is `/` used for in Mendix XPath?

- A. To end a query
- B. To traverse an attribute or association path
- C. To comment out a constraint
- D. To represent the current user

**Answer:** B

**Source:** Intermediate exam study guide — XPath. Traverse a member or association. Paths follow the structure of the domain model.

### int-3-05

Which condition selects orders whose amount is at least 100?

- A. `[Amount != 100]`
- B. `[Amount <= 100]`
- C. `[Amount >= 100]`
- D. `[Amount =< 100]`

**Answer:** C

**Source:** Intermediate exam study guide — XPath. `[Amount >= 100]`. `>=` means greater than or equal to.

### int-3-06

Which operator means “not equal to”?

- A. `<>`
- B. `!==`
- C. `!=`
- D. `not=`

**Answer:** C

**Source:** Intermediate exam study guide — XPath. `!=`. This returns values different from the comparison value.

### int-3-07

Which expression requires both conditions to be true?

- A. `[Amount > 0 or Status = 'Open']`
- B. `[Amount > 0 and Status = 'Open']`
- C. `[Amount > 0 not Status = 'Open']`
- D. `[Amount > 0 xor Status = 'Open']`

**Answer:** B

**Source:** Intermediate exam study guide — XPath. The expression using `and`. Both conditions must evaluate to true.

### int-3-08

How do you test whether an attribute has no assigned value?

- A. `[Status = null()]`
- B. `[Status = empty]`
- C. `[Status = false()]`
- D. `[Status = '']` only

**Answer:** B

**Source:** Intermediate exam study guide — XPath. `[Status = empty]`. `empty` tests an unassigned attribute or association.

### int-3-09

What does `not()` do?

- A. Sorts results in descending order
- B. Reverses the Boolean result of a condition
- C. Deletes matching objects
- D. Ignores entity access rules

**Answer:** B

**Source:** Intermediate exam study guide — XPath. Reverses a condition. `not(expression)` is true when its inner expression is false.

### int-3-10

Which function tests whether a string contains text?

- A. `contains()`
- B. `includes-all()`
- C. `has-text()`
- D. `find-object()`

**Answer:** A

**Source:** Intermediate exam study guide — XPath. `contains()`. It checks whether a string contains the supplied text.

### int-3-11

Which expression selects local accounts?

- A. `[IsLocalUser = true()]`
- B. `[IsLocalUser = 'true']` only
- C. `[IsLocalUser >= 1]`
- D. `[true(IsLocalUser)]`

**Answer:** A

**Source:** Intermediate exam study guide — XPath. `[IsLocalUser = true()]`. XPath Boolean functions use `true()` and `false()`.

### int-3-12

What does `[%CurrentUser%]` represent?

- A. The current user's object identifier
- B. The current page name
- C. The current application version
- D. The current sprint owner

**Answer:** A

**Source:** Intermediate exam study guide — XPath. The current user's identifier. It supports user-specific retrieves and access constraints.

### int-3-13

Where can XPath be used to protect data by role?

- A. Only in CSS files
- B. In entity access rules
- C. Only in page captions
- D. In the Scrum board

**Answer:** B

**Source:** Intermediate exam study guide — XPath. Entity access rules. These constraints are enforced by the Runtime.

### int-3-14

Why is hiding a page insufficient to secure its data?

- A. Hidden pages are always deleted.
- B. Page visibility does not replace Runtime-enforced entity access.
- C. Hidden pages disable XPath.
- D. Page access automatically grants administrator rights.

**Answer:** B

**Source:** Intermediate exam study guide — XPath. Page visibility is not data security. Entity access must secure the underlying objects and members.

### int-3-15

What does the dot (`.`) represent in a relative XPath context?

- A. The current context object
- B. The System module
- C. A wildcard for all roles
- D. The database root

**Answer:** A

**Source:** Intermediate exam study guide — XPath. The current context object. It is used in relative XPath expressions where supported.

## Intermediate exam questions — Security

### int-4-01

What does an app user role aggregate?

- A. Only page colors
- B. One or more module roles
- C. Only database indexes
- D. Scrum team responsibilities

**Answer:** B

**Source:** Intermediate exam study guide — Security. One or more module roles. App roles give end users the permissions contained in their mapped module roles.

### int-4-02

Where are module roles defined?

- A. Inside each module
- B. Only in the System module
- C. In the deployment folder
- D. In the browser session

**Answer:** A

**Source:** Intermediate exam study guide — Security. Inside each module. Module security stays self-contained and reusable.

### int-4-03

Which security level requires full page, microflow, entity, and other access configuration?

- A. Off
- B. Prototype/demo
- C. Production
- D. Anonymous

**Answer:** C

**Source:** Intermediate exam study guide — Security. Production. Production security requires complete access configuration.

### int-4-04

What is controlled by page access?

- A. Whether a role may open a page
- B. The database column type
- C. Sprint velocity
- D. The session cleanup interval

**Answer:** A

**Source:** Intermediate exam study guide — Security. Whether a role may open a page. It controls document access rather than underlying database data.

### int-4-05

What is controlled by entity access?

- A. Only the app logo
- B. Object creation/deletion and member read/write permissions
- C. Only page navigation
- D. The order of Scrum events

**Answer:** B

**Source:** Intermediate exam study guide — Security. Object and member permissions. Entity access can also include XPath constraints.

### int-4-06

How are anonymous visitors represented?

- A. They automatically become administrators.
- B. They receive a configured anonymous user role.
- C. They bypass all module security.
- D. They have no session or user context.

**Answer:** B

**Source:** Intermediate exam study guide — Security. A configured anonymous user role. It is automatically assigned to visitors who are not signed in.

### int-4-07

What should be done after enabling anonymous access?

- A. Give the role every module role.
- B. Configure a role-based home page and minimal permissions.
- C. Turn production security off.
- D. Remove all entity access rules.

**Answer:** B

**Source:** Intermediate exam study guide — Security. Configure a home page and minimal permissions. Anonymous access must be deliberately restricted.

### int-4-08

Why is least privilege important for an anonymous role?

- A. Every unauthenticated visitor receives that role.
- B. Anonymous users cannot open pages.
- C. It improves story-point estimation.
- D. It disables sessions.

**Answer:** A

**Source:** Intermediate exam study guide — Security. Every unauthenticated visitor receives it. Excess access can expose data or operations publicly.

### int-4-09

What happens when an end user signs in?

- A. A Runtime session is established.
- B. A new module is created.
- C. The app security level changes.
- D. Every object is committed.

**Answer:** A

**Source:** Intermediate exam study guide — Security. A Runtime session is established. The session carries the authenticated user context.

### int-4-10

When does a normal session expire?

- A. Immediately after every page change
- B. After the configured period of inactivity
- C. Only when the app is upgraded
- D. At the end of every microflow

**Answer:** B

**Source:** Intermediate exam study guide — Security. After configured inactivity. `SessionTimeout` determines when the session becomes invalid.

### int-4-11

What is a recommended step after changing an active user's roles?

- A. Delete the domain model.
- B. Ask the user to sign out and sign in again.
- C. Disable production security.
- D. Convert the user to anonymous.

**Answer:** B

**Source:** Intermediate exam study guide — Security. Sign out and in again. This ensures the latest roles are applied to a fresh session.

### int-4-12

What can an authentication token do after the previous session expires?

- A. Create a new authenticated session without asking for credentials again
- B. Grant additional module roles
- C. Change entity access rules
- D. Disable the password policy

**Answer:** A

**Source:** Intermediate exam study guide — Security. Create a new authenticated session. This supports persistent “remember me” behavior.

### int-4-13

Which statement about multiple assigned roles is correct?

- A. The user receives only the weakest rights.
- B. The user receives the combined rights of the assigned roles.
- C. The roles cancel one another.
- D. Only the newest role applies.

**Answer:** B

**Source:** Intermediate exam study guide — Security. Rights are combined. Assigned user roles contribute their access rights cumulatively.

### int-4-14

Why do module roles improve module reuse?

- A. Permissions remain defined inside the module and can be mapped by each app.
- B. They remove the need for app security.
- C. They make all users administrators.
- D. They store translation text.

**Answer:** A

**Source:** Intermediate exam study guide — Security. Permissions remain inside the module. Each app can map its own user roles to those module roles.

### int-4-15

Which mechanism can limit a user to objects they own?

- A. A page title
- B. An entity access XPath using `owner` or a user association
- C. A navigation layout
- D. A calculated page width

**Answer:** B

**Source:** Intermediate exam study guide — Security. Entity access XPath. Runtime-enforced ownership constraints protect the objects themselves.

## Intermediate exam questions — Domain Model

### int-5-01

Which association type allows one parent object to be related to many child objects?

- A. One-to-one
- B. One-to-many
- C. Many-to-many only
- D. Generalization only

**Answer:** B

**Source:** Intermediate exam study guide — Domain Model. One-to-many. One object on one side can reference several objects on the other.

### int-5-02

Why might two entities have multiple associations between them?

- A. To represent relationships with different meanings
- B. To disable entity access
- C. To remove all attributes
- D. To turn both entities into non-persistable entities

**Answer:** A

**Source:** Intermediate exam study guide — Domain Model. Different relationship meanings. Examples include shipping address and invoice address.

### int-5-03

A Customer needs separate shipping and invoice addresses displayed directly. Which design is appropriate?

- A. Two meaningful one-to-one associations to Address
- B. No association at all
- C. A calculated attribute containing both objects
- D. A scheduled event

**Answer:** A

**Source:** Intermediate exam study guide — Domain Model. Two one-to-one associations. Each association has a distinct semantic role and can be shown directly.

### int-5-04

What is created for a persistable entity?

- A. A browser tab
- B. A database table
- C. A Scrum role
- D. A translation library only

**Answer:** B

**Source:** Intermediate exam study guide — Domain Model. A database table. Persistable entity instances can be stored as rows.

### int-5-05

When does a new persistable object stop being transient?

- A. When it is displayed on a page
- B. When it is committed to the database
- C. When a user signs out
- D. When its entity is renamed

**Answer:** B

**Source:** Intermediate exam study guide — Domain Model. When committed. Before commit, a newly created persistable object exists only in memory.

### int-5-06

Where are values of a non-persistable entity stored?

- A. Permanently in a database table
- B. Only in memory
- C. In the Product Backlog
- D. In an Excel export automatically

**Answer:** B

**Source:** Intermediate exam study guide — Domain Model. Only in memory. It has no corresponding database table and is eventually garbage-collected.

### int-5-07

Which feature is unavailable for a non-persistable entity?

- A. Attributes
- B. Being used by a page
- C. Database indexes
- D. Associations

**Answer:** C

**Source:** Intermediate exam study guide — Domain Model. Database indexes. Indexes require database storage; AutoNumber and domain-model validation rules are also unavailable.

### int-5-08

Who must own an association between a non-persistable and a persistable entity?

- A. The persistable side
- B. The non-persistable side
- C. The System module
- D. The Product Owner

**Answer:** B

**Source:** Intermediate exam study guide — Domain Model. The non-persistable side. The association ownership dot must be on that side.

### int-5-09

When is a calculated attribute's microflow executed?

- A. Only when the app is deployed
- B. Whenever the attribute value is accessed
- C. Only when the entity is deleted
- D. At the start of every sprint

**Answer:** B

**Source:** Intermediate exam study guide — Domain Model. Whenever accessed. This keeps the result current but can make retrieval expensive.

### int-5-10

Why can calculated attributes hurt list performance?

- A. They disable pagination.
- B. Their calculation may run once for every retrieved row.
- C. They remove all entity access rules.
- D. They convert the entity to non-persistable.

**Answer:** B

**Source:** Intermediate exam study guide — Domain Model. Once per row. A list can trigger many calculation microflows.

### int-5-11

Which rule of thumb favors storing a derived value?

- A. The value is read more often than it changes.
- B. The value changes more often than it is read.
- C. The entity has no attributes.
- D. The app has an anonymous user.

**Answer:** A

**Source:** Intermediate exam study guide — Domain Model. Read more often than changed. Storing avoids repeated recalculation; update the stored value when its inputs change.

### int-5-12

What relationship does inheritance/generalization represent?

- A. “has-a” only
- B. “is-a”
- C. “runs-after”
- D. “belongs-to-a-sprint”

**Answer:** B

**Source:** Intermediate exam study guide — Domain Model. “is-a.” A specialization inherits the members of its generalization.

### int-5-13

What is the recommended maximum inheritance depth for performance?

- A. One level
- B. Two levels
- C. Five levels
- D. Unlimited levels

**Answer:** B

**Source:** Intermediate exam study guide — Domain Model. Two levels. Deeper inheritance is discouraged for performance and complexity reasons.

### int-5-14

Which system member identifies the user who last changed an object?

- A. `createdDate`
- B. `owner`
- C. `changedBy`
- D. `changedDate`

**Answer:** C

**Source:** Intermediate exam study guide — Domain Model. `changedBy`. `owner` is the creator, while `changedBy` is the most recent editor.

### int-5-15

Which statement about entity event handlers is most accurate?

- A. They should always replace explicit microflow calls.
- B. They can create hidden chains of behavior and should be used carefully.
- C. They work only for non-persistable entities.
- D. They are the same as page templates.

**Answer:** B

**Source:** Intermediate exam study guide — Domain Model. Use carefully. Explicit sub-microflow calls can make complex behavior easier to trace.

## Intermediate exam questions — Pages, Layouts, and Atlas UI

### int-6-01

What does a layout primarily define?

- A. The shared outer structure used by pages
- B. The database schema
- C. The Sprint Backlog
- D. User passwords

**Answer:** A

**Source:** Intermediate exam study guide — Pages, Layouts, and Atlas UI. Shared outer structure. Navigation, headers, sidebars, and footers commonly belong to layouts.

### int-6-02

What must be the only top-level widget in a navigation layout?

- A. Data grid
- B. Scroll container
- C. Text box
- D. Microflow button

**Answer:** B

**Source:** Intermediate exam study guide — Pages, Layouts, and Atlas UI. Scroll container. It divides the layout into independently scrolling regions.

### int-6-03

Where may one scroll container be nested?

- A. Directly inside another scroll container
- B. Only inside a data grid row
- C. Inside an XPath expression
- D. It cannot be nested

**Answer:** A

**Source:** Intermediate exam study guide — Pages, Layouts, and Atlas UI. Directly inside another scroll container. This is the allowed nesting structure.

### int-6-04

What is a placeholder in a layout?

- A. A database record
- B. An area filled with page-specific content
- C. A user role awaiting configuration
- D. A temporary microflow variable

**Answer:** B

**Source:** Intermediate exam study guide — Pages, Layouts, and Atlas UI. Page-specific content area. The page fills placeholders while shared layout content stays fixed.

### int-6-05

Which placeholder name is required in a Mendix layout?

- A. `Content`
- B. `Body`
- C. `Main`
- D. `Primary`

**Answer:** C

**Source:** Intermediate exam study guide — Pages, Layouts, and Atlas UI. `Main`. A layout must have at least one placeholder with this name.

### int-6-06

What happens to layout content when several pages use the layout?

- A. It is recreated differently on every page.
- B. It remains shared and consistent.
- C. It becomes a calculated attribute.
- D. It is removed at runtime.

**Answer:** B

**Source:** Intermediate exam study guide — Pages, Layouts, and Atlas UI. It remains shared. Reuse keeps navigation and other shell content consistent.

### int-6-07

What is the main purpose of a page template?

- A. Provide a starting structure for a new page
- B. Configure entity access
- C. Run scheduled events
- D. Store Java libraries

**Answer:** A

**Source:** Intermediate exam study guide — Pages, Layouts, and Atlas UI. Starting structure. Templates speed up creation of forms, overviews, wizards, and similar pages.

### int-6-08

What is a building block?

- A. A reusable group of page widgets
- B. A Runtime session
- C. A database index
- D. A type of Scrum event

**Answer:** A

**Source:** Intermediate exam study guide — Pages, Layouts, and Atlas UI. Reusable widget group. Building blocks are inserted into page designs.

### int-6-09

What is a snippet?

- A. A reusable UI fragment referenced by pages
- B. A deployment package
- C. A user account
- D. A special XPath operator

**Answer:** A

**Source:** Intermediate exam study guide — Pages, Layouts, and Atlas UI. Reusable UI fragment. Updating a snippet updates its use wherever referenced.

### int-6-10

Which resource supplies base styling and layouts in modern Atlas projects?

- A. System.User
- B. Atlas Core
- C. Product Backlog
- D. Team Server only

**Answer:** B

**Source:** Intermediate exam study guide — Pages, Layouts, and Atlas UI. Atlas Core. It contains core styling and layouts.

### int-6-11

Which Atlas package provides web page templates and building blocks?

- A. Atlas Web Content
- B. Atlas Native Content
- C. System Resources
- D. Java Source

**Answer:** A

**Source:** Intermediate exam study guide — Pages, Layouts, and Atlas UI. Atlas Web Content. Atlas Native Content supplies equivalent native resources.

### int-6-12

What does a layout grid use to structure browser pages?

- A. Rows and columns
- B. User roles and module roles
- C. Commits and rollbacks
- D. Tokens and variables

**Answer:** A

**Source:** Intermediate exam study guide — Pages, Layouts, and Atlas UI. Rows and columns. The browser grid follows responsive Bootstrap-style behavior.

### int-6-13

Which design approach best supports responsive pages?

- A. Give every widget a fixed desktop-only width.
- B. Use responsive grids and test relevant breakpoints.
- C. Duplicate the entire app for every screen size.
- D. Hide all content on phones.

**Answer:** B

**Source:** Intermediate exam study guide — Pages, Layouts, and Atlas UI. Responsive grids and breakpoint testing. Small-screen design should adapt rather than merely shrink.

### int-6-14

What distinguishes a page template from a layout?

- A. A page template starts one page; a layout supplies shared structure to many pages.
- B. A page template controls security; a layout controls sessions.
- C. A layout is used only for Excel.
- D. There is no difference.

**Answer:** A

**Source:** Intermediate exam study guide — Pages, Layouts, and Atlas UI. One-page starting point versus shared shell. This is the key exam distinction.

### int-6-15

Why should Atlas design properties and reusable components be preferred?

- A. They improve consistency and reduce one-off styling.
- B. They bypass production security.
- C. They remove the need to test pages.
- D. They convert pages into microflows.

**Answer:** A

**Source:** Intermediate exam study guide — Pages, Layouts, and Atlas UI. Consistency and reuse. They make future design changes easier to apply across the app.

## Intermediate exam questions — Modules, App Directory, and Integration

### int-7-01

What is a good basis for dividing a large app into modules?

- A. Random document count
- B. Business capability or functional area
- C. The developer's favorite color
- D. One module for every user

**Answer:** B

**Source:** Intermediate exam study guide — Modules, App Directory, and Integration. Business capability. Functional boundaries make modules easier to own, understand, and reuse.

### int-7-02

Where should entity-specific pages and validation flows usually be organized?

- A. In a folder named for the entity
- B. In the deployment folder
- C. In the Product Backlog
- D. In the browser cache

**Answer:** A

**Source:** Intermediate exam study guide — Modules, App Directory, and Integration. An entity-named folder. It groups related pages, validations, and entity-event logic.

### int-7-03

What does the `javasource` folder contain?

- A. Java actions and generated module-related Java sources
- B. Only CSS files
- C. Translation spreadsheets
- D. Sprint reports

**Answer:** A

**Source:** Intermediate exam study guide — Modules, App Directory, and Integration. Java sources. It includes Java actions, proxies, constants, and generated module structures.

### int-7-04

What is stored in `javascriptsource`?

- A. JavaScript actions used by nanoflows
- B. Database tables
- C. User passwords
- D. Product Backlog items

**Answer:** A

**Source:** Intermediate exam study guide — Modules, App Directory, and Integration. Nanoflow JavaScript actions. Its directory structure follows the relevant app modules.

### int-7-05

What is the purpose of `mprcontents`?

- A. Store model documents separately for efficient change management
- B. Store production user sessions
- C. Hold Excel imports only
- D. Configure Scrum events

**Answer:** A

**Source:** Intermediate exam study guide — Modules, App Directory, and Integration. Model documents. Separate storage makes document-level version changes easier to manage.

### int-7-06

Which folder contains Java libraries such as JAR files?

- A. `widgets`
- B. `userlib`
- C. `releases`
- D. `theme`

**Answer:** B

**Source:** Intermediate exam study guide — Modules, App Directory, and Integration. `userlib`. Imported modules can add supporting JAR files there.

### int-7-07

What maintenance may be required after uninstalling a Marketplace module?

- A. Manually remove its unused libraries from `userlib`.
- B. Delete the complete app directory.
- C. Remove the System module.
- D. Disable all security.

**Answer:** A

**Source:** Intermediate exam study guide — Modules, App Directory, and Integration. Remove unused libraries. Uninstalling the module may not clean them up automatically.

### int-7-08

What does an `.mpr.lock` file indicate?

- A. The app is currently open in Studio Pro.
- B. The app is permanently encrypted.
- C. A sprint has ended.
- D. The database has no tables.

**Answer:** A

**Source:** Intermediate exam study guide — Modules, App Directory, and Integration. Open in Studio Pro. The lock file may be hidden by Windows settings.

### int-7-09

Which folder contains files needed to run the app locally?

- A. `deployment`
- B. `packages`
- C. `userlib` only
- D. `documentation`

**Answer:** A

**Source:** Intermediate exam study guide — Modules, App Directory, and Integration. `deployment`. It contains generated runtime, local database, source, and file structures.

### int-7-10

What is `data-snapshot.zip` used for?

- A. Reusing a local database snapshot
- B. Storing app translations
- C. Defining module roles
- D. Recording Scrum velocity

**Answer:** A

**Source:** Intermediate exam study guide — Modules, App Directory, and Integration. Local database snapshot. Teammates can reuse the captured data state.

### int-7-11

Which integration style is generally preferred for regularly importing data?

- A. A supported service such as REST, SOAP, or OData
- B. Manual retyping
- C. A page screenshot
- D. A Scrum retrospective

**Answer:** A

**Source:** Intermediate exam study guide — Modules, App Directory, and Integration. REST, SOAP, or OData. A service is normally the best option for repeated integration.

### int-7-12

When is an Excel or CSV import especially suitable?

- A. For batch or one-off transfers when no service is available
- B. For authenticating every API request
- C. For configuring module roles
- D. For replacing the domain model

**Answer:** A

**Source:** Intermediate exam study guide — Modules, App Directory, and Integration. Batch or one-off transfer. Flat files are useful when the source exposes no live service.

### int-7-13

What is a safer pattern for transforming a very large import?

- A. Load and transform the complete data set in memory at once.
- B. Import to a flat staging structure and transform in batches.
- C. Convert all entities to calculated attributes.
- D. Run the work from a page layout.

**Answer:** B

**Source:** Intermediate exam study guide — Modules, App Directory, and Integration. Stage and batch. This reduces memory pressure and limits the impact of transformation failures.

### int-7-14

Why is exposing an API often preferable to pushing data into every target system?

- A. The data owner stays less coupled to each consumer's implementation.
- B. APIs do not require security.
- C. Pushing data is impossible in Mendix.
- D. APIs automatically translate the app.

**Answer:** A

**Source:** Intermediate exam study guide — Modules, App Directory, and Integration. Lower coupling. Consumers adapt to the published contract rather than the owner knowing every target.

### int-7-15

What should a team do before committing when using version management?

- A. Update the app and resolve conflicts.
- B. Delete all `.mpr` files.
- C. Clear every user role.
- D. Remove all modules.

**Answer:** A

**Source:** Intermediate exam study guide — Modules, App Directory, and Integration. Update and resolve conflicts. Commit a current, conflict-free model whenever possible.

## Intermediate exam questions — Languages and Translations

### int-8-01

Which content is stored as translatable text in Mendix?

- A. Labels, button captions, messages, and menu items
- B. Only Java source code
- C. Only entity names
- D. Only passwords

**Answer:** A

**Source:** Intermediate exam study guide — Languages and Translations. Interface labels and messages. Mendix tracks these strings so each language can supply a translation.

### int-8-02

What does the default language determine?

- A. The language shown when no different user language applies
- B. The database engine
- C. The app security level
- D. The Scrum team's location

**Answer:** A

**Source:** Intermediate exam study guide — Languages and Translations. Fallback/user-visible language. It supplies text when another selected language has no translation.

### int-8-03

Why should the development language be selected early?

- A. New source labels are stored in that language library.
- B. It determines the number of entities allowed.
- C. It disables other languages.
- D. It controls session timeout.

**Answer:** A

**Source:** Intermediate exam study guide — Languages and Translations. New labels enter that library. Choosing correctly from the start avoids mixed-language source text.

### int-8-04

What can happen if developers enter Dutch labels while the development language is English?

- A. Dutch source text is mixed into the English language library.
- B. The app cannot contain pages.
- C. All users become anonymous.
- D. The database is deleted.

**Answer:** A

**Source:** Intermediate exam study guide — Languages and Translations. Dutch text enters the English library. It can be repaired, but early configuration prevents the mix-up.

### int-8-05

How does Studio Pro display a missing translation while working in another development language?

- A. As an empty box only
- B. Using the default text inside angle brackets
- C. As a Runtime error
- D. In binary format

**Answer:** B

**Source:** Intermediate exam study guide — Languages and Translations. Default text in angle brackets. For example, `< Requests >` signals a missing development-time translation.

### int-8-06

How does a deployed app normally display a missing translation?

- A. It falls back to the default-language text without angle brackets.
- B. It refuses to start.
- C. It deletes the page.
- D. It always displays an exception.

**Answer:** A

**Source:** Intermediate exam study guide — Languages and Translations. Default text without brackets. The deployed app uses fallback content.

### int-8-07

What is the purpose of Batch Translate?

- A. Translate many source texts efficiently in one view
- B. Process database objects in batches
- C. Create user sessions
- D. Configure XPath indexes

**Answer:** A

**Source:** Intermediate exam study guide — Languages and Translations. Translate many strings efficiently. It avoids opening every page and document separately.

### int-8-08

Which two languages are selected in Batch Translate?

- A. Source and destination
- B. Default and Java
- C. Browser and server
- D. User and module

**Answer:** A

**Source:** Intermediate exam study guide — Languages and Translations. Source and destination. The tool maps one language library into another.

### int-8-09

What can be used to narrow the Batch Translate list?

- A. Module filters and text search
- B. Scrum velocity only
- C. Session timeout
- D. Entity ownership

**Answer:** A

**Source:** Intermediate exam study guide — Languages and Translations. Module filters and search. These isolate the text relevant to a particular translation task.

### int-8-10

What does the Occurrence pane show?

- A. Where a translatable text is used in the app
- B. How often a scheduled event runs
- C. Which sessions are active
- D. The number of database indexes

**Answer:** A

**Source:** Intermediate exam study guide — Languages and Translations. Usage locations. It shows where each text appears in pages, flows, and other documents.

### int-8-11

Why is occurrence context important?

- A. The same source word can need different translations in different contexts.
- B. It determines whether an entity is persistable.
- C. It configures app security.
- D. It changes the development language automatically.

**Answer:** A

**Source:** Intermediate exam study guide — Languages and Translations. Context changes meaning. A word such as “address” may require different translations depending on usage.

### int-8-12

Which format is used to export translations from Studio Pro?

- A. `.xlsx`
- B. `.jar`
- C. `.mpk`
- D. `.mpr.lock`

**Answer:** A

**Source:** Intermediate exam study guide — Languages and Translations. `.xlsx`. Translation work can be completed externally and imported again.

### int-8-13

What does an exported translation workbook normally contain?

- A. Columns for the source and destination languages
- B. User passwords and sessions
- C. Only compiled JavaScript
- D. Sprint estimates

**Answer:** A

**Source:** Intermediate exam study guide — Languages and Translations. Source and destination columns. Translators fill or revise the destination text.

### int-8-14

Can an app contain more than two project languages?

- A. No, exactly two are allowed.
- B. Yes, multiple languages can be added.
- C. Only if security is off.
- D. Only for native apps.

**Answer:** B

**Source:** Intermediate exam study guide — Languages and Translations. Multiple languages. One is selected as the default.

### int-8-15

What does an offline/native device need in order to switch app language?

- A. Access to the Mendix Runtime
- B. Administrator rights on the database
- C. A new module package
- D. A Sprint Review

**Answer:** A

**Source:** Intermediate exam study guide — Languages and Translations. Runtime access. Offline/native language switching requires a connection to the Runtime.
