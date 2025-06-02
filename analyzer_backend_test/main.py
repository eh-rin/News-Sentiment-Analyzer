import pandas as pd
import os
from preprocessing import preprocess_dataset
from sentiment_analysis import analyze_sentiment

# Set file path
dataset = r'C:\Users\user\OneDrive\Desktop\SentimentAnalysisSabah\data\dataset-100.csv'

# Set output folder
output_folder = r'C:\Users\user\OneDrive\Desktop\SentimentAnalysisSabah\output'
os.makedirs(output_folder, exist_ok=True)

# Function to process a mixed-language dataset and save results
def process_and_save_mixed(file_path, output_filename):
    # Preprocess dataset (cleans, detects language, etc.)
    df = preprocess_dataset(file_path)

    # Apply sentiment analysis based on detected language
    df['predicted_sentiment'] = df.apply(
        lambda row: analyze_sentiment(row['Content_clean'], row['language']), axis=1
    )

    # Define full output path
    output_path = os.path.join(output_folder, output_filename)

    # Remove existing file if it exists
    if os.path.exists(output_path):
        os.remove(output_path)

    # Save the results
    df.to_csv(output_path, index=False)
    print(f"Sentiment analysis complete! Results saved to: {output_path}")

# --- Run the process ---
process_and_save_mixed(dataset, 'cleaned_analysed-dataset_results.csv')
