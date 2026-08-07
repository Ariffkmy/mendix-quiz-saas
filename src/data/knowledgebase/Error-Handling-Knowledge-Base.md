# Error Handling — Mendix Academy Learning Path

**Level:** Advanced
**Rating:** 4.7 / 5 (133 ratings)
**Duration:** ~2.0 hours
**Modules:** 6
**Studio Pro Version:** 9.12.4

## Course Overview

This advanced-level Mendix Academy path teaches the end-to-end process of handling errors in a Mendix application. Because Studio Pro does not surface consistency errors for logic that fails only at runtime (e.g. a misconfigured import, a failing REST call), developers must proactively identify, handle, and fix these failures so that end users never see Mendix's generic, unhelpful default error dialog ("An error occurred, please contact your system administrator"). The course uses a running example: an app called "Traineeships" being built for a fictional client, Josh, who needs to import course-planning data from Excel spreadsheets into his Mendix app using the ExcelImporter marketplace module. Learners progressively build the import logic, deliberately encounter the default Mendix error, learn how the platform behaves by default, implement custom error handling (rollback, logging, and user-facing messaging), and finally diagnose and fix the root cause of the error using the tools and messages they built.

---

## Module 1: Introduction

### 1.1 Welcome
The course goal is to teach the Mendix process of handling errors. A good user experience means end users should never see confusing/meaningless errors — error handling lets a developer intercept an error before it reaches the UI. By the end of the path, learners can: identify an error, implement error handling for specific problems, and fix an error in an app.

### 1.2 Audience and Duration
Intended for Mendix developers who are certified at the advanced level and already comfortable with Studio Pro. Learners should already know how to use the **ExcelImporter** module and have experience with integrations. Expected duration: ~2 hours.

### 1.3 Use Case
The running scenario: Josh owns a company that provides traineeships and currently manages everything in Excel, with many inconsistent versions floating around. He wants a single-source Mendix app to manage traineeships, requiring all existing Excel data to be imported into the application. The next module has learners download and set up the starter app for this scenario.

*(No Knowledge Check in this module.)*

---

## Module 2: Setting up the App

### Learning Objectives
- Build logic to import data from an Excel file.

### 2.2 Introduction
The starter project (.mpk) and reference Excel sheets are provided as downloadable resources. A solution app is also available in the 5.3 Summary lecture resources if a learner gets stuck.

### 2.2.1 Download the App (exercise)
1. Open Studio Pro 9.12.4 and import the downloaded project package.
2. The app's Homepage exposes four tiles: **Course planning overview**, **Course location overview**, **Import courseplanning**, **Import courselocations**.

### 2.2.2 Check your Project (exercise)
- In the Domain Model of the **CourseManagement** module there are two entities: **Courseplanning** and **Courselocation**.
- The task is to build import logic that populates these entities from the downloaded Excel resources.
- The end user selects a file via the page **Courseplanning_SelectFile**, opened as a popup by the **Import courseplanning** button on the homepage. The popup has a **File** picker (Browse…) and a **Start import** button.

### 2.2.3 The Logic without Error-Handling (exercise)
Builds the import microflow **ACT_ImportFile_StartImport_Courseplanning**, triggered by clicking **Start import**.
1. Start from the end of the microflow first — the outcome should be that the popup closes and the page **Courseplanning_Overview** appears. Add a **Close page** activity followed by a **Show page 'Courseplanning_Overview'** activity.
2. Before closing the page, the actual import logic is needed. Rather than putting the import logic inline, extract it into a reusable **Sub-microflow** (learned in the "Build an Event App Using Microflows" path) named **SUB_ImportFile_DoTheImport**.
3. Importing Excel cannot be done with a standard Mendix action — it requires a Java action. The pre-built Java action **StartImportByTemplate** lives in the **ExcelImporter** marketplace module (App Store modules → ExcelImporter → Template → StartImportByTemplate).
4. **StartImportByTemplate** needs two inputs: a **Template object** (of type `ExcelImporter.Template`) and the **Import excel doc** (`System.FileDocument`), plus an optional **Import object parameter**.
5. The **ImportFile** object (containing the uploaded file) is already available in the page's data context and must be passed as an input parameter into the sub-microflow.
6. Add a **Retrieve** activity in the sub-microflow to fetch the correct `ExcelImporter.Template` object: `Entity = ExcelImporter.Template`, `Range = First`, `XPath constraint = [Title='Courseplanning import']`.
7. Wire the retrieved Template and the ImportFile object as inputs to the Java action call. Configure: import object parameter = *empty*, "Use return value" = **No** (Return type = Nothing).
8. When calling the sub-microflow from the parent microflow (Call Microflow activity), Studio Pro auto-updates parameter mappings — confirm the `ImportFile` argument maps correctly.

