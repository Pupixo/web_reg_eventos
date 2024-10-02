from flask import Flask, render_template, request, jsonify
import json
from datetime import datetime

app = Flask(__name__)

# Ruta para mostrar la página web
@app.route('/')
def index():
    return render_template('index.html')

# Ruta para registrar eventos
@app.route('/api/register_event', methods=['POST'])
def register_event():
    data = request.get_json()
    print("data.........",data)
    event_name = data.get('event')
    event_date = data.get('date')
    event_time = data.get('time')
    
    if event_name and event_date and event_time:
        # Cargar eventos anteriores
        try:
            with open('events.json', 'r') as file:
                events = json.load(file)
        except (FileNotFoundError, json.JSONDecodeError):
            events = []
        
        # Agregar el nuevo evento
        new_event = {
            'event': event_name,
            'date': event_date,
            'time': event_time,
            'registered_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        }
        events.append(new_event)
        
        # Guardar en el archivo JSON
        with open('events.json', 'w') as file:
            json.dump(events, file, indent=4)
        
        return jsonify({'message': 'Evento registrado con éxito!'}), 200
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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80, debug=True)

