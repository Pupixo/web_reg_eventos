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
        const RangoFechaEvento = $('#rango_tarea').val();
        const eventState = $('#state').val();  // Obtener el valor del select
        const fechas = RangoFechaEvento.split(' - ');
        const fechaInicio = fechas[0]; // "16/10/2024 05:00 PM"
        const fechaFin = fechas[1];    // "18/10/2024 01:00 AM"

        console.log("Fecha de Inicio:", fechaInicio);
        console.log("Fecha de Fin:", fechaFin);

        if (eventName && RangoFechaEvento && eventState) {
            if (editingRow) {
                    console.log("🚀 ~ $ ~ editingRow:", editingRow)
                    const rowData = eventTable.row(editingRow).data();
                    console.log("🚀 ~ $ ~ rowData:", rowData)
                    $.ajax({
                            url: '/api/update_event',
                            method: 'PUT',
                            contentType: 'application/json',
                            data: JSON.stringify({
                                id: rowData[0],
                                event: eventName,
                                rango_date: RangoFechaEvento,
                                state: eventState  // Incluir estado en la solicitud
                            }),
                            success: function(data) {
                                // Editar una fila existente
                                eventTable.row(editingRow).data([rowData[0],eventName, fechaInicio, fechaFin,rowData[4],eventState, editButtonHTML(), deleteButtonHTML()]).draw(false);
                                editingRow = null;
                        },
                        error: function(xhr, status, error) {
                            console.error('Error al guardar el evento:', error);
                        }
                    });
            } else {
                $.ajax({
                    url: '/api/register_event',
                    method: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({
                        event: eventName,
                        rango_date: RangoFechaEvento,
                        state: eventState  // Incluir estado en la solicitud
                    }),
                    success: function(data) {
                        console.log('Evento guardado:', data);
                        // Agregar nueva fila
                        eventTable.row.add([data['id'],eventName,  fechaInicio, fechaFin,data['registered_at'],eventState, editButtonHTML(), deleteButtonHTML()]).draw(false);
                    },
                    error: function(xhr, status, error) {
                        console.error('Error al guardar el evento:', error);
                    }
                });
            }
            $('#eventForm')[0].reset();  // Limpiar el formulario después de guardar
            $('#boton_accion').text('Registrar Evento');

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
            data: JSON.stringify({ id:rowData[0] ,event: rowData[1], date: rowData[2], time: rowData[3], state: rowData[4],state: rowData[5] }),
            success: function(data) {
                console.log('Evento eliminado:', data);
                eventTable.row(row).remove().draw();

                $('#eventForm')[0].reset();  // Limpiar el formulario después de guardar
                $('#boton_accion').text('Registrar Evento');

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
        console.log("🚀 ~ $ ~ rowData:", rowData)
        // Definir las fechas de inicio y fin en el formato correcto
        var fechaInicio = moment(rowData[2], 'YYYY-MM-DD HH:mm').format('DD/MM/YYYY hh:mm A');
        var fechaFin = moment(rowData[3], 'YYYY-MM-DD HH:mm').format('DD/MM/YYYY hh:mm A');
        // Combinar ambas fechas en un solo rango
        var fecha_rango = `${fechaInicio} - ${fechaFin}`;
        console.log("🚀 ~ $ ~ fecha_rango:", fecha_rango)
        $('#event').val(rowData[1]);
        $('#rango_tarea').val(fecha_rango);
        $('#state').val(rowData[5]);  // Cargar el estado en el select
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
                    const RangoFechaEvento =  evento.rango_date;

                    var fechaInicio = ''; // "16/10/2024 05:00 PM"
                    var fechaFin = '';    // "18/10/2024 01:00 AM"

                     // Verificar si 'rango_date' existe y no es nulo o vacío
                    if (RangoFechaEvento && RangoFechaEvento.includes(' - ')) {
                        const fechas = RangoFechaEvento.split(' - ');
                        fechaInicio = fechas[0];
                        fechaFin = fechas[1];
                        console.log("Fecha de Inicio:", fechaInicio);
                        console.log("Fecha de Fin:", fechaFin);
                    } else {
                        console.log("El rango de fecha no está disponible para este evento.");
                    }

                    eventTable.row.add([
                        evento.id,
                        evento.event,
                        fechaInicio,
                        fechaFin,
                        evento.registered_at,
                        evento.state,
                        editButtonHTML(),
                        deleteButtonHTML(),
                    ]).draw(false);
                });
            },
            error: function(xhr, status, error) {
                console.error('Error al obtener los eventos:', error);
            }
        });
    }
       
    // limpiar evento
    $('#eventForm').on('click', '.boton_limpiar', function() {
        $('#eventForm').get(0).reset();
        $('#boton_accion').text('Registrar Evento');
    });

    // Llamar a la función listarEventos después de 5 segundos
    setTimeout(function() {
        listarEventos();
    }, 1500); // 5000 milisegundos = 5 segundos

});


$(function() {
    $('input[name="rango_tarea"]').daterangepicker({
      timePicker: true,
      startDate: moment().startOf('hour'),
      endDate: moment().startOf('hour').add(32, 'hour'),
      locale: {
        format: 'DD/MM/YYYY hh:mm A', // Cambiado el formato a un estilo común en español
        applyLabel: "Aplicar",
        cancelLabel: "Cancelar",
        fromLabel: "Desde",
        toLabel: "Hasta",
        weekLabel: "Sem",
        customRangeLabel: "Personalizado",
        daysOfWeek: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
        monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
        firstDay: 1 // La semana empieza en lunes
      }
    });
});
