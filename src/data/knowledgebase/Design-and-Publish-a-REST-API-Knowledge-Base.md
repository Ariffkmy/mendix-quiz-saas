# Design and Publish a REST API — Mendix Academy Knowledge Base

**Level:** Advanced | **Rating:** 4.6★ (149 ratings) | **Duration:** 3.0 hrs | **Modules:** 6 | **Studio Pro Version:** 9.12.2

## Course Overview

This learning path teaches how to set up and publish a REST API for a Mendix "adaptive solution" — an API that external systems can consume according to REST naming conventions. It walks through choosing the right HTTP methods, shaping responses and error messages correctly, making the auto-generated Swagger/OpenAPI documentation actually useful, and securing the published service with standard or custom authentication. The running example throughout is a REST API for an online bookstore that must create/update book data, retrieve one or many books, and remove books from inventory.

---

## Module 1 — Introduction

This module frames the goal of the course and introduces the running use case; it has no lectures on technical content and no knowledge check.

**Learning goals for the whole path:** decide when to use a REST API, use appropriate API responses and messages, implement API authentication, and publish a REST API.

**Audience:** intended for learners who already hold the Intermediate Developer Certification (or equivalent). If following the Commercial Solution Developer track, completing "Becoming a Solution Developer" first is recommended. Estimated time: ~2 hours of hands-on content.

**Use case:** you're asked to publish an API for an online bookstore that follows REST best practices for development and documentation. The API must be able to create and update book data, retrieve information about one or multiple books, and remove book data from the inventory.

*No Knowledge Check for this module.*

---

## Module 2 — Methods

### What is a REST API?

An API is a mechanism that lets two applications communicate using a shared set of definitions and protocols. Three common API styles were contrasted:

- **SOAP** — uses XML messages; less flexible but more rigid/controlling, useful when messages must conform to strict rules (e.g. systems responsible for paying salaries).
- **WebSocket APIs** — use JSON, support two-way communication, and let the server push callbacks to connected clients.
- **REST** — the most popular/flexible style. A REST API conforms to the Representational State Transfer architectural style (hence "RESTful"). REST APIs communicate over HTTP to perform standard CRUD database operations, and these operations are called **Methods**, which can be classified as **Safe** and/or **Idempotent**.

### Properties of Methods

- **Safe** — the state of the system is not changed after the method finishes.
- **Idempotent** — the effect of multiple identical requests is the same as a single request.

| Method  | Safe | Idempotent |
|---------|------|------------|
| GET     | Yes  | Yes        |
| POST    | No   | No         |
| PUT     | No   | Yes        |
| PATCH   | No   | No         |
| DELETE  | No   | Yes        |
| HEAD    | Yes  | Yes        |
| OPTIONS | Yes  | Yes        |

GET is safe and idempotent because it never changes data and always returns the same result for the same request. POST is neither, because it creates new objects each time. It's the developer's responsibility to actually implement methods so their behavior matches these classifications — nothing enforces it automatically.

### The Different Methods

- **GET** — retrieves one, several, or zero objects from a resource (collection). Use **query parameters** to filter a collection (`/books?category=fantasy&language=en`) and a **path parameter** to retrieve one specific resource by identifier (`/books/100034`, not `/books?id=100034`). If the resource referenced by a path parameter doesn't exist, return `404 Not Found`. In Studio Pro, a GET operation on a collection maps query parameters to microflow parameters and returns a list; a GET on a single resource maps a path parameter, and the microflow typically has a decision ("found?") that returns the object or changes the HttpResponse status/reason phrase to 404 before returning an empty object.
- **POST** — creates new objects. Guidelines: send to the resource **collection** endpoint; a successful POST returns **201 Created**; the response body must contain the created object, including the identifier it can be retrieved with. In the microflow, commit the new object then set the HttpResponse status/reason phrase to 201 before returning the object.
- **PUT** — fully replaces/updates an object. Guidelines: identifies a single object (a PUT should not create a new object unless another system owns the identifier); all updated fields must be in the request body, not query parameters; after the PUT, the object matches the request body exactly; a PUT must not change the object's identifier (again, unless another system owns it); a successful PUT returns **200** with the object in the body.
  - **Important nuance — "empty for missing fields":** by default Mendix's import mapping ("find by key") will *not* overwrite existing attributes with empty values, which technically violates strict PUT semantics (any field missing from the request should be reset to empty). To get true PUT behavior, use an import mapping with **"retrieve by microflow"** instead of "find by key": the microflow retrieves the object, uses a Change activity to set all mapped attributes to empty, returns the object, and then the mapping only sets the attributes that were actually specified in the request.
