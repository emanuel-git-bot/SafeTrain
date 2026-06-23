## ADDED Requirements

### Requirement: Employee Search Fix
The B2B Dashboard SHALL successfully list and filter the company's registered students by fetching from the backend.

#### Scenario: Filtering students
- **WHEN** a company manager types a name in the employee search field
- **THEN** the dashboard filters and displays the matching company students.

### Requirement: B2B Plans & Checkout Simulator
The system SHALL present predefined plans and a custom plan simulator for companies to purchase vouchers.

#### Scenario: Selecting a predefined plan
- **WHEN** a company clicks to purchase a 50-voucher plan
- **THEN** the system displays the total price and moves to checkout.

### Requirement: Discount Coupons
The system SHALL allow admins to create coupons and companies to apply them at checkout.

#### Scenario: Admin creates a coupon
- **WHEN** an admin creates a coupon with a 20% discount
- **THEN** the coupon is saved in the database.

#### Scenario: Company applies a valid coupon
- **WHEN** a company applies the coupon at the voucher checkout
- **THEN** the total price is reduced by the coupon's value.
