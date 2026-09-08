from pathlib import Path

import pandas as pd
from flask import Flask, jsonify, render_template, request

app = Flask(__name__)

DATA_PATH_BASICA = Path(__file__).parent / "data" / "educacao_basica_2015_2025.csv"
DATA_PATH_SUPERIOR = Path(__file__).parent / "data" / "ensino_superior_2015_2024.csv"
EXPECTED_NUMERIC_COLUMNS_BASICA = [
    "Creche",
    "Pre_Escola",
    "Fundamental_Total",
    "Fundamental_Federal",
    "Fundamental_Estadual",
    "Fundamental_Municipal",
    "Fundamental_Privada",
    "Fundamental_Anos_Iniciais",
    "Fundamental_Anos_Finais",
    "Ensino_Medio_Total",
    "Ensino_Medio_Federal",
    "Ensino_Medio_Estadual",
    "Ensino_Medio_Municipal",
    "Ensino_Medio_Privada",
    "EJA_Total",
    "EJA_Ensino_Fundamental",
    "EJA_Ensino_Medio",
    "Educacao_Profissional",
    "Educacao_Especial",
]
EXPECTED_NUMERIC_COLUMNS_SUPERIOR = [
    "Matriculas_Total",
    "Matriculas_Publica",
    "Matriculas_Federal",
    "Matriculas_Estadual",
    "Matriculas_Municipal",
    "Matriculas_Privada",
    "Matriculas_Presencial",
    "Matriculas_EAD",
    "Ingressantes",
    "Concluintes",
]
SUPERIOR_YEAR_RANGE = list(range(2015, 2025))


def _to_native_number(value):
    if pd.isna(value):
        return None
    number = float(value)
    return int(number) if number.is_integer() else number


def _load_data(data_path, expected_numeric_columns):
    df = pd.read_csv(data_path, encoding="utf-8-sig")

    required_base = {"Ano", "Codigo_Municipio", "Municipio", "UF"}
    missing_base = required_base - set(df.columns)
    if missing_base:
        raise RuntimeError(f"Colunas obrigatórias ausentes no CSV: {sorted(missing_base)}")

    numeric_columns = [col for col in expected_numeric_columns if col in df.columns]

    df["Ano"] = pd.to_numeric(df["Ano"], errors="coerce").astype("Int64")
    df["Codigo_Municipio"] = df["Codigo_Municipio"].astype("string")
    df["Municipio"] = df["Municipio"].astype("string")
    df["UF"] = df["UF"].astype("string")

    for col in numeric_columns:
        df[col] = pd.to_numeric(df[col], errors="coerce")

    df = df.dropna(subset=["Ano", "Codigo_Municipio", "Municipio", "UF"]).copy()
    df["Ano"] = df["Ano"].astype(int)

    return df, numeric_columns


DF_BASICA, NUMERIC_COLUMNS_BASICA = _load_data(DATA_PATH_BASICA, EXPECTED_NUMERIC_COLUMNS_BASICA)
DF_SUPERIOR, NUMERIC_COLUMNS_SUPERIOR = _load_data(DATA_PATH_SUPERIOR, EXPECTED_NUMERIC_COLUMNS_SUPERIOR)

# Compatibilidade com o frontend atual da Educação Básica
DF, NUMERIC_COLUMNS = DF_BASICA, NUMERIC_COLUMNS_BASICA


@app.get("/")
def index():
    return render_template("index.html")


@app.get("/api/localidades")
def api_localidades():
    localidades = []
    for uf, group in DF[["UF", "Codigo_Municipio", "Municipio"]].drop_duplicates().groupby("UF"):
        municipios = (
            group.sort_values("Municipio")
            .apply(
                lambda row: {
                    "codigo": str(row["Codigo_Municipio"]),
                    "nome": str(row["Municipio"]),
                },
                axis=1,
            )
            .tolist()
        )
        localidades.append({"uf": str(uf), "municipios": municipios})

    localidades.sort(key=lambda item: item["uf"])

    return jsonify(
        {
            "ufs": [item["uf"] for item in localidades],
            "localidades": localidades,
        }
    )


