function separarFecha(fecha) {

    const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];

    if (!fecha) {
        return {
            dia: '',
            mes: ''
        };
    }

    const partes = fecha.split('-');

    const dia = Number(partes[2]);
    const numeroMes = Number(partes[1]);

    if (!dia || numeroMes < 1 || numeroMes > 12) {
        return {
            dia: '',
            mes: ''
        };
    }

    return {
        dia: dia,
        mes: meses[numeroMes - 1]
    };
}