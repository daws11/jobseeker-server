const db = require('../config/database');

// Get all vacancies with pagination and filtering
exports.getAllVacancies = async (req, res) => {
    try {
        const { draw, start, length, search, order } = req.query;
        const searchValue = search?.value || '';
        
        // Base query
        let query = 'SELECT * FROM table_vacancy';
        let countQuery = 'SELECT COUNT(*) as total FROM table_vacancy';
        
        // Add search condition if search value exists
        if (searchValue) {
            const searchCondition = ` WHERE vacancy_name LIKE '%${searchValue}%' 
                OR description LIKE '%${searchValue}%'`;
            query += searchCondition;
            countQuery += searchCondition;
        }
        
        // Add sorting if order parameters exist
        if (order && order[0]) {
            const columnIndex = order[0].column;
            const columnName = getColumnName(columnIndex);
            const direction = order[0].dir.toUpperCase();
            
            if (columnName) {
                query += ` ORDER BY ${columnName} ${direction}`;
            }
        }
        
        // Add pagination if DataTables parameters are provided
        if (start !== undefined && length !== undefined) {
            query += ` LIMIT ${start}, ${length}`;
        }
        
        const [vacancies, totalCount] = await Promise.all([
            db.query(query),
            db.query(countQuery)
        ]);
        
        // Return data in the format expected by the frontend
        res.json({
            data: {
                data: vacancies[0]
            }
        });
    } catch (error) {
        console.error('Error in getAllVacancies:', error);
        res.status(500).json({ message: error.message });
    }
};

// Helper function to map column index to column name
function getColumnName(index) {
    const columns = [
        'vacancy_id',
        'vacancy_name',
        'min_exp',
        'max_age',
        'salary',
        'description',
        'publish_date',
        'expired_date',
        'flag_status'
    ];
    return columns[index] || null;
}

// Get vacancy by ID
exports.getVacancyById = async (req, res) => {
    try {
        const [vacancy] = await db.query(
            'SELECT * FROM table_vacancy WHERE vacancy_id = ?',
            [req.params.id]
        );
        
        if (vacancy.length === 0) {
            return res.status(404).json({ message: 'Vacancy not found' });
        }
        
        res.json(vacancy[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new vacancy
exports.createVacancy = async (req, res) => {
    try {
        const { 
            vacancy_name, 
            min_exp, 
            max_age, 
            salary, 
            description, 
            publish_date 
        } = req.body;
        
        // Validate required fields
        if (!vacancy_name || !min_exp || !salary || !description || !publish_date) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }
        
        // Calculate expired_date (60 days from publish_date)
        const expired_date = new Date(publish_date);
        expired_date.setDate(expired_date.getDate() + 60);
        
        const [result] = await db.query(
            'INSERT INTO table_vacancy (vacancy_name, min_exp, max_age, salary, description, publish_date, expired_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [vacancy_name, min_exp, max_age, salary, description, publish_date, expired_date]
        );
        
        res.status(201).json({
            message: 'Vacancy created successfully',
            vacancy_id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update vacancy
exports.updateVacancy = async (req, res) => {
    try {
        const { 
            vacancy_name, 
            min_exp, 
            max_age, 
            salary, 
            description, 
            publish_date,
            flag_status 
        } = req.body;
        
        // Validate required fields
        if (!vacancy_name || !min_exp || !salary || !description || !publish_date) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }
        
        // Calculate expired_date (60 days from publish_date)
        const expired_date = new Date(publish_date);
        expired_date.setDate(expired_date.getDate() + 60);
        
        const [result] = await db.query(
            'UPDATE table_vacancy SET vacancy_name = ?, min_exp = ?, max_age = ?, salary = ?, description = ?, publish_date = ?, expired_date = ?, flag_status = ? WHERE vacancy_id = ?',
            [vacancy_name, min_exp, max_age, salary, description, publish_date, expired_date, flag_status, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vacancy not found' });
        }
        
        res.json({ message: 'Vacancy updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete vacancy
exports.deleteVacancy = async (req, res) => {
    try {
        // Check if vacancy has any applications
        const [applications] = await db.query(
            'SELECT * FROM table_applicant WHERE vacancy_id = ?',
            [req.params.id]
        );
        
        if (applications.length > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete vacancy because it has existing applications. Please delete the applications first.' 
            });
        }
        
        const [result] = await db.query(
            'DELETE FROM table_vacancy WHERE vacancy_id = ?',
            [req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Vacancy not found' });
        }
        
        res.json({ message: 'Vacancy deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 