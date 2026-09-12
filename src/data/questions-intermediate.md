# Mendix Intermediate Developer Certification — Question Bank

<!-- Authoring source for the Intermediate exam bank.

     This file is NOT bundled into the app. It is parsed by
     src/lib/parseQuestions.js and pushed into Supabase by `npm run seed`
     (scripts/seed-question-bank.mjs), which is what the app reads.

     Edit here, then re-run `npm run seed`. The seed is a mirror: questions
     removed from this file are deleted from the database.

     Format: `## <topic>`, then `### <id>` + question text, four `- A.`..`- D.`
     options, `**Answer:** <letter>`, `**Source:** <explanation>` and an
     optional `**Tip:** <short revision pointer>`. Ids must be unique across
     BOTH banks — question ids are the primary key and are not namespaced by
     level. -->


## Agile and Scrum

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


## Microflows and Nanoflows

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


## XPath

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


## Security

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


## Domain Model

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


## Pages, Layouts, and Atlas UI

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


## Modules, App Directory, and Integration

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


## Languages and Translations

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
