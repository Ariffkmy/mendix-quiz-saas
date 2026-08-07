# Mendix Advanced Developer Certification — Question Bank

<!-- Source of truth for the exam question bank. Parsed by src/lib/parseQuestions.js.
     Format: `## <topic>`, then `### <id>` + question text, four `- A.`..`- D.`
     options, `**Answer:** <letter>` and `**Source:** <explanation>`. -->

## Advanced Domain Model Skills

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

True or false: making Goalkeeper a specialization of Player results in a single database table holding all the attributes of both entities.

- A. True — Mendix flattens the hierarchy into one table for performance
- B. True — but only when the specialization adds no new attributes
- C. False — inheritance is stored as two separate tables linked by a shared, synchronized ID
- D. False — inheritance creates three tables, just like a 1-1 association

**Answer:** C

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

Which of the following is NOT a reason the course gives for creating a module-specific specialization of System.Image instead of using System.Image directly?

- A. Performance — a specialization stores binary contents in fewer database tables
- B. Security — entity access can be scoped to your own specialization
- C. Maintainability — file-handling logic stays contained and upgrade-safe
- D. Purpose — you can add your own attributes and associations

**Answer:** A

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

Which two statements about modelling a many-to-many relationship are correct, according to the course benchmark? (Pick the option that states them both.)

- A. A plain reference set is fastest, and joining entities should only be used for extra attributes
- B. A reference set "both" is fastest, and a joining entity adds unnecessary complexity
- C. A joining entity is roughly 3–4x faster than a plain reference set, and reference set "both" is the slowest option
- D. All three options perform identically; the choice is purely stylistic

**Answer:** C

**Source:** Module 4 — Associations and Reference Sets. The PerformanceTest benchmark showed the joining entity pattern roughly 3–4x faster than a plain reference set, with reference set "both" (*-*) the slowest and most expensive option.

### adm-8

Which XPath condition can make effective use of a database index on the constrained attribute?

- A. [contains(Name, 'washer')]
- B. [ends-with(Name, 'er')]
- C. [not(Active)]
- D. [starts-with(ProductNumber, 'BK')]

**Answer:** D

**Source:** Module 5 — Indexes. Indexes work best with Equals or Starts-with conditions; Contains and Ends-with cannot use the index efficiently.

### adm-9

In the four-stage rocket data-conversion approach, why does Stage 4 delete the old attributes BEFORE fixing the remaining build errors?

- A. Because Studio Pro's error list then acts as a free to-do list of every place still referencing the old structure
- B. Because Studio Pro refuses to compile while duplicate attributes exist
- C. Because the database sync can only run when the model has no unused attributes
- D. Because the conversion microflow cannot be deleted until the attributes are gone

**Answer:** A

**Source:** Module 5 — Data Conversions. Deleting the old attributes first is a deliberate technique: the resulting error list enumerates every leftover reference so nothing is missed.

### adm-10

A developer adds a new entity and two new associations to a live production domain model. What does the course say about the data conversion?

- A. Nothing is needed — structural changes are handled automatically by Mendix
- B. A custom conversion microflow is always required for structural changes
- C. Only a type-conversion microflow is needed; the structure syncs itself
- D. The database must be dropped and recreated from the new model

**Answer:** B

**Source:** Module 5 — Data Conversions. Type changes are partially handled automatically (a custom microflow is still recommended); structural changes always require a custom conversion microflow.

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

### adm-13

A DateTime attribute is NOT localized. On the application server, which expression should be used to format it so that every user gets a consistent result?

- A. formatDateTimeUTC()
- B. formatDateTime()
- C. formatDateTime() wrapped in parseDateTimeUTC()
- D. Either one — localization only affects the client

**Answer:** A

**Source:** Module 7 — Date Magic on the Application Server. Rule: localized attribute → non-UTC expression; non-localized attribute → UTC expression. Mismatching them silently shifts the value by the acting user’s offset.

## Configure Advanced Security

### sec-1

