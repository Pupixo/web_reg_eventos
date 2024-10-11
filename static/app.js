$(document).ready(function() {
    const eventTable = $('#eventTable').DataTable({
        "paging": true,
        "searching": true,
        "info": true
    });

    let editingRow = null;  // Para identificar si estamos editando una fila

    // Escuchar el envío del formulario
    $('#eventForm').on('submit', function(e) {
        e.preventDefault(); // Prevenir la recarga de la página

        const eventName = $('#event').val();
        const eventDate = $('#date').val();
        const eventTime = $('#time').val();
        const eventState = $('#state').val();  // Obtener el valor del select

        if (eventName && eventDate && eventTime && eventState) {
            if (editingRow) {
                // Editar una fila existente
                eventTable.row(editingRow).data([eventName, eventDate, eventTime, eventState, editButtonHTML(), deleteButtonHTML()]).draw(false);
                editingRow = null;
            } else {
                // Agregar nueva fila
                eventTable.row.add([eventName, eventDate, eventTime, eventState, editButtonHTML(), deleteButtonHTML()]).draw(false);
            }

            $.ajax({
                url: '/api/register_event',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({
                    event: eventName,
                    date: eventDate,
                    time: eventTime,
                    state: eventState  // Incluir estado en la solicitud
                }),
                success: function(data) {
                    console.log('Evento guardado:', data);
                },
                error: function(xhr, status, error) {
                    console.error('Error al guardar el evento:', error);
                }
            });

            $('#eventForm')[0].reset();  // Limpiar el formulario después de guardar
        } else {
            alert("Por favor, completa todos los campos antes de enviar.");
        }
    });

    // Función para generar los botones de editar y eliminar
    function editButtonHTML() {
        return '<button class="editBtn">Editar</button>';
    }

    function deleteButtonHTML() {
        return '<button class="deleteBtn">Eliminar</button>';
    }

    // Eliminar evento
    $('#eventTable tbody').on('click', '.deleteBtn', function() {
        const row = $(this).closest('tr');
        const rowData = eventTable.row(row).data();

        $.ajax({
            url: '/api/delete_event',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ event: rowData[0], date: rowData[1], time: rowData[2], state: rowData[3] }),
            success: function(data) {
                console.log('Evento eliminado:', data);
                eventTable.row(row).remove().draw();
            },
            error: function(xhr, status, error) {
                console.error('Error al eliminar el evento:', error);
            }
        });
    });

    // Editar evento
    $('#eventTable tbody').on('click', '.editBtn', function() {
        $('#boton_accion').text('Editar Evento');
        const row = $(this).closest('tr');
        const rowData = eventTable.row(row).data();

        $('#event').val(rowData[0]);
        $('#date').val(rowData[1]);
        $('#time').val(rowData[2]);
        $('#state').val(rowData[3]);  // Cargar el estado en el select

        editingRow = row;
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
                            evento.time,
                            evento.state,
                            editButtonHTML(),
                            deleteButtonHTML()
                        ]).draw(false);
                    });
                },
                error: function(xhr, status, error) {
                    console.error('Error al obtener los eventos:', error);
                }
            });
        }

        
       
    // Editar evento
    $('#eventForm').on('click', '.boton_limpiar', function() {
        $('#eventForm').get(0).reset();
        $('#boton_accion').text('Registrar Evento');
    });


    // Llamar a la función listarEventos después de 5 segundos
    setTimeout(function() {
        listarEventos();
    }, 5000); // 5000 milisegundos = 5 segundos
});
