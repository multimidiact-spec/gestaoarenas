"""Gestão de Arenas: piloto Streamlit com planilha Google independente.

Configuração: cole spreadsheet_id e gcp_service_account nas Secrets do Streamlit.
"""
from __future__ import annotations

import base64
import json
import threading
from pathlib import Path

import gspread
import streamlit as st

ROOT = Path(__file__).resolve().parent
CHUNK_SIZE = 39000
MAX_JSON_SIZE = 5_000_000
FIELDS = ("arenas", "masters", "events", "manual", "suspensions", "history")
_lock = threading.RLock()


class Conflict(Exception):
    pass


def spreadsheet():
    credentials = dict(st.secrets["gcp_service_account"])
    client = gspread.service_account_from_dict(credentials)
    return client.open_by_key(st.secrets["spreadsheet_id"])


def worksheet(book, title):
    try:
        return book.worksheet(title)
    except gspread.WorksheetNotFound:
        return book.add_worksheet(title=title, rows=100, cols=2)


def meta(book):
    sheet = worksheet(book, "_Arena_Meta")
    values = sheet.get("A2:B2")
    if values and values[0]:
        row = values[0]
        revision = int(row[0]) if row[0] else 0
        slot = row[1] if len(row) > 1 and row[1] == "B" else "A"
    else:
        revision, slot = 0, "A"
        sheet.update(range_name="A1:B2", values=[["Revisão", "Slot ativo"], [0, "A"]])
    return sheet, revision, slot


def read_state(book):
    _, revision, slot = meta(book)
    try:
        sheet = book.worksheet("_Arena_" + slot)
    except gspread.WorksheetNotFound:
        return {"revision": revision, "state": None}
    parts = sheet.col_values(1)
    if not parts:
        return {"revision": revision, "state": None}
    encoded = "".join(parts)
    raw = base64.urlsafe_b64decode(encoded.encode("ascii"))
    return {"revision": revision, "state": json.loads(raw.decode("utf-8"))}


def write_state(book, state, expected):
    if not isinstance(expected, int) or isinstance(expected, bool) or expected < 0:
        raise ValueError("Revisão inválida.")
    if not isinstance(state, dict) or any(not isinstance(state.get(k), list) for k in FIELDS):
        raise ValueError("A agenda enviada é inválida.")
    payload = json.dumps(state, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
    if len(payload) > MAX_JSON_SIZE:
        raise ValueError("A agenda ultrapassou o tamanho permitido para este piloto.")
    with _lock:
        meta_sheet, revision, slot = meta(book)
        if expected != revision:
            raise Conflict("Outra pessoa salvou antes de você. Exporte o backup e atualize a página.")
        next_slot = "B" if slot == "A" else "A"
        target = worksheet(book, "_Arena_" + next_slot)
        encoded = base64.urlsafe_b64encode(payload).decode("ascii")
        chunks = [encoded[i : i + CHUNK_SIZE] for i in range(0, len(encoded), CHUNK_SIZE)]
        old_rows = len(target.col_values(1))
        if target.row_count < len(chunks):
            target.add_rows(len(chunks) - target.row_count)
        target.update(range_name=f"A1:A{len(chunks)}", values=[[part] for part in chunks])
        if old_rows > len(chunks):
            target.batch_clear([f"A{len(chunks)+1}:A{old_rows}"])
        # O ponteiro da revisão muda apenas após a escrita completa no outro slot.
        meta_sheet.update(range_name="A2:B2", values=[[revision + 1, next_slot]])
        return revision + 1


def process_request():
    request = st.session_state.get("arena_component", {}).get("request")
    if not isinstance(request, dict):
        return
    request_id = request.get("id")
    if not isinstance(request_id, str) or request_id == st.session_state.get("handled_request_id"):
        return
    st.session_state["handled_request_id"] = request_id
    try:
        book = spreadsheet()
        if request.get("action") == "revision":
            answer = {"revision": meta(book)[1]}
        elif request.get("action") == "save":
            answer = {"revision": write_state(book, request.get("state"), request.get("expectedRevision"))}
        else:
            raise ValueError("Operação inválida.")
        st.session_state["arena_reply"] = {"id": request_id, "ok": True, "result": answer}
    except Exception as exc:
        st.session_state["arena_reply"] = {"id": request_id, "ok": False, "error": str(exc)}


st.set_page_config(page_title="Gestão de Arenas — piloto", layout="wide")
st.markdown("<style>.block-container{max-width:none;padding:0!important}header[data-testid='stHeader']{display:none}</style>", unsafe_allow_html=True)

if "spreadsheet_id" not in st.secrets or "gcp_service_account" not in st.secrets:
    st.error("Falta configurar a planilha de teste e a conta de serviço em Settings → Secrets do Streamlit.")
    st.stop()

try:
    with _lock:
        bootstrap = read_state(spreadsheet())
except Exception as exc:
    st.error(f"Não consegui abrir a planilha de teste: {exc}")
    st.stop()

bootstrap["user"] = "Usuário do piloto"
component = st.components.v2.component(
    "gestao_arenas_piloto",
    html=(ROOT / "interface.html").read_text(encoding="utf-8"),
    css=(ROOT / "estilos.css").read_text(encoding="utf-8"),
    js=(ROOT / "interface.js").read_text(encoding="utf-8"),
    isolate_styles=False,
)
component(
    key="arena_component",
    data={"bootstrap": bootstrap, "reply": st.session_state.get("arena_reply")},
    on_request_change=process_request,
)