Entity Request has a Status attribute (Draft / Submitted / Approved). The Customer module role has exactly one access rule: read and write, with XPath constraint [Status = 'Draft']. A page shows a data grid over Request with no page-level constraint. What does a Customer see in that grid?

- A. All the requests, regardless of status
- B. All the requests in the Draft status
- C. No results, because the page has no constraint
- D. Only the Draft requests the Customer created

**Answer:** B

**Source:** Module 2 Knowledge Check. The entity-level XPath is added to every database retrieve, so it applies even though the grid itself is unconstrained. It is not scoped to the creator — that would additionally require [System.owner = '[%CurrentUser%]'].

### sec-2

You are modeling Employee and Customer entities alongside the Account entity. Which approach does the course recommend?

- A. Make Employee and Customer specializations of Account
- B. Make Account a specialization of both Employee and Customer
- C. Model Employee and Customer as separate entities, each with a 1-1 association to Account
- D. Store all employee and customer attributes directly on Account

**Answer:** C

**Source:** Module 4.3. Never inherit from User or Account for process data — specializing Account entangles login/account security with process-data security and produces conflicting restrictions. Associate instead.

### sec-3

The same Request entity has no access rule at all defined for the Administrator module role. What does an Administrator see on a page showing Requests?

- A. All requests — administrators bypass entity access
- B. Only requests the administrator owns
- C. A runtime security exception is thrown at page load
- D. No results would be returned

**Answer:** D

**Source:** Module 2.10 Knowledge Check. Mendix denies by default: if no access rule grants a role access to an entity, that role gets nothing back.

### sec-4

Continuing that scenario, you grant the Administrator page access to the Request page but still define no entity access rule. What happens?

- A. Studio Pro detects an error and prevents deployment
- B. The page runs but silently shows an empty grid
- C. Mendix automatically generates a read-only access rule
- D. The page is hidden from the navigation at runtime

**Answer:** A

**Source:** Module 2.10 Knowledge Check. The 'Check security' analysis flags the inconsistency between page access and missing entity access, blocking deployment.

### sec-5

Which of the following is NOT true about the Apply entity access setting on a microflow?

- A. It adds the current user's entity XPath rules to database actions inside the microflow
- B. It should be enabled on every microflow in the app as a blanket best practice
- C. It should be enabled for anonymous and deep-link microflows handling sensitive data
- D. A microflow with it set to No cannot call a sub-microflow that has it set to Yes

**Answer:** B

**Source:** Module 3.2–3.4. Blanket-enabling Apply entity access breaks legitimate microflows that write read-only values or create logs for the user. CE0114 covers the calling restriction.

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

Teachers are given User management = Selected → Student so they can manage their own class. Is this sufficient?

- A. Yes — User management automatically scopes to associated users
- B. No — User management only controls page access, not account editing
- C. Yes, provided the Student role also has User management set to None
- D. No — teachers can now edit the account of any Student, not just those in their class

**Answer:** D

**Source:** Module 4.6 Knowledge Check. User management grants access to all users holding that role; scoping to "my students" requires entity-level ownership rules on the process data instead.

### sec-12

Which item is NOT part of the recommended checklist for configuring an Anonymous user role?

- A. Give the role the Administrator module role in the System module so sessions can be created
- B. Grant the role access only to necessary microflows, such as forgot-password
- C. Remove read access to data that is not visible on the anonymous pages
- D. Give the role the User module role in the System module

**Answer:** A

**Source:** Module 4.4. The Anonymous role needs at least the System User module role plus Anonymous module roles elsewhere — never an administrator-level module role.

### sec-13

A user holds two user roles, and both roles have a role-based home page defined. Which home page does Mendix open?

- A. The one with the most permissive access rules
- B. The one belonging to the first role in the user role list
- C. The app-level default home page, ignoring both role home pages
- D. Mendix raises a consistency error at design time

**Answer:** B

**Source:** Module 5.3. With multiple roles Mendix simply uses the first role in the list — reorder the list to control it, or define a combined user role for a specific role combination.

