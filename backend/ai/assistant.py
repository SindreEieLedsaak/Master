
from dotenv import load_dotenv
import os

from pydantic.type_adapter import P
from backend.models.promt import system_prompt
import re
import os
import openai

class Assistant:
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Assistant, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            load_dotenv()
            self.client = openai.AzureOpenAI(
                azure_endpoint="https://gw-uib.intark.uh-it.no",
                azure_deployment="gpt-4.1-mini",
                api_key="unused",  # but still required by the library
                default_headers={
                    "X-Gravitee-API-Key": os.getenv("OPENAI_GRAVITEE_KEY") or ""
                },
                api_version="2024-10-21",
            )
            self.conversation_history = [{"role": "system", "content": system_prompt}]
            Assistant._initialized = True

    @classmethod
    def get_instance(cls):
        """
        Alternative method to get the singleton instance.
        """
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def reset_conversation(self):
        """
        Reset the conversation history if needed.
        """
        self.conversation_history = []

    def get_assistant_response(self, prompt: str, code: str | None = None) -> str:
        """
        Get a response from the AI assistant using the provided prompt.
        """
        try:
            if code:
                code = f"Here is the code: {code}\n\n"
            

            self.conversation_history.append({"role": "user", "content": prompt})
            response = self.client.chat.completions.create(
                model='gpt-4.1-mini',
                messages=self.conversation_history + [{"role": "user", "content": code}]
            )
            self.conversation_history.append({"role": "assistant", "content": response.choices[0].message.content.strip() or ""})
            print(self.conversation_history)
            return response.choices[0].message.content.strip() or ""
        except Exception as e:
            print(f"Error getting assistant response: {e}")
            return "An error occurred while processing your request."
    

