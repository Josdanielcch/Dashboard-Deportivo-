const request = require("supertest");
const { z } = require("zod");
const jwt = require("jsonwebtoken");

jest.mock("../src/config/database", () => ({
  query: jest.fn(),
  connect: jest.fn(() => ({
    query: jest.fn(),
    release: jest.fn(),
  }))
}));

const pool = require("../src/config/database");
const app = require("../src/app");

let staffToken;

beforeAll(() => {
  process.env.JWT_SECRET = "testsecret_bookings";
  staffToken = jwt.sign({ id: 1, username: "staff", role_id: 5 }, process.env.JWT_SECRET);
});

afterEach(() => {
  jest.clearAllMocks();
});

// Esquemas de validación
const bookingSchema = z.object({
  id: z.number(),
  booking_date: z.string(),
  start_time: z.string(),
  end_time: z.string(),
  status: z.string(),
  customer_name: z.string().optional(),
  court_name: z.string().optional()
});

const bookingResponseSchema = z.object({
  success: z.boolean(),
  data: z.any() // El objeto de respuesta de creación es complejo (incluye total_amount)
});

describe("Integración - Módulo de Reservas", () => {

  test("GET /api/bookings - Debe listar todas las reservas", async () => {
    pool.query.mockResolvedValueOnce({
      rows: [
        { id: 1, booking_date: "2024-05-20", start_time: "10:00", end_time: "11:00", status: "Pending", customer_name: "Cliente 1", court_name: "Cancha 1" }
      ]
    });

    const res = await request(app)
      .get("/api/bookings")
      .set("Authorization", `Bearer ${staffToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeInstanceOf(Array);
  });

  test("POST /api/bookings - Debe crear una reserva (Mock de transacción)", async () => {
    const mockClient = {
      query: jest.fn()
        .mockResolvedValueOnce({ rows: [] }) // BEGIN
        .mockResolvedValueOnce({ rows: [{ count: 0 }] }) // Conflict check
        .mockResolvedValueOnce({ rows: [{ hourly_rate: 20 }] }) // Court rate
        .mockResolvedValueOnce({ rows: [{ id: 5, booking_date: "2024-05-20", start_time: "14:00", end_time: "15:00", status: "Pending" }] }) // Insert
        .mockResolvedValueOnce({ rows: [] }) // Update court
        .mockResolvedValueOnce({ rows: [] }), // COMMIT
      release: jest.fn()
    };
    pool.connect.mockResolvedValueOnce(mockClient);

    const res = await request(app)
      .post("/api/bookings")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        customer_id: 1,
        court_id: 2,
        user_id: 1,
        booking_date: "2024-05-20",
        start_time: "14:00",
        end_time: "15:00"
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total_amount).toBe(20);
  });

});
