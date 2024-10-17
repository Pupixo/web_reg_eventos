from flask import Flask, render_template, request, jsonify
import json
from datetime import datetime

app = Flask(__name__)

# Ruta para mostrar la página web
@app.route('/')
def index():
    return render_template('index.html')
    
@app.route('/api/register_event', methods=['POST'])
def register_event():
    data = request.get_json()
    event_name = data.get('event')
    event_rango_date = data.get('rango_date')
    event_state = data.get('state')  # Obtener el estado del evento

    if event_name and event_rango_date and event_state:
        try:
            with open('events.json', 'r') as file:
                events = json.load(file)
        except (FileNotFoundError, json.JSONDecodeError):
            events = []

        # Calcular el nuevo id basado en el id máximo existente en los eventos
        if events:
            max_id = max(event['id'] for event in events)
        else:
            max_id = 0

        new_id = max_id + 1
        fecha_reg = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        new_event = {
            'id': new_id,  # Asignar el nuevo id
            'event': event_name,
            'rango_date': event_rango_date,
            'state': event_state,  # Guardar el estado
            'registered_at': fecha_reg
        }
        events.append(new_event)

        with open('events.json', 'w') as file:
            json.dump(events, file, indent=4)

        return jsonify({'message': 'Evento registrado con éxito!', 'id': new_id,'registered_at': fecha_reg}), 200
    else:
        return jsonify({'error': 'Faltan datos'}), 400
    
@app.route('/api/update_event', methods=['PUT'])
def update_event():
    data = request.get_json()
    event_id = data.get('id')  # Buscar por el id del evento
    event_name = data.get('event')
    event_rango_date = data.get('rango_date')
    event_state = data.get('state')  # Obtener el estado del evento

    if event_id and event_name and event_rango_date and event_state:
        try:
            with open('events.json', 'r') as file:
                events = json.load(file)
        except (FileNotFoundError, json.JSONDecodeError):
            return jsonify({'error': 'No se encontraron eventos para actualizar.'}), 400

        event_found = False
        for event in events:
            if event['id'] == event_id:
                # Actualizar los detalles del evento encontrado
                event['event'] = event_name
                event['rango_date'] = event_rango_date
                event['state'] = event_state
                event['updated_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                event_found = True
                break

        if event_found:
            with open('events.json', 'w') as file:
                json.dump(events, file, indent=4)
            return jsonify({'message': 'Evento actualizado con éxito!'}), 200
        else:
            return jsonify({'error': 'Evento no encontrado.'}), 404
    else:
        return jsonify({'error': 'Faltan datos'}), 400
    


# Ruta para obtener todos los eventos registrados
@app.route('/api/get_event', methods=['GET'])
def get_event():
    # Inicializar la lista de eventos
    events = []
    
    # Cargar eventos desde el archivo JSON
    try:
        with open('events.json', 'r') as file:
            events = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        # Si el archivo no existe o está corrupto, devolvemos una lista vacía
        events = []
    
    # Devolver todos los eventos
    return jsonify({'events': events}), 200




@app.route('/api/delete_event', methods=['POST'])
def delete_event():
    data = request.get_json()
    
    # Obtener el id del evento
    event_id = data.get('id')

    if not event_id:
        return jsonify({'error': 'ID del evento es requerido'}), 400

    try:
        with open('events.json', 'r') as file:
            events = json.load(file)
    except (FileNotFoundError, json.JSONDecodeError):
        return jsonify({'error': 'Archivo de eventos no encontrado'}), 404

    # Filtrar los eventos, eliminando el que tiene el id proporcionado
    updated_events = [event for event in events if event['id'] != event_id]

    if len(updated_events) == len(events):
        return jsonify({'error': 'Evento con el ID proporcionado no encontrado'}), 404

    # Guardar la lista actualizada de eventos
    with open('events.json', 'w') as file:
        json.dump(updated_events, file, indent=4)

    return jsonify({'message': f'Evento con ID {event_id} eliminado con éxito!'}), 200




if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True)

