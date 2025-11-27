import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

# Sample data about babies and kids
sample_data = [
    {
        "content": "A beautiful baby smiling happily with bright eyes and chubby cheeks. The baby is wearing a cute onesie and playing with soft toys in a well-lit nursery room with pastel colors.",
        "media_type": "text"
    },
    {
        "content": "Happy toddler playing in the park with a red ball. The child is laughing and running on green grass under sunny skies with trees in the background.",
        "media_type": "text"
    },
    {
        "content": "Newborn baby sleeping peacefully wrapped in a soft blanket. The infant has delicate features and is resting in a cozy crib with gentle lighting.",
        "media_type": "text"
    },
    {
        "content": "Multimodal AI can understand both images of babies and text descriptions of children's activities. This allows for comprehensive understanding of child-related content across different media types.",
        "media_type": "text"
    },
    {
        "content": "Baby's first steps - a moment of joy and celebration as the infant learns to walk while holding onto furniture for support in a safe home environment.",
        "media_type": "text"
    }
]

def add_sample_data():
    print(" Adding sample baby-related data to your search database...")
    
    for i, item in enumerate(sample_data, 1):
        try:
            response = requests.post(
                f"{BASE_URL}/documents",
                data={
                    "content": item["content"],
                    "media_type": item["media_type"]
                }
            )
            
            if response.status_code == 200:
                print(f" Added document {i}: {item['content'][:50]}...")
            else:
                print(f" Failed to add document {i}: {response.text}")
                
        except Exception as e:
            print(f" Error adding document {i}: {e}")

if __name__ == "__main__":
    add_sample_data()
    print("\n Sample data added! Now try searching for 'baby' or 'toddler'")