using AppointmentApi.Data;
using AppointmentApi.Models;
using Microsoft.EntityFrameworkCore;

namespace AppointmentApi.Services
{
    public class AppointmentService : IAppointmentService
    {
        readonly AppDbContext _db;
        public AppointmentService(AppDbContext db) { _db = db; }

        public Task<List<Appointment>> GetAll() => _db.Appointments.OrderBy(a => a.StartTime).ToListAsync();
        public Task<Appointment?> Get(int id) => _db.Appointments.FirstOrDefaultAsync(a => a.Id == id);

        public async Task<(bool ok, string? error, Appointment? created)> Create(Appointment a)
        {
            var err = Validate(a, null);
            if (err != null) return (false, err, null);
            _db.Appointments.Add(a);
            await _db.SaveChangesAsync();
            return (true, null, a);
        }

        public async Task<(bool ok, string? error)> Update(int id, Appointment a)
        {
            var existing = await Get(id);
            if (existing == null) return (false, "Not found");
            a.Id = id;
            var err = Validate(a, id);
            if (err != null) return (false, err);
            existing.PatientName = a.PatientName;
            existing.StartTime = a.StartTime;
            existing.EndTime = a.EndTime;
            existing.DoctorName = a.DoctorName;
            await _db.SaveChangesAsync();
            return (true, null);
        }

        public async Task<bool> Delete(int id)
        {
            var existing = await Get(id);
            if (existing == null) return false;
            _db.Appointments.Remove(existing);
            await _db.SaveChangesAsync();
            return true;
        }

        string? Validate(Appointment a, int? updatingId)
        {
            if (string.IsNullOrWhiteSpace(a.PatientName) || string.IsNullOrWhiteSpace(a.DoctorName)) return "PatientName and DoctorName required";
            if (a.EndTime <= a.StartTime) return "EndTime must be after StartTime";
            // Enforce next-day rule: appointments must be scheduled strictly after today
            var todayUtc = DateTime.UtcNow.Date;
            if (a.StartTime.Date <= todayUtc) return "Appointments must be booked from tomorrow onward";
            var overlap = _db.Appointments.Any(x => x.DoctorName == a.DoctorName && x.Id != updatingId && a.StartTime < x.EndTime && a.EndTime > x.StartTime);
            if (overlap) return "Overlapping appointment for doctor";
            return null;
        }
    }
}