## Constrain Your Data Using Advanced XPath

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

Which of the following XPath expressions is INVALID?

- A. [Available = true() and Active = false()]
- B. [Available = true()][Active = false()]
- C. [Available = true()] and [Active = false()]
- D. [Color = 'Black' or Color = 'Silver/Black']

**Answer:** C

**Source:** Module 4.2. Logical operators can only be used inside the square brackets. Multiple bracket sets are implicitly combined with and; placing "and" between bracket sets is invalid XPath.

### xpath-6

The not() function in XPath:

- A. Is automatically rewritten by the runtime into a Subtract list operation
- B. Is the fastest way to exclude objects, since it is evaluated in memory
- C. Can only be applied to boolean attributes, never to associations
- D. Generates a slow query because of the SQL it produces internally

**Answer:** D

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

A developer wants to constrain Customers to the logged-in user. Which form does the course call optimal?

- A. [Sales.Customer_Account/Administration.Account/id = $currentUser]
- B. [Sales.Customer_Account = $currentUser]
- C. [Sales.Customer_Account/Administration.Account/Name = $currentUser/Name]
- D. [not(Sales.Customer_Account != $currentUser)]

**Answer:** B

**Source:** Module 5.2. Compare directly against the association — you rarely need to retrieve the related object, so stopping at the association produces the most optimal query.

### xpath-9

Which microflow list operations can replace an XPath or and an XPath and respectively?

- A. Subtract and Union
- B. Intersect and Subtract
- C. Union and Intersect
- D. Filter and Sort

**Answer:** C

**Source:** Module 5.2. An or can be replaced with a Union list operation; an and can be replaced with an Intersect list operation.

### xpath-10

When should you apply a database index, according to the course?

- A. Preemptively on every searchable attribute, before go-live
- B. Only on non-persistable entities used for search forms
- C. On every attribute with an unlimited string length
- D. On attributes used in searches, once app performance proves to be insufficient

**Answer:** D

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

A reporting dashboard needs aggregated figures combined from several entities, and XPath is already fully optimized. What does the course suggest?

- A. Write raw SQL through a Java action
- B. Use OQL, which resembles SQL and can aggregate across entities in one query
- C. Add indexes on every attribute involved in the report
- D. Split the report into one XPath retrieve per entity and merge them on the page

**Answer:** B

**Source:** Module 5.5. OQL is the more SQL-like alternative to XPath: it combines information from several entities and performs aggregation itself, significantly reducing the number of separate retrieves.

## Design and Publish a REST API

### rest-1

Which HTTP methods are considered safe?

- A. GET, POST & PUT
- B. PUT, PATCH & DELETE
- C. GET, PUT & DELETE
- D. GET, HEAD & OPTIONS

**Answer:** D

**Source:** Module 2 — Methods. Safe means the state of the system is not changed after the method finishes. Only GET, HEAD and OPTIONS are marked Safe in the properties table.

### rest-2

What must a custom authentication microflow for a published REST service return?

- A. A System.User object
- B. An HttpResponse object
- C. A Boolean indicating whether authentication succeeded
- D. The API key as a String

**Answer:** A

**Source:** Module 5 — Security. Custom authentication requires a microflow that returns a System.User object; the custom authentication parameter (e.g. an X-API-Key header) maps to that microflow's parameter.

### rest-3

Which of the following is NOT idempotent?

- A. PUT
- B. POST
- C. DELETE
- D. HEAD

**Answer:** B

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

A POST successfully creates a new Book. Which response is correct according to the course guidelines?

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

True or false: a successful DELETE should return 204 No Content with no response body.

- A. False — it should return 200 OK with the deleted object
- B. True
- C. False — it should return 202 Accepted
- D. False — it should return 404 once the object no longer exists

**Answer:** B

**Source:** Module 2 — DELETE. A successful DELETE returns 204 No Content and no body; a 404 is returned only if the object was not found in the first place.

### rest-8

An external system tries to update a Book, but the record has already been changed by an earlier update. Which status code fits best?

