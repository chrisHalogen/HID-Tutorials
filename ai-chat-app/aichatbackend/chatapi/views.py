from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import time
from google import genai

API_KEY = "YOUR API KEY"

'''
@api_view(['POST'])
def process_prompt(request):
    prompt = request.data.get('prompt', '')
    
    # Simulate AI processing (replace with actual AI model later)
    time.sleep(1)  # Simulate processing time
    response = f"I received your prompt: '{prompt}'. This is a simulated response."
    
    return Response({'response': response}, status=status.HTTP_200_OK)
'''

@api_view(['POST'])
def process_prompt(request):
    prompt = request.data.get('prompt', '')
    client = genai.Client(api_key=API_KEY)

    try:

        response = client.models.generate_content(
            model="gemini-2.0-flash", contents=prompt
        )
        ai_response = response.text
        return Response({'response': ai_response}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