- **PATCH** — partially updates an object; unlike PUT, fields *not* included in the request retain their current values. Guidelines: works on a single object; updates go in the body, not query parameters; only the changed fields need to be in the request body; must not change the object's identifier; a successful PATCH returns **200** with the object in the body. When PATCH is used as an "action controller" (to trigger a behavior rather than a strict field update) no specific guidelines apply. Implementation-wise, PATCH typically uses the default "find by key" import mapping (so it naturally merges/doesn't blank missing fields) — this is the key practical difference from PUT's microflow-based approach.
- **DELETE** — deletes a single identified object. A successful DELETE returns **204 No Content** with no response body. The microflow pattern mirrors GET-single: retrieve the object, branch on "found?", delete it and set status 204 on success, or set 404 Not Found on failure.
- **HEAD** — returns the same response as a GET but without the response body; used for testing hyperlinks (validity, accessibility, freshness). Can typically be ignored/left unimplemented.
- **OPTIONS** — retrieves which methods are implemented on a resource collection. You generally don't need to implement it yourself except to support **CORS**. If implemented: send to a resource collection; a successful response returns **204** with no content, but should include the `Access-Control-Allow-Origin`, `Access-Control-Allow-Methods`, and `Access-Control-Allow-Headers` headers.

### Exercise — Define the API

Hands-on assignment: extend an existing bookstore API to add the ability to work with ratings — add operations to retrieve a list of all ratings for a book, add a new rating, and delete a rating. Download `API_Design_Assignment.mpk` to get the starting service, and `API_Design_Answer.mpk` to check your work. Note: running the app auto-redirects to the Swagger page.

### Knowledge Check — Module 2 (Score: 100%)

- **Q1: What does idempotent mean?** — **"That the effect of multiple identical requests is the same as a single such request."** Matches the module's exact definition of idempotency.
- **Q2: Which methods are considered safe?** — **"GET, HEAD & OPTIONS."** These are the only three marked "Yes" under Safe in the properties table.
- **Q3: When retrieving resources based on a unique identifier, you should add the identifier as...** — **"A path parameter."** The GET-single lecture explicitly says to use a path parameter, not a query parameter, for a specific resource.

---

## Module 3 — Create Responses & Messages

### Content

The purpose of an API is to exchange information via create/read/update/delete. A POST that creates a new object should return the values of the newly created object. A bad request (400) should return information about what went wrong (validation feedback). Not every method needs a response body — some only need a status code (covered next). When a method *does* need content, regardless of the status code, the message body must be formatted as **JSON**.

### Status Codes and Reason Phrases

Every REST response always carries a status code and a reason phrase describing the outcome, even when there's no body content. Failure codes fall into two broad ranges: **4xx** means the client/user caused the error and should change their request; **5xx** means the problem is on the server.

| Occurrence | Status Code | Reason Phrase |
|---|---|---|
| Successful operation, response has content | 200 | OK |
| Successful creation of new object | 201 | Created |
| Successful operation, response has no content | 204 | No Content |
| Failed validation(s) | 400 | Bad Request |
| Custom authentication failed | 401 | Unauthorized |
| Authentication successful, but not authorized | 403 | Forbidden |
| Object defined in a path parameter is not found | 404 | Not Found |
| Object cannot be updated because of an earlier update | 409 | Conflict |
| An error occurred processing the request | 500 | Internal Server Error |

(For the full list of codes, the lecture pointed to httpstatuses.io/htttp.cat and w3.org.) Mendix returns a standard message for 500 errors; you *can* edit this manually but it isn't required. Returning the correct status code and reason phrase matters because integrating systems base their behavior on that information.

### Error Messages

Error response content must follow these guidelines:

