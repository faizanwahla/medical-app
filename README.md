# 🏥 Medical Patient Management System

A comprehensive, production-ready medical patient management application built with modern web technologies. This system enables healthcare professionals to record patient biodata, history, receive differential diagnosis suggestions, track investigations and treatments, and generate instant patient summaries.

## 🎯 Features

### Core Functionality
- **Patient Management**: Complete patient biodata entry and management
- **Clinical History**: Structured recording of presenting complaints, history, and examination findings
- **Vital Signs Tracking**: Real-time vital signs monitoring with trend visualization
- **Differential Diagnosis Engine**: AI-powered DDx suggestions based on symptoms, age, and risk factors
- **Investigation Management**: Track investigations, results, and interpretations
- **Treatment Protocols**: Manage medications, dosages, and treatment status
- **Patient Dashboard**: One-click access to patient summary and status

### Specialties Supported
- General Medicine (Internal Medicine)
- Pediatrics
- Obstetrics & Gynaecology
- Surgery
- Cardiology
- Pulmonology
- Gastroenterology
- Nephrology
- Neurology
- Psychiatry
- Dermatology
- Orthopedics
- Endocrinology
- Infectious Diseases
- ENT
- Ophthalmology

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Fast build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Query** - Data fetching & caching
- **Zustand** - State management
- **Recharts** - Medical data visualization
- **Axios** - HTTP client

### Backend
- **Node.js + Express** - Server framework
- **TypeScript** - Type-safe backend
- **PostgreSQL** - Relational database
- **Prisma** - ORM with migrations
- **JWT** - Authentication
- **Bcrypt** - Password hashing

### Architecture
- **Monorepo**: Organized with pnpm workspaces
- **Modular Design**: Each feature in separate module
- **Type Safety**: End-to-end TypeScript
- **Shared Types**: Unified types across frontend and backend

## 📦 Project Structure

```
medical-app/
├── packages/
│   ├── shared/          # Shared types, schemas, constants
│   │   └── src/
│   │       ├── types.ts
│   │       ├── schemas.ts
│   │       └── constants.ts
│   │
│   ├── server/          # Express backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/
│   │   │   │   ├── patients/
│   │   │   │   ├── vitals/
│   │   │   │   ├── investigations/
│   │   │   │   ├── treatments/
│   │   │   │   ├── medicines/
│   │   │   │   └── diagnosis/
│   │   │   ├── middleware/
│   │   │   ├── lib/
│   │   │   └── index.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   └── .env.example
│   │
│   └── web/             # React frontend
│       ├── src/
│       │   ├── pages/
│       │   ├── components/
│       │   ├── layouts/
│       │   ├── lib/
│       │   ├── App.tsx
│       │   └── main.tsx
│       └── index.html
│
└── pnpm-workspace.yaml
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)
- PostgreSQL 14+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd medical-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Backend (.env in packages/server/):
   ```bash
   cp packages/server/.env.example packages/server/.env
   # Edit .env with your PostgreSQL connection
   DATABASE_URL="postgresql://user:password@localhost:5432/medical_app"
   JWT_SECRET="your-secret-key"
   JWT_REFRESH_SECRET="your-refresh-secret"
   PORT=5000
   ```

   Frontend (.env in packages/web/):
   ```bash
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Set up database**
   ```bash
   cd packages/server
   pnpm prisma migrate deploy
   pnpm prisma generate
   ```

