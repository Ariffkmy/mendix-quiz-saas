/**
 * Study material. The .md files in this folder are the source of truth for the
 * question bank — each one maps to an exam module (a `topic` in questions.js).
 *
 * They are imported as raw strings so the study view can render them without a
 * network round-trip, and so new modules only need a file drop to show up.
 */
const modules = import.meta.glob('./*.md', { query: '?raw', import: 'default', eager: true });

/** Filename stem -> the topic name used in questions.js. */
const TOPIC_BY_FILE = {
  'Advanced-Domain-Model-Skills-Knowledge-Base': 'Advanced Domain Model Skills',
  'Configure-Advanced-Security-Knowledge-Base': 'Configure Advanced Security',
  'Constrain-Your-Data-Using-Advanced-XPath-Knowledge-Base':
    'Constrain Your Data Using Advanced XPath',
  'Design-and-Publish-a-REST-API-Knowledge-Base': 'Design and Publish a REST API',
  'Error-Handling-Knowledge-Base': 'Error Handling',
  'Master-Modeling-Microflows-Knowledge-Base': 'Master Modeling Microflows',
  'Track-Application-Behavior-with-Logging-Knowledge-Base':
    'Track Application Behavior with Logging',
  'Win-at-Working-with-Data-Knowledge-Base': 'Win at Working with Data',
};

/**
 * @type {Array<{ slug: string, file: string, topic: string, content: string }>}
 */
export const KNOWLEDGE_BASE = Object.entries(modules)
  .map(([path, content]) => {
    const file = path.replace('./', '').replace('.md', '');
    const topic = TOPIC_BY_FILE[file] ?? file.replace(/-/g, ' ');
    return {
      slug: topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      file: `${file}.md`,
      topic,
      content,
    };
  })
  .sort((a, b) => a.topic.localeCompare(b.topic));

/** Look up the study material for a topic name. */
export function knowledgeForTopic(topic) {
  return KNOWLEDGE_BASE.find((m) => m.topic === topic) ?? null;
}
