# Configure Advanced Security — Mendix Academy Knowledge Base

**Source:** [Configure Advanced Security](https://academy.mendix.com/link/paths/9/Configure-Advanced-Security) — Mendix Academy learning path
**Level:** Advanced | **Rating:** 4.7★ (151) | **Duration:** 4.0 hrs | **Modules:** 6 | **Studio Pro version referenced:** 9.12.4

This path is one of the recommended prerequisites for the Mendix **Advanced Developer Exam / Certificate**. It uses a running example throughout: **Car Supply**, a company that sells die-cast car models and modeling supplies through a Mendix app that manages customer orders, products, stock, and suppliers.

All 6 modules and 5 knowledge checks were completed with a **100% score** on every quiz.

---

## Module 1 — Introduction

### 1.1 Welcome
By the end of this learning path, you will be able to:
- Identify different layers in the Mendix architecture
- Differentiate navigation access and data access
- Use XPath for security constraints and for usability improvement
- Assess the impact of your configuration for exposure in the Mendix API
- Apply entity access on pages and microflows
- Prevent account access security issues
- Analyze the impact of having one or multiple user roles

### 1.2 Audience & Duration
This learning path is one of the crucial courses before attempting the Advanced Certification. Recommended prerequisites: you have passed the **Intermediate exam** and have **3+ months of Mendix development experience**. Duration: approx. **4 hours**.

### 1.3 Use Case
**Car Supply** sells exclusive, high-end die-cast car models to collectors, plus car modeling supplies. Their app manages customer orders and shipments, and also needs to manage the product base, stock, suppliers, and purchase/selling prices. The app currently gives full control over the product base but can be extended with customer-facing features like product search and ordering.

---

## Module 2 — Security in Mendix

### 2.1 Learning Objectives
- Apply XPath to security access rules
- Analyze security requests
- Describe the difference between usability and security constraints
- Know when a constraint should be applied in security or on a page

### 2.2 What is Security in Mendix?
A **user role** aggregates access rights on data, pages, and microflows. Users are assigned one or more user roles by an administrator and inherit all access rights those roles represent.

**Module roles** determine access rights on data, pages, and microflows *per specific individual module*. Every user role has one or more module roles, and a user with that user role gets all access rights defined for the associated module roles.

This Advanced path focuses on advanced features such as XPath security constraints and more complex situations (building on the Rapid Developer / Crash Course fundamentals).

### 2.3 Access Rules Using XPath
An **XPath constraint** narrows the set of objects an access rule applies to. It applies to **all database requests**, regardless of where they are triggered. All objects are retrieved and then filtered out if they fail the constraint. If the XPath constraint is empty, the rule applies to all objects of the entity.

**2.3.1 Apply Rules Using XPath (exercise)**
Example: restrict Customers to only see their own orders by adding an XPath constraint on the `Product`/`Order` entity access rule:
```
[Status = 'Active']
```
**Path to Owner:** The *Owner* appended XPath option is only available if the owner is stored for the entity. Selecting Owner creates a platform-managed association. If the owner (the User who created the object) is stored, this generates:
```
[System.owner='[%CurrentUser%]']
```
To store the Owner, check the **Store 'owner'** checkbox under System members for the entity. Note: the owner is only stored for data added *after* the option is enabled — not retroactively.

### 2.4 When is Security Applied?
Scenario: a customer viewing "My Orders" currently sees orders for **all** customers, which leaks other customers' order dates, totals, and shipment info. They should only see their own.

**2.4.1 Add Constraints (exercise)**
Question: should the XPath constraint be applied at the **page level** or the **entity level**? Answer: **entity level**, because a data-grid/page constraint only affects that widget/page — it does not stop the customer from accessing the same data through other pages or direct/malicious requests to the Mendix server. Entity-level security is the most secure option.

Steps: Domain model → Order entity → Access Rules tab → Customer module role → XPath constraint tab → add:
```
[OrderManagement.Order_Customer/OrderManagement.Customer/OrderManagement.Customer_Account='[%CurrentUser%]']
```

### 2.5 How is Security Applied?
**Mendix Client & Runtime architecture** (3 layers):
- **UI Layer / Mendix Client** — the front end (CSS3, HTML5, Web & Mobile UIs) where designed pages, data, and actions are shown.
- **Mendix Runtime** — Business Layer + Data Layer (Logic Layer + Data Layer), connects to Database / Web Service / API. Controls what data you see based on provisioned access. This applies to **all** interaction with the dataset.
- **The Database** — stores all objects per the domain model schema, in related tables.

**Interactions checked by the Runtime:**
- **Create** — checks if you're allowed to create the object instance; blocks otherwise with an error message to client + detailed log.
- **Read** — removes members you're not entitled to before composing the SELECT statement, and adds configured XPath constraints.
- **Update** — checks if you're allowed to change the object; blocks with error + log if not.
- **Delete** — checks delete permission; blocks with error + log if not. Note: cascading deletes (from association delete behavior) may be **rolled back** if you're not allowed to delete all instances in the chain.

### 2.6 Navigation and Data Access
Security is applied at several distinct moments:

**Page access** — you start at your homepage and can only navigate to pages accessible to your role; different roles see different nav items on the same page (improves reusability/maintainability). Pages set as the default/role-based home page don't need explicit "Navigation visible for" settings. Pages opened only via a microflow (not directly navigable) don't require page access either.

**Microflow access** — governs which microflows a user can execute. If not granted, UI elements (nav items, buttons) calling that microflow are hidden. Checked by Runtime on execution. Sub-microflows are allowed if the user has access to the **parent** flow. Event handlers/calculated attributes are allowed if the user has access to that **entity**.

**Entity access** — the most restrictive/secure option; limits data to only what matches the constraints, regardless of navigation path. *Applying page constraints ≠ creating a secure app.*

**Apply Entity Access (microflow property)** — indicates whether entity access is applied when the microflow performs operations, based on the executing user. Limits retrieved objects to those the current user may see — useful for complex/anonymous/public microflows.

**OData & REST access** — exposing data via OData/REST grants access to a service that performs the operation; the amount of data processed depends on the credentials/role configuration.

### 2.6.1 Analyze Security Request Without Constraints (exercise)
1. Remove the XPath constraint from the Customer rule on Order (if added previously).
2. Run locally, open Studio Pro Console → Advanced → Set log level.
3. Set `ConnectionBus_Retrieve` log node to **Debug**.
4. Log in as customer George McFly / password `mendix`, go to My Orders.
5. In the Console, the log line shows the **client → Runtime** request:
   `RequestAnalyzer: incoming request InternalLimitedXPathTextGetRequest {depth = -1, amount = 20} //OrderManagement.Order` — requests all Orders, limited to 20 by data-grid paging.
6. The SQL log line shows the resulting SELECT — built from the Order entity + shown attributes, **no further constraints added**.

### 2.6.2 Analyze Requests With Constraints (exercise)
Re-add the constraint:
```
[OrderManagement.Order_Customer/OrderManagement.Customer/OrderManagement.Customer_Account='[%CurrentUser%]']
```
Re-run the same test. The incoming client request is unchanged, but the resulting **SQL query now has a WHERE clause** joining Customer_Account and filtering to the logged-in customer's account id — proving the XPath constraint always reaches the database layer.

### 2.7 Security or Usability
Ask: is data restricted because of its **sensitivity** (security) or because of a **filtered display** within what the user is already allowed to see (usability)? Example: email — you should only ever retrieve *your own mailbox* (entity access = security), while showing folders like Inbox/Sent on separate pages via XPath is a **usability** filter layered on top.

Failing to separate these can let a user access records that don't belong to them — because the client sends JavaScript messages that can be manipulated, and the Runtime must independently enforce what a request is actually allowed to touch. Mendix Expert Services / partners can review apps for this.

### 2.8 Project Security (App Security)
**Security level** (App Security dialog):
- **Off** — default for new apps.
- **Prototype/demo** — recommended for demoing with different login roles (used by presales for POCs).
- **Production** — recommended from the start of real development, so security issues surface incrementally rather than all at once near go-live. **A Mendix app must be set to Production with security fully configured to run in a live environment.**

**Check security** (Yes/No) — Studio Pro checks per user role whether forms reference only attributes/associations accessible to that role. This check assumes a user has only **one** role at a time (see Module 5 for multi-role complexity).

**App status** — should read **Complete**. It's OK to be Incomplete only when an entity has no configured entity access because it's used purely to pass data between microflows (never surfaced in pages). Otherwise, an Incomplete status blocks running/deploying the app.

**Mendix API** — if microflow access shows Incomplete, check whether flagged microflows actually need role access. Sub-microflows don't need direct role access (handled by the calling flow); granting it anyway is a security risk (warning **CW0114**).

### 2.9 Summary
XPath constraints on access rules always extend the resulting SQL query for the client request — an XPath constraint defined at the security level **cannot be bypassed**.

### 2.10 Knowledge Check — ✅ 100%
1. **Entity `Request` (status: Draft/Submitted/Approved), roles Administrator/Customer/Employee. Customer has only one rule: read/write with XPath `[Status = Draft]`. What does a Customer see on a page with an unconstrained data grid?**
   → **All the requests in the Draft status.** (the entity-level XPath always applies, regardless of page constraints)
2. **Same setup — what does Admin see (no access rule defined for Admin)?**
   → **No results would be returned.** (Mendix denies by default: no rule = no access)
3. **If you then grant Admin page access to Request in Studio Pro (with no entity access rule for Admin) — what happens?**
   → **Studio Pro would detect an error and prevent a deployment.** (Check security flags the inconsistency)
4. **How does the platform use entity access XPaths to enforce security?**
   → **The XPaths are added to all the relevant database retrieves.**
5. **Where are entity access restrictions applied?**
   → **On relevant database retrieves.**

---

## Module 3 — Entity Access for Security

### 3.1 Learning Objectives
- Apply entity access in microflows according to best practices

### 3.2 Entity Access
When exposing microflows with sensitive data, Studio Pro normally requires **at least one allowed role** (error **CE0106** if a UI-invoked microflow has none). This check does **not** apply to microflows only reached as a sub-microflow, scheduled event, event handler, or calculated attribute — these run under system execution and fire regardless (e.g. a midnight sync scheduled event).

When a microflow is exposed externally (e.g. via deep link), the platform **ignores the user's entity access** by default when reading/writing data. To force the check, enable **Apply entity access** in the microflow's Properties → Security section. This ensures the platform won't execute actions the invoking user's session isn't allowed to perform (e.g., blocks create/delete if the user lacks rights).

Constraint: a microflow with Apply entity access = **Yes** cannot be called as a sub-microflow by one with it set to **No** (and vice versa is fine) — error **CE0114**: *"A microflow that does not apply entity access can only call microflows that also do not apply entity access."*

Entity access in microflows adds entity XPath rules to any database action inside the microflow, based on the current user's role — so retrieve results (and allowed writes) can differ per role even inside the same microflow logic.

### 3.3 Why Use Entity Access in a Microflow?
Enforcing entity access at the microflow level means you don't have to separately guard against users manipulating retrieve actions — restrictions apply automatically wherever the microflow touches data. Best practice: apply it to microflows that need **elevated privileges** or handle **sensitive data**. Recommended usage:
- **Anonymous/deep-link microflows** — without entity access, anyone can trigger them and touch any data they reach.
- **Sensitive data** (financial reporting, data migration, productivity metrics) — without it, lower-privilege users could manipulate traffic or trigger the microflow to reach data they shouldn't.
- **Approval workflows** — combined with a Status-based XPath rule, prevents users from using a microflow to change status and approve their own requests or skip steps.

### 3.4 Entity Access Best Practices
Don't blanket-enable Apply Entity Access on every microflow — many microflows legitimately update read-only values or create read-only logs for the user, which entity access would block.

Defining entity access rules on entities is **the most secure way** to restrict database access, because the Runtime only returns what's allowed per the access rules regardless of how the request was made — implement the *security* layer at the entity access rule, and the *usability* layer with XPath on pages. Be careful not to over-open access when defining rules.

Best practice: set **"Default rights for new members"** to **None** on each entity access rule (instead of Read/Read-Write). This forces you to consciously review/update the access rule whenever you add a new attribute or association, rather than the platform silently granting default access.

**3.4.1 Apply Entity Access in Microflows (exercise)**
Microflow `ACT_TotalOrderCounter` counts total Orders and shows a popup with the count. Customer's Order rule XPath: `[OrderManagement.Order_Customer/OrderManagement.Customer/OrderManagement.Customer_Account='[%CurrentUser%]']`.

- With **Apply entity access = No**: the counter retrieves **all** orders (ignoring the logged-in user's restriction) — count doesn't match what the user actually sees on "My Orders."
- With **Apply entity access = Yes**: the counter now matches the number of orders visible to the user — the entity access rule is honored inside the microflow.
- If you then remove **Create** rights on the `Counter` entity for Customer (while Apply entity access = Yes), triggering the microflow throws: *"Creating object of type Security.Counter failed for security reasons"* — pointing at the `Create Counter` activity.
- If instead you keep Create but drop write access on the `Counter` attribute to **Read only**, the error becomes a generic *"An error occurred, please contact your system administrator"* — you must check the **Console log** for the real cause: *"Write access denied for member 'Counter' of object 'Security.Counter'"* at the `Create Counter(Counter)` activity, because the microflow both creates the object **and** writes the Count value to it.
- **Conclusion:** understand when Apply Entity Access should be Yes, and be ready for the (sometimes generic) errors it can surface.

**3.4.2 Entity Ownership (exercise)**
Scenario: Car Supply wants a customer idea-request workflow — customers suggest ideas, employees approve them, admins mark them complete. Uses XPath entity security to gate a task as it moves through the approval process.

*Part 1 — attribute value-based access:*
1. Change the base `IdeaRequest` access rule to **Read** for all users.
2. Add per-role read/write rules with XPath:
   - Customer: `[Status = 'Draft']`
   - Employee: `[Status = 'Submitted']`
   - Administrator: none (full access via base rule pattern shown)
3. Result: a Customer can edit only Draft ideas, an Employee only Submitted ideas, and an Admin can edit ideas of any status.
4. Problem: **all** Customers can edit **all** Draft ideas, even ones they didn't create.

*Part 2 — ownership-based access (fix):*
1. Extend the Customer rule's XPath with the object owner: `[System.owner='[%CurrentUser%]']` (combined: `[Status = 'Draft'][System.owner = '[%CurrentUser%]']`). This works because the entity has **Store 'owner'** enabled (off by default — must be turned on manually).
2. After this change, a Customer can no longer edit a Draft idea they didn't create themselves — only their own new requests are editable.

### 3.5 Summary
Access rules can make data conditionally accessible based on **status** and/or **relation/ownership** — enabling one dynamic application to serve multiple roles accessing the same data while constraining each role appropriately.

### 3.6 Knowledge Check — ✅ 100%
1. **Which best describes how the Mendix platform applies entity access?**
   → **The platform only grants the access explicitly defined in the entity access rules.** (deny by default)
2. **Domain model: `House` is a specialization of `Building` (attribute `SquareFoot`). Building's own access rule for Admin grants `SquareFoot` = Read only. House's own access rule for Admin grants `Bedrooms` + `SquareFoot` = Read, Write. What happens?**
   → **Admin users will be able to read the SquareFoot attribute in data views for Buildings, and read and write in data views for Houses.** (each entity's own access rule governs its own data views, even for an inherited attribute)
3. **Same model — create a data grid of Houses + autogenerated House_NewEdit page. Which statement is FALSE for an Admin?**
   → **FALSE: "Admin users will not see the SquareFoot attribute in the Edit page."** (they *will* see/edit it, per House's own Read,Write rule — the other statements, e.g. no create/delete buttons since Create/Delete aren't granted, and being able to read/edit SquareFoot, are all true)
4. **Why is it more secure to add security rules at the entity level?**
   → **Entity level restrictions are applied at the database level and are thus automatically applied throughout the application.**

---

## Module 4 — Account Access for Security

### 4.1 Learning Objectives
- Allow an administrator role to manage other users in an app
- Allow Anonymous users to access an app
- Apply advanced security best practices to user roles

### 4.2 Account User Role Management
Every app user, by default, may read/write **their own** `User` object due to a built-in XPath constraint applied to all roles:
```
[id='[%CurrentUser%]']
```
This rule also applies to the Administrator module role on `System.User` (Create: No, Delete: No, Member access: Limited Read/Limited Write, XPath: `[id = '[%CurrentUser%]']`).

**Consequence:** by default, *no one* can manage another user's account — secure, but not functional (admins can't set up other users). Fix: the **User management** setting on a user-role configuration screen:

| Value | Description |
|---|---|
| **All** | Can manage/grant **all** user roles. Should only be used for a system-wide administrator role. |
| **Selected** | Can manage/grant only the **selected** user roles. If none selected, cannot manage any user. Good for limited administrative roles (e.g. HR managers, employee managers) or when multiple departments need separate administrators. |

**Example:** Car Supply grows to have Sales and Manufacturing departments, each with their own admins → four roles (Manufacturing User, Manufacturing Admin, Sales User, Sales Admin). Give **Manufacturing Admin** the *Selected* option → Manufacturing User, so it can only manage Manufacturing accounts, not Sales.

**4.2.1 Manage User Roles (exercise)**
Key distinction: **account management** (the `User`/`Account` entity) vs. **entity access to related process data** (e.g. the `Customer` object used in the order process) are **not the same thing**.

Scenario: Employees are responsible for specific customers and may only read/write their assigned customers' details.
1. A `CustomerSecurityTest` page shows Customers; an Employee can view/edit details of their assigned customers.
2. Logged in as Employee "Jules," the customer list displays correctly but the **User name** field is empty; opening a customer's edit form throws an error — **User name, Password, and User role are empty**.
3. Root cause (Console log): a conflict with **read access** — the login name lives on `System.User`, and access to that attribute is limited to your **own** User object (`[id = '[%CurrentUser%]']`), so Jules can't read another user's login name.
4. **Fix:** grant the `Employee` user role **User management** = Selected → Customer (allows Employees to manage users with the Customer role).
5. After the fix, Jules can see customer usernames, and can edit the **User name** field of both assigned and unassigned customers (User management applies globally to the User role) — but the related **Customer process data** (name, email, etc.) is still only readable/editable for their **assigned** customers (governed separately by entity access on `Customer`).

### 4.3 Manage User Roles Further
The **User management** option only governs security of the `User` entity (login mechanism + role-based access) — it is unrelated to whether the acting role should be allowed to touch that user's related **process data**. Modeling mistake to avoid: generalizing `Employee`/`Customer` as **specializations** of `Account`. This effectively declares Employee == Account, causing "conflicting restrictions" (Allowed roles != Entity access) — because login/account security and process-data security get entangled on the same entity/hierarchy.

**Correct pattern (see `OrderManagement` module):** model `Employee` and `Customer` as **separate entities**, each with a **1-1 association** to `Account`, rather than a specialization. This way an Employee/Customer *has* an Account but *is not* an Account, avoiding conflicting security.

**Two key conclusions:**
- The tested "conflicting" behavior is not a Mendix bug — it's caused by an incorrectly modeled domain model.
- **Best practice: never inherit from the `User` or `Account` entity when dealing with process data.** Associate your process data to User/Account instead.

(See the *Inheritance* module of the *Advanced Domain Model Skills* learning path for more on specialization vs. association.)

### 4.4 Anonymous User
Anonymous access lets *anyone* reach parts of your app without logging in — be careful not to expose too much.

**Anonymous User Role Configuration checklist:**
- The Anonymous role has no module roles for modules it doesn't need.
- The role has no read/write access to data it shouldn't touch.
- The role has no read access to data not visible on its pages.
- The role only has access to necessary microflows (e.g. a forgot-password microflow).
- The role has at least the **User** module role in the **System** module, plus the **Anonymous** module role in any other modules it needs.

Tip: use **non-persistable entities** that copy existing data instead of exposing the original data directly to Anonymous. Always validate you haven't over-opened the app for anonymous users.

### 4.5 Summary
It's easiest when each end-user can only get **one** user role — Studio Pro's security check supports this well. Multiple roles per user add a lot more to consider and test (expanded in Module 5).

### 4.6 Knowledge Check — ✅ 100%
1. **App with roles Administrator, Teacher, Student. Admins can manage all roles; Teachers can manage users with the Student role. Which statement is FALSE?**
   → **FALSE: "Administrators and teachers can create teacher accounts."** (Teachers can only manage the Student role, not Teacher — only Admins, who manage all roles, can create Teacher accounts)
2. **You grant Teachers "manage users with Student role" so they can manage accounts for students in their class. Is this sufficient?**
   → **No, because teachers will have the ability to edit the accounts of any Student, not just their own.** (User management grants access to *all* users with that role — it doesn't scope to "students in their class"; that would require separate entity-level ownership rules on the class/process data, not the User management feature)

---

## Module 5 — One or Multiple User Roles

### 5.1 Learning Objectives
- Identify deeper differences between single and multiple user roles
- Choose how to organize access rights among an appropriate number of roles

### 5.2 Using a Single User Role
Early questions to settle before development gets deep:
- Do users need one or more roles?
- How flexible must role-changing be during a user's lifetime in the app?
- How will roles be provisioned?

Complexity ladder: single role per user (never changes) → multiple fixed roles per user → users can change roles (still standard Mendix security) → fully runtime-configurable flexible roles.

With **one role per user**, Mendix's security check can predict most potential issues: it calculates all routes from the user's homepage through every connected page/microflow/layout element (buttons, images, snippets, single data views with a microflow data source), confirming at least one access rule covers every member (attribute/association) referenced — including for conditional visibility/editability. **Caveat:** you're still responsible for setting the right XPath constraints; the check only confirms *an* access rule exists, not that it's the *correct* one. **Also note:** enabling Apply Entity Access on a microflow in this chain means that microflow's internal member access is **not checked** by this static analysis.

On a security error, right-click → **Show details...** reveals the exact calculated path, e.g.:
`Navigation profile 'Responsive' > Page 'Home_Web' > Layout 'Atlas_Default' > Navigation tree > Menu item > Microflow 'ACT_OpenMyProfile' > Action activity 'Show MyProfile_User' > Page 'MyProfile_User'`

### 5.3 Using Multiple User Roles
**Homepage complexity:** with role-based home pages, if a user has 2+ roles, Mendix simply uses the **first role in the list** to pick the homepage — reorder the list to control this. If you need a *specific* homepage only for a particular role combination, the best option is a **combined user role** (a single Mendix role representing the permission union of two existing roles) — agree these combinations with the business first.

**Common mistake:** letting a microflow decide which page to open based on role-checking logic. This forces the security system to calculate paths for **every** role from **every** homepage defined in that microflow — generating extra, often-unnecessary access-rule requirements and avoidable security risk. Avoid this; understand the business's real intent for multi-role behavior before deciding.

**Page-level complexity with multiple roles:**
- **Buttons** that appear "just for" a right-holding role may now show for a user who holds multiple roles — is that intended?
- **Conditional visibility/editability** — a multi-role user might see/edit more than intended.
- **Data exposure** — complementary or contradictory access rules across roles can accidentally expose sensitive data.

**Role-switching over time:** if a user's roles can change, consider what happens to data/tasks tied to their *previous* role — e.g. an approver's assigned task becomes inaccessible once their role changes, potentially **stalling a process**. This must be actively identified and designed for.

### 5.4 Summary
(Same conclusion as Module 4: single-role-per-user is simplest and best supported by Mendix's built-in security check; multi-role setups need much more deliberate design and testing.)

### 5.5 Knowledge Check — ✅ 100%
1. **What is a benefit of assigning only one user role to each user?**
   → **Simplicity.**

---

## Module 6 — Conclusion

### 6.1 Summary
This learning path covered: access rules, when security is applied, and how generalization affects security; how to observe/examine security rules and where they're applied in the app; how entity access is defined and applied, including what **Apply Entity Access** does inside a microflow; how to separate **user/account management** from **user process data**; how to add anonymous users and expose parts of an app to the world; and security best practices with their implications. Through exercises you practiced adding entity access, proper microflow access, and adding users/anonymous users.

### 6.2 Next Steps
- **Learn more:** other Advanced-level learning paths are available on Mendix Academy for further skill-building.
- **Get certified:** completing this path (and passing its knowledge checks) is one of the recommended routes toward the **Advanced Developer Exam**. Passing the exam earns the **Advanced Developer Certificate**, showing you understand advanced Mendix platform theory and can apply it to build valuable business apps.

---

## Appendix — Quick-Reference: Key Rules of Thumb

- **Deny by default:** no access rule for a role = no access to that entity, full stop.
- **Entity-level security > page-level constraints.** Page/data-grid XPath only affects that widget; entity access rules are enforced by the Runtime for *every* database request (pages, microflows, REST, OData) and cannot be bypassed.
- **XPath constraints on entity access rules always translate into a SQL `WHERE` clause** on the resulting database retrieve — confirmed by inspecting Console logs (`ConnectionBus_Retrieve` at Debug level).
- **Apply Entity Access (microflow property)** forces a microflow's internal database actions to respect the invoking user's entity access — off by default, important for anonymous/deep-link/sensitive/approval microflows.
- **Never specialize `User`/`Account`** for process-data entities (e.g. Customer, Employee) — associate (1-1) instead, to avoid conflicting "Allowed roles != Entity access" restrictions.
- **User management (per role: All / Selected)** governs who can manage *User accounts* with which roles — it is separate from, and does not constrain, entity access to related process data (e.g. "my assigned customers/students").
- **Anonymous role checklist:** minimal module roles, no unnecessary read/write, only necessary microflows, must include the `System.User` module role alongside `Anonymous` module roles elsewhere.
- **Single user role per user** is the simplest, best-supported-by-tooling security model; multiple/changeable roles require deliberate design around homepages, buttons, conditional visibility/editability, data exposure, and role-change effects on in-flight process data.
- **App Security settings:** Security level should be **Production** from early development; **Check security = Yes**; **App status = Complete** (except entities used purely as microflow pass-through objects); avoid granting unnecessary Mendix API role access to sub-microflows (**CW0114**).