- A. 400 Bad Request
- B. 403 Forbidden
- C. 409 Conflict
- D. 500 Internal Server Error

**Answer:** C

**Source:** Module 3 — Status Codes. 409 Conflict = the object cannot be updated because of an earlier update. 400 is failed validation; 403 is authenticated but not authorized.

### rest-9

Which statement about REST error message content is TRUE?

- A. UserMessage is mandatory and SystemMessage is optional
- B. Error responses must always be a list, never a single error object
- C. Stack traces are acceptable in SystemMessage since it is developer-facing
- D. SystemMessage is mandatory and may contain technical information for developers

**Answer:** D

**Source:** Module 3 — Error Messages. SystemMessage must be present and may carry technical info; UserMessage is optional and must not be technical. Stack traces must never be exposed, and the response can be a single object or a list.

### rest-10

A developer builds their mapping documents from JSON snippets rather than message definitions. What is the downside?

- A. There will be no meaningful examples on the Swagger page
- B. The service cannot be secured with custom authentication
- C. PATCH operations cannot be modelled
- D. The service will not appear at /rest-doc/servicename/

**Answer:** A

**Source:** Module 4 — Examples. Only message definitions let you override the generic "string"/0 placeholders with realistic example values shown on the Swagger page.

### rest-11

Which of the following is NOT one of the places where documentation can be added to a published REST service?

- A. A parameter
- B. A status code
- C. An operation's summary and description
- D. An attribute's message definition field

**Answer:** B

**Source:** Module 4 — Extend API with Documentation. The six documentable places are the service, a resource, an operation (summary + description), parameters, an object message definition and an attribute message definition — all GitHub Flavored Markdown. Status codes, authentication and methods are not documentable.

### rest-12

Which of these is NOT a selectable authentication method in a published REST service configuration?

- A. Username and password
- B. Active session
- C. API key
- D. Custom

**Answer:** C

**Source:** Module 5 — Security. The three selectable methods are username and password, active session and custom. An API key is a typical authentication *type* implemented through custom authentication.

### rest-13

You create a dedicated user role that exists only to access the published REST service. What extra step does the course require?

- A. Give it the Administrator module role in System
- B. Mark the role as the default anonymous role
- C. Set the role’s User management option to All
- D. Disable the "Check security" checkbox on that role

**Answer:** D

**Source:** Module 5 — Standard Authentication. A service-only role must have "Check security" disabled, otherwise the app raises permission errors elsewhere.

## Error Handling

### err-1

You need to create error handling for Java actions because:

- A. Mendix is not able to catch errors that occur in a Java action by default
- B. Java actions always roll back the entire transaction automatically
- C. Java actions cannot be used inside a sub-microflow
- D. Studio Pro's consistency checker flags every Java action as an error

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

Which error handling type re-throws the error to all parent microflows after executing the custom activities?

- A. End Event
- B. Custom without rollback
- C. Custom with rollback
- D. Error End Event

**Answer:** D

**Source:** Module 4.2 reference table. The Error End Event executes the custom activities and then re-throws the error upward to every parent microflow.

### err-5

A nightly scheduled event synchronizes data over REST. There is no user present. What does the course recommend as the priority for error handling here?

- A. A Log message activity so the details can be traced later
- B. A Show message activity so the next user to log in sees the failure
- C. Validation feedback on the affected object
- D. No error handling — scheduled events retry automatically

**Answer:** A

**Source:** Module 4.3. Match the strategy to the trigger: system-triggered microflows prioritize logging (no user to notify); user-triggered microflows prioritize a friendly Show message.

### err-6

Fill in the blank: inside an error handler flow, the system variable ____ holds the message of the underlying exception.

- A. $latestHttpResponse/Content
- B. $latestError/Message
- C. $currentException/Text
- D. $latestError/StackTrace

**Answer:** B

**Source:** Module 4.2.2 / 4.3.1. $latestError/Message is populated automatically inside an error handler and is used as a parameter in both the Log message and Show message templates.

