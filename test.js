document.addEventListener('DOMContentLoaded', (event) => {
    const chartInstances = {};
    const toggleThemeButton = document.getElementById('toggleThemeButton');

    function clearCanvas(canvasId) {
        const canvas = document.getElementById(canvasId);
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (chartInstances[canvasId]) {
            chartInstances[canvasId].destroy();
            chartInstances[canvasId] = null;
        }
    }

    function drawGraph(canvasId, label, xValues, yValues, color, xLabel, yLabel) {
        clearCanvas(canvasId);
        const ctx = document.getElementById(canvasId).getContext('2d');
        chartInstances[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: xValues,
                datasets: [{
                    label: label,
                    data: yValues,
                    borderColor: color,
                    borderWidth: 2
                }]
            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: xLabel
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: yLabel
                        }
                    }
                }
            }
        });
    }

    function integrateFunction(func, variable, start, end, step) {
        let totalArea = 0;
        for (let x = start; x < end; x += step) {
            let valueAtX = math.evaluate(func.replace(new RegExp(variable, 'g'), `(${x})`));
            let valueAtNextX = math.evaluate(func.replace(new RegExp(variable, 'g'), `(${x + step})`));
            let averageHeight = (valueAtX + valueAtNextX) / 2;
            totalArea += averageHeight * step;
        }
        return totalArea;
    }

    function calculateValues(userFunction, derivativeOrder = 0) {
        let values = [];
        let functionToEvaluate = userFunction;

        if (derivativeOrder > 0) {
            for (let i = 0; i < derivativeOrder; i++) {
                functionToEvaluate = math.derivative(functionToEvaluate, 't').toString();
            }
            for (let t = 0; t <= 10; t += 0.1) {
                let value = math.evaluate(functionToEvaluate.replace(/t/g, `(${t})`));
                values.push(parseFloat(value.toFixed(2)));
            }
        } else if (derivativeOrder === -1) {
            let integralValue = 0;
            for (let t = 0; t <= 10; t += 0.1) {
                integralValue += integrateFunction(functionToEvaluate, 't', t, t + 0.1, 0.01);
                values.push(parseFloat(integralValue.toFixed(2)));
            }
        } else if (derivativeOrder === -2) {
            let integralVelocity = 0;
            let integralPosition = 0;
            for (let t = 0; t <= 10; t += 0.1) {
                integralVelocity += integrateFunction(userFunction, 't', t, t + 0.1, 0.01);
                integralPosition += integralVelocity * 0.1;
                values.push(parseFloat(integralPosition.toFixed(2)));
            }
        } else {
            for (let t = 0; t <= 10; t += 0.1) {
                let value = math.evaluate(functionToEvaluate.replace(/t/g, `(${t})`));
                values.push(parseFloat(value.toFixed(2)));
            }
        }

        return values;
    }



    function determineAndDrawGraphs() {
        let userInput = document.getElementById('functionInput').value;
        let functionType = userInput.match(/(x|v|a)\(t\)/);

        if (functionType) {
            let userFunction = userInput.match(/=(.*)/)[1].trim();
            let xValues = Array.from({length: 101}, (_, i) => (0.1 * i).toFixed(2));

            switch (functionType[1]) {
                case 'x':
                    drawGraph('mainGraph', 'Координата от времени', xValues, calculateValues(userFunction), 'blue', 'Время (с)', 'Координата (м)');
                    drawGraph('sideGraph1', 'Скорость от времени', xValues, calculateValues(userFunction, 1), 'red', 'Время (с)', 'Скорость (м/с)');
                    drawGraph('sideGraph2', 'Ускорение от времени', xValues, calculateValues(userFunction, 2), 'green', 'Время (с)', 'Ускорение (м/с²)');
                    break;
                case 'v':
                    drawGraph('mainGraph', 'Скорость от времени', xValues, calculateValues(userFunction, 1), 'red', 'Время (с)', 'Скорость (м/с)');
                    drawGraph('sideGraph1', 'Координата от времени', xValues, calculateValues(userFunction), 'blue', 'Время (с)', 'Координата (м)');
                    drawGraph('sideGraph2', 'Ускорение от времени', xValues, calculateValues(userFunction, 2), 'green', 'Время (с)', 'Ускорение (м/с²)');
                    break;
                case 'a':
                    drawGraph('mainGraph', 'Ускорение от времени', xValues, calculateValues(userFunction, 2), 'green', 'Время (с)', 'Ускорение (м/с²)');
                    drawGraph('sideGraph1', 'Координата от времени', xValues, calculateValues(userFunction), 'blue', 'Время (с)', 'Координата (м)');
                    drawGraph('sideGraph2', 'Скорость от времени', xValues, calculateValues(userFunction, 1), 'red', 'Время (с)', 'Скорость (м/с)');
                    break;
                default:
                    alert('Введите корректную функцию (x(t), v(t) или a(t))');
            }
        } else {
            alert('Введите корректную функцию (x(t), v(t) или a(t))');
        }
    }

    document.getElementById('drawGraphsButton').addEventListener('click', determineAndDrawGraphs);

    toggleThemeButton.addEventListener('click', () => {
        document.body.classList.toggle('night-theme');
    });
});
