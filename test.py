import openai

openai_client = openai.AzureOpenAI(
    azure_endpoint =  "https://gw-uib.intark.uh-it.no",
    azure_deployment = "gpt-4.1-mini",
    api_key = "unused", # but still required by the library
    default_headers = {
        "X-Gravitee-API-Key": os.getenv("OPENAI_GRAVITEE_KEY"),
    },
    api_version = "2024-10-21",
)