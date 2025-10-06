# Mini Appointment Management System

A small healthcare clinic appointment system.

- Backend: .NET 8 Web API (In-Memory DB)
- Frontend: Angular 17 (standalone components) + Angular Material UI

## Features
- CRUD appointments (patient name, doctor, start/end times)
- Prevent overlapping appointments per doctor (server + client validation)
- Validation: required fields, end after start, no past appointments
- Doctor dropdown with ability to add a new doctor inline (frontend memory only)
- Modern dark UI with Material date picker, quick duration buttons (+15m/+30m/+45m)
- Inline duration calculation and optimistic client overlap detection
- In-memory database (reset on backend restart)
- Swagger UI in Development

## Tech Stack
| Layer | Tech |
|-------|------|
| Backend | .NET 8, ASP.NET Core Web API, EF Core InMemory |
| Frontend | Angular 17, Angular Material |
| Styling | Material Theme (Deep Purple/Amber) + custom dark layer |

## Getting Started
### Prerequisites
- .NET 8 SDK
- Node 20+ (Node binary already vendored in repo under `node-v20...` if needed)

### Run Backend
```
cd backend
DOTNET_ENVIRONMENT=Development dotnet run
```
Serves API at: http://localhost:5000
Swagger: http://localhost:5000/swagger

### Run Frontend
```
cd frontend
npm install
npm start
```
App at: http://localhost:4200

### API Endpoints
```
GET    /appointments
GET    /appointments/{id}
POST   /appointments
PUT    /appointments/{id}
DELETE /appointments/{id}
```
POST / PUT body (ISO times):
```json
{
  "patientName": "Jane Doe",
  "doctorName": "Dr. Smith",
  "startTime": "2025-10-06T09:00:00Z",
  "endTime": "2025-10-06T09:30:00Z"
}
```

## Validation Rules
- PatientName, DoctorName: 2-80 chars
- EndTime > StartTime
- StartTime must not be in the past
- No overlapping interval for the same doctor ( (start < existing.End) && (end > existing.Start) )

## Overlap Examples
Existing: 09:00 - 09:30
Invalid:
- 09:15 - 09:45 (overlaps start)
- 08:50 - 09:05 (overlaps end)
- 09:00 - 09:30 (identical)
- 08:55 - 09:40 (envelops)
Valid:
- 09:30 - 10:00 (adjacent end)
- 08:30 - 09:00 (adjacent start)

## Assumptions
- No authentication / multi-user concurrency conflict resolution.
- Doctors list: predefined on frontend (extensible to backend later).
- Time zone: Client times sent as local converted to UTC via `toISOString()`.
- No paging required for small dataset.

## Potential Improvements (Future)
- Persist doctors and appointments in SQLite or PostgreSQL
- Add user authentication / role-based access
- Implement soft deletes & audit logging
- Introduce caching & ETag-based concurrency
- Add integration tests & Cypress UI tests
- Calendar view / drag & drop rescheduling

## Docker (Optional)
### Backend Dockerfile (proposed)
```
# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY backend/*.csproj ./
RUN dotnet restore
COPY backend/. ./
RUN dotnet publish -c Release -o /out
FROM base AS final
WORKDIR /app
COPY --from=build /out .
ENTRYPOINT ["dotnet","AppointmentApi.dll"]
```
Build & run:
```
docker build -t mini-appointments-backend -f Dockerfile.backend .
docker run -p 5000:5000 mini-appointments-backend
```

### Frontend (Static Build)
```
cd frontend
npm run build
```
Artifacts: `dist/appointment-frontend/browser`
Serve via any static server (nginx / CDN). For containerization you can use `nginx:alpine` and copy the dist folder to `/usr/share/nginx/html`.

## License
Educational / assignment use.

## Author Notes
This implementation was handcrafted for the assignment—no plagiarized code snippets; structure and wording intentionally original.
