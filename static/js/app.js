(() => {
    const appState = {
        nivel: "brasil",
        uf: "",
        codigo: "",
        localidades: [],
        indicador: "Creche",
        modalidade: "EJA_Total",
        payload: null,
        superiorPayload: null
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
        cardVarPct: document.getElementById("card-var-pct"),
        medioNarrativeLocalityText: document.getElementById("medio-narrativa-localidade"),
        medioOfertaLocalityText: document.getElementById("medio-oferta-localidade"),
        ejaLocalityText: document.getElementById("eja-localidade"),
        medioCardFirstYearLabel: document.getElementById("medio-card-first-year-label"),
        medioCardFirstValue: document.getElementById("medio-card-first-value"),
        medioCardLastYearLabel: document.getElementById("medio-card-last-year-label"),
        medioCardLastValue: document.getElementById("medio-card-last-value"),
        medioCardVarPct: document.getElementById("medio-card-var-pct"),
        medioNarrativeMsg: document.getElementById("msg-medio-narrativa"),
        medioOfertaMsg: document.getElementById("msg-medio-oferta"),
        ejaNarrativeMsg: document.getElementById("msg-eja-narrativa"),
        superiorLocalityText: document.getElementById("superior-localidade"),
        superiorCardFirstYearLabel: document.getElementById("sup-card-first-year-label"),
        superiorCardFirstValue: document.getElementById("sup-card-first-value"),
        superiorCardLastYearLabel: document.getElementById("sup-card-last-year-label"),
        superiorCardLastValue: document.getElementById("sup-card-last-value"),
        superiorCardVarPct: document.getElementById("sup-card-var-pct"),
        superiorFederal: document.getElementById("sup-publica-federal"),
        superiorEstadual: document.getElementById("sup-publica-estadual"),
        superiorMunicipal: document.getElementById("sup-publica-municipal"),
        superiorMsgExpansao: document.getElementById("msg-superior-expansao"),
        superiorMsgModalidade: document.getElementById("msg-superior-modalidade"),
        superiorMsgRede: document.getElementById("msg-superior-rede"),
        superiorMsgFluxo: document.getElementById("msg-superior-fluxo")
    };

    function formatNumber(value) {
        return brFormatter.format(value || 0);
    }

    function formatNullableNumber(value) {
        if (value === null || value === undefined) return "—";
        return brFormatter.format(value);
    }

    function getLocalidadeByUf(uf) {
        return appState.localidades.find((item) => item.uf === uf);
    }

    function superiorApiLevel(level) {
        if (level === "estadual") return "estado";
        if (level === "municipal") return "municipio";
        return "brasil";
    }

    async function setLevel(level) {
        appState.nivel = level;
        syncLevelButtons();
        toggleControlVisibility();

        if (level === "brasil") {
            await refreshAllData();
            return;
        }

        if (!appState.uf && appState.localidades.length) {
            appState.uf = appState.localidades[0].uf;
            els.ufSelect.value = appState.uf;
        }

        populateMunicipiosIfNeeded();
        await refreshAllData();
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

    function getSeriesSummary(payload, column) {
        const points = getAvailableSeriesPoints(payload, column);
        return {
            first: points[0] || null,
            last: points[points.length - 1] || null,
            count: points.length
        };
    }

    function formatVariation(first, last) {
        if (!first || !last || first.ano === last.ano || !first.valor) return "—";
        const pct = ((last.valor / first.valor) - 1) * 100;
        return `${pct.toLocaleString("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%`;
    }

    function updateNarrativeCards() {
        const payload = appState.payload;
        if (!payload) return;

        const { first, last } = getSeriesSummary(payload, "Ensino_Medio_Total");

        els.medioCardFirstYearLabel.textContent = first ? `${first.ano}` : "Primeiro ano";
        els.medioCardLastYearLabel.textContent = last ? `${last.ano}` : "Último ano";
        els.medioCardFirstValue.textContent = first ? formatNullableNumber(first.valor) : "—";
        els.medioCardLastValue.textContent = last ? formatNullableNumber(last.valor) : "—";
        els.medioCardVarPct.textContent = formatVariation(first, last);
    }

    function getSeriesMessage(payload, column, requiredPoints = 2) {
        const { count } = getSeriesSummary(payload, column);
        if (!count) return "Não há dados disponíveis para esta localidade no período selecionado.";
        if (count < requiredPoints) return "Há apenas um ano com registro disponível para esta localidade.";
        return "";
    }

    function setChartMessage(element, message) {
        if (!element) return;
        if (!message) {
            element.classList.add("hidden");
            element.textContent = "";
            return;
        }

        element.textContent = message;
        element.classList.remove("hidden");
    }

    function updateAllVisuals() {
        if (!appState.payload) return;

        els.localityText.textContent = appState.payload.localidade;
        els.medioNarrativeLocalityText.textContent = appState.payload.localidade;
        els.medioOfertaLocalityText.textContent = appState.payload.localidade;
        els.ejaLocalityText.textContent = appState.payload.localidade;

        window.ChartManager.updateEvolucaoGeral(
            appState.payload,
            appState.indicador,
            indicatorLabels[appState.indicador] || appState.indicador
        );
        window.ChartManager.updateInfantil(appState.payload);
        window.ChartManager.updateFundamental(appState.payload);
        window.ChartManager.updateMedio(appState.payload);
        window.ChartManager.updateModalidades(appState.payload, appState.modalidade);
        window.ChartManager.updateMedioNarrativa(appState.payload);
        window.ChartManager.updateMedioOferta(appState.payload);
        window.ChartManager.updateEjaNarrativa(appState.payload);

        updateCards();
        updateNarrativeCards();
        setChartMessage(els.medioNarrativeMsg, getSeriesMessage(appState.payload, "Ensino_Medio_Total"));
        setChartMessage(els.medioOfertaMsg, getSeriesMessage(appState.payload, "Ensino_Medio_Total"));
        setChartMessage(els.ejaNarrativeMsg, getSeriesMessage(appState.payload, "EJA_Total"));
    }

    function getColumnValueAtIndex(payload, column, index) {
        if (!payload?.dados?.[column]) return null;
        const value = payload.dados[column][index];
        return value === undefined ? null : value;
    }

    function getAvailableSeriesPoints(payload, column) {
        if (!payload?.anos?.length) return [];
        return payload.anos
            .map((ano, index) => ({
                ano,
                valor: getColumnValueAtIndex(payload, column, index),
                index
            }))
            .filter((item) => item.valor !== null && item.valor !== undefined);
    }

    function hasSeriesData(payload, column) {
        return getAvailableSeriesPoints(payload, column).length > 0;
    }

    function hasAllSeriesData(payload, columns) {
        return columns.every((column) => hasSeriesData(payload, column));
    }

    function toggleChartMessage(element, show) {
        if (!element) return;
        element.classList.toggle("hidden", !show);
    }

    function updateSuperiorCards() {
        const payload = appState.superiorPayload;
        if (!payload) return;

        const points = getAvailableSeriesPoints(payload, "Matriculas_Total");
        const first = points[0];
        const last = points[points.length - 1];

        els.superiorCardFirstYearLabel.textContent = first ? `${first.ano}` : "Primeiro ano";
        els.superiorCardLastYearLabel.textContent = last ? `${last.ano}` : "Último ano";
        els.superiorCardFirstValue.textContent = first ? formatNullableNumber(first.valor) : "—";
        els.superiorCardLastValue.textContent = last ? formatNullableNumber(last.valor) : "—";

        if (!first || !last || first.ano === last.ano || !first.valor) {
            els.superiorCardVarPct.textContent = "—";
            return;
        }

        const pct = ((last.valor / first.valor) - 1) * 100;
        els.superiorCardVarPct.textContent = `${pct.toLocaleString("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%`;
    }

    function updateSuperiorPublicComposition() {
        const payload = appState.superiorPayload;
        if (!payload?.anos?.length) return;

        let lastIndex = -1;
        for (let i = payload.anos.length - 1; i >= 0; i -= 1) {
            const federal = getColumnValueAtIndex(payload, "Matriculas_Federal", i);
            const estadual = getColumnValueAtIndex(payload, "Matriculas_Estadual", i);
            const municipal = getColumnValueAtIndex(payload, "Matriculas_Municipal", i);
            if (federal !== null || estadual !== null || municipal !== null) {
                lastIndex = i;
                break;
            }
        }

        if (lastIndex < 0) {
            els.superiorFederal.textContent = "—";
            els.superiorEstadual.textContent = "—";
            els.superiorMunicipal.textContent = "—";
            return;
        }

        els.superiorFederal.textContent = formatNullableNumber(getColumnValueAtIndex(payload, "Matriculas_Federal", lastIndex));
        els.superiorEstadual.textContent = formatNullableNumber(getColumnValueAtIndex(payload, "Matriculas_Estadual", lastIndex));
        els.superiorMunicipal.textContent = formatNullableNumber(getColumnValueAtIndex(payload, "Matriculas_Municipal", lastIndex));
    }

    function updateSuperiorVisuals() {
        const payload = appState.superiorPayload;
        if (!payload) return;

        const localidade = appState.payload?.localidade || payload.localidade || "Brasil";
        els.superiorLocalityText.textContent = localidade;

        window.ChartManager.updateSuperiorExpansao(payload);
        window.ChartManager.updateSuperiorModalidade(payload);
        window.ChartManager.updateSuperiorRede(payload);
        window.ChartManager.updateSuperiorFluxo(payload);

        toggleChartMessage(els.superiorMsgExpansao, !hasSeriesData(payload, "Matriculas_Total"));
        toggleChartMessage(
            els.superiorMsgModalidade,
            !hasAllSeriesData(payload, ["Matriculas_Presencial", "Matriculas_EAD"])
        );
        toggleChartMessage(
            els.superiorMsgRede,
            !hasAllSeriesData(payload, ["Matriculas_Publica", "Matriculas_Privada"])
        );
        toggleChartMessage(
            els.superiorMsgFluxo,
            !hasAllSeriesData(payload, ["Ingressantes", "Concluintes"])
        );

        updateSuperiorCards();
        updateSuperiorPublicComposition();
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

    async function fetchEnsinoSuperior() {
        const params = new URLSearchParams({ nivel: superiorApiLevel(appState.nivel) });

        if (appState.nivel === "estadual") {
            params.set("uf", appState.uf);
        }

        if (appState.nivel === "municipal") {
            params.set("codigo", appState.codigo);
        }

        const response = await fetch(`/api/ensino-superior?${params.toString()}`);
        if (!response.ok) throw new Error("Falha ao carregar dados de Ensino Superior");

        appState.superiorPayload = await response.json();
        updateSuperiorVisuals();
    }

    async function refreshAllData() {
        await fetchDados();
        await fetchEnsinoSuperior();
    }

    function handleAsyncError(error) {
        console.error(error);
    }

    function bindEvents() {
        els.levelButtons().forEach((button) => {
            button.addEventListener("click", () => {
                setLevel(button.dataset.level).catch(handleAsyncError);
            });
        });

        els.ufSelect.addEventListener("change", () => {
            appState.uf = els.ufSelect.value;
            if (appState.nivel === "municipal") {
                populateMunicipiosIfNeeded();
            }
            refreshAllData().catch(handleAsyncError);
        });

        els.municipioSelect.addEventListener("change", () => {
            appState.codigo = els.municipioSelect.value;
            refreshAllData().catch(handleAsyncError);
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
            await refreshAllData();
        } catch (error) {
            console.error(error);
        }
    }

    window.AppState = appState;
    document.addEventListener("DOMContentLoaded", init);
})();
