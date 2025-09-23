
from dotenv import load_dotenv
import os

from pydantic.type_adapter import P
import re
import os
import openai

class AIAnalyzer:
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AIAnalyzer, cls).__new__(cls)
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
            self.conversation_history = []
            self._initialized = True

    @classmethod
    def get_instance(cls):
        """
        Alternative method to get the singleton instance.
        """
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def get_ai_response(self, prompt: str | None = None, add_promt_to_history: bool = True, add_response_to_history: bool = True) -> str:
        """
        Get a response from the AI assistant using the provided prompt.
        """
        try:
            if add_promt_to_history:
                self.conversation_history.append({"role": "user", "content": prompt})
                response = self.client.chat.completions.create(
                model='gpt-4.1-mini',
                messages=self.conversation_history
                 )
            else:
                response = self.client.chat.completions.create(
                    model='gpt-4.1-mini',
                    messages=self.conversation_history + [{"role": "user", "content": prompt}]
                )
            if add_response_to_history:
                self.conversation_history.append({"role": "assistant", "content": response.choices[0].message.content.strip() or ""})
            return response.choices[0].message.content.strip() or ""
        except Exception as e:
            print(f"Error getting ai response: {e}")
            return "An error occurred while processing your request."
    

