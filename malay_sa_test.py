from transformers import pipeline
sentiment_analysis = pipeline("sentiment-analysis",model="malaysia-ai/deberta-v3-xsmall-malay-sentiment")
print("Malay Sentiment Analysis Pipeline Test")
text = "Saya comel"
print(f"'{text}' -> {sentiment_analysis(text)}")