import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StudentForm from "../StudentForm";

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ id: 5 }),
  });
});
afterEach(() => jest.resetAllMocks());

test("envía alta de estudiante con los datos correctos (POST /api/students/)", async () => {
  render(<MemoryRouter><StudentForm /></MemoryRouter>);

  fireEvent.change(screen.getByLabelText(/carnet/i),     { target: { value: "X999" }});
  fireEvent.change(screen.getByLabelText(/nombre/i),     { target: { value: "Ana" }});
  fireEvent.change(screen.getByLabelText(/apellidos?/i), { target: { value: "López" }});
  fireEvent.change(screen.getByLabelText(/sección/i),    { target: { value: "1-3" }});

  const form = document.querySelector("form");
  const guardarBtn = within(form).getByRole("button", { name: /guardar/i });
  fireEvent.click(guardarBtn);

  await waitFor(() => expect(global.fetch).toHaveBeenCalled());

  // Verifica endpoint y método
  const [url, opts] = global.fetch.mock.calls[0];
  expect(url).toMatch(/\/api\/students(\/new)?\/$/);
  expect(opts?.method).toBe("POST");

  // Verifica payload
  if (opts.headers && /application\/json/i.test(opts.headers["Content-Type"] || "")) {
    const body = JSON.parse(opts.body);
    expect(body).toMatchObject({
      id_mep: "X999",
      first_name: "Ana",
      last_name: "López",
      section: "1-3",
    });
  } else if (opts.body instanceof FormData) {
    const fd = opts.body;
    expect(fd.get("id_mep")).toBe("X999");
    expect(fd.get("first_name")).toBe("Ana");
    expect(fd.get("last_name")).toBe("López");
    expect(fd.get("section")).toBe("1-3");
  }
});
