import { API_URL } from "../../config";

export async function aplicarTemaAutomatico() {
    const body = document.body;

    body.classList.remove("tema-claro", "tema-escuro");

    let modoCliente = null;

    try {
        const token = localStorage.getItem("token");

        if (token) {
            const resp = await fetch(`${API_URL}/api/clientes/modo`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (resp.ok) {
                const data = await resp.json();
                modoCliente = data.modo;
            }
        }
    } catch {
        modoCliente = null;
    }

    if (modoCliente === 1) {
        body.classList.add("tema-escuro");
        return;
    }

    if (modoCliente === 2) {
        body.classList.add("tema-claro");
        return;
    }

    const hora = new Date().getHours();

    if (hora >= 18 || hora < 6) {
        body.classList.add("tema-escuro");
    } else {
        body.classList.add("tema-claro");
    }
}
