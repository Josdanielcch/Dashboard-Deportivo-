const request = require("supertest");
const { z } = require("zod");
const jwt = require("jsonwebtoken");

jest.mock("../src/config/database", () => ({
  query: jest.fn(),
}));

const pool = require("../src/config/database");
const app = require("../src/app");

let staffToken;

beforeAll(() => {
  process.env.JWT_SECRET = "testsecret_products";
  staffToken = jwt.sign({ id: 1, username: "staff", role_id: 5 }, process.env.JWT_SECRET);
});

afterEach(() => {
  jest.clearAllMocks();
});

// Esquema de validación
const productSchema = z.object({
  id: z.number(),
  name: z.string(),
  category: z.string().optional(),
  price: z.string(), // pg devuelve números como strings en el driver nativo a veces
  stock: z.number()
});

const productResponseSchema = z.object({
  success: z.boolean(),
  data: productSchema
});

describe("Integración - Módulo de Productos", () => {

  test("GET /api/products - Debe listar los productos del inventario", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { id: 1, name: "Agua 500ml", category: "Bebidas", price: "1.50", stock: 100 }
      ]
    });

    const res = await request(app)
      .get("/api/products")
      .set("Authorization", `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  test("PATCH /api/products/:id/stock - Debe actualizar el stock", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [{ id: 1, name: "Agua 500ml", price: "1.50", stock: 95 }]
    });

    const res = await request(app)
      .patch("/api/products/1/stock")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ stock: 95 });

    expect(res.status).toBe(200);
    const validation = productResponseSchema.safeParse(res.body);
    expect(validation.success).toBe(true);
    expect(res.body.data.stock).toBe(95);
  });

});
