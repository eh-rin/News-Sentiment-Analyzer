import pandas as pd
import matplotlib.pyplot as plt

# Load the results file
df = pd.read_csv(r'C:\Users\user\OneDrive\Desktop\SentimentAnalysisSabah\output\cleaned_analysed-dataset_results.csv')

# Clean and normalize values
df['language'] = df['language'].str.lower()
df['predicted_sentiment'] = df['predicted_sentiment'].str.strip().str.capitalize()

# Define custom colors
sentiment_colors = {
    'Positive': '#38b000',   # green
    'Neutral': '#6c757d',    # grey
    'Negative': '#ef476f'    # red
}

# Plot 1: Pie chart of sentiment distribution
sentiment_counts = df['predicted_sentiment'].value_counts()

# Use .get() to safely fetch colors or fall back to a default
colors_pie = [sentiment_colors.get(s, '#95a5a6') for s in sentiment_counts.index] # Color for undetected sentiment ("unknown")

plt.figure(figsize=(6, 6))
sentiment_counts.plot.pie(autopct='%1.1f%%', startangle=140, colors=colors_pie)
plt.title('Sentiment Distribution (All Articles)')
plt.ylabel('')
plt.tight_layout()
plt.show()

# Plot 2: Bar chart by language and sentiment
grouped = df.groupby(['language', 'predicted_sentiment']).size().unstack(fill_value=0)
colors_bar = [sentiment_colors.get(s, '#909dae') for s in grouped.columns] # Color for undetected sentiment ("unknown")

grouped.plot(kind='bar', figsize=(8, 6), color=colors_bar)
plt.title('Sentiment by Language')
plt.xlabel('Language')
plt.ylabel('Number of Articles')
plt.xticks(rotation=0)
plt.legend(title='Sentiment')
plt.tight_layout()
plt.show()
