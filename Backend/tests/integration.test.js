const request = require("supertest");
const jwt = require("jsonwebtoken");

jest.mock("../src/config/database", () => ({
  query: jest.fn(),
}));

const pool = require("../src/config/database");
const app = require("../src/app");

beforeAll(() => {
  process.env.JWT_SECRET = "testsecret";
  process.env.JWT_EXPIRES_IN = "1h";
});

describe("Pruebas de integración - Backend Canchas", () => {
  test("GET /api/health devuelve estado OK y esquema correcto", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.objectContaining({
        status: "OK",
        service: "Canchas API",
        environment: expect.any(String),
        timestamp: expect.any(String),
      }),
    );
  });

  test("POST /api/auth/recover-password devuelve mensaje de recuperación", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post("/api/auth/recover-password")
      .send({ email: "cliente@example.com" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message:
        "Si el correo existe en nuestra base de datos, recibirás un enlace para recuperar tu contraseña.",
    });
  });

  test("POST /api/auth/login sin credenciales devuelve 400 y error de esquema", async () => {
    const res = await request(app).post("/api/auth/login").send({});

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "Usuario y contraseña requeridos",
    });
  });

  test("POST /api/auth/login con credenciales inválidas devuelve 401 y error esperado", async () => {
    pool.query.mockResolvedValueOnce({ rows: [] });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ username: "usuario_falso", password: "password123" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Credenciales inválidas" });
  });

  test("GET /api/auth/me con token válido devuelve datos de usuario", async () => {
    const token = jwt.sign(
      { id: 1, username: "admin", role_id: 1 },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      user: expect.objectContaining({
        id: 1,
        username: "admin",
        role_id: 1,
      }),
    });
  });

  test("POST /api/users con datos inválidos falla validación de Zod", async () => {
    const token = jwt.sign(
      { id: 1, username: "admin", role_id: 1 },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    const res = await request(app)
      .post("/api/users")
      .set("Authorization", `Bearer ${token}`)
      .send({
        username: "ab",
        password: "123",
        full_name: "Jo",
      });

    expect(res.status).toBe(400);
    expect(res.body).toEqual(
      expect.objectContaining({
        success: false,
        error: "Error de validación de datos",
        details: expect.any(Array),
      }),
    );
    expect(res.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: "body.username",
          message: "El usuario debe tener al menos 3 caracteres",
        }),
        expect.objectContaining({
          path: "body.password",
          message: "La contraseña debe tener al menos 6 caracteres",
        }),
        expect.objectContaining({
          path: "body.full_name",
          message: "El nombre debe tener al menos 3 caracteres",
        }),
      ]),
    );
  });

  test("GET ruta inexistente devuelve 404 con esquema correcto", async () => {
    const res = await request(app).get("/api/ruta-no-existe");

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: "Ruta no encontrada",
      path: "/api/ruta-no-existe",
    });
  });
});
