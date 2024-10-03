const createApplicationStatusENUM = `CREATE TYPE application_status AS ENUM('OPEN', 'CLOSED');`;
const createProjectStageENUM = `CREATE TYPE project_stage AS ENUM('PLANNING', 'IN PROGRESS', 'COMPLETED');`;

const createProjectTable = `
CREATE TABLE Projects (
    project_id SERIAL PRIMARY KEY,                                   -- Unique identifier for each project
    title VARCHAR(255) NOT NULL,                                     -- Title of the project (required)
    description TEXT,                                                -- Detailed description of the project (optional)
    prof_id INT REFERENCES professor(prof_id),                       -- Foreign key referencing the professor offering the project
    field_of_study VARCHAR(255),                                     -- Field of study related to the project (optional)
    skills_required JSON,                                            -- Skills required for the project, structured in JSON format (optional)
    project_type VARCHAR(255),                                       -- Type of project (e.g., Research, Development) (optional)
    stage project_stage NOT NULL DEFAULT 'PLANNING',                 -- Current stage of the project (required, default is 'PLANNING')
    progress_percentage INT CHECK (progress_percentage >= 0 AND progress_percentage <= 100) DEFAULT 0,  -- Progress percentage (0 to 100) (optional, default is 0)
    start_date DATE NOT NULL,                                        -- Start date of the project (required)
    end_date DATE,                                                   -- End date of the project (optional)
    vacancies INT NOT NULL DEFAULT 1,                                -- Number of available positions in the project (required, default is 1)
    status application_status NOT NULL DEFAULT 'OPEN',               -- Status of applications (required, default is 'OPEN')
    application_deadline DATE,                                       -- Deadline for applying to the project (optional)
    total_applications INT DEFAULT 0,                                -- Total number of applications received (optional, default is 0)
    resource_links JSON,                                             -- Links to useful resources related to the project (optional)
    enrolled_count INT DEFAULT 0,                                    -- Number of students currently enrolled in the project (optional, default is 0)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                  -- Record creation timestamp (automatic)
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,                  -- Record update timestamp (automatic)
    enrollment_criteria JSON                                         -- Criteria for enrollment in the project (e.g., GPA, skills) (optional)
);
`;

export function createProjectInsertQuery(project) {
    return `
    INSERT INTO Projects (
        title, description, prof_id, field_of_study, skills_required, 
        project_type, stage, progress_percentage, start_date, end_date, 
        vacancies, status, application_deadline, total_applications, 
        resource_links, enrolled_count, enrollment_criteria
    ) VALUES (
        '${project.title}', 
        '${project.description ? `'${project.description}'` : "NULL"}', 
        '${project.prof_id || "NULL"}', 
        '${project.field_of_study ? `'${project.field_of_study}'` : "NULL"}', 
        '${JSON.stringify(project.skills_required || [])}', 
        '${project.project_type ? `'${project.project_type}'` : "NULL"}', 
        '${project.stage || "PLANNING"}', 
        '${project.progress_percentage || 0}', 
        '${project.start_date}', 
        '${project.end_date ? `'${project.end_date}'` : "NULL"}', 
        '${project.vacancies || 1}', 
        '${project.status || "OPEN"}', 
        '${project.application_deadline ? `'${project.application_deadline}'` : "NULL"}', 
        '${project.total_applications || 0}', 
        '${JSON.stringify(project.resource_links || [])}', 
        '${project.enrolled_count || 0}', 
        '${JSON.stringify(project.enrollment_criteria || [])}'
    );
    `;
}

export const searchProjectByProfIdQuery = `
    SELECT * FROM Projects
    WHERE prof_id = $1;
`;
