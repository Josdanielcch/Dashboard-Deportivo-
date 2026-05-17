const request = require("supertest");
const { z } = require("zod");

// 1. Mock de la base de datos para no alterar la BD real (Neon.tech)
jest.mock("../src/config/database", () => ({
  query: jest.fn(),
}));

const pool = require("../src/config/database");
const app = require("../src/app");
const jwt = require("jsonwebtoken");

// Generamos un token válido para las pruebas (ya que las rutas están protegidas)
let adminToken;

beforeAll(() => {
  process.env.JWT_SECRET = "testsecret_integration";
  process.env.JWT_EXPIRES_IN = "1h";
  
  // Creamos un token de Admin (role_id: 1) porque userRoutes lo requiere
  adminToken = jwt.sign(
    { id: 1, username: "admin_test", role_id: 1 },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
});

afterEach(() => {
  jest.clearAllMocks(); // Limpiar los mocks después de cada prueba
});

// 2. Definición de Esquemas Zod para verificar las respuestas
const userSchema = z.object({
  id: z.number(),
  username: z.string(),
  full_name: z.string(),
  role_id: z.number(),
  status: z.string()
});

const getAllUsersResponseSchema = z.object({
  success: z.boolean(),
  count: z.number(),
  data: z.array(userSchema.extend({ created_at: z.string().optional() }))
});

const singleUserResponseSchema = z.object({
  success: z.boolean(),
  data: userSchema.extend({ created_at: z.string().optional() }),
  message: z.string().optional() // POST, PUT, PATCH devuelven message
});

const deleteUserResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    id: z.number(),
    username: z.string(),
    status: z.string()
  })
});

describe("Pruebas de Integración - Endpoints de Usuarios (6 Métodos)", () => {

  // ==========================================
  // 1. POST /api/users/ (Crear Usuario)
  // ==========================================
  test("POST /api/users/ - Crea un nuevo usuario", async () => {
    // Simulamos la respuesta de la DB
    pool.query.mockResolvedValueOnce({ rows: [] }); // Simula que el usuario no existe
    pool.query.mockResolvedValueOnce({ 
      rows: [{ id: 10, username: "test_user", full_name: "Test User", role_id: 2, status: "Activated", created_at: "2024-01-01" }] 
    });

    const res = await request(app)
      .post("/api/users/")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        username: "test_user",
        password: "password123",
        full_name: "Test User",
        role_id: 2
      });

    expect(res.status).toBe(201);
    
    // Validación con Zod
    const validation = singleUserResponseSchema.safeParse(res.body);
    expect(validation.success).toBe(true);
    expect(res.body.message).toBe("Usuario creado exitosamente");
  });

  // ==========================================
  // 2. GET /api/users/ (Obtener Todos)
  // ==========================================
  test("GET /api/users/ - Obtiene lista de usuarios", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { id: 1, username: "admin", full_name: "Admin User", role_id: 1, status: "Activated", created_at: "2024-01-01" },
        { id: 10, username: "test_user", full_name: "Test User", role_id: 2, status: "Activated", created_at: "2024-01-01" }
      ]
    });

    const res = await request(app)
      .get("/api/users/")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    // Validación con Zod
    const validation = getAllUsersResponseSchema.safeParse(res.body);
    expect(validation.success).toBe(true);
    expect(res.body.count).toBe(2);
  });

  // ==========================================
  // 3. GET /api/users/:id (Obtener por ID)
  // ==========================================
  test("GET /api/users/:id - Obtiene un usuario específico", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 10, username: "test_user", full_name: "Test User", role_id: 2, status: "Activated", created_at: "2024-01-01" }]
    });

    const res = await request(app)
      .get("/api/users/10")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    // Validación con Zod
    const validation = singleUserResponseSchema.safeParse(res.body);
    expect(validation.success).toBe(true);
    expect(res.body.data.id).toBe(10);
  });

  // ==========================================
  // 4. PUT /api/users/:id (Actualizar Usuario)
  // ==========================================
  test("PUT /api/users/:id - Actualiza todos los campos de un usuario", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 10, username: "test_user", full_name: "Test User Modificado", role_id: 2, status: "Activated" }]
    });

    const res = await request(app)
      .put("/api/users/10")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        full_name: "Test User Modificado",
        role_id: 2
      });

    expect(res.status).toBe(200);

    // Validación con Zod
    const validation = singleUserResponseSchema.safeParse(res.body);
    expect(validation.success).toBe(true);
    expect(res.body.data.full_name).toBe("Test User Modificado");
  });

  // ==========================================
  // 5. PATCH /api/users/:id/status (Actualizar Estado)
  // ==========================================
  test("PATCH /api/users/:id/status - Actualiza solo el estado del usuario", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 10, username: "test_user", full_name: "Test User Modificado", role_id: 2, status: "Disabled" }]
    });

    const res = await request(app)
      .patch("/api/users/10/status")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "Disabled" });

    expect(res.status).toBe(200);

    // Validación con Zod
    const validation = singleUserResponseSchema.safeParse(res.body);
    if (!validation.success) {
      console.error(validation.error);
    }
    expect(validation.success).toBe(true);
    expect(res.body.data.status).toBe("Disabled");
  });

  // ==========================================
  // 6. DELETE /api/users/:id (Eliminar/Deshabilitar Usuario)
  // ==========================================
  test("DELETE /api/users/:id - Deshabilita un usuario (Soft Delete)", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 10, username: "test_user", status: "Disabled" }]
    });

    const res = await request(app)
      .delete("/api/users/10")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);

    // Validación con Zod
    const validation = deleteUserResponseSchema.safeParse(res.body);
    expect(validation.success).toBe(true);
    expect(res.body.message).toBe("Usuario deshabilitado correctamente");
  });

});
