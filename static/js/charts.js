(() => {
    const numberFormatter = new Intl.NumberFormat("pt-BR");

    const palette = {
        blue: "#2f5bff",
        cyan: "#00a7d7",
        purple: "#8d55ff",
        green: "#00a16b",
        orange: "#ff8c32",
        gray: "#5d6b86"
    };

    const charts = {};

    function baseOptions() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: "index", intersect: false },
            animation: { duration: 650, easing: "easeOutQuart" },
            plugins: {
                legend: { labels: { color: "#12213d", boxWidth: 14 } },
                tooltip: {
                    callbacks: {
                        label: (ctx) => `${ctx.dataset.label}: ${numberFormatter.format(ctx.raw ?? 0)}`
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: "#44526f" },
                    grid: { color: "rgba(68, 82, 111, 0.10)" }
                },
                y: {
                    ticks: {
                        color: "#44526f",
                        callback: (value) => numberFormatter.format(value)
                    },
                    grid: { color: "rgba(68, 82, 111, 0.10)" }
                }
            }
        };
    }

    function lineDataset(label, data, color, dashed = false, extras = {}) {
        return {
            label,
            data,
            borderColor: color,
            backgroundColor: `${color}33`,
            tension: 0.28,
            borderWidth: 2,
            pointRadius: 2,
            pointHoverRadius: 4,
            fill: false,
            borderDash: dashed ? [6, 4] : undefined,
            spanGaps: false,
            ...extras
        };
    }

    function barDataset(label, data, color, extras = {}) {
        return {
            type: "bar",
            label,
            data,
            backgroundColor: `${color}b3`,
            borderColor: color,
            borderWidth: 1,
            borderRadius: 8,
            borderSkipped: false,
            ...extras
        };
    }

    function chartData(payload, column) {
        return payload?.dados?.[column] || [];
    }

    function updateChart(chart, labels, datasets) {
        if (!chart) return;
        chart.data.labels = labels;
        chart.data.datasets = datasets;
        chart.update();
    }

    function getLastDefinedIndex(data = []) {
        for (let i = data.length - 1; i >= 0; i -= 1) {
            if (data[i] !== null && data[i] !== undefined) return i;
        }
        return -1;
    }

    function highlightedPoints(data, defaultRadius = 2, highlightRadius = 5) {
        const lastIndex = getLastDefinedIndex(data);
        return data.map((value, index) => {
            if (value === null || value === undefined) return 0;
            return index === lastIndex ? highlightRadius : defaultRadius;
        });
    }

    function initCharts() {
        if (!window.Chart) throw new Error("Chart.js não está disponível");

        const options = baseOptions();

        charts.evolucaoGeral = new Chart(document.getElementById("chart-evolucao-geral"), {
            type: "line",
            data: { labels: [], datasets: [] },
            options
        });

        charts.infantil = new Chart(document.getElementById("chart-infantil"), {
            type: "line",
            data: { labels: [], datasets: [] },
            options
        });

        charts.fundamentalEvolucao = new Chart(document.getElementById("chart-fundamental-evolucao"), {
            type: "line",
            data: { labels: [], datasets: [] },
            options
        });

        charts.fundamentalAdm = new Chart(document.getElementById("chart-fundamental-adm"), {
            type: "line",
            data: { labels: [], datasets: [] },
            options
        });

        charts.medioEvolucao = new Chart(document.getElementById("chart-medio-evolucao"), {
            type: "line",
            data: { labels: [], datasets: [] },
            options
        });

        charts.medioAdm = new Chart(document.getElementById("chart-medio-adm"), {
            type: "line",
            data: { labels: [], datasets: [] },
            options
        });

        charts.modalidades = new Chart(document.getElementById("chart-modalidades"), {
            type: "line",
            data: { labels: [], datasets: [] },
            options
        });

        charts.medioNarrativa = new Chart(document.getElementById("chart-medio-narrativa"), {
            type: "line",
            data: { labels: [], datasets: [] },
            options
        });

        charts.medioOferta = new Chart(document.getElementById("chart-medio-oferta"), {
            type: "line",
            data: { labels: [], datasets: [] },
            options
        });

        const stackedOptions = baseOptions();
        stackedOptions.scales.x.stacked = true;
        stackedOptions.scales.y.stacked = true;

        charts.ejaNarrativa = new Chart(document.getElementById("chart-eja-narrativa"), {
            type: "bar",
            data: { labels: [], datasets: [] },
            options: stackedOptions
        });

        charts.superiorExpansao = new Chart(document.getElementById("chart-superior-expansao"), {
            type: "line",
            data: { labels: [], datasets: [] },
            options
        });

        charts.superiorModalidade = new Chart(document.getElementById("chart-superior-modalidade"), {
            type: "line",
            data: { labels: [], datasets: [] },
            options
        });

        charts.superiorRede = new Chart(document.getElementById("chart-superior-rede"), {
            type: "line",
            data: { labels: [], datasets: [] },
            options
        });

        charts.superiorFluxo = new Chart(document.getElementById("chart-superior-fluxo"), {
            type: "line",
            data: { labels: [], datasets: [] },
            options
        });
    }

    function updateEvolucaoGeral(payload, indicatorColumn, label) {
        updateChart(charts.evolucaoGeral, payload.anos, [
            lineDataset(label, chartData(payload, indicatorColumn), palette.blue)
        ]);
    }

    function updateInfantil(payload) {
        updateChart(charts.infantil, payload.anos, [
            lineDataset("Creche", chartData(payload, "Creche"), palette.blue),
            lineDataset("Pré-escola", chartData(payload, "Pre_Escola"), palette.cyan)
        ]);
    }

    function updateFundamental(payload) {
        updateChart(charts.fundamentalEvolucao, payload.anos, [
            lineDataset("Fundamental Total", chartData(payload, "Fundamental_Total"), palette.blue),
            lineDataset("Anos Iniciais", chartData(payload, "Fundamental_Anos_Iniciais"), palette.purple),
            lineDataset("Anos Finais", chartData(payload, "Fundamental_Anos_Finais"), palette.green)
        ]);

        updateChart(charts.fundamentalAdm, payload.anos, [
            lineDataset("Federal", chartData(payload, "Fundamental_Federal"), palette.gray, true),
            lineDataset("Estadual", chartData(payload, "Fundamental_Estadual"), palette.blue),
            lineDataset("Municipal", chartData(payload, "Fundamental_Municipal"), palette.green),
            lineDataset("Privada", chartData(payload, "Fundamental_Privada"), palette.orange)
        ]);
    }

    function updateMedio(payload) {
        updateChart(charts.medioEvolucao, payload.anos, [
            lineDataset("Ensino Médio Total", chartData(payload, "Ensino_Medio_Total"), palette.blue)
        ]);

        updateChart(charts.medioAdm, payload.anos, [
            lineDataset("Federal", chartData(payload, "Ensino_Medio_Federal"), palette.gray, true),
            lineDataset("Estadual", chartData(payload, "Ensino_Medio_Estadual"), palette.purple),
            lineDataset("Municipal", chartData(payload, "Ensino_Medio_Municipal"), palette.green),
            lineDataset("Privada", chartData(payload, "Ensino_Medio_Privada"), palette.orange)
        ]);
    }

    function updateModalidades(payload, modalidade) {
        const labels = {
            EJA_Total: "EJA Total",
            EJA_Ensino_Fundamental: "EJA Ensino Fundamental",
            EJA_Ensino_Medio: "EJA Ensino Médio",
            Educacao_Profissional: "Educação Profissional",
            Educacao_Especial: "Educação Especial"
        };

        updateChart(charts.modalidades, payload.anos, [
            lineDataset(labels[modalidade] || modalidade, chartData(payload, modalidade), palette.blue)
        ]);
    }

    function updateMedioNarrativa(payload) {
        const total = chartData(payload, "Ensino_Medio_Total");
        updateChart(charts.medioNarrativa, payload.anos, [
            lineDataset("Ensino Médio Total", total, palette.blue, false, {
                pointRadius: highlightedPoints(total),
                pointHoverRadius: highlightedPoints(total, 4, 7)
            })
        ]);
    }

    function updateMedioOferta(payload) {
        updateChart(charts.medioOferta, payload.anos, [
            lineDataset("Federal", chartData(payload, "Ensino_Medio_Federal"), palette.gray, true),
            lineDataset("Estadual", chartData(payload, "Ensino_Medio_Estadual"), palette.blue),
            lineDataset("Municipal", chartData(payload, "Ensino_Medio_Municipal"), palette.green),
            lineDataset("Privada", chartData(payload, "Ensino_Medio_Privada"), palette.orange)
        ]);
    }

    function updateEjaNarrativa(payload) {
        const total = chartData(payload, "EJA_Total");
        updateChart(charts.ejaNarrativa, payload.anos, [
            barDataset("EJA Ensino Fundamental", chartData(payload, "EJA_Ensino_Fundamental"), palette.cyan, {
                stack: "eja",
                order: 2
            }),
            barDataset("EJA Ensino Médio", chartData(payload, "EJA_Ensino_Medio"), palette.purple, {
                stack: "eja",
                order: 2
            }),
            lineDataset("EJA Total", total, palette.blue, false, {
                type: "line",
                pointRadius: highlightedPoints(total),
                pointHoverRadius: highlightedPoints(total, 4, 7),
                order: 1
            })
        ]);
    }

    function updateSuperiorExpansao(payload) {
        const values = chartData(payload, "Matriculas_Total");
        updateChart(charts.superiorExpansao, payload.anos, [
            lineDataset("Matrículas totais", values, palette.blue)
        ]);
    }

    function updateSuperiorModalidade(payload) {
        const presencial = chartData(payload, "Matriculas_Presencial");
        const ead = chartData(payload, "Matriculas_EAD");

        updateChart(charts.superiorModalidade, payload.anos, [
            lineDataset("Presencial", presencial, palette.blue, false, {
                pointRadius: highlightedPoints(presencial),
                pointHoverRadius: highlightedPoints(presencial, 4, 7)
            }),
            lineDataset("EaD", ead, palette.purple, false, {
                pointRadius: highlightedPoints(ead),
                pointHoverRadius: highlightedPoints(ead, 4, 7)
            })
        ]);
    }

    function updateSuperiorRede(payload) {
        updateChart(charts.superiorRede, payload.anos, [
            lineDataset("Pública", chartData(payload, "Matriculas_Publica"), palette.green),
            lineDataset("Privada", chartData(payload, "Matriculas_Privada"), palette.orange)
        ]);
    }

    function updateSuperiorFluxo(payload) {
        updateChart(charts.superiorFluxo, payload.anos, [
            lineDataset("Ingressantes", chartData(payload, "Ingressantes"), palette.cyan),
            lineDataset("Concluintes", chartData(payload, "Concluintes"), palette.gray)
        ]);
    }

    window.ChartManager = {
        initCharts,
        updateEvolucaoGeral,
        updateInfantil,
        updateFundamental,
        updateMedio,
        updateModalidades,
        updateMedioNarrativa,
        updateMedioOferta,
        updateEjaNarrativa,
        updateSuperiorExpansao,
        updateSuperiorModalidade,
        updateSuperiorRede,
        updateSuperiorFluxo
    };
})();
