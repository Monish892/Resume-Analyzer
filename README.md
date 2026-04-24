<div align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E" alt="Vite" />
  
  <br />
  <br />
  
  <h1>📄 AI Resume Analyzer Pro</h1>
  <p>
    <b>Supercharge your job application process with AI-driven resume insights, formatting, and optimization.</b>
  </p>
</div>

<br />

## ✨ Features

- 🧠 **Smart Analysis**: Get instant AI feedback on your resume using powerful LLMs.
- 🎯 **ATS Formatting**: Optimize your resume structure to easily pass Applicant Tracking Systems.
- ✉️ **Cover Letter Generator**: Create tailored, job-specific cover letters in seconds.
- 💡 **Project Ideas**: Receive intelligent project suggestions to fill skill gaps.
- 🎤 **Interview Prep**: Practice with AI-generated interview questions based on your background.
- 📊 **Skills Radar**: Visualize your core competencies and discover missing skills.
- 💰 **Salary Estimator**: Get data-driven salary expectations for your desired roles.

## 🛠️ Tech Stack

- **Framework**: [React 19](https://react.dev/) with [Vite](https://vitejs.dev/)
- **Routing**: [TanStack Router](https://tanstack.com/router/latest)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **PDF Processing**: `pdfjs-dist`, `html2canvas`, and `jspdf`
- **Charts**: [Recharts](https://recharts.org/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 🚀 Getting Started

### Prerequisites

Make sure you have [Node.js](https://nodejs.org/) (v18+) and [Bun](https://bun.sh/) or npm installed.

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Monish892/Resume-Analyzer.git
```

2. Navigate to the project directory:
```bash
cd Resume-Analyzer/resume-ai-pro
```

3. Install dependencies:
```bash
npm install
# or
bun install
```

4. Start the development server:
```bash
npm run dev
# or
bun run dev
```

5. Open your browser and navigate to `http://localhost:5173`

## 📦 Project Structure

```text
resume-ai-pro/
├── src/
│   ├── components/
│   │   ├── features/      # Core feature components (Cover Letters, Interview Prep, etc.)
│   │   ├── ui/            # Reusable UI components (Buttons, Dialogs, etc.)
│   ├── lib/               # Utility functions and API integrations
│   ├── routes/            # TanStack Router page definitions
│   ├── hooks/             # Custom React hooks
│   └── styles.css         # Global Tailwind styles
├── vite.config.ts         # Vite configuration
└── package.json           # Dependencies and scripts
```

## 🤝 Contributing

Contributions are always welcome! Feel free to open an issue or submit a pull request if you have ideas for new features or improvements.

## 📄 License

This project is licensed under the MIT License.
