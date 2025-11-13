import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "../../styles/main.css";
import "../../styles/listable-style.css";
import "../../styles/dialog-style.css";

import PageHead from "../../components/PageHead";
import Home from "../../components/HomeLink"
import Listable from "../../components/Listable";

import UserIcon from "../../assets/icons/user.svg"
import AdminLogo from "../../assets/icons/admin_logo.svg"

function getAccess() {
    return (
        localStorage.getItem("access") ||
        localStorage.getItem("jwt_access") ||
        localStorage.getItem("access_token") ||
        ""
    );
}

function formatDate(iso) {
    if (!iso) return "";
    try {
        const d = new Date(iso);
        const opts = { day: "2-digit", month: "short", year: "numeric" };
        return d.toLocaleDateString("es-CR", opts).replace(/\./g, "");
    } catch {
        return iso;
    }
}

export default function AdminsList() {
    const iconList = [
        { id: 1, image: UserIcon, description: "Usuarios" },
        { id: 2, image: AdminLogo, description: "Administrativos" },
    ];

    const columns = [
        { name: "", width: "100px" },
        { name: "Nombre", width: "1fr" },
        { name: "Nombre de Usuario", width: "1fr" },
        { name: "Estado", width: "160px" },
    ];

    const [rows, setRows] = useState([]);
    const [sp, setSp] = useSearchParams();
    const q = sp.get("q") || "";

    const filtered = useMemo(() => {
        const s = (q || "").trim().toLowerCase();
        if (!s) return rows;
        return rows.filter((r) =>
            (r.visitor_code || "").toLowerCase().includes(s) ||
            (r.name || "").toLowerCase().includes(s) ||
            (r.status || "").toLowerCase().includes(s)
        );
    }, [q, rows]);

    const load = async () => {
        try {
            const access = getAccess();
            const r = await fetch(`/api/users/admins/`, {
                headers: { ...(access ? { Authorization: `Bearer ${access}` } : {}) },
                credentials: "include",
            });
            const d = await r.json();
            if (!r.ok) throw new Error(d?.detail || d?.error || "Error al listar");
            const list = d.results || [];
            setRows(list);
        } catch (e) {
            console.error("error en visitors list:", e);
            setRows([]);
        }
    };

    useEffect(() => { load(); }, []); // eslint-disable-line

    const onSearch = (e) => {
        if (e.key !== "Enter") return;
        e.preventDefault();
        setSp({ q: e.target.value || "" });
    };

    const searchBox = (
        <input
            className="search-box"
            type="search"
            name="q"
            placeholder="Buscar por clave, nombre o estado"
            defaultValue={q}
            onKeyDown={onSearch}
        />
    );

    return (
        <>
            <PageHead icons={iconList} />
            <main>
                <div className="tools">
                    <Home />
                </div>

                <Listable columns={columns} searchBox={searchBox}>
                    {filtered.map((v) => (
                        <div className="listable-row" key={v.id}>
                            <div></div>
                            <div>{v.name}</div>
                            <div>{v.username}</div>
                            <div>{v.status}</div>
                        </div>
                    ))}
                </Listable>
            </main >
        </>
    );
}
