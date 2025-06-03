from groq import Groq
from dotenv import load_dotenv
import os
from backend.models.promt import system_prompt
import re
import os
import openai

class Assistant:
    def __init__(self):
        load_dotenv()
        self.client = openai_client = openai.AzureOpenAI(
        azure_endpoint =  "https://gw-uib.intark.uh-it.no",
        azure_deployment = "gpt-4.1-mini",
        api_key = "unused", # but still required by the library
        default_headers = {
            "X-Gravitee-API-Key": os.getenv("OPENAI_GRAVITEE_KEY"),
        },
        api_version = "2024-10-21",
        )   

    def get_assistant_response(self, prompt: str) -> str:
        """
        Get a response from the AI assistant using the provided prompt.
        """
        try:
            response = self.client.chat.completions.create(
                model = 'gpt-4.1-mini',
                messages = [
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': prompt}
                ],
                max_tokens = 1000
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"Error getting assistant response: {e}")
            return "An error occurred while processing your request."
    

