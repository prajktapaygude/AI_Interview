# from faster_whisper import WhisperModel
# import tempfile
# import shutil

# # Load model once (important for speed)
# model = WhisperModel("base", compute_type="int8")


# def speech_to_text(audio_file):

#     with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp:

#         shutil.copyfileobj(audio_file.file, temp)

#         temp_path = temp.name

#     segments, _ = model.transcribe(temp_path)

#     text = ""

#     for segment in segments:
#         text += segment.text + " "

#     return text.strip()




import os
import requests
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_WHISPER_URL = "https://api.groq.com/openai/v1/audio/transcriptions"

def speech_to_text(audio_file) -> str:
    """
    Transcribe audio using Groq's Whisper API.
    Audio is sent as bytes directly from memory – no file is ever created.
    """
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY not set in environment")

    # Read entire audio file into memory
    audio_bytes = audio_file.file.read()

    # Prepare multipart form-data
    files = {
        "file": (audio_file.filename, audio_bytes, audio_file.content_type)
    }
    data = {
        "model": "whisper-large-v3",
        "response_format": "text"
    }
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}"
    }

    response = requests.post(GROQ_WHISPER_URL, headers=headers, files=files, data=data)
    response.raise_for_status()

    return response.text.strip()