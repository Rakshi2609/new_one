import os
import json
import base64
import logging
from pathlib import Path
from typing import Optional, List, Type, Dict, Any
import httpx
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

# --- Models for Extraction ---

class ExtractedMedication(BaseModel):
    name: str = Field(description="Name of the medication")
    dosage: Optional[str] = Field(default=None, description="Dosage (e.g. 500mg, 1 tablet)")
    frequency: Optional[str] = Field(default=None, description="Frequency (e.g. 3 times daily, morning/evening)")
    duration: Optional[str] = Field(default=None, description="Duration (e.g. 7 days, 1 month)")
    instructions: Optional[str] = Field(default=None, description="Special instructions")

class IngestExtraction(BaseModel):
    patient_name: Optional[str] = Field(default=None, description="Name of the patient")
    age: Optional[int] = Field(default=None, description="Age of the patient")
    diagnosis: Optional[str] = Field(default=None, description="Primary diagnosis or condition")
    medications: List[ExtractedMedication] = Field(default_factory=list, description="List of medications")
    procedures: List[str] = Field(default_factory=list, description="Procedures scheduled or completed")
    allergies: List[str] = Field(default_factory=list, description="Allergies listed")
    follow_ups: List[str] = Field(default_factory=list, description="Follow up instructions or next visits")
    lab_tests: List[str] = Field(default_factory=list, description="Lab tests or imaging ordered")


# --- Models for Plan ---

class RecoveryTask(BaseModel):
    id: str = Field(description="Unique task id (e.g., t1, t2...)")
    title: str = Field(description="Title of the task")
    description: str = Field(description="Description/why this task matters")
    priority: str = Field(description="Priority: CRITICAL, IMPORTANT, or OPTIONAL")
    due_date: Optional[str] = Field(default=None, description="Due date in YYYY-MM-DD format if known")
    completed: bool = Field(default=False)

class RecoveryPlanResponse(BaseModel):
    critical_tasks: List[RecoveryTask] = Field(default_factory=list)
    important_tasks: List[RecoveryTask] = Field(default_factory=list)
    optional_tasks: List[RecoveryTask] = Field(default_factory=list)


