import type { SessionDetail, InterviewQuestion, SoftSkillsEvaluation, EvaluationReport } from './types';
import { MOCK_SESSIONS } from './mockData';

interface QuestionTemplate {
  topic: string;
  text: string;
  difficulty: 'easy' | 'medium' | 'hard';
  keyPoints: string[];
  missedPoints: string[];
  answerHigh: string;
  answerLow: string;
}

const DOMAIN_Q: Record<string, QuestionTemplate[]> = {
  java: [
    {
      topic: 'OOP Concepts', difficulty: 'easy',
      text: 'Explain the four pillars of Object-Oriented Programming with examples in Java.',
      keyPoints: ['Encapsulation', 'Inheritance', 'Polymorphism', 'Abstraction'],
      missedPoints: ['Interface vs Abstract class distinction'],
      answerHigh: 'The four pillars are Encapsulation (bundling data and methods, using private fields with public getters/setters), Inheritance (child class reuses parent behavior via extends), Polymorphism (method overriding and overloading), and Abstraction (hiding implementation details via abstract classes and interfaces).',
      answerLow: 'OOP has encapsulation, inheritance, polymorphism and abstraction. Encapsulation means keeping data private.',
    },
    {
      topic: 'Collections', difficulty: 'medium',
      text: 'What is the difference between HashMap and LinkedHashMap in Java? When would you use each?',
      keyPoints: ['LinkedHashMap preserves insertion order', 'HashMap has no guaranteed order', 'Both allow null keys/values'],
      missedPoints: ['Performance overhead of maintaining linked list in LinkedHashMap'],
      answerHigh: 'HashMap stores entries in a hash table with no guaranteed iteration order, offering O(1) average time for get/put. LinkedHashMap extends HashMap and maintains a doubly-linked list to preserve insertion order — useful for LRU caches or any case where iteration order matters.',
      answerLow: 'LinkedHashMap maintains insertion order while HashMap does not. I would use LinkedHashMap when I need ordered iteration.',
    },
    {
      topic: 'Exception Handling', difficulty: 'medium',
      text: 'Explain checked vs unchecked exceptions in Java. Provide examples and when to use each.',
      keyPoints: ['Checked exceptions extend Exception and must be declared', 'Unchecked extend RuntimeException', 'Use checked for recoverable external failures'],
      missedPoints: ['Multi-catch blocks', 'try-with-resources for AutoCloseable'],
      answerHigh: 'Checked exceptions (IOException, SQLException) must be declared in the method signature or caught — they represent conditions callers can reasonably recover from. Unchecked exceptions (NullPointerException, IllegalArgumentException) extend RuntimeException and indicate programming errors; catching them is usually wrong.',
      answerLow: 'Checked exceptions need try-catch. Unchecked exceptions like NullPointerException do not need to be declared.',
    },
    {
      topic: 'Spring Beans / DI', difficulty: 'hard',
      text: 'How does Spring\'s Dependency Injection work? Compare constructor vs field injection trade-offs.',
      keyPoints: ['Constructor injection makes dependencies explicit and immutable', 'Field injection uses @Autowired directly', 'IoC container manages bean lifecycle'],
      missedPoints: ['Circular dependency resolution with @Lazy', 'Bean scopes (singleton vs prototype)'],
      answerHigh: 'Spring\'s IoC container manages bean creation and wiring. Constructor injection passes dependencies via the constructor — dependencies are explicit, mandatory, and support immutability, which is why Spring recommends it. Field injection using @Autowired is convenient but hides dependencies and makes unit testing harder without a Spring context.',
      answerLow: 'Spring uses @Autowired to inject dependencies automatically. You can use constructor or field injection.',
    },
    {
      topic: 'Loops & Control Flow', difficulty: 'easy',
      text: 'What is the difference between Iterator and ListIterator in Java Collections?',
      keyPoints: ['ListIterator supports bidirectional traversal', 'Iterator is forward-only', 'ListIterator has add() and set() methods for mutation'],
      missedPoints: [],
      answerHigh: 'Iterator is the universal interface for forward-only traversal of any Collection, supporting hasNext(), next(), and remove(). ListIterator extends Iterator and is specific to List implementations — it supports backwards traversal via hasPrevious()/previous(), plus add() and set() to modify elements during iteration.',
      answerLow: 'Iterator goes forward only. ListIterator can go forward and backward through a list.',
    },
  ],
  python: [
    {
      topic: 'Data Structures', difficulty: 'easy',
      text: 'Explain the differences between list, tuple, and set in Python with their use cases.',
      keyPoints: ['List is mutable and ordered', 'Tuple is immutable and ordered', 'Set is unordered with unique elements, O(1) lookup'],
      missedPoints: ['frozenset', 'dict as hash map equivalent'],
      answerHigh: 'Lists are mutable ordered sequences — use them when elements need to change. Tuples are immutable ordered sequences — use them for fixed data or as dict keys. Sets are unordered unique-element collections ideal for membership testing (O(1)) and deduplication.',
      answerLow: 'Lists can be changed, tuples cannot. Sets only have unique elements and have no order.',
    },
    {
      topic: 'Functions & Closures', difficulty: 'medium',
      text: 'Explain Python decorators. Write a simple timing decorator as an example.',
      keyPoints: ['Decorator wraps a function to extend behavior', 'functools.wraps preserves __name__ and __doc__', 'Closures capture outer scope variables'],
      missedPoints: ['Class-based decorators', 'Decorator factories that accept arguments'],
      answerHigh: 'A decorator is a function that takes another function and returns a wrapper extending its behavior without modification. Example: `def timer(fn): @wraps(fn) def wrap(*a, **kw): t=time.time(); r=fn(*a,**kw); print(f\'{time.time()-t:.2f}s\'); return r; return wrap`. Using @wraps preserves the wrapped function\'s metadata.',
      answerLow: 'Decorators wrap functions using @decorator_name syntax to add behavior like logging or timing around a function.',
    },
    {
      topic: 'OOP Concepts', difficulty: 'hard',
      text: 'What is the Method Resolution Order (MRO) in Python? How does it resolve the diamond problem?',
      keyPoints: ['C3 linearization algorithm determines MRO', '__mro__ attribute to inspect order', 'super() follows MRO for consistent chaining'],
      missedPoints: [],
      answerHigh: 'Python uses C3 linearization to produce a consistent linear order of base classes that resolves the diamond problem — each class appears exactly once, and local precedence is respected. You can inspect it via `ClassName.__mro__`. super() always calls the next class in MRO, ensuring cooperative multiple inheritance.',
      answerLow: 'MRO determines the order Python searches for methods in class hierarchies. It prevents ambiguity in multiple inheritance.',
    },
    {
      topic: 'Standard Libraries', difficulty: 'medium',
      text: 'What is the difference between copy.copy() and copy.deepcopy()? When does the distinction matter?',
      keyPoints: ['Shallow copy references nested objects', 'Deep copy recursively duplicates all objects', 'Distinction matters when mutating nested mutable structures'],
      missedPoints: ['Custom __copy__/__deepcopy__ hooks', 'Performance: deepcopy can be slow on large graphs'],
      answerHigh: 'copy.copy() creates a new container but the nested objects (e.g., lists inside a list) are still shared references — mutating a nested object in the copy affects the original. copy.deepcopy() recursively duplicates everything, producing a fully independent copy. The difference matters for nested mutable structures like lists of lists or dicts with list values.',
      answerLow: 'deepcopy creates a completely independent copy. Shallow copy shares references to nested objects with the original.',
    },
    {
      topic: 'File Handling', difficulty: 'easy',
      text: 'How do context managers work in Python? How would you create a custom one?',
      keyPoints: ['with statement calls __enter__ on entry and __exit__ on exit', 'Cleanup runs even on exceptions', '@contextmanager from contextlib for generator-based ones'],
      missedPoints: [],
      answerHigh: 'Context managers implement __enter__ (called on with entry) and __exit__ (called on exit, even if an exception occurs). For simple cases, use @contextmanager from contextlib with a generator — code before yield is setup, code after is teardown. This makes them ideal for resource management: files, locks, DB connections.',
      answerLow: 'Context managers use the with statement. They automatically clean up resources via __enter__ and __exit__ methods.',
    },
  ],
  react: [
    {
      topic: 'Hooks', difficulty: 'easy',
      text: 'What are the Rules of Hooks in React? Why do they exist?',
      keyPoints: ['Only call hooks at the top level', 'Only call inside React function components or custom hooks', 'Ensures stable hook call order per render'],
      missedPoints: [],
      answerHigh: 'Two rules: (1) Only call hooks at the top level — never inside loops, conditions, or nested functions. (2) Only call hooks from React function components or custom hooks. These rules exist because React uses the call order to map state to each hook — if order changes between renders, state association breaks.',
      answerLow: 'Hooks can only be called at the top level of a component, not inside if statements or loops.',
    },
    {
      topic: 'State Management', difficulty: 'medium',
      text: 'When would you choose useReducer over useState? Give a practical example.',
      keyPoints: ['useReducer for complex state logic with multiple transitions', 'When next state depends on action type', 'Centralizes state transitions for testability'],
      missedPoints: ['Zustand/Jotai as alternatives for cross-component state'],
      answerHigh: 'useReducer is preferable when state has multiple related values or complex transition logic — e.g., a shopping cart with add/remove/clear/coupon actions. The reducer centralizes all transitions, making them predictable and independently testable. useState is simpler for independent scalar values.',
      answerLow: 'useReducer is better for complex state transitions. It takes a reducer function and initial state, and you dispatch actions to update state.',
    },
    {
      topic: 'Performance Optimization', difficulty: 'hard',
      text: 'Explain React.memo, useMemo, and useCallback. What are the risks of overusing them?',
      keyPoints: ['React.memo skips re-render when props unchanged', 'useMemo memoizes expensive computed values', 'useCallback memoizes function references for stable callbacks', 'Overuse adds memory overhead and complexity'],
      missedPoints: ['Use React DevTools Profiler before optimizing'],
      answerHigh: 'React.memo wraps a component to bail out of re-render when props are referentially unchanged. useMemo memoizes a computed value across renders. useCallback memoizes a function reference so it stays stable (useful when passing callbacks to memoized children). Risk: each hook adds memory and mental overhead — profile first, optimize only proven bottlenecks.',
      answerLow: 'useMemo and useCallback prevent unnecessary re-renders. React.memo wraps a component to skip rendering when props haven\'t changed.',
    },
    {
      topic: 'Components & Props', difficulty: 'medium',
      text: 'What is prop drilling and what are the recommended solutions in React?',
      keyPoints: ['Prop drilling passes data through many intermediate layers', 'Context API for truly global state', 'Component composition as a structural alternative'],
      missedPoints: ['Render props pattern'],
      answerHigh: 'Prop drilling is threading data through many components that don\'t use it, just to reach a deeply nested consumer. Solutions: (1) Context API — best for app-wide data like theme or auth. (2) Component composition — hoist the consumer and pass it via children. (3) State libraries (Zustand, Jotai) for complex shared state.',
      answerLow: 'Prop drilling is passing props through many levels. Context API or a state management library solves this.',
    },
    {
      topic: 'Routing', difficulty: 'easy',
      text: 'How does Next.js App Router routing differ from React Router? What are its key conventions?',
      keyPoints: ['File-system based routing via page.tsx files', 'Server components by default', 'Nested layouts with layout.tsx', 'No explicit Route components needed'],
      missedPoints: ['Parallel routes', 'Route interception'],
      answerHigh: 'Next.js App Router uses the file system — a page.tsx inside app/about/ creates /about automatically. Layout.tsx provides persistent nested layouts. Server components are the default, reducing client-side JS. React Router requires explicit JSX route configuration and runs on the client; Next.js also supports server-side rendering natively.',
      answerLow: 'Next.js uses file-based routing — you create folders and page.tsx files. React Router requires explicit route configuration in JSX.',
    },
  ],
  ai_ml: [
    {
      topic: 'Supervised Learning', difficulty: 'hard',
      text: 'Explain the bias-variance tradeoff. How do you diagnose and fix high bias or high variance?',
      keyPoints: ['High bias = underfitting, model too simple', 'High variance = overfitting, model memorizes training data', 'Cross-validation to diagnose', 'Regularization to reduce variance'],
      missedPoints: ['Ensemble methods (bagging reduces variance, boosting reduces bias)'],
      answerHigh: 'High bias means the model is too simple and underfits — fix by adding features, using a more complex model, or removing regularization. High variance means the model overfits training data — fix with L1/L2 regularization, dropout, early stopping, or more data. Cross-validation helps diagnose which problem you have by comparing train vs. validation error.',
      answerLow: 'High bias means underfitting, high variance means overfitting. Regularization helps with overfitting and adding more features helps with underfitting.',
    },
    {
      topic: 'Data Preprocessing', difficulty: 'easy',
      text: 'What are common strategies for handling missing values? When would you choose each approach?',
      keyPoints: ['Mean/median imputation for numerical', 'Mode for categorical', 'Drop rows/columns if missingness is high', 'Model-based imputation (KNN) when MCAR'],
      missedPoints: ['MICE multiple imputation', 'Missingness indicator variable when not MCAR'],
      answerHigh: 'For numerical: mean imputation for normally distributed data, median for skewed/outlier-heavy. For categorical: mode or a separate "Unknown" category. Drop columns with >50% missing; drop rows when missingness is random and the dataset is large. KNN or iterative imputation when missing values are correlated with other features.',
      answerLow: 'Fill missing numerical values with mean or median, categorical with mode. Sometimes just drop rows with missing data.',
    },
    {
      topic: 'Model Evaluation', difficulty: 'medium',
      text: 'When would you use F1 score over accuracy? Explain the precision-recall tradeoff.',
      keyPoints: ['Accuracy misleading on imbalanced classes', 'Precision = TP/(TP+FP)', 'Recall = TP/(TP+FN)', 'F1 is harmonic mean balancing both'],
      missedPoints: ['ROC-AUC as threshold-independent alternative', 'F-beta for asymmetric precision/recall importance'],
      answerHigh: 'Accuracy is misleading with class imbalance — predicting all negatives on a 1% positive class gets 99% accuracy. F1 is the harmonic mean of precision (how many predicted positives are actually positive) and recall (how many actual positives were detected). Use recall when missing positives is catastrophic (cancer detection); use precision when false alarms are costly (spam filters).',
      answerLow: 'F1 is better for imbalanced datasets. It balances precision and recall. Accuracy can be misleading when one class is rare.',
    },
    {
      topic: 'Neural Networks', difficulty: 'hard',
      text: 'Explain backpropagation. How does gradient descent use it to update weights?',
      keyPoints: ['Chain rule to compute gradients layer-by-layer', 'Error propagates backward from output', 'Optimizer updates weights: w = w − lr × gradient'],
      missedPoints: ['Vanishing/exploding gradients', 'Batch normalization as a mitigation'],
      answerHigh: 'Backpropagation applies the chain rule to compute the partial derivative of the loss with respect to every weight, propagating error signals from output to input layer. The optimizer (SGD, Adam) then updates each weight: w = w − lr × ∂L/∂w. Adam adds adaptive per-parameter learning rates and momentum, converging faster than plain SGD.',
      answerLow: 'Backpropagation calculates gradients by going backwards through the network using the chain rule. These gradients update the weights via gradient descent.',
    },
    {
      topic: 'NLP Basics', difficulty: 'easy',
      text: 'What is the difference between stemming and lemmatization? Which is more accurate and when would you prefer each?',
      keyPoints: ['Stemming is heuristic suffix-stripping, fast but imprecise', 'Lemmatization uses vocabulary/morphological analysis, more accurate', 'Use stemming when speed matters more than precision'],
      missedPoints: ['WordNet for lemmatization', 'Modern transformer tokenizers often bypass both'],
      answerHigh: 'Stemming heuristically chops suffixes (e.g., "running" → "run") and is fast but produces non-words ("better" stays "better"). Lemmatization uses vocabulary lookup to return the canonical base form ("better" → "good", "ran" → "run") and is more accurate but slower. Prefer stemming for search indexing at scale; lemmatization for higher-precision NLP tasks.',
      answerLow: 'Stemming removes suffixes to get a root word. Lemmatization uses a dictionary to get the actual base form and is more accurate.',
    },
  ],
  devops: [
    {
      topic: 'Docker & Containers', difficulty: 'easy',
      text: 'What is the difference between a Docker image and a container? How do layers work?',
      keyPoints: ['Image is an immutable layered read-only template', 'Container is a running instance with a writable layer', 'Copy-on-write: container layer only stores changes'],
      missedPoints: ['Multi-stage builds for smaller images', 'Image layer caching in CI/CD'],
      answerHigh: 'A Docker image is an immutable, layered filesystem built from a Dockerfile — each instruction adds a read-only layer. A container is a running instance of an image that adds a thin writable layer on top via copy-on-write, storing only changes. This makes containers lightweight and fast to start since they share the underlying image layers.',
      answerLow: 'An image is a blueprint and a container is a running instance. Images are read-only; containers have a writable layer on top.',
    },
    {
      topic: 'CI/CD Pipelines', difficulty: 'medium',
      text: 'Describe a typical CI/CD pipeline and its key principles.',
      keyPoints: ['Build → Test → Lint → Package → Deploy stages', 'Fast feedback loop', 'Environment promotion: dev → staging → prod', 'Idempotent, repeatable stages'],
      missedPoints: ['Rollback strategies', 'Blue-green or canary deployments'],
      answerHigh: 'A typical pipeline: trigger on push → build and install → unit and integration tests → lint/SAST → package artifact/Docker image → deploy to dev → promote to staging with E2E tests → gated prod deploy. Key principles: fail fast, keep pipeline under 10 minutes, make stages idempotent, and have automated rollback on failure.',
      answerLow: 'CI/CD pipelines have build, test, and deploy stages. Code is automatically tested on every commit and deployed to staging then production.',
    },
    {
      topic: 'Kubernetes', difficulty: 'hard',
      text: 'What is the difference between a Deployment and a StatefulSet in Kubernetes? When would you use each?',
      keyPoints: ['StatefulSet gives stable pod identities and ordered lifecycle', 'Each StatefulSet pod gets its own persistent volume', 'Deployments are for stateless, interchangeable pods'],
      missedPoints: ['DaemonSet for per-node workloads'],
      answerHigh: 'Deployments are for stateless apps — pods are interchangeable, scaling is simple, and rolling updates work smoothly. StatefulSets are for stateful workloads (databases, Kafka, ZooKeeper) where each pod needs a stable, unique network identity (e.g., mysql-0, mysql-1), ordered deployment/termination, and a per-pod persistent volume that survives rescheduling.',
      answerLow: 'StatefulSets are for stateful apps like databases, giving each pod a stable identity. Deployments are for stateless apps where pods are interchangeable.',
    },
    {
      topic: 'Linux & Shell', difficulty: 'medium',
      text: 'How would you debug a process consuming high CPU on a Linux production server?',
      keyPoints: ['top/htop to identify the offending process', 'strace -p <pid> for system calls', 'perf or flame graphs for profiling', 'Check application logs for errors'],
      missedPoints: ['eBPF-based tools like bpftrace', 'Container-specific: nsenter or kubectl exec'],
      answerHigh: 'Step 1: use top or htop to find the high-CPU PID and whether it\'s user or kernel time. Step 2: check /proc/<pid>/status and cmdline for context. Step 3: strace -p <pid> to observe system calls. Step 4: perf record + perf report or FlameGraph for profiling. Step 5: review application logs. Step 6: decide whether horizontal scaling buys time while debugging.',
      answerLow: 'Use top to find the high-CPU process, then check logs and use strace to trace its system calls.',
    },
    {
      topic: 'Cloud Basics', difficulty: 'easy',
      text: 'Explain vertical vs horizontal scaling. What are the trade-offs and which suits cloud-native apps?',
      keyPoints: ['Vertical = larger instance (more CPU/RAM)', 'Horizontal = more instances behind a load balancer', 'Horizontal has no single point of failure and scales linearly'],
      missedPoints: ['Auto-scaling groups', 'Cost comparison at scale'],
      answerHigh: 'Vertical scaling means upgrading to a larger machine — simple but has hardware limits and typically requires downtime. Horizontal scaling adds more instances behind a load balancer — no single point of failure, scales near-linearly with load, but requires stateless application design. Cloud-native apps are designed for horizontal scaling with auto-scaling groups that respond to demand automatically.',
      answerLow: 'Vertical means making the server bigger, horizontal means adding more servers. Horizontal is better for large-scale cloud applications.',
    },
  ],
};