### err-7

Why is it necessary to create both a log message and a user message in an error handler?

- A. Because the log message rolls back the transaction and the user message does not
- B. Because a Show message activity cannot include parameters
- C. Because the log message will not appear in the frontend
- D. Because Mendix ignores Show message activities in error flows

**Answer:** C

**Source:** Module 4 Knowledge Check. The log is only written to the server-side log files, invisible to the end user — so a separate user-facing message is needed as well.

### err-8

True or false: adding as many layered error-handling combinations as possible makes an app more robust.

- A. True — more handling always means fewer unhandled errors
- B. False — Mendix only allows one error handler per microflow
- C. True, provided every handler uses Custom with rollback
- D. False — overly complex handling slows down microflow evaluation and makes behavior on exception harder to predict

**Answer:** D

**Source:** Module 4.2.2 caution. Do not over-engineer error handling; keep it as simple as the situation requires.

### err-9

When building a new microflow, where does the course recommend starting?

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

## Master Modeling Microflows

### mf-1

What does the list operation 'tail' do?

- A. It grabs the last element in the list
- B. It grabs all elements in the list except the first element
- C. It grabs the first n elements of the list
- D. It reverses the order of the list

**Answer:** B

**Source:** Module 3.3. Tail returns the list except for the first element(s) — not 'the last element', which the course flags as a common misconception. Head returns the first n objects.

### mf-2

Which statement about Rules is true?

- A. A rule can show a page or a message to the user
- B. A rule can commit objects to the database
- C. A rule can only be called from within a decision
- D. A rule can call a web service

**Answer:** C

**Source:** Module 4.5. A Rule always returns a Boolean or Enumeration and can be used directly inside a Decision. Rules cannot change data, interact with the client, call web services, generate documents, or import XML.

### mf-3

Which of the following is a valid Mendix token?

- A. [%CurrentAccount%]
- B. [%CurrentTime%]
- C. [%CurrentDayOfWeek%]
- D. [%CurrentUser%]

**Answer:** D

**Source:** Module 2.3. [%CurrentUser%] returns the logged-in user object. CurrentAccount, CurrentTime and CurrentDayOfWeek are common distractors that do not exist.

### mf-4

What is the easiest way to determine the name of the day of the week for a given date?

- A. Use formatDateTime($date, 'EEEE')
- B. Compute daysBetween($date, [%BeginOfCurrentWeek%]) and map the number with if-then-else
- C. Use the [%CurrentDayOfWeek%] token
- D. Use a Rule returning an enumeration of weekdays

**Answer:** A

**Source:** Module 2.5 / Knowledge Check. formatDateTime with pattern 'EEEE' (or 'E' for the abbreviation) is far simpler than manual date math.

### mf-5

A developer needs an associated object, but the association may be empty. Which approach is most efficient?

- A. Retrieve the object first, then check whether the result is empty
- B. Use a decision to check whether the association exists, and only retrieve if it does
- C. Always retrieve and rely on the null-safe expression operators downstream
- D. Retrieve from database with an XPath constraint instead of by association

**Answer:** B

**Source:** Module 2 Knowledge Check Q4. Checking the association first avoids an unnecessary retrieve, which is more efficient than "retrieve first, then check if empty".

### mf-6

Which statement about lists in a microflow is TRUE?

- A. You must check that a list is not empty before looping through it
- B. To empty a list you must remove its objects one at a time
- C. A list can originate from a Retrieve action, from creating a new list, or from an input parameter
- D. Lists can only be created by a Retrieve action

**Answer:** C

**Source:** Module 3.2. Those are the three list origins. Change List → Clear empties a list in one step, and looping an empty list simply performs zero iterations.

### mf-7

A microflow must count a few thousand Customers that are known to exist in the database. What is the best approach?

- A. Loop over the customers and increment an integer variable
- B. Use a Rule returning the count as an integer
- C. Retrieve in batches of 250 and sum the batch counts
- D. Retrieve all customers and use a List Aggregation Count directly after the retrieve

