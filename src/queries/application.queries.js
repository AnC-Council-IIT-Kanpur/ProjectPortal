export function createApplicationInsertQuery(application) {
  return `
  INSERT INTO application (
      title, 
      project_id, 
      deadline, 
      status
  ) VALUES (
      '${application.project_title}',  -- Use title from the project table
      ${application.project_id}, 
      '${application.deadline}', 
      '${application.status || "OPN"}'
  );
  `;
}


// Query to fetch the project title by project_id
export const searchProjectByIdQuery = `
  SELECT project_id, title, prof_id 
  FROM project
  WHERE project_id = $1;
`;

// Query to update the application by application_id
export const applicationUpdateQuery = `
    UPDATE application
    SET deadline = $1, status = $2, updated_at = CURRENT_TIMESTAMP
    WHERE application_id = $3
    RETURNING *;
`;

// Query to check if the project exists
export const checkProjectExistsQuery = `
    SELECT * FROM project
    WHERE project_id = $1;
`;
