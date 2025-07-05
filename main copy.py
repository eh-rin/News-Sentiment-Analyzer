import flet as ft
import pandas as pd
from preprocessing import preprocess_dataset
from sentiment_analysis import analyze_sentiment

def main(page: ft.Page):
    page.title = "News Sentiment Analyzer"
    results_output = ft.Text(value="")
    upload_button = ft.FilePicker(on_result=lambda e: process_file(e.files[0]))

    def process_file(file):
        df = preprocess_dataset(file.path)

        results = []
        for _, row in df.iterrows():
            text = row.get("clean_content", "")
            language = row.get("language", "en")
            title = row.get("Title", "N/A")

            if not isinstance(text, str) or not text.strip():
                sentiment = "Invalid"
            else:
                sentiment = analyze_sentiment(text, language)

            results.append(f"{title} — {sentiment}")

        results_output.value = "\n".join(results)
        page.update()

    page.overlay.append(upload_button)
    page.add(
        ft.Text("Upload a dataset for sentiment analysis:"),
        ft.ElevatedButton("Choose File", on_click=lambda _: upload_button.pick_files()),
        results_output
    )

ft.app(target=main)
