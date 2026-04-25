# Development Guide

## Architecture Overview

### Monorepo Structure
- **Workspace**: pnpm workspaces
- **Shared**: Common types and utilities
- **Server**: Express.js backend
- **Web**: React frontend

### Design Principles

1. **Modularity**: Each feature is a self-contained module
2. **Type Safety**: Full TypeScript coverage
3. **Separation of Concerns**: Clear boundaries between modules
4. **DRY (Don't Repeat Yourself)**: Shared utilities and types
5. **SOLID Principles**: Especially Single Responsibility

## Adding a New Feature

### Example: Adding a New Module

Let's say we want to add a "Notes" module for clinical notes.

#### 1. Define Types (packages/shared/src/types.ts)

```typescript
export interface ClinicalNote {
  id: string;
  patientId: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ClinicalNoteCreateInput {
  title: string;
  content: string;
  tags?: string[];
}
```

#### 2. Add Schema Validation (packages/shared/src/schemas.ts)

```typescript
export const ClinicalNoteCreateSchema = z.object({
  title: z.string().min(1),
  content: z.string().min(1),
  tags: z.array(z.string()).optional(),
});

export type ClinicalNoteCreateInput = z.infer<typeof ClinicalNoteCreateSchema>;
```

#### 3. Update Database Schema (packages/server/prisma/schema.prisma)

```prisma
model ClinicalNote {
  id        String    @id @default(cuid())
  patientId String
  patient   Patient   @relation(fields: [patientId], references: [id], onDelete: Cascade)
  
  title     String
  content   String    @db.Text
  tags      String[]  @default([])
  
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  @@index([patientId])
}
```

Add to Patient model:
```prisma
model Patient {
  // ... existing fields
  clinicalNotes ClinicalNote[]
}
```

#### 4. Create Migration

```bash
cd packages/server
pnpm prisma migrate dev --name add_clinical_notes
```

#### 5. Create API Routes (packages/server/src/modules/notes/routes.ts)

```typescript
import { Router, Response } from "express";
import { prisma } from "../../index";
import { ClinicalNoteCreateSchema } from "@medical-app/shared";
import { authMiddleware, AuthRequest } from "../../middleware/auth";
import { handleError, NotFoundError } from "../../lib/errors";

const router = Router();
router.use(authMiddleware);

// Get notes for patient
router.get("/patient/:patientId", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    const patient = await prisma.patient.findUnique({
      where: { id: req.params.patientId },
    });

    if (!patient || patient.userId !== req.user.userId) {
      throw new NotFoundError("Patient");
    }

    const notes = await prisma.clinicalNote.findMany({
      where: { patientId: req.params.patientId },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: notes });
  } catch (error) {
    handleError(error, res);
  }
});

// Create note
router.post("/patient/:patientId", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    const patient = await prisma.patient.findUnique({
      where: { id: req.params.patientId },
    });

    if (!patient || patient.userId !== req.user.userId) {
      throw new NotFoundError("Patient");
    }

    const input = ClinicalNoteCreateSchema.parse(req.body);

    const note = await prisma.clinicalNote.create({
      data: {
        patientId: req.params.patientId,
        ...input,
      },
    });

    res.status(201).json({ success: true, data: note });
  } catch (error) {
    handleError(error, res);
  }
});

// Update note
router.put("/:id", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    const note = await prisma.clinicalNote.findUnique({
      where: { id: req.params.id },
      include: { patient: true },
    });

    if (!note || note.patient.userId !== req.user.userId) {
      throw new NotFoundError("Note");
    }

    const input = ClinicalNoteCreateSchema.parse(req.body);

    const updated = await prisma.clinicalNote.update({
      where: { id: req.params.id },
      data: input,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    handleError(error, res);
  }
});

// Delete note
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) throw new Error("Not authenticated");

    const note = await prisma.clinicalNote.findUnique({
      where: { id: req.params.id },
      include: { patient: true },
    });

    if (!note || note.patient.userId !== req.user.userId) {
      throw new NotFoundError("Note");
    }

    await prisma.clinicalNote.delete({ where: { id: req.params.id } });

    res.json({ success: true, message: "Note deleted" });
  } catch (error) {
    handleError(error, res);
  }
});

export default router;
```

#### 6. Register Route in Server (packages/server/src/index.ts)

```typescript
import notesRoutes from "./modules/notes/routes";

// ... existing code ...

app.use("/api/notes", notesRoutes);
```

#### 7. Add API Client Methods (packages/web/src/lib/api.ts)

```typescript
async getNotes(patientId: string) {
  const response = await this.client.get(`/notes/patient/${patientId}`);
  return response.data;
}

async createNote(patientId: string, data: any) {
  const response = await this.client.post(`/notes/patient/${patientId}`, data);
  return response.data;
}

async updateNote(id: string, data: any) {
  const response = await this.client.put(`/notes/${id}`, data);
  return response.data;
}

async deleteNote(id: string) {
  const response = await this.client.delete(`/notes/${id}`);
  return response.data;
}
```

#### 8. Create UI Component (packages/web/src/components/NotesPanel.tsx)

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "../lib/api";

interface NotesPanelProps {
  patientId: string;
}

export default function NotesPanel({ patientId }: NotesPanelProps) {
  const queryClient = useQueryClient();

  const { data: notesResponse, isLoading } = useQuery({
    queryKey: ["notes", patientId],
    queryFn: () => apiClient.getNotes(patientId),
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.createNote(patientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", patientId] });
    },
  });

  const notes = notesResponse?.data || [];

  return (
    <div className="card">
      <h2 className="text-xl font-bold mb-4">Clinical Notes</h2>
      
      {/* Note form */}
      {/* Note list */}
      {notes.map((note: any) => (
        <div key={note.id} className="border-b pb-4 mb-4">
          <h3 className="font-semibold">{note.title}</h3>
          <p className="text-gray-600">{note.content}</p>
        </div>
      ))}
    </div>
  );
}
```

## Code Patterns

### Error Handling

```typescript
import { handleError, NotFoundError, ValidationError } from "../../lib/errors";

// Throw errors
throw new NotFoundError("Patient");
throw new ValidationError("Invalid email");

// Handle in routes
try {
  // logic
} catch (error) {
  handleError(error, res);
}
```

### API Client Usage

```typescript
// Get data
const { data, isLoading, error } = useQuery({
  queryKey: ["resource", id],
  queryFn: () => apiClient.getResource(id),
});

// Mutate data
const mutation = useMutation({
  mutationFn: (data) => apiClient.updateResource(id, data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["resource"] });
  },
});
```

### State Management with Zustand

```typescript
import { create } from "zustand";

