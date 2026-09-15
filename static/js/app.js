(() => {
    const appState = {
        nivel: "brasil",
        uf: "",
        codigo: "",
        localidades: [],
        indicador: "Creche",
        modalidade: "EJA_Total",
        payload: null,
        superiorPayload: null,
        showInfantilPopulation: false,
        showFundamentalPopulation: false,
        showMedioPopulation: false
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

    const modalidadeLabels = {
        EJA_Total: "EJA Total",
        EJA_Ensino_Fundamental: "EJA Fundamental",
        EJA_Ensino_Medio: "EJA Médio",
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
        infantilCanvas: document.getElementById("chart-infantil"),
        infantilSummary: document.getElementById("chart-infantil-summary"),
        infantilPopulationToggle: document.getElementById("toggle-populacao-infantil"),
        infantilPopulationControl: document.getElementById("infantil-population-control"),
        infantilPopulationSource: document.getElementById("chart-infantil-pop-source"),
        fundamentalCanvas: document.getElementById("chart-fundamental-evolucao"),
        fundamentalSummary: document.getElementById("chart-fundamental-summary"),
        fundamentalPopulationToggle: document.getElementById("toggle-populacao-fundamental"),
        fundamentalPopulationControl: document.getElementById("fundamental-population-control"),
        fundamentalPopulationSource: document.getElementById("chart-fundamental-pop-source"),
        medioCanvas: document.getElementById("chart-medio-evolucao"),
        medioSummary: document.getElementById("chart-medio-summary"),
        medioPopulationToggle: document.getElementById("toggle-populacao-medio"),
        medioPopulationControl: document.getElementById("medio-population-control"),
        medioPopulationSource: document.getElementById("chart-medio-pop-source"),
        modalidadeButtons: [...document.querySelectorAll(".modalidades-tab-group .tab-btn")],
        modalidadesCanvas: document.getElementById("chart-modalidades"),
        modalidadesSummary: document.getElementById("chart-modalidades-summary"),
        localityText: document.getElementById("localidade-atual"),
        card2015: document.getElementById("card-2015"),
        card2025: document.getElementById("card-2025"),
        cardVarAbs: document.getElementById("card-var-abs"),
        cardVarPct: document.getElementById("card-var-pct"),
        superiorLocalityText: document.getElementById("superior-localidade"),
        superiorCardFirstYearLabel: document.getElementById("sup-card-first-year-label"),
        superiorCardFirstValue: document.getElementById("sup-card-first-value"),
        superiorCardLastYearLabel: document.getElementById("sup-card-last-year-label"),
        superiorCardLastValue: document.getElementById("sup-card-last-value"),
        superiorCardVarPct: document.getElementById("sup-card-var-pct"),
        superiorFederal: document.getElementById("sup-publica-federal"),
        superiorEstadual: document.getElementById("sup-publica-estadual"),
        superiorMunicipal: document.getElementById("sup-publica-municipal"),
        superiorExpansaoCanvas: document.getElementById("chart-superior-expansao"),
        superiorExpansaoSummary: document.getElementById("chart-superior-expansao-summary"),
        superiorModalidadeCanvas: document.getElementById("chart-superior-modalidade"),
        superiorModalidadeSummary: document.getElementById("chart-superior-modalidade-summary"),
        superiorRedeCanvas: document.getElementById("chart-superior-rede"),
        superiorRedeSummary: document.getElementById("chart-superior-rede-summary"),
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

    function populationDisabledReason() {
        return appState.payload?.populacao?.disabled_reason
            || "Dados populacionais por faixa etária disponíveis apenas para Brasil e Unidades da Federação.";
    }

    function isPopulationAvailable() {
        return Boolean(appState.payload?.populacao?.available);
    }

    function syncPopulationToggleInputs() {
        if (els.infantilPopulationToggle) {
            els.infantilPopulationToggle.checked = appState.showInfantilPopulation;
        }

        if (els.fundamentalPopulationToggle) {
            els.fundamentalPopulationToggle.checked = appState.showFundamentalPopulation;
        }

        if (els.medioPopulationToggle) {
            els.medioPopulationToggle.checked = appState.showMedioPopulation;
        }
    }

    function updatePopulationControlsState() {
        const disabled = !isPopulationAvailable();
        const reason = disabled ? populationDisabledReason() : "";

        [
            [els.infantilPopulationToggle, els.infantilPopulationControl],
            [els.fundamentalPopulationToggle, els.fundamentalPopulationControl],
            [els.medioPopulationToggle, els.medioPopulationControl]
        ].forEach(([input, wrapper]) => {
            if (!input || !wrapper) return;
            input.disabled = disabled;
            input.title = reason;
            wrapper.title = reason;
            wrapper.setAttribute("aria-disabled", disabled ? "true" : "false");
        });
    }

    function hidePopulationSeries() {
        appState.showInfantilPopulation = false;
        appState.showFundamentalPopulation = false;
        appState.showMedioPopulation = false;
        syncPopulationToggleInputs();
    }

    async function setLevel(level) {
        appState.nivel = level;
        syncLevelButtons();
        toggleControlVisibility();

        if (level === "municipal") {
            hidePopulationSeries();
            if (appState.payload) {
                window.ChartManager.updateInfantil(appState.payload, { showPopulation: false });
                window.ChartManager.updateFundamental(appState.payload, { showPopulation: false });
                window.ChartManager.updateMedio(appState.payload, { showPopulation: false });
                updateInfantilA11y();
                updateFundamentalA11y();
                updateMedioA11y();
                updatePopulationSourceNotes();
            }
        }

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

    function updateAllVisuals() {
        if (!appState.payload) return;

        els.localityText.textContent = appState.payload.localidade;
        updatePopulationControlsState();
        updateInfantilA11y();
        updateFundamentalA11y();
        updateMedioA11y();
        updatePopulationSourceNotes();

        window.ChartManager.updateEvolucaoGeral(
            appState.payload,
            appState.indicador,
            indicatorLabels[appState.indicador] || appState.indicador
        );
        window.ChartManager.updateInfantil(appState.payload, {
            showPopulation: appState.showInfantilPopulation && isPopulationAvailable()
        });
        window.ChartManager.updateFundamental(appState.payload, {
            showPopulation: appState.showFundamentalPopulation && isPopulationAvailable()
        });
        window.ChartManager.updateMedio(appState.payload, {
            showPopulation: appState.showMedioPopulation && isPopulationAvailable()
        });
        window.ChartManager.updateModalidades(appState.payload, appState.modalidade);
        updateModalidadesA11y();

        updateCards();
    }

    function updateModalidadesA11y() {
        const modalidadeLabel = modalidadeLabels[appState.modalidade] || appState.modalidade;
        const description = `Série anual de matrículas em ${modalidadeLabel} entre 2015 e 2025, atualizada pela escala territorial selecionada.`;

        if (els.modalidadesSummary) {
            els.modalidadesSummary.textContent = description;
        }

        if (els.modalidadesCanvas) {
            els.modalidadesCanvas.setAttribute("aria-label", `Gráfico de evolução das matrículas em ${modalidadeLabel} entre 2015 e 2025`);
        }
    }

    function updateInfantilA11y() {
        const showPopulation = appState.showInfantilPopulation && isPopulationAvailable();
        const description = showPopulation
            ? "Séries de Creche e Pré-escola com evolução anual de matrículas entre 2015 e 2025, comparadas à população de 0–3 e 4–5 anos do IBGE, atualizadas pela escala territorial selecionada."
            : "Séries de Creche e Pré-escola com evolução anual de matrículas entre 2015 e 2025, atualizadas pela escala territorial selecionada.";
        const label = showPopulation
            ? "Gráfico de evolução das matrículas em Creche e Pré-escola com população de 0–3 e 4–5 anos"
            : "Gráfico de evolução das matrículas em Creche e Pré-escola de 2015 a 2025";

        if (els.infantilSummary) {
            els.infantilSummary.textContent = description;
        }

        if (els.infantilCanvas) {
            els.infantilCanvas.setAttribute("aria-label", label);
        }
    }

    function updateFundamentalA11y() {
        const showPopulation = appState.showFundamentalPopulation && isPopulationAvailable();
        const description = showPopulation
            ? "Séries de Total, Anos Iniciais e Anos Finais com comparação da população de 6–10 e 11–14 anos do IBGE, atualizadas pela escala territorial selecionada."
            : "Séries de Total, Anos Iniciais e Anos Finais atualizadas pela escala territorial selecionada.";
        const label = showPopulation
            ? "Gráfico de evolução das matrículas totais, anos iniciais e anos finais no Ensino Fundamental com população de 6–10 e 11–14 anos"
            : "Gráfico de evolução das matrículas totais, anos iniciais e anos finais no Ensino Fundamental";

        if (els.fundamentalSummary) {
            els.fundamentalSummary.textContent = description;
        }

        if (els.fundamentalCanvas) {
            els.fundamentalCanvas.setAttribute("aria-label", label);
        }
    }

    function updateMedioA11y() {
        const showPopulation = appState.showMedioPopulation && isPopulationAvailable();
        const description = showPopulation
            ? "Série de matrículas no Ensino Médio entre 2015 e 2025 com comparação da população de 15–17 anos do IBGE, atualizada pela escala territorial selecionada."
            : "Série anual de matrículas no Ensino Médio entre 2015 e 2025, atualizada pela escala territorial selecionada.";
        const label = showPopulation
            ? "Gráfico de evolução das matrículas no Ensino Médio com população de 15–17 anos"
            : "Gráfico de evolução das matrículas no Ensino Médio de 2015 a 2025";

        if (els.medioSummary) {
            els.medioSummary.textContent = description;
        }

        if (els.medioCanvas) {
            els.medioCanvas.setAttribute("aria-label", label);
        }
    }

    function updatePopulationSourceNotes() {
        if (els.infantilPopulationSource) {
            els.infantilPopulationSource.classList.toggle(
                "hidden",
                !(appState.showInfantilPopulation && isPopulationAvailable())
            );
        }

        if (els.fundamentalPopulationSource) {
            els.fundamentalPopulationSource.classList.toggle(
                "hidden",
                !(appState.showFundamentalPopulation && isPopulationAvailable())
            );
        }

        if (els.medioPopulationSource) {
            els.medioPopulationSource.classList.toggle(
                "hidden",
                !(appState.showMedioPopulation && isPopulationAvailable())
            );
        }
    }

    function updateSuperiorExpansaoA11y(localidade, hasData) {
        const description = hasData
            ? `Série anual de matrículas totais no Ensino Superior entre 2015 e 2024 em ${localidade}, atualizada pela escala territorial selecionada.`
            : `Não há dados disponíveis para a evolução das matrículas totais no Ensino Superior entre 2015 e 2024 em ${localidade}.`;

        if (els.superiorExpansaoSummary) {
            els.superiorExpansaoSummary.textContent = description;
        }

        if (els.superiorExpansaoCanvas) {
            const label = hasData
                ? `Gráfico de evolução das matrículas totais no Ensino Superior entre 2015 e 2024 em ${localidade}`
                : `Gráfico indisponível de matrículas totais no Ensino Superior entre 2015 e 2024 em ${localidade}`;
            els.superiorExpansaoCanvas.setAttribute("aria-label", label);
        }
    }

    function updateSuperiorModalidadeA11y(localidade, hasPresencialData, hasEadData) {
        let description = `Não há dados disponíveis para a evolução das matrículas presenciais e em educação a distância no Ensino Superior entre 2015 e 2024 em ${localidade}.`;
        let label = `Gráfico indisponível de matrículas presenciais e em educação a distância no Ensino Superior entre 2015 e 2024 em ${localidade}`;

        if (hasPresencialData && hasEadData) {
            description = `Série anual de matrículas presenciais e em educação a distância no Ensino Superior entre 2015 e 2024 em ${localidade}, atualizada pela escala territorial selecionada.`;
            label = `Gráfico de evolução das matrículas presenciais e em educação a distância no Ensino Superior entre 2015 e 2024 em ${localidade}`;
        } else if (hasPresencialData || hasEadData) {
            const modalidadeDisponivel = hasPresencialData ? "presenciais" : "em educação a distância";
            description = `Série anual disponível apenas para matrículas ${modalidadeDisponivel} no Ensino Superior entre 2015 e 2024 em ${localidade}, atualizada pela escala territorial selecionada.`;
            label = `Gráfico de evolução parcial das matrículas ${modalidadeDisponivel} no Ensino Superior entre 2015 e 2024 em ${localidade}`;
        }

        if (els.superiorModalidadeSummary) {
            els.superiorModalidadeSummary.textContent = description;
        }

        if (els.superiorModalidadeCanvas) {
            els.superiorModalidadeCanvas.setAttribute("aria-label", label);
        }
    }

    function updateSuperiorModalidadeMessage(hasPresencialData, hasEadData) {
        if (!els.superiorMsgModalidade) return;

        if (hasPresencialData || hasEadData) {
            toggleChartMessage(els.superiorMsgModalidade, false);
            return;
        }

        els.superiorMsgModalidade.textContent = "Não há dados disponíveis para esta localidade no período selecionado.";
        toggleChartMessage(els.superiorMsgModalidade, true);
    }

    function updateSuperiorRedeA11y(localidade, hasPublicaData, hasPrivadaData) {
        let description = `Não há dados disponíveis para a evolução das matrículas por rede de oferta no Ensino Superior em ${localidade}.`;
        let label = `Gráfico indisponível de matrículas por rede de oferta no Ensino Superior em ${localidade}`;

        if (hasPublicaData && hasPrivadaData) {
            description = `Série anual de matrículas das redes pública e privada no Ensino Superior em ${localidade}, atualizada pela escala territorial selecionada.`;
            label = `Gráfico de evolução das matrículas das redes pública e privada no Ensino Superior em ${localidade}`;
        } else if (hasPublicaData || hasPrivadaData) {
            const redeDisponivel = hasPublicaData ? "pública" : "privada";
            description = `Série anual disponível apenas para a rede ${redeDisponivel} no Ensino Superior em ${localidade}, atualizada pela escala territorial selecionada.`;
            label = `Gráfico de evolução parcial das matrículas da rede ${redeDisponivel} no Ensino Superior em ${localidade}`;
        }

        if (els.superiorRedeSummary) {
            els.superiorRedeSummary.textContent = description;
        }

        if (els.superiorRedeCanvas) {
            els.superiorRedeCanvas.setAttribute("aria-label", label);
        }
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
        const hasExpansaoData = hasSeriesData(payload, "Matriculas_Total");
        const hasPresencialData = hasSeriesData(payload, "Matriculas_Presencial");
        const hasEadData = hasSeriesData(payload, "Matriculas_EAD");
        const hasPublicaData = hasSeriesData(payload, "Matriculas_Publica");
        const hasPrivadaData = hasSeriesData(payload, "Matriculas_Privada");
        els.superiorLocalityText.textContent = localidade;
        updateSuperiorExpansaoA11y(localidade, hasExpansaoData);
        updateSuperiorModalidadeA11y(localidade, hasPresencialData, hasEadData);
        updateSuperiorRedeA11y(localidade, hasPublicaData, hasPrivadaData);

        window.ChartManager.updateSuperiorExpansao(payload);
        window.ChartManager.updateSuperiorModalidade(payload);
        window.ChartManager.updateSuperiorRede(payload);
        window.ChartManager.updateSuperiorFluxo(payload);

        toggleChartMessage(els.superiorMsgExpansao, !hasExpansaoData);
        updateSuperiorModalidadeMessage(hasPresencialData, hasEadData);
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

        if (els.infantilPopulationToggle) {
            els.infantilPopulationToggle.addEventListener("change", () => {
                appState.showInfantilPopulation = els.infantilPopulationToggle.checked && isPopulationAvailable();
                syncPopulationToggleInputs();
                if (appState.payload) {
                    updateAllVisuals();
                }
            });
        }

        if (els.fundamentalPopulationToggle) {
            els.fundamentalPopulationToggle.addEventListener("change", () => {
                appState.showFundamentalPopulation = els.fundamentalPopulationToggle.checked && isPopulationAvailable();
                syncPopulationToggleInputs();
                if (appState.payload) {
                    updateAllVisuals();
                }
            });
        }

        if (els.medioPopulationToggle) {
            els.medioPopulationToggle.addEventListener("change", () => {
                appState.showMedioPopulation = els.medioPopulationToggle.checked && isPopulationAvailable();
                syncPopulationToggleInputs();
                if (appState.payload) {
                    updateAllVisuals();
                }
            });
        }

        els.modalidadeButtons.forEach((button) => {
            button.addEventListener("click", () => {
                appState.modalidade = button.dataset.modalidade;
                els.modalidadeButtons.forEach((item) => {
                    const isActive = item === button;
                    item.classList.toggle("active", isActive);
                    item.setAttribute("aria-pressed", isActive ? "true" : "false");
                });
                if (appState.payload) {
                    window.ChartManager.updateModalidades(appState.payload, appState.modalidade);
                    updateModalidadesA11y();
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
