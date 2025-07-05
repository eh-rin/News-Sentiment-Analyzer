import pandas as pd
import re
import nltk
import langid

nltk.download('punkt')
nltk.download('stopwords')

from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Clean the text: remove extra spaces, non-alphanumeric symbols, lowercase
def clean_text(text):
    if pd.isnull(text):  # Handle missing values
        return ""
    text = re.sub(r'\s+', ' ', text)  # Remove extra spaces
    text = re.sub(r'[^A-Za-zÀ-ÿ0-9 ]+', '', text)  # Keep alphanumeric + accents
    return text.lower()

# Detect language using langid
def detect_language(text):
    try:
        lang, _ = langid.classify(text)
        return lang
    except:
        return "unknown"

# Preprocess the dataset
def preprocess_dataset(filepath):
    df = pd.read_csv(filepath)

    # Strip extra spaces from column names
    df.columns = df.columns.str.strip()

    # Display the detected columns (for confirmation)
    print("Columns detected:", df.columns.tolist())

    # Apply preprocessing to all rows in 'Title', 'Content'
    for column in ['Title', 'Content']:
        if column in df.columns:
            df[column + '_clean'] = df[column].apply(clean_text)
            df[column + '_language'] = df[column].apply(detect_language)

    # Create a shortcut column 'clean_content' for consistency with main.py
    if 'Content_clean' in df.columns:
        df['clean_content'] = df['Content_clean']

    # Use language from 'Content_language' if available
    if 'Content_language' in df.columns:
        df['language'] = df['Content_language']

    return df

# Using my dataset
if __name__ == "__main__":
    processed_df = preprocess_dataset(r'C:\Users\user\OneDrive\Desktop\SentimentAnalysisSabah\data\bm_dataset.csv')
    print(processed_df.head())