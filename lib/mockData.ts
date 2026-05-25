import type { InterviewSession } from './types';

export const MOCK_SESSIONS: InterviewSession[] = [
  {
    id: 1001, candidate_name: 'Arjun Sharma', candidate_email: 'arjun.sharma@gmail.com',
    domain: 'java', topics: ['Collections', 'OOP Concepts', 'Loops & Control Flow', 'Exception Handling'],
    status: 'evaluated', created_at: '2026-04-25T09:30:00Z', completed_at: '2026-04-25T10:05:00Z',
    technical_score: 8.4, communication_score: 7.9, overall_score: 8.2, result: 'pass', evaluation_report: null,
  },
  {
    id: 1002, candidate_name: 'Priya Nair', candidate_email: 'priya.nair@outlook.com',
    domain: 'react', topics: ['Components & Props', 'Hooks', 'State Management'],
    status: 'evaluated', created_at: '2026-04-23T11:00:00Z', completed_at: '2026-04-23T11:35:00Z',
    technical_score: 7.8, communication_score: 7.4, overall_score: 7.6, result: 'pass', evaluation_report: null,
  },
  {
    id: 1003, candidate_name: 'Rahul Verma', candidate_email: 'rahul.verma@gmail.com',
    domain: 'java', topics: ['Collections', 'OOP Concepts'],
    status: 'evaluated', created_at: '2026-04-21T14:00:00Z', completed_at: '2026-04-21T14:40:00Z',
    technical_score: 4.2, communication_score: 5.5, overall_score: 4.8, result: 'fail', evaluation_report: null,
  },
  {
    id: 1004, candidate_name: 'Sneha Menon', candidate_email: 'sneha.menon@gmail.com',
    domain: 'python', topics: ['Data Structures', 'OOP Concepts', 'Functions & Closures'],
    status: 'evaluated', created_at: '2026-04-19T10:30:00Z', completed_at: '2026-04-19T11:10:00Z',
    technical_score: 8.1, communication_score: 7.7, overall_score: 7.9, result: 'pass', evaluation_report: null,
  },
  {
    id: 1005, candidate_name: 'Karthik Iyer', candidate_email: 'karthik.iyer@outlook.com',
    domain: 'devops', topics: ['Docker & Containers', 'CI/CD Pipelines', 'Linux & Shell'],
    status: 'evaluated', created_at: '2026-04-17T09:00:00Z', completed_at: '2026-04-17T09:42:00Z',
    technical_score: 5.0, communication_score: 5.5, overall_score: 5.2, result: 'fail', evaluation_report: null,
  },
  {
    id: 1006, candidate_name: 'Divya Krishnan', candidate_email: 'divya.krishnan@gmail.com',
    domain: 'ai_ml', topics: ['Supervised Learning', 'Data Preprocessing', 'Model Evaluation'],
    status: 'evaluated', created_at: '2026-04-15T11:30:00Z', completed_at: '2026-04-15T12:15:00Z',
    technical_score: 8.7, communication_score: 8.3, overall_score: 8.5, result: 'pass', evaluation_report: null,
  },
  {
    id: 1007, candidate_name: 'Amit Patel', candidate_email: 'amit.patel@gmail.com',
    domain: 'react', topics: ['Hooks', 'Routing', 'Performance Optimization'],
    status: 'evaluated', created_at: '2026-04-12T14:00:00Z', completed_at: '2026-04-12T14:38:00Z',
    technical_score: 7.0, communication_score: 7.2, overall_score: 7.1, result: 'pass', evaluation_report: null,
  },
  {
    id: 1008, candidate_name: 'Ravi Kumar', candidate_email: 'ravi.kumar@gmail.com',
    domain: 'java', topics: ['Spring Beans / DI', 'Loops & Control Flow', 'OOP Concepts'],
    status: 'in_progress', created_at: '2026-04-28T09:15:00Z', completed_at: null,
    technical_score: null, communication_score: null, overall_score: null, result: null, evaluation_report: null,
  },
  {
    id: 1009, candidate_name: 'Lakshmi Reddy', candidate_email: 'lakshmi.reddy@outlook.com',
    domain: 'python', topics: ['OOP Concepts', 'Standard Libraries', 'File Handling'],
    status: 'evaluated', created_at: '2026-04-10T10:00:00Z', completed_at: '2026-04-10T10:42:00Z',
    technical_score: 6.5, communication_score: 7.2, overall_score: 6.8, result: 'pass', evaluation_report: null,
  },
  {
    id: 1010, candidate_name: 'Vijay Anand', candidate_email: 'vijay.anand@gmail.com',
    domain: 'devops', topics: ['Docker & Containers', 'Kubernetes', 'Cloud Basics'],
    status: 'evaluated', created_at: '2026-04-08T11:00:00Z', completed_at: '2026-04-08T11:40:00Z',
    technical_score: 7.5, communication_score: 7.1, overall_score: 7.3, result: 'pass', evaluation_report: null,
  },
  {
    id: 1011, candidate_name: 'Pooja Singh', candidate_email: 'pooja.singh@gmail.com',
    domain: 'ai_ml', topics: ['Neural Networks', 'NLP Basics', 'Data Preprocessing'],
    status: 'evaluated', created_at: '2026-04-05T09:30:00Z', completed_at: '2026-04-05T10:10:00Z',
    technical_score: 4.0, communication_score: 5.1, overall_score: 4.5, result: 'fail', evaluation_report: null,
  },
  {
    id: 1012, candidate_name: 'Suresh Babu', candidate_email: 'suresh.babu@outlook.com',
    domain: 'java', topics: ['Collections', 'OOP Concepts', 'Exception Handling', 'Loops & Control Flow'],
    status: 'evaluated', created_at: '2026-04-03T14:00:00Z', completed_at: '2026-04-03T14:45:00Z',
    technical_score: 8.3, communication_score: 7.9, overall_score: 8.1, result: 'pass', evaluation_report: null,
  },
  {
    id: 1013, candidate_name: 'Meena Chandrasekhar', candidate_email: 'meena.cs@gmail.com',
    domain: 'react', topics: ['Components & Props', 'Hooks', 'State Management', 'Routing'],
    status: 'in_progress', created_at: '2026-04-28T10:30:00Z', completed_at: null,
    technical_score: null, communication_score: null, overall_score: null, result: null, evaluation_report: null,
  },
  {
    id: 1014, candidate_name: 'Deepak Rao', candidate_email: 'deepak.rao@gmail.com',
    domain: 'python', topics: ['Data Structures', 'Functions & Closures'],
    status: 'evaluated', created_at: '2026-03-28T11:00:00Z', completed_at: '2026-03-28T11:38:00Z',
    technical_score: 3.5, communication_score: 4.4, overall_score: 3.9, result: 'fail', evaluation_report: null,
  },
  {
    id: 1015, candidate_name: 'Ananya Bose', candidate_email: 'ananya.bose@outlook.com',
    domain: 'java', topics: ['OOP Concepts', 'Collections', 'Spring Beans / DI'],
    status: 'evaluated', created_at: '2026-03-25T09:00:00Z', completed_at: '2026-03-25T09:42:00Z',
    technical_score: 7.8, communication_score: 7.2, overall_score: 7.5, result: 'pass', evaluation_report: null,
  },
  {
    id: 1016, candidate_name: 'Naveen Kumar', candidate_email: 'naveen.kumar@gmail.com',
    domain: 'ai_ml', topics: ['Supervised Learning', 'Neural Networks', 'Model Evaluation', 'NLP Basics'],
    status: 'evaluated', created_at: '2026-03-20T14:30:00Z', completed_at: '2026-03-20T15:15:00Z',
    technical_score: 9.0, communication_score: 8.6, overall_score: 8.8, result: 'pass', evaluation_report: null,
  },
  {
    id: 1017, candidate_name: 'Swathi Pillai', candidate_email: 'swathi.pillai@gmail.com',
    domain: 'react', topics: ['Components & Props', 'Performance Optimization'],
    status: 'evaluated', created_at: '2026-03-15T10:00:00Z', completed_at: '2026-03-15T10:40:00Z',
    technical_score: 5.0, communication_score: 5.3, overall_score: 5.1, result: 'fail', evaluation_report: null,
  },
  {
    id: 1018, candidate_name: 'Rajesh Gowda', candidate_email: 'rajesh.gowda@gmail.com',
    domain: 'devops', topics: ['Docker & Containers', 'CI/CD Pipelines', 'Kubernetes', 'Linux & Shell'],
    status: 'in_progress', created_at: '2026-04-28T11:45:00Z', completed_at: null,
    technical_score: null, communication_score: null, overall_score: null, result: null, evaluation_report: null,
  },
];
