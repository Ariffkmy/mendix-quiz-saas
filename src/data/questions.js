/**
 * Mendix Advanced Developer Certification — practice question bank.
 *
 * Each question:
 *   id       unique stable identifier (used as the answer-map key)
 *   topic    exam module the question belongs to (matches a knowledge-base file)
 *   question the question text
 *   options  4 answer options, in A/B/C/D order
 *   answer   the correct option letter
 *   src      explanation, citing the module the answer comes from
 */
export const QUESTIONS = [
  // ---- Advanced Domain Model Skills (13) ----
  {
    id: 'adm-1',
    topic: 'Advanced Domain Model Skills',
    question:
      'What is the default value of the attribute DeleteAfterDownload on System.FileDocument?',
    options: [
      'False',
      'True',
      'Empty',
      'It depends on the file size',
    ],
    answer: 'A',
    src: 'Module 3 — System Entities. DeleteAfterDownload defaults to false; when set to true the file is removed from storage after being downloaded once.',
  },
  {
    id: 'adm-2',
    topic: 'Advanced Domain Model Skills',
    question:
      'A DateTime attribute has Localize set to No. The date displayed in the client is based on the:',
    options: [
      'Browser (client device) time zone',
      'UTC value',
      'App Settings default time zone',
      'User time zone set on the account',
    ],
    answer: 'B',
    src: 'Module 7 — Date Time Handling, Knowledge Check Q1. With Localize = No the client always shows the raw stored UTC value, regardless of browser or account time zone.',
  },
  {
    id: 'adm-3',
    topic: 'Advanced Domain Model Skills',
    question:
      'True or false: making Goalkeeper a specialization of Player results in a single database table holding all the attributes of both entities.',
    options: [
      'True — Mendix flattens the hierarchy into one table for performance',
      'True — but only when the specialization adds no new attributes',
      'False — inheritance is stored as two separate tables linked by a shared, synchronized ID',
      'False — inheritance creates three tables, just like a 1-1 association',
    ],
    answer: 'C',
    src: 'Module 2 — Working with Inheritance. Inheritance is stored as two tables (generalization + specialization) sharing a synchronized primary key. A 1-1 association is the three-table structure.',
  },
  {
    id: 'adm-4',
    topic: 'Advanced Domain Model Skills',
    question:
      'A developer has a microflow parameter typed as the generalization Player and needs to branch on whether the object is actually a Goalkeeper before reading a goalkeeper-only attribute. Which combination should they use?',
    options: [
      'An exclusive split on an expression, then a Retrieve by association',
      'A Rule returning an enumeration, then a Change Object',
      'A Cast activity, then an inheritance split',
      'An object type decision, then a Cast activity',
    ],
    answer: 'D',
    src: 'Module 2 — Working with Inheritance. The object type decision (green diamond) branches on the concrete runtime type; the Cast activity converts the generalized variable into the specialized type so its members become available.',
  },
  {
    id: 'adm-5',
    topic: 'Advanced Domain Model Skills',
    question:
      'Which of the following is NOT a reason the course gives for creating a module-specific specialization of System.Image instead of using System.Image directly?',
    options: [
      'Performance — a specialization stores binary contents in fewer database tables',
      'Security — entity access can be scoped to your own specialization',
      'Maintainability — file-handling logic stays contained and upgrade-safe',
      'Purpose — you can add your own attributes and associations',
    ],
    answer: 'A',
    src: 'Module 3 — System Entities. The three stated reasons are purpose, security and maintainability. Specializing actually adds a table; it is not a storage/performance optimization.',
  },
  {
    id: 'adm-6',
    topic: 'Advanced Domain Model Skills',
    question:
      'Where are the contents of a System.FileDocument stored by default, and what is the supported alternative?',
    options: [
      'In a BLOB column of the entity table; alternatively in a separate schema',
      'On the application server filesystem; alternatively in an external object store such as Amazon S3',
      'In the Mendix Client session cache; alternatively on the app server filesystem',
      'In the System module database table; alternatively in a CDN',
    ],
    answer: 'B',
    src: 'Module 3 — System Entities. File contents live on the application server filesystem by default and can be reconfigured to use an external object store such as Amazon S3 for scalability.',
  },
  {
    id: 'adm-7',
    topic: 'Advanced Domain Model Skills',
    question:
      'Which two statements about modelling a many-to-many relationship are correct, according to the course benchmark? (Pick the option that states them both.)',
    options: [
      'A plain reference set is fastest, and joining entities should only be used for extra attributes',
      'A reference set "both" is fastest, and a joining entity adds unnecessary complexity',
      'A joining entity is roughly 3–4x faster than a plain reference set, and reference set "both" is the slowest option',
      'All three options perform identically; the choice is purely stylistic',
    ],
    answer: 'C',
    src: 'Module 4 — Associations and Reference Sets. The PerformanceTest benchmark showed the joining entity pattern roughly 3–4x faster than a plain reference set, with reference set "both" (*-*) the slowest and most expensive option.',
  },
  {
    id: 'adm-8',
    topic: 'Advanced Domain Model Skills',
    question:
      'Which XPath condition can make effective use of a database index on the constrained attribute?',
    options: [
      "[contains(Name, 'washer')]",
      "[ends-with(Name, 'er')]",
      '[not(Active)]',
      "[starts-with(ProductNumber, 'BK')]",
    ],
    answer: 'D',
    src: 'Module 5 — Indexes. Indexes work best with Equals or Starts-with conditions; Contains and Ends-with cannot use the index efficiently.',
  },
  {
    id: 'adm-9',
    topic: 'Advanced Domain Model Skills',
    question:
      'In the four-stage rocket data-conversion approach, why does Stage 4 delete the old attributes BEFORE fixing the remaining build errors?',
    options: [
      "Because Studio Pro's error list then acts as a free to-do list of every place still referencing the old structure",
      'Because Studio Pro refuses to compile while duplicate attributes exist',
      'Because the database sync can only run when the model has no unused attributes',
      'Because the conversion microflow cannot be deleted until the attributes are gone',
    ],
    answer: 'A',
    src: 'Module 5 — Data Conversions. Deleting the old attributes first is a deliberate technique: the resulting error list enumerates every leftover reference so nothing is missed.',
  },
  {
    id: 'adm-10',
    topic: 'Advanced Domain Model Skills',
    question:
      'A developer adds a new entity and two new associations to a live production domain model. What does the course say about the data conversion?',
    options: [
      'Nothing is needed — structural changes are handled automatically by Mendix',
      'A custom conversion microflow is always required for structural changes',
      'Only a type-conversion microflow is needed; the structure syncs itself',
      'The database must be dropped and recreated from the new model',
    ],
    answer: 'B',
    src: 'Module 5 — Data Conversions. Type changes are partially handled automatically (a custom microflow is still recommended); structural changes always require a custom conversion microflow.',
  },
  {
    id: 'adm-11',
    topic: 'Advanced Domain Model Skills',
    question:
      "The self-reference Apprentice_Buddy exists on Player. A list view inside a data view on a Player must show that player's buddy (not their apprentices). Which XPath is correct?",
    options: [
      "[SoccerSquad.Apprentice_Buddy = '[%CurrentObject%]']",
      "[reversed(SoccerSquad.Apprentice_Buddy) = '[%CurrentObject%]']",
      "[SoccerSquad.Apprentice_Buddy [reversed()] = '[%CurrentObject%]']",
      "[SoccerSquad.Apprentice_Buddy = '[%CurrentUser%]'] [reversed()]",
    ],
    answer: 'C',
    src: 'Module 6 — Self References. The plain constraint returns the apprentices of the current object; adding [reversed()] immediately after the self-reference step flips the direction so the buddy is returned.',
  },
  {
    id: 'adm-12',
    topic: 'Advanced Domain Model Skills',
    question:
      'Which statement about the [reversed()] expression is true?',
    options: [
      'It reverses the direction of every association in the whole XPath expression',
      'It reverses the sort order of the returned list',
      'It can be used on any association whose two ends have the same cardinality',
      'It works only on self-references and affects only the one association it is attached to',
    ],
    answer: 'D',
    src: 'Module 6 — Self References. [reversed()] applies only to the single association step it is attached to and is only needed for self-references — for associations between two different entities Mendix determines the join direction itself.',
  },
  {
    id: 'adm-13',
    topic: 'Advanced Domain Model Skills',
    question:
      'A DateTime attribute is NOT localized. On the application server, which expression should be used to format it so that every user gets a consistent result?',
    options: [
      'formatDateTimeUTC()',
      'formatDateTime()',
      'formatDateTime() wrapped in parseDateTimeUTC()',
      'Either one — localization only affects the client',
    ],
    answer: 'A',
    src: 'Module 7 — Date Magic on the Application Server. Rule: localized attribute → non-UTC expression; non-localized attribute → UTC expression. Mismatching them silently shifts the value by the acting user’s offset.',
  },
  // ---- Configure Advanced Security (13) ----
  {
    id: 'sec-1',
    topic: 'Configure Advanced Security',
    question:
      "Entity Request has a Status attribute (Draft / Submitted / Approved). The Customer module role has exactly one access rule: read and write, with XPath constraint [Status = 'Draft']. A page shows a data grid over Request with no page-level constraint. What does a Customer see in that grid?",
    options: [
      'All the requests, regardless of status',
      'All the requests in the Draft status',
      'No results, because the page has no constraint',
      'Only the Draft requests the Customer created',
    ],
    answer: 'B',
    src: "Module 2 Knowledge Check. The entity-level XPath is added to every database retrieve, so it applies even though the grid itself is unconstrained. It is not scoped to the creator — that would additionally require [System.owner = '[%CurrentUser%]'].",
  },
  {
    id: 'sec-2',
    topic: 'Configure Advanced Security',
    question:
      'You are modeling Employee and Customer entities alongside the Account entity. Which approach does the course recommend?',
    options: [
      'Make Employee and Customer specializations of Account',
      'Make Account a specialization of both Employee and Customer',
      'Model Employee and Customer as separate entities, each with a 1-1 association to Account',
      'Store all employee and customer attributes directly on Account',
    ],
    answer: 'C',
    src: 'Module 4.3. Never inherit from User or Account for process data — specializing Account entangles login/account security with process-data security and produces conflicting restrictions. Associate instead.',
  },
  {
    id: 'sec-3',
    topic: 'Configure Advanced Security',
    question:
      'The same Request entity has no access rule at all defined for the Administrator module role. What does an Administrator see on a page showing Requests?',
    options: [
      'All requests — administrators bypass entity access',
      'Only requests the administrator owns',
      'A runtime security exception is thrown at page load',
      'No results would be returned',
    ],
    answer: 'D',
    src: 'Module 2.10 Knowledge Check. Mendix denies by default: if no access rule grants a role access to an entity, that role gets nothing back.',
  },
  {
    id: 'sec-4',
    topic: 'Configure Advanced Security',
    question:
      'Continuing that scenario, you grant the Administrator page access to the Request page but still define no entity access rule. What happens?',
    options: [
      'Studio Pro detects an error and prevents deployment',
      'The page runs but silently shows an empty grid',
      'Mendix automatically generates a read-only access rule',
      'The page is hidden from the navigation at runtime',
    ],
    answer: 'A',
    src: "Module 2.10 Knowledge Check. The 'Check security' analysis flags the inconsistency between page access and missing entity access, blocking deployment.",
  },
  {
    id: 'sec-5',
    topic: 'Configure Advanced Security',
    question:
      'Which of the following is NOT true about the Apply entity access setting on a microflow?',
    options: [
      "It adds the current user's entity XPath rules to database actions inside the microflow",
      'It should be enabled on every microflow in the app as a blanket best practice',
      'It should be enabled for anonymous and deep-link microflows handling sensitive data',
      'A microflow with it set to No cannot call a sub-microflow that has it set to Yes',
    ],
    answer: 'B',
    src: 'Module 3.2–3.4. Blanket-enabling Apply entity access breaks legitimate microflows that write read-only values or create logs for the user. CE0114 covers the calling restriction.',
  },
  {
    id: 'sec-6',
    topic: 'Configure Advanced Security',
    question:
      'A microflow with Apply entity access = Yes creates a Security.Counter object and writes its Count attribute. The Customer role has Create rights but only Read on the Count attribute. What does the end user see?',
    options: [
      "The specific message 'Creating object of type Security.Counter failed for security reasons'",
      'A validation feedback message on the Count field',
      "The generic message 'An error occurred, please contact your system administrator', with the real cause only in the Console log",
      'Nothing — the write is silently skipped and the microflow continues',
    ],
    answer: 'C',
    src: "Module 3.4.1. A denied create gives the specific message; a denied member write gives the generic UI error, and the Console log reveals “Write access denied for member 'Counter'”.",
  },
  {
    id: 'sec-7',
    topic: 'Configure Advanced Security',
    question:
      "The ____ checkbox under System members must be enabled before the XPath option \"Path to Owner\" can generate [System.owner = '[%CurrentUser%]'] for an entity.",
    options: [
      'Store in system context',
      "Store 'changedDate'",
      'Apply entity access',
      "Store 'owner'",
    ],
    answer: 'D',
    src: "Module 2.3.1 / 3.4.2. The owner is only available if Store 'owner' is checked, and only for data created after the option was enabled — it is not applied retroactively.",
  },
  {
    id: 'sec-8',
    topic: 'Configure Advanced Security',
    question:
      'House is a specialization of Building, which has attribute SquareFoot. The Administrator rule on Building grants SquareFoot = Read. The Administrator rule on House grants Bedrooms and SquareFoot = Read, Write. What is the result for an Administrator?',
    options: [
      'Read SquareFoot in Building data views, and read and write it in House data views',
      'Read and write SquareFoot everywhere, because the specialization rule wins',
      'Read-only SquareFoot everywhere, because the generalization rule wins',
      'A consistency error — conflicting rules on an inherited attribute are not allowed',
    ],
    answer: 'A',
    src: "Module 3.6 Knowledge Check. Each entity's own access rule governs its own data views, even for an inherited attribute.",
  },
  {
    id: 'sec-9',
    topic: 'Configure Advanced Security',
    question:
      'What is the recommended value for "Default rights for new members" on an entity access rule, and why?',
    options: [
      'Read — so new attributes are at least visible without extra work',
      'None — so you must consciously review the rule whenever you add an attribute or association',
      'Read/Write — so the model stays functional as it grows',
      'Inherit — so specializations stay in sync with their generalization',
    ],
    answer: 'B',
    src: 'Module 3.4. Setting it to None forces a deliberate review of each access rule when the entity gains members, instead of the platform silently granting access.',
  },
  {
    id: 'sec-10',
    topic: 'Configure Advanced Security',
    question:
      'An app has roles Administrator, Teacher and Student. Admins can manage all roles; Teachers can manage users with the Student role. Which statement is FALSE?',
    options: [
      'Administrators can create student accounts',
      'Teachers can reset the password of any student account in the app',
      'Administrators and teachers can create teacher accounts',
      'Administrators can create teacher accounts',
    ],
    answer: 'C',
    src: 'Module 4.6 Knowledge Check. Teachers manage only the Student role, so they cannot create Teacher accounts — only Administrators (User management = All) can.',
  },
  {
    id: 'sec-11',
    topic: 'Configure Advanced Security',
    question:
      'Teachers are given User management = Selected → Student so they can manage their own class. Is this sufficient?',
    options: [
      'Yes — User management automatically scopes to associated users',
      'No — User management only controls page access, not account editing',
      'Yes, provided the Student role also has User management set to None',
      'No — teachers can now edit the account of any Student, not just those in their class',
    ],
    answer: 'D',
    src: 'Module 4.6 Knowledge Check. User management grants access to all users holding that role; scoping to "my students" requires entity-level ownership rules on the process data instead.',
  },
  {
    id: 'sec-12',
    topic: 'Configure Advanced Security',
    question:
      'Which item is NOT part of the recommended checklist for configuring an Anonymous user role?',
    options: [
      'Give the role the Administrator module role in the System module so sessions can be created',
      'Grant the role access only to necessary microflows, such as forgot-password',
      'Remove read access to data that is not visible on the anonymous pages',
      'Give the role the User module role in the System module',
    ],
    answer: 'A',
    src: 'Module 4.4. The Anonymous role needs at least the System User module role plus Anonymous module roles elsewhere — never an administrator-level module role.',
  },
  {
    id: 'sec-13',
    topic: 'Configure Advanced Security',
    question:
      'A user holds two user roles, and both roles have a role-based home page defined. Which home page does Mendix open?',
    options: [
      'The one with the most permissive access rules',
      'The one belonging to the first role in the user role list',
      'The app-level default home page, ignoring both role home pages',
      'Mendix raises a consistency error at design time',
    ],
    answer: 'B',
    src: 'Module 5.3. With multiple roles Mendix simply uses the first role in the list — reorder the list to control it, or define a combined user role for a specific role combination.',
  },
  // ---- Constrain Your Data Using Advanced XPath (12) ----
  {
    id: 'xpath-1',
    topic: 'Constrain Your Data Using Advanced XPath',
    question:
      'In relational algebra, which operation combines the information of two entities into one?',
    options: [
      'Selection',
      'Projection',
      'Cartesian product',
      'Set union',
    ],
    answer: 'C',
    src: 'Module 2.2. Cartesian Product combines the information of two entities into one; associations use this concept. Selection filters rows, Projection selects columns, Set Union merges two lists without duplicates.',
  },
  {
    id: 'xpath-2',
    topic: 'Constrain Your Data Using Advanced XPath',
    question:
      'One of your XPath queries that uses the contains() function is not performing well. What is the most likely root cause?',
    options: [
      'The function is being applied to an association instead of an attribute',
      'You are using the function inside a security access rule',
      'contains() cannot be combined with the and operator',
      "You are using the function on a string attribute that is set to 'unlimited'",
    ],
    answer: 'D',
    src: 'Module 3.2. Avoid string-search functions such as contains() on attributes with unlimited length — it hurts performance significantly.',
  },
  {
    id: 'xpath-3',
    topic: 'Constrain Your Data Using Advanced XPath',
    question:
      'Which concept matches this description: "selects a subset of columns for all objects of an entity, and in Mendix is implemented by attribute access rules"?',
    options: [
      'Projection',
      'Selection',
      'Set difference',
      'Cartesian product',
    ],
    answer: 'A',
    src: 'Module 2.2. Projection selects a subset of attributes (columns); Mendix security / attribute access rules are its equivalent.',
  },
  {
    id: 'xpath-4',
    topic: 'Constrain Your Data Using Advanced XPath',
    question:
      'What is the correct order of translation when the runtime executes an XPath query?',
    options: [
      'XPath → SQL → OQL → database',
      'XPath → OQL → SQL → database',
      'XPath → JDBC → OQL → database',
      'XPath is executed directly against the database with no translation',
    ],
    answer: 'B',
    src: "Module 2.3. The Query Manager converts XPath into OQL using schema information, then the Database Adapter converts OQL into the target database's SQL dialect.",
  },
  {
    id: 'xpath-5',
    topic: 'Constrain Your Data Using Advanced XPath',
    question:
      'Which of the following XPath expressions is INVALID?',
    options: [
      '[Available = true() and Active = false()]',
      '[Available = true()][Active = false()]',
      '[Available = true()] and [Active = false()]',
      "[Color = 'Black' or Color = 'Silver/Black']",
    ],
    answer: 'C',
    src: 'Module 4.2. Logical operators can only be used inside the square brackets. Multiple bracket sets are implicitly combined with and; placing "and" between bracket sets is invalid XPath.',
  },
  {
    id: 'xpath-6',
    topic: 'Constrain Your Data Using Advanced XPath',
    question:
      'The not() function in XPath:',
    options: [
      'Is automatically rewritten by the runtime into a Subtract list operation',
      'Is the fastest way to exclude objects, since it is evaluated in memory',
      'Can only be applied to boolean attributes, never to associations',
      'Generates a slow query because of the SQL it produces internally',
    ],
    answer: 'D',
    src: 'Module 4.3. not() is generally slow due to the generated SQL — the recommended alternative is two retrieves plus a Subtract list operation in a microflow.',
  },
  {
    id: 'xpath-7',
    topic: 'Constrain Your Data Using Advanced XPath',
    question:
      'Which XPath filters SalesOrderHeader objects whose OrderDate falls in the second calendar quarter?',
    options: [
      '[quarter-from-dateTime(OrderDate) = 2]',
      "[OrderDate = 'Q2']",
      '[month-from-dateTime(OrderDate) between 4 and 6]',
      "[contains(OrderDate, '2')]",
    ],
    answer: 'A',
    src: 'Module 3.2.3. quarter-from-dateTime() extracts the calendar quarter (1–4) from a DateTime attribute.',
  },
  {
    id: 'xpath-8',
    topic: 'Constrain Your Data Using Advanced XPath',
    question:
      'A developer wants to constrain Customers to the logged-in user. Which form does the course call optimal?',
    options: [
      '[Sales.Customer_Account/Administration.Account/id = $currentUser]',
      '[Sales.Customer_Account = $currentUser]',
      '[Sales.Customer_Account/Administration.Account/Name = $currentUser/Name]',
      '[not(Sales.Customer_Account != $currentUser)]',
    ],
    answer: 'B',
    src: 'Module 5.2. Compare directly against the association — you rarely need to retrieve the related object, so stopping at the association produces the most optimal query.',
  },
  {
    id: 'xpath-9',
    topic: 'Constrain Your Data Using Advanced XPath',
    question:
      'Which microflow list operations can replace an XPath or and an XPath and respectively?',
    options: [
      'Subtract and Union',
      'Intersect and Subtract',
      'Union and Intersect',
      'Filter and Sort',
    ],
    answer: 'C',
    src: 'Module 5.2. An or can be replaced with a Union list operation; an and can be replaced with an Intersect list operation.',
  },
  {
    id: 'xpath-10',
    topic: 'Constrain Your Data Using Advanced XPath',
    question:
      'When should you apply a database index, according to the course?',
    options: [
      'Preemptively on every searchable attribute, before go-live',
      'Only on non-persistable entities used for search forms',
      'On every attribute with an unlimited string length',
      'On attributes used in searches, once app performance proves to be insufficient',
    ],
    answer: 'D',
    src: 'Module 5.3. Do not index preemptively — indexes make inserts more costly. Analyze performance first, then index frequently-searched, rarely-changing attributes.',
  },
  {
    id: 'xpath-11',
    topic: 'Constrain Your Data Using Advanced XPath',
    question:
      'An Order table repeats the customer name and address on every row. Deleting all of a customer’s orders would erase every trace of that customer. Which anomaly is this?',
    options: [
      'Deletion anomaly',
      'Update anomaly',
      'Insertion anomaly',
      'Projection anomaly',
    ],
    answer: 'A',
    src: 'Module 6.3. The deletion anomaly is potential data loss — removing the orders also removes the only record of the customer. Insertion = unintended duplication; update = inconsistent data.',
  },
  {
    id: 'xpath-12',
    topic: 'Constrain Your Data Using Advanced XPath',
    question:
      'A reporting dashboard needs aggregated figures combined from several entities, and XPath is already fully optimized. What does the course suggest?',
    options: [
      'Write raw SQL through a Java action',
      'Use OQL, which resembles SQL and can aggregate across entities in one query',
      'Add indexes on every attribute involved in the report',
      'Split the report into one XPath retrieve per entity and merge them on the page',
    ],
    answer: 'B',
    src: 'Module 5.5. OQL is the more SQL-like alternative to XPath: it combines information from several entities and performs aggregation itself, significantly reducing the number of separate retrieves.',
  },
  // ---- Design and Publish a REST API (13) ----
  {
    id: 'rest-1',
    topic: 'Design and Publish a REST API',
    question:
      'Which HTTP methods are considered safe?',
    options: [
      'GET, POST & PUT',
      'PUT, PATCH & DELETE',
      'GET, PUT & DELETE',
      'GET, HEAD & OPTIONS',
    ],
    answer: 'D',
    src: 'Module 2 — Methods. Safe means the state of the system is not changed after the method finishes. Only GET, HEAD and OPTIONS are marked Safe in the properties table.',
  },
  {
    id: 'rest-2',
    topic: 'Design and Publish a REST API',
    question:
      'What must a custom authentication microflow for a published REST service return?',
    options: [
      'A System.User object',
      'An HttpResponse object',
      'A Boolean indicating whether authentication succeeded',
      'The API key as a String',
    ],
    answer: 'A',
    src: "Module 5 — Security. Custom authentication requires a microflow that returns a System.User object; the custom authentication parameter (e.g. an X-API-Key header) maps to that microflow's parameter.",
  },
  {
    id: 'rest-3',
    topic: 'Design and Publish a REST API',
    question:
      'Which of the following is NOT idempotent?',
    options: [
      'PUT',
      'POST',
      'DELETE',
      'HEAD',
    ],
    answer: 'B',
    src: 'Module 2 — Properties of Methods. POST is neither safe nor idempotent because each call creates a new object. PUT, DELETE, HEAD (and GET/OPTIONS) are idempotent.',
  },
  {
    id: 'rest-4',
    topic: 'Design and Publish a REST API',
    question:
      'A consumer must fetch one specific book by its system-generated id. How should the identifier be passed?',
    options: [
      'As a query parameter: /books?id=100034',
      'In the request body of the GET',
      'As a path parameter: /books/100034',
      'As a custom header: X-Book-Id: 100034',
    ],
    answer: 'C',
    src: 'Module 2 — GET. Use a path parameter for a single specific resource and query parameters only to filter a collection. If the path-identified resource is missing, return 404 Not Found.',
  },
  {
    id: 'rest-5',
    topic: 'Design and Publish a REST API',
    question:
      'A POST successfully creates a new Book. Which response is correct according to the course guidelines?',
    options: [
      '200 OK with an empty body',
      '201 Created with an empty body, since the client already has the data',
      '204 No Content with a Location header only',
      '201 Created with the created object, including its identifier, in the body',
    ],
    answer: 'D',
    src: 'Module 2 — POST. Send to the collection endpoint, commit the object, set status 201 Created, and return the created object including the identifier it can be retrieved with.',
  },
  {
    id: 'rest-6',
    topic: 'Design and Publish a REST API',
    question:
      'To implement true PUT semantics in Mendix (fields missing from the request become empty), which import mapping approach is required?',
    options: [
      '"Retrieve by microflow", where the microflow clears all mapped attributes before the mapping runs',
      '"Find by key", which naturally blanks unmapped attributes',
      '"Create object", so a fresh object replaces the old one entirely',
      'No special handling — Mendix already resets unmapped attributes on PUT',
    ],
    answer: 'A',
    src: 'Module 2 — PUT nuance. "Find by key" will not overwrite existing values with empties. Use "retrieve by microflow": the microflow retrieves the object and sets all mapped attributes to empty first, so only supplied fields get values.',
  },
  {
    id: 'rest-7',
    topic: 'Design and Publish a REST API',
    question:
      'True or false: a successful DELETE should return 204 No Content with no response body.',
    options: [
      'False — it should return 200 OK with the deleted object',
      'True',
      'False — it should return 202 Accepted',
      'False — it should return 404 once the object no longer exists',
    ],
    answer: 'B',
    src: 'Module 2 — DELETE. A successful DELETE returns 204 No Content and no body; a 404 is returned only if the object was not found in the first place.',
  },
  {
    id: 'rest-8',
    topic: 'Design and Publish a REST API',
    question:
      'An external system tries to update a Book, but the record has already been changed by an earlier update. Which status code fits best?',
    options: [
      '400 Bad Request',
      '403 Forbidden',
      '409 Conflict',
      '500 Internal Server Error',
    ],
    answer: 'C',
    src: 'Module 3 — Status Codes. 409 Conflict = the object cannot be updated because of an earlier update. 400 is failed validation; 403 is authenticated but not authorized.',
  },
  {
    id: 'rest-9',
    topic: 'Design and Publish a REST API',
    question:
      'Which statement about REST error message content is TRUE?',
    options: [
      'UserMessage is mandatory and SystemMessage is optional',
      'Error responses must always be a list, never a single error object',
      'Stack traces are acceptable in SystemMessage since it is developer-facing',
      'SystemMessage is mandatory and may contain technical information for developers',
    ],
    answer: 'D',
    src: 'Module 3 — Error Messages. SystemMessage must be present and may carry technical info; UserMessage is optional and must not be technical. Stack traces must never be exposed, and the response can be a single object or a list.',
  },
  {
    id: 'rest-10',
    topic: 'Design and Publish a REST API',
    question:
      'A developer builds their mapping documents from JSON snippets rather than message definitions. What is the downside?',
    options: [
      'There will be no meaningful examples on the Swagger page',
      'The service cannot be secured with custom authentication',
      'PATCH operations cannot be modelled',
      'The service will not appear at /rest-doc/servicename/',
    ],
    answer: 'A',
    src: 'Module 4 — Examples. Only message definitions let you override the generic "string"/0 placeholders with realistic example values shown on the Swagger page.',
  },
  {
    id: 'rest-11',
    topic: 'Design and Publish a REST API',
    question:
      'Which of the following is NOT one of the places where documentation can be added to a published REST service?',
    options: [
      'A parameter',
      'A status code',
      "An operation's summary and description",
      "An attribute's message definition field",
    ],
    answer: 'B',
    src: 'Module 4 — Extend API with Documentation. The six documentable places are the service, a resource, an operation (summary + description), parameters, an object message definition and an attribute message definition — all GitHub Flavored Markdown. Status codes, authentication and methods are not documentable.',
  },
  {
    id: 'rest-12',
    topic: 'Design and Publish a REST API',
    question:
      'Which of these is NOT a selectable authentication method in a published REST service configuration?',
    options: [
      'Username and password',
      'Active session',
      'API key',
      'Custom',
    ],
    answer: 'C',
    src: 'Module 5 — Security. The three selectable methods are username and password, active session and custom. An API key is a typical authentication *type* implemented through custom authentication.',
  },
  {
    id: 'rest-13',
    topic: 'Design and Publish a REST API',
    question:
      'You create a dedicated user role that exists only to access the published REST service. What extra step does the course require?',
    options: [
      'Give it the Administrator module role in System',
      'Mark the role as the default anonymous role',
      'Set the role’s User management option to All',
      'Disable the "Check security" checkbox on that role',
    ],
    answer: 'D',
    src: 'Module 5 — Standard Authentication. A service-only role must have "Check security" disabled, otherwise the app raises permission errors elsewhere.',
  },
  // ---- Error Handling (12) ----
  {
    id: 'err-1',
    topic: 'Error Handling',
    question:
      'You need to create error handling for Java actions because:',
    options: [
      'Mendix is not able to catch errors that occur in a Java action by default',
      'Java actions always roll back the entire transaction automatically',
      'Java actions cannot be used inside a sub-microflow',
      "Studio Pro's consistency checker flags every Java action as an error",
    ],
    answer: 'A',
    src: "Module 3.3. By default Mendix cannot catch errors occurring inside a Java action — the failure surfaces to the UI as the generic error and the transaction's changes are not executed, unless custom error handling is configured.",
  },
  {
    id: 'err-2',
    topic: 'Error Handling',
    question:
      'Which error handling type rolls back everything up to the error and initiates a new transaction, so that only the changes executed in the error-handler flow are applied?',
    options: [
      'Custom without rollback',
      'Custom with rollback',
      'Error End Event',
      'End Event',
    ],
    answer: 'B',
    src: 'Module 4.2. Custom With Rollback undoes everything up to the error and starts a new transaction. Custom Without Rollback keeps what happened before the error; Error End Event re-throws to parent microflows.',
  },
  {
    id: 'err-3',
    topic: 'Error Handling',
    question:
      'What happens when Mendix cannot finish a transaction successfully and no error handling is implemented?',
    options: [
      'The microflow is retried automatically three times before failing',
      'The transaction is committed partially, up to the failing activity',
      'The transaction is stopped and Mendix shows an error message in the user interface',
      'The error is written to the log only; the user sees nothing',
    ],
    answer: 'C',
    src: 'Module 3 Knowledge Check. The default behavior is to stop the transaction and display the generic "An error occurred, please contact your system administrator" message.',
  },
  {
    id: 'err-4',
    topic: 'Error Handling',
    question:
      'Which error handling type re-throws the error to all parent microflows after executing the custom activities?',
    options: [
      'End Event',
      'Custom without rollback',
      'Custom with rollback',
      'Error End Event',
    ],
    answer: 'D',
    src: 'Module 4.2 reference table. The Error End Event executes the custom activities and then re-throws the error upward to every parent microflow.',
  },
  {
    id: 'err-5',
    topic: 'Error Handling',
    question:
      'A nightly scheduled event synchronizes data over REST. There is no user present. What does the course recommend as the priority for error handling here?',
    options: [
      'A Log message activity so the details can be traced later',
      'A Show message activity so the next user to log in sees the failure',
      'Validation feedback on the affected object',
      'No error handling — scheduled events retry automatically',
    ],
    answer: 'A',
    src: 'Module 4.3. Match the strategy to the trigger: system-triggered microflows prioritize logging (no user to notify); user-triggered microflows prioritize a friendly Show message.',
  },
  {
    id: 'err-6',
    topic: 'Error Handling',
    question:
      'Fill in the blank: inside an error handler flow, the system variable ____ holds the message of the underlying exception.',
    options: [
      '$latestHttpResponse/Content',
      '$latestError/Message',
      '$currentException/Text',
      '$latestError/StackTrace',
    ],
    answer: 'B',
    src: 'Module 4.2.2 / 4.3.1. $latestError/Message is populated automatically inside an error handler and is used as a parameter in both the Log message and Show message templates.',
  },
  {
    id: 'err-7',
    topic: 'Error Handling',
    question:
      'Why is it necessary to create both a log message and a user message in an error handler?',
    options: [
      'Because the log message rolls back the transaction and the user message does not',
      'Because a Show message activity cannot include parameters',
      'Because the log message will not appear in the frontend',
      'Because Mendix ignores Show message activities in error flows',
    ],
    answer: 'C',
    src: 'Module 4 Knowledge Check. The log is only written to the server-side log files, invisible to the end user — so a separate user-facing message is needed as well.',
  },
  {
    id: 'err-8',
    topic: 'Error Handling',
    question:
      'True or false: adding as many layered error-handling combinations as possible makes an app more robust.',
    options: [
      'True — more handling always means fewer unhandled errors',
      'False — Mendix only allows one error handler per microflow',
      'True, provided every handler uses Custom with rollback',
      'False — overly complex handling slows down microflow evaluation and makes behavior on exception harder to predict',
    ],
    answer: 'D',
    src: 'Module 4.2.2 caution. Do not over-engineer error handling; keep it as simple as the situation requires.',
  },
  {
    id: 'err-9',
    topic: 'Error Handling',
    question:
      'When building a new microflow, where does the course recommend starting?',
    options: [
      'At the end of the microflow, defining the desired outcome first',
      'At the start event, adding parameters first',
      'With the error-handling flow, so failures are covered from the outset',
      'With the domain model changes the microflow will require',
    ],
    answer: 'A',
    src: 'Module 2 Knowledge Check. Start at the end so you focus on the main functionality/outcome first, then work backwards to what must happen to get there.',
  },
  {
    id: 'err-10',
    topic: 'Error Handling',
    question:
      'The ExcelImporter Java action StartImportByTemplate requires which inputs?',
    options: [
      'A System.Image and an ExcelImporter.Column list',
      'An ExcelImporter.Template object and a System.FileDocument, plus an optional import object parameter',
      'A System.FileDocument and a String sheet name',
      'Only the uploaded FileDocument — the template is looked up automatically',
    ],
    answer: 'B',
    src: 'Module 2.2.3. StartImportByTemplate takes a Template object (retrieved via XPath on ExcelImporter.Template) and the import Excel document, with an optional import object parameter.',
  },
  {
    id: 'err-11',
    topic: 'Error Handling',
    question:
      'The custom error message reveals "There is no object type selected for the template". What is the correct fix?',
    options: [
      'Add a Cast activity before the Java action call',
      'Change the error handling type to Custom without rollback',
      'Select the missing object type in the properties of the Excel import template',
      'Add the Template retrieve to the parent microflow instead of the sub-microflow',
    ],
    answer: 'C',
    src: "Module 5.3.1. The fix is made in the template's own configuration screen via 'Select an objecttype'.",
  },
  {
    id: 'err-12',
    topic: 'Error Handling',
    question:
      'After connecting an object type to an Excel import template, what must be done before the template can be saved?',
    options: [
      'Re-deploy the application',
      'Grant the Administrator role write access to the template entity',
      'Set the template Title attribute to a unique value',
      'Click "Connect matching attributes" to re-link the import columns',
    ],
    answer: 'D',
    src: 'Module 5 Knowledge Check. You must click "Connect matching attributes"; correctly connected columns then show green check marks.',
  },
  // ---- Master Modeling Microflows (13) ----
  {
    id: 'mf-1',
    topic: 'Master Modeling Microflows',
    question:
      "What does the list operation 'tail' do?",
    options: [
      'It grabs the last element in the list',
      'It grabs all elements in the list except the first element',
      'It grabs the first n elements of the list',
      'It reverses the order of the list',
    ],
    answer: 'B',
    src: "Module 3.3. Tail returns the list except for the first element(s) — not 'the last element', which the course flags as a common misconception. Head returns the first n objects.",
  },
  {
    id: 'mf-2',
    topic: 'Master Modeling Microflows',
    question:
      'Which statement about Rules is true?',
    options: [
      'A rule can show a page or a message to the user',
      'A rule can commit objects to the database',
      'A rule can only be called from within a decision',
      'A rule can call a web service',
    ],
    answer: 'C',
    src: 'Module 4.5. A Rule always returns a Boolean or Enumeration and can be used directly inside a Decision. Rules cannot change data, interact with the client, call web services, generate documents, or import XML.',
  },
  {
    id: 'mf-3',
    topic: 'Master Modeling Microflows',
    question:
      'Which of the following is a valid Mendix token?',
    options: [
      '[%CurrentAccount%]',
      '[%CurrentTime%]',
      '[%CurrentDayOfWeek%]',
      '[%CurrentUser%]',
    ],
    answer: 'D',
    src: 'Module 2.3. [%CurrentUser%] returns the logged-in user object. CurrentAccount, CurrentTime and CurrentDayOfWeek are common distractors that do not exist.',
  },
  {
    id: 'mf-4',
    topic: 'Master Modeling Microflows',
    question:
      'What is the easiest way to determine the name of the day of the week for a given date?',
    options: [
      "Use formatDateTime($date, 'EEEE')",
      'Compute daysBetween($date, [%BeginOfCurrentWeek%]) and map the number with if-then-else',
      'Use the [%CurrentDayOfWeek%] token',
      'Use a Rule returning an enumeration of weekdays',
    ],
    answer: 'A',
    src: "Module 2.5 / Knowledge Check. formatDateTime with pattern 'EEEE' (or 'E' for the abbreviation) is far simpler than manual date math.",
  },
  {
    id: 'mf-5',
    topic: 'Master Modeling Microflows',
    question:
      'A developer needs an associated object, but the association may be empty. Which approach is most efficient?',
    options: [
      'Retrieve the object first, then check whether the result is empty',
      'Use a decision to check whether the association exists, and only retrieve if it does',
      'Always retrieve and rely on the null-safe expression operators downstream',
      'Retrieve from database with an XPath constraint instead of by association',
    ],
    answer: 'B',
    src: 'Module 2 Knowledge Check Q4. Checking the association first avoids an unnecessary retrieve, which is more efficient than "retrieve first, then check if empty".',
  },
  {
    id: 'mf-6',
    topic: 'Master Modeling Microflows',
    question:
      'Which statement about lists in a microflow is TRUE?',
    options: [
      'You must check that a list is not empty before looping through it',
      'To empty a list you must remove its objects one at a time',
      'A list can originate from a Retrieve action, from creating a new list, or from an input parameter',
      'Lists can only be created by a Retrieve action',
    ],
    answer: 'C',
    src: 'Module 3.2. Those are the three list origins. Change List → Clear empties a list in one step, and looping an empty list simply performs zero iterations.',
  },
  {
    id: 'mf-7',
    topic: 'Master Modeling Microflows',
    question:
      'A microflow must count a few thousand Customers that are known to exist in the database. What is the best approach?',
    options: [
      'Loop over the customers and increment an integer variable',
      'Use a Rule returning the count as an integer',
      'Retrieve in batches of 250 and sum the batch counts',
      'Retrieve all customers and use a List Aggregation Count directly after the retrieve',
    ],
    answer: 'D',
    src: 'Module 3.4 / Knowledge Check. A List Aggregation placed directly after a Retrieve is automatically optimized into a single lightweight database query, staying safe even for large lists.',
  },
  {
    id: 'mf-8',
    topic: 'Master Modeling Microflows',
    question:
      'A loop currently finds the most expensive OrderLine using Aggregate List (max) plus a matching loop. Which refactor does the course recommend?',
    options: [
      'Sort descending on SellingPrice, then Head to take the first object',
      'Filter on the max price, then use Find',
      'Use Tail after sorting ascending',
      'Replace the loop with an Intersect list operation',
    ],
    answer: 'A',
    src: 'Module 3.4.1. The Sort-then-Head pattern is the general-purpose replacement for "loop to find the min/max item".',
  },
  {
    id: 'mf-9',
    topic: 'Master Modeling Microflows',
    question:
      'A sub-microflow is called inside a loop and contains a Commit activity with "Refresh in client" set to Yes. What is wrong?',
    options: [
      'Nothing — committing per iteration keeps data consistent',
      'Committing inside a loop causes many database round-trips and drastically hurts performance; commit once after the loop',
      'Refresh in client is not supported inside sub-microflows',
      'The commit should be moved before the loop instead',
    ],
    answer: 'B',
    src: 'Module 4.4.1 key rule: never put a Commit activity inside a loop — batch the changes and commit the whole list once in the main microflow.',
  },
  {
    id: 'mf-10',
    topic: 'Master Modeling Microflows',
    question:
      'Which commit rule does the course give for sub-microflows?',
    options: [
      'Always commit inside the sub-microflow, never in the caller',
      'Commit in the sub-microflow for objects passed in as parameters; commit in the caller for objects created inside',
      'Commit in the sub-microflow for objects created or retrieved inside it that are not passed out; commit in the main microflow for objects passed in as input parameters',
      'Never commit in either — always use auto-commit behavior',
    ],
    answer: 'C',
    src: 'Module 4.4 — Committing Inside or Outside of a Sub-Microflow. Those are the two stated rules.',
  },
  {
    id: 'mf-11',
    topic: 'Master Modeling Microflows',
    question:
      'A main microflow calls three sub-microflows, and each one retrieves the same Customer entity from the database. Should this change?',
    options: [
      'No — each sub-microflow should be self-contained',
      'No — the object cache makes the extra retrieves free',
      'Yes — merge the three sub-microflows into one so the retrieve happens once',
      'Yes — retrieve once in the main microflow and pass the Customer to all three as an input parameter',
    ],
    answer: 'D',
    src: 'Module 4 Knowledge Check Q2 / 4.4.3. Avoid unnecessary retrieves in sub-microflows: pass data already available in the main flow as an input parameter.',
  },
  {
    id: 'mf-12',
    topic: 'Master Modeling Microflows',
    question:
      'A "get or create Account" sub-microflow is modelled with two end events, both typed as Account. What benefit does this give the calling microflow?',
    options: [
      'The caller needs only one downstream Show page action, with no duplicated logic or extra decision',
      'The caller can skip committing the Account object',
      'The sub-microflow can be reused as a Rule inside a decision',
      'Entity access no longer needs to be applied on the Account entity',
    ],
    answer: 'A',
    src: 'Module 4.3 — the get-or-create pattern. Both end events returning the same entity means the sub-microflow always returns an Account, so the caller needs only one Show page action.',
  },
  {
    id: 'mf-13',
    topic: 'Master Modeling Microflows',
    question:
      'An unconditional breakpoint is placed on a decision that sits inside a loop. When will the microflow break?',
    options: [
      'Only on the first iteration',
      'Each time the breakpoint is passed — on every iteration',
      'Only on the last iteration',
      'Never — breakpoints inside loops are ignored by the debugger',
    ],
    answer: 'B',
    src: 'Module 5 Knowledge Check Q3 / 5.4. Without a breakpoint condition, an in-loop breakpoint triggers on every single iteration — hence the rule to always add a break condition inside loops.',
  },
  // ---- Track Application Behavior with Logging (12) ----
  {
    id: 'log-1',
    topic: 'Track Application Behavior with Logging',
    question:
      'Which field of a log message differs between viewing it in Studio Pro and viewing it in the Mendix Portal?',
    options: [
      'The Timestamp field',
      'The Log node field',
      'The Source field',
      'The Log level field',
    ],
    answer: 'C',
    src: 'Module 2 Knowledge Check. Source identifies which node/instance in a cloud cluster emitted the message, so it only applies to cloud-deployed environments and is absent from local Studio Pro output.',
  },
  {
    id: 'log-2',
    topic: 'Track Application Behavior with Logging',
    question:
      'How do you ensure that your log node name is available and configurable immediately after startup?',
    options: [
      'Declare the log node in the App Settings Loglevels tab',
      'Log nodes are always available; no action is required',
      'Create an enumeration key for it and set the default log level to Trace',
      'Add a log activity to a microflow that you call in the After Startup microflow',
    ],
    answer: 'D',
    src: 'Module 5.4.1. A log node only becomes visible once something has written to it, so register every node at startup via a sub-microflow that logs one message per node, called from After Startup.',
  },
  {
    id: 'log-3',
    topic: 'Track Application Behavior with Logging',
    question:
      'What is the correct order of Mendix log levels, from least to most severe?',
    options: [
      'Trace, Debug, Info, Warning, Error, Critical',
      'Debug, Trace, Info, Warning, Critical, Error',
      'Info, Debug, Trace, Warning, Error, Critical',
      'Trace, Info, Debug, Error, Warning, Critical',
    ],
    answer: 'A',
    src: 'Module 2. The order is Trace → Debug → Info → Warning → Error → Critical; configuring a node at a level also surfaces every more-severe level above it.',
  },
  {
    id: 'log-4',
    topic: 'Track Application Behavior with Logging',
    question:
      'A log node is configured at Warning level. Which messages will be shown for that node?',
    options: [
      'Warning only',
      'Warning, Error and Critical',
      'Trace, Debug and Info',
      'All six levels',
    ],
    answer: 'B',
    src: 'Module 2. Levels are cumulative going up in severity — Warning also surfaces Error and Critical, but not Info, Debug or Trace.',
  },
  {
    id: 'log-5',
    topic: 'Track Application Behavior with Logging',
    question:
      'Where do log messages come from?',
    options: [
      'They are all generated automatically by the Mendix Runtime',
      'They are generated by the database adapter when SQL is executed',
      'They are written by the person who created the functionality being logged',
      'They are produced only by Marketplace modules, never by your own logic',
    ],
    answer: 'C',
    src: 'Module 2 Knowledge Check. Both the Mendix platform/module developers and the app’s own developers write the messages for the functionality they build.',
  },
  {
    id: 'log-6',
    topic: 'Track Application Behavior with Logging',
    question:
      'Why should log node names be defined in an Enumeration and read with getKey()?',
    options: [
      'Because Mendix rejects free-text log node names at runtime',
      'It automatically registers the log node with the Mendix Portal',
      'Because enumerations are the only values allowed in a Log message activity',
      'It standardizes the log node name and groups every log node name in the app in one place',
    ],
    answer: 'D',
    src: 'Module 5.3.1 / Knowledge Check Q1. The enumeration standardizes naming and gives the team a single central list of every log node in the module.',
  },
  {
    id: 'log-7',
    topic: 'Track Application Behavior with Logging',
    question:
      'A Holiday Request app calls an external weather API. The call fails, but users can still submit requests without weather data. Which log level does the course settle on for that error flow?',
    options: [
      'Warning — you can continue, but someone should look into why the call is failing',
      'Error — every failed call is a real failure requiring action',
      'Critical — an integration failure is application-breaking',
      'Info — the failure is expected and needs no follow-up',
    ],
    answer: 'A',
    src: 'Module 5.5.1 / Knowledge Check Q3. Critical is overkill because the core functionality still works; the quiz’s confirmed answer is Warning — continue, but investigate.',
  },
  {
    id: 'log-8',
    topic: 'Track Application Behavior with Logging',
    question:
      'Which system variable exposes StatusCode, ReasonPhrase and Content in the error flow of a Call REST service action?',
    options: [
      '$latestError',
      '$latestHttpResponse',
      '$currentSession/Response',
      '$HttpResponse/Latest',
    ],
    answer: 'B',
    src: 'Module 4 — REST call error handling. With "Custom with rollback" error handling, $latestHttpResponse becomes available with StatusCode, ReasonPhrase and Content.',
  },
  {
    id: 'log-9',
    topic: 'Track Application Behavior with Logging',
    question:
      'Which of the following is NOT one of the common Mendix error categories covered by the course?',
    options: [
      'Autocommitted objects',
      'Java out of memory errors',
      'XPath syntax errors detected at runtime',
      'Null pointers',
    ],
    answer: 'C',
    src: 'Module 4. The categories covered are null pointers, security errors, mathematical errors, Java out of memory errors, autocommitted objects and application breaks on startup.',
  },
  {
    id: 'log-10',
    topic: 'Track Application Behavior with Logging',
    question:
      'Which option on a Log message activity attaches the chain of microflow calls that led to a failure?',
    options: [
      'Refresh in client',
      'Include latest error',
      'Blocking',
      'Include latest stack trace',
    ],
    answer: 'D',
    src: 'Module 4 — Stack traces. "Include latest stack trace" attaches the call chain and is especially valuable on Log message activities inside error-handling flows.',
  },
  {
    id: 'log-11',
    topic: 'Track Application Behavior with Logging',
    question:
      'An operator wants to be notified automatically the moment an application-breaking issue is logged. What should be configured?',
    options: [
      'Critical Logs alerts in the Mendix Portal Alerts window',
      'A scheduled event that polls Deploy > Logs every minute',
      'The Run > Default Log Level setting in Studio Pro',
      'A Warning-level log node registered at startup',
    ],
    answer: 'A',
    src: 'Module 3. The Portal can raise alerts automatically on Critical-level log messages, so operators are notified proactively instead of watching the log stream.',
  },
  {
    id: 'log-12',
    topic: 'Track Application Behavior with Logging',
    question:
      'Which navigation path is used to configure per-node log levels for an app already running in the Mendix Cloud?',
    options: [
      'Console > Advanced > Set log levels… in Studio Pro',
      'Deploy > Environments > [environment] > Details > Loglevels tab',
      'Run > Default Log Level in Studio Pro',
      'App Settings > Configurations > Logging',
    ],
    answer: 'B',
    src: 'Module 3. The Studio Pro Console path configures a locally-running app; the Portal Loglevels tab configures a deployed cloud environment.',
  },
  // ---- Win at Working with Data (12) ----
  {
    id: 'data-1',
    topic: 'Win at Working with Data',
    question:
      'True or false: a retrieve by association will always be an in-memory retrieve.',
    options: [
      'True, by association always reads from the transaction object cache',
      'False, a retrieve by association always queries the database',
      'True, unless the association is a reference set',
      "False, if objects aren't available in memory a retrieve by association will automatically result in a database retrieve",
    ],
    answer: 'D',
    src: "Module 3.2. The Runtime converts a by-association retrieve into a database retrieve when the data isn't already cached — across chained associations this can produce an N+1 pattern of many small queries.",
  },
  {
    id: 'data-2',
    topic: 'Win at Working with Data',
    question:
      'What is an important rule to keep in mind when creating effective indexes over multiple attributes?',
    options: [
      'The index should have the same order of attributes as used in the search and retrieve queries',
      'The index should list the attributes in alphabetical order',
      'The index should always include a Boolean attribute to split the table evenly',
      'The index should be defined on non-persistable entities for best performance',
    ],
    answer: 'A',
    src: 'Module 3.4. Indexes are ordered — queries should filter on the attributes in the same order as the index. If constrained by only one attribute, that attribute must be first in the index to benefit.',
  },
  {
    id: 'data-3',
    topic: 'Win at Working with Data',
    question:
      'Which of the following is NOT a possible source of data for a microflow?',
    options: [
      'An input parameter received from the client or a calling microflow',
      'A page passed as an input parameter by another microflow',
      'The return value of a sub-microflow or integration activity',
      'An object created inside the microflow',
    ],
    answer: 'B',
    src: 'Module 3 Knowledge Check Q1. Pages are not a valid microflow parameter type; the four real sources are input parameters, retrieve actions, objects created in-flow and return values.',
  },
  {
    id: 'data-4',
    topic: 'Win at Working with Data',
    question:
      'A microflow must read the value that is actually committed in the database, ignoring a newer uncommitted change held in the transaction cache. Which retrieve should be used?',
    options: [
      'By association — the cache always mirrors the database',
      'Either, since Mendix always refreshes the cache before a retrieve',
      'From database — an association retrieve may return cached, not-yet-committed values',
      'By association, followed by a Rollback activity',
    ],
    answer: 'C',
    src: 'Module 3.2 — Difference in value. A database retrieve always returns the actual committed values; an association retrieve may serve recent, uncommitted changes from the object cache.',
  },
  {
    id: 'data-5',
    topic: 'Win at Working with Data',
    question:
      'A data grid uses the Database source with the constraint Status Equals ‘Bronze’. The same grid is switched to XPath with [Status = ‘Bronze’]. What happens to the generated SQL?',
    options: [
      'The XPath version generates an extra join',
      'The Database version generates a lighter query without a WHERE clause',
      'The Database version is executed in memory instead of on the database',
      'Both generate exactly the same SQL query',
    ],
    answer: 'D',
    src: 'Module 2.4.1. Both approaches produce identical SQL — the choice is about ease of use, offline support and constraint complexity, not performance.',
  },
  {
    id: 'data-6',
    topic: 'Win at Working with Data',
    question:
      'Which of the following is NOT an advantage of the Database data source option over the XPath option?',
    options: [
      'It can specify constraints that span multiple entities',
      'It is the only option supported in offline mobile apps',
      'It is easier to configure with guided constraint selection in Studio Pro',
      'It covers most simple filtering needs without writing query syntax',
    ],
    answer: 'A',
    src: 'Module 2 Knowledge Check Q4. Spanning multiple entities is something only XPath can do; the Database option allows only simple constraints on the retrieved entity.',
  },
  {
    id: 'data-7',
    topic: 'Win at Working with Data',
    question:
      'A batch process retrieves 10,000 Products using Limit and Offset. Records are being skipped. Which cause matches the course’s hard rules?',
    options: [
      'The batch size of 250 is too small for the dataset',
      'An attribute that changes during the run is part of the retrieve constraint, so the underlying set shifts between iterations',
      'The retrieve is by association instead of from database',
      'The offset variable is an Integer instead of a Long',
    ],
    answer: 'B',
    src: 'Module 3.3.1. Rule 1: when using Limit and Offset together, attributes that can change during the run must not be part of the constraint, or records get skipped as the result set shifts.',
  },
  {
    id: 'data-8',
    topic: 'Win at Working with Data',
    question:
      'Why does the course insist that a batched retrieve always define a sort order?',
    options: [
      'Because Mendix rejects a retrieve with an offset and no sort order',
      'Because sorting enables the aggregate-list optimization',
      'Because without a stable sort the database may return records in an arbitrary order, so an incrementing offset can skip or reprocess records',
      'Because the sort attribute is automatically indexed by the runtime',
    ],
    answer: 'C',
    src: 'Module 3.3. Sort on the most unique, stable attribute available so the record order stays predictable across successive offset-based retrieves.',
  },
  {
    id: 'data-9',
    topic: 'Win at Working with Data',
    question:
      'Microflow A retrieves Orders and counts them. Microflow B retrieves the same Orders, loops over the list, and then counts them. In which is the retrieve-plus-aggregation optimized into a single SELECT COUNT query?',
    options: [
      'In neither — the optimization requires an index',
      'Only in microflow B',
      'In both',
      'Only in microflow A',
    ],
    answer: 'D',
    src: 'Module 3.4 / Exercise 3.4.1. The Count optimization applies only when the retrieved list is not reused elsewhere; reusing it in a loop forces a full retrieve plus an in-Runtime count.',
  },
  {
    id: 'data-10',
    topic: 'Win at Working with Data',
    question:
      'Which statement about the Task Queue is TRUE?',
    options: [
      'Queued tasks only start once the creating transaction has fully committed',
      'Queued tasks start executing immediately, even if the creating transaction is later rolled back',
      'Queued tasks execute strictly one at a time in FIFO order under all conditions',
      'Queued tasks accept any parameter type, including non-persistable entities',
    ],
    answer: 'A',
    src: 'Module 3.4 — Task Queue. Tasks fire only after the creating transaction commits; they run FIFO but can execute in parallel, and parameter types are limited to primitives and committed persistable entities.',
  },
  {
    id: 'data-11',
    topic: 'Win at Working with Data',
    question:
      'Which is the optimized form of [OrderLine_Product/Product/MinimalStock > 50][OrderLine_Product/Product/Status = ‘Active’]?',
    options: [
      "[OrderLine_Product/Product/MinimalStock > 50 or OrderLine_Product/Product/Status = 'Active']",
      "[OrderManagement.OrderLine_Product/OrderManagement.Product[MinimalStock > 50 and Status = 'Active']]",
      "[not(OrderLine_Product/Product/MinimalStock <= 50)][OrderLine_Product/Product/Status = 'Active']",
      'The original form is already optimal because bracket sets are implicitly ANDed',
    ],
    answer: 'B',
    src: 'Module 4.4 — Combine Paths. Merging constraints that share an association path into one bracketed sub-query stops the database evaluating all unique path combinations twice.',
  },
  {
    id: 'data-12',
    topic: 'Win at Working with Data',
    question:
      'Which statement is NOT an XPath best practice for optimal performance?',
    options: [
      'Put the most limiting constraint first',
      'Limit the number of associations crossed in one query',
      'Do not use XPath when you can use SQL instead',
      'Avoid or across two different association paths — split into two retrieves and merge the results',
    ],
    answer: 'C',
    src: 'Module 4 Knowledge Check Q5. "Use SQL instead" is not a course recommendation — XPath is the platform-standard, database-agnostic approach. The other three are genuine guidelines.',
  },
];

/** Option letters, in display order. */
export const LETTERS = ['A', 'B', 'C', 'D'];

/** Score at or above this percentage to pass. */
export const PASS_THRESHOLD = 70;

/** Exam duration in minutes. */
export const EXAM_MINUTES = 30;

/** Distinct topics, in the order they first appear in the bank. */
export const TOPICS = [...new Set(QUESTIONS.map((q) => q.topic))];

/** Number of questions per topic, keyed by topic name. */
export const QUESTIONS_PER_TOPIC = TOPICS.reduce((acc, topic) => {
  acc[topic] = QUESTIONS.filter((q) => q.topic === topic).length;
  return acc;
}, {});
