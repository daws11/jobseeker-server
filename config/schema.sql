CREATE DATABASE IF NOT EXISTS jobseeker_db;
USE jobseeker_db;

CREATE TABLE IF NOT EXISTS table_candidate (
    candidate_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(20) UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    dob VARCHAR(10) NOT NULL,
    pob VARCHAR(255) NOT NULL,
    gender VARCHAR(1) NOT NULL,
    year_exp VARCHAR(10) NOT NULL,
    last_salary VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS table_vacancy (
    vacancy_id INT PRIMARY KEY AUTO_INCREMENT,
    vacancy_name VARCHAR(255) NOT NULL,
    min_exp INT NOT NULL,
    max_age INT,
    salary VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    publish_date DATETIME NOT NULL,
    expired_date DATETIME NOT NULL,
    flag_status INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS table_applicant (
    applicant_id INT PRIMARY KEY AUTO_INCREMENT,
    vacancy_id INT NOT NULL,
    candidate_id INT NOT NULL,
    apply_date DATETIME NOT NULL,
    apply_status INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (vacancy_id) REFERENCES table_vacancy(vacancy_id),
    FOREIGN KEY (candidate_id) REFERENCES table_candidate(candidate_id)
); 

-- Insert dummy data for table_candidate
INSERT INTO table_candidate (email, phone_number, full_name, dob, pob, gender, year_exp, last_salary) VALUES
('john.doe@email.com', '081234567890', 'John Doe', '1990-05-15', 'Jakarta', 'M', '5', '15000000'),
('jane.smith@email.com', '082345678901', 'Jane Smith', '1992-08-20', 'Bandung', 'F', '3', '12000000'),
('michael.brown@email.com', '083456789012', 'Michael Brown', '1988-11-10', 'Surabaya', 'M', '8', '20000000'),
('sarah.wilson@email.com', '084567890123', 'Sarah Wilson', '1995-03-25', 'Yogyakarta', 'F', '2', '10000000'),
('david.jones@email.com', '085678901234', 'David Jones', '1991-07-30', 'Medan', 'M', '4', '13000000');

-- Insert dummy data for table_vacancy
INSERT INTO table_vacancy (vacancy_name, min_exp, max_age, salary, description, publish_date, expired_date, flag_status) VALUES
('Senior Software Engineer', 5, 35, '20000000 - 30000000', 'Looking for experienced software engineer with strong Java and Spring Boot skills', '2024-03-01 00:00:00', '2024-04-30 00:00:00', 1),
('Frontend Developer', 2, 30, '15000000 - 20000000', 'Seeking frontend developer with React and TypeScript experience', '2024-03-05 00:00:00', '2024-05-04 00:00:00', 1),
('DevOps Engineer', 3, 35, '18000000 - 25000000', 'DevOps engineer position with AWS and Docker experience required', '2024-03-10 00:00:00', '2024-05-09 00:00:00', 1),
('UI/UX Designer', 2, 30, '12000000 - 18000000', 'Creative UI/UX designer with portfolio and Figma experience', '2024-03-15 00:00:00', '2024-05-14 00:00:00', 1),
('Product Manager', 4, 35, '25000000 - 35000000', 'Product manager with agile methodology and team leadership experience', '2024-03-20 00:00:00', '2024-05-19 00:00:00', 1);

-- Insert dummy data for table_applicant
INSERT INTO table_applicant (vacancy_id, candidate_id, apply_date, apply_status) VALUES
(1, 1, '2024-03-02 10:00:00', 0),  -- John Doe applied for Senior Software Engineer (Pending)
(1, 3, '2024-03-03 11:30:00', 1),  -- Michael Brown applied for Senior Software Engineer (Processed)
(2, 2, '2024-03-06 09:15:00', 2),  -- Jane Smith applied for Frontend Developer (Passed)
(2, 4, '2024-03-07 14:20:00', 3),  -- Sarah Wilson applied for Frontend Developer (Failed)
(3, 5, '2024-03-11 16:45:00', 0),  -- David Jones applied for DevOps Engineer (Pending)
(3, 1, '2024-03-12 13:10:00', 1),  -- John Doe applied for DevOps Engineer (Processed)
(4, 2, '2024-03-16 15:30:00', 2),  -- Jane Smith applied for UI/UX Designer (Passed)
(5, 3, '2024-03-21 11:00:00', 0);  -- Michael Brown applied for Product Manager (Pending)