**Answer:** D

**Source:** Module 3.4 / Knowledge Check. A List Aggregation placed directly after a Retrieve is automatically optimized into a single lightweight database query, staying safe even for large lists.

### mf-8

A loop currently finds the most expensive OrderLine using Aggregate List (max) plus a matching loop. Which refactor does the course recommend?

- A. Sort descending on SellingPrice, then Head to take the first object
- B. Filter on the max price, then use Find
- C. Use Tail after sorting ascending
- D. Replace the loop with an Intersect list operation

**Answer:** A

**Source:** Module 3.4.1. The Sort-then-Head pattern is the general-purpose replacement for "loop to find the min/max item".

### mf-9

A sub-microflow is called inside a loop and contains a Commit activity with "Refresh in client" set to Yes. What is wrong?

- A. Nothing — committing per iteration keeps data consistent
- B. Committing inside a loop causes many database round-trips and drastically hurts performance; commit once after the loop
- C. Refresh in client is not supported inside sub-microflows
- D. The commit should be moved before the loop instead

**Answer:** B

**Source:** Module 4.4.1 key rule: never put a Commit activity inside a loop — batch the changes and commit the whole list once in the main microflow.

### mf-10

Which commit rule does the course give for sub-microflows?

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

### mf-12

A "get or create Account" sub-microflow is modelled with two end events, both typed as Account. What benefit does this give the calling microflow?

- A. The caller needs only one downstream Show page action, with no duplicated logic or extra decision
- B. The caller can skip committing the Account object
- C. The sub-microflow can be reused as a Rule inside a decision
- D. Entity access no longer needs to be applied on the Account entity

**Answer:** A

**Source:** Module 4.3 — the get-or-create pattern. Both end events returning the same entity means the sub-microflow always returns an Account, so the caller needs only one Show page action.

### mf-13

An unconditional breakpoint is placed on a decision that sits inside a loop. When will the microflow break?

- A. Only on the first iteration
- B. Each time the breakpoint is passed — on every iteration
- C. Only on the last iteration
- D. Never — breakpoints inside loops are ignored by the debugger

**Answer:** B

**Source:** Module 5 Knowledge Check Q3 / 5.4. Without a breakpoint condition, an in-loop breakpoint triggers on every single iteration — hence the rule to always add a break condition inside loops.

## Track Application Behavior with Logging

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

A log node is configured at Warning level. Which messages will be shown for that node?

- A. Warning only
- B. Warning, Error and Critical
- C. Trace, Debug and Info
- D. All six levels

**Answer:** B

**Source:** Module 2. Levels are cumulative going up in severity — Warning also surfaces Error and Critical, but not Info, Debug or Trace.

### log-5

Where do log messages come from?

- A. They are all generated automatically by the Mendix Runtime
- B. They are generated by the database adapter when SQL is executed
- C. They are written by the person who created the functionality being logged
- D. They are produced only by Marketplace modules, never by your own logic

**Answer:** C

**Source:** Module 2 Knowledge Check. Both the Mendix platform/module developers and the app’s own developers write the messages for the functionality they build.

### log-6

Why should log node names be defined in an Enumeration and read with getKey()?

- A. Because Mendix rejects free-text log node names at runtime
- B. It automatically registers the log node with the Mendix Portal
- C. Because enumerations are the only values allowed in a Log message activity
- D. It standardizes the log node name and groups every log node name in the app in one place

**Answer:** D

**Source:** Module 5.3.1 / Knowledge Check Q1. The enumeration standardizes naming and gives the team a single central list of every log node in the module.

### log-7

A Holiday Request app calls an external weather API. The call fails, but users can still submit requests without weather data. Which log level does the course settle on for that error flow?

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

Which of the following is NOT one of the common Mendix error categories covered by the course?

- A. Autocommitted objects
- B. Java out of memory errors
- C. XPath syntax errors detected at runtime
- D. Null pointers

**Answer:** C

