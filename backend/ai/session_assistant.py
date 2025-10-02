from dotenv import load_dotenv
import os
from typing import Dict, List, Optional
import openai

import uuid


class SessionAssistant:
    """
    A session-based assistant that maintains separate conversation histories
    for different sessions/contexts (e.g., default editor vs survey editors).
    """
    
    def __init__(self):
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
        self.sessions: Dict[str, List[dict]] = {}

    def create_session(self, session_id: Optional[str] = None, system_message: Optional[str] = None) -> str:
        """
        Create a new session with optional custom system message.
        
        Args:
            session_id: Optional session ID. If not provided, a UUID will be generated.
            system_message: Optional custom system message. If not provided, uses default.
            
        Returns:
            The session ID
        """
        if session_id is None:
            session_id = str(uuid.uuid4())
        
        self.sessions[session_id] = []
        
        if system_message:
            self.add_system_message(session_id, system_message)


        return session_id

    def get_or_create_session(self, session_id: str, system_message: Optional[str] = None) -> str:
        """
        Get existing session or create new one if it doesn't exist.
        """
        if session_id not in self.sessions:
            return self.create_session(session_id, system_message)
        return session_id

    def add_system_message(self, session_id: str, message: str):
        """
        Add a system message to a specific session.
        """
        if session_id not in self.sessions:
            self.sessions[session_id] = []
        
        self.sessions[session_id].append({"role": "system", "content": message})

    def clear_session(self, session_id: str, system_message: Optional[str] = None):
        """
        Clear a session's conversation history and optionally set new system message.
        """
        if session_id in self.sessions:
            self.sessions[session_id] = []
            
        if system_message:
            self.add_system_message(session_id, system_message)


    def delete_session(self, session_id: str):
        """
        Delete a session completely.
        """
        if session_id in self.sessions:
            del self.sessions[session_id]

    def get_assistant_response(self, session_id: str, prompt: str, code: Optional[str] = None) -> str:
        """
        Get a response from the AI assistant for a specific session.
        """
        if session_id not in self.sessions:
            # Create session with default system prompt if it doesn't exist
            self.create_session(session_id)

        try:
            # Prepare the user message
            user_message = prompt
            if code:
                user_message = f"Here is the code: {code}\n\n{prompt}"
            
            # Add user message to session history
            self.sessions[session_id].append({"role": "user", "content": user_message})
            
            # Get response from OpenAI
            response = self.client.chat.completions.create(
                model='gpt-4.1-mini',
                messages=self.sessions[session_id]
            )
            
            assistant_response = response.choices[0].message.content
            
            # Add assistant response to session history
            self.sessions[session_id].append({"role": "assistant", "content": assistant_response})
            print(self.sessions[session_id])
            return assistant_response
            
        except Exception as e:
            print(f"Error getting assistant response: {e}")
            return "I'm sorry, I encountered an error. Please try again."

    def get_session_history(self, session_id: str) -> List[dict]:
        """
        Get the conversation history for a specific session.
        """
        return self.sessions.get(session_id, [])

    def list_sessions(self) -> List[str]:
        """
        Get a list of all active session IDs.
        """
        return list(self.sessions.keys())


class SessionAssistantManager:
    """
    Singleton manager for session-based assistants.
    """
    _instance = None
    _initialized = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SessionAssistantManager, cls).__new__(cls)
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self.assistant = SessionAssistant()
            self._initialized = True

    @classmethod
    def get_instance(cls):
        """
        Get the singleton instance of the session assistant manager.
        """
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def get_assistant(self) -> SessionAssistant:
        """
        Get the session assistant instance.
        """
        return self.assistant
