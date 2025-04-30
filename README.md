# Jobseeker Backend API Documentation

## Overview
This is the backend API for the Jobseeker application, built with Node.js, Express, and MySQL. The API provides endpoints for managing candidates, vacancies, and job applications.

## Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/daws11/jobseeker-server.git
cd jobseeker-server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=jobseeker_db
PORT=3000
```

4. Create the database and run migrations:
```bash
mysql -u root -p < database/schema.sql
```
Note: if you cannot run the command `mysql -u root -p < database/schema.sql` you can write schema.sql manually to phpmyadmin

5. Start the server:
```bash
npm start
```

## API Endpoints

### Candidates

#### Get All Candidates
```http
GET /api/candidates
```
Response:
```json
{
  "status": "success",
  "data": [
    {
      "candidate_id": 1,
      "full_name": "John Doe",
      "email": "john@example.com",
      "phone_number": "081234567890",
      "dob": "1990-01-01",
      "pob": "Jakarta",
      "gender": "Male",
      "year_exp": 5,
      "last_salary": 10000000
    }
  ]
}
```

#### Create Candidate
```http
POST /api/candidates
```
Request Body:
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone_number": "081234567890",
  "dob": "1990-01-01",
  "pob": "Jakarta",
  "gender": "Male",
  "year_exp": 5,
  "last_salary": 10000000
}
```

#### Update Candidate
```http
PUT /api/candidates/:id
```
Request Body:
```json
{
  "full_name": "John Doe Updated",
  "email": "john.updated@example.com",
  "phone_number": "081234567890",
  "dob": "1990-01-01",
  "pob": "Jakarta",
  "gender": "Male",
  "year_exp": 6,
  "last_salary": 12000000
}
```

#### Delete Candidate
```http
DELETE /api/candidates/:id
```

### Vacancies

#### Get All Vacancies
```http
GET /api/vacancies
```
Response:
```json
{
  "status": "success",
  "data": [
    {
      "vacancy_id": 1,
      "vacancy_name": "Senior Developer",
      "min_exp": 3,
      "max_age": 35,
      "salary": 15000000,
      "description": "Looking for experienced developer",
      "publish_date": "2024-01-01",
      "expired_date": "2024-12-31",
      "flag_status": 1
    }
  ]
}
```

#### Create Vacancy
```http
POST /api/vacancies
```
Request Body:
```json
{
  "vacancy_name": "Senior Developer",
  "min_exp": 3,
  "max_age": 35,
  "salary": 15000000,
  "description": "Looking for experienced developer",
  "publish_date": "2024-01-01",
  "expired_date": "2024-12-31",
  "flag_status": 1
}
```

#### Update Vacancy
```http
PUT /api/vacancies/:id
```
Request Body:
```json
{
  "vacancy_name": "Senior Developer Updated",
  "min_exp": 4,
  "max_age": 40,
  "salary": 18000000,
  "description": "Updated job description",
  "publish_date": "2024-01-01",
  "expired_date": "2024-12-31",
  "flag_status": 1
}
```

#### Delete Vacancy
```http
DELETE /api/vacancies/:id
```

### Applications

#### Get All Applications
```http
GET /api/applicants
```
Response:
```json
{
  "status": "success",
  "data": [
    {
      "applicant_id": 1,
      "candidate_id": 1,
      "vacancy_id": 1,
      "apply_date": "2024-01-15",
      "apply_status": 0
    }
  ]
}
```

#### Create Application
```http
POST /api/applicants
```
Request Body:
```json
{
  "candidate_id": 1,
  "vacancy_id": 1,
  "apply_date": "2024-01-15",
  "apply_status": 0
}
```

#### Update Application Status
```http
PUT /api/applicants/:id/status
```
Request Body:
```json
{
  "apply_status": 1
}
```

#### Delete Application
```http
DELETE /api/applicants/:id
```

## Status Codes

- 200: Success
- 201: Created
- 400: Bad Request
- 404: Not Found
- 500: Internal Server Error

## Application Status Codes

- 0: Pending
- 1: Accepted
- 2: Rejected

## Vacancy Status Codes

- 0: Inactive
- 1: Active

## Error Handling

All error responses follow this format:
```json
{
  "status": "error",
  "message": "Error message here"
}
```

## Database Schema

### Candidates Table
```sql
CREATE TABLE candidates (
  candidate_id INT PRIMARY KEY AUTO_INCREMENT,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  dob DATE NOT NULL,
  pob VARCHAR(100) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  year_exp INT NOT NULL,
  last_salary DECIMAL(15,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Vacancies Table
```sql
CREATE TABLE vacancies (
  vacancy_id INT PRIMARY KEY AUTO_INCREMENT,
  vacancy_name VARCHAR(100) NOT NULL,
  min_exp INT NOT NULL,
  max_age INT NOT NULL,
  salary DECIMAL(15,2) NOT NULL,
  description TEXT NOT NULL,
  publish_date DATE NOT NULL,
  expired_date DATE NOT NULL,
  flag_status TINYINT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Applicants Table
```sql
CREATE TABLE applicants (
  applicant_id INT PRIMARY KEY AUTO_INCREMENT,
  candidate_id INT NOT NULL,
  vacancy_id INT NOT NULL,
  apply_date DATE NOT NULL,
  apply_status TINYINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (candidate_id) REFERENCES candidates(candidate_id),
  FOREIGN KEY (vacancy_id) REFERENCES vacancies(vacancy_id)
);
```