interface AppState {
  selectedPatientId: string | null;
  setSelectedPatientId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  selectedPatientId: null,
  setSelectedPatientId: (id) => set({ selectedPatientId: id }),
}));

// Usage
const { selectedPatientId, setSelectedPatientId } = useAppStore();
```

## Testing Strategy

### Backend Testing
```typescript
// packages/server/src/__tests__/patients.test.ts
import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import { app, prisma } from "../index";

describe("Patients API", () => {
  let authToken: string;
  let patientId: string;

  beforeAll(async () => {
    // Setup: Create test user and get token
  });

  afterAll(async () => {
    // Cleanup: Delete test data
    await prisma.$disconnect();
  });

  it("should create a patient", async () => {
    // Test implementation
  });

  it("should retrieve patient details", async () => {
    // Test implementation
  });
});
```

### Frontend Testing
```typescript
// packages/web/src/__tests__/PatientForm.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import PatientForm from "../components/PatientForm";

describe("PatientForm", () => {
  it("should render form fields", () => {
    const { getByLabelText } = render(
      <PatientForm onSubmit={() => {}} />
    );
    expect(getByLabelText(/first name/i)).toBeInTheDocument();
  });
});
```

## Performance Optimization

### Frontend
- Use `React.memo()` for expensive components
- Implement code splitting with React.lazy()
- Use React Query for smart caching
- Optimize images and assets

### Backend
- Use database indexes for frequently queried fields
- Implement pagination for large datasets
- Cache frequent queries with Redis (future)
- Use connection pooling for database

## Debugging

### Backend Debugging
```bash
# Run with inspector
node --inspect=0.0.0.0:9229 dist/index.js

# Connect with Chrome DevTools at chrome://inspect
```

### Frontend Debugging
- Use React DevTools browser extension
- Check Network tab for API calls
- Use Console for JavaScript errors
- Use Sources tab for breakpoints

### Database Debugging
```bash
# Open Prisma Studio
cd packages/server
pnpm prisma:studio

# Access at http://localhost:5555
```

## Code Quality

### Linting
```bash
pnpm lint
```

### Type Checking
```bash
pnpm type-check
```

### Formatting (with Prettier)
```bash
pnpm format
```

## Deployment Considerations

- Environment variables for production
- Database migrations in CI/CD
- Frontend build optimization
- Backend error monitoring
- Performance monitoring
- Security headers
- Rate limiting
- API versioning strategy

## Resources for Developers

- [System Architecture Document](../README.md)
- [Setup Guide](./SETUP.md)
- [API Documentation](../README.md#-api-documentation)
- TypeScript: https://www.typescriptlang.org/docs
- Express: https://expressjs.com
- React: https://react.dev
- Prisma: https://www.prisma.io/docs

## Common Gotchas

1. **Forgetting to add relation in Prisma**: Always add model reference in both directions
2. **Missing middleware**: Ensure authMiddleware is applied to protected routes
3. **Type mismatches**: Always validate types at API boundaries
4. **Stale cache**: Remember to invalidate React Query caches after mutations
5. **CORS issues**: Check frontend API_BASE_URL matches backend

## Best Practices

- Keep components small and focused
- Use custom hooks for shared logic
- Write types first, then implementation
- Test edge cases, not just happy paths
- Document complex business logic
- Use meaningful variable names
- Keep functions pure and testable
- Version your API early

---

Happy developing! 🚀
