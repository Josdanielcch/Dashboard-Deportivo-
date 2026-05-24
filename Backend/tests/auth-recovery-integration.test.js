const request = require("supertest");
const jwt = require("jsonwebtoken");

// Mock de la base de datos
jest.mock("../src/config/database", () => ({
  query: jest.fn(),
}));

// Mock del servicio de envío de correos (Nodemailer)
jest.mock("../src/config/mailer", () => ({
  sendMail: jest.fn().mockResolvedValue({ messageId: "mock-message-id" }),
}));

const pool = require("../src/config/database");
const mailer = require("../src/config/mailer");
const app = require("../src/app");

describe("Integración - Módulo de Recuperación de Contraseña", () => {
  beforeAll(() => {
    process.env.JWT_SECRET = "testsecret_auth";
    process.env.FRONTEND_URL = "http://localhost:5173";
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/auth/recover-password", () => {
    test("Debe retornar 400 si el email no es enviado", async () => {
      const res = await request(app)
        .post("/api/auth/recover-password")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("El correo electrónico es requerido");
    });

    test("Debe retornar éxito genérico incluso si el email no existe (Seguridad)", async () => {
      // Mock de base de datos vacía (no se encontró el usuario)
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post("/api/auth/recover-password")
        .send({ email: "noexiste@correo.com" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("Si el correo existe");
      expect(mailer.sendMail).not.toHaveBeenCalled();
    });

    test("Debe generar token, guardar en BD y enviar correo si el usuario existe", async () => {
      // Mock de usuario encontrado en la BD
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1, username: "admin_alex", full_name: "Alex" }] }) // SELECT
        .mockResolvedValueOnce({ rows: [] }); // UPDATE

      const res = await request(app)
        .post("/api/auth/recover-password")
        .send({ email: "alex@sportspaces.com" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("Si el correo existe");
      
      // Validamos que se haya ejecutado la consulta para guardar el token en la BD
      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(pool.query.mock.calls[1][0]).toContain("UPDATE users");
      expect(pool.query.mock.calls[1][1][0]).toBeDefined(); // token

      // Validamos que se haya enviado el correo por Nodemailer
      expect(mailer.sendMail).toHaveBeenCalledTimes(1);
      expect(mailer.sendMail.mock.calls[0][0].to).toBe("alex@sportspaces.com");
      expect(mailer.sendMail.mock.calls[0][0].html).toContain("reset-password?token=");
    });
  });

  describe("POST /api/auth/reset-password", () => {
    test("Debe retornar 400 si faltan token o contraseña", async () => {
      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({ token: "token_sin_clave" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("El token y la nueva contraseña son requeridos");
    });

    test("Debe retornar 400 si el token es inválido o ha expirado", async () => {
      // Mock de búsqueda de usuario sin resultados (token vencido o inexistente)
      pool.query.mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({ token: "token_vencido", password: "nuevaContrasena123" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe("El token de recuperación es inválido o ha expirado");
    });

    test("Debe encriptar la contraseña, actualizarla en BD y limpiar campos del token si es exitoso", async () => {
      // Mock de búsqueda de usuario que encuentra al usuario con token válido
      pool.query
        .mockResolvedValueOnce({ rows: [{ id: 1, username: "admin_alex" }] }) // SELECT
        .mockResolvedValueOnce({ rows: [] }); // UPDATE

      const res = await request(app)
        .post("/api/auth/reset-password")
        .send({ token: "token_valido", password: "nuevaContrasena123" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("Tu contraseña ha sido restablecida exitosamente");

      // Validamos que se haya ejecutado el UPDATE de contraseña
      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(pool.query.mock.calls[1][0]).toContain("UPDATE users");
      expect(pool.query.mock.calls[1][0]).toContain("password_hash = $1, reset_token = NULL, reset_token_expires = NULL");
    });
  });
});