class GeminiService:
    def __init__(self, api_key: Optional[str] = None) -> None:
        self.api_key = api_key or os.environ.get("GEMINI_API_KEY")
        self.endpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent"

    def _call_gemini(self, prompt: str, base64_files: Optional[List[Dict[str, str]]] = None, response_schema: Optional[Dict[str, Any]] = None) -> str:
        if not self.api_key:
            # Fallback mock response for hackathon demo if no key is configured
            logger.warning("GEMINI_API_KEY not set. Using fallback mock data.")
            return self._get_fallback_mock(prompt)

        url = f"{self.endpoint}?key={self.api_key}"
        parts = [{"text": prompt}]

        if base64_files:
            for f in base64_files:
                parts.append({
                    "inlineData": {
                        "mimeType": f["mime_type"],
                        "data": f["data"]
                    }
                })

        payload = {
            "contents": [{
                "parts": parts
            }],
            "generationConfig": {
                "responseMimeType": "application/json"
            }
        }

        if response_schema:
            payload["generationConfig"]["responseSchema"] = response_schema

        response = httpx.post(url, json=payload, timeout=60.0)
        response.raise_for_status()
        res_json = response.json()
        
        try:
            return res_json["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError) as e:
            raise ValueError(f"Unexpected response structure from Gemini: {res_json}") from e

    def extract_medical_info(self, file_paths: List[Path], transcript: Optional[str] = None) -> IngestExtraction:
        # Prepare file attachments
        base64_files = []
        for path in file_paths:
            suffix = path.suffix.lower()
            mime_type = "image/jpeg"
            if suffix == ".png":
                mime_type = "image/png"
            elif suffix == ".pdf":
                mime_type = "application/pdf"
            elif suffix in [".mp3", ".wav"]:
                mime_type = f"audio/{suffix[1:]}"

            with open(path, "rb") as f:
                encoded_data = base64.b64encode(f.read()).decode("utf-8")
                base64_files.append({
                    "mime_type": mime_type,
                    "data": encoded_data
                })

        prompt = (
            "You are a medical document parser. Extract structured information from the provided files and transcripts. "
            "Identify the patient name, age, diagnosis, medications, procedures, allergies, follow-ups, and lab tests. "
            "Leave fields null or empty if not present."
        )
        if transcript:
            prompt += f"\n\nAdditional clinical transcript:\n{transcript}"

        # Schema in OpenAPI 3.0 format for Gemini response schema
        schema = {
            "type": "OBJECT",
            "properties": {
                "patient_name": {"type": "STRING"},
                "age": {"type": "INTEGER"},
                "diagnosis": {"type": "STRING"},
                "medications": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "name": {"type": "STRING"},
                            "dosage": {"type": "STRING"},
                            "frequency": {"type": "STRING"},
                            "duration": {"type": "STRING"},
                            "instructions": {"type": "STRING"}
                        },
                        "required": ["name"]
                    }
                },
                "procedures": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"}
                },
                "allergies": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"}
                },
                "follow_ups": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"}
                },
                "lab_tests": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"}
                }
            }
        }

        # Strict retry mechanism
        retries = 3
        for attempt in range(retries):
            try:
                raw_response = self._call_gemini(prompt, base64_files, response_schema=schema)
                return IngestExtraction.model_validate_json(raw_response)
            except Exception as e:
                logger.error(f"Ingestion extraction validation failed (attempt {attempt + 1}/{retries}): {e}")
                if attempt == retries - 1:
                    raise e

    def generate_recovery_plan(self, extraction: IngestExtraction) -> RecoveryPlanResponse:
        prompt = (
            f"Given the following extracted medical information, generate a structured recovery plan "
            f"with tasks grouped by priority: CRITICAL, IMPORTANT, and OPTIONAL.\n"
            f"- CRITICAL: Actionable medication doses, urgent red flags.\n"
            f"- IMPORTANT: Booking appointments, follow-ups, laboratory testing.\n"
            f"- OPTIONAL: Lifestyle guidance, dietary actions.\n\n"
            f"Patient Details:\n{extraction.model_dump_json(indent=2)}\n\n"
            f"Generate tasks with unique sequential ids (e.g. t1, t2...) and clear descriptions."
        )

        schema = {
            "type": "OBJECT",
            "properties": {
                "critical_tasks": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "id": {"type": "STRING"},
                            "title": {"type": "STRING"},
                            "description": {"type": "STRING"},
                            "priority": {"type": "STRING"},
                            "due_date": {"type": "STRING"},
                            "completed": {"type": "BOOLEAN"}
                        },
                        "required": ["id", "title", "description", "priority", "completed"]
                    }
                },
                "important_tasks": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "id": {"type": "STRING"},
                            "title": {"type": "STRING"},
                            "description": {"type": "STRING"},
                            "priority": {"type": "STRING"},
                            "due_date": {"type": "STRING"},
                            "completed": {"type": "BOOLEAN"}
                        },
                        "required": ["id", "title", "description", "priority", "completed"]
                    }
                },
                "optional_tasks": {
                    "type": "ARRAY",
                    "items": {
                        "type": "OBJECT",
                        "properties": {
                            "id": {"type": "STRING"},
                            "title": {"type": "STRING"},
                            "description": {"type": "STRING"},
                            "priority": {"type": "STRING"},
                            "due_date": {"type": "STRING"},
                            "completed": {"type": "BOOLEAN"}
                        },
                        "required": ["id", "title", "description", "priority", "completed"]
                    }
                }
            }
        }

        retries = 3
        for attempt in range(retries):
            try:
                raw_response = self._call_gemini(prompt, response_schema=schema)
                return RecoveryPlanResponse.model_validate_json(raw_response)
            except Exception as e:
                logger.error(f"Plan generation validation failed (attempt {attempt + 1}/{retries}): {e}")
                if attempt == retries - 1:
                    raise e

    def ask_coach(self, chat_history: List[Dict[str, str]], patient_context: Dict[str, Any], query: str) -> str:
        prompt = (
            f"You are CuraPath's AI Recovery Coach. You help patients recover post-discharge.\n"
            f"Patient Context:\n{json.dumps(patient_context, indent=2)}\n\n"
            f"Conversation History:\n"
        )
        for msg in chat_history:
            role = "Patient" if msg["role"] == "user" else "Coach"
            prompt += f"{role}: {msg['content']}\n"
        prompt += f"Patient: {query}\nCoach:"

        if not self.api_key:
            return "Hello! I am your recovery coach. I can help answer questions about your medications or appointments. Please let me know how you are feeling."

        url = f"{self.endpoint}?key={self.api_key}"
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        }
        response = httpx.post(url, json=payload, timeout=30.0)
        response.raise_for_status()
        res_json = response.json()
        try:
            return res_json["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError) as e:
            return "I'm sorry, I encountered an issue processing your query. Please try again."

    def generate_coach_summary(self, context: Any) -> Any:
        from ..domain.models.coach import CoachSummary
        prompt = (
            f"You are a supportive, empathetic AI Recovery Coach for a patient. "
            f"Given the following patient context (card details, medications, recent procedures) and timeline, "
            f"generate a structured Recovery Coach Summary:\n\n"
            f"Patient Context:\n{json.dumps(context.model_dump(), indent=2)}\n\n"
            f"Produce daily summary, 1-3 key priorities, risks to watch out for, suggested questions for the doctor, "
            f"encouragement message, and general follow_up actions."
        )

        schema = {
            "type": "OBJECT",
            "properties": {
                "daily_summary": {"type": "STRING"},
                "priorities": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"}
                },
                "risks": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"}
                },
                "questions": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"}
                },
                "encouragement": {"type": "STRING"},
                "follow_up": {
                    "type": "ARRAY",
                    "items": {"type": "STRING"}
                }
            },
            "required": ["daily_summary", "priorities", "risks", "questions", "encouragement", "follow_up"]
        }

        retries = 3
        for attempt in range(retries):
            try:
                raw_response = self._call_gemini(prompt, response_schema=schema)
                return CoachSummary.model_validate_json(raw_response)
            except Exception as e:
                logger.error(f"Coach summary generation validation failed (attempt {attempt + 1}/{retries}): {e}")
                if attempt == retries - 1:
                    raise e

    def _get_fallback_mock(self, prompt: str) -> str:
        if "patient_name" in prompt or "diagnosis" in prompt:
            # Extracted Info Mock
            return json.dumps({
                "patient_name": "Pierre Muller",
                "age": 45,
                "diagnosis": "Urolithiasis — right ureteral calculus 8mm",
                "medications": [
                    {
                        "name": "Amoxicillin",
                        "dosage": "1g",
                        "frequency": "3 times daily",
                        "duration": "5 days",
                        "instructions": "Take with food"
                    },
                    {
                        "name": "Lithium",
                        "dosage": "400mg",
                        "frequency": "Once daily",
                        "duration": "Ongoing",
                        "instructions": "Monitor blood levels regularly"
                    }
                ],
                "procedures": ["Ureteroscopy scheduled"],
                "allergies": ["None"],
                "follow_ups": ["Consultation with Dr. Laurent Muller in 2 weeks"],
                "lab_tests": ["ECBU pre-op urine culture", "Creatinine clearance blood test"]
            })
        elif "critical_tasks" in prompt:
            # Plan Mock
            return json.dumps({
                "critical_tasks": [
                    {
                        "id": "t1",
                        "title": "Take Amoxicillin 1g",
                        "description": "3 times daily for 5 days. Crucial to prevent post-op infection.",
                        "priority": "CRITICAL",
                        "due_date": "2026-06-15",
                        "completed": False
                    }
                ],
                "important_tasks": [
                    {
                        "id": "t2",
                        "title": "Book ECBU lab test",
                        "description": "Required 7 days prior to ureteroscopy procedure.",
                        "priority": "IMPORTANT",
                        "due_date": "2026-06-20",
                        "completed": False
                    },
                    {
                        "id": "t3",
                        "title": "Schedule urologist follow-up",
                        "description": "Appointment with Dr. Laurent Muller in 2 weeks.",
                        "priority": "IMPORTANT",
                        "due_date": "2026-06-27",
                        "completed": False
                    }
                ],
                "optional_tasks": [
                    {
                        "id": "t4",
                        "title": "Hydrate heavily",
                        "description": "Drink at least 2.5L of water daily to help flush any remaining fragments.",
                        "priority": "OPTIONAL",
                        "due_date": "2026-06-15",
                        "completed": False
                    }
                ]
            })
        elif "Recovery Coach" in prompt or "CoachSummary" in prompt:
            # Coach Summary Mock
            return json.dumps({
                "daily_summary": "You are recovering well. Keep following your daily medication schedule and stay hydrated.",
                "priorities": ["Take Amoxicillin 1g with food", "Rest and drink at least 2.5L water"],
                "risks": ["Mild nausea from Amoxicillin", "Pain/fever recurrence"],
                "questions": ["Is it normal to feel slightly fatigued?", "When can I resume lifting heavy items?"],
                "encouragement": "Every day of rest brings you closer to full recovery. Keep up the great work!",
                "follow_up": ["ECBU pre-op urine culture in 1 week"]
            })
        else:
            return "{}"
