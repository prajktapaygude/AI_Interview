# import edge_tts
# import uuid
# import os
# import asyncio

# AUDIO_DIR = "static/audio"
# os.makedirs(AUDIO_DIR, exist_ok=True)

# async def generate_speech(text):
#     filename = f"{uuid.uuid4()}.mp3"
#     filepath = os.path.join(AUDIO_DIR, filename)

#     communicate = edge_tts.Communicate(text, "en-US-JennyNeural")
#     await communicate.save(filepath)

#     return filepath



import edge_tts
import asyncio

async def generate_speech_stream(text: str):
    """Yield audio chunks directly from Edge TTS without writing any file."""
    communicate = edge_tts.Communicate(text, "en-US-JennyNeural")
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            yield chunk["data"]