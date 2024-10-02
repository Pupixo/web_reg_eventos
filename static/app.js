$(document).ready(function() {
    // Inicializar DataTable con opciones
    const eventTable = $('#eventTable').DataTable({
        "paging": true,
        "searching": true,
        "info": true
    });

    // Escuchar el envío del formulario
    $('#eventForm').on('submit', function(e) {
        e.preventDefault(); // Prevenir la recarga de la página

        // Obtener valores del formulario
        const eventName = $('#event').val();
        const eventDate = $('#date').val();
        const eventTime = $('#time').val();

        // Verificar que todos los campos estén llenos
        if (eventName && eventDate && eventTime) {
            // Agregar nueva fila a DataTable
            eventTable.row.add([
                eventName,
                eventDate,
                eventTime
            ]).draw(false); // 'false' para no recargar la tabla entera

            // Enviar datos al servidor usando jQuery AJAX
            $.ajax({
                url: '/api/register_event',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    event: eventName,
                    date: eventDate,
                    time: eventTime
                }),
                success: function(data) {
                    console.log('Evento guardado:', data);
                },
                error: function(xhr, status, error) {
                    console.error('Error al guardar el evento:', error);
                }
            });

            // Limpiar el formulario después de enviar los datos
            document.getElementById('eventForm').reset();
        } else {
            alert("Por favor, completa todos los campos antes de enviar.");
        }
    });

    // Función para hacer una llamada GET y listar los eventos
    function listarEventos() {
        $.ajax({
            url: '/api/get_event',
            method: 'GET',
            success: function(data) {
                console.log('Lista de eventos:', data);
                // Si quieres puedes agregar lógica para manipular los datos recibidos
                // Por ejemplo, agregarlos a la DataTable:
                data.events.forEach(evento => {
                    eventTable.row.add([
                        evento.event,
                        evento.date,
                        evento.time
                    ]).draw(false);
                });
            },
            error: function(xhr, status, error) {
                console.error('Error al obtener los eventos:', error);
            }
        });
    }

    // Llamar a la función listarEventos después de 5 segundos
    setTimeout(function() {
        listarEventos();
    }, 5000); // 5000 milisegundos = 5 segundos

    // Función para descargar los datos de la tabla en formato JSON
    $('#downloadBtn').on('click', function() {
        // Obtener los datos de la tabla
        let tableData = [];
        eventTable.rows().every(function() {
            const data = this.data();
            tableData.push({
                event: data[0],
                date: data[1],
                time: data[2]
            });
        });

        // Convertir los datos a formato JSON
        const json = JSON.stringify(tableData, null, 4); // Formato con indentación de 4 espacios

        // Crear un archivo Blob en formato JSON
        const blob = new Blob([json], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);

        // Crear un enlace temporal para forzar la descarga
        const a = document.createElement('a');
        a.href = url;
        a.download = 'eventos.json'; // Nombre del archivo
        document.body.appendChild(a);
        a.click();

        // Eliminar el enlace temporal después de descargar
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });
});
