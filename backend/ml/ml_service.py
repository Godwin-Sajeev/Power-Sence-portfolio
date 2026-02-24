import sys
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from flask import Flask, request, jsonify
import logging

app = Flask(__name__)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# In-memory storage for simple models (per room)
# In a real production app, you might save these to disk using joblib
models = {}
historical_data = {}

def train_model(room_id, data):
    """
    Trains an Isolation Forest model for a specific room.
    """
    if len(data) < 10:
        return None
    
    df = pd.DataFrame(data, columns=['watt'])
    model = IsolationForest(contamination=0.1, random_state=42)
    model.fit(df[['watt']])
    return model

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        room_id = data.get('roomId')
        current_watt = data.get('watt')
        
        if not room_id or current_watt is None:
            return jsonify({'error': 'Missing roomId or watt'}), 400

        # Update historical data for this room
        if room_id not in historical_data:
            historical_data[room_id] = []
        
        historical_data[room_id].append(current_watt)
        
        # Keep only last 100 readings for local trend
        if len(historical_data[room_id]) > 100:
            historical_data[room_id].pop(0)

        # Basic Anomaly Detection using Isolation Forest
        score = 0
        is_anomaly = False
        
        # We need enough data to train/predict
        if len(historical_data[room_id]) >= 10:
            model = train_model(room_id, historical_data[room_id])
            if model:
                # -1 for anomaly, 1 for normal
                pred = model.predict([[current_watt]])[0]
                # Transform to 0-100 score where higher is more "anomalous"
                # decision_function returns signed distance (negative if outlier)
                decision = model.decision_function([[current_watt]])[0]
                is_anomaly = (pred == -1)
                
                # Normalize decision score to 0-100 for anomaly probability
                # decision_function is usually between approx -0.5 and 0.5
                # Mapping: lower decision -> higher anomaly score
                anomaly_score = max(0, min(100, (0.5 - decision) * 100))
                score = round(anomaly_score)
        
        # Forecasting logic: Simple Moving Average comparison
        avg_usage = sum(historical_data[room_id]) / len(historical_data[room_id])
        deviation = abs(current_watt - avg_usage) / (avg_usage or 1)
        
        return jsonify({
            'isAnomaly': is_anomaly,
            'anomalyScore': score,
            'averageUsage': round(avg_usage, 2),
            'deviation': round(deviation * 100, 2)
        })

    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Running on a different port to coexist with Node.js on 5001
    port = 5500
    logger.info(f"ML Service starting on port {port}...")
    app.run(port=port, debug=False)