@app.get("/api/dados")
def api_dados():
    nivel = (request.args.get("nivel") or "").strip().lower()

    if nivel not in {"brasil", "estadual", "municipal"}:
        return jsonify({"erro": "Parâmetro 'nivel' inválido."}), 400

    if nivel == "brasil":
        selected = DF.copy()
        localidade_nome = "Brasil"
        grouped = selected.groupby("Ano", as_index=False)[NUMERIC_COLUMNS].sum(min_count=1)

    elif nivel == "estadual":
        uf = (request.args.get("uf") or "").strip()
        if not uf:
            return jsonify({"erro": "Parâmetro 'uf' é obrigatório para nível estadual."}), 400

        selected = DF[DF["UF"] == uf]
        if selected.empty:
            return jsonify({"erro": "UF não encontrada."}), 404

        localidade_nome = uf
        grouped = selected.groupby("Ano", as_index=False)[NUMERIC_COLUMNS].sum(min_count=1)

    else:
        codigo = (request.args.get("codigo") or "").strip()
        if not codigo:
            return jsonify({"erro": "Parâmetro 'codigo' é obrigatório para nível municipal."}), 400

        selected = DF[DF["Codigo_Municipio"] == codigo]
        if selected.empty:
            return jsonify({"erro": "Município não encontrado."}), 404

        localidade_nome = str(selected.iloc[0]["Municipio"])
        grouped = selected.sort_values("Ano")[["Ano", *NUMERIC_COLUMNS]].copy()

    grouped = grouped.sort_values("Ano")
    grouped[NUMERIC_COLUMNS] = grouped[NUMERIC_COLUMNS].fillna(0)

    anos = grouped["Ano"].astype(int).tolist()
    dados = {col: [_to_native_number(value) for value in grouped[col].tolist()] for col in NUMERIC_COLUMNS}

    return jsonify(
        {
            "nivel": nivel,
            "localidade": localidade_nome,
            "anos": anos,
            "dados": dados,
        }
    )


@app.get("/api/ensino-superior")
def api_ensino_superior():
    nivel = (request.args.get("nivel") or "").strip().lower()
    nivel = {"estadual": "estado", "municipal": "municipio"}.get(nivel, nivel)

    if nivel not in {"brasil", "estado", "municipio"}:
        return jsonify({"erro": "Parâmetro 'nivel' inválido."}), 400

    grouped = pd.DataFrame(columns=["Ano", *NUMERIC_COLUMNS_SUPERIOR])
    localidade_nome = "Brasil"

    if nivel == "brasil":
        selected = DF_SUPERIOR.copy()
        grouped = selected.groupby("Ano", as_index=False)[NUMERIC_COLUMNS_SUPERIOR].sum(min_count=1)

    elif nivel == "estado":
        uf = (request.args.get("uf") or "").strip()
        if not uf:
            return jsonify({"erro": "Parâmetro 'uf' é obrigatório para nível estado."}), 400

        selected = DF_SUPERIOR[DF_SUPERIOR["UF"] == uf]
        localidade_nome = uf
        if not selected.empty:
            grouped = selected.groupby("Ano", as_index=False)[NUMERIC_COLUMNS_SUPERIOR].sum(min_count=1)

    else:
        codigo = (request.args.get("codigo") or "").strip()
        if not codigo:
            return jsonify({"erro": "Parâmetro 'codigo' é obrigatório para nível município."}), 400

        selected = DF_SUPERIOR[DF_SUPERIOR["Codigo_Municipio"] == codigo]
        localidade_nome = str(selected.iloc[0]["Municipio"]) if not selected.empty else codigo
        if not selected.empty:
            grouped = selected.sort_values("Ano")[["Ano", *NUMERIC_COLUMNS_SUPERIOR]].copy()

    grouped = grouped.sort_values("Ano")
    grouped = (
        grouped.set_index("Ano")
        .reindex(SUPERIOR_YEAR_RANGE)
        .rename_axis("Ano")
        .reset_index()
    )

    anos = grouped["Ano"].astype(int).tolist()
    dados = {
        col: [_to_native_number(value) for value in grouped[col].tolist()]
        for col in NUMERIC_COLUMNS_SUPERIOR
    }

    return jsonify(
        {
            "nivel": nivel,
            "localidade": localidade_nome,
            "anos": anos,
            "dados": dados,
        }
    )


if __name__ == "__main__":
    app.run()
