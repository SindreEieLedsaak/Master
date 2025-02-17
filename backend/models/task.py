from dataclasses import dataclass


@dataclass
class Task:
    id: str
    description: str
    difficulty: int
    focus_areas: list[str]