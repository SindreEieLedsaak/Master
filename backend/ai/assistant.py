from groq import Groq
from dotenv import load_dotenv
import os
from backend.models.promt import system_prompt


class Assistant:
    def __init__(self):
        load_dotenv()
        self.groq = Groq(api_key=os.getenv("GROQ_API_KEY"))
    
    def get_assistant_response(self, prompt: str) -> str:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
        chat_completion = self.groq.chat.completions.create(messages=messages, model="deepseek-r1-distill-llama-70b")
        return chat_completion.choices[0].message.content
    
