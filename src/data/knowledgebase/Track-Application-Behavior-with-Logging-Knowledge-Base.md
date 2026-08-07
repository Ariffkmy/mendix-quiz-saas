# Track Application Behavior with Logging — Mendix Academy Knowledge Base

**Level:** Advanced
**Rating:** 4.7 / 5 (105 ratings)
**Duration:** 3.0 hours
**Modules:** 6 (44 lectures total)
**Studio Pro Version:** 9.24.33
**Source:** [Mendix Academy — Track Application Behavior with Logging](https://academy.mendix.com/link/paths/104/Track-Application-Behavior-with-Logging)

## Course Overview

Logging is a core discipline for operating and maintaining a Mendix application in production. This learning path walks through the full lifecycle of application logging in Mendix: what a log message is and where it comes from, how the different pieces of a log message are structured and where to find them (in Studio Pro during development and in the Mendix Portal/Cloud once deployed), how to interpret the actual message content to diagnose common runtime errors, and — in the largest, most hands-on module — how to design and implement a robust logging strategy inside your own application, including log node naming conventions, startup registration, and level selection for both normal operations and error flows.

---

## Module 1: Introduction

*3 lectures, ~10 minutes*

This short opening module orients the learner to the course. It introduces logging as a discipline for tracking what an application is doing while it runs, frames why logging matters (diagnosing problems, understanding usage, catching issues before end users report them), and previews the learning path: reading log messages, understanding their structure, interpreting error content, and finally implementing logging in a real app. No knowledge check follows this module — it is purely orientational.

---

## Module 2: The Log Message

*7 lectures, ~30 minutes*

This module introduces the fundamental building block of the entire course: the **log message**.

Key concepts covered:
- A log message is a discrete record an application writes out describing something that happened (a normal event, a warning condition, or an error).
- **Log levels** exist to control the *severity/verbosity* of what gets recorded. In order from least to most severe/verbose, Mendix uses: **Trace, Debug, Info, Warning, Error, Critical**. Each level is cumulative going up in severity — configuring a node to a given level shows messages at that level and all more-severe levels above it (e.g., setting a node to "Warning" will also surface Error and Critical messages for that node, but not Info/Debug/Trace).
- **Log nodes** are named components that log messages are grouped under. Nodes are registered dynamically at runtime (they don't need to be predeclared anywhere globally) — the app creates/uses a log node the first time a log activity targeting that node name executes.
- Log messages are ultimately written by whoever built the functionality being logged — this includes both the Mendix platform/runtime itself (System-level nodes) and the developers of any modules used in the app (both first-party modules you build and any imported/Marketplace modules), each of which can register and write to their own log nodes.
- Log messages can be viewed both **locally in Studio Pro** (during development, via the Console) and **remotely in the Mendix Portal/Cloud** (once deployed), though the exact fields available differ slightly between these two contexts (see Module 3).

### Knowledge Check — Module 2 (Score: 100%)

- **Q: Which field differs between a log message viewed in Studio Pro versus one viewed in the Portal?**
  **Answer: The Source field.** — Rationale: the Source field only applies to cloud-deployed environments (it identifies which node/instance in a cloud cluster emitted the message), so it is absent from local Studio Pro log output and only appears in Portal/cloud log views.
- **Q: Where do log messages come from?**
  **Answer: Log messages are written by the person who created the functionality.** — Rationale: this matches the lecture's framing that both Mendix's own runtime/module developers and the app's own developers are each responsible for the log messages associated with the functionality they build.
- *(Additional questions in this knowledge check were answered correctly on the first attempt but their exact wording was not retained after a mid-session context compaction; all were scored correct.)*

---

## Module 3: The Components of a Log Message Explained

*9 lectures, ~40 minutes*

This module breaks a single log message down into its constituent fields and shows where each is surfaced across Studio Pro and the Mendix Portal.

**Structure of a log message:**
- **Timestamp** — when the event occurred.
- **Source** *(cloud-only)* — which environment/node in a Mendix Cloud deployment produced the message. Not present for local Studio Pro logging.
- **Log level** — the severity (Critical, Error, Warning, Info, Debug, Trace).
- **Log node** — the named component/module the message belongs to.
- **Log message** — the body itself, generally a combination of a structured/templated part and free-form unstructured text.

**Where to find logs — Studio Pro (local/design-time):**
- **View > Console** shows live log output while running the app locally.
- **Console > Advanced > Set log levels…** lets a developer configure the verbosity per log node while developing.
- **Run > Default Log Level** sets the baseline level applied to nodes that haven't been explicitly configured.

**Where to find logs — Mendix Portal (cloud/runtime):**
- **Deploy > Environments > [environment] > Details > Loglevels tab** — configure per-node log levels for a deployed cloud environment (mirrors the Studio Pro console configuration, but for the running cloud app).
- **Deploy > Logs** — browse historical/archived log output for an environment.
- **View Live Log** — stream logs from a running cloud environment in real time (similar to tailing a log file).
- **Alerts window / Critical Logs alerts** — the Portal can be configured to raise alerts automatically when Critical-level log messages occur, so operators are proactively notified of the most severe issues rather than needing to watch the log stream continuously.

### Knowledge Check — Module 3 (Score: 100%)

All questions were answered correctly on the first submission. Question content centered on matching each log-message field (Timestamp, Source, Log level, Log node, Log message) to its correct description, and matching each Portal/Studio Pro navigation path (Loglevels tab, Deploy > Logs, View Live Log, Console) to what it is used for. Exact question wording was not retained after a mid-session context compaction, but every answer was confirmed correct via the post-submission score.

---

## Module 4: Reading the Message Part of a Log Message

*9 lectures, ~40 minutes*

This module focuses on actually *interpreting* the text of a log message to diagnose what went wrong in an application, covering the most common categories of runtime errors a Mendix developer will encounter in log output, plus the mechanics of stack traces and REST error handling.

**Common Mendix error categories covered:**
- **Null Pointers** — code/microflow logic attempting to use an object reference that is empty/unset.
- **Security Errors** — a user or process attempting an action they don't have the Mendix security rights to perform.
- **Mathematical Errors** — issues such as division by zero or invalid numeric operations.
- **Java Out of Memory Errors** — the underlying Java runtime running out of allocated heap memory, often surfacing as app instability rather than a clean error.
- **Autocommitted Objects** — issues arising from objects that Mendix committed to the database automatically as a side effect (e.g., via associations), which can cause unexpected data states if not well understood.
- **Application Breaks on Startup** — errors that prevent the app from starting at all, typically requiring inspection of the earliest log output right after a deploy/start attempt.

**Stack traces:**
- A stack trace is the list of function/microflow calls that were active in memory at the moment an error occurred — the programming-language concept of a call stack. In Mendix, a stack trace shows the chain of microflow calls (which microflow called which) leading up to the point of failure, which is essential for tracing an error back to its root cause rather than just the symptom.
- The **Log message** activity's "Include latest stack trace" option can be enabled to attach this call-chain information to a manually logged message, which is especially useful when logging inside error-handling flows.

**REST call error handling:**
- When configuring error handling on a **Call REST service** action, using **"Custom with rollback"** error handling lets the developer branch into their own error-handling logic (rather than relying on the default framework behavior) and roll back any pending database changes if the call fails.
- The system variable **`$latestHttpResponse`** becomes available in the error-handling flow, exposing:
  - **StatusCode** — the HTTP status code returned by the failed call.
  - **ReasonPhrase** — the HTTP reason phrase associated with that status.
  - **Content** — the raw response body, useful for surfacing the actual error detail returned by the external API.

### Knowledge Check — Module 4 (Score: 100%)

All questions were answered correctly on the first submission. Question content centered on matching log message text/error snippets to the correct error category (Null Pointer vs. Security vs. Mathematical vs. Out of Memory vs. Autocommit vs. Startup failure), and on the purpose of `$latestHttpResponse` and its sub-fields in REST error flows. Exact question wording was not retained after a mid-session context compaction, but every answer was confirmed correct via the post-submission score.

---

## Module 5: Implementing Logging In Your Own App

*14 lectures, ~50 minutes*

This is the course's largest and most hands-on module, walking through building a complete logging strategy inside a sample "Holiday Request" application using Mendix Studio Pro.

### 5.1 Learning Objectives
Sets expectations: by the end of this module you should be able to define log node names properly, register them at startup, log both normal-operation and error events, and choose appropriate log levels for each case.

### 5.2 Introduction / 5.2.1 Getting Started
Introduces the hands-on exercise app (a Holiday Request application that calls an external weather REST API) and the Studio Pro starting point for the exercises that follow.

### 5.3 Setting Up Logging / 5.3.1 Defining Log Node Names
Rather than typing free-text log node name strings by hand throughout an app (error-prone and inconsistent), the recommended pattern is to define an **Enumeration** whose keys represent each log node name used in the module. A helper expression function, **`getKey()`**, retrieves the enumeration key as a plain string at runtime for use in a Log message activity's "Log node" field, e.g.:

```
getKey(PublicHolidays.Enum_LogNodes.PublicHolidays)
```

- **Why an enumeration:** it standardizes log node naming across the app and — as a side benefit — gives the team a single, easy-to-find central place listing every log node used in the module, rather than having node names scattered as ad hoc strings across many microflows.

### 5.4 Logging During Normal Operations
#### 5.4.1 Initializing Your Log Nodes
A log node only becomes visible/configurable in the log-level settings once at least one log message has actually been written to it — which is a problem if you want to configure its level *before* any real traffic hits it. The fix is to proactively "register" every log node at application startup: create a small sub-microflow that logs one message (e.g., an Info-level message) to each log node the module defines, and call that sub-microflow from the app's **After Startup** microflow. This guarantees every log node is immediately visible and configurable as soon as the app comes online, rather than only appearing the first time it's organically used.

#### 5.4.2 Create Your First Info Log Message
Walks through adding a **Log message** activity to a microflow: choosing the log level (Info, for a normal/expected event), selecting the log node (via the enumeration + `getKey()` pattern from 5.3.1), and composing the message template/parameters.

### 5.5 Logging Errors
#### 5.5.1 Adding Error Logs to REST Calls
Using the Holiday Request app's weather-API REST call as the running example, this lecture walks through choosing the right log level for a failure in an error flow. The reasoning presented: **Critical** is overkill for a failed weather lookup (the core "request vacation" functionality still works even without weather data), and **Warning** is not severe enough for something that represents an actual failed integration requiring attention — so the exercise settles on an appropriate mid-severity level that flags the failure as needing investigation without treating it as an application-breaking event, and adds a Log message activity to the REST call's error/failure path accordingly (with "Include latest stack trace" enabled to aid debugging).

### 5.6 Logging for Debugging
#### 5.6.1 Log Your Steps
Covers using lower log levels (Debug/Trace) to instrument a microflow's internal steps during development/troubleshooting — logging intermediate variable values or branch decisions so a developer can trace exactly which path a microflow took, without leaving that verbosity turned on in normal production operation (since Debug/Trace should typically be filtered out by the configured log level once the app is stable).

### 5.7 Summary
Recaps the module's build-up: define log node names via enumeration → register them at startup → log normal-operation events at Info → log error-flow failures at an appropriate elevated level → use Debug/Trace for step-by-step troubleshooting.

### Knowledge Check — Module 5 (Score: 100%, after one retake)

- **Q1: Why should you use an enumeration for your log node names?**
  **Answer: "This allows you to standardize the log node name and group all log node names in your app."** — Rationale: directly matches lecture 5.3's stated reasoning — consistency plus having every log node centrally located and easy to find.
- **Q2: How do you ensure that your log node name is available after startup?**
  **Answer: "Add a log activity to a microflow that you call in the After Startup microflow."** — Rationale: matches the 5.4.1 pattern exactly — a sub-microflow that logs a message per log node, invoked from After Startup, so every node is registered/visible immediately on app start.
- **Q3: You want to add a log event to an error flow on your REST Call to indicate a weather API call failed in your Holiday Request application. Which level of logging should you use?**
  **Answer: "Warning, you can still continue but someone should look into why the REST call is failing and whether further action is needed."** — Note: on the first submission, "Error" was selected (reasoning from the lecture's framing that Critical was overkill and Warning "not severe enough" seemed to point to Error); this was marked **incorrect** by the platform. By elimination against the other two clearly-wrong options (Critical — overkill; Info — doesn't fit an error flow), the quiz's intended correct answer is **Warning**. The module was retaken with this corrected answer and scored 100%.

---

## Module 6: Conclusion

*2 lectures, ~10 minutes*

### 6.1 Summary
Recaps the full learning path's outcomes. By completing the course, the learner should now be able to:
- Read log messages, and know where they come from and where they can be found.
- Configure the amount of log messages that are generated (i.e., set appropriate log levels).
- Create their own log messages.
- Implement logging in their own application according to best practices.

### 6.2 Next Steps
Suggests related Mendix Academy learning paths to continue with:
- Error Handling
- Deploying an App on a Licensed Node
- Quality Control and Testing
- Learn how to Handle Errors

*(No knowledge check follows Module 6 — it is a wrap-up module only.)*

---

## Appendix — Quick Reference

- **Log level order (least → most severe):** Trace → Debug → Info → Warning → Error → Critical. Configuring a node at a given level also surfaces all levels above it.
- **Log message fields:** Timestamp, Source (cloud-only), Log level, Log node, Log message (structured + unstructured).
- **Log nodes are dynamic** — they register the first time something logs to them, unless you proactively register them at startup.
- **Always register your log nodes at startup**: build a sub-microflow that logs one message per log node, and call it from the **After Startup** microflow, so every node is visible/configurable in the Portal/Console from the moment the app comes online.
- **Never hardcode log node name strings.** Define an **Enumeration** of log node names and retrieve them with `getKey()` — this standardizes naming and gives you a single place to see every log node in the module.
- **Choose log levels deliberately, not reflexively:**
  - Info — expected, normal-operation events.
  - Warning — something failed but the app can continue and it merely warrants investigation.
  - Error — a real failure requiring attention/action.
  - Critical — application-breaking, requires immediate operator response (can trigger Portal alerts).
  - Debug/Trace — verbose, step-by-step internal detail for active troubleshooting only; not meant to run at that verbosity in steady-state production.
- **Enable "Include latest stack trace"** on Log message activities placed in error-handling flows — it captures the microflow call chain leading to the failure, which is critical for root-cause diagnosis.
- **REST call error handling:** use **"Custom with rollback"** on Call REST service actions to branch into your own error logic and roll back pending changes on failure; inspect **`$latestHttpResponse`** (StatusCode, ReasonPhrase, Content) to log the actual failure detail from the external service.
- **Local vs. cloud log access differs:**
  - Studio Pro (local): View > Console; Console > Advanced > Set log levels…; Run > Default Log Level.
  - Portal (cloud): Deploy > Environments > [env] > Details > Loglevels tab; Deploy > Logs; View Live Log; Alerts window (Critical Logs alerts).
- **Common error categories to recognize in log output:** Null Pointers, Security Errors, Mathematical Errors, Java Out of Memory Errors, Autocommitted Objects, Application Breaks on Startup — each has a distinct log signature worth learning to recognize quickly.
- **Set up Critical-level alerting in the Portal** so operators are proactively notified of application-breaking issues rather than relying on manually watching log streams.
