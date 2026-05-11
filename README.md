# 🌌 Universe Analytics

**Universe Analytics** is a comprehensive university ranking and discovery platform designed for students, researchers, and administrators. It combines deep institutional data metrics with an AI-powered counselor to help users navigate global higher education intelligently.

---

## 🚀 Features

### 📈 Live Ranking Engine
- Real-time university rankings
- Sortable and filterable leaderboard
- Rankings based on 8 core performance pillars
- Dynamic recalculation with customizable weights

### 🤖 AI Chat Counselor
- Powered by **Gemini 3 Flash**
- Personalized university guidance
- Context-aware recommendations using live ranking data
- Interactive counseling experience

### ⚖️ Dynamic Ranking Weights
- Adjustable ranking algorithm
- Instant leaderboard updates
- Fully configurable through Admin Dashboard

### 🏫 University Profiles
- Detailed institutional statistics
- Historical ranking trends
- Sustainability and Green Intelligence tracking
- Research and employment analytics

### 🎯 Find My Match
- Wizard-based recommendation system
- Matches students with ideal universities
- Uses profile preferences and ranking metrics

### 🛠 Admin Dashboard
- Full CRUD operations
- University management
- News publishing and moderation
- Algorithm tuning and analytics controls

---

# 🛠 Tech Stack

## Frontend

| Technology | Description |
|------------|-------------|
| React 18 (Vite 5) | Frontend framework |
| TypeScript | Type-safe development |
| Tailwind CSS | Utility-first styling |
| shadcn/ui | UI component system |
| TanStack React Query | Data fetching and caching |
| React Context | Global state management |
| Recharts | Data visualization and charts |

---

## Backend (Supabase)

| Technology | Description |
|------------|-------------|
| PostgreSQL | Relational database |
| Row Level Security (RLS) | Secure data access |
| Supabase Auth | Authentication system |
| Edge Functions (Deno) | Serverless backend logic |
| AI Gateway | Gemini 3 Flash integration |

---

# 📊 Ranking Algorithm

The **Overall Score (0–100)** is calculated as a weighted average of multiple institutional performance pillars.

| Pillar | Default Weight | Description |
|--------|----------------|-------------|
| Academic Reputation | 30% | Global survey of academic excellence |
| Citations per Faculty | 20% | Research impact and output |
| Employer Reputation | 15% | Graduate employability and prestige |
| International Diversity | 10% | Ratio of international students/faculty |
| Faculty-to-Student Ratio | 10% | Teaching commitment and class sizes |
| Research Network | 5% | International research collaborations |
| Employment Outcomes | 5% | Post-graduation success rates |
| Sustainability | 5% | Environmental and social impact |

---

# 🗄 Database Schema

The platform uses a relational PostgreSQL architecture.

## Core Tables

### `universities`
Stores:
- Institutional metadata
- Ranking metrics
- Pillar scores
- Historical performance data

### `algorithm_settings`
- Key-value configuration store
- Dynamic ranking weights
- System-wide algorithm settings

### `news`
- Global higher education news
- Synced via GNews API
- Categorized content management

### `profiles` & `user_roles`
- User account data
- RBAC (Role-Based Access Control)
- Role permissions and authorization

---

# 🔧 Edge Functions

Located inside:

```bash
/supabase/functions/
```

## Available Functions

| Function | Purpose |
|----------|---------|
| `universe-chat` | SSE streaming for AI counselor |
| `fetch-news` | Automated education news synchronization |
| `seed-universities` | Bulk university data import |
| `seed-admin` | Initial admin account bootstrap |

---

# 🖥 Getting Started

## Prerequisites

Make sure you have:

- Node.js (v18+)
- npm or pnpm
- Supabase account
- Supabase project

---

# ⚙️ Installation

## 1. Clone the Repository

```bash
git clone https://github.com/azshifat007/universe-analytics.git

cd universe-analytics
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

---

## 4. Start Development Server

```bash
npm run dev
```

The application will run at:

```bash
http://localhost:5173
```

---

# 🧪 Supabase Setup

## Link Your Project

```bash
supabase link --project-ref your-project-id
```

## Run Database Migrations

```bash
supabase db push
```

## Deploy Edge Functions

```bash
supabase functions deploy
```

---

# 🔐 Authentication & Security

- Email/Password Authentication
- Protected Routes
- Role-Based Access Control (RBAC)
- PostgreSQL Row Level Security (RLS)
- Secure API access using Supabase policies

---

# 📡 AI Integration

Universe Analytics integrates **Gemini 3 Flash** through an AI Gateway to provide:

- Smart university recommendations
- Conversational student counseling
- Ranking insights
- Personalized educational guidance

---

# 📈 Future Improvements

- Machine Learning-based recommendation engine
- Scholarship matching system
- Country-specific admission forecasting
- Real-time collaborative dashboards
- Mobile application support
- Advanced predictive analytics

---

# 🤝 Contributing

Contributions are welcome.

## Steps

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature/your-feature
```

3. Commit your changes

```bash
git commit -m "Add new feature"
```

4. Push to your branch

```bash
git push origin feature/your-feature
```

5. Open a Pull Request

---


# 👨‍💻 Author

Developed by **Md Azizul Hakim**

---

# ⭐ Support

If you like this project:

- Give it a ⭐ on GitHub
- Share it with others
- Contribute to development

---

## 🌍 Vision

Universe Analytics aims to make global higher education data transparent, intelligent, and accessible for everyone.
