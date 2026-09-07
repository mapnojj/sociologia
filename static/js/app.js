(() => {
    const appState = {
        nivel: "brasil",
        uf: "",
        codigo: "",
        localidades: [],
        indicador: "Creche",
        modalidade: "EJA_Total",
        payload: null
    };

    const indicatorLabels = {
        Creche: "Creche",
        Pre_Escola: "Pré-escola",
        Fundamental_Total: "Ensino Fundamental",
        Ensino_Medio_Total: "Ensino Médio",
        EJA_Total: "EJA",
        Educacao_Profissional: "Educação Profissional",
        Educacao_Especial: "Educação Especial"
    };

    const brFormatter = new Intl.NumberFormat("pt-BR");

    const els = {
        levelButtons: () => [...document.querySelectorAll("[data-level]")],
        ufControl: document.getElementById("uf-control"),
        municipioControl: document.getElementById("municipio-control"),
        ufSelect: document.getElementById("uf-select"),
        municipioSelect: document.getElementById("municipio-select"),
        indicadorSelect: document.getElementById("indicador-geral"),
        modalidadeButtons: [...document.querySelectorAll(".tab-btn")],
        localityText: document.getElementById("localidade-atual"),
        card2015: document.getElementById("card-2015"),
        card2025: document.getElementById("card-2025"),
        cardVarAbs: document.getElementById("card-var-abs"),
        cardVarPct: document.getElementById("card-var-pct")
    };

    function formatNumber(value) {
        return brFormatter.format(value || 0);
    }

    function getLocalidadeByUf(uf) {
        return appState.localidades.find((item) => item.uf === uf);
    }

    function setLevel(level) {
        appState.nivel = level;
        syncLevelButtons();
        toggleControlVisibility();

        if (level === "brasil") {
            fetchDados();
            return;
        }

        if (!appState.uf && appState.localidades.length) {
            appState.uf = appState.localidades[0].uf;
            els.ufSelect.value = appState.uf;
        }

        populateMunicipiosIfNeeded();
        fetchDados();
    }

    function syncLevelButtons() {
        els.levelButtons().forEach((button) => {
            button.classList.toggle("active", button.dataset.level === appState.nivel);
        });
    }

    function toggleControlVisibility() {
        const isBrasil = appState.nivel === "brasil";
        const isMunicipal = appState.nivel === "municipal";

        els.ufControl.classList.toggle("hidden", isBrasil);
        els.municipioControl.classList.toggle("hidden", !isMunicipal);
    }

    function populateUfSelect() {
        els.ufSelect.innerHTML = appState.localidades
            .map((item) => `<option value="${item.uf}">${item.uf}</option>`)
            .join("");

        if (appState.localidades.length) {
            appState.uf = appState.uf || appState.localidades[0].uf;
            els.ufSelect.value = appState.uf;
        }
    }

    function populateMunicipiosIfNeeded() {
        if (appState.nivel !== "municipal") return;

        const ufEntry = getLocalidadeByUf(appState.uf);
        const municipios = ufEntry?.municipios || [];

        els.municipioSelect.innerHTML = municipios
            .map((m) => `<option value="${m.codigo}">${m.nome}</option>`)
            .join("");

        if (!municipios.length) {
            appState.codigo = "";
            return;
        }

        if (!municipios.some((m) => m.codigo === appState.codigo)) {
            appState.codigo = municipios[0].codigo;
        }

        els.municipioSelect.value = appState.codigo;
    }

    function extractYearValue(payload, column, year) {
        const yearIndex = payload.anos.indexOf(year);
        if (yearIndex < 0) return 0;
        return payload.dados?.[column]?.[yearIndex] ?? 0;
    }

    function updateCards() {
        if (!appState.payload) return;

        const column = appState.indicador;
        const value2015 = extractYearValue(appState.payload, column, 2015);
        const value2025 = extractYearValue(appState.payload, column, 2025);
        const abs = value2025 - value2015;

        els.card2015.textContent = formatNumber(value2015);
        els.card2025.textContent = formatNumber(value2025);
        els.cardVarAbs.textContent = formatNumber(abs);

        if (!value2015) {
            els.cardVarPct.textContent = "—";
        } else {
            const pct = ((value2025 / value2015) - 1) * 100;
            els.cardVarPct.textContent = `${pct.toLocaleString("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%`;
        }
    }

    function updateAllVisuals() {
        if (!appState.payload) return;

        els.localityText.textContent = appState.payload.localidade;

        window.ChartManager.updateEvolucaoGeral(
            appState.payload,
            appState.indicador,
            indicatorLabels[appState.indicador] || appState.indicador
        );
        window.ChartManager.updateInfantil(appState.payload);
        window.ChartManager.updateFundamental(appState.payload);
        window.ChartManager.updateMedio(appState.payload);
        window.ChartManager.updateModalidades(appState.payload, appState.modalidade);

        updateCards();
    }

    async function fetchLocalidades() {
        const response = await fetch("/api/localidades");
        if (!response.ok) throw new Error("Falha ao carregar localidades");

        const data = await response.json();
        appState.localidades = data.localidades || [];
        populateUfSelect();
        populateMunicipiosIfNeeded();
    }

    async function fetchDados() {
        const params = new URLSearchParams({ nivel: appState.nivel });

        if (appState.nivel === "estadual") {
            params.set("uf", appState.uf);
        }

        if (appState.nivel === "municipal") {
            params.set("codigo", appState.codigo);
        }

        const response = await fetch(`/api/dados?${params.toString()}`);
        if (!response.ok) throw new Error("Falha ao carregar dados");

        appState.payload = await response.json();
        updateAllVisuals();
    }

    function bindEvents() {
        els.levelButtons().forEach((button) => {
            button.addEventListener("click", () => {
                setLevel(button.dataset.level);
            });
        });

        els.ufSelect.addEventListener("change", () => {
            appState.uf = els.ufSelect.value;
            if (appState.nivel === "municipal") {
                populateMunicipiosIfNeeded();
            }
            fetchDados();
        });

        els.municipioSelect.addEventListener("change", () => {
            appState.codigo = els.municipioSelect.value;
            fetchDados();
        });

        els.indicadorSelect.addEventListener("change", () => {
            appState.indicador = els.indicadorSelect.value;
            if (!appState.payload) return;
            window.ChartManager.updateEvolucaoGeral(
                appState.payload,
                appState.indicador,
                indicatorLabels[appState.indicador] || appState.indicador
            );
            updateCards();
        });

        els.modalidadeButtons.forEach((button) => {
            button.addEventListener("click", () => {
                appState.modalidade = button.dataset.modalidade;
                els.modalidadeButtons.forEach((item) => item.classList.toggle("active", item === button));
                if (appState.payload) {
                    window.ChartManager.updateModalidades(appState.payload, appState.modalidade);
                }
            });
        });
    }

    async function waitForChartJs() {
        if (window.Chart) return;
        await new Promise((resolve, reject) => {
            let attempts = 0;
            const timer = setInterval(() => {
                attempts += 1;
                if (window.Chart) {
                    clearInterval(timer);
                    resolve();
                }
                if (attempts > 60) {
                    clearInterval(timer);
                    reject(new Error("Chart.js não carregou"));
                }
            }, 100);
        });
    }

    async function init() {
        try {
            await waitForChartJs();
            window.ChartManager.initCharts();
            bindEvents();
            await fetchLocalidades();
            syncLevelButtons();
            toggleControlVisibility();
            await fetchDados();
        } catch (error) {
            console.error(error);
        }
    }

    window.AppState = appState;
    document.addEventListener("DOMContentLoaded", init);
})();
