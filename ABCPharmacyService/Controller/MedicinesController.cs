using Microsoft.AspNetCore.Mvc;
using ABCPharmacyService.Model;
using ABCPharmacyService.Services;


namespace ABCPharmacy.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MedicinesController : ControllerBase
    {
        private readonly MedicineService _service;

        public MedicinesController()
        {
            _service = new MedicineService();
        }

        [HttpGet]
        [Route("GetMedicines")]
        public IActionResult GetMedicines()
        {
            return Ok(_service.GetAll());
        }

        [HttpPost]
        [Route("AddMedicine")]
        public IActionResult AddMedicine([FromBody] Medicine medicine)
        {
            _service.Add(medicine);
            return Ok();
        }
    }
}