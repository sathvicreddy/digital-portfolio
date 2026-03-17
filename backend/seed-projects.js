const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Project = require('./models/Project');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/portfolio';

const projects = [
  {
    title: 'AI-Powered Education Assistant',
    description: 'A smart, interactive desktop chatbot that serves as a personalized tutor for students. Leverages Google Gemini-1.5-Flash AI to provide instant responses to academic queries, featuring a sleek dark-themed GUI with contextual awareness and conversation history.',
    category: 'AI / PYTHON',
    tech: ['Python', 'Google Gemini AI', 'Tkinter', 'Threading'],
    image: '/assets/ai_education.png',
    githubLink: 'https://github.com/sathvicreddy/AI-Powered-Education-Assistant'
  },
  {
    title: 'Predictive OS Resource Allocation',
    description: 'A real-time system monitoring tool that uses machine learning to predict CPU, memory, disk, and network usage. Proactively alerts when resources exceed thresholds, helping prevent performance degradation through data-driven visualizations.',
    category: 'ML / SYSTEMS',
    tech: ['Python', 'scikit-learn', 'psutil', 'Matplotlib', 'Pandas'],
    image: '/assets/os_resource.png',
    githubLink: 'https://github.com/sathvicreddy/Predictive-OS-Resource-Allocation'
  },
  {
    title: 'Pollution Level Categorization Using KNN',
    description: 'An IEEE research paper implementation that classifies pollution levels using the K-Nearest Neighbor algorithm on processed environmental data. Features PCA-based dimensionality reduction, grid search hyperparameter tuning, and comprehensive data visualizations.',
    category: 'ML / RESEARCH',
    tech: ['Python', 'KNN', 'scikit-learn', 'PCA', 'Jupyter'],
    image: '/assets/pollution_knn.png',
    githubLink: 'https://github.com/sathvicreddy/Pollution-Level-Categorization-Using-K-Nearest-Neighbor-and-Processed-Environmental-Data'
  },
  {
    title: 'Advanced Customer Segmentation & Persona Generation',
    description: 'A data analytics pipeline that segments customers using clustering algorithms and generates detailed marketing personas. Enables businesses to target specific customer groups with tailored strategies based on behavioral and demographic data.',
    category: 'DATA ANALYTICS',
    tech: ['Python', 'K-Means', 'Pandas', 'Seaborn', 'NumPy'],
    image: '/assets/customer_segment.png',
    githubLink: 'https://github.com/sathvicreddy/Advanced-Customer-Segmentation-Persona-Generation'
  },
  {
    title: 'Food Delivery Web App',
    description: 'A modern, full-stack food delivery platform built with React and Vite. Features a responsive restaurant menu interface with food cards, shopping cart, and order tracking — designed with a clean, user-friendly UI for seamless online food ordering.',
    category: 'WEB APP',
    tech: ['React', 'Vite', 'JavaScript', 'CSS', 'Node.js'],
    image: '/assets/food_delivery.png',
    githubLink: 'https://github.com/sathvicreddy/food-delevary'
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await Project.deleteMany({});
    console.log('Cleared existing projects');

    const inserted = await Project.insertMany(projects);
    console.log(`Inserted ${inserted.length} projects:`);
    inserted.forEach(p => console.log(`  - ${p.title}`));

    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();
