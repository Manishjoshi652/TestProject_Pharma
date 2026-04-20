# PharmaApp Testing Documentation

## Overview
This document outlines the testing strategy and test cases for the PharmaApp, which consists of an Angular frontend (PharmaApp_UI) and a .NET backend service (ABCPharmacyService).

## Testing Strategy

### 1. Unit Testing
Unit tests focus on individual components, services, and functions in isolation.

#### Frontend Unit Tests (Angular)
- **Framework**: Jasmine + Karma
- **Coverage Target**: 80% minimum
- **Test Location**: `src/app/**/*.spec.ts`

#### Backend Unit Tests (.NET)
- **Framework**: xUnit.net
- **Coverage Target**: 75% minimum
- **Test Location**: `ABCPharmacyService.Tests/`

### 2. Integration Testing
Integration tests verify the interaction between different components and services.

### 3. End-to-End Testing
E2E tests simulate real user scenarios from start to finish.

#### Frontend E2E Tests
- **Framework**: Cypress
- **Test Location**: `cypress/`

## Test Cases

### Medicine List Component Tests

#### Unit Tests
```typescript
// medicine-list.component.spec.ts
describe('MedicineListComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicineListComponent],
      providers: [
        { provide: MedicineService, useValue: mockMedicineService }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load medicines on init', () => {
    spyOn(component, 'loadData');
    component.ngOnInit();
    expect(component.loadData).toHaveBeenCalled();
  });

  it('should filter medicines by search text', () => {
    component.medicines = mockMedicines;
    component.searchText = 'Aspirin';
    const filtered = component.filteredMedicines;
    expect(filtered.length).toBe(1);
    expect(filtered[0].fullName).toContain('Aspirin');
  });

  it('should sort medicines by column', () => {
    component.medicines = mockMedicines;
    component.sortData('fullName');
    expect(component.sortColumn).toBe('fullName');
    expect(component.sortDirection).toBe('asc');
  });

  it('should paginate filtered results', () => {
    component.medicines = Array.from({length: 25}, (_, i) => ({
      id: i + 1,
      fullName: `Medicine ${i + 1}`,
      brand: `Brand ${i + 1}`,
      quantity: 10,
      price: 10.99,
      expiryDate: '2025-12-31'
    }));
    component.itemsPerPage = 10;
    component.currentPage = 1;

    const page1Results = component.filteredMedicines;
    expect(page1Results.length).toBe(10);
    expect(page1Results[0].fullName).toBe('Medicine 1');

    component.currentPage = 2;
    const page2Results = component.filteredMedicines;
    expect(page2Results.length).toBe(10);
    expect(page2Results[0].fullName).toBe('Medicine 11');
  });
});
```

#### E2E Tests
```typescript
// medicine-list.cy.ts
describe('Medicine List', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display medicine list', () => {
    cy.get('.table').should('be.visible');
    cy.get('.table tbody tr').should('have.length.greaterThan', 0);
  });

  it('should search medicines', () => {
    cy.get('.search-input').type('Aspirin');
    cy.get('.table tbody tr').should('have.length', 1);
    cy.get('.table tbody tr td').first().should('contain', 'Aspirin');
  });

  it('should sort by name', () => {
    cy.get('th').contains('Name').click();
    cy.get('.sort-indicator').should('contain', '▲');
  });

  it('should paginate results', () => {
    cy.get('.pagination').should('be.visible');
    cy.get('.pagination .page-link').should('have.length.greaterThan', 1);
  });

  it('should navigate to add medicine page', () => {
    cy.get('.btn-primary').contains('Add Medicine').click();
    cy.url().should('include', '/add');
  });
});
```

### Medicine Service Tests

#### Unit Tests
```typescript
// medicine.service.spec.ts
describe('MedicineService', () => {
  let service: MedicineService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MedicineService]
    });
    service = TestBed.inject(MedicineService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch medicines', () => {
    const mockMedicines = [
      { id: 1, fullName: 'Aspirin', brand: 'Bayer', quantity: 100, price: 9.99, expiryDate: '2025-12-31' }
    ];

    service.getMedicines().subscribe(medicines => {
      expect(medicines).toEqual(mockMedicines);
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/GetMedicines?_t=${jasmine.any(Number)}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockMedicines);
  });

  it('should add medicine', () => {
    const newMedicine = {
      fullName: 'Ibuprofen',
      brand: 'Advil',
      quantity: 50,
      price: 12.99,
      expiryDate: '2025-06-30'
    };

    service.addMedicine(newMedicine).subscribe(response => {
      expect(response).toBeDefined();
    });

    const req = httpMock.expectOne(`${service['apiUrl']}/AddMedicine`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newMedicine);
    req.flush({});
  });
});
```