const SCORE_OFFSETS = [0, -0.8, 1.2, -1.0, 0.5];

export function getMockDetail(sessionId: number): SessionDetail | null {
  const session = MOCK_SESSIONS.find(s => s.id === sessionId);
  if (!session) return null;

  const templates = DOMAIN_Q[session.domain] ?? DOMAIN_Q.java;
  const baseScore = session.technical_score;

  const questions: InterviewQuestion[] = templates.map((tpl, i) => {
    const rawScore = baseScore !== null
      ? Math.max(1, Math.min(10, parseFloat((baseScore + SCORE_OFFSETS[i]).toFixed(1))))
      : null;
    const isGood = rawScore !== null && rawScore >= 6.5;

    return {
      id: sessionId * 10 + i + 1,
      question_number: i + 1,
      topic: tpl.topic,
      question_text: tpl.text,
      difficulty: tpl.difficulty,
      answer_text: rawScore !== null ? (isGood ? tpl.answerHigh : tpl.answerLow) : null,
      technical_accuracy: rawScore,
      answer_feedback: rawScore !== null
        ? isGood
          ? `Good answer. Correctly covered: ${tpl.keyPoints.slice(0, 2).join(', ')}.${tpl.missedPoints.length > 0 ? ` Minor gap: ${tpl.missedPoints[0]}.` : ''}`
          : `Partially correct. Missed: ${[...tpl.missedPoints, ...tpl.keyPoints.slice(2)].slice(0, 2).join(', ')}.`
        : null,
      key_points_covered: rawScore !== null
        ? isGood ? tpl.keyPoints : tpl.keyPoints.slice(0, Math.ceil(tpl.keyPoints.length / 2))
        : [],
      key_points_missed: rawScore !== null
        ? isGood ? tpl.missedPoints : [...tpl.missedPoints, ...tpl.keyPoints.slice(Math.ceil(tpl.keyPoints.length / 2))]
        : [],
    };
  });

  const hasScores = session.overall_score !== null && session.technical_score !== null && session.communication_score !== null;
  const commScore = session.communication_score ?? 5;
  const techScore = session.technical_score ?? 5;
  const overallScore = session.overall_score ?? 5;
  const level = overallScore >= 7.5 ? 'high' : overallScore >= 5 ? 'medium' : 'low';

  const mults: Record<string, number[]> = {
    high: [0.95, 0.92, 0.88, 0.93, 0.90],
    medium: [0.88, 0.82, 0.79, 0.85, 0.83],
    low: [0.75, 0.70, 0.68, 0.72, 0.73],
  };
  const m = mults[level];

  const soft_skills: SoftSkillsEvaluation | null = hasScores ? {
    communication_clarity: parseFloat((commScore * m[0]).toFixed(1)),
    vocabulary_richness: parseFloat((commScore * m[1]).toFixed(1)),
    answer_structure: parseFloat((commScore * m[2]).toFixed(1)),
    confidence_level: parseFloat((commScore * m[3]).toFixed(1)),
    conciseness: parseFloat((commScore * m[4]).toFixed(1)),
    overall_communication: commScore,
    communication_feedback:
      level === 'high'
        ? `${session.candidate_name} demonstrated excellent communication throughout, presenting ideas clearly with appropriate technical vocabulary.`
        : level === 'medium'
        ? `${session.candidate_name} communicated adequately. There is room to improve answer structure and use more precise terminology.`
        : `${session.candidate_name} struggled to articulate technical concepts clearly. Significant improvement in communication is needed.`,
    strengths:
      level === 'high'
        ? ['Clear articulation of complex concepts', 'Strong technical vocabulary', 'Well-structured answers', 'Confident delivery']
        : level === 'medium'
        ? ['Shows underlying technical understanding', 'Generally coherent communication']
        : ['Willing to attempt all questions'],
    improvements:
      level === 'high'
        ? ['Include more concrete real-world examples']
        : level === 'medium'
        ? ['Improve answer structure', 'Use more precise technical terms', 'Build confidence in delivery']
        : ['Work on communication clarity', 'Practice structuring technical explanations', 'Build confidence', 'Review core domain concepts'],
  } : null;

  const report: EvaluationReport | null = hasScores ? {
    summary: `${session.candidate_name} completed the ${session.domain.toUpperCase()} technical interview covering ${session.topics.join(', ')}. Technical score: ${techScore.toFixed(1)}/10, Communication: ${commScore.toFixed(1)}/10. ${session.result === 'pass' ? 'Performance exceeded the hiring threshold, demonstrating solid domain knowledge.' : 'Performance fell below the required hiring threshold with notable gaps in core topics.'}`,
    recommendation:
      session.result === 'pass'
        ? `Recommend advancing ${session.candidate_name} to the next stage. They demonstrate solid ${session.domain} fundamentals and communicate well under interview conditions.`
        : `Not recommended for this role at this time. ${session.candidate_name} should strengthen foundations in ${session.topics.slice(0, 2).join(' and ')} before the next attempt.`,
    overall_score: overallScore,
    result: session.result ?? 'fail',
  } : null;

  return { ...session, questions, soft_skills, report };
}
