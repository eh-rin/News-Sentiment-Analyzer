import os
from flask import Flask, request, jsonify, render_template
import pandas as pd

# Import modules
from preprocessing import preprocess_dataset
from sentiment_analysis import analyze_sentiment

# --- Flask Setup ---
app = Flask(__name__)

# Ensure folders exist
os.makedirs('uploads', exist_ok=True)
os.makedirs('output', exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/analyze_dataset', methods=['POST'])
def analyze_dataset():
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    file_path = os.path.join('uploads', file.filename)
    file.save(file_path)

    try:
        # Preprocess the dataset using preprocessing module
        df = preprocess_dataset(file_path)
        print(f"Preprocessing complete. Rows: {len(df)}")
    except Exception as e:
        return jsonify({'error': f'Failed to preprocess dataset: {str(e)}'}), 400

    if 'clean_content' not in df.columns or 'language' not in df.columns:
        return jsonify({'error': 'Preprocessed data missing expected columns.'}), 500

    results = []

    for index, row in df.iterrows():
        try:
            text = row['clean_content']
            language = row['language']
            title = row.get('Title', 'N/A')

            if pd.isna(text) or not isinstance(text, str) or text.strip() == "":
                sentiment = "Invalid"
            else:
                sentiment = analyze_sentiment(text, language)

            results.append({
                'Title': title,
                'Content': text,
                'Language': language,
                'Sentiment': sentiment
            })

        except Exception as e:
            print(f"[Row {index}] Error: {e}")
            results.append({
                'Title': row.get('Title', 'N/A'),
                'Content': row.get('Content', ''),
                'Language': 'Unknown',
                'Sentiment': 'Error'
            })

    try:
        result_df = pd.DataFrame(results)
        result_df.to_csv('output/results.csv', index=False, encoding='utf-8-sig')
        print("Results saved to output/results.csv")
    except Exception as e:
        return jsonify({'error': f'Failed to save results: {str(e)}'}), 500

    return jsonify({'message': 'Dataset analyzed successfully!', 'results': results})

if __name__ == '__main__':
    app.run(debug=True)
