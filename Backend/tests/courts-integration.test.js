const request = require("supertest");
const { z } = require("zod");
const jwt = require("jsonwebtoken");

jest.mock("../src/config/database", () => ({
  query: jest.fn(),
}));

const pool = require("../src/config/database");
const app = require("../src/app");

let adminToken;

beforeAll(() => {
  process.env.JWT_SECRET = "testsecret_courts";
  adminToken = jwt.sign({ id: 1, username: "admin", role: 'admin' }, process.env.JWT_SECRET);
});

afterEach(() => {
  jest.clearAllMocks();
});

// Esquemas de validación
const courtSchema = z.object({
  id: z.number(),
  court_name: z.string(),
  status: z.enum(['Available', 'Occupied', 'Maintenance', 'Out_of_service'])
});

const courtResponseSchema = z.object({
  success: z.boolean(),
  data: courtSchema
});

const courtListResponseSchema = z.object({
  success: z.boolean(),
  count: z.number(),
  data: z.array(courtSchema)
});

describe("Integración - Módulo de Canchas", () => {

  test("GET /api/courts - Debe listar todas las canchas", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { id: 1, court_name: "Cancha 1", status: "Available" },
        { id: 2, court_name: "Cancha 2", status: "Maintenance" }
      ]
    });

    const res = await request(app)
      .get("/api/courts")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const validation = courtListResponseSchema.safeParse(res.body);
    expect(validation.success).toBe(true);
  });

  test("POST /api/courts - Debe crear una nueva cancha", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 3, court_name: "Nueva Cancha", status: "Available" }]
    });

    const res = await request(app)
      .post("/api/courts")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ court_name: "Nueva Cancha" });

    expect(res.status).toBe(201);
    const validation = courtResponseSchema.safeParse(res.body);
    expect(validation.success).toBe(true);
    expect(res.body.message).toBe("Cancha creada");
  });

  test("PUT /api/courts/:id/status - Debe cambiar el estado de la cancha", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, court_name: "Cancha 1", status: "Maintenance" }]
    });

    const res = await request(app)
      .put("/api/courts/1/status")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "Maintenance" });

    expect(res.status).toBe(200);
    const validation = courtResponseSchema.safeParse(res.body);
    expect(validation.success).toBe(true);
    expect(res.body.data.status).toBe("Maintenance");
  });

});