### 2.2.4 Running into an Error (exercise)
1. Run the app, open the Homepage, click **Import Courseplanning**.
2. Select the "Course planning" Excel file (from the 2.1 Introduction lecture's resources).
3. Click **Start import** — the result is Mendix's generic default error popup:
   > **Error** — "An error occurred, please contact your system administrator."

   This is the platform's *default* (unhandled) error behavior — it will be addressed with error handling in the next modules.

### 2.3 Summary
Without error handling, the end user sees a message that is not user-friendly. The next module explains why this happens and how to identify errors.

### Knowledge Check (Module 2) — Score: 100%
**Q1: When you're creating a new microflow and you have to create the logic, what is the recommended place to start?**
**Answer: At the end of the microflow.** — *Rationale: the lecture explicitly recommends starting at the end so you can focus on the main functionality/outcome first, then work backwards.*

**Q2: Why are we creating sub-microflows?**
**Answer: To be able to reuse the functionality and have a microflow with dedicated functionality.** — *Rationale: sub-microflows both enable reuse of the import logic elsewhere and keep a single microflow focused on one dedicated responsibility.*

---

## Module 3: Identifying the Error

### Learning Objectives
- Identify an error.
- Explain the default error handling behavior of a Mendix app.

### 3.2 Introduction into Errors
Studio Pro's consistency checker won't catch every runtime problem — an app can run locally with zero consistency errors and still fail at runtime (e.g., a REST service that returns no response). You can minimize errors, but not always prevent them; the goal becomes ensuring the app can properly deal with the situation when it does happen.

### 3.2.1 Debugger (exercise)
To confirm the cause of an error, run the **Debugger** and put a **breakpoint** on the suspect Java action (here, inside `SUB_ImportFile_DoTheImport`) to step through and verify it's the Java action throwing the failure.
- **Key concept:** when this generic error occurs, it means the microflow could not finish the transaction. The microflow stops the transaction and shows the default error message in the UI.

### 3.3 Default Error Behaviour of Mendix
To prevent the generic error message from reaching users, two checks matter:
1. Verify an **Excel ImportFile** is actually selected — the file being imported cannot be empty.
2. By default, **Mendix cannot catch errors that occur inside a Java action.** If the Java action fails, an unhandled error automatically surfaces to the UI and the transaction's changes are not executed — unless custom error handling is configured.

### 3.4 Summary
Identifying the error is just as important as knowing how to handle it — you need the right information first to decide how to handle it properly.

### Knowledge Check (Module 3) — Score: 100%
**Q1: What happens when Mendix is not able to finish the transaction successfully and there is no Error Handling implemented?**
**Answer: The transaction is stopped and Mendix will show an error message in the user interface.** — *Rationale: matches the lecture text verbatim — the microflow stops the transaction and displays an error in the UI.*

**Q2: You need to create error handling for JAVA actions because:**
**Answer: Mendix is not able to catch errors that occur in a JAVA action by default.** — *Rationale: this is the core default-behavior fact taught in 3.3 — Java action failures aren't automatically caught by Mendix.*

---

## Module 4: Handling the Error

### Learning Objectives
- Determine the type of error handling needed for a specific situation.
- Create logic to handle an error.
- Create a log message to properly document an error.

### 4.2 Determine the Type of Error Handling
Read the docs: *Error Handling in Microflows*. Most of the time a single activity with custom error handling suffices; for more complex processes involving external systems, think through what should happen *after* an error later in the process (e.g., don't send a "status changed" notification if the change is later reverted). Decide per-scenario whether to continue, skip/revert the record, or stop while keeping changes made so far.

**Error handling component types (reference table):**

| Type | Behavior |
|---|---|
| **Error Handling – Custom With Rollback** | Everything up to the error is rolled back and a new transaction is initiated; only the changes executed in the error-handler flow are applied. |
| **Error Handling – Custom Without Rollback** | Actions taken inside the microflow can be reverted, but everything that happened *before* the error is kept; the microflow continues over the custom error-handler flow. |
| **End Event** | Marks the end of the microflow transaction — all actions execute at the end of the main microflow. |
| **Error End Event** | Re-throws the error to all parent microflows after executing the custom activities (see *Error Event* in the Studio Pro Guide). |

### 4.2.1 Create Error Handling Flow (exercise)
1. Right-click the Import Java action → **Set error handling…** → Studio Pro shows a dialog to pick the error-handling **Type**.
2. Choose **Custom with rollback** — everything up to the error should be rolled back and a new transaction initiated; only changes in the error-handler flow execute.
3. Custom error handling requires an outgoing sequence flow designated as the error handler — drag a sequence flow from the Java action to create it.
4. Connect the alternative (error) path to an **End Event** to fully configure the error handler.
5. Testing afterward: the error no longer surfaces in the UI, but the import is still silently unsuccessful — which is not actually helpful to the user yet. Next steps: (a) log the error for diagnosis, (b) show the user a message.

### 4.2.2 Create the Log (exercise)
Always log when the error handler is triggered — helps trace the cause of errors from a Java action or REST service. Use a **Log Message** activity with:
- Log level: **Error**
- Log node name: `'Import Excel file'`
- Template: `Latest error: {1}`
- Parameter `{1}` = **`$latestError/Message`** (a system variable populated automatically inside an error handler, holding the underlying exception's message)
- "Include latest stack trace" left as **No** in this exercise.

**Important caution:** Don't over-engineer error handling — overly complex handling combinations make the microflow slower to evaluate and harder to predict the exact behavior on exception. Log entries become part of the app's log files and help both developers and administrators diagnose issues faster.

### 4.3 Determine the Type of Flow
How you should deal with an error depends on what *triggered* the microflow:
- **The system** (e.g. scheduled events) — no user interaction exists, so **create a log** to trace details if it occurs (e.g. an overnight REST synchronization needs logging/error handling to analyze exceptions later).
- **The user** — give the user proper feedback via a **Show message** activity, replacing the raw error popup with a friendlier, customized message.

### 4.3.1 Create the User Message (exercise)
1. Add a **Show message** action (type: Error) in the alternative/error flow with the text: *"Something went wrong, please contact your administrator."*
2. Extend the message with diagnostic info valuable to an administrator:
   *"Information that could help your administrator: Latest error: {1}"* with parameter `{1}` = **`$latestError/Message`**.
3. "Blocking" left as **Yes**.
4. Run the app and confirm the customized message appears instead of the generic Mendix error on a failed import.

### 4.4 Summary
Learners now know how to build a customized message giving both the end user and the administrator valuable diagnostic information about what occurred.

### Knowledge Check (Module 4) — Score: 100%
**Q1: Error handling can occur in microflows that are triggered by:**
**Answer: Both, a user and the system.** — *Rationale: 4.3 explicitly covers handling for both system-triggered (scheduled/background) and user-triggered microflows, each with a different recommended approach.*

**Q2: It is necessary to create a log message and a user message because:**
**Answer: The log message will not appear in the frontend.** — *Rationale: the log is only visible in the app's server-side log files, invisible to the end user — hence a separate user-facing "Show message" is also required so the user isn't left staring at nothing/a generic dialog.*

---

## Module 5: Fixing the Error

### Learning Objectives
- Identify the cause of an error.
- Fix a missing template error.

### 5.2 How to Fix the Error
The main goal of error handling is that the developer gains insight into the cause of an unsuccessful microflow and can resolve it. This module finds the cause of the earlier error and fixes it.

### 5.3 Identifying the Cause (exercise)
1. Reproduce the error by clicking **Import Courseplanning** on the Home page again.
2. Because a custom message was built in Module 4, the popup is now informative:
   > "Something went wrong, please contact your administrator. Information that could help your administrator: **Latest error: There is no object type selected for the template**"
3. Thanks to the custom message, the root cause is now immediately clear: **there is no object type selected for the template.**

### 5.3.1 Changing the Template (exercise)
1. Navigate to the **Excel importoverview** menu icon → **Courseplanning import** template.
2. Opening the *Courseplanning import* template confirms no Mendix object type is selected — that's why the import cannot work.
3. Fix it: select the object type of type **Courseplanning** for the template (via "Select an objecttype" — pick `CourseManagement.Courseplanning`).
4. After selecting the object, you must re-connect the import attributes by clicking **Connect matching attributes** in order to save the template.
5. Click **Save**, then test: correctly connected attributes show green check marks next to each column.
6. Well done — the error is fixed!

### 5.4 Summary
This module completes the loop: because you can't always prevent an error, error handling doesn't mean giving up on fixing it — in this case the root cause was a missing import template configuration, but the cause could just as easily be external. The overarching goal should always be to prevent errors like this from happening at all where possible.

### Knowledge Check (Module 5) — Score: 100%
**Q1: Which of the following options needs to be selected to fix an error indicating that there is no object type selected for the Courseplanning import template?**
**Answer: Select the missing object in the properties of the template.** — *Rationale: the fix in 5.3.1 was performed directly in the template's own configuration screen ("Select an objecttype"), not in a microflow or reference field.*

**Q2: After an object has been connected to a template, what must you ensure to do before saving this template?**
**Answer: Connecting matching attributes.** — *Rationale: the exercise explicitly states you must click "Connect matching attributes" to re-link the import columns before the template can be saved.*

---

## Module 6: Conclusion

### 6.1 Summary
In this learning path, you learned how to identify and fix errors, and how to apply error handling. Congratulations on finishing!

### 6.2 Next Steps
For further practice, learners are encouraged to repeat the whole exercise independently for the **Courselocations** entity (a parallel "Import courselocations" button exists on the Homepage, using the same starting point as the Courseplanning import). A Courselocations Excel file is provided as a resource for this purpose.

*(No Knowledge Check — final module.)*

---

## Appendix — Quick Reference

- **Default Mendix behavior:** Java actions are *not* automatically caught by Mendix — an unhandled failure inside one will always surface the generic "An error occurred, please contact your system administrator" message and abort the transaction.
- **Start building microflow logic from the end backwards** — define the desired end result first, then work out what has to happen to get there.
- **Use sub-microflows** for reusable logic (e.g. import routines) — they keep the parent microflow focused on one responsibility and make the logic independently reusable and testable.
- **Right-click an activity → "Set error handling…"** in Studio Pro to configure how a microflow reacts to a failure at that step.
- **Four error-handling component types:** Custom With Rollback (undo everything up to the error, start fresh), Custom Without Rollback (keep everything before the error, continue on the error path), End Event (normal transaction end), Error End Event (re-throw to parent microflows).
- **Match the error-handling strategy to the trigger:** system-triggered microflows (scheduled events, background jobs) → prioritize **logging** since no user is present to notify; user-triggered microflows → prioritize a friendly **Show Message**.
- **`$latestError/Message`** is the key system variable inside an error handler — use it in both Log Message and Show Message templates to surface the real underlying exception text.
- **Always log the error** (Log level = Error) when a custom error handler triggers, even if you also show the user a friendly message — logs are the only durable trace for diagnosing recurring or hard-to-reproduce issues.
- **Don't over-engineer error handling** — excessive/complex error-handling combinations slow down microflow evaluation and make behavior on exception harder to predict. Keep it as simple as the situation requires.
- **A well-designed user-facing error message that includes `$latestError/Message` doubles as your fastest diagnostic tool** — in this course, the custom message itself revealed the exact root cause ("no object type selected for the template") without needing the debugger a second time.
- **The debugger + a breakpoint on the suspect activity** is the standard way to confirm which step is actually throwing an error before you invest in building handling logic around it.
- **ExcelImporter module specifics:** the `StartImportByTemplate` Java action needs a `Template` object (retrieved via XPath on `ExcelImporter.Template`) and a `System.FileDocument`; the Template's Mendix object type and column-to-attribute mappings must both be correctly configured in the Excel import template screens, or the import will fail with "no object type selected for the template."
