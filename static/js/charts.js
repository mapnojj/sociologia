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

    function lineDataset(label, data, color, dashed = false) {
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
            borderDash: dashed ? [6, 4] : undefined
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

    window.ChartManager = {
        initCharts,
        updateEvolucaoGeral,
        updateInfantil,
        updateFundamental,
        updateMedio,
        updateModalidades
    };
})();
