// Skill taxonomy. Each skill has a display name, a category and the ways it is
// written in real resumes and job descriptions. Patterns are matched longest
// first and each match "consumes" its text, so "React Native" is not also
// counted as "React", and "JavaScript" is never counted as "Java".

export type Category =
  | 'Languages' | 'Frontend' | 'Backend' | 'Databases' | 'Cloud & DevOps'
  | 'Data & ML' | 'CS fundamentals' | 'Tools & practices' | 'Soft skills'

export interface Skill {
  name: string
  category: Category
  aliases: string[]         // matched case-insensitively on word boundaries
  exact?: RegExp            // optional case-sensitive pattern for ambiguous names (C, R, Go)
}

const S = (name: string, category: Category, aliases: string[] = [], exact?: RegExp): Skill =>
  ({ name, category, aliases: [name.toLowerCase(), ...aliases], exact })

export const SKILLS: Skill[] = [
  // Languages
  S('Python', 'Languages'), S('Java', 'Languages'), S('JavaScript', 'Languages', ['js', 'ecmascript', 'es6']),
  S('TypeScript', 'Languages', ['ts']), S('C++', 'Languages', ['cpp']), S('C#', 'Languages', ['csharp']),
  S('C', 'Languages', [], /(?<![\w+#.])C(?![\w+#])(?=\s*(?:,|\/|\band\b|\bor\b|\)|programming|language))/),
  S('Go', 'Languages', ['golang'], /(?<![\w.])Go(?=\s*(?:,|\/|\)|\band\b|\bor\b|programming|language|lang))/),
  S('Rust', 'Languages'), S('Kotlin', 'Languages'), S('Swift', 'Languages'), S('PHP', 'Languages'),
  S('Ruby', 'Languages'), S('Scala', 'Languages'), S('Dart', 'Languages'),
  S('R', 'Languages', [], /(?<![\w.])R(?=\s*(?:,|\/|\)|\band\b|\bor\b|programming|language|studio))/),
  S('SQL', 'Languages', ['sql queries']), S('Bash', 'Languages', ['shell scripting', 'shell script']),
  S('HTML', 'Frontend', ['html5']), S('CSS', 'Frontend', ['css3']),
  // Frontend
  S('React', 'Frontend', ['react.js', 'reactjs']), S('React Native', 'Frontend'),
  S('Next.js', 'Frontend', ['nextjs', 'next js']), S('Angular', 'Frontend', ['angularjs']),
  S('Vue', 'Frontend', ['vue.js', 'vuejs']), S('Redux', 'Frontend'), S('Tailwind CSS', 'Frontend', ['tailwind']),
  S('Flutter', 'Frontend'), S('Responsive design', 'Frontend', ['responsive web design']),
  // Backend
  S('Node.js', 'Backend', ['nodejs', 'node js', 'node']), S('Express', 'Backend', ['express.js', 'expressjs']),
  S('Django', 'Backend'), S('Flask', 'Backend'), S('FastAPI', 'Backend'), S('Spring Boot', 'Backend', ['spring framework']),
  S('REST APIs', 'Backend', ['rest api', 'restful', 'restful apis']), S('GraphQL', 'Backend'),
  S('Microservices', 'Backend', ['microservice']), S('gRPC', 'Backend'), S('WebSockets', 'Backend', ['websocket']),
  S('Authentication', 'Backend', ['oauth', 'jwt', 'auth']),
  // Databases
  S('PostgreSQL', 'Databases', ['postgres']), S('MySQL', 'Databases'), S('MongoDB', 'Databases', ['mongo']),
  S('Redis', 'Databases'), S('SQLite', 'Databases'), S('Firebase', 'Databases'), S('DynamoDB', 'Databases'),
  S('Elasticsearch', 'Databases'), S('NoSQL', 'Databases'),
  // Cloud & DevOps
  S('AWS', 'Cloud & DevOps', ['amazon web services', 'ec2', 's3', 'lambda']), S('GCP', 'Cloud & DevOps', ['google cloud']),
  S('Azure', 'Cloud & DevOps'), S('Docker', 'Cloud & DevOps', ['containers', 'containerization']),
  S('Kubernetes', 'Cloud & DevOps', ['k8s']), S('CI/CD', 'Cloud & DevOps', ['ci cd', 'continuous integration', 'github actions', 'jenkins']),
  S('Linux', 'Cloud & DevOps', ['unix']), S('Terraform', 'Cloud & DevOps'), S('Nginx', 'Cloud & DevOps'),
  // Data & ML
  S('Machine Learning', 'Data & ML', ['ml']), S('Deep Learning', 'Data & ML'), S('NLP', 'Data & ML', ['natural language processing']),
  S('Computer Vision', 'Data & ML', ['opencv']), S('Pandas', 'Data & ML'), S('NumPy', 'Data & ML'),
  S('Scikit-learn', 'Data & ML', ['sklearn', 'scikit learn']), S('PyTorch', 'Data & ML'), S('TensorFlow', 'Data & ML', ['keras']),
  S('LLMs', 'Data & ML', ['llm', 'large language models', 'generative ai', 'genai', 'gpt']), S('Data analysis', 'Data & ML', ['data analytics', 'eda']),
  S('Statistics', 'Data & ML', ['statistical']), S('Power BI', 'Data & ML', ['powerbi']), S('Tableau', 'Data & ML'),
  S('Spark', 'Data & ML', ['pyspark', 'apache spark']), S('Data visualization', 'Data & ML', ['data visualisation', 'matplotlib', 'seaborn']),
  // CS fundamentals
  S('Data Structures', 'CS fundamentals', ['data structure', 'dsa']), S('Algorithms', 'CS fundamentals', ['algorithm']),
  S('OOP', 'CS fundamentals', ['object oriented', 'object-oriented programming', 'object oriented programming']),
  S('System Design', 'CS fundamentals', ['distributed systems', 'scalable systems', 'low level design', 'high level design']),
  S('Operating Systems', 'CS fundamentals', ['operating system']), S('Computer Networks', 'CS fundamentals', ['networking']),
  S('DBMS', 'CS fundamentals', ['database management']), S('Multithreading', 'CS fundamentals', ['concurrency']),
  // Tools & practices
  S('Git', 'Tools & practices', ['github', 'gitlab', 'version control']), S('Unit testing', 'Tools & practices', ['jest', 'pytest', 'junit', 'vitest', 'testing', 'test-driven', 'tdd']),
  S('Agile', 'Tools & practices', ['scrum', 'sprint']), S('Debugging', 'Tools & practices', ['troubleshooting']),
  S('Code review', 'Tools & practices', ['code reviews']), S('Jira', 'Tools & practices'), S('Figma', 'Tools & practices'),
  S('Postman', 'Tools & practices'), S('Performance optimization', 'Tools & practices', ['performance tuning']),
  // Soft skills
  S('Communication', 'Soft skills', ['communicate']), S('Teamwork', 'Soft skills', ['team player', 'collaboration', 'collaborate', 'cross-functional']),
  S('Problem solving', 'Soft skills', ['problem-solving']), S('Leadership', 'Soft skills', ['mentoring', 'mentor']),
  S('Ownership', 'Soft skills', ['take ownership', 'end-to-end']),
]

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')

interface Pattern { skill: Skill; re: RegExp; len: number }

const PATTERNS: Pattern[] = SKILLS.flatMap((skill) => [
  ...skill.aliases
    .filter((a) => !(skill.exact && a.length <= 2))   // short ambiguous names only via `exact`
    .map((a) => ({ skill, len: a.length, re: new RegExp(`(?<![\\w+#.])${esc(a)}(?![\\w+#]|\\.\\w)`, 'gi') })),
  ...(skill.exact ? [{ skill, len: 1, re: new RegExp(skill.exact.source, 'g') }] : []),
]).sort((a, b) => b.len - a.len)

/** Find every skill in a text. Returns skill name → number of mentions. */
export function extractSkills(text: string): Map<string, number> {
  let t = ` ${text} `
  const found = new Map<string, number>()
  for (const { skill, re } of PATTERNS) {
    re.lastIndex = 0
    t = t.replace(re, (m) => {
      found.set(skill.name, (found.get(skill.name) ?? 0) + 1)
      return ' '.repeat(m.length) // consume, so shorter aliases cannot match inside it
    })
  }
  return found
}

// Knowing a specific tool proves the general skill too.
const IMPLIES: Record<string, string[]> = {
  MySQL: ['SQL'], PostgreSQL: ['SQL'], SQLite: ['SQL'],
  'Next.js': ['React'], Redux: ['React'], 'React Native': ['React'], Express: ['Node.js'],
  TypeScript: ['JavaScript'], PyTorch: ['Machine Learning', 'Deep Learning'], TensorFlow: ['Machine Learning', 'Deep Learning'],
  'Scikit-learn': ['Machine Learning'], Kubernetes: ['Docker'], 'Spring Boot': ['Java'], Django: ['Python'], Flask: ['Python'], FastAPI: ['Python', 'REST APIs'],
  MongoDB: ['NoSQL'], DynamoDB: ['NoSQL'], Redis: ['NoSQL'],
}

/** Skills present in a resume, including the general skills its tools imply. */
export function resumeSkills(text: string): Map<string, number> {
  const found = extractSkills(text)
  for (const [k] of [...found]) for (const g of IMPLIES[k] ?? []) if (!found.has(g)) found.set(g, 0)
  return found
}

export const SKILL_BY_NAME = new Map(SKILLS.map((s) => [s.name, s]))
