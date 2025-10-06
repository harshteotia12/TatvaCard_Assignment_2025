using AppointmentApi.Models;
using Microsoft.EntityFrameworkCore;

namespace AppointmentApi.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
        public DbSet<Appointment> Appointments => Set<Appointment>();
    }
}
