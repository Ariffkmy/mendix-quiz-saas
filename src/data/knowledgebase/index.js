/**
 * Study material.
 *
 * Each .md file in this folder is one module of the Mendix course. The exam
 * topics are a different cut of the same material — the seven advanced-level
 * topics in questions.md group questions by what they test, not by which course
 * module they came from, so a module can feed several topics and a topic can
 * draw on several modules. `topics` records that relationship for the study
 * view; it is documentation of the mapping, not something the exam depends on.
 *
 * Files are imported as raw strings so the study view can render them without a
 * network round-trip.
 */
const modules = import.meta.glob('./*.md', { query: '?raw', import: 'default', eager: true });

/** Filename stem -> { title, exam topics the module feeds }. */
const MODULE_META = {
  'Advanced-Domain-Model-Skills-Knowledge-Base': {
    title: 'Advanced Domain Model Skills',
    topics: ['Advanced domain modeling', 'XPath'],
  },
  'Configure-Advanced-Security-Knowledge-Base': {
    title: 'Configure Advanced Security',
    topics: ['Security and performance'],
  },
  'Constrain-Your-Data-Using-Advanced-XPath-Knowledge-Base': {
    title: 'Constrain Your Data Using Advanced XPath',
    topics: ['XPath'],
  },
  'Design-and-Publish-a-REST-API-Knowledge-Base': {
    title: 'Design and Publish a REST API',
    topics: ['User experience', 'Security and performance', 'Error handling'],
  },
  'Error-Handling-Knowledge-Base': {
    title: 'Error Handling',
    topics: ['Error handling', 'User experience'],
  },
  'Master-Modeling-Microflows-Knowledge-Base': {
    title: 'Master Modeling Microflows',
    topics: [
      'Memory and data model optimization',
      'XPath',
      'Advanced domain modeling',
      'User experience',
      'Logging',
    ],
  },
  'Track-Application-Behavior-with-Logging-Knowledge-Base': {
    title: 'Track Application Behavior with Logging',
    topics: ['Logging'],
  },
  'Win-at-Working-with-Data-Knowledge-Base': {
    title: 'Win at Working with Data',
    topics: ['Memory and data model optimization', 'XPath'],
  },
};

/**
 * @type {Array<{ slug: string, file: string, title: string, topics: string[], content: string }>}
 */
export const KNOWLEDGE_BASE = Object.entries(modules)
  .map(([path, content]) => {
    const file = path.replace('./', '').replace('.md', '');
    const meta = MODULE_META[file] ?? { title: file.replace(/-/g, ' '), topics: [] };
    return {
      slug: meta.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
      file: `${file}.md`,
      title: meta.title,
      topics: meta.topics,
      content,
    };
  })
  .sort((a, b) => a.title.localeCompare(b.title));

/** Every study module that covers a given exam topic. */
export function knowledgeForTopic(topic) {
  return KNOWLEDGE_BASE.filter((m) => m.topics.includes(topic));
}
