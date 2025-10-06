using AppointmentApi.Models;

namespace AppointmentApi.Services
{
    public interface IAppointmentService
    {
        Task<List<Appointment>> GetAll();
        Task<Appointment?> Get(int id);
        Task<(bool ok, string? error, Appointment? created)> Create(Appointment a);
        Task<(bool ok, string? error)> Update(int id, Appointment a);
        Task<bool> Delete(int id);
    }
}
