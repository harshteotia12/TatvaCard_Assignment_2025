using AppointmentApi.Models;
using AppointmentApi.Services;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("appointments")]
public class AppointmentsController : ControllerBase
{
    readonly IAppointmentService _svc;
    public AppointmentsController(IAppointmentService svc) { _svc = svc; }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Appointment>>> All() => await _svc.GetAll();

    [HttpGet("{id}")]
    public async Task<ActionResult<Appointment>> One(int id)
    {
        var a = await _svc.Get(id);
        if (a == null) return NotFound();
        return a;
    }

    [HttpPost]
    public async Task<ActionResult<Appointment>> Create(AppointmentDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var a = new Appointment { PatientName = dto.PatientName, DoctorName = dto.DoctorName, StartTime = dto.StartTime, EndTime = dto.EndTime };
        var (ok, error, created) = await _svc.Create(a);
        if (!ok) return BadRequest(new { error });
        return CreatedAtAction(nameof(One), new { id = created!.Id }, created);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, AppointmentDto dto)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var a = new Appointment { PatientName = dto.PatientName, DoctorName = dto.DoctorName, StartTime = dto.StartTime, EndTime = dto.EndTime };
        var (ok, error) = await _svc.Update(id, a);
        if (!ok) return error == "Not found" ? NotFound() : BadRequest(new { error });
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var ok = await _svc.Delete(id);
        if (!ok) return NotFound();
        return NoContent();
    }
}