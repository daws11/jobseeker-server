const db = require('../config/database');

// Get all applicants with pagination and filtering
exports.getAllApplicants = async (req, res) => {
    try {
        const { draw, start, length, search, order } = req.query;
        const searchValue = search?.value || '';
        
        // Base query with joins to get candidate and vacancy information
        let query = `
            SELECT a.*, 
                   c.full_name as candidate_name, 
                   v.vacancy_name,
                   CASE 
                       WHEN a.apply_status = 0 THEN 'Pending'
                       WHEN a.apply_status = 1 THEN 'Processed'
                       WHEN a.apply_status = 2 THEN 'Passed'
                       WHEN a.apply_status = 3 THEN 'Failed'
                   END as status_text
            FROM table_applicant a
            JOIN table_candidate c ON a.candidate_id = c.candidate_id
            JOIN table_vacancy v ON a.vacancy_id = v.vacancy_id
        `;
        
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM table_applicant a
            JOIN table_candidate c ON a.candidate_id = c.candidate_id
            JOIN table_vacancy v ON a.vacancy_id = v.vacancy_id
        `;
        
        // Add search condition if search value exists
        if (searchValue) {
            const searchCondition = ` WHERE c.full_name LIKE '%${searchValue}%' 
                OR v.vacancy_name LIKE '%${searchValue}%'`;
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
        
        const [applicants, totalCount] = await Promise.all([
            db.query(query),
            db.query(countQuery)
        ]);
        
        // If DataTables parameters are provided, return DataTables format
        if (draw !== undefined) {
            return res.json({
                draw: parseInt(draw),
                recordsTotal: totalCount[0][0].total,
                recordsFiltered: totalCount[0][0].total,
                data: applicants[0]
            });
        }
        
        // Otherwise, return simple array of applicants
        res.json(applicants[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Helper function to map column index to column name
function getColumnName(index) {
    const columns = [
        'applicant_id',
        'candidate_name',
        'vacancy_name',
        'apply_date',
        'status_text'
    ];
    return columns[index] || null;
}

// Get applicant by ID
exports.getApplicantById = async (req, res) => {
    try {
        const [applicant] = await db.query(
            `SELECT a.*, 
                    c.full_name as candidate_name, 
                    v.vacancy_name,
                    CASE 
                        WHEN a.apply_status = 0 THEN 'Pending'
                        WHEN a.apply_status = 1 THEN 'Processed'
                        WHEN a.apply_status = 2 THEN 'Passed'
                        WHEN a.apply_status = 3 THEN 'Failed'
                    END as status_text
             FROM table_applicant a
             JOIN table_candidate c ON a.candidate_id = c.candidate_id
             JOIN table_vacancy v ON a.vacancy_id = v.vacancy_id
             WHERE a.applicant_id = ?`,
            [req.params.id]
        );
        
        if (applicant.length === 0) {
            return res.status(404).json({ message: 'Applicant not found' });
        }
        
        res.json(applicant[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new applicant
exports.createApplicant = async (req, res) => {
    try {
        const { vacancy_id, candidate_id } = req.body;
        
        // Validate required fields
        if (!vacancy_id || !candidate_id) {
            return res.status(400).json({ message: 'Vacancy ID and Candidate ID are required' });
        }
        
        // Check if vacancy exists and is active
        const [vacancy] = await db.query(
            'SELECT * FROM table_vacancy WHERE vacancy_id = ? AND flag_status = 1 AND expired_date > NOW()',
            [vacancy_id]
        );
        
        if (vacancy.length === 0) {
            return res.status(400).json({ message: 'Vacancy not found or not active' });
        }
        
        // Check if candidate exists
        const [candidate] = await db.query(
            'SELECT * FROM table_candidate WHERE candidate_id = ?',
            [candidate_id]
        );
        
        if (candidate.length === 0) {
            return res.status(400).json({ message: 'Candidate not found' });
        }
        
        // Check if candidate has already applied for this vacancy
        const [existingApplication] = await db.query(
            'SELECT * FROM table_applicant WHERE vacancy_id = ? AND candidate_id = ?',
            [vacancy_id, candidate_id]
        );
        
        if (existingApplication.length > 0) {
            return res.status(400).json({ message: 'Candidate has already applied for this vacancy' });
        }
        
        const [result] = await db.query(
            'INSERT INTO table_applicant (vacancy_id, candidate_id, apply_date, apply_status) VALUES (?, ?, NOW(), 0)',
            [vacancy_id, candidate_id]
        );
        
        res.status(201).json({
            message: 'Application submitted successfully',
            applicant_id: result.insertId
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update applicant status
exports.updateApplicantStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        // Validate status
        if (![0, 1, 2, 3].includes(parseInt(status))) {
            return res.status(400).json({ message: 'Invalid status value' });
        }
        
        const [result] = await db.query(
            'UPDATE table_applicant SET apply_status = ? WHERE applicant_id = ?',
            [status, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Applicant not found' });
        }
        
        res.json({ message: 'Application status updated successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete applicant
exports.deleteApplicant = async (req, res) => {
    try {
        // Check if applicant exists
        const [applicant] = await db.query(
            'SELECT * FROM table_applicant WHERE applicant_id = ?',
            [req.params.id]
        );
        
        if (applicant.length === 0) {
            return res.status(404).json({ message: 'Applicant not found' });
        }
        
        const [result] = await db.query(
            'DELETE FROM table_applicant WHERE applicant_id = ?',
            [req.params.id]
        );
        
        res.json({ message: 'Application deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 