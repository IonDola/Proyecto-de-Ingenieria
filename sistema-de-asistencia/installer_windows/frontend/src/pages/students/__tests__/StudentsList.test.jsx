import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import StudentsList from "../StudentsList";

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ results: [{ id: 1, id_mep: "2021046027", first_name: "Sarah", last_name: "Quesada" }] }),
  });
});
afterEach(() => jest.resetAllMocks());

test("muestra resultados al buscar", async () => {
  render(<MemoryRouter><StudentsList /></MemoryRouter>);

  const input = screen.getByPlaceholderText(/buscar por carnet/i);
  fireEvent.change(input, { target: { value: "sarah" }});

  // toma el <form> que contiene ese input y busca allí el botón
  const form = input.closest("form");
  const buscarBtn = within(form).getByRole("button", { name: /buscar/i });

  fireEvent.click(buscarBtn);

  await waitFor(() => expect(screen.getByText(/Quesada, Sarah/i)).toBeInTheDocument());
});
