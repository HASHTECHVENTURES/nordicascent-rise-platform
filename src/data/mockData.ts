// Mock Data for Nordicascent Platform

export const employees = [
  { id: 1, name: "Erik Lindqvist", email: "erik.l@nordicascent.com", role: "Senior Developer", department: "Engineering", status: "active", avatar: "EL", joinDate: "2022-03-15", completedTrainings: 12 },
  { id: 2, name: "Ingrid Svensson", email: "ingrid.s@nordicascent.com", role: "Product Manager", department: "Product", status: "active", avatar: "IS", joinDate: "2021-08-22", completedTrainings: 18 },
  { id: 3, name: "Lars Johansson", email: "lars.j@nordicascent.com", role: "UX Designer", department: "Design", status: "active", avatar: "LJ", joinDate: "2023-01-10", completedTrainings: 8 },
  { id: 4, name: "Astrid Nilsson", email: "astrid.n@nordicascent.com", role: "HR Manager", department: "Human Resources", status: "active", avatar: "AN", joinDate: "2020-11-05", completedTrainings: 24 },
  { id: 5, name: "Magnus Eriksson", email: "magnus.e@nordicascent.com", role: "Sales Director", department: "Sales", status: "active", avatar: "ME", joinDate: "2021-02-28", completedTrainings: 15 },
  { id: 6, name: "Freya Andersson", email: "freya.a@nordicascent.com", role: "Marketing Lead", department: "Marketing", status: "on-leave", avatar: "FA", joinDate: "2022-06-14", completedTrainings: 10 },
  { id: 7, name: "Oscar Berg", email: "oscar.b@nordicascent.com", role: "DevOps Engineer", department: "Engineering", status: "active", avatar: "OB", joinDate: "2023-04-03", completedTrainings: 6 },
  { id: 8, name: "Elsa Karlsson", email: "elsa.k@nordicascent.com", role: "Data Analyst", department: "Analytics", status: "active", avatar: "EK", joinDate: "2022-09-18", completedTrainings: 14 },
];

export const trainings = [
  { id: 1, title: "Leadership Fundamentals", category: "Leadership", difficulty: "Intermediate", duration: "4 hours", modules: 8, enrolled: 45, completion: 78, description: "Master essential leadership skills for managing teams effectively." },
  { id: 2, title: "Data Privacy & GDPR", category: "Compliance", difficulty: "Beginner", duration: "2 hours", modules: 5, enrolled: 120, completion: 92, description: "Understanding data protection regulations and compliance requirements." },
  { id: 3, title: "Agile Project Management", category: "Management", difficulty: "Advanced", duration: "6 hours", modules: 12, enrolled: 34, completion: 65, description: "Deep dive into Agile methodologies and Scrum frameworks." },
  { id: 4, title: "Effective Communication", category: "Soft Skills", difficulty: "Beginner", duration: "3 hours", modules: 6, enrolled: 89, completion: 85, description: "Improve workplace communication and collaboration skills." },
  { id: 5, title: "Cybersecurity Essentials", category: "Security", difficulty: "Intermediate", duration: "5 hours", modules: 10, enrolled: 67, completion: 71, description: "Learn to identify and prevent security threats in the workplace." },
  { id: 6, title: "Financial Literacy", category: "Business", difficulty: "Beginner", duration: "3 hours", modules: 7, enrolled: 56, completion: 88, description: "Understanding business finances and budgeting principles." },
];

