const createProjectStatusENUM = `CREATE TYPE project_status AS ENUM('APP', 'APC', 'COM','PAU','ABR', 'CRE');`;
const createProjectTable = `
CREATE TABLE project (
    project_id SERIAL PRIMARY KEY,                                   -- Unique identifier for each project
    title VARCHAR(255) NOT NULL,                                     -- Title of the project (required)
    description TEXT,                                                -- Detailed description of the project (optional)
    prof_id VARCHAR(255) REFERENCES professor(email),                -- Foreign key referencing the professor offering the project
    domain VARCHAR(255),                                             -- Domain of study related to the project (optional)
    skills_required JSON,                                            -- Skills required for the project, structured in JSON format (optional)
    project_type VARCHAR(255),                                       -- Type of project (e.g., Research, Development) (optional)
    status project_status NOT NULL DEFAULT 'CRE',                    -- Current stage of the project (required, default is 'PLANNING')
    weekly_commitment INT NOT NULL DEFAULT 10,                       -- Weekly commitment per hours (required, default is 1)
    start_date DATE,                                                 -- Start date of the project (required)
    duration_in_days INT NOT NULL DEFAULT 60,                        -- Duration of the project (optional)
    vacancies INT NOT NULL DEFAULT 1,                                -- Number of available positions in the project (required, default is 1)
    resource_links JSON,                                             -- Number of students currently enrolled in the project (optional, default is 0)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                  -- Record creation timestamp (automatic)
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                  -- Record update timestamp (automatic)
    tags JSON                                                        -- tags for the project (e.g., ML, AI) (optional)
);
`;

export function createProjectInsertQuery(project) {
    return `
    INSERT INTO project (
        title, 
        description, 
        prof_id, 
        domain, 
        skills_required, 
        project_type, 
        status, 
        weekly_commitment, 
        start_date, 
        duration_in_days, 
        vacancies, 
        resource_links, 
        tags
    ) VALUES (
        '${project.title}', 
        ${project.description ? `'${project.description}'` : "NULL"}, 
        '${project.prof_id || "NULL"}', 
        ${project.domain ? `'${project.domain}'` : "NULL"}, 
        '${JSON.stringify(project.skills_required || [])}', 
        ${project.project_type ? `'${project.project_type}'` : "NULL"}, 
        '${project.status || "CRE"}', 
        ${project.weekly_commitment || 10}, 
        ${project.start_date ? `'${project.start_date}'` : "NULL"}, 
        ${project.duration_in_days || 60}, 
        ${project.vacancies || 1}, 
        '${JSON.stringify(project.resource_links || [])}', 
        '${JSON.stringify(project.tags || [])}'
    );
    `;
}

export const searchProjectByProfIdQuery = `
    SELECT * FROM Projects
    WHERE prof_id = $1;
`;
