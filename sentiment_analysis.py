from transformers import pipeline
from nltk.sentiment import SentimentIntensityAnalyzer
import nltk

# Load the Malay sentiment analysis model
sentiment_analysis = pipeline("sentiment-analysis", model="malaysia-ai/deberta-v3-xsmall-malay-sentiment")

# Download the VADER lexicon for SentimentIntensityAnalyzer
nltk.download('vader_lexicon')

# Initialize SentimentIntensityAnalyzer for English sentiment analysis
sia = SentimentIntensityAnalyzer()

# Initialize a general BERT sentiment analysis pipeline (if needed for English)
bert_pipeline = pipeline('sentiment-analysis')

def analyze_sentiment(text, language):
    """
    Analyze the sentiment of a given text based on its language.
    - 'en' -> Uses VADER for English sentiment analysis
    - 'ms' -> Uses DeBERTa V3 model for Malay sentiment analysis
    """
    if language == 'en':
        # Use VADER sentiment analysis for English text
        score = sia.polarity_scores(text)['compound']
        if score >= 0.05:
            return 'positive'
        elif score <= -0.05:
            return 'negative'
        else:
            return 'neutral'
    
    elif language == 'ms':
        # Use the DeBERTa V3 Malay sentiment analysis model
        result = sentiment_analysis(text[:512])[0]['label']
        return result  # The result can be 'POSITIVE' or 'NEGATIVE'
    
    else:
        return 'unknown'