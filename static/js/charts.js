(() => {
    const numberFormatter = new Intl.NumberFormat("pt-BR");

    const palette = {
        blue: "#2f5bff",
        cyan: "#00a7d7",
        purple: "#8d55ff",
        green: "#00a16b",
        orange: "#ff8c32",
        gray: "#5d6b86",
        editorialGold: "#d8b06a"
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

    function createChartOptions({ editorial = false } = {}) {
        const options = baseOptions();
        return editorial ? withEditorialTheme(options) : options;
    }

    function withLegendVisibility(options, display) {
        return {
            ...options,
            plugins: {
                ...options.plugins,
                legend: {
                    ...options.plugins.legend,
                    display
                }
            }
        };
    }

    function createModalidadesOptions() {
        const options = withEditorialTheme(baseOptions());
        return {
            ...options,
            plugins: {
                ...options.plugins,
                legend: {
                    ...options.plugins.legend,
                    labels: {
                        ...options.plugins.legend.labels,
                        color: "rgba(247, 241, 232, 0.92)"
                    }
                },
                tooltip: {
                    ...options.plugins.tooltip,
                    backgroundColor: "rgba(43, 5, 7, 0.9)",
                    borderColor: "rgba(168, 120, 56, 0.64)",
                    titleColor: "#f4eee4",
                    bodyColor: "#f4eee4"
                }
            },
            scales: {
                x: {
                    ...options.scales.x,
                    ticks: {
                        ...options.scales.x.ticks,
                        color: "rgba(247, 241, 232, 0.75)"
                    },
                    grid: {
                        ...options.scales.x.grid,
                        color: "rgba(247, 241, 232, 0.10)"
                    }
                },
                y: {
                    ...options.scales.y,
                    ticks: {
                        ...options.scales.y.ticks,
                        color: "rgba(247, 241, 232, 0.75)"
                    },
                    grid: {
                        ...options.scales.y.grid,
                        color: "rgba(247, 241, 232, 0.10)"
                    }
                }
            }
        };
    }

    function createSuperiorModalidadeOptions() {
        const options = withEditorialTheme(baseOptions());
        return {
            ...options,
            plugins: {
                ...options.plugins,
                legend: {
                    ...options.plugins.legend,
                    position: "top",
                    align: "start",
                    labels: {
                        ...options.plugins.legend.labels,
                        color: "rgba(247, 241, 232, 0.92)",
                        boxWidth: 8,
                        boxHeight: 8,
                        padding: 14
                    }
                },
                tooltip: {
                    ...options.plugins.tooltip,
                    backgroundColor: "rgba(43, 5, 7, 0.92)",
                    titleColor: "#f4eee4",
                    bodyColor: "#f4eee4",
                    borderColor: "rgba(168, 120, 56, 0.64)",
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    ...options.scales.x,
                    ticks: {
                        ...options.scales.x.ticks,
                        color: "rgba(247, 241, 232, 0.8)"
                    },
                    grid: {
                        ...options.scales.x.grid,
                        color: "rgba(247, 241, 232, 0.10)"
                    }
                },
                y: {
                    ...options.scales.y,
                    ticks: {
                        ...options.scales.y.ticks,
                        color: "rgba(247, 241, 232, 0.8)"
                    },
                    grid: {
                        ...options.scales.y.grid,
                        color: "rgba(247, 241, 232, 0.10)"
                    }
                }
            }
        };
    }

    function withEditorialTheme(options = baseOptions()) {
        return {
            ...options,
            plugins: {
                ...options.plugins,
                legend: {
                    ...options.plugins.legend,
                    labels: {
                        ...options.plugins.legend.labels,
                        color: "rgba(247, 241, 232, 0.9)",
                        boxWidth: 10,
                        boxHeight: 10,
                        usePointStyle: true,
                        pointStyle: "circle",
                        padding: 18
                    }
                },
                tooltip: {
                    ...options.plugins.tooltip,
                    backgroundColor: "rgba(43, 5, 7, 0.95)",
                    titleColor: "#f4eee4",
                    bodyColor: "#f4eee4",
                    borderColor: "rgba(168, 120, 56, 0.65)",
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    ...options.scales.x,
                    border: { color: "rgba(247, 241, 232, 0.18)" },
                    ticks: {
                        ...options.scales.x.ticks,
                        color: "rgba(247, 241, 232, 0.85)"
                    },
                    grid: {
                        ...options.scales.x.grid,
                        color: "rgba(247, 241, 232, 0.10)"
                    }
                },
                y: {
                    ...options.scales.y,
                    border: { color: "rgba(247, 241, 232, 0.18)" },
                    ticks: {
                        ...options.scales.y.ticks,
                        color: "rgba(247, 241, 232, 0.85)"
                    },
                    grid: {
                        ...options.scales.y.grid,
                        color: "rgba(247, 241, 232, 0.10)"
                    }
                }
            }
        };
    }

    function editorialLineDataset(label, data, color, extras = {}) {
        return lineDataset(label, data, color, false, {
            borderWidth: 2.8,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: color,
            pointBorderColor: color,
            ...extras
        });
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

        const options = createChartOptions();

        charts.evolucaoGeral = new Chart(document.getElementById("chart-evolucao-geral"), {
            type: "line",
            data: { labels: [], datasets: [] },
            options
        });

        charts.infantil = new Chart(document.getElementById("chart-infantil"), {
            type: "line",
            data: { labels: [], datasets: [] },
            options: createChartOptions({ editorial: true })
        });

        charts.fundamentalEvolucao = new Chart(document.getElementById("chart-fundamental-evolucao"), {
            type: "line",
            data: { labels: [], datasets: [] },
            options: createChartOptions({ editorial: true })
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
            options: createModalidadesOptions()
        });

        charts.superiorExpansao = new Chart(document.getElementById("chart-superior-expansao"), {
            type: "line",
            data: { labels: [], datasets: [] },
            options: withLegendVisibility(createChartOptions({ editorial: true }), false)
        });

        charts.superiorModalidade = new Chart(document.getElementById("chart-superior-modalidade"), {
            type: "line",
            data: { labels: [], datasets: [] },
            options: createSuperiorModalidadeOptions()
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
            editorialLineDataset("Creche", chartData(payload, "Creche"), "#d8b06a"),
            editorialLineDataset("Pré-escola", chartData(payload, "Pre_Escola"), "#f4eee4")
        ]);
    }

    function updateFundamental(payload) {
        updateChart(charts.fundamentalEvolucao, payload.anos, [
            editorialLineDataset("Total", chartData(payload, "Fundamental_Total"), "#f4eee4"),
            editorialLineDataset("Anos Iniciais", chartData(payload, "Fundamental_Anos_Iniciais"), "#d8b06a"),
            editorialLineDataset("Anos Finais", chartData(payload, "Fundamental_Anos_Finais"), "#a87838")
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

        const modalidadeColors = {
            EJA_Total: "#f4eee4",
            EJA_Ensino_Fundamental: "#d8b06a",
            EJA_Ensino_Medio: "#855127",
            Educacao_Profissional: "#a87838",
            Educacao_Especial: "#ddc9ae"
        };

        updateChart(charts.modalidades, payload.anos, [
            lineDataset(
                labels[modalidade] || modalidade,
                chartData(payload, modalidade),
                modalidadeColors[modalidade] || "#f4eee4",
                false,
                {
                    pointRadius: 2,
                    pointHoverRadius: 4,
                    pointBackgroundColor: modalidadeColors[modalidade] || "#f4eee4",
                    pointBorderColor: modalidadeColors[modalidade] || "#f4eee4"
                }
            )
        ]);
    }

    function updateSuperiorExpansao(payload) {
        const values = chartData(payload, "Matriculas_Total");
        updateChart(charts.superiorExpansao, payload.anos, [
            editorialLineDataset("Matrículas totais", values, palette.editorialGold)
        ]);
    }

    function updateSuperiorModalidade(payload) {
        const presencial = chartData(payload, "Matriculas_Presencial");
        const ead = chartData(payload, "Matriculas_EAD");

        updateChart(charts.superiorModalidade, payload.anos, [
            editorialLineDataset("Presencial", presencial, "#f4eee4", {
                pointRadius: highlightedPoints(presencial, 2.2, 3.4),
                pointHoverRadius: highlightedPoints(presencial, 3.6, 5.2),
                pointBackgroundColor: "#f4eee4",
                pointBorderColor: "#f4eee4"
            }),
            editorialLineDataset("EaD", ead, "#a87838", {
                pointRadius: highlightedPoints(ead, 2.2, 3.4),
                pointHoverRadius: highlightedPoints(ead, 3.6, 5.2),
                pointBackgroundColor: "#a87838",
                pointBorderColor: "#a87838"
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
        updateSuperiorExpansao,
        updateSuperiorModalidade,
        updateSuperiorRede,
        updateSuperiorFluxo
    };
})();
