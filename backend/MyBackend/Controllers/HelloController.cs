using Microsoft.AspNetCore.Mvc;

namespace MyBackend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HelloController : ControllerBase
{
    [HttpGet]
    public IActionResult Get()
    {
        return Ok(new
        {
            message = "Hello from ASP.NET Core",
            time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss")
        });
    }
}