### Add Medicine Component Tests

#### Unit Tests
```typescript
// add-medicine.component.spec.ts
describe('AddMedicineComponent', () => {
  let component: AddMedicineComponent;
  let fixture: ComponentFixture<AddMedicineComponent>;
  let medicineServiceSpy: jasmine.SpyObj<MedicineService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('MedicineService', ['addMedicine']);

    await TestBed.configureTestingModule({
      imports: [AddMedicineComponent, ReactiveFormsModule],
      providers: [
        { provide: MedicineService, useValue: spy },
        { provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate']) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddMedicineComponent);
    component = fixture.componentInstance;
    medicineServiceSpy = TestBed.inject(MedicineService) as jasmine.SpyObj<MedicineService>;
  });

  it('should create form with required fields', () => {
    expect(component.medicineForm).toBeDefined();
    expect(component.medicineForm.get('fullName')).toBeDefined();
    expect(component.medicineForm.get('brand')).toBeDefined();
    expect(component.medicineForm.get('quantity')).toBeDefined();
    expect(component.medicineForm.get('price')).toBeDefined();
    expect(component.medicineForm.get('expiryDate')).toBeDefined();
  });

  it('should validate required fields', () => {
    const form = component.medicineForm;
    expect(form.valid).toBeFalsy();

    form.patchValue({
      fullName: 'Test Medicine',
      brand: 'Test Brand',
      quantity: 10,
      price: 15.99,
      expiryDate: '2025-12-31'
    });

    expect(form.valid).toBeTruthy();
  });

  it('should submit valid form', () => {
    const formData = {
      fullName: 'Test Medicine',
      brand: 'Test Brand',
      quantity: 10,
      price: 15.99,
      expiryDate: '2025-12-31'
    };

    component.medicineForm.patchValue(formData);
    medicineServiceSpy.addMedicine.and.returnValue(of({}));

    component.onSubmit();

    expect(medicineServiceSpy.addMedicine).toHaveBeenCalledWith(formData);
  });
});
```

### Backend API Tests

#### Unit Tests (.NET)
```csharp
// MedicinesControllerTests.cs
using Xunit;
using Moq;
using ABCPharmacyService.Controllers;
using ABCPharmacyService.Models;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Linq;

namespace ABCPharmacyService.Tests
{
    public class MedicinesControllerTests
    {
        private readonly Mock<IMedicineRepository> _mockRepo;
        private readonly MedicinesController _controller;

        public MedicinesControllerTests()
        {
            _mockRepo = new Mock<IMedicineRepository>();
            _controller = new MedicinesController(_mockRepo.Object);
        }

        [Fact]
        public void GetMedicines_ReturnsAllMedicines()
        {
            // Arrange
            var medicines = new List<Medicine>
            {
                new Medicine { Id = 1, FullName = "Aspirin", Brand = "Bayer", Quantity = 100, Price = 9.99M, ExpiryDate = DateTime.Parse("2025-12-31") },
                new Medicine { Id = 2, FullName = "Ibuprofen", Brand = "Advil", Quantity = 50, Price = 12.99M, ExpiryDate = DateTime.Parse("2025-06-30") }
            };

            _mockRepo.Setup(repo => repo.GetAllMedicines()).Returns(medicines);

            // Act
            var result = _controller.GetMedicines();

            // Assert
            var actionResult = Assert.IsType<ActionResult<IEnumerable<Medicine>>>(result);
            var returnValue = Assert.IsType<List<Medicine>>(actionResult.Value);
            Assert.Equal(2, returnValue.Count);
        }

        [Fact]
        public void AddMedicine_ValidMedicine_ReturnsCreatedResult()
        {
            // Arrange
            var medicine = new Medicine
            {
                FullName = "Paracetamol",
                Brand = "Generic",
                Quantity = 200,
                Price = 5.99M,
                ExpiryDate = DateTime.Parse("2026-01-15")
            };

            _mockRepo.Setup(repo => repo.AddMedicine(It.IsAny<Medicine>())).Returns(medicine);

            // Act
            var result = _controller.AddMedicine(medicine);

            // Assert
            var actionResult = Assert.IsType<CreatedAtActionResult>(result);
            var returnValue = Assert.IsType<Medicine>(actionResult.Value);
            Assert.Equal("Paracetamol", returnValue.FullName);
        }

        [Fact]
        public void AddMedicine_InvalidMedicine_ReturnsBadRequest()
        {
            // Arrange
            var medicine = new Medicine(); // Empty medicine
            _controller.ModelState.AddModelError("FullName", "Required");

            // Act
            var result = _controller.AddMedicine(medicine);

            // Assert
            Assert.IsType<BadRequestObjectResult>(result);
        }
    }
}
```

