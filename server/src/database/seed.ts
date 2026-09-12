import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { getDatabase, initializeDatabase } from './db.js';

export interface CareerSeed {
  slug: string;
  title: string;
  category: string;
  description: string;
  education_level: string;
  min_experience: string;
  career_overview: string;
  day_to_day: string;
  salary_range: string;
  skills: {
    required: string[];
    preferred: string[];
  };
  interests: string[];
  resources: Array<{
    title: string;
    type: string;
    platform: string;
    url: string;
  }>;
  roadmap: Array<{
    period: string;
    focus: string;
    description?: string;
  }>;
  projects: Array<{
    title: string;
    description: string;
    difficulty: string;
    skills_practiced: string;
  }>;
}

export const CAREERS_DATA: CareerSeed[] = [
  {
    slug: 'data-analyst',
    title: 'Data Analyst',
    category: 'Data & Analytics',
    description: 'Transforms raw business and technical data into clear visual insights, executive dashboards, and actionable strategic recommendations.',
    education_level: 'B.Sc Computer Science, BCA, B.Tech, or quantitative degree',
    min_experience: 'Beginner',
    career_overview: 'Data Analysts examine large datasets to identify patterns, monitor key metrics, and communicate analytical findings to technical and business stakeholders.',
    day_to_day: 'Writing SQL queries, cleaning tabular data in Python/Excel, building visual dashboards, and preparing analytical reports.',
    salary_range: '₹4,00,000 - ₹9,50,000 per annum (Entry to Mid)',
    skills: {
      required: ['Python', 'SQL', 'Excel'],
      preferred: ['Power BI', 'Pandas', 'Statistics', 'Tableau']
    },
    interests: ['Data & Analytics'],
    resources: [
      { title: 'Kaggle Python & Pandas Micro-Courses', type: 'Interactive Course', platform: 'Kaggle', url: 'https://www.kaggle.com/learn' },
      { title: 'freeCodeCamp Data Analysis with Python', type: 'Comprehensive Course', platform: 'freeCodeCamp', url: 'https://www.freecodecamp.org/learn/data-analysis-with-python/' },
      { title: 'Mode Analytics SQL Tutorial', type: 'Interactive Tutorial', platform: 'Mode Analytics', url: 'https://mode.com/sql-tutorial/' }
    ],
    roadmap: [
      { period: 'Month 1', focus: 'Python Basics, Data Types & Computational Math' },
      { period: 'Month 2', focus: 'Relational SQL & Exploratory Data Analysis (EDA)' },
      { period: 'Month 3', focus: 'Data Cleaning with Pandas & Statistical Aggregations' },
      { period: 'Month 4', focus: 'Interactive Business Dashboards in Power BI / Tableau' },
      { period: 'Month 5', focus: 'Portfolio Case Studies & Business Presentation Decks' }
    ],
    projects: [
      { title: 'Executive Retail Sales & Revenue Dashboard', description: 'Analyze seasonal revenue trends, profit margins, and KPI metrics across product categories.', difficulty: 'Beginner', skills_practiced: 'SQL, Excel, Power BI' },
      { title: 'Customer Retention & Cohort Analysis', description: 'Perform month-over-month cohort retention calculation on e-commerce transaction records.', difficulty: 'Intermediate', skills_practiced: 'Python, Pandas, SQL' },
      { title: 'E-Commerce Product Pricing Tracker', description: 'Scrape, clean, and visualize price fluctuations to recommend competitive pricing thresholds.', difficulty: 'Intermediate', skills_practiced: 'Python, Pandas, Matplotlib' },
      { title: 'Healthcare Patient Stay & Cost Analysis', description: 'Model hospital admission data to uncover primary cost drivers and length-of-stay correlations.', difficulty: 'Advanced', skills_practiced: 'Statistics, SQL, Tableau' },
      { title: 'Financial Budgeting & Spending Insights', description: 'Build an automated personal finance categorization tool that detects recurring subscription spikes.', difficulty: 'Beginner', skills_practiced: 'Python, Excel' }
    ]
  },
  {
    slug: 'web-developer',
    title: 'Web Developer',
    category: 'Web Development',
    description: 'Builds and maintains responsive, accessible, and fast websites and web interfaces that serve users across desktop and mobile devices.',
    education_level: 'BCA, B.Sc Computer Science, B.Tech, or equivalent practical skills',
    min_experience: 'Beginner',
    career_overview: 'Web Developers translate design wireframes and business logic into functional web interfaces, implementing user navigation, interactive components, and responsive layouts.',
    day_to_day: 'Authoring semantic HTML, modern CSS styling, DOM manipulation with vanilla JavaScript, and integrating backend REST endpoints.',
    salary_range: '₹3,50,000 - ₹8,50,000 per annum (Entry to Mid)',
    skills: {
      required: ['HTML', 'CSS', 'JavaScript'],
      preferred: ['Git', 'REST APIs', 'Responsive Design']
    },
    interests: ['Web Development', 'Software Development'],
    resources: [
      { title: 'MDN Web Docs — Learn Web Development', type: 'Official Documentation', platform: 'MDN Mozilla', url: 'https://developer.mozilla.org/en-US/docs/Learn' },
      { title: 'The Odin Project — Foundations', type: 'Hands-on Curriculum', platform: 'The Odin Project', url: 'https://www.theodinproject.com/' },
      { title: 'web.dev Learn CSS & Responsive Design', type: 'Interactive Guide', platform: 'Google web.dev', url: 'https://web.dev/learn/css' }
    ],
    roadmap: [
      { period: 'Month 1-2', focus: 'Semantic HTML5, Modern CSS3 & Responsive Flex/Grid' },
      { period: 'Month 3-4', focus: 'Vanilla JavaScript ES6+, DOM Manipulation & Fetch API' },
      { period: 'Month 5-6', focus: 'Version Control (Git/GitHub) & Clean Web Design' },
      { period: 'Month 7-8', focus: 'Backend Integration with REST APIs & Database' },
      { period: 'Month 9+', focus: 'Full-Stack Project Deployments on Free Cloud Tiers' }
    ],
    projects: [
      { title: 'Personal Developer Portfolio with Light/Dark Mode', description: 'Showcase projects with semantic tags, responsive layouts, and accessible keyboard navigation.', difficulty: 'Beginner', skills_practiced: 'HTML5, CSS3, JavaScript' },
      { title: 'Interactive Recipe & Meal Planner Web App', description: 'Filter recipes by ingredients, calculate dietary totals, and save favorites to localStorage.', difficulty: 'Intermediate', skills_practiced: 'JavaScript, REST APIs, CSS Grid' },
      { title: 'Real-Time Weather & Air Quality Dashboard', description: 'Fetch geolocated meteorological metrics from OpenWeatherMap API with visual gauges.', difficulty: 'Intermediate', skills_practiced: 'Fetch API, Async JS, SVG' },
      { title: 'Campus Event Ticket Booking Portal', description: 'Browse club events, select seats, and validate registration forms with accessible feedback.', difficulty: 'Advanced', skills_practiced: 'Full Stack Web, Form Validation' },
      { title: 'Student Study Productivity & Habit Tracker', description: 'Kanban-style task board with milestone streaks and data persistence.', difficulty: 'Intermediate', skills_practiced: 'DOM API, State Management' }
    ]
  },
  {
    slug: 'frontend-engineer',
    title: 'Frontend Engineer',
    category: 'Web Development',
    description: 'Architects high-performance user interfaces, state management systems, and dynamic client-side web applications with emphasis on accessibility and performance.',
    education_level: 'BCA, B.Sc Computer Science, B.Tech Computer Science',
    min_experience: 'Beginner',
    career_overview: 'Frontend Engineers focus on client-side software engineering, optimizing rendering speed, state persistence, modular architecture, and modern browser APIs.',
    day_to_day: 'Designing component architectures, handling asynchronous API data, implementing design systems, and auditing web accessibility (WCAG).',
    salary_range: '₹4,50,000 - ₹11,00,000 per annum (Entry to Mid)',
    skills: {
      required: ['HTML', 'CSS', 'JavaScript', 'TypeScript'],
      preferred: ['Git', 'REST APIs', 'Performance Optimization', 'Responsive Design']
    },
    interests: ['Web Development', 'UI/UX Design'],
    resources: [
      { title: 'TypeScript Handbook & Documentation', type: 'Official Manual', platform: 'TypeScriptLang', url: 'https://www.typescriptlang.org/docs/' },
      { title: 'JavaScript.info — The Modern JavaScript Tutorial', type: 'Deep Dive Guide', platform: 'JavaScript.info', url: 'https://javascript.info/' },
      { title: 'W3C Web Accessibility Initiative (WAI)', type: 'Standard Specifications', platform: 'W3C WAI', url: 'https://www.w3.org/WAI/' }
    ],
    roadmap: [
      { period: 'Month 1-2', focus: 'Advanced Modern CSS, Animations & Web Accessibility' },
      { period: 'Month 3-4', focus: 'TypeScript Foundations & Type-Safe Architecture' },
      { period: 'Month 5-6', focus: 'Component Design Systems & Responsive Layouts' },
      { period: 'Month 7-8', focus: 'Client State Management & Web Performance Auditing' },
      { period: 'Month 9+', focus: 'Build Production-Ready Web Applications & Open Source' }
    ],
    projects: [
      { title: 'Component Design System Documentation Portal', description: 'Create a reusable UI library with buttons, modals, badges, and code snippets.', difficulty: 'Intermediate', skills_practiced: 'TypeScript, React/Web Components, CSS' },
      { title: 'Interactive Financial Crypto/Stock Dashboard', description: 'High-frequency charting, websocket real-time ticker updates, and responsive filters.', difficulty: 'Advanced', skills_practiced: 'TypeScript, Charting, Performance' },
      { title: 'Collaborative Kanban Task Management Board', description: 'Drag-and-drop workflow lanes, tag filtering, and undo/redo state management.', difficulty: 'Intermediate', skills_practiced: 'HTML5 Drag & Drop, State, TypeScript' },
      { title: 'Accessible Audio Streaming Web Interface', description: 'Audio player meeting WCAG AAA color contrast, keyboard shortcuts, and screen-reader support.', difficulty: 'Intermediate', skills_practiced: 'Accessibility, Web Audio API' },
      { title: 'Markdown Documentation Reader with Live Preview', description: 'Client-side markdown syntax parser with syntax highlighting and table of contents generation.', difficulty: 'Beginner', skills_practiced: 'TypeScript, Regular Expressions' }
    ]
  },
  {
    slug: 'backend-developer',
    title: 'Backend Developer',
    category: 'Software Development',
    description: 'Develops server-side logic, database persistence layers, APIs, authentication, and background task pipelines powering web applications.',
    education_level: 'B.Sc Computer Science, BCA, B.Tech Computer Science',
    min_experience: 'Beginner',
    career_overview: 'Backend Developers manage data flow between the server and users, designing reliable schemas, securing endpoints, and ensuring high service availability.',
    day_to_day: 'Writing API routes in Python/Flask/Node, designing SQL schemas, optimizing query latency, and managing containerized server environments.',
    salary_range: '₹4,50,000 - ₹11,50,000 per annum (Entry to Mid)',
    skills: {
      required: ['Python', 'SQL', 'REST APIs'],
      preferred: ['Git', 'Docker', 'Linux', 'Relational Database Design']
    },
    interests: ['Software Development', 'Web Development'],
    resources: [
      { title: 'Official Flask Documentation & Tutorials', type: 'Official Guide', platform: 'Pallets Projects', url: 'https://flask.palletsprojects.com/' },
      { title: 'Real Python Backend Architecture Roadmaps', type: 'Tutorial Library', platform: 'Real Python', url: 'https://realpython.com/' },
      { title: 'PostgreSQL Official Documentation & Best Practices', type: 'Database Reference', platform: 'PostgreSQL.org', url: 'https://www.postgresql.org/docs/' }
    ],
    roadmap: [
      { period: 'Month 1-2', focus: 'Server Architecture, OOP & File I/O' },
      { period: 'Month 3-4', focus: 'Relational Database Design & SQL Optimization' },
      { period: 'Month 5-6', focus: 'REST API Architecture, JWT Auth & Input Validation' },
      { period: 'Month 7-8', focus: 'Authentication, Security Headers & Docker Containers' },
      { period: 'Month 9+', focus: 'Deploy Resilient Microservices & API Documentation' }
    ],
    projects: [
      { title: 'RESTful E-Commerce Inventory & Order API', description: 'ACID transaction handling, inventory reservation, and payment webhook processing.', difficulty: 'Intermediate', skills_practiced: 'SQL, REST APIs, Authentication' },
      { title: 'Secure User Authentication & Session Service', description: 'JWT tokens, bcrypt password hashing, refresh token rotation, and rate limiting.', difficulty: 'Intermediate', skills_practiced: 'Security, JWT, Express/Flask' },
      { title: 'Automated PDF Invoicing & Email Worker', description: 'Asynchronous task queue generating PDF receipts and emailing dispatch notifications.', difficulty: 'Advanced', skills_practiced: 'Background Workers, File I/O' },
      { title: 'Rate-Limited URL Shortener with Analytics', description: 'Custom hashing, redirect telemetry, IP geolocation logging, and sliding-window rate limits.', difficulty: 'Beginner', skills_practiced: 'Database Indexing, REST APIs' },
      { title: 'Student Course Registration & Grading API', description: 'Prerequisite checking rules, GPA computation engine, and role-based access control.', difficulty: 'Intermediate', skills_practiced: 'Relational Database Design, RBAC' }
    ]
  },
  {
    slug: 'full-stack-developer',
    title: 'Full Stack Developer',
    category: 'Software Development',
    description: 'Bridges frontend user experiences with robust backend APIs and databases to deliver complete end-to-end software solutions.',
    education_level: 'B.Sc Computer Science, BCA, B.Tech Computer Science',
    min_experience: '1–2 Years',
    career_overview: 'Full Stack Developers understand the complete web ecosystem, from client rendering in the browser to database transactions and server deployment.',
    day_to_day: 'Implementing full features across frontend views and backend controllers, testing integration points, and monitoring deployment pipelines.',
    salary_range: '₹5,00,000 - ₹13,00,000 per annum (Entry to Mid)',
    skills: {
      required: ['HTML', 'CSS', 'JavaScript', 'Python', 'SQL'],
      preferred: ['REST APIs', 'Git', 'Docker', 'Linux']
    },
    interests: ['Software Development', 'Web Development'],
    resources: [
      { title: 'Full Stack Open (University of Helsinki)', type: 'University Course', platform: 'Full Stack Open', url: 'https://fullstackopen.com/en/' },
      { title: 'roadmap.sh Full Stack Developer Roadmap', type: 'Curriculum Roadmap', platform: 'roadmap.sh', url: 'https://roadmap.sh/full-stack' }
    ],
    roadmap: [
      { period: 'Month 1-2', focus: 'Frontend Foundations (HTML5, CSS3, JavaScript ES6+)' },
      { period: 'Month 3-4', focus: 'Backend APIs & Data Modeling' },
      { period: 'Month 5-6', focus: 'Relational Database Integration & Index Optimization' },
      { period: 'Month 7-8', focus: 'End-to-End Integration, Authentication & Git CI/CD' },
      { period: 'Month 9+', focus: 'Deploy Scalable SaaS Applications with Monorepo' }
    ],
    projects: [
      { title: 'Full-Stack Job Board & Application Tracker', description: 'Role filtering, applicant status tracking, resume attachment, and email alert triggers.', difficulty: 'Advanced', skills_practiced: 'Full Stack Web, SQL, Authentication' },
      { title: 'Student Mentorship Booking Platform', description: 'Calendar time slot scheduling, mentor bios, and video call link generation.', difficulty: 'Intermediate', skills_practiced: 'React, Node/Flask, Relational DB' },
      { title: 'Expense Splitting & Budget Management App', description: 'Group debt settlement algorithm with itemized bill uploads and exportable reports.', difficulty: 'Intermediate', skills_practiced: 'Algorithms, Full Stack' },
      { title: 'Campus Discussion Forum & Knowledge Base', description: 'Nested comment threads, markdown post editor, upvoting, and category tagging.', difficulty: 'Intermediate', skills_practiced: 'REST APIs, State, Database' },
      { title: 'Real-Time Collaborative Notes Workspace', description: 'Shared document editing, autosave state synchronization, and version history.', difficulty: 'Advanced', skills_practiced: 'WebSockets, Concurrency' }
    ]
  },
  {
    slug: 'data-scientist',
    title: 'Data Scientist',
    category: 'Data & Analytics',
    description: 'Applies statistical modeling, predictive analytics, and machine learning to uncover deep insights and build intelligent automated solutions.',
    education_level: 'B.Sc Computer Science, B.Tech, BCA with strong mathematics/statistics background',
    min_experience: 'Beginner',
    career_overview: 'Data Scientists combine computer science with statistics to formulate hypotheses, clean complex datasets, train predictive models, and validate experimental results.',
    day_to_day: 'Exploratory data analysis, feature engineering, training statistical classifiers, writing Python notebooks, and presenting evidence-based findings.',
    salary_range: '₹6,00,000 - ₹15,00,000 per annum (Entry to Mid)',
    skills: {
      required: ['Python', 'SQL', 'Statistics', 'Machine Learning'],
      preferred: ['Pandas', 'Data Visualization', 'Git']
    },
    interests: ['Data & Analytics', 'Artificial Intelligence'],
    resources: [
      { title: 'Scikit-Learn Machine Learning in Python', type: 'Official Library Guide', platform: 'Scikit-Learn', url: 'https://scikit-learn.org/stable/user_guide.html' },
      { title: 'Fast.ai Practical Data Science & Deep Learning', type: 'Open Courseware', platform: 'Fast.ai', url: 'https://course.fast.ai/' },
      { title: 'StatQuest with Josh Starmer — Foundations', type: 'Statistical Visuals', platform: 'StatQuest', url: 'https://statquest.org/' }
    ],
    roadmap: [
      { period: 'Month 1', focus: 'Python for Data Science, Linear Algebra & Probability' },
      { period: 'Month 2', focus: 'SQL Queries, Data Cleaning & Exploratory Analysis' },
      { period: 'Month 3', focus: 'Supervised & Unsupervised Machine Learning Algorithms' },
      { period: 'Month 4', focus: 'Deep Learning Foundations, Evaluation Metrics & Cross-Validation' },
      { period: 'Month 5', focus: 'Portfolio Capstone Projects & Production Inference' }
    ],
    projects: [
      { title: 'House Price Prediction Model', description: 'Multivariate regression with regularized ridge/lasso penalization and outlier trimming.', difficulty: 'Intermediate', skills_practiced: 'Python, Scikit-Learn, Statistics' },
      { title: 'Customer Churn Analysis & Prevention', description: 'Random forest classification predicting customer churn probability based on usage telemetry.', difficulty: 'Intermediate', skills_practiced: 'Machine Learning, Pandas, EDA' },
      { title: 'Fake News Detector with NLP', description: 'TF-IDF text vectorization and logistic regression classifying misleading news articles.', difficulty: 'Intermediate', skills_practiced: 'NLP, Scikit-Learn, Text Preprocessing' },
      { title: 'Stock Market Forecaster with Time Series', description: 'ARIMA and LSTM forecasting models assessing historical equity pricing volatility.', difficulty: 'Advanced', skills_practiced: 'Time Series, Statistics, Python' },
      { title: 'Content-Based Movie Recommendation Engine', description: 'Cosine similarity matrix evaluating user genre preferences and rating history.', difficulty: 'Beginner', skills_practiced: 'Python, Math, Matrix Operations' }
    ]
  },
  {
    slug: 'machine-learning-engineer',
    title: 'Machine Learning Engineer',
    category: 'Artificial Intelligence',
    description: 'Designs, trains, deploys, and monitors production machine learning pipelines and scalable model inference services.',
    education_level: 'B.Tech Computer Science, B.Sc Computer Science, or equivalent',
    min_experience: '1–2 Years',
    career_overview: 'Machine Learning Engineers take research models and turn them into scalable, real-time software systems with automated retraining and low latency inference.',
    day_to_day: 'Building data ingestion pipelines, training deep learning neural nets, containerizing model artifacts, and monitoring inference drift in production.',
    salary_range: '₹6,50,000 - ₹16,50,000 per annum (Entry to Mid)',
    skills: {
      required: ['Python', 'Machine Learning', 'Git'],
      preferred: ['Deep Learning', 'Docker', 'Linux', 'REST APIs']
    },
    interests: ['Artificial Intelligence', 'Software Development'],
    resources: [
      { title: 'Google Machine Learning Crash Course', type: 'Interactive Course', platform: 'Google Developers', url: 'https://developers.google.com/machine-learning/crash-course' },
      { title: 'PyTorch Official Tutorials & Deep Learning', type: 'Official Documentation', platform: 'PyTorch.org', url: 'https://pytorch.org/tutorials/' }
    ],
    roadmap: [
      { period: 'Month 1-2', focus: 'Python, Linear Algebra & Multivariable Calculus Basics' },
      { period: 'Month 3-4', focus: 'Data Processing with NumPy, Pandas & Data Visualization' },
      { period: 'Month 5-6', focus: 'Classical ML (Regression, Trees, Clustering) with Scikit-Learn' },
      { period: 'Month 7-8', focus: 'Neural Networks & Deep Learning with PyTorch' },
      { period: 'Month 9+', focus: 'ML Model Containerization & API Deployment (MLOps)' }
    ],
    projects: [
      { title: 'Real Estate Price Prediction Service', description: 'Containerized inference API serving real-time valuation predictions from trained models.', difficulty: 'Intermediate', skills_practiced: 'Python, Docker, REST APIs' },
      { title: 'Credit Card Fraud Detection Classifier', description: 'Handling severe class imbalance using SMOTE and precision-recall threshold tuning.', difficulty: 'Advanced', skills_practiced: 'Scikit-Learn, Imbalanced Data' },
      { title: 'Medical Image Pneumonia Detection Model', description: 'Convolutional neural network (ResNet) detecting anomalies in chest X-ray scans.', difficulty: 'Advanced', skills_practiced: 'PyTorch, Computer Vision' },
      { title: 'Customer Sentiment Analysis on Reviews', description: 'Fine-tuned Transformer model processing multilingual sentiment classification.', difficulty: 'Intermediate', skills_practiced: 'Hugging Face, NLP, PyTorch' },
      { title: 'Automated Plant Disease Classifier', description: 'Mobile-friendly lightweight MobileNet model identifying agricultural foliage disease.', difficulty: 'Intermediate', skills_practiced: 'Edge ML, PyTorch' }
    ]
  },
  {
    slug: 'cyber-security-analyst',
    title: 'Cyber Security Analyst',
    category: 'Cyber Security',
    description: 'Protects organizational networks, systems, and sensitive data from cyber threats, unauthorized access, and security breaches.',
    education_level: 'B.Sc Computer Science, BCA, B.Tech, or IT Security certifications',
    min_experience: 'Beginner',
    career_overview: 'Cyber Security Analysts monitor telemetry across firewalls and endpoints, audit vulnerabilities, assess risks, and respond promptly to security incidents.',
    day_to_day: 'Analyzing security logs, conducting vulnerability scans, configuring access controls, and documenting incident remediation procedures.',
    salary_range: '₹4,50,000 - ₹11,00,000 per annum (Entry to Mid)',
    skills: {
      required: ['Networking', 'Linux', 'Cyber Security Fundamentals'],
      preferred: ['Python', 'Security Auditing', 'Git']
    },
    interests: ['Cyber Security'],
    resources: [
      { title: 'OWASP Top 10 Web Application Security Risks', type: 'Industry Standard', platform: 'OWASP Foundation', url: 'https://owasp.org/www-project-top-ten/' },
      { title: 'TryHackMe Pre-Security & SOC Level 1 Path', type: 'Hands-on Practice Labs', platform: 'TryHackMe', url: 'https://tryhackme.com/' },
      { title: 'CISA Cybersecurity Basics & Training', type: 'Government Best Practices', platform: 'CISA', url: 'https://www.cisa.gov/resources-tools' }
    ],
    roadmap: [
      { period: 'Month 1-2', focus: 'Computer Networking Foundations (TCP/IP, DNS, Subnets)' },
      { period: 'Month 3-4', focus: 'Linux System Administration & Command-Line Tools' },
      { period: 'Month 5-6', focus: 'Network Traffic Analysis with Wireshark & Nmap' },
      { period: 'Month 7-8', focus: 'Vulnerability Assessment & OWASP Top 10 Web Security' },
      { period: 'Month 9+', focus: 'SOC Telemetry Triage, SIEM Logs & Incident Response' }
    ],
    projects: [
      { title: 'Network Packet Sniffer & Port Scanner in Python', description: 'Socket-level packet parser inspecting TCP headers and reporting open listener ports.', difficulty: 'Intermediate', skills_practiced: 'Networking, Python, Sockets' },
      { title: 'Web Application Vulnerability Scanner (OWASP Top 10)', description: 'Automated crawler detecting missing CSP headers, SQLi patterns, and reflected XSS.', difficulty: 'Advanced', skills_practiced: 'Security Auditing, Python' },
      { title: 'Log Analysis & Intrusion Detection Script', description: 'Analyze web server auth logs for brute-force patterns and automatically block suspicious IPs.', difficulty: 'Intermediate', skills_practiced: 'Linux, Regular Expressions, Python' },
      { title: 'Secure Password Manager with Cryptographic Hashing', description: 'AES-GCM encryption vault protecting credentials with PBKDF2 key derivation.', difficulty: 'Intermediate', skills_practiced: 'Cryptography, Cyber Security' },
      { title: 'Automated SSH Brute-Force Detector & IP Banner', description: 'Daemon monitoring failed system logins and generating firewall iptables ban rules.', difficulty: 'Intermediate', skills_practiced: 'Linux, Bash, Networking' }
    ]
  },
  {
    slug: 'information-security-specialist',
    title: 'Information Security Specialist',
    category: 'Cyber Security',
    description: 'Formulates enterprise information security policies, cryptographic standards, access controls, and regulatory compliance protocols.',
    education_level: 'B.Tech Computer Science, B.Sc Computer Science, BCA',
    min_experience: '1–2 Years',
    career_overview: 'Information Security Specialists create governance frameworks, oversee audit trails, manage identity federation, and evaluate organizational risk profiles.',
    day_to_day: 'Reviewing security architecture designs, configuring cryptographic keys, auditing permissions, and ensuring adherence to privacy regulations.',
    salary_range: '₹5,50,000 - ₹13,50,000 per annum (Entry to Mid)',
    skills: {
      required: ['Networking', 'Cyber Security Fundamentals', 'Security Auditing'],
      preferred: ['Linux', 'Python', 'Relational Database Design']
    },
    interests: ['Cyber Security'],
    resources: [
      { title: 'NIST Cybersecurity Framework (CSF 2.0)', type: 'Standard Framework', platform: 'NIST.gov', url: 'https://www.nist.gov/cyberframework' },
      { title: 'Cybrary Open Security Fundamentals', type: 'Video Modules', platform: 'Cybrary', url: 'https://www.cybrary.it/' }
    ],
    roadmap: [
      { period: 'Month 1-2', focus: 'Security Architecture & Network Hardening' },
      { period: 'Month 3-4', focus: 'Enterprise Identity, Access Management & Cryptography' },
      { period: 'Month 5-6', focus: 'Risk Assessments & Security Framework Compliance' },
      { period: 'Month 7-8', focus: 'Incident Response Playbooks & Forensics Foundations' },
      { period: 'Month 9+', focus: 'Enterprise Security Strategy & Vendor Audits' }
    ],
    projects: [
      { title: 'Enterprise Access Control & RBAC Matrix', description: 'Role-based authorization matrix mapping user entitlements to least privilege access.', difficulty: 'Intermediate', skills_practiced: 'Security Auditing, Compliance' },
      { title: 'PKI Certificate Authority Simulation', description: 'Generate self-signed X.509 root certificates, issue client credentials, and verify CRLs.', difficulty: 'Advanced', skills_practiced: 'Cryptography, Linux' },
      { title: 'Compliance Gap Analysis Dashboard', description: 'Audit checklist tracking organization security readiness against ISO 27001 controls.', difficulty: 'Intermediate', skills_practiced: 'Audit Controls, Excel/Web' },
      { title: 'Incident Response Playbook Generator', description: 'Interactive decision tree guiding triage of phishing, ransomware, and credential leakage.', difficulty: 'Beginner', skills_practiced: 'Incident Handling, Documentation' },
      { title: 'Third-Party Vendor Risk Assessment Tool', description: 'Standardized questionnaire evaluating third-party software supply chain security posture.', difficulty: 'Intermediate', skills_practiced: 'Risk Assessment' }
    ]
  },
  {
    slug: 'cloud-devops-engineer',
    title: 'Cloud / DevOps Engineer',
    category: 'Cloud & Infrastructure',
    description: 'Automates cloud infrastructure provisioning, CI/CD pipelines, container orchestration, and server reliability monitoring.',
    education_level: 'B.Sc Computer Science, BCA, B.Tech Computer Science',
    min_experience: 'Beginner',
    career_overview: 'Cloud / DevOps Engineers ensure software moves seamlessly from a developer machine to high-availability cloud infrastructure with zero downtime.',
    day_to_day: 'Configuring Docker containers, managing Linux virtual machines, writing automated CI/CD workflows, and tuning system observability.',
    salary_range: '₹5,00,000 - ₹14,00,000 per annum (Entry to Mid)',
    skills: {
      required: ['Linux', 'Cloud Fundamentals', 'Git', 'Docker'],
      preferred: ['Python', 'Networking', 'REST APIs']
    },
    interests: ['Cloud Computing', 'Software Development'],
    resources: [
      { title: 'Linux Foundation — Introduction to Linux', type: 'Foundation Course', platform: 'edX / Linux Foundation', url: 'https://www.edx.org/learn/linux' },
      { title: 'Docker Official Getting Started Guide', type: 'Official Documentation', platform: 'Docker Docs', url: 'https://docs.docker.com/get-started/' },
      { title: 'AWS Cloud Practitioner Free Essentials', type: 'Self-Paced Training', platform: 'AWS Skill Builder', url: 'https://explore.skillbuilder.aws/' }
    ],
    roadmap: [
      { period: 'Month 1-2', focus: 'Linux Server Administration & Bash Scripting' },
      { period: 'Month 3-4', focus: 'Git Version Control & Containerization with Docker' },
      { period: 'Month 5-6', focus: 'Cloud Fundamentals (AWS / Google Cloud Essentials)' },
      { period: 'Month 7-8', focus: 'Automated CI/CD Pipelines with GitHub Actions' },
      { period: 'Month 9+', focus: 'Infrastructure as Code & Kubernetes Cluster Orchestration' }
    ],
    projects: [
      { title: 'Automated Multi-Stage Docker Build for Web App', description: 'Produce minimal attack-surface distroless production container images.', difficulty: 'Beginner', skills_practiced: 'Docker, Linux' },
      { title: 'Zero-Downtime CI/CD Pipeline on GitHub Actions', description: 'Run automated linting, test suites, and deploy to cloud storage upon git push.', difficulty: 'Intermediate', skills_practiced: 'CI/CD, Git, Automation' },
      { title: 'Cloud Infrastructure Auto-Deployment Script', description: 'Provision virtual networks, compute instances, and firewall rules declaratively.', difficulty: 'Intermediate', skills_practiced: 'Cloud Fundamentals, Bash' },
      { title: 'Prometheus & Grafana Server Monitoring Setup', description: 'Collect CPU, memory, and network throughput telemetry with alert notifications.', difficulty: 'Intermediate', skills_practiced: 'Observability, Linux' },
      { title: 'Static Website CDN & SSL Auto-Provisioning', description: 'Deploy global edge distribution with automated Let\'s Encrypt TLS certificates.', difficulty: 'Beginner', skills_practiced: 'Networking, Cloud' }
    ]
  },
  {
    slug: 'database-administrator',
    title: 'Database Administrator (DBA)',
    category: 'Data & Analytics',
    description: 'Maintains database integrity, performance indexing, high-availability replication, and disaster recovery backup systems.',
    education_level: 'BCA, B.Sc Computer Science, B.Tech Computer Science',
    min_experience: 'Beginner',
    career_overview: 'Database Administrators ensure organizational data stores are protected against hardware failure, fast during peak traffic, and strictly access-controlled.',
    day_to_day: 'Designing schemas, tuning query execution plans, executing automated daily backups, and implementing role-based access security.',
    salary_range: '₹4,50,000 - ₹12,00,000 per annum (Entry to Mid)',
    skills: {
      required: ['SQL', 'Relational Database Design'],
      preferred: ['Linux', 'Python', 'Excel']
    },
    interests: ['Data & Analytics', 'Software Development'],
    resources: [
      { title: 'PostgreSQL Official Database Manual', type: 'Official Manual', platform: 'PostgreSQL.org', url: 'https://www.postgresql.org/docs/current/' },
      { title: 'Use The Index, Luke! A Guide to Database Performance', type: 'Technical Guide', platform: 'Use The Index, Luke', url: 'https://use-the-index-luke.com/' }
    ],
    roadmap: [
      { period: 'Month 1-2', focus: 'Advanced SQL, Subqueries, Joins & Aggregations' },
      { period: 'Month 3-4', focus: 'Schema Normalization (1NF to 3NF) & Constraints' },
      { period: 'Month 5-6', focus: 'B-Tree Indexing, Query Plan Analysis (EXPLAIN)' },
      { period: 'Month 7-8', focus: 'Database Backups, Point-in-Time Recovery & Security' },
      { period: 'Month 9+', focus: 'Replication, Sharding & High-Availability Clustering' }
    ],
    projects: [
      { title: 'Automated Database Backup & Restore Verifier', description: 'Cron script performing encrypted daily dumps and testing restore integrity in sandbox.', difficulty: 'Intermediate', skills_practiced: 'SQL, Linux, Shell Scripting' },
      { title: 'Query Performance Tuning & Index Benchmark', description: 'Analyze slow query logs, evaluate query plans with EXPLAIN ANALYZE, and add covering indexes.', difficulty: 'Intermediate', skills_practiced: 'SQL Indexing, Performance' },
      { title: 'Hospital Management Normalized Schema', description: 'Design 3NF relational database schema handling appointments, prescriptions, and billing.', difficulty: 'Beginner', skills_practiced: 'Relational Database Design' },
      { title: 'Role-Based Database Access Control Audit', description: 'Implement least-privilege database user permissions, row-level security, and audit triggers.', difficulty: 'Intermediate', skills_practiced: 'Security, SQL' },
      { title: 'Data Migration & ETL Validation Pipeline', description: 'Migrate legacy CSV datasets into PostgreSQL with type validation and foreign key checks.', difficulty: 'Intermediate', skills_practiced: 'Python, SQL, Data Modeling' }
    ]
  },
  {
    slug: 'qa-automation-engineer',
    title: 'Software QA / Test Automation Engineer',
    category: 'Software Development',
    description: 'Writes automated test suites, validates functional behaviors, verifies API contracts, and prevents software regressions before releases.',
    education_level: 'BCA, B.Sc Computer Science, B.Tech Computer Science',
    min_experience: 'Beginner',
    career_overview: 'QA Engineers design test strategies, write automated scripts to simulate user actions, verify edge-case boundaries, and safeguard software reliability.',
    day_to_day: 'Writing test scripts with pytest/Selenium, testing REST API status codes and payloads, reporting bugs, and verifying automated build pipelines.',
    salary_range: '₹4,00,000 - ₹9,50,000 per annum (Entry to Mid)',
    skills: {
      required: ['Python', 'Software Testing Fundamentals', 'Git'],
      preferred: ['SQL', 'REST APIs', 'HTML']
    },
    interests: ['Software Development'],
    resources: [
      { title: 'Pytest Official Testing Framework Guide', type: 'Official Documentation', platform: 'pytest.org', url: 'https://docs.pytest.org/' },
      { title: 'Test Automation University (Free Courses)', type: 'Community Courses', platform: 'Test Automation University', url: 'https://testautomationu.applitools.com/' }
    ],
    roadmap: [
      { period: 'Month 1-2', focus: 'Software Testing Fundamentals (Unit, Integration, E2E)' },
      { period: 'Month 3-4', focus: 'Automated Python Testing with Pytest & Mocking' },
      { period: 'Month 5-6', focus: 'REST API Contract & Schema Verification' },
      { period: 'Month 7-8', focus: 'Browser Automation with Selenium / Playwright' },
      { period: 'Month 9+', focus: 'Continuous Testing in CI/CD & Performance Load Testing' }
    ],
    projects: [
      { title: 'Comprehensive REST API Automated Test Suite', description: 'Test CRUD operations, header security, status codes, and error payloads for web service.', difficulty: 'Intermediate', skills_practiced: 'Python, Pytest, REST APIs' },
      { title: 'End-to-End E-Commerce Checkout Test Suite', description: 'Simulate user login, cart operations, form validation, and checkout with Playwright.', difficulty: 'Intermediate', skills_practiced: 'Browser Automation, E2E' },
      { title: 'Web Accessibility (a11y) Automated Auditor', description: 'Scan web pages for WCAG compliance, color contrast, and missing ARIA attributes.', difficulty: 'Beginner', skills_practiced: 'HTML, Accessibility, Python' },
      { title: 'API Load & Stress Testing Benchmark', description: 'Simulate concurrent user requests using Locust/k6 and report response latency percentiles.', difficulty: 'Intermediate', skills_practiced: 'Performance Testing' },
      { title: 'Automated Regression Test Runner in GitHub Actions', description: 'Run test matrix across multiple Python/Node versions on every pull request.', difficulty: 'Beginner', skills_practiced: 'Git, CI/CD, Testing' }
    ]
  },
  {
    slug: 'mobile-app-developer',
    title: 'Mobile App Developer',
    category: 'Mobile Development',
    description: 'Builds intuitive, performant native and cross-platform mobile applications for smartphones and tablets running Android and iOS.',
    education_level: 'BCA, B.Sc Computer Science, B.Tech Computer Science',
    min_experience: 'Beginner',
    career_overview: 'Mobile App Developers craft touch-first user interfaces, integrate device sensors, cache offline data, and publish applications to app stores.',
    day_to_day: 'Building mobile screens, managing responsive mobile layouts, integrating REST APIs, and handling app background lifecycles.',
    salary_range: '₹4,50,000 - ₹11,50,000 per annum (Entry to Mid)',
    skills: {
      required: ['Mobile UI Design', 'JavaScript', 'REST APIs'],
      preferred: ['Git', 'HTML', 'CSS']
    },
    interests: ['Mobile Development', 'Software Development'],
    resources: [
      { title: 'Android Developers Official Training Courses', type: 'Official Documentation', platform: 'Google Developers', url: 'https://developer.android.com/courses' },
      { title: 'Apple Human Interface Guidelines (Mobile)', type: 'Design Standards', platform: 'Apple Developer', url: 'https://developer.apple.com/design/human-interface-guidelines/' }
    ],
    roadmap: [
      { period: 'Month 1-2', focus: 'Mobile UI/UX Design & Human Interface Guidelines' },
      { period: 'Month 3-4', focus: 'Cross-Platform Framework (React Native / Flutter)' },
      { period: 'Month 5-6', focus: 'State Management, Responsive Layouts & Touch Inputs' },
      { period: 'Month 7-8', focus: 'REST API Integration & Offline SQLite Storage' },
      { period: 'Month 9+', focus: 'App Store Packaging, Testing & Performance Tuning' }
    ],
    projects: [
      { title: 'Student Attendance & Timetable Mobile App', description: 'Offline-first class schedule with local notifications and attendance percentage tracker.', difficulty: 'Intermediate', skills_practiced: 'Mobile UI Design, Local Storage' },
      { title: 'Campus Food Ordering & Order Tracking App', description: 'Menu browsing, cart management, mock payment flow, and live order status tracker.', difficulty: 'Intermediate', skills_practiced: 'REST APIs, State Management' },
      { title: 'Personal Fitness & Workout Interval Tracker', description: 'Configurable HIIT timer, audio cues, and workout history charts.', difficulty: 'Beginner', skills_practiced: 'Mobile UI, Audio/Sensor APIs' },
      { title: 'Expense Recording App with Chart Visuals', description: 'Categorized receipt entry with monthly expense distribution charts and budget limits.', difficulty: 'Intermediate', skills_practiced: 'Mobile Charts, SQLite' },
      { title: 'Offline Book Library & Reading Notes App', description: 'Searchable book catalog with reading progress sliders and dark mode reading view.', difficulty: 'Beginner', skills_practiced: 'Offline Storage, UI Design' }
    ]
  },
  {
    slug: 'systems-network-admin',
    title: 'Systems & Network Administrator',
    category: 'Cloud & Infrastructure',
    description: 'Configures, monitors, and supports local networks, routers, switches, servers, and workstation infrastructure for dependable operations.',
    education_level: 'B.Sc Computer Science, BCA, Diploma/B.Tech in IT or Networking',
    min_experience: 'Beginner',
    career_overview: 'Systems & Network Administrators ensure uninterrupted workplace connectivity, manage domain servers, troubleshoot routing issues, and configure network policies.',
    day_to_day: 'Configuring subnets and DNS, managing user permissions, performing server patch maintenance, and troubleshooting physical/virtual network hardware.',
    salary_range: '₹3,50,000 - ₹8,50,000 per annum (Entry to Mid)',
    skills: {
      required: ['Networking', 'Linux'],
      preferred: ['Cyber Security Fundamentals', 'Cloud Fundamentals']
    },
    interests: ['Infrastructure & Networks'],
    resources: [
      { title: 'Cisco Networking Academy — Free Networking Basics', type: 'Foundation Course', platform: 'Skills for All by Cisco', url: 'https://skillsforall.com/' },
      { title: 'Professor Messer Network+ & Security+ Video Modules', type: 'Free Video Training', platform: 'Professor Messer', url: 'https://www.professormesser.com/' }
    ],
    roadmap: [
      { period: 'Month 1-2', focus: 'OSI Model, IPv4/IPv6 Addressing & Subnetting' },
      { period: 'Month 3-4', focus: 'Switching, Routing Protocols & VLAN Configuration' },
      { period: 'Month 5-6', focus: 'Linux & Windows Server Administration (DNS, DHCP)' },
      { period: 'Month 7-8', focus: 'Network Security, Firewalls & VPN Configuration' },
      { period: 'Month 9+', focus: 'Network Monitoring (SNMP) & Disaster Recovery Plans' }
    ],
    projects: [
      { title: 'Automated Network Subnet Calculator in Python', description: 'CLI utility calculating network address, broadcast, usable host ranges, and wildcard masks.', difficulty: 'Beginner', skills_practiced: 'Networking, Python' },
      { title: 'Home Lab Linux Gateway & DNS Server Setup', description: 'Configure custom Pi-hole or bind9 DNS resolution with ad-blocking and local domain routing.', difficulty: 'Intermediate', skills_practiced: 'Linux, Networking, DNS' },
      { title: 'Network Uptime & Latency Monitor Daemon', description: 'Continuously ping infrastructure endpoints and alert when latency exceeds threshold.', difficulty: 'Beginner', skills_practiced: 'Linux, Bash, Networking' },
      { title: 'Secure WireGuard VPN Server Deployment', description: 'Provision encrypted remote access tunnel with key generation and routing rules.', difficulty: 'Intermediate', skills_practiced: 'Security, Linux, VPN' },
      { title: 'Automated Server Configuration Backup Script', description: 'Backup /etc network configs and crontabs to remote encrypted repository.', difficulty: 'Beginner', skills_practiced: 'Bash, Linux, Git' }
    ]
  },
  {
    slug: 'ai-nlp-engineer',
    title: 'AI & NLP Engineer',
    category: 'Artificial Intelligence',
    description: 'Specializes in natural language processing, semantic search, prompt architecture, and integrating generative language APIs into practical workflows.',
    education_level: 'B.Sc Computer Science, B.Tech Computer Science, BCA',
    min_experience: '1–2 Years',
    career_overview: 'AI & NLP Engineers leverage state-of-the-art language models and NLP pipelines to structure unstructured text, generate contextual answers, and automate workflows.',
    day_to_day: 'Evaluating model performance, orchestrating prompt pipelines, integrating API endpoints, and fine-tuning language classifiers.',
    salary_range: '₹6,50,000 - ₹16,00,000 per annum (Entry to Mid)',
    skills: {
      required: ['Python', 'REST APIs', 'Machine Learning'],
      preferred: ['Git', 'Statistics', 'Linux']
    },
    interests: ['Artificial Intelligence', 'Software Development'],
    resources: [
      { title: 'Hugging Face — Natural Language Processing Course', type: 'Open Course', platform: 'Hugging Face', url: 'https://huggingface.co/learn/nlp-course' },
      { title: 'DeepLearning.AI Short Courses on LLM Engineering', type: 'Specialized Course', platform: 'DeepLearning.AI', url: 'https://www.deeplearning.ai/' }
    ],
    roadmap: [
      { period: 'Month 1-2', focus: 'Python, Text Preprocessing, Regex & Tokenization' },
      { period: 'Month 3-4', focus: 'Vector Embeddings, Semantic Search & Cosine Distance' },
      { period: 'Month 5-6', focus: 'Transformers Architecture, Attention & Hugging Face' },
      { period: 'Month 7-8', focus: 'Retrieval Augmented Generation (RAG) & Vector Stores' },
      { period: 'Month 9+', focus: 'Production LLM Orchestration, Prompt Audits & Guardrails' }
    ],
    projects: [
      { title: 'Semantic Document Search & Question Answering System', description: 'Chunk academic PDF documents, generate dense vector embeddings, and retrieve answers.', difficulty: 'Intermediate', skills_practiced: 'Python, NLP, Embeddings' },
      { title: 'Automated Resume & Job Description Matcher', description: 'Extract key competencies from candidate CVs and compute cosine compatibility scores.', difficulty: 'Intermediate', skills_practiced: 'NLP, Scikit-Learn, Python' },
      { title: 'Customer Support Email Intent Classifier', description: 'Classify incoming customer queries into billing, technical, or cancellation tickets.', difficulty: 'Beginner', skills_practiced: 'Machine Learning, NLP' },
      { title: 'Text Summarization & Keyphrase Extractor', description: 'Generate executive bullet-point summaries from long-form technical news articles.', difficulty: 'Intermediate', skills_practiced: 'Hugging Face, Transformers' },
      { title: 'Hallucination Detection & Output Verification Guard', description: 'Verify generated model assertions against grounded knowledge store facts.', difficulty: 'Advanced', skills_practiced: 'AI Safety, Python, Validation' }
    ]
  }
];

export function seedDatabase(db?: DatabaseSync): void {
  const database = db || getDatabase();
  initializeDatabase(database);

  console.log('Seeding careers, skills, interests, and resources...');

  const insertCareer = database.prepare(`
    INSERT INTO careers (slug, title, category, description, education_level, min_experience, career_overview, day_to_day, salary_range, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      category = excluded.category,
      description = excluded.description,
      education_level = excluded.education_level,
      min_experience = excluded.min_experience,
      career_overview = excluded.career_overview,
      day_to_day = excluded.day_to_day,
      salary_range = excluded.salary_range,
      active = 1
  `);

  const getCareerId = database.prepare('SELECT id FROM careers WHERE slug = ?');
  const insertSkill = database.prepare('INSERT OR IGNORE INTO skills (name, category) VALUES (?, ?)');
  const getSkillId = database.prepare('SELECT id FROM skills WHERE name = ?');
  const insertCareerSkill = database.prepare(`
    INSERT OR REPLACE INTO career_skills (career_id, skill_id, importance)
    VALUES (?, ?, ?)
  `);

  const insertInterest = database.prepare('INSERT OR IGNORE INTO interests (name) VALUES (?)');
  const getInterestId = database.prepare('SELECT id FROM interests WHERE name = ?');
  const insertCareerInterest = database.prepare(`
    INSERT OR REPLACE INTO career_interests (career_id, interest_id, weight)
    VALUES (?, ?, 1.0)
  `);

  const deleteResources = database.prepare('DELETE FROM resources WHERE career_id = ?');
  const insertResource = database.prepare(`
    INSERT INTO resources (career_id, title, resource_type, platform, url)
    VALUES (?, ?, ?, ?, ?)
  `);

  const deleteRoadmaps = database.prepare('DELETE FROM career_roadmaps WHERE career_id = ?');
  const insertRoadmap = database.prepare(`
    INSERT INTO career_roadmaps (career_id, stage_order, period, focus, description)
    VALUES (?, ?, ?, ?, ?)
  `);

  const deleteProjects = database.prepare('DELETE FROM career_projects WHERE career_id = ?');
  const insertProject = database.prepare(`
    INSERT INTO career_projects (career_id, project_order, title, description, difficulty, skills_practiced)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const c of CAREERS_DATA) {
    insertCareer.run(
      c.slug, c.title, c.category, c.description,
      c.education_level, c.min_experience, c.career_overview,
      c.day_to_day, c.salary_range
    );

    const careerRow = getCareerId.get(c.slug) as { id: number };
    const careerId = careerRow.id;

    // Skills
    for (const skillName of c.skills.required) {
      insertSkill.run(skillName, c.category);
      const skillRow = getSkillId.get(skillName) as { id: number };
      insertCareerSkill.run(careerId, skillRow.id, 'required');
    }

    for (const skillName of c.skills.preferred) {
      insertSkill.run(skillName, c.category);
      const skillRow = getSkillId.get(skillName) as { id: number };
      insertCareerSkill.run(careerId, skillRow.id, 'preferred');
    }

    // Interests
    for (const interestName of c.interests) {
      insertInterest.run(interestName);
      const interestRow = getInterestId.get(interestName) as { id: number };
      insertCareerInterest.run(careerId, interestRow.id);
    }

    // Resources
    deleteResources.run(careerId);
    for (const res of c.resources) {
      insertResource.run(careerId, res.title, res.type, res.platform, res.url);
    }

    // Roadmaps
    deleteRoadmaps.run(careerId);
    c.roadmap.forEach((stage, idx) => {
      insertRoadmap.run(careerId, idx + 1, stage.period, stage.focus, stage.description || '');
    });

    // Projects
    deleteProjects.run(careerId);
    c.projects.forEach((proj, idx) => {
      insertProject.run(careerId, idx + 1, proj.title, proj.description, proj.difficulty, proj.skills_practiced);
    });
  }

  console.log(`Seeded ${CAREERS_DATA.length} careers successfully.`);
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDatabase();
}
