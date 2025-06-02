import pandas as pd
from wordcloud import WordCloud
import matplotlib.pyplot as plt
import os

# Path to your sentiment result file
file_path = r'C:\Users\user\OneDrive\Desktop\SentimentAnalysisSabah\output\cleaned_analysed-dataset_results.csv'

# Load dataset
df = pd.read_csv(file_path)

# Clean language column to be safe
df['language'] = df['language'].str.lower()
df['Content_clean'] = df['Content_clean'].fillna('').astype(str)

# Combine all clean content for English and Malay
english_text = ' '.join(df[df['language'].isin(['en', 'english'])]['Content_clean'])
bm_text = ' '.join(df[df['language'].isin(['ms', 'malay'])]['Content_clean']) # to detect Malay language

# Output folder for word clouds
output_folder = r'C:\Users\user\OneDrive\Desktop\SentimentAnalysisSabah\output'
os.makedirs(output_folder, exist_ok=True)

# --- Generate English Word Cloud ---
wordcloud_en = WordCloud(width=800, height=400, background_color='white', collocations=False).generate(english_text)

plt.figure(figsize=(10, 5))
plt.imshow(wordcloud_en, interpolation='bilinear')
plt.axis('off')
plt.title('English Word Cloud')
plt.tight_layout()
plt.savefig(os.path.join(output_folder, 'english_wordcloud.png'))
plt.show()

# --- Generate BM Word Cloud ---
wordcloud_bm = WordCloud(width=800, height=400, background_color='white', collocations=False).generate(bm_text)

plt.figure(figsize=(10, 5))
plt.imshow(wordcloud_bm, interpolation='bilinear')
plt.axis('off')
plt.title('BM (Malay) Word Cloud')
plt.tight_layout()
plt.savefig(os.path.join(output_folder, 'bm_wordcloud.png'))
plt.show()