## Test Data

### Mock Data for Testing
```typescript
// mock-medicines.ts
export const mockMedicines = [
  {
    id: 1,
    fullName: 'Aspirin 100mg',
    brand: 'Bayer',
    quantity: 150,
    price: 9.99,
    expiryDate: '2025-12-31'
  },
  {
    id: 2,
    fullName: 'Ibuprofen 200mg',
    brand: 'Advil',
    quantity: 75,
    price: 12.99,
    expiryDate: '2025-06-30'
  },
  {
    id: 3,
    fullName: 'Paracetamol 500mg',
    brand: 'Tylenol',
    quantity: 200,
    price: 7.49,
    expiryDate: '2026-01-15'
  },
  {
    id: 4,
    fullName: 'Amoxicillin 250mg',
    brand: 'Generic',
    quantity: 50,
    price: 15.99,
    expiryDate: '2024-12-01'
  },
  {
    id: 5,
    fullName: 'Omeprazole 20mg',
    brand: 'Prilosec',
    quantity: 30,
    price: 18.99,
    expiryDate: '2025-08-20'
  }
];
```

## Running Tests

### Frontend Tests
```bash
# Unit tests
npm run test

# E2E tests
npm run e2e

# Test coverage
npm run test:coverage
```

### Backend Tests
```bash
# Run unit tests
dotnet test

# Run with coverage
dotnet test /p:CollectCoverage=true
```

## Continuous Integration

### GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm run test:ci
      - name: Run E2E tests
        run: npm run e2e:ci

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0.x'
      - name: Restore dependencies
        run: dotnet restore
      - name: Run tests
        run: dotnet test --verbosity normal
```

## Test Coverage Requirements

- **Frontend**: Minimum 80% coverage
- **Backend**: Minimum 75% coverage
- **Critical paths**: 90%+ coverage

## Performance Testing

### Load Testing Scenarios
1. **Concurrent Users**: 100 simultaneous users
2. **API Response Time**: < 500ms for 95th percentile
3. **Database Query Performance**: < 100ms average

### Tools
- **Frontend**: Lighthouse, WebPageTest
- **Backend**: Apache JMeter, k6
- **Database**: SQL Server Profiler

## Accessibility Testing

### WCAG 2.1 AA Compliance
- Keyboard navigation
- Screen reader compatibility
- Color contrast ratios
- Focus management

### Testing Tools
- axe-core
- WAVE
- Lighthouse Accessibility audit

## Security Testing

### Frontend Security
- XSS prevention
- CSRF protection
- Input validation
- Secure headers

### API Security
- Authentication/Authorization
- Input sanitization
- Rate limiting
- SQL injection prevention

## Test Environments

### Development
- Local development environment
- Hot reload enabled
- Debug logging

### Staging
- Production-like environment
- Automated deployments
- Full test suite execution

### Production
- Live environment monitoring
- Error tracking (Sentry)
- Performance monitoring

## Bug Reporting Template

```
**Title:** [Component] Brief description of the issue

**Environment:**
- Browser: [Chrome/Firefox/Safari/Edge]
- OS: [Windows/macOS/Linux]
- Device: [Desktop/Mobile/Tablet]

**Steps to Reproduce:**
1. Navigate to [page/component]
2. Perform [action]
3. Observe [expected vs actual behavior]

**Expected Result:**
[Describe what should happen]

**Actual Result:**
[Describe what actually happens]

**Screenshots/Logs:**
[Attach relevant files]

**Additional Context:**
[Any other relevant information]
```

## Maintenance

### Test Maintenance Schedule
- **Daily**: Automated test execution
- **Weekly**: Manual exploratory testing
- **Monthly**: Performance testing
- **Quarterly**: Security testing

### Test Data Management
- Regular refresh of test data
- Anonymized production data for testing
- Automated test data generation

This testing documentation provides a comprehensive framework for ensuring the quality and reliability of the PharmaApp. Regular execution of these tests will help maintain high code quality and catch issues early in the development process.