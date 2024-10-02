const createProfStatusENUM = `CREATE TYPE professor_status AS ENUM ('ACTIVE', 'INACTIVE', 'NR');`
const createProfTable = `
CREATE TABLE professor (
    prof_id SERIAL PRIMARY KEY, 
    username VARCHAR(100) UNIQUE NOT NULL,     -- Unique username for each professor (required)
    password VARCHAR(255) NOT NULL,            -- Professor's password (required)
    title VARCHAR(100),                        -- Professor's title (optional)
    first_name VARCHAR(100) NOT NULL,          -- Professor's first name (required)
    middle_name VARCHAR(100),                  -- Professor's middle name (optional)
    last_name VARCHAR(100),                    -- Professor's last name (optional)
    email VARCHAR(150) UNIQUE NOT NULL,        -- Professor's email, must be unique (required)
    office_phone VARCHAR(20),                  -- Professor's office phone (optional)
    department VARCHAR(150) NOT NULL,          -- Department to which the professor belongs (required)
    office_location VARCHAR(150),              -- Office location of the professor (optional)
    research_area TEXT,                        -- A brief description of research areas (optional)
    bio TEXT,                                  -- Professor's biography (optional)
    profile_picture_url TEXT DEFAULT 'prof_default_dp',  -- URL to the professor's profile picture (optional, default)
    office_hours VARCHAR(100),                 -- Office hours details (optional)
    website_url TEXT,                          -- Link to personal website or professional page (optional)
    research_domain JSON,                      -- List of research domains as JSON (optional)
    status professor_status NOT NULL DEFAULT 'NR',  -- ENUM field for status (required, default is 'NR')
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- Record creation timestamp (automatic)
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP  -- Record update timestamp (automatic)
);
`

export function createProfessorInsertQuery(professor) {
    return `
    INSERT INTO professor (
        username, password, title, first_name, middle_name, last_name, email, 
        office_phone, department, office_location, research_area, bio, 
        profile_picture_url, office_hours, website_url, research_domain, status
    ) VALUES (
        '${professor.username}', 
        '${professor.password}', 
        '${professor.title || ''}', 
        '${professor.first_name}', 
        '${professor.middle_name || ''}', 
        '${professor.last_name}', 
        '${professor.email}', 
        '${professor.office_phone || ''}', 
        '${professor.department}', 
        '${professor.office_location || ''}', 
        '${professor.research_area || ''}', 
        '${professor.bio || ''}', 
        '${professor.profile_picture_url || 'prof_default_dp'}', 
        '${professor.office_hours || ''}', 
        '${professor.website_url || ''}', 
        '${JSON.stringify(professor.research_domain || [])}', 
        '${professor.status || 'NR'}'  -- Default to 'NR' if status is not provided
    );
    `;
}

export const searchProfByUsernameOrEmailQuery = `
    SELECT * FROM professor
    WHERE email = $1 OR username = $2;
    `;