- The response body **must** contain a `SystemMessage` attribute.
- `SystemMessage` **may** contain technical information intended for developers.
- The response body **may** contain a `UserMessage` attribute.
- `UserMessage` **must not** contain technical information.
- `UserMessage` must be phrased so an end user knows what steps to take next (it's assumed the UserMessage is actually shown to the user).
- The response is either a single error object or a list of error objects.
- The error message must never expose implementation details, such as stack traces.

**Validation reusability:** if similar validation functionality already exists elsewhere, you can build validation error messages using the **Feedback Collector module**, which lets you reuse existing validation flows or build one specific to your service.

### Knowledge Check — Module 3 (Score: 100%)

- **Q1: A 4xx response code means** — **"An error caused by the user."** Matches the 4xx/5xx split described in the Status Codes lecture.
- **Q2: Failing to authenticate with a service will result in a** — **"401 Unauthorized."** The status table maps custom-auth failure directly to 401.
- **Q3: Requesting a single item (e.g. /books/1234) that does not exist will result in a** — **"404 Not Found."** Matches "object defined in a path parameter is not found → 404."
- **Q4: What information should not be returned when an error occurs on the server?** — **"The stacktrace."** The guidelines explicitly forbid exposing implementation details like stack traces (as opposed to general "technical information for developers," which the SystemMessage is allowed to carry).

---

## Module 4 — Documentation

### Swagger Page

For a published REST service, Mendix automatically generates a Swagger (OpenAPI) page at `/rest-doc/servicename/`. Without any added documentation, this page shows only generic labels (e.g. parameter named "body"/"file") and no meaningful examples ("no example available"). Once you add documentation, the same page shows a clear resource name and description ("Add new book to catalog"), a realistic example request body, and a fully described response schema (each field with type, example value, and a plain-language description).

### Examples

When your service uses Mendix domain-model objects, you create mapping documents via either **message definitions** or **JSON snippets**. To show a meaningful example on the Swagger page, you must use a message definition — by default Mendix fills example values with generic placeholders like `"string"` and `0`, but you can (and should) overwrite these with more representative values directly in the message definition's structure grid (the "Example value" column per field).

### Extend API with Documentation

You can add documentation in six places, and all of them accept **GitHub Flavored Markdown**:

1. A published service's **public documentation** field (top-level General tab).
2. A **Resource** (e.g. the `books` resource itself).
3. An **Operation's summary field** (short one-liner, e.g. "Add new book") plus a separate **description** field (longer explanation, e.g. "Add new book to catalog").
4. Within **Parameters** (e.g. documenting what the `bookid` path parameter represents — "a system generated id").
5. An **object's message definition field** (documents the whole entity, e.g. `Book`).
6. An **attribute's message definition field** (documents individual fields inside the entity).

### Model

Models on the Swagger page help users/implementation partners understand the structure of the API (e.g. showing the full `Book` and `Rating` object shapes with types and descriptions). Which models actually appear depends on the **import and export mapping** you've configured for the service, together with a message definition — a model is only visible once you've created that mapping and used a message definition. Tip: you can generate the mappings directly from the message definition rather than building them separately.

### Knowledge Check — Module 4 (Score: 100%)

- **Q1: Which of the following places can you add documentation?** — **"Parameters."** Status Code, Authentication, and Method are not documentable locations; Parameters is one of the six documented locations.
- **Q2: What is a downside of using JSON definitions?** — **"There will be no examples on the swagger page."** The lecture states that only message definitions (not JSON snippets) support adding example values for the Swagger page.
- **Q3: The model on the swagger page will be based on** — **"Export and import mapping."** Directly matches "Models will only be visible when you create the import and export mapping and use a message definition."
- **Q4: Besides JSON mapping, mapping documents for a rest service can be created by using a..** — **"Message definition."** The Examples lecture states mapping documents can be created via message definitions or JSON snippets.

---

## Module 5 — Security

### Introduction

Security is critical: without it, anyone who discovers the URL could access (or abuse) your API — e.g. deleting all objects of a type overnight. Three authentication methods are available for a REST service:

1. **Username and password** — credentials from an account in the app.
2. **Active session** — allows access from JavaScript running inside your current application session.
3. **Custom** — your own authentication logic.

### Standard Authentication

By default, a new application enables **Username and password** and **Active session**. Under "Allowed roles," it's recommended to create a **dedicated user role** that has access to your service and nothing else. To make that role usable purely for service access (without triggering permission errors elsewhere in the app), you must **disable the "Check security" checkbox** on that role — otherwise you'll get errors in your application.

### Custom Authentication

Beyond username/password, you can implement custom authentication. Reasons to choose it:

- **Performance** — username/password uses Basic Authentication, which sends credentials as a base64-encoded string; at high call volumes, base64 decoding overhead can hurt performance.
- **Additional security** — passwords are often reused and risky if stolen; custom authentication (e.g. tokens) can eliminate the need for a password entirely.
- **Ease of use** — a token can be simpler to implement than full username/password handling.

For custom authentication to work, you need a **microflow that returns a `System.User` object**. Example flow: take an `HttpRequest` and an `APIKey` (String) as input parameters → decision "APIKey ok?" → if true, retrieve the matching user from the database → return the `User`. In the operation's security configuration, define a **custom authentication parameter** (e.g. a Header parameter named `X-API-Key`, type String) and map it to the microflow's `APIKey` parameter.

### Typical Authentication Types

- **Basic Auth** — automatically implemented when you select username and password. Header: `Authorization: Basic <credentials>` (credentials = `username:password` combined with a colon, base64-encoded).
- **Bearer Token (JWT)** — solutions for handling JWT tokens are available on the Marketplace (not natively supported by the platform). Header: `Authorization: Bearer <token>`.
- **API Key** — a simple string identifying a user or application without any real principal; typically a random token the client sends as a header. Header example: `X-API-Key: abcdef123456`.
- **OAuth client grant** — you first retrieve an access token, then use it to authenticate future requests. Typical flow: (1) the client app requests user authorization for their data; (2) if granted, the app requests an access token from the service provider, passing the authorization grant and its own authentication details; (3) the service provider validates these and returns an access token; (4) the client uses that token to request the user's data. Header: `Authorization: Bearer <OAuth Access Token>`.

### Knowledge Check — Module 5 (Score: 100%)

- **Q1: Which authentication method is not a selectable option?** — **"API Key."** Username/password, Active session, and Custom are the three selectable authentication methods in the security configuration; API Key is a *typical authentication type* implemented via Custom auth, not a directly selectable dropdown option.
- **Q2: What does a custom authentication microflow return?** — **"User."** Matches "you need to have a microflow that will return a System.User object."
- **Q3: Which authentication type is used as default?** — **"Basic Auth."** Username and password (the default enabled method) automatically implements Basic Auth.
- **Q4: What type of documentation is automatically generated?** — **"Swagger json."** Matches the auto-generated Swagger/OpenAPI page described in Module 4.

---

## Module 6 — Conclusion

### Summary

By completing the path, you learned: the different REST methods and their properties; how to create responses and messages; how to get the most out of the OpenAPI 2.0 documentation page; how to use authentication to secure your application; and how to publish a REST API that follows best practices.

### Next Steps

Suggested follow-on learning paths for commercial/adaptive solutions: *Create an Adaptive Solution*, *Secure Your Commercial Solution*, *Brand Your Adaptive Solution*, *Design the UX/UI of Your Commercial Solution*, and *Manage Your Commercial Solution Lifecycle*.

*No Knowledge Check for this module — the course ends with a completion confirmation.*

---

## Appendix — Quick Reference

**Method selection cheat sheet**
- GET → read (safe + idempotent); use path parameter for a single resource, query parameters to filter a collection; 404 if the path-identified resource doesn't exist.
- POST → create; hits the collection endpoint; returns 201 + created object (with its identifier) in the body.
- PUT → full replace of a single object; body only, never query params; doesn't change the identifier; returns 200 + object; missing fields should become empty (use "retrieve by microflow" import mapping to get true PUT semantics in Mendix).
- PATCH → partial update; only send changed fields; missing fields keep their current value; returns 200 + object; "find by key" mapping's default merge behavior naturally fits PATCH.
- DELETE → remove a single object; returns 204, no content.
- HEAD → GET without a body; mostly implement-optional.
- OPTIONS → advertise allowed methods; only needed for CORS; returns 204 + `Access-Control-Allow-*` headers.

**Status code quick map**
- 200 OK / 201 Created / 204 No Content → success family.
- 400 Bad Request → failed validation.
- 401 Unauthorized → custom authentication failed.
- 403 Forbidden → authenticated but not authorized.
- 404 Not Found → path-identified object doesn't exist.
- 409 Conflict → object can't be updated due to a prior update.
- 500 Internal Server Error → unexpected server-side error.

**Error message rules**
- Always include `SystemMessage` (technical info OK for devs).
- Optionally include `UserMessage` (never technical; must guide the end user's next step).
- Never leak implementation details (e.g. stack traces) in any error response.

**Documentation checklist for a production-ready API**
- Add public documentation at the service, resource, operation (summary + description), and parameter levels — all support GitHub Flavored Markdown.
- Use message definitions (not just JSON snippets) so the Swagger page shows realistic example values instead of generic `"string"`/`0` placeholders.
- Set up import/export mappings with message definitions so the Swagger page's Models section renders the real object shape for consumers.

**Security checklist**
- Create a dedicated user role scoped only to the service, with "Check security" disabled on that role.
- Prefer custom authentication (API key/token-based) over username-password when performance, added security, or ease of implementation matter — but it requires a microflow that returns a `System.User`.
- Know the default: Basic Auth (via username/password) is what's enabled out of the box; OAuth, JWT Bearer tokens, and simple API keys are common alternatives layered in via custom authentication.
- Never expose stack traces or other implementation details in any API response, error or otherwise.
