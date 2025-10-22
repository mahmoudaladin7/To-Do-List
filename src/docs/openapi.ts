export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "To-Do API",
    version: "1.0.0",
    description: "Tasks + Users with Basic Auth",
  },
  servers: [{ url: "http://localhost:3000" }],
  components: {
    securitySchemes: {
      BasicAuth: { type: "http", scheme: "basic" },
    },
    schemas: {
      Task: {
        type: "object",
        properties: {
          id: { type: "string", format: "uuid" },
          userId: { type: "string", format: "uuid" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          status: { type: "string", enum: ["pending", "in_progress", "done"] },
          dueDate: { type: "string", format: "date-time", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
        required: ["id", "userId", "title", "status", "createdAt", "updatedAt"],
      },
      TaskListResponse: {
        type: "object",
        properties: {
          data: { type: "array", items: { $ref: "#/components/schemas/Task" } },
          meta: {
            type: "object",
            properties: {
              page: { type: "integer" },
              limit: { type: "integer" },
              total: { type: "integer" },
              totalPages: { type: "integer" },
            },
          },
        },
      },
    },
  },
  security: [{ BasicAuth: [] }],
  paths: {
    "/health": {
      get: {
        summary: "Liveness probe",
        responses: { "200": { description: "OK" } },
      },
    },
    "/api/v1/users": {
      post: {
        summary: "Register user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  email: { type: "string", format: "email" },
                  password: { type: "string", minLength: 8 },
                },
                required: ["email", "password"],
              },
            },
          },
        },
        responses: {
          "201": { description: "Created" },
          "409": { description: "Email exists" },
        },
      },
    },
    "/api/v1/tasks": {
      get: {
        summary: "List tasks (filter/search/sort/paginate)",
        parameters: [
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: ["pending", "in_progress", "done"],
            },
          },
          { name: "search", in: "query", schema: { type: "string" } },
          {
            name: "sort",
            in: "query",
            schema: {
              type: "string",
              enum: ["created_at", "due_date", "status"],
            },
          },
          {
            name: "order",
            in: "query",
            schema: { type: "string", enum: ["asc", "desc"] },
          },
          {
            name: "page",
            in: "query",
            schema: { type: "integer", minimum: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", minimum: 1, maximum: 100 },
          },
        ],
        responses: {
          "200": {
            description: "OK",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/TaskListResponse" },
              },
            },
          },
        },
      },
      post: {
        summary: "Create task",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  description: { type: "string" },
                  status: {
                    type: "string",
                    enum: ["pending", "in_progress", "done"],
                  },
                  dueDate: { type: "string", format: "date-time" },
                },
                required: ["title"],
              },
            },
          },
        },
        responses: { "201": { description: "Created" } },
      },
    },
    "/api/v1/tasks/{id}": {
      get: {
        summary: "Get task",
        parameters: [{ name: "id", in: "path", required: true }],
        responses: {
          "200": { description: "OK" },
          "404": { description: "Not found" },
        },
      },
      patch: {
        summary: "Update task",
        parameters: [{ name: "id", in: "path", required: true }],
        responses: {
          "200": { description: "OK" },
          "404": { description: "Not found" },
        },
      },
      delete: {
        summary: "Delete task",
        parameters: [{ name: "id", in: "path", required: true }],
        responses: {
          "204": { description: "No Content" },
          "404": { description: "Not found" },
        },
      },
    },
  },
};