**Source:** Module 4. The categories covered are null pointers, security errors, mathematical errors, Java out of memory errors, autocommitted objects and application breaks on startup.

### log-10

Which option on a Log message activity attaches the chain of microflow calls that led to a failure?

- A. Refresh in client
- B. Include latest error
- C. Blocking
- D. Include latest stack trace

**Answer:** D

**Source:** Module 4 — Stack traces. "Include latest stack trace" attaches the call chain and is especially valuable on Log message activities inside error-handling flows.

### log-11

An operator wants to be notified automatically the moment an application-breaking issue is logged. What should be configured?

- A. Critical Logs alerts in the Mendix Portal Alerts window
- B. A scheduled event that polls Deploy > Logs every minute
- C. The Run > Default Log Level setting in Studio Pro
- D. A Warning-level log node registered at startup

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

## Win at Working with Data

### data-1

True or false: a retrieve by association will always be an in-memory retrieve.

- A. True, by association always reads from the transaction object cache
- B. False, a retrieve by association always queries the database
- C. True, unless the association is a reference set
- D. False, if objects aren't available in memory a retrieve by association will automatically result in a database retrieve

**Answer:** D

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

Which of the following is NOT an advantage of the Database data source option over the XPath option?

- A. It can specify constraints that span multiple entities
- B. It is the only option supported in offline mobile apps
- C. It is easier to configure with guided constraint selection in Studio Pro
- D. It covers most simple filtering needs without writing query syntax

**Answer:** A

**Source:** Module 2 Knowledge Check Q4. Spanning multiple entities is something only XPath can do; the Database option allows only simple constraints on the retrieved entity.

### data-7

A batch process retrieves 10,000 Products using Limit and Offset. Records are being skipped. Which cause matches the course’s hard rules?

- A. The batch size of 250 is too small for the dataset
- B. An attribute that changes during the run is part of the retrieve constraint, so the underlying set shifts between iterations
- C. The retrieve is by association instead of from database
- D. The offset variable is an Integer instead of a Long

**Answer:** B

**Source:** Module 3.3.1. Rule 1: when using Limit and Offset together, attributes that can change during the run must not be part of the constraint, or records get skipped as the result set shifts.

### data-8

Why does the course insist that a batched retrieve always define a sort order?

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

Which statement about the Task Queue is TRUE?

- A. Queued tasks only start once the creating transaction has fully committed
- B. Queued tasks start executing immediately, even if the creating transaction is later rolled back
- C. Queued tasks execute strictly one at a time in FIFO order under all conditions
- D. Queued tasks accept any parameter type, including non-persistable entities

**Answer:** A

**Source:** Module 3.4 — Task Queue. Tasks fire only after the creating transaction commits; they run FIFO but can execute in parallel, and parameter types are limited to primitives and committed persistable entities.

### data-11

Which is the optimized form of [OrderLine_Product/Product/MinimalStock > 50][OrderLine_Product/Product/Status = ‘Active’]?

- A. [OrderLine_Product/Product/MinimalStock > 50 or OrderLine_Product/Product/Status = 'Active']
- B. [OrderManagement.OrderLine_Product/OrderManagement.Product[MinimalStock > 50 and Status = 'Active']]
- C. [not(OrderLine_Product/Product/MinimalStock <= 50)][OrderLine_Product/Product/Status = 'Active']
- D. The original form is already optimal because bracket sets are implicitly ANDed

**Answer:** B

**Source:** Module 4.4 — Combine Paths. Merging constraints that share an association path into one bracketed sub-query stops the database evaluating all unique path combinations twice.

### data-12

Which statement is NOT an XPath best practice for optimal performance?

- A. Put the most limiting constraint first
- B. Limit the number of associations crossed in one query
- C. Do not use XPath when you can use SQL instead
- D. Avoid or across two different association paths — split into two retrieves and merge the results

**Answer:** C

**Source:** Module 4 Knowledge Check Q5. "Use SQL instead" is not a course recommendation — XPath is the platform-standard, database-agnostic approach. The other three are genuine guidelines.
