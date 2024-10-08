const createStudentTable = `
CREATE TABLE student (
    student_serial SERIAL PRIMARY KEY,        -- Automatically increments for each student
    student_id VARCHAR(50) UNIQUE NOT NULL,   -- Unique student identifier
    username VARCHAR(50) UNIQUE NOT NULL,     -- Username, must be unique
    email_id VARCHAR(100) UNIQUE NOT NULL,    -- Email ID, must be unique
    password VARCHAR(100) NOT NULL,           -- Password
    first_name VARCHAR(50) NOT NULL,          -- First name
    middle_name VARCHAR(50),                  -- Middle name (optional)
    last_name VARCHAR(50) NOT NULL,           -- Last name
    department VARCHAR(100),                  -- Department name
    programme VARCHAR(100) DEFAULT 'B-TECH',                   -- Programme (degree/course)
    batch VARCHAR(20),                        -- Batch (year or group)
    resume JSONB,                             -- Resume as JSON (array of resume IDs)
    description TEXT,                         -- Description or bio
    gender ENUM('male', 'female', 'others', 'prefer_not_to_say') DEFAULT 'prefer_not_to_say',  -- Gender ENUM
    skills JSON,                             -- Skills stored as JSON (array of strings)
    resources JSON                           -- Resources (GitHub, LinkedIn, etc.) as JSON
);
`;

export function createStudentInsertQuery(student) {
    return `
    INSERT INTO student (
        student_id, username, email_id, password, first_name, middle_name, last_name, 
        department, programme, batch, resume, description, gender, skills, resources
    ) VALUES (
        '${student.student_id}', 
        '${student.username}', 
        '${student.email_id}', 
        '${student.password}', 
        '${student.first_name}', 
        '${student.middle_name || ""}', 
        '${student.last_name || ""}', 
        '${student.department || ""}', 
        '${student.programme || ""}', 
        '${student.batch || ""}', 
        '${JSON.stringify(student.resume || [])}',  -- Ensure resume is stored as JSON
        '${student.description || ""}', 
        '${student.gender || "prefer_not_to_say"}',  -- Default gender if not provided
        '${JSON.stringify(student.skills || [])}',   -- Ensure skills are stored as JSON
        '${JSON.stringify(student.resources || {})}' -- Ensure resources (e.g., GitHub, LinkedIn) are stored as JSON
    );
    `;
}

export const searchStudentByUsernameOrEmailQuery = `
    SELECT * FROM student
    WHERE email = $1 OR username = $2;
    `;
