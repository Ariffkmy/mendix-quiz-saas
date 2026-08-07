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
  // ---- Advanced Domain Model Skills ----
  {
    id: 'adm-1',
    topic: 'Advanced Domain Model Skills',
    question:
      'What is the default value of the attribute DeleteAfterDownload on System.FileDocument?',
    options: ['True', 'False', 'Empty', 'It depends on the file size'],
    answer: 'B',
    src: 'Module 3 — System Entities. DeleteAfterDownload defaults to false; when true the file is removed from storage after being downloaded once.',
  },
  {
    id: 'adm-2',
    topic: 'Advanced Domain Model Skills',
    question:
      'A DateTime attribute has Localize set to No. The date displayed in the client is based on the:',
    options: [
      'Browser (client device) time zone',
      'User time zone set on the account',
      'App Settings default time zone',
      'UTC value',
    ],
    answer: 'D',
    src: 'Module 7 — Date Time Handling. With Localize = No the client always shows the raw stored UTC value, regardless of browser or account time zone.',
  },

  // ---- Configure Advanced Security ----
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

  // ---- Constrain Your Data Using Advanced XPath ----
  {
    id: 'xpath-1',
    topic: 'Constrain Your Data Using Advanced XPath',
    question:
      'In relational algebra, which operation combines the information of two entities into one?',
    options: ['Selection', 'Projection', 'Set union', 'Cartesian product'],
    answer: 'D',
    src: 'Module 2.2. Cartesian Product combines the information of two entities into one; associations use this concept. Selection filters rows, Projection selects columns, Set Union merges two lists without duplicates.',
  },
  {
    id: 'xpath-2',
    topic: 'Constrain Your Data Using Advanced XPath',
    question:
      'One of your XPath queries that uses the contains() function is not performing well. What is the most likely root cause?',
    options: [
      "You are using the function on a string attribute that is set to 'unlimited'",
      'You are using the function inside a security access rule',
      'contains() cannot be combined with the and operator',
      'The function is being applied to an association instead of an attribute',
    ],
    answer: 'A',
    src: 'Module 3.2. Avoid string-search functions such as contains() on attributes with unlimited length — it hurts performance significantly.',
  },

  // ---- Design and Publish a REST API ----
  {
    id: 'rest-1',
    topic: 'Design and Publish a REST API',
    question: 'Which HTTP methods are considered safe?',
    options: [
      'GET, POST & PUT',
      'GET, HEAD & OPTIONS',
      'GET, PUT & DELETE',
      'PUT, PATCH & DELETE',
    ],
    answer: 'B',
    src: 'Module 2 — Methods. Safe means the state of the system is not changed after the method finishes. Only GET, HEAD and OPTIONS are marked Safe in the properties table.',
  },
  {
    id: 'rest-2',
    topic: 'Design and Publish a REST API',
    question:
      'What must a custom authentication microflow for a published REST service return?',
    options: [
      'A Boolean indicating whether authentication succeeded',
      'An HttpResponse object',
      'A System.User object',
      'The API key as a String',
    ],
    answer: 'C',
    src: "Module 5 — Security. For custom authentication to work you need a microflow that returns a System.User object; the custom authentication parameter (e.g. an X-API-Key header) maps to that microflow's parameter.",
  },

  // ---- Error Handling ----
  {
    id: 'err-1',
    topic: 'Error Handling',
    question: 'You need to create error handling for Java actions because:',
    options: [
      'Java actions always roll back the entire transaction automatically',
      'Mendix is not able to catch errors that occur in a Java action by default',
      'Java actions cannot be used inside a sub-microflow',
      "Studio Pro's consistency checker flags every Java action as an error",
    ],
    answer: 'B',
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

  // ---- Master Modeling Microflows ----
  {
    id: 'mf-1',
    topic: 'Master Modeling Microflows',
    question: "What does the list operation 'tail' do?",
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
    question: 'Which statement about Rules is true?',
    options: [
      'A rule can only be called from within a decision',
      'A rule can commit objects to the database',
      'A rule can show a page or a message to the user',
      'A rule can call a web service',
    ],
    answer: 'A',
    src: 'Module 4.5. A Rule always returns a Boolean or Enumeration and can be used directly inside a Decision. Rules cannot change data, interact with the client, call web services, generate documents, or import XML.',
  },

  // ---- Track Application Behavior with Logging ----
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
      'Add a log activity to a microflow that you call in the After Startup microflow',
      'Create an enumeration key for it and set the default log level to Trace',
      'Log nodes are always available; no action is required',
    ],
    answer: 'B',
    src: 'Module 5.4.1. A log node only becomes visible once something has written to it, so register every node at startup via a sub-microflow that logs one message per node, called from After Startup.',
  },

  // ---- Win at Working with Data ----
  {
    id: 'data-1',
    topic: 'Win at Working with Data',
    question:
      'True or false: a retrieve by association will always be an in-memory retrieve.',
    options: [
      'True, by association always reads from the transaction object cache',
      "False, if objects aren't available in memory a retrieve by association will automatically result in a database retrieve",
      'True, unless the association is a reference set',
      'False, a retrieve by association always queries the database',
    ],
    answer: 'B',
    src: "Module 3.2. The Runtime converts a by-association retrieve into a database retrieve when the data isn't already cached — across chained associations this can produce an N+1 pattern of many small queries.",
  },
  {
    id: 'data-2',
    topic: 'Win at Working with Data',
    question:
      'What is an important rule to keep in mind when creating effective indexes over multiple attributes?',
    options: [
      'The index should list the attributes in alphabetical order',
      'The index should have the same order of attributes as used in the search and retrieve queries',
      'The index should always include a Boolean attribute to split the table evenly',
      'The index should be defined on non-persistable entities for best performance',
    ],
    answer: 'B',
    src: 'Module 3.4. Indexes are ordered — queries should filter on the attributes in the same order as the index. If constrained by only one attribute, that attribute must be first in the index to benefit.',
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