5. **Start development servers**
   ```bash
   # From root directory, run both simultaneously:
   pnpm dev
   
   # Or run separately:
   # Terminal 1 - Backend
   cd packages/server && pnpm dev
   
   # Terminal 2 - Frontend
   cd packages/web && pnpm dev
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 📖 API Documentation

### Authentication Endpoints
```
POST   /api/auth/register          Register new user
POST   /api/auth/login             Login user
GET    /api/auth/me                Get current user
```

### Patient Endpoints
```
GET    /api/patients               List all patients
POST   /api/patients               Create new patient
GET    /api/patients/:id           Get patient details
PUT    /api/patients/:id           Update patient
DELETE /api/patients/:id           Delete patient
```

### Vital Signs Endpoints
```
GET    /api/vitals/patient/:id     Get patient vitals
POST   /api/vitals/patient/:id     Add vital signs
PUT    /api/vitals/:id             Update vital
DELETE /api/vitals/:id             Delete vital
```

### Investigation Endpoints
```
GET    /api/investigations/patient/:id      Get investigations
POST   /api/investigations/patient/:id      Create investigation
PUT    /api/investigations/:id              Update investigation result
DELETE /api/investigations/:id              Delete investigation
```

### Treatment Endpoints
```
GET    /api/treatments/patient/:id          Get treatments
GET    /api/treatments/patient/:id/active   Get active treatments
POST   /api/treatments/patient/:id          Add treatment
PUT    /api/treatments/:id                  Update treatment
DELETE /api/treatments/:id                  Delete treatment
```

### Medicine Endpoints
```
GET    /api/medicines              List medicines
GET    /api/medicines/:id          Get medicine details
POST   /api/medicines              Create medicine (admin)
```

### Diagnosis Endpoints
```
POST   /api/diagnosis/generate/:id  Generate DDx suggestions
GET    /api/diagnosis/:id           Get patient diagnoses
GET    /api/diagnosis/search        Search diseases
```

## 🧪 Testing

```bash
# Run tests for all packages
pnpm test

# Run tests for specific package
cd packages/server && pnpm test
```

## 🏗️ Architecture Decisions

### Modular Design
- Each feature is a separate module in both backend and frontend
- Modules can be improved independently
- Clear separation of concerns

### Type Safety
- End-to-end TypeScript for safety and IDE support
- Shared types between frontend and backend
- Zod schemas for runtime validation

### Database
- PostgreSQL for relational data fit with medical records
- Prisma for type-safe ORM and migrations
- Full-text search for disease/medicine lookup

### Authentication
- JWT-based authentication for stateless API
- Refresh tokens for long sessions
- Password hashing with bcrypt

### API Design
- RESTful endpoints following conventions
- Consistent error handling
- Pagination for list endpoints
- User ownership verification for data

## 📋 Medical Content Sources

The app uses information from gold-standard medical textbooks:

- Harrison's Principles of Internal Medicine
- Oxford Textbook of Medicine
- Kumar & Clark's Clinical Medicine
- Nelson Textbook of Pediatrics
- Williams Obstetrics
- Sabiston Textbook of Surgery
- WHO and NICE Guidelines

## 🔐 Security Considerations

- JWT tokens with short expiry times
- Password hashing with bcrypt
- CORS protection
- Input validation with Zod schemas
- SQL injection prevention via Prisma ORM
- HTTPS recommended for production
- User ownership verification for all data access
- Audit logging capability (to be implemented)

## 📝 Development Guidelines

### Code Organization
- Frontend components use functional components with hooks
- Backend uses async/await for all async operations
- Consistent error handling patterns
- Type-safe code throughout

### Adding New Features
1. Define types in `packages/shared`
2. Create API routes in `packages/server/src/modules/feature`
3. Add API client methods in `packages/web/src/lib/api.ts`
4. Create components in `packages/web/src/components`
5. Test end-to-end workflow

### Naming Conventions
- React components: PascalCase
- Files: kebab-case
- Database: snake_case
- API endpoints: /api/resource/action

## 🚢 Deployment

### Frontend (Vercel)
```bash
# Deploy to Vercel
vercel --prod
```

### Backend (Docker)
```bash
# Build Docker image
docker build -t medical-app-server packages/server

# Run container
docker run -e DATABASE_URL=... -p 5000:5000 medical-app-server
```

## 🗺️ Roadmap

### Phase 1: ✅ Complete
- [x] Core architecture
- [x] Patient management
- [x] Vital signs tracking
- [x] Authentication
- [x] Basic UI

### Phase 2: In Progress
- [ ] Medical content database (500+ diseases)
- [ ] Differential diagnosis engine
- [ ] Investigation management
- [ ] Treatment protocols
- [ ] Patient dashboard

### Phase 3: Planned
- [ ] Advanced reporting
- [ ] Offline capability
- [ ] Mobile app (React Native)
- [ ] AI-powered diagnosis improvements
- [ ] Integration with EHR systems
- [ ] Multi-language support
- [ ] Role-based access control
- [ ] Telemedicine features

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Create a feature branch
2. Make changes following code guidelines
3. Add tests for new functionality
4. Submit pull request with description

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👥 Team

Built with ❤️ for healthcare professionals and students.

## 📞 Support

For issues, questions, or suggestions, please open an issue on GitHub.

---

**Status**: 🚧 In Active Development

Last Updated: 2026-04-25
