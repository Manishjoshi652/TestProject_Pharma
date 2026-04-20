using System.Text.Json;
using ABCPharmacyService.Model;

namespace ABCPharmacyService.Services
{
    public class MedicineService
    {
        private readonly string _filePath = "Data/medicines.json";

        public List<Medicine> GetAll()
        {
            if (!File.Exists(_filePath))
                return new List<Medicine>();

            var json = File.ReadAllText(_filePath);
            return JsonSerializer.Deserialize<List<Medicine>>(json) ?? new List<Medicine>();
        }

        public void Add(Medicine medicine)
        {
            var medicines = GetAll();
            medicine.Id = medicines.Count + 1;
            medicines.Add(medicine);

            var json = JsonSerializer.Serialize(medicines, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_filePath, json);
        }
    }
}