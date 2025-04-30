const db = require('../config/database');

// Get all candidates with pagination and filtering
exports.getAllCandidates = async (req, res) => {
    try {
        const { draw, start, length, search, order } = req.query;
        const searchValue = search?.value || '';
        
        // Base query
        let query = 'SELECT * FROM table_candidate';
        let countQuery = 'SELECT COUNT(*) as total FROM table_candidate';
        
        // Add search condition if search value exists
        if (searchValue) {
            const searchCondition = ` WHERE full_name LIKE '%${searchValue}%' 
                OR email LIKE '%${searchValue}%' 
                OR phone_number LIKE '%${searchValue}%'`;
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
        
        const [candidates, totalCount] = await Promise.all([
            db.query(query),
            db.query(countQuery)
        ]);
        
        // Return data in the format expected by the frontend
        res.json({
            data: {
                data: candidates[0]
            }
        });
    } catch (error) {
        console.error('Error in getAllCandidates:', error);
        res.status(500).json({ message: error.message });
    }
};

// Helper function to map column index to column name
function getColumnName(index) {
    const columns = [
        'candidate_id',
        'email',
        'phone_number',
        'full_name',
        'dob',
        'pob',
        'gender',
        'year_exp',
        'last_salary'
    ];
    return columns[index] || null;
}

// Get candidate by ID
exports.getCandidateById = async (req, res) => {
    try {
        const [candidate] = await db.query(
            'SELECT * FROM table_candidate WHERE candidate_id = ?',
            [req.params.id]
        );
        
        if (candidate.length === 0) {
            return res.status(404).json({ message: 'Candidate not found' });
        }
        
        res.json(candidate[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new candidate
exports.createCandidate = async (req, res) => {
    try {
        const { email, phone_number, full_name, dob, pob, gender, year_exp, last_salary } = req.body;
        
        // Validate required fields
        if (!email || !full_name || !dob || !pob || !gender || !year_exp) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }
        
        const [result] = await db.query(
            'INSERT INTO table_candidate (email, phone_number, full_name, dob, pob, gender, year_exp, last_salary) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [email, phone_number, full_name, dob, pob, gender, year_exp, last_salary]
        );
        
        res.status(201).json({
            message: 'Candidate created successfully',
            candidate_id: result.insertId
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email or phone number already exists' });
        }
        res.status(500).json({ message: error.message });
    }
};

// Update candidate
exports.updateCandidate = async (req, res) => {
    try {
        const { email, phone_number, full_name, dob, pob, gender, year_exp, last_salary } = req.body;
        
        // Validate required fields
        if (!email || !full_name || !dob || !pob || !gender || !year_exp) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }
        
        const [result] = await db.query(
            'UPDATE table_candidate SET email = ?, phone_number = ?, full_name = ?, dob = ?, pob = ?, gender = ?, year_exp = ?, last_salary = ? WHERE candidate_id = ?',
            [email, phone_number, full_name, dob, pob, gender, year_exp, last_salary, req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Candidate not found' });
        }
        
        res.json({ message: 'Candidate updated successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email or phone number already exists' });
        }
        res.status(500).json({ message: error.message });
    }
};

// Delete candidate
exports.deleteCandidate = async (req, res) => {
    try {
        // Check if candidate has any applications
        const [applications] = await db.query(
            'SELECT * FROM table_applicant WHERE candidate_id = ?',
            [req.params.id]
        );
        
        if (applications.length > 0) {
            return res.status(400).json({ 
                message: 'Cannot delete candidate because they have existing applications. Please delete their applications first.' 
            });
        }
        
        const [result] = await db.query(
            'DELETE FROM table_candidate WHERE candidate_id = ?',
            [req.params.id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Candidate not found' });
        }
        
        res.json({ message: 'Candidate deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 