export const jobs = [
  { id: 1, title: "Senior Software Engineer", department: "Engineering", location: "Stockholm, Sweden", type: "Full-time", posted: "2024-01-15", description: "Join our engineering team to build scalable solutions for enterprise clients.", responsibilities: ["Design and implement new features", "Code review and mentoring", "Collaborate with product team", "Optimize system performance"], requirements: ["5+ years experience", "React/TypeScript proficiency", "System design skills", "Strong communication"] },
  { id: 2, title: "Product Designer", department: "Design", location: "Oslo, Norway", type: "Full-time", posted: "2024-01-18", description: "Shape the future of our product experience with innovative design solutions.", responsibilities: ["Create user-centered designs", "Conduct user research", "Build design systems", "Prototype new features"], requirements: ["3+ years UX/UI experience", "Figma expertise", "Portfolio required", "Design thinking mindset"] },
  { id: 3, title: "HR Business Partner", department: "Human Resources", location: "Copenhagen, Denmark", type: "Full-time", posted: "2024-01-20", description: "Strategic HR role partnering with business leaders to drive people initiatives.", responsibilities: ["Strategic HR planning", "Employee relations", "Performance management", "Talent development"], requirements: ["5+ years HR experience", "HRBP certification preferred", "Strong interpersonal skills", "Change management experience"] },
  { id: 4, title: "Data Analyst", department: "Analytics", location: "Remote", type: "Full-time", posted: "2024-01-22", description: "Transform data into actionable insights for business decision-making.", responsibilities: ["Data analysis and reporting", "Dashboard creation", "Stakeholder presentations", "Process optimization"], requirements: ["3+ years analytics experience", "SQL and Python skills", "BI tools proficiency", "Statistical knowledge"] },
  { id: 5, title: "Marketing Coordinator", department: "Marketing", location: "Helsinki, Finland", type: "Part-time", posted: "2024-01-25", description: "Support marketing initiatives and campaign execution across channels.", responsibilities: ["Campaign coordination", "Content creation", "Social media management", "Event support"], requirements: ["1-2 years marketing experience", "Creative mindset", "Strong writing skills", "Digital marketing knowledge"] },
];

export const reports = [
  { id: 1, title: "Q4 Training Completion Report", type: "Training", date: "2024-01-15", status: "completed", summary: "Overall training completion rate increased by 15% compared to Q3." },
  { id: 2, title: "Employee Engagement Survey Results", type: "Engagement", date: "2024-01-10", status: "completed", summary: "Employee satisfaction score: 4.2/5. Key areas for improvement identified." },
  { id: 3, title: "Monthly Performance Metrics", type: "Performance", date: "2024-01-28", status: "pending", summary: "Comprehensive analysis of team and individual performance KPIs." },
  { id: 4, title: "Annual Compliance Audit", type: "Compliance", date: "2024-01-05", status: "completed", summary: "All departments met compliance requirements. Zero critical findings." },
  { id: 5, title: "Workforce Analytics Dashboard", type: "Custom", date: "2024-01-20", status: "in-progress", summary: "Real-time workforce metrics and predictive analytics." },
];

export const activities = [
  { id: 1, user: "Erik Lindqvist", action: "completed training", target: "Leadership Fundamentals", time: "2 hours ago", type: "training" },
  { id: 2, user: "Astrid Nilsson", action: "added new employee", target: "Oscar Berg", time: "4 hours ago", type: "employee" },
  { id: 3, user: "Ingrid Svensson", action: "submitted report", target: "Q4 Training Completion", time: "Yesterday", type: "report" },
  { id: 4, user: "Lars Johansson", action: "started training", target: "Agile Project Management", time: "Yesterday", type: "training" },
  { id: 5, user: "Magnus Eriksson", action: "approved leave request", target: "Freya Andersson", time: "2 days ago", type: "approval" },
];

export const leaderboard = [
  { rank: 1, name: "Astrid Nilsson", score: 98, trainings: 24, department: "HR" },
  { rank: 2, name: "Ingrid Svensson", score: 95, trainings: 18, department: "Product" },
  { rank: 3, name: "Magnus Eriksson", score: 92, trainings: 15, department: "Sales" },
  { rank: 4, name: "Elsa Karlsson", score: 89, trainings: 14, department: "Analytics" },
  { rank: 5, name: "Erik Lindqvist", score: 86, trainings: 12, department: "Engineering" },
];

export const departments = [
  "Engineering",
  "Product",
  "Design",
  "Human Resources",
  "Sales",
  "Marketing",
  "Analytics",
  "Finance",
  "Operations",
];

export const stats = {
  totalEmployees: 156,
  activeTrainings: 24,
  completionRate: 87,
  avgEngagement: 4.2,
  pendingApprovals: 8,
  openPositions: 5